import { SEMANTIC_REVISION_IDS as ids } from "../gtl/semantic_revision_identity.js";
import { isRetainedGraphInput, constructRetainedGraphInput } from "./worksite_preparation_contracts.js";
import * as v from "valibot";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { deriveSemanticAsset, deriveSemanticAssessment, isSemanticStageEnvelope, isSemanticWorksiteBasis, projectSemanticWorksiteCoordinates } from "./semantic_stage.js";
import { isSemanticJobEnvelope, projectSemanticJobBindings, deriveSemanticJobAsset, deriveSemanticJobAssessment, constructNativeSemanticConstructionTask, constructNativeSemanticExecutionTask, nativeSemanticEvidenceArtifacts } from "./semantic_job.js";
import { isNativeWorkspaceWorkObservation, isNativeWorkspaceWorkTask, resolveNativeWorkspaceWorkJudgmentRelation, NATIVE_WORKSPACE_WORK_IDS } from "./native_workspace_work.js";
import { isNativeWorksiteCommandExecutionObservation, isNativeWorksiteCommandExecutionTask, resolveWorksiteCommandExecutionJudgmentRelation, WORKSITE_COMMAND_EXECUTION_IDS } from "./worksite_command_execution.js";
import { validateDurablePrefixCoordinate } from "../abg/event_store.js";
import { exactWorkspaceBinding, isWorksiteContextObservation } from "./worksite_effect.js";
import { isWorkspaceAuthorityBasis } from "./environment.js";
import { isCapabilityGrantValue } from "./invocation.js";
const hash = (x) => sha256Canonical(x);
const ref = v.pipe(v.string(), v.minLength(1));
const digest = v.pipe(v.string(), v.regex(/^sha256:[a-f0-9]{64}$/));
const refs = v.array(ref);
const coordinate = v.strictObject({ cCallRef: ref, resultRef: ref, resultDigest: digest,
    resultAdmissionEventRef: ref, judgmentEventRef: ref });
export function isNativeSemanticRevisionIntake(value) {
    return v.is(v.strictObject({ kind: v.literal("native_semantic_revision_intake"), schemaVersion: v.literal("5.0.0"),
        sourceRun: v.strictObject({ ref, digest }), sourcePrefix: v.custom(validateDurablePrefixCoordinate) }), value);
}
const selectionSchema = v.strictObject({ kind: v.literal("semantic_revision_selection"), schemaVersion: v.literal("5.0.0"),
    parent: coordinate, causes: v.pipe(v.array(coordinate), v.minLength(1)), mode: v.picklist(["construction_repair", "stage_revision"]),
    selectedStageRef: v.nullable(ref), selectedObligationRefs: refs, selectedTargetRefs: refs, reasonRef: ref,
    nativePhase: v.optional(v.picklist(["preconstruction", "postconstruction"])) });
export function isNativeSemanticRevisionWorksite(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value))
        return false;
    const x = value;
    return Object.keys(x).sort().join() === ["kind", "workspaceAuthorityBasis", "workspaceBinding", "capabilityGrant", "context", "commandExecutionLimits", "construction", "source", ...(x.acquisition === undefined ? [] : ["acquisition"])].sort().join() &&
        x.kind === "native_semantic_revision_worksite" && isWorkspaceAuthorityBasis(x.workspaceAuthorityBasis) &&
        x.workspaceBinding !== null && typeof x.workspaceBinding === "object" && exactWorkspaceBinding(x.workspaceBinding) && isCapabilityGrantValue(x.capabilityGrant) &&
        v.is(v.strictObject({ inactivityTimeoutMs: v.pipe(v.number(), v.integer(), v.minValue(1)), absoluteTimeoutMs: v.pipe(v.number(), v.integer(), v.minValue(1)) }), x.commandExecutionLimits) &&
        x.commandExecutionLimits.absoluteTimeoutMs > x.commandExecutionLimits.inactivityTimeoutMs &&
        isWorksiteContextObservation(x.context) && (x.construction === null || v.is(coordinate, x.construction)) &&
        isNativeSemanticRevisionIntake(x.source) && (x.acquisition === undefined || v.is(coordinate, x.acquisition)) &&
        x.context.workspaceAuthorityBasisRef === x.workspaceAuthorityBasis.authorityBasisId &&
        x.context.workspaceAuthorityBasisDigest === x.workspaceAuthorityBasis.authorityBasisDigest &&
        x.context.workspaceBindingIdentity === x.workspaceBinding.bindingId && x.context.workspaceBindingDigest === x.workspaceBinding.bindingDigest;
}
const selectionInputSchema = v.strictObject({ kind: v.literal("semantic_revision_selection_input"), schemaVersion: v.literal("5.0.0"),
    parent: coordinate, causes: v.pipe(v.array(coordinate), v.minLength(1)), currentWorksite: v.unknown(), nativeWorksite: v.optional(v.unknown()) });
