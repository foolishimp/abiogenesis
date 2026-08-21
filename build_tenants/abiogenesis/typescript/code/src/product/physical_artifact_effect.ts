import {
  lstat,
  mkdtemp,
  readFile,
  readdir,
  readlink,
} from "node:fs/promises";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";

import { type JsonValue } from "../shared/canonical_json.js";
import {
  isSha256Digest,
  sha256Bytes,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";

export type PhysicalArtifactOwner = "product_install" | "workspace_create";

export interface PhysicalArtifactInventoryEntry {
  readonly relativeLocator: string;
  readonly artifactKind: "directory" | "file" | "symbolic_link" | "other";
  readonly byteLength: number | null;
  readonly contentDigest: Sha256Digest | null;
  readonly linkTarget: string | null;
}

export interface PhysicalArtifactObservation {
  readonly kind: "physical_artifact_observation";
  readonly schemaVersion: "5.0.0";
  readonly rootLocator: string;
  readonly disposition: "absent" | "observed" | "observation_refused";
  readonly inventory: readonly PhysicalArtifactInventoryEntry[];
  readonly inventoryDigest: Sha256Digest;
  readonly observationFailure: string | null;
}

export interface PhysicalArtifactCompensationEvidence {
  readonly kind: "physical_artifact_compensation_evidence";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "cleared" | "residue_preserved";
  readonly attemptedLocators: readonly string[];
  readonly refusal: string | null;
}

export interface PhysicalArtifactEffectEvidence {
  readonly kind: "physical_artifact_effect_evidence";
  readonly schemaVersion: "5.0.0";
  readonly owner: PhysicalArtifactOwner;
  readonly targetRoot: string;
  readonly stagingRoot: string | null;
  readonly targetBefore: PhysicalArtifactObservation;
  readonly targetAtFailure: PhysicalArtifactObservation | null;
  readonly stagingAtFailure: PhysicalArtifactObservation | null;
  readonly compensation: PhysicalArtifactCompensationEvidence;
  readonly targetAfter: PhysicalArtifactObservation;
  readonly stagingAfter: PhysicalArtifactObservation | null;
  readonly evidenceDigest: Sha256Digest;
}

export interface OwnedPhysicalResidueAssessment {
  readonly owner: PhysicalArtifactOwner;
  readonly targetRoot: string;
  readonly stagingRoot: string | null;
  readonly targetBefore: PhysicalArtifactObservation;
  readonly targetAtFailure: PhysicalArtifactObservation;
  readonly stagingAtFailure: PhysicalArtifactObservation | null;
  readonly ownedLocators: readonly string[];
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Readonly<Record<string, unknown>>,
  keys: readonly string[],
): boolean {
  return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}

function validateInventoryEntry(
  value: unknown,
): value is PhysicalArtifactInventoryEntry {
  return isRecord(value) &&
    hasExactKeys(value, [
      "artifactKind",
      "byteLength",
      "contentDigest",
      "linkTarget",
      "relativeLocator",
    ]) &&
    typeof value.relativeLocator === "string" &&
    (value.relativeLocator === "." ||
      (!isAbsolute(value.relativeLocator) &&
        value.relativeLocator.split("/").every((part) =>
          part.length > 0 && part !== "." && part !== ".."
        ))) &&
    (value.artifactKind === "directory" || value.artifactKind === "file" ||
      value.artifactKind === "symbolic_link" || value.artifactKind === "other") &&
    (value.byteLength === null ||
      (Number.isSafeInteger(value.byteLength) && (value.byteLength as number) >= 0)) &&
    (value.contentDigest === null || isSha256Digest(value.contentDigest)) &&
    (value.linkTarget === null || typeof value.linkTarget === "string") &&
    (value.artifactKind === "file"
      ? value.byteLength !== null && value.contentDigest !== null &&
        value.linkTarget === null
      : value.artifactKind === "symbolic_link"
      ? value.byteLength === null && value.contentDigest === null &&
        value.linkTarget !== null
      : value.byteLength === null && value.contentDigest === null &&
        value.linkTarget === null);
}

export function validatePhysicalArtifactObservation(
  value: unknown,
): value is PhysicalArtifactObservation {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "disposition",
      "inventory",
      "inventoryDigest",
      "kind",
      "observationFailure",
      "rootLocator",
      "schemaVersion",
    ]) ||
    value.kind !== "physical_artifact_observation" ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.rootLocator !== "string" ||
    !isAbsolute(value.rootLocator) ||
    resolve(value.rootLocator) !== value.rootLocator ||
    (value.disposition !== "absent" && value.disposition !== "observed" &&
      value.disposition !== "observation_refused") ||
    !Array.isArray(value.inventory) ||
    !value.inventory.every(validateInventoryEntry) ||
    !isSha256Digest(value.inventoryDigest) ||
    (value.observationFailure !== null &&
      typeof value.observationFailure !== "string")
  ) return false;
  const locators = value.inventory.map((entry) => entry.relativeLocator);
  const orderedLocators = [...locators].sort();
  const entryByLocator = new Map(
    value.inventory.map((entry) => [entry.relativeLocator, entry]),
  );
  return value.inventoryDigest ===
      sha256Canonical(value.inventory as unknown as JsonValue) &&
    new Set(locators).size === locators.length &&
    (locators.length === 0 ||
      (locators[0] === "." &&
        locators.slice(1).every((locator, index) =>
          locator === orderedLocators.filter((candidate) => candidate !== ".")[index]
        ))) &&
    value.inventory.every((entry) => {
      if (entry.relativeLocator === ".") return true;
      const separator = entry.relativeLocator.lastIndexOf("/");
      const parent = separator < 0
        ? "."
        : entry.relativeLocator.slice(0, separator);
      return entryByLocator.get(parent)?.artifactKind === "directory";
    }) &&
    (value.disposition !== "absent" || value.inventory.length === 0) &&
    (value.disposition !== "observed" || value.inventory.length > 0) &&
    (value.disposition === "observation_refused"
      ? typeof value.observationFailure === "string"
      : value.observationFailure === null);
}

