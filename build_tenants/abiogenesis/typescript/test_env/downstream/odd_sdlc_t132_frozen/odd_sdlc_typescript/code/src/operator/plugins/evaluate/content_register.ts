// Implements: T-183

import {
  existsSync,
  readFileSync,
  statSync
} from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { EnginePluginInput, RuntimeRegime } from "@abiogenesis/typescript-tenant";
import { writeUtf8FileAtomically } from "../../../effects/archive_store.js";
import { uniqueLocaleSorted as uniqueSorted } from "../../../shared/collections.js";
import type { SdlcDesignDepthRegister } from "../../carriers.js";
import { parseDesignDepthRegisterPayload } from "../../design_depth_register.js";
import { writeSdlcSystemArtifact } from "../../system_artifacts.js";

export const SDLC_EVALUATE_AUTHORITY_FUNCTIONS = Object.freeze([
  "synthesize_model",
  "eval_gap",
  "evaluate_action",
  "evaluate_next"
] as const);

export type SdlcEvaluateAuthorityFunction =
  (typeof SDLC_EVALUATE_AUTHORITY_FUNCTIONS)[number];

export const SDLC_EVALUATE_CONTENT_CARRIER_FAMILIES = Object.freeze([
  "ProductAssetModel",
  "ObservationSnapshot",
  "GapPressureRow",
  "EdgeFulfillment",
  "EdgeClosureDecision",
  "NextActionProjection"
] as const);

export type SdlcEvaluateContentCarrierFamily =
  (typeof SDLC_EVALUATE_CONTENT_CARRIER_FAMILIES)[number];

export interface SdlcEvaluateContentRegisterRow {
  readonly kind: "sdlc_evaluate_content_register_row";
  readonly rowRef: string;
  readonly authorityFunction: SdlcEvaluateAuthorityFunction;
  readonly carrierFamily: SdlcEvaluateContentCarrierFamily;
  readonly contentKind: string;
  readonly payload: unknown;
  readonly sourceBasisRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface SdlcEvaluateContentRegister {
  readonly kind: "sdlc_evaluate_content_register";
  readonly registerVersion: "ts-evaluate-content-register-v1";
  readonly stage: "evaluate.C";
  readonly ruleRef: string;
  readonly ruleRole: "semantic_judgment";
  readonly computeMeans: RuntimeRegime;
  readonly authorityFunction: SdlcEvaluateAuthorityFunction;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly compositionContributionRef: string;
  readonly sourceBasisRefs: readonly string[];
  readonly candidateArtifactRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly contentRows: readonly SdlcEvaluateContentRegisterRow[];
}

export interface SdlcEvaluateContentRegisterAdmission {
  readonly kind: "sdlc_evaluate_content_register_admission";
  readonly status: "admitted" | "rejected";
  readonly register: SdlcEvaluateContentRegister | null;
  readonly blockingReasons: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface SdlcDesignDepthContentRegisterFirstUpdateObservation {
  readonly kind: "sdlc_design_depth_fp_evaluator_first_update_observation";
  readonly status: "pending" | "partial" | "observable" | "invalid";
  readonly contentRegisterRef: string;
  readonly rowCount: number;
  readonly draftRowCount: number;
  readonly fragmentRowCount: number;
  readonly observedSections: readonly string[];
  readonly missingSections: readonly string[];
  readonly observedAt: string;
  readonly reason: string | null;
}

export interface SdlcEvaluateContentRegisterSelectedIdentity {
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
}

export const SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_CONTENT_KIND =
  "sdlc_design_depth_register_fragment" as const;

export const SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_DRAFT_CONTENT_KIND =
  "sdlc_design_depth_register_fragment_draft" as const;

export const SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_SECTIONS = Object.freeze([
  "stackProfileRows",
  "implementationModuleRows",
  "aggregateDomainModelRows",
  "moduleSchemaFragments",
  "moduleStateDiagramFragments",
  "aggregateDomainModel",
  "sunnyDaySequenceRows",
  "aggregateSunnyDaySequence",
  "componentTopologyRows",
  "componentRealizationRows",
  "fileTargetRows",
  "designCompletenessVerdict"
] as const);

export type SdlcDesignDepthRegisterFragmentSection =
  (typeof SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_SECTIONS)[number];

export interface SdlcDesignDepthRegisterFragment {
  readonly kind: "sdlc_design_depth_register_fragment";
  readonly fragmentVersion: "ts-design-depth-fragment-v1";
  readonly targetAssetType: string;
  readonly section: SdlcDesignDepthRegisterFragmentSection;
  readonly sequence: number;
  readonly mergeMode: "replace";
  readonly value: unknown;
}

export interface SdlcDesignDepthDraftFragmentUpdate {
  readonly section: SdlcDesignDepthRegisterFragmentSection;
  readonly value: unknown;
  readonly sourceBasisRefs?: readonly string[] | undefined;
  readonly evidenceRefs?: readonly string[] | undefined;
}

export const DESIGN_DEPTH_DRAFT_FRAGMENT_UPDATE_HELPER_CONTRACT_REF =
  "evaluation-helper://odd-sdlc/design-depth/draft-fragment-update" as const;

export const DESIGN_DEPTH_DRAFT_FRAGMENT_UPDATE_HELPER_CONTRACT_PATH =
  "config/evaluator-helper-contracts/design_depth_draft_fragment_update.md" as const;

const DESIGN_DEPTH_REGISTER_VERSION = "ts-design-depth-v1" as const;

function stableJson(input: unknown): string {
  if (Array.isArray(input)) {
    return `[${input.map((entry) => stableJson(entry)).join(",")}]`;
  }
  if (input !== null && typeof input === "object") {
    return `{${Object.entries(input)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${JSON.stringify(key)}:${stableJson(value)}`)
      .join(",")}}`;
  }
  return JSON.stringify(input);
}

function prettyStableJson(input: unknown): string {
  return `${JSON.stringify(JSON.parse(stableJson(input)), null, 2)}\n`;
}

function objectRecord(input: unknown): Record<string, unknown> | null {
  return typeof input === "object" && input !== null && !Array.isArray(input)
    ? Object.fromEntries(Object.entries(input))
    : null;
}

function requireExactKeys(
  record: Record<string, unknown>,
  allowedKeys: readonly string[],
  label: string
): void {
  const allowed = new Set(allowedKeys);
  const unexpected = Object.keys(record)
    .filter((key) => !allowed.has(key))
    .sort((left, right) => left.localeCompare(right));
  const missing = allowedKeys.filter((key) => !(key in record));
  if (unexpected.length > 0 || missing.length > 0) {
    const details = [
      ...(unexpected.length === 0
        ? []
        : [`unexpected keys ${unexpected.join(", ")}`]),
      ...(missing.length === 0 ? [] : [`missing keys ${missing.join(", ")}`])
    ].join("; ");
    throw new TypeError(`${label}: exact carrier keys required${details.length === 0 ? "" : ` (${details})`}`);
  }
}

function parseNonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${label}: expected non-empty string`);
  }
  return value;
}

