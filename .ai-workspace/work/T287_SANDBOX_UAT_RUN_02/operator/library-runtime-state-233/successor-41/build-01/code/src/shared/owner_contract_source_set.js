import { isRecord } from "./admission_predicates.js";
import { ABG_PROJECT_READ_CONTRACTS } from "../abg/project_read_operation_contracts.js";
import { WITNESS_OPERATION_CONTRACTS } from "../abg/witness_operation_contracts.js";
import { CATALOG_OPERATION_CONTRACTS } from "../product/catalog_operation_contracts.js";
import { PRODUCT_ENVIRONMENT_CONTRACTS } from "../product/environment_operation_contracts.js";
import { PRODUCT_INSTALL_CONTRACTS } from "../product/install_operation_contracts.js";
import { INTERACTION_OPERATION_CONTRACTS, RESULT_OPERATION_CONTRACTS, } from "../product/interaction_operation_contracts.js";
import { MATERIALIZATION_OPERATION_CONTRACTS, } from "../product/materialization_operation_contracts.js";
import { RELEASE_OPERATION_CONTRACTS } from "../product/release_snapshot_operations.js";
import { PRODUCT_PROJECT_READ_CONTRACTS } from "../product/project_read_operation_contracts.js";
import { RUN_OPERATION_CONTRACTS } from "../product/run_operation_contracts.js";
import { PRODUCT_VERIFICATION_CONTRACTS } from "../product/verification_operation_contracts.js";
import { WORKSPACE_OPERATION_CONTRACTS } from "../product/workspace_operation_contracts.js";
import { CONFORMANCE_OPERATION_CONTRACTS } from "../validator/conformance_operation_contracts.js";
import { compareUnicodeCodeUnits } from "./canonical_json.js";
import { sha256Bytes, sha256Canonical } from "./digests.js";
import { deepFreeze } from "./immutable.js";
import { projectStrictJsonSchema, } from "./public_function_contracts.js";
export const EXACT_OWNER_CONTRACT_KEY_SET_DIGEST = "sha256:61077d017dbbe0bd071f312066d27bc6535a732aa9da00cd543a70506ec24a4f";
const OWNER_BINDING_PACKAGE_NAME = "@abiogenesis/typescript-tenant";
const SELECTED_DEFINITION_FRAME = "build_tenants/abiogenesis/typescript/design/" +
    "M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md#42-definition-shape";