export function isSemanticRevisionSelectionInput(x) {
    return v.is(selectionInputSchema, x) && unique(x.causes.map(c => c.resultRef)) &&
        (x.currentWorksite === null || isSemanticWorksiteBasis(x.currentWorksite)) &&
        (x.nativeWorksite === undefined || x.currentWorksite === null && isNativeSemanticRevisionWorksite(x.nativeWorksite));
}
/** Compare the selected observation, not two Programs' different permissions.
 * ABG authenticates each invocation's own operating basis separately. */
export function semanticRevisionSelectionInputMatchesRequest(input, request) {
    try {
        if (!isSemanticRevisionSelectionInput(input) || !isSemanticRevisionRequest(request) ||
            hash(input.parent) !== hash(request.parent) || hash(input.causes) !== hash(request.causes))
            return false;
        if (input.nativeWorksite !== undefined || request.nativeWorksite !== undefined) {
            if (input.nativeWorksite === undefined || request.nativeWorksite === undefined)
                return false;
            const { capabilityGrant: _selectedGrant, acquisition: _selectedAcquisition, ...selected } = input.nativeWorksite;
            const { capabilityGrant: _currentGrant, acquisition: _currentAcquisition, ...current } = request.nativeWorksite;
            return hash(selected) === hash(current);
        }
        if (input.currentWorksite === null || request.currentWorksite === null)
            return input.currentWorksite === request.currentWorksite;
        const projected = projectSemanticWorksiteCoordinates(input.currentWorksite, request.currentWorksite);
        return projected !== null && hash(projected) === hash(request.currentWorksite);
    }
    catch {
        return false;
    }
}
export function semanticRevisionSelectionSchema(nativePhase) {
    const coordinateSchema = { type: "object", additionalProperties: false, required: ["cCallRef", "resultRef", "resultDigest", "resultAdmissionEventRef", "judgmentEventRef"], properties: {
            cCallRef: { type: "string" }, resultRef: { type: "string" }, resultDigest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" }, resultAdmissionEventRef: { type: "string" }, judgmentEventRef: { type: "string" }
        } };
    return { type: "object", additionalProperties: false,
        required: ["kind", "schemaVersion", "parent", "causes", "mode", "selectedStageRef", "selectedObligationRefs", "selectedTargetRefs", "reasonRef", ...(nativePhase === undefined ? [] : ["nativePhase"])],
        properties: { kind: { const: "semantic_revision_selection" }, schemaVersion: { const: "5.0.0" }, parent: coordinateSchema, causes: { type: "array", minItems: 1, items: coordinateSchema },
            mode: { enum: nativePhase === "preconstruction" ? ["stage_revision"] : ["construction_repair", "stage_revision"] }, selectedStageRef: { type: ["string", "null"] }, selectedObligationRefs: { type: "array", minItems: nativePhase === "preconstruction" ? 0 : 1, items: { type: "string" } }, selectedTargetRefs: { type: "array", items: { type: "string" } }, reasonRef: { type: "string" },
            ...(nativePhase === undefined ? {} : { nativePhase: { const: nativePhase } }) } };
}
const requestSchema = v.strictObject({ kind: v.literal("semantic_revision_request"), schemaVersion: v.literal("5.0.0"),
    parent: coordinate, causes: v.pipe(v.array(coordinate), v.minLength(1)), selection: coordinate,
    selectionChoice: v.optional(v.variant("mode", [
        v.strictObject({ mode: v.literal("construction_repair"), selectedStageRef: v.null() }),
        v.strictObject({ mode: v.literal("stage_revision"), selectedStageRef: ref, entryRole: v.optional(v.picklist(["author", "assessor"])) })
    ])),
    currentWorksite: v.unknown(), nativeWorksite: v.optional(v.unknown()) });
