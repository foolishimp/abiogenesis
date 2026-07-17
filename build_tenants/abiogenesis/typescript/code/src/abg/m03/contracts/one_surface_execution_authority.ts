// Implements: T-270 AF-15 execution admission.
// The rows derive from the admitted program, selected member, and compiler
// chain. They are not a second runtime basis or selectable execution surface.

import type {
  CompiledExecutionContextContract
} from "./declared_execution_context.js";
import {
  compileDeclaredExecutionContextContract,
  constructDeclaredCStageInvocationBasis,
} from "./declared_execution_context.js";
import type {
  GraphVectorExecutionHandoffPublished,
  GraphVectorExecutionHandoffStructuralOnly
} from "./graph_vector_execution_handoff.js";
import {
  compileGraphVectorExecutionHandoff
} from "./graph_vector_execution_handoff.js";
import type {
  AdmittedTraversalStageResultAuthority,
  CompiledTraversalExecutionContracts,
  ProjectTraversalContractSourceInput,
  TraversalContractSourceBasis,
  TraversalExecutionAdmissionCapabilityBlocked,
  TraversalExecutionAdmissionRuntimeAddressable
} from "./traversal_execution_contract.js";
import {
  admitDeclaredTraversalStageResultAuthority,
  admitProgramLocusTraversalStageResultAuthority,
  admitTraversalExecution,
  compileTraversalExecutionContracts,
  projectTraversalContractSourceBasis
} from "./traversal_execution_contract.js";
import {
  materializeGraphFunction,
  type GraphFunction,
  type GraphVector
} from "../../../gtl/m01/contracts/carriers.js";
import {
  compileHofRelation,
  type CompiledHofFanOutRelation
} from "./hof_relation_compiler.js";
import { compileHofFanOutBinding } from "./hof_batch.js";
import { loadGtlTargetCarrierDefaultsBundle } from "../../../gtl/m01/contracts/target_carrier_contract.js";
import type { AdmittedTenantConformanceManifest } from "../../../shared/abg_library/tenant_conformance_manifest.js";
import type {
  AdmittedRuntimeCatalogBasis,
  CatalogExecutionBinding
} from "./runtime_catalog.js";
import type {
  CompiledCPlanNode,
  CompiledCProgramPlan,
  CompiledCWorkflowLift
} from "./complete_c_program.js";
import { hogProgramExecutableStages } from "./hog_program.js";
import {
  projectFpResultLocusContract
} from "./fp_result_contract_admission.js";
import { typecheckGtlProgram } from "./gtl_program_conformance.js";
import { pluginSelectionFromDeclarationAttrs } from "./plugin_selection.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";

export interface ProgramLocusExecutionAuthority {
  readonly kind: "program_locus_execution_authority";
  readonly stageOrdinal: number;
  readonly programLocusRef: string;
  readonly programLocusDigest: `sha256:${string}`;
  readonly compiledExecutionContext: CompiledExecutionContextContract | null;
  readonly resultAuthority: AdmittedTraversalStageResultAuthority;
}

export interface ProgramVectorExecutionAuthority {
  readonly kind: "program_vector_execution_authority";
  readonly vectorIndex: number;
  readonly graphVectorRef: string;
  readonly graphVectorDigest: `sha256:${string}`;
  readonly handoff:
    | GraphVectorExecutionHandoffPublished
    | GraphVectorExecutionHandoffStructuralOnly;
  readonly source: TraversalContractSourceBasis;
  readonly loci: readonly ProgramLocusExecutionAuthority[];
  readonly bundle: CompiledTraversalExecutionContracts;
  readonly admission:
    | TraversalExecutionAdmissionRuntimeAddressable
    | TraversalExecutionAdmissionCapabilityBlocked;
}

interface ProgramVectorExecutionAuthorityDraft {
  readonly vectorIndex: number;
  readonly graphVector: GraphVector;
  readonly outcome:
    | GraphVectorExecutionHandoffPublished
    | GraphVectorExecutionHandoffStructuralOnly;
  readonly sourceInput: ProjectTraversalContractSourceInput;
  readonly source: TraversalContractSourceBasis;
  readonly loci: readonly ProgramLocusExecutionAuthority[];
  readonly bundle: CompiledTraversalExecutionContracts;
}

export interface ProgramExecutionSubjectAuthority {
  readonly kind: "program_execution_subject_authority";
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: `sha256:${string}`;
  readonly vectors: readonly ProgramVectorExecutionAuthority[];
}

export interface ProgramExecutionAuthoritySet {
  readonly kind: "program_execution_authority_set";
  readonly authoritySetRef: string;
  readonly authoritySetDigest: `sha256:${string}`;
  readonly catalogBasisRef: string;
  readonly selectedCatalogEntryRef: string;
  readonly executionBindingDigest: `sha256:${string}`;
  readonly moduleDigest: `sha256:${string}`;
  readonly graphFunctionDigest: `sha256:${string}`;
  readonly structuralHofRelations: readonly CompiledHofFanOutRelation[];
  readonly subjects: readonly ProgramExecutionSubjectAuthority[];
}