function validatePhysicalArtifactCompensation(
  value: unknown,
): value is PhysicalArtifactCompensationEvidence {
  return isRecord(value) &&
    hasExactKeys(value, [
      "attemptedLocators",
      "disposition",
      "kind",
      "refusal",
      "schemaVersion",
    ]) &&
    value.kind === "physical_artifact_compensation_evidence" &&
    value.schemaVersion === "5.0.0" &&
    (value.disposition === "cleared" || value.disposition === "residue_preserved") &&
    Array.isArray(value.attemptedLocators) &&
    value.attemptedLocators.every((locator) =>
      typeof locator === "string" && isAbsolute(locator) &&
      resolve(locator) === locator
    ) &&
    new Set(value.attemptedLocators).size === value.attemptedLocators.length &&
    (value.refusal === null || typeof value.refusal === "string") &&
    (value.disposition === "residue_preserved"
      ? typeof value.refusal === "string"
      : value.refusal === null);
}

export function validatePhysicalArtifactEffectEvidence(
  value: unknown,
): value is PhysicalArtifactEffectEvidence {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "compensation",
      "evidenceDigest",
      "kind",
      "owner",
      "schemaVersion",
      "stagingAtFailure",
      "stagingAfter",
      "stagingRoot",
      "targetAtFailure",
      "targetAfter",
      "targetBefore",
      "targetRoot",
    ]) ||
    value.kind !== "physical_artifact_effect_evidence" ||
    value.schemaVersion !== "5.0.0" ||
    (value.owner !== "product_install" && value.owner !== "workspace_create") ||
    typeof value.targetRoot !== "string" || !isAbsolute(value.targetRoot) ||
    resolve(value.targetRoot) !== value.targetRoot ||
    (value.stagingRoot !== null &&
      (typeof value.stagingRoot !== "string" ||
        !isAbsolute(value.stagingRoot))) ||
    !validatePhysicalArtifactObservation(value.targetBefore) ||
    !validatePhysicalArtifactObservation(value.targetAfter) ||
    (value.targetAtFailure !== null &&
      !validatePhysicalArtifactObservation(value.targetAtFailure)) ||
    !validatePhysicalArtifactCompensation(value.compensation) ||
    (value.stagingAtFailure !== null &&
      !validatePhysicalArtifactObservation(value.stagingAtFailure)) ||
    (value.stagingAfter !== null &&
      !validatePhysicalArtifactObservation(value.stagingAfter)) ||
    !isSha256Digest(value.evidenceDigest)
  ) return false;
  const targetRoot = value.targetRoot;
  const targetBefore = value.targetBefore;
  const targetAtFailure = value.targetAtFailure;
  const targetAfter = value.targetAfter;
  const directoryObservation = (
    candidate: PhysicalArtifactObservation,
  ): boolean =>
    candidate.disposition === "observed" &&
    candidate.inventory[0]?.relativeLocator === "." &&
    candidate.inventory[0]?.artifactKind === "directory";
  const sameObservedState = (
    left: PhysicalArtifactObservation,
    right: PhysicalArtifactObservation,
  ): boolean => left.disposition === right.disposition &&
    left.inventoryDigest === right.inventoryDigest &&
    left.observationFailure === right.observationFailure;
  if (
    targetBefore.rootLocator !== targetRoot ||
    targetAtFailure === null ||
    targetAtFailure.rootLocator !== targetRoot ||
    targetAfter.rootLocator !== targetRoot ||
    (targetBefore.disposition !== "absent" &&
      !directoryObservation(targetBefore))
  ) return false;

  const stagingRoot = value.stagingRoot;
  if (stagingRoot === null) {
    if (
      value.stagingAtFailure !== null || value.stagingAfter !== null
    ) {
      return false;
    }
  } else {
    const stageRelation = relative(targetRoot, stagingRoot);
    const stagePrefix = `.abiogenesis-${value.owner}-stage-`;
    if (
      resolve(stagingRoot) !== stagingRoot ||
      stageRelation !== basename(stagingRoot) ||
      !basename(stagingRoot).startsWith(stagePrefix) ||
      basename(stagingRoot).length <= stagePrefix.length ||
      value.stagingAtFailure === null ||
      value.stagingAfter === null ||
      value.stagingAtFailure.rootLocator !== stagingRoot ||
      value.stagingAfter.rootLocator !== stagingRoot ||
      (value.stagingAtFailure.disposition === "observed" &&
        !directoryObservation(value.stagingAtFailure)) ||
      (value.stagingAfter.disposition === "observed" &&
        !directoryObservation(value.stagingAfter))
    ) return false;

    const stageRelativeLocator = basename(stagingRoot);
    const projectedStageInventory = (
      target: PhysicalArtifactObservation,
    ): readonly PhysicalArtifactInventoryEntry[] | null => {
      if (target.disposition === "observation_refused") return null;
      if (target.disposition === "absent") return [];
      return target.inventory.flatMap((entry) => {
        if (entry.relativeLocator === stageRelativeLocator) {
          return [{ ...entry, relativeLocator: "." }];
        }
        const prefix = `${stageRelativeLocator}/`;
        return entry.relativeLocator.startsWith(prefix)
          ? [{
            ...entry,
            relativeLocator: entry.relativeLocator.slice(prefix.length),
          }]
          : [];
      });
    };
    const stagingMatchesTarget = (
      target: PhysicalArtifactObservation,
      staging: PhysicalArtifactObservation,
    ): boolean => {
      const projected = projectedStageInventory(target);
      if (projected === null) return true;
      if (staging.disposition === "observation_refused") {
        const projectedByLocator = new Map(
          projected.map((entry) => [entry.relativeLocator, entry]),
        );
        return staging.inventory.every((entry) => {
          const matching = projectedByLocator.get(entry.relativeLocator);
          return matching !== undefined &&
            sha256Canonical(entry as unknown as JsonValue) ===
              sha256Canonical(matching as unknown as JsonValue);
        });
      }
      return staging.disposition === "absent"
        ? projected.length === 0
        : sha256Canonical(projected as unknown as JsonValue) ===
          staging.inventoryDigest;
    };
    if (
      !stagingMatchesTarget(targetAtFailure, value.stagingAtFailure) ||
      !stagingMatchesTarget(targetAfter, value.stagingAfter)
    ) return false;

  }

  const attempted = value.compensation.attemptedLocators;
  const beforeLocators = new Set(
    targetBefore.inventory.map((entry) => entry.relativeLocator),
  );
  const failureLocators = new Set(
    targetAtFailure.inventory.map((entry) => entry.relativeLocator),
  );
  const afterLocators = new Set(
    targetAfter.inventory.map((entry) => entry.relativeLocator),
  );
  for (const locator of attempted) {
    const relation = relative(targetRoot, locator);
    if (
      relation === ".." || relation.startsWith(`..${sep}`) ||
      isAbsolute(relation)
    ) return false;
    if (relation.length === 0) {
      return false;
    }
    if (relation.includes(sep)) return false;
    if (
      locator !== stagingRoot &&
      (beforeLocators.has(relation) ||
        (targetAtFailure.disposition !== "observation_refused" &&
          !failureLocators.has(relation)) ||
        (value.compensation.disposition === "cleared" &&
          targetAfter.disposition !== "observation_refused" &&
          afterLocators.has(relation)))
    ) return false;
    if (
      value.owner === "workspace_create" &&
      locator !== stagingRoot && relation !== ".abiogenesis"
    ) return false;
  }
  if (stagingRoot !== null && !attempted.includes(stagingRoot)) return false;

  const targetRestored = sameObservedState(targetBefore, targetAfter);
  const stagingCleared = stagingRoot === null ||
    value.stagingAfter?.disposition === "absent";
  if (
    value.compensation.disposition === "cleared"
      ? !targetRestored || !stagingCleared
      : value.compensation.disposition === "residue_preserved" &&
        targetRestored && stagingCleared
  ) return false;

  const body = {
    kind: value.kind,
    schemaVersion: value.schemaVersion,
    owner: value.owner,
    targetRoot: value.targetRoot,
    stagingRoot: value.stagingRoot,
    targetBefore: value.targetBefore,
    targetAtFailure: value.targetAtFailure,
    stagingAtFailure: value.stagingAtFailure,
    compensation: value.compensation,
    targetAfter: value.targetAfter,
    stagingAfter: value.stagingAfter,
  };
  return value.evidenceDigest === sha256Canonical(body as unknown as JsonValue);
}