function requestChoiceMatchesSelection(request, selection) {
    return request.selectionChoice === undefined || request.selectionChoice.mode === selection.mode &&
        request.selectionChoice.selectedStageRef === selection.selectedStageRef;
}
const unique = (xs) => new Set(xs).size === xs.length;
export function isSemanticRevisionSelection(x) {
    return v.is(selectionSchema, x) && unique(x.causes.map(c => c.resultRef)) && unique(x.selectedObligationRefs) &&
        (x.selectedObligationRefs.length > 0 || x.nativePhase === "preconstruction") &&
        (x.nativePhase !== "preconstruction" || x.mode === "stage_revision" && x.selectedTargetRefs.length === 0) &&
        unique(x.selectedTargetRefs) && (x.mode === "construction_repair" ? x.selectedStageRef === null : x.selectedStageRef !== null);
}
export function isSemanticRevisionRequest(x) {
    return v.is(requestSchema, x) && unique(x.causes.map(c => c.resultRef)) &&
        (x.currentWorksite === null || isSemanticWorksiteBasis(x.currentWorksite)) &&
        (x.nativeWorksite === undefined || x.currentWorksite === null && isNativeSemanticRevisionWorksite(x.nativeWorksite));
}
export function isSemanticRevisionEnvelope(x) {
    try {
        if (x === null || typeof x !== "object" || Array.isArray(x))
            return false;
        const e = x;
        if (Object.keys(e).sort().join() !== ["kind", "schemaVersion", "revisionBasis", "current"].sort().join() ||
            e.kind !== "semantic_revision_envelope" || e.schemaVersion !== "5.0.0" || !isSemanticStageEnvelope(e.current))
            return false;
        const b = e.revisionBasis;
        if (b === null || typeof b !== "object" || Object.keys(b).sort().join() !== ["basisRef", "basisDigest", "request", "selection", "affectedStageRefs", "preservedAssetRefs", "retainedTerms", "retainedBindings", "parentRevisionRef"].sort().join() ||
            !isSemanticRevisionRequest(b.request) || !isSemanticRevisionSelection(b.selection) || !Array.isArray(b.affectedStageRefs) ||
            !Array.isArray(b.preservedAssetRefs) || !Array.isArray(b.retainedTerms) || !Array.isArray(b.retainedBindings) ||
            !(b.parentRevisionRef === null || typeof b.parentRevisionRef === "string"))
            return false;
        const { basisRef, basisDigest, ...body } = b;
        return unique(b.affectedStageRefs) && unique(b.preservedAssetRefs) && unique(b.retainedTerms.map(t => t.requirementRef)) &&
            unique(b.retainedBindings.map(t => t.obligationRef)) && basisDigest === hash(body) &&
            basisRef === `semantic-revision://abiogenesis/${basisDigest.slice(7)}`;
    }
    catch {
        return false;
    }
}
function merge(xs, key) {
    const rows = new Map();
    for (const x of xs) {
        const prior = rows.get(key(x));
        if (prior !== undefined && hash(prior) !== hash(x))
            return null;
        rows.set(key(x), x);
    }
    return [...rows.values()];
}
/** Pure projection only. ABG must authenticate every input and regenerate this value before admission. */
export function deriveSemanticRevision(parent, request, selection) {
    if (!isSemanticRevisionRequest(request) || !isSemanticRevisionSelection(selection) || !requestChoiceMatchesSelection(request, selection) || request.nativeWorksite !== undefined || selection.nativePhase !== undefined ||
        hash(request.parent) !== hash(selection.parent) || hash(request.causes) !== hash(selection.causes))
        return null;
    const priorRevision = isSemanticRevisionEnvelope(parent) ? parent : null;
    const prior = priorRevision?.current ?? parent;
    if (!isSemanticStageEnvelope(prior))
        return null;
    const terms = merge([...(priorRevision?.revisionBasis.retainedTerms ?? []), ...prior.sourceHandoff.declaration.terms,
        ...prior.assets.flatMap(a => a.groundedTerms)], t => t.requirementRef);
    const bindings = merge([...(priorRevision?.revisionBasis.retainedBindings ?? []), ...prior.sourceHandoff.declaration.fulfillmentBindings,
        ...prior.assets.flatMap(a => a.discoveredBindings)], b => b.obligationRef);
    if (terms === null || bindings === null || !selection.selectedObligationRefs.every(r => bindings.some(b => b.obligationRef === r)) ||
        !selection.selectedTargetRefs.every(r => prior.worksite?.targets.some(t => t.target.targetRef === r)))
        return null;
    const affected = new Set();
    if (selection.mode === "stage_revision") {
        if (!prior.lifecycle.stages.some(s => s.declarationRef === selection.selectedStageRef))
            return null;
        affected.add(selection.selectedStageRef);
        for (const stage of prior.lifecycle.stages)
            if (stage.predecessorStageRefs.some(r => affected.has(r)))
                affected.add(stage.declarationRef);
    }
    // Construction invalidates execution proof, not the governing semantic assets.
    const preserved = prior.assets.filter(a => !affected.has(a.stageRef) &&
        !(selection.mode === "construction_repair" && prior.lifecycle.stages.find(s => s.declarationRef === a.stageRef)?.bodyCapabilities.includes("application_assessment")));
    if (preserved.some(a => a.assessment?.disposition !== "satisfied"))
        return null;
    const body = { request, selection, affectedStageRefs: [...affected], preservedAssetRefs: preserved.map(a => a.assetRef),
        retainedTerms: terms, retainedBindings: bindings, parentRevisionRef: priorRevision?.revisionBasis.basisRef ?? null };
    const basisDigest = hash(body);
    return deepFreeze({ kind: "semantic_revision_envelope", schemaVersion: "5.0.0",
        revisionBasis: { ...body, basisDigest, basisRef: `semantic-revision://abiogenesis/${basisDigest.slice(7)}` },
        current: { ...prior, worksite: request.currentWorksite, assets: preserved, evidence: null } });
}
export function deriveRevisionAsset(input, stageRef, raw, source) {
    if (!isSemanticRevisionEnvelope(input))
        return null;
    const current = deriveSemanticAsset(input.current, stageRef, raw, source, { terms: input.revisionBasis.retainedTerms, bindings: input.revisionBasis.retainedBindings });
    return current === null ? null : deepFreeze({ ...input, current });
}
export function deriveRevisionAssessment(input, stageRef, raw, source) {
    if (!isSemanticRevisionEnvelope(input))
        return null;
    const current = deriveSemanticAssessment(input.current, stageRef, raw, source);
    return current === null ? null : deepFreeze({ ...input, current });
}
export function isSemanticJobRevisionEnvelope(x) {
    try {
        if (x === null || typeof x !== "object" || Array.isArray(x))
            return false;
        const e = x, b = e.revisionBasis;
        if (Object.keys(e).sort().join() !== ["kind", "schemaVersion", "revisionBasis", "current"].sort().join() ||
            e.kind !== "semantic_revision_envelope" || e.schemaVersion !== "5.0.0" || !isSemanticJobEnvelope(e.current) ||
            b === null || typeof b !== "object" || Object.keys(b).sort().join() !== ["basisRef", "basisDigest", "request", "selection", "affectedStageRefs", "preservedAssetRefs", "retainedTerms", "retainedBindings", "parentRevisionRef", "historicalAssets"].sort().join() ||
            !isSemanticRevisionRequest(b.request) || !isSemanticRevisionSelection(b.selection) || !Array.isArray(b.historicalAssets) ||
            !Array.isArray(b.affectedStageRefs) || !Array.isArray(b.preservedAssetRefs) || !Array.isArray(b.retainedTerms) || !Array.isArray(b.retainedBindings) ||
            !(b.parentRevisionRef === null || typeof b.parentRevisionRef === "string"))
            return false;
        const { basisRef, basisDigest, ...body } = b, active = projectSemanticJobBindings(e.current);
        return basisDigest === hash(body) && basisRef === `semantic-revision://abiogenesis/${basisDigest.slice(7)}` &&
            unique(b.historicalAssets.map(a => a.assetRef)) && unique(b.affectedStageRefs) && unique(b.preservedAssetRefs) &&
            unique(b.retainedTerms.map(t => t.requirementRef)) && active !== null &&
            b.retainedBindings.every(binding => e.current.bindingVersions.some(version => hash(version.binding) === hash(binding))) &&
            e.current.assets.filter(a => b.preservedAssetRefs.includes(a.assetRef)).every(a => b.historicalAssets.some(h => hash(h) === hash(a)));
    }
    catch {
        return false;
    }
}
export function deriveSemanticJobRevision(parent, request, selection, worksite, historicalWorksite = worksite, counterevidenceAssets = [], counterevidence, operationalFailedStage, operationalRole = "author") {
    try {
        const native = request.nativeWorksite;
        if (!isSemanticRevisionRequest(request) || !isSemanticRevisionSelection(selection) || !requestChoiceMatchesSelection(request, selection) ||
            (native === undefined ? !isSemanticWorksiteBasis(worksite) || historicalWorksite === null || selection.nativePhase !== undefined :
                worksite !== null || selection.nativePhase !== (native.construction === null ? "preconstruction" : "postconstruction")) ||
            hash(request.parent) !== hash(selection.parent) || hash(request.causes) !== hash(selection.causes))
            return null;
        const priorRevision = isSemanticJobRevisionEnvelope(parent) ? parent : null;
        const prior = priorRevision?.current ?? parent;
        if (!isSemanticJobEnvelope(prior))
            return null;
        // This role comes from ABG's authenticated preparation failure, never a
        // selector label or the serialized request alone.
        const operational = operationalFailedStage !== undefined;
        const pending = operational && operationalRole === "assessor" ? prior.assets.at(-1) : undefined;
        const stageIndex = prior.assets.length - (operationalRole === "assessor" ? 1 : 0);
        const entryRole = request.selectionChoice?.mode === "stage_revision" ? request.selectionChoice.entryRole ?? "author" : "author";
        if (entryRole !== (operational ? operationalRole : "author") ||
            operational && (native === undefined || native.construction !== null || selection.mode !== "stage_revision" ||
                selection.selectedStageRef !== operationalFailedStage.declarationRef ||
                prior.declaration.stages[stageIndex] === undefined ||
                hash(operationalFailedStage) !== hash(prior.declaration.stages[stageIndex]) ||
                (operationalRole === "assessor" ? pending === undefined || pending.stageRef !== operationalFailedStage.declarationRef ||
                    pending.assessment !== null || !prior.assets.slice(0, -1).every(a => a.assessment?.disposition === "satisfied") :
                    !prior.assets.every(a => a.assessment?.disposition === "satisfied")) ||
                counterevidence !== undefined || counterevidenceAssets.length !== 0))
            return null;
        const history = merge([...(priorRevision?.revisionBasis.historicalAssets ?? []), ...prior.assets,
            ...(native === undefined ? [] : counterevidenceAssets)], a => a.assetRef);
        const active = projectSemanticJobBindings(prior), terms = history === null ? null : merge(history.flatMap(a => a.groundedTerms), t => t.requirementRef);
        if (history === null || terms === null || active === null || !selection.selectedObligationRefs.every(r => active.some(v => v.binding.obligationRef === r)) ||
            !selection.selectedTargetRefs.every(r => native === undefined ? historicalWorksite.targets.some(t => t.target.targetRef === r) :
                semanticJobRevisionNativeTargets(prior).some(t => t.relativePath === r)) ||
            native !== undefined && (!operational && active.length > 0 && selection.selectedObligationRefs.length === 0 ||
                native.construction === null && (selection.mode !== "stage_revision" || selection.selectedTargetRefs.length !== 0)))
            return null;
        const affected = new Set();
        if (selection.mode === "stage_revision") {
            if (!prior.declaration.stages.some(s => s.declarationRef === selection.selectedStageRef))
                return null;
            affected.add(selection.selectedStageRef);
            for (const stage of prior.declaration.stages)
                if (stage.predecessorStageRefs.some(r => affected.has(r)))
                    affected.add(stage.declarationRef);
        }
        const preserved = prior.assets.filter(a => !affected.has(a.stageRef) && !(selection.mode === "construction_repair" &&
            prior.declaration.stages.find(s => s.declarationRef === a.stageRef)?.bodyCapabilities.includes("application_assessment")));
        if (preserved.some(a => a.assessment?.disposition !== "satisfied"))
            return null;
        const evidenceOnly = native !== undefined && selection.mode === "stage_revision" && prior.declaration.stages.find(s => s.declarationRef === selection.selectedStageRef)?.bodyCapabilities.includes("application_assessment") === true;
        if (evidenceOnly && (native.construction === null || counterevidence?.evidence == null))
            return null;
        const body = { request, selection, affectedStageRefs: [...affected], preservedAssetRefs: preserved.map(a => a.assetRef),
            retainedTerms: terms, retainedBindings: active.map(v => v.binding), historicalAssets: history,
            parentRevisionRef: priorRevision?.revisionBasis.basisRef ?? null };
        const basisDigest = hash(body);
        const result = { kind: "semantic_revision_envelope", schemaVersion: "5.0.0",
            revisionBasis: { ...body, basisDigest, basisRef: `semantic-revision://abiogenesis/${basisDigest.slice(7)}` },
            current: { ...prior, assets: pending === undefined ? preserved : [...preserved, pending], worksite, evidence: evidenceOnly ? counterevidence.evidence : null, ...(native === undefined ? {} : { context: native.context }) } };
        return isSemanticJobRevisionEnvelope(result) ? deepFreeze(result) : null;
    }
    catch {
        return null;
    }
}
export function semanticJobRevisionNativeTargets(envelope) {
    return [...envelope.assets].reverse().find(asset => asset.candidate.design !== null)?.candidate.design?.targets ?? [];
}
/** Affected writes derive from admitted selection and the newly assessed
 * Design. Unchanged targets stay read-only members of the native snapshot. */
