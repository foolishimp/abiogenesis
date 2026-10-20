import { isRecord, hasNulJoinedKeys as hasExactKeys, isNonblankString as nonEmptyString } from "../shared/admission_predicates.js";
import { isRawAdmittedValue, } from "../validator/raw_admission.js";
import { canonicalJson, compareUnicodeCodeUnits, } from "../shared/canonical_json.js";
import { lookupGraphFunction, } from "./catalog.js";
import { isSha256Digest, sha256Canonical, } from "../shared/digests.js";
import { isWorkspaceAuthorityBasis, } from "./environment.js";
import { deepFreeze } from "../shared/immutable.js";
import { admitRuntimeContract, publicContractCoordinateSchema, } from "../shared/public_function_contracts.js";
import { selectIntrinsicPublicFunctionDefinition, } from "../shared/public_function_family.js";
export const DIRECT_INVOKE_CAPABILITY = "abg.capability.catalog.invoke-graph-function@5";
import { isCapabilityDefinitionGraph, } from "../shared/capability_contracts.js";
import { validateAdmissionCapabilityBasis, } from "./admission_authority.js";
function identity(prefix, digest) {
    return `${prefix}/${digest.slice("sha256:".length)}`;
}
function uniqueStrings(value) {
    return Array.isArray(value) &&
        value.every(nonEmptyString) &&
        new Set(value).size === value.length;
}
export function isInvocationPolicyBasis(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "allowedComputeRegimes",
            "authorityBasisDigest",
            "authorityBasisId",
            "authorityMode",
            "authorizedActorRef",
            "catalogApplicationDigests",
            "catalogApplicationRefs",
            "graphMaterialization",
            "interactionCapabilities",
            "kind",
            "policyDigest",
            "policyRef",
            "programDigest",
            "programRef",
            "schemaVersion",
            "workspaceBindingDigest",
            "workspaceBindingId",
        ]) ||
        value.kind !== "invocation_policy_basis" ||
        value.schemaVersion !== "5.0.0" ||
        value.authorityMode !== "trusted_developer" ||
        !nonEmptyString(value.policyRef) ||
        !isSha256Digest(value.policyDigest) ||
        !nonEmptyString(value.authorityBasisId) ||
        !isSha256Digest(value.authorityBasisDigest) ||
        !nonEmptyString(value.authorizedActorRef) ||
        !nonEmptyString(value.workspaceBindingId) ||
        !isSha256Digest(value.workspaceBindingDigest) ||
        !nonEmptyString(value.programRef) ||
        !isSha256Digest(value.programDigest) ||
        !Array.isArray(value.allowedComputeRegimes) ||
        value.allowedComputeRegimes.length === 0 ||
        value.allowedComputeRegimes.some((regime) => regime !== "F_D" && regime !== "F_P" && regime !== "F_H") ||
        value.allowedComputeRegimes.join("\0") !==
            ["F_D", "F_P", "F_H"]
                .filter((regime) => value.allowedComputeRegimes.includes(regime))
                .join("\0") ||
        !Array.isArray(value.interactionCapabilities) ||
        value.interactionCapabilities.some((row) => !isRecord(row) ||
            !hasExactKeys(row, [
                "actorCapabilityRef",
                "requirementKey",
                "requirementKeyDigest",
            ]) ||
            !nonEmptyString(row.requirementKey) ||
            !isSha256Digest(row.requirementKeyDigest) ||
            !nonEmptyString(row.actorCapabilityRef)) ||
        new Set(value.interactionCapabilities.map((row) => row.requirementKey)).size !== value.interactionCapabilities.length ||
        value.interactionCapabilities.map((row) => row.requirementKey).join("\0") !== [...value.interactionCapabilities]
            .map((row) => row.requirementKey)
            .sort(compareUnicodeCodeUnits)
            .join("\0") ||
        !uniqueStrings(value.catalogApplicationRefs) ||
        value.catalogApplicationRefs.join("\0") !==
            [...value.catalogApplicationRefs]
                .sort(compareUnicodeCodeUnits)
                .join("\0") ||
        !Array.isArray(value.catalogApplicationDigests) ||
        value.catalogApplicationDigests.length !==
            value.catalogApplicationRefs.length ||
        value.catalogApplicationDigests.some((digest) => !isSha256Digest(digest)) ||
        value.graphMaterialization !== "after_invocation_admission") {
        return false;
    }
    const { kind: _kind, schemaVersion: _schemaVersion, policyRef, policyDigest, ...body } = value;
    const digest = sha256Canonical(body);
    return policyDigest === digest &&
        policyRef === identity("invocation-policy://abiogenesis/root", digest);
}
export function isCapabilityGrant(value) {
    return isCapabilityGrantValue(value);
}
export function isInvocationAuthority(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "actorRef",
            "authorityDigest",
            "authorityRef",
            "capabilityGrantRefs",
            "catalogBasisDigest",
            "catalogHandle",
            "catalogViewDigest",
            "graphFunctionRef",
            "kind",
            "operationId",
            "policyDigest",
            "policyRef",
            "programRef",
            "selectedDefinitionDigest",
            "selectedDefinitionRef",
            "schemaVersion",
            "workspaceBindingDigest",
            "workspaceBindingId",
        ]) ||
        value.kind !== "invocation_authority" ||
        value.schemaVersion !== "5.0.0" ||
        value.operationId !== "abg.operation.run.invoke" ||
        !nonEmptyString(value.authorityRef) ||
        !isSha256Digest(value.authorityDigest) ||
        !nonEmptyString(value.actorRef) ||
        !nonEmptyString(value.workspaceBindingId) ||
        !isSha256Digest(value.workspaceBindingDigest) ||
        !isSha256Digest(value.catalogBasisDigest) ||
        !isSha256Digest(value.catalogViewDigest) ||
        !nonEmptyString(value.programRef) ||
        !nonEmptyString(value.catalogHandle) ||
        !nonEmptyString(value.selectedDefinitionRef) ||
        !isSha256Digest(value.selectedDefinitionDigest) ||
        !nonEmptyString(value.graphFunctionRef) ||
        !nonEmptyString(value.policyRef) ||
        !isSha256Digest(value.policyDigest) ||
        !uniqueStrings(value.capabilityGrantRefs)) {
        return false;
    }
    const { kind: _kind, schemaVersion: _schemaVersion, authorityRef, authorityDigest, ...body } = value;
    const digest = sha256Canonical(body);
    return authorityDigest === digest &&
        authorityRef === identity("invocation-authority://abiogenesis", digest);
}
export function isPublicInvocationCandidate(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "actorAttributionRef",
            "capabilityGrantDigests",
            "capabilityGrantRefs",
            "catalogBasisDigest",
            "catalogHandle",
            "catalogViewDigest",
            "disposition",
            "graphFunctionDigest",
            "graphFunctionRef",
            "inputContractRef",
            "invocationAuthorityDigest",
            "invocationAuthorityRef",
            "invocationDigest",
            "invocationRef",
            "kind",
            "operationId",
            "outputContractRef",
            "programDigest",
            "programRef",
            "publicFunctionDefinitionDigest",
            "publicFunctionDefinitionRef",
            "publicRequestAdmissionRef",
            "publicRequestDigest",
            "publicRequestInvocationRef",
            "rawInputAdmissionRef",
            "rawInputDigest",
            "schemaVersion",
            "selectedDefinitionDigest",
            "selectedDefinitionRef",
            "sessionPolicyDigest",
            "sessionPolicyRef",
            "variant",
            "workspaceBindingDigest",
            "workspaceBindingId",
        ]) ||
        value.kind !== "public_invocation_candidate" ||
        value.schemaVersion !== "5.0.0" ||
        value.disposition !== "candidate" ||
        value.operationId !== "abg.operation.run.invoke" ||
        (value.variant !== "direct" && value.variant !== "start") ||
        !nonEmptyString(value.invocationRef) ||
        !isSha256Digest(value.invocationDigest) ||
        !nonEmptyString(value.publicFunctionDefinitionRef) ||
        !isSha256Digest(value.publicFunctionDefinitionDigest) ||
        !nonEmptyString(value.workspaceBindingId) ||
        !isSha256Digest(value.workspaceBindingDigest) ||
        !isSha256Digest(value.catalogBasisDigest) ||
        !isSha256Digest(value.catalogViewDigest) ||
        !nonEmptyString(value.programRef) ||
        !isSha256Digest(value.programDigest) ||
        !nonEmptyString(value.catalogHandle) ||
        !nonEmptyString(value.selectedDefinitionRef) ||
        !isSha256Digest(value.selectedDefinitionDigest) ||
        !nonEmptyString(value.graphFunctionRef) ||
        !isSha256Digest(value.graphFunctionDigest) ||
        !nonEmptyString(value.inputContractRef) ||
        !nonEmptyString(value.outputContractRef) ||
        !nonEmptyString(value.rawInputAdmissionRef) ||
        !isSha256Digest(value.rawInputDigest) ||
        !nonEmptyString(value.publicRequestAdmissionRef) ||
        !isSha256Digest(value.publicRequestDigest) ||
        !nonEmptyString(value.publicRequestInvocationRef) ||
        !nonEmptyString(value.sessionPolicyRef) ||
        !isSha256Digest(value.sessionPolicyDigest) ||
        !uniqueStrings(value.capabilityGrantRefs) ||
        !Array.isArray(value.capabilityGrantDigests) ||
        value.capabilityGrantDigests.length !== value.capabilityGrantRefs.length ||
        value.capabilityGrantDigests.some((digest) => !isSha256Digest(digest)) ||
        !nonEmptyString(value.invocationAuthorityRef) ||
        !isSha256Digest(value.invocationAuthorityDigest) ||
        !nonEmptyString(value.actorAttributionRef)) {
        return false;
    }
    const expectedDefinitionDigest = sha256Canonical({
        operationId: "abg.operation.run.invoke",
        variant: value.variant,
        schemaVersion: "5.0.0",
    });
    const { kind: _kind, schemaVersion: _schemaVersion, disposition: _disposition, invocationRef, invocationDigest, ...body } = value;
    const digest = sha256Canonical(body);
    return value.publicFunctionDefinitionDigest === expectedDefinitionDigest &&
        value.publicFunctionDefinitionRef ===
            `public-function://abiogenesis/run.invoke/${value.variant}@5` &&
        invocationDigest === digest &&
        invocationRef === identity("invocation://abiogenesis", digest);
}
function refusal(code, message) {
    return {
        kind: "invocation_construction_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code,
        message,
    };
}
export function constructRootInvocationPolicy(workspaceBinding, program, interactionCapabilities, allowedComputeRegimes = ["F_D"], catalogApplications = []) {
    const canonicalOrder = ["F_D", "F_P", "F_H"];
    const canonicalRegimes = canonicalOrder.filter((regime) => allowedComputeRegimes.includes(regime));
    const canonicalInteractions = [...interactionCapabilities].sort((left, right) => compareUnicodeCodeUnits(left.requirementKey, right.requirementKey));
    const canonicalApplications = [...catalogApplications].sort((left, right) => compareUnicodeCodeUnits(left.applicationRef, right.applicationRef));
    if (canonicalRegimes.length === 0 ||
        canonicalRegimes.length !== allowedComputeRegimes.length ||
        canonicalRegimes.some((regime, index) => regime !== allowedComputeRegimes[index]) ||
        workspaceBinding.authorityBasisId.length === 0 ||
        workspaceBinding.authorityBasisDigest.length === 0 ||
        workspaceBinding.authorizedActorRef.length === 0 ||
        workspaceBinding.bindingId.length === 0 ||
        workspaceBinding.bindingDigest.length === 0 ||
        program.programRef.length === 0 ||
        new Set(canonicalInteractions.map((row) => row.requirementKey)).size !==
            canonicalInteractions.length ||
        canonicalInteractions.some((row) => row.requirementKey.length === 0 ||
            row.requirementKeyDigest.length === 0 ||
            row.actorCapabilityRef.length === 0) ||
        new Set(canonicalApplications.map((row) => row.applicationRef)).size !==
            canonicalApplications.length) {
        throw new TypeError("invocation policy requires one exact workspace, Program, compute-regime set, and interaction requirement set");
    }
    const body = {
        authorityMode: "trusted_developer",
        authorityBasisId: workspaceBinding.authorityBasisId,
        authorityBasisDigest: workspaceBinding.authorityBasisDigest,
        authorizedActorRef: workspaceBinding.authorizedActorRef,
        workspaceBindingId: workspaceBinding.bindingId,
        workspaceBindingDigest: workspaceBinding.bindingDigest,
        programRef: program.programRef,
        programDigest: sha256Canonical(program),
        allowedComputeRegimes: canonicalRegimes,
        interactionCapabilities: canonicalInteractions,
        catalogApplicationRefs: canonicalApplications.map((application) => application.applicationRef),
        catalogApplicationDigests: canonicalApplications.map((application) => application.applicationDigest),
        graphMaterialization: "after_invocation_admission",
    };
    const policyDigest = sha256Canonical(body);
    const value = deepFreeze({
        kind: "invocation_policy_basis",
        schemaVersion: "5.0.0",
        policyRef: identity("invocation-policy://abiogenesis/root", policyDigest),
        policyDigest,
        ...body,
    });
    return value;
}
export function isCapabilityGrantValue(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "actorRef",
            "approvalDigest",
            "approvalRef",
            "authorityBasisDigest",
            "authorityBasisRef",
            "capabilityDefinition",
            "capabilityRef",
            "definitionDigest",
            "definitionKey",
            "definitionRef",
            "grantDigest",
            "grantRef",
            "kind",
            "operationContract",
            "operationId",
            "policyDigest",
            "policyRef",
            "schemaVersion",
            "scopeDigest",
            "scopeRef",
        ]) ||
        value.kind !== "capability_grant" ||
        value.schemaVersion !== "5.0.0" ||
        !nonEmptyString(value.grantRef) ||
        !isSha256Digest(value.grantDigest) ||
        !nonEmptyString(value.actorRef) ||
        !isRecord(value.definitionKey) ||
        !hasExactKeys(value.definitionKey, ["memberKey", "operationId"]) ||
        !nonEmptyString(value.definitionKey.operationId) ||
        !nonEmptyString(value.definitionKey.memberKey) ||
        !nonEmptyString(value.definitionRef) ||
        !isSha256Digest(value.definitionDigest) ||
        !isRecord(value.capabilityDefinition) ||
        !hasExactKeys(value.capabilityDefinition, [
            "capabilityDefinitionDigest",
            "capabilityDefinitionRef",
            "capabilityId",
            "graphDigest",
            "graphId",
            "graphVersion",
        ]) ||
        !nonEmptyString(value.capabilityDefinition.graphId) ||
        value.capabilityDefinition.graphVersion !== "5.0.0" ||
        !isSha256Digest(value.capabilityDefinition.graphDigest) ||
        !nonEmptyString(value.capabilityDefinition.capabilityId) ||
        !nonEmptyString(value.capabilityDefinition.capabilityDefinitionRef) ||
        !isSha256Digest(value.capabilityDefinition.capabilityDefinitionDigest) ||
        !isRecord(value.operationContract) ||
        admitRuntimeContract(publicContractCoordinateSchema, value.operationContract)
            .disposition !== "admitted" ||
        value.operationId !== value.definitionKey.operationId ||
        !nonEmptyString(value.capabilityRef) ||
        !nonEmptyString(value.approvalRef) ||
        !isSha256Digest(value.approvalDigest) ||
        !nonEmptyString(value.policyRef) ||
        !isSha256Digest(value.policyDigest) ||
        !nonEmptyString(value.scopeRef) ||
        !isSha256Digest(value.scopeDigest) ||
        !nonEmptyString(value.authorityBasisRef) ||
        !isSha256Digest(value.authorityBasisDigest)) {
        return false;
    }
    const body = {
        definitionKey: value.definitionKey,
        definitionRef: value.definitionRef,
        definitionDigest: value.definitionDigest,
        capabilityDefinition: value.capabilityDefinition,
        operationContract: value.operationContract,
        operationId: value.operationId,
        capabilityRef: value.capabilityRef,
        actorRef: value.actorRef,
        approvalRef: value.approvalRef,
        approvalDigest: value.approvalDigest,
        policyRef: value.policyRef,
        policyDigest: value.policyDigest,
        scopeRef: value.scopeRef,
        scopeDigest: value.scopeDigest,
        authorityBasisRef: value.authorityBasisRef,
        authorityBasisDigest: value.authorityBasisDigest,
    };
    const digest = sha256Canonical(body);
    return (value.grantDigest === digest &&
        value.grantRef === identity("capability-grant://abiogenesis", digest));
}
function exactIntrinsicDefinition(basis) {
    const definition = selectIntrinsicPublicFunctionDefinition(basis.fixedPacket.definitionKey);
    if (definition === null ||
        definition.semanticAuthorityRef !== basis.fixedPacket.owner.authorityRef ||
        definition.semanticAuthorityDigest !==
            basis.fixedPacket.owner.authorityDigest ||
        definition.requestContract.contractId !==
            basis.fixedPacket.contractIds.request ||
        definition.resultContract.contractId !==
            basis.fixedPacket.contractIds.result ||
        definition.refusalContract.contractId !==
            basis.fixedPacket.contractIds.refusal ||
        (definition.nonTerminalContract?.contractId ?? null) !==
            basis.fixedPacket.contractIds.nonTerminal) {
        throw new TypeError("capability grant requires the selected intrinsic definition and fixed owner packet");
    }
    return definition;
}
function selectedCapabilityOwner(admittedInstalls, definition, capabilityRef) {
    const expectedSlots = [
        "request",
        "result",
        "refusal",
        ...(definition.nonTerminalContract === null
            ? []
            : ["non_terminal"]),
    ];
    const owners = admittedInstalls.flatMap((install) => {
        const graph = install.capabilityDefinitionGraph;
        if (!isCapabilityDefinitionGraph(graph))
            return [];
        const rows = graph.rows.filter((candidate) => candidate.capabilityId === capabilityRef);
        if (rows.length !== 1)
            return [];
        const row = rows[0];
        const exactCatalog = {
            productId: install.productId,
            productContentDigest: install.productContentDigest,
            catalogId: install.catalogId,
            catalogVersion: "5.0.0",
            catalogDigest: install.catalogDigest,
        };
        if (row.owningPublicContracts.some((coordinate) => canonicalJson(coordinate.contractCatalog) !==
            canonicalJson(exactCatalog)))
            return [];
        const coordinates = row.owningPublicContracts;
        const definitionCoordinates = coordinates.filter((coordinate) => coordinate.nestedSelector.selectorKind === "operation_definition_slot" &&
            coordinate.nestedSelector.definitionKey.operationId ===
                definition.definitionKey.operationId &&
            coordinate.nestedSelector.definitionKey.memberKey ===
                definition.definitionKey.memberKey);
        const catalogContracts = install.publicContracts.filter((contract) => contract.contractId === definition.definitionKey.operationId);
        if (definitionCoordinates.length !== expectedSlots.length ||
            catalogContracts.length !== 1)
            return [];
        const catalogContract = catalogContracts[0];
        const operationContract = {
            contractCatalog: exactCatalog,
            flatRow: {
                contractId: catalogContract.contractId,
                contractVersion: catalogContract.contractVersion,
                contractDigest: catalogContract.contractDigest,
            },
            nestedSelector: {
                selectorKind: "flat_contract",
                definitionKey: null,
                slot: null,
                definitionRef: null,
            },
        };
        if (admitRuntimeContract(publicContractCoordinateSchema, operationContract)
            .disposition !== "admitted")
            return [];
        const explicitOperationContracts = coordinates.filter((coordinate) => coordinate.nestedSelector.selectorKind === "flat_contract" &&
            coordinate.flatRow.contractId === definition.definitionKey.operationId);
        if (explicitOperationContracts.length > 1 ||
            explicitOperationContracts.some((coordinate) => canonicalJson(coordinate) !==
                canonicalJson(operationContract)))
            return [];
        const exactSlots = expectedSlots.every((slot) => definitionCoordinates.filter((coordinate) => coordinate.nestedSelector.selectorKind ===
            "operation_definition_slot" &&
            coordinate.nestedSelector.slot === slot &&
            canonicalJson(coordinate.flatRow) ===
                canonicalJson(operationContract.flatRow) &&
            admitRuntimeContract(publicContractCoordinateSchema, coordinate)
                .disposition === "admitted").length === 1);
        return exactSlots ? [{ graph, operationContract, row }] : [];
    });
    if (owners.length !== 1) {
        throw new TypeError("capability grant requires one unambiguous installed Product owner");
    }
    return owners[0];
}
export function constructCapabilityGrant(policy, actorRef, operationId = "abg.operation.run.invoke", capabilityRef = DIRECT_INVOKE_CAPABILITY, basis) {
    if (policy.kind === "resolved_admission_authority") {
        if (basis === undefined || !("kind" in basis) || operationId !== basis.fixedPacket.definitionKey.operationId) {
            throw new TypeError("admission grant requires the native fixed owner and data basis");
        }
        return constructAdmissionGrant(policy, actorRef, capabilityRef, basis);
    }
    if (basis !== undefined && "kind" in basis) {
        throw new TypeError("invocation grant cannot consume an admission authority basis");
    }
    return constructInvocationCapabilityGrant(policy, actorRef, operationId, capabilityRef, basis);
}
function closeCapabilityDependencies(graph, capabilityRef) {
    const graphRows = new Map(graph.rows.map((row) => [row.capabilityId, row]));
    const closed = new Set();
    const close = (id) => {
        if (closed.has(id))
            return;
        const row = graphRows.get(id);
        if (row === undefined)
            throw new TypeError("capability dependency is absent from installed graph");
        closed.add(id);
        for (const dependency of row.dependentCapabilities) {
            const installed = graphRows.get(dependency.capabilityId);
            if (installed === undefined || installed.capabilityDefinitionRef !== dependency.capabilityDefinitionRef ||
                installed.capabilityDefinitionDigest !== dependency.capabilityDefinitionDigest) {
                throw new TypeError("capability dependency coordinate is crossed");
            }
            close(dependency.capabilityId);
        }
    };
    close(capabilityRef);
}
async function constructAdmissionGrant(policy, actorRef, capabilityRef, basis) {
    const admitted = await validateAdmissionCapabilityBasis(policy, actorRef, capabilityRef, basis);
    return admissionGrantFromBasis(actorRef, capabilityRef, basis, admitted);
}
/** One fixed definition call validates its shared basis once for all capabilities. */
export async function constructAdmissionCapabilityGrants(policy, actorRef, basis, resource) {
    const capabilityRefs = basis.fixedPacket.metadata.capabilityRefs;
    if (capabilityRefs.length === 0)
        throw new TypeError("admission definition requires declared capabilities");
    const admitted = await validateAdmissionCapabilityBasis(policy, actorRef, capabilityRefs[0], basis, resource);
    return { grants: capabilityRefs.map(capabilityRef => admissionGrantFromBasis(actorRef, capabilityRef, basis, admitted)), data: admitted.data, boundEnvironment: admitted.boundEnvironment };
}
function admissionGrantFromBasis(actorRef, capabilityRef, basis, admitted) {
    const definition = exactIntrinsicDefinition(basis);
    const { data, authority, scope } = admitted;
    if (data.definition.definitionRef !== definition.definitionRef ||
        data.definition.definitionDigest !== definition.definitionDigest) {
        throw new TypeError("admission definition coordinate differs from the installed fixed packet");
    }
    const { graph, operationContract, row } = selectedCapabilityOwner(admitted.boundEnvironment?.productInstalls ?? [data.ownerArtifact.verified], definition, capabilityRef);
    closeCapabilityDependencies(graph, capabilityRef);
    const body = {
        definitionKey: definition.definitionKey,
        definitionRef: definition.definitionRef,
        definitionDigest: definition.definitionDigest,
        capabilityDefinition: {
            graphId: graph.graphId, graphVersion: graph.graphVersion, graphDigest: graph.graphDigest,
            capabilityId: row.capabilityId, capabilityDefinitionRef: row.capabilityDefinitionRef,
            capabilityDefinitionDigest: row.capabilityDefinitionDigest,
        },
        operationContract,
        operationId: basis.fixedPacket.definitionKey.operationId,
        capabilityRef, actorRef,
        approvalRef: authority.approval.ref, approvalDigest: authority.approval.digest,
        policyRef: authority.approval.ref, policyDigest: authority.approval.digest,
        scopeRef: scope.ref, scopeDigest: scope.digest,
        authorityBasisRef: authority.authority.ref, authorityBasisDigest: authority.authority.digest,
    };
    const grantDigest = sha256Canonical(body);
    return deepFreeze({ kind: "capability_grant", schemaVersion: "5.0.0",
        grantRef: identity("capability-grant://abiogenesis", grantDigest), grantDigest, ...body });
}
function constructInvocationCapabilityGrant(policy, actorRef, operationId = "abg.operation.run.invoke", capabilityRef = DIRECT_INVOKE_CAPABILITY, basis) {
    const invocationPolicy = isInvocationPolicyBasis(policy) ? policy : null;
    const workspaceAuthority = isWorkspaceAuthorityBasis(policy) ? policy : null;
    const workspaceRead = operationId === "abg.operation.project.read";
    const invocationOperation = [
        "abg.operation.interaction.respond",
        "abg.operation.run.continue",
        "abg.operation.run.invoke",
    ].includes(operationId);
    if ((invocationPolicy === null && workspaceAuthority === null) ||
        (!workspaceRead && !invocationOperation) ||
        (workspaceRead
            ? workspaceAuthority === null
            : invocationPolicy === null) ||
        basis === undefined ||
        actorRef.length === 0 ||
        actorRef !== policy.authorizedActorRef ||
        actorRef !== basis.workspaceBinding.authorizedActorRef ||
        policy.authorityBasisId !== basis.workspaceBinding.authorityBasisId ||
        policy.authorityBasisDigest !== basis.workspaceBinding.authorityBasisDigest ||
        (invocationPolicy !== null
            ? invocationPolicy.workspaceBindingId !== basis.workspaceBinding.bindingId ||
                invocationPolicy.workspaceBindingDigest !==
                    basis.workspaceBinding.bindingDigest
            : workspaceAuthority.workspaceId !== basis.workspaceBinding.workspaceId) ||
        capabilityRef.length === 0 ||
        operationId !== basis.fixedPacket.definitionKey.operationId) {
        throw new TypeError("capability grant requires exact workspace, policy, actor, and definition authority");
    }
    const definition = exactIntrinsicDefinition(basis);
    const { graph, operationContract, row: capabilityRow } = selectedCapabilityOwner(basis.admittedInstalls, definition, capabilityRef);
    closeCapabilityDependencies(graph, capabilityRef);
    const capabilityDefinition = deepFreeze({
        graphId: graph.graphId,
        graphVersion: graph.graphVersion,
        graphDigest: graph.graphDigest,
        capabilityId: capabilityRow.capabilityId,
        capabilityDefinitionRef: capabilityRow.capabilityDefinitionRef,
        capabilityDefinitionDigest: capabilityRow.capabilityDefinitionDigest,
    });
    const body = {
        definitionKey: deepFreeze({ ...definition.definitionKey }),
        definitionRef: definition.definitionRef,
        definitionDigest: definition.definitionDigest,
        capabilityDefinition,
        operationContract,
        operationId,
        capabilityRef,
        actorRef,
        approvalRef: basis.workspaceBinding.authorityBasisId,
        approvalDigest: basis.workspaceBinding.authorityBasisDigest,
        policyRef: invocationPolicy?.policyRef ?? workspaceAuthority.authorityBasisId,
        policyDigest: invocationPolicy?.policyDigest ?? workspaceAuthority.authorityBasisDigest,
        scopeRef: basis.workspaceBinding.bindingId,
        scopeDigest: basis.workspaceBinding.bindingDigest,
        authorityBasisRef: basis.workspaceBinding.authorityBasisId,
        authorityBasisDigest: basis.workspaceBinding.authorityBasisDigest,
    };
    const grantDigest = sha256Canonical(body);
    const value = deepFreeze({
        kind: "capability_grant",
        schemaVersion: "5.0.0",
        grantRef: identity("capability-grant://abiogenesis", grantDigest),
        grantDigest,
        ...body,
    });
    return value;
}
export function validateCapabilityGrantForProductBasis(grant, policy, actorRef, capabilityRef, basis) {
    if (!isCapabilityGrantValue(grant))
        return false;
    try {
        const expected = constructCapabilityGrant(policy, actorRef, basis.fixedPacket.definitionKey.operationId, capabilityRef, basis);
        return canonicalJson(grant) ===
            canonicalJson(expected);
    }
    catch {
        return false;
    }
}
export function constructInvocationAuthority(actorRef, workspaceBinding, catalogView, programRef, selectedRow, policy, capabilityGrants, capabilityGrantBasis) {
    const exactSelectedRow = lookupGraphFunction(catalogView, selectedRow.handle);
    if (!isInvocationPolicyBasis(policy) ||
        actorRef !== policy.authorizedActorRef ||
        capabilityGrants.length === 0 ||
        new Set(capabilityGrants.map((grant) => grant.grantRef)).size !==
            capabilityGrants.length ||
        capabilityGrantBasis === undefined ||
        capabilityGrants.length !== 1 ||
        !validateCapabilityGrantForProductBasis(capabilityGrants[0], policy, actorRef, DIRECT_INVOKE_CAPABILITY, capabilityGrantBasis)) {
        return refusal("capability_mismatch", "invocation authority requires unique actor-scoped grants including run.invoke");
    }
    if (exactSelectedRow === null ||
        sha256Canonical(exactSelectedRow) !==
            sha256Canonical(selectedRow) ||
        selectedRow.definitionRef !== selectedRow.definition.name ||
        selectedRow.definitionDigest !==
            sha256Canonical(selectedRow.definition) ||
        !selectedRow.programMembershipRefs.includes(programRef)) {
        return refusal("authority_mismatch", "invocation authority requires one exact selected catalog definition in the Program");
    }
    const body = {
        actorRef,
        operationId: "abg.operation.run.invoke",
        workspaceBindingId: workspaceBinding.bindingId,
        workspaceBindingDigest: workspaceBinding.bindingDigest,
        catalogBasisDigest: catalogView.catalogBasisDigest,
        catalogViewDigest: catalogView.viewDigest,
        programRef,
        catalogHandle: selectedRow.handle,
        selectedDefinitionRef: selectedRow.definitionRef,
        selectedDefinitionDigest: selectedRow.definitionDigest,
        graphFunctionRef: selectedRow.definitionRef,
        policyRef: policy.policyRef,
        policyDigest: policy.policyDigest,
        capabilityGrantRefs: capabilityGrants.map((grant) => grant.grantRef),
    };
    const authorityDigest = sha256Canonical(body);
    const value = deepFreeze({
        kind: "invocation_authority",
        schemaVersion: "5.0.0",
        authorityRef: identity("invocation-authority://abiogenesis", authorityDigest),
        authorityDigest,
        ...body,
    });
    return value;
}
function constructInvocation(variant, workspaceBinding, catalogView, program, selectedRow, publicRequest, rawInput, policy, capabilityGrants, authority) {
    const exactSelectedRow = lookupGraphFunction(catalogView, selectedRow.handle);
    const graphFunction = selectedRow.definition;
    if (!isInvocationPolicyBasis(policy) ||
        capabilityGrants.some((grant) => !isCapabilityGrant(grant))) {
        return refusal("capability_mismatch", "invocation policy or capability grant is not Product-constructed");
    }
    if (variant === "direct" &&
        program.policies["abg.root_mode"] === "supervised") {
        return refusal("authority_mismatch", "a supervised Program may be entered only through public start selection");
    }
    if (!isInvocationAuthority(authority) ||
        authority.workspaceBindingId !== workspaceBinding.bindingId ||
        authority.workspaceBindingDigest !== workspaceBinding.bindingDigest ||
        authority.catalogBasisDigest !== catalogView.catalogBasisDigest ||
        authority.catalogViewDigest !== catalogView.viewDigest ||
        authority.programRef !== program.programRef ||
        exactSelectedRow === null ||
        sha256Canonical(exactSelectedRow) !==
            sha256Canonical(selectedRow) ||
        selectedRow.definitionRef !== graphFunction.name ||
        selectedRow.definitionDigest !==
            sha256Canonical(graphFunction) ||
        !selectedRow.programMembershipRefs.includes(program.programRef) ||
        !program.callableMembership.includes(selectedRow.definitionRef) ||
        authority.catalogHandle !== selectedRow.handle ||
        authority.selectedDefinitionRef !== selectedRow.definitionRef ||
        authority.selectedDefinitionDigest !== selectedRow.definitionDigest ||
        authority.graphFunctionRef !== selectedRow.definitionRef ||
        authority.policyRef !== policy.policyRef ||
        authority.policyDigest !== policy.policyDigest ||
        authority.capabilityGrantRefs.join("\0") !== capabilityGrants.map((grant) => grant.grantRef).join("\0")) {
        return refusal("authority_mismatch", "invocation authority differs from the selected environment or target");
    }
    const inputContractRef = graphFunction.inputs[0];
    const outputContractRef = graphFunction.outputs[0];
    if (graphFunction.inputs.length !== 1 ||
        graphFunction.outputs.length !== 1 ||
        inputContractRef === undefined ||
        outputContractRef === undefined ||
        rawInput.contractRef !== inputContractRef) {
        return refusal("contract_mismatch", "direct root invocation requires one exact input and output contract");
    }
    const publicFunctionDefinition = {
        operationId: "abg.operation.run.invoke",
        variant,
        schemaVersion: "5.0.0",
    };
    const publicFunctionDefinitionDigest = sha256Canonical(publicFunctionDefinition);
    const body = {
        operationId: "abg.operation.run.invoke",
        variant,
        publicFunctionDefinitionRef: `public-function://abiogenesis/run.invoke/${variant}@5`,
        publicFunctionDefinitionDigest,
        workspaceBindingId: workspaceBinding.bindingId,
        workspaceBindingDigest: workspaceBinding.bindingDigest,
        catalogBasisDigest: catalogView.catalogBasisDigest,
        catalogViewDigest: catalogView.viewDigest,
        programRef: program.programRef,
        programDigest: sha256Canonical(program),
        catalogHandle: selectedRow.handle,
        selectedDefinitionRef: selectedRow.definitionRef,
        selectedDefinitionDigest: selectedRow.definitionDigest,
        graphFunctionRef: selectedRow.definitionRef,
        graphFunctionDigest: selectedRow.definitionDigest,
        inputContractRef,
        outputContractRef,
        rawInputAdmissionRef: rawInput.admissionRef,
        rawInputDigest: rawInput.subjectDigest,
        publicRequestAdmissionRef: publicRequest.admissionRef,
        publicRequestDigest: publicRequest.subjectDigest,
        publicRequestInvocationRef: publicRequest.invocationRef,
        sessionPolicyRef: policy.policyRef,
        sessionPolicyDigest: policy.policyDigest,
        capabilityGrantRefs: capabilityGrants.map((grant) => grant.grantRef),
        capabilityGrantDigests: capabilityGrants.map((grant) => grant.grantDigest),
        invocationAuthorityRef: authority.authorityRef,
        invocationAuthorityDigest: authority.authorityDigest,
        actorAttributionRef: authority.actorRef,
    };
    const invocationDigest = sha256Canonical(body);
    const value = deepFreeze({
        kind: "public_invocation_candidate",
        schemaVersion: "5.0.0",
        disposition: "candidate",
        invocationRef: identity("invocation://abiogenesis", invocationDigest),
        invocationDigest,
        ...body,
    });
    return value;
}
export function constructDirectInvocation(workspaceBinding, catalogView, program, selectedRow, rawRequest, rawInput, policy, capabilityGrants, authority) {
    const request = rawRequest.value;
    if (!isRawAdmittedValue(rawRequest) ||
        rawRequest.subjectKind !== "public_operation_request" ||
        rawRequest.contractRef !== "contract://abiogenesis/public/run-invoke-request@5" ||
        !isRecord(request) ||
        request.operationId !== "abg.operation.run.invoke" ||
        request.variant !== "direct" ||
        typeof request.invocationRef !== "string" ||
        request.invocationRef.length === 0) {
        return refusal("authority_mismatch", "direct invocation requires one exact raw public request admission");
    }
    return constructInvocation("direct", workspaceBinding, catalogView, program, selectedRow, {
        admissionRef: rawRequest.admissionRef,
        subjectDigest: rawRequest.subjectDigest,
        invocationRef: request.invocationRef,
    }, rawInput, policy, capabilityGrants, authority);
}
export function constructStartInvocation(workspaceBinding, catalogView, program, selectedRow, rawRequest, rawInput, policy, capabilityGrants, authority) {
    const request = rawRequest.value;
    if (!isRawAdmittedValue(rawRequest) ||
        rawRequest.subjectKind !== "public_operation_request" ||
        rawRequest.contractRef !== "contract://abiogenesis/public/run-invoke-request@5" ||
        !isRecord(request) ||
        request.operationId !== "abg.operation.run.invoke" ||
        request.variant !== "start" ||
        typeof request.invocationRef !== "string" ||
        request.invocationRef.length === 0) {
        return refusal("authority_mismatch", "start invocation requires one exact raw public request admission");
    }
    return constructInvocation("start", workspaceBinding, catalogView, program, selectedRow, {
        admissionRef: rawRequest.admissionRef,
        subjectDigest: rawRequest.subjectDigest,
        invocationRef: request.invocationRef,
    }, rawInput, policy, capabilityGrants, authority);
}
/**
 * Native exact-family construction. This consumes the admitted definition
 * invocation directly and shares only Product's semantic construction atom;
 * it does not manufacture or translate a legacy Public request carrier.
 */
