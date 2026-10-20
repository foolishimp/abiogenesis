import type { QualificationResources } from "./qualification_resources.js";
import type { SelfConformanceOwner } from "./self_conformance_contracts.js";
export type { QualificationNativeBasis as QualificationOwnerBasis } from "./qualification_contracts.js";
import type { QualificationNativeBasis as QualificationOwnerBasis } from "./qualification_contracts.js";
/** Rehydrates actual native owner truth. A consistent caller data tuple is insufficient. */
export declare function resolveSelfConformanceOwner(basis: QualificationOwnerBasis, input: unknown, requireCurrent?: boolean, resources?: QualificationResources): SelfConformanceOwner | null;
