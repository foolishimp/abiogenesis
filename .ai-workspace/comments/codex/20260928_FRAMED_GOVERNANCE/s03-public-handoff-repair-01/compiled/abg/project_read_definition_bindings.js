import * as Effect from "effect/Effect";
import * as v from "valibot";
import { readFileSync } from "node:fs";
import { canonicalJson } from "../shared/canonical_json.js";
import {} from "../shared/effect_definition.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { admitRuntimeContract, } from "../shared/public_function_contracts.js";
import { acquireAbgEventResource, abandonAbgEventResource, closeAbgEventResource, validateAbgEventResourceAssertion, validateAbgEventResourceReceipt, } from "./definition_event_resource.js";
import { projectExactPrefixWorkspaceEnvironment } from "./environment_admission.js";
import { ABG_PROJECT_READ_CONTRACTS } from "./project_read_operation_contracts.js";
import { ABG_HISTORICAL_DECLARATION_PROOF_SCHEMA, isAbgTypedTerminalResult } from "./terminal_result_contracts.js";
import { ABG_PROJECT_READ_OWNER_PORTS, prepareRunReadAtDurablePrefix, } from "./project_read_ports.js";
import { constructCapabilityGrant, validateCapabilityGrantForProductBasis, } from "../product/invocation.js";
import { projectProductManifestOperationCoordinate } from "../product/verify_product.js";
import { bindExactPrefixRead, } from "../shared/static_definition_bindings.js";
const RUN_READ_MEMBER_KEYS = Object.freeze([
    "run_status",
    "run_result",
    "run_replay",
    "run_gaps",
    "graph_call_result",
    "graph_call_replay",
]);
const EVENT_RESOURCE_ASSERTION_SCHEMA = v.custom((value) => validateAbgEventResourceAssertion(value) &&
    value.kind === "reopen_abg_event_resource", "reopened_abg_event_resource_assertion");
const EVENT_RESOURCE_RECEIPT_SCHEMA = v.custom((value) => validateAbgEventResourceReceipt(value) &&
    value.acquisitionKind === "reopen", "reopened_abg_event_resource_receipt");
