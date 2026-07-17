// Private P1 owner contracts for replay-derived observer reads.

import * as v from "valibot";

import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import {
  canonicalIJsonSchema,
  nonEmptyTextSchema,
  refSchema,
  sha256DigestSchema,
  uniqueByNativeIdentityArray
} from "../../../shared/validation/native_contract_primitives.js";
import type { NativeNamedCheckRegistry } from "../../../shared/validation/native_named_check_registry.js";
import { ownerNativeDefinitionContractSource } from "../../../shared/validation/owner_native_operation_contract_source.js";
import {
  GRAPH_CHANGE_CLASS_VALUES,
  GRAPH_REENTRY_POINT_VALUES
} from "./carriers.js";

const MODULE_PATH =
  "code/src/abg/m03/contracts/observer_operation_contracts.js" as const;
const EXPORT_NAME = "OBSERVER_PROJECT_READ_NATIVE_CONTRACT_SOURCES" as const;
const REGISTRY_EXPORT_NAME =
  "OBSERVER_PROJECT_READ_NATIVE_CHECK_REGISTRY" as const;
const OBSERVER_OWNER = freezeNativeValue({
  product: "abiogenesis",
  module: "abg.m03",
  family: "observer"
} as const);
const SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-036",
  digest:
    "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
} as const);

const refListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.readonly()
);
const nonEmptyRefListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.minLength(1),
  v.readonly()
);
const refDigestSchema = v.pipe(
  v.strictObject({ ref: refSchema, digest: sha256DigestSchema }),
  v.readonly()
);

const observerFindingSchema = v.pipe(
  v.strictObject({
    finding: refDigestSchema,
    findingContract: refDigestSchema,
    admittedValue: canonicalIJsonSchema,
    sourceRefs: nonEmptyRefListSchema,
    evidenceRefs: refListSchema
  }),
  v.readonly()
);
const observerReportProjectionCarrierSchema = v.strictObject({
  kind: v.literal("observer_report_projection"),
  projection: refDigestSchema,
  workspaceBinding: refDigestSchema,
  observationBasis: refDigestSchema,
  sourceRefs: nonEmptyRefListSchema,
  findings: v.pipe(v.array(observerFindingSchema), v.readonly()),
  evidenceRefs: refListSchema,
  provenanceRefs: refListSchema
});
const OBSERVER_REPORT_RELATION_ACTION = Object.freeze(
  v.check(
    (projection: v.InferOutput<
      typeof observerReportProjectionCarrierSchema
    >) => {
      const findingRefs = projection.findings.map((row) => row.finding.ref);
      const sourceRefs = new Set(projection.sourceRefs);
      const evidenceRefs = new Set(projection.evidenceRefs);
      return (
        new Set(findingRefs).size === findingRefs.length &&
        projection.findings.every(
          (row) =>
            row.sourceRefs.every((ref) => sourceRefs.has(ref)) &&
            row.evidenceRefs.every((ref) => evidenceRefs.has(ref))
        )
      );
    },
    "observer findings must preserve source and evidence lineage"
  )
);
const observerReportProjectionSchema = v.pipe(
  observerReportProjectionCarrierSchema,
  OBSERVER_REPORT_RELATION_ACTION,
  v.readonly()
);

const observerDraftSchema = v.pipe(
  v.strictObject({
    kind: v.literal("observer_ticket_draft"),
    draftRef: refSchema,
    actionKind: v.picklist([
      "ticket_draft",
      "reprice_proposal",
      "fh_input"
    ]),
    owner: nonEmptyTextSchema,
    changeClass: v.nullable(v.picklist(GRAPH_CHANGE_CLASS_VALUES)),
    reEntryPoint: v.nullable(v.picklist(GRAPH_REENTRY_POINT_VALUES)),
    summary: nonEmptyTextSchema,
    triageReason: nonEmptyTextSchema,
    evidenceRefs: refListSchema
  }),
  v.readonly()
);
const observerDraftProjectionCarrierSchema = v.strictObject({
  kind: v.literal("observer_draft_projection"),
  projection: refDigestSchema,
  workspaceBinding: refDigestSchema,
  observerObservables: refDigestSchema,
  drafts: v.pipe(v.array(observerDraftSchema), v.readonly()),
  evidenceRefs: refListSchema,
  provenanceRefs: refListSchema
});
const OBSERVER_DRAFT_RELATION_ACTION = Object.freeze(
  v.check(
    (projection: v.InferOutput<
      typeof observerDraftProjectionCarrierSchema
    >) => {
      const draftRefs = projection.drafts.map((row) => row.draftRef);
      const evidenceRefs = new Set(projection.evidenceRefs);
      return (
        new Set(draftRefs).size === draftRefs.length &&
        projection.drafts.every((row) => {
          const hasChangeClass = row.changeClass !== null;
          const hasReEntryPoint = row.reEntryPoint !== null;
          const triageCoordinatesMatchAction =
            row.actionKind === "fh_input"
              ? !hasChangeClass && !hasReEntryPoint
              : hasChangeClass && hasReEntryPoint;
          return (
            triageCoordinatesMatchAction &&
            row.evidenceRefs.every((ref) => evidenceRefs.has(ref))
          );
        })
      );
    },
    "observer drafts must preserve triage and evidence lineage"
  )
);
const observerDraftProjectionSchema = v.pipe(
  observerDraftProjectionCarrierSchema,
  OBSERVER_DRAFT_RELATION_ACTION,
  v.readonly()
);

export const OBSERVER_PROJECT_READ_NATIVE_CHECK_REGISTRY = freezeNativeValue({
  familyRef: "contract-family://abg/observer-project-read@5",
  checks: [
    {
      checkId: "report-lineage-relation",
      action: OBSERVER_REPORT_RELATION_ACTION,
      relationRef: "REQ-P-POLICY-036"
    },
    {
      checkId: "draft-lineage-relation",
      action: OBSERVER_DRAFT_RELATION_ACTION,
      relationRef: "REQ-P-POLICY-036"
    }
  ]
} satisfies NativeNamedCheckRegistry);

function observerResult<const CaseKey extends "observer_report" | "observer_drafts", const S extends v.GenericSchema>(
  caseKey: CaseKey,
  schema: S
) {
  return ownerNativeDefinitionContractSource({
    owner: OBSERVER_OWNER,
    definitionKey: {
      operationId: "abg.operation.project.read",
      memberKind: "project_read_case",
      caseKey
    },
    slot: "result",
    semanticOwnerBasis: SEMANTIC_OWNER_BASIS,
    modulePath: MODULE_PATH,
    exportName: EXPORT_NAME,
    memberPath: ["project_read", caseKey, "result"],
    namedChecks: {
      kind: "family_registry",
      exportName: REGISTRY_EXPORT_NAME,
      memberPath: []
    },
    schema
  });
}

export const OBSERVER_PROJECT_READ_NATIVE_CONTRACT_SOURCES = freezeNativeValue({
  project_read: {
    observer_report: {
      result: observerResult("observer_report", observerReportProjectionSchema)
    },
    observer_drafts: {
      result: observerResult("observer_drafts", observerDraftProjectionSchema)
    }
  }
});