function parseNullableString(value: unknown, label: string): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return parseNonEmptyString(value, label);
}

function parseStringArray(value: unknown, label: string): readonly string[] {
  if (!Array.isArray(value)) {
    throw new TypeError(`${label}: expected string array`);
  }
  return Object.freeze(
    value.map((item, index) => parseNonEmptyString(item, `${label}[${index}]`))
  );
}

function parseEnumValue<T extends string>(
  value: unknown,
  label: string,
  allowed: readonly T[]
): T {
  const parsed = parseNonEmptyString(value, label);
  const matched = allowed.find((candidate) => candidate === parsed);
  if (matched === undefined) {
    throw new TypeError(`${label}: expected one of ${allowed.join(", ")}`);
  }
  return matched;
}

function parsePositiveInteger(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${label}: expected positive integer`);
  }
  return value;
}

function parseComputeMeans(value: unknown, label: string): RuntimeRegime {
  return parseEnumValue(value, label, Object.freeze(["F_D", "F_P", "F_H"]));
}

function parseDesignDepthRegisterFragment(
  input: unknown,
  label: string
): SdlcDesignDepthRegisterFragment {
  const record = objectRecord(input);
  if (record === null) {
    throw new TypeError(`${label}: expected object`);
  }
  requireExactKeys(
    record,
    [
      "kind",
      "fragmentVersion",
      "targetAssetType",
      "section",
      "sequence",
      "mergeMode",
      "value"
    ],
    label
  );
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_design_depth_register_fragment") {
    throw new TypeError(`${label}.kind: expected sdlc_design_depth_register_fragment`);
  }
  const fragmentVersion = parseNonEmptyString(
    record["fragmentVersion"],
    `${label}.fragmentVersion`
  );
  if (fragmentVersion !== "ts-design-depth-fragment-v1") {
    throw new TypeError(`${label}.fragmentVersion: expected ts-design-depth-fragment-v1`);
  }
  return Object.freeze({
    kind: "sdlc_design_depth_register_fragment" as const,
    fragmentVersion: "ts-design-depth-fragment-v1" as const,
    targetAssetType: parseNonEmptyString(
      record["targetAssetType"],
      `${label}.targetAssetType`
    ),
    section: parseEnumValue(
      record["section"],
      `${label}.section`,
      SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_SECTIONS
    ),
    sequence: parsePositiveInteger(record["sequence"], `${label}.sequence`),
    mergeMode: parseEnumValue(
      record["mergeMode"],
      `${label}.mergeMode`,
      Object.freeze(["replace"] as const)
    ),
    value: record["value"]
  });
}

function parseRow(input: unknown, label: string): SdlcEvaluateContentRegisterRow {
  const record = objectRecord(input);
  if (record === null) {
    throw new TypeError(`${label}: expected object`);
  }
  requireExactKeys(
    record,
    [
      "kind",
      "rowRef",
      "authorityFunction",
      "carrierFamily",
      "contentKind",
      "payload",
      "sourceBasisRefs",
      "evidenceRefs"
    ],
    label
  );
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_evaluate_content_register_row") {
    throw new TypeError(`${label}.kind: expected sdlc_evaluate_content_register_row`);
  }
  return Object.freeze({
    kind: "sdlc_evaluate_content_register_row" as const,
    rowRef: parseNonEmptyString(record["rowRef"], `${label}.rowRef`),
    authorityFunction: parseEnumValue(
      record["authorityFunction"],
      `${label}.authorityFunction`,
      SDLC_EVALUATE_AUTHORITY_FUNCTIONS
    ),
    carrierFamily: parseEnumValue(
      record["carrierFamily"],
      `${label}.carrierFamily`,
      SDLC_EVALUATE_CONTENT_CARRIER_FAMILIES
    ),
    contentKind: parseNonEmptyString(record["contentKind"], `${label}.contentKind`),
    payload: record["payload"],
    sourceBasisRefs: parseStringArray(
      record["sourceBasisRefs"],
      `${label}.sourceBasisRefs`
    ),
    evidenceRefs: parseStringArray(record["evidenceRefs"], `${label}.evidenceRefs`)
  });
}

function parseRegister(input: unknown): SdlcEvaluateContentRegister {
  const record = objectRecord(input);
  if (record === null) {
    throw new TypeError("sdlc_evaluate_content_register: expected object");
  }
  requireExactKeys(
    record,
    [
      "kind",
      "registerVersion",
      "stage",
      "ruleRef",
      "ruleRole",
      "computeMeans",
      "authorityFunction",
      "selectedCompositionRef",
      "selectedCompositionDigest",
      "selectedCompositionSelectionRef",
      "selectedRegimeBindingRef",
      "compositionContributionRef",
      "sourceBasisRefs",
      "candidateArtifactRefs",
      "evidenceRefs",
      "contentRows"
    ],
    "sdlc_evaluate_content_register"
  );
  const kind = parseNonEmptyString(record["kind"], "register.kind");
  if (kind !== "sdlc_evaluate_content_register") {
    throw new TypeError("register.kind: expected sdlc_evaluate_content_register");
  }
  const registerVersion = parseNonEmptyString(
    record["registerVersion"],
    "register.registerVersion"
  );
  if (registerVersion !== "ts-evaluate-content-register-v1") {
    throw new TypeError("register.registerVersion: expected ts-evaluate-content-register-v1");
  }
  const stage = parseNonEmptyString(record["stage"], "register.stage");
  if (stage !== "evaluate.C") {
    throw new TypeError("register.stage: expected evaluate.C");
  }
  const ruleRole = parseNonEmptyString(record["ruleRole"], "register.ruleRole");
  if (ruleRole !== "semantic_judgment") {
    throw new TypeError("register.ruleRole: expected semantic_judgment");
  }
  const contentRows = Array.isArray(record["contentRows"])
    ? Object.freeze(
        record["contentRows"].map((row, index) =>
          parseRow(row, `register.contentRows[${index}]`)
        )
      )
    : (() => {
        throw new TypeError("register.contentRows: expected array");
      })();
  if (contentRows.length === 0) {
    throw new TypeError("register.contentRows: expected at least one row");
  }
  return Object.freeze({
    kind: "sdlc_evaluate_content_register" as const,
    registerVersion: "ts-evaluate-content-register-v1" as const,
    stage: "evaluate.C" as const,
    ruleRef: parseNonEmptyString(record["ruleRef"], "register.ruleRef"),
    ruleRole: "semantic_judgment" as const,
    computeMeans: parseComputeMeans(record["computeMeans"], "register.computeMeans"),
    authorityFunction: parseEnumValue(
      record["authorityFunction"],
      "register.authorityFunction",
      SDLC_EVALUATE_AUTHORITY_FUNCTIONS
    ),
    selectedCompositionRef: parseNonEmptyString(
      record["selectedCompositionRef"],
      "register.selectedCompositionRef"
    ),
    selectedCompositionDigest: parseNonEmptyString(
      record["selectedCompositionDigest"],
      "register.selectedCompositionDigest"
    ),
    selectedCompositionSelectionRef: parseNonEmptyString(
      record["selectedCompositionSelectionRef"],
      "register.selectedCompositionSelectionRef"
    ),
    selectedRegimeBindingRef: parseNullableString(
      record["selectedRegimeBindingRef"],
      "register.selectedRegimeBindingRef"
    ),
    compositionContributionRef: parseNonEmptyString(
      record["compositionContributionRef"],
      "register.compositionContributionRef"
    ),
    sourceBasisRefs: parseStringArray(
      record["sourceBasisRefs"],
      "register.sourceBasisRefs"
    ),
    candidateArtifactRefs: parseStringArray(
      record["candidateArtifactRefs"],
      "register.candidateArtifactRefs"
    ),
    evidenceRefs: parseStringArray(record["evidenceRefs"], "register.evidenceRefs"),
    contentRows
  });
}

function requireUniqueDesignDepthFragmentUpdates(
  updates: readonly SdlcDesignDepthDraftFragmentUpdate[]
): ReadonlyMap<SdlcDesignDepthRegisterFragmentSection, SdlcDesignDepthDraftFragmentUpdate> {
  const updateBySection = new Map<
    SdlcDesignDepthRegisterFragmentSection,
    SdlcDesignDepthDraftFragmentUpdate
  >();
  for (const update of updates) {
    if (!SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_SECTIONS.includes(update.section)) {
      throw new TypeError(
        `design-depth draft-fragment update section ${update.section}: not allowed`
      );
    }
    if (updateBySection.has(update.section)) {
      throw new TypeError(
        `design-depth draft-fragment update section ${update.section}: duplicate`
      );
    }
    updateBySection.set(update.section, update);
  }
  const missingSections = SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_SECTIONS.filter(
    (section) => !updateBySection.has(section)
  );
  if (missingSections.length > 0) {
    throw new TypeError(
      `design-depth draft-fragment update missing sections: ${missingSections.join(", ")}`
    );
  }
  return updateBySection;
}

function designDepthDraftRowsBySection(
  register: SdlcEvaluateContentRegister
): ReadonlyMap<SdlcDesignDepthRegisterFragmentSection, SdlcEvaluateContentRegisterRow> {
  const draftRows = new Map<
    SdlcDesignDepthRegisterFragmentSection,
    SdlcEvaluateContentRegisterRow
  >();
  for (const [index, row] of register.contentRows.entries()) {
    if (
      row.contentKind !== SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_DRAFT_CONTENT_KIND &&
      !row.rowRef.startsWith("content-register-row-draft://")
    ) {
      continue;
    }
    const payload = parseDesignDepthRegisterFragment(
      row.payload,
      `register.contentRows[${index}].payload`
    );
    if (draftRows.has(payload.section)) {
      throw new TypeError(
        `design-depth draft row section ${payload.section}: duplicate`
      );
    }
    draftRows.set(payload.section, row);
  }
  const missingSections = SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_SECTIONS.filter(
    (section) => !draftRows.has(section)
  );
  if (missingSections.length > 0) {
    throw new TypeError(
      `design-depth draft register missing sections: ${missingSections.join(", ")}`
    );
  }
  return draftRows;
}

export function constructDesignDepthDraftFragmentContentRegisterUpdate(input: {
  readonly draftRegister: SdlcEvaluateContentRegister;
  readonly targetAssetType: string;
  readonly updates: readonly SdlcDesignDepthDraftFragmentUpdate[];
}): SdlcEvaluateContentRegister {
  const updateBySection = requireUniqueDesignDepthFragmentUpdates(input.updates);
  const draftRows = designDepthDraftRowsBySection(input.draftRegister);
  return Object.freeze({
    ...input.draftRegister,
    contentRows: Object.freeze(
      SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_SECTIONS.map((section, index) => {
        const draftRow = draftRows.get(section);
        const update = updateBySection.get(section);
        if (draftRow === undefined || update === undefined) {
          throw new TypeError(
            `design-depth draft-fragment update section ${section}: missing`
          );
        }
        return Object.freeze({
          kind: "sdlc_evaluate_content_register_row" as const,
          rowRef: `content-register-row://odd-sdlc/design-depth/${section}`,
          authorityFunction: input.draftRegister.authorityFunction,
          carrierFamily: "ProductAssetModel" as const,
          contentKind: SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_CONTENT_KIND,
          payload: Object.freeze({
            kind: "sdlc_design_depth_register_fragment" as const,
            fragmentVersion: "ts-design-depth-fragment-v1" as const,
            targetAssetType: input.targetAssetType,
            section,
            sequence: index + 1,
            mergeMode: "replace" as const,
            value: update.value
          }),
          sourceBasisRefs: Object.freeze([
            ...(update.sourceBasisRefs ?? draftRow.sourceBasisRefs)
          ]),
          evidenceRefs: Object.freeze([
            ...(update.evidenceRefs ?? draftRow.evidenceRefs)
          ])
        });
      })
    )
  });
}