export type ProgramExecutionAuthorityCompileErrorCode =
  | "capability_missing"
  | "program_invalid";

export class ProgramExecutionAuthorityCompileError extends TypeError {
  readonly code: ProgramExecutionAuthorityCompileErrorCode;
  readonly diagnosticRefs: readonly string[];

  constructor(input: {
    readonly code: ProgramExecutionAuthorityCompileErrorCode;
    readonly message: string;
    readonly diagnosticRefs?: readonly string[];
  }) {
    super(input.message);
    this.name = "ProgramExecutionAuthorityCompileError";
    this.code = input.code;
    this.diagnosticRefs = Object.freeze([...(input.diagnosticRefs ?? [])]);
  }
}

function exactCompositionOwner(input: {
  readonly moduleGraphFunctions: readonly GraphFunction[];
  readonly outcome: GraphVectorExecutionHandoffPublished;
}): GraphFunction {
  const ownerRef =
    input.outcome.handoff.compositionSelection.contract.host.graphFunctionRef;
  const matches = input.moduleGraphFunctions.filter(
    (candidate) => candidate.id === ownerRef
  );
  const owner = matches[0];
  if (matches.length !== 1 || owner === undefined) {
    throw new TypeError(
      `catalog execution composition owner ${JSON.stringify(ownerRef)} resolved ${String(matches.length)} times`
    );
  }
  return owner;
}

function fpWireProfileForProgramLocus(input: {
  readonly owner: GraphFunction;
  readonly stage: TraversalContractSourceBasis["workStages"][number];
}) {
  const selection = pluginSelectionFromDeclarationAttrs(
    input.owner.declarations,
    input.owner.name
  );
  return projectFpResultLocusContract({
    compositionStageRole: input.stage.compositionStageRole,
    pluginSelection: selection,
    sourceRef: input.stage.programLocusRef
  }).wireProfile;
}

function declaredStageDigestFromOwnHandoff(input: {
  readonly outcome: GraphVectorExecutionHandoffPublished;
  readonly stage: TraversalContractSourceBasis["workStages"][number];
}): `sha256:${string}` {
  if (input.stage.declaredStageIndex === null) {
    throw new TypeError(
      "structural program loci do not own declared execution-context stages"
    );
  }
  const normalizedProgram = input.outcome.handoff.normalizedProgram;
  if (normalizedProgram === null) {
    throw new ProgramExecutionAuthorityCompileError({
      code: "program_invalid",
      message:
        `declared program locus ${JSON.stringify(input.stage.programLocusRef)} has no normalized T-255 program`,
      diagnosticRefs: Object.freeze([
        input.outcome.handoff.handoffRef,
        input.stage.programLocusRef
      ])
    });
  }
  const declaredStage = hogProgramExecutableStages(normalizedProgram)[
    input.stage.declaredStageIndex
  ];
  if (
    declaredStage === undefined ||
    declaredStage.stageRole !== input.stage.domainStageRole ||
    declaredStage.defaultRegime !== input.stage.regime ||
    declaredStage.armId !== input.stage.armId ||
    declaredStage.resultBearing !== input.stage.resultBearing ||
    !stableJsonEquals(
      declaredStage.instructionCategoryRefs ?? Object.freeze([]),
      input.stage.instructionCategoryRefs
    )
  ) {
    throw new ProgramExecutionAuthorityCompileError({
      code: "program_invalid",
      message:
        `program locus ${JSON.stringify(input.stage.programLocusRef)} at declared stage ${String(input.stage.declaredStageIndex)} does not match its own T-255 normalized stage for ${JSON.stringify(input.outcome.handoff.programBinding.hostGraphFunctionRef)} ` +
        `(expected ${JSON.stringify({
          stageRole: input.stage.domainStageRole,
          regime: input.stage.regime,
          armId: input.stage.armId,
          resultBearing: input.stage.resultBearing,
          instructionCategoryRefs: input.stage.instructionCategoryRefs
        })}, observed ${JSON.stringify(declaredStage ?? null)})`,
      diagnosticRefs: Object.freeze([
        input.outcome.handoff.handoffRef,
        input.stage.programLocusRef
      ])
    });
  }
  return stableSha256Digest(declaredStage);
}

function workflowLiftsInExecutionOrder(
  plan: CompiledCProgramPlan
): readonly CompiledCWorkflowLift[] {
  const lifts: CompiledCWorkflowLift[] = [];
  const visit = (node: CompiledCPlanNode): void => {
    switch (node.kind) {
      case "compiled_c_workflow_lift":
        lifts.push(node);
        return;
      case "compiled_c_sequence":
        node.children.forEach(visit);
        return;
      case "compiled_c_complete_batch":
        node.tasks.forEach((task) => visit(task.child));
        return;
      case "compiled_c_complete_retry":
        visit(node.child);
        return;
      case "compiled_c_stage_leaf":
      case "compiled_c_identity":
        return;
    }
  };
  visit(plan.root);
  return Object.freeze(lifts);
}

