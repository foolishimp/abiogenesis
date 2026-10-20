import { canonicalJson, compareUnicodeCodeUnits, } from "./canonical_json.js";
import { EXACT_OWNER_CONTRACT_KEY_SET_DIGEST, OWNER_CONTRACT_SOURCES, } from "./owner_contract_source_set.js";
import { sha256Canonical } from "./digests.js";
import { deepFreeze } from "./immutable.js";
const FAMILY_REQUIREMENT_AUTHORITY_REFS = Object.freeze([
    "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-009",
    "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-010",
]);
function publicDefinitionRef(definitionKey) {
    const operationPath = definitionKey.operationId
        .replace(/^abg\.operation\./u, "")
        .replaceAll(".", "/");
    return `public-function://abiogenesis/${operationPath}/${definitionKey.memberKey}@5`;
}
function sameCanonical(left, right) {
    return canonicalJson(left) === canonicalJson(right);
}
function contractReferenceProjection(binding) {
    const { schema: _schema, ...reference } = binding;
    return reference;
}
export function projectOwnerContractIdentity(binding) {
    const { schema: _schema, source: _source, ...identity } = binding;
    return identity;
}
function assertSourceAgreement(source) {
    const packet = source.packet;
    const bindings = source.contracts;
    const contracts = [
        ["request", packet.requestContract, bindings.request],
        ["result", packet.resultContract, bindings.result],
        ["refusal", packet.refusalContract, bindings.refusal],
        ...(packet.nonTerminalContract === null || bindings.nonTerminal === null
            ? []
            : [[
                    "non_terminal",
                    packet.nonTerminalContract,
                    bindings.nonTerminal,
                ]]),
    ];
    if ((packet.nonTerminalContract === null) !==
        (bindings.nonTerminal === null) ||
        contracts.some(([slot, contract, binding]) => contract.slot !== slot ||
            !sameCanonical(contract.definitionKey, packet.definitionKey) ||
            !sameCanonical(contract, contractReferenceProjection(binding)) ||
            !sameCanonical(contract.source, packet.metadata.source) ||
            contract.ownerAuthorityRef !== source.metadata.ownerAuthorityRef ||
            contract.ownerAuthorityDigest !== source.metadata.ownerAuthorityDigest) ||
        !sameCanonical(packet.executionBindingSpecification.definitionKey, packet.definitionKey) ||
        packet.executionBindingSpecification.semanticOwnerRef !==
            source.metadata.ownerAuthorityRef ||
        packet.executionBindingSpecification.callable.ownerAuthorityRef !==
            source.metadata.ownerAuthorityRef ||
        sha256Canonical(packet.executionBindingSpecification) !== packet.executionBindingSpecificationDigest) {
        throw new TypeError("owner contract packet identity, authority, or binding specification diverged");
    }
}
function schemaCoordinate(definitionKey, slot) {
    const operationSuffix = definitionKey.operationId.replace(/^abg\.operation\./u, "");
    const schemaSlot = slot === "non_terminal" ? "non-terminal" : slot;
    return deepFreeze({
        schemaId: `abg.schema.operation.${operationSuffix}.${schemaSlot}`,
        schemaVersion: "5.0.0",
        definitionRef: `#/definitions/${definitionKey.operationId}/` +
            `${definitionKey.memberKey}/${slot}`,
        nativeExport: "PUBLIC_OPERATION_SCHEMAS",
        nativeMemberPath: [
            definitionKey.operationId,
            definitionKey.memberKey,
            slot,
        ],
    });
}
function definitionFromSource(source) {
    assertSourceAgreement(source);
    const { packet, metadata } = source;
    const schemaCoordinates = deepFreeze({
        request: schemaCoordinate(packet.definitionKey, "request"),
        result: schemaCoordinate(packet.definitionKey, "result"),
        refusal: schemaCoordinate(packet.definitionKey, "refusal"),
        nonTerminal: packet.nonTerminalContract === null
            ? null
            : schemaCoordinate(packet.definitionKey, "non_terminal"),
    });
    const definitionFields = {
        definitionKey: packet.definitionKey,
        definitionRef: publicDefinitionRef(packet.definitionKey),
        version: "5.0.0",
        requestContract: source.contracts.request,
        resultContract: source.contracts.result,
        refusalContract: source.contracts.refusal,
        nonTerminalContract: source.contracts.nonTerminal,
        executionBindingSpecification: packet.executionBindingSpecification,
        executionBindingSpecificationDigest: packet.executionBindingSpecificationDigest,
        semanticAuthorityRef: metadata.ownerAuthorityRef,
        semanticAuthorityDigest: metadata.ownerAuthorityDigest,
        authorityClass: metadata.authorityClass,
        effectClass: metadata.effectClass,
        eventAdmission: metadata.eventAdmission,
        actorRequirement: metadata.actorRequirement,
        workspaceBindingRequirement: metadata.workspaceBindingRequirement,
        authoritySlotRequirements: metadata.authoritySlotRequirements,
        capabilityRefs: metadata.capabilityRefs,
        defaults: metadata.defaults,
        closedDomains: metadata.closedDomains,
        schemaCoordinates,
        sdkCoordinate: metadata.sdkCoordinate,
        cliCoordinate: metadata.cliCoordinate,
        adapterExitMap: metadata.adapterExitMap,
    };
    const digestProjection = deepFreeze({
        ...definitionFields,
        requestContract: projectOwnerContractIdentity(source.contracts.request),
        resultContract: projectOwnerContractIdentity(source.contracts.result),
        refusalContract: projectOwnerContractIdentity(source.contracts.refusal),
        nonTerminalContract: source.contracts.nonTerminal === null
            ? null
            : projectOwnerContractIdentity(source.contracts.nonTerminal),
    });
    return deepFreeze({
        ...definitionFields,
        definitionDigest: sha256Canonical(digestProjection),
    });
}
function familyDigestProjection(definitions) {
    return {
        operations: [...new Set(definitions.map((definition) => definition.definitionKey.operationId))].sort(compareUnicodeCodeUnits).map((operationId) => ({
            operationId,
            members: definitions
                .filter((definition) => definition.definitionKey.operationId === operationId)
                .map((definition) => ({
                memberKey: definition.definitionKey.memberKey,
                definitionDigest: definition.definitionDigest,
            })),
        })),
    };
}
function constructFamily() {
    const definitions = OWNER_CONTRACT_SOURCES.map(definitionFromSource);
    const familyDigest = sha256Canonical(familyDigestProjection(definitions));
    return deepFreeze({
        kind: "intrinsic_public_function_family",
        schemaVersion: "5.0.0",
        familyVersion: "5.0.0",
        familyRef: `public-function-family://abiogenesis/${familyDigest.slice("sha256:".length)}`,
        familyDigest,
        keySetDigest: EXACT_OWNER_CONTRACT_KEY_SET_DIGEST,
        requirementAuthorityRefs: FAMILY_REQUIREMENT_AUTHORITY_REFS,
        definitions,
    });
}
function operationPath(operationId) {
    return operationId.replace(/^abg\.operation\./u, "").replaceAll(".", "/");
}
function projectedSlot(binding, definitionIndex, fieldName) {
    return deepFreeze({
        identity: projectOwnerContractIdentity(binding),
        definitionRef: `#/definitions/${definitionIndex}/${fieldName}/identity`,
    });
}
function constructOperationProjection(family, operationId) {
    const operationDefinitions = family.definitions.filter((definition) => definition.definitionKey.operationId === operationId);
    const definitions = operationDefinitions.map((definition, index) => deepFreeze({
        definitionKey: definition.definitionKey,
        definitionRef: definition.definitionRef,
        definitionDigest: definition.definitionDigest,
        requestContract: projectedSlot(definition.requestContract, index, "requestContract"),
        resultContract: projectedSlot(definition.resultContract, index, "resultContract"),
        refusalContract: projectedSlot(definition.refusalContract, index, "refusalContract"),
        nonTerminalContract: definition.nonTerminalContract === null
            ? null
            : projectedSlot(definition.nonTerminalContract, index, "nonTerminalContract"),
        executionBindingSpecification: definition.executionBindingSpecification,
    }));
    const familyCoordinate = deepFreeze({
        requirementAuthorityRefs: family.requirementAuthorityRefs,
        familyRef: family.familyRef,
        familyVersion: family.familyVersion,
        familyDigest: family.familyDigest,
    });
    const body = deepFreeze({
        rowKind: "public_operation_contract",
        requirementAuthorityRefs: family.requirementAuthorityRefs,
        operationId,
        operationVersion: "5.0.0",
        family: familyCoordinate,
        definitions,
        invocationContractId: "abg.schema.public-operation-invocation",
        outcomeContractId: "abg.schema.public-operation-outcome",
        projectionRefusalContract: {
            contractId: "abg.schema.public-operation-outcome",
            definitionRef: "#/$defs/OutcomeProjectionRefusal",
        },
        authorityClassByDefinition: operationDefinitions.map((definition) => ({
            definitionKey: definition.definitionKey,
            value: definition.authorityClass,
        })),
        effectClassByDefinition: operationDefinitions.map((definition) => ({
            definitionKey: definition.definitionKey,
            value: definition.effectClass,
        })),
        workspaceBindingRequirementByDefinition: operationDefinitions.map((definition) => ({
            definitionKey: definition.definitionKey,
            value: definition.workspaceBindingRequirement,
        })),
        capabilityRefsByDefinition: operationDefinitions.map((definition) => ({
            definitionKey: definition.definitionKey,
            value: definition.capabilityRefs,
        })),
        adapterCoordinateByDefinition: operationDefinitions.map((definition) => ({
            definitionKey: definition.definitionKey,
            sdkCoordinate: definition.sdkCoordinate,
            cliCoordinate: definition.cliCoordinate,
            adapterExitMap: definition.adapterExitMap,
        })),
    });
    const rowDigest = sha256Canonical(body);
    return deepFreeze({
        ...body,
        rowRef: `public-operation-contract://abiogenesis/${operationPath(operationId)}/` +
            rowDigest.slice("sha256:".length),
        rowDigest,
    });
}
/** Exact intrinsic 18-operation/56-definition family closure. */
export const PUBLIC_FUNCTION_DEFINITION_FAMILY = constructFamily();
export function selectIntrinsicPublicFunctionDefinition(definitionKey) {
    const matches = PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.filter((definition) => sameCanonical(definition.definitionKey, definitionKey));
    return matches.length === 1 ? matches[0] : null;
}
/** PFC-F07's deterministic operation projection over only the closed family. */
export function derivePublicOperationContractProjections(family) {
    return deepFreeze([...new Set(family.definitions.map((definition) => definition.definitionKey.operationId))].sort(compareUnicodeCodeUnits).map((operationId) => constructOperationProjection(family, operationId)));
}
export const PUBLIC_OPERATION_CONTRACT_PROJECTIONS = derivePublicOperationContractProjections(PUBLIC_FUNCTION_DEFINITION_FAMILY);
