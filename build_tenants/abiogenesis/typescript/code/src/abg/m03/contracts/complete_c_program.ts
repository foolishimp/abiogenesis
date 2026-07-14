// Implements: T-271; REQ-L-GTL3-C-ALGEBRA-001..-017;
// REQ-R-ABG3-CCALL-001..-017. The compiler seals one admitted C tree before
// effects. Runtime consumes the plan and never reparses authored syntax.

import {
  admitCProgramSyntax,
  cInterfaceContractRef,
  type CProgramDeclarationNode,
  type CProgramNode
} from "../../../gtl/m01/algebra/c_algebra.js";
import type {
  GraphFunction,
  GraphVector
} from "../../../gtl/m01/contracts/carriers.js";
import type { Module } from "../../../gtl/m02/contracts/carriers.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import type { RuntimeRegime } from "./carriers.js";
import {
  collectRawCProgramCandidates
} from "./graph_vector_c_program_compiler.js";
import type {
  CompiledGraphVectorCProgramBinding
} from "./graph_vector_c_program_compiler.js";
import {
  resolveAbgFnCompositionSelection,
  type AbgFnCompositionSelection,
  type AbgFnComputeStageRole,
  type AbgFnRegimeBinding
} from "./fn_composition.js";

export const COMPLETE_C_PROGRAM_DIAGNOSTIC_ID_VALUES = Object.freeze([
  "gtl-c-program-admission-invalid",
  "gtl-c-program-authority-mismatch",
  "gtl-c-program-carrier-discontinuity",
  "gtl-c-program-result-cardinality-invalid",
  "gtl-c-program-composition-binding-missing",
  "gtl-c-program-composition-binding-ambiguous",
  "gtl-c-program-child-unresolved",
  "gtl-c-program-child-interface-mismatch",
  "gtl-c-program-batch-shape-invalid",
  "gtl-c-program-recursive-shape-unrealized"
] as const);

export type CompleteCProgramDiagnosticId =
  (typeof COMPLETE_C_PROGRAM_DIAGNOSTIC_ID_VALUES)[number];

export type CompleteCProgramResultCardinality =
  | "zero"
  | "one"
  | "many"
  | "unresolved";

export interface CompleteCProgramDiagnostic {
  readonly kind: "complete_c_program_diagnostic";
  readonly classification: "invalid_program" | "semantic_not_realized";
  readonly diagnosticId: CompleteCProgramDiagnosticId;
  readonly path: string;
  readonly expectedRelation: string;
  readonly actualRelation: string;
  readonly evidenceRefs: readonly string[];
  readonly requirementRefs: readonly string[];
}

export interface CompositionLocusBinding {
  readonly kind: "composition_locus_binding";
  readonly bindingRef: string;
  readonly bindingDigest: `sha256:${string}`;
  readonly compositionSelectionRef: string;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly regimeBindingRef: string;
  readonly domainStageRole: string | null;
  readonly compositionStageRole: AbgFnComputeStageRole;
  readonly regime: RuntimeRegime;
  readonly armId: string;
  readonly sequenceOrdinal: number;
  readonly taskOrdinal: number | null;
}

interface CompiledCPlanNodeBasis {
  readonly nodeRef: string;
  readonly nodeDigest: `sha256:${string}`;
  readonly sourcePath: string;
  readonly parentPath: string | null;
  readonly sourceNodeDigest: `sha256:${string}`;
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly resultCardinality: CompleteCProgramResultCardinality;
  readonly taskOrdinal: number | null;
}

export interface CompiledCStageLeaf extends CompiledCPlanNodeBasis {
  readonly kind: "compiled_c_stage_leaf";
  readonly domainStageRole: string;
  readonly fibre: RuntimeRegime;
  readonly armId: string;
  readonly resultBearing: boolean;
  readonly instructionCategoryRefs: readonly string[];
  readonly compositionBinding: CompositionLocusBinding;
}

export interface CompiledCIdentity extends CompiledCPlanNodeBasis {
  readonly kind: "compiled_c_identity";
}

export interface CompiledCSequence extends CompiledCPlanNodeBasis {
  readonly kind: "compiled_c_sequence";
  readonly sourceConstructor: "c_compose" | "c_edge";
  readonly children: readonly CompiledCPlanNode[];
}

export interface CompiledCWorkflowLift extends CompiledCPlanNodeBasis {
  readonly kind: "compiled_c_workflow_lift";
  readonly childAuthoredRef: string;
  readonly childGraphFunctionRef: string;
  readonly childGraphFunctionDigest: `sha256:${string}`;
  readonly childOuterContractRef: null;
  readonly childWireContractCertified: false;
  readonly evidenceClass: "sub_traversal";
  readonly compositionBinding: CompositionLocusBinding;
}

export interface CompiledCBatchTask {
  readonly kind: "compiled_c_batch_task";
  readonly taskRef: string;
  readonly taskDigest: `sha256:${string}`;
  readonly ordinal: number;
  readonly taskOrdinal: number;
  readonly child: CompiledCPlanNode;
}

export interface CompiledCCompleteBatch extends CompiledCPlanNodeBasis {
  readonly kind: "compiled_c_complete_batch";
  readonly batchRef: string;
  readonly tasks: readonly CompiledCBatchTask[];
}

export interface CompiledCCompleteRetry extends CompiledCPlanNodeBasis {
  readonly kind: "compiled_c_complete_retry";
  readonly maxAttempts: number;
  readonly retryPolicyRef: string;
  readonly retryPolicyDigest: `sha256:${string}`;
  readonly child: CompiledCPlanNode;
}

export type CompiledCPlanNode =
  | CompiledCStageLeaf
  | CompiledCIdentity
  | CompiledCSequence
  | CompiledCWorkflowLift
  | CompiledCCompleteBatch
  | CompiledCCompleteRetry;

