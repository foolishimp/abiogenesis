// Implements: REQ-P-CONSENSUS-001/-002/-009.
// The exported value is authored GTL data. It does not execute Consensus.

import {
  C,
  cGraphFunctionRef,
  cInterfaceCarrier,
  cInterfaceContractRef,
  cProgramCatalogDeclarationEntry,
  constructEnvRef,
  constructGraph,
  constructGraphFunction,
  constructGraphVector,
  constructNode,
  constructTemplateRef,
  declareCProgram,
  fan_in,
  fan_out,
  graphFunctionDeclarations,
  graphVectorDeclarations,
  hogProgramRefDeclarationEntry,
  hofContract,
  hofUnaryRef,
  hofVector,
  materializeGraphFunction,
  recurse,
  workflow,
  type AdmittedCProgramDeclarationNode,
  type Evaluator,
  type GraphFunction,
  type GraphVector,
  type Node,
  type Operator,
  type Rule
} from "../../../gtl/m01/index.js";
import {
  admitModule,
  constructModule,
  serializeModule,
  type Module
} from "../../../gtl/m02/index.js";
import {
  constructAbgFnCompositionDeclarations,
  RETRYABLE_RUNTIME_FAILURE_CLASSES,
  type ReviewRulingKind
} from "./index.js";

export const ABG_CONSENSUS_MODULE_REF = "gtl://module/abg/consensus";
export const ABG_CONSENSUS_GRAPH_FUNCTION_REF =
  "graph-function://abg/consensus/submitter-reviewer-rounds";
const ABG_CONSENSUS_REVIEW_ONE_GRAPH_FUNCTION_REF =
  "graph-function://abg/consensus/review-one-profile";
const ABG_CONSENSUS_EXACT_FACTS_GRAPH_FUNCTION_REF =
  "graph-function://abg/consensus/exact-panel-facts";
const ABG_CONSENSUS_ROUND_GRAPH_FUNCTION_REF =
  "graph-function://abg/consensus/round";

export const ABG_CONSENSUS_SCHEMA_REFS = Object.freeze({
  subject: "contract://abg/consensus/subject",
  result: "contract://abg/consensus/result",
  roundExecution: "contract://abg/consensus/internal/round-execution",
  reviewerAssignment: "contract://abg/consensus/internal/reviewer-assignment",
  reviewerAssignmentVector:
    "Vector[contract://abg/consensus/internal/reviewer-assignment]",
  reviewFindings: "contract://abg/consensus/review-findings",
  attributedFindingsVector:
    "Vector[contract://abg/consensus/review-findings]",
  roundExactProjection:
    "contract://abg/consensus/internal/round-exact-projection",
  initialAssessment:
    "contract://abg/consensus/internal/initial-semantic-assessment",
  submitterResponse:
    "contract://abg/consensus/internal/submitter-response",
  postSubmitterAssessment:
    "contract://abg/consensus/internal/post-submitter-semantic-assessment",
  roundDisposition:
    "contract://abg/consensus/internal/round-disposition",
  roundClosedDisposition:
    "contract://abg/consensus/internal/round-disposition/closed",
  roundRecurseDisposition:
    "contract://abg/consensus/internal/round-disposition/recurse",
  fhInteractionRequest:
    "contract://abg/consensus/internal/fh-interaction-request",
  fhPendingAdmission:
    "contract://abg/consensus/internal/fh-pending-admission",
  closedResult: "contract://abg/consensus/internal/result/closed"
} as const);

export const ABG_CONSENSUS_PROGRAM_REFS = Object.freeze({
  reviewOneProfile: "gtl://abg/consensus/program/review-one-profile",
  exactPanelFacts: "gtl://abg/consensus/program/exact-panel-facts",
  expandPanel: "gtl://abg/consensus/program/expand-panel",
  reviewPanelLift: "gtl://abg/consensus/program/review-panel-lift",
  exactPanelFactsLift: "gtl://abg/consensus/program/exact-panel-facts-lift",
  initialSemanticReduction:
    "gtl://abg/consensus/program/initial-semantic-reduction",
  initialClosedRoute: "gtl://abg/consensus/program/initial-closed-route",
  submitterResponse: "gtl://abg/consensus/program/submitter-response",
  initialFhRoute: "gtl://abg/consensus/program/initial-fh-route",
  semanticReassessment:
    "gtl://abg/consensus/program/semantic-reassessment",
  postSubmitterClosedRoute:
    "gtl://abg/consensus/program/post-submitter-closed-route",
  postSubmitterRecurseRoute:
    "gtl://abg/consensus/program/post-submitter-recurse-route",
  postSubmitterFhRoute:
    "gtl://abg/consensus/program/post-submitter-fh-route",
  fhPending: "gtl://abg/consensus/program/fh-pending",
  closedDispositionToRound:
    "gtl://abg/consensus/program/closed-disposition-to-round",
  recurseDispositionToRound:
    "gtl://abg/consensus/program/recurse-disposition-to-round",
  seedRound: "gtl://abg/consensus/program/seed-round",
  boundedRoundsLift: "gtl://abg/consensus/program/bounded-rounds-lift",
  selectClosedDisposition:
    "gtl://abg/consensus/program/select-closed-disposition",
  projectResult: "gtl://abg/consensus/program/project-result",
  closedResultToResult:
    "gtl://abg/consensus/program/closed-result-to-result"
} as const);

export type ConsensusDigest = `sha256:${string}`;
export type ConsensusPositiveInteger = number & {
  readonly __consensusPositiveInteger: unique symbol;
};

export interface ConsensusPanel {
  readonly kind: "consensus_panel";
  readonly panelRef: string;
  readonly version: string;
  readonly orderedProfileRefs: readonly string[];
}

export interface ConsensusReviewerProfile {
  readonly kind: "consensus_reviewer_profile";
  readonly profileRef: string;
  readonly version: string;
  readonly configDigest: ConsensusDigest;
  readonly reviewerExecutionSelectionRef: string;
  readonly instructionContractRef: string;
  readonly resultContractRef: string;
  readonly capabilityRefs: readonly string[];
}

export interface SemanticReducerBinding {
  readonly kind: "semantic_reducer_binding";
  readonly bindingRef: string;
  readonly roleRef: string;
  readonly workerSelectionContractRef: string;
  readonly configDigest: ConsensusDigest;
  readonly instructionContractRef: string;
  readonly resultContractRef: string;
  readonly capabilityRefs: readonly string[];
}

export interface SubmitterTurnBinding {
  readonly kind: "submitter_turn_binding";
  readonly bindingRef: string;
  readonly roleRef: string;
  readonly workerSelectionContractRef: string;
  readonly configDigest: ConsensusDigest;
  readonly instructionContractRef: string;
  readonly resultContractRef: string;
  readonly capabilityRefs: readonly string[];
}

export interface FhInteractionBinding {
  readonly kind: "fh_interaction_binding";
  readonly bindingRef: string;
  readonly subjectContractRef: string;
  readonly interactionContractRef: string;
  readonly resultContractRef: string;
  readonly capabilityRefs: readonly string[];
}

export interface ConsensusRoundPolicy {
  readonly kind: "consensus_round_policy";
  readonly policyRef: string;
  readonly version: string;
  readonly positiveRoundBudget: ConsensusPositiveInteger;
  readonly convergenceRuleRef: string;
  readonly disagreementRuleRef: string;
  readonly escalationRuleRef: string;
  readonly foldbackContractRef: string;
  readonly semanticReducerBindingRef: string;
  readonly fhInteractionBindingRef: string;
}

export interface ConsensusSubject {
  readonly kind: "consensus_subject";
  readonly subjectContractRef: string;
  readonly subjectRef: string;
  readonly subjectDigest: ConsensusDigest;
  readonly panelRef: string;
  readonly roundPolicyRef: string;
  readonly submittingActorRef: string;
  readonly submitterTurnBindingRef: string;
  readonly workspaceRef: string;
}

interface ConsensusResultBase {
  readonly subjectInvocationRef: string;
  readonly panelRef: string;
  readonly policyRef: string;
  readonly roundRefs: readonly string[];
  readonly priorRecurseOutcomeRefs: readonly string[];
  readonly findingsAndRulingsRefs: readonly string[];
  readonly consensusAndDissentClass: string;
  readonly residualEvidenceLineageRefs: readonly string[];
  readonly resultRef: string;
  readonly replayRef: string;
}

