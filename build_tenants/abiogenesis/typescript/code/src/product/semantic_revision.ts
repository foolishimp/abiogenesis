import { SEMANTIC_REVISION_IDS as ids } from "../gtl/semantic_revision_identity.js";
import { isRetainedGraphInput, constructRetainedGraphInput } from "./worksite_preparation_contracts.js";
import * as v from "valibot";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { RequirementTerm, GtlContractFulfillmentBinding } from "../gtl/requirement_handoff.js";
import { deriveSemanticAsset, deriveSemanticAssessment, isSemanticStageEnvelope, isSemanticWorksiteBasis, projectSemanticWorksiteCoordinates,
  type SemanticStageEnvelope, type SemanticActorSource, type SemanticWorksiteBasis } from "./semantic_stage.js";
import { isSemanticJobEnvelope, projectSemanticJobBindings, deriveSemanticJobAsset, deriveSemanticJobAssessment,
  constructNativeSemanticConstructionTask, constructNativeSemanticExecutionTask, nativeSemanticEvidenceArtifacts,
  type SemanticJobEnvelope, type SemanticJobAsset, type NativeSemanticOperating, type NativeSemanticRevisionConstruction } from "./semantic_job.js";
import { isNativeWorkspaceWorkObservation, isNativeWorkspaceWorkTask, resolveNativeWorkspaceWorkJudgmentRelation, NATIVE_WORKSPACE_WORK_IDS, type NativeWorkspaceWorkObservation } from "./native_workspace_work.js";
import { isNativeWorksiteCommandExecutionObservation, isNativeWorksiteCommandExecutionTask, resolveWorksiteCommandExecutionJudgmentRelation, WORKSITE_COMMAND_EXECUTION_IDS, type WorksiteCommandExecutionLimits } from "./worksite_command_execution.js";
import { validateDurablePrefixCoordinate, type DurablePrefixCoordinate } from "../abg/event_store.js";
import { exactWorkspaceBinding, isWorksiteContextObservation, type WorksiteContextObservation } from "./worksite_effect.js";
import { isWorkspaceAuthorityBasis, type WorkspaceAuthorityBasis, type WorkspaceBinding } from "./environment.js";
import { isCapabilityGrantValue, type CapabilityGrant } from "./invocation.js";

const hash = (x: unknown) => sha256Canonical(x as JsonValue);
const ref = v.pipe(v.string(), v.minLength(1));
const digest = v.pipe(v.string(), v.regex(/^sha256:[a-f0-9]{64}$/));
const refs = v.array(ref);
export interface SemanticRevisionCoordinate {
  readonly cCallRef: string; readonly resultRef: string; readonly resultDigest: Sha256Digest;
  readonly resultAdmissionEventRef: string; readonly judgmentEventRef: string;
}
const coordinate = v.strictObject({ cCallRef: ref, resultRef: ref, resultDigest: digest,
  resultAdmissionEventRef: ref, judgmentEventRef: ref });
export interface NativeSemanticRevisionIntake {
  readonly kind: "native_semantic_revision_intake";
  readonly schemaVersion: "5.0.0";
  readonly sourceRun: { readonly ref: string; readonly digest: Sha256Digest };
  readonly sourcePrefix: DurablePrefixCoordinate;
}
export function isNativeSemanticRevisionIntake(value: unknown): value is NativeSemanticRevisionIntake {
  return v.is(v.strictObject({ kind: v.literal("native_semantic_revision_intake"), schemaVersion: v.literal("5.0.0"),
    sourceRun: v.strictObject({ ref, digest }), sourcePrefix: v.custom(validateDurablePrefixCoordinate) }), value);
}
export interface SemanticRevisionSelection {
  readonly kind: "semantic_revision_selection"; readonly schemaVersion: "5.0.0";
  readonly parent: SemanticRevisionCoordinate; readonly causes: readonly SemanticRevisionCoordinate[];
  readonly mode: "construction_repair" | "stage_revision";
  readonly selectedStageRef: string | null; readonly selectedObligationRefs: readonly string[];
  readonly selectedTargetRefs: readonly string[]; readonly reasonRef: string;
  readonly nativePhase?: "preconstruction" | "postconstruction";
}
const selectionSchema = v.strictObject({ kind: v.literal("semantic_revision_selection"), schemaVersion: v.literal("5.0.0"),
  parent: coordinate, causes: v.pipe(v.array(coordinate), v.minLength(1)), mode: v.picklist(["construction_repair", "stage_revision"]),
  selectedStageRef: v.nullable(ref), selectedObligationRefs: refs, selectedTargetRefs: refs, reasonRef: ref,
  nativePhase: v.optional(v.picklist(["preconstruction", "postconstruction"])) });
