import * as v from "valibot";

import {
  type ExactOwnerOperationPort,
  nonemptyRefDigestSetSchema,
  nonblankSchema,
  ownerAuthorityDigest,
  ownerContractPacket,
  ownerMetadata,
  refDigestSchema,
  refDigestSetSchema,
  refusalSchema,
  TERMINAL_ONLY_ADAPTER_EXIT_MAP,
  uniqueArray,
} from "../shared/public_function_contracts.js";
import { STATIC_DIAGNOSTIC_CODE_VALUES } from "./validation.js";

const CONFORMANCE_AUTHORITY =
  "authority://abiogenesis/validator/conformance@5";

const stableDiagnosticSchema = v.strictObject({
  code: v.picklist(STATIC_DIAGNOSTIC_CODE_VALUES),
  path: nonblankSchema,
  message: nonblankSchema,
});

const gtlProgram = ownerContractPacket(
  {
    operationId: "abg.operation.conformance.evaluate",
    memberKey: "gtl_program",
  } as const,
  v.strictObject({
    program: refDigestSchema,
    conformanceLaw: refDigestSchema,
    inventoryBasis: v.union([
      v.strictObject({ kind: v.literal("program_only") }),
      v.strictObject({
        kind: v.literal("declared_inventory"),
        inventory: nonemptyRefDigestSetSchema,
      }),
    ]),
  }),
  v.strictObject({
    program: refDigestSchema,
    inventory: v.nullable(refDigestSchema),
    assessment: refDigestSchema,
    disposition: v.picklist(["passed", "failed"]),
    diagnostics: uniqueArray(stableDiagnosticSchema),
    violatedAuthorities: refDigestSetSchema,
    evidence: nonemptyRefDigestSetSchema,
    repairAffordances: v.tuple([]),
  }),
  refusalSchema([
    "invalid_program",
    "law_mismatch",
    "inventory_mismatch",
    "assessment_blocked",
  ]),
  null,
  {
    abstractModule: "Validator.Conformance",
    exportName: "CONFORMANCE_OPERATION_CONTRACTS",
    memberPath: ["evaluate", "gtl_program"],
    port: "ConformancePort.evaluateGtlProgram",
    authorityRef: CONFORMANCE_AUTHORITY,
    authorityDigest: ownerAuthorityDigest(CONFORMANCE_AUTHORITY),
  },
  ownerMetadata({
    authorityClass: "attestation",
    effectClass: "deterministic_assessment",
    eventAdmission: "none",
    actorRequirement: "required",
    workspaceBindingRequirement: "exactly_one",
    authoritySlotRequirements: [
      "capability_grants",
      "workspace_binding",
      "product_set",
      "dependency_lock",
      "actor",
    ],
    capabilityRefs: ["abg.capability.gtl.typecheck@5"],
    defaults: {},
    closedDomains: {
      inventoryBasisKind: ["program_only", "declared_inventory"],
      disposition: ["passed", "failed"],
    },
    sdkCoordinate: "sdk.conformance.evaluate",
    cliCoordinate: "conformance evaluate gtl-program",
    adapterExitMap: TERMINAL_ONLY_ADAPTER_EXIT_MAP,
  }),
);

export const CONFORMANCE_OPERATION_CONTRACTS = Object.freeze({
  evaluate: Object.freeze({ gtl_program: gtlProgram }),
});

export interface ConformancePort {
  readonly evaluateGtlProgram: ExactOwnerOperationPort<typeof gtlProgram>;
}
