import { retainedProductVerification } from "../product/verify_product.js";
import { isRecord, hasExactKeys } from "../shared/admission_predicates.js";
import * as abg from "../abg/index.js";
import * as product from "../product/index.js";
import { runExactDefinition, } from "../shared/effect_definition.js";
import { OWNER_CONTRACT_SOURCES, } from "../shared/owner_contract_source_set.js";
import { admitExactDefinitionCall } from "../shared/definition_binding_mechanics.js";
import * as validator from "../validator/index.js";
const INSTALLED_OWNER_MODULES = Object.freeze({
    "./product": product,
    "./abg": abg,
    "./validator": validator,
});
function hasOwnDataProperty(value, property) {
    const descriptor = Object.getOwnPropertyDescriptor(value, property);
    return descriptor !== undefined && Object.hasOwn(descriptor, "value");
}
function isInstalledDefinitionCallAcquisition(value) {
    if (!isRecord(value) ||
        !hasOwnDataProperty(value, "kind")) {
        return false;
    }
    if (value.kind === "eventless")
        return hasExactKeys(value, ["kind"]);
    if (value.kind === "new") {
        return hasExactKeys(value, ["kind", "eventLogPath"]) &&
            hasOwnDataProperty(value, "eventLogPath") &&
            typeof value.eventLogPath === "string";
    }
    return value.kind === "reopen" &&
        hasExactKeys(value, ["kind", "closeHandoff"]) &&
        hasOwnDataProperty(value, "closeHandoff") &&
        isRecord(value.closeHandoff);
}
export function isInstalledDefinitionCallCandidate(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, ["invocation", "resources"]) ||
        !hasOwnDataProperty(value, "invocation") ||
        !hasOwnDataProperty(value, "resources")) {
        return false;
    }
    const invocation = value.invocation;
    const resources = value.resources;
    if (!isRecord(invocation) ||
        !hasOwnDataProperty(invocation, "kind") ||
        !hasOwnDataProperty(invocation, "definitionKey") ||
        !isRecord(resources)) {
        return false;
    }
    const definitionKey = invocation.definitionKey;
    return isRecord(definitionKey) &&
        hasOwnDataProperty(definitionKey, "operationId") &&
        hasOwnDataProperty(definitionKey, "memberKey") &&
        invocation.kind === "public_invocation" &&
        typeof definitionKey.operationId === "string" &&
        typeof definitionKey.memberKey === "string";
}
function refusal(code, message) {
    return Object.freeze({
        kind: "installed_definition_call_transport_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code,
        message,
    });
}
function sameStructure(left, right) {
    try {
        return product.canonicalJson(left) ===
            product.canonicalJson(right);
    }
    catch {
        return false;
    }
}
function acquisitionMatches(acquisition, call) {
    const resources = call.resources;
    if (!isRecord(resources)) {
        return false;
    }
    if (acquisition.kind === "eventless") {
        return !Object.hasOwn(resources, "eventResource");
    }
    const eventResource = resources.eventResource;
    if (!isRecord(eventResource))
        return false;
    return acquisition.kind === "new"
        ? eventResource.kind === "new_abg_event_resource" &&
            eventResource.eventLogPath === acquisition.eventLogPath
        : eventResource.kind === "reopen_abg_event_resource" &&
            sameStructure(eventResource.closeHandoff, acquisition.closeHandoff);
}
function selectedCallable(call, acquisitionKind) {
    const matches = OWNER_CONTRACT_SOURCES.filter(({ packet }) => packet.definitionKey.operationId ===
        call.invocation.definitionKey.operationId &&
        packet.definitionKey.memberKey === call.invocation.definitionKey.memberKey);
    if (matches.length !== 1) {
        return refusal(matches.length === 0 ? "unknown_definition" : "invalid_definition_call", "DefinitionCall must select one exact installed owner contract source");
    }
    const packet = matches[0].packet;
    // Serialized ingress also serves legacy read owners whose admission is at
    // this boundary. Native acquired calls retain the fixed owner's admission.
    if (acquisitionKind !== "acquired" &&
        admitExactDefinitionCall(call, matches[0].declaration) === null) {
        return refusal("invalid_definition_call", "DefinitionCall differs from its exact installed invocation contract");
    }
    const locator = packet.executionBindingSpecification.callable;
    if (!Object.hasOwn(INSTALLED_OWNER_MODULES, locator.packageExportPath)) {
        return refusal("installed_binding_unavailable", "manifest-bound installed definition module is unavailable");
    }
    const installedModule = INSTALLED_OWNER_MODULES[locator.packageExportPath];
    if (!Object.hasOwn(installedModule, locator.namedExport)) {
        return refusal("installed_binding_unavailable", "manifest-bound installed definition export is unavailable");
    }
    let selected = installedModule[locator.namedExport];
    for (const member of locator.memberPath) {
        if (!isRecord(selected) || !Object.hasOwn(selected, member)) {
            return refusal("installed_binding_unavailable", "manifest-bound installed definition member is unavailable");
        }
        selected = selected[member];
    }
    return typeof selected === "function"
        ? { callable: selected, declaration: matches[0].declaration }
        : refusal("installed_binding_unavailable", "manifest-bound installed definition callable is unavailable");
}
/** Detach mutable/raw input without copying an immutable verifier result first.
 * Only the verifier's existing exact request/result relation retains a body;
 * every receiving owner still admits the call and its additional relations. */
