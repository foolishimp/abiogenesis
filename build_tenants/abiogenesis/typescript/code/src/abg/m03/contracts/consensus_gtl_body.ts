// Implements: REQ-P-CONSENSUS-001..019.
// Implements: REQ-L-GTL3-GRAPHFUNCTION, REQ-L-GTL3-HOF,
// REQ-L-GTL3-RECURSE, REQ-L-GTL3-C-ALGEBRA.
//
// This is the DS-1 canonical pure-data body. It authors GTL and C-algebra
// declarations only. Runtime execution and catalog ownership remain separate
// successor work.

import {
  C,
  cGraphFunctionRef,
  cInterfaceCarrier,
  declareCProgram,
  typedInterface,
  typedNode,
  typedVectorNode,
  workflow,
  type AdmittedCProgramDeclarationNode,
  type CInterfaceCarrier,
  type NonEmptyTypedNodeTuple,
  type NodeBackedCGraphFunctionRef,
  type TrustedNativeDecoder,
  type TypedNodeBase,
  type TypedScalarNode,
  type TypedVectorNode
} from "../../../gtl/m01/algebra/index.js";
import {
  fan_in,
  fan_out,
  hofContract,
  hofUnaryRef,
  hofVector
} from "../../../gtl/m01/algebra/hof.js";
import { recurse } from "../../../gtl/m01/algebra/core.js";
import {
  cProgramCatalogDeclarationEntry
} from "../../../gtl/m01/algebra/c_algebra_declarations.js";
import {
  constructEnvRef,
  constructGraph,
  constructGraphFunction,
  constructGraphVector,
  constructNode,
  constructTemplateRef,
  emptySerializedAttrs,
  serializedJsonValueToPlain
} from "../../../gtl/m01/contracts/constructors.js";
import {
  graphFunctionDeclarations,
  graphVectorDeclarations,
  type GraphFunctionDeclarations,
  type GraphVectorDeclarations
} from "../../../gtl/m01/contracts/declaration_law.js";
import {
  hogHandlerBindingsDeclarationEntry,
  hogProgramRefDeclarationEntry,
  pluginSelectionDeclarationEntry,
  type GtlHogHandlerBindingDeclaration,
  type GtlPluginSelectionSeam
} from "../../../gtl/m01/contracts/execution_declaration_builders.js";
import type {
  Evaluator,
  Graph,
  GraphFunction,
  GraphVector,
  Node,
  Operator,
  Regime,
  Rule,
  SerializedAttrEntry,
  SerializedAttrs,
  SerializedJsonValue
} from "../../../gtl/m01/contracts/carriers.js";
import {
  constructModule,
  type ModuleInit
} from "../../../gtl/m02/contracts/constructors.js";
import type { Module } from "../../../gtl/m02/contracts/carriers.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import { RETRYABLE_RUNTIME_FAILURE_CLASS_VALUES } from "./carriers.js";
import {
  admitConsensusDomainValue,
  CONSENSUS_RUNTIME_SCHEMA_SOURCES,
  type ConsensusDomainValueByKind,
  type ConsensusResult,
  type ConsensusSubject,
  type ConsensusRuntimeSchemaSource,
  type ReviewFindings
} from "./consensus_contract_family.js";
import {
  canonicalizeRuntimeSchemaAdmissionMetadataRows,
  RUNTIME_SCHEMA_ADMISSION_METADATA_FIELDS,
  RUNTIME_SCHEMA_ADMISSION_METADATA_KEY,
  runtimeSchemaAdmissionMetadataRowKey,
  type RuntimeSchemaAdmissionMetadataRow
} from "./runtime_schema_admission.js";
import {
  abgFnCompositionDeclarationRef,
  constructAbgFnCompositionDeclarations,
  type AbgFnRegimeAuthority,
  type AbgFnRegimeRole
} from "./fn_composition.js";

export const CONSENSUS_GRAPH_FUNCTION_REF =
  "graph-function://abg/consensus/submitter-reviewer-rounds" as const;
export const CONSENSUS_ROUND_GRAPH_FUNCTION_REF =
  "graph-function://abg/consensus/round" as const;
export const CONSENSUS_REVIEW_ONE_PROFILE_GRAPH_FUNCTION_REF =
  "graph-function://abg/consensus/review-one-profile" as const;
export const CONSENSUS_EXACT_PANEL_FACTS_GRAPH_FUNCTION_REF =
  "graph-function://abg/consensus/exact-panel-facts" as const;

export const CONSENSUS_REVIEW_RETRY_BUDGET = 2 as const;
export const CONSENSUS_RETRYABLE_FAILURE_CLASSES = Object.freeze([
  ...RETRYABLE_RUNTIME_FAILURE_CLASS_VALUES
]);

const STANDARD_PLUGIN_REFS = Object.freeze({
  fdEvaluator: "plugin://abg/fd-evaluator",
  fpDispatch: "plugin://abg/fp-dispatch",
  fhAdmission: "plugin://abg/fh-admission"
} as const);

const STANDARD_HANDLER_REFS = Object.freeze({
  fpTransport: "handler://abg/fp/agent-transport",
  fhGate: "handler://abg/fh/gate"
} as const);

type ConsensusRoundExecution =
  ConsensusDomainValueByKind["consensus_round_execution"];
type ConsensusRoundDisposition =
  ConsensusDomainValueByKind["consensus_round_disposition"];
type ReviewerAssignment =
  ConsensusDomainValueByKind["reviewer_assignment"];
type RoundExactProjection =
  ConsensusDomainValueByKind["round_exact_projection"];
type SemanticReducerBinding =
  ConsensusDomainValueByKind["semantic_reducer_binding"];
type InitialSemanticAssessment =
  ConsensusDomainValueByKind["initial_semantic_assessment"];
type SubmitterTurnBinding =
  ConsensusDomainValueByKind["submitter_turn_binding"];
type SubmitterResponse =
  ConsensusDomainValueByKind["submitter_response"];
type PostSubmitterSemanticAssessment =
  ConsensusDomainValueByKind["post_submitter_semantic_assessment"];
type FhInteractionBinding =
  ConsensusDomainValueByKind["fh_interaction_binding"];

export interface ConsensusGtlNodes {
  readonly subject: Node;
  readonly result: Node;
  readonly roundExecution: Node;
  readonly roundDisposition: Node;
  readonly reviewerAssignment: Node;
  readonly reviewerAssignments: Node;
  readonly reviewFindings: Node;
  readonly attributedFindings: Node;
  readonly exactProjection: Node;
  readonly semanticReducerBinding: Node;
  readonly initialAssessment: Node;
  readonly submitterTurnBinding: Node;
  readonly submitterResponse: Node;
  readonly postSubmitterAssessment: Node;
  readonly fhInteractionBinding: Node;
}

export interface ConsensusGtlGraphFunctions {
  readonly reviewOneProfile: GraphFunction;
  readonly reviewPanel: GraphFunction;
  readonly exactPanelFacts: GraphFunction;
  readonly reducePanelFacts: GraphFunction;
  readonly round: GraphFunction;
  readonly boundedRounds: GraphFunction;
  readonly consensus: GraphFunction;
}

export interface ConsensusGtlNativeWitnesses {
  readonly reviewerAssignment: TypedScalarNode<ReviewerAssignment>;
  readonly reviewerAssignments: TypedVectorNode<ReviewerAssignment>;
  readonly reviewFindings: TypedScalarNode<ReviewFindings>;
  readonly attributedFindings: TypedVectorNode<ReviewFindings>;
}

export interface ConsensusGtlBody {
  readonly module: Module;
  readonly nodes: ConsensusGtlNodes;
  readonly graphFunctions: ConsensusGtlGraphFunctions;
  readonly nativeWitnesses: ConsensusGtlNativeWitnesses;
  readonly programs: readonly AdmittedCProgramDeclarationNode[];
}

