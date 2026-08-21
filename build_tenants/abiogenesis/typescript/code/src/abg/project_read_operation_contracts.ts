import * as v from "valibot";

import { capabilityRefsForDefinition } from "../shared/capability_contracts.js";

import {
  type ExactOwnerOperationPort,
  nonblankSchema,
  ownerAuthorityDigest,
  ownerContractPacket,
  ownerMetadata,
  refDigestSchema,
  refDigestSetSchema,
  refusalSchema,
  replayPageSchema,
  safeNonNegativeIntegerSchema,
  safePositiveIntegerSchema,
  TERMINAL_ONLY_ADAPTER_EXIT_MAP,
  type RuntimeContractSchema,
} from "../shared/public_function_contracts.js";

export const ABG_PROJECT_READ_CASES = Object.freeze([
  "run_status",
  "graph_call_status",
  "run_result",
  "graph_call_result",
  "run_evidence",
  "graph_call_evidence",
  "result_evidence",
  "assessment_evidence",
  "witness_evidence",
  "workspace_replay",
  "run_replay",
  "graph_call_replay",
  "interaction_replay",
  "continuation_replay",
  "c_call_replay",
  "workspace_gaps",
  "run_gaps",
  "run_lawful_actions",
] as const);

type AbgReadCase = (typeof ABG_PROJECT_READ_CASES)[number];

const noSelectorSchema = v.strictObject({ kind: v.literal("none") });
const runtimeStatusSchema = v.picklist([
  "active",
  "blocked",
  "closed",
  "failed",
  "gap_stopped",
  "held",
  "refused",
  "stopped",
  "workspace",
]);

function subjectStatusProjectionSchema(
  kind: "run_status_projection" | "graph_call_status_projection",
) {
  return v.strictObject({
    kind: v.literal(kind),
    subject: refDigestSchema,
    status: runtimeStatusSchema,
    replay: refDigestSchema,
    activeFluents: refDigestSetSchema,
  });
}

function subjectResultProjectionSchema(
  kind: "run_result_projection" | "graph_call_result_projection",
) {
  return v.strictObject({
    kind: v.literal(kind),
    subject: refDigestSchema,
    result: refDigestSchema,
    terminalRoute: refDigestSchema,
    replay: refDigestSchema,
  });
}

function subjectEvidenceProjectionSchema(kind: string) {
  return v.strictObject({
    kind: v.literal(kind),
    subject: refDigestSchema,
    evidence: refDigestSetSchema,
    eventAtoms: refDigestSetSchema,
    replay: refDigestSchema,
  });
}

function subjectReplayProjectionSchema(kind: string) {
  return v.strictObject({
    kind: v.literal(kind),
    subject: refDigestSchema,
    replay: refDigestSchema,
    fromOrdinal: safeNonNegativeIntegerSchema,
    limit: safePositiveIntegerSchema,
  });
}

function subjectGapProjectionSchema(
  kind: "workspace_gap_projection" | "run_gap_projection",
) {
  return v.strictObject({
    kind: v.literal(kind),
    subject: refDigestSchema,
    gaps: refDigestSetSchema,
    replay: refDigestSchema,
  });
}

const lawfulActionProjectionSchema = v.strictObject({
  kind: v.literal("run_lawful_action_projection"),
  run: refDigestSchema,
  actions: refDigestSetSchema,
  replay: refDigestSchema,
});

const replaySelectorSchema = replayPageSchema;
const cCallReplaySelectorSchema = v.strictObject({
  kind: v.literal("ordinal_page"),
  fromOrdinal: safeNonNegativeIntegerSchema,
  limit: safePositiveIntegerSchema,
  cCall: refDigestSchema,
});

function readRefusal(replay: boolean) {
  const common = [
    "unknown_source",
    "source_kind_mismatch",
    "source_digest_mismatch",
    "projection_basis_mismatch",
    "projection_unsupported",
    "not_found",
    "not_ready",
  ] as const;
  return replay
    ? refusalSchema([...common, "cursor_invalid", "range_invalid"])
    : refusalSchema([...common]);
}

function abgReadContract<
  const TCase extends AbgReadCase,
  const TSourceKind extends string,
  const TSelector extends v.GenericSchema,
  const TProjection extends v.GenericSchema,