/** Native observation evidence stays native. This is an input to authenticate,
 * not a synthetic C0/C1 worksite or a new currentness owner. */
export interface NativeSemanticRevisionWorksite {
  readonly kind: "native_semantic_revision_worksite";
  readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
  readonly workspaceBinding: WorkspaceBinding;
  readonly capabilityGrant: CapabilityGrant;
  readonly context: WorksiteContextObservation;
  readonly commandExecutionLimits: WorksiteCommandExecutionLimits;
  readonly construction: SemanticRevisionCoordinate | null;
  readonly source: NativeSemanticRevisionIntake;
  readonly acquisition?: SemanticRevisionCoordinate;
}
export function isNativeSemanticRevisionWorksite(value: unknown): value is NativeSemanticRevisionWorksite {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const x = value as NativeSemanticRevisionWorksite;
  return Object.keys(x).sort().join() === ["kind", "workspaceAuthorityBasis", "workspaceBinding", "capabilityGrant", "context", "commandExecutionLimits", "construction", "source", ...(x.acquisition === undefined ? [] : ["acquisition"])].sort().join() &&
    x.kind === "native_semantic_revision_worksite" && isWorkspaceAuthorityBasis(x.workspaceAuthorityBasis) &&
    x.workspaceBinding !== null && typeof x.workspaceBinding === "object" && exactWorkspaceBinding(x.workspaceBinding) && isCapabilityGrantValue(x.capabilityGrant) &&
    v.is(v.strictObject({ inactivityTimeoutMs:v.pipe(v.number(),v.integer(),v.minValue(1)), absoluteTimeoutMs:v.pipe(v.number(),v.integer(),v.minValue(1)) }), x.commandExecutionLimits) &&
    x.commandExecutionLimits.absoluteTimeoutMs > x.commandExecutionLimits.inactivityTimeoutMs &&
    isWorksiteContextObservation(x.context) && (x.construction === null || v.is(coordinate, x.construction)) &&
    isNativeSemanticRevisionIntake(x.source) && (x.acquisition === undefined || v.is(coordinate, x.acquisition)) &&
    x.context.workspaceAuthorityBasisRef === x.workspaceAuthorityBasis.authorityBasisId &&
    x.context.workspaceAuthorityBasisDigest === x.workspaceAuthorityBasis.authorityBasisDigest &&
    x.context.workspaceBindingIdentity === x.workspaceBinding.bindingId && x.context.workspaceBindingDigest === x.workspaceBinding.bindingDigest;
}
export interface SemanticRevisionRequest {
  readonly kind: "semantic_revision_request"; readonly schemaVersion: "5.0.0";
  readonly parent: SemanticRevisionCoordinate; readonly causes: readonly SemanticRevisionCoordinate[];
  readonly selection: SemanticRevisionCoordinate;
  /** Terminal-readable projection of the admitted selection; absent on historical requests. */
  readonly selectionChoice?: { readonly mode: "construction_repair"; readonly selectedStageRef: null } |
    { readonly mode: "stage_revision"; readonly selectedStageRef: string };
  readonly currentWorksite: SemanticWorksiteBasis | null;
  readonly nativeWorksite?: NativeSemanticRevisionWorksite;
}
export interface SemanticRevisionSelectionInput {
  readonly kind: "semantic_revision_selection_input"; readonly schemaVersion: "5.0.0";
  readonly parent: SemanticRevisionCoordinate; readonly causes: readonly SemanticRevisionCoordinate[];
  readonly currentWorksite: SemanticWorksiteBasis | null;
  readonly nativeWorksite?: NativeSemanticRevisionWorksite;
}
const selectionInputSchema = v.strictObject({ kind: v.literal("semantic_revision_selection_input"), schemaVersion: v.literal("5.0.0"),
  parent: coordinate, causes: v.pipe(v.array(coordinate), v.minLength(1)), currentWorksite: v.unknown(), nativeWorksite: v.optional(v.unknown()) });
export function isSemanticRevisionSelectionInput(x: unknown): x is SemanticRevisionSelectionInput {
  return v.is(selectionInputSchema, x) && unique(x.causes.map(c => c.resultRef)) &&
    (x.currentWorksite === null || isSemanticWorksiteBasis(x.currentWorksite)) &&
    (x.nativeWorksite === undefined || x.currentWorksite === null && isNativeSemanticRevisionWorksite(x.nativeWorksite));
}
/** Compare the selected observation, not two Programs' different permissions.
 * ABG authenticates each invocation's own operating basis separately. */
