import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { eraseNativeCProofMetadata, type CProgramNode } from "./c_algebra.js";
import type { GraphFunction, ModulePublication } from "./contracts.js";
import { rawAdmitValue, type RawAdmissionResult } from "../validator/raw_admission.js";
import { GRAPH_FUNCTION_SCHEMA, MODULE_PUBLICATION_SCHEMA, C_PROGRAM_SYNTAX_SCHEMA, nativeStructuralSchema } from "./serialization_contracts.js";

export function admitGraphFunction(value: unknown): RawAdmissionResult<GraphFunction> {
  return rawAdmitValue<GraphFunction>(value, "graph_function", "contract://abiogenesis/gtl/graph-function@5");
}

export function admitModule(value: unknown): RawAdmissionResult<ModulePublication> {
  return rawAdmitValue<ModulePublication>(value, "module_publication", "contract://abiogenesis/gtl/module-publication@5");
}

export function admitCProgramSyntax(value: unknown): RawAdmissionResult<CProgramNode> {
  return rawAdmitValue<CProgramNode>(value, "c_program_term", "contract://abiogenesis/gtl/c-program-syntax@5");
}

function serialized<S>(value: unknown, admit: (supplied: unknown) => RawAdmissionResult<S>): string {
  const admitted = admit(eraseNativeCProofMetadata(value));
  if (admitted.kind !== "raw_admitted_value") throw new TypeError(`${admitted.code}: ${admitted.message}`);
  return canonicalJson(admitted.value as unknown as JsonValue);
}

export function serializeGraphFunction(value: GraphFunction): string {
  return serialized(value, admitGraphFunction);
}

export function serializeModule(value: ModulePublication): string {
  return serialized(value, admitModule);
}

export function serializeCProgramCanonical(value: CProgramNode): string {
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