export function writeDesignDepthDraftFragmentContentRegisterUpdate(input: {
  readonly registerPath: string;
  readonly draftRegister: SdlcEvaluateContentRegister;
  readonly targetAssetType: string;
  readonly updates: readonly SdlcDesignDepthDraftFragmentUpdate[];
}): string {
  const nextRegister = constructDesignDepthDraftFragmentContentRegisterUpdate({
    draftRegister: input.draftRegister,
    targetAssetType: input.targetAssetType,
    updates: input.updates
  });
  return writeUtf8FileAtomically({
    targetPath: input.registerPath,
    content: prettyStableJson(nextRegister)
  });
}

export function sdlcEvaluateContentRegisterPath(input: {
  readonly archiveRoot: string;
  readonly ruleFilePrefix: string;
}): string {
  return join(input.archiveRoot, `${input.ruleFilePrefix}_content_register.json`);
}

export function designDepthFpEvaluatorContentRegisterPath(input: {
  readonly archiveRoot: string;
}): string {
  return sdlcEvaluateContentRegisterPath({
    archiveRoot: input.archiveRoot,
    ruleFilePrefix: "design_depth_fp_evaluator"
  });
}

export function observeDesignDepthContentRegisterFirstUpdate(input: {
  readonly registerPath: string;
}): SdlcDesignDepthContentRegisterFirstUpdateObservation {
  const contentRegisterRef = pathToFileURL(input.registerPath).href;
  if (!existsSync(input.registerPath) || !statSync(input.registerPath).isFile()) {
    return Object.freeze({
      kind: "sdlc_design_depth_fp_evaluator_first_update_observation" as const,
      status: "pending" as const,
      contentRegisterRef,
      rowCount: 0,
      draftRowCount: 0,
      fragmentRowCount: 0,
      observedSections: Object.freeze([]),
      missingSections: SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_SECTIONS,
      observedAt: new Date().toISOString(),
      reason: "content_register_missing"
    });
  }
  try {
    const register = parseRegister(
      JSON.parse(readFileSync(input.registerPath, "utf8"))
    );
    const draftRowCount = register.contentRows.filter(
      (row) =>
        row.contentKind === SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_DRAFT_CONTENT_KIND ||
        row.rowRef.startsWith("content-register-row-draft://")
    ).length;
    const observedSections = uniqueSorted(
      register.contentRows
        .filter(
          (row) =>
            row.contentKind === SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_CONTENT_KIND &&
            !row.rowRef.startsWith("content-register-row-draft://")
        )
        .map((row) => objectRecord(row.payload)?.["section"])
        .filter((section): section is string => typeof section === "string")
    );
    const missingSections = SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_SECTIONS.filter(
      (section) => !observedSections.includes(section)
    );
    const fragmentRowCount = observedSections.length;
    return Object.freeze({
      kind: "sdlc_design_depth_fp_evaluator_first_update_observation" as const,
      status:
        missingSections.length === 0 && draftRowCount === 0
          ? "observable"
          : fragmentRowCount > 0
            ? "partial"
            : "pending",
      contentRegisterRef,
      rowCount: register.contentRows.length,
      draftRowCount,
      fragmentRowCount,
      observedSections,
      missingSections: Object.freeze([...missingSections]),
      observedAt: new Date().toISOString(),
      reason:
        missingSections.length === 0 && draftRowCount === 0
          ? null
          : fragmentRowCount === 0
            ? "no_non_draft_fragment_rows"
            : "incomplete_non_draft_fragment_sections"
    });
  } catch (error) {
    return Object.freeze({
      kind: "sdlc_design_depth_fp_evaluator_first_update_observation" as const,
      status: "invalid" as const,
      contentRegisterRef,
      rowCount: 0,
      draftRowCount: 0,
      fragmentRowCount: 0,
      observedSections: Object.freeze([]),
      missingSections: SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_SECTIONS,
      observedAt: new Date().toISOString(),
      reason: error instanceof Error ? error.message : "content_register_invalid"
    });
  }
}