function absentInventoryDigest(): Sha256Digest {
  return sha256Canonical([]);
}

function observation(
  rootLocator: string,
  disposition: PhysicalArtifactObservation["disposition"],
  inventory: readonly PhysicalArtifactInventoryEntry[],
  observationFailure: string | null,
): PhysicalArtifactObservation {
  const orderedInventory = [...inventory].sort((left, right) =>
    left.relativeLocator < right.relativeLocator
      ? -1
      : left.relativeLocator > right.relativeLocator
      ? 1
      : 0
  );
  return deepFreeze({
    kind: "physical_artifact_observation" as const,
    schemaVersion: "5.0.0" as const,
    rootLocator,
    disposition,
    inventory: orderedInventory,
    inventoryDigest: orderedInventory.length === 0
      ? absentInventoryDigest()
      : sha256Canonical(orderedInventory as unknown as JsonValue),
    observationFailure,
  });
}

function portableRelative(root: string, locator: string): string {
  const value = relative(root, locator).split(sep).join("/");
  return value.length === 0 ? "." : value;
}

/** Exact, source-blind observation of one bounded physical artifact root. */
export async function observePhysicalArtifact(
  root: string,
): Promise<PhysicalArtifactObservation> {
  const rootLocator = resolve(root);
  const inventory: PhysicalArtifactInventoryEntry[] = [];
  let rootStatus: Awaited<ReturnType<typeof lstat>>;
  try {
    rootStatus = await lstat(rootLocator);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return observation(rootLocator, "absent", [], null);
    }
    return observation(
      rootLocator,
      "observation_refused",
      [],
      String(error),
    );
  }
  const visit = async (
    locator: string,
    selectedStatus?: Awaited<ReturnType<typeof lstat>>,
  ): Promise<void> => {
    const status = selectedStatus ?? await lstat(locator);
    const relativeLocator = portableRelative(rootLocator, locator);
    if (status.isSymbolicLink()) {
      inventory.push({
        relativeLocator,
        artifactKind: "symbolic_link",
        byteLength: null,
        contentDigest: null,
        linkTarget: await readlink(locator),
      });
      return;
    }
    if (status.isDirectory()) {
      inventory.push({
        relativeLocator,
        artifactKind: "directory",
        byteLength: null,
        contentDigest: null,
        linkTarget: null,
      });
      for (const entry of (await readdir(locator)).sort()) {
        await visit(join(locator, entry));
      }
      return;
    }
    if (status.isFile()) {
      const bytes = await readFile(locator);
      inventory.push({
        relativeLocator,
        artifactKind: "file",
        byteLength: bytes.byteLength,
        contentDigest: sha256Bytes(bytes),
        linkTarget: null,
      });
      return;
    }
    inventory.push({
      relativeLocator,
      artifactKind: "other",
      byteLength: null,
      contentDigest: null,
      linkTarget: null,
    });
  };

  try {
    await visit(rootLocator, rootStatus);
    return observation(rootLocator, "observed", inventory, null);
  } catch (error) {
    return observation(
      rootLocator,
      "observation_refused",
      inventory,
      String(error),
    );
  }
}

