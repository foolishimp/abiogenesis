import { type JsonValue } from "../shared/canonical_json.js";
import type { CatalogContribution, GraphFunction, GtlProgram, ModulePublication } from "./contracts.js";
export declare const CANONICAL_AUTHORED_GTL_SUBJECT_KIND_VALUES: readonly ["module_publication", "catalog_contribution", "gtl_program", "graph_function"];
export type CanonicalAuthoredGtlSubjectKind = (typeof CANONICAL_AUTHORED_GTL_SUBJECT_KIND_VALUES)[number];
export declare function canonicalizeAuthoredGtlCarrier(value: Readonly<ModulePublication>, subjectKind: "module_publication"): Readonly<ModulePublication>;
export declare function canonicalizeAuthoredGtlCarrier(value: Readonly<CatalogContribution>, subjectKind: "catalog_contribution"): Readonly<CatalogContribution>;
export declare function canonicalizeAuthoredGtlCarrier(value: Readonly<GtlProgram>, subjectKind: "gtl_program"): Readonly<GtlProgram>;
export declare function canonicalizeAuthoredGtlCarrier(value: Readonly<GraphFunction>, subjectKind: "graph_function"): Readonly<GraphFunction>;
export declare function canonicalizeAuthoredGtlCarrier(value: JsonValue, subjectKind: CanonicalAuthoredGtlSubjectKind): JsonValue;
