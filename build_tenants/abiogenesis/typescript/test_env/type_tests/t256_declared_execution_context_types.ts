// Native type-law proof for the T-256 declared execution-context boundary.

import type {
  DeclaredFhInteractionRequest,
  DeclaredFpExecutionRequest,
  ExecutionContextProjectionDeclaration,
  JoinDeclaredExecutionContextInput
} from "../../code/src/abg/m03/contracts/declared_execution_context.js";

declare const fpRequest: DeclaredFpExecutionRequest;
declare const fhRequest: DeclaredFhInteractionRequest;
declare const joinInput: JoinDeclaredExecutionContextInput;

const fpRegime: "F_P" = fpRequest.regime;
const fpPlanRef: string = fpRequest.planRef;
const fpEnvelopeRef: string = fpRequest.envelopeRef;
const fpResultContractRef: string = fpRequest.resultContractRef;
const startupBlocked: "startup_blocked_awaiting_t267" =
  fpRequest.startupBlock.status;
const effectsPermitted: false = fpRequest.startupBlock.effectsPermitted;
void fpRegime;
void fpPlanRef;
void fpEnvelopeRef;
void fpResultContractRef;
void startupBlocked;
void effectsPermitted;

const selectedCatalogEntryRef: string = joinInput.selectedCatalogEntryRef;
void selectedCatalogEntryRef;

const fhRegime: "F_H" = fhRequest.regime;
const interactionSubjectRef: string = fhRequest.interactionSubjectRef;
void fhRegime;
void interactionSubjectRef;

// @ts-expect-error F_P requests project canonical carrier identity, not protocol content.
fpRequest.instructionProtocol;
// @ts-expect-error F_H interaction requests are not parallel prompt-plan requests.
fhRequest.planRef;

const projection: ExecutionContextProjectionDeclaration = {
  projectionRef: "projection://t256/type-law",
  version: "1.0.0",
  sourceNodeRef: "node://t256/source",
  source: { kind: "admitted_source_carrier" },
  fieldRows: [],
  policyRefs: []
};
void projection;

const redeclaredTruth: ExecutionContextProjectionDeclaration = {
  projectionRef: "projection://t256/type-law/redeclared",
  version: "1.0.0",
  sourceNodeRef: "node://t256/source",
  source: { kind: "admitted_source_carrier" },
  fieldRows: [],
  policyRefs: [],
  // @ts-expect-error source schema is derived from the selected Node.
  sourceSchemaRef: "schema://t256/source"
};
void redeclaredTruth;

// @ts-expect-error instruction assembly truth is derived inside the join.
joinInput.instructionAssemblyBasis;
// @ts-expect-error runtime authority is supplied only by the package-private ABG adapter.
joinInput.runtimeAuthority;
// @ts-expect-error flattened runtime-authority facts are not a public input.
joinInput.derivedRuntimeAuthorityFacts;