/** Creates one unique staging locator inside an already selected owner root. */
export function createPhysicalArtifactStagingRoot(
  targetRoot: string,
  owner: PhysicalArtifactOwner,
): Promise<string> {
  return mkdtemp(join(resolve(targetRoot), `.abiogenesis-${owner}-stage-`));
}

function sameObservation(
  left: PhysicalArtifactObservation,
  right: PhysicalArtifactObservation,
): boolean {
  return left.rootLocator === right.rootLocator &&
    left.disposition === right.disposition &&
    left.inventoryDigest === right.inventoryDigest &&
    left.observationFailure === right.observationFailure;
}

function projectedObservedSubtree(
  source: PhysicalArtifactObservation,
  locator: string,
): PhysicalArtifactObservation | null {
  if (source.disposition !== "observed") return null;
  const selected = portableRelative(source.rootLocator, locator);
  if (selected === ".") return source;
  const selectedPrefix = `${selected}/`;
  const inventory = source.inventory.flatMap((entry) => {
    if (entry.relativeLocator === selected) {
      return [{ ...entry, relativeLocator: "." }];
    }
    return entry.relativeLocator.startsWith(selectedPrefix)
      ? [{
          ...entry,
          relativeLocator: entry.relativeLocator.slice(selectedPrefix.length),
        }]
      : [];
  });
  return inventory[0]?.relativeLocator === "."
    ? observation(locator, "observed", inventory, null)
    : null;
}

