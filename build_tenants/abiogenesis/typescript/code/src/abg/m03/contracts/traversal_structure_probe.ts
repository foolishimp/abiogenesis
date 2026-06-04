// Implements: REQ-R-ABG3-INTERPRET
// Implements: REQ-R-ABG3-EVENTS
// Implements: REQ-R-ABG3-PROJECTION

import type {
  AdvancementTransition,
  ExecutionBasis,
  IterationAdvanceDecision,
  RuntimeAggregateProjection,
  RuntimeEvent
} from "./carriers.js";
import { runtimeEventsForTransition } from "./event_factories.js";
import {
  deriveAdvancementTransition,
  deriveIterationAdvanceDecision,
  runtimeEventsForIterationDecision
} from "./iteration_state_action.js";
import { deriveRuntimeAggregateProjection, sourceProjectionRef } from "./projection.js";
import type { Evaluator, GraphVector, Node, Operator, Rule } from "../../../gtl/m01/contracts/carriers.js";

export type TraversalStructureKind =
  | "terminal"
  | "undefined_structural_morphism"
  | "typed_structural_morphism"
  | "defined_constructive_morphism";

interface TraversalNodeProbe {
  readonly id: string;
  readonly name: string;
  readonly schemaKind: string;
  readonly schemaRef: string;
  readonly assetKind: string;
  readonly requiredContexts: readonly string[];
  readonly standardsRefs: readonly string[];
  readonly outputContractRefs: readonly string[];
  readonly tags: readonly string[];
}

interface TraversalOperatorProbe {
  readonly name: string;
  readonly regime: string;
  readonly binding: string;
  readonly tags: readonly string[];
}

interface TraversalEvaluatorProbe {
  readonly name: string;
  readonly regime: string;
  readonly binding: string;
  readonly description: string;
  readonly tags: readonly string[];
}

interface TraversalRuleProbe {
  readonly name: string;
  readonly kind: string;
  readonly tags: readonly string[];
}

interface RuntimeIdentityProbe {
  readonly workerId: string;
  readonly backendId: string;
  readonly buildId: string;
  readonly resolvedRuntimeRef: string;
}

interface CurrentVectorEvidenceProbe {
  readonly vectorIndex: number;
  readonly vectorId: string;
  readonly edge: string;
  readonly sourceNodeIds: readonly string[];
  readonly targetNodeId: string;
}

interface DiagnosticAuthorityProbe {
  readonly kind: "diagnostic_projection";
  readonly emitsEvents: false;
  readonly choosesNextWork: false;
  readonly sourceAuthorities: readonly string[];
}

export interface TraversalStructureProbe {
  readonly kind: "traversal_structure_probe";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphFunctionName: string;
  readonly materializedGraphId: string;
  readonly materializedGraphName: string;
  readonly jobId: string;
  readonly jobName: string;
  readonly graphCallId: string | null;
  readonly frameId: string | null;
  readonly frameLineageId: string | null;
  readonly runtimeIdentity: RuntimeIdentityProbe;
  readonly sourceProjectionRef: string;
  readonly vectorCount: number;
  readonly currentVectorIndex: number | null;
  readonly currentVectorEvidence: CurrentVectorEvidenceProbe | null;
  readonly edge: string | null;
  readonly structureKind: TraversalStructureKind;
  readonly sourceNodes: readonly TraversalNodeProbe[];
  readonly targetNode: TraversalNodeProbe | null;
  readonly operators: readonly TraversalOperatorProbe[];
  readonly evaluators: readonly TraversalEvaluatorProbe[];
  readonly rule: TraversalRuleProbe | null;
  readonly declaredOperatorRegimes: readonly string[];
  readonly declaredEvaluatorRegimes: readonly string[];
  readonly hasTypedInterface: boolean;
  readonly hasDeclaredComputeCarriers: boolean;
  readonly policyRegime: ExecutionBasis["resolvedPolicy"]["defaultRegime"];
  readonly transitionKind: AdvancementTransition["kind"];
  readonly iterationDecisionKind: IterationAdvanceDecision["kind"];
  readonly iterationEventKinds: readonly RuntimeEvent["kind"][];
  readonly transitionEventKinds: readonly RuntimeEvent["kind"][];
  readonly projection: RuntimeAggregateProjection;
  readonly diagnosticAuthority: DiagnosticAuthorityProbe;
  readonly allowedClaims: readonly string[];
  readonly notAllowedClaims: readonly string[];
}

function freezeStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function freezeEventKinds(
  values: readonly RuntimeEvent["kind"][]
): readonly RuntimeEvent["kind"][] {
  return Object.freeze([...values]);
}