export interface CompiledCProgramPlan {
  readonly kind: "compiled_c_program_plan";
  readonly planRef: string;
  readonly planDigest: `sha256:${string}`;
  readonly programRef: string;
  readonly sourceProgramDigest: `sha256:${string}`;
  readonly programBindingDigest: `sha256:${string}`;
  readonly moduleName: string;
  readonly moduleDigest: `sha256:${string}`;
  readonly executionGraphFunctionRef: string;
  readonly executionGraphFunctionDigest: `sha256:${string}`;
  readonly compositionOwnerGraphFunctionRef: string;
  readonly compositionOwnerGraphFunctionDigest: `sha256:${string}`;
  readonly graphVectorRef: string;
  readonly graphVectorDigest: `sha256:${string}`;
  readonly compositionSelectionRef: string;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly resultCardinality: "one";
  readonly authoredNodeCount: number;
  readonly invokingLocusCount: number;
  readonly root: CompiledCPlanNode;
}

export interface CompleteCProgramCompiled {
  readonly kind: "complete_c_program_compilation";
  readonly status: "compiled";
  readonly plan: CompiledCProgramPlan;
  readonly diagnostics: readonly [];
}

export interface CompleteCProgramRefused {
  readonly kind: "complete_c_program_compilation";
  readonly status: "invalid" | "semantic_not_realized";
  readonly plan: null;
  readonly diagnostics: readonly CompleteCProgramDiagnostic[];
}

export type CompleteCProgramCompilation =
  | CompleteCProgramCompiled
  | CompleteCProgramRefused;

export interface CompileCompleteCProgramInput {
  readonly module: Module;
  readonly executionGraphFunction: GraphFunction;
  readonly compositionOwnerGraphFunction: GraphFunction;
  readonly graphVector: GraphVector;
  readonly programBinding: CompiledGraphVectorCProgramBinding;
  readonly program: unknown;
  readonly composition: AbgFnCompositionSelection;
}

type DraftNode =
  | DraftStage
  | DraftIdentity
  | DraftSequence
  | DraftWorkflow
  | DraftBatch
  | DraftRetry;

interface DraftBasis {
  source: CProgramNode;
  sourcePath: string;
  parentPath: string | null;
  inputCarrierRef: string;
  outputCarrierRef: string;
  resultCardinality: CompleteCProgramResultCardinality;
  taskOrdinal: number | null;
}

interface DraftStage extends DraftBasis {
  kind: "stage";
  compositionBinding: CompositionLocusBinding;
}

interface DraftIdentity extends DraftBasis {
  kind: "identity";
}

interface DraftSequence extends DraftBasis {
  kind: "sequence";
  sourceConstructor: "c_compose" | "c_edge";
  children: DraftNode[];
}

interface DraftWorkflow extends DraftBasis {
  kind: "workflow";
  child: GraphFunction;
  compositionBinding: CompositionLocusBinding;
}

interface DraftBatchTask {
  ordinal: number;
  taskOrdinal: number;
  child: DraftNode;
}

interface DraftBatch extends DraftBasis {
  kind: "batch";
  tasks: DraftBatchTask[];
}

interface DraftRetry extends DraftBasis {
  kind: "retry";
  child: DraftNode;
}

class CompilationFailure extends Error {
  public constructor(public readonly diagnostic: CompleteCProgramDiagnostic) {
    super(diagnostic.actualRelation);
    this.name = "CompilationFailure";
  }
}

interface CompilationState {
  invocationOrdinal: number;
  taskOrdinal: number;
  authoredNodeCount: number;
}

const REQUIREMENT_REFS = Object.freeze([
  "REQ-L-GTL3-C-ALGEBRA-001",
  "REQ-L-GTL3-C-ALGEBRA-014",
  "REQ-L-GTL3-C-ALGEBRA-016",
  "REQ-R-ABG3-CCALL-014"
]);

function diagnostic(input: {
  readonly classification?: "invalid_program" | "semantic_not_realized";
  readonly diagnosticId: CompleteCProgramDiagnosticId;
  readonly path: string;
  readonly expectedRelation: string;
  readonly actualRelation: string;
  readonly evidenceRefs?: readonly string[];
}): CompleteCProgramDiagnostic {
  return Object.freeze({
    kind: "complete_c_program_diagnostic" as const,
    classification: input.classification ?? "invalid_program",
    diagnosticId: input.diagnosticId,
    path: input.path,
    expectedRelation: input.expectedRelation,
    actualRelation: input.actualRelation,
    evidenceRefs: Object.freeze([...(input.evidenceRefs ?? [])]),
    requirementRefs: REQUIREMENT_REFS
  });
}

