import { type QualificationResources } from "./qualification_resources.js";
import { type SelfConformanceInput, type SelfConformanceResult, type SelfConformanceOwner, type QualificationRuleCatalog } from "./self_conformance_contracts.js";
export declare const SELF_CONFORMANCE_CATALOG_ASSET_PATH = "contracts/qualification/rule-catalog.json";
export declare const SELF_CONFORMANCE_CATALOG_CONTRACT_ID = "abg.asset.qualification.rule-catalog";
/** Reads only this installed owner's manifest-bound declaration assets. */
export declare function readSelfConformanceCatalog(): {
    catalog: QualificationRuleCatalog;
    bytes: Uint8Array;
};
/** Finite native relation. Citations remain unadmitted; no caller flag can establish J/O truth. */
export declare function evaluateSelfConformance(rawInput: SelfConformanceInput, owner: SelfConformanceOwner, resources?: QualificationResources): Readonly<SelfConformanceResult>;
