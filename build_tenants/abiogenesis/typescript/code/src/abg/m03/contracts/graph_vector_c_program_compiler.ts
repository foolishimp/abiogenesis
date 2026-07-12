// Implements: REQ-L-GTL3-C-ALGEBRA-011/-014/-016.
// Compiles the declared (GraphFunction, GraphVector) -> C program relation.
// Runtime consumption of the derived binding is intentionally outside T-254.

import {
  cInterfaceContractRef,
  C_ALGEBRA_SYNTAX_VERSION,
  admitCProgramSyntax,
  type CAlgebraDiagnostic
} from "../../../gtl/m01/algebra/c_algebra.js";
import {
  interfaceContract,
  materializeGraphFunction,
  nodeContractKey,
  type GraphFunction,
  type GraphVector,
  type SerializedAttrs
} from "../../../gtl/m01/contracts/carriers.js";
import { serializedJsonValueToPlain } from "../../../gtl/m01/contracts/constructors.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import {
  HOG_PROGRAM_CATALOG_DECLARATION_KEY,
  HOG_PROGRAM_DECLARATION_KEY,
  HOG_PROGRAM_SELECTION_KEY
} from "./hog_program_syntax.js";

export const GRAPH_VECTOR_C_PROGRAM_DIAGNOSTIC_ID_VALUES = Object.freeze([
  "gtl-c-vector-program-empty-ref",
  "gtl-c-vector-program-containment-mismatch",
  "gtl-c-vector-program-missing-catalog",
  "gtl-c-vector-program-unresolved-ref",
  "gtl-c-vector-program-interface-missing",
  "gtl-c-vector-program-carrier-mismatch",
  "gtl-c-unrealized-vector-program-selection"
] as const);

export type GraphVectorCProgramDiagnosticId =
  (typeof GRAPH_VECTOR_C_PROGRAM_DIAGNOSTIC_ID_VALUES)[number];

export type GraphVectorCProgramAxiomRef =
  | "GV-C-01"
  | "GV-C-02"
  | "GV-C-03"
  | "GV-C-04"
  | "GV-C-08";

export type GraphVectorCProgramRepairAffordance =
  | "add_missing_declaration"
  | "correct_reference"
  | "correct_field_shape"
  | "realize_declared_semantics";

export interface RawCProgramCandidate {
  readonly declarationKey:
    | typeof HOG_PROGRAM_DECLARATION_KEY
    | typeof HOG_PROGRAM_CATALOG_DECLARATION_KEY;
  readonly catalogIndex: number | null;
  readonly candidate: unknown;
}

export interface RawCProgramCandidateCollection {
  readonly catalogDeclarationObserved: boolean;
  readonly catalogShapeValid: boolean;
  readonly candidates: readonly RawCProgramCandidate[];
}

export interface GraphVectorBoundaryProjection {
  readonly hostGraphFunctionRef: string;
  readonly graphRef: string;
  readonly graphVectorRef: string;
  readonly orderedSourceNodeContractKeys: readonly string[];
  readonly targetNodeContractKey: string;
  readonly inputInterfaceCarrierRef: string;
  readonly outputInterfaceCarrierRef: string;
}

export interface CompiledGraphVectorCProgramBinding {
  readonly kind: "compiled_graph_vector_c_program_binding";
  readonly hostGraphFunctionRef: string;
  readonly graphRef: string;
  readonly graphVectorRef: string;
  readonly selectedProgramRef: string;
  readonly orderedSourceNodeContractKeys: readonly string[];
  readonly targetNodeContractKey: string;
  readonly programInputCarrierRef: string;
  readonly programOutputCarrierRef: string;
  readonly selectionSource: "graph_vector";
  readonly bindingDigest: `sha256:${string}`;
}

export interface GraphVectorCProgramDiagnostic {
  readonly kind: "graph_vector_c_program_diagnostic";
  readonly classification: "invalid_program" | "semantic_not_realized";
  readonly diagnosticId: GraphVectorCProgramDiagnosticId;
  readonly axiomRef: GraphVectorCProgramAxiomRef;
  readonly path: string;
  readonly expectedRelation: string;
  readonly actualRelation: string;
  readonly evidenceRefs: readonly string[];
  readonly repairAffordance: GraphVectorCProgramRepairAffordance;
}