export function semanticRevisionSelectionInputMatchesRequest(input: unknown, request: SemanticRevisionRequest): boolean {
  try {
    if (!isSemanticRevisionSelectionInput(input) || !isSemanticRevisionRequest(request) ||
      hash(input.parent) !== hash(request.parent) || hash(input.causes) !== hash(request.causes)) return false;
    if (input.nativeWorksite !== undefined || request.nativeWorksite !== undefined) {
      if (input.nativeWorksite === undefined || request.nativeWorksite === undefined) return false;
      const { capabilityGrant: _selectedGrant, acquisition: _selectedAcquisition, ...selected } = input.nativeWorksite;
      const { capabilityGrant: _currentGrant, acquisition: _currentAcquisition, ...current } = request.nativeWorksite;
      return hash(selected) === hash(current);
    }
    if (input.currentWorksite === null || request.currentWorksite === null) return input.currentWorksite === request.currentWorksite;
    const projected = projectSemanticWorksiteCoordinates(input.currentWorksite, request.currentWorksite);
    return projected !== null && hash(projected) === hash(request.currentWorksite);
  } catch { return false; }
}
export function semanticRevisionSelectionSchema(nativePhase?: "preconstruction" | "postconstruction"): Readonly<Record<string, JsonValue>> {
  const coordinateSchema = { type: "object", additionalProperties: false, required: ["cCallRef", "resultRef", "resultDigest", "resultAdmissionEventRef", "judgmentEventRef"], properties: {
    cCallRef: {type:"string"}, resultRef: {type:"string"}, resultDigest:{type:"string",pattern:"^sha256:[a-f0-9]{64}$"}, resultAdmissionEventRef:{type:"string"},judgmentEventRef:{type:"string"} } };
  return { type: "object", additionalProperties: false,
    required: ["kind", "schemaVersion", "parent", "causes", "mode", "selectedStageRef", "selectedObligationRefs", "selectedTargetRefs", "reasonRef", ...(nativePhase === undefined ? [] : ["nativePhase"])],
    properties: { kind:{const:"semantic_revision_selection"},schemaVersion:{const:"5.0.0"},parent:coordinateSchema,causes:{type:"array",minItems:1,items:coordinateSchema},
      mode:{enum:nativePhase === "preconstruction" ? ["stage_revision"] : ["construction_repair","stage_revision"]},selectedStageRef:{type:["string","null"]}, selectedObligationRefs:{type:"array",minItems:nativePhase === "preconstruction" ? 0 : 1,items:{type:"string"}},selectedTargetRefs:{type:"array",items:{type:"string"}},reasonRef:{type:"string"},
      ...(nativePhase === undefined ? {} : { nativePhase: { const: nativePhase } }) } };
}
const requestSchema = v.strictObject({ kind: v.literal("semantic_revision_request"), schemaVersion: v.literal("5.0.0"),
  parent: coordinate, causes: v.pipe(v.array(coordinate), v.minLength(1)), selection: coordinate,
  selectionChoice: v.optional(v.variant("mode", [
    v.strictObject({ mode: v.literal("construction_repair"), selectedStageRef: v.null() }),
    v.strictObject({ mode: v.literal("stage_revision"), selectedStageRef: ref })])),
  currentWorksite: v.unknown(), nativeWorksite: v.optional(v.unknown()) });
