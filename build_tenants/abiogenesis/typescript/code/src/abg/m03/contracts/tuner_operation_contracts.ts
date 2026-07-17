// Private P1 owner contract for the replay-derived tuner report.

import * as v from "valibot";

import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import {
  nonEmptyTextSchema,
  refSchema,
  sha256DigestSchema,
  uniqueByNativeIdentityArray
} from "../../../shared/validation/native_contract_primitives.js";
import type { NativeNamedCheckRegistry } from "../../../shared/validation/native_named_check_registry.js";
import {
  ownerNativeDefinitionContractSource,
  ownerProjectionRelationSource,
  type OwnerProjectionRelationAction,
  type OwnerProjectionRelationResult
} from "../../../shared/validation/owner_native_operation_contract_source.js";
import { TUNER_PROPOSAL_KIND_VALUES } from "./carriers.js";

const MODULE_PATH =
  "code/src/abg/m03/contracts/tuner_operation_contracts.js" as const;
const EXPORT_NAME = "TUNER_PROJECT_READ_NATIVE_CONTRACT_SOURCES" as const;
const REGISTRY_EXPORT_NAME = "TUNER_PROJECT_READ_NATIVE_CHECK_REGISTRY" as const;
const TUNER_OWNER = freezeNativeValue({
  product: "abiogenesis",
  module: "abg.m03",
  family: "tuner"
} as const);
const SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/abg/REQ-R-ABG3-TUNER.md#REQ-R-ABG3-TUNER-002..003",
  digest:
    "sha256:8c3fb81bcdc831f7f4b1c5dc7b640e9bc9a18c64a57bb54df80c23a0ee0a5c0f"
} as const);

type TuningReportReadRefDigest = Readonly<{
  ref: string;
  digest: string;
}>;
type TuningReportReadRequest = Readonly<{
  kind: "project_read_request";
  caseKey: "tuning_report";
  source: Readonly<{
    kind: "WorkspaceBinding";
    sourceRef: string;
    sourceDigest: string;
  }>;
  projectionBasis: TuningReportReadRefDigest;
  selector: Readonly<{
    tuningTelemetryBasis: TuningReportReadRefDigest;
  }>;
}>;
type TuningReportReadDefinitionKey = Readonly<{
  operationId: "abg.operation.project.read";
  memberKind: "project_read_case";
  caseKey: "tuning_report";
}>;

function tuningReportRelationResult(
  issuePaths: readonly string[]
): OwnerProjectionRelationResult {
  const [first, ...remaining] = issuePaths;
  return first === undefined
    ? { kind: "projection_related" }
    : {
        kind: "projection_relation_mismatch",
        issuePaths: [first, ...remaining]
      };
}

const refListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.readonly()
);
const refDigestSchema = v.pipe(
  v.strictObject({ ref: refSchema, digest: sha256DigestSchema }),
  v.readonly()
);
const safeNonNegativeIntegerSchema = v.pipe(
  v.number(),
  v.integer(),
  v.minValue(0)
);

const tunerDraftStateRowSchema = v.pipe(
  v.strictObject({
    draftRef: refSchema,
    state: v.picklist(["draft", "ratified", "rejected"]),
    proposalKind: v.picklist(TUNER_PROPOSAL_KIND_VALUES),
    proposer: refSchema,
    summary: nonEmptyTextSchema,
    decidedBy: v.nullable(refSchema)
  }),
  v.readonly()
);

const tunerModeSignalRowSchema = v.pipe(
  v.strictObject({
    signalRef: refSchema,
    signalKind: v.picklist([
      "route_variance",
      "retry_density",
      "rail_break"
    ]),
    subjectRef: refSchema,
    value: v.pipe(v.number(), v.minValue(0)),
    evidenceRefs: refListSchema
  }),
  v.readonly()
);

const configurationCostRowSchema = v.pipe(
  v.strictObject({
    configurationRef: refSchema,
    invocationCount: safeNonNegativeIntegerSchema,
    totalDurationMs: safeNonNegativeIntegerSchema
  }),
  v.readonly()
);

const tunerDivergenceObligationSchema = v.pipe(
  v.strictObject({
    draftRef: refSchema,
    equivalenceContractRef: refSchema,
    divergenceEvidenceRef: refSchema,
    demotionRequired: v.literal(true),
    intakeRequired: v.literal(true)
  }),
  v.readonly()
);

const tuningReportProjectionCarrierSchema = v.strictObject({
  kind: v.literal("tuning_report_projection"),
  projection: refDigestSchema,
  workspaceBinding: refDigestSchema,
  telemetryBasis: refDigestSchema,
  draftStates: v.pipe(v.array(tunerDraftStateRowSchema), v.readonly()),
  signals: v.pipe(v.array(tunerModeSignalRowSchema), v.readonly()),
  costs: v.pipe(v.array(configurationCostRowSchema), v.readonly()),
  divergenceObligations: v.pipe(
    v.array(tunerDivergenceObligationSchema),
    v.readonly()
  ),
  evidenceRefs: refListSchema,
  provenanceRefs: refListSchema
});

