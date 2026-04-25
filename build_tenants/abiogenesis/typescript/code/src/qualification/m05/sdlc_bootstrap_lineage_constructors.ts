import {
  parseNonEmptyString,
  parseOptionalField,
  parsePlainObject,
  parseStringArray,
  parseUnknownArray
} from "../../shared/validation/primitives.js";
import type {
  SdlcAmbiguityEntry,
  SdlcAssetLineageEntry,
  SdlcBootstrapInputKind,
  SdlcBootstrapInputRef,
  SdlcBootstrapInputSet,
  SdlcDerivationLedger,
  SdlcElementLineageEntry,
  SdlcProject,
  SdlcProjectElement,
  SdlcRuntimeProvenanceRef
} from "./sdlc_bootstrap_lineage_carriers.js";

function freezeStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function parseOptionalStringArrayField(
  input: ReturnType<typeof parsePlainObject>,
  field: string,
  label: string
): readonly string[] {
  const value = parseOptionalField(input, field);
  if (value === undefined) {
    return Object.freeze([]);
  }
  return parseStringArray(value, `${label}.${field}`);
}

function parseInputKind(input: unknown, label: string): SdlcBootstrapInputKind {
  const value = parseNonEmptyString(input, label);
  if (
    value === "unstructured" ||
    value === "loosely_structured" ||
    value === "structured"
  ) {
    return value;
  }
  throw new TypeError(`${label}: unsupported bootstrap input kind ${JSON.stringify(value)}`);
}

function duplicateIds(values: readonly SdlcBootstrapInputRef[]): readonly string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value.id)) {
      duplicates.add(value.id);
      continue;
    }
    seen.add(value.id);
  }
  return Object.freeze([...duplicates].sort());
}

function freezeRuntimeProvenance(
  input: SdlcRuntimeProvenanceRef
): SdlcRuntimeProvenanceRef {
  return Object.freeze({
    runId: input.runId,
    graphFunctionId: input.graphFunctionId,
    graphFunctionName: input.graphFunctionName,
    vectorId: input.vectorId,
    vectorName: input.vectorName,
    transitionKind: input.transitionKind,
    eventKinds: freezeStrings(input.eventKinds)
  });
}

export function constructSdlcBootstrapInputRef(
  input: SdlcBootstrapInputRef
): SdlcBootstrapInputRef {
  return Object.freeze({
    id: input.id,
    kind: input.kind,
    uri: input.uri,
    digest: input.digest,
    mediaType: input.mediaType,
    authorityMarkers: freezeStrings(input.authorityMarkers),
    detectedSchemas: freezeStrings(input.detectedSchemas),
    summary: input.summary
  });
}

export function admitSdlcBootstrapInputRef(
  input: unknown,
  label = "SdlcBootstrapInputRef"
): SdlcBootstrapInputRef {
  const object = parsePlainObject(input, label);
  return constructSdlcBootstrapInputRef({
    id: parseNonEmptyString(parseOptionalField(object, "id"), `${label}.id`),
    kind: parseInputKind(parseOptionalField(object, "kind"), `${label}.kind`),
    uri: parseNonEmptyString(parseOptionalField(object, "uri"), `${label}.uri`),
    digest: parseNonEmptyString(
      parseOptionalField(object, "digest"),
      `${label}.digest`
    ),
    mediaType: parseNonEmptyString(
      parseOptionalField(object, "mediaType"),
      `${label}.mediaType`
    ),
    authorityMarkers: parseOptionalStringArrayField(
      object,
      "authorityMarkers",
      label
    ),
    detectedSchemas: parseOptionalStringArrayField(
      object,
      "detectedSchemas",
      label
    ),
    summary: parseNonEmptyString(
      parseOptionalField(object, "summary"),
      `${label}.summary`
    )
  });
}

export function constructSdlcBootstrapInputSet(input: {
  readonly id: string;
  readonly inputs: readonly SdlcBootstrapInputRef[];
}): SdlcBootstrapInputSet {
  if (input.inputs.length === 0) {
    throw new TypeError("SdlcBootstrapInputSet.inputs: requires at least one input");
  }
  const duplicateInputIds = duplicateIds(input.inputs);
  if (duplicateInputIds.length > 0) {
    throw new TypeError(
      `SdlcBootstrapInputSet.inputs: duplicate input ids ${duplicateInputIds.join(", ")}`
    );
  }
  return Object.freeze({
    kind: "sdlc_bootstrap_input_set",
    id: input.id,
    inputs: Object.freeze(input.inputs.map(constructSdlcBootstrapInputRef))
  });
}