function requestChoiceMatchesSelection(request: SemanticRevisionRequest, selection: SemanticRevisionSelection): boolean {
  return request.selectionChoice === undefined || request.selectionChoice.mode === selection.mode &&
    request.selectionChoice.selectedStageRef === selection.selectedStageRef;
}
export interface SemanticRevisionBasis {
  readonly basisRef: string; readonly basisDigest: Sha256Digest;
  readonly request: SemanticRevisionRequest; readonly selection: SemanticRevisionSelection;
  readonly affectedStageRefs: readonly string[]; readonly preservedAssetRefs: readonly string[];
  readonly retainedTerms: readonly RequirementTerm[];
  readonly retainedBindings: readonly GtlContractFulfillmentBinding[];
  readonly parentRevisionRef: string | null;
}
export interface SemanticRevisionEnvelope {
  readonly kind: "semantic_revision_envelope"; readonly schemaVersion: "5.0.0";
  readonly revisionBasis: SemanticRevisionBasis; readonly current: SemanticStageEnvelope;
}
const unique = (xs: readonly string[]) => new Set(xs).size === xs.length;
export function isSemanticRevisionSelection(x: unknown): x is SemanticRevisionSelection {
  return v.is(selectionSchema, x) && unique(x.causes.map(c => c.resultRef)) && unique(x.selectedObligationRefs) &&
    (x.selectedObligationRefs.length > 0 || x.nativePhase === "preconstruction") &&
    (x.nativePhase !== "preconstruction" || x.mode === "stage_revision" && x.selectedTargetRefs.length === 0) &&
    unique(x.selectedTargetRefs) && (x.mode === "construction_repair" ? x.selectedStageRef === null : x.selectedStageRef !== null);
}
export function isSemanticRevisionRequest(x: unknown): x is SemanticRevisionRequest {
  return v.is(requestSchema, x) && unique(x.causes.map(c => c.resultRef)) &&
    (x.currentWorksite === null || isSemanticWorksiteBasis(x.currentWorksite)) &&
    (x.nativeWorksite === undefined || x.currentWorksite === null && isNativeSemanticRevisionWorksite(x.nativeWorksite));
}
export function isSemanticRevisionEnvelope(x: unknown): x is SemanticRevisionEnvelope {
  try {
    if (x === null || typeof x !== "object" || Array.isArray(x)) return false;
    const e = x as SemanticRevisionEnvelope;
    if (Object.keys(e).sort().join() !== ["kind", "schemaVersion", "revisionBasis", "current"].sort().join() ||
      e.kind !== "semantic_revision_envelope" || e.schemaVersion !== "5.0.0" || !isSemanticStageEnvelope(e.current)) return false;
    const b = e.revisionBasis;
    if (b === null || typeof b !== "object" || Object.keys(b).sort().join() !== ["basisRef", "basisDigest", "request", "selection", "affectedStageRefs", "preservedAssetRefs", "retainedTerms", "retainedBindings", "parentRevisionRef"].sort().join() ||
      !isSemanticRevisionRequest(b.request) || !isSemanticRevisionSelection(b.selection) || !Array.isArray(b.affectedStageRefs) ||
      !Array.isArray(b.preservedAssetRefs) || !Array.isArray(b.retainedTerms) || !Array.isArray(b.retainedBindings) ||
      !(b.parentRevisionRef === null || typeof b.parentRevisionRef === "string")) return false;
    const { basisRef, basisDigest, ...body } = b;
    return unique(b.affectedStageRefs) && unique(b.preservedAssetRefs) && unique(b.retainedTerms.map(t => t.requirementRef)) &&
      unique(b.retainedBindings.map(t => t.obligationRef)) && basisDigest === hash(body) &&
      basisRef === `semantic-revision://abiogenesis/${basisDigest.slice(7)}`;
  } catch { return false; }
}
function merge<T>(xs: readonly T[], key: (x: T) => string): readonly T[] | null {
  const rows = new Map<string, T>();
  for (const x of xs) { const prior = rows.get(key(x)); if (prior !== undefined && hash(prior) !== hash(x)) return null; rows.set(key(x), x); }
  return [...rows.values()];
}
/** Pure projection only. ABG must authenticate every input and regenerate this value before admission. */
export function deriveSemanticRevision(parent: SemanticStageEnvelope | SemanticRevisionEnvelope,
  request: SemanticRevisionRequest, selection: SemanticRevisionSelection): Readonly<SemanticRevisionEnvelope> | null {
  if (!isSemanticRevisionRequest(request) || !isSemanticRevisionSelection(selection) || !requestChoiceMatchesSelection(request, selection) || request.nativeWorksite !== undefined || selection.nativePhase !== undefined ||
    hash(request.parent) !== hash(selection.parent) || hash(request.causes) !== hash(selection.causes)) return null;
  const priorRevision = isSemanticRevisionEnvelope(parent) ? parent : null;
  const prior = priorRevision?.current ?? parent as SemanticStageEnvelope;
  if (!isSemanticStageEnvelope(prior)) return null;
  const terms = merge([...(priorRevision?.revisionBasis.retainedTerms ?? []), ...prior.sourceHandoff.declaration.terms,
    ...prior.assets.flatMap(a => a.groundedTerms)], t => t.requirementRef);
  const bindings = merge([...(priorRevision?.revisionBasis.retainedBindings ?? []), ...prior.sourceHandoff.declaration.fulfillmentBindings,
    ...prior.assets.flatMap(a => a.discoveredBindings)], b => b.obligationRef);
  if (terms === null || bindings === null || !selection.selectedObligationRefs.every(r => bindings.some(b => b.obligationRef === r)) ||
    !selection.selectedTargetRefs.every(r => prior.worksite?.targets.some(t => t.target.targetRef === r))) return null;
  const affected = new Set<string>();
  if (selection.mode === "stage_revision") {
    if (!prior.lifecycle.stages.some(s => s.declarationRef === selection.selectedStageRef)) return null;
    affected.add(selection.selectedStageRef!);
    for (const stage of prior.lifecycle.stages) if (stage.predecessorStageRefs.some(r => affected.has(r))) affected.add(stage.declarationRef);
  }
  // Construction invalidates execution proof, not the governing semantic assets.
  const preserved = prior.assets.filter(a => !affected.has(a.stageRef) &&
    !(selection.mode === "construction_repair" && prior.lifecycle.stages.find(s => s.declarationRef === a.stageRef)?.bodyCapabilities.includes("application_assessment")));
  if (preserved.some(a => a.assessment?.disposition !== "satisfied")) return null;
  const body = { request, selection, affectedStageRefs: [...affected], preservedAssetRefs: preserved.map(a => a.assetRef),
    retainedTerms: terms, retainedBindings: bindings, parentRevisionRef: priorRevision?.revisionBasis.basisRef ?? null };
  const basisDigest = hash(body);
  return deepFreeze({ kind: "semantic_revision_envelope", schemaVersion: "5.0.0",
    revisionBasis: { ...body, basisDigest, basisRef: `semantic-revision://abiogenesis/${basisDigest.slice(7)}` },
    current: { ...prior, worksite: request.currentWorksite, assets: preserved, evidence: null } });
}
export function deriveRevisionAsset(input: SemanticRevisionEnvelope, stageRef: string, raw: unknown, source: SemanticActorSource) {
  if (!isSemanticRevisionEnvelope(input)) return null;
  const current = deriveSemanticAsset(input.current, stageRef, raw, source,
    { terms: input.revisionBasis.retainedTerms, bindings: input.revisionBasis.retainedBindings });
  return current === null ? null : deepFreeze({ ...input, current });
}
export function deriveRevisionAssessment(input: SemanticRevisionEnvelope, stageRef: string, raw: unknown, source: SemanticActorSource) {
  if (!isSemanticRevisionEnvelope(input)) return null;
  const current = deriveSemanticAssessment(input.current, stageRef, raw, source);
  return current === null ? null : deepFreeze({ ...input, current });
}

