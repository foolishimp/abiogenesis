import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import { type WorksiteBranchConstructionOutputVector, type WorksiteBranchConstructionTask } from "../product/worksite_branch_construction.js";
import type { LeafRealizationCandidate } from "./contracts.js";
export declare const WORKSITE_BRANCH_CONSTRUCTION_PLAN_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare const WORKSITE_BRANCH_CONSTRUCTION_REDUCER_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
/** Product-authored DAG/readiness admission projected as one exact branch vector. */
export declare function realizeWorksiteBranchConstructionPlan(input: Readonly<WorksiteBranchConstructionTask>): Readonly<LeafRealizationCandidate>;
/** Row-major flattening over only a complete admitted C3 fan-out result. */
export declare function realizeWorksiteBranchConstructionReduction(input: Readonly<WorksiteBranchConstructionOutputVector>): Readonly<LeafRealizationCandidate>;
