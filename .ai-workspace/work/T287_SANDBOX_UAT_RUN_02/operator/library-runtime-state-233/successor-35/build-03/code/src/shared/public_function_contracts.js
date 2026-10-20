import { toJsonSchema } from "@valibot/to-json-schema";
import * as v from "valibot";
import { canonicalJson } from "./canonical_json.js";
import { sha256Canonical } from "./digests.js";
export const PUBLIC_FUNCTION_VERSION = "5.0.0";
export const TERMINAL_ONLY_ADAPTER_EXIT_MAP = Object.freeze({
    acceptedTerminal: 0,
    refused: 1,
    invalidInvocation: 2,
    acceptedNonTerminal: null,
    adapterFailure: 70,
});
export const RUNTIME_NONTERMINAL_ADAPTER_EXIT_MAP = Object.freeze({
    acceptedTerminal: 0,
    refused: 1,
    invalidInvocation: 2,
    acceptedNonTerminal: 3,
    adapterFailure: 70,
});
export const PUBLIC_AUTHORITY_SLOTS = Object.freeze([
    "workspace_binding",
    "product_set",
    "dependency_lock",
    "catalog_scope",
    "execution_program",
    "graph_function",
    "input_contract",
    "session_policy",
    "capability_grants",
    "actor",
    "transport_steering",
    "verification_references",
    "execution_basis",
]);
export function requestDependentAuthoritySlot(slot, requestPath, equalsAny) {
    return Object.freeze({
        slot,
        requiredWhen: Object.freeze({
            requestPath: Object.freeze([...requestPath]),
            equalsAny: Object.freeze([...equalsAny]),
        }),
    });
}
export function ownerAuthorityDigest(authorityRef) {
    return sha256Canonical({ authorityRef });
}
/** @internal */
export const nonblankSchema = v.pipe(v.string(), v.regex(/\S/, "nonblank_string"));
/** @internal */
export const jsonPointerSchema = v.pipe(v.string(), v.regex(/^(?:\/(?:[^~/]|~[01])*)*$/, "json_pointer"));
/** @internal */
export const jsonPointerFragmentSchema = v.pipe(v.string(), v.regex(/^#(?:\/(?:[^~/]|~[01])*)*$/, "json_pointer_fragment"));
/** @internal */
export const digestSchema = v.pipe(v.string(), v.regex(/^sha256:[0-9a-f]{64}$/, "sha256_digest"));
/** @internal */
export const absolutePathSchema = v.pipe(v.string(), v.regex(/^(?:\/|[A-Za-z]:[\\/])/, "absolute_path"));
/** @internal */
export const rfc3339Schema = v.pipe(v.string(), v.isoTimestamp("rfc3339_instant"));
/** @internal */
export const safeNonNegativeIntegerSchema = v.pipe(v.number(), v.safeInteger(), v.minValue(0));
/** @internal */
export const safePositiveIntegerSchema = v.pipe(v.number(), v.safeInteger(), v.minValue(1));
/** @internal */
export const jsonValueSchema = v.lazy(() => jsonValueDefinition);
// One recursive definition; lazy resolves recursion without rebuilding schemas per value.
const jsonValueDefinition = v.union([
    v.null(),
    v.boolean(),
    v.pipe(v.number(), v.finite()),
    v.string(),
    v.array(jsonValueSchema),
    v.record(v.string(), jsonValueSchema),
]);
function canonicalIdentity(value) {
    return canonicalJson(value);
}
/** @internal */
export function uniqueArray(item) {
    return v.pipe(v.array(item), v.check((values) => new Set(values.map((value) => canonicalIdentity(value))).size ===
        values.length, "unique_items"));
}
/** @internal */
export function nonemptyUniqueArray(item) {
    return v.pipe(uniqueArray(item), v.minLength(1));
}
/** @internal */
export const refDigestSchema = v.strictObject({
    ref: nonblankSchema,
    digest: digestSchema,
});
/** @internal */
export const refSetSchema = uniqueArray(nonblankSchema);
/** @internal */
export const refDigestSetSchema = uniqueArray(refDigestSchema);
/** @internal */
export const nonemptyRefDigestSetSchema = nonemptyUniqueArray(refDigestSchema);
/** @internal */
export const noResidualsSchema = v.pipe(v.array(v.never()), v.length(0));
/** @internal */
export const contractBoundValueSchema = v.strictObject({
    contract: refDigestSchema,
    valueRef: nonblankSchema,
    valueDigest: digestSchema,
    value: jsonValueSchema,
});
/** @internal */
export const typedResidualSchema = v.strictObject({
    kind: v.literal("typed_residual"),
    code: nonblankSchema,
    subjectRef: nonblankSchema,
    message: nonblankSchema,
});
/** @internal */
export const typedResidualSetSchema = uniqueArray(typedResidualSchema);
/** @internal */
export const nonemptyTypedResidualSetSchema = nonemptyUniqueArray(typedResidualSchema);
const externalRelationOriginSchema = v.union([
    v.strictObject({
        kind: v.literal("import_declaration"),
        clause: v.picklist(["side_effect", "default", "named", "namespace"]),
        declarationTypeOnly: v.boolean(),
        specifierTypeOnly: v.boolean(),
    }),
    v.strictObject({
        kind: v.literal("export_declaration"),
        clause: v.picklist(["named", "star", "namespace"]),
        declarationTypeOnly: v.boolean(),
        specifierTypeOnly: v.boolean(),
    }),
    v.strictObject({
        kind: v.literal("import_type_expression"),
        operator: v.picklist(["type", "typeof"]),
    }),
    v.strictObject({ kind: v.literal("import_equals_declaration") }),
    v.strictObject({ kind: v.literal("type_reference_directive") }),
    v.strictObject({ kind: v.literal("module_augmentation") }),
]);
const externalSelectionSchema = v.union([
    v.strictObject({ kind: v.literal("module") }),
    v.strictObject({
        kind: v.literal("name"),
        targetName: nonblankSchema,
        exposedName: nonblankSchema,
    }),
    v.strictObject({ kind: v.literal("namespace"), exposedName: nonblankSchema }),
    v.strictObject({ kind: v.literal("all") }),
]);
/** @internal */
export const contractIndexedPendingExternalSelectorSchema = v.strictObject({
    selectorRef: digestSchema,
    sourceProductContentDigest: digestSchema,
    sourceContractRef: nonblankSchema,
    sourceContractDigest: digestSchema,
    sourcePackageExportPath: nonblankSchema,
    sourceNamedSymbol: nonblankSchema,
    physicalRelationRef: nonblankSchema,
    externalPackageName: nonblankSchema,
    externalModuleSpecifier: nonblankSchema,
    origin: externalRelationOriginSchema,
    selection: externalSelectionSchema,
    localAccessPath: v.pipe(v.array(nonblankSchema), v.minLength(1)),
});
/** @internal */
export const publicDefinitionKeySchema = v.strictObject({
    operationId: nonblankSchema,
    memberKey: nonblankSchema,
});
/** @internal */
export const publicContractCatalogCoordinateSchema = v.strictObject({
    productId: nonblankSchema,
    productContentDigest: digestSchema,
    catalogId: nonblankSchema,
    catalogVersion: v.literal(PUBLIC_FUNCTION_VERSION),
    catalogDigest: digestSchema,
});
/** @internal */
export const publicContractCoordinateSchema = v.strictObject({
    contractCatalog: publicContractCatalogCoordinateSchema,
    flatRow: v.strictObject({
        contractId: nonblankSchema,
        contractVersion: v.literal(PUBLIC_FUNCTION_VERSION),
        contractDigest: digestSchema,
    }),
    nestedSelector: v.union([
        v.strictObject({
            selectorKind: v.literal("flat_contract"),
            definitionKey: v.null(),
            slot: v.null(),
            definitionRef: v.null(),
        }),
        v.strictObject({
            selectorKind: v.literal("operation_definition_slot"),
            definitionKey: publicDefinitionKeySchema,
            slot: v.picklist(["request", "result", "refusal", "non_terminal"]),
            definitionRef: jsonPointerFragmentSchema,
        }),
        v.strictObject({
            selectorKind: v.literal("schema_definition"),
            definitionKey: v.null(),
            slot: v.null(),
            definitionRef: jsonPointerFragmentSchema,
        }),
    ]),
});
/** @internal */
export const definitionContractCoordinateSetSchema = v.strictObject({
    request: publicContractCoordinateSchema,
    result: publicContractCoordinateSchema,
    refusal: publicContractCoordinateSchema,
    nonTerminal: v.nullable(publicContractCoordinateSchema),
});
/** @internal */
export const definitionContractCoordinateMemberSchema = v.strictObject({
    memberKey: nonblankSchema,
    slots: definitionContractCoordinateSetSchema,
});
/** @internal */
export const definitionContractCoordinateOperationSchema = v.strictObject({
    operationId: nonblankSchema,
    members: nonemptyUniqueArray(definitionContractCoordinateMemberSchema),
});
// This carrier is nested by operation then member. It has no string-indexed
// escape hatch. Exact family completeness is established by the Product-owned
// relation below because the declared artifact family, rather than this shared
// structural schema or a caller-supplied expected set, owns the member set.
/** @internal */
export const completeDefinitionContractCoordinateMapSchema = v.strictObject({
    operations: nonemptyUniqueArray(definitionContractCoordinateOperationSchema),
});
/** @internal */
export const sourceBasisSchema = v.union([
    v.strictObject({ kind: v.literal("none") }),
    v.strictObject({
        kind: v.literal("admitted_source_result"),
        projectionAuthority: refDigestSchema,
        sourceResult: refDigestSchema,
    }),
]);
/** @internal */
export const replayPageSchema = v.strictObject({
    kind: v.literal("ordinal_page"),
    fromOrdinal: safeNonNegativeIntegerSchema,
    limit: safePositiveIntegerSchema,
});
/** @internal */
export function refusalSchema(codes) {
    return v.strictObject({
        code: v.picklist(codes),
        issuePaths: uniqueArray(jsonPointerSchema),
        evidenceRefs: refSetSchema,
    });
}
/** @internal */
export function resultWithEvidence(entries) {
    return v.strictObject({
        ...entries,
        evidence: refDigestSetSchema,
    });
}
function requirementSlot(requirement) {
    return typeof requirement === "string" ? requirement : requirement.slot;
}
function assertMetadata(metadata) {
    const slots = metadata.authoritySlotRequirements.map(requirementSlot);
    if (slots.length !== new Set(slots).size ||
        !slots.includes("capability_grants") ||
        metadata.capabilityRefs.length === 0 ||
        metadata.capabilityRefs.length !== new Set(metadata.capabilityRefs).size ||
        metadata.sdkCoordinate.trim().length === 0 ||
        metadata.cliCoordinate.trim().length === 0 ||
        (metadata.actorRequirement === "required") !== slots.includes("actor") ||
        (metadata.workspaceBindingRequirement === "exactly_one") !==
            slots.includes("workspace_binding")) {
        throw new TypeError("owner metadata authority requirements are incoherent");
    }
}
export function ownerContractPacket(definitionKey, requestSchema, resultSchema, refusal, nonTerminalSchema, owner, metadata) {
    assertMetadata(metadata);
    const namespace = owner.abstractModule
        .replaceAll(".", "/")
        .replaceAll("_", "-")
        .toLowerCase();
    const member = owner.memberPath
        .map((part) => part.replaceAll("_", "-"))
        .join("/");
    const contractBase = `contract://abiogenesis/${namespace}/${member}`;
    return Object.freeze({
        definitionKey: Object.freeze({ ...definitionKey }),
        requestSchema,
        resultSchema,
        refusalSchema: refusal,
        nonTerminalSchema,
        owner: Object.freeze({ ...owner }),
        contractIds: Object.freeze({
            request: `${contractBase}/request@5`,
            result: `${contractBase}/result@5`,
            refusal: `${contractBase}/refusal@5`,
            nonTerminal: nonTerminalSchema === null
                ? null
                : `${contractBase}/non-terminal@5`,
        }),
        metadata: ownerMetadata(metadata),
    });
}
export function ownerMetadata(input) {
    assertMetadata(input);
    return Object.freeze({
        ...input,
        authoritySlotRequirements: Object.freeze(input.authoritySlotRequirements.map((requirement) => typeof requirement === "string"
            ? requirement
            : requestDependentAuthoritySlot(requirement.slot, requirement.requiredWhen.requestPath, requirement.requiredWhen.equalsAny))),
        capabilityRefs: Object.freeze([...input.capabilityRefs]),
        defaults: Object.freeze({ ...input.defaults }),
        closedDomains: Object.freeze(Object.fromEntries(Object.entries(input.closedDomains).map(([key, values]) => [
            key,
            Object.freeze([...values]),
        ]))),
        adapterExitMap: Object.freeze({ ...input.adapterExitMap }),
    });
}
export function contractSchemaEntries(schema) {
    const entries = schema.entries;
    if (entries === undefined) {
        throw new TypeError("runtime contract schema has no object entries");
    }
    return entries;
}
export function admitRuntimeContract(schema, candidate) {
    const result = v.safeParse(schema, candidate, {
        abortPipeEarly: true,
    });
    if (result.success) {
        return Object.freeze({ disposition: "admitted", value: result.output });
    }
    return Object.freeze({
        disposition: "refused",
        issuePaths: Object.freeze([...new Set(result.issues.map((issue) => {
                const path = issue.path?.map((entry) => String(entry.key)) ?? [];
                return `/${path.join("/")}`;
            }))].sort()),
    });
}
export function projectStrictJsonSchema(schema) {
    const projected = toJsonSchema(schema, {
        target: "draft-2020-12",
        overrideAction: ({ valibotAction, jsonSchema }) => {
            // I-JSON excludes non-finite numbers at the native admission boundary;
            // JSON Schema numbers are already limited to JSON-representable values.
            if (valibotAction.type === "finite")
                return jsonSchema;
            const message = valibotAction.message;
            if (valibotAction.type === "check" &&
                (message === "unique_items" || message === "rfc3339_instant")) {
                return message === "unique_items"
                    ? { ...jsonSchema, uniqueItems: true }
                    : { ...jsonSchema, format: "date-time" };
            }
            return undefined;
        },
    });
    return normalizeGeneratedDefinitionRefs(projected);
}
function normalizeGeneratedDefinitionRefs(schema) {
    const definitions = schema.$defs;
    if (typeof definitions !== "object" ||
        definitions === null ||
        Array.isArray(definitions))
        return schema;
    const sourceDefinitions = definitions;
    const assigned = new Map();
    const pending = [];
    const assign = (sourceKey) => {
        if (!Object.hasOwn(sourceDefinitions, sourceKey) || assigned.has(sourceKey)) {
            return;
        }
        assigned.set(sourceKey, `d${assigned.size}`);
        pending.push(sourceKey);
    };
    const visit = (value) => {
        if (Array.isArray(value)) {
            for (const entry of value)
                visit(entry);
            return;
        }
        if (typeof value !== "object" || value === null)
            return;
        const record = value;
        const reference = record.$ref;
        if (typeof reference === "string") {
            const match = /^#\/\$defs\/([^/]+)$/u.exec(reference);
            if (match !== null)
                assign(match[1]);
        }
        for (const key of Object.keys(record).sort()) {
            if (key !== "$defs")
                visit(record[key]);
        }
    };
    const rootWithoutDefinitions = Object.fromEntries(Object.entries(schema).filter(([key]) => key !== "$defs"));
    visit(rootWithoutDefinitions);
    for (let index = 0; index < pending.length; index += 1) {
        visit(sourceDefinitions[pending[index]]);
    }
    const neutral = (value) => {
        if (Array.isArray(value))
            return value.map(neutral);
        if (typeof value !== "object" || value === null)
            return value;
        const record = value;
        return Object.fromEntries(Object.keys(record).sort().map((key) => [
            key,
            key === "$ref" &&
                typeof record[key] === "string" &&
                /^#\/\$defs\/[^/]+$/u.test(record[key])
                ? "#/$defs/_"
                : neutral(record[key]),
        ]));
    };
    const remaining = Object.keys(sourceDefinitions)
        .filter((key) => !assigned.has(key))
        .sort((left, right) => {
        const leftProjection = canonicalJson(neutral(sourceDefinitions[left]));
        const rightProjection = canonicalJson(neutral(sourceDefinitions[right]));
        return leftProjection < rightProjection
            ? -1
            : leftProjection > rightProjection
                ? 1
                : 0;
    });
    for (const key of remaining)
        assign(key);
    const rewrite = (value) => {
        if (Array.isArray(value))
            return value.map(rewrite);
        if (typeof value !== "object" || value === null)
            return value;
        const record = value;
        return Object.fromEntries(Object.entries(record).map(([key, child]) => {
            if (key === "$ref" && typeof child === "string") {
                const match = /^#\/\$defs\/([^/]+)$/u.exec(child);
                const replacement = match === null ? undefined : assigned.get(match[1]);
                if (replacement !== undefined)
                    return [key, `#/$defs/${replacement}`];
            }
            return [key, rewrite(child)];
        }));
    };
    const normalizedDefinitions = Object.fromEntries([...assigned.entries()].map(([sourceKey, targetKey]) => [
        targetKey,
        rewrite(sourceDefinitions[sourceKey]),
    ]));
    return {
        ...rewrite(rootWithoutDefinitions),
        $defs: normalizedDefinitions,
    };
}