export function nativeSemanticRevisionConstruction(input) {
    if (!isSemanticJobRevisionEnvelope(input) || input.revisionBasis.request.nativeWorksite === undefined)
        throw new TypeError("native semantic revision required");
    const selection = input.revisionBasis.selection, targets = semanticJobRevisionNativeTargets(input.current);
    const previous = [...input.revisionBasis.historicalAssets].reverse().find(a => a.candidate.design !== null)?.candidate.design?.targets ?? [];
    const selectedPaths = targets.filter(target => selection.nativePhase === "preconstruction" ||
        selection.selectedTargetRefs.includes(target.relativePath) || selection.mode === "stage_revision" &&
        (target.obligationRefs.some(ref => selection.selectedObligationRefs.includes(ref)) ||
            !previous.some(old => old.relativePath === target.relativePath && hash(old) === hash(target)))).map(t => t.relativePath);
    return { selectedPaths, executionLimits: input.revisionBasis.request.nativeWorksite.commandExecutionLimits, feedback: { selection: selection,
            historicalAssets: input.revisionBasis.historicalAssets,
            retainedTerms: input.revisionBasis.retainedTerms } };
}
export function constructNativeRevisionConstructionTask(input, operating = input.revisionBasis.request.nativeWorksite) {
    const native = input.revisionBasis.request.nativeWorksite;
    if (native === undefined || operating === undefined || input.current.context === null || input.current.evidence !== null)
        throw new TypeError("native revision construction basis required");
    return constructNativeSemanticConstructionTask(input.current, operating, input.current.context, nativeSemanticRevisionConstruction(input));
}
export function constructNativeRevisionExecutionTask(input, source) {
    if (!isNativeWorkspaceWorkObservation(source) || hash(source.task) !== hash(constructNativeRevisionConstructionTask(input, { ...input.revisionBasis.request.nativeWorksite, ...source.task })))
        throw new TypeError("actual selected native revision construction required");
    return constructNativeSemanticExecutionTask(input.current, source, nativeSemanticRevisionConstruction(input));
}
/** Coordinates supplied here are admitted by the ABG source join, never by this pure constructor. */
export function deriveNativeRevisionEvidence(input, execution, construction, command) {
    try {
        if (!isSemanticJobRevisionEnvelope(input) || !isNativeWorksiteCommandExecutionObservation(execution) ||
            hash(execution.task) !== hash(constructNativeRevisionExecutionTask(input, execution.task.sourceNativeWork)))
            return null;
        const artifacts = nativeSemanticEvidenceArtifacts(input.current, execution, nativeSemanticRevisionConstruction(input));
        if (artifacts === null)
            return null;
        return deepFreeze({ ...input, current: { ...input.current, context: execution.task.sourceNativeWork.after, worksite: null,
                evidence: { kind: "semantic_worksite_evidence", constructionResultRef: construction.resultRef, constructionResultDigest: construction.resultDigest,
                    executionResultRef: command.resultRef, executionResultDigest: command.resultDigest,
                    constructionResult: execution.task.sourceNativeWork,
                    executionObservation: execution, artifacts } } });
    }
    catch {
        return null;
    }
}
export function deriveJobRevisionAsset(input, stageRef, raw, source) {
    if (!isSemanticJobRevisionEnvelope(input))
        return null;
    const current = deriveSemanticJobAsset(input.current, stageRef, raw, source, input.revisionBasis.retainedTerms, undefined, input.revisionBasis.request.nativeWorksite?.commandExecutionLimits);
    return current === null ? null : deepFreeze({ ...input, current });
}
export function deriveJobRevisionAssessment(input, stageRef, raw, source) {
    if (!isSemanticJobRevisionEnvelope(input))
        return null;
    const current = deriveSemanticJobAssessment(input.current, stageRef, raw, source, input.revisionBasis.retainedTerms, input.revisionBasis.request.nativeWorksite?.commandExecutionLimits);
    if (current === null)
        return null;
    // Current binding projection changes; admitted revision/old versions do not.
    return deepFreeze({ ...input, current });
}
/** Pure carrier consequence; ABG authenticates intake, selection and native
 * producers before any of these leaves can supply advancing authority. */
