// Native type-law proof for GraphVector-local declared C-program selection.

import {
  cInterfaceCarrier,
  type AdmittedCProgramDeclarationNode,
  type CCarrier
} from "../../code/src/gtl/m01/algebra/c_algebra.js";
import {
  cProgramCatalogDeclarationEntry,
  cProgramDeclarationEntry
} from "../../code/src/gtl/m01/algebra/c_algebra_declarations.js";
import type { Node } from "../../code/src/gtl/m01/contracts/carriers.js";
import type {
  GraphFunction,
  GraphVector
} from "../../code/src/gtl/m01/contracts/carriers.js";
import {
  compileGraphVectorCProgramSelection
} from "../../code/src/abg/m03/contracts/graph_vector_c_program_compiler.js";
import {
  graphVectorDeclarations
} from "../../code/src/gtl/m01/contracts/declaration_law.js";
import {
  hogProgramLadderDeclarationEntry,
  hogProgramRefDeclarationEntry,
  pluginSelectionDeclarationEntry
} from "../../code/src/gtl/m01/contracts/execution_declaration_builders.js";

interface LabObservation {
  readonly sample: string;
}

interface NormalizedObservation {
  readonly normalized: string;
}

declare const observationNode: Node;
declare const normalizedNode: Node;
declare const admittedProgram: AdmittedCProgramDeclarationNode;
declare const graphFunction: GraphFunction;
declare const graphVector: GraphVector;

export const arbitrarySelector = hogProgramRefDeclarationEntry(
  "program://scenario-09/not-yet-resolved"
);
export const lawfulVectorDeclarations = graphVectorDeclarations([
  arbitrarySelector
]);

const observationCarrier = cInterfaceCarrier<LabObservation>([
  observationNode
]);
const normalizedCarrier = cInterfaceCarrier<NormalizedObservation>([
  normalizedNode
]);

export const exactObservationCarrier: CCarrier<LabObservation> =
  observationCarrier;

// @ts-expect-error CCarrier is invariant in its host-language value type.
export const wrongCarrierType: CCarrier<NormalizedObservation> =
  observationCarrier;

// @ts-expect-error Distinct invariant carrier types cannot substitute.
export const wrongObservationType: CCarrier<LabObservation> = normalizedCarrier;

graphVectorDeclarations([
  // @ts-expect-error Program definitions remain GraphFunction-only.
  cProgramDeclarationEntry(admittedProgram)
]);

graphVectorDeclarations([
  // @ts-expect-error Program catalog definitions remain GraphFunction-only.
  cProgramCatalogDeclarationEntry([admittedProgram])
]);

graphVectorDeclarations([
  // @ts-expect-error Program ladders remain GraphFunction-only.
  hogProgramLadderDeclarationEntry([
    { programRef: "program://scenario-09/one", fromAttempt: 1 }
  ])
]);

graphVectorDeclarations([
  // @ts-expect-error Plugin selection remains GraphFunction-only.
  pluginSelectionDeclarationEntry({ fpDispatch: "plugin://scenario-09/fp" })
]);

// @ts-expect-error Duplicate selector authority is statically rejected.
graphVectorDeclarations([arbitrarySelector, arbitrarySelector]);

compileGraphVectorCProgramSelection({
  graphFunction,
  graphVector,
  // @ts-expect-error Candidate inventory is derived from the containing function.
  rawCandidates: { catalogDeclarationObserved: true, catalogShapeValid: true, candidates: [] }
});