function exactStructuralChild(input: {
  readonly relation: CompiledHofFanOutRelation;
  readonly moduleGraphFunctions: readonly GraphFunction[];
}): {
  readonly graphFunction: GraphFunction;
  readonly graphVector: GraphVector;
} {
  const graphFunctionMatches = input.moduleGraphFunctions.filter(
    (candidate) =>
      candidate.id === input.relation.childGraphFunctionRef &&
      stableSha256Digest(candidate) ===
        input.relation.childGraphFunctionDigest
  );
  const graphFunction = graphFunctionMatches[0];
  if (graphFunctionMatches.length !== 1 || graphFunction === undefined) {
    throw new ProgramExecutionAuthorityCompileError({
      code: "program_invalid",
      message:
        `structural HOF child ${JSON.stringify(input.relation.childGraphFunctionRef)} does not resolve once at its compiled digest`,
      diagnosticRefs: Object.freeze([
        input.relation.relationBindingRef,
        input.relation.childGraphFunctionRef
      ])
    });
  }
  const graphVectorMatches = materializeGraphFunction(graphFunction).vectors.filter(
    (candidate) =>
      candidate.source.length === 1 &&
      candidate.source[0]?.id === input.relation.inputMemberNodeRef &&
      candidate.target.id === input.relation.outputMemberNodeRef
  );
  const graphVector = graphVectorMatches[0];
  if (graphVectorMatches.length !== 1 || graphVector === undefined) {
    throw new ProgramExecutionAuthorityCompileError({
      code: "program_invalid",
      message:
        `structural HOF child ${JSON.stringify(input.relation.childGraphFunctionRef)} does not preserve one exact member vector`,
      diagnosticRefs: Object.freeze([
        input.relation.relationBindingRef,
        input.relation.inputMemberNodeRef,
        input.relation.outputMemberNodeRef
      ])
    });
  }
  return Object.freeze({ graphFunction, graphVector });
}

function addExactChildRef(input: {
  readonly refs: Map<string, `sha256:${string}`>;
  readonly ref: string;
  readonly digest: `sha256:${string}`;
  readonly relation: string;
}): void {
  const priorDigest = input.refs.get(input.ref);
  if (priorDigest !== undefined && priorDigest !== input.digest) {
    throw new ProgramExecutionAuthorityCompileError({
      code: "program_invalid",
      message:
        `${input.relation} child ${JSON.stringify(input.ref)} has conflicting compiled identities`,
      diagnosticRefs: Object.freeze([input.ref, priorDigest, input.digest])
    });
  }
  input.refs.set(input.ref, input.digest);
}

