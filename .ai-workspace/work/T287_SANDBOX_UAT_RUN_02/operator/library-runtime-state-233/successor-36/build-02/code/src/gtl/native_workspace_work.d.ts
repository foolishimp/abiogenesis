import type { ModulePublication, RootModuleArtifactBasis } from "./contracts.js";
export { NATIVE_WORKSPACE_WORK_IDS } from "../product/native_workspace_work_identity.js";
/** Ordinary callable publication; domain work and evaluation stay in consumers. */
export declare function constructNativeWorkspaceWorkModulePublication(artifact: RootModuleArtifactBasis): Readonly<ModulePublication>;
