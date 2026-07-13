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
const startupBlocked: "startup_blocked_awaiting_t267" =
  fpRequest.startupBlock.status;
const effectsPermitted: false = fpRequest.startupBlock.effectsPermitted;
void fpRegime;
void fpPlanRef;
void fpEnvelopeRef;
void startupBlocked;
void effectsPermitted;

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
  fieldRows: [],
  policyRefs: []
};
void projection;

const redeclaredTruth: ExecutionContextProjectionDeclaration = {
  projectionRef: "projection://t256/type-law/redeclared",
  version: "1.0.0",
  sourceNodeRef: "node://t256/source",
  fieldRows: [],
  policyRefs: [],
  // @ts-expect-error source schema is derived from the selected Node.
  sourceSchemaRef: "schema://t256/source"
};
void redeclaredTruth;

// @ts-expect-error instruction assembly truth is derived inside the join.
joinInput.instructionAssemblyBasis;
