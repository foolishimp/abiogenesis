import * as v from "valibot";

import { CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES } from "../../code/src/abg/m03/contracts/catalog_operation_contracts.js";
import { GTL_CONFORMANCE_OPERATION_NATIVE_CONTRACT_SOURCES } from "../../code/src/abg/m03/contracts/gtl_conformance_operation_contracts.js";
import { RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES } from "../../code/src/abg/m03/contracts/runtime_authoring_operation_contracts.js";
import {
  EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA,
  FINAL_TAP_DELTA_SCHEMA
} from "../../code/src/qualification/m05/exact_candidate_release_operation_contracts.js";
import {
  ownerNativeDefinitionContractSource,
  ownerNativeOperationContractSource
} from "../../code/src/shared/validation/owner_native_operation_contract_source.js";

type Equal<Left, Right> =
  (<T>() => T extends Left ? 1 : 2) extends
  (<T>() => T extends Right ? 1 : 2)
    ? true
    : false;
type Expect<Value extends true> = Value;

const projectReadResultSchema = v.strictObject({
  ticketRef: v.string(),
  disposition: v.literal("projected")
});
const projectReadResultSource = ownerNativeDefinitionContractSource({
  owner: {
    product: "abiogenesis",
    module: "app.m04",
    family: "project_read"
  },
  definitionKey: {
    operationId: "abg.operation.project.read",
    memberKind: "project_read_case",
    caseKey: "ticket_consensus"
  },
  slot: "result",
  semanticOwnerBasis: {
    ref: "requirement://abg/project-read",
    digest: `sha256:${"1".repeat(64)}`
  },
  modulePath:
    "code/src/app/m04/public_contracts/project_read_operation_contracts.js",
  exportName: "PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES",
  memberPath: ["project_read", "ticket_consensus", "result"],
  schema: projectReadResultSchema
});

type _ProjectReadMemberKind = Expect<
  Equal<
    typeof projectReadResultSource.authority.subject.memberKind,
    "project_read_case"
  >
>;
type _ProjectReadCaseKey = Expect<
  Equal<
    typeof projectReadResultSource.authority.subject.caseKey,
    "ticket_consensus"
  >
>;
type _ProjectReadSlot = Expect<
  Equal<typeof projectReadResultSource.authority.subject.slot, "result">
>;
type _ProjectReadLocatorCase = Expect<
  Equal<
    typeof projectReadResultSource.sourceLocator.memberPath[1],
    "ticket_consensus"
  >
>;
type _ProjectReadLocatorSlot = Expect<
  Equal<typeof projectReadResultSource.sourceLocator.memberPath[2], "result">
>;
type _ProjectReadLocatorSchema = Expect<
  Equal<typeof projectReadResultSource.sourceLocator.memberPath[3], "schema">
>;
type _ProjectReadSchema = Expect<
  Equal<typeof projectReadResultSource.schema, typeof projectReadResultSchema>
>;

ownerNativeDefinitionContractSource({
  owner: projectReadResultSource.authority.owner,
  definitionKey: {
    operationId: "abg.operation.project.read",
    memberKind: "project_read_case",
    caseKey: "ticket_consensus"
  },
  slot: "result",
  semanticOwnerBasis: projectReadResultSource.authority.semanticOwnerBasis,
  modulePath: projectReadResultSource.sourceLocator.modulePath,
  exportName: projectReadResultSource.sourceLocator.exportName,
  // @ts-expect-error A project-read locator cannot point at another case.
  memberPath: ["project_read", "run_status", "result"],
  schema: projectReadResultSchema
});

ownerNativeDefinitionContractSource({
  owner: projectReadResultSource.authority.owner,
  definitionKey: {
    // @ts-expect-error project.read is keyed by project_read_case, never variant.
    operationId: "abg.operation.project.read",
    memberKind: "variant",
    variant: "ticket_consensus"
  },
  slot: "result",
  semanticOwnerBasis: projectReadResultSource.authority.semanticOwnerBasis,
  modulePath: projectReadResultSource.sourceLocator.modulePath,
  exportName: projectReadResultSource.sourceLocator.exportName,
  memberPath: ["project_read", "ticket_consensus", "result"],
  schema: projectReadResultSchema
});

ownerNativeOperationContractSource({
  owner: projectReadResultSource.authority.owner,
  // @ts-expect-error The legacy variant adapter cannot encode project.read.
  operationId: "abg.operation.project.read",
  variant: "ticket_consensus",
  slot: "result",
  semanticOwnerBasis: projectReadResultSource.authority.semanticOwnerBasis,
  modulePath: projectReadResultSource.sourceLocator.modulePath,
  exportName: projectReadResultSource.sourceLocator.exportName,
  memberPath: ["project_read", "ticket_consensus", "result"],
  schema: projectReadResultSchema
});

const overlayRequestSchema =
  CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_apply.overlay.request.schema;
type OverlayRequest = v.InferOutput<typeof overlayRequestSchema>;
declare const overlayRequest: OverlayRequest;
export const overlayApplicationBasis: string = overlayRequest.applicationBasisRef;

// @ts-expect-error DefinitionKey owns the variant; the payload cannot override it.
const payloadVariant: OverlayRequest["variant"] = "node_type";
void payloadVariant;

const repriceRequestSchema =
  RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES.witness_admit.reprice
    .request.schema;
type RepriceRequest = v.InferOutput<typeof repriceRequestSchema>;
declare const repriceRequest: RepriceRequest;
export const repriceDeclarationRef: string =
  repriceRequest.payload.declarationRef;