function fail(input: Parameters<typeof diagnostic>[0]): never {
  throw new CompilationFailure(diagnostic(input));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function exactGraphFunction(input: {
  readonly module: Module;
  readonly ref: string;
  readonly path: string;
}): GraphFunction {
  const matches = input.module.graphFunctions.filter(
    (candidate) => candidate.id === input.ref || candidate.name === input.ref
  );
  const selected = matches[0];
  if (matches.length !== 1 || selected === undefined) {
    fail({
      diagnosticId: "gtl-c-program-child-unresolved",
      path: input.path,
      expectedRelation: "one exact Module-contained GraphFunction",
      actualRelation: `${JSON.stringify(input.ref)} resolves ${String(matches.length)} times`,
      evidenceRefs: [input.module.name]
    });
  }
  return selected;
}

function assertCurrentAuthority(input: CompileCompleteCProgramInput): void {
  const exactMember = (candidate: GraphFunction): boolean =>
    input.module.graphFunctions.filter((row) => row.id === candidate.id).length === 1 &&
    stableJsonEquals(
      input.module.graphFunctions.find((row) => row.id === candidate.id),
      candidate
    );
  if (
    !exactMember(input.executionGraphFunction) ||
    !exactMember(input.compositionOwnerGraphFunction)
  ) {
    fail({
      diagnosticId: "gtl-c-program-authority-mismatch",
      path: "$.module.graphFunctions",
      expectedRelation: "exact execution and composition-owner GraphFunctions in selected Module",
      actualRelation: "selected GraphFunction authority is absent, duplicated, or stale",
      evidenceRefs: [input.module.name]
    });
  }
  if (input.compositionOwnerGraphFunction.template.kind !== "inline_graph") {
    fail({
      diagnosticId: "gtl-c-program-authority-mismatch",
      path: "$.compositionOwnerGraphFunction.template",
      expectedRelation: "one inline Graph containing the selected GraphVector",
      actualRelation: input.compositionOwnerGraphFunction.template.kind
    });
  }
  const vectors = input.compositionOwnerGraphFunction.template.graph.vectors.filter(
    (candidate) => candidate.id === input.graphVector.id
  );
  if (vectors.length !== 1 || !stableJsonEquals(vectors[0], input.graphVector)) {
    fail({
      diagnosticId: "gtl-c-program-authority-mismatch",
      path: "$.graphVector",
      expectedRelation: "one exact selected GraphVector at its composition owner",
      actualRelation: `selected vector resolves ${String(vectors.length)} times or differs`,
      evidenceRefs: [input.graphVector.id]
    });
  }
  const host = input.composition.contract.host;
  if (
    host.graphFunctionRef !== input.compositionOwnerGraphFunction.id ||
    host.graphVectorRef !== input.graphVector.id ||
    !stableJsonEquals(
      host.sourceNodeRefs,
      input.graphVector.source.map((node) => node.id)
    ) ||
    host.targetNodeRef !== input.graphVector.target.id
  ) {
    fail({
      diagnosticId: "gtl-c-program-authority-mismatch",
      path: "$.composition.contract.host",
      expectedRelation: "composition host equal to selected owner and GraphVector",
      actualRelation: "composition selection does not preserve selected authority",
      evidenceRefs: [input.composition.selectionRef]
    });
  }
  let currentComposition: AbgFnCompositionSelection;
  try {
    currentComposition = resolveAbgFnCompositionSelection({
      vector: input.graphVector,
      graphFunction: input.compositionOwnerGraphFunction
    });
  } catch (error: unknown) {
    fail({
      diagnosticId: "gtl-c-program-authority-mismatch",
      path: "$.composition",
      expectedRelation: "one current composition selection from its owner",
      actualRelation: errorMessage(error),
      evidenceRefs: [input.graphVector.id]
    });
  }
  if (!stableJsonEquals(currentComposition, input.composition)) {
    fail({
      diagnosticId: "gtl-c-program-authority-mismatch",
      path: "$.composition",
      expectedRelation: "submitted composition equals current owner-derived selection",
      actualRelation: "composition selection is stale or caller-substituted",
      evidenceRefs: [input.composition.selectionRef]
    });
  }
}

function combineCardinality(
  left: CompleteCProgramResultCardinality,
  right: CompleteCProgramResultCardinality
): CompleteCProgramResultCardinality {
  if (left === "unresolved" || right === "unresolved") return "unresolved";
  if (left === "many" || right === "many") return "many";
  if (left === "one" && right === "one") return "many";
  if (left === "one" || right === "one") return "one";
  return "zero";
}

function compositionBinding(input: {
  readonly composition: AbgFnCompositionSelection;
  readonly sourcePath: string;
  readonly domainStageRole: string | null;
  readonly regime: RuntimeRegime | null;
  readonly armId: string;
  readonly sequenceOrdinal: number;
  readonly taskOrdinal: number | null;
}): CompositionLocusBinding {
  const regimes = input.regime === null
    ? input.composition.contract.regimes
    : input.composition.contract.regimes.filter(
        (row) => row.regime === input.regime
      );
  if (regimes.length === 0) {
    fail({
      diagnosticId: "gtl-c-program-composition-binding-missing",
      path: input.sourcePath,
      expectedRelation: "one composition row with the exact declared fibre",
      actualRelation: `no row matches ${String(input.regime)}`,
      evidenceRefs: [input.composition.selectionRef]
    });
  }
  let selected: AbgFnRegimeBinding | undefined;
  if (regimes.length === 1) {
    selected = regimes[0];
  } else {
    const ordered = regimes.filter(
      (row) => row.order === input.sequenceOrdinal
    );
    if (ordered.length === 1) selected = ordered[0];
  }
  if (selected === undefined) {
    fail({
      diagnosticId: "gtl-c-program-composition-binding-ambiguous",
      path: input.sourcePath,
      expectedRelation: "unique fibre row or exact depth-first invocation order",
      actualRelation: `${String(regimes.length)} candidate rows at invocation ordinal ${String(input.sequenceOrdinal)}`,
      evidenceRefs: [input.composition.selectionRef]
    });
  }
  const basis = Object.freeze({
    kind: "composition_locus_binding" as const,
    compositionSelectionRef: input.composition.selectionRef,
    compositionRef: input.composition.contract.contractRef,
    compositionDigest: input.composition.contract.contractDigest,
    regimeBindingRef: selected.bindingRef,
    domainStageRole: input.domainStageRole,
    compositionStageRole: selected.stageRole,
    regime: selected.regime,
    armId: input.armId,
    sequenceOrdinal: input.sequenceOrdinal,
    taskOrdinal: input.taskOrdinal
  });
  const bindingDigest = stableSha256Digest(basis);
  return Object.freeze({
    ...basis,
    bindingRef: `abg://c-program-locus/${bindingDigest.slice("sha256:".length)}`,
    bindingDigest
  });
}

function directWorkflowRefs(term: CProgramNode): readonly string[] {
  switch (term.kind) {
    case "c_of":
    case "c_identity":
      return Object.freeze([]);
    case "c_workflow":
      return Object.freeze([term.graphFunctionRef]);
    case "c_compose":
      return Object.freeze([
        ...directWorkflowRefs(term.left),
        ...directWorkflowRefs(term.right)
      ]);
    case "c_edge":
      return Object.freeze([
        ...directWorkflowRefs(term.transform),
        ...directWorkflowRefs(term.evaluate),
        ...directWorkflowRefs(term.consequence)
      ]);
    case "c_batch":
      return Object.freeze(term.tasks.flatMap(directWorkflowRefs));
    case "c_retry":
      return directWorkflowRefs(term.term);
  }
}

function graphFunctionCanReach(input: {
  readonly module: Module;
  readonly from: GraphFunction;
  readonly targetRef: string;
  readonly visited: ReadonlySet<string>;
}): boolean {
  if (input.visited.has(input.from.id)) return false;
  const visited = new Set(input.visited);
  visited.add(input.from.id);
  const candidates = collectRawCProgramCandidates(input.from.declarations);
  for (const candidate of candidates.candidates) {
    const admission = admitCProgramSyntax(candidate.candidate);
    if (!admission.accepted || admission.program === null) continue;
    for (const ref of directWorkflowRefs(admission.program.term)) {
      const matches = input.module.graphFunctions.filter(
        (row) => row.id === ref || row.name === ref
      );
      const child = matches[0];
      if (matches.length !== 1 || child === undefined) continue;
      if (child.id === input.targetRef) return true;
      if (
        graphFunctionCanReach({
          module: input.module,
          from: child,
          targetRef: input.targetRef,
          visited
        })
      ) {
        return true;
      }
    }
  }
  return false;
}

function compileDraft(input: {
  readonly term: CProgramNode;
  readonly sourcePath: string;
  readonly parentPath: string | null;
  readonly taskOrdinal: number | null;
  readonly state: CompilationState;
  readonly source: CompileCompleteCProgramInput;
}): DraftNode {
  const { term } = input;
  input.state.authoredNodeCount += 1;
  const basis = {
    source: term,
    sourcePath: input.sourcePath,
    parentPath: input.parentPath,
    inputCarrierRef: term.inputCarrierRef,
    outputCarrierRef: term.outputCarrierRef,
    taskOrdinal: input.taskOrdinal
  };
  switch (term.kind) {
    case "c_of": {
      const ordinal = input.state.invocationOrdinal++;
      return {
        ...basis,
        kind: "stage",
        resultCardinality: term.resultBearing ? "one" : "zero",
        compositionBinding: compositionBinding({
          composition: input.source.composition,
          sourcePath: input.sourcePath,
          domainStageRole: term.stageRole,
          regime: term.fibre,
          armId: term.armId,
          sequenceOrdinal: ordinal,
          taskOrdinal: input.taskOrdinal
        })
      };
    }
    case "c_identity":
      if (term.inputCarrierRef !== term.outputCarrierRef) {
        fail({
          diagnosticId: "gtl-c-program-carrier-discontinuity",
          path: input.sourcePath,
          expectedRelation: "C.id input and output carrier equality",
          actualRelation: `${term.inputCarrierRef} != ${term.outputCarrierRef}`
        });
      }
      return { ...basis, kind: "identity", resultCardinality: "zero" };
    case "c_compose": {
      if (term.left.outputCarrierRef !== term.right.inputCarrierRef) {
        fail({
          diagnosticId: "gtl-c-program-carrier-discontinuity",
          path: input.sourcePath,
          expectedRelation: "left output carrier equals right input carrier",
          actualRelation: `${term.left.outputCarrierRef} != ${term.right.inputCarrierRef}`
        });
      }
      const children = [
        compileDraft({
          ...input,
          term: term.left,
          sourcePath: `${input.sourcePath}.left`,
          parentPath: input.sourcePath
        }),
        compileDraft({
          ...input,
          term: term.right,
          sourcePath: `${input.sourcePath}.right`,
          parentPath: input.sourcePath
        })
      ];
      return {
        ...basis,
        kind: "sequence",
        sourceConstructor: "c_compose",
        resultCardinality: "unresolved",
        children
      };
    }
    case "c_edge": {
      const fields = [term.transform, term.evaluate, term.consequence];
      for (let index = 0; index < fields.length - 1; index += 1) {
        const left = fields[index]!;
        const right = fields[index + 1]!;
        if (left.outputCarrierRef !== right.inputCarrierRef) {
          fail({
            diagnosticId: "gtl-c-program-carrier-discontinuity",
            path: input.sourcePath,
            expectedRelation: "C.edge field carrier continuity",
            actualRelation: `${left.outputCarrierRef} != ${right.inputCarrierRef}`
          });
        }
      }
      return {
        ...basis,
        kind: "sequence",
        sourceConstructor: "c_edge",
        resultCardinality: "unresolved",
        children: ["transform", "evaluate", "consequence"].map(
          (field, index) =>
            compileDraft({
              ...input,
              term: fields[index]!,
              sourcePath: `${input.sourcePath}.${field}`,
              parentPath: input.sourcePath
            })
        )
      };
    }
    case "c_workflow": {
      const child = exactGraphFunction({
        module: input.source.module,
        ref: term.graphFunctionRef,
        path: `${input.sourcePath}.graphFunctionRef`
      });
      if (
        child.id === input.source.executionGraphFunction.id ||
        graphFunctionCanReach({
          module: input.source.module,
          from: child,
          targetRef: input.source.executionGraphFunction.id,
          visited: new Set<string>()
        })
      ) {
        fail({
          classification: "semantic_not_realized",
          diagnosticId: "gtl-c-program-recursive-shape-unrealized",
          path: input.sourcePath,
          expectedRelation: "acyclic workflow.C lift; graph recurse remains separate",
          actualRelation: `workflow lift ${JSON.stringify(term.graphFunctionRef)} reaches its parent`,
          evidenceRefs: [input.source.executionGraphFunction.id]
        });
      }
      const uncoveredEffects = child.effects.filter(
        (effectRef) => !input.source.executionGraphFunction.effects.includes(effectRef)
      );
      if (uncoveredEffects.length > 0) {
        fail({
          diagnosticId: "gtl-c-program-child-interface-mismatch",
          path: input.sourcePath,
          expectedRelation: "child effects covered by public parent",
          actualRelation: `uncovered child effects ${JSON.stringify(uncoveredEffects)}`,
          evidenceRefs: [child.id]
        });
      }
      if (
        cInterfaceContractRef(child.inputs) !== term.inputCarrierRef ||
        cInterfaceContractRef(child.outputs) !== term.outputCarrierRef
      ) {
        fail({
          diagnosticId: "gtl-c-program-child-interface-mismatch",
          path: input.sourcePath,
          expectedRelation: "child internal Node interfaces preserve authored C carriers",
          actualRelation: `${cInterfaceContractRef(child.inputs)} -> ${cInterfaceContractRef(child.outputs)}`,
          evidenceRefs: [child.id]
        });
      }
      const ordinal = input.state.invocationOrdinal++;
      return {
        ...basis,
        kind: "workflow",
        child,
        resultCardinality: "unresolved",
        compositionBinding: compositionBinding({
          composition: input.source.composition,
          sourcePath: input.sourcePath,
          domainStageRole: null,
          regime: null,
          armId: child.id,
          sequenceOrdinal: ordinal,
          taskOrdinal: input.taskOrdinal
        })
      };
    }
    case "c_batch": {
      if (term.tasks.length === 0) {
        fail({
          diagnosticId: "gtl-c-program-batch-shape-invalid",
          path: input.sourcePath,
          expectedRelation: "non-empty C.batch task family",
          actualRelation: "zero tasks"
        });
      }
      const tasks = term.tasks.map((task, ordinal): DraftBatchTask => {
        if (
          task.inputCarrierRef !== term.inputCarrierRef ||
          task.outputCarrierRef !== term.outputCarrierRef
        ) {
          fail({
            diagnosticId: "gtl-c-program-batch-shape-invalid",
            path: `${input.sourcePath}.tasks[${String(ordinal)}]`,
            expectedRelation: "task carrier pair equal to C.batch carrier pair",
            actualRelation: `${task.inputCarrierRef} -> ${task.outputCarrierRef}`
          });
        }
        const taskOrdinal = input.state.taskOrdinal++;
        return {
          ordinal,
          taskOrdinal,
          child: compileDraft({
            ...input,
            term: task,
            sourcePath: `${input.sourcePath}.tasks[${String(ordinal)}]`,
            parentPath: input.sourcePath,
            taskOrdinal
          })
        };
      });
      return {
        ...basis,
        kind: "batch",
        resultCardinality: "unresolved",
        tasks
      };
    }
    case "c_retry": {
      if (
        term.term.inputCarrierRef !== term.inputCarrierRef ||
        term.term.outputCarrierRef !== term.outputCarrierRef
      ) {
        fail({
          diagnosticId: "gtl-c-program-carrier-discontinuity",
          path: input.sourcePath,
          expectedRelation: "C.retry preserves wrapped carrier pair",
          actualRelation: `${term.term.inputCarrierRef} -> ${term.term.outputCarrierRef}`
        });
      }
      return {
        ...basis,
        kind: "retry",
        resultCardinality: "unresolved",
        child: compileDraft({
          ...input,
          term: term.term,
          sourcePath: `${input.sourcePath}.term`,
          parentPath: input.sourcePath
        })
      };
    }
  }
}

function prepareBatchScopes(node: DraftNode): void {
  switch (node.kind) {
    case "stage":
    case "identity":
    case "workflow":
      return;
    case "sequence":
      node.children.forEach(prepareBatchScopes);
      return;
    case "retry":
      prepareBatchScopes(node.child);
      return;
    case "batch": {
      node.tasks.forEach((task) => resolveResultScope(task.child));
      const cardinalities = new Set(
        node.tasks.map((task) => task.child.resultCardinality)
      );
      if (cardinalities.size !== 1 || cardinalities.has("unresolved")) {
        fail({
          diagnosticId: "gtl-c-program-batch-shape-invalid",
          path: node.sourcePath,
          expectedRelation: "equal resolved per-task result cardinality",
          actualRelation: JSON.stringify([...cardinalities])
        });
      }
      node.resultCardinality = node.tasks[0]!.child.resultCardinality;
    }
  }
}

type SerialLocus = DraftStage | DraftWorkflow | DraftBatch;

function serialLoci(node: DraftNode): SerialLocus[] {
  switch (node.kind) {
    case "stage":
    case "workflow":
    case "batch":
      return [node];
    case "identity":
      return [];
    case "sequence":
      return node.children.flatMap(serialLoci);
    case "retry":
      return serialLoci(node.child);
  }
}

function refreshCardinality(node: DraftNode): CompleteCProgramResultCardinality {
  switch (node.kind) {
    case "stage":
    case "identity":
    case "workflow":
    case "batch":
      return node.resultCardinality;
    case "retry":
      node.resultCardinality = refreshCardinality(node.child);
      return node.resultCardinality;
    case "sequence":
      node.resultCardinality = node.children.reduce<CompleteCProgramResultCardinality>(
        (current, child) => combineCardinality(current, refreshCardinality(child)),
        "zero"
      );
      return node.resultCardinality;
  }
}

function resolveResultScope(root: DraftNode): void {
  prepareBatchScopes(root);
  const loci = serialLoci(root);
  const fixedResult = loci.some(
    (locus) => locus.kind !== "workflow" && locus.resultCardinality !== "zero"
  );
  const workflows = loci.filter(
    (locus): locus is DraftWorkflow => locus.kind === "workflow"
  );
  workflows.forEach((workflow) => {
    workflow.resultCardinality = "zero";
  });
  const terminal = loci.at(-1);
  if (!fixedResult && terminal?.kind === "workflow") {
    terminal.resultCardinality = "one";
  }
  refreshCardinality(root);
}

function nodeBasis(node: DraftNode): Omit<CompiledCPlanNodeBasis, "nodeRef" | "nodeDigest"> {
  return {
    sourcePath: node.sourcePath,
    parentPath: node.parentPath,
    sourceNodeDigest: stableSha256Digest(node.source),
    inputCarrierRef: node.inputCarrierRef,
    outputCarrierRef: node.outputCarrierRef,
    resultCardinality: node.resultCardinality,
    taskOrdinal: node.taskOrdinal
  };
}

function sealedNode<T extends object>(basis: T): T & {
  readonly nodeRef: string;
  readonly nodeDigest: `sha256:${string}`;
} {
  const nodeDigest = stableSha256Digest(basis);
  return Object.freeze({
    ...basis,
    nodeRef: `abg://compiled-c-node/${nodeDigest.slice("sha256:".length)}`,
    nodeDigest
  });
}

function sealNode(node: DraftNode): CompiledCPlanNode {
  const common = nodeBasis(node);
  switch (node.kind) {
    case "stage":
      return sealedNode({
        kind: "compiled_c_stage_leaf" as const,
        ...common,
        domainStageRole: node.source.kind === "c_of" ? node.source.stageRole : "",
        fibre: node.source.kind === "c_of" ? node.source.fibre : "F_D",
        armId: node.source.kind === "c_of" ? node.source.armId : "",
        resultBearing: node.resultCardinality === "one",
        instructionCategoryRefs: Object.freeze(
          node.source.kind === "c_of"
            ? [...(node.source.instructionCategoryRefs ?? [])]
            : []
        ),
        compositionBinding: node.compositionBinding
      });
    case "identity":
      return sealedNode({ kind: "compiled_c_identity" as const, ...common });
    case "workflow":
      return sealedNode({
        kind: "compiled_c_workflow_lift" as const,
        ...common,
        childAuthoredRef:
          node.source.kind === "c_workflow" ? node.source.graphFunctionRef : "",
        childGraphFunctionRef: node.child.id,
        childGraphFunctionDigest: stableSha256Digest(node.child),
        childOuterContractRef: null,
        childWireContractCertified: false as const,
        evidenceClass: "sub_traversal" as const,
        compositionBinding: node.compositionBinding
      });
    case "sequence":
      return sealedNode({
        kind: "compiled_c_sequence" as const,
        ...common,
        sourceConstructor: node.sourceConstructor,
        children: Object.freeze(node.children.map(sealNode))
      });
    case "batch": {
      const tasks = node.tasks.map((task): CompiledCBatchTask => {
        const child = sealNode(task.child);
        const basis = Object.freeze({
          kind: "compiled_c_batch_task" as const,
          ordinal: task.ordinal,
          taskOrdinal: task.taskOrdinal,
          child
        });
        const taskDigest = stableSha256Digest(basis);
        return Object.freeze({
          ...basis,
          taskRef: `abg://compiled-c-batch-task/${taskDigest.slice("sha256:".length)}`,
          taskDigest
        });
      });
      return sealedNode({
        kind: "compiled_c_complete_batch" as const,
        ...common,
        batchRef: node.source.kind === "c_batch" ? node.source.batchRef : "",
        tasks: Object.freeze(tasks)
      });
    }
    case "retry": {
      const maxAttempts = node.source.kind === "c_retry" ? node.source.budget : 0;
      const retryPolicyDigest = stableSha256Digest({
        policy: "abg.c-retry-policy/1",
        maxAttempts
      });
      return sealedNode({
        kind: "compiled_c_complete_retry" as const,
        ...common,
        maxAttempts,
        retryPolicyRef: "abg://c-retry-policy/shared",
        retryPolicyDigest,
        child: sealNode(node.child)
      });
    }
  }
}

function assertBinding(input: {
  readonly binding: CompiledGraphVectorCProgramBinding;
  readonly executionGraphFunction: GraphFunction;
  readonly graphVector: GraphVector;
  readonly program: CProgramDeclarationNode;
}): void {
  if (
    input.binding.hostGraphFunctionRef !== input.executionGraphFunction.id ||
    input.binding.graphVectorRef !== input.graphVector.id ||
    input.binding.selectedProgramRef !== input.program.programRef ||
    input.binding.programInputCarrierRef !== input.program.term.inputCarrierRef ||
    input.binding.programOutputCarrierRef !== input.program.term.outputCarrierRef
  ) {
    fail({
      diagnosticId: "gtl-c-program-authority-mismatch",
      path: "$.programBinding",
      expectedRelation: "exact selected GraphVector C-program binding",
      actualRelation: "binding identity or outer carrier pair differs",
      evidenceRefs: [input.binding.bindingDigest]
    });
  }
}

function assertSelectedProgramAuthority(input: {
  readonly graphFunction: GraphFunction;
  readonly program: CProgramDeclarationNode;
}): void {
  const matches = collectRawCProgramCandidates(input.graphFunction.declarations)
    .candidates
    .map((candidate) => admitCProgramSyntax(candidate.candidate))
    .filter(
      (admission) =>
        admission.accepted &&
        admission.program?.programRef === input.program.programRef
    )
    .map((admission) => admission.program!);
  if (
    matches.length !== 1 ||
    !stableJsonEquals(matches[0], input.program)
  ) {
    fail({
      diagnosticId: "gtl-c-program-authority-mismatch",
      path: "$.program",
      expectedRelation:
        "one exact selected program declaration from the execution GraphFunction",
      actualRelation:
        `${String(matches.length)} matching declarations or submitted bytes differ`,
      evidenceRefs: [input.graphFunction.id, input.program.programRef]
    });
  }
}

function planBasis(plan: Omit<CompiledCProgramPlan, "planRef" | "planDigest">) {
  return Object.freeze({ ...plan });
}

export function compileCompleteCProgram(
  input: CompileCompleteCProgramInput
): CompleteCProgramCompilation {
  try {
    assertCurrentAuthority(input);
    const admission = admitCProgramSyntax(input.program);
    if (!admission.accepted || admission.program === null) {
      return Object.freeze({
        kind: "complete_c_program_compilation" as const,
        status: "invalid" as const,
        plan: null,
        diagnostics: Object.freeze([
          diagnostic({
            diagnosticId: "gtl-c-program-admission-invalid",
            path: "$.program",
            expectedRelation: "one canonically admitted C program",
            actualRelation: admission.diagnostics
              .map((row) => `${row.diagnosticId}: ${row.message}`)
              .join("; "),
            evidenceRefs: admission.diagnostics.map((row) => row.requirementRef)
          })
        ])
      });
    }
    assertBinding({
      binding: input.programBinding,
      executionGraphFunction: input.executionGraphFunction,
      graphVector: input.graphVector,
      program: admission.program
    });
    assertSelectedProgramAuthority({
      graphFunction: input.executionGraphFunction,
      program: admission.program
    });
    const state: CompilationState = {
      invocationOrdinal: 0,
      taskOrdinal: 0,
      authoredNodeCount: 0
    };
    const draft = compileDraft({
      term: admission.program.term,
      sourcePath: "$.term",
      parentPath: null,
      taskOrdinal: null,
      state,
      source: input
    });
    resolveResultScope(draft);
    if (draft.resultCardinality !== "one") {
      fail({
        diagnosticId: "gtl-c-program-result-cardinality-invalid",
        path: "$.term",
        expectedRelation: "one exact result-bearing program locus",
        actualRelation: draft.resultCardinality,
        evidenceRefs: [input.programBinding.bindingDigest]
      });
    }
    const root = sealNode(draft);
    const basis = planBasis(Object.freeze({
      kind: "compiled_c_program_plan" as const,
      programRef: admission.program.programRef,
      sourceProgramDigest: stableSha256Digest(admission.program),
      programBindingDigest: input.programBinding.bindingDigest,
      moduleName: input.module.name,
      moduleDigest: stableSha256Digest(input.module),
      executionGraphFunctionRef: input.executionGraphFunction.id,
      executionGraphFunctionDigest: stableSha256Digest(input.executionGraphFunction),
      compositionOwnerGraphFunctionRef: input.compositionOwnerGraphFunction.id,
      compositionOwnerGraphFunctionDigest: stableSha256Digest(
        input.compositionOwnerGraphFunction
      ),
      graphVectorRef: input.graphVector.id,
      graphVectorDigest: stableSha256Digest(input.graphVector),
      compositionSelectionRef: input.composition.selectionRef,
      compositionRef: input.composition.contract.contractRef,
      compositionDigest: input.composition.contract.contractDigest,
      inputCarrierRef: admission.program.term.inputCarrierRef,
      outputCarrierRef: admission.program.term.outputCarrierRef,
      resultCardinality: "one" as const,
      authoredNodeCount: state.authoredNodeCount,
      invokingLocusCount: state.invocationOrdinal,
      root
    }));
    const planDigest = stableSha256Digest(basis);
    const plan: CompiledCProgramPlan = Object.freeze({
      ...basis,
      planRef: `abg://compiled-c-program/${planDigest.slice("sha256:".length)}`,
      planDigest
    });
    const compiled: CompleteCProgramCompiled = {
      kind: "complete_c_program_compilation" as const,
      status: "compiled" as const,
      plan,
      diagnostics: []
    };
    return Object.freeze(compiled);
  } catch (error: unknown) {
    if (error instanceof CompilationFailure) {
      return Object.freeze({
        kind: "complete_c_program_compilation" as const,
        status: error.diagnostic.classification === "semantic_not_realized"
          ? "semantic_not_realized" as const
          : "invalid" as const,
        plan: null,
        diagnostics: Object.freeze([error.diagnostic])
      });
    }
    return Object.freeze({
      kind: "complete_c_program_compilation" as const,
      status: "invalid" as const,
      plan: null,
      diagnostics: Object.freeze([
        diagnostic({
          diagnosticId: "gtl-c-program-authority-mismatch",
          path: "$",
          expectedRelation: "deterministic complete C-program compilation",
          actualRelation: errorMessage(error)
        })
      ])
    });
  }
}

function assertNodeSeal(node: CompiledCPlanNode): void {
  const { nodeRef, nodeDigest, ...basis } = node;
  const expected = stableSha256Digest(basis);
  if (
    nodeDigest !== expected ||
    nodeRef !== `abg://compiled-c-node/${expected.slice("sha256:".length)}`
  ) {
    throw new TypeError(`compiled C node seal differs at ${node.sourcePath}`);
  }
  switch (node.kind) {
    case "compiled_c_sequence":
      node.children.forEach(assertNodeSeal);
      break;
    case "compiled_c_complete_batch":
      node.tasks.forEach((task) => {
        const { taskRef, taskDigest, ...taskBasis } = task;
        const expectedTask = stableSha256Digest(taskBasis);
        if (
          taskDigest !== expectedTask ||
          taskRef !== `abg://compiled-c-batch-task/${expectedTask.slice("sha256:".length)}`
        ) {
          throw new TypeError(`compiled C batch task seal differs at ${node.sourcePath}`);
        }
        assertNodeSeal(task.child);
      });
      break;
    case "compiled_c_complete_retry":
      assertNodeSeal(node.child);
      break;
    case "compiled_c_stage_leaf":
    case "compiled_c_identity":
    case "compiled_c_workflow_lift":
      break;
  }
}

interface PlanStructureCounters {
  authoredNodeCount: number;
  invokingLocusCount: number;
  readonly nodeRefs: Set<string>;
  readonly sourcePaths: Set<string>;
  readonly taskOrdinals: Set<number>;
  readonly invocationOrdinals: number[];
}

function assertCompositionLocus(input: {
  readonly plan: CompiledCProgramPlan;
  readonly node: CompiledCStageLeaf | CompiledCWorkflowLift;
}): void {
  const binding = input.node.compositionBinding;
  const { bindingRef, bindingDigest, ...basis } = binding;
  const expected = stableSha256Digest(basis);
  if (
    bindingDigest !== expected ||
    bindingRef !== `abg://c-program-locus/${expected.slice("sha256:".length)}` ||
    binding.compositionSelectionRef !== input.plan.compositionSelectionRef ||
    binding.compositionRef !== input.plan.compositionRef ||
    binding.compositionDigest !== input.plan.compositionDigest ||
    binding.taskOrdinal !== input.node.taskOrdinal
  ) {
    throw new TypeError(
      `compiled C composition locus differs at ${input.node.sourcePath}`
    );
  }
  if (input.node.kind === "compiled_c_stage_leaf") {
    if (
      binding.domainStageRole !== input.node.domainStageRole ||
      binding.regime !== input.node.fibre ||
      binding.armId !== input.node.armId ||
      input.node.resultCardinality !==
        (input.node.resultBearing ? "one" : "zero")
    ) {
      throw new TypeError(
        `compiled C stage locus differs at ${input.node.sourcePath}`
      );
    }
  } else if (
    binding.domainStageRole !== null ||
    binding.armId !== input.node.childGraphFunctionRef ||
    (input.node.resultCardinality !== "zero" &&
      input.node.resultCardinality !== "one")
  ) {
    throw new TypeError(
      `compiled C workflow locus differs at ${input.node.sourcePath}`
    );
  }
}

function assertNodeStructure(input: {
  readonly plan: CompiledCProgramPlan;
  readonly node: CompiledCPlanNode;
  readonly expectedParentPath: string | null;
  readonly counters: PlanStructureCounters;
}): CompleteCProgramResultCardinality {
  const { node, counters } = input;
  if (
    node.sourcePath.length === 0 ||
    node.parentPath !== input.expectedParentPath ||
    counters.nodeRefs.has(node.nodeRef) ||
    counters.sourcePaths.has(node.sourcePath)
  ) {
    throw new TypeError(`compiled C node placement differs at ${node.sourcePath}`);
  }
  counters.nodeRefs.add(node.nodeRef);
  counters.sourcePaths.add(node.sourcePath);
  counters.authoredNodeCount += 1;

  switch (node.kind) {
    case "compiled_c_stage_leaf":
      counters.invokingLocusCount += 1;
      counters.invocationOrdinals.push(
        node.compositionBinding.sequenceOrdinal
      );
      assertCompositionLocus({ plan: input.plan, node });
      return node.resultCardinality;
    case "compiled_c_workflow_lift":
      counters.invokingLocusCount += 1;
      counters.invocationOrdinals.push(
        node.compositionBinding.sequenceOrdinal
      );
      assertCompositionLocus({ plan: input.plan, node });
      return node.resultCardinality;
    case "compiled_c_identity":
      if (
        node.inputCarrierRef !== node.outputCarrierRef ||
        node.resultCardinality !== "zero"
      ) {
        throw new TypeError(`compiled C identity differs at ${node.sourcePath}`);
      }
      return "zero";
    case "compiled_c_sequence": {
      const expectedPaths = node.sourceConstructor === "c_compose"
        ? [`${node.sourcePath}.left`, `${node.sourcePath}.right`]
        : [
            `${node.sourcePath}.transform`,
            `${node.sourcePath}.evaluate`,
            `${node.sourcePath}.consequence`
          ];
      if (
        node.children.length !== expectedPaths.length ||
        !node.children.every(
          (child, index) => child.sourcePath === expectedPaths[index]
        ) ||
        node.children[0]?.inputCarrierRef !== node.inputCarrierRef ||
        node.children.at(-1)?.outputCarrierRef !== node.outputCarrierRef ||
        node.children.some(
          (child, index) =>
            index > 0 &&
            node.children[index - 1]!.outputCarrierRef !== child.inputCarrierRef
        )
      ) {
        throw new TypeError(`compiled C sequence differs at ${node.sourcePath}`);
      }
      const cardinality = node.children.reduce<CompleteCProgramResultCardinality>(
        (current, child) =>
          combineCardinality(
            current,
            assertNodeStructure({
              plan: input.plan,
              node: child,
              expectedParentPath: node.sourcePath,
              counters
            })
          ),
        "zero"
      );
      if (node.resultCardinality !== cardinality) {
        throw new TypeError(
          `compiled C sequence cardinality differs at ${node.sourcePath}`
        );
      }
      return cardinality;
    }
    case "compiled_c_complete_batch": {
      if (node.tasks.length === 0) {
        throw new TypeError(`compiled C batch is empty at ${node.sourcePath}`);
      }
      const cardinalities = node.tasks.map((task, ordinal) => {
        if (
          task.ordinal !== ordinal ||
          counters.taskOrdinals.has(task.taskOrdinal) ||
          task.child.taskOrdinal !== task.taskOrdinal ||
          task.child.sourcePath !== `${node.sourcePath}.tasks[${String(ordinal)}]` ||
          task.child.inputCarrierRef !== node.inputCarrierRef ||
          task.child.outputCarrierRef !== node.outputCarrierRef
        ) {
          throw new TypeError(
            `compiled C batch task differs at ${node.sourcePath}.tasks[${String(ordinal)}]`
          );
        }
        counters.taskOrdinals.add(task.taskOrdinal);
        return assertNodeStructure({
          plan: input.plan,
          node: task.child,
          expectedParentPath: node.sourcePath,
          counters
        });
      });
      if (
        cardinalities.some((cardinality) => cardinality !== cardinalities[0]) ||
        node.resultCardinality !== cardinalities[0]
      ) {
        throw new TypeError(
          `compiled C batch cardinality differs at ${node.sourcePath}`
        );
      }
      return node.resultCardinality;
    }
    case "compiled_c_complete_retry": {
      const expectedPolicyDigest = stableSha256Digest({
        policy: "abg.c-retry-policy/1",
        maxAttempts: node.maxAttempts
      });
      if (
        !Number.isInteger(node.maxAttempts) ||
        node.maxAttempts < 1 ||
        node.retryPolicyRef !== "abg://c-retry-policy/shared" ||
        node.retryPolicyDigest !== expectedPolicyDigest ||
        node.child.sourcePath !== `${node.sourcePath}.term` ||
        node.child.inputCarrierRef !== node.inputCarrierRef ||
        node.child.outputCarrierRef !== node.outputCarrierRef
      ) {
        throw new TypeError(`compiled C retry differs at ${node.sourcePath}`);
      }
      const cardinality = assertNodeStructure({
        plan: input.plan,
        node: node.child,
        expectedParentPath: node.sourcePath,
        counters
      });
      if (node.resultCardinality !== cardinality) {
        throw new TypeError(
          `compiled C retry cardinality differs at ${node.sourcePath}`
        );
      }
      return cardinality;
    }
  }
}

export function assertCompiledCProgramPlan(plan: CompiledCProgramPlan): void {
  if (plan.kind !== "compiled_c_program_plan" || plan.resultCardinality !== "one") {
    throw new TypeError("compiled C program plan kind or cardinality is invalid");
  }
  assertNodeSeal(plan.root);
  const counters: PlanStructureCounters = {
    authoredNodeCount: 0,
    invokingLocusCount: 0,
    nodeRefs: new Set<string>(),
    sourcePaths: new Set<string>(),
    taskOrdinals: new Set<number>(),
    invocationOrdinals: []
  };
  const cardinality = assertNodeStructure({
    plan,
    node: plan.root,
    expectedParentPath: null,
    counters
  });
  const invocationOrdinals = [...counters.invocationOrdinals].sort(
    (left, right) => left - right
  );
  if (
    plan.root.sourcePath !== "$.term" ||
    plan.root.inputCarrierRef !== plan.inputCarrierRef ||
    plan.root.outputCarrierRef !== plan.outputCarrierRef ||
    cardinality !== "one" ||
    counters.authoredNodeCount !== plan.authoredNodeCount ||
    counters.invokingLocusCount !== plan.invokingLocusCount ||
    invocationOrdinals.some((ordinal, index) => ordinal !== index)
  ) {
    throw new TypeError("compiled C program plan structure differs");
  }
  const { planRef, planDigest, ...basis } = plan;
  const expected = stableSha256Digest(basis);
  if (
    planDigest !== expected ||
    planRef !== `abg://compiled-c-program/${expected.slice("sha256:".length)}`
  ) {
    throw new TypeError("compiled C program plan seal differs");
  }
}
