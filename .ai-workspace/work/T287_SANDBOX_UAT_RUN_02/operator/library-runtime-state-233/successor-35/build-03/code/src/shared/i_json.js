import { getNodeValue, parseTree, printParseErrorCode, } from "jsonc-parser";
import { deepFreeze } from "./immutable.js";
export class IJsonAdmissionError extends TypeError {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = "IJsonAdmissionError";
    }
}
function refuse(code, message) {
    throw new IJsonAdmissionError(code, message);
}
function assertUnicodeScalarString(value, label) {
    for (let index = 0; index < value.length; index += 1) {
        const codeUnit = value.charCodeAt(index);
        if (codeUnit < 0xd800 || codeUnit > 0xdfff)
            continue;
        if (codeUnit >= 0xdc00) {
            refuse("invalid_unicode_scalar", `${label}: lone low surrogate is not I-JSON`);
        }
        const next = value.charCodeAt(index + 1);
        if (!(next >= 0xdc00 && next <= 0xdfff)) {
            refuse("invalid_unicode_scalar", `${label}: lone high surrogate is not I-JSON`);
        }
        index += 1;
    }
    return value;
}
function isJsonObject(input) {
    const prototype = Object.getPrototypeOf(input);
    return prototype === Object.prototype || prototype === null;
}
function isDataDescriptor(descriptor) {
    return descriptor !== undefined &&
        Object.hasOwn(descriptor, "value") &&
        !Object.hasOwn(descriptor, "get") &&
        !Object.hasOwn(descriptor, "set");
}
function admitIJsonArray(input, label) {
    if (Object.getPrototypeOf(input) !== Array.prototype) {
        refuse("non_ijson_value", `${label}: custom-prototype arrays are not I-JSON`);
    }
    const ownKeys = Reflect.ownKeys(input);
    if (ownKeys.some((key) => typeof key === "symbol")) {
        refuse("non_ijson_value", `${label}: symbol array members are not I-JSON`);
    }
    const lengthDescriptor = Object.getOwnPropertyDescriptor(input, "length");
    if (!isDataDescriptor(lengthDescriptor) ||
        lengthDescriptor.enumerable !== false ||
        lengthDescriptor.configurable !== false ||
        typeof lengthDescriptor.value !== "number" ||
        !Number.isInteger(lengthDescriptor.value) ||
        lengthDescriptor.value < 0 ||
        lengthDescriptor.value > 0xffff_ffff) {
        refuse("non_ijson_value", `${label}: array length is not an ordinary data member`);
    }
    const length = lengthDescriptor.value;
    if (ownKeys.length !== length + 1) {
        refuse("non_ijson_value", `${label}: arrays must contain exactly dense indices and length`);
    }
    const admitted = [];
    for (let index = 0; index < length; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(input, String(index));
        if (!isDataDescriptor(descriptor) || descriptor.enumerable !== true) {
            refuse("non_ijson_value", `${label}[${String(index)}]: array indices must be enumerable data members`);
        }
        admitted.push(admitIJsonValue(descriptor.value, `${label}[${String(index)}]`));
    }
    return deepFreeze(admitted);
}
function defineIJsonMember(target, key, value) {
    Object.defineProperty(target, key, {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
    });
}
export function admitIJsonValue(input, label = "IJsonValue") {
    if (input === null || typeof input === "boolean")
        return input;
    if (typeof input === "string")
        return assertUnicodeScalarString(input, label);
    if (typeof input === "number") {
        if (!Number.isFinite(input)) {
            refuse("non_finite_number", `${label}: non-finite numbers are not I-JSON`);
        }
        if (Number.isInteger(input) && !Number.isSafeInteger(input)) {
            refuse("unsafe_integral_number", `${label}: unsafe integral numbers are not I-JSON`);
        }
        return Object.is(input, -0) ? 0 : input;
    }
    if (Array.isArray(input))
        return admitIJsonArray(input, label);
    if (typeof input !== "object" || !isJsonObject(input)) {
        refuse("non_ijson_value", `${label}: expected an I-JSON value`);
    }
    const admitted = {};
    for (const key of Reflect.ownKeys(input)) {
        if (typeof key !== "string") {
            refuse("non_ijson_value", `${label}: symbol object members are not I-JSON`);
        }
        assertUnicodeScalarString(key, `${label} key`);
        const descriptor = Object.getOwnPropertyDescriptor(input, key);
        if (!isDataDescriptor(descriptor) || descriptor.enumerable !== true) {
            refuse("non_ijson_value", `${label}.${key}: object members must be enumerable data properties`);
        }
        defineIJsonMember(admitted, key, admitIJsonValue(descriptor.value, `${label}.${key}`));
    }
    return deepFreeze(admitted);
}
function propertyName(node, label) {
    const value = getNodeValue(node);
    if (typeof value !== "string") {
        refuse("malformed_json", `${label}: invalid object property name`);
    }
    return assertUnicodeScalarString(value, label);
}
function reconstructIJsonNode(node, label) {
    if (node.type === "object") {
        const seen = new Set();
        const value = {};
        for (const property of node.children ?? []) {
            const nameNode = property.children?.[0];
            const valueNode = property.children?.[1];
            if (nameNode === undefined || valueNode === undefined) {
                refuse("malformed_json", `${label}: malformed object property tree`);
            }
            const name = propertyName(nameNode, `${label} property`);
            if (seen.has(name)) {
                refuse("duplicate_object_key", `${label}: duplicate object property ${JSON.stringify(name)}`);
            }
            seen.add(name);
            defineIJsonMember(value, name, reconstructIJsonNode(valueNode, `${label}.${name}`));
        }
        return deepFreeze(value);
    }
    if (node.type === "array") {
        return deepFreeze((node.children ?? []).map((child, index) => reconstructIJsonNode(child, `${label}[${String(index)}]`)));
    }
    return admitIJsonValue(getNodeValue(node), label);
}
export function admitIJsonText(input, label = "IJsonText") {
    const errors = [];
    const root = parseTree(input, errors, {
        allowEmptyContent: false,
        allowTrailingComma: false,
        disallowComments: true,
    });
    const firstError = errors[0];
    if (root === undefined || firstError !== undefined) {
        const detail = firstError === undefined
            ? "empty or malformed JSON"
            : `${printParseErrorCode(firstError.error)} at offset ${String(firstError.offset)}`;
        let completeRoot = false;
        let rootEnd = null;
        if (root !== undefined) {
            rootEnd = root.offset + root.length;
            try {
                JSON.parse(input.slice(root.offset, rootEnd));
                completeRoot = true;
            }
            catch {
                completeRoot = false;
            }
        }
        const afterCompleteRoot = completeRoot &&
            firstError !== undefined &&
            rootEnd !== null &&
            firstError.offset >= rootEnd;
        refuse(afterCompleteRoot
            ? "invalid_json_framing"
            : "malformed_json", `${label}: ${detail}`);
    }
    return reconstructIJsonNode(root, label);
}