export interface ConsensusClosedResult extends ConsensusResultBase {
  readonly kind: "consensus_closed_result";
  readonly terminalOutcome: "closed_done";
}

export interface ConsensusEscalatedResult extends ConsensusResultBase {
  readonly kind: "consensus_escalated_result";
  readonly terminalOutcome: "escalate_fh";
  readonly fhInteractionRef: string;
}

export interface ConsensusContractFailureResult extends ConsensusResultBase {
  readonly kind: "consensus_contract_failure_result";
  readonly blockedInvocationRef: string;
  readonly failureClass: string;
  readonly failedCallEvidenceRefs: readonly string[];
}

export type ConsensusResult =
  | ConsensusClosedResult
  | ConsensusEscalatedResult
  | ConsensusContractFailureResult;

export interface ConsensusRoundExecution {
  readonly kind: "consensus_round_execution";
  readonly invocationRef: string;
  readonly subjectRef: string;
  readonly subjectDigest: ConsensusDigest;
  readonly panelRef: string;
  readonly policyRef: string;
  readonly workspaceRef: string;
  readonly submittingActorRef: string;
  readonly semanticReducerBindingRef: string;
  readonly submitterTurnBindingRef: string;
  readonly fhInteractionBindingRef: string;
  readonly roundOrdinal: ConsensusPositiveInteger;
  readonly priorRoundOutcomeRefs: readonly string[];
  readonly dissentAndResidualRefs: readonly string[];
  readonly evidenceAndLineageRefs: readonly string[];
}

export interface ReviewerAssignment {
  readonly kind: "reviewer_assignment";
  readonly roundRef: string;
  readonly policyRef: string;
  readonly roundOrdinal: ConsensusPositiveInteger;
  readonly panelOrdinal: ConsensusPositiveInteger;
  readonly profileRef: string;
  readonly configDigest: ConsensusDigest;
  readonly reviewerExecutionSelectionRef: string;
  readonly instructionContractRef: string;
  readonly resultContractRef: string;
  readonly capabilityRefs: readonly string[];
  readonly sharedInputContractRef: string;
  readonly sharedOutputContractRef: string;
}

export interface ReviewerAssignmentVector
  extends ReadonlyArray<ReviewerAssignment> {
  readonly roundRef: string;
  readonly policyRef: string;
  readonly roundOrdinal: ConsensusPositiveInteger;
  readonly semanticReducerBindingRef: string;
  readonly submitterTurnBindingRef: string;
  readonly fhInteractionBindingRef: string;
  readonly submittingActorRef: string;
  readonly orderedAssignments: readonly ReviewerAssignment[];
}

export interface ReviewFindings {
  readonly kind: "review_findings";
  readonly roundRef: string;
  readonly policyRef: string;
  readonly roundOrdinal: ConsensusPositiveInteger;
  readonly panelOrdinal: ConsensusPositiveInteger;
  readonly profileRef: string;
  readonly configDigest: ConsensusDigest;
  readonly invocationRef: string;
  readonly outputDigest: ConsensusDigest;
  readonly evidenceRefs: readonly string[];
  readonly typedFindings: readonly Readonly<Record<string, unknown>>[];
  readonly typedResidualOrRefusal: Readonly<Record<string, unknown>> | null;
}

export interface AttributedFindingsVector
  extends ReadonlyArray<ReviewFindings> {
  readonly roundRef: string;
  readonly policyRef: string;
  readonly roundOrdinal: ConsensusPositiveInteger;
  readonly semanticReducerBindingRef: string;
  readonly submitterTurnBindingRef: string;
  readonly fhInteractionBindingRef: string;
  readonly submittingActorRef: string;
  readonly expectedCardinality: ConsensusPositiveInteger;
  readonly memberIdentityDigest: ConsensusDigest;
  readonly orderedReviewFindingsRefs: readonly string[];
}