export function constructExactDirectInvocation(publicInvocation, workspaceBinding, catalogView, program, selectedRow, rawInput, policy, capabilityGrants, authority) {
    const request = publicInvocation.request;
    if (publicInvocation.kind !== "public_invocation" ||
        publicInvocation.schemaVersion !== "5.0.0" ||
        publicInvocation.definitionKey.operationId !==
            "abg.operation.run.invoke" ||
        publicInvocation.definitionKey.memberKey !== "invoke" ||
        publicInvocation.requestRef.length === 0 ||
        publicInvocation.invocationRef.length === 0 ||
        !isSha256Digest(publicInvocation.requestDigest) ||
        publicInvocation.requestDigest !==
            sha256Canonical(request) ||
        !isRecord(request.program) ||
        request.program.ref !== program.programRef ||
        request.catalogHandle !== selectedRow.handle ||
        !isRecord(request.inputContract) ||
        request.inputContract.ref !== rawInput.contractRef) {
        return refusal("authority_mismatch", "direct invocation requires one exact admitted definition request");
    }
    return constructInvocation("direct", workspaceBinding, catalogView, program, selectedRow, {
        admissionRef: publicInvocation.requestRef,
        subjectDigest: publicInvocation.requestDigest,
        invocationRef: publicInvocation.invocationRef,
    }, rawInput, policy, capabilityGrants, authority);
}
/** Native exact-family start construction; no legacy request is manufactured. */
export function constructExactStartInvocation(publicInvocation, workspaceBinding, catalogView, program, selectedRow, rawInput, policy, capabilityGrants, authority) {
    const request = publicInvocation.request;
    if (publicInvocation.kind !== "public_invocation" ||
        publicInvocation.schemaVersion !== "5.0.0" ||
        publicInvocation.definitionKey.operationId !== "abg.operation.run.invoke" ||
        publicInvocation.definitionKey.memberKey !== "start" ||
        publicInvocation.requestRef.length === 0 ||
        publicInvocation.invocationRef.length === 0 ||
        !isSha256Digest(publicInvocation.requestDigest) ||
        publicInvocation.requestDigest !==
            sha256Canonical(request) ||
        !isRecord(request.program) ||
        request.program.ref !== program.programRef ||
        !isRecord(request.input) ||
        !isRecord(request.input.contract) ||
        request.input.contract.ref !== rawInput.contractRef ||
        selectedRow.definitionRef.length === 0) {
        return refusal("authority_mismatch", "start invocation requires one exact admitted definition request");
    }
    return constructInvocation("start", workspaceBinding, catalogView, program, selectedRow, {
        admissionRef: publicInvocation.requestRef,
        subjectDigest: publicInvocation.requestDigest,
        invocationRef: publicInvocation.invocationRef,
    }, rawInput, policy, capabilityGrants, authority);
}