function runtimeIdentityProbe(
  basis: ExecutionBasis
): RuntimeIdentityProbe {
  return Object.freeze({
    workerId: basis.runtimeIdentity.workerId,
    backendId: basis.runtimeIdentity.backendId,
    buildId: basis.runtimeIdentity.buildId,
    resolvedRuntimeRef: basis.runtimeIdentity.resolvedRuntimeRef
  });
}

function currentVectorEvidenceProbe(
  vector: GraphVector | null,
  vectorIndex: number | null
): CurrentVectorEvidenceProbe | null {
  if (vector === null || vectorIndex === null) {
    return null;
  }
  return Object.freeze({
    vectorIndex,
    vectorId: vector.id,
    edge: vector.name,
    sourceNodeIds: freezeStrings(vector.source.map((node) => node.id)),
    targetNodeId: vector.target.id
  });
}

function diagnosticAuthorityProbe(): DiagnosticAuthorityProbe {
  return Object.freeze({
    kind: "diagnostic_projection",
    emitsEvents: false,
    choosesNextWork: false,
    sourceAuthorities: freezeStrings([
      "ExecutionBasis",
      "RuntimeAggregateProjection",
      "IterationAdvanceDecision",
      "AdvancementTransition"
    ])
  });
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort());
}

function nodeProbe(node: Node): TraversalNodeProbe {
  return Object.freeze({
    id: node.id,
    name: node.name,
    schemaKind: node.schema.kind,
    schemaRef: "ref" in node.schema ? node.schema.ref : "",
    assetKind: node.assetSurface.kind,
    requiredContexts: freezeStrings(node.assetSurface.requiredContexts),
    standardsRefs: freezeStrings(node.assetSurface.standardsRefs),
    outputContractRefs: freezeStrings(node.assetSurface.outputContractRefs),
    tags: freezeStrings(node.tags)
  });
}

function operatorProbe(operator: Operator): TraversalOperatorProbe {
  return Object.freeze({
    name: operator.name,
    regime: operator.regime,
    binding: operator.binding,
    tags: freezeStrings(operator.tags)
  });
}

function evaluatorProbe(evaluator: Evaluator): TraversalEvaluatorProbe {
  return Object.freeze({
    name: evaluator.name,
    regime: evaluator.regime,
    binding: evaluator.binding,
    description: evaluator.description,
    tags: freezeStrings(evaluator.tags)
  });
}

function ruleProbe(rule: Rule): TraversalRuleProbe {
  return Object.freeze({
    name: rule.name,
    kind: rule.kind,
    tags: freezeStrings(rule.tags)
  });
}

function hasTypedNode(node: Node): boolean {
  return node.schema.ref.length > 0 || node.assetSurface.kind.length > 0;
}

function hasTypedInterface(vector: GraphVector | null): boolean {
  if (vector === null) {
    return false;
  }
  return [...vector.source, vector.target].every(hasTypedNode);
}

function hasDeclaredComputeCarriers(vector: GraphVector | null): boolean {
  if (vector === null) {
    return false;
  }
  return (
    vector.operators.length > 0 ||
    vector.evaluators.length > 0 ||
    vector.rule !== null
  );
}

function classifyTraversalStructure(input: {
  readonly vector: GraphVector | null;
  readonly typedInterface: boolean;
  readonly declaredComputeCarriers: boolean;
}): TraversalStructureKind {
  if (input.vector === null) {
    return "terminal";
  }
  if (input.declaredComputeCarriers) {
    return "defined_constructive_morphism";
  }
  if (input.typedInterface) {
    return "typed_structural_morphism";
  }
  return "undefined_structural_morphism";
}

function allowedClaims(input: {
  readonly vector: GraphVector | null;
  readonly typedInterface: boolean;
  readonly declaredComputeCarriers: boolean;
  readonly transition: AdvancementTransition;
}): readonly string[] {
  const claims = [
    "graph_function_visible",
    "job_binding_visible",
    "runtime_policy_visible",
    "projection_replay_visible"
  ];

  if (input.vector !== null) {
    claims.push("edge_shape_visible", "traversal_planning_visible");
  }
  if (input.typedInterface) {
    claims.push("typed_interface_visible");
  }
  if (input.vector !== null && input.vector.operators.length > 0) {
    claims.push("operator_surface_visible");
  }
  if (input.vector !== null && input.vector.evaluators.length > 0) {
    claims.push("evaluator_surface_visible");
  }
  if (input.vector !== null && input.vector.rule !== null) {
    claims.push("rule_surface_visible");
  }
  if (input.declaredComputeCarriers) {
    claims.push("declared_compute_surface_visible");
  }

  switch (input.transition.kind) {
    case "fd_advance":
      claims.push("deterministic_advance_ready");
      break;
    case "fp_dispatch":
      claims.push("probabilistic_dispatch_required");
      break;
    case "fh_escalation":
      claims.push("human_escalation_required");
      break;
    case "terminal":
      claims.push("terminal_state_visible");
      break;
    default: {
      const exhaustive: never = input.transition;
      throw new TypeError(`Unsupported traversal transition ${JSON.stringify(exhaustive)}`);
    }
  }

  return freezeStrings(claims);
}