export interface ReviewRulingRow {
  readonly rulingRef: string;
  readonly kind: ReviewRulingKind;
  readonly sourceFindingRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface ReviewRulings {
  readonly kind: "review_rulings";
  readonly roundRef: string;
  readonly rulingRows: readonly ReviewRulingRow[];
  readonly sourceFindingRefs: readonly string[];
  readonly closedRulingKinds: readonly ReviewRulingKind[];
}

export interface RoundExactProjection {
  readonly kind: "round_exact_projection";
  readonly roundRef: string;
  readonly policyRef: string;
  readonly roundOrdinal: ConsensusPositiveInteger;
  readonly semanticReducerBindingRef: string;
  readonly submitterTurnBindingRef: string;
  readonly fhInteractionBindingRef: string;
  readonly submittingActorRef: string;
  readonly envelopeStatus: "complete";
  readonly memberSchemaRef: string;
  readonly memberIdentityDigest: ConsensusDigest;
  readonly expectedCardinality: ConsensusPositiveInteger;
  readonly admittedCardinality: ConsensusPositiveInteger;
  readonly profileAttributionRefs: readonly string[];
  readonly exactEqualityClasses: readonly string[];
}

export interface InitialSemanticAssessment {
  readonly kind: "initial_semantic_assessment";
  readonly phase: "initial";
  readonly roundRef: string;
  readonly policyRef: string;
  readonly roundOrdinal: ConsensusPositiveInteger;
  readonly semanticReducerBindingRef: string;
  readonly submitterTurnBindingRef: string;
  readonly fhInteractionBindingRef: string;
  readonly submittingActorRef: string;
  readonly initialAssessmentRef: string;
  readonly disposition:
    | "closed_done"
    | "submitter_response_required"
    | "fh_required";
  readonly semanticAgreementOrDispute: string;
  readonly dissentAndResidualRefs: readonly string[];
  readonly reviewRulings: ReviewRulings;
}

export interface SubmitterResponse {
  readonly kind: "submitter_response";
  readonly roundRef: string;
  readonly policyRef: string;
  readonly roundOrdinal: ConsensusPositiveInteger;
  readonly actorRef: string;
  readonly turnInvocationRef: string;
  readonly disputedRefs: readonly string[];
}

export interface PostSubmitterSemanticAssessment {
  readonly kind: "post_submitter_semantic_assessment";
  readonly phase: "post_submitter";
  readonly roundRef: string;
  readonly policyRef: string;
  readonly roundOrdinal: ConsensusPositiveInteger;
  readonly semanticReducerBindingRef: string;
  readonly submitterTurnBindingRef: string;
  readonly fhInteractionBindingRef: string;
  readonly submittingActorRef: string;
  readonly postAssessmentRef: string;
  readonly submitterResponseRef: string;
  readonly disposition: "closed_done" | "recurse_next_round" | "fh_required";
  readonly semanticAgreementOrDispute: string;
  readonly dissentAndResidualRefs: readonly string[];
  readonly reviewRulings: ReviewRulings;
}

export interface FoldbackMaterial {
  readonly kind: "foldback_material";
  readonly invocationRef: string;
  readonly subjectRef: string;
  readonly subjectDigest: ConsensusDigest;
  readonly panelRef: string;
  readonly policyRef: string;
  readonly workspaceRef: string;
  readonly submittingActorRef: string;
  readonly semanticReducerBindingRef: string;
  readonly submitterTurnBindingRef: string;
  readonly fhInteractionBindingRef: string;
  readonly nextRoundOrdinal: ConsensusPositiveInteger;
  readonly priorOutcomeRefs: readonly string[];
  readonly dissentResidualEvidenceLineage: readonly string[];
}

export interface RoundClosedDisposition {
  readonly kind: "round_closed";
  readonly roundRef: string;
  readonly policyRef: string;
  readonly roundOrdinal: ConsensusPositiveInteger;
  readonly outcome: "closed_done";
  readonly outcomeRef: string;
}

export interface RoundRecurseDisposition {
  readonly kind: "round_recurse";
  readonly roundRef: string;
  readonly policyRef: string;
  readonly roundOrdinal: ConsensusPositiveInteger;
  readonly outcome: "recurse_next_round";
  readonly outcomeRef: string;
  readonly foldbackMaterial: FoldbackMaterial;
}

export type ConsensusRoundDisposition =
  | RoundClosedDisposition
  | RoundRecurseDisposition;

export interface FhInteractionRequest {
  readonly kind: "fh_interaction_request";
  readonly invocationRef: string;
  readonly roundRef: string;
  readonly policyRef: string;
  readonly roundOrdinal: ConsensusPositiveInteger;
  readonly subjectRef: string;
  readonly bindingRef: string;
  readonly subjectContractRef: string;
  readonly interactionContractRef: string;
  readonly resultContractRef: string;
  readonly capabilityRefs: readonly string[];
}

export interface FhPendingAdmission {
  readonly kind: "fh_pending_admission";
  readonly invocationRef: string;
  readonly roundRef: string;
  readonly interactionRef: string;
}

interface InitialReductionInput {
  readonly exact: RoundExactProjection;
  readonly findings: AttributedFindingsVector;
}

interface ReassessmentInput {
  readonly initial: InitialSemanticAssessment;
  readonly response: SubmitterResponse;
  readonly exact: RoundExactProjection;
  readonly findings: AttributedFindingsVector;
}

function carrierFieldRef<Carrier>(
  carrierName: string,
  field: Extract<keyof Carrier, string>
): string {
  return `${carrierName}.${field}`;
}

export interface ConsensusGtlProgram {
  readonly kind: "consensus_gtl_program";
  readonly module: Module;
  readonly rootGraphFunction: GraphFunction;
  readonly submittedGraphFunctions: readonly GraphFunction[];
  readonly authoringBoundaryRefs: readonly string[];
  readonly cPrograms: readonly AdmittedCProgramDeclarationNode[];
}

function node(name: string, schemaRef: string): Node {
  return constructNode({
    name,
    schema: { kind: "symbolic", ref: schemaRef },
    markov: ["admitted"],
    assetSurface: {
      kind: `consensus_${name.replaceAll(/[^A-Za-z0-9]+/gu, "_").toLowerCase()}`,
      standardsRefs: ["REQ-P-CONSENSUS"],
      outputContractRefs: [schemaRef]
    },
    tags: ["abg:consensus"]
  });
}

function operator(
  name: string,
  regime: "F_D" | "F_P" | "F_H",
  binding: string,
  tags: readonly string[] = []
): Operator {
  return Object.freeze({
    name,
    regime,
    binding,
    tags: Object.freeze(["abg:consensus", ...tags])
  });
}

function evaluator(
  name: string,
  binding: string,
  consumedFieldRefs: readonly string[]
): Evaluator {
  return Object.freeze({
    name,
    regime: "F_D" as const,
    description: `Declared Consensus routing evaluator ${name}`,
    binding,
    consumedFieldRefs: Object.freeze([...consumedFieldRefs]),
    tags: Object.freeze(["abg:consensus", "mechanical-routing-only"])
  });
}

function rule(name: string, route: string): Rule {
  return Object.freeze({
    name,
    kind: "consensus_admitted_route",
    config: Object.freeze({
      entries: Object.freeze([
        Object.freeze({
          key: "consensus.route",
          value: Object.freeze({ kind: "scalar" as const, value: route })
        })
      ])
    }),
    tags: Object.freeze(["abg:consensus", `route:${route}`])
  });
}

function encodedRefComponent(value: string): string {
  return encodeURIComponent(value);
}

function consensusVectorRef(
  hostGraphFunctionRef: string,
  vectorName: string
): string {
  return `graph-vector://abg/consensus/${encodedRefComponent(hostGraphFunctionRef)}/${encodedRefComponent(vectorName)}`;
}

const CONSENSUS_COMPOSITION = Object.freeze({
  observe: Object.freeze({
    stageRole: "transform" as const,
    role: "observe" as const,
    authority: "evidence" as const
  }),
  construct: Object.freeze({
    stageRole: "transform" as const,
    role: "construct" as const,
    authority: "judgment" as const
  }),
  gate: Object.freeze({
    stageRole: "transform" as const,
    role: "gate" as const,
    authority: "evidence" as const
  }),
  close: Object.freeze({
    stageRole: "transform" as const,
    role: "close" as const,
    authority: "closure" as const
  }),
  escalate: Object.freeze({
    stageRole: "human_callout" as const,
    role: "escalate" as const,
    authority: "absent" as const
  })
});

function selectedVector(input: {
  readonly hostGraphFunctionRef: string;
  readonly name: string;
  readonly source: readonly Node[];
  readonly target: Node;
  readonly programRef: string;
  readonly operator: Operator;
  readonly evaluator?: Evaluator | undefined;
  readonly rule?: Rule | undefined;
  readonly composition: {
    readonly stageRole: "transform" | "human_callout";
    readonly role: "construct" | "observe" | "gate" | "escalate" | "close";
    readonly authority: "closure" | "evidence" | "judgment" | "absent";
  };
  readonly policyContextRefs?: readonly string[] | undefined;
  readonly assuranceContextRefs?: readonly string[] | undefined;
  readonly allowsSubwork?: boolean | undefined;
}): GraphVector {
  const hostGraphVectorRef = consensusVectorRef(
    input.hostGraphFunctionRef,
    input.name
  );
  const compositionDeclarations = constructAbgFnCompositionDeclarations({
    contractRef: `abg.fn_composition://${input.programRef}`,
    hookRef: `hook://abg/consensus/composition/${input.name}`,
    hostGraphFunctionRef: input.hostGraphFunctionRef,
    hostGraphVectorRef,
    hostSourceNodeRefs: input.source.map((source) => source.id),
    hostTargetNodeRef: input.target.id,
    hostTargetSchemaRef: input.target.schema.ref,
    owningDeclarationRef: input.programRef,
    regimes: [
      {
        bindingRef: `regime-binding://abg/consensus/${input.name}/${input.composition.stageRole}/${input.operator.regime}`,
        stageRole: input.composition.stageRole,
        regime: input.operator.regime,
        role: input.composition.role,
        order: 0,
        authority: input.composition.authority,
        inputCarrierRefs: [cInterfaceContractRef(input.source)],
        outputCarrierRefs: [cInterfaceContractRef([input.target])],
        evidenceRefs: [
          `requirement://REQ-P-CONSENSUS/${input.name}`,
          `program:${input.programRef}`
        ]
      }
    ],
    standardsContextRefs: ["requirement://REQ-P-CONSENSUS"],
    policyContextRefs: [
      ...new Set([
        ...(input.rule === undefined ? [] : [`rule:${input.rule.name}`]),
        ...(input.policyContextRefs ?? [])
      ])
    ],
    carrierContextRefs: [
      ...new Set([
        ...input.source.map((source) => source.schema.ref),
        input.target.schema.ref
      ])
    ],
    assuranceContextRefs: [
      ...new Set([
        "assurance://abg/standard-result-admission",
        ...(input.assuranceContextRefs ?? [])
      ])
    ],
    closureContractRef: `closure://abg/consensus/${input.name}`
  });
  return constructGraphVector({
    name: input.name,
    source: input.source,
    target: input.target,
    operators: [input.operator],
    evaluators: input.evaluator === undefined ? [] : [input.evaluator],
    contexts: [],
    rule: input.rule ?? null,
    allowsSubwork: input.allowsSubwork ?? false,
    declarations: graphVectorDeclarations([
      hogProgramRefDeclarationEntry(input.programRef),
      ...compositionDeclarations.entries
    ]),
    tags: ["abg:consensus", `program:${input.programRef}`],
    id: hostGraphVectorRef
  });
}

function stableNodes(groups: readonly (readonly Node[])[]): readonly Node[] {
  const byId = new Map<string, Node>();
  for (const group of groups) {
    for (const value of group) {
      if (!byId.has(value.id)) {
        byId.set(value.id, value);
      }
    }
  }
  return Object.freeze([...byId.values()]);
}

function graphFunctionWithPrograms(input: {
  readonly name: string;
  readonly id?: string | undefined;
  readonly inputs: readonly Node[];
  readonly outputs: readonly Node[];
  readonly nodes: readonly Node[];
  readonly vectors: readonly GraphVector[];
  readonly programs: readonly AdmittedCProgramDeclarationNode[];
  readonly rules?: readonly Rule[] | undefined;
}): GraphFunction {
  if (input.programs.length === 0) {
    throw new TypeError(`${input.name} requires at least one declared C program`);
  }
  const graph = constructGraph({
    name: `${input.name}#graph`,
    inputs: input.inputs,
    outputs: input.outputs,
    nodes: stableNodes([input.nodes, input.inputs, input.outputs]),
    vectors: input.vectors,
    contexts: [],
    rules: input.rules ?? [],
    effects: [],
    tags: ["abg:consensus", "gtl:executable-body"]
  });
  return constructGraphFunction({
    name: input.name,
    id: input.id,
    environment: constructEnvRef({
      requires: input.inputs,
      provides: input.outputs,
      carries: stableNodes([input.nodes, input.inputs, input.outputs])
    }),
    inputs: input.inputs,
    outputs: input.outputs,
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: `template://${input.name.replace(/^graph-function:\/\//u, "")}`,
      graph,
      version: null
    }),
    effects: [],
    declarations: graphFunctionDeclarations([
      cProgramCatalogDeclarationEntry(input.programs),
      hogProgramRefDeclarationEntry(input.programs[0]!.programRef)
    ]),
    tags: ["abg:consensus", "gtl:executable-body"]
  });
}

