import * as v from "valibot";
import { jsonValueSchema, nonblankSchema, refDigestSchema } from "../shared/public_function_contracts.js";
/** This is an output carrier, not an admission or an independent result ledger. */
export const ABG_TYPED_TERMINAL_RESULT_SCHEMA = v.strictObject({
    kind: v.literal("abg_typed_terminal_result"),
    schemaVersion: v.literal("5.0.0"),
    result: refDigestSchema,
    contract: refDigestSchema,
    valueKind: nonblankSchema,
    valueDigest: refDigestSchema.entries.digest,
    value: jsonValueSchema,
    producer: v.strictObject({
        runRef: nonblankSchema,
        graphCallRef: nonblankSchema,
        invocationAdmissionRef: nonblankSchema,
        program: refDigestSchema,
        graphFunction: refDigestSchema,
        executionBasis: refDigestSchema,
        cCallRef: nonblankSchema,
        resultAdmissionEventRef: nonblankSchema,
        judgmentRef: nonblankSchema,
        judgmentAdmissionEventRef: nonblankSchema,
        terminalRoute: refDigestSchema,
    }),
    projectionBasis: refDigestSchema,
});
export function isAbgTypedTerminalResult(value) {
    return v.safeParse(ABG_TYPED_TERMINAL_RESULT_SCHEMA, value).success;
}
export const ABG_HISTORICAL_DECLARATION_PROOF_SCHEMA = v.strictObject({
    kind: v.literal("abg_historical_declaration_proof"),
    schemaVersion: v.literal("5.0.0"),
    catalog: jsonValueSchema,
    catalogView: jsonValueSchema,
});
export function isAbgHistoricalDeclarationProof(value) {
    return v.safeParse(ABG_HISTORICAL_DECLARATION_PROOF_SCHEMA, value).success;
}
/** Selection of immutable declaration evidence, never proof of its admission. */
export const ABG_HISTORICAL_DECLARATION_REFERENCE_SCHEMA = v.strictObject({
    kind: v.literal("abg_historical_declaration_reference"),
    schemaVersion: v.literal("5.0.0"),
    catalogBasisDigest: refDigestSchema.entries.digest,
    readinessBasisDigest: refDigestSchema.entries.digest,
    viewDigest: refDigestSchema.entries.digest,
});
export function isAbgHistoricalDeclarationReference(value) {
    return v.safeParse(ABG_HISTORICAL_DECLARATION_REFERENCE_SCHEMA, value).success;
}
export function constructAbgHistoricalDeclarationReference(proof) {
    if (proof.kind !== "abg_historical_declaration_proof" || proof.schemaVersion !== "5.0.0" ||
        proof.catalogView.catalogBasisDigest !== proof.catalog.basisDigest)
        throw new TypeError("historical declaration basis differs from its View");
    return Object.freeze(v.parse(ABG_HISTORICAL_DECLARATION_REFERENCE_SCHEMA, {
        kind: "abg_historical_declaration_reference", schemaVersion: "5.0.0",
        catalogBasisDigest: proof.catalog.basisDigest, readinessBasisDigest: proof.catalog.readinessBasisDigest,
        viewDigest: proof.catalogView.viewDigest,
    }));
}
/** Stable selection only. The result body and the read prefix remain with ABG. */
export const ABG_HISTORICAL_TERMINAL_SELECTION_SCHEMA = v.omit(ABG_TYPED_TERMINAL_RESULT_SCHEMA, ["value", "projectionBasis"]);
/** One explicit cold declaration dependency, separate from semantic Run input. */
const historicalSourceResourceSchema = v.strictObject({
    kind: v.literal("abg_historical_graph_call_source_resource"),
    schemaVersion: v.literal("5.0.0"),
    terminal: ABG_HISTORICAL_TERMINAL_SELECTION_SCHEMA,
    input: v.strictObject({ graphFunctionRef: nonblankSchema, contractRef: nonblankSchema }),
    declarationProof: ABG_HISTORICAL_DECLARATION_PROOF_SCHEMA,
    declarationDependencies: v.optional(v.array(ABG_HISTORICAL_DECLARATION_PROOF_SCHEMA)),
});
/** Each immutable basis/View is supplied once, including the primary source. */
export function hasUniqueHistoricalDeclarationDependencies(resource) {
    try {
        if (resource.declarationDependencies !== undefined && !Array.isArray(resource.declarationDependencies))
            return false;
        const keys = [resource.declarationProof, ...(resource.declarationDependencies ?? [])].map(proof => {
            const ref = constructAbgHistoricalDeclarationReference(proof);
            return [ref.catalogBasisDigest, ref.readinessBasisDigest, ref.viewDigest].join(":");
        });
        return new Set(keys).size === keys.length;
    }
    catch {
        return false;
    }
}
export const ABG_HISTORICAL_GRAPH_CALL_SOURCE_RESOURCE_SCHEMA = v.pipe(historicalSourceResourceSchema, v.check(hasUniqueHistoricalDeclarationDependencies, "historical declaration dependencies must select unique exact bases"));