function detachDefinitionCall(original) {
    const resources = { ...original.resources };
    const retained = [];
    const keep = (record, key, path, value) => {
        record[key] = null;
        retained.push({ path: [...path, key], value });
    };
    const authority = resources.admissionAuthority;
    const basis = isRecord(authority) ? authority.basis : null;
    const ownerArtifact = isRecord(basis) && isRecord(basis.ownerArtifact) ? basis.ownerArtifact : null;
    const owner = ownerArtifact === null ? null : product.selectOwnedProductVerification(ownerArtifact.request, ownerArtifact.verified);
    if (owner !== null && isRecord(authority) && isRecord(basis) && ownerArtifact !== null) {
        const detachedOwner = { ...ownerArtifact };
        resources.admissionAuthority = { ...authority, basis: { ...basis, ownerArtifact: detachedOwner } };
        keep(detachedOwner, "verified", ["resources", "admissionAuthority", "basis", "ownerArtifact"], owner);
    }
    const verified = retainedProductVerification(resources.verifiedArtifact);
    if (verified !== null)
        keep(resources, "verifiedArtifact", ["resources"], verified);
    if (Array.isArray(resources.verifiedProducts)) {
        resources.verifiedProducts = resources.verifiedProducts.map((value, index) => {
            const owned = retainedProductVerification(value);
            if (owned === null)
                return value;
            retained.push({ path: ["resources", "verifiedProducts", index], value: owned });
            return null;
        });
    }
    if (Array.isArray(resources.verifiedPreimages)) {
        resources.verifiedPreimages = resources.verifiedPreimages.map((value, index) => {
            if (!isRecord(value))
                return value;
            const owned = retainedProductVerification(value.verifiedArtifact);
            if (owned === null)
                return value;
            const row = { ...value };
            keep(row, "verifiedArtifact", ["resources", "verifiedPreimages", index], owned);
            return row;
        });
    }
    const detached = structuredClone({ invocation: original.invocation, resources });
    for (const { path, value } of retained) {
        let parent = detached;
        for (const key of path.slice(0, -1))
            parent = parent[key];
        parent[path[path.length - 1]] = value;
    }
    return detached;
}
export async function runInstalledDefinitionCallTransport(acquisition, candidate) {
    let detachedEnvelope;
    try {
        detachedEnvelope = {
            acquisition: structuredClone(acquisition),
            candidate: isInstalledDefinitionCallCandidate(candidate)
                ? detachDefinitionCall(candidate) : structuredClone(candidate),
        };
    }
    catch {
        return refusal("invalid_definition_call", "transport input is not one canonical DefinitionCall");
    }
    const { acquisition: detachedAcquisition, candidate: detachedCandidate, } = detachedEnvelope;
    if (!isInstalledDefinitionCallAcquisition(detachedAcquisition)) {
        return refusal("acquisition_mismatch", "top-level acquisition differs from the DefinitionCall event resource");
    }
    if (!isInstalledDefinitionCallCandidate(detachedCandidate)) {
        return refusal("invalid_definition_call", "transport input is not one canonical DefinitionCall");
    }
    if (!acquisitionMatches(detachedAcquisition, detachedCandidate)) {
        return refusal("acquisition_mismatch", "top-level acquisition differs from the DefinitionCall event resource");
    }
    return invokeInstalledDefinitionCall(detachedAcquisition.kind, detachedCandidate);
}
/** Thin native carrier: semantic data is detached, while the exact owner-issued
 * physical selection survives. The same installed callable admits and executes it. */