const TUNING_REPORT_RELATION_ACTION = Object.freeze(
  v.check(
    (projection: v.InferOutput<
      typeof tuningReportProjectionCarrierSchema
    >) => {
      const draftRefs = projection.draftStates.map((row) => row.draftRef);
      const signalRefs = projection.signals.map((row) => row.signalRef);
      const configurationRefs = projection.costs.map(
        (row) => row.configurationRef
      );
      const divergenceDraftRefs = projection.divergenceObligations.map(
        (row) => row.draftRef
      );
      const evidenceRefs = new Set(projection.evidenceRefs);
      const draftStates = new Map(
        projection.draftStates.map((row) => [row.draftRef, row])
      );
      return (
        new Set(draftRefs).size === draftRefs.length &&
        new Set(signalRefs).size === signalRefs.length &&
        new Set(configurationRefs).size === configurationRefs.length &&
        new Set(divergenceDraftRefs).size === divergenceDraftRefs.length &&
        projection.draftStates.every(
          (row) => (row.state === "draft") === (row.decidedBy === null)
        ) &&
        projection.signals.every((row) =>
          row.evidenceRefs.every((ref) => evidenceRefs.has(ref))
        ) &&
        projection.divergenceObligations.every((row) => {
          const draft = draftStates.get(row.draftRef);
          return (
            draft?.state === "ratified" &&
            draft.proposalKind === "annealing" &&
            evidenceRefs.has(row.divergenceEvidenceRef)
          );
        })
      );
    },
    "tuning report must preserve draft state, signal, cost, and evidence truth"
  )
);
const tuningReportProjectionSchema = v.pipe(
  tuningReportProjectionCarrierSchema,
  TUNING_REPORT_RELATION_ACTION,
  v.readonly()
);

type TuningReportProjection = v.InferOutput<
  typeof tuningReportProjectionSchema
>;

const TUNING_REPORT_PROJECT_READ_RELATION: OwnerProjectionRelationAction<
  TuningReportReadDefinitionKey,
  TuningReportReadRequest,
  TuningReportProjection
> = ({ admittedRequest, candidateProjection }) => {
  const issuePaths: string[] = [];
  if (
    admittedRequest.source.sourceRef !==
      candidateProjection.workspaceBinding.ref ||
    admittedRequest.source.sourceDigest !==
      candidateProjection.workspaceBinding.digest
  ) {
    issuePaths.push("candidateProjection.workspaceBinding");
  }
  const telemetryBasis = admittedRequest.selector.tuningTelemetryBasis;
  if (
    telemetryBasis.ref !== candidateProjection.telemetryBasis.ref ||
    telemetryBasis.digest !== candidateProjection.telemetryBasis.digest
  ) {
    issuePaths.push("candidateProjection.telemetryBasis");
  }
  return tuningReportRelationResult(issuePaths);
};

export const TUNER_PROJECT_READ_NATIVE_CHECK_REGISTRY = freezeNativeValue({
  familyRef: "contract-family://abg/tuner-project-read@5",
  checks: [
    {
      checkId: "tuning-report-relation",
      action: TUNING_REPORT_RELATION_ACTION,
      relationRef: "REQ-R-ABG3-TUNER-002..003"
    }
  ]
} satisfies NativeNamedCheckRegistry);

const tuningReportResult = ownerNativeDefinitionContractSource({
  owner: TUNER_OWNER,
  definitionKey: {
    operationId: "abg.operation.project.read",
    memberKind: "project_read_case",
    caseKey: "tuning_report"
  },
  slot: "result",
  semanticOwnerBasis: SEMANTIC_OWNER_BASIS,
  modulePath: MODULE_PATH,
  exportName: EXPORT_NAME,
  memberPath: ["project_read", "tuning_report", "result"],
  namedChecks: {
    kind: "family_registry",
    exportName: REGISTRY_EXPORT_NAME,
    memberPath: []
  },
  schema: tuningReportProjectionSchema
});

export const TUNER_PROJECT_READ_NATIVE_CONTRACT_SOURCES = freezeNativeValue({
  project_read: {
    tuning_report: {
      result: tuningReportResult
    }
  }
});

export const TUNER_PROJECT_READ_RELATION_SOURCES = freezeNativeValue({
  tuning_report: ownerProjectionRelationSource({
    relationIdentity: "relation://abg/project-read/tuning-report@5",
    definitionKey: {
      operationId: "abg.operation.project.read",
      memberKind: "project_read_case",
      caseKey: "tuning_report"
    },
    semanticOwnerBasis: SEMANTIC_OWNER_BASIS,
    modulePath: MODULE_PATH,
    exportName: "TUNER_PROJECT_READ_RELATION_SOURCES",
    memberPath: ["tuning_report"],
    relation: TUNING_REPORT_PROJECT_READ_RELATION
  })
});