function compileProgramVectorExecutionAuthorityDrafts(input: {
  readonly basis: AdmittedRuntimeCatalogBasis;
  readonly executionBinding: CatalogExecutionBinding;
  readonly executionSubjectGraphFunction: GraphFunction;
  readonly admittedTenantConformanceManifest:
    | AdmittedTenantConformanceManifest
    | null;
}) {
  const subjectMatches = input.executionBinding.module.graphFunctions.filter(
    (candidate) => candidate.id === input.executionSubjectGraphFunction.id
  );
  if (
    subjectMatches.length !== 1 ||
    subjectMatches[0] === undefined ||
    !stableJsonEquals(subjectMatches[0], input.executionSubjectGraphFunction)
  ) {
    throw new TypeError(
      "catalog execution subject must occur exactly once and byte-equivalent in the selected Module"
    );
  }
  const graph = materializeGraphFunction(input.executionSubjectGraphFunction);
  if (graph.vectors.length === 0) {
    throw new TypeError("profile-aware catalog work has no GraphVector to compile");
  }
  const targetCarrierDefaults = loadGtlTargetCarrierDefaultsBundle();
  const structuralChildRefs = new Map<string, `sha256:${string}`>();
  const structuralHofRelations: CompiledHofFanOutRelation[] = [];
  const drafts: ProgramVectorExecutionAuthorityDraft[] = graph.vectors.flatMap(
    (graphVector, vectorIndex): readonly ProgramVectorExecutionAuthorityDraft[] => {
    const outcome = compileGraphVectorExecutionHandoff({
      graphFunction: input.executionSubjectGraphFunction,
      graphVector,
      graphFunctions: input.executionBinding.module.graphFunctions,
      module: input.executionBinding.module,
      targetCarrierDefaults,
      admittedTenantConformanceManifest:
        input.admittedTenantConformanceManifest
    });
    if (outcome.status === "structural_only") {
      const relationCompilation = compileHofRelation({
        graphFunction: input.executionSubjectGraphFunction,
        graphFunctions: input.executionBinding.module.graphFunctions
      });
      const relation = relationCompilation.relation;
      if (
        !relationCompilation.accepted ||
        relation === null ||
        relation.wrapperGraphVectorRef !== graphVector.id
      ) {
        throw new ProgramExecutionAuthorityCompileError({
          code: "program_invalid",
          message:
            `structural execution subject ${JSON.stringify(input.executionSubjectGraphFunction.id)} does not preserve one admitted HOF relation`,
          diagnosticRefs: relationCompilation.diagnostics.map(
            (row) => row.diagnosticId
          )
        });
      }
      addExactChildRef({
        refs: structuralChildRefs,
        ref: relation.childGraphFunctionRef,
        digest: relation.childGraphFunctionDigest,
        relation: "structural HOF"
      });
      structuralHofRelations.push(relation);
      const child = exactStructuralChild({
        relation,
        moduleGraphFunctions: input.executionBinding.module.graphFunctions
      });
      const childOutcome = compileGraphVectorExecutionHandoff({
        graphFunction: child.graphFunction,
        graphVector: child.graphVector,
        graphFunctions: input.executionBinding.module.graphFunctions,
        module: input.executionBinding.module,
        targetCarrierDefaults,
        admittedTenantConformanceManifest:
          input.admittedTenantConformanceManifest
      });
      if (childOutcome.status !== "published_startup_blocked") {
        throw new ProgramExecutionAuthorityCompileError({
          code: childOutcome.status === "blocked_capability"
            ? "capability_missing"
            : "program_invalid",
          message:
            `structural HOF child ${JSON.stringify(child.graphFunction.id)} is not statically admitted: ${childOutcome.status}`,
          diagnosticRefs: childOutcome.diagnostics.map(
            (row) => row.diagnosticId
          )
        });
      }
      const declarationOwnerGraphFunction = exactCompositionOwner({
        moduleGraphFunctions: input.executionBinding.module.graphFunctions,
        outcome: childOutcome
      });
      const binding = compileHofFanOutBinding({
        module: input.executionBinding.module,
        relation,
        childExecutionHandoff: childOutcome.handoff
      });
      const sourceInput = Object.freeze({
        kind: "structural_hof_fan_out" as const,
        module: input.executionBinding.module,
        executionSubjectGraphFunction:
          input.executionSubjectGraphFunction,
        declarationOwnerGraphFunction,
        graphVector,
        targetCarrierDefaults,
        admittedTenantConformanceManifest:
          input.admittedTenantConformanceManifest,
        outcome,
        relation,
        binding,
        childExecutionHandoff: childOutcome.handoff
      });
      const source = projectTraversalContractSourceBasis(sourceInput);
      const loci = source.workStages.map((stage) => {
        const resultAuthority =
          admitProgramLocusTraversalStageResultAuthority({
            source,
            programLocusRef: stage.programLocusRef
          });
        return sealProgramLocusExecutionAuthority({
          kind: "program_locus_execution_authority",
          stageOrdinal: stage.ordinal,
          programLocusRef: stage.programLocusRef,
          programLocusDigest: stage.programLocusDigest,
          compiledExecutionContext: null,
          resultAuthority
        });
      });
      const bundle = compileTraversalExecutionContracts({
        source,
        resultAuthorities: loci.map((locus) => locus.resultAuthority)
      });
      return Object.freeze([Object.freeze({
        vectorIndex,
        graphVector,
        outcome,
        sourceInput,
        source,
        loci: Object.freeze(loci),
        bundle
      })]);
    }
    if (outcome.status !== "published_startup_blocked") {
      const diagnosticRefs = outcome.diagnostics.map(
        (row) => row.diagnosticId
      );
      throw new ProgramExecutionAuthorityCompileError({
        code: outcome.status === "blocked_capability"
          ? "capability_missing"
          : "program_invalid",
        message:
          `program execution authority blocked at vector ${JSON.stringify(graphVector.id)}: ${outcome.status}:${diagnosticRefs.join(",")}`,
        diagnosticRefs
      });
    }
    const declarationOwnerGraphFunction = exactCompositionOwner({
      moduleGraphFunctions: input.executionBinding.module.graphFunctions,
      outcome
    });
    const sourceInput = Object.freeze({
      kind: "selected_program_handoff" as const,
      module: input.executionBinding.module,
      executionSubjectGraphFunction: input.executionSubjectGraphFunction,
      declarationOwnerGraphFunction,
      graphVector,
      targetCarrierDefaults,
      admittedTenantConformanceManifest:
        input.admittedTenantConformanceManifest,
      outcome
    });
    const source = projectTraversalContractSourceBasis(sourceInput);
    const loci = source.workStages.map((stage) => {
      if (
        (stage.regime === "F_P" || stage.regime === "F_H") &&
        stage.declaredStageIndex !== null &&
        stage.domainStageRole !== null
      ) {
        const compiledExecutionContext =
          compileDeclaredExecutionContextContract({
          sourceOutcome: outcome,
          stageBasis: constructDeclaredCStageInvocationBasis({
            programBindingDigest: source.selectedProgramBindingDigest,
            stageIndex: stage.declaredStageIndex,
            stageRole: stage.domainStageRole,
            regime: stage.regime,
            termDigest: declaredStageDigestFromOwnHandoff({
              outcome,
              stage
            }),
            instructionCategoryRefs: stage.instructionCategoryRefs
          }),
          selectedCatalogEntryRef: input.executionBinding.entryRef,
          catalogBasis: input.basis
        });
        const resultAuthority = admitDeclaredTraversalStageResultAuthority({
          source,
          stageOrdinal: stage.ordinal,
          contract: compiledExecutionContext,
          selectedResultContractRef: stage.resultBearing
            ? source.targetCarrierProjection.targetCarrierContractRef
            : stage.outputCarrierRefs[0]!,
          fpWireProfile:
            stage.regime === "F_P"
              ? fpWireProfileForProgramLocus({
                  owner: declarationOwnerGraphFunction,
                  stage
                })
              : null
        });
        return sealProgramLocusExecutionAuthority({
          kind: "program_locus_execution_authority",
          stageOrdinal: stage.ordinal,
          programLocusRef: stage.programLocusRef,
          programLocusDigest: stage.programLocusDigest,
          compiledExecutionContext,
          resultAuthority
        });
      }
      const resultAuthority = admitProgramLocusTraversalStageResultAuthority({
        source,
        programLocusRef: stage.programLocusRef
      });
      return sealProgramLocusExecutionAuthority({
        kind: "program_locus_execution_authority",
        stageOrdinal: stage.ordinal,
        programLocusRef: stage.programLocusRef,
        programLocusDigest: stage.programLocusDigest,
        compiledExecutionContext: null,
        resultAuthority
      });
    });
    const bundle = compileTraversalExecutionContracts({
      source,
      resultAuthorities: loci.map((locus) => locus.resultAuthority)
    });
    return Object.freeze([Object.freeze({
      vectorIndex,
      graphVector,
      outcome,
      sourceInput,
      source,
      loci: Object.freeze(loci),
      bundle
    })]);
  });

  return Object.freeze({
    drafts: Object.freeze(drafts),
    structuralHofRelations: Object.freeze(structuralHofRelations),
    structuralChildRefs: Object.freeze([...structuralChildRefs])
  });
}

