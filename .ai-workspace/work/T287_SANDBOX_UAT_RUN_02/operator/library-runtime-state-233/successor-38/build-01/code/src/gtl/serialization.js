import { canonicalJson } from "../shared/canonical_json.js";
import { eraseNativeCProofMetadata } from "./c_algebra.js";
import { rawAdmitValue } from "../validator/raw_admission.js";
import { GRAPH_FUNCTION_SCHEMA, MODULE_PUBLICATION_SCHEMA, C_PROGRAM_SYNTAX_SCHEMA, nativeStructuralSchema } from "./serialization_contracts.js";
export function admitGraphFunction(value) {
    return rawAdmitValue(value, "graph_function", "contract://abiogenesis/gtl/graph-function@5");
}
export function admitModule(value) {
    return rawAdmitValue(value, "module_publication", "contract://abiogenesis/gtl/module-publication@5");
}
export function admitCProgramSyntax(value) {
    return rawAdmitValue(value, "c_program_term", "contract://abiogenesis/gtl/c-program-syntax@5");
}
function serialized(value, admit) {
    const admitted = admit(eraseNativeCProofMetadata(value));
    if (admitted.kind !== "raw_admitted_value")
        throw new TypeError(`${admitted.code}: ${admitted.message}`);
    return canonicalJson(admitted.value);
}
export function serializeGraphFunction(value) {
    return serialized(value, admitGraphFunction);
}
export function serializeModule(value) {
    return serialized(value, admitModule);
}
export function serializeCProgramCanonical(value) {
    return serialized(value, admitCProgramSyntax);
}
export const GTL_GRAPH_FUNCTION_SERIALIZATION_API = Object.freeze({
    schemaDefinition: "GraphFunction", schema: nativeStructuralSchema(GRAPH_FUNCTION_SCHEMA), admitGraphFunction, serializeGraphFunction,
});
export const GTL_MODULE_SERIALIZATION_API = Object.freeze({
    schemaDefinition: "ModulePublication", schema: nativeStructuralSchema(MODULE_PUBLICATION_SCHEMA), admitModule, serializeModule,
});
export const GTL_C_PROGRAM_SERIALIZATION_API = Object.freeze({
    schemaDefinition: "CProgramSyntax", schema: nativeStructuralSchema(C_PROGRAM_SYNTAX_SCHEMA), admitCProgramSyntax, serializeCProgramCanonical,
});