interface LeafProgramSpec<
  Input,
  Output,
  SourceWitnesses extends NonEmptyTypedNodeTuple,
  TargetWitness extends TypedNodeBase
> {
  readonly graphFunctionRef: string;
  readonly vectorRef: string;
  readonly vectorName: string;
  readonly source: CInterfaceCarrier<Input, SourceWitnesses>;
  readonly target: CInterfaceCarrier<Output, readonly [TargetWitness]>;
  readonly programRef: string;
  readonly stageRole: string;
  readonly fibre: Regime;
  readonly armId: string;
  readonly operator: Operator;
  readonly evaluators?: readonly Evaluator[] | undefined;
  readonly rule?: Rule | null | undefined;
  readonly allowsSubwork?: boolean | undefined;
  readonly retryBudget?: number | undefined;
}

interface WorkflowProgramSpec<
  Input,
  Output,
  SourceWitnesses extends NonEmptyTypedNodeTuple,
  TargetWitness extends TypedNodeBase
> {
  readonly graphFunctionRef: string;
  readonly vectorRef: string;
  readonly vectorName: string;
  readonly source: CInterfaceCarrier<Input, SourceWitnesses>;
  readonly target: CInterfaceCarrier<Output, readonly [TargetWitness]>;
  readonly childRef: NodeBackedCGraphFunctionRef<
    Input,
    Output,
    SourceWitnesses,
    readonly [TargetWitness]
  >;
  readonly programRef: string;
  readonly operator: Operator;
}

interface AuthoredProgramVector {
  readonly vector: GraphVector;
  readonly program: AdmittedCProgramDeclarationNode;
  readonly regime: Regime;
  readonly stageRole: string | null;
  readonly armId: string | null;
}

function vectorDecoder<Item>(
  decodeItem: TrustedNativeDecoder<Item>,
  label: string
): TrustedNativeDecoder<readonly Item[]> {
  return (raw: unknown): readonly Item[] => {
    if (!Array.isArray(raw)) {
      throw new TypeError(`${label}: expected an array`);
    }
    return Object.freeze(raw.map((item) => decodeItem(item)));
  };
}

function consensusNode(name: string, schemaRef: string): Node {
  const slug = name
    .replaceAll(/([a-z0-9])([A-Z])/gu, "$1-$2")
    .toLowerCase();
  return constructNode({
    id: `node://abg/consensus/${slug}`,
    name,
    schema: { kind: "symbolic", ref: schemaRef },
    typeRef: `type://abg/consensus/${slug}`,
    markov: [`boundary://abg/consensus/${slug}`],
    assetSurface: {
      kind: `abg_consensus_${slug.replaceAll("-", "_")}`,
      standardsRefs: ["REQ-P-CONSENSUS"],
      proofObligationRefs: ["proof://abg/consensus/ds1-canonical-body"]
    },
    tags: ["abg:consensus", "gtl:typed-node"]
  });
}

function constructNodes(): ConsensusGtlNodes {
  const reviewerAssignment = consensusNode(
    "ReviewerAssignment",
    "schema://abg/consensus/reviewer-assignment"
  );
  const reviewFindings = consensusNode(
    "ReviewFindings",
    "schema://abg/consensus/review-findings"
  );
  return Object.freeze({
    subject: consensusNode(
      "ConsensusSubject",
      "schema://abg/consensus/subject"
    ),
    result: consensusNode(
      "ConsensusResult",
      "schema://abg/consensus/result"
    ),
    roundExecution: consensusNode(
      "ConsensusRoundExecution",
      "schema://abg/consensus/round-execution"
    ),
    roundDisposition: consensusNode(
      "ConsensusRoundDisposition",
      "schema://abg/consensus/round-disposition"
    ),
    reviewerAssignment,
    reviewerAssignments: consensusNode(
      "ReviewerAssignmentVector",
      `Vector[${reviewerAssignment.schema.ref}]`
    ),
    reviewFindings,
    attributedFindings: consensusNode(
      "AttributedFindingsVector",
      `Vector[${reviewFindings.schema.ref}]`
    ),
    exactProjection: consensusNode(
      "RoundExactProjection",
      "schema://abg/consensus/round-exact-projection"
    ),
    semanticReducerBinding: consensusNode(
      "SemanticReducerBinding",
      "schema://abg/consensus/semantic-reducer-binding"
    ),
    initialAssessment: consensusNode(
      "InitialSemanticAssessment",
      "schema://abg/consensus/initial-semantic-assessment"
    ),
    submitterTurnBinding: consensusNode(
      "SubmitterTurnBinding",
      "schema://abg/consensus/submitter-turn-binding"
    ),
    submitterResponse: consensusNode(
      "SubmitterResponse",
      "schema://abg/consensus/submitter-response"
    ),
    postSubmitterAssessment: consensusNode(
      "PostSubmitterSemanticAssessment",
      "schema://abg/consensus/post-submitter-semantic-assessment"
    ),
    fhInteractionBinding: consensusNode(
      "FhInteractionBinding",
      "schema://abg/consensus/fh-interaction-binding"
    )
  });
}

function operator(name: string, regime: Regime): Operator {
  return Object.freeze({
    name,
    regime,
    binding: `binding://abg/consensus/${name}`,
    tags: Object.freeze(["abg:consensus", "domain-operation"])
  });
}

function evaluator(
  name: string,
  regime: Regime,
  consumedFieldRefs: readonly string[]
): Evaluator {
  return Object.freeze({
    name,
    regime,
    description: `Consensus ${name} evaluator`,
    binding: `binding://abg/consensus/evaluator/${name}`,
    consumedFieldRefs: Object.freeze([...consumedFieldRefs]),
    tags: Object.freeze(["abg:consensus", "routing-evaluator"])
  });
}

function rule(name: string, outcome: string | readonly string[]): Rule {
  return Object.freeze({
    name,
    kind: "consensus_round_route",
    config: Object.freeze({
      entries: Object.freeze([
        Object.freeze({
          key: "outcome",
          value:
            typeof outcome === "string"
              ? Object.freeze({ kind: "scalar" as const, value: outcome })
              : Object.freeze({
                  kind: "string_list" as const,
                  value: Object.freeze([...outcome])
                })
        })
      ])
    }),
    tags: Object.freeze(["abg:consensus", "typed-route"])
  });
}

function roleFor(regime: Regime): AbgFnRegimeRole {
  if (regime === "F_P") return "validate";
  if (regime === "F_H") return "escalate";
  return "construct";
}

function authorityFor(regime: Regime): AbgFnRegimeAuthority {
  if (regime === "F_P") return "judgment";
  if (regime === "F_H") return "absent";
  return "evidence";
}

function vectorDeclarations(input: {
  readonly graphFunctionRef: string;
  readonly vectorRef: string;
  readonly source: readonly Node[];
  readonly target: Node;
  readonly programRef: string;
  readonly regime: Regime;
}): GraphVectorDeclarations {
  const composition = constructAbgFnCompositionDeclarations({
    contractRef: `abg.fn_composition://${input.vectorRef}`,
    hookRef: `hook://${input.vectorRef}/abg-fn-composition`,
    hostGraphFunctionRef: input.graphFunctionRef,
    hostGraphVectorRef: input.vectorRef,
    hostSourceNodeRefs: input.source.map((node) => node.id),
    hostTargetNodeRef: input.target.id,
    hostTargetSchemaRef: input.target.schema.ref,
    owningDeclarationRef: abgFnCompositionDeclarationRef({
      source: "graph_vector_declarations",
      sourceRef: input.vectorRef
    }),
    regimes: [
      Object.freeze({
        bindingRef: `regime-binding://${input.vectorRef}/${input.regime}`,
        stageRole: input.regime === "F_H" ? "human_callout" : "transform",
        regime: input.regime,
        role: roleFor(input.regime),
        order: 0,
        authority: authorityFor(input.regime),
        inputCarrierRefs: input.source.map((node) => node.id),
        outputCarrierRefs: [input.target.id],
        evidenceRefs: [`evidence://${input.vectorRef}/declared-composition`]
      })
    ],
    standardsContextRefs: ["standard://abg/gtl/c-algebra"],
    policyContextRefs: ["policy://abg/consensus/governed-rounds"],
    carrierContextRefs: [
      ...input.source.map((node) => node.id),
      input.target.id
    ],
    assuranceContextRefs: ["assurance://abg/consensus/fp-result-admission"],
    closureContractRef: `closure://${input.vectorRef}`
  });
  return graphVectorDeclarations([
    ...composition.entries,
    hogProgramRefDeclarationEntry(input.programRef)
  ]);
}