export function admitSdlcEvaluateContentRegisterArtifact(input: {
  readonly registerPath: string;
  readonly pluginInput: EnginePluginInput;
  readonly ruleRef: string;
  readonly authorityFunction: SdlcEvaluateAuthorityFunction;
  readonly computeMeans?: RuntimeRegime | undefined;
}): SdlcEvaluateContentRegisterAdmission {
  return admitSdlcEvaluateContentRegisterArtifactForSelectedIdentity({
    registerPath: input.registerPath,
    selectedIdentity: Object.freeze({
      selectedCompositionRef: input.pluginInput.selectedCompositionRef,
      selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
      selectedCompositionSelectionRef:
        input.pluginInput.selectedCompositionSelectionRef,
      selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef ?? null
    }),
    ruleRef: input.ruleRef,
    authorityFunction: input.authorityFunction,
    computeMeans: input.computeMeans
  });
}

export function admitSdlcEvaluateContentRegisterArtifactForSelectedIdentity(input: {
  readonly registerPath: string;
  readonly selectedIdentity: SdlcEvaluateContentRegisterSelectedIdentity;
  readonly ruleRef: string;
  readonly authorityFunction: SdlcEvaluateAuthorityFunction;
  readonly computeMeans?: RuntimeRegime | undefined;
}): SdlcEvaluateContentRegisterAdmission {
  const evidenceRefs = Object.freeze([pathToFileURL(input.registerPath).href]);
  if (!existsSync(input.registerPath) || !statSync(input.registerPath).isFile()) {
    return Object.freeze({
      kind: "sdlc_evaluate_content_register_admission" as const,
      status: "rejected" as const,
      register: null,
      blockingReasons: Object.freeze(["evaluate_content_register_missing"]),
      evidenceRefs
    });
  }
  try {
    const register = parseRegister(JSON.parse(readFileSync(input.registerPath, "utf8")));
    const blockingReasons: string[] = [];
    if (register.ruleRef !== input.ruleRef) {
      blockingReasons.push("evaluate_content_register_rule_ref_mismatch");
    }
    if (register.authorityFunction !== input.authorityFunction) {
      blockingReasons.push("evaluate_content_register_authority_function_mismatch");
    }
    if ((input.computeMeans ?? "F_P") !== register.computeMeans) {
      blockingReasons.push("evaluate_content_register_compute_means_mismatch");
    }
    if (
      register.selectedCompositionRef !==
      input.selectedIdentity.selectedCompositionRef
    ) {
      blockingReasons.push("evaluate_content_register_selected_composition_ref_mismatch");
    }
    if (
      register.selectedCompositionDigest !==
      input.selectedIdentity.selectedCompositionDigest
    ) {
      blockingReasons.push("evaluate_content_register_selected_composition_digest_mismatch");
    }
    if (
      register.selectedCompositionSelectionRef !==
      input.selectedIdentity.selectedCompositionSelectionRef
    ) {
      blockingReasons.push(
        "evaluate_content_register_selected_composition_selection_ref_mismatch"
      );
    }
    if (
      register.selectedRegimeBindingRef !==
      input.selectedIdentity.selectedRegimeBindingRef
    ) {
      blockingReasons.push("evaluate_content_register_selected_regime_binding_ref_mismatch");
    }
    if (
      register.contentRows.some(
        (row) => row.authorityFunction !== register.authorityFunction
      )
    ) {
      blockingReasons.push("evaluate_content_register_row_authority_function_mismatch");
    }
    if (blockingReasons.length > 0) {
      return Object.freeze({
        kind: "sdlc_evaluate_content_register_admission" as const,
        status: "rejected" as const,
        register: null,
        blockingReasons: Object.freeze(blockingReasons),
        evidenceRefs
      });
    }
    return Object.freeze({
      kind: "sdlc_evaluate_content_register_admission" as const,
      status: "admitted" as const,
      register,
      blockingReasons: Object.freeze([]),
      evidenceRefs: uniqueSorted([...evidenceRefs, ...register.evidenceRefs])
    });
  } catch (error) {
    return Object.freeze({
      kind: "sdlc_evaluate_content_register_admission" as const,
      status: "rejected" as const,
      register: null,
      blockingReasons: Object.freeze([
        `evaluate_content_register_invalid:${error instanceof Error ? error.message : "unknown"}`
      ]),
      evidenceRefs
    });
  }
}

