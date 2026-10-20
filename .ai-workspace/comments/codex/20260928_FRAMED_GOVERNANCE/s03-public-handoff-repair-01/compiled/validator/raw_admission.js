import { isRecord } from "../shared/admission_predicates.js";
import { canonicalJson } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { C_TERM_KIND_VALUES } from "../gtl/c_algebra.js";
import { canonicalizeAuthoredGtlCarrier } from "../gtl/canonicalization.js";
export const RAW_SUBJECT_KIND_VALUES = [
    "module_publication",
    "catalog_contribution",
    "gtl_program",
    "graph_function",
    "gtl_graph",
    "c_program_term",
    "contract_declaration",
    "implementation_binding",
    "closure_contract",
    "invocation_input",
    "public_operation_request",
];
function hasExpectedKind(value, expectedKind) {
    switch (expectedKind) {
        case "catalog_contribution":
            return (value.kind === "graph_function" ||
                value.kind === "node_type" ||
                value.kind === "overlay");
        case "contract_declaration":
            return (typeof value.contractRef === "string" &&
                (value.contractKind === "input" ||
                    value.contractKind === "output" ||
                    value.contractKind === "evidence" ||
                    value.contractKind === "failure" ||
                    value.contractKind === "refusal" ||
                    value.contractKind === "judgment" ||
                    value.contractKind === "transition" ||
                    value.contractKind === "closure"));
        case "c_program_term":
            return C_TERM_KIND_VALUES.some((kind) => kind === value.kind);
        case "invocation_input":
            return typeof value.kind === "string" && value.kind.length !== 0;
        case "public_operation_request":
            return value.kind === "public_invocation";
        default:
            return value.kind === expectedKind;
    }
}
const admittedValues = new WeakSet();
export function isRawAdmittedValue(value) {
    return admittedValues.has(value);
}
export function rawAdmitValue(value, expectedKind, contractRef) {
    if (contractRef.length === 0) {
        return {
            kind: "raw_admission_refusal",
            schemaVersion: "5.0.0",
            disposition: "refused",
            code: "invalid_contract",
            message: "raw admission requires one exact non-empty contract reference",
        };
    }
    if (!isRecord(value) || !hasExpectedKind(value, expectedKind)) {
        return {
            kind: "raw_admission_refusal",
            schemaVersion: "5.0.0",
            disposition: "refused",
            code: "invalid_kind",
            message: `raw value does not satisfy expected kind ${expectedKind}`,
        };
    }
    try {
        const admittedJson = (() => {
            switch (expectedKind) {
                case "module_publication":
                case "catalog_contribution":
                case "gtl_program":
                case "graph_function":
                    return canonicalizeAuthoredGtlCarrier(value, expectedKind);
                default:
                    return JSON.parse(canonicalJson(value));
            }
        })();
        const admittedValue = deepFreeze(admittedJson);
        const subjectDigest = sha256Canonical(admittedValue);
        const admissionDigest = sha256Canonical({
            contractRef,
            expectedKind,
            subjectDigest,
        });
        const admitted = deepFreeze({
            kind: "raw_admitted_value",
            schemaVersion: "5.0.0",
            admissionRef: `raw-admission://abiogenesis/${admissionDigest.slice("sha256:".length)}`,
            subjectKind: expectedKind,
            contractRef,
            subjectDigest,
            value: admittedValue,
        });
        admittedValues.add(admitted);
        return admitted;
    }
    catch {
        return {
            kind: "raw_admission_refusal",
            schemaVersion: "5.0.0",
            disposition: "refused",
            code: "non_canonical_value",
            message: "raw value is not representable as canonical JSON",
        };
    }
}
