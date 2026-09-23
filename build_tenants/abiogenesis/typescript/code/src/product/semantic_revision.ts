import * as v from "valibot";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { RequirementTerm, GtlContractFulfillmentBinding } from "../gtl/requirement_handoff.js";
import { deriveSemanticAsset, deriveSemanticAssessment, isSemanticStageEnvelope, isSemanticWorksiteBasis, projectSemanticWorksiteCoordinates,
  type SemanticStageEnvelope, type SemanticActorSource, type SemanticWorksiteBasis } from "./semantic_stage.js";
import { isSemanticJobEnvelope, projectSemanticJobBindings, deriveSemanticJobAsset, deriveSemanticJobAssessment,
  type SemanticJobEnvelope, type SemanticJobAsset } from "./semantic_job.js";

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
export interface SemanticRevisionSelection {
  readonly kind: "semantic_revision_selection"; readonly schemaVersion: "5.0.0";
  readonly parent: SemanticRevisionCoordinate; readonly causes: readonly SemanticRevisionCoordinate[];
  readonly mode: "construction_repair" | "stage_revision";
  readonly selectedStageRef: string | null; readonly selectedObligationRefs: readonly string[];
  readonly selectedTargetRefs: readonly string[]; readonly reasonRef: string;
}
const selectionSchema = v.strictObject({ kind: v.literal("semantic_revision_selection"), schemaVersion: v.literal("5.0.0"),
  parent: coordinate, causes: v.pipe(v.array(coordinate), v.minLength(1)), mode: v.picklist(["construction_repair", "stage_revision"]),
  selectedStageRef: v.nullable(ref), selectedObligationRefs: v.pipe(refs, v.minLength(1)), selectedTargetRefs: refs, reasonRef: ref });
export interface SemanticRevisionRequest {
  readonly kind: "semantic_revision_request"; readonly schemaVersion: "5.0.0";
  readonly parent: SemanticRevisionCoordinate; readonly causes: readonly SemanticRevisionCoordinate[];
  readonly selection: SemanticRevisionCoordinate;
  readonly currentWorksite: SemanticWorksiteBasis | null;
}
export interface SemanticRevisionSelectionInput {
  readonly kind: "semantic_revision_selection_input"; readonly schemaVersion: "5.0.0";
  readonly parent: SemanticRevisionCoordinate; readonly causes: readonly SemanticRevisionCoordinate[];
  readonly currentWorksite: SemanticWorksiteBasis | null;
}
const selectionInputSchema = v.strictObject({ kind: v.literal("semantic_revision_selection_input"), schemaVersion: v.literal("5.0.0"),
  parent: coordinate, causes: v.pipe(v.array(coordinate), v.minLength(1)), currentWorksite: v.unknown() });
export function isSemanticRevisionSelectionInput(x: unknown): x is SemanticRevisionSelectionInput {
  return v.is(selectionInputSchema, x) && unique(x.causes.map(c => c.resultRef)) &&
    (x.currentWorksite === null || isSemanticWorksiteBasis(x.currentWorksite));
}
/** Compare the selected observation, not two Programs' different permissions.
 * ABG authenticates each invocation's own operating basis separately. */
