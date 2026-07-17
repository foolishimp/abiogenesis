// Owner-native project.read result contracts for admitted gap truth. These
// schemas render gaps only; they do not evaluate, select, or execute actions.

import * as v from "valibot";

import {
  capabilityIdSchema,
  nonEmptyTextSchema,
  refSchema,
  sha256DigestSchema,
  uniqueByNativeIdentityArray
} from "../../../shared/validation/native_contract_primitives.js";
import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import type { NativeNamedCheckRegistry } from "../../../shared/validation/native_named_check_registry.js";
import { ownerNativeDefinitionContractSource } from "../../../shared/validation/owner_native_operation_contract_source.js";

const MODULE_PATH = "code/src/app/m04/gaps/operation_contracts.js";
const EXPORT_NAME = "GAPS_PROJECT_READ_NATIVE_CONTRACT_SOURCES";
const GAPS_SEMANTIC_OWNER = freezeNativeValue({
  product: "abiogenesis",
  module: "app.m04",
  family: "gaps"
} as const);
const GAPS_SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-029",
  digest:
    "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
} as const);
const GAPS_NAMED_CHECKS = freezeNativeValue({
  kind: "family_registry" as const,
  exportName: "GAPS_PROJECT_READ_NATIVE_CHECK_REGISTRY",
  memberPath: [] as const
});

const refDigestSchema = v.pipe(
  v.strictObject({ ref: refSchema, digest: sha256DigestSchema }),
  v.readonly()
);
const refListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.readonly()
);
const nonEmptyReasonListSchema = v.pipe(
  uniqueByNativeIdentityArray(nonEmptyTextSchema),
  v.minLength(1),
  v.readonly()
);
const capabilityListSchema = v.pipe(
  uniqueByNativeIdentityArray(capabilityIdSchema),
  v.readonly()
);
const optionalCoordinateSchema = v.union([
  v.pipe(
    v.strictObject({ kind: v.literal("absent") }),
    v.readonly()
  ),
  v.pipe(
    v.strictObject({
      kind: v.literal("present"),
      value: refDigestSchema
    }),
    v.readonly()
  )
]);

function gapSubjectSchema<
  const Kind extends "WorkspaceBinding" | "Run"
>(kind: Kind) {
  return v.pipe(
    v.strictObject({
      kind: v.literal(kind),
      ref: refSchema,
      digest: sha256DigestSchema
    }),
    v.readonly()
  );
}

const gapRowSchema = v.pipe(
  v.strictObject({
    gap: refDigestSchema,
    disposition: v.picklist([
      "stop",
      "hold",
      "gap",
      "missing_capability",
      "unresolved_observation",
      "pending_human_interaction"
    ]),
    implicatedAsset: optionalCoordinateSchema,
    graphFunction: optionalCoordinateSchema,
    reasons: nonEmptyReasonListSchema,
    requiredCapabilityRefs: capabilityListSchema,
    interaction: optionalCoordinateSchema,
    evidenceRefs: refListSchema,
    replay: refDigestSchema
  }),
  v.readonly()
);

const GAP_INTERACTION_RELATION_ACTION = Object.freeze(
  v.check(
    (rows: v.InferOutput<typeof gapRowSchema>[]) =>
      new Set(rows.map((row) => row.gap.ref)).size === rows.length &&
      rows.every(
        (row) =>
          (row.disposition === "pending_human_interaction") ===
          (row.interaction.kind === "present")
      ),
    "only a pending-human-interaction gap carries an interaction"
  )
);
const gapRowsSchema = v.pipe(
  v.array(gapRowSchema),
  GAP_INTERACTION_RELATION_ACTION,
  v.readonly()
);

function gapProjectionSchema<
  const SubjectKind extends "WorkspaceBinding" | "Run"
>(subjectKind: SubjectKind) {
  const carrier = v.strictObject({
    kind: v.literal("gap_projection"),
    projection: refDigestSchema,
    subject: gapSubjectSchema(subjectKind),
    replayBasis: refDigestSchema,
    rows: gapRowsSchema
  });
  return v.pipe(carrier, v.readonly());
}

const workspaceGapsProjectionSchema = gapProjectionSchema("WorkspaceBinding");
const runGapsProjectionSchema = gapProjectionSchema("Run");

export const GAPS_PROJECT_READ_NATIVE_CHECK_REGISTRY = freezeNativeValue({
  familyRef: "contract-family://abg/project-read/gaps@5",
  checks: [
    {
      checkId: "gap-interaction-relation",
      action: GAP_INTERACTION_RELATION_ACTION,
      relationRef: "REQ-P-POLICY-029"
    }
  ]
} satisfies NativeNamedCheckRegistry);

function gapProjectReadResult<
  const CaseKey extends "workspace_gaps" | "run_gaps",
  const S extends v.GenericSchema
>(caseKey: CaseKey, schema: S) {
  return ownerNativeDefinitionContractSource({
    owner: GAPS_SEMANTIC_OWNER,
    definitionKey: {
      operationId: "abg.operation.project.read",
      memberKind: "project_read_case",
      caseKey
    },
    slot: "result",
    semanticOwnerBasis: GAPS_SEMANTIC_OWNER_BASIS,
    modulePath: MODULE_PATH,
    exportName: EXPORT_NAME,
    memberPath: ["project_read", caseKey, "result"] as const,
    namedChecks: GAPS_NAMED_CHECKS,
    schema
  });
}

export const GAPS_PROJECT_READ_NATIVE_CONTRACT_SOURCES = freezeNativeValue({
  project_read: {
    workspace_gaps: {
      result: gapProjectReadResult(
        "workspace_gaps",
        workspaceGapsProjectionSchema
      )
    },
    run_gaps: {
      result: gapProjectReadResult("run_gaps", runGapsProjectionSchema)
    }
  }
});