// @ts-expect-error A run lifecycle payload cannot cross the reprice key.
const runPayloadAsReprice: RepriceRequest["payload"]["reasonKind"] =
  "operator_resume";
void runPayloadAsReprice;

const ratifyRequestSchema =
  RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES.tuning_transition.ratify
    .request.schema;
type RatifyRequest = v.InferOutput<typeof ratifyRequestSchema>;
declare const ratifyRequest: RatifyRequest;
export function policyAuthorityRef(input: RatifyRequest): string | null {
  return input.authority.kind === "policy" ? input.authority.policyRef : null;
}
void ratifyRequest;

const ratifyResultSource =
  RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES.tuning_transition.ratify
    .result;
const rejectResultSource =
  RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES.tuning_transition.reject
    .result;

type _RatifyOperationIdentity = Expect<
  Equal<
    typeof ratifyResultSource.authority.subject.operationId,
    "abg.operation.tuning.transition"
  >
>;
type _RatifyVariantIdentity = Expect<
  Equal<typeof ratifyResultSource.authority.subject.variant, "ratify">
>;
type _RatifyFamilyIdentity = Expect<
  Equal<
    typeof ratifyResultSource.authority.owner.family,
    "tuning_draft_transition"
  >
>;
type _RatifySlotIdentity = Expect<
  Equal<typeof ratifyResultSource.authority.subject.slot, "result">
>;
type _RatifyModuleIdentity = Expect<
  Equal<
    typeof ratifyResultSource.sourceLocator.modulePath,
    "code/src/abg/m03/contracts/runtime_authoring_operation_contracts.js"
  >
>;
type _RatifyExportIdentity = Expect<
  Equal<
    typeof ratifyResultSource.sourceLocator.exportName,
    "RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES"
  >
>;
type _RatifyMemberPathFamily = Expect<
  Equal<typeof ratifyResultSource.sourceLocator.memberPath[0], "tuning_transition">
>;
type _RatifyMemberPathVariant = Expect<
  Equal<typeof ratifyResultSource.sourceLocator.memberPath[1], "ratify">
>;
type _RatifyMemberPathSlot = Expect<
  Equal<typeof ratifyResultSource.sourceLocator.memberPath[2], "result">
>;
type _RatifyMemberPathSchema = Expect<
  Equal<typeof ratifyResultSource.sourceLocator.memberPath[3], "schema">
>;
type _RatifyMemberPathLength = Expect<
  Equal<typeof ratifyResultSource.sourceLocator.memberPath["length"], 4>
>;

type RatifyResult = v.InferOutput<typeof ratifyResultSource.schema>;
type RejectResult = v.InferOutput<typeof rejectResultSource.schema>;
type _RatifyDisposition = Expect<
  Equal<RatifyResult["disposition"], "ratified">
>;
type _RejectDisposition = Expect<
  Equal<RejectResult["disposition"], "rejected">
>;

declare const ratifyResult: RatifyResult;
declare const rejectResult: RejectResult;
// @ts-expect-error Ratify output cannot widen to the reject disposition.
const rejectedFromRatify: "rejected" = ratifyResult.disposition;
// @ts-expect-error Reject output cannot widen to the ratify disposition.
const ratifiedFromReject: "ratified" = rejectResult.disposition;
void rejectedFromRatify;
void ratifiedFromReject;

export type M03M05OwnerContractTypeProof =
  | _ProjectReadMemberKind
  | _ProjectReadCaseKey
  | _ProjectReadSlot
  | _ProjectReadLocatorCase
  | _ProjectReadLocatorSlot
  | _ProjectReadLocatorSchema
  | _ProjectReadSchema
  | _RatifyOperationIdentity
  | _RatifyVariantIdentity
  | _RatifyFamilyIdentity
  | _RatifySlotIdentity
  | _RatifyModuleIdentity
  | _RatifyExportIdentity
  | _RatifyMemberPathFamily
  | _RatifyMemberPathVariant
  | _RatifyMemberPathSlot
  | _RatifyMemberPathSchema
  | _RatifyMemberPathLength
  | _RatifyDisposition
  | _RejectDisposition;

const conformanceRequestSchema =
  GTL_CONFORMANCE_OPERATION_NATIVE_CONTRACT_SOURCES.conformance_evaluate
    .gtl_program.request.schema;
type ConformanceRequest = v.InferOutput<typeof conformanceRequestSchema>;
declare const conformanceRequest: ConformanceRequest;
export function firstInventoryDigest(input: ConformanceRequest): string | null {
  return input.inventoryBasis.kind === "declared_inventory"
    ? input.inventoryBasis.inventory[0]?.digest ?? null
    : null;
}
void conformanceRequest;

type ExactCandidateBasis = v.InferOutput<
  typeof EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA
>;
declare const candidateBasis: ExactCandidateBasis;
export function prospectiveFinalVersion(
  input: ExactCandidateBasis
): string | null {
  return input.subjectKind === "final_tap_candidate"
    ? input.prospectiveFinalVersion
    : null;
}
void candidateBasis;

type FinalTapDelta = v.InferOutput<typeof FINAL_TAP_DELTA_SCHEMA>;
declare const finalTapDelta: FinalTapDelta;

// @ts-expect-error FinalTapDelta carries no behavior-change authority.
const productBehaviorDigest: FinalTapDelta["productBehaviorDigest"] = "forbidden";
void productBehaviorDigest;

export const assignedFinalVersion: string = finalTapDelta.assignedFinalVersion;