export interface GraphVectorCProgramCompilation {
  readonly observed: boolean;
  readonly accepted: boolean;
  readonly delegatedCatalogInvalidity: boolean;
  readonly boundary: GraphVectorBoundaryProjection | null;
  readonly binding: CompiledGraphVectorCProgramBinding | null;
  readonly selectedCandidates: readonly RawCProgramCandidate[];
  readonly selectedProgramDiagnostics: readonly CAlgebraDiagnostic[];
  readonly diagnostics: readonly GraphVectorCProgramDiagnostic[];
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function described(value: unknown): string {
  try {
    const encoded = JSON.stringify(value);
    return encoded === undefined ? String(value) : encoded;
  } catch {
    return Object.prototype.toString.call(value);
  }
}

export function rawCProgramCandidateIdentity(
  candidate: RawCProgramCandidate
): string {
  return `${candidate.declarationKey}:${
    candidate.catalogIndex === null ? "single" : String(candidate.catalogIndex)
  }`;
}

export function rawCProgramCandidatePath(
  candidate: RawCProgramCandidate
): string {
  const root = `$.declarations[${JSON.stringify(candidate.declarationKey)}]`;
  return candidate.catalogIndex === null
    ? root
    : `${root}[${String(candidate.catalogIndex)}]`;
}

export function collectRawCProgramCandidates(
  attrs: SerializedAttrs
): RawCProgramCandidateCollection {
  const candidates: RawCProgramCandidate[] = [];
  const catalogEntries = attrs.entries.filter(
    (entry) => entry.key === HOG_PROGRAM_CATALOG_DECLARATION_KEY
  );
  let catalogShapeValid = catalogEntries.length <= 1;

  for (const entry of attrs.entries) {
    if (
      entry.key !== HOG_PROGRAM_DECLARATION_KEY &&
      entry.key !== HOG_PROGRAM_CATALOG_DECLARATION_KEY
    ) {
      continue;
    }
    if (entry.value.kind !== "json_blob") {
      if (entry.key === HOG_PROGRAM_CATALOG_DECLARATION_KEY) {
        catalogShapeValid = false;
      }
      continue;
    }
    let plain: unknown;
    try {
      plain = serializedJsonValueToPlain(entry.value.value);
    } catch {
      if (entry.key === HOG_PROGRAM_CATALOG_DECLARATION_KEY) {
        catalogShapeValid = false;
      }
      continue;
    }
    if (entry.key === HOG_PROGRAM_CATALOG_DECLARATION_KEY) {
      if (!isUnknownArray(plain)) {
        catalogShapeValid = false;
        continue;
      }
      plain.forEach((candidate, catalogIndex) => {
        candidates.push(
          Object.freeze({
            declarationKey: HOG_PROGRAM_CATALOG_DECLARATION_KEY,
            catalogIndex,
            candidate
          })
        );
      });
      continue;
    }
    candidates.push(
      Object.freeze({
        declarationKey: HOG_PROGRAM_DECLARATION_KEY,
        catalogIndex: null,
        candidate: plain
      })
    );
  }

  return Object.freeze({
    catalogDeclarationObserved: catalogEntries.length > 0,
    catalogShapeValid,
    candidates: Object.freeze(candidates)
  });
}

function repairAffordance(
  diagnosticId: GraphVectorCProgramDiagnosticId
): GraphVectorCProgramRepairAffordance {
  switch (diagnosticId) {
    case "gtl-c-vector-program-missing-catalog":
      return "add_missing_declaration";
    case "gtl-c-unrealized-vector-program-selection":
      return "realize_declared_semantics";
    case "gtl-c-vector-program-empty-ref":
    case "gtl-c-vector-program-containment-mismatch":
    case "gtl-c-vector-program-unresolved-ref":
    case "gtl-c-vector-program-interface-missing":
    case "gtl-c-vector-program-carrier-mismatch":
      return "correct_reference";
  }
}

function diagnosticAxiomRef(
  diagnosticId: GraphVectorCProgramDiagnosticId
): GraphVectorCProgramAxiomRef {
  switch (diagnosticId) {
    case "gtl-c-vector-program-empty-ref":
      return "GV-C-01";
    case "gtl-c-vector-program-missing-catalog":
    case "gtl-c-vector-program-unresolved-ref":
      return "GV-C-02";
    case "gtl-c-vector-program-containment-mismatch":
      return "GV-C-03";
    case "gtl-c-vector-program-interface-missing":
    case "gtl-c-vector-program-carrier-mismatch":
      return "GV-C-04";
    case "gtl-c-unrealized-vector-program-selection":
      return "GV-C-08";
  }
}

function diagnostic(input: {
  readonly classification?: "invalid_program" | "semantic_not_realized";
  readonly diagnosticId: GraphVectorCProgramDiagnosticId;
  readonly path: string;
  readonly expectedRelation: string;
  readonly actualRelation: string;
  readonly evidenceRefs: readonly string[];
}): GraphVectorCProgramDiagnostic {
  return Object.freeze({
    kind: "graph_vector_c_program_diagnostic" as const,
    classification: input.classification ?? "invalid_program",
    diagnosticId: input.diagnosticId,
    axiomRef: diagnosticAxiomRef(input.diagnosticId),
    path: input.path,
    expectedRelation: input.expectedRelation,
    actualRelation: input.actualRelation,
    evidenceRefs: Object.freeze([...input.evidenceRefs]),
    repairAffordance: repairAffordance(input.diagnosticId)
  });
}

function result(input: {
  readonly observed: boolean;
  readonly accepted: boolean;
  readonly delegatedCatalogInvalidity?: boolean;
  readonly boundary?: GraphVectorBoundaryProjection | null;
  readonly binding?: CompiledGraphVectorCProgramBinding | null;
  readonly selectedCandidates?: readonly RawCProgramCandidate[];
  readonly selectedProgramDiagnostics?: readonly CAlgebraDiagnostic[];
  readonly diagnostics?: readonly GraphVectorCProgramDiagnostic[];
}): GraphVectorCProgramCompilation {
  return Object.freeze({
    observed: input.observed,
    accepted: input.accepted,
    delegatedCatalogInvalidity: input.delegatedCatalogInvalidity ?? false,
    boundary: input.boundary ?? null,
    binding: input.binding ?? null,
    selectedCandidates: Object.freeze([...(input.selectedCandidates ?? [])]),
    selectedProgramDiagnostics: Object.freeze([
      ...(input.selectedProgramDiagnostics ?? [])
    ]),
    diagnostics: Object.freeze([...(input.diagnostics ?? [])])
  });
}

function relationEvidence(input: {
  readonly graphFunction: GraphFunction;
  readonly graphVector: GraphVector;
}): readonly string[] {
  return Object.freeze([
    `graph-function:${input.graphFunction.id}`,
    `graph-vector:${input.graphVector.id}`,
    "requirement:REQ-L-GTL3-C-ALGEBRA-011",
    "requirement:REQ-R-ABG3-CCALL-016"
  ]);
}

function candidateProgramRef(candidate: RawCProgramCandidate): string | null {
  if (!isRecord(candidate.candidate)) {
    return null;
  }
  const value = candidate.candidate["programRef"];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function vectorSelectorEntries(graphVector: GraphVector): readonly {
  readonly key: string;
  readonly value: unknown;
}[] {
  return Object.freeze(
    graphVector.declarations.entries
      .filter((entry) => entry.key === HOG_PROGRAM_SELECTION_KEY)
      .map((entry) => Object.freeze({ key: entry.key, value: entry.value }))
  );
}

export function compileGraphVectorCProgramSelection(input: {
  readonly graphFunction: GraphFunction;
  readonly graphVector: GraphVector;
}): GraphVectorCProgramCompilation {
  const requestedSelectorEntries = vectorSelectorEntries(input.graphVector);
  let graph;
  try {
    graph = materializeGraphFunction(input.graphFunction);
  } catch (error: unknown) {
    if (requestedSelectorEntries.length === 0) {
      return result({ observed: false, accepted: true });
    }
    return result({
      observed: true,
      accepted: false,
      diagnostics: [
        diagnostic({
          diagnosticId: "gtl-c-vector-program-containment-mismatch",
          path: "$.template",
          expectedRelation: "one materialized containing GraphFunction",
          actualRelation:
            error instanceof Error ? error.message : "materialization failed",
          evidenceRefs: relationEvidence(input)
        })
      ]
    });
  }

  const contained = graph.vectors.filter(
    (candidate) => candidate.id === input.graphVector.id
  );
  if (contained.length === 0 && requestedSelectorEntries.length === 0) {
    return result({ observed: false, accepted: true });
  }
  if (contained.length !== 1) {
    return result({
      observed: true,
      accepted: false,
      diagnostics: [
        diagnostic({
          diagnosticId: "gtl-c-vector-program-containment-mismatch",
          path: "$.template.graph.vectors",
          expectedRelation:
            "exactly one vector identity in the containing materialized graph",
          actualRelation: `${String(contained.length)} matches for ${JSON.stringify(
            input.graphVector.id
          )}`,
          evidenceRefs: relationEvidence(input)
        })
      ]
    });
  }
  const graphVector = contained[0]!;
  const selectorEntries = vectorSelectorEntries(graphVector);
  if (selectorEntries.length === 0) {
    return result({ observed: false, accepted: true });
  }
  const evidenceRefs = relationEvidence({
    graphFunction: input.graphFunction,
    graphVector
  });
  const selectorPath = `$.template.graph.vectors[${String(
    graph.vectors.indexOf(graphVector)
  )}].declarations[${JSON.stringify(HOG_PROGRAM_SELECTION_KEY)}]`;
  if (selectorEntries.length !== 1) {
    return result({
      observed: true,
      accepted: false,
      diagnostics: [
        diagnostic({
          diagnosticId: "gtl-c-vector-program-unresolved-ref",
          path: selectorPath,
          expectedRelation: "one local fixed selector",
          actualRelation: `${String(selectorEntries.length)} selector entries`,
          evidenceRefs
        })
      ]
    });
  }
  const selectorValue = selectorEntries[0]?.value;
  const selectedProgramRef =
    isRecord(selectorValue) &&
    selectorValue["kind"] === "scalar" &&
    typeof selectorValue["value"] === "string" &&
    selectorValue["value"].length > 0
      ? selectorValue["value"]
      : null;
  if (selectedProgramRef === null) {
    return result({
      observed: true,
      accepted: false,
      diagnostics: [
        diagnostic({
          diagnosticId: "gtl-c-vector-program-empty-ref",
          path: selectorPath,
          expectedRelation: "one non-empty program ref",
          actualRelation: described(selectorValue),
          evidenceRefs
        })
      ]
    });
  }

  const rawCandidates = collectRawCProgramCandidates(
    input.graphFunction.declarations
  );
  if (!rawCandidates.catalogDeclarationObserved) {
    return result({
      observed: true,
      accepted: false,
      diagnostics: [
        diagnostic({
          diagnosticId: "gtl-c-vector-program-missing-catalog",
          path: "$.declarations",
          expectedRelation: `one ${HOG_PROGRAM_CATALOG_DECLARATION_KEY}`,
          actualRelation: "no catalog declaration",
          evidenceRefs
        })
      ]
    });
  }
  if (!rawCandidates.catalogShapeValid) {
    return result({
      observed: true,
      accepted: false,
      delegatedCatalogInvalidity: true
    });
  }

  const matches = rawCandidates.candidates.filter(
    (candidate) =>
      candidate.declarationKey === HOG_PROGRAM_CATALOG_DECLARATION_KEY &&
      candidateProgramRef(candidate) === selectedProgramRef
  );
  if (matches.length !== 1) {
    return result({
      observed: true,
      accepted: false,
      selectedCandidates: matches,
      diagnostics: [
        diagnostic({
          diagnosticId: "gtl-c-vector-program-unresolved-ref",
          path: selectorPath,
          expectedRelation: "exactly one raw containing-catalog member",
          actualRelation: `${String(matches.length)} matches for ${JSON.stringify(
            selectedProgramRef
          )}`,
          evidenceRefs
        })
      ]
    });
  }
  const selectedCandidate = matches[0]!;
  const selectedPath = rawCProgramCandidatePath(selectedCandidate);
  if (
    isRecord(selectedCandidate.candidate) &&
    selectedCandidate.candidate["syntaxVersion"] === "hog-syntax/1"
  ) {
    return result({
      observed: true,
      accepted: false,
      selectedCandidates: matches,
      diagnostics: [
        diagnostic({
          diagnosticId: "gtl-c-vector-program-interface-missing",
          path: selectedPath,
          expectedRelation: "one admitted gtl-c-algebra/1 carrier interface",
          actualRelation: "selected member uses legacy hog-syntax/1",
          evidenceRefs
        })
      ]
    });
  }

  const admission = admitCProgramSyntax(selectedCandidate.candidate);
  if (!admission.accepted || admission.program === null) {
    return result({
      observed: true,
      accepted: false,
      selectedCandidates: matches,
      selectedProgramDiagnostics: admission.diagnostics
    });
  }
  if (admission.program.syntaxVersion !== C_ALGEBRA_SYNTAX_VERSION) {
    return result({
      observed: true,
      accepted: false,
      selectedCandidates: matches,
      diagnostics: [
        diagnostic({
          diagnosticId: "gtl-c-vector-program-interface-missing",
          path: selectedPath,
          expectedRelation: "one admitted gtl-c-algebra/1 carrier interface",
          actualRelation: described(admission.program.syntaxVersion),
          evidenceRefs
        })
      ]
    });
  }

  const boundary: GraphVectorBoundaryProjection = Object.freeze({
    hostGraphFunctionRef: input.graphFunction.id,
    graphRef: graph.id,
    graphVectorRef: graphVector.id,
    orderedSourceNodeContractKeys: interfaceContract(graphVector.source),
    targetNodeContractKey: nodeContractKey(graphVector.target),
    inputInterfaceCarrierRef: cInterfaceContractRef(graphVector.source),
    outputInterfaceCarrierRef: cInterfaceContractRef([graphVector.target])
  });
  if (
    admission.program.term.inputCarrierRef !== boundary.inputInterfaceCarrierRef ||
    admission.program.term.outputCarrierRef !== boundary.outputInterfaceCarrierRef
  ) {
    return result({
      observed: true,
      accepted: false,
      boundary,
      selectedCandidates: matches,
      diagnostics: [
        diagnostic({
          diagnosticId: "gtl-c-vector-program-carrier-mismatch",
          path: selectedPath,
          expectedRelation: described({
            inputCarrierRef: boundary.inputInterfaceCarrierRef,
            outputCarrierRef: boundary.outputInterfaceCarrierRef
          }),
          actualRelation: described({
            inputCarrierRef: admission.program.term.inputCarrierRef,
            outputCarrierRef: admission.program.term.outputCarrierRef
          }),
          evidenceRefs
        })
      ]
    });
  }

  const bindingWithoutDigest = Object.freeze({
    kind: "compiled_graph_vector_c_program_binding" as const,
    hostGraphFunctionRef: boundary.hostGraphFunctionRef,
    graphRef: boundary.graphRef,
    graphVectorRef: boundary.graphVectorRef,
    selectedProgramRef,
    orderedSourceNodeContractKeys: boundary.orderedSourceNodeContractKeys,
    targetNodeContractKey: boundary.targetNodeContractKey,
    programInputCarrierRef: admission.program.term.inputCarrierRef,
    programOutputCarrierRef: admission.program.term.outputCarrierRef,
    selectionSource: "graph_vector" as const
  });
  const binding: CompiledGraphVectorCProgramBinding = Object.freeze({
    ...bindingWithoutDigest,
    bindingDigest: stableSha256Digest(bindingWithoutDigest)
  });
  return result({
    observed: true,
    accepted: false,
    boundary,
    binding,
    selectedCandidates: matches,
    diagnostics: [
      diagnostic({
        classification: "semantic_not_realized",
        diagnosticId: "gtl-c-unrealized-vector-program-selection",
        path: selectorPath,
        expectedRelation: "vector-indexed compiled runtime program selection",
        actualRelation:
          "exact vector/program binding is admitted but the runtime plan remains GraphFunction-wide",
        evidenceRefs: Object.freeze([
          ...evidenceRefs,
          `compiled-graph-vector-c-program-binding:${binding.bindingDigest}`
        ])
      })
    ]
  });
}
