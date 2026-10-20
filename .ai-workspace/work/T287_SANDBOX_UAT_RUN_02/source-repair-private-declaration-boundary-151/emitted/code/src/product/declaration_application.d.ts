import * as v from "valibot";
import { type JsonValue } from "../shared/canonical_json.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import { type DurablePrefixCoordinate } from "../abg/event_store.js";
import { type DeclarationApplication, type DeclarationCatalogEntry, type GraphFunctionCatalogView, type ReadyGraphFunctionCatalog } from "./catalog.js";
export declare const CATALOG_APPLICATION_CONSTRUCTION_SCHEMA: v.StrictObjectSchema<{
    readonly prefix: v.CustomSchema<DurablePrefixCoordinate, v.ErrorMessage<v.CustomIssue> | undefined>;
    readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly targetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly value: v.GenericSchema<JsonValue, JsonValue>;
    readonly schemaAssets: v.ArraySchema<v.StrictObjectSchema<{
        readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly contractId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly bytesBase64: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>, undefined>;
}, undefined>;
export interface CatalogApplicationConstruction {
    prefix: DurablePrefixCoordinate;
    programRef: string;
    targetRef: string;
    value: JsonValue;
    schemaAssets: {
        productId: string;
        contractId: string;
        bytesBase64: string;
    }[];
}
export interface CatalogApplicationConstructionInput {
    readonly catalog: ReadyGraphFunctionCatalog;
    readonly catalogView: GraphFunctionCatalogView;
    readonly catalogRow: DeclarationCatalogEntry;
    readonly construction: CatalogApplicationConstruction;
}
export interface CatalogApplicationResources extends CatalogApplicationConstructionInput {
    readonly kind: "catalog_application_resource_assertion";
    readonly schemaVersion: "5.0.0";
    readonly applicationBasis: ReferenceDigest<"CatalogApplicationBasis">;
    readonly validationReceipt: ReferenceDigest<"ProductValidationReceipt">;
    readonly contributor: ReferenceDigest<"ProductContributorProvenance">;
}
export type CatalogApplicationRefusalCode = "kind_mismatch" | "view_mismatch" | "unready" | "target_mismatch" | "application_mismatch" | "callability_mismatch" | "invalid_validation_receipt" | "invalid_contributor";
export declare class CatalogApplicationConstructionError extends TypeError {
    readonly code: CatalogApplicationRefusalCode;
    constructor(code: CatalogApplicationRefusalCode, message: string);
}
/** Pure reconstruction over immutable installed assets and an explicit durable prefix. */
export declare function constructCatalogApplicationResources(input: CatalogApplicationConstructionInput): Readonly<{
    resources: CatalogApplicationResources;
    application: DeclarationApplication;
}>;
export declare function reconstructCatalogApplication(resources: CatalogApplicationResources, currentPrefix?: DurablePrefixCoordinate): DeclarationApplication;