export function compileProgramExecutionAuthoritySet(input: {
  readonly basis: AdmittedRuntimeCatalogBasis;
  readonly executionBinding: CatalogExecutionBinding;
  readonly admittedTenantConformanceManifest:
    | AdmittedTenantConformanceManifest
    | null;
}): ProgramExecutionAuthoritySet {
  const subjectDrafts: {
    readonly graphFunction: GraphFunction;
    readonly drafts: ReturnType<
      typeof compileProgramVectorExecutionAuthorityDrafts
    >["drafts"];
  }[] = [];
  const submittedGraphFunctions: GraphFunction[] = [];
  const structuralHofRelations: CompiledHofFanOutRelation[] = [];
  const pending: GraphFunction[] = [input.executionBinding.graphFunction];
  const admittedRefs = new Set<string>();

  while (pending.length > 0) {
    const executionSubjectGraphFunction = pending.shift();
    if (executionSubjectGraphFunction === undefined) {
      throw new TypeError("catalog execution subject queue became inconsistent");
    }
    if (admittedRefs.has(executionSubjectGraphFunction.id)) continue;
    admittedRefs.add(executionSubjectGraphFunction.id);
    submittedGraphFunctions.push(executionSubjectGraphFunction);

    const compilation = compileProgramVectorExecutionAuthorityDrafts({
      ...input,
      executionSubjectGraphFunction
    });
    const drafts = compilation.drafts;
    structuralHofRelations.push(...compilation.structuralHofRelations);
    if (drafts.length > 0) {
      subjectDrafts.push(Object.freeze({
        graphFunction: executionSubjectGraphFunction,
        drafts
      }));
    }

    const childRefs = new Map<string, `sha256:${string}`>(
      compilation.structuralChildRefs
    );
    for (const draft of drafts) {
      for (const child of workflowLiftsInExecutionOrder(
        draft.source.completeProgramPlan
      )) {
        addExactChildRef({
          refs: childRefs,
          ref: child.childGraphFunctionRef,
          digest: child.childGraphFunctionDigest,
          relation: "workflow.C"
        });
      }
      if (draft.outcome.status === "published_startup_blocked") {
        const fanIn = draft.outcome.handoff.fanInApplicationRelation;
        if (fanIn !== null) {
          addExactChildRef({
            refs: childRefs,
            ref: fanIn.reducerGraphFunctionRef,
            digest: fanIn.reducerGraphFunctionDigest,
            relation: "fan_in"
          });
        }
        const recurse = draft.outcome.handoff.recurseApplicationRelation;
        if (recurse !== null) {
          addExactChildRef({
            refs: childRefs,
            ref: recurse.operandGraphFunctionRef,
            digest: recurse.operandGraphFunctionDigest,
            relation: "recurse"
          });
        }
      }
    }
    for (const [childRef, childDigest] of childRefs) {
      if (admittedRefs.has(childRef)) continue;
      const matches = input.executionBinding.module.graphFunctions.filter(
        (candidate) =>
          candidate.id === childRef &&
          stableSha256Digest(candidate) === childDigest
      );
      const child = matches[0];
      if (matches.length !== 1 || child === undefined) {
        throw new TypeError(
          `reachable execution child ${JSON.stringify(childRef)} must resolve once at its compiled digest in the selected Module`
        );
      }
      if (!pending.some((candidate) => candidate.id === child.id)) {
        pending.push(child);
      }
    }
  }

  const allDrafts = Object.freeze(
    subjectDrafts.flatMap((subject) => subject.drafts)
  );
  const abiPackageVersion =
    input.admittedTenantConformanceManifest?.manifest.engineVersion;
  if (abiPackageVersion === undefined || abiPackageVersion.length === 0) {
    throw new ProgramExecutionAuthorityCompileError({
      code: "capability_missing",
      message:
        "program execution authority requires the admitted tenant manifest engine version; no local ABI version default is lawful",
      diagnosticRefs: Object.freeze([
        "gap://abg/t270/admitted-engine-version-projection"
      ])
    });
  }
  const conformanceInput = Object.freeze({
    subjectRef:
      `abg://catalog-invocation-conformance/${input.executionBinding.entryRef}/${stableSha256Digest({
        moduleDigest: stableSha256Digest(input.executionBinding.module),
        graphFunctionRefs: submittedGraphFunctions.map(
          (graphFunction) => graphFunction.id
        )
      }).slice("sha256:".length)}`,
    abiPackageVersion,
    scopeKind: "submitted_structure" as const,
    graphFunctions: Object.freeze(
      submittedGraphFunctions
    ),
    targetCarrierContracts: Object.freeze(
      allDrafts.map((draft) => draft.source.targetCarrierProjection)
    ),
    edgeClosureContracts: Object.freeze(
      allDrafts.map(
        (draft) => draft.source.edgeClosureBinding.conformanceRow
      )
    ),
    computeCompositions: Object.freeze(
      allDrafts.map((draft) => draft.bundle.computeComposition)
    ),
    computeStageBindings: Object.freeze(
      allDrafts.flatMap((draft) => draft.bundle.computeStageBindings)
    ),
    pluginResultInterfaces: Object.freeze(
      allDrafts.flatMap((draft) => draft.bundle.pluginResultInterfaces)
    ),
    traversalBindConservation: Object.freeze(
      allDrafts.map((draft) => draft.bundle.traversalBindConservation)
    )
  });
  const report = typecheckGtlProgram(conformanceInput);
  const subjects = subjectDrafts.map((subject) => {
    const vectors = subject.drafts.map((draft) => {
      const admission = admitTraversalExecution({
        sourceInput: draft.sourceInput,
        source: draft.source,
        resultAuthorities: draft.loci.map(
          (locus) => locus.resultAuthority
        ),
        bundle: draft.bundle,
        conformanceInput,
        report
      });
      const structuralAdmission =
        draft.source.sourceKind === "structural_hof_fan_out" &&
        admission.status === "static_contracts_admitted_capability_blocked" &&
        admission.blockingIssueRefs.length === 0;
      if (
        admission.status !== "runtime_addressable_not_closed" &&
        !structuralAdmission
      ) {
        const detail = "blockingIssueRefs" in admission
          ? `:${JSON.stringify(report.issues.map((issue) => ({
              surfaceRef: issue.surfaceRef,
              ruleRef: issue.ruleRef,
              message: issue.message
            })))}`
          : "diagnostic" in admission
            ? `:${admission.diagnostic.diagnosticId}:${JSON.stringify(
                report.issues.map((issue) => ({
                  surfaceRef: issue.surfaceRef,
                  ruleRef: issue.ruleRef,
                  message: issue.message
                }))
              )}`
            : "";
        throw new ProgramExecutionAuthorityCompileError({
          code: admission.status ===
              "static_contracts_admitted_capability_blocked"
            ? "capability_missing"
            : "program_invalid",
          message:
            `program traversal admission blocked at vector ${String(draft.vectorIndex)} (${draft.graphVector.name}): ${admission.status}${detail}`,
          diagnosticRefs: report.issues.map((issue) => issue.ruleRef)
        });
      }
      return sealProgramVectorExecutionAuthority({
        kind: "program_vector_execution_authority",
        vectorIndex: draft.vectorIndex,
        graphVectorRef: draft.graphVector.id,
        graphVectorDigest: stableSha256Digest(draft.graphVector),
        handoff: draft.outcome,
        source: draft.source,
        loci: draft.loci,
        bundle: draft.bundle,
        admission
      });
    });
    return sealProgramExecutionSubjectAuthority({
      kind: "program_execution_subject_authority",
      graphFunctionRef: subject.graphFunction.id,
      graphFunctionDigest: stableSha256Digest(subject.graphFunction),
      vectors: Object.freeze(vectors)
    });
  });

  return sealProgramExecutionAuthoritySet({
    kind: "program_execution_authority_set",
    catalogBasisRef: input.basis.basisRef,
    selectedCatalogEntryRef: input.executionBinding.entryRef,
    executionBindingDigest: stableSha256Digest(input.executionBinding),
    moduleDigest: stableSha256Digest(input.executionBinding.module),
    graphFunctionDigest: stableSha256Digest(
      input.executionBinding.graphFunction
    ),
    structuralHofRelations: Object.freeze(structuralHofRelations),
    subjects: Object.freeze(subjects)
  });
}

