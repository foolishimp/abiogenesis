// Implements the T-267 whole-execution-family compilation boundary. It derives
// every subordinate contract from one admitted catalog binding, typechecks the
// complete reachable family once, and never executes work or permits effects.

import {
  materializeGraphFunction,
  type GraphFunction,
  type GraphVector,
  type Operator
} from "../../../gtl/m01/contracts/carriers.js";
import { loadGtlTargetCarrierDefaultsBundle } from "../../../gtl/m01/contracts/target_carrier_contract.js";
import type { AdmittedTenantConformanceManifest } from "../../../shared/abg_library/tenant_conformance_manifest.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  compileDeclaredExecutionContextContract,
  type CompiledExecutionContextContract
} from "./declared_execution_context.js";
import {
  compiledCInvokingLociInDeclaredOrder,
  type CompiledCStageLeaf,
  type CompiledCWorkflowLift
} from "./complete_c_program.js";
import {
  compileGraphVectorExecutionHandoff,
  type GraphVectorExecutionHandoffPublished,
  type GraphVectorExecutionHandoffStructuralOnly
} from "./graph_vector_execution_handoff.js";
import { compileHofFanOutBinding } from "./hof_batch.js";
import {
  compileHofRelation,
  graphFunctionHasHofApplicationDeclarationKey,
  type CompiledHofFanOutRelation
} from "./hof_relation_compiler.js";
import { projectFpResultLocusContract } from "./fp_result_contract_admission.js";
import {
  pluginSelectionFromDeclarationAttrs,
  type StandardCatalogRow
} from "./plugin_selection.js";
import {
  assertAdmittedRuntimeCatalogBasis,
  type AdmittedRuntimeCatalogBasis,
  type CatalogExecutionBinding
} from "./runtime_catalog.js";
import type { RuntimeSchemaRequirement } from "./runtime_schema_admission.js";
import { typecheckGtlProgram } from "./gtl_program_conformance.js";
import {
  admitDeclaredTraversalStageResultAuthority,
  admitProgramLocusTraversalStageResultAuthority,
  compileTraversalExecutionContracts,
  projectTraversalContractSourceBasis,
  type AdmittedTraversalStageResultAuthority,
  type CompiledTraversalExecutionContracts,
  type ProjectTraversalContractSourceInput,
  type TraversalContractSourceBasis,
  type TraversalContractWorkStage
} from "./traversal_execution_contract.js";
import { admitTraversalExecutionAgainstCheckedReport } from "./traversal_execution_admission_internal.js";

export interface TraversalExecutionFamilyLocus {
  readonly kind: "traversal_execution_family_locus";
  readonly stageOrdinal: number;
  readonly programLocusRef: string;
  readonly programLocusDigest: `sha256:${string}`;
  readonly executionContextRef: string | null;
  readonly executionContextDigest: `sha256:${string}` | null;
  readonly resultAuthorityRef: string;
  readonly resultAuthorityDigest: `sha256:${string}`;
}

export interface TraversalExecutionFamilyVector {
  readonly kind: "traversal_execution_family_vector";
  readonly vectorIndex: number;
  readonly graphVectorRef: string;
  readonly graphVectorDigest: `sha256:${string}`;
  readonly sourceKind: TraversalContractSourceBasis["sourceKind"];
  readonly sourceRef: string;
  readonly sourceDigest: `sha256:${string}`;
  readonly currentAuthorityRef: string;
  readonly currentAuthorityDigest: `sha256:${string}`;
  readonly programPlanRef: string;
  readonly programPlanDigest: `sha256:${string}`;
  readonly normalizedProgram: Readonly<{
    readonly programRef: string;
    readonly programDigest: `sha256:${string}`;
  }> | null;
  readonly loci: readonly TraversalExecutionFamilyLocus[];
  readonly bundleRef: string;
  readonly bundleDigest: `sha256:${string}`;
  readonly admissionStatus:
    | "runtime_addressable_not_closed"
    | "static_contracts_admitted_capability_blocked";
  readonly admissionRef: string;
  readonly admissionDigest: `sha256:${string}`;
  readonly reportRef: string;
  readonly runtimeAddressable: boolean;
  readonly effectsPermitted: false;
}

interface TraversalExecutionFamilyLocusDraft {
  readonly stageOrdinal: number;
  readonly programLocusRef: string;
  readonly programLocusDigest: `sha256:${string}`;
  readonly compiledExecutionContext: CompiledExecutionContextContract | null;
  readonly resultAuthority: AdmittedTraversalStageResultAuthority;
}

interface TraversalExecutionFamilyVectorDraft {
  readonly vectorIndex: number;
  readonly graphVector: GraphVector;
  readonly outcome:
    | GraphVectorExecutionHandoffPublished
    | GraphVectorExecutionHandoffStructuralOnly;
  readonly sourceInput: ProjectTraversalContractSourceInput;
  readonly source: TraversalContractSourceBasis;
  readonly loci: readonly TraversalExecutionFamilyLocusDraft[];
  readonly bundle: CompiledTraversalExecutionContracts;
}

export interface TraversalExecutionFamilySubject {
  readonly kind: "traversal_execution_family_subject";
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: `sha256:${string}`;
  readonly vectors: readonly TraversalExecutionFamilyVector[];
}

