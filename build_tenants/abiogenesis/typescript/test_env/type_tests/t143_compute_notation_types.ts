// Validates: T-143
// Validates: REQ-R-ABG3-FN-COMPOSITION
// Validates: REQ-L-GTL3-EVALUATOR
// Validates: REQ-R-ABG3-PAYLOAD
// Validates: REQ-R-ABG3-ASSURANCE

import type {
  GtlAdmittedStateRef,
  GtlCompositionHostBinding,
  GtlCompositionRegimeBinding,
  GtlConsequenceProjectionRef,
  GtlEvaluation,
  GtlEvaluationFindingRef
} from "../../code/src/gtl/m02/contracts/compute_notation.js";

export const fdClosureBinding: GtlCompositionRegimeBinding = {
  regime: "F_D",
  role: "close",
  order: 0,
  authority: "closure",
  inputCarrierRefs: ["carrier://input"],
  outputCarrierRefs: ["carrier://output"],
  evidenceRefs: ["evidence://fd"]
};

export const fpEvidenceBinding: GtlCompositionRegimeBinding = {
  regime: "F_P",
  role: "construct",
  order: 1,
  authority: "evidence",
  inputCarrierRefs: ["carrier://prompt"],
  outputCarrierRefs: ["carrier://finding"],
  evidenceRefs: ["evidence://fp"]
};

export const fhJudgmentBinding: GtlCompositionRegimeBinding = {
  regime: "F_H",
  role: "absentia",
  order: 2,
  authority: "judgment",
  inputCarrierRefs: ["carrier://review-subject"],
  outputCarrierRefs: ["carrier://human-judgment"],
  evidenceRefs: ["evidence://fh"]
};

export const illegalFpClosureAuthority = {
  regime: "F_P",
  role: "validate",
  order: 3,
  authority: "closure",
  inputCarrierRefs: ["carrier://input"],
  outputCarrierRefs: ["carrier://output"],
  evidenceRefs: ["evidence://fp"]
  // @ts-expect-error Non-F_D regime bindings cannot claim closure authority.
} satisfies GtlCompositionRegimeBinding;

export const illegalFhCloseRole = {
  regime: "F_H",
  role: "close",
  order: 4,
  authority: "judgment",
  inputCarrierRefs: ["carrier://input"],
  outputCarrierRefs: ["carrier://output"],
  evidenceRefs: ["evidence://fh"]
  // @ts-expect-error Non-F_D regime bindings cannot carry the close role.
} satisfies GtlCompositionRegimeBinding;

export const graphVectorHost: GtlCompositionHostBinding = {
  surfaceKind: "graph_vector",
  graphFunctionRef: "graph-function://t143",
  graphVectorRef: "graph-vector://t143",
  sourceNodeRef: "node://source",
  targetNodeRef: "node://target",
  targetSchemaRef: "schema://target",
  owningDeclarationRef: "declaration://vector"
};

export const illegalHookHost: GtlCompositionHostBinding = {
  // @ts-expect-error Hooks are declaration sources, not selected composition hosts.
  surfaceKind: "hook",
  graphFunctionRef: "graph-function://t143",
  graphVectorRef: null,
  sourceNodeRef: null,
  targetNodeRef: null,
  targetSchemaRef: null,
  owningDeclarationRef: "hook://composition"
};

export const constrainedFinding: GtlEvaluationFindingRef = {
  kind: "gtl_evaluation_finding_ref",
  findingRef: "finding://t143",
  evaluatorRef: "evaluator://t143",
  hookActionRef: "hook-action://t143",
  gainReportRef: "gain://t143",
  metricsRef: "metrics://t143",
  closeDisposition: "retry_proposed",
  residualPressureRefs: ["pressure://residual"],
  continuationRefs: ["continuation://retry"],
  evidenceRefs: ["evidence://finding"],
  authorityRefs: ["authority://edge"],
  compositionContributionRef: "composition-contribution://t143",
  compositionRef: "composition://t143",
  compositionDigest: "digest://composition",
  diagnosticRefs: ["diagnostic://residual-pressure"]
};

export const evaluation: GtlEvaluation = {
  kind: "gtl_evaluation",
  subjectRef: "subject://t143",
  candidateRef: "candidate://t143",
  evaluationRef: "evaluation://t143",
  findings: [constrainedFinding],
  diagnosticRefs: []
};

export const illegalBooleanEvaluation: GtlEvaluation = {
  kind: "gtl_evaluation",
  subjectRef: "subject://t143",
  candidateRef: "candidate://t143",
  evaluationRef: "evaluation://t143",
  findings: [],
  // @ts-expect-error Evaluation notation exposes finding refs, not closure booleans.
  satisfied: true,
  diagnosticRefs: []
};

export const admittedState: GtlAdmittedStateRef = {
  compositionRef: "composition://t143",
  compositionDigest: "digest://composition",
  compositionSelectionRef: "composition-selection://t143",
  graphCallRef: "graph-call://t143",
  frameRef: "frame://t143",
  eventRefs: ["event://admitted"],
  ledgerRefs: ["ledger://payload"],
  projectionRefs: ["projection://assurance"]
};

// @ts-expect-error Admitted state refs must preserve selected composition identity.
export const admittedStateWithoutComposition: GtlAdmittedStateRef = {
  graphCallRef: "graph-call://t143",
  frameRef: "frame://t143",
  eventRefs: ["event://admitted"],
  ledgerRefs: ["ledger://payload"],
  projectionRefs: ["projection://assurance"]
};

export const consequenceProjection: GtlConsequenceProjectionRef = {
  consequenceRef: "consequence://t143",
  compositionRef: "composition://t143",
  compositionDigest: "digest://composition",
  compositionSelectionRef: "composition-selection://t143",
  assuranceDecisionRef: "assurance-decision://t143",
  traversalTransitionRef: "traversal-transition://t143",
  domainReadModelRefs: ["read-model://sdlc"]
};

// @ts-expect-error Consequence refs must preserve selected composition identity.
export const consequenceProjectionWithoutComposition: GtlConsequenceProjectionRef = {
  consequenceRef: "consequence://t143",
  assuranceDecisionRef: "assurance-decision://t143",
  traversalTransitionRef: "traversal-transition://t143",
  domainReadModelRefs: ["read-model://sdlc"]
};