function nonEmpty(value: string, label: string): string {
  if (value.length === 0) {
    throw new TypeError(`${label} must be non-empty`);
  }
  return value;
}

function sealProgramLocusExecutionAuthority(
  input: ProgramLocusExecutionAuthority
): ProgramLocusExecutionAuthority {
  if (!Number.isInteger(input.stageOrdinal) || input.stageOrdinal < 0) {
    throw new TypeError("Catalog locus stageOrdinal must be a non-negative integer");
  }
  nonEmpty(input.programLocusRef, "Catalog locus programLocusRef");
  return Object.freeze({ ...input });
}

function vectorBasis(input: ProgramVectorExecutionAuthority) {
  return Object.freeze({ ...input, loci: Object.freeze([...input.loci]) });
}

function sealProgramExecutionSubjectAuthority(
  input: ProgramExecutionSubjectAuthority
): ProgramExecutionSubjectAuthority {
  nonEmpty(input.graphFunctionRef, "Catalog execution subject graphFunctionRef");
  if (
    input.vectors.length === 0 ||
    input.vectors.some((row, index) => row.vectorIndex !== index) ||
    input.vectors.some(
      (row) =>
        row.source.graphFunctionId !== input.graphFunctionRef ||
        row.source.graphFunctionDigest !== input.graphFunctionDigest ||
        (row.source.sourceKind === "selected_program_handoff" &&
          (row.source.completeProgramPlan.executionGraphFunctionRef !==
            input.graphFunctionRef ||
            row.source.completeProgramPlan.executionGraphFunctionDigest !==
              input.graphFunctionDigest)) ||
        (row.source.sourceKind === "structural_hof_fan_out" &&
          row.source.applicationKind !== "fan_out")
    )
  ) {
    throw new TypeError(
      "Catalog execution subject must preserve one non-empty, canonically ordered GraphFunction vector family"
    );
  }
  return Object.freeze({
    ...input,
    vectors: Object.freeze([...input.vectors])
  });
}

