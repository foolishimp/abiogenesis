import { writeCanonicalJson } from "../shared/canonical_json.js";
import { createHash } from "node:crypto";
import { deepFreeze } from "../shared/immutable.js";
import { LEGACY_ROOT_EVENT_CONTRACT_DIGEST } from "./event_contract_profiles.js";
const SELECTIONS = new WeakMap();
const MATERIALIZED = new WeakMap();
// Only fields actually consumed by the prefix selectors/current call fold.
// Transport text, diagnostics, prompts and unknown scalar fields are bodies.
const INDEX_PAYLOAD_FIELDS = new Set(["invocationRef", "resultRef", "parentCCallRef", "cursorRef", "sourceCursorRef", "routeRef",
    "targetCursorRef", "successorCursorRef", "successorInputRef", "outputVectorRef", "inputRef", "cCallRef",
    "resultDigest", "valueDigest", "resultClass", "contractRef", "valueKind", "judgmentRef", "judgment"]);
const SCOPE_INDEX_KEY = Symbol("owned_scope_indices");
class RuntimeScopeIndices {
    #rows;
    length;
    order;
    constructor(key, rows, length, order) {
        if (key !== SCOPE_INDEX_KEY || length > rows.length)
            throw new TypeError("scope index belongs to its history owner");
        this.#rows = rows;
        this.length = length;
        this.order = order;
        Object.freeze(this);
    }
    at(index) { return index >= 0 && index < this.length ? this.#rows[index] : undefined; }
    *[Symbol.iterator]() { for (let i = 0; i < this.length; i++)
        yield this.#rows[i]; }
    slice(start, end = this.length) { return this.#rows.slice(start, Math.min(end, this.length)); }
    filter(predicate) {
        const result = [];
        for (const index of this)
            if (predicate(index))
                result.push(index);
        return result;
    }
}
const SELECTION_KEY = Symbol("owned_runtime_history_selection");
/** @internal The one Event Store history's disposable envelope/body-location
 * index. It owns no disk writes, permission, event admission or decoded cache. */
export class RuntimeHistory {
    #rows = [];
    #byId = new Map();
    #buckets = new Map();
    #reader;
    #scopeCanonical = new WeakMap();
    #scopeExtents = new WeakMap();
    #scopes = new Map();
    work = { bodyRows: 0, scopeRows: 0, membershipComparisons: 0, selectorRows: 0 };
    #canonicalHash = createHash("sha256").update("[");
    #committedHash = this.#canonicalHash.copy();
    #committedLength = 0;
    #tentativeCount = 0;
    #canonicalDigests = [`sha256:${this.#canonicalHash.copy().update("]").digest("hex")}`];
    #generation = 0;
    #validationHash;
    #profileSpans = [];
    #profileBoundaries = [];
    #validation;
    constructor(reader, validation) {
        this.#reader = reader;
        this.#validation = validation;
    }
    get length() { return this.#validation === undefined ? this.#rows.length : this.#validation.base.length + 1; }
    get generation() {
        if (this.#validation !== undefined)
            RuntimeHistorySelection.owner(this.#validation.base);
        return this.#generation;
    }
    /** Transient construction only. No admitted-history receipt binds this fork. */
    validationSuccessor(base, event, profileAfter) {
        if (RuntimeHistorySelection.owner(base) !== this || base.length !== base.through || event.admissionOrdinal !== base.through + 1)
            throw new TypeError("validation requires one unscoped owner cut and its exact candidate");
        const row = runtimeHistoryRow(event, { offset: -1, byteLength: 0, physicalDigest: event.payloadDigest,
            prefixByteLength: 0, prefixDigest: event.payloadDigest }, runtimeHistorySelectorKeys(event), profileAfter);
        return new RuntimeHistory(() => { throw new TypeError("validation fork has no physical reader"); }, { base, event, row }).select();
    }
    validationPredecessor(through, indices) {
        if (this.#validation === undefined)
            throw new TypeError("only a validation view has an admitted predecessor");
        const base = this.#validation.base.cut(Math.min(through, this.#validation.base.through));
        return indices === undefined ? base : RuntimeHistorySelection.owner(base).select(base.through, indices.filter(index => index < base.through));
    }
    canonicalHashAt(through) {
        if (through === this.length && this.#validation === undefined)
            return this.#canonicalHash.copy();
        if (through === this.length && this.#validation !== undefined) {
            if (this.#validationHash === undefined) {
                const baseOwner = RuntimeHistorySelection.owner(this.#validation.base);
                const hash = baseOwner.canonicalHashAt(this.#validation.base.through);
                if (this.#validation.base.length !== 0)
                    hash.update(",");
                writeCanonicalJson(this.#validation.event, part => hash.update(part));
                this.#validationHash = hash;
            }
            return this.#validationHash.copy();
        }
        const hash = createHash("sha256").update("[");
        for (let i = 0; i < through; i++) {
            if (i !== 0)
                hash.update(",");
            writeCanonicalJson(this.event(i), part => hash.update(part));
        }
        return hash;
    }
    assertWritable() {
        if (this.#validation !== undefined)
            throw new TypeError("prospective history grants no append or rollback authority");
    }
    appendValidated(row, event) {
        this.assertWritable();
        const ordinal = row.envelope.admissionOrdinal;
        if (ordinal !== this.#rows.length + 1 || this.#byId.has(row.envelope.eventId))
            throw new TypeError("history locations require one exact admitted ordinal");
        for (const cause of row.envelope.causationEventRefs) {
            const predecessor = this.rowById(cause);
            if (predecessor === undefined || (row.envelope.runId === undefined
                ? predecessor.envelope.runId !== undefined
                : predecessor.envelope.runId !== undefined && predecessor.envelope.runId !== row.envelope.runId))
                throw new TypeError("history location cannot cross its admitted causal prefix");
        }
        if (event.eventId !== row.envelope.eventId || event.payloadDigest !== row.envelope.payloadDigest)
            throw new TypeError("canonical history progress differs from its validated event");
        const successor = this.#canonicalHash.copy();
        if (this.length !== 0)
            successor.update(",");
        writeCanonicalJson(event, part => successor.update(part));
        this.#canonicalHash = successor;
        this.#canonicalDigests.push(`sha256:${successor.copy().update("]").digest("hex")}`);
        this.#rows.push(deepFreeze(row));
        const profile = row.envelope.eventContractDigest ?? LEGACY_ROOT_EVENT_CONTRACT_DIGEST;
        const span = this.#profileSpans.at(-1);
        if (span !== undefined && span.eventContractDigest === profile)
            span.lastOrdinal = ordinal;
        else
            this.#profileSpans.push({ eventContractDigest: profile, firstOrdinal: ordinal, lastOrdinal: ordinal });
        if (row.profileAfter !== profile)
            this.#profileBoundaries.push({ ordinal, eventRef: row.envelope.eventId });
        if (row.body.offset === -1)
            this.#tentativeCount++;
        this.#byId.set(row.envelope.eventId, ordinal - 1);
        for (const key of new Set(row.selectorKeys)) {
            let bucket = this.#buckets.get(key);
            if (bucket === undefined)
                this.#buckets.set(key, bucket = []);
            bucket.push(ordinal - 1);
        }
        if (row.body.offset !== -1)
            this.commitCanonicalPrefix();
    }
    commitCanonicalPrefix() {
        this.assertWritable();
        if (this.#tentativeCount !== 0)
            throw new TypeError("canonical committed prefix contains tentative rows");
        this.#committedHash = this.#canonicalHash.copy();
        this.#committedLength = this.length;
    }
    canonicalDigest(through = this.length) {
        if (this.#validation !== undefined) {
            if (through === this.length)
                return `sha256:${this.canonicalHashAt(through).update("]").digest("hex")}`;
            return this.#validation.base.cut(through).canonicalDigest();
        }
        const value = this.#canonicalDigests[through];
        if (value === undefined)
            throw new TypeError("canonical prefix is outside this validated history");
        return value;
    }
    /** The held append owner replaces a tentative location only after fsync.
     * The admitted envelope and every selector fact remain exactly unchanged. */
    commitLocation(index, body) {
        this.assertWritable();
        const row = this.#rows[index];
        if (row === undefined || row.body.offset !== -1)
            throw new TypeError("history location is not an owned tentative append");
        this.#rows[index] = deepFreeze({ ...row, body: { ...body } });
        this.#tentativeCount--;
    }
    /** Rollback abandons the computation generation before its suffix locations. */
    truncate(length) {
        this.assertWritable();
        if (!Number.isSafeInteger(length) || length < 0 || length > this.length)
            throw new TypeError("invalid runtime history rollback");
        if (length === this.length)
            return;
        if (length !== this.#committedLength)
            throw new TypeError("runtime rollback must restore its committed prefix");
        this.#generation++;
        this.#scopes.clear();
        for (const row of this.#rows.slice(length))
            this.#byId.delete(row.envelope.eventId);
        this.#rows.length = length;
        while ((this.#profileSpans.at(-1)?.firstOrdinal ?? 0) > length)
            this.#profileSpans.pop();
        const span = this.#profileSpans.at(-1);
        if (span !== undefined)
            span.lastOrdinal = Math.min(span.lastOrdinal, length);
        while ((this.#profileBoundaries.at(-1)?.ordinal ?? 0) > length)
            this.#profileBoundaries.pop();
        this.#tentativeCount = 0;
        this.#canonicalHash = this.#committedHash.copy();
        this.#canonicalDigests.length = length + 1;
        for (const [key, bucket] of this.#buckets) {
            while ((bucket.at(-1) ?? -1) >= length)
                bucket.pop();
            if (bucket.length === 0)
                this.#buckets.delete(key);
        }
    }
    profileSchedule(through, emptyProfile) {
        if (through < 0 || through > this.length)
            throw new TypeError("profile cut is outside its authenticated history");
        let spans;
        let boundaryEventRef;
        if (this.#validation === undefined) {
            spans = this.#profileSpans.filter(span => span.firstOrdinal <= through).map(span => ({ ...span, lastOrdinal: Math.min(through, span.lastOrdinal) }));
            boundaryEventRef = this.#profileBoundaries.filter(row => row.ordinal <= through).at(-1)?.eventRef ?? null;
        }
        else {
            const base = this.#validation.base.cut(Math.min(through, this.#validation.base.through)).profileSchedule(emptyProfile);
            spans = base.spans.map(span => ({ ...span }));
            boundaryEventRef = base.boundaryEventRef;
            if (through > this.#validation.base.through) {
                const row = this.#validation.row, profile = row.envelope.eventContractDigest ?? LEGACY_ROOT_EVENT_CONTRACT_DIGEST;
                const span = spans.at(-1);
                if (span !== undefined && span.eventContractDigest === profile)
                    span.lastOrdinal = through;
                else
                    spans.push({ eventContractDigest: profile, firstOrdinal: through, lastOrdinal: through });
                if (row.profileAfter !== profile)
                    boundaryEventRef = row.envelope.eventId;
            }
        }
        return deepFreeze({ kind: "root_event_profile_schedule", schemaVersion: "5.0.0", spans, boundaryEventRef,
            currentEventContractDigest: this.row(through - 1)?.profileAfter ?? emptyProfile });
    }
    row(index) {
        if (this.#validation === undefined)
            return this.#rows[index];
        return index === this.#validation.base.length ? this.#validation.row : this.#validation.base.row(index);
    }
    rowById(id) {
        const index = this.indexById(id);
        return index === undefined ? undefined : this.row(index);
    }
    eventById(id, selectedBodies) {
        const row = this.rowById(id);
        return row === undefined ? undefined : this.event(row.envelope.admissionOrdinal - 1, selectedBodies);
    }
    indexById(id) {
        if (this.#validation === undefined)
            return this.#byId.get(id);
        if (id === this.#validation.event.eventId)
            return this.#validation.base.length;
        return this.#validation.base.rowById(id)?.envelope.admissionOrdinal === undefined ? undefined :
            this.#validation.base.rowById(id).envelope.admissionOrdinal - 1;
    }
    indices(key, through = this.length, after = 0) {
        if (this.#validation !== undefined) {
            const base = this.#validation.base.cut(Math.min(through, this.#validation.base.through)).select(key);
            const result = Array.from(base.rows(), row => row.envelope.admissionOrdinal - 1).filter(index => index >= after);
            if (through > this.#validation.base.length && after <= this.#validation.base.length && this.#validation.row.selectorKeys.includes(key))
                result.push(this.#validation.base.length);
            return result;
        }
        const bucket = this.#buckets.get(key) ?? [];
        let low = 0, high = bucket.length;
        while (low < high) {
            const mid = (low + high) >>> 1;
            if (bucket[mid] < through)
                low = mid + 1;
            else
                high = mid;
        }
        const end = low;
        low = 0;
        high = end;
        while (low < high) {
            const mid = (low + high) >>> 1;
            if (bucket[mid] < after)
                low = mid + 1;
            else
                high = mid;
        }
        return bucket.slice(low, end);
    }
    scopedCanonicalDigest(indices) {
        let prior = this.#scopeCanonical.get(indices.order);
        const existing = prior?.digests.get(indices.length);
        if (existing !== undefined)
            return existing;
        const forward = prior !== undefined && prior.length <= indices.length;
        const hash = forward ? prior.hash.copy() : createHash("sha256").update("[");
        for (let index = forward ? prior.length : 0; index < indices.length; index++) {
            if (index !== 0)
                hash.update(",");
            writeCanonicalJson(this.event(indices.at(index)), text => { hash.update(text); });
        }
        const digest = `sha256:${hash.copy().update("]").digest("hex")}`;
        if (prior === undefined) {
            prior = { length: indices.length, hash, digests: new Map() };
            this.#scopeCanonical.set(indices.order, prior);
        }
        else if (forward) {
            prior.length = indices.length;
            prior.hash = hash;
        }
        prior.digests.set(indices.length, digest);
        return digest;
    }
    scopedSelectorExtent(key, indices) {
        let facts = this.#scopeExtents.get(indices.order);
        if (facts === undefined) {
            facts = new Map();
            this.#scopeExtents.set(indices.order, facts);
        }
        let prior = facts.get(key);
        if (prior !== undefined && prior.length > indices.length)
            prior = undefined;
        let count = prior?.count ?? 0, lastOrdinal = prior?.lastOrdinal ?? 0;
        for (let offset = prior?.length ?? 0; offset < indices.length; offset++) {
            this.work.selectorRows++;
            const row = this.row(indices.at(offset));
            if (row.selectorKeys.includes(key)) {
                count++;
                lastOrdinal = row.envelope.admissionOrdinal;
            }
        }
        const result = { length: indices.length, count, lastOrdinal };
        if ((facts.get(key)?.length ?? 0) <= indices.length)
            facts.set(key, result);
        return { count, lastOrdinal };
    }
    selectorExtent(key, through = this.length) {
        if (this.#validation !== undefined) {
            const base = this.#validation.base.cut(Math.min(through, this.#validation.base.through)).selectorExtent(key);
            return through > this.#validation.base.through && this.#validation.row.selectorKeys.includes(key)
                ? { count: base.count + 1, lastOrdinal: this.#validation.row.envelope.admissionOrdinal } : base;
        }
        const bucket = this.#buckets.get(key) ?? [];
        let low = 0, high = bucket.length;
        while (low < high) {
            const middle = (low + high) >>> 1;
            if (bucket[middle] < through)
                low = middle + 1;
            else
                high = middle;
        }
        return { count: low, lastOrdinal: low === 0 ? 0 : bucket[low - 1] + 1 };
    }
    event(index, selectedBodies = new Map()) {
        if (this.#validation !== undefined)
            return index === this.#validation.base.length ? this.#validation.event :
                this.#validation.base.event(index, selectedBodies);
        const row = this.#rows[index];
        if (row === undefined)
            throw new TypeError("selected history row is absent");
        this.work.bodyRows++;
        const value = this.#reader(row, selectedBodies);
        if (value.eventId !== row.envelope.eventId || value.payloadDigest !== row.envelope.payloadDigest ||
            value.admissionOrdinal !== row.envelope.admissionOrdinal)
            throw new TypeError("selected body differs from its authenticated envelope");
        return value;
    }
    select(through = this.length, indices) {
        return new RuntimeHistorySelection(SELECTION_KEY, this, through, indices);
    }
    scope(through, scope) {
        const key = JSON.stringify([scope.runId ?? null, scope.invocationRef ?? null]);
        let state = this.#scopes.get(key);
        if (state?.through === through)
            return state.selection;
        if (state !== undefined && state.through > through)
            return this.select(through).selectScopeCold(scope);
        const priorThrough = state?.through ?? 0;
        const indices = state?.indices ?? [], included = state?.included ?? new Set();
        const pending = [...(scope.runId === undefined ? [] : this.indices("run:" + scope.runId, through, priorThrough)),
            ...(scope.invocationRef === undefined ? [] : this.indices("invocation:" + scope.invocationRef, through, priorThrough))];
        const added = [];
        for (let offset = 0; offset < pending.length; offset++) {
            const index = pending[offset];
            if (included.has(index))
                continue;
            this.work.scopeRows++;
            included.add(index);
            added.push(index);
            for (const cause of this.row(index).envelope.causationEventRefs) {
                const previous = this.indexById(cause);
                if (previous === undefined || previous >= through)
                    throw new TypeError("scoped history encountered an unknown causal predecessor");
                pending.push(previous);
            }
        }
        added.sort((a, b) => a - b);
        const insertion = added.length !== 0 && (added[0] < (indices.at(-1) ?? -1));
        const ordered = insertion ? [...indices, ...added].sort((a, b) => a - b) : indices;
        if (!insertion)
            ordered.push(...added);
        const order = insertion ? {} : state?.order ?? {};
        const selection = this.select(through, new RuntimeScopeIndices(SCOPE_INDEX_KEY, ordered, ordered.length, order));
        state = { through, indices: ordered, included, order, selection };
        this.#scopes.set(key, state);
        return selection;
    }
}
/** @internal An immutable cut of one authenticated history. It is deliberately
 * not a RuntimeEvent array, public prefix or JSON body with lazy accessors. */
export class RuntimeHistorySelection {
    #history;
    #generation;
    #through;
    #indices;
    constructor(key, history, through, indices) {
        if (key !== SELECTION_KEY)
            throw new TypeError("history selection is issued by its actual owner");
        if (!Number.isSafeInteger(through) || through < 0 || through > history.length ||
            indices !== undefined && !(indices instanceof RuntimeScopeIndices) && indices.some((value, index) => !Number.isSafeInteger(value) || value < 0 ||
                value >= through || index > 0 && value <= indices[index - 1]))
            throw new TypeError("history selection requires one ordered admitted cut");
        this.#history = history;
        this.#generation = history.generation;
        this.#through = through;
        this.#indices = indices === undefined || indices instanceof RuntimeScopeIndices ? indices : Object.freeze([...indices]);
        SELECTIONS.set(this, this);
        Object.freeze(this);
    }
    get length() { return this.#indices?.length ?? this.#through; }
    get through() { return this.#through; }
    canonicalDigest() {
        this.assertCurrentGeneration();
        return this.#indices === undefined ? this.#history.canonicalDigest(this.#through) :
            this.#indices instanceof RuntimeScopeIndices ? this.#history.scopedCanonicalDigest(this.#indices) : undefined;
    }
    assertCurrentGeneration() {
        if (this.#generation !== this.#history.generation || this.#through > this.#history.length)
            throw new TypeError("runtime history selection was invalidated by rollback");
    }
    includesIndex(index) {
        if (this.#indices === undefined)
            return index >= 0 && index < this.#through;
        let low = 0, high = this.#indices.length;
        while (low < high) {
            const middle = (low + high) >>> 1;
            this.#history.work.membershipComparisons++;
            if (this.#indices.at(middle) < index)
                low = middle + 1;
            else
                high = middle;
        }
        return this.#indices.at(low) === index;
    }
    row(index) {
        this.assertCurrentGeneration();
        if (index < 0 || index >= this.length)
            return undefined;
        return this.#history.row(this.#indices?.at(index) ?? index);
    }
    rowById(id) {
        this.assertCurrentGeneration();
        const index = this.#history.indexById(id);
        return index === undefined || index >= this.#through || !this.includesIndex(index)
            ? undefined : this.#history.row(index);
    }
    eventById(id, selectedBodies) {
        const row = this.rowById(id);
        return row === undefined ? undefined : this.#history.event(row.envelope.admissionOrdinal - 1, selectedBodies);
    }
    event(index, selectedBodies) {
        this.assertCurrentGeneration();
        if (index < 0 || index >= this.length)
            return undefined;
        return this.#history.event(this.#indices?.at(index) ?? index, selectedBodies);
    }
    select(key) {
        this.assertCurrentGeneration();
        const rows = this.#history.indices(key, this.#through);
        const included = this.#indices === undefined ? rows : rows.filter(index => this.includesIndex(index));
        return this.#history.select(this.#through, included);
    }
    selectorExtent(key) {
        this.assertCurrentGeneration();
        if (this.#indices === undefined)
            return this.#history.selectorExtent(key, this.#through);
        if (this.#indices instanceof RuntimeScopeIndices)
            return this.#history.scopedSelectorExtent(key, this.#indices);
        const selected = this.select(key);
        return { count: selected.length, lastOrdinal: selected.row(selected.length - 1)?.envelope.admissionOrdinal ?? 0 };
    }
    unscoped() {
        this.assertCurrentGeneration();
        return this.#history.select(this.#through);
    }
    selectScope(scope) {
        this.assertCurrentGeneration();
        if (scope === undefined)
            return this;
        if (this.#indices === undefined)
            return this.#history.scope(this.#through, scope);
        return this.selectScopeCold(scope);
    }
    selectScopeCold(scope) {
        this.assertCurrentGeneration();
        const included = new Set();
        const pending = [...(scope.runId === undefined ? [] : this.#history.indices("run:" + scope.runId, this.#through)),
            ...(scope.invocationRef === undefined ? [] : this.#history.indices("invocation:" + scope.invocationRef, this.#through))];
        for (let offset = 0; offset < pending.length; offset++) {
            const index = pending[offset];
            if (included.has(index) || !this.includesIndex(index))
                continue;
            included.add(index);
            const row = this.#history.row(index);
            for (const cause of row.envelope.causationEventRefs) {
                const previous = this.#history.indexById(cause);
                if (previous === undefined || previous >= this.#through)
                    throw new TypeError("scoped history encountered an unknown causal predecessor");
                pending.push(previous);
            }
        }
        return this.#history.select(this.#through, [...included].sort((left, right) => left - right));
    }
    prefix(length) {
        this.assertCurrentGeneration();
        if (!Number.isSafeInteger(length) || length < 0 || length > this.length)
            throw new TypeError("invalid history selection cut");
        return this.#indices === undefined ? this.#history.select(length) :
            this.#history.select(this.#through, this.#indices.slice(0, length));
    }
    cut(through) {
        this.assertCurrentGeneration();
        if (!Number.isSafeInteger(through) || through < 0 || through > this.#through)
            throw new TypeError("invalid admitted history cut");
        return this.#history.select(through, this.#indices?.filter(index => index < through));
    }
    profileSchedule(emptyProfile) {
        this.assertCurrentGeneration();
        return this.#history.profileSchedule(this.#through, emptyProfile);
    }
    validationPredecessor() {
        this.assertCurrentGeneration();
        return this.#history.validationPredecessor(this.#through, this.#indices?.slice(0));
    }
    validationSuccessor(event, profileAfter) {
        this.assertCurrentGeneration();
        return this.#history.validationSuccessor(this, event, profileAfter);
    }
    actualSuccessor(event) {
        this.assertCurrentGeneration();
        const row = this.#history.row(this.#through);
        if (this.#indices !== undefined || row?.envelope.eventId !== event.eventId ||
            row.envelope.payloadDigest !== event.payloadDigest || event.admissionOrdinal !== this.#through + 1)
            throw new TypeError("tentative prefix extension requires its actual owner-staged event");
        return this.#history.select(this.#through + 1);
    }
    sharesSource(other) {
        this.assertCurrentGeneration();
        other.assertCurrentGeneration();
        return this.#history === other.#history && this.#generation === other.#generation;
    }
    /** Exact same-owner append relation; unscoped cuts require no row walk. */
    extends(prior) {
        if (!this.sharesSource(prior) || this.#through < prior.#through || this.length < prior.length)
            return false;
        if (this.#indices === undefined && prior.#indices === undefined)
            return true;
        if (this.#indices === undefined || prior.#indices === undefined)
            return false;
        if (this.#indices instanceof RuntimeScopeIndices && prior.#indices instanceof RuntimeScopeIndices && this.#indices.order === prior.#indices.order)
            return true;
        for (let index = 0; index < prior.#indices.length; index++)
            if (this.#indices.at(index) !== prior.#indices.at(index))
                return false;
        return true;
    }
    /** Complete historical materialization is explicit and never retained here. */
    materialize() {
        this.assertCurrentGeneration();
        const selectedBodies = new Map();
        const result = Object.freeze(Array.from({ length: this.length }, (_, index) => this.event(index, selectedBodies)));
        MATERIALIZED.set(result, this);
        return result;
    }
    /** Named body selection; its cache lives only for this consumer operation. */
    consume(consumer) {
        this.assertCurrentGeneration();
        const selectedBodies = new Map();
        try {
            return consumer(index => this.event(index, selectedBodies));
        }
        finally {
            selectedBodies.clear();
        }
    }
    *rows() {
        this.assertCurrentGeneration();
        for (let index = 0; index < this.length; index++)
            yield this.row(index);
    }
    static is(value) {
        return typeof value === "object" && value !== null && SELECTIONS.get(value) === value;
    }
    static fromMaterialized(value) {
        return MATERIALIZED.get(value);
    }
    static owner(value) {
        if (!this.is(value))
            return undefined;
        value.assertCurrentGeneration();
        return value.#history;
    }
}
/** @internal Capture facts only after the existing full event validation. */
export function runtimeHistoryRow(event, body, selectorKeys, profileAfter) {
    const { payload, ...envelope } = event;
    const scalarPayload = {};
    if (typeof payload === "object" && payload !== null && !Array.isArray(payload)) {
        for (const [key, value] of Object.entries(payload))
            if (INDEX_PAYLOAD_FIELDS.has(key) && (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean"))
                scalarPayload[key] = value;
    }
    return deepFreeze({ envelope, profileAfter, scalarPayload, body: { ...body }, selectorKeys: [...selectorKeys] });
}
/** @internal The actual JSON value is used only within its selected consumer. */
export function runtimeHistoryPayload(selection, index) {
    const event = selection.event(index);
    if (event === undefined)
        throw new TypeError("selected history payload is absent");
    return event.payload;
}
/** @internal The existing prefix selector vocabulary, shared by materialized
 * and body-location histories. Keys select rows; they do not validate payloads. */
export function runtimeHistorySelectorKeys(event) {
    const keys = ["id:" + event.eventId, "kind:" + event.kind, "type:" + event.aggregateType,
        "aggregate:" + event.aggregateType + ":" + event.aggregateId, "related:" + event.aggregateId];
    if (typeof event.runId === "string")
        keys.push("run:" + event.runId);
    const record = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
    const payload = record(event.payload) ? event.payload : undefined;
    const invocation = payload?.invocationRef;
    if (typeof event.parentAggregateId === "string")
        keys.push("invocation:" + event.parentAggregateId);
    if (typeof invocation === "string" && invocation !== event.parentAggregateId)
        keys.push("invocation:" + invocation);
    if (typeof event.basisId === "string")
        keys.push("basis:" + event.basisId);
    if (typeof event.graphCallId === "string")
        keys.push("graph-call:" + event.graphCallId);
    if (payload !== undefined) {
        for (const field of ["resultRef", "parentCCallRef", "cursorRef", "sourceCursorRef", "routeRef", "invocationAdmissionRef", "progressRef", "implementationSetRef", "interactionSetRef", "basisRef", "artifactRef"])
            if (typeof payload[field] === "string")
                keys.push("payload:" + field + ":" + payload[field]);
        for (const value of [payload.rawInputValue, payload.value])
            if (record(value) && typeof value.taskRef === "string")
                keys.push("native-command-task:" + value.taskRef);
        if (record(payload.observation) && typeof payload.observation.underlyingObservationRef === "string")
            keys.push("payload:underlyingObservationRef:" + payload.observation.underlyingObservationRef);
        if (event.kind === "basis_admitted" && record(payload.rawInputValue) && payload.rawInputValue.kind === "worksite_file_replace_request")
            keys.push("worksite-observation-dependency");
        if (event.kind === "c_call_result_admitted" && record(payload.value) &&
            (payload.value.kind === "native_workspace_work_observation" || payload.value.kind === "native_workspace_work_failure"))
            keys.push("worksite-observation-dependency");
        if (event.kind === "c_call_evidenced" && payload.evidenceClass === "worksite_file_replace")
            keys.push("worksite-observation-dependency");
        const cursorRef = event.kind === "traversal_cursor_entered" ? payload.cursorRef
            : event.kind === "traversal_route_admitted" ? payload.targetCursorRef
                : event.kind === "fh_interaction_resume_admitted" ? payload.successorCursorRef : undefined;
        if (typeof cursorRef === "string")
            keys.push("cursor-origin:" + cursorRef);
        const bound = payload.boundInput, reentry = payload.graphSpanReentryProjection;
        const inputRef = event.kind === "c_call_result_admitted" ? payload.resultRef
            : event.kind === "fh_interaction_resume_admitted" ? payload.successorInputRef
                : event.kind === "fan_out_completion_admitted" ? payload.outputVectorRef
                    : event.kind === "retry_attempt_opened" ? payload.inputRef
                        : event.kind === "traversal_route_admitted" && record(bound) ? bound.admissionRef
                            : event.kind === "traversal_route_admitted" && record(reentry) ? reentry.targetInputRef : undefined;
        if (typeof inputRef === "string")
            keys.push("input-origin:" + inputRef);
    }
    if (event.parentAggregateId !== undefined && event.parentAggregateId !== event.aggregateId)
        keys.push("related:" + event.parentAggregateId);
    return [...new Set(keys)];
}
/** @internal Ordered transient body consumption. This is not an Event array:
 * it stores only the actual selection (or an explicitly supplied public vector).
 * Methods acquire plain complete Events and never retain decoded rows. */
export class RuntimeEventBodyView {
    length;
    #source;
    constructor(source) {
        this.#source = source;
        this.length = source.length;
        Object.freeze(this);
    }
    at(index) {
        const offset = index < 0 ? this.length + index : index;
        return RuntimeHistorySelection.is(this.#source) ? this.#source.event(offset) : this.#source[offset];
    }
    *[Symbol.iterator]() {
        for (let index = 0; index < this.length; index++)
            yield this.at(index);
    }
    find(predicate) {
        for (let index = 0; index < this.length; index++) {
            const event = this.at(index);
            if (predicate(event, index))
                return event;
        }
        return undefined;
    }
    findIndex(predicate) {
        for (let i = 0; i < this.length; i++)
            if (predicate(this.at(i), i))
                return i;
        return -1;
    }
    some(predicate) { return this.find(predicate) !== undefined; }
    every(predicate) {
        for (let index = 0; index < this.length; index++)
            if (!predicate(this.at(index), index))
                return false;
        return true;
    }
    filter(predicate) {
        const selected = [];
        for (let index = 0; index < this.length; index++) {
            const event = this.at(index);
            if (predicate(event, index))
                selected.push(event);
        }
        return selected;
    }
    map(project) {
        const result = [];
        for (let index = 0; index < this.length; index++)
            result.push(project(this.at(index), index));
        return result;
    }
    flatMap(project) {
        const result = [];
        for (let index = 0; index < this.length; index++) {
            const item = project(this.at(index), index);
            if (Array.isArray(item))
                result.push(...item);
            else
                result.push(item);
        }
        return result;
    }
    forEach(project) {
        for (let index = 0; index < this.length; index++)
            project(this.at(index), index);
    }
    slice(start = 0, end = this.length) {
        const bound = (value) => value < 0 ? Math.max(0, this.length + value) : Math.min(this.length, value);
        const result = [];
        for (let index = bound(start); index < bound(end); index++)
            result.push(this.at(index));
        return result;
    }
    entries() {
        const view = this;
        return (function* () { for (let index = 0; index < view.length; index++)
            yield [index, view.at(index)]; })();
    }
    materialize() {
        return RuntimeHistorySelection.is(this.#source) ? this.#source.materialize() : this.#source;
    }
}