/**
 * Assesses only direct child residue absent before this exact owner call.
 * Failure snapshots cannot prove exclusive ownership, so present bytes are
 * preserved. This is evidence collection, not semantic rollback.
 */
export async function preserveOwnedPhysicalResidue(
  input: OwnedPhysicalResidueAssessment,
): Promise<PhysicalArtifactCompensationEvidence> {
  const targetRoot = resolve(input.targetRoot);
  const stagingRoot = input.stagingRoot === null
    ? null
    : resolve(input.stagingRoot);
  const attemptedLocators = [
    ...new Set(input.ownedLocators.map((value) => resolve(value))),
  ];
  let refusal: string | null = null;
  const refuse = (message: string): void => {
    if (refusal === null) refusal = message;
  };
  const validBasis =
    (input.owner === "product_install" || input.owner === "workspace_create") &&
    validatePhysicalArtifactObservation(input.targetBefore) &&
    input.targetBefore.rootLocator === targetRoot &&
    validatePhysicalArtifactObservation(input.targetAtFailure) &&
    input.targetAtFailure.rootLocator === targetRoot &&
    (stagingRoot === null
      ? input.stagingAtFailure === null
      : input.stagingAtFailure !== null &&
        validatePhysicalArtifactObservation(input.stagingAtFailure) &&
        input.stagingAtFailure.rootLocator === stagingRoot);
  for (const locator of attemptedLocators) {
    const relation = relative(targetRoot, locator);
    const isDirectChild = relation.length > 0 &&
      relation !== ".." &&
      !relation.startsWith(`..${sep}`) &&
      !isAbsolute(relation) &&
      !relation.includes(sep);
    const isOwnedStage = locator === stagingRoot &&
      basename(locator).startsWith(`.abiogenesis-${input.owner}-stage-`) &&
      basename(locator).length > `.abiogenesis-${input.owner}-stage-`.length;
    const isOwnedCommit = locator !== stagingRoot &&
      (input.owner === "product_install" || relation === ".abiogenesis");
    const existedBefore = input.targetBefore.disposition === "observed" &&
      input.targetBefore.inventory.some((entry) =>
        entry.relativeLocator === relation ||
        entry.relativeLocator.startsWith(`${relation}/`)
      );
    const expected = isOwnedStage
      ? input.stagingAtFailure
      : projectedObservedSubtree(input.targetAtFailure, locator);
    if (
      !validBasis ||
      !isDirectChild ||
      (!isOwnedStage && !isOwnedCommit) ||
      existedBefore ||
      expected === null ||
      expected.rootLocator !== locator ||
      expected.disposition !== "observed"
    ) {
      refuse(`physical compensation lacks exact ownership for ${locator}`);
      continue;
    }
    const current = await observePhysicalArtifact(locator);
    if (current.disposition === "absent") continue;
    if (!sameObservation(current, expected)) {
      refuse(`physical compensation currentness changed at ${locator}`);
      continue;
    }
    refuse(
      `physical compensation preserves residue without pre-effect deletion authority at ${locator}`,
    );
  }
  const remaining: string[] = [];
  for (const locator of attemptedLocators) {
    const observed = await observePhysicalArtifact(locator);
    if (observed.disposition !== "absent") remaining.push(locator);
  }
  return deepFreeze({
    kind: "physical_artifact_compensation_evidence" as const,
    schemaVersion: "5.0.0" as const,
    disposition: remaining.length === 0 ? "cleared" as const : "residue_preserved" as const,
    attemptedLocators,
    refusal: remaining.length === 0 ? null : refusal ??
      `physical residue remains at ${remaining.map((locator) => basename(locator)).join(", ")}`,
  });
}