function emptyDesignDepthRegister(targetAssetType: string): Record<string, unknown> {
  return {
    kind: "sdlc_design_depth_register",
    registerVersion: DESIGN_DEPTH_REGISTER_VERSION,
    targetAssetType,
    stackProfileRows: [],
    implementationModuleRows: [],
    aggregateDomainModelRows: [],
    moduleSchemaFragments: [],
    moduleStateDiagramFragments: [],
    aggregateDomainModel: null,
    sunnyDaySequenceRows: [],
    aggregateSunnyDaySequence: null,
    componentTopologyRows: [],
    componentRealizationRows: [],
    fileTargetRows: [],
    designCompletenessVerdict: null
  };
}

function fileTargetRoleByRelativePath(
  input: unknown
): ReadonlyMap<string, string> {
  const roles = new Map<string, string>();
  if (!Array.isArray(input)) {
    return roles;
  }
  for (const candidate of input) {
    const record = objectRecord(candidate);
    if (record === null) {
      continue;
    }
    const relativePath = record["relativePath"];
    const role = record["role"];
    if (typeof relativePath === "string" && typeof role === "string") {
      roles.set(relativePath, canonicalFileTargetRole(role) ?? role);
    }
  }
  return roles;
}

function canonicalFileTargetRole(role: string): string | null {
  const normalized = role.trim().toLowerCase().replace(/[-\s/]+/gu, "_");
  switch (normalized) {
    case "source":
    case "source_implementation":
    case "implementation_source":
    case "source_code":
    case "runtime_source":
      return "source";
    case "test":
    case "unit_test":
    case "component_test":
      return "test";
    case "build_config":
    case "build_plugin":
    case "manifest":
    case "package_manifest":
      return "build_config";
    case "design":
    case "documentation":
    case "other":
      return normalized;
    default:
      return null;
  }
}

