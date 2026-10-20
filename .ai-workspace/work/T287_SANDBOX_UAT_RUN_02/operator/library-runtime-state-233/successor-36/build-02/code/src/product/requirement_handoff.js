import * as v from "valibot";
import { REQUIREMENT_HANDOFF_DECLARATION_SCHEMA, isRequirementHandoffDeclaration } from "../gtl/requirement_handoff.js";
import { sha256Bytes, sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
const ref = v.pipe(v.string(), v.minLength(1));
const digest = v.pipe(v.string(), v.regex(/^sha256:[0-9a-f]{64}$/));
const schemaVersion = v.literal("5.0.0");
/** Pure quote projection over an already bound immutable source member. */
export function groundBoundSourceQuote(contextRef, member, quoteText) {
    if (quoteText.length === 0)
        return null;
    const bytes = Buffer.from(member.base64, "base64"), quote = Buffer.from(quoteText, "utf8"), startByte = bytes.indexOf(quote);
    if (startByte < 0 || bytes.indexOf(quote, startByte + 1) !== -1)
        return null;
    return deepFreeze({ contextRef, memberRef: member.memberRef, memberDigest: member.digest,
        startByte, endByte: startByte + quote.length, spanDigest: sha256Bytes(quote) });
}
const members = v.pipe(v.array(v.strictObject({ memberRef: ref, base64: v.string() })), v.minLength(1));
export const REQUIREMENT_HANDOFF_INPUT_SCHEMA = v.strictObject({
    kind: v.literal("requirement_handoff_input"), schemaVersion,
    declarationRef: ref, sourceRoleRef: ref, members,
});
export const REQUIREMENT_HANDOFF_COORDINATE_SCHEMA = v.strictObject({
    publicationDigest: digest, declarationDigest: digest, executionBasisRef: ref, executionBasisDigest: digest,
    programRef: ref, programDigest: digest, graphFunctionRef: ref, graphFunctionDigest: digest,
    cCallRef: ref, cCallDigest: digest, implementationResolutionRef: ref, implementationResolutionDigest: digest,
    predecessorPrefixDigest: digest, predecessorEventCount: v.pipe(v.number(), v.integer(), v.minValue(1)),
    inputDigest: digest,
});
export const REQUIREMENT_HANDOFF_GAPS = Object.freeze([
    "full_source_semantic_assessment_required", "instruction_assembly_required", "semantic_stage_result_required",
    "proof_depth_and_strength_unassessed", "discovered_obligations_unassessed", "application_closure_not_evaluated",
]);
export const REQUIREMENT_HANDOFF_OUTPUT_SCHEMA = v.strictObject({
    kind: v.literal("requirement_handoff_output"), schemaVersion,
    source: REQUIREMENT_HANDOFF_INPUT_SCHEMA, declaration: REQUIREMENT_HANDOFF_DECLARATION_SCHEMA,
    basis: REQUIREMENT_HANDOFF_COORDINATE_SCHEMA,
    coverage: v.strictObject({ disposition: v.literal("non_closing"),
        obligations: v.array(v.strictObject({ obligationRef: ref, requirementRef: ref,
            role: v.picklist(["realization", "proof"]), requiredContractRef: v.nullable(ref),
            proofPolicyRef: v.nullable(ref), proofShapeRef: v.nullable(ref),
            disposition: v.literal("no_admitted_evidence"), policyGap: v.boolean() })),
        gaps: v.tuple(REQUIREMENT_HANDOFF_GAPS.map(x => v.literal(x))),
    }),
});
export function isRequirementHandoffInput(value) {
    return v.is(REQUIREMENT_HANDOFF_INPUT_SCHEMA, value) &&
        new Set(value.members.map(x => x.memberRef)).size === value.members.length &&
        value.members.every(x => Buffer.from(x.base64, "base64").toString("base64") === x.base64);
}
export function constructRequirementHandoffInput(value) {
    if (!isRequirementHandoffInput(value))
        throw new TypeError("invalid requirement handoff input");
    return deepFreeze(value);
}
export function requirementHandoffInputMatches(input, declaration) {
    if (!isRequirementHandoffInput(input) || !isRequirementHandoffDeclaration(declaration) ||
        input.declarationRef !== declaration.declarationRef || input.sourceRoleRef !== declaration.sourceRoleRef ||
        input.members.length !== declaration.context.members.length)
        return false;
    return input.members.every((source, i) => {
        const member = declaration.context.members[i];
        const bytes = Buffer.from(source.base64, "base64");
        return source.memberRef === member.memberRef && bytes.length === member.byteCount && sha256Bytes(bytes) === member.digest &&
            declaration.terms.every(term => term.sourceBindings.filter(x => x.memberRef === member.memberRef).every(span => {
                const selected = bytes.subarray(span.startByte, span.endByte);
                try {
                    new TextDecoder("utf-8", { fatal: true }).decode(selected);
                }
                catch {
                    return false;
                }
                return sha256Bytes(selected) === span.spanDigest;
            }));
    });
}
/** Pure candidate construction. Only ABG admission can make this runtime truth. */
export function deriveRequirementHandoffCandidate(input, declaration, basis) {
    if (!requirementHandoffInputMatches(input, declaration) || !v.is(REQUIREMENT_HANDOFF_COORDINATE_SCHEMA, basis) ||
        basis.inputDigest !== sha256Canonical(input) ||
        basis.declarationDigest !== sha256Canonical(declaration))
        return null;
    return deepFreeze({ kind: "requirement_handoff_output", schemaVersion: "5.0.0", source: input, declaration, basis,
        coverage: { disposition: "non_closing", obligations: declaration.fulfillmentBindings.flatMap(binding => ["realization", "proof"].map(role => ({ obligationRef: binding.obligationRef,
                requirementRef: binding.requirementRef, role,
                requiredContractRef: role === "realization" ? binding.realizationContractRef : binding.proofContractRef,
                proofPolicyRef: binding.proofPolicyRef, proofShapeRef: binding.proofShapeRef,
                disposition: "no_admitted_evidence",
                policyGap: binding.proofPolicyRef === null || binding.proofShapeRef === null ||
                    (role === "realization" ? binding.realizationContractRef : binding.proofContractRef) === null }))),
            gaps: [...REQUIREMENT_HANDOFF_GAPS] },
    });
}
export function isRequirementHandoffOutput(value) {
    if (!v.is(REQUIREMENT_HANDOFF_OUTPUT_SCHEMA, value))
        return false;
    // The closed schema above checked all digest lexemes; retain the native public types.
    const typed = value;
    const expected = deriveRequirementHandoffCandidate(typed.source, typed.declaration, typed.basis);
    return expected !== null && sha256Canonical(expected) === sha256Canonical(value);
}