function authorLeafProgramVector<
  Input,
  Output,
  const SourceWitnesses extends NonEmptyTypedNodeTuple,
  TargetWitness extends TypedNodeBase
>(spec: LeafProgramSpec<Input, Output, SourceWitnesses, TargetWitness>): AuthoredProgramVector {
  const leaf = C.of({
    input: spec.source,
    output: spec.target,
    stageRole: spec.stageRole,
    fibre: spec.fibre,
    armId: spec.armId,
    resultBearing: true
  });
  const term =
    spec.retryBudget === undefined ? leaf : C.retry(leaf, spec.retryBudget);
  const program = declareCProgram({
    programRef: spec.programRef,
    term,
    proportionalityClass: "P1"
  });
  const vector = constructGraphVector({
    id: spec.vectorRef,
    name: spec.vectorName,
    source: [...spec.source.interface.nodes],
    target: spec.target.interface.nodes[0],
    operators: [spec.operator],
    evaluators: spec.evaluators ?? [],
    contexts: [],
    rule: spec.rule ?? null,
    allowsSubwork: spec.allowsSubwork ?? false,
    declarations: vectorDeclarations({
      graphFunctionRef: spec.graphFunctionRef,
      vectorRef: spec.vectorRef,
      source: spec.source.interface.nodes,
      target: spec.target.interface.nodes[0],
      programRef: spec.programRef,
      regime: spec.fibre
    }),
    tags: ["abg:consensus", `regime:${spec.fibre}`]
  });
  return Object.freeze({
    vector,
    program,
    regime: spec.fibre,
    stageRole: spec.stageRole,
    armId: spec.armId
  });
}

function authorWorkflowProgramVector<
  Input,
  Output,
  const SourceWitnesses extends NonEmptyTypedNodeTuple,
  TargetWitness extends TypedNodeBase
>(spec: WorkflowProgramSpec<Input, Output, SourceWitnesses, TargetWitness>): AuthoredProgramVector {
  const term = workflow.C(spec.childRef);
  const program = declareCProgram({
    programRef: spec.programRef,
    term,
    proportionalityClass: "P1"
  });
  const vector = constructGraphVector({
    id: spec.vectorRef,
    name: spec.vectorName,
    source: [...spec.source.interface.nodes],
    target: spec.target.interface.nodes[0],
    operators: [spec.operator],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: true,
    declarations: vectorDeclarations({
      graphFunctionRef: spec.graphFunctionRef,
      vectorRef: spec.vectorRef,
      source: spec.source.interface.nodes,
      target: spec.target.interface.nodes[0],
      programRef: spec.programRef,
      regime: "F_D"
    }),
    tags: ["abg:consensus", "workflow:C"]
  });
  return Object.freeze({
    vector,
    program,
    regime: "F_D",
    stageRole: null,
    armId: null
  });
}

function stableUnique(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort());
}

function reachableEffects(
  own: readonly string[],
  children: readonly GraphFunction[] = []
): readonly string[] {
  return stableUnique([
    ...own,
    ...children.flatMap((child) => [...child.effects])
  ]);
}

function effectsForAuthoredVectors(
  authored: readonly AuthoredProgramVector[],
  children: readonly GraphFunction[] = []
): readonly string[] {
  return reachableEffects(
    authored.flatMap((entry) =>
      entry.vector.operators.map(
        (operatorValue) => `effect://abg/consensus/${operatorValue.name}`
      )
    ),
    children
  );
}

function graphFunctionDeclarationsFor(input: {
  readonly programs: readonly AdmittedCProgramDeclarationNode[];
  readonly handlers: readonly GtlHogHandlerBindingDeclaration[];
  readonly pluginSelection: Readonly<
    Partial<Record<GtlPluginSelectionSeam, string>>
  > | null;
}): GraphFunctionDeclarations {
  if (input.programs.length === 0) {
    return graphFunctionDeclarations([]);
  }
  const entries: SerializedAttrEntry[] = [
    cProgramCatalogDeclarationEntry(input.programs),
    hogProgramRefDeclarationEntry(input.programs[0]!.programRef)
  ];
  if (input.handlers.length > 0) {
    entries.push(hogHandlerBindingsDeclarationEntry(input.handlers));
  }
  if (input.pluginSelection !== null) {
    entries.push(pluginSelectionDeclarationEntry(input.pluginSelection));
  }
  return graphFunctionDeclarations(entries);
}

function handlerFor(
  authored: AuthoredProgramVector
): GtlHogHandlerBindingDeclaration | null {
  if (
    authored.stageRole === null ||
    authored.armId === null ||
    authored.regime === "F_D"
  ) {
    return null;
  }
  return Object.freeze({
    programRef: authored.program.programRef,
    stageRole: authored.stageRole,
    armId: authored.armId,
    regime: authored.regime,
    handlerRef:
      authored.regime === "F_P"
        ? STANDARD_HANDLER_REFS.fpTransport
        : STANDARD_HANDLER_REFS.fhGate,
    handlerClass: "pipeline",
    handlerConfigRef: null
  });
}

function handlersFor(
  authored: readonly AuthoredProgramVector[]
): readonly GtlHogHandlerBindingDeclaration[] {
  return Object.freeze(
    authored.flatMap((candidate) => {
      const binding = handlerFor(candidate);
      return binding === null ? [] : [binding];
    })
  );
}

function collectNodes(groups: readonly (readonly Node[])[]): readonly Node[] {
  const byId = new Map<string, Node>();
  for (const node of groups.flat()) {
    const prior = byId.get(node.id);
    if (prior !== undefined && JSON.stringify(prior) !== JSON.stringify(node)) {
      throw new TypeError(`conflicting Node identity ${node.id}`);
    }
    byId.set(node.id, node);
  }
  return Object.freeze([...byId.values()]);
}

function constructInlineGraphFunction(input: {
  readonly id: string;
  readonly name: string;
  readonly inputs: readonly Node[];
  readonly outputs: readonly Node[];
  readonly carries: readonly Node[];
  readonly vectors: readonly GraphVector[];
  readonly effects: readonly string[];
  readonly declarations: GraphFunctionDeclarations;
  readonly tags?: readonly string[] | undefined;
}): GraphFunction {
  const nodes = collectNodes([
    input.carries,
    input.inputs,
    input.outputs,
    ...input.vectors.map((vector) => [...vector.source, vector.target])
  ]);
  const graph = constructGraph({
    id: `graph://${input.id}`,
    name: `${input.name}:graph`,
    inputs: input.inputs,
    outputs: input.outputs,
    nodes,
    vectors: input.vectors,
    contexts: [],
    rules: input.vectors.flatMap((vector) =>
      vector.rule === null ? [] : [vector.rule]
    ),
    effects: input.effects,
    tags: ["abg:consensus", ...(input.tags ?? [])]
  });
  return constructGraphFunction({
    id: input.id,
    name: input.name,
    environment: constructEnvRef({
      requires: input.inputs,
      provides: input.outputs,
      carries: nodes
    }),
    inputs: input.inputs,
    outputs: input.outputs,
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: `template://${input.id}`,
      graph,
      version: null
    }),
    effects: input.effects,
    declarations: input.declarations,
    tags: ["abg:consensus", ...(input.tags ?? [])]
  });
}