const PROJECT_READ_RESOURCE_ASSERTION_SCHEMA = v.strictObject({
    kind: v.literal("abg_project_read_resource_assertion"),
    schemaVersion: v.literal("5.0.0"),
    eventResource: EVENT_RESOURCE_ASSERTION_SCHEMA,
});
const PROJECT_READ_RESOURCE_RECEIPT_SCHEMA = v.strictObject({
    kind: v.literal("abg_project_read_resource_receipt"),
    schemaVersion: v.literal("5.0.0"),
    eventResource: EVENT_RESOURCE_RECEIPT_SCHEMA,
});
const GRAPH_CALL_TERMINAL_RESOURCE_ASSERTION_SCHEMA = v.strictObject({
    kind: v.literal("abg_project_read_resource_assertion"),
    schemaVersion: v.literal("5.0.0"),
    eventResource: EVENT_RESOURCE_ASSERTION_SCHEMA,
    declarationProof: v.optional(ABG_HISTORICAL_DECLARATION_PROOF_SCHEMA),
});
function fault(call, stage, code, message) {
    return deepFreeze({
        kind: "definition_execution_fault",
        schemaVersion: "5.0.0",
        definitionKey: call.invocation.definitionKey,
        stage,
        code,
        message,
        evidence: {},
    });
}
function asRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value)
        ? value
        : null;
}
function stringValue(value, key) {
    return typeof value[key] === "string" ? value[key] : null;
}
function digestValue(value, key) {
    const candidate = value[key];
    return typeof candidate === "string" && /^sha256:[0-9a-f]{64}$/u.test(candidate)
        ? candidate
        : null;
}
function reference(ref, digest) {
    return { ref, digest };
}
function coordinateFrom(value, refKeys, digestKeys) {
    const record = asRecord(value);
    if (record === null)
        return null;
    const ref = refKeys.map((key) => stringValue(record, key)).find((row) => row !== null);
    const digest = digestKeys.map((key) => digestValue(record, key)).find((row) => row !== null);
    return ref === undefined || ref === null || digest === undefined || digest === null
        ? null
        : reference(ref, digest);
}
function coordinateSet(values, refKeys, digestKeys) {
    if (!Array.isArray(values))
        return Object.freeze([]);
    return Object.freeze(values.flatMap((value) => {
        const coordinate = coordinateFrom(value, refKeys, digestKeys);
        return coordinate === null ? [] : [coordinate];
    }));
}
function replayCoordinate(value) {
    return coordinateFrom(value, ["replayRef"], ["replayDigest"]) ??
        coordinateFrom(value.physicalCoordinates, ["scopedReplayRef"], ["scopedReplayDigest"]);
}
function sourceCoordinate(request) {
    const source = asRecord(request.source);
    return reference(source.sourceRef, source.sourceDigest);
}
function basisCoordinate(request) {
    const basis = asRecord(request.projectionBasis);
    return reference(basis.projectionBasisRef, basis.projectionBasisDigest);
}
function sameJson(left, right) {
    try {
        return canonicalJson(left) === canonicalJson(right);
    }
    catch {
        return false;
    }
}
function closeReadEventResource(resource) {
    const receipt = closeAbgEventResource(resource, resource.entryPrefix);
    if (receipt.acquisitionKind !== "reopen") {
        throw new TypeError("project reads must close one reopened ABG resource");
    }
    return receipt;
}
function finishRead(resource, ownerOutput) {
    return deepFreeze({
        ownerOutput,
        resources: {
            kind: "abg_project_read_resource_receipt",
            schemaVersion: "5.0.0",
            eventResource: closeReadEventResource(resource),
        },
    });
}
function refusalOutput(packet, code, issuePath) {
    const output = {
        outcomeKind: "refusal",
        value: {
            code,
            issuePaths: [issuePath],
            evidenceRefs: [],
        },
    };
    if (admitRuntimeContract(packet.refusalSchema, output.value).disposition !== "admitted") {
        throw new TypeError("ABG run-read refusal differs from its exact owner contract");
    }
    return deepFreeze(output);
}
function nativeLivenessFields(value) {
    if (value.nativeLiveness === undefined)
        return {};
    if (!isRuntimeLivenessReadProjection(value.nativeLiveness))
        throw new TypeError("read owner returned an invalid native liveness carrier");
    return { nativeLiveness: value.nativeLiveness };
}
function statusProjection(memberKey, request, value) {
    const replay = replayCoordinate(value);
    if (replay === null)
        throw new TypeError("status projection lacks replay identity");
    const status = stringValue(value, "runtimeStatus") ?? stringValue(value, "status");
    if (status === null)
        throw new TypeError("status projection lacks status");
    const executionBasis = memberKey === "run_status"
        ? coordinateFrom(value.executionBasis, ["ref"], ["digest"]) : null;
    if (memberKey === "run_status" && executionBasis === null) {
        throw new TypeError("Run status lacks its admitted execution-basis identity");
    }
    const active = Array.isArray(value.holdsAt)
        ? value.holdsAt
        : Array.isArray(value.activeFluents)
            ? value.activeFluents
            : [];
    return {
        ...nativeLivenessFields(value),
        kind: memberKey === "run_status"
            ? "run_status_projection"
            : "graph_call_status_projection",
        subject: sourceCoordinate(request),
        ...(executionBasis === null ? {} : { executionBasis }),
        status,
        replay,
        activeFluents: active.map((row) => {
            const fluent = asRecord(row);
            const fluentRef = fluent === null
                ? null
                : stringValue(fluent, "fluentRef");
            if (fluentRef === null) {
                throw new TypeError("status projection lacks owner fluent identity");
            }
            const digest = sha256Canonical(row);
            return reference(fluentRef, digest);
        }),
    };
}
function resultProjection(memberKey, request, value) {
    const replay = replayCoordinate(value);
    const terminalRoute = coordinateFrom(value.terminalRoute, ["routeRef"], ["routeDigest"]);
    const result = coordinateFrom(value.admittedResult, ["resultRef"], ["resultDigest"]);
    const terminalResult = value.terminalResult;
    if (replay === null || terminalRoute === null || result === null ||
        !isAbgTypedTerminalResult(terminalResult) || !sameJson(result, terminalResult.result) ||
        !sameJson(terminalRoute, terminalResult.producer.terminalRoute)) {
        throw new TypeError("result projection lacks terminal owner coordinates");
    }
    return {
        kind: memberKey === "run_result"
            ? "run_result_projection"
            : "graph_call_result_projection",
        subject: sourceCoordinate(request),
        result,
        terminalResult: terminalResult,
        terminalRoute,
        replay,
    };
}
function evidenceProjection(memberKey, request, value) {
    const replay = replayCoordinate(value);
    if (replay === null)
        throw new TypeError("evidence projection lacks replay identity");
    const eventAtoms = coordinateSet(value.eventAtoms, ["atomRef"], ["semanticPayloadDigest"]);
    const evidence = Array.isArray(value.evidenceRefs)
        ? value.evidenceRefs.flatMap((row) => {
            if (typeof row !== "string")
                return [];
            const digest = sha256Canonical({ evidenceRef: row });
            return [reference(row, digest)];
        })
        : [];
    if (memberKey === "run_evidence" && Array.isArray(value.runtimeFailures)) {
        for (const failure of value.runtimeFailures) {
            evidence.push(reference("data:application/json;charset=utf-8," + encodeURIComponent(canonicalJson(failure)), sha256Canonical(failure)));
        }
    }
    return {
        ...nativeLivenessFields(value),
        kind: `${memberKey}_projection`,
        subject: sourceCoordinate(request),
        evidence,
        eventAtoms,
        replay,
    };
}
function replayProjection(memberKey, request, value, replay = replayCoordinate(value)) {
    const selector = asRecord(request.selector);
    if (replay === null)
        throw new TypeError("replay projection lacks replay identity");
    if (typeof selector.fromOrdinal !== "number" ||
        typeof selector.limit !== "number")
        throw new TypeError("replay projection lacks its exact ordinal page");
    return {
        kind: `${memberKey}_projection`,
        subject: sourceCoordinate(request),
        replay,
        fromOrdinal: selector.fromOrdinal,
        limit: selector.limit,
        ...(memberKey === "run_replay" || memberKey === "graph_call_replay"
            ? { status: value.runtimeStatus, terminalResult: value.terminalResult } : {}),
    };
}
function gapProjection(memberKey, request, value) {
    const replay = replayCoordinate(value) ?? reference(basisCoordinate(request).ref, basisCoordinate(request).digest);
    if (!Array.isArray(value.frontiers))
        throw new TypeError("gap projection lacks admitted frontiers");
    const frontiers = value.frontiers;
    const gaps = frontiers.map(frontier => {
        const row = asRecord(frontier);
        const route = row === null ? null : coordinateFrom(row.route, ["ref"], ["digest"]);
        if (route === null || (memberKey === "run_gaps" && !sameJson(row.run, sourceCoordinate(request)))) {
            throw new TypeError("gap frontier crosses the selected source");
        }
        return route;
    });
    return {
        ...nativeLivenessFields(value),
        kind: memberKey === "workspace_gaps"
            ? "workspace_gap_projection"
            : "run_gap_projection",
        subject: sourceCoordinate(request),
        gaps,
        frontiers,
        replay,
    };
}
function lawfulActionProjection(request, value) {
    const replay = replayCoordinate(value);
    if (replay === null)
        throw new TypeError("lawful-action projection lacks replay identity");
    return {
        ...nativeLivenessFields(value),
        kind: "run_lawful_action_projection",
        run: sourceCoordinate(request),
        actions: coordinateSet(value.lawfulActions, ["projectionRef", "routeRef"], ["projectionDigest", "routeDigest"]),
        replay,
    };
}
function projectValue(memberKey, request, native) {
    const value = asRecord(native.value);
    if (value === null)
        throw new TypeError("ABG projection owner returned a non-object value");
    switch (memberKey) {
        case "run_status":
        case "graph_call_status":
            return statusProjection(memberKey, request, value);
        case "run_result":
        case "graph_call_result":
            return resultProjection(memberKey, request, value);
        case "run_evidence":
        case "graph_call_evidence":
        case "result_evidence":
        case "assessment_evidence":
        case "witness_evidence":
            return evidenceProjection(memberKey, request, value);
        case "workspace_replay": {
            // This workspace collection has the existing read owner's exact
            // member/subject/prefix/value identity, rather than one Run's replay id.
            const digest = sha256Canonical({ memberKey: native.memberKey, targetRef: native.targetRef,
                prefixCoordinateDigest: native.prefixCoordinateDigest, value: native.value });
            if (native.memberKey !== memberKey || native.targetRef !== sourceCoordinate(request).ref ||
                value.workspaceRef !== native.targetRef || native.prefixCoordinateDigest !== basisCoordinate(request).digest ||
                native.projectionDigest !== digest || native.projectionRef !== `project-read://abiogenesis/${digest.slice(7)}`) {
                throw new TypeError("workspace replay differs from its exact owner projection identity");
            }
            return replayProjection(memberKey, request, value, reference(native.projectionRef, native.projectionDigest));
        }
        case "run_replay":
        case "graph_call_replay":
        case "interaction_replay":
        case "continuation_replay":
        case "c_call_replay":
            return replayProjection(memberKey, request, value);
        case "workspace_gaps":
        case "run_gaps":
            return gapProjection(memberKey, request, value);
        case "run_lawful_actions":
            return lawfulActionProjection(request, value);
    }
}
function nativeRefusalCode(result) {
    return result.code === "target_absent"
        ? "not_found"
        : result.code === "target_not_ready" ? "not_ready"
            : "projection_basis_mismatch";
}
export function projectAbgReadOutput(packet, request, memberKey, native) {
    if (native.kind === "abg_project_read_projection" &&
        (memberKey === "run_replay" || memberKey === "graph_call_replay")) {
        const selector = asRecord(request.selector);
        const value = asRecord(native.value);
        const offset = selector.fromOrdinal, limit = selector.limit;
        if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(limit) || limit < 1 ||
            !Number.isSafeInteger(offset + limit))
            return refusalOutput(packet, "range_invalid", "/selector");
        if (!Array.isArray(value.eventAtoms))
            throw new TypeError("replay lacks the selected scope population");
        if (offset > value.eventAtoms.length)
            return refusalOutput(packet, "cursor_invalid", "/selector/fromOrdinal");
    }
    const output = native.kind ===
        "abg_project_read_refusal"
        ? {
            outcomeKind: "refusal",
            value: {
                code: nativeRefusalCode(native),
                issuePaths: [],
                evidenceRefs: [],
            },
        }
        : {
            outcomeKind: "result",
            value: {
                caseKey: memberKey,
                source: sourceCoordinate(request),
                projectionBasis: basisCoordinate(request),
                projection: projectValue(memberKey, request, native),
            },
        };
    const schema = output.outcomeKind === "result"
        ? packet.resultSchema
        : packet.refusalSchema;
    if (admitRuntimeContract(schema, output.value).disposition !== "admitted") {
        throw new TypeError(`ABG ${memberKey} output differs from its exact owner contract`);
    }
    return output;
}
/** One authority/currentness relation shared by the Run reads and their two
 * typed GraphCall companions. Declaration evidence reaches the native owner. */
