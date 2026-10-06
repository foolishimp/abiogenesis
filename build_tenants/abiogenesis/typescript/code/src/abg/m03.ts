/** Current admission, events, traversal, replay and continuation owners. */
export * from "./index.js";
export { admitGtlProgramConformanceInput, typecheckGtlProgram, GTL_PROGRAM_CONFORMANCE_INPUT_API,
  type GtlProgramConformanceInput, type ConformanceEvaluatePacket, type ConformanceDeclarationBasis } from "../validator/conformance_operation.js";
export { GTL_PROGRAM_DIAGNOSTIC_REGISTER, GTL_PROGRAM_DIAGNOSTIC_ID_VALUES, constructGtlProgramDiagnosticId,
  type GtlProgramDiagnosticId } from "../validator/validation.js";