function normalizeFileTargetRows(input: Record<string, unknown>): Record<string, unknown> {
  const rows = input["fileTargetRows"];
  if (!Array.isArray(rows)) {
    return input;
  }
  let changed = false;
  const normalizedRows = rows.map((row) => {
    const record = objectRecord(row);
    const role = record?.["role"];
    if (record === null || typeof role !== "string") {
      return row;
    }
    const canonicalRole = canonicalFileTargetRole(role);
    if (canonicalRole === null || canonicalRole === role) {
      return row;
    }
    changed = true;
    return Object.freeze({
      ...record,
      role: canonicalRole
    });
  });
  return changed
    ? Object.freeze({ ...input, fileTargetRows: Object.freeze(normalizedRows) })
    : input;
}

function dropNonSourceFileTargetComponentRows(
  input: Record<string, unknown>
): Record<string, unknown> {
  const roleNormalizedInput = normalizeFileTargetRows(input);
  const nonSourceFileTargets = new Set(
    [...fileTargetRoleByRelativePath(roleNormalizedInput["fileTargetRows"]).entries()]
      .filter(([, role]) => role !== "source")
      .map(([relativePath]) => relativePath)
  );
  if (nonSourceFileTargets.size === 0) {
    return roleNormalizedInput;
  }
  let changed = false;
  const normalized: Record<string, unknown> = { ...roleNormalizedInput };
  for (const section of ["componentTopologyRows", "componentRealizationRows"]) {
    const rows = roleNormalizedInput[section];
    if (!Array.isArray(rows)) {
      continue;
    }
    const filteredRows = rows.filter((row) => {
      const record = objectRecord(row);
      const relativePath = record?.["relativePath"];
      return (
        typeof relativePath !== "string" ||
        !nonSourceFileTargets.has(relativePath)
      );
    });
    if (filteredRows.length !== rows.length) {
      normalized[section] = Object.freeze(filteredRows);
      changed = true;
    }
  }
  return changed ? Object.freeze(normalized) : input;
}