// This is the one build-time source relation. It names owner modules and their
// eventual concrete binding exports, never operation keys or runtime handlers.
export const OWNER_CONTRACT_MODULE_SOURCES = Object.freeze([
    Object.freeze({
        sourceModulePath: "product/workspace_operation_contracts.ts",
        packageExportPath: "./product",
        definitionBindingExportName: "WORKSPACE_DEFINITION_BINDINGS",
        definitionBindingKind: "statically_composed_callable",
        contractRoot: WORKSPACE_OPERATION_CONTRACTS,
    }),
    Object.freeze({
        sourceModulePath: "product/project_read_operation_contracts.ts",
        packageExportPath: "./product",
        definitionBindingExportName: "PRODUCT_PROJECT_READ_DEFINITION_BINDINGS",
        definitionBindingKind: "owner_projection",
        contractRoot: PRODUCT_PROJECT_READ_CONTRACTS,
    }),
    Object.freeze({
        sourceModulePath: "abg/project_read_operation_contracts.ts",
        packageExportPath: "./abg",
        definitionBindingExportName: "ABG_PROJECT_READ_DEFINITION_BINDINGS",
        definitionBindingKind: "owner_projection",
        contractRoot: ABG_PROJECT_READ_CONTRACTS,
    }),
    Object.freeze({
        sourceModulePath: "product/verification_operation_contracts.ts",
        packageExportPath: "./product",
        definitionBindingExportName: "PRODUCT_VERIFICATION_DEFINITION_BINDINGS",
        definitionBindingKind: "statically_composed_callable",
        contractRoot: PRODUCT_VERIFICATION_CONTRACTS,
    }),
    Object.freeze({
        sourceModulePath: "product/environment_operation_contracts.ts",
        packageExportPath: "./product",
        definitionBindingExportName: "PRODUCT_ENVIRONMENT_DEFINITION_BINDINGS",
        definitionBindingKind: "statically_composed_callable",
        contractRoot: PRODUCT_ENVIRONMENT_CONTRACTS,
    }),
    Object.freeze({
        sourceModulePath: "product/install_operation_contracts.ts",
        packageExportPath: "./product",
        definitionBindingExportName: "PRODUCT_INSTALL_DEFINITION_BINDINGS",
        definitionBindingKind: "statically_composed_callable",
        contractRoot: PRODUCT_INSTALL_CONTRACTS,
    }),
    Object.freeze({
        sourceModulePath: "product/catalog_operation_contracts.ts",
        packageExportPath: "./product",
        definitionBindingExportName: "CATALOG_DEFINITION_BINDINGS",
        definitionBindingKind: "statically_composed_callable",
        contractRoot: CATALOG_OPERATION_CONTRACTS,
    }),
    Object.freeze({
        sourceModulePath: "product/run_operation_contracts.ts",
        packageExportPath: "./product",
        definitionBindingExportName: "RUN_DEFINITION_BINDINGS",
        definitionBindingKind: "statically_composed_callable",
        contractRoot: RUN_OPERATION_CONTRACTS,
    }),
    Object.freeze({
        sourceModulePath: "product/interaction_operation_contracts.ts",
        packageExportPath: "./product",
        definitionBindingExportName: "INTERACTION_DEFINITION_BINDINGS",
        definitionBindingKind: "statically_composed_callable",
        contractRoot: INTERACTION_OPERATION_CONTRACTS,
    }),
    Object.freeze({
        sourceModulePath: "product/interaction_operation_contracts.ts",
        packageExportPath: "./product",
        definitionBindingExportName: "RESULT_DEFINITION_BINDINGS",
        definitionBindingKind: "statically_composed_callable",
        contractRoot: RESULT_OPERATION_CONTRACTS,
    }),
    Object.freeze({
        sourceModulePath: "abg/witness_operation_contracts.ts",
        packageExportPath: "./abg",
        definitionBindingExportName: "WITNESS_DEFINITION_BINDINGS",
        definitionBindingKind: "statically_composed_callable",
        contractRoot: WITNESS_OPERATION_CONTRACTS,
    }),
    Object.freeze({
        sourceModulePath: "validator/conformance_operation_contracts.ts",
        packageExportPath: "./validator",
        definitionBindingExportName: "CONFORMANCE_DEFINITION_BINDINGS",
        definitionBindingKind: "statically_composed_callable",
        contractRoot: CONFORMANCE_OPERATION_CONTRACTS,
    }),
    Object.freeze({
        sourceModulePath: "product/materialization_operation_contracts.ts",
        packageExportPath: "./product",
        definitionBindingExportName: "MATERIALIZATION_DEFINITION_BINDINGS",
        definitionBindingKind: "statically_composed_callable",
        contractRoot: MATERIALIZATION_OPERATION_CONTRACTS,
    }),
    Object.freeze({
        sourceModulePath: "product/release_snapshot_operations.ts",
        packageExportPath: "./product",
        definitionBindingExportName: "RELEASE_SNAPSHOT_DEFINITION_BINDINGS",
        definitionBindingKind: "statically_composed_callable",
        contractRoot: RELEASE_OPERATION_CONTRACTS,
    }),
]);
function isOwnerContractSourceDeclaration(value) {
    return isRecord(value) &&
        isRecord(value.definitionKey) &&
        typeof value.definitionKey.operationId === "string" &&
        typeof value.definitionKey.memberKey === "string" &&
        "requestSchema" in value &&
        "resultSchema" in value &&
        "refusalSchema" in value &&
        "nonTerminalSchema" in value &&
        isRecord(value.owner) &&
        isRecord(value.metadata);
}
function collectDeclarations(value) {
    if (isOwnerContractSourceDeclaration(value))
        return Object.freeze([value]);
    if (!isRecord(value))
        return Object.freeze([]);
    return Object.freeze(Object.values(value).flatMap(collectDeclarations));
}
function schemaFor(declaration, slot) {
    switch (slot) {
        case "request":
            return declaration.requestSchema;
        case "result":
            return declaration.resultSchema;
        case "refusal":
            return declaration.refusalSchema;
        case "non_terminal":
            return declaration.nonTerminalSchema;
    }
}
function schemaDigest(declaration, slot) {
    const schema = schemaFor(declaration, slot);
    if (schema === null)
        return null;
    return sha256Canonical({
        schemaVersion: "5.0.0",
        definitionKey: declaration.definitionKey,
        slot,
        ownerAuthorityRef: declaration.owner.authorityRef,
        ownerAuthorityDigest: declaration.owner.authorityDigest,
        schema: projectStrictJsonSchema(schema),
    });
}
function unresolvedSource(moduleSource, declaration) {
    const schemaDigests = Object.freeze({
        request: schemaDigest(declaration, "request"),
        result: schemaDigest(declaration, "result"),
        refusal: schemaDigest(declaration, "refusal"),
        nonTerminal: schemaDigest(declaration, "non_terminal"),
    });
    const memberDigest = sha256Canonical({
        definitionKey: declaration.definitionKey,
        contractIds: declaration.contractIds,
        owner: declaration.owner,
        metadata: declaration.metadata,
        nativeSchemaDigests: schemaDigests,
    });
    return Object.freeze({
        moduleSource,
        declaration,
        memberDigest,
        schemaDigests,
    });
}
const unresolvedSources = OWNER_CONTRACT_MODULE_SOURCES.flatMap((moduleSource) => collectDeclarations(moduleSource.contractRoot).map((declaration) => unresolvedSource(moduleSource, declaration)));
const moduleDigestByAbstractModule = new Map();
for (const abstractModule of [...new Set(unresolvedSources.map(({ declaration }) => declaration.owner.abstractModule))].sort(compareUnicodeCodeUnits)) {
    const members = unresolvedSources
        .filter(({ declaration }) => declaration.owner.abstractModule === abstractModule)
        .map(({ declaration, memberDigest }) => ({
        definitionKey: declaration.definitionKey,
        memberDigest,
    }))
        .sort((left, right) => {
        const operation = compareUnicodeCodeUnits(left.definitionKey.operationId, right.definitionKey.operationId);
        return operation !== 0
            ? operation
            : compareUnicodeCodeUnits(left.definitionKey.memberKey, right.definitionKey.memberKey);
    });
    moduleDigestByAbstractModule.set(abstractModule, sha256Canonical({
        abstractModule,
        members,
    }));
}
function contractIdFor(declaration, slot) {
    return slot === "non_terminal"
        ? declaration.contractIds.nonTerminal
        : declaration.contractIds[slot];
}
function resolveSource(source) {
    const { declaration, moduleSource, memberDigest, schemaDigests } = source;
    const sourceModuleDigest = moduleDigestByAbstractModule.get(declaration.owner.abstractModule);
    const ownerMember = deepFreeze({
        abstractModule: declaration.owner.abstractModule,
        exportName: declaration.owner.exportName,
        memberPath: Object.freeze([...declaration.owner.memberPath]),
        sourceModuleDigest,
        memberDigest,
    });
    const contract = (slot) => {
        const contractId = contractIdFor(declaration, slot);
        const schema = schemaFor(declaration, slot);
        const digest = slot === "non_terminal"
            ? schemaDigests.nonTerminal
            : schemaDigests[slot];
        if (contractId === null || schema === null || digest === null)
            return null;
        return deepFreeze({
            definitionKey: declaration.definitionKey,
            slot,
            contractId,
            contractVersion: "5.0.0",
            source: ownerMember,
            ownerAuthorityRef: declaration.owner.authorityRef,
            ownerAuthorityDigest: declaration.owner.authorityDigest,
            schema: deepFreeze(schema),
            nativeSchemaIdentity: deepFreeze({
                schemaRef: `native-schema://abiogenesis/${digest.slice("sha256:".length)}`,
                schemaVersion: "5.0.0",
                ownerMember,
            }),
        });
    };
    const contracts = deepFreeze({
        request: contract("request"),
        result: contract("result"),
        refusal: contract("refusal"),
        nonTerminal: contract("non_terminal"),
    });
    const metadata = deepFreeze({
        ...declaration.metadata,
        ownerAuthorityRef: declaration.owner.authorityRef,
        ownerAuthorityDigest: declaration.owner.authorityDigest,
    });
    const metadataDigest = sha256Canonical({
        definitionKey: declaration.definitionKey,
        metadata,
    });
    const callableContractDigest = sha256Canonical({
        kind: "exact_definition_host_callable",
        schemaVersion: "5.0.0",
        definitionKey: declaration.definitionKey,
        requestSchemaRef: contracts.request.nativeSchemaIdentity.schemaRef,
        resultSchemaRef: contracts.result.nativeSchemaIdentity.schemaRef,
        refusalSchemaRef: contracts.refusal.nativeSchemaIdentity.schemaRef,
        nonTerminalSchemaRef: contracts.nonTerminal?.nativeSchemaIdentity.schemaRef ?? null,
        resourceRelation: "owner_indexed_sibling_assertion_and_receipt",
    });
    const executionBindingSpecification = deepFreeze({
        definitionKey: declaration.definitionKey,
        kind: moduleSource.definitionBindingKind,
        callable: deepFreeze({
            packageName: OWNER_BINDING_PACKAGE_NAME,
            packageExportPath: moduleSource.packageExportPath,
            namedExport: moduleSource.definitionBindingExportName,
            memberPath: Object.freeze([...declaration.owner.memberPath]),
            ownerAuthorityRef: declaration.owner.authorityRef,
            callableContractDigest,
        }),
        semanticOwnerRef: declaration.owner.authorityRef,
        selectedFrameRef: SELECTED_DEFINITION_FRAME,
    });
    const executionBindingSpecificationDigest = sha256Canonical(executionBindingSpecification);
    const reference = (binding) => binding === null
        ? null
        : deepFreeze({
            definitionKey: binding.definitionKey,
            slot: binding.slot,
            contractId: binding.contractId,
            contractVersion: binding.contractVersion,
            source: binding.source,
            ownerAuthorityRef: binding.ownerAuthorityRef,
            ownerAuthorityDigest: binding.ownerAuthorityDigest,
            nativeSchemaIdentity: binding.nativeSchemaIdentity,
        });
    const packet = deepFreeze({
        definitionKey: declaration.definitionKey,
        requestContract: reference(contracts.request),
        resultContract: reference(contracts.result),
        refusalContract: reference(contracts.refusal),
        nonTerminalContract: reference(contracts.nonTerminal),
        metadata: deepFreeze({
            definitionKey: declaration.definitionKey,
            source: ownerMember,
            metadataDigest,
        }),
        executionBindingSpecification,
        executionBindingSpecificationDigest,
    });
    return Object.freeze({
        sourceModulePath: moduleSource.sourceModulePath,
        sourceModuleDigest,
        memberDigest,
        declaration,
        packet,
        contracts,
        metadata,
    });
}
export const OWNER_CONTRACT_SOURCES = Object.freeze(unresolvedSources.map(resolveSource).sort((left, right) => {
    const operation = compareUnicodeCodeUnits(left.packet.definitionKey.operationId, right.packet.definitionKey.operationId);
    return operation !== 0
        ? operation
        : compareUnicodeCodeUnits(left.packet.definitionKey.memberKey, right.packet.definitionKey.memberKey);
}));
function compositeKey(packet) {
    return `${packet.definitionKey.operationId}#${packet.definitionKey.memberKey}`;
}
export const OWNER_CONTRACT_KEY_SET_DIGEST = sha256Bytes(`${OWNER_CONTRACT_SOURCES.map(({ packet }) => compositeKey(packet)).join("\n")}\n`);
const operationCount = new Set(OWNER_CONTRACT_SOURCES.map(({ packet }) => packet.definitionKey.operationId)).size;
const distinctKeys = new Set(OWNER_CONTRACT_SOURCES.map(({ packet }) => compositeKey(packet)));
if (operationCount !== 18 ||
    OWNER_CONTRACT_SOURCES.length !== 56 ||
    distinctKeys.size !== 56 ||
    OWNER_CONTRACT_KEY_SET_DIGEST !== EXACT_OWNER_CONTRACT_KEY_SET_DIGEST) {
    throw new TypeError(`owner contract source set mismatch: ${operationCount}/` +
        `${OWNER_CONTRACT_SOURCES.length}/${distinctKeys.size}/` +
        OWNER_CONTRACT_KEY_SET_DIGEST);
}
export const OWNER_CONTRACT_SOURCE_MAP = Object.freeze(Object.fromEntries([...new Set(OWNER_CONTRACT_SOURCES.map(({ packet }) => packet.definitionKey.operationId))].map((operationId) => [
    operationId,
    Object.freeze(Object.fromEntries(OWNER_CONTRACT_SOURCES.filter(({ packet }) => packet.definitionKey.operationId === operationId).map((source) => [source.packet.definitionKey.memberKey, source]))),
])));
