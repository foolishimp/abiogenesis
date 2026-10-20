import * as v from "valibot";
import { capabilityRefsForDefinition } from "../shared/capability_contracts.js";
import { jsonValueSchema, nonemptyRefDigestSetSchema, ownerAuthorityDigest, ownerContractPacket, ownerMetadata, refDigestSchema, refusalSchema, TERMINAL_ONLY_ADAPTER_EXIT_MAP, } from "../shared/public_function_contracts.js";
export const WITNESS_ACTS = Object.freeze([
    "reprice",
    "attest",
    "hygiene-stamp",
    "intake",
    "run-resumed",
    "run-stopped",
]);
const WITNESS_AUTHORITY = "authority://abiogenesis/abg/witness-admission@5";
const witnessContentSchema = v.strictObject({
    kind: v.picklist(["typed_reason", "typed_payload"]),
    contentContract: refDigestSchema,
    value: jsonValueSchema,
});
const basisContextSchema = v.strictObject({
    kind: v.literal("basis"),
    basis: refDigestSchema,
});
const workspaceContextSchema = v.strictObject({
    kind: v.literal("workspace"),
    workspace: refDigestSchema,
});
const segmentContextSchema = v.strictObject({
    kind: v.literal("segment"),
    run: refDigestSchema,
    segment: refDigestSchema,
});
const runContextSchema = v.strictObject({
    kind: v.literal("run"),
    run: refDigestSchema,
    basis: refDigestSchema,
});
function witnessContextSchema(act) {
    if (act === "hygiene-stamp")
        return workspaceContextSchema;
    if (act === "intake")
        return segmentContextSchema;
    if (act === "run-resumed" || act === "run-stopped") {
        return runContextSchema;
    }
    return basisContextSchema;
}
function witnessSubjectKind(act) {
    if (act === "reprice")
        return "authority_basis";
    if (act === "attest")
        return "evidence_claim";
    if (act === "hygiene-stamp")
        return "workspace";
    if (act === "intake")
        return "intake_item";
    return "run";
}
const witnessRefusalSchema = refusalSchema([
    "actor_mismatch",
    "subject_mismatch",
    "act_mismatch",
    "content_mismatch",
    "context_mismatch",
    "evidence_mismatch",
    "provenance_mismatch",
    "basis_mismatch",
]);
function witnessContract(act) {
    const subjectKind = witnessSubjectKind(act);
    const executionScoped = act === "intake" || act === "run-resumed" || act === "run-stopped";
    return ownerContractPacket({ operationId: "abg.operation.witness.admit", memberKey: act }, v.strictObject({
        subjectKind: v.literal(subjectKind),
        subject: refDigestSchema,
        act: v.literal(act),
        content: witnessContentSchema,
        context: witnessContextSchema(act),
        evidence: nonemptyRefDigestSetSchema,
        provenance: nonemptyRefDigestSetSchema,
    }), v.strictObject({
        act: v.literal(act),
        witnessedAct: refDigestSchema,
        admittedEvent: refDigestSchema,
        evidence: nonemptyRefDigestSetSchema,
    }), witnessRefusalSchema, null, {
        abstractModule: "ABG.WitnessAdmission",
        exportName: "WITNESS_OPERATION_CONTRACTS",
        memberPath: ["admit", act],
        authorityRef: WITNESS_AUTHORITY,
        authorityDigest: ownerAuthorityDigest(WITNESS_AUTHORITY),
    }, ownerMetadata({
        authorityClass: "write",
        effectClass: "actor_attributed_witness_event",
        eventAdmission: "owning_semantic_authority",
        actorRequirement: "required",
        workspaceBindingRequirement: "exactly_one",
        authoritySlotRequirements: [
            "capability_grants",
            "workspace_binding",
            "product_set",
            "dependency_lock",
            "actor",
            ...(executionScoped ? ["execution_basis"] : []),
        ],
        capabilityRefs: capabilityRefsForDefinition({
            operationId: "abg.operation.witness.admit",
            memberKey: act,
        }),
        defaults: {},
        closedDomains: { act: [act], subjectKind: [subjectKind] },
        sdkCoordinate: "sdk.witness.admit",
        cliCoordinate: `witness admit ${act}`,
        adapterExitMap: TERMINAL_ONLY_ADAPTER_EXIT_MAP,
    }));
}
const reprice = witnessContract("reprice");
const attest = witnessContract("attest");
const hygieneStamp = witnessContract("hygiene-stamp");
const intake = witnessContract("intake");
const runResumed = witnessContract("run-resumed");
const runStopped = witnessContract("run-stopped");
export const WITNESS_OPERATION_CONTRACTS = Object.freeze({
    admit: Object.freeze({
        reprice,
        attest,
        "hygiene-stamp": hygieneStamp,
        intake,
        "run-resumed": runResumed,
        "run-stopped": runStopped,
    }),
});
