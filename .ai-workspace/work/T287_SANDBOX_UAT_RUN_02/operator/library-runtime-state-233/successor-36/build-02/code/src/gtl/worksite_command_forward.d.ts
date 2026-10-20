import type { GraphFunction, RootModuleArtifactBasis } from "./contracts.js";
/** Exactly one no-effect preparation and one nested C2; history grants no calls. */
export declare function worksiteCommandForwardGraphFunctions(): readonly GraphFunction[];
export declare function isWorksiteCommandForwardGraphFunction(value: GraphFunction): boolean;
export declare function constructWorksiteCommandForwardModulePublication(artifact: RootModuleArtifactBasis): Readonly<import("./contracts.js").ModulePublication>;