/** Closed job arm; legacy fixed binding equality above is unchanged. */
export interface SemanticJobRevisionEnvelope {
  readonly kind: "semantic_revision_envelope"; readonly schemaVersion: "5.0.0";
  readonly revisionBasis: SemanticRevisionBasis & { readonly historicalAssets: readonly SemanticJobAsset[] };
  readonly current: SemanticJobEnvelope;
}
export function isSemanticJobRevisionEnvelope(x: unknown): x is SemanticJobRevisionEnvelope {
  try {
    if (x === null || typeof x !== "object" || Array.isArray(x)) return false;
    const e = x as SemanticJobRevisionEnvelope, b = e.revisionBasis;
    if (Object.keys(e).sort().join() !== ["kind", "schemaVersion", "revisionBasis", "current"].sort().join() ||
      e.kind !== "semantic_revision_envelope" || e.schemaVersion !== "5.0.0" || !isSemanticJobEnvelope(e.current) ||
      b === null || typeof b !== "object" || Object.keys(b).sort().join() !== ["basisRef", "basisDigest", "request", "selection", "affectedStageRefs", "preservedAssetRefs", "retainedTerms", "retainedBindings", "parentRevisionRef", "historicalAssets"].sort().join() ||
      !isSemanticRevisionRequest(b.request) || !isSemanticRevisionSelection(b.selection) || !Array.isArray(b.historicalAssets) ||
      !Array.isArray(b.affectedStageRefs) || !Array.isArray(b.preservedAssetRefs) || !Array.isArray(b.retainedTerms) || !Array.isArray(b.retainedBindings) ||
      !(b.parentRevisionRef === null || typeof b.parentRevisionRef === "string")) return false;
    const { basisRef, basisDigest, ...body } = b, active = projectSemanticJobBindings(e.current);
    return basisDigest === hash(body) && basisRef === `semantic-revision://abiogenesis/${basisDigest.slice(7)}` &&
      unique(b.historicalAssets.map(a => a.assetRef)) && unique(b.affectedStageRefs) && unique(b.preservedAssetRefs) &&
      unique(b.retainedTerms.map(t => t.requirementRef)) && active !== null &&
      b.retainedBindings.every(binding => e.current.bindingVersions.some(version => hash(version.binding) === hash(binding))) &&
      e.current.assets.filter(a => b.preservedAssetRefs.includes(a.assetRef)).every(a => b.historicalAssets.some(h => hash(h) === hash(a)));
  } catch { return false; }
}
export function deriveSemanticJobRevision(parent: SemanticJobEnvelope | SemanticJobRevisionEnvelope,
  request: SemanticRevisionRequest, selection: SemanticRevisionSelection, worksite: SemanticWorksiteBasis | null,
  historicalWorksite: SemanticWorksiteBasis | null = worksite,
  counterevidenceAssets: readonly SemanticJobAsset[] = [], counterevidence?: SemanticJobEnvelope): Readonly<SemanticJobRevisionEnvelope> | null {
  try {
    const native = request.nativeWorksite;
    if (!isSemanticRevisionRequest(request) || !isSemanticRevisionSelection(selection) || !requestChoiceMatchesSelection(request, selection) ||
      (native === undefined ? !isSemanticWorksiteBasis(worksite) || historicalWorksite === null || selection.nativePhase !== undefined :
        worksite !== null || selection.nativePhase !== (native.construction === null ? "preconstruction" : "postconstruction")) ||
      hash(request.parent) !== hash(selection.parent) || hash(request.causes) !== hash(selection.causes)) return null;
    const priorRevision = isSemanticJobRevisionEnvelope(parent) ? parent : null;
    const prior = priorRevision?.current ?? parent as SemanticJobEnvelope;
    if (!isSemanticJobEnvelope(prior)) return null;
    const history = merge([...(priorRevision?.revisionBasis.historicalAssets ?? []), ...prior.assets,
      ...(native === undefined ? [] : counterevidenceAssets)], a => a.assetRef);
    const active = projectSemanticJobBindings(prior), terms = history === null ? null : merge(history.flatMap(a => a.groundedTerms), t => t.requirementRef);
    if (history === null || terms === null || active === null || !selection.selectedObligationRefs.every(r => active.some(v => v.binding.obligationRef === r)) ||
      !selection.selectedTargetRefs.every(r => native === undefined ? historicalWorksite!.targets.some(t => t.target.targetRef === r) :
        semanticJobRevisionNativeTargets(prior).some(t => t.relativePath === r)) ||
      native !== undefined && (active.length > 0 && selection.selectedObligationRefs.length === 0 ||
        native.construction === null && (selection.mode !== "stage_revision" || selection.selectedTargetRefs.length !== 0))) return null;
    const affected = new Set<string>();
    if (selection.mode === "stage_revision") {
      if (!prior.declaration.stages.some(s => s.declarationRef === selection.selectedStageRef)) return null;
      affected.add(selection.selectedStageRef!);
      for (const stage of prior.declaration.stages) if (stage.predecessorStageRefs.some(r => affected.has(r))) affected.add(stage.declarationRef);
    }
    const preserved = prior.assets.filter(a => !affected.has(a.stageRef) && !(selection.mode === "construction_repair" &&
      prior.declaration.stages.find(s => s.declarationRef === a.stageRef)?.bodyCapabilities.includes("application_assessment")));
    if (preserved.some(a => a.assessment?.disposition !== "satisfied")) return null;
    const evidenceOnly = native !== undefined && selection.mode === "stage_revision" && prior.declaration.stages.find(s=>s.declarationRef === selection.selectedStageRef)?.bodyCapabilities.includes("application_assessment") === true;
    if (evidenceOnly && (native.construction === null || counterevidence?.evidence == null)) return null;
    const body = { request, selection, affectedStageRefs: [...affected], preservedAssetRefs: preserved.map(a => a.assetRef),
      retainedTerms: terms, retainedBindings: active.map(v => v.binding), historicalAssets: history,
      parentRevisionRef: priorRevision?.revisionBasis.basisRef ?? null };
    const basisDigest = hash(body);
    const result: SemanticJobRevisionEnvelope = { kind: "semantic_revision_envelope", schemaVersion: "5.0.0",
      revisionBasis: { ...body, basisDigest, basisRef: `semantic-revision://abiogenesis/${basisDigest.slice(7)}` },
      current: { ...prior, assets: preserved, worksite, evidence: evidenceOnly ? counterevidence!.evidence : null, ...(native === undefined ? {} : { context: native.context }) } };
    return isSemanticJobRevisionEnvelope(result) ? deepFreeze(result) : null;
  } catch { return null; }
}
export function semanticJobRevisionNativeTargets(envelope: SemanticJobEnvelope) {
  return [...envelope.assets].reverse().find(asset => asset.candidate.design !== null)?.candidate.design?.targets ?? [];
}
/** Affected writes derive from admitted selection and the newly assessed
 * Design. Unchanged targets stay read-only members of the native snapshot. */
