import {
  canonicalJson,
  compareUnicodeCodeUnits,
  type JsonValue,
} from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  CatalogContribution,
  GraphFunction,
  GtlProgram,
  ModulePublication,
} from "./contracts.js";

export const CANONICAL_AUTHORED_GTL_SUBJECT_KIND_VALUES = [
  "module_publication",
  "catalog_contribution",
  "gtl_program",
  "graph_function",
] as const;

export type CanonicalAuthoredGtlSubjectKind =
  (typeof CANONICAL_AUTHORED_GTL_SUBJECT_KIND_VALUES)[number];

type MutableJsonRecord = { [key: string]: JsonValue };

function isRecord(value: unknown): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mutable(value: Readonly<Record<string, JsonValue>>): MutableJsonRecord {
  return value as MutableJsonRecord;
}

function compareRecordsByIdentity(
  left: Readonly<Record<string, JsonValue>>,
  right: Readonly<Record<string, JsonValue>>,
  identityKeys: readonly string[],
): number {
  for (const key of identityKeys) {
    const compared = compareUnicodeCodeUnits(
      left[key] as string,
      right[key] as string,
    );
    if (compared !== 0) return compared;
  }
  return compareUnicodeCodeUnits(canonicalJson(left), canonicalJson(right));
}

function canonicalizeStringInventory(
  carrier: MutableJsonRecord,
  field: string,
): void {
  const values = carrier[field];
  if (
    Array.isArray(values) &&
    values.every((value) => typeof value === "string")
  ) {
    carrier[field] = [...values].sort(compareUnicodeCodeUnits);
  }
}

function canonicalizeRecordInventory(
  carrier: MutableJsonRecord,
  field: string,
  identityKeys: readonly string[],
  canonicalizeEntry?: (entry: MutableJsonRecord) => void,
): void {
  const values = carrier[field];
  if (!Array.isArray(values)) return;

  const entries = values.map((value) => {
    if (!isRecord(value)) return value;
    const entry = mutable(value);
    canonicalizeEntry?.(entry);
    return entry;
  });
  if (
    entries.every(
      (entry) =>
        isRecord(entry) &&
        identityKeys.every((key) => typeof entry[key] === "string"),
    )
  ) {
    entries.sort((left, right) =>
      compareRecordsByIdentity(
        left as Readonly<Record<string, JsonValue>>,
        right as Readonly<Record<string, JsonValue>>,
        identityKeys,
      )
    );
  }
  carrier[field] = entries;
}

function canonicalizeEvaluator(carrier: MutableJsonRecord): void {
  canonicalizeStringInventory(carrier, "consumedFieldRefs");
  canonicalizeStringInventory(carrier, "tags");
}

function canonicalizeRule(carrier: MutableJsonRecord): void {
  canonicalizeStringInventory(carrier, "tags");
}

function canonicalizeContribution(carrier: MutableJsonRecord): void {
  canonicalizeStringInventory(carrier, "programMembershipRefs");
  canonicalizeStringInventory(carrier, "readinessPrerequisiteRefs");
  canonicalizeStringInventory(carrier, "compatibilityRefs");
  canonicalizeStringInventory(carrier, "provenanceRefs");
}

function canonicalizeActionCatalog(carrier: MutableJsonRecord): void {
  canonicalizeRecordInventory(carrier, "rows", ["actionRef"]);
  const {
    catalogDigest: _catalogDigest,
    catalogRef: _catalogRef,
    ...catalogBody
  } = carrier;
  const catalogDigest = sha256Canonical(catalogBody);
  carrier.catalogDigest = catalogDigest;
  carrier.catalogRef =
    `action-catalog://product/${catalogDigest.slice("sha256:".length)}`;
}

function canonicalizeProgram(carrier: MutableJsonRecord): void {
  canonicalizeRecordInventory(carrier, "starts", ["startRef"]);
  canonicalizeStringInventory(carrier, "callableMembership");
  canonicalizeRecordInventory(carrier, "publicAssetTargets", ["handle"]);
  if (isRecord(carrier.actionCatalog)) {
    canonicalizeActionCatalog(mutable(carrier.actionCatalog));
  }
}

function canonicalizeGraphFunction(carrier: MutableJsonRecord): void {
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

function canonicalizeModulePublication(carrier: MutableJsonRecord): void {
  canonicalizeRecordInventory(carrier, "contracts", ["contractRef"]);
  canonicalizeRecordInventory(
    carrier,
    "evaluators",
    ["name"],
    canonicalizeEvaluator,
  );
  canonicalizeRecordInventory(carrier, "rules", ["name"], canonicalizeRule);
  canonicalizeRecordInventory(
    carrier,
    "implementationBindings",
    ["bindingRef"],
  );
  canonicalizeRecordInventory(
    carrier,
    "closureContracts",
    ["closureContractRef"],
  );
  canonicalizeRecordInventory(
    carrier,
    "programs",
    ["programRef"],
    canonicalizeProgram,
  );
  canonicalizeRecordInventory(
    carrier,
    "graphFunctions",
    ["name"],
    canonicalizeGraphFunction,
  );
  canonicalizeRecordInventory(
    carrier,
    "contributions",
    ["handle"],
    canonicalizeContribution,
  );
}

export function canonicalizeAuthoredGtlCarrier(
  value: Readonly<ModulePublication>,
  subjectKind: "module_publication",
): Readonly<ModulePublication>;
export function canonicalizeAuthoredGtlCarrier(
  value: Readonly<CatalogContribution>,
  subjectKind: "catalog_contribution",
): Readonly<CatalogContribution>;
export function canonicalizeAuthoredGtlCarrier(
  value: Readonly<GtlProgram>,
  subjectKind: "gtl_program",
): Readonly<GtlProgram>;
export function canonicalizeAuthoredGtlCarrier(
  value: Readonly<GraphFunction>,
  subjectKind: "graph_function",
): Readonly<GraphFunction>;
export function canonicalizeAuthoredGtlCarrier(
  value: JsonValue,
  subjectKind: CanonicalAuthoredGtlSubjectKind,
): JsonValue;
export function canonicalizeAuthoredGtlCarrier(
  value: unknown,
  subjectKind: CanonicalAuthoredGtlSubjectKind,
): unknown {
  const cloned = JSON.parse(canonicalJson(value as JsonValue)) as JsonValue;
  if (!isRecord(cloned)) return deepFreeze(cloned);
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