function canonicalOperatorValue(operatorValue: Operator): Readonly<{
  name: string;
  regime: Regime;
  binding: string;
  tags: readonly string[];
}> {
  return Object.freeze({
    name: operatorValue.name,
    regime: operatorValue.regime,
    binding: operatorValue.binding,
    tags: Object.freeze([...operatorValue.tags])
  });
}

export function deriveConsensusOperatorRegistry(
  graphFunctions: readonly GraphFunction[]
): readonly Operator[] {
  const byName = new Map<
    string,
    { readonly digest: string; readonly operator: Operator }
  >();
  for (const graphFunction of graphFunctions) {
    if (graphFunction.template.kind !== "inline_graph") continue;
    for (const vector of graphFunction.template.graph.vectors) {
      for (const operatorValue of vector.operators) {
        const canonical = canonicalOperatorValue(operatorValue);
        const digest = stableSha256Digest(canonical);
        const prior = byName.get(operatorValue.name);
        if (prior === undefined) {
          byName.set(operatorValue.name, {
            digest,
            operator: Object.freeze(canonical)
          });
          continue;
        }
        if (prior.digest !== digest) {
          throw new TypeError(
            `Consensus operator registry conflict for ${operatorValue.name}`
          );
        }
      }
    }
  }
  return Object.freeze(
    [...byName.values()]
      .sort((left, right) =>
        left.operator.name.localeCompare(right.operator.name)
      )
      .map((row) => row.operator)
  );
}

function uniqueNamed<Value extends { readonly name: string }>(
  values: readonly Value[],
  label: string
): readonly Value[] {
  const byName = new Map<string, { readonly digest: string; readonly value: Value }>();
  for (const value of values) {
    const digest = stableSha256Digest(value);
    const prior = byName.get(value.name);
    if (prior === undefined) {
      byName.set(value.name, { digest, value });
      continue;
    }
    if (prior.digest !== digest) {
      throw new TypeError(`${label} conflict for ${value.name}`);
    }
  }
  return Object.freeze(
    [...byName.values()]
      .sort((left, right) => left.value.name.localeCompare(right.value.name))
      .map((row) => row.value)
  );
}

function uniqueIdentified<Value extends { readonly id: string }>(
  values: readonly Value[],
  label: string
): readonly Value[] {
  const byId = new Map<string, { readonly digest: string; readonly value: Value }>();
  for (const value of values) {
    const digest = stableSha256Digest(value);
    const prior = byId.get(value.id);
    if (prior === undefined) {
      byId.set(value.id, { digest, value });
      continue;
    }
    if (prior.digest !== digest) {
      throw new TypeError(`${label} conflict for ${value.id}`);
    }
  }
  return Object.freeze(
    [...byId.values()]
      .sort((left, right) => left.value.id.localeCompare(right.value.id))
      .map((row) => row.value)
  );
}

function runtimeSchemaSourceIndex(
  sources: readonly ConsensusRuntimeSchemaSource[] =
    CONSENSUS_RUNTIME_SCHEMA_SOURCES
): ReadonlyMap<string, ConsensusRuntimeSchemaSource> {
  if (sources.length !== 15) {
    throw new TypeError(
      `Consensus runtime schema source family must contain 15 sources, found ${String(sources.length)}`
    );
  }
  const byRef = new Map<string, ConsensusRuntimeSchemaSource>();
  const contractKeys = new Set<string>();
  for (const source of sources) {
    if (
      source.symbolicSchemaRef.length === 0 ||
      source.contractId.length === 0 ||
      source.contractVersion.length === 0
    ) {
      throw new TypeError("Consensus runtime schema source fields must be non-empty");
    }
    if (byRef.has(source.symbolicSchemaRef)) {
      throw new TypeError(
        `duplicate Consensus runtime symbolic schema ref ${source.symbolicSchemaRef}`
      );
    }
    const contractKey = `${source.contractId}@${source.contractVersion}`;
    if (contractKeys.has(contractKey)) {
      throw new TypeError(
        `duplicate Consensus runtime schema contract key ${contractKey}`
      );
    }
    byRef.set(source.symbolicSchemaRef, source);
    contractKeys.add(contractKey);
  }
  const publicCount = sources.filter(
    (source) => source.publication === "existing_public_asset"
  ).length;
  const privateCount = sources.filter(
    (source) => source.publication === "engine_private_definition"
  ).length;
  if (publicCount !== 3 || privateCount !== 12) {
    throw new TypeError(
      `Consensus runtime schema source family must preserve 3 public and 12 private keys, found ${String(publicCount)} and ${String(privateCount)}`
    );
  }
  if (byRef.has("schema://abg/consensus/fh-pending-interaction")) {
    throw new TypeError(
      "FhPendingInteraction is runtime projection truth, not a Consensus GTL schema source"
    );
  }
  return byRef;
}

function graphFunctionContainedNodes(
  graphFunction: GraphFunction
): readonly Node[] {
  return collectNodes([
    graphFunction.inputs,
    graphFunction.outputs,
    graphFunction.environment.requires,
    graphFunction.environment.provides,
    graphFunction.environment.carries,
    graphFunction.template.kind === "inline_graph"
      ? graphFunction.template.graph.nodes
      : []
  ]);
}

export function deriveConsensusRuntimeSchemaAdmissionMetadataRows(
  graphFunctions: readonly GraphFunction[]
): readonly RuntimeSchemaAdmissionMetadataRow[] {
  const sourceByRef = runtimeSchemaSourceIndex();
  const referencedSourceRefs = new Set<string>();
  const rows: RuntimeSchemaAdmissionMetadataRow[] = [];
  const tupleKeys = new Set<string>();

  for (const graphFunction of graphFunctions) {
    for (const node of graphFunctionContainedNodes(graphFunction)) {
      if (node.schema.kind !== "symbolic") {
        throw new TypeError(
          `Consensus Node ${node.id} must use one symbolic schema source`
        );
      }
      const source = sourceByRef.get(node.schema.ref);
      if (source === undefined) {
        throw new TypeError(
          `Consensus Node ${node.id} has no runtime schema source for ${node.schema.ref}`
        );
      }
      const row = Object.freeze({
        graphFunctionId: graphFunction.id,
        nodeRef: node.id,
        symbolicSchemaRef: node.schema.ref,
        contractId: source.contractId,
        contractVersion: source.contractVersion
      });
      const tupleKey = runtimeSchemaAdmissionMetadataRowKey(row);
      if (tupleKeys.has(tupleKey)) {
        throw new TypeError(
          `duplicate Consensus runtime schema metadata tuple ${tupleKey}`
        );
      }
      tupleKeys.add(tupleKey);
      referencedSourceRefs.add(source.symbolicSchemaRef);
      rows.push(row);
    }
  }

  const unreferencedSources = [...sourceByRef.keys()].filter(
    (symbolicSchemaRef) => !referencedSourceRefs.has(symbolicSchemaRef)
  );
  if (unreferencedSources.length > 0) {
    throw new TypeError(
      `Consensus runtime schema sources are not reachable: ${unreferencedSources.join(", ")}`
    );
  }
  return canonicalizeRuntimeSchemaAdmissionMetadataRows(rows);
}

function runtimeSchemaMetadataRowJson(
  row: RuntimeSchemaAdmissionMetadataRow
): SerializedJsonValue {
  return Object.freeze({
    kind: "object" as const,
    entries: Object.freeze([
      Object.freeze({ key: "graphFunctionId", value: row.graphFunctionId }),
      Object.freeze({ key: "nodeRef", value: row.nodeRef }),
      Object.freeze({ key: "symbolicSchemaRef", value: row.symbolicSchemaRef }),
      Object.freeze({ key: "contractId", value: row.contractId }),
      Object.freeze({ key: "contractVersion", value: row.contractVersion })
    ])
  });
}