>(input: Readonly<{
  caseKey: TCase;
  sourceKind: TSourceKind;
  selector: TSelector;
  projection: TProjection;
  abstractModule: string;
  replay?: boolean;
}>) {
  const authorityRef =
    `authority://abiogenesis/project-read/${input.caseKey}@5`;
  return ownerContractPacket(
    {
      operationId: "abg.operation.project.read",
      memberKey: input.caseKey,
    } as const,
    v.strictObject({
      caseKey: v.literal(input.caseKey),
      source: v.strictObject({
        sourceKind: v.literal(input.sourceKind),
        sourceRef: nonblankSchema,
        sourceDigest: refDigestSchema.entries.digest,
      }),
      projectionBasis: v.strictObject({
        projectionBasisRef: nonblankSchema,
        projectionBasisDigest: refDigestSchema.entries.digest,
      }),
      selector: input.selector,
    }),
    v.strictObject({
      caseKey: v.literal(input.caseKey),
      source: refDigestSchema,
      projectionBasis: refDigestSchema,
      projection: input.projection,
    }),
    readRefusal(input.replay === true),
    null,
    {
      abstractModule: input.abstractModule,
      exportName: "ABG_PROJECT_READ_CONTRACTS",
      memberPath: [input.caseKey],
      authorityRef,
      authorityDigest: ownerAuthorityDigest(authorityRef),
    },
    ownerMetadata({
      authorityClass: "read",
      effectClass: "event_calculus_projection",
      eventAdmission: "none",
      actorRequirement: "forbidden",
      workspaceBindingRequirement: "exactly_one",
      authoritySlotRequirements: [
        "capability_grants",
        "workspace_binding",
        "product_set",
        "dependency_lock",
      ],
      capabilityRefs: capabilityRefsForDefinition({
        operationId: "abg.operation.project.read",
        memberKey: input.caseKey,
      }),
      defaults: {},
      closedDomains: {
        caseKey: [input.caseKey],
        sourceKind: [input.sourceKind],
      },
      sdkCoordinate: `sdk.project.read.${input.caseKey}`,
      cliCoordinate: `project read ${input.caseKey}`,
      adapterExitMap: TERMINAL_ONLY_ADAPTER_EXIT_MAP,
    }),
  );
}

const runStatus = abgReadContract({
  caseKey: "run_status",
  sourceKind: "run",
  selector: noSelectorSchema,
  projection: subjectStatusProjectionSchema("run_status_projection"),
  abstractModule: "ABG.RunProjection",
});
const graphCallStatus = abgReadContract({
  caseKey: "graph_call_status",
  sourceKind: "graph_call",
  selector: noSelectorSchema,
  projection: subjectStatusProjectionSchema("graph_call_status_projection"),
  abstractModule: "ABG.GraphCallProjection",
});
const runResult = abgReadContract({
  caseKey: "run_result",
  sourceKind: "run",
  selector: noSelectorSchema,
  projection: subjectResultProjectionSchema("run_result_projection"),
  abstractModule: "ABG.RunProjection",
});
const graphCallResult = abgReadContract({
  caseKey: "graph_call_result",
  sourceKind: "graph_call",
  selector: noSelectorSchema,
  projection: subjectResultProjectionSchema("graph_call_result_projection"),
  abstractModule: "ABG.GraphCallProjection",
});

const runEvidence = abgReadContract({
  caseKey: "run_evidence",
  sourceKind: "run",
  selector: noSelectorSchema,
  projection: subjectEvidenceProjectionSchema("run_evidence_projection"),
  abstractModule: "ABG.RunProjection",
});
const graphCallEvidence = abgReadContract({
  caseKey: "graph_call_evidence",
  sourceKind: "graph_call",
  selector: noSelectorSchema,
  projection: subjectEvidenceProjectionSchema("graph_call_evidence_projection"),
  abstractModule: "ABG.GraphCallProjection",
});
const resultEvidence = abgReadContract({
  caseKey: "result_evidence",
  sourceKind: "runtime_result",
  selector: noSelectorSchema,
  projection: subjectEvidenceProjectionSchema("result_evidence_projection"),
  abstractModule: "ABG.ResultProjection",
});
const assessmentEvidence = abgReadContract({
  caseKey: "assessment_evidence",
  sourceKind: "result_assessment",
  selector: noSelectorSchema,
  projection: subjectEvidenceProjectionSchema("assessment_evidence_projection"),
  abstractModule: "ABG.AssessmentProjection",
});
const witnessEvidence = abgReadContract({
  caseKey: "witness_evidence",
  sourceKind: "witnessed_act",
  selector: noSelectorSchema,
  projection: subjectEvidenceProjectionSchema("witness_evidence_projection"),
  abstractModule: "ABG.WitnessProjection",
});