export function nativeSemanticRevisionConstruction(input: SemanticJobRevisionEnvelope): NativeSemanticRevisionConstruction {
  if (!isSemanticJobRevisionEnvelope(input) || input.revisionBasis.request.nativeWorksite === undefined)
    throw new TypeError("native semantic revision required");
  const selection = input.revisionBasis.selection, targets = semanticJobRevisionNativeTargets(input.current);
  const previous = [...input.revisionBasis.historicalAssets].reverse().find(a => a.candidate.design !== null)?.candidate.design?.targets ?? [];
  const selectedPaths = targets.filter(target => selection.nativePhase === "preconstruction" ||
    selection.selectedTargetRefs.includes(target.relativePath) || selection.mode === "stage_revision" &&
    (target.obligationRefs.some(ref => selection.selectedObligationRefs.includes(ref)) ||
      !previous.some(old => old.relativePath === target.relativePath && hash(old) === hash(target)))).map(t => t.relativePath);
  return { selectedPaths, executionLimits: input.revisionBasis.request.nativeWorksite!.commandExecutionLimits, feedback: { selection: selection as unknown as JsonValue,
    historicalAssets: input.revisionBasis.historicalAssets as unknown as JsonValue,
    retainedTerms: input.revisionBasis.retainedTerms as unknown as JsonValue } };
}
export function constructNativeRevisionConstructionTask(input: SemanticJobRevisionEnvelope, operating: NativeSemanticOperating | undefined = input.revisionBasis.request.nativeWorksite) {
  const native = input.revisionBasis.request.nativeWorksite;
  if (native === undefined || operating === undefined || input.current.context === null || input.current.evidence !== null) throw new TypeError("native revision construction basis required");
  return constructNativeSemanticConstructionTask(input.current, operating, input.current.context, nativeSemanticRevisionConstruction(input));
}
export function constructNativeRevisionExecutionTask(input: SemanticJobRevisionEnvelope, source: NativeWorkspaceWorkObservation) {
  if (!isNativeWorkspaceWorkObservation(source) || hash(source.task) !== hash(constructNativeRevisionConstructionTask(input, {...input.revisionBasis.request.nativeWorksite!, ...source.task})))
    throw new TypeError("actual selected native revision construction required");
  return constructNativeSemanticExecutionTask(input.current, source, nativeSemanticRevisionConstruction(input));
}
/** Coordinates supplied here are admitted by the ABG source join, never by this pure constructor. */
export function deriveNativeRevisionEvidence(input: SemanticJobRevisionEnvelope, execution: unknown,
  construction: Pick<SemanticRevisionCoordinate, "resultRef" | "resultDigest">,
  command: Pick<SemanticRevisionCoordinate, "resultRef" | "resultDigest">): SemanticJobRevisionEnvelope | null {
  try {
    if (!isSemanticJobRevisionEnvelope(input) || !isNativeWorksiteCommandExecutionObservation(execution) ||
      hash(execution.task) !== hash(constructNativeRevisionExecutionTask(input, execution.task.sourceNativeWork))) return null;
    const artifacts = nativeSemanticEvidenceArtifacts(input.current, execution, nativeSemanticRevisionConstruction(input));
    if (artifacts === null) return null;
    return deepFreeze({ ...input, current: { ...input.current, context: execution.task.sourceNativeWork.after, worksite: null,
      evidence: { kind: "semantic_worksite_evidence", constructionResultRef: construction.resultRef, constructionResultDigest: construction.resultDigest,
        executionResultRef: command.resultRef, executionResultDigest: command.resultDigest,
        constructionResult: execution.task.sourceNativeWork as unknown as Readonly<Record<string, JsonValue>>,
        executionObservation: execution as unknown as Readonly<Record<string, JsonValue>>, artifacts } } });
  } catch { return null; }
}
export function deriveJobRevisionAsset(input: SemanticJobRevisionEnvelope, stageRef: string, raw: unknown, source: SemanticActorSource) {
  if (!isSemanticJobRevisionEnvelope(input)) return null;
  const current = deriveSemanticJobAsset(input.current, stageRef, raw, source, input.revisionBasis.retainedTerms, undefined, input.revisionBasis.request.nativeWorksite?.commandExecutionLimits);
  return current === null ? null : deepFreeze({ ...input, current });
}
export function deriveJobRevisionAssessment(input: SemanticJobRevisionEnvelope, stageRef: string, raw: unknown, source: SemanticActorSource) {
  if (!isSemanticJobRevisionEnvelope(input)) return null;
  const current = deriveSemanticJobAssessment(input.current, stageRef, raw, source, input.revisionBasis.retainedTerms, input.revisionBasis.request.nativeWorksite?.commandExecutionLimits);
  if (current === null) return null;
  // Current binding projection changes; admitted revision/old versions do not.
  return deepFreeze({ ...input, current });
}

