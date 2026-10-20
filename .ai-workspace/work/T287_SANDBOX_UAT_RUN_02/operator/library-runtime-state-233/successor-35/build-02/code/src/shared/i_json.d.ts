import type { JsonValue } from "./canonical_json.js";
export type IJsonValue = JsonValue;
export interface IJsonObject {
    readonly [key: string]: IJsonValue;
}
export type IJsonAdmissionFailureCode = "duplicate_object_key" | "invalid_json_framing" | "invalid_unicode_scalar" | "malformed_json" | "non_finite_number" | "non_ijson_value" | "unsafe_integral_number";
export declare class IJsonAdmissionError extends TypeError {
    readonly code: IJsonAdmissionFailureCode;
    constructor(code: IJsonAdmissionFailureCode, message: string);
}
export declare function admitIJsonValue(input: unknown, label?: string): IJsonValue;
export declare function admitIJsonText(input: string, label?: string): IJsonValue;