function runtimeSchemaMetadataRowsJson(
  rows: readonly RuntimeSchemaAdmissionMetadataRow[]
): SerializedJsonValue {
  return Object.freeze({
    kind: "array" as const,
    items: Object.freeze(rows.map(runtimeSchemaMetadataRowJson))
  });
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function admitRuntimeSchemaMetadataText(
  record: Readonly<Record<string, unknown>>,
  key: string,
  index: number
): string {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(
      `Consensus runtime schema metadata row ${String(index)}.${key} must be non-empty text`
    );
  }
  return value;
}

function admitRuntimeSchemaMetadataRow(
  raw: unknown,
  index: number
): RuntimeSchemaAdmissionMetadataRow {
  if (!isPlainRecord(raw)) {
    throw new TypeError(
      `Consensus runtime schema metadata row ${String(index)} must be an object`
    );
  }
  const actualKeys = Object.keys(raw);
  if (
    JSON.stringify(actualKeys) !==
    JSON.stringify(RUNTIME_SCHEMA_ADMISSION_METADATA_FIELDS)
  ) {
    throw new TypeError(
      `Consensus runtime schema metadata row ${String(index)} must have exact ordered keys`
    );
  }
  return Object.freeze({
    graphFunctionId: admitRuntimeSchemaMetadataText(
      raw,
      "graphFunctionId",
      index
    ),
    nodeRef: admitRuntimeSchemaMetadataText(raw, "nodeRef", index),
    symbolicSchemaRef: admitRuntimeSchemaMetadataText(
      raw,
      "symbolicSchemaRef",
      index
    ),
    contractId: admitRuntimeSchemaMetadataText(raw, "contractId", index),
    contractVersion: admitRuntimeSchemaMetadataText(
      raw,
      "contractVersion",
      index
    )
  });
}

export function admitConsensusRuntimeSchemaAdmissionMetadata(
  moduleValue: Module
): readonly RuntimeSchemaAdmissionMetadataRow[] {
  const entries = moduleValue.metadata.entries.filter(
    (entry) => entry.key === RUNTIME_SCHEMA_ADMISSION_METADATA_KEY
  );
  if (entries.length !== 1 || entries[0] === undefined) {
    throw new TypeError(
      `Consensus Module must contain exactly one ${RUNTIME_SCHEMA_ADMISSION_METADATA_KEY} entry`
    );
  }
  if (entries[0].value.kind !== "json_blob") {
    throw new TypeError(
      `${RUNTIME_SCHEMA_ADMISSION_METADATA_KEY} must be a json_blob`
    );
  }
  const plain = serializedJsonValueToPlain(entries[0].value.value);
  if (!Array.isArray(plain)) {
    throw new TypeError(
      `${RUNTIME_SCHEMA_ADMISSION_METADATA_KEY} must contain an array`
    );
  }
  const rows = Object.freeze(
    plain.map((row, index) => admitRuntimeSchemaMetadataRow(row, index))
  );
  const tupleKeys = rows.map(runtimeSchemaAdmissionMetadataRowKey);
  if (new Set(tupleKeys).size !== tupleKeys.length) {
    throw new TypeError(
      `${RUNTIME_SCHEMA_ADMISSION_METADATA_KEY} contains a duplicate tuple`
    );
  }
  const expected = deriveConsensusRuntimeSchemaAdmissionMetadataRows(
    moduleValue.graphFunctions
  );
  if (JSON.stringify(rows) !== JSON.stringify(expected)) {
    throw new TypeError(
      `${RUNTIME_SCHEMA_ADMISSION_METADATA_KEY} does not exactly match Module containment and native source ownership`
    );
  }
  return rows;
}

function moduleMetadata(
  graphFunctions: readonly GraphFunction[]
): SerializedAttrs {
  const runtimeSchemaRows =
    deriveConsensusRuntimeSchemaAdmissionMetadataRows(graphFunctions);
  return Object.freeze({
    entries: Object.freeze([
      Object.freeze({
        key: "design_ref",
        value: Object.freeze({
          kind: "scalar" as const,
          value: "design://abg/consensus/m01-m02-m03-free-construction"
        })
      }),
      Object.freeze({
        key: "publication_disposition",
        value: Object.freeze({ kind: "scalar" as const, value: "ds1_no_owner" })
      }),
      Object.freeze({
        key: "retryable_failure_classes",
        value: Object.freeze({
          kind: "string_list" as const,
          value: CONSENSUS_RETRYABLE_FAILURE_CLASSES
        })
      }),
      Object.freeze({
        key: RUNTIME_SCHEMA_ADMISSION_METADATA_KEY,
        value: Object.freeze({
          kind: "json_blob" as const,
          value: runtimeSchemaMetadataRowsJson(runtimeSchemaRows)
        })
      })
    ])
  });
}

