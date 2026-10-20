import { type Sha256Digest } from "../shared/digests.js";
export declare const RAW_SUBJECT_KIND_VALUES: readonly ["module_publication", "catalog_contribution", "gtl_program", "graph_function", "gtl_graph", "c_program_term", "contract_declaration", "implementation_binding", "closure_contract", "invocation_input", "public_operation_request", "conformance_evaluate_packet"];
export type RawSubjectKind = (typeof RAW_SUBJECT_KIND_VALUES)[number];
export interface RawAdmittedValue<S> {
    readonly kind: "raw_admitted_value";
    readonly schemaVersion: "5.0.0";
    readonly admissionRef: string;
    readonly subjectKind: RawSubjectKind;
    readonly contractRef: string;
    readonly subjectDigest: Sha256Digest;
    readonly value: Readonly<S>;
}
export interface RawAdmissionRefusal {
    readonly kind: "raw_admission_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "invalid_contract" | "invalid_kind" | "non_canonical_value";
    readonly message: string;
}
export type RawAdmissionResult<S> = RawAdmittedValue<S> | RawAdmissionRefusal;
export declare function isRawAdmittedValue(value: object): boolean;
export declare function rawAdmitValue<S>(value: unknown, expectedKind: RawSubjectKind, contractRef: string): RawAdmissionResult<S>;