function normalizeDesignDepthContentRegisterPayload(input: unknown): unknown {
  const record = objectRecord(input);
  if (record === null || record["kind"] !== "sdlc_design_depth_register") {
    return input;
  }
  let changed = false;
  const normalized = { ...record };
  for (const key of ["modelVersion", "sequenceVersion", "verdictVersion"]) {
    if (normalized[key] === DESIGN_DEPTH_REGISTER_VERSION) {
      delete normalized[key];
      changed = true;
    }
  }
  const normalizedRows = dropNonSourceFileTargetComponentRows(normalized);
  if (normalizedRows !== normalized) {
    return normalizedRows;
  }
  return changed ? Object.freeze(normalized) : input;
}

function designDepthRegisterPayloadFromFragments(
  register: SdlcEvaluateContentRegister
): SdlcDesignDepthRegister | null {
  const fragmentRows = register.contentRows.filter(
    (candidate) =>
      candidate.authorityFunction === "synthesize_model" &&
      candidate.carrierFamily === "ProductAssetModel" &&
      candidate.contentKind === SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_CONTENT_KIND &&
      !candidate.rowRef.startsWith("content-register-row-draft://")
  );
  if (fragmentRows.length === 0) {
    return null;
  }

  let fragments: readonly SdlcDesignDepthRegisterFragment[];
  try {
    fragments = Object.freeze(
      fragmentRows.map((row, index) =>
        parseDesignDepthRegisterFragment(
          row.payload,
          `register.contentRows[${index}].payload`
        )
      )
    );
  } catch {
    return null;
  }

  const firstTargetAssetType = fragments[0]?.targetAssetType;
  if (
    firstTargetAssetType === undefined ||
    fragments.some((fragment) => fragment.targetAssetType !== firstTargetAssetType)
  ) {
    return null;
  }
  const observedSections = new Set<SdlcDesignDepthRegisterFragmentSection>(
    fragments.map((fragment) => fragment.section)
  );
  if (
    SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_SECTIONS.some(
      (section) => !observedSections.has(section)
    )
  ) {
    return null;
  }

  const assembled = emptyDesignDepthRegister(firstTargetAssetType);
  for (const fragment of [...fragments].sort(
    (left, right) => left.sequence - right.sequence
  )) {
    assembled[fragment.section] = fragment.value;
  }
  try {
    return parseDesignDepthRegisterPayload(
      dropNonSourceFileTargetComponentRows(assembled)
    );
  } catch (error) {
    throw new TypeError(
      `evaluate_content_register_design_depth_payload_invalid:${error instanceof Error ? error.message : "unknown"}`
    );
  }
}