const workspaceReplay = abgReadContract({
  caseKey: "workspace_replay",
  sourceKind: "workspace_binding",
  selector: replaySelectorSchema,
  projection: subjectReplayProjectionSchema("workspace_replay_projection"),
  abstractModule: "ABG.WorkspaceProjection",
  replay: true,
});
const runReplay = abgReadContract({
  caseKey: "run_replay",
  sourceKind: "run",
  selector: replaySelectorSchema,
  projection: subjectReplayProjectionSchema("run_replay_projection"),
  abstractModule: "ABG.RunProjection",
  replay: true,
});
const graphCallReplay = abgReadContract({
  caseKey: "graph_call_replay",
  sourceKind: "graph_call",
  selector: replaySelectorSchema,
  projection: subjectReplayProjectionSchema("graph_call_replay_projection"),
  abstractModule: "ABG.GraphCallProjection",
  replay: true,
});
const interactionReplay = abgReadContract({
  caseKey: "interaction_replay",
  sourceKind: "fh_interaction",
  selector: replaySelectorSchema,
  projection: subjectReplayProjectionSchema("interaction_replay_projection"),
  abstractModule: "ABG.InteractionProjection",
  replay: true,
});
const continuationReplay = abgReadContract({
  caseKey: "continuation_replay",
  sourceKind: "continuation",
  selector: replaySelectorSchema,
  projection: subjectReplayProjectionSchema("continuation_replay_projection"),
  abstractModule: "ABG.ContinuationProjection",
  replay: true,
});
const cCallReplay = abgReadContract({
  caseKey: "c_call_replay",
  sourceKind: "c_program_atom_receipt",
  selector: cCallReplaySelectorSchema,
  projection: subjectReplayProjectionSchema("c_call_replay_projection"),
  abstractModule: "ABG.CCallProjection",
  replay: true,
});

const workspaceGaps = abgReadContract({
  caseKey: "workspace_gaps",
  sourceKind: "workspace_binding",
  selector: v.strictObject({
    kind: v.literal("workspace_gap_basis"),
    gapBasis: refDigestSchema,
  }),
  projection: subjectGapProjectionSchema("workspace_gap_projection"),
  abstractModule: "ABG.WorkspaceProjection",
});
const runGaps = abgReadContract({
  caseKey: "run_gaps",
  sourceKind: "run",
  selector: noSelectorSchema,
  projection: subjectGapProjectionSchema("run_gap_projection"),
  abstractModule: "ABG.RunProjection",
});
const runLawfulActions = abgReadContract({
  caseKey: "run_lawful_actions",
  sourceKind: "run",
  selector: v.strictObject({
    kind: v.literal("next_action"),
    projection: refDigestSchema,
  }),
  projection: lawfulActionProjectionSchema,
  abstractModule: "ABG.RunProjection",
});

export const ABG_PROJECT_READ_CONTRACTS = Object.freeze({
  run_status: runStatus,
  graph_call_status: graphCallStatus,
  run_result: runResult,
  graph_call_result: graphCallResult,
  run_evidence: runEvidence,
  graph_call_evidence: graphCallEvidence,
  result_evidence: resultEvidence,
  assessment_evidence: assessmentEvidence,
  witness_evidence: witnessEvidence,
  workspace_replay: workspaceReplay,
  run_replay: runReplay,
  graph_call_replay: graphCallReplay,
  interaction_replay: interactionReplay,
  continuation_replay: continuationReplay,
  c_call_replay: cCallReplay,
  workspace_gaps: workspaceGaps,
  run_gaps: runGaps,
  run_lawful_actions: runLawfulActions,
});

export interface RunProjectionPort {
  readonly run_status: ExactOwnerOperationPort<typeof runStatus>;
  readonly run_result: ExactOwnerOperationPort<typeof runResult>;
  readonly run_evidence: ExactOwnerOperationPort<typeof runEvidence>;
  readonly run_replay: ExactOwnerOperationPort<typeof runReplay>;
  readonly run_gaps: ExactOwnerOperationPort<typeof runGaps>;
  readonly run_lawful_actions: ExactOwnerOperationPort<typeof runLawfulActions>;
}
export interface GraphCallProjectionPort {
  readonly graph_call_status: ExactOwnerOperationPort<typeof graphCallStatus>;
  readonly graph_call_result: ExactOwnerOperationPort<typeof graphCallResult>;
  readonly graph_call_evidence: ExactOwnerOperationPort<typeof graphCallEvidence>;
  readonly graph_call_replay: ExactOwnerOperationPort<typeof graphCallReplay>;
}
export interface ResultProjectionPort {
  readonly evidence: ExactOwnerOperationPort<typeof resultEvidence>;
}
export interface AssessmentProjectionPort {
  readonly evidence: ExactOwnerOperationPort<typeof assessmentEvidence>;
}
export interface WitnessProjectionPort {
  readonly evidence: ExactOwnerOperationPort<typeof witnessEvidence>;
}
export interface WorkspaceProjectionPort {
  readonly workspace_replay: ExactOwnerOperationPort<typeof workspaceReplay>;
  readonly workspace_gaps: ExactOwnerOperationPort<typeof workspaceGaps>;
}
export interface InteractionProjectionPort {
  readonly replay: ExactOwnerOperationPort<typeof interactionReplay>;
}
export interface ContinuationProjectionPort {
  readonly replay: ExactOwnerOperationPort<typeof continuationReplay>;
}
export interface CCallProjectionPort {
  readonly replay: ExactOwnerOperationPort<typeof cCallReplay>;
}