export interface TraversalExecutionFamilyConformanceEvidence {
  readonly kind: "traversal_execution_family_conformance_evidence";
  readonly subjectRef: string;
  readonly reportRef: string;
  readonly inventoryDigest: string;
  readonly traversalUnitProjectionDigest: `sha256:${string}`;
  readonly passed: true;
  readonly issueCount: 0;
}

export interface CompiledTraversalExecutionFamily {
  readonly kind: "compiled_traversal_execution_family";
  readonly familyRef: string;
  readonly familyDigest: `sha256:${string}`;
  readonly catalogBasisRef: string;
  readonly selectedCatalogEntryRef: string;
  readonly executionBindingDigest: `sha256:${string}`;
  readonly moduleDigest: `sha256:${string}`;
  readonly rootGraphFunctionDigest: `sha256:${string}`;
  readonly structuralHofRelations: readonly CompiledHofFanOutRelation[];
  readonly subjects: readonly TraversalExecutionFamilySubject[];
  readonly conformanceEvidence: TraversalExecutionFamilyConformanceEvidence;
  readonly effectsPermitted: false;
}

export interface TraversalExecutionFamilyOperatorProjection {
  readonly kind: "traversal_execution_family_operator_projection";
  readonly graphVectorRef: string;
  readonly operatorOrdinal: number;
  readonly operatorName: Operator["name"];
  readonly regime: Operator["regime"];
  readonly binding: Operator["binding"];
  readonly tags: Operator["tags"];
  readonly operatorDigest: `sha256:${string}`;
}

export interface TraversalExecutionFamilyRuntimeLocusProjection {
  readonly compact: TraversalExecutionFamilyLocus;
  readonly stage: TraversalContractWorkStage;
  readonly node: CompiledCStageLeaf | CompiledCWorkflowLift;
  readonly compiledExecutionContext: CompiledExecutionContextContract | null;
  readonly resultAuthority: AdmittedTraversalStageResultAuthority;
  readonly operator: TraversalExecutionFamilyOperatorProjection | null;
}

export interface TraversalExecutionFamilyRuntimeVectorProjection {
  readonly compact: TraversalExecutionFamilyVector;
  readonly graphVector: GraphVector;
  readonly sourceInput: ProjectTraversalContractSourceInput;
  readonly source: TraversalContractSourceBasis;
  readonly loci: readonly TraversalExecutionFamilyRuntimeLocusProjection[];
}

export interface TraversalExecutionFamilyRuntimeProjection {
  readonly kind: "traversal_execution_family_runtime_projection";
  readonly compactFamily: CompiledTraversalExecutionFamily;
  readonly vectors: readonly TraversalExecutionFamilyRuntimeVectorProjection[];
  readonly requiredSchemas: readonly RuntimeSchemaRequirement[];
  readonly projectionDigest: `sha256:${string}`;
  readonly effectsPermitted: false;
}

function traversalExecutionFamilyRuntimeProjectionDigest(input: {
  readonly family: CompiledTraversalExecutionFamily;
  readonly vectors: readonly TraversalExecutionFamilyRuntimeVectorProjection[];
  readonly requiredSchemas: readonly RuntimeSchemaRequirement[];
}): `sha256:${string}` {
  return stableSha256Digest({
    compactFamilyDigest: input.family.familyDigest,
    vectors: input.vectors.map((vector) => Object.freeze({
      graphVectorRef: vector.compact.graphVectorRef,
      graphVectorDigest: vector.compact.graphVectorDigest,
      programPlanRef: vector.compact.programPlanRef,
      programPlanDigest: vector.compact.programPlanDigest,
      loci: vector.loci.map((locus) => Object.freeze({
        programLocusRef: locus.compact.programLocusRef,
        programLocusDigest: locus.compact.programLocusDigest,
        nodeRef: locus.node.nodeRef,
        nodeDigest: locus.node.nodeDigest,
        operatorDigest: locus.operator?.operatorDigest ?? null
      }))
    })),
    requiredSchemas: input.requiredSchemas
  });
}

/** @internal */
export function assertTraversalExecutionFamilyRuntimeProjection(
  projection: TraversalExecutionFamilyRuntimeProjection
): void {
  assertCompiledTraversalExecutionFamily(projection.compactFamily);
  if (
    projection.kind !== "traversal_execution_family_runtime_projection" ||
    projection.effectsPermitted !== false ||
    projection.projectionDigest !==
      traversalExecutionFamilyRuntimeProjectionDigest({
        family: projection.compactFamily,
        vectors: projection.vectors,
        requiredSchemas: projection.requiredSchemas
      })
  ) {
    throw new TypeError(
      "traversal execution family runtime projection seal differs"
    );
  }
}

export type TraversalExecutionFamilyCompileErrorCode =
  | "capability_missing"
  | "program_invalid";

export class TraversalExecutionFamilyCompileError extends TypeError {
  public readonly code: TraversalExecutionFamilyCompileErrorCode;
  public readonly diagnosticRefs: readonly string[];

  public constructor(input: {
    readonly code: TraversalExecutionFamilyCompileErrorCode;
    readonly message: string;
    readonly diagnosticRefs?: readonly string[];
  }) {
    super(input.message);
    this.name = "TraversalExecutionFamilyCompileError";
    this.code = input.code;
    this.diagnosticRefs = Object.freeze([...(input.diagnosticRefs ?? [])]);
  }
}