function notAllowedClaims(input: {
  readonly vector: GraphVector | null;
  readonly typedInterface: boolean;
  readonly declaredComputeCarriers: boolean;
}): readonly string[] {
  const claims = [
    "identity_not_implied",
    "domain_completion_not_implied",
    "runtime_regime_fallback_not_implied"
  ];

  if (input.vector !== null && input.vector.operators.length === 0) {
    claims.push("domain_transform_not_implied");
  }
  if (input.vector !== null && input.vector.evaluators.length === 0) {
    claims.push("domain_evaluation_not_implied");
    claims.push("domain_acceptance_not_implied");
  }
  if (!input.typedInterface) {
    claims.push("typed_interface_not_implied");
  }
  if (!input.declaredComputeCarriers) {
    claims.push("declared_compute_not_implied");
  }

  return freezeStrings(claims);
}

export function deriveTraversalStructureProbe(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[] = Object.freeze([])
): TraversalStructureProbe {
  const projection = deriveRuntimeAggregateProjection(basis, events);
  const decision = deriveIterationAdvanceDecision(basis, projection);
  const transition = deriveAdvancementTransition(basis, events);
  const vector =
    projection.nextVectorIndex === null
      ? null
      : basis.graph.vectors[projection.nextVectorIndex] ?? null;
  const typedInterface = hasTypedInterface(vector);
  const declaredComputeCarriers = hasDeclaredComputeCarriers(vector);

  return Object.freeze({
    kind: "traversal_structure_probe",
    basisId: basis.id,
    graphFunctionId: basis.graphFunction.id,
    graphFunctionName: basis.graphFunction.name,
    materializedGraphId: basis.graph.id,
    materializedGraphName: basis.graph.name,
    jobId: basis.job.id,
    jobName: basis.job.name,
    graphCallId: projection.graphCallId,
    frameId: projection.frameId,
    frameLineageId: projection.frame.frameLineageId,
    runtimeIdentity: runtimeIdentityProbe(basis),
    sourceProjectionRef: sourceProjectionRef(projection),
    vectorCount: basis.graph.vectors.length,
    currentVectorIndex: projection.nextVectorIndex,
    currentVectorEvidence: currentVectorEvidenceProbe(
      vector,
      projection.nextVectorIndex
    ),
    edge: vector === null ? null : vector.name,
    structureKind: classifyTraversalStructure({
      vector,
      typedInterface,
      declaredComputeCarriers
    }),
    sourceNodes: Object.freeze(vector === null ? [] : vector.source.map(nodeProbe)),
    targetNode: vector === null ? null : nodeProbe(vector.target),
    operators: Object.freeze(vector === null ? [] : vector.operators.map(operatorProbe)),
    evaluators: Object.freeze(vector === null ? [] : vector.evaluators.map(evaluatorProbe)),
    rule: vector === null || vector.rule === null ? null : ruleProbe(vector.rule),
    declaredOperatorRegimes: uniqueSorted(
      vector === null ? [] : vector.operators.map((operator) => operator.regime)
    ),
    declaredEvaluatorRegimes: uniqueSorted(
      vector === null ? [] : vector.evaluators.map((evaluator) => evaluator.regime)
    ),
    hasTypedInterface: typedInterface,
    hasDeclaredComputeCarriers: declaredComputeCarriers,
    policyRegime: basis.resolvedPolicy.defaultRegime,
    transitionKind: transition.kind,
    iterationDecisionKind: decision.kind,
    iterationEventKinds: freezeEventKinds(
      runtimeEventsForIterationDecision(decision).map((event) => event.kind)
    ),
    transitionEventKinds: freezeEventKinds(
      runtimeEventsForTransition(basis, transition).map((event) => event.kind)
    ),
    projection,
    diagnosticAuthority: diagnosticAuthorityProbe(),
    allowedClaims: allowedClaims({
      vector,
      typedInterface,
      declaredComputeCarriers,
      transition
    }),
    notAllowedClaims: notAllowedClaims({
      vector,
      typedInterface,
      declaredComputeCarriers
    })
  });
}