export function semanticRevisionSelectionInputMatchesRequest(input: unknown, request: SemanticRevisionRequest): boolean {
  try {
    if (!isSemanticRevisionSelectionInput(input) || !isSemanticRevisionRequest(request) ||
      hash(input.parent) !== hash(request.parent) || hash(input.causes) !== hash(request.causes)) return false;
    if (input.currentWorksite === null || request.currentWorksite === null) return input.currentWorksite === request.currentWorksite;
    const projected = projectSemanticWorksiteCoordinates(input.currentWorksite, request.currentWorksite);
    return projected !== null && hash(projected) === hash(request.currentWorksite);
  } catch { return false; }
}
export function semanticRevisionSelectionSchema(): Readonly<Record<string, JsonValue>> {
  const coordinateSchema = { type: "object", additionalProperties: false, required: ["cCallRef", "resultRef", "resultDigest", "resultAdmissionEventRef", "judgmentEventRef"], properties: {
    cCallRef: {type:"string"}, resultRef: {type:"string"}, resultDigest:{type:"string",pattern:"^sha256:[a-f0-9]{64}$"}, resultAdmissionEventRef:{type:"string"},judgmentEventRef:{type:"string"} } };
  return { type: "object", additionalProperties: false,
    required: ["kind", "schemaVersion", "parent", "causes", "mode", "selectedStageRef", "selectedObligationRefs", "selectedTargetRefs", "reasonRef"],
    properties: { kind:{const:"semantic_revision_selection"},schemaVersion:{const:"5.0.0"},parent:coordinateSchema,causes:{type:"array",minItems:1,items:coordinateSchema},
      mode:{enum:["construction_repair","stage_revision"]},selectedStageRef:{type:["string","null"]}, selectedObligationRefs:{type:"array",minItems:1,items:{type:"string"}},selectedTargetRefs:{type:"array",items:{type:"string"}},reasonRef:{type:"string"} } };
}
const requestSchema = v.strictObject({ kind: v.literal("semantic_revision_request"), schemaVersion: v.literal("5.0.0"),
  parent: coordinate, causes: v.pipe(v.array(coordinate), v.minLength(1)), selection: coordinate, currentWorksite: v.unknown() });
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
    unique(x.selectedTargetRefs) && (x.mode === "construction_repair" ? x.selectedStageRef === null : x.selectedStageRef !== null);
}
export function isSemanticRevisionRequest(x: unknown): x is SemanticRevisionRequest {
  return v.is(requestSchema, x) && unique(x.causes.map(c => c.resultRef)) &&
    (x.currentWorksite === null || isSemanticWorksiteBasis(x.currentWorksite));
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
  if (!isSemanticRevisionRequest(request) || !isSemanticRevisionSelection(selection) ||
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
  request: SemanticRevisionRequest, selection: SemanticRevisionSelection, worksite: SemanticWorksiteBasis,
  historicalWorksite: SemanticWorksiteBasis = worksite): Readonly<SemanticJobRevisionEnvelope> | null {
  try {
    if (!isSemanticRevisionRequest(request) || !isSemanticRevisionSelection(selection) || !isSemanticWorksiteBasis(worksite) ||
      hash(request.parent) !== hash(selection.parent) || hash(request.causes) !== hash(selection.causes)) return null;
    const priorRevision = isSemanticJobRevisionEnvelope(parent) ? parent : null;
    const prior = priorRevision?.current ?? parent as SemanticJobEnvelope;
    if (!isSemanticJobEnvelope(prior)) return null;
    const history = merge([...(priorRevision?.revisionBasis.historicalAssets ?? []), ...prior.assets], a => a.assetRef);
    const active = projectSemanticJobBindings(prior), terms = history === null ? null : merge(history.flatMap(a => a.groundedTerms), t => t.requirementRef);
    if (history === null || terms === null || active === null || !selection.selectedObligationRefs.every(r => active.some(v => v.binding.obligationRef === r)) ||
      !selection.selectedTargetRefs.every(r => historicalWorksite.targets.some(t => t.target.targetRef === r))) return null;
    const affected = new Set<string>();
    if (selection.mode === "stage_revision") {
      if (!prior.declaration.stages.some(s => s.declarationRef === selection.selectedStageRef)) return null;
      affected.add(selection.selectedStageRef!);
      for (const stage of prior.declaration.stages) if (stage.predecessorStageRefs.some(r => affected.has(r))) affected.add(stage.declarationRef);
    }
    const preserved = prior.assets.filter(a => !affected.has(a.stageRef) && !(selection.mode === "construction_repair" &&
      prior.declaration.stages.find(s => s.declarationRef === a.stageRef)?.bodyCapabilities.includes("application_assessment")));
    if (preserved.some(a => a.assessment?.disposition !== "satisfied")) return null;
    const body = { request, selection, affectedStageRefs: [...affected], preservedAssetRefs: preserved.map(a => a.assetRef),
      retainedTerms: terms, retainedBindings: active.map(v => v.binding), historicalAssets: history,
      parentRevisionRef: priorRevision?.revisionBasis.basisRef ?? null };
    const basisDigest = hash(body);
    const result: SemanticJobRevisionEnvelope = { kind: "semantic_revision_envelope", schemaVersion: "5.0.0",
      revisionBasis: { ...body, basisDigest, basisRef: `semantic-revision://abiogenesis/${basisDigest.slice(7)}` },
      current: { ...prior, assets: preserved, worksite, evidence: null } };
    return isSemanticJobRevisionEnvelope(result) ? deepFreeze(result) : null;
  } catch { return null; }
}
export function deriveJobRevisionAsset(input: SemanticJobRevisionEnvelope, stageRef: string, raw: unknown, source: SemanticActorSource) {
  if (!isSemanticJobRevisionEnvelope(input)) return null;
  const current = deriveSemanticJobAsset(input.current, stageRef, raw, source, input.revisionBasis.retainedTerms);
  return current === null ? null : deepFreeze({ ...input, current });
}
export function deriveJobRevisionAssessment(input: SemanticJobRevisionEnvelope, stageRef: string, raw: unknown, source: SemanticActorSource) {
  if (!isSemanticJobRevisionEnvelope(input)) return null;
  const current = deriveSemanticJobAssessment(input.current, stageRef, raw, source, input.revisionBasis.retainedTerms);
  if (current === null) return null;
  // Current binding projection changes; admitted revision/old versions do not.
  return deepFreeze({ ...input, current });
}
