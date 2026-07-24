import type { EventStoreReopenAuthority } from "../abg/event_store.js";
import type {
  AdmittedCatalog,
  CatalogView,
  ProductInstall,
  WorkspaceBinding,
} from "../product/index.js";
import {
  canonicalJson,
  type JsonValue,
} from "../shared/canonical_json.js";
import {
  isSha256Digest,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";

export interface PublicGapSource {
  readonly sourceInvocationRef: string;
  readonly sourceInvocationAdmissionRef: string;
  readonly sourceRunId: string;
  readonly sourceRouteRef: string;
  readonly sourceRouteDigest: Sha256Digest;
  readonly sourceRouteEventRef: string;
  readonly sourceRunStoppedEventRef: string;
  readonly gapRef: string;
  readonly nextActionProjectionRef: string;
  readonly nextActionProjectionDigest: Sha256Digest;
  readonly nextActionProjection: Readonly<Record<string, JsonValue>>;
}

export interface PublicGapAuthority {
  readonly kind: "public_gap_authority";
  readonly schemaVersion: "5.0.0";
  readonly reopenAuthority: EventStoreReopenAuthority;
  readonly installInvocationRef: string;
  readonly workspaceBindingInvocationRef: string;
  readonly catalogViewInvocationRef: string;
  readonly install: ProductInstall;
  readonly workspaceBinding: WorkspaceBinding;
  readonly catalog: AdmittedCatalog;
  readonly catalogView: CatalogView;
  readonly source: PublicGapSource;
  readonly authorityDigest: Sha256Digest;
}

type PublicGapAuthorityInput = Omit<
  PublicGapAuthority,
  "authorityDigest" | "kind" | "schemaVersion"
>;

const AUTHORITY_KEYS = Object.freeze([
  "authorityDigest",
  "catalog",
  "catalogView",
  "catalogViewInvocationRef",
  "install",
  "installInvocationRef",
  "kind",
  "reopenAuthority",
  "schemaVersion",
  "source",
  "workspaceBinding",
  "workspaceBindingInvocationRef",
]);

const SOURCE_KEYS = Object.freeze([
  "gapRef",
  "nextActionProjection",
  "nextActionProjectionDigest",
  "nextActionProjectionRef",
  "sourceInvocationAdmissionRef",
  "sourceInvocationRef",
  "sourceRouteDigest",
  "sourceRouteEventRef",
  "sourceRouteRef",
  "sourceRunId",
  "sourceRunStoppedEventRef",
]);

function isRecord(
  value: unknown,
): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Readonly<Record<string, unknown>>,
  keys: readonly string[],
): boolean {
  return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function authorityBody(input: PublicGapAuthorityInput) {
  return {
    kind: "public_gap_authority" as const,
    schemaVersion: "5.0.0" as const,
    ...input,
  };
}

export function constructPublicGapAuthority(
  input: PublicGapAuthorityInput,
): PublicGapAuthority {
  const body = authorityBody(input);
  return deepFreeze(
    JSON.parse(canonicalJson({
      ...body,
      authorityDigest: sha256Canonical(body as unknown as JsonValue),
    } as unknown as JsonValue)),
  ) as PublicGapAuthority;
}

export function updatePublicGapAuthority(
  authority: PublicGapAuthority,
  reopenAuthority: EventStoreReopenAuthority,
): PublicGapAuthority {
  const {
    authorityDigest: _authorityDigest,
    kind: _kind,
    schemaVersion: _schemaVersion,
    ...input
  } = authority;
  return constructPublicGapAuthority({
    ...input,
    reopenAuthority,
  });
}

export function parsePublicGapAuthority(
  value: unknown,
  expectedGapRef?: string,
): PublicGapAuthority | null {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, AUTHORITY_KEYS) ||
    value.kind !== "public_gap_authority" ||
    value.schemaVersion !== "5.0.0" ||
    !isRecord(value.reopenAuthority) ||
    value.reopenAuthority.kind !== "event_store_reopen_authority" ||
    !nonEmptyString(value.installInvocationRef) ||
    !nonEmptyString(value.workspaceBindingInvocationRef) ||
    !nonEmptyString(value.catalogViewInvocationRef) ||
    !isRecord(value.install) ||
    value.install.kind !== "product_install" ||
    !isRecord(value.workspaceBinding) ||
    value.workspaceBinding.kind !== "workspace_binding" ||
    !isRecord(value.catalog) ||
    value.catalog.kind !== "admitted_catalog" ||
    !isRecord(value.catalogView) ||
    value.catalogView.kind !== "catalog_view" ||
    !isRecord(value.source) ||
    !hasExactKeys(value.source, SOURCE_KEYS) ||
    !nonEmptyString(value.source.sourceInvocationRef) ||
    !nonEmptyString(value.source.sourceInvocationAdmissionRef) ||
    !nonEmptyString(value.source.sourceRunId) ||
    !nonEmptyString(value.source.sourceRouteRef) ||
    !isSha256Digest(value.source.sourceRouteDigest) ||
    !nonEmptyString(value.source.sourceRouteEventRef) ||
    !nonEmptyString(value.source.sourceRunStoppedEventRef) ||
    !nonEmptyString(value.source.gapRef) ||
    (
      expectedGapRef !== undefined &&
      value.source.gapRef !== expectedGapRef
    ) ||
    !nonEmptyString(value.source.nextActionProjectionRef) ||
    !isSha256Digest(value.source.nextActionProjectionDigest) ||
    !isRecord(value.source.nextActionProjection) ||
    !isSha256Digest(value.authorityDigest)
  ) {
    return null;
  }
  const {
    authorityDigest,
    ...body
  } = value;
  try {
    if (
      sha256Canonical(body as unknown as JsonValue) !== authorityDigest
    ) {
      return null;
    }
    return deepFreeze(
      JSON.parse(canonicalJson(value as unknown as JsonValue)),
    ) as PublicGapAuthority;
  } catch {
    return null;
  }
}