export async function runInstalledDefinitionCallWithResource(resource, candidate) {
    if (!abg.isAcquiredAbgEventResourceSelection(resource) ||
        !isInstalledDefinitionCallCandidate(candidate) || !isRecord(candidate.resources)) {
        return refusal("acquisition_mismatch", "native call requires its actual owner-issued event-resource selection");
    }
    const authority = candidate.resources.admissionAuthority;
    const basis = isRecord(authority) ? authority.basis : null;
    const environment = isRecord(basis) ? basis.boundEnvironment : null;
    const boundToSelection = isRecord(environment) && sameStructure(environment.prefix, resource.prefix);
    const hasEventResource = Object.hasOwn(candidate.resources, "eventResource");
    if (hasEventResource ? candidate.resources.eventResource !== resource : !boundToSelection) {
        return refusal("acquisition_mismatch", "native call resources differ from the explicit acquired prefix");
    }
    try {
        abg.assertAcquiredAbgEventResourceSelectionCurrent(resource);
    }
    catch (cause) {
        return refusal("acquisition_mismatch", String(cause));
    }
    let detached;
    try {
        const { eventResource: _resource, ...resources } = candidate.resources;
        const data = detachDefinitionCall({ invocation: candidate.invocation, resources });
        // An eventless bound operation carries the same explicit entry selection in
        // its existing admission basis. Preserve physical prefix correspondence,
        // never a caller-derived environment body or a semantic default.
        if (boundToSelection) {
            const detachedAuthority = data.resources.admissionAuthority;
            const detachedBasis = detachedAuthority.basis;
            const detachedEnvironment = detachedBasis.boundEnvironment;
            detachedEnvironment.prefix = resource.prefix;
        }
        detached = { invocation: data.invocation,
            resources: hasEventResource ? { ...data.resources, eventResource: resource } : data.resources };
    }
    catch {
        return refusal("invalid_definition_call", "native call semantic data is not one canonical DefinitionCall");
    }
    return invokeInstalledDefinitionCall("acquired", detached);
}
async function invokeInstalledDefinitionCall(acquisitionKind, call) {
    const selected = selectedCallable(call, acquisitionKind);
    if ("kind" in selected)
        return selected;
    const receipt = await runExactDefinition(call, selected.callable(call));
    // The native fixed owner admits the complete call before its effects. Some
    // direct owners first reject resource structure, while Product's authority
    // wrapper reports its call check as a resource relation fault. Only those
    // ambiguous admission failures need the compatibility check. Execution
    // faults and successful progression retain their actual owner receipt.
    const fault = receipt.failure?.fault;
    const ambiguousAdmission = fault?.stage === "resource_admission" && (fault.code === "invalid_resource_assertion" ||
        fault.code === "resource_relation_mismatch" &&
            fault.message === "TypeError: definition call differs from its fixed owner");
    if (acquisitionKind === "acquired" && (fault?.code === "call_identity_mismatch" ||
        ambiguousAdmission && admitExactDefinitionCall(call, selected.declaration) === null)) {
        return refusal("invalid_definition_call", "DefinitionCall differs from its exact installed invocation contract");
    }
    return Object.freeze({
        kind: "installed_definition_call_transport_result",
        schemaVersion: "5.0.0",
        acquisitionKind,
        receipt,
    });
}
