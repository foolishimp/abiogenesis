import type { JsonValue } from "./canonical_json.js";
import {
  sha256Canonical,
  type Sha256Digest,
} from "./digests.js";

export interface InstalledLeafSemanticsProjection {
  readonly kind: "installed_leaf_semantics_projection";
  readonly schemaVersion: "5.0.0";
  readonly projectionRef: string;
  readonly projectionDigest: Sha256Digest;
  readonly installId: string;
  readonly productContentDigest: Sha256Digest;
  readonly manifestDigest: Sha256Digest;
  readonly publicationDigest: Sha256Digest;
  readonly bindingRef: string;
  readonly packageName: string;
  readonly packageVersion: string;
}

export interface InstalledLeafSemanticsRuntime {
  readonly verifyInstalledContent: () => Promise<boolean>;
  readonly validateContractValue: (
    valueKind: string,
    value: unknown,
  ) => value is Readonly<Record<string, JsonValue>>;
  readonly resolveJudgmentRelation: (
    predicateRef: string,
  ) => Readonly<{
    readonly predicateRef: string;
    readonly advanceReasonRef: string;
    readonly rejectionReasonRef: string;
    readonly evaluate: (input: unknown, output: unknown) => boolean;
  }> | null;
}

const projectedSemantics =
  new WeakMap<object, InstalledLeafSemanticsRuntime>();

function projectionBody(
  value: Omit<
    InstalledLeafSemanticsProjection,
    "kind" | "projectionDigest" | "projectionRef" | "schemaVersion"
  >,
): JsonValue {
  return value as unknown as JsonValue;
}

export function mintInstalledLeafSemanticsProjection(
  basis: Omit<
    InstalledLeafSemanticsProjection,
    "kind" | "projectionDigest" | "projectionRef" | "schemaVersion"
  >,
  runtime: InstalledLeafSemanticsRuntime,
): InstalledLeafSemanticsProjection {
  const projectionDigest = sha256Canonical(projectionBody(basis));
  const projection = Object.freeze({
    kind: "installed_leaf_semantics_projection" as const,
    schemaVersion: "5.0.0" as const,
    projectionRef:
      `leaf-semantics://abiogenesis/${projectionDigest.slice("sha256:".length)}`,
    projectionDigest,
    ...basis,
  });
  projectedSemantics.set(projection, runtime);
  return projection;
}

export function inspectInstalledLeafSemanticsProjection(
  value: unknown,
): Readonly<{
  projection: InstalledLeafSemanticsProjection;
  runtime: InstalledLeafSemanticsRuntime;
}> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const projection = value as Partial<InstalledLeafSemanticsProjection>;
  const runtime = projectedSemantics.get(value);
  if (
    runtime === undefined ||
    projection.kind !== "installed_leaf_semantics_projection" ||
    projection.schemaVersion !== "5.0.0" ||
    typeof projection.projectionRef !== "string" ||
    typeof projection.projectionDigest !== "string" ||
    typeof projection.installId !== "string" ||
    typeof projection.productContentDigest !== "string" ||
    typeof projection.manifestDigest !== "string" ||
    typeof projection.publicationDigest !== "string" ||
    typeof projection.bindingRef !== "string" ||
    typeof projection.packageName !== "string" ||
    typeof projection.packageVersion !== "string"
  ) {
    return null;
  }
  const expectedDigest = sha256Canonical(projectionBody({
    installId: projection.installId,
    productContentDigest: projection.productContentDigest as Sha256Digest,
    manifestDigest: projection.manifestDigest as Sha256Digest,
    publicationDigest: projection.publicationDigest as Sha256Digest,
    bindingRef: projection.bindingRef,
    packageName: projection.packageName,
    packageVersion: projection.packageVersion,
  }));
  if (
    projection.projectionDigest !== expectedDigest ||
    projection.projectionRef !==
      `leaf-semantics://abiogenesis/${expectedDigest.slice("sha256:".length)}`
  ) {
    return null;
  }
  return {
    projection: projection as InstalledLeafSemanticsProjection,
    runtime,
  };
}