function runReadKernel(packet) {
    return (call) => Effect.try({
        try: () => {
            const acquired = acquireAbgEventResource(call.resources.eventResource);
            if (acquired.kind !== "acquired_abg_event_resource") {
                throw fault(call, "resource_acquisition", acquired.code, acquired.message);
            }
            const resource = acquired.resource;
            try {
                const request = call.invocation.request;
                const source = sourceCoordinate(request);
                const basis = basisCoordinate(request);
                const slots = call.invocation.invocationAuthority.slots;
                const workspaceBinding = slots.workspace_binding;
                if (workspaceBinding === null ||
                    basis.ref !== resource.entryPrefix.eventLogRef ||
                    basis.digest !== resource.entryPrefix.coordinateDigest) {
                    return finishRead(resource, refusalOutput(packet, "projection_basis_mismatch", "/projectionBasis"));
                }
                const environment = projectExactPrefixWorkspaceEnvironment(resource.entryPrefix, workspaceBinding);
                if (environment.kind !== "exact_prefix_workspace_environment") {
                    return finishRead(resource, refusalOutput(packet, "projection_basis_mismatch", "/invocationAuthority/slots/workspace_binding"));
                }
                const grantBasis = {
                    admittedInstalls: environment.productInstalls,
                    workspaceBinding: environment.workspaceBinding,
                    fixedPacket: packet,
                };
                const expectedGrants = packet.metadata.capabilityRefs.map((capabilityRef) => constructCapabilityGrant(environment.workspaceAuthorityBasis, environment.workspaceBinding.authorizedActorRef, packet.definitionKey.operationId, capabilityRef, grantBasis));
                // The loaded reader owns its current contract. Historical grants below
                // remain permission over the source binding, not the reader's Product.
                const executingContract = projectProductManifestOperationCoordinate(JSON.parse(readFileSync(new URL("../../../../product-toolchain-manifest.json", import.meta.url), "utf8")), packet.definitionKey.operationId);
                if (executingContract === null)
                    throw new TypeError("executing read owner has invalid Product operation metadata");
                if (!sameJson(executingContract.contractCatalog, call.invocation.contractCatalog) ||
                    !sameJson(executingContract.flatRow, call.invocation.requestContract.flatRow)) {
                    return finishRead(resource, refusalOutput(packet, "projection_basis_mismatch", "/contractCatalog"));
                }
                const expectedAuthority = {
                    workspace_binding: {
                        ref: environment.workspaceBinding.bindingId,
                        digest: environment.workspaceBinding.bindingDigest,
                    },
                    product_set: environment.productInstalls.map((install) => ({
                        ref: install.installId,
                        digest: install.productContentDigest,
                    })),
                    dependency_lock: {
                        ref: environment.resolvedProductLock.lockId,
                        digest: environment.resolvedProductLock.lockDigest,
                    },
                    capability_grants: {
                        requiredCapabilityRefs: packet.metadata.capabilityRefs,
                        grants: expectedGrants.map((grant) => ({
                            ref: grant.grantRef,
                            digest: grant.grantDigest,
                        })),
                    },
                };
                if (slots.actor !== null ||
                    !sameJson(slots.workspace_binding, expectedAuthority.workspace_binding) ||
                    !sameJson(slots.product_set, expectedAuthority.product_set) ||
                    !sameJson(slots.dependency_lock, expectedAuthority.dependency_lock) ||
                    !sameJson(slots.capability_grants, expectedAuthority.capability_grants) ||
                    expectedGrants.some((grant, index) => !validateCapabilityGrantForProductBasis(grant, environment.workspaceAuthorityBasis, environment.workspaceBinding.authorizedActorRef, packet.metadata.capabilityRefs[index], grantBasis))) {
                    return finishRead(resource, refusalOutput(packet, "projection_basis_mismatch", "/invocationAuthority"));
                }
                const graphRead = packet.definitionKey.memberKey === "graph_call_result" || packet.definitionKey.memberKey === "graph_call_replay";
                const truth = prepareRunReadAtDurablePrefix(resource.entryPrefix, packet.definitionKey.memberKey, source.ref);
                if (truth === null) {
                    return finishRead(resource, refusalOutput(packet, "unknown_source", "/source/sourceRef"));
                }
                if (source.ref !== truth.source.ref || source.digest !== truth.source.digest) {
                    return finishRead(resource, refusalOutput(packet, "source_digest_mismatch", "/source/sourceDigest"));
                }
                if (truth.workspaceBinding.ref !== environment.workspaceBinding.bindingId ||
                    truth.workspaceBinding.digest !==
                        environment.workspaceBinding.bindingDigest) {
                    return finishRead(resource, refusalOutput(packet, "projection_basis_mismatch", "/invocationAuthority/slots/workspace_binding"));
                }
                const native = truth.project(graphRead ? call.resources.declarationProof : undefined);
                return finishRead(resource, projectAbgReadOutput(packet, request, packet.definitionKey.memberKey, native));
            }
            catch (cause) {
                abandonAbgEventResource(resource);
                throw cause;
            }
        },
        catch: (cause) => {
            if (typeof cause === "object" && cause !== null &&
                cause.kind === "definition_execution_fault") {
                return cause;
            }
            return fault(call, "owner_projection", "projection_failure", String(cause));
        },
    });
}
function binding(packet, memberKey) {
    return (call) => Effect.try({
        try: () => {
            if (Object.keys(call.resources).sort().join("\0") !==
                ["eventResource", "kind", "schemaVersion"].sort().join("\0") ||
                call.resources.kind !== "abg_project_read_resource_assertion" ||
                call.resources.schemaVersion !== "5.0.0" ||
                call.resources.eventResource.kind !== "reopen_abg_event_resource") {
                throw fault(call, "resource_admission", "invalid_resource_assertion", "ABG reads require one exact reopened event-resource assertion");
            }
            const acquired = acquireAbgEventResource(call.resources.eventResource);
            if (acquired.kind !== "acquired_abg_event_resource") {
                throw fault(call, "resource_acquisition", acquired.code, acquired.message);
            }
            const resource = acquired.resource;
            try {
                const request = call.invocation.request;
                const basis = basisCoordinate(request);
                if (basis.ref !== resource.entryPrefix.eventLogRef ||
                    basis.digest !== resource.entryPrefix.coordinateDigest) {
                    const ownerOutput = {
                        outcomeKind: "refusal",
                        value: {
                            code: "projection_basis_mismatch",
                            issuePaths: ["/projectionBasis"],
                            evidenceRefs: [],
                        },
                    };
                    return deepFreeze({
                        ownerOutput,
                        resources: {
                            kind: "abg_project_read_resource_receipt",
                            schemaVersion: "5.0.0",
                            eventResource: closeReadEventResource(resource),
                        },
                    });
                }
                const port = ABG_PROJECT_READ_OWNER_PORTS[memberKey].project;
                const native = port({
                    kind: "abg_project_read_packet",
                    schemaVersion: "5.0.0",
                    memberKey,
                    prefix: resource.entryPrefix,
                    targetRef: sourceCoordinate(request).ref,
                });
                const ownerOutput = projectAbgReadOutput(packet, request, memberKey, native);
                return deepFreeze({
                    ownerOutput,
                    resources: {
                        kind: "abg_project_read_resource_receipt",
                        schemaVersion: "5.0.0",
                        eventResource: closeReadEventResource(resource),
                    },
                });
            }
            catch (cause) {
                abandonAbgEventResource(resource);
                throw cause;
            }
        },
        catch: (cause) => {
            if (typeof cause === "object" && cause !== null &&
                cause.kind === "definition_execution_fault")
                return cause;
            return fault(call, "owner_projection", "projection_failure", String(cause));
        },
    });
}
const legacyBindings = Object.fromEntries(Object.entries(ABG_PROJECT_READ_CONTRACTS).flatMap(([memberKey, packet]) => RUN_READ_MEMBER_KEYS.includes(memberKey)
    ? []
    : [[
            memberKey,
            binding(packet, memberKey),
        ]]));