export function designDepthRegisterPayloadFromEvaluateContentRegister(
  register: SdlcEvaluateContentRegister
): SdlcDesignDepthRegister | null {
  const row = register.contentRows.find(
    (candidate) =>
      candidate.authorityFunction === "synthesize_model" &&
      candidate.carrierFamily === "ProductAssetModel" &&
      candidate.contentKind === "sdlc_design_depth_register"
  );
  if (row === undefined) {
    return designDepthRegisterPayloadFromFragments(register);
  }
  try {
    return parseDesignDepthRegisterPayload(
      normalizeDesignDepthContentRegisterPayload(row.payload)
    );
  } catch (error) {
    throw new TypeError(
      `evaluate_content_register_design_depth_payload_invalid:${error instanceof Error ? error.message : "unknown"}`
    );
  }
}

export function writeDesignDepthRegisterProjectionFromEvaluateContentRegister(input: {
  readonly register: SdlcEvaluateContentRegister;
  readonly archiveRoot: string;
  readonly registerPath: string;
}): string {
  const payload = designDepthRegisterPayloadFromEvaluateContentRegister(input.register);
  if (payload === null) {
    throw new TypeError("evaluate content register has no design-depth register payload");
  }
  writeSdlcSystemArtifact({
    archiveRoot: input.archiveRoot,
    absolutePath: input.registerPath,
    payload: prettyStableJson(payload)
  });
  return pathToFileURL(input.registerPath).href;
}