function leafProgram<Input, Output>(input: {
  readonly programRef: string;
  readonly source: readonly Node[];
  readonly target: Node;
  readonly fibre: "F_D" | "F_P" | "F_H";
  readonly stageRole?: "transform" | "human_callout" | undefined;
  readonly armId: string;
  readonly instructionCategoryRefs?: readonly string[] | undefined;
}): AdmittedCProgramDeclarationNode {
  return declareCProgram({
    programRef: input.programRef,
    term: C.of({
      input: cInterfaceCarrier<Input>(input.source),
      output: cInterfaceCarrier<Output>([input.target]),
      stageRole: input.stageRole ?? "transform",
      fibre: input.fibre,
      armId: input.armId,
      resultBearing: true,
      instructionCategoryRefs: input.instructionCategoryRefs
    }),
    proportionalityClass: "P1"
  });
}

function workflowProgram<Input, Output>(input: {
  readonly programRef: string;
  readonly source: readonly Node[];
  readonly target: Node;
  readonly graphFunction: GraphFunction;
}): AdmittedCProgramDeclarationNode {
  return declareCProgram({
    programRef: input.programRef,
    term: workflow.C(
      cGraphFunctionRef({
        graphFunction: input.graphFunction,
        input: cInterfaceCarrier<Input>(input.source),
        output: cInterfaceCarrier<Output>([input.target])
      })
    ),
    proportionalityClass: "P1"
  });
}