const RUN_READ_DEFINITION_BINDINGS = Object.freeze({
    run_status: bindExactPrefixRead(ABG_PROJECT_READ_CONTRACTS.run_status, runReadKernel(ABG_PROJECT_READ_CONTRACTS.run_status), PROJECT_READ_RESOURCE_ASSERTION_SCHEMA, PROJECT_READ_RESOURCE_RECEIPT_SCHEMA),
    run_result: bindExactPrefixRead(ABG_PROJECT_READ_CONTRACTS.run_result, runReadKernel(ABG_PROJECT_READ_CONTRACTS.run_result), PROJECT_READ_RESOURCE_ASSERTION_SCHEMA, PROJECT_READ_RESOURCE_RECEIPT_SCHEMA),
    run_replay: bindExactPrefixRead(ABG_PROJECT_READ_CONTRACTS.run_replay, runReadKernel(ABG_PROJECT_READ_CONTRACTS.run_replay), PROJECT_READ_RESOURCE_ASSERTION_SCHEMA, PROJECT_READ_RESOURCE_RECEIPT_SCHEMA),
    run_gaps: bindExactPrefixRead(ABG_PROJECT_READ_CONTRACTS.run_gaps, runReadKernel(ABG_PROJECT_READ_CONTRACTS.run_gaps), PROJECT_READ_RESOURCE_ASSERTION_SCHEMA, PROJECT_READ_RESOURCE_RECEIPT_SCHEMA),
    graph_call_result: bindExactPrefixRead(ABG_PROJECT_READ_CONTRACTS.graph_call_result, runReadKernel(ABG_PROJECT_READ_CONTRACTS.graph_call_result), GRAPH_CALL_TERMINAL_RESOURCE_ASSERTION_SCHEMA, PROJECT_READ_RESOURCE_RECEIPT_SCHEMA),
    graph_call_replay: bindExactPrefixRead(ABG_PROJECT_READ_CONTRACTS.graph_call_replay, runReadKernel(ABG_PROJECT_READ_CONTRACTS.graph_call_replay), GRAPH_CALL_TERMINAL_RESOURCE_ASSERTION_SCHEMA, PROJECT_READ_RESOURCE_RECEIPT_SCHEMA),
});
export const ABG_PROJECT_READ_DEFINITION_BINDINGS = Object.freeze({
    ...legacyBindings,
    ...RUN_READ_DEFINITION_BINDINGS,
});
import { isRuntimeLivenessReadProjection } from "./runtime_liveness_contracts.js";