function constructConsensusBody(): ConsensusGtlBody {
  const nodes = constructNodes();

  const decodeSubject = (raw: unknown): ConsensusSubject =>
    admitConsensusDomainValue(raw, "consensus_subject");
  const decodeResult = (raw: unknown): ConsensusResult =>
    admitConsensusDomainValue(raw, "consensus_result");
  const decodeRound = (raw: unknown): ConsensusRoundExecution =>
    admitConsensusDomainValue(raw, "consensus_round_execution");
  const decodeDisposition = (raw: unknown): ConsensusRoundDisposition =>
    admitConsensusDomainValue(raw, "consensus_round_disposition");
  const decodeReviewerAssignment = (raw: unknown): ReviewerAssignment =>
    admitConsensusDomainValue(raw, "reviewer_assignment");
  const decodeReviewFindings = (raw: unknown): ReviewFindings =>
    admitConsensusDomainValue(raw, "review_findings");
  const decodeExactProjection = (raw: unknown): RoundExactProjection =>
    admitConsensusDomainValue(raw, "round_exact_projection");
  const decodeReducerBinding = (raw: unknown): SemanticReducerBinding =>
    admitConsensusDomainValue(raw, "semantic_reducer_binding");
  const decodeInitialAssessment = (raw: unknown): InitialSemanticAssessment =>
    admitConsensusDomainValue(raw, "initial_semantic_assessment");
  const decodeSubmitterBinding = (raw: unknown): SubmitterTurnBinding =>
    admitConsensusDomainValue(raw, "submitter_turn_binding");
  const decodeSubmitterResponse = (raw: unknown): SubmitterResponse =>
    admitConsensusDomainValue(raw, "submitter_response");
  const decodePostAssessment = (
    raw: unknown
  ): PostSubmitterSemanticAssessment =>
    admitConsensusDomainValue(raw, "post_submitter_semantic_assessment");
  const decodeFhBinding = (raw: unknown): FhInteractionBinding =>
    admitConsensusDomainValue(raw, "fh_interaction_binding");

  const subjectWitness = typedNode({
    node: nodes.subject,
    decode: decodeSubject
  });
  const resultWitness = typedNode({
    node: nodes.result,
    decode: decodeResult
  });
  const roundWitness = typedNode({
    node: nodes.roundExecution,
    decode: decodeRound
  });
  const dispositionWitness = typedNode({
    node: nodes.roundDisposition,
    decode: decodeDisposition
  });
  const reviewerAssignmentWitness = typedNode({
    node: nodes.reviewerAssignment,
    decode: decodeReviewerAssignment
  });
  const reviewerAssignmentsWitness = typedVectorNode({
    node: nodes.reviewerAssignments,
    member: reviewerAssignmentWitness,
    decode: vectorDecoder(
      decodeReviewerAssignment,
      "ReviewerAssignmentVector"
    )
  });
  const reviewFindingsWitness = typedNode({
    node: nodes.reviewFindings,
    decode: decodeReviewFindings
  });
  const attributedFindingsWitness = typedVectorNode({
    node: nodes.attributedFindings,
    member: reviewFindingsWitness,
    decode: vectorDecoder(
      decodeReviewFindings,
      "AttributedFindingsVector"
    )
  });
  const exactProjectionWitness = typedNode({
    node: nodes.exactProjection,
    decode: decodeExactProjection
  });
  const reducerBindingWitness = typedNode({
    node: nodes.semanticReducerBinding,
    decode: decodeReducerBinding
  });
  const initialAssessmentWitness = typedNode({
    node: nodes.initialAssessment,
    decode: decodeInitialAssessment
  });
  const submitterBindingWitness = typedNode({
    node: nodes.submitterTurnBinding,
    decode: decodeSubmitterBinding
  });
  const submitterResponseWitness = typedNode({
    node: nodes.submitterResponse,
    decode: decodeSubmitterResponse
  });
  const postAssessmentWitness = typedNode({
    node: nodes.postSubmitterAssessment,
    decode: decodePostAssessment
  });
  const fhBindingWitness = typedNode({
    node: nodes.fhInteractionBinding,
    decode: decodeFhBinding
  });

  const reviewAuthored = authorLeafProgramVector({
    graphFunctionRef: CONSENSUS_REVIEW_ONE_PROFILE_GRAPH_FUNCTION_REF,
    vectorRef: "graph-vector://abg/consensus/review-one-profile",
    vectorName: "consensus.review-one-profile",
    source: cInterfaceCarrier(typedInterface(reviewerAssignmentWitness)),
    target: cInterfaceCarrier(typedInterface(reviewFindingsWitness)),
    programRef: "program://abg/consensus/review-one-profile",
    stageRole: "invoke_attributed_reviewer",
    fibre: "F_P",
    armId: "arm://abg/consensus/reviewer-turn",
    operator: operator("review-one-profile", "F_P"),
    allowsSubwork: true,
    retryBudget: CONSENSUS_REVIEW_RETRY_BUDGET
  });
  const reviewEffects = effectsForAuthoredVectors([reviewAuthored]);
  const reviewOneProfile = constructInlineGraphFunction({
    id: CONSENSUS_REVIEW_ONE_PROFILE_GRAPH_FUNCTION_REF,
    name: "consensus.review-one-profile",
    inputs: [nodes.reviewerAssignment],
    outputs: [nodes.reviewFindings],
    carries: [nodes.reviewerAssignment, nodes.reviewFindings],
    vectors: [reviewAuthored.vector],
    effects: reviewEffects,
    declarations: graphFunctionDeclarationsFor({
      programs: [reviewAuthored.program],
      handlers: [
        Object.freeze({
          programRef: reviewAuthored.program.programRef,
          stageRole: "invoke_attributed_reviewer",
          armId: "arm://abg/consensus/reviewer-turn",
          regime: "F_P",
          handlerRef: STANDARD_HANDLER_REFS.fpTransport,
          handlerClass: "pipeline",
          handlerConfigRef: null
        })
      ],
      pluginSelection: { fpDispatch: STANDARD_PLUGIN_REFS.fpDispatch }
    }),
    tags: ["module-local", "hof-child"]
  });

  const reviewPanelRef = fan_out(
    hofUnaryRef({
      graphFunction: reviewOneProfile,
      input: hofContract(reviewerAssignmentWitness),
      output: hofContract(reviewFindingsWitness)
    }),
    {
      over: hofVector(reviewerAssignmentsWitness),
      into: hofVector(attributedFindingsWitness)
    }
  );
  const reviewPanel = reviewPanelRef.graphFunction;

  const exactAuthored = authorLeafProgramVector({
    graphFunctionRef: CONSENSUS_EXACT_PANEL_FACTS_GRAPH_FUNCTION_REF,
    vectorRef: "graph-vector://abg/consensus/exact-panel-facts",
    vectorName: "consensus.exact-panel-facts",
    source: cInterfaceCarrier(typedInterface(attributedFindingsWitness)),
    target: cInterfaceCarrier(typedInterface(exactProjectionWitness)),
    programRef: "program://abg/consensus/exact-panel-facts",
    stageRole: "project_exact_panel_facts",
    fibre: "F_D",
    armId: "arm://abg/consensus/exact-panel-facts",
    operator: operator("exact-panel-facts", "F_D")
  });
  const exactEffects = effectsForAuthoredVectors([exactAuthored]);
  const exactPanelFacts = constructInlineGraphFunction({
    id: CONSENSUS_EXACT_PANEL_FACTS_GRAPH_FUNCTION_REF,
    name: "consensus.exact-panel-facts",
    inputs: [nodes.attributedFindings],
    outputs: [nodes.exactProjection],
    carries: [nodes.attributedFindings, nodes.exactProjection],
    vectors: [exactAuthored.vector],
    effects: exactEffects,
    declarations: graphFunctionDeclarationsFor({
      programs: [exactAuthored.program],
      handlers: [],
      pluginSelection: { fdEvaluator: STANDARD_PLUGIN_REFS.fdEvaluator }
    }),
    tags: ["module-local", "hof-reducer", "fd-member-facts-only"]
  });
  const reducePanelFacts = fan_in(
    hofUnaryRef({
      graphFunction: exactPanelFacts,
      input: hofVector(attributedFindingsWitness),
      output: hofContract(exactProjectionWitness)
    }),
    hofVector(attributedFindingsWitness)
  );

  const initialCloseEvaluator = evaluator(
    "initial-close",
    "F_D",
    ["field://abg/consensus/initial-assessment/disposition"]
  );
  const initialSubmitterEvaluator = evaluator(
    "initial-submitter",
    "F_D",
    [
      "field://abg/consensus/initial-assessment/disposition",
      "field://abg/consensus/round/policy-budget"
    ]
  );
  const initialFhEvaluator = evaluator(
    "initial-fh",
    "F_D",
    ["field://abg/consensus/initial-assessment/disposition"]
  );
  const postCloseEvaluator = evaluator(
    "post-close",
    "F_D",
    ["field://abg/consensus/post-assessment/disposition"]
  );
  const postRecurseEvaluator = evaluator(
    "post-recurse",
    "F_D",
    [
      "field://abg/consensus/post-assessment/disposition",
      "field://abg/consensus/round/policy-budget"
    ]
  );
  const postFhEvaluator = evaluator(
    "post-fh",
    "F_D",
    ["field://abg/consensus/post-assessment/disposition"]
  );

  const reviewerAssignmentsInterface = typedInterface(
    reviewerAssignmentsWitness
  );
  const attributedFindingsInterface = typedInterface(
    attributedFindingsWitness
  );
  const exactProjectionInterface = typedInterface(exactProjectionWitness);
  const roundInterface = typedInterface(roundWitness);
  const dispositionInterface = typedInterface(dispositionWitness);

  const roundAuthored: readonly AuthoredProgramVector[] = Object.freeze([
    authorLeafProgramVector({
      graphFunctionRef: CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
      vectorRef: "graph-vector://abg/consensus/expand-panel",
      vectorName: "consensus.expand-panel",
      source: cInterfaceCarrier(roundInterface),
      target: cInterfaceCarrier(reviewerAssignmentsInterface),
      programRef: "program://abg/consensus/expand-panel",
      stageRole: "expand_panel",
      fibre: "F_D",
      armId: "arm://abg/consensus/expand-panel",
      operator: operator("expand-panel", "F_D")
    }),
    authorLeafProgramVector({
      graphFunctionRef: CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
      vectorRef: "graph-vector://abg/consensus/project-reducer-binding",
      vectorName: "consensus.project-reducer-binding",
      source: cInterfaceCarrier(roundInterface),
      target: cInterfaceCarrier(typedInterface(reducerBindingWitness)),
      programRef: "program://abg/consensus/project-reducer-binding",
      stageRole: "project_reducer_binding",
      fibre: "F_D",
      armId: "arm://abg/consensus/project-reducer-binding",
      operator: operator("project-reducer-binding", "F_D")
    }),
    authorLeafProgramVector({
      graphFunctionRef: CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
      vectorRef: "graph-vector://abg/consensus/project-submitter-binding",
      vectorName: "consensus.project-submitter-binding",
      source: cInterfaceCarrier(roundInterface),
      target: cInterfaceCarrier(typedInterface(submitterBindingWitness)),
      programRef: "program://abg/consensus/project-submitter-binding",
      stageRole: "project_submitter_binding",
      fibre: "F_D",
      armId: "arm://abg/consensus/project-submitter-binding",
      operator: operator("project-submitter-binding", "F_D")
    }),
    authorLeafProgramVector({
      graphFunctionRef: CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
      vectorRef: "graph-vector://abg/consensus/project-fh-binding",
      vectorName: "consensus.project-fh-binding",
      source: cInterfaceCarrier(roundInterface),
      target: cInterfaceCarrier(typedInterface(fhBindingWitness)),
      programRef: "program://abg/consensus/project-fh-binding",
      stageRole: "project_fh_binding",
      fibre: "F_D",
      armId: "arm://abg/consensus/project-fh-binding",
      operator: operator("project-fh-binding", "F_D")
    }),
    authorWorkflowProgramVector({
      graphFunctionRef: CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
      vectorRef: "graph-vector://abg/consensus/review-panel",
      vectorName: "consensus.review-panel",
      source: cInterfaceCarrier(reviewerAssignmentsInterface),
      target: cInterfaceCarrier(attributedFindingsInterface),
      childRef: cGraphFunctionRef({
        graphFunction: reviewPanel,
        input: reviewerAssignmentsInterface,
        output: attributedFindingsInterface
      }),
      programRef: "program://abg/consensus/review-panel",
      operator: operator("review-panel", "F_D")
    }),
    authorWorkflowProgramVector({
      graphFunctionRef: CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
      vectorRef: "graph-vector://abg/consensus/reduce-panel-facts",
      vectorName: "consensus.reduce-panel-facts",
      source: cInterfaceCarrier(attributedFindingsInterface),
      target: cInterfaceCarrier(exactProjectionInterface),
      childRef: cGraphFunctionRef({
        graphFunction: reducePanelFacts,
        input: attributedFindingsInterface,
        output: exactProjectionInterface
      }),
      programRef: "program://abg/consensus/reduce-panel-facts",
      operator: operator("reduce-panel-facts", "F_D")
    }),
    authorLeafProgramVector({
      graphFunctionRef: CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
      vectorRef: "graph-vector://abg/consensus/reduce-round",
      vectorName: "consensus.reduce-round",
      source: cInterfaceCarrier(
        typedInterface(
          roundWitness,
          exactProjectionWitness,
          attributedFindingsWitness,
          reducerBindingWitness
        )
      ),
      target: cInterfaceCarrier(typedInterface(initialAssessmentWitness)),
      programRef: "program://abg/consensus/reduce-round",
      stageRole: "reduce_round",
      fibre: "F_P",
      armId: "arm://abg/consensus/reduce-round",
      operator: operator("reduce-round", "F_P"),
      allowsSubwork: true
    }),
    authorLeafProgramVector({
      graphFunctionRef: CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
      vectorRef: "graph-vector://abg/consensus/close-initial",
      vectorName: "consensus.close-initial",
      source: cInterfaceCarrier(
        typedInterface(roundWitness, initialAssessmentWitness)
      ),
      target: cInterfaceCarrier(dispositionInterface),
      programRef: "program://abg/consensus/close-initial",
      stageRole: "route_initial_closed",
      fibre: "F_D",
      armId: "arm://abg/consensus/close-initial",
      operator: operator("close-initial", "F_D"),
      evaluators: [initialCloseEvaluator],
      rule: rule("initial-closed", "closed_done")
    }),
    authorLeafProgramVector({
      graphFunctionRef: CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
      vectorRef: "graph-vector://abg/consensus/submitter-response",
      vectorName: "consensus.submitter-response",
      source: cInterfaceCarrier(
        typedInterface(
          roundWitness,
          initialAssessmentWitness,
          submitterBindingWitness
        )
      ),
      target: cInterfaceCarrier(typedInterface(submitterResponseWitness)),
      programRef: "program://abg/consensus/submitter-response",
      stageRole: "submitter_response",
      fibre: "F_P",
      armId: "arm://abg/consensus/submitter-response",
      operator: operator("submitter-response", "F_P"),
      evaluators: [initialSubmitterEvaluator],
      rule: rule("initial-submitter", "submitter_turn"),
      allowsSubwork: true
    }),
    authorLeafProgramVector({
      graphFunctionRef: CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
      vectorRef: "graph-vector://abg/consensus/fh-initial",
      vectorName: "consensus.fh-initial",
      source: cInterfaceCarrier(
        typedInterface(roundWitness, initialAssessmentWitness, fhBindingWitness)
      ),
      target: cInterfaceCarrier(dispositionInterface),
      programRef: "program://abg/consensus/fh-initial",
      stageRole: "hold_initial_for_fh",
      fibre: "F_H",
      armId: "arm://abg/consensus/fh-initial",
      operator: operator("fh-initial", "F_H"),
      evaluators: [initialFhEvaluator],
      rule: rule("initial-fh", "escalate_fh")
    }),
    authorLeafProgramVector({
      graphFunctionRef: CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
      vectorRef: "graph-vector://abg/consensus/reassess-round",
      vectorName: "consensus.reassess-round",
      source: cInterfaceCarrier(
        typedInterface(
          roundWitness,
          exactProjectionWitness,
          attributedFindingsWitness,
          initialAssessmentWitness,
          submitterResponseWitness,
          reducerBindingWitness
        )
      ),
      target: cInterfaceCarrier(typedInterface(postAssessmentWitness)),
      programRef: "program://abg/consensus/reassess-round",
      stageRole: "reassess_round",
      fibre: "F_P",
      armId: "arm://abg/consensus/reassess-round",
      operator: operator("reassess-round", "F_P"),
      allowsSubwork: true
    }),
    authorLeafProgramVector({
      graphFunctionRef: CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
      vectorRef: "graph-vector://abg/consensus/close-post-submitter",
      vectorName: "consensus.close-post-submitter",
      source: cInterfaceCarrier(
        typedInterface(roundWitness, postAssessmentWitness)
      ),
      target: cInterfaceCarrier(dispositionInterface),
      programRef: "program://abg/consensus/close-post-submitter",
      stageRole: "route_post_closed",
      fibre: "F_D",
      armId: "arm://abg/consensus/close-post-submitter",
      operator: operator("close-post-submitter", "F_D"),
      evaluators: [postCloseEvaluator],
      rule: rule("post-closed", "closed_done")
    }),
    authorLeafProgramVector({
      graphFunctionRef: CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
      vectorRef: "graph-vector://abg/consensus/recurse-post-submitter",
      vectorName: "consensus.recurse-post-submitter",
      source: cInterfaceCarrier(
        typedInterface(roundWitness, postAssessmentWitness)
      ),
      target: cInterfaceCarrier(dispositionInterface),
      programRef: "program://abg/consensus/recurse-post-submitter",
      stageRole: "route_post_recurse",
      fibre: "F_D",
      armId: "arm://abg/consensus/recurse-post-submitter",
      operator: operator("recurse-post-submitter", "F_D"),
      evaluators: [postRecurseEvaluator],
      rule: rule("post-recurse", "recurse_next_round")
    }),
    authorLeafProgramVector({
      graphFunctionRef: CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
      vectorRef: "graph-vector://abg/consensus/fh-post-submitter",
      vectorName: "consensus.fh-post-submitter",
      source: cInterfaceCarrier(
        typedInterface(roundWitness, postAssessmentWitness, fhBindingWitness)
      ),
      target: cInterfaceCarrier(dispositionInterface),
      programRef: "program://abg/consensus/fh-post-submitter",
      stageRole: "hold_post_for_fh",
      fibre: "F_H",
      armId: "arm://abg/consensus/fh-post-submitter",
      operator: operator("fh-post-submitter", "F_H"),
      evaluators: [postFhEvaluator],
      rule: rule("post-fh", "escalate_fh")
    })
  ]);
  const roundEffects = effectsForAuthoredVectors(
    roundAuthored,
    [reviewPanel, reducePanelFacts]
  );
  const round = constructInlineGraphFunction({
    id: CONSENSUS_ROUND_GRAPH_FUNCTION_REF,
    name: "consensus.round",
    inputs: [nodes.roundExecution],
    outputs: [nodes.roundDisposition],
    carries: [nodes.roundExecution, nodes.roundDisposition],
    vectors: roundAuthored.map((entry) => entry.vector),
    effects: roundEffects,
    declarations: graphFunctionDeclarationsFor({
      programs: roundAuthored.map((entry) => entry.program),
      handlers: handlersFor(roundAuthored),
      pluginSelection: {
        fdEvaluator: STANDARD_PLUGIN_REFS.fdEvaluator,
        fpDispatch: STANDARD_PLUGIN_REFS.fpDispatch,
        fhAdmission: STANDARD_PLUGIN_REFS.fhAdmission
      }
    }),
    tags: ["module-local", "recursive-operand"]
  });
  const boundedRounds = recurse(
    round,
    Object.freeze({
      name: "consensus-round-terminal",
      regime: "F_D",
      description:
        "Admitted round disposition is closed_done or escalate_fh",
      binding: "binding://abg/consensus/round-terminal",
      consumedFieldRefs: Object.freeze([
        "field://abg/consensus/round-disposition/outcome"
      ]),
      tags: Object.freeze([
        "abg:consensus",
        "termination",
        "terminal:closed_done",
        "terminal:escalate_fh"
      ])
    }),
    {
      mode: "rebind",
      binding: "binding://abg/consensus/next-round",
      requiresParentEvaluation: true,
      additional: Object.freeze({
        entries: Object.freeze([
          Object.freeze({
            key: "foldback_law",
            value: Object.freeze({
              kind: "scalar" as const,
              value: "append_outcome_preserve_cumulative_lineage"
            })
          }),
          Object.freeze({
            key: "foldback_outcome",
            value: Object.freeze({
              kind: "scalar" as const,
              value: "recurse_next_round"
            })
          })
        ])
      })
    }
  );

  const outerAuthored: readonly AuthoredProgramVector[] = Object.freeze([
    authorLeafProgramVector({
      graphFunctionRef: CONSENSUS_GRAPH_FUNCTION_REF,
      vectorRef: "graph-vector://abg/consensus/seed-round",
      vectorName: "consensus.seed-round",
      source: cInterfaceCarrier(typedInterface(subjectWitness)),
      target: cInterfaceCarrier(roundInterface),
      programRef: "program://abg/consensus/seed-round",
      stageRole: "seed_round",
      fibre: "F_D",
      armId: "arm://abg/consensus/seed-round",
      operator: operator("seed-round", "F_D")
    }),
    authorWorkflowProgramVector({
      graphFunctionRef: CONSENSUS_GRAPH_FUNCTION_REF,
      vectorRef: "graph-vector://abg/consensus/bounded-rounds",
      vectorName: "consensus.bounded-rounds",
      source: cInterfaceCarrier(roundInterface),
      target: cInterfaceCarrier(dispositionInterface),
      childRef: cGraphFunctionRef({
        graphFunction: boundedRounds,
        input: roundInterface,
        output: dispositionInterface
      }),
      programRef: "program://abg/consensus/bounded-rounds",
      operator: operator("bounded-rounds", "F_D")
    }),
    authorLeafProgramVector({
      graphFunctionRef: CONSENSUS_GRAPH_FUNCTION_REF,
      vectorRef: "graph-vector://abg/consensus/project-result",
      vectorName: "consensus.project-result",
      source: cInterfaceCarrier(dispositionInterface),
      target: cInterfaceCarrier(typedInterface(resultWitness)),
      programRef: "program://abg/consensus/project-result",
      stageRole: "project_closed_result",
      fibre: "F_D",
      armId: "arm://abg/consensus/project-result",
      operator: operator("project-result", "F_D"),
      evaluators: [
        evaluator("project-closed-result", "F_D", [
          "field://abg/consensus/round-disposition/outcome"
        ])
      ],
      rule: rule("project-terminal-result", ["closed_done", "escalate_fh"])
    })
  ]);
  const consensusEffects = effectsForAuthoredVectors(
    outerAuthored,
    [boundedRounds]
  );
  const consensus = constructInlineGraphFunction({
    id: CONSENSUS_GRAPH_FUNCTION_REF,
    name: "consensus.submitter-reviewer-rounds",
    inputs: [nodes.subject],
    outputs: [nodes.result],
    carries: [nodes.subject, nodes.result],
    vectors: outerAuthored.map((entry) => entry.vector),
    effects: consensusEffects,
    declarations: graphFunctionDeclarationsFor({
      programs: outerAuthored.map((entry) => entry.program),
      handlers: [],
      pluginSelection: { fdEvaluator: STANDARD_PLUGIN_REFS.fdEvaluator }
    }),
    tags: ["canonical-target", "ds1-no-catalog-owner"]
  });

  const graphFunctions: ConsensusGtlGraphFunctions = Object.freeze({
    reviewOneProfile,
    reviewPanel,
    exactPanelFacts,
    reducePanelFacts,
    round,
    boundedRounds,
    consensus
  });
  const graphFunctionValues: readonly GraphFunction[] = Object.freeze([
    reviewOneProfile,
    reviewPanel,
    exactPanelFacts,
    reducePanelFacts,
    round,
    boundedRounds,
    consensus
  ]);
  const graphs: readonly Graph[] = uniqueIdentified(
    graphFunctionValues.flatMap((graphFunction) =>
      graphFunction.template.kind === "inline_graph"
        ? [graphFunction.template.graph]
        : []
    ),
    "Consensus graph registry"
  );
  const allVectors: readonly GraphVector[] = graphFunctionValues.flatMap(
    (graphFunction) =>
      graphFunction.template.kind === "inline_graph"
        ? [...graphFunction.template.graph.vectors]
        : []
  );
  const moduleInit: ModuleInit = {
    name: "abg.consensus.ds1",
    graphs,
    graphFunctions: graphFunctionValues,
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [],
    roles: [],
    operators: deriveConsensusOperatorRegistry(graphFunctionValues),
    evaluators: uniqueNamed(
      allVectors.flatMap((vector) => [...vector.evaluators]),
      "Consensus evaluator registry"
    ),
    rules: uniqueNamed(
      allVectors.flatMap((vector) =>
        vector.rule === null ? [] : [vector.rule]
      ),
      "Consensus rule registry"
    ),
    imports: [],
    policyHooks: emptySerializedAttrs(),
    metadata: moduleMetadata(graphFunctionValues)
  };
  const module = constructModule(moduleInit);
  admitConsensusRuntimeSchemaAdmissionMetadata(module);

  return Object.freeze({
    module,
    nodes,
    graphFunctions,
    nativeWitnesses: Object.freeze({
      reviewerAssignment: reviewerAssignmentWitness,
      reviewerAssignments: reviewerAssignmentsWitness,
      reviewFindings: reviewFindingsWitness,
      attributedFindings: attributedFindingsWitness
    }),
    programs: Object.freeze([
      reviewAuthored.program,
      exactAuthored.program,
      ...roundAuthored.map((entry) => entry.program),
      ...outerAuthored.map((entry) => entry.program)
    ])
  });
}

export const ABG_CONSENSUS_GTL_BODY = constructConsensusBody();
export const ABG_CONSENSUS_GTL_MODULE = ABG_CONSENSUS_GTL_BODY.module;