function constructConsensusGtlProgram(): ConsensusGtlProgram {
  const subject = node("ConsensusSubject", ABG_CONSENSUS_SCHEMA_REFS.subject);
  const result = node("ConsensusResult", ABG_CONSENSUS_SCHEMA_REFS.result);
  const roundExecution = node(
    "ConsensusRoundExecution",
    ABG_CONSENSUS_SCHEMA_REFS.roundExecution
  );
  const reviewerAssignment = node(
    "ReviewerAssignment",
    ABG_CONSENSUS_SCHEMA_REFS.reviewerAssignment
  );
  const reviewerAssignments = node(
    "ReviewerAssignmentVector",
    ABG_CONSENSUS_SCHEMA_REFS.reviewerAssignmentVector
  );
  const reviewFindings = node(
    "ReviewFindings",
    ABG_CONSENSUS_SCHEMA_REFS.reviewFindings
  );
  const attributedFindings = node(
    "AttributedFindingsVector",
    ABG_CONSENSUS_SCHEMA_REFS.attributedFindingsVector
  );
  const exactProjection = node(
    "RoundExactProjection",
    ABG_CONSENSUS_SCHEMA_REFS.roundExactProjection
  );
  const initialAssessment = node(
    "InitialSemanticAssessment",
    ABG_CONSENSUS_SCHEMA_REFS.initialAssessment
  );
  const submitterResponse = node(
    "SubmitterResponse",
    ABG_CONSENSUS_SCHEMA_REFS.submitterResponse
  );
  const postSubmitterAssessment = node(
    "PostSubmitterSemanticAssessment",
    ABG_CONSENSUS_SCHEMA_REFS.postSubmitterAssessment
  );
  const roundDisposition = node(
    "ConsensusRoundDisposition",
    ABG_CONSENSUS_SCHEMA_REFS.roundDisposition
  );
  const roundClosedDisposition = node(
    "RoundClosedDisposition",
    ABG_CONSENSUS_SCHEMA_REFS.roundClosedDisposition
  );
  const roundRecurseDisposition = node(
    "RoundRecurseDisposition",
    ABG_CONSENSUS_SCHEMA_REFS.roundRecurseDisposition
  );
  const fhInteractionRequest = node(
    "FhInteractionRequest",
    ABG_CONSENSUS_SCHEMA_REFS.fhInteractionRequest
  );
  const fhPendingAdmission = node(
    "FhPendingAdmission",
    ABG_CONSENSUS_SCHEMA_REFS.fhPendingAdmission
  );
  const closedResult = node(
    "ConsensusClosedResult",
    ABG_CONSENSUS_SCHEMA_REFS.closedResult
  );

  const reviewerOperator = operator(
    "consensus_reviewer_profile_call",
    "F_P",
    "plugin://abg/fp-dispatch",
    [
      `instruction-contract:${carrierFieldRef<ReviewerAssignment>(
        "ReviewerAssignment",
        "instructionContractRef"
      )}`,
      `result-contract:${carrierFieldRef<ReviewerAssignment>(
        "ReviewerAssignment",
        "resultContractRef"
      )}`,
      `capabilities:${carrierFieldRef<ReviewerAssignment>(
        "ReviewerAssignment",
        "capabilityRefs"
      )}`
    ]
  );
  const reviewerLeaf = C.of({
    input: cInterfaceCarrier<ReviewerAssignment>([reviewerAssignment]),
    output: cInterfaceCarrier<ReviewFindings>([reviewFindings]),
    stageRole: "transform",
    fibre: "F_P",
    armId: "arm://abg/consensus/review-one-profile",
    resultBearing: true,
    instructionCategoryRefs: [
      "instruction://abg/consensus/reviewer-findings"
    ]
  });
  const reviewProgram = declareCProgram({
    programRef: ABG_CONSENSUS_PROGRAM_REFS.reviewOneProfile,
    term: C.retry(reviewerLeaf, 2),
    proportionalityClass: "P1"
  });
  const reviewVector = selectedVector({
    hostGraphFunctionRef: ABG_CONSENSUS_REVIEW_ONE_GRAPH_FUNCTION_REF,
    name: "review_one_profile",
    source: [reviewerAssignment],
    target: reviewFindings,
    programRef: reviewProgram.programRef,
    operator: reviewerOperator,
    composition: CONSENSUS_COMPOSITION.construct,
    policyContextRefs: [
      carrierFieldRef<ReviewerAssignment>(
        "ReviewerAssignment",
        "reviewerExecutionSelectionRef"
      ),
      carrierFieldRef<ReviewerAssignment>(
        "ReviewerAssignment",
        "instructionContractRef"
      ),
      carrierFieldRef<ReviewerAssignment>(
        "ReviewerAssignment",
        "resultContractRef"
      ),
      carrierFieldRef<ReviewerAssignment>(
        "ReviewerAssignment",
        "capabilityRefs"
      ),
      ...RETRYABLE_RUNTIME_FAILURE_CLASSES.map(
        (failureClass) => `failure-class://abg/${failureClass}`
      )
    ],
    assuranceContextRefs: [
      "assurance://abg/consensus/per-profile-selection",
      "assurance://abg/consensus/reviewer-result-admission"
    ]
  });
  const reviewOneProfile = graphFunctionWithPrograms({
    name: ABG_CONSENSUS_REVIEW_ONE_GRAPH_FUNCTION_REF,
    id: ABG_CONSENSUS_REVIEW_ONE_GRAPH_FUNCTION_REF,
    inputs: [reviewerAssignment],
    outputs: [reviewFindings],
    nodes: [reviewerAssignment, reviewFindings],
    vectors: [reviewVector],
    programs: [reviewProgram]
  });

  const reviewPanel = fan_out(
    hofUnaryRef(
      reviewOneProfile,
      hofContract<ReviewerAssignment>(reviewerAssignment),
      hofContract<ReviewFindings>(reviewFindings)
    ),
    {
      over: hofVector(
        reviewerAssignments,
        hofContract<ReviewerAssignment>(reviewerAssignment)
      ),
      into: hofVector(
        attributedFindings,
        hofContract<ReviewFindings>(reviewFindings)
      )
    }
  ).graphFunction;

  const exactFactsOperator = operator(
    "consensus_exact_panel_facts",
    "F_D",
    "binding://abg/consensus/exact-panel-facts",
    ["envelope-cardinality-attribution-only"]
  );
  const exactFactsProgram = leafProgram<
    AttributedFindingsVector,
    RoundExactProjection
  >({
    programRef: ABG_CONSENSUS_PROGRAM_REFS.exactPanelFacts,
    source: [attributedFindings],
    target: exactProjection,
    fibre: "F_D",
    armId: "arm://abg/consensus/exact-panel-facts"
  });
  const exactFactsVector = selectedVector({
    hostGraphFunctionRef: ABG_CONSENSUS_EXACT_FACTS_GRAPH_FUNCTION_REF,
    name: "project_exact_panel_facts",
    source: [attributedFindings],
    target: exactProjection,
    programRef: exactFactsProgram.programRef,
    operator: exactFactsOperator,
    composition: CONSENSUS_COMPOSITION.observe
  });
  const exactPanelFacts = graphFunctionWithPrograms({
    name: ABG_CONSENSUS_EXACT_FACTS_GRAPH_FUNCTION_REF,
    id: ABG_CONSENSUS_EXACT_FACTS_GRAPH_FUNCTION_REF,
    inputs: [attributedFindings],
    outputs: [exactProjection],
    nodes: [attributedFindings, exactProjection],
    vectors: [exactFactsVector],
    programs: [exactFactsProgram]
  });
  const collectedExactFacts = fan_in(exactPanelFacts, attributedFindings);

  const initialClosedEvaluator = evaluator(
    "consensus_initial_closed",
    "evaluator://abg/consensus/initial-closed",
    [
      carrierFieldRef<InitialSemanticAssessment>(
        "InitialSemanticAssessment",
        "disposition"
      ),
      carrierFieldRef<InitialSemanticAssessment>(
        "InitialSemanticAssessment",
        "policyRef"
      ),
      carrierFieldRef<InitialSemanticAssessment>(
        "InitialSemanticAssessment",
        "roundOrdinal"
      )
    ]
  );
  const initialClosedRule = rule("consensus_initial_closed", "closed_done");
  const initialSubmitterEvaluator = evaluator(
    "consensus_initial_submitter",
    "evaluator://abg/consensus/initial-submitter",
    [
      carrierFieldRef<InitialSemanticAssessment>(
        "InitialSemanticAssessment",
        "disposition"
      ),
      carrierFieldRef<InitialSemanticAssessment>(
        "InitialSemanticAssessment",
        "policyRef"
      ),
      carrierFieldRef<InitialSemanticAssessment>(
        "InitialSemanticAssessment",
        "roundOrdinal"
      )
    ]
  );
  const initialSubmitterRule = rule(
    "consensus_initial_submitter",
    "submitter_response_required"
  );
  const initialFhEvaluator = evaluator(
    "consensus_initial_fh",
    "evaluator://abg/consensus/initial-fh",
    [
      carrierFieldRef<InitialSemanticAssessment>(
        "InitialSemanticAssessment",
        "disposition"
      ),
      carrierFieldRef<InitialSemanticAssessment>(
        "InitialSemanticAssessment",
        "policyRef"
      ),
      carrierFieldRef<InitialSemanticAssessment>(
        "InitialSemanticAssessment",
        "roundOrdinal"
      )
    ]
  );
  const initialFhRule = rule("consensus_initial_fh", "fh_required");
  const postClosedEvaluator = evaluator(
    "consensus_post_submitter_closed",
    "evaluator://abg/consensus/post-submitter-closed",
    [
      carrierFieldRef<PostSubmitterSemanticAssessment>(
        "PostSubmitterSemanticAssessment",
        "disposition"
      ),
      carrierFieldRef<PostSubmitterSemanticAssessment>(
        "PostSubmitterSemanticAssessment",
        "policyRef"
      ),
      carrierFieldRef<PostSubmitterSemanticAssessment>(
        "PostSubmitterSemanticAssessment",
        "roundOrdinal"
      )
    ]
  );
  const postClosedRule = rule(
    "consensus_post_submitter_closed",
    "closed_done"
  );
  const postRecurseEvaluator = evaluator(
    "consensus_post_submitter_recurse",
    "evaluator://abg/consensus/post-submitter-recurse",
    [
      carrierFieldRef<PostSubmitterSemanticAssessment>(
        "PostSubmitterSemanticAssessment",
        "disposition"
      ),
      carrierFieldRef<PostSubmitterSemanticAssessment>(
        "PostSubmitterSemanticAssessment",
        "submitterResponseRef"
      ),
      carrierFieldRef<PostSubmitterSemanticAssessment>(
        "PostSubmitterSemanticAssessment",
        "policyRef"
      ),
      carrierFieldRef<PostSubmitterSemanticAssessment>(
        "PostSubmitterSemanticAssessment",
        "roundOrdinal"
      )
    ]
  );
  const postRecurseRule = rule(
    "consensus_post_submitter_recurse",
    "recurse_next_round"
  );
  const postFhEvaluator = evaluator(
    "consensus_post_submitter_fh",
    "evaluator://abg/consensus/post-submitter-fh",
    [
      carrierFieldRef<PostSubmitterSemanticAssessment>(
        "PostSubmitterSemanticAssessment",
        "disposition"
      ),
      carrierFieldRef<PostSubmitterSemanticAssessment>(
        "PostSubmitterSemanticAssessment",
        "policyRef"
      ),
      carrierFieldRef<PostSubmitterSemanticAssessment>(
        "PostSubmitterSemanticAssessment",
        "roundOrdinal"
      )
    ]
  );
  const postFhRule = rule("consensus_post_submitter_fh", "fh_required");
  const terminationEvaluator = evaluator(
    "consensus_round_closed_done",
    "evaluator://abg/consensus/round-closed-done",
    [
      carrierFieldRef<ConsensusRoundDisposition>("ConsensusRoundDisposition", "kind"),
      carrierFieldRef<ConsensusRoundDisposition>(
        "ConsensusRoundDisposition",
        "policyRef"
      ),
      carrierFieldRef<ConsensusRoundDisposition>(
        "ConsensusRoundDisposition",
        "roundOrdinal"
      )
    ]
  );

  const expandProgram = leafProgram<
    ConsensusRoundExecution,
    ReviewerAssignmentVector
  >({
    programRef: ABG_CONSENSUS_PROGRAM_REFS.expandPanel,
    source: [roundExecution],
    target: reviewerAssignments,
    fibre: "F_D",
    armId: "arm://abg/consensus/expand-panel"
  });
  const reviewPanelLiftProgram = workflowProgram<
    ReviewerAssignmentVector,
    AttributedFindingsVector
  >({
    programRef: ABG_CONSENSUS_PROGRAM_REFS.reviewPanelLift,
    source: [reviewerAssignments],
    target: attributedFindings,
    graphFunction: reviewPanel
  });
  const exactFactsLiftProgram = workflowProgram<
    AttributedFindingsVector,
    RoundExactProjection
  >({
    programRef: ABG_CONSENSUS_PROGRAM_REFS.exactPanelFactsLift,
    source: [attributedFindings],
    target: exactProjection,
    graphFunction: collectedExactFacts
  });
  const reductionProgram = leafProgram<
    InitialReductionInput,
    InitialSemanticAssessment
  >({
    programRef: ABG_CONSENSUS_PROGRAM_REFS.initialSemanticReduction,
    source: [exactProjection, attributedFindings],
    target: initialAssessment,
    fibre: "F_P",
    armId: "arm://abg/consensus/initial-semantic-reduction",
    instructionCategoryRefs: [
      "instruction://abg/consensus/semantic-reduction"
    ]
  });
  const initialClosedProgram = leafProgram<
    InitialSemanticAssessment,
    RoundClosedDisposition
  >({
    programRef: ABG_CONSENSUS_PROGRAM_REFS.initialClosedRoute,
    source: [initialAssessment],
    target: roundClosedDisposition,
    fibre: "F_D",
    armId: "arm://abg/consensus/initial-closed-route"
  });
  const submitterProgram = leafProgram<
    InitialSemanticAssessment,
    SubmitterResponse
  >({
    programRef: ABG_CONSENSUS_PROGRAM_REFS.submitterResponse,
    source: [initialAssessment],
    target: submitterResponse,
    fibre: "F_P",
    armId: "arm://abg/consensus/submitter-response",
    instructionCategoryRefs: [
      "instruction://abg/consensus/submitter-response"
    ]
  });
  const initialFhProgram = leafProgram<
    InitialSemanticAssessment,
    FhInteractionRequest
  >({
    programRef: ABG_CONSENSUS_PROGRAM_REFS.initialFhRoute,
    source: [initialAssessment],
    target: fhInteractionRequest,
    fibre: "F_D",
    armId: "arm://abg/consensus/initial-fh-route"
  });
  const reassessmentProgram = leafProgram<
    ReassessmentInput,
    PostSubmitterSemanticAssessment
  >({
    programRef: ABG_CONSENSUS_PROGRAM_REFS.semanticReassessment,
    source: [
      initialAssessment,
      submitterResponse,
      exactProjection,
      attributedFindings
    ],
    target: postSubmitterAssessment,
    fibre: "F_P",
    armId: "arm://abg/consensus/semantic-reassessment",
    instructionCategoryRefs: [
      "instruction://abg/consensus/semantic-reassessment"
    ]
  });
  const postClosedProgram = leafProgram<
    PostSubmitterSemanticAssessment,
    RoundClosedDisposition
  >({
    programRef: ABG_CONSENSUS_PROGRAM_REFS.postSubmitterClosedRoute,
    source: [postSubmitterAssessment],
    target: roundClosedDisposition,
    fibre: "F_D",
    armId: "arm://abg/consensus/post-submitter-closed-route"
  });
  const postRecurseProgram = leafProgram<
    PostSubmitterSemanticAssessment,
    RoundRecurseDisposition
  >({
    programRef: ABG_CONSENSUS_PROGRAM_REFS.postSubmitterRecurseRoute,
    source: [postSubmitterAssessment],
    target: roundRecurseDisposition,
    fibre: "F_D",
    armId: "arm://abg/consensus/post-submitter-recurse-route"
  });
  const postFhProgram = leafProgram<
    PostSubmitterSemanticAssessment,
    FhInteractionRequest
  >({
    programRef: ABG_CONSENSUS_PROGRAM_REFS.postSubmitterFhRoute,
    source: [postSubmitterAssessment],
    target: fhInteractionRequest,
    fibre: "F_D",
    armId: "arm://abg/consensus/post-submitter-fh-route"
  });
  const fhPendingProgram = leafProgram<
    FhInteractionRequest,
    FhPendingAdmission
  >({
    programRef: ABG_CONSENSUS_PROGRAM_REFS.fhPending,
    source: [fhInteractionRequest],
    target: fhPendingAdmission,
    fibre: "F_H",
    stageRole: "human_callout",
    armId: "arm://abg/consensus/fh-pending",
    instructionCategoryRefs: [
      "interaction://abg/consensus/pending-human-ruling"
    ]
  });
  const closedDispositionToRoundProgram = leafProgram<
    RoundClosedDisposition,
    ConsensusRoundDisposition
  >({
    programRef: ABG_CONSENSUS_PROGRAM_REFS.closedDispositionToRound,
    source: [roundClosedDisposition],
    target: roundDisposition,
    fibre: "F_D",
    armId: "arm://abg/consensus/closed-disposition-to-round"
  });
  const recurseDispositionToRoundProgram = leafProgram<
    RoundRecurseDisposition,
    ConsensusRoundDisposition
  >({
    programRef: ABG_CONSENSUS_PROGRAM_REFS.recurseDispositionToRound,
    source: [roundRecurseDisposition],
    target: roundDisposition,
    fibre: "F_D",
    armId: "arm://abg/consensus/recurse-disposition-to-round"
  });
  const roundPrograms = Object.freeze([
    expandProgram,
    reviewPanelLiftProgram,
    exactFactsLiftProgram,
    reductionProgram,
    initialClosedProgram,
    submitterProgram,
    initialFhProgram,
    reassessmentProgram,
    postClosedProgram,
    postRecurseProgram,
    postFhProgram,
    fhPendingProgram,
    closedDispositionToRoundProgram,
    recurseDispositionToRoundProgram
  ]);

  const expandVector = selectedVector({
    hostGraphFunctionRef: ABG_CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
    name: "expand_panel",
    source: [roundExecution],
    target: reviewerAssignments,
    programRef: expandProgram.programRef,
    operator: operator(
      "consensus_expand_panel",
      "F_D",
      "binding://abg/consensus/expand-panel"
    ),
    composition: CONSENSUS_COMPOSITION.observe
  });
  const reviewPanelVector = selectedVector({
    hostGraphFunctionRef: ABG_CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
    name: "review_panel",
    source: [reviewerAssignments],
    target: attributedFindings,
    programRef: reviewPanelLiftProgram.programRef,
    operator: operator(
      "consensus_review_panel_lift",
      "F_D",
      "binding://abg/consensus/workflow/review-panel"
    ),
    composition: CONSENSUS_COMPOSITION.observe,
    allowsSubwork: true
  });
  const exactFactsLiftVector = selectedVector({
    hostGraphFunctionRef: ABG_CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
    name: "collect_exact_panel_facts",
    source: [attributedFindings],
    target: exactProjection,
    programRef: exactFactsLiftProgram.programRef,
    operator: operator(
      "consensus_exact_panel_facts_lift",
      "F_D",
      "binding://abg/consensus/workflow/exact-panel-facts"
    ),
    composition: CONSENSUS_COMPOSITION.observe,
    allowsSubwork: true
  });
  const reductionVector = selectedVector({
    hostGraphFunctionRef: ABG_CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
    name: "reduce_initial_semantics",
    source: [exactProjection, attributedFindings],
    target: initialAssessment,
    programRef: reductionProgram.programRef,
    operator: operator(
      "consensus_initial_semantic_reducer",
      "F_P",
      "plugin://abg/fp-dispatch"
    ),
    composition: CONSENSUS_COMPOSITION.construct,
    policyContextRefs: [
      carrierFieldRef<RoundExactProjection>(
        "RoundExactProjection",
        "semanticReducerBindingRef"
      ),
      carrierFieldRef<SemanticReducerBinding>(
        "SemanticReducerBinding",
        "roleRef"
      ),
      carrierFieldRef<SemanticReducerBinding>(
        "SemanticReducerBinding",
        "workerSelectionContractRef"
      ),
      carrierFieldRef<SemanticReducerBinding>(
        "SemanticReducerBinding",
        "configDigest"
      ),
      carrierFieldRef<SemanticReducerBinding>(
        "SemanticReducerBinding",
        "instructionContractRef"
      ),
      carrierFieldRef<SemanticReducerBinding>(
        "SemanticReducerBinding",
        "resultContractRef"
      ),
      carrierFieldRef<SemanticReducerBinding>(
        "SemanticReducerBinding",
        "capabilityRefs"
      ),
      "contract://abg/consensus/internal/initial-semantic-assessment"
    ],
    assuranceContextRefs: [
      "assurance://abg/consensus/semantic-reducer-result-admission"
    ]
  });
  const initialClosedVector = selectedVector({
    hostGraphFunctionRef: ABG_CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
    name: "route_initial_closed",
    source: [initialAssessment],
    target: roundClosedDisposition,
    programRef: initialClosedProgram.programRef,
    operator: operator(
      "consensus_initial_closed_route",
      "F_D",
      "binding://abg/consensus/route/initial-closed"
    ),
    evaluator: initialClosedEvaluator,
    rule: initialClosedRule,
    composition: CONSENSUS_COMPOSITION.close
  });
  const submitterVector = selectedVector({
    hostGraphFunctionRef: ABG_CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
    name: "request_submitter_response",
    source: [initialAssessment],
    target: submitterResponse,
    programRef: submitterProgram.programRef,
    operator: operator(
      "consensus_submitter_response",
      "F_P",
      "plugin://abg/fp-dispatch"
    ),
    evaluator: initialSubmitterEvaluator,
    rule: initialSubmitterRule,
    composition: CONSENSUS_COMPOSITION.construct,
    policyContextRefs: [
      carrierFieldRef<InitialSemanticAssessment>(
        "InitialSemanticAssessment",
        "submitterTurnBindingRef"
      ),
      carrierFieldRef<SubmitterTurnBinding>(
        "SubmitterTurnBinding",
        "roleRef"
      ),
      carrierFieldRef<SubmitterTurnBinding>(
        "SubmitterTurnBinding",
        "workerSelectionContractRef"
      ),
      carrierFieldRef<SubmitterTurnBinding>(
        "SubmitterTurnBinding",
        "configDigest"
      ),
      carrierFieldRef<SubmitterTurnBinding>(
        "SubmitterTurnBinding",
        "instructionContractRef"
      ),
      carrierFieldRef<SubmitterTurnBinding>(
        "SubmitterTurnBinding",
        "resultContractRef"
      ),
      carrierFieldRef<SubmitterTurnBinding>(
        "SubmitterTurnBinding",
        "capabilityRefs"
      ),
      carrierFieldRef<InitialSemanticAssessment>(
        "InitialSemanticAssessment",
        "submittingActorRef"
      ),
      "contract://abg/consensus/internal/submitter-response"
    ],
    assuranceContextRefs: [
      "assurance://abg/consensus/submitting-actor-not-selection-authority",
      "assurance://abg/consensus/submitter-result-admission"
    ]
  });
  const initialFhVector = selectedVector({
    hostGraphFunctionRef: ABG_CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
    name: "route_initial_fh",
    source: [initialAssessment],
    target: fhInteractionRequest,
    programRef: initialFhProgram.programRef,
    operator: operator(
      "consensus_initial_fh_route",
      "F_D",
      "binding://abg/consensus/route/initial-fh"
    ),
    evaluator: initialFhEvaluator,
    rule: initialFhRule,
    composition: CONSENSUS_COMPOSITION.gate
  });
  const reassessmentVector = selectedVector({
    hostGraphFunctionRef: ABG_CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
    name: "reassess_after_submitter",
    source: [
      initialAssessment,
      submitterResponse,
      exactProjection,
      attributedFindings
    ],
    target: postSubmitterAssessment,
    programRef: reassessmentProgram.programRef,
    operator: operator(
      "consensus_semantic_reassessment",
      "F_P",
      "plugin://abg/fp-dispatch"
    ),
    composition: CONSENSUS_COMPOSITION.construct,
    policyContextRefs: [
      carrierFieldRef<InitialSemanticAssessment>(
        "InitialSemanticAssessment",
        "semanticReducerBindingRef"
      ),
      carrierFieldRef<SemanticReducerBinding>(
        "SemanticReducerBinding",
        "roleRef"
      ),
      carrierFieldRef<SemanticReducerBinding>(
        "SemanticReducerBinding",
        "workerSelectionContractRef"
      ),
      carrierFieldRef<SemanticReducerBinding>(
        "SemanticReducerBinding",
        "configDigest"
      ),
      carrierFieldRef<SemanticReducerBinding>(
        "SemanticReducerBinding",
        "instructionContractRef"
      ),
      carrierFieldRef<SemanticReducerBinding>(
        "SemanticReducerBinding",
        "resultContractRef"
      ),
      carrierFieldRef<SemanticReducerBinding>(
        "SemanticReducerBinding",
        "capabilityRefs"
      ),
      carrierFieldRef<SubmitterResponse>(
        "SubmitterResponse",
        "turnInvocationRef"
      ),
      "contract://abg/consensus/internal/post-submitter-semantic-assessment"
    ],
    assuranceContextRefs: [
      "assurance://abg/consensus/reassessment-requires-exact-submitter-response",
      "assurance://abg/consensus/reassessment-result-admission"
    ]
  });
  const postClosedVector = selectedVector({
    hostGraphFunctionRef: ABG_CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
    name: "route_post_submitter_closed",
    source: [postSubmitterAssessment],
    target: roundClosedDisposition,
    programRef: postClosedProgram.programRef,
    operator: operator(
      "consensus_post_submitter_closed_route",
      "F_D",
      "binding://abg/consensus/route/post-submitter-closed"
    ),
    evaluator: postClosedEvaluator,
    rule: postClosedRule,
    composition: CONSENSUS_COMPOSITION.close
  });
  const postRecurseVector = selectedVector({
    hostGraphFunctionRef: ABG_CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
    name: "route_post_submitter_recurse",
    source: [postSubmitterAssessment],
    target: roundRecurseDisposition,
    programRef: postRecurseProgram.programRef,
    operator: operator(
      "consensus_post_submitter_recurse_route",
      "F_D",
      "binding://abg/consensus/route/post-submitter-recurse"
    ),
    evaluator: postRecurseEvaluator,
    rule: postRecurseRule,
    composition: CONSENSUS_COMPOSITION.gate
  });
  const postFhVector = selectedVector({
    hostGraphFunctionRef: ABG_CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
    name: "route_post_submitter_fh",
    source: [postSubmitterAssessment],
    target: fhInteractionRequest,
    programRef: postFhProgram.programRef,
    operator: operator(
      "consensus_post_submitter_fh_route",
      "F_D",
      "binding://abg/consensus/route/post-submitter-fh"
    ),
    evaluator: postFhEvaluator,
    rule: postFhRule,
    composition: CONSENSUS_COMPOSITION.gate
  });
  const fhPendingVector = selectedVector({
    hostGraphFunctionRef: ABG_CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
    name: "hold_pending_fh_interaction",
    source: [fhInteractionRequest],
    target: fhPendingAdmission,
    programRef: fhPendingProgram.programRef,
    operator: operator(
      "consensus_fh_pending_interaction",
      "F_H",
      "plugin://abg/fh-admission"
    ),
    composition: CONSENSUS_COMPOSITION.escalate,
    policyContextRefs: [
      carrierFieldRef<FhInteractionRequest>(
        "FhInteractionRequest",
        "bindingRef"
      ),
      carrierFieldRef<FhInteractionRequest>(
        "FhInteractionRequest",
        "subjectContractRef"
      ),
      carrierFieldRef<FhInteractionRequest>(
        "FhInteractionRequest",
        "interactionContractRef"
      ),
      carrierFieldRef<FhInteractionRequest>(
        "FhInteractionRequest",
        "resultContractRef"
      ),
      carrierFieldRef<FhInteractionRequest>(
        "FhInteractionRequest",
        "capabilityRefs"
      )
    ],
    assuranceContextRefs: [
      "assurance://abg/consensus/fh-held-not-graph-success"
    ]
  });
  const closedDispositionToRoundVector = selectedVector({
    hostGraphFunctionRef: ABG_CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
    name: "admit_closed_round_disposition",
    source: [roundClosedDisposition],
    target: roundDisposition,
    programRef: closedDispositionToRoundProgram.programRef,
    operator: operator(
      "consensus_closed_disposition_to_round",
      "F_D",
      "binding://abg/consensus/disposition/closed-to-round"
    ),
    composition: CONSENSUS_COMPOSITION.observe
  });
  const recurseDispositionToRoundVector = selectedVector({
    hostGraphFunctionRef: ABG_CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
    name: "admit_recurse_round_disposition",
    source: [roundRecurseDisposition],
    target: roundDisposition,
    programRef: recurseDispositionToRoundProgram.programRef,
    operator: operator(
      "consensus_recurse_disposition_to_round",
      "F_D",
      "binding://abg/consensus/disposition/recurse-to-round"
    ),
    composition: CONSENSUS_COMPOSITION.observe
  });
  const roundGraphFunction = graphFunctionWithPrograms({
    name: ABG_CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
    id: ABG_CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
    inputs: [roundExecution],
    outputs: [roundDisposition],
    nodes: [
      roundExecution,
      reviewerAssignments,
      attributedFindings,
      exactProjection,
      initialAssessment,
      submitterResponse,
      postSubmitterAssessment,
      roundClosedDisposition,
      roundRecurseDisposition,
      roundDisposition,
      fhInteractionRequest,
      fhPendingAdmission
    ],
    vectors: [
      expandVector,
      reviewPanelVector,
      exactFactsLiftVector,
      reductionVector,
      initialClosedVector,
      submitterVector,
      initialFhVector,
      reassessmentVector,
      postClosedVector,
      postRecurseVector,
      postFhVector,
      fhPendingVector,
      closedDispositionToRoundVector,
      recurseDispositionToRoundVector
    ],
    programs: roundPrograms,
    rules: [
      initialClosedRule,
      initialSubmitterRule,
      initialFhRule,
      postClosedRule,
      postRecurseRule,
      postFhRule
    ]
  });
  const boundedRounds = recurse(roundGraphFunction, terminationEvaluator, {
    mode: "rebind",
    binding: "binding://abg/consensus/next-round",
    requiresParentEvaluation: true
  });

  const seedProgram = leafProgram<ConsensusSubject, ConsensusRoundExecution>({
    programRef: ABG_CONSENSUS_PROGRAM_REFS.seedRound,
    source: [subject],
    target: roundExecution,
    fibre: "F_D",
    armId: "arm://abg/consensus/seed-round"
  });
  const boundedRoundsProgram = workflowProgram<
    ConsensusRoundExecution,
    ConsensusRoundDisposition
  >({
    programRef: ABG_CONSENSUS_PROGRAM_REFS.boundedRoundsLift,
    source: [roundExecution],
    target: roundDisposition,
    graphFunction: boundedRounds
  });
  const selectClosedDispositionProgram = leafProgram<
    ConsensusRoundDisposition,
    RoundClosedDisposition
  >({
    programRef: ABG_CONSENSUS_PROGRAM_REFS.selectClosedDisposition,
    source: [roundDisposition],
    target: roundClosedDisposition,
    fibre: "F_D",
    armId: "arm://abg/consensus/select-closed-disposition"
  });
  const projectProgram = leafProgram<
    RoundClosedDisposition,
    ConsensusClosedResult
  >({
    programRef: ABG_CONSENSUS_PROGRAM_REFS.projectResult,
    source: [roundClosedDisposition],
    target: closedResult,
    fibre: "F_D",
    armId: "arm://abg/consensus/project-result"
  });
  const closedResultToResultProgram = leafProgram<
    ConsensusClosedResult,
    ConsensusResult
  >({
    programRef: ABG_CONSENSUS_PROGRAM_REFS.closedResultToResult,
    source: [closedResult],
    target: result,
    fibre: "F_D",
    armId: "arm://abg/consensus/closed-result-to-result"
  });
  const projectEvaluator = evaluator(
    "consensus_project_closed_result",
    "evaluator://abg/consensus/project-closed-result",
    [carrierFieldRef<ConsensusRoundDisposition>("ConsensusRoundDisposition", "kind")]
  );
  const projectRule = rule(
    "consensus_project_closed_result",
    "closed_done_only"
  );
  const seedVector = selectedVector({
    hostGraphFunctionRef: ABG_CONSENSUS_GRAPH_FUNCTION_REF,
    name: "seed_first_round",
    source: [subject],
    target: roundExecution,
    programRef: seedProgram.programRef,
    operator: operator(
      "consensus_seed_round",
      "F_D",
      "binding://abg/consensus/seed-round"
    ),
    composition: CONSENSUS_COMPOSITION.observe
  });
  const boundedRoundsVector = selectedVector({
    hostGraphFunctionRef: ABG_CONSENSUS_GRAPH_FUNCTION_REF,
    name: "run_bounded_rounds",
    source: [roundExecution],
    target: roundDisposition,
    programRef: boundedRoundsProgram.programRef,
    operator: operator(
      "consensus_bounded_rounds_lift",
      "F_D",
      "binding://abg/consensus/workflow/bounded-rounds"
    ),
    composition: CONSENSUS_COMPOSITION.observe,
    allowsSubwork: true
  });
  const selectClosedDispositionVector = selectedVector({
    hostGraphFunctionRef: ABG_CONSENSUS_GRAPH_FUNCTION_REF,
    name: "select_closed_round_disposition",
    source: [roundDisposition],
    target: roundClosedDisposition,
    programRef: selectClosedDispositionProgram.programRef,
    operator: operator(
      "consensus_select_closed_disposition",
      "F_D",
      "binding://abg/consensus/select-closed-disposition"
    ),
    evaluator: projectEvaluator,
    rule: projectRule,
    composition: CONSENSUS_COMPOSITION.close
  });
  const projectVector = selectedVector({
    hostGraphFunctionRef: ABG_CONSENSUS_GRAPH_FUNCTION_REF,
    name: "project_closed_result",
    source: [roundClosedDisposition],
    target: closedResult,
    programRef: projectProgram.programRef,
    operator: operator(
      "consensus_project_result",
      "F_D",
      "binding://abg/consensus/project-result"
    ),
    composition: CONSENSUS_COMPOSITION.observe
  });
  const closedResultToResultVector = selectedVector({
    hostGraphFunctionRef: ABG_CONSENSUS_GRAPH_FUNCTION_REF,
    name: "admit_closed_consensus_result",
    source: [closedResult],
    target: result,
    programRef: closedResultToResultProgram.programRef,
    operator: operator(
      "consensus_closed_result_to_result",
      "F_D",
      "binding://abg/consensus/result/closed-to-public"
    ),
    composition: CONSENSUS_COMPOSITION.observe
  });
  const root = graphFunctionWithPrograms({
    name: ABG_CONSENSUS_GRAPH_FUNCTION_REF,
    id: ABG_CONSENSUS_GRAPH_FUNCTION_REF,
    inputs: [subject],
    outputs: [result],
    nodes: [
      subject,
      roundExecution,
      roundDisposition,
      roundClosedDisposition,
      closedResult,
      result
    ],
    vectors: [
      seedVector,
      boundedRoundsVector,
      selectClosedDispositionVector,
      projectVector,
      closedResultToResultVector
    ],
    programs: [
      seedProgram,
      boundedRoundsProgram,
      selectClosedDispositionProgram,
      projectProgram,
      closedResultToResultProgram
    ],
    rules: [projectRule]
  });

  const submittedGraphFunctions = Object.freeze([
    root,
    roundGraphFunction,
    boundedRounds,
    reviewOneProfile,
    reviewPanel,
    exactPanelFacts,
    collectedExactFacts
  ]);
  const allOperators = Object.freeze(
    submittedGraphFunctions.flatMap((graphFunction) =>
      materializeGraphFunction(graphFunction).vectors.flatMap(
        (graphVector) => graphVector.operators
      )
    )
  );
  const allEvaluators = Object.freeze([
    initialClosedEvaluator,
    initialSubmitterEvaluator,
    initialFhEvaluator,
    postClosedEvaluator,
    postRecurseEvaluator,
    postFhEvaluator,
    terminationEvaluator,
    projectEvaluator
  ]);
  const allRules = Object.freeze([
    initialClosedRule,
    initialSubmitterRule,
    initialFhRule,
    postClosedRule,
    postRecurseRule,
    postFhRule,
    projectRule
  ]);
  const nativeModule = constructModule({
    name: ABG_CONSENSUS_MODULE_REF,
    graphs: [],
    graphFunctions: submittedGraphFunctions,
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [],
    roles: [],
    operators: allOperators,
    evaluators: allEvaluators,
    rules: allRules,
    imports: [],
    policyHooks: { entries: [] },
    metadata: {
      entries: [
        {
          key: "consensus.public_root_ref",
          value: { kind: "scalar", value: ABG_CONSENSUS_GRAPH_FUNCTION_REF }
        }
      ]
    }
  });
  const moduleValue = admitModule(
    serializeModule(nativeModule),
    "ABG Consensus canonical module"
  );
  const admittedRoot = moduleValue.graphFunctions.find(
    (graphFunction) => graphFunction.id === ABG_CONSENSUS_GRAPH_FUNCTION_REF
  );
  if (admittedRoot === undefined) {
    throw new TypeError("ABG Consensus raw-admitted module lost its canonical root");
  }
  const cPrograms = Object.freeze([
    reviewProgram,
    exactFactsProgram,
    ...roundPrograms,
    seedProgram,
    boundedRoundsProgram,
    selectClosedDispositionProgram,
    projectProgram,
    closedResultToResultProgram
  ]);
  return Object.freeze({
    kind: "consensus_gtl_program" as const,
    module: moduleValue,
    rootGraphFunction: admittedRoot,
    submittedGraphFunctions: moduleValue.graphFunctions,
    authoringBoundaryRefs: Object.freeze([
      root.id,
      roundGraphFunction.id,
      boundedRounds.id,
      reviewOneProfile.id,
      reviewPanel.id,
      exactPanelFacts.id,
      collectedExactFacts.id
    ]),
    cPrograms
  });
}

export const ABG_CONSENSUS_GTL_PROGRAM = constructConsensusGtlProgram();