function compactDiagnosticRelation(value: string): string {
  const limit = 512;
  return value.length <= limit
    ? value
    : `[${String(value.length - limit)} chars omitted] ${value.slice(-limit)}`;
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
    throw new TraversalExecutionFamilyCompileError({
      code: "program_invalid",
      message:
        `catalog execution composition owner ${JSON.stringify(ownerRef)} resolved ${String(matches.length)} times`,
      diagnosticRefs: Object.freeze([ownerRef ?? "null-composition-owner"])
    });
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
      stableSha256Digest(candidate) === input.relation.childGraphFunctionDigest
  );
  const graphFunction = graphFunctionMatches[0];
  if (graphFunctionMatches.length !== 1 || graphFunction === undefined) {
    throw new TraversalExecutionFamilyCompileError({
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
    throw new TraversalExecutionFamilyCompileError({
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
    throw new TraversalExecutionFamilyCompileError({
      code: "program_invalid",
      message:
        `${input.relation} child ${JSON.stringify(input.ref)} has conflicting compiled identities`,
      diagnosticRefs: Object.freeze([input.ref, priorDigest, input.digest])
    });
  }
  input.refs.set(input.ref, input.digest);
}

function sealLocus(
  input: TraversalExecutionFamilyLocus
): TraversalExecutionFamilyLocus {
  if (
    !Number.isInteger(input.stageOrdinal) ||
    input.stageOrdinal < 0 ||
    input.programLocusRef.length === 0 ||
    input.resultAuthorityRef.length === 0 ||
    (input.executionContextRef === null) !==
      (input.executionContextDigest === null)
  ) {
    throw new TypeError(
      "family locus must preserve one program locus, result authority, and optional context identity"
    );
  }
  return Object.freeze({ ...input });
}

function compileSubjectDrafts(input: {
  readonly basis: AdmittedRuntimeCatalogBasis;
  readonly executionBinding: CatalogExecutionBinding;
  readonly executionSubjectGraphFunction: GraphFunction;
  readonly admittedTenantConformanceManifest: AdmittedTenantConformanceManifest;
}): {
  readonly drafts: readonly TraversalExecutionFamilyVectorDraft[];
  readonly structuralHofRelations: readonly CompiledHofFanOutRelation[];
  readonly structuralChildRefs: readonly (readonly [string, `sha256:${string}`])[];
} {
  const subjectMatches = input.executionBinding.module.graphFunctions.filter(
    (candidate) => candidate.id === input.executionSubjectGraphFunction.id
  );
  if (
    subjectMatches.length !== 1 ||
    subjectMatches[0] === undefined ||
    !stableJsonEquals(subjectMatches[0], input.executionSubjectGraphFunction)
  ) {
    throw new TraversalExecutionFamilyCompileError({
      code: "program_invalid",
      message:
        "catalog execution subject must occur exactly once and byte-equivalent in the selected Module"
    });
  }
  const graph = materializeGraphFunction(input.executionSubjectGraphFunction);
  if (graph.vectors.length === 0) {
    throw new TraversalExecutionFamilyCompileError({
      code: "program_invalid",
      message: "catalog work has no GraphVector to compile"
    });
  }
  const targetCarrierDefaults = loadGtlTargetCarrierDefaultsBundle();
  const structuralChildRefs = new Map<string, `sha256:${string}`>();
  const structuralHofRelations: CompiledHofFanOutRelation[] = [];
  const drafts = graph.vectors.flatMap(
    (graphVector, vectorIndex): readonly TraversalExecutionFamilyVectorDraft[] => {
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
        if (
          !graphFunctionHasHofApplicationDeclarationKey(
            input.executionSubjectGraphFunction
          )
        ) {
          throw new TraversalExecutionFamilyCompileError({
            code: "program_invalid",
            message:
              `selector-free ordinary GraphFunction ${JSON.stringify(input.executionSubjectGraphFunction.id)} ` +
              `cannot enter runtime at vector ${JSON.stringify(graphVector.id)}; declare one exact vector C-program selector`,
            diagnosticRefs: Object.freeze([
              input.executionSubjectGraphFunction.id,
              graphVector.id,
              "abg.hog_program_ref"
            ])
          });
        }
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
          throw new TraversalExecutionFamilyCompileError({
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
          throw new TraversalExecutionFamilyCompileError({
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
        const loci = source.workStages.map((stage) => Object.freeze({
          stageOrdinal: stage.ordinal,
          programLocusRef: stage.programLocusRef,
          programLocusDigest: stage.programLocusDigest,
          compiledExecutionContext: null,
          resultAuthority: admitProgramLocusTraversalStageResultAuthority({
            source,
            programLocusRef: stage.programLocusRef
          })
        }));
        return Object.freeze([Object.freeze({
          vectorIndex,
          graphVector,
          outcome,
          sourceInput,
          source,
          loci: Object.freeze(loci),
          bundle: compileTraversalExecutionContracts({
            source,
            resultAuthorities: loci.map((locus) => locus.resultAuthority)
          })
        })]);
      }
      if (outcome.status !== "published_startup_blocked") {
        throw new TraversalExecutionFamilyCompileError({
          code: outcome.status === "blocked_capability"
            ? "capability_missing"
            : "program_invalid",
          message:
            `program execution family blocked at vector ${JSON.stringify(graphVector.id)}: ${outcome.status}; ` +
            outcome.diagnostics.map(
              (row) =>
                `${row.diagnosticId}: ${compactDiagnosticRelation(row.actualRelation)}`
            ).join("; "),
          diagnosticRefs: outcome.diagnostics.map((row) => row.diagnosticId)
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
              programLocusRef: stage.programLocusRef,
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
            fpWireProfile: stage.regime === "F_P"
              ? fpWireProfileForProgramLocus({
                  owner: declarationOwnerGraphFunction,
                  stage
                })
              : null
          });
          return Object.freeze({
            stageOrdinal: stage.ordinal,
            programLocusRef: stage.programLocusRef,
            programLocusDigest: stage.programLocusDigest,
            compiledExecutionContext,
            resultAuthority
          });
        }
        return Object.freeze({
          stageOrdinal: stage.ordinal,
          programLocusRef: stage.programLocusRef,
          programLocusDigest: stage.programLocusDigest,
          compiledExecutionContext: null,
          resultAuthority: admitProgramLocusTraversalStageResultAuthority({
            source,
            programLocusRef: stage.programLocusRef
          })
        });
      });
      return Object.freeze([Object.freeze({
        vectorIndex,
        graphVector,
        outcome,
        sourceInput,
        source,
        loci: Object.freeze(loci),
        bundle: compileTraversalExecutionContracts({
          source,
          resultAuthorities: loci.map((locus) => locus.resultAuthority)
        })
      })]);
    }
  );
  return Object.freeze({
    drafts: Object.freeze(drafts),
    structuralHofRelations: Object.freeze(structuralHofRelations),
    structuralChildRefs: Object.freeze([...structuralChildRefs])
  });
}

function sealVector(
  input: TraversalExecutionFamilyVector
): TraversalExecutionFamilyVector {
  if (
    !Number.isInteger(input.vectorIndex) ||
    input.vectorIndex < 0 ||
    input.graphVectorRef.length === 0 ||
    input.sourceRef.length === 0 ||
    input.currentAuthorityRef.length === 0 ||
    input.programPlanRef.length === 0 ||
    input.bundleRef.length === 0 ||
    input.admissionRef.length === 0 ||
    input.reportRef.length === 0 ||
    input.loci.some((locus, ordinal) => locus.stageOrdinal !== ordinal) ||
    (input.normalizedProgram !== null &&
      input.normalizedProgram.programRef.length === 0) ||
    !(
      (input.admissionStatus === "runtime_addressable_not_closed" &&
        input.runtimeAddressable) ||
      (input.sourceKind === "structural_hof_fan_out" &&
        input.admissionStatus ===
          "static_contracts_admitted_capability_blocked" &&
        !input.runtimeAddressable)
    ) ||
    input.effectsPermitted !== false
  ) {
    throw new TypeError(
      "family vector must preserve every source locus and exact T-267 admission"
    );
  }
  return Object.freeze({ ...input, loci: Object.freeze([...input.loci]) });
}

function sealSubject(
  input: TraversalExecutionFamilySubject
): TraversalExecutionFamilySubject {
  if (
    input.graphFunctionRef.length === 0 ||
    input.vectors.length === 0 ||
    input.vectors.some((row, index) => row.vectorIndex !== index) ||
    input.vectors.some((row, index) =>
      input.vectors.findIndex(
        (candidate) =>
          candidate.graphVectorRef === row.graphVectorRef &&
          candidate.graphVectorDigest === row.graphVectorDigest
      ) !== index
    )
  ) {
    throw new TypeError(
      "family subject must preserve one non-empty ordered GraphFunction vector family"
    );
  }
  return Object.freeze({ ...input, vectors: Object.freeze([...input.vectors]) });
}

function familyBasis(
  input: Omit<CompiledTraversalExecutionFamily, "familyRef" | "familyDigest">
) {
  return Object.freeze({
    ...input,
    structuralHofRelations: Object.freeze([...input.structuralHofRelations]),
    subjects: Object.freeze([...input.subjects])
  });
}

function sealFamily(
  input: Omit<CompiledTraversalExecutionFamily, "familyRef" | "familyDigest">
): CompiledTraversalExecutionFamily {
  const root = input.subjects[0];
  if (
    root === undefined ||
    root.graphFunctionDigest !== input.rootGraphFunctionDigest ||
    input.subjects.some(
      (subject, index) => input.subjects.findIndex(
        (candidate) => candidate.graphFunctionRef === subject.graphFunctionRef
      ) !== index
    ) ||
    input.subjects.some((subject) => subject.vectors.some(
      (vector) => vector.reportRef !== input.conformanceEvidence.reportRef
    )) ||
    input.conformanceEvidence.kind !==
      "traversal_execution_family_conformance_evidence" ||
    input.conformanceEvidence.passed !== true ||
    input.conformanceEvidence.issueCount !== 0 ||
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
                vector.sourceKind === "structural_hof_fan_out"
            )
        ) ||
        !input.subjects.some(
          (subject) =>
            subject.graphFunctionRef === relation.childGraphFunctionRef &&
            subject.graphFunctionDigest === relation.childGraphFunctionDigest
        )
    ) ||
    input.effectsPermitted !== false
  ) {
    throw new TypeError(
      "execution family must be uniquely rooted and statically effect-free"
    );
  }
  const basis = familyBasis(input);
  const familyDigest = stableSha256Digest(basis);
  return Object.freeze({
    ...basis,
    familyRef:
      `abg://traversal-execution-family/${familyDigest.slice("sha256:".length)}`,
    familyDigest
  });
}

interface TraversalExecutionFamilyCompilerCoreResult {
  readonly family: CompiledTraversalExecutionFamily;
  readonly subjectDrafts: readonly Readonly<{
    readonly graphFunction: GraphFunction;
    readonly drafts: readonly TraversalExecutionFamilyVectorDraft[];
  }>[];
}

function compileTraversalExecutionFamilyCore(input: {
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly executionBinding: CatalogExecutionBinding;
  readonly admittedTenantConformanceManifest: AdmittedTenantConformanceManifest;
  readonly pluginCatalog?: Readonly<Record<string, StandardCatalogRow>> | undefined;
}): TraversalExecutionFamilyCompilerCoreResult {
  assertAdmittedRuntimeCatalogBasis(input.catalogBasis);
  const bindingMatches = input.catalogBasis.executionBindings.filter(
    (binding) =>
      binding.entryRef === input.executionBinding.entryRef &&
      stableJsonEquals(binding, input.executionBinding)
  );
  const executionBinding = bindingMatches[0];
  if (bindingMatches.length !== 1 || executionBinding === undefined) {
    throw new TraversalExecutionFamilyCompileError({
      code: "program_invalid",
      message:
        "execution binding must resolve exactly and byte-equivalent inside the admitted catalog basis",
      diagnosticRefs: Object.freeze([input.executionBinding.entryRef])
    });
  }
  const engineVersion =
    input.admittedTenantConformanceManifest.manifest.engineVersion;
  if (engineVersion.length === 0) {
    throw new TraversalExecutionFamilyCompileError({
      code: "capability_missing",
      message:
        "execution family requires one admitted tenant-manifest engine version"
    });
  }

  const subjectDrafts: {
    readonly graphFunction: GraphFunction;
    readonly drafts: readonly TraversalExecutionFamilyVectorDraft[];
  }[] = [];
  const submittedGraphFunctions: GraphFunction[] = [];
  const structuralHofRelations: CompiledHofFanOutRelation[] = [];
  const pending: GraphFunction[] = [executionBinding.graphFunction];
  const admittedRefs = new Set<string>();
  const reachableChildRefs = new Map<string, `sha256:${string}`>();

  while (pending.length > 0) {
    const executionSubjectGraphFunction = pending.shift();
    if (executionSubjectGraphFunction === undefined) {
      throw new TypeError("execution family queue became inconsistent");
    }
    if (admittedRefs.has(executionSubjectGraphFunction.id)) continue;
    admittedRefs.add(executionSubjectGraphFunction.id);
    submittedGraphFunctions.push(executionSubjectGraphFunction);
    const compilation = compileSubjectDrafts({
      basis: input.catalogBasis,
      executionBinding,
      executionSubjectGraphFunction,
      admittedTenantConformanceManifest:
        input.admittedTenantConformanceManifest
    });
    structuralHofRelations.push(...compilation.structuralHofRelations);
    subjectDrafts.push(Object.freeze({
      graphFunction: executionSubjectGraphFunction,
      drafts: compilation.drafts
    }));

    const childRefs = new Map<string, `sha256:${string}`>(
      compilation.structuralChildRefs
    );
    for (const draft of compilation.drafts) {
      const workflowLifts = compiledCInvokingLociInDeclaredOrder(
        draft.source.completeProgramPlan
      ).filter(
        (row): row is typeof row & {
          readonly node: CompiledCWorkflowLift;
        } => row.node.kind === "compiled_c_workflow_lift"
      ).map((row) => row.node);
      for (const child of workflowLifts) {
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
      addExactChildRef({
        refs: reachableChildRefs,
        ref: childRef,
        digest: childDigest,
        relation: "reachable execution"
      });
      const matches = executionBinding.module.graphFunctions.filter(
        (candidate) =>
          candidate.id === childRef &&
          stableSha256Digest(candidate) === childDigest
      );
      const child = matches[0];
      if (matches.length !== 1 || child === undefined) {
        throw new TraversalExecutionFamilyCompileError({
          code: "program_invalid",
          message:
            `reachable execution child ${JSON.stringify(childRef)} must resolve once at its compiled digest in the selected Module`,
          diagnosticRefs: Object.freeze([childRef, childDigest])
        });
      }
      if (admittedRefs.has(childRef)) continue;
      if (!pending.some((candidate) => candidate.id === child.id)) {
        pending.push(child);
      }
    }
  }

  const allDrafts = Object.freeze(subjectDrafts.flatMap((row) => row.drafts));
  const conformanceInput = Object.freeze({
    subjectRef:
      `abg://traversal-execution-family-conformance/${executionBinding.entryRef}/${stableSha256Digest({
        moduleDigest: executionBinding.moduleDigest,
        graphFunctionRefs: submittedGraphFunctions.map((row) => row.id)
      }).slice("sha256:".length)}`,
    abiPackageVersion: engineVersion,
    scopeKind: "submitted_structure" as const,
    graphFunctions: Object.freeze(submittedGraphFunctions),
    targetCarrierContracts: Object.freeze(
      allDrafts.map((draft) => draft.source.targetCarrierProjection)
    ),
    edgeClosureContracts: Object.freeze(
      allDrafts.map((draft) => draft.source.edgeClosureBinding.conformanceRow)
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
  const conformanceReport = typecheckGtlProgram(conformanceInput, {
    pluginCatalog: input.pluginCatalog
  });
  const conformanceEvidence = Object.freeze({
    kind: "traversal_execution_family_conformance_evidence" as const,
    subjectRef: conformanceReport.subjectRef,
    reportRef: conformanceReport.reportRef,
    inventoryDigest: conformanceReport.inventoryDigest,
    traversalUnitProjectionDigest: stableSha256Digest(
      conformanceReport.traversalUnitProjection
    ),
    passed: true as const,
    issueCount: 0 as const
  });
  const subjects = subjectDrafts.map((subject) => sealSubject({
    kind: "traversal_execution_family_subject",
    graphFunctionRef: subject.graphFunction.id,
    graphFunctionDigest: stableSha256Digest(subject.graphFunction),
    vectors: Object.freeze(subject.drafts.map((draft) => {
      const admission = admitTraversalExecutionAgainstCheckedReport({
        source: draft.source,
        resultAuthorities: draft.loci.map((locus) => locus.resultAuthority),
        bundle: draft.bundle,
        report: conformanceReport
      });
      const structuralAdmission =
        draft.source.sourceKind === "structural_hof_fan_out" &&
        admission.status === "static_contracts_admitted_capability_blocked" &&
        admission.blockingIssueRefs.length === 0;
      if (
        admission.status !== "runtime_addressable_not_closed" &&
        !structuralAdmission
      ) {
        throw new TraversalExecutionFamilyCompileError({
          code: admission.status ===
              "static_contracts_admitted_capability_blocked"
            ? "capability_missing"
            : "program_invalid",
          message:
            `traversal admission blocked at vector ${String(draft.vectorIndex)} (${draft.graphVector.name}): ${admission.status}; ` +
            conformanceReport.issues.map(
              (issue) => `${issue.ruleRef}: ${issue.message}`
            ).join("; "),
          diagnosticRefs: conformanceReport.issues.map((issue) => issue.ruleRef)
        });
      }
      return sealVector({
        kind: "traversal_execution_family_vector",
        vectorIndex: draft.vectorIndex,
        graphVectorRef: draft.graphVector.id,
        graphVectorDigest: stableSha256Digest(draft.graphVector),
        sourceKind: draft.source.sourceKind,
        sourceRef: draft.source.sourceRef,
        sourceDigest: draft.source.sourceDigest,
        currentAuthorityRef: draft.source.currentAuthorityRef,
        currentAuthorityDigest: draft.source.currentAuthorityDigest,
        programPlanRef: draft.source.completeProgramPlan.planRef,
        programPlanDigest: draft.source.completeProgramPlan.planDigest,
        normalizedProgram:
          draft.outcome.status === "published_startup_blocked" &&
            draft.outcome.handoff.normalizedProgram !== null
            ? Object.freeze({
                programRef: draft.outcome.handoff.normalizedProgram.programRef,
                programDigest: stableSha256Digest(
                  draft.outcome.handoff.normalizedProgram
                )
              })
            : null,
        loci: Object.freeze(draft.loci.map((locus) => sealLocus({
          kind: "traversal_execution_family_locus",
          stageOrdinal: locus.stageOrdinal,
          programLocusRef: locus.programLocusRef,
          programLocusDigest: locus.programLocusDigest,
          executionContextRef:
            locus.compiledExecutionContext?.contractRef ?? null,
          executionContextDigest:
            locus.compiledExecutionContext?.contractDigest ?? null,
          resultAuthorityRef: locus.resultAuthority.authorityRef,
          resultAuthorityDigest: locus.resultAuthority.authorityDigest
        }))),
        bundleRef: draft.bundle.bundleRef,
        bundleDigest: draft.bundle.bundleDigest,
        admissionStatus: admission.status,
        admissionRef: admission.admissionRef,
        admissionDigest: admission.admissionDigest,
        reportRef: admission.reportRef,
        runtimeAddressable: admission.runtimeAddressable,
        effectsPermitted: false
      });
    }))
  }));

  const family = sealFamily({
    kind: "compiled_traversal_execution_family",
    catalogBasisRef: input.catalogBasis.basisRef,
    selectedCatalogEntryRef: executionBinding.entryRef,
    executionBindingDigest: stableSha256Digest(executionBinding),
    moduleDigest: stableSha256Digest(executionBinding.module),
    rootGraphFunctionDigest: stableSha256Digest(executionBinding.graphFunction),
    structuralHofRelations: Object.freeze(structuralHofRelations),
    subjects: Object.freeze(subjects),
    conformanceEvidence,
    effectsPermitted: false
  });
  return Object.freeze({
    family,
    subjectDrafts: Object.freeze([...subjectDrafts])
  });
}

/** @internal */
export function compileTraversalExecutionFamily(input: {
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly executionBinding: CatalogExecutionBinding;
  readonly admittedTenantConformanceManifest: AdmittedTenantConformanceManifest;
}): CompiledTraversalExecutionFamily {
  return compileTraversalExecutionFamilyCore(input).family;
}

function projectRuntimeOperator(input: {
  readonly graphVector: GraphVector;
  readonly stage: TraversalContractWorkStage;
}): TraversalExecutionFamilyOperatorProjection {
  const matches = input.graphVector.operators.flatMap((operator, ordinal) =>
    operator.regime === input.stage.regime
      ? [Object.freeze({ operator, ordinal })]
      : []
  );
  const match = matches[0];
  if (matches.length !== 1 || match === undefined) {
    throw new TraversalExecutionFamilyCompileError({
      code: "program_invalid",
      message:
        `runtime locus ${JSON.stringify(input.stage.programLocusRef)} requires exactly one ${input.stage.regime} GraphVector Operator; got ${String(matches.length)}`,
      diagnosticRefs: Object.freeze([input.stage.programLocusRef])
    });
  }
  return Object.freeze({
    kind: "traversal_execution_family_operator_projection",
    graphVectorRef: input.graphVector.id,
    operatorOrdinal: match.ordinal,
    operatorName: match.operator.name,
    regime: match.operator.regime,
    binding: match.operator.binding,
    tags: Object.freeze([...match.operator.tags]),
    operatorDigest: stableSha256Digest(match.operator)
  });
}

function projectRuntimeSchemas(
  subjectDrafts: TraversalExecutionFamilyCompilerCoreResult["subjectDrafts"]
): readonly RuntimeSchemaRequirement[] {
  const requirements = new Map<string, RuntimeSchemaRequirement>();
  for (const subject of subjectDrafts) {
    const graph = materializeGraphFunction(subject.graphFunction);
    const nodes = [
      ...subject.graphFunction.inputs,
      ...subject.graphFunction.outputs,
      ...subject.graphFunction.environment.requires,
      ...subject.graphFunction.environment.provides,
      ...subject.graphFunction.environment.carries,
      ...graph.nodes
    ];
    for (const node of nodes) {
      const requirement = Object.freeze({
        graphFunctionId: subject.graphFunction.id,
        nodeRef: node.id,
        symbolicSchemaRef: node.schema.ref
      });
      const key =
        `${requirement.graphFunctionId}\u0000${requirement.nodeRef}\u0000${requirement.symbolicSchemaRef}`;
      requirements.set(key, requirement);
    }
  }
  return Object.freeze(
    [...requirements.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([, requirement]) => requirement)
  );
}

function projectRuntimeVector(input: {
  readonly compact: TraversalExecutionFamilyVector;
  readonly draft: TraversalExecutionFamilyVectorDraft;
}): TraversalExecutionFamilyRuntimeVectorProjection {
  if (
    input.compact.graphVectorRef !== input.draft.graphVector.id ||
    input.compact.graphVectorDigest !==
      stableSha256Digest(input.draft.graphVector) ||
    input.compact.programPlanRef !==
      input.draft.source.completeProgramPlan.planRef ||
    input.compact.programPlanDigest !==
      input.draft.source.completeProgramPlan.planDigest ||
    input.compact.loci.length !== input.draft.loci.length
  ) {
    throw new TraversalExecutionFamilyCompileError({
      code: "program_invalid",
      message: "runtime projection differs from its compact compiler result",
      diagnosticRefs: Object.freeze([input.compact.graphVectorRef])
    });
  }
  const invokingLoci = compiledCInvokingLociInDeclaredOrder(
    input.draft.source.completeProgramPlan
  );
  const mappedOperatorOrdinals = new Set<number>();
  if (
    input.draft.source.sourceKind === "structural_hof_fan_out" &&
    input.draft.graphVector.operators.length !== 0
  ) {
    throw new TraversalExecutionFamilyCompileError({
      code: "program_invalid",
      message: "structural HOF wrapper must not declare an Operator",
      diagnosticRefs: Object.freeze([input.draft.graphVector.id])
    });
  }
  const loci = input.draft.loci.map((draftLocus, ordinal) => {
    const compact = input.compact.loci[ordinal];
    const stageMatches = input.draft.source.workStages.filter(
      (stage) =>
        stage.ordinal === draftLocus.stageOrdinal &&
        stage.programLocusRef === draftLocus.programLocusRef &&
        stage.programLocusDigest === draftLocus.programLocusDigest
    );
    const stage = stageMatches[0];
    const nodeMatches = invokingLoci.filter(
      (row) =>
        row.node.nodeRef === draftLocus.programLocusRef &&
        row.node.nodeDigest === draftLocus.programLocusDigest
    );
    const node = nodeMatches[0]?.node;
    if (
      compact === undefined ||
      stageMatches.length !== 1 ||
      stage === undefined ||
      nodeMatches.length !== 1 ||
      node === undefined ||
      (node.kind !== "compiled_c_stage_leaf" &&
        node.kind !== "compiled_c_workflow_lift")
    ) {
      throw new TraversalExecutionFamilyCompileError({
        code: "program_invalid",
        message:
          `runtime locus ${JSON.stringify(draftLocus.programLocusRef)} is not exact in the compiled plan`,
        diagnosticRefs: Object.freeze([draftLocus.programLocusRef])
      });
    }
    const operator = input.draft.source.sourceKind === "structural_hof_fan_out"
      ? null
      : projectRuntimeOperator({
          graphVector: input.draft.graphVector,
          stage
        });
    if (operator !== null) mappedOperatorOrdinals.add(operator.operatorOrdinal);
    return Object.freeze({
      compact,
      stage,
      node,
      compiledExecutionContext: draftLocus.compiledExecutionContext,
      resultAuthority: draftLocus.resultAuthority,
      operator
    });
  });
  if (
    input.draft.source.sourceKind !== "structural_hof_fan_out" &&
    mappedOperatorOrdinals.size !== input.draft.graphVector.operators.length
  ) {
    throw new TraversalExecutionFamilyCompileError({
      code: "program_invalid",
      message: "every authored GraphVector Operator must map to a runtime locus",
      diagnosticRefs: Object.freeze([input.draft.graphVector.id])
    });
  }
  return Object.freeze({
    compact: input.compact,
    graphVector: input.draft.graphVector,
    sourceInput: input.draft.sourceInput,
    source: input.draft.source,
    loci: Object.freeze(loci)
  });
}

/** @internal */
export function compileTraversalExecutionFamilyForRuntime(input: {
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly executionBinding: CatalogExecutionBinding;
  readonly admittedTenantConformanceManifest: AdmittedTenantConformanceManifest;
  readonly pluginCatalog?: Readonly<Record<string, StandardCatalogRow>> | undefined;
}): Readonly<{
  readonly family: CompiledTraversalExecutionFamily;
  readonly runtimeProjection: TraversalExecutionFamilyRuntimeProjection;
}> {
  const core = compileTraversalExecutionFamilyCore(input);
  const vectors = core.subjectDrafts.flatMap((subjectDraft, subjectIndex) => {
    const compactSubject = core.family.subjects[subjectIndex];
    if (
      compactSubject === undefined ||
      compactSubject.graphFunctionRef !== subjectDraft.graphFunction.id ||
      compactSubject.graphFunctionDigest !==
        stableSha256Digest(subjectDraft.graphFunction) ||
      compactSubject.vectors.length !== subjectDraft.drafts.length
    ) {
      throw new TraversalExecutionFamilyCompileError({
        code: "program_invalid",
        message: "runtime subject differs from its compact compiler result"
      });
    }
    return subjectDraft.drafts.map((draft, vectorIndex) => {
      const compact = compactSubject.vectors[vectorIndex];
      if (compact === undefined) {
        throw new TraversalExecutionFamilyCompileError({
          code: "program_invalid",
          message: "runtime vector is absent from its compact compiler result"
        });
      }
      return projectRuntimeVector({ compact, draft });
    });
  });
  const requiredSchemas = projectRuntimeSchemas(core.subjectDrafts);
  const projectionDigest = traversalExecutionFamilyRuntimeProjectionDigest({
    family: core.family,
    vectors,
    requiredSchemas
  });
  const runtimeProjection = Object.freeze({
    kind: "traversal_execution_family_runtime_projection" as const,
    compactFamily: core.family,
    vectors: Object.freeze(vectors),
    requiredSchemas,
    projectionDigest,
    effectsPermitted: false as const
  });
  return Object.freeze({ family: core.family, runtimeProjection });
}

/** @internal */
export function assertCompiledTraversalExecutionFamily(
  family: CompiledTraversalExecutionFamily
): void {
  const expected = sealFamily({
    kind: family.kind,
    catalogBasisRef: family.catalogBasisRef,
    selectedCatalogEntryRef: family.selectedCatalogEntryRef,
    executionBindingDigest: family.executionBindingDigest,
    moduleDigest: family.moduleDigest,
    rootGraphFunctionDigest: family.rootGraphFunctionDigest,
    structuralHofRelations: family.structuralHofRelations,
    subjects: Object.freeze(family.subjects.map((subject) => sealSubject({
      kind: subject.kind,
      graphFunctionRef: subject.graphFunctionRef,
      graphFunctionDigest: subject.graphFunctionDigest,
      vectors: Object.freeze(subject.vectors.map((vector) => sealVector({
        kind: vector.kind,
        vectorIndex: vector.vectorIndex,
        graphVectorRef: vector.graphVectorRef,
        graphVectorDigest: vector.graphVectorDigest,
        sourceKind: vector.sourceKind,
        sourceRef: vector.sourceRef,
        sourceDigest: vector.sourceDigest,
        currentAuthorityRef: vector.currentAuthorityRef,
        currentAuthorityDigest: vector.currentAuthorityDigest,
        programPlanRef: vector.programPlanRef,
        programPlanDigest: vector.programPlanDigest,
        normalizedProgram: vector.normalizedProgram,
        loci: Object.freeze(vector.loci.map((locus) => sealLocus({ ...locus }))),
        bundleRef: vector.bundleRef,
        bundleDigest: vector.bundleDigest,
        admissionStatus: vector.admissionStatus,
        admissionRef: vector.admissionRef,
        admissionDigest: vector.admissionDigest,
        reportRef: vector.reportRef,
        runtimeAddressable: vector.runtimeAddressable,
        effectsPermitted: vector.effectsPermitted
      })))
    }))),
    conformanceEvidence: family.conformanceEvidence,
    effectsPermitted: family.effectsPermitted
  });
  if (!stableJsonEquals(family, expected)) {
    throw new TypeError("compiled traversal execution family identity is stale");
  }
}