/** Pure carrier consequence; ABG authenticates intake, selection and native
 * producers before any of these leaves can supply advancing authority. */
export function evaluateNativeSemanticRevisionRelation(predicate: string, input: unknown, output: unknown): boolean | null {
  const roles = [ids.nativeIntakePredicateRef,ids.nativeRequestPredicateRef,ids.nativeConstructionPredicateRef,ids.nativeExecutionPredicateRef,ids.nativeEvidencePredicateRef];
  const step = predicate === ids.stepPredicateRef;
  if (!step && !roles.some(ref=>ref===predicate)) return null;
  const same = (a:unknown,b:unknown)=>hash(a)===hash(b);
  try {
    if (predicate === ids.nativeIntakePredicateRef || step && isNativeSemanticRevisionIntake(input) && isSemanticRevisionSelectionInput(output))
      return isNativeSemanticRevisionIntake(input) && isSemanticRevisionSelectionInput(output) && output.nativeWorksite !== undefined && same(input,output.nativeWorksite.source);
    if (predicate === ids.nativeRequestPredicateRef || step && (isSemanticRevisionSelectionInput(input) || isSemanticRevisionSelection(input)) && isSemanticRevisionRequest(output))
      return isSemanticRevisionRequest(output) && output.nativeWorksite?.acquisition !== undefined &&
        (isSemanticRevisionSelection(input) ? same(input.parent,output.parent) && same(input.causes,output.causes) && requestChoiceMatchesSelection(output,input) :
          isSemanticRevisionSelectionInput(input) ? semanticRevisionSelectionInputMatchesRequest(input,output) :
            isNativeSemanticRevisionIntake(input) && same(input,output.nativeWorksite.source));
    if (step && isSemanticRevisionSelectionInput(input) && isSemanticRevisionSelection(output))
      return same(input.parent,output.parent) && same(input.causes,output.causes);
    if (predicate === ids.nativeConstructionPredicateRef || step && isSemanticJobRevisionEnvelope(input) && isNativeWorkspaceWorkTask(output))
      return isSemanticJobRevisionEnvelope(input) && isNativeWorkspaceWorkTask(output) &&
        same(constructNativeRevisionConstructionTask(input,{...input.revisionBasis.request.nativeWorksite!,...output}),output);
    if (predicate === ids.nativeExecutionPredicateRef || step && isRetainedGraphInput(input) && isNativeWorksiteCommandExecutionTask(output))
      return isRetainedGraphInput(input) && isSemanticJobRevisionEnvelope(input.entry) && isNativeWorkspaceWorkObservation(input.source) &&
        same(constructNativeRevisionExecutionTask(input.entry,input.source),output);
    if (predicate === ids.nativeEvidencePredicateRef || step && isRetainedGraphInput(input) && isSemanticJobRevisionEnvelope(output)) {
      if (isSemanticJobRevisionEnvelope(input) && isSemanticJobRevisionEnvelope(output) && output.current.evidence !== null)
        input = constructRetainedGraphInput(input,output.current.evidence.executionObservation);
      if (!isRetainedGraphInput(input) || !isSemanticJobRevisionEnvelope(input.entry) || !isSemanticJobRevisionEnvelope(output) || output.current.evidence === null) return false;
      const evidence = output.current.evidence;
      return same(deriveNativeRevisionEvidence(input.entry,input.source,
        {resultRef:evidence.constructionResultRef,resultDigest:evidence.constructionResultDigest},
        {resultRef:evidence.executionResultRef,resultDigest:evidence.executionResultDigest}),output);
    }
    if (step && isNativeWorkspaceWorkTask(input)) return resolveNativeWorkspaceWorkJudgmentRelation(NATIVE_WORKSPACE_WORK_IDS.judgmentPredicateRef)?.evaluate(input,output) === true;
    if (step && isNativeWorksiteCommandExecutionTask(input)) return resolveWorksiteCommandExecutionJudgmentRelation(WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef)?.evaluate(input,output) === true;
    if (step && isSemanticJobRevisionEnvelope(input) && input.current.evidence === null && isSemanticJobRevisionEnvelope(output) && output.current.evidence !== null)
      return evaluateNativeSemanticRevisionRelation(ids.nativeEvidencePredicateRef,constructRetainedGraphInput(input,output.current.evidence.executionObservation),output);
    return step ? null : false;
  } catch { return false; }
}