function sealProgramVectorExecutionAuthority(
  input: ProgramVectorExecutionAuthority
): ProgramVectorExecutionAuthority {
  if (!Number.isInteger(input.vectorIndex) || input.vectorIndex < 0) {
    throw new TypeError("Catalog vector index must be a non-negative integer");
  }
  if (
    input.loci.length !== input.source.workStages.length ||
    input.source.workStages.some((stage, ordinal) => {
      const locus = input.loci[ordinal];
      return locus === undefined ||
        locus.stageOrdinal !== stage.ordinal ||
        locus.programLocusRef !== stage.programLocusRef ||
        locus.programLocusDigest !== stage.programLocusDigest;
    })
  ) {
    throw new TypeError("Catalog vector authority must preserve every source locus in order");
  }
  const admissionMismatches = [
    ...((input.source.sourceKind === "selected_program_handoff" &&
      input.admission.status === "runtime_addressable_not_closed") ||
    (input.source.sourceKind === "structural_hof_fan_out" &&
      input.admission.status ===
        "static_contracts_admitted_capability_blocked" &&
      input.admission.blockingIssueRefs.length === 0)
      ? []
      : ["status"]),
    ...(input.admission.bundleDigest === input.bundle.bundleDigest
      ? []
      : ["bundleDigest"]),
    ...(input.admission.sourceDigest === input.source.sourceDigest
      ? []
      : ["sourceDigest"]),
    ...(input.graphVectorRef === input.source.graphVectorId &&
    (input.source.sourceKind === "structural_hof_fan_out" ||
      input.graphVectorRef === input.source.completeProgramPlan.graphVectorRef)
      ? []
      : ["graphVectorRef"]),
    ...(input.graphVectorDigest === input.source.graphVectorDigest
      ? []
      : ["graphVectorDigest"])
  ];
  if (admissionMismatches.length > 0) {
    throw new TypeError(
      `Catalog vector authority does not preserve its T-267 admission: ${admissionMismatches.join(", ")}`
    );
  }
  return vectorBasis(input);
}

function authoritySetBasis(
  input: Omit<ProgramExecutionAuthoritySet, "authoritySetRef" | "authoritySetDigest">
) {
  return Object.freeze({
    ...input,
    structuralHofRelations: Object.freeze([
      ...input.structuralHofRelations
    ]),
    subjects: Object.freeze([...input.subjects])
  });
}

