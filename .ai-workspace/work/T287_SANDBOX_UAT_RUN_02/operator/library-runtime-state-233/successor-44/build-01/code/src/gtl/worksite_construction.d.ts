export { WORKSITE_CONSTRUCTION_GTL_IDS, constructWorksitePreservedResultRecoveryGraphFunction, worksitePreservedResultSourceOfGraphFunction } from "./worksite_construction_recovery.js";
import type { ModulePublication, RootModuleArtifactBasis } from "./contracts.js";
/** One composite publication containing C1 and the exact reusable C0 parts once. */
export declare function constructWorksiteConstructionModulePublication(artifact: RootModuleArtifactBasis): Readonly<ModulePublication>;
