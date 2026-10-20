const SNAPSHOT_PROOFS = new WeakMap();
/** Disposable computation territory, never event or durable authority. Each
 * owner key names its one ordered relation. A rollback abandons the territory. */
export class RuntimeDerivationScope {
    #owners = new Map();
    #events = [];
    #selection;
    accepts(events) {
        if (!sharesRuntimeEventPrefix(events, this.#events))
            return false;
        if (events.length > this.#events.length)
            this.#events = events;
        return true;
    }
    /** @internal Body-location computation; no full Event vector is retained. */
    acceptsSelection(selection) {
        // Explicit array computations belong to that caller-retained output. They
        // cannot lend their full body vector to an operational selection scope.
        if (this.#events.length !== 0)
            return false;
        const prior = this.#selection;
        if (prior !== undefined) {
            if (selection.extends(prior)) {
                this.#selection = selection;
                return true;
            }
            // A historical read of this exact ordered owner does not roll the live
            // derivation back or lend it authority from another selection.
            return prior.extends(selection);
        }
        this.#selection = selection;
        return true;
    }
    invalidate() { this.#owners.clear(); this.#events = []; this.#selection = undefined; }
    owner(key, construct) {
        if (!this.#owners.has(key))
            this.#owners.set(key, construct());
        return this.#owners.get(key);
    }
}
export class RuntimeDerivationSource {
    #scopes = new Map();
    invalidate() { for (const scope of this.#scopes.values())
        scope.invalidate(); this.#scopes.clear(); }
    snapshot(events) {
        if (SnapshotProof.source(events) === this)
            return events;
        const snapshot = [...events];
        new SnapshotProof(snapshot, this);
        return Object.freeze(snapshot);
    }
    append(events, suffix) {
        if (suffix.length === 0)
            return this.snapshot(events);
        const snapshot = [...events, ...suffix];
        new SnapshotProof(snapshot, this, SnapshotProof.source(events) === this ? events : undefined, events.length);
        return Object.freeze(snapshot);
    }
    prefix(events, length) {
        if (!Number.isSafeInteger(length) || length < 0 || length > events.length)
            throw new TypeError("invalid snapshot prefix length");
        if (length === events.length)
            return this.snapshot(events);
        const snapshot = events.slice(0, length);
        new SnapshotProof(snapshot, this, SnapshotProof.source(events) === this ? events : undefined, length);
        return Object.freeze(snapshot);
    }
    hasPrefix(events, prefix) {
        return events.length >= prefix.length && sharesRuntimeEventPrefix(events, prefix);
    }
    scope(key, events) {
        let scope = this.#scopes.get(key);
        if (scope === undefined || !scope.accepts(events)) {
            scope = new RuntimeDerivationScope();
            scope.accepts(events);
            this.#scopes.set(key, scope);
        }
        return scope;
    }
    /** @internal Same ordered owner computations over the store's private rows. */
    selectionScope(key, selection) {
        let scope = this.#scopes.get(key);
        if (scope === undefined || !scope.acceptsSelection(selection)) {
            scope = new RuntimeDerivationScope();
            scope.acceptsSelection(selection);
            this.#scopes.set(key, scope);
        }
        return scope;
    }
}
class SnapshotProof {
    #source;
    #parent;
    #shared;
    constructor(snapshot, source, parent, shared = 0) {
        this.#source = source;
        this.#parent = parent === undefined ? undefined : SnapshotProof.for(parent);
        this.#shared = shared;
        SNAPSHOT_PROOFS.set(snapshot, this);
        Object.freeze(this);
    }
    static for(events) {
        const proof = SNAPSHOT_PROOFS.get(events);
        return typeof proof === "object" && proof !== null && #source in proof
            ? proof : undefined;
    }
    static source(events) {
        const proof = this.for(events);
        return proof === undefined ? undefined : proof.#source;
    }
    /** Only an owner-constructed append/cut proves an unchanged prefix. Raw
     * snapshots and unrelated branches retain the event-identity comparison. */
    static sharesPrefix(left, right) {
        const common = Math.min(left.length, right.length);
        const follows = (proof, target) => {
            if (target === undefined)
                return false;
            while (proof !== target) {
                if (proof === undefined || proof.#parent === undefined || proof.#shared < common)
                    return false;
                proof = proof.#parent;
            }
            return true;
        };
        const a = this.for(left), b = this.for(right);
        return follows(a, b) || follows(b, a);
    }
}
/** Exact owner snapshot identity; it does not certify payload immutability. */
export function ownedRuntimeDerivationSource(events) {
    return SnapshotProof.source(events);
}
export function runtimeDerivationSource(events) {
    return ownedRuntimeDerivationSource(events) ?? new RuntimeDerivationSource();
}
/** Structural identity only; no payload or durable-resource authentication. */
function sharesRuntimeEventPrefix(events, prior) {
    if (events === prior || SnapshotProof.sharesPrefix(events, prior))
        return true;
    const common = Math.min(events.length, prior.length);
    for (let i = 0; i < common; i++)
        if (events[i] !== prior[i])
            return false;
    return true;
}