export function admitSdlcBootstrapInputSet(
  input: unknown,
  label = "SdlcBootstrapInputSet"
): SdlcBootstrapInputSet {
  const object = parsePlainObject(input, label);
  const kind = parseNonEmptyString(parseOptionalField(object, "kind"), `${label}.kind`);
  if (kind !== "sdlc_bootstrap_input_set") {
    throw new TypeError(`${label}.kind: expected sdlc_bootstrap_input_set`);
  }
  const inputs = parseUnknownArray(parseOptionalField(object, "inputs"), `${label}.inputs`).map(
    (entry, index) => admitSdlcBootstrapInputRef(entry, `${label}.inputs[${index}]`)
  );
  return constructSdlcBootstrapInputSet({
    id: parseNonEmptyString(parseOptionalField(object, "id"), `${label}.id`),
    inputs
  });
}

export function constructSdlcRuntimeProvenanceRef(
  input: SdlcRuntimeProvenanceRef
): SdlcRuntimeProvenanceRef {
  return freezeRuntimeProvenance(input);
}

export function constructSdlcProjectElement(
  input: SdlcProjectElement
): SdlcProjectElement {
  return Object.freeze({
    id: input.id,
    elementType: input.elementType,
    assetId: input.assetId,
    text: input.text,
    sourceInputIds: freezeStrings(input.sourceInputIds),
    confidence: input.confidence,
    authorityRefs: freezeStrings(input.authorityRefs)
  });
}

export function constructSdlcAssetLineageEntry(
  input: SdlcAssetLineageEntry
): SdlcAssetLineageEntry {
  return Object.freeze({
    id: input.id,
    sourceInputIds: freezeStrings(input.sourceInputIds),
    targetAssetId: input.targetAssetId,
    derivationKind: input.derivationKind,
    runtimeProvenance: freezeRuntimeProvenance(input.runtimeProvenance)
  });
}

export function constructSdlcElementLineageEntry(
  input: SdlcElementLineageEntry
): SdlcElementLineageEntry {
  return Object.freeze({
    id: input.id,
    sourceInputIds: freezeStrings(input.sourceInputIds),
    sourceElementIds: freezeStrings(input.sourceElementIds),
    targetElementId: input.targetElementId,
    derivationKind: input.derivationKind,
    claim: input.claim,
    evidenceRefs: freezeStrings(input.evidenceRefs),
    confidence: input.confidence,
    runtimeProvenance: freezeRuntimeProvenance(input.runtimeProvenance)
  });
}

export function constructSdlcDerivationLedger(
  input: SdlcDerivationLedger
): SdlcDerivationLedger {
  return Object.freeze({
    id: input.id,
    assetLineage: Object.freeze(
      input.assetLineage.map(constructSdlcAssetLineageEntry)
    ),
    elementLineage: Object.freeze(
      input.elementLineage.map(constructSdlcElementLineageEntry)
    )
  });
}

export function constructSdlcAmbiguityEntry(
  input: SdlcAmbiguityEntry
): SdlcAmbiguityEntry {
  return Object.freeze({
    id: input.id,
    sourceInputIds: freezeStrings(input.sourceInputIds),
    reason: input.reason,
    status: "open",
    runtimeProvenance: freezeRuntimeProvenance(input.runtimeProvenance)
  });
}

export function constructSdlcProject(input: SdlcProject): SdlcProject {
  return Object.freeze({
    kind: "sdlc_project",
    id: input.id,
    inputSetId: input.inputSetId,
    name: input.name,
    authoritySurfaceIds: freezeStrings(input.authoritySurfaceIds),
    elements: Object.freeze(input.elements.map(constructSdlcProjectElement)),
    ambiguityEntries: Object.freeze(
      input.ambiguityEntries.map(constructSdlcAmbiguityEntry)
    ),
    derivationLedger: constructSdlcDerivationLedger(input.derivationLedger)
  });
}