export function physicalArtifactEffectEvidence(
  owner: PhysicalArtifactOwner,
  targetRoot: string,
  stagingRoot: string | null,
  targetBefore: PhysicalArtifactObservation,
  targetAtFailure: PhysicalArtifactObservation | null,
  stagingAtFailure: PhysicalArtifactObservation | null,
  compensation: PhysicalArtifactCompensationEvidence,
  targetAfter: PhysicalArtifactObservation,
  stagingAfter: PhysicalArtifactObservation | null,
): PhysicalArtifactEffectEvidence {
  const targetRestored = targetBefore.disposition === targetAfter.disposition &&
    targetBefore.inventoryDigest === targetAfter.inventoryDigest &&
    targetBefore.observationFailure === targetAfter.observationFailure;
  const stagingCleared = stagingRoot === null ||
    stagingAfter?.disposition === "absent";
  const exactCompensation = compensation.disposition === "cleared" &&
      (!targetRestored || !stagingCleared)
    ? deepFreeze({
      ...compensation,
      disposition: "residue_preserved" as const,
      refusal:
        "the final physical artifact observation differs from its exact pre-effect state",
    })
    : compensation;
  const body = {
    kind: "physical_artifact_effect_evidence" as const,
    schemaVersion: "5.0.0" as const,
    owner,
    targetRoot: resolve(targetRoot),
    stagingRoot: stagingRoot === null ? null : resolve(stagingRoot),
    targetBefore,
    targetAtFailure,
    stagingAtFailure,
    compensation: exactCompensation,
    targetAfter,
    stagingAfter,
  };
  return deepFreeze({
    ...body,
    evidenceDigest: sha256Canonical(body as unknown as JsonValue),
  });
}
