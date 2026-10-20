import type { GtlProgram } from "../gtl/contracts.js";
import { type ProgramValidationInput, type RawAdmissionRefusal, type StaticValidationRefusal } from "../validator/index.js";
import { type CatalogReadinessBasis, type DeclarationApplicationInput, type DeclarationApplicationResult, type GraphFunctionCatalog, type GraphFunctionCatalogView, type GraphFunctionCatalogViewResult, type ReadyGraphFunctionCatalog, type ReadyGraphFunctionCatalogResult } from "./catalog.js";
import { type ResolvedProgramDeclarationClosure } from "./declaration_closure.js";
export interface CatalogAdmitPacket {
    readonly kind: "catalog_admit_packet";
    readonly schemaVersion: "5.0.0";
    readonly memberKey: "admit";
    readonly readinessBasis: CatalogReadinessBasis;
}
export interface CatalogViewPacket {
    readonly kind: "catalog_view_packet";
    readonly schemaVersion: "5.0.0";
    readonly memberKey: "allowlist";
    readonly catalog: GraphFunctionCatalog;
    readonly allowlist: readonly string[];
}
export interface CatalogApplyPacket {
    readonly kind: "catalog_apply_packet";
    readonly schemaVersion: "5.0.0";
    readonly memberKey: "node_type" | "overlay";
    readonly catalogView: GraphFunctionCatalogView;
    readonly application: DeclarationApplicationInput;
}
export interface CatalogValidationRefusal {
    readonly kind: "catalog_validation_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly validation: RawAdmissionRefusal | StaticValidationRefusal;
}
export type CatalogAdmissionOperationResult = ReadyGraphFunctionCatalogResult | CatalogValidationRefusal;
export declare function constructCatalogProgramValidationInput(catalog: ReadyGraphFunctionCatalog, catalogView: GraphFunctionCatalogView, declarationClosure: ResolvedProgramDeclarationClosure, program: Readonly<GtlProgram>): ProgramValidationInput | RawAdmissionRefusal;
/** Internal continuation of the Product closure owner. Raw callers use the
 * catalog wrapper above; this consumes its actual resolved value and retains
 * declaration admission and subsequent Program validation. */
export declare function constructProgramValidationInputFromResolvedClosure(declarationClosure: ResolvedProgramDeclarationClosure, program: Readonly<GtlProgram>): ProgramValidationInput | RawAdmissionRefusal;
export declare function constructReadyCatalog(packet: CatalogAdmitPacket): CatalogAdmissionOperationResult;
export declare function constructCatalogView(packet: CatalogViewPacket): GraphFunctionCatalogViewResult;
export declare function constructCatalogApplication(packet: CatalogApplyPacket): DeclarationApplicationResult;
export declare const CatalogOperationPort: Readonly<{
    admit: typeof constructReadyCatalog;
    constructView: typeof constructCatalogView;
    apply: typeof constructCatalogApplication;
}>;
export declare const CATALOG_OPERATION_CONTRACTS: Readonly<{
    admit: typeof constructReadyCatalog;
    view: Readonly<{
        allowlist: typeof constructCatalogView;
    }>;
    apply: Readonly<{
        node_type: typeof constructCatalogApplication;
        overlay: typeof constructCatalogApplication;
    }>;
}>;
