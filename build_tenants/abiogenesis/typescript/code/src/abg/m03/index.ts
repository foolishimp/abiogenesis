export * from "./contracts/index.js";
export * from "./admission/index.js";
export * from "./events/index.js";
export * from "./runner/index.js";
export * from "./transport/index.js";

export { resolveHogProgram, hogStageByRole, assertHogProgramExecutable } from "./runner/hog_program_resolution.js";
export type { ResolvedHogProgram } from "./runner/hog_program_resolution.js";

export {
  C_CALL_HANDLER_CLASS_VALUES,
  admitHandlerRegistry,
  resolveHandlerForSelection,
  executeHandler
} from "./runner/c_call_handlers.js";
export type {
  CCallHandler,
  CCallHandlerBinding,
  CCallHandlerClass,
  CCallHandlerInput,
  CCallHandlerInterior,
  CCallHandlerRegistry
} from "./runner/c_call_handlers.js";

export {
  standardProcessExecutionHandler,
  standardMaterializationHandler,
  standardFhGateHandler,
  standardFpTransportHandler,
  STANDARD_HANDLER_REFS
} from "./runner/standard_handlers.js";
export type {
  ProcessExecutionIo,
  ProcessExecutionConfig,
  MaterializationIo,
  MaterializationConfig,
  FpTransportIo,
  FpTransportConfig
} from "./runner/standard_handlers.js";

export { buildStandardHandlerImplementations } from "./runner/standard_handler_runtime.js";
export {
  LIVE_FP_DISPATCH_PLUGIN_REF,
  standardLiveFpDispatchPlugin
} from "./runner/standard_live_plugins.js";
export type { LiveFpDispatchCapability } from "./runner/standard_live_plugins.js";
export { assembleHandlerRegistry } from "./runner/c_call_handlers.js";
export {
  HOG_HANDLER_BINDINGS_DECLARATION_KEY,
  HOG_HANDLER_CONFIGS_DECLARATION_KEY,
  hogHandlerBindingsFromDeclarationAttrs,
  hogHandlerConfigsFromDeclarationAttrs
} from "./contracts/hog_program_syntax.js";
