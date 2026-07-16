import * as v from "valibot";

import { CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES } from "../../code/src/abg/m03/contracts/catalog_operation_contracts.js";
import { GTL_CONFORMANCE_OPERATION_NATIVE_CONTRACT_SOURCES } from "../../code/src/abg/m03/contracts/gtl_conformance_operation_contracts.js";
import { RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES } from "../../code/src/abg/m03/contracts/runtime_authoring_operation_contracts.js";
import {
  EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA,
  FINAL_TAP_DELTA_SCHEMA
} from "../../code/src/qualification/m05/exact_candidate_release_operation_contracts.js";

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
