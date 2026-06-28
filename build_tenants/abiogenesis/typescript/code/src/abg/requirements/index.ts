// Implements: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-031
// Implements: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-032
// Implements: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-043

export {
  activeRequirements as queryActiveRequirements,
  buildEdgeRequirementEnvironment as compileEdgeRequirementEnvironment,
  classifyRequirementAttenuation as classifyAttenuation,
  currentEvidenceBindings as queryCurrentEvidenceBindings,
  evaluateRequirementCompleteness as queryRequirementCompleteness,
  evaluateRequirementStructuralState as queryRequirementStructuralState,
  projectAssuranceCase as projectAssuranceCase,
  projectExecutionSchedules as projectExecutionSchedules,
  projectRequirementAggregateStates as projectAggregateStates,
  projectRequirementGraph as projectRequirementGraph,
  projectMaterializationTargets as projectMaterializationTargets,
  projectRequirements as projectEdgeObligations,
  queryRequirements as queryRequirementReadModel,
  routeContextConstraint as routeContextConstraint
} from "../m03/contracts/requirements_algebra.js";

export {
  projectRequirementLifecycleState as projectLifecycleState
} from "../m03/contracts/requirements_route.js";

export type {
  AuthorityContextFragment,
  DestinationTopology,
  EdgeRequirementEnvironment,
  RequirementAssuranceClaim,
  RequirementAttenuationProjection,
  RequirementCompletenessReport,
  RequirementContextRouteProjection,
  RequirementEdgeRef,
  RequirementEvidenceBinding,
  RequirementExecutionScheduleProjection,
  RequirementFoldProjection,
  RequirementAggregateStateProjection,
  RequirementGraphPairProjection,
  RequirementGraphProjection,
  RequirementLedger,
  RequirementProjection,
  RequirementRelation,
  RequirementQueryReadModel,
  RequirementResidualProjection,
  RequirementStructuralEvaluation,
  RequirementTerm,
  TraversalSpan
} from "../m03/contracts/requirements_algebra.js";

export type {
  AdmittedRef,
  AuthorityRegime,
  RouteAccepted,
  RouteRejected,
  RouteRejectionKind,
  RouteResult,
  RuntimeScopeRef,
  ProjectRequirementLifecycleStateInput,
  RequirementLifecycleDisposition,
  RequirementLifecycleDispositionKind,
  RequirementLifecycleStateReadModel
} from "../m03/contracts/requirements_route.js";
