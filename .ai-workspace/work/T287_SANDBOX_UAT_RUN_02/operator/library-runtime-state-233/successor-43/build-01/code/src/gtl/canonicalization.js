import { isJsonRecordShape as isRecord } from "../shared/admission_predicates.js";
import { canonicalJson, compareUnicodeCodeUnits, } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
export const CANONICAL_AUTHORED_GTL_SUBJECT_KIND_VALUES = [
    "module_publication",
    "catalog_contribution",
    "gtl_program",
    "graph_function",
];
function mutable(value) {
    return value;
}
function compareRecordsByIdentity(left, right, identityKeys) {
    for (const key of identityKeys) {
        const compared = compareUnicodeCodeUnits(left[key], right[key]);
        if (compared !== 0)
            return compared;
    }
    return compareUnicodeCodeUnits(canonicalJson(left), canonicalJson(right));
}
function canonicalizeStringInventory(carrier, field) {
    const values = carrier[field];
    if (Array.isArray(values) &&
        values.every((value) => typeof value === "string")) {
        carrier[field] = [...values].sort(compareUnicodeCodeUnits);
    }
}
function canonicalizeRecordInventory(carrier, field, identityKeys, canonicalizeEntry) {
    const values = carrier[field];
    if (!Array.isArray(values))
        return;
    const entries = values.map((value) => {
        if (!isRecord(value))
            return value;
        const entry = mutable(value);
        canonicalizeEntry?.(entry);
        return entry;
    });
    if (entries.every((entry) => isRecord(entry) &&
        identityKeys.every((key) => typeof entry[key] === "string"))) {
        entries.sort((left, right) => compareRecordsByIdentity(left, right, identityKeys));
    }
    carrier[field] = entries;
}
function canonicalizeEvaluator(carrier) {
    canonicalizeStringInventory(carrier, "consumedFieldRefs");
    canonicalizeStringInventory(carrier, "tags");
}
function canonicalizeRule(carrier) {
    canonicalizeStringInventory(carrier, "tags");
}
function canonicalizeContribution(carrier) {
    canonicalizeStringInventory(carrier, "programMembershipRefs");
    canonicalizeStringInventory(carrier, "readinessPrerequisiteRefs");
    canonicalizeStringInventory(carrier, "compatibilityRefs");
    canonicalizeStringInventory(carrier, "provenanceRefs");
}
function canonicalizeActionCatalog(carrier) {
    canonicalizeRecordInventory(carrier, "rows", ["actionRef"]);
    const { catalogDigest: _catalogDigest, catalogRef: _catalogRef, ...catalogBody } = carrier;
    const catalogDigest = sha256Canonical(catalogBody);
    carrier.catalogDigest = catalogDigest;
    carrier.catalogRef =
        `action-catalog://product/${catalogDigest.slice("sha256:".length)}`;
}
function canonicalizeProgram(carrier) {
    canonicalizeRecordInventory(carrier, "starts", ["startRef"]);
    canonicalizeStringInventory(carrier, "callableMembership");
    canonicalizeRecordInventory(carrier, "publicAssetTargets", ["handle"]);
    if (isRecord(carrier.actionCatalog)) {
        canonicalizeActionCatalog(mutable(carrier.actionCatalog));
    }
}
function canonicalizeGraphFunction(carrier) {
    const environment = carrier.environment;
    if (isRecord(environment)) {
        const environmentCarrier = mutable(environment);
        canonicalizeStringInventory(environmentCarrier, "requires");
        canonicalizeStringInventory(environmentCarrier, "provides");
        canonicalizeStringInventory(environmentCarrier, "carries");
    }
    canonicalizeStringInventory(carrier, "effects");
    canonicalizeStringInventory(carrier, "tags");
}
function canonicalizeModulePublication(carrier) {
    if (carrier.stdoRunEnvironments !== undefined)
        canonicalizeRecordInventory(carrier, "stdoRunEnvironments", ["declarationRef"]);
    if (carrier.runEnvironments !== undefined)
        canonicalizeRecordInventory(carrier, "runEnvironments", ["declarationRef"]);
    canonicalizeRecordInventory(carrier, "contracts", ["contractRef"]);
    canonicalizeRecordInventory(carrier, "evaluators", ["name"], canonicalizeEvaluator);
    canonicalizeRecordInventory(carrier, "rules", ["name"], canonicalizeRule);
    canonicalizeRecordInventory(carrier, "implementationBindings", ["bindingRef"]);
    canonicalizeRecordInventory(carrier, "closureContracts", ["closureContractRef"]);
    canonicalizeRecordInventory(carrier, "programs", ["programRef"], canonicalizeProgram);
    canonicalizeRecordInventory(carrier, "graphFunctions", ["name"], canonicalizeGraphFunction);
    canonicalizeRecordInventory(carrier, "contributions", ["handle"], canonicalizeContribution);
}
export function canonicalizeAuthoredGtlCarrier(value, subjectKind) {
    const cloned = JSON.parse(canonicalJson(value));
    if (!isRecord(cloned))
        return deepFreeze(cloned);
    const carrier = mutable(cloned);
    switch (subjectKind) {
        case "module_publication":
            canonicalizeModulePublication(carrier);
            break;
        case "catalog_contribution":
            canonicalizeContribution(carrier);
            break;
        case "gtl_program":
            canonicalizeProgram(carrier);
            break;
        case "graph_function":
            canonicalizeGraphFunction(carrier);
            break;
    }
    return deepFreeze(carrier);
}