export function evaluateNativeSemanticRevisionRelation(predicate, input, output) {
    const roles = [ids.nativeIntakePredicateRef, ids.nativeRequestPredicateRef, ids.nativeConstructionPredicateRef, ids.nativeExecutionPredicateRef, ids.nativeEvidencePredicateRef];
    const step = predicate === ids.stepPredicateRef;
    if (!step && !roles.some(ref => ref === predicate))
        return null;
    const same = (a, b) => hash(a) === hash(b);
    try {
        if (predicate === ids.nativeIntakePredicateRef || step && isNativeSemanticRevisionIntake(input) && isSemanticRevisionSelectionInput(output))
            return isNativeSemanticRevisionIntake(input) && isSemanticRevisionSelectionInput(output) && output.nativeWorksite !== undefined && same(input, output.nativeWorksite.source);
        if (predicate === ids.nativeRequestPredicateRef || step && (isSemanticRevisionSelectionInput(input) || isSemanticRevisionSelection(input)) && isSemanticRevisionRequest(output))
            return isSemanticRevisionRequest(output) && output.nativeWorksite?.acquisition !== undefined &&
                (isSemanticRevisionSelection(input) ? same(input.parent, output.parent) && same(input.causes, output.causes) && requestChoiceMatchesSelection(output, input) :
                    isSemanticRevisionSelectionInput(input) ? semanticRevisionSelectionInputMatchesRequest(input, output) :
                        isNativeSemanticRevisionIntake(input) && same(input, output.nativeWorksite.source));
        if (step && isSemanticRevisionSelectionInput(input) && isSemanticRevisionSelection(output))
            return same(input.parent, output.parent) && same(input.causes, output.causes);
        if (predicate === ids.nativeConstructionPredicateRef || step && isSemanticJobRevisionEnvelope(input) && isNativeWorkspaceWorkTask(output))
            return isSemanticJobRevisionEnvelope(input) && isNativeWorkspaceWorkTask(output) &&
                same(constructNativeRevisionConstructionTask(input, { ...input.revisionBasis.request.nativeWorksite, ...output }), output);
        if (predicate === ids.nativeExecutionPredicateRef || step && isRetainedGraphInput(input) && isNativeWorksiteCommandExecutionTask(output))
            return isRetainedGraphInput(input) && isSemanticJobRevisionEnvelope(input.entry) && isNativeWorkspaceWorkObservation(input.source) &&
                same(constructNativeRevisionExecutionTask(input.entry, input.source), output);
        if (predicate === ids.nativeEvidencePredicateRef || step && isRetainedGraphInput(input) && isSemanticJobRevisionEnvelope(output)) {
            if (isSemanticJobRevisionEnvelope(input) && isSemanticJobRevisionEnvelope(output) && output.current.evidence !== null)
                input = constructRetainedGraphInput(input, output.current.evidence.executionObservation);
            if (!isRetainedGraphInput(input) || !isSemanticJobRevisionEnvelope(input.entry) || !isSemanticJobRevisionEnvelope(output) || output.current.evidence === null)
                return false;
            const evidence = output.current.evidence;
            return same(deriveNativeRevisionEvidence(input.entry, input.source, { resultRef: evidence.constructionResultRef, resultDigest: evidence.constructionResultDigest }, { resultRef: evidence.executionResultRef, resultDigest: evidence.executionResultDigest }), output);
        }
        if (step && isNativeWorkspaceWorkTask(input))
            return resolveNativeWorkspaceWorkJudgmentRelation(NATIVE_WORKSPACE_WORK_IDS.judgmentPredicateRef)?.evaluate(input, output) === true;
        if (step && isNativeWorksiteCommandExecutionTask(input))
            return resolveWorksiteCommandExecutionJudgmentRelation(WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef)?.evaluate(input, output) === true;
        if (step && isSemanticJobRevisionEnvelope(input) && input.current.evidence === null && isSemanticJobRevisionEnvelope(output) && output.current.evidence !== null)
            return evaluateNativeSemanticRevisionRelation(ids.nativeEvidencePredicateRef, constructRetainedGraphInput(input, output.current.evidence.executionObservation), output);
        return step ? null : false;
    }
    catch {
        return false;
    }
}