function sealProgramExecutionAuthoritySet(
  input: Omit<ProgramExecutionAuthoritySet, "authoritySetRef" | "authoritySetDigest">
): ProgramExecutionAuthoritySet {
  nonEmpty(input.catalogBasisRef, "Catalog authority catalogBasisRef");
  nonEmpty(input.selectedCatalogEntryRef, "Catalog authority selectedCatalogEntryRef");
  const root = input.subjects[0];
  const selectedRootIsExecutable =
    root?.graphFunctionDigest === input.graphFunctionDigest;
  const selectedRootIsStructural = input.structuralHofRelations.some(
    (relation) => relation.hostGraphFunctionDigest === input.graphFunctionDigest
  );
  if (
    root === undefined ||
    (!selectedRootIsExecutable && !selectedRootIsStructural) ||
    input.subjects.some(
      (row, index) =>
        input.subjects.findIndex(
          (candidate) => candidate.graphFunctionRef === row.graphFunctionRef
        ) !== index
    )
  ) {
    throw new TypeError(
      "Catalog authority subjects must be non-empty, uniquely addressed, and rooted at the selected executable or structural GraphFunction"
    );
  }
  if (
    input.structuralHofRelations.some(
      (relation, index) =>
        input.structuralHofRelations.findIndex(
          (candidate) =>
            candidate.relationBindingRef === relation.relationBindingRef
        ) !== index ||
        !input.subjects.some(
          (subject) =>
            subject.graphFunctionRef === relation.hostGraphFunctionRef &&
            subject.graphFunctionDigest === relation.hostGraphFunctionDigest &&
            subject.vectors.some(
              (vector) =>
                vector.graphVectorRef === relation.wrapperGraphVectorRef &&
                vector.source.sourceKind === "structural_hof_fan_out"
            )
        ) ||
        !input.subjects.some(
          (subject) =>
            subject.graphFunctionRef === relation.childGraphFunctionRef &&
            subject.graphFunctionDigest === relation.childGraphFunctionDigest
        )
    )
  ) {
    throw new TypeError(
      "Catalog authority structural HOF relations must be unique and resolve to their exact structural hosts and executable child subjects"
    );
  }
  const basis = authoritySetBasis(input);
  const authoritySetDigest = stableSha256Digest(basis);
  return Object.freeze({
    ...basis,
    authoritySetRef:
      `abg://program-execution-authority/${authoritySetDigest.slice("sha256:".length)}`,
    authoritySetDigest
  });
}

export function assertProgramExecutionAuthoritySet(
  authority: ProgramExecutionAuthoritySet
): void {
  const expected = sealProgramExecutionAuthoritySet({
    kind: authority.kind,
    catalogBasisRef: authority.catalogBasisRef,
    selectedCatalogEntryRef: authority.selectedCatalogEntryRef,
    executionBindingDigest: authority.executionBindingDigest,
    moduleDigest: authority.moduleDigest,
    graphFunctionDigest: authority.graphFunctionDigest,
    structuralHofRelations: Object.freeze([
      ...authority.structuralHofRelations
    ]),
    subjects: Object.freeze(
      authority.subjects.map((subject) =>
        sealProgramExecutionSubjectAuthority({
          kind: subject.kind,
          graphFunctionRef: subject.graphFunctionRef,
          graphFunctionDigest: subject.graphFunctionDigest,
          vectors: Object.freeze(
            subject.vectors.map((row) =>
              sealProgramVectorExecutionAuthority({
                kind: row.kind,
                vectorIndex: row.vectorIndex,
                graphVectorRef: row.graphVectorRef,
                graphVectorDigest: row.graphVectorDigest,
                handoff: row.handoff,
                source: row.source,
                loci: Object.freeze(
                  row.loci.map((locus) =>
                    sealProgramLocusExecutionAuthority({
                      kind: locus.kind,
                      stageOrdinal: locus.stageOrdinal,
                      programLocusRef: locus.programLocusRef,
                      programLocusDigest: locus.programLocusDigest,
                      compiledExecutionContext:
                        locus.compiledExecutionContext,
                      resultAuthority: locus.resultAuthority
                    })
                  )
                ),
                bundle: row.bundle,
                admission: row.admission
              })
            )
          )
        })
      )
    )
  });
  if (!stableJsonEquals(authority, expected)) {
    throw new TypeError("Catalog invocation execution authority identity is stale or malformed");
  }
}

function resolveProgramExecutionSubjectAuthority(input: {
  readonly authority: ProgramExecutionAuthoritySet;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest?: `sha256:${string}`;
}): ProgramExecutionSubjectAuthority {
  assertProgramExecutionAuthoritySet(input.authority);
  const matches = input.authority.subjects.filter(
    (subject) =>
      subject.graphFunctionRef === input.graphFunctionRef &&
      (input.graphFunctionDigest === undefined ||
        subject.graphFunctionDigest === input.graphFunctionDigest)
  );
  const subject = matches[0];
  if (matches.length !== 1 || subject === undefined) {
    throw new TypeError(
      `Catalog execution subject ${JSON.stringify(input.graphFunctionRef)} does not resolve exactly once`
    );
  }
  return subject;
}

export function selectedProgramExecutionSubjectAuthority(
  authority: ProgramExecutionAuthoritySet
): ProgramExecutionSubjectAuthority {
  return resolveProgramExecutionSubjectAuthority({
    authority,
    graphFunctionRef: authority.subjects[0]?.graphFunctionRef ?? "",
    graphFunctionDigest: authority.graphFunctionDigest
  });
}
