import {
  validateEventStoreCloseHandoff,
  type DurablePrefixCoordinate,
  type EventStoreCloseHandoff,
  type EventStoreReopenAuthority,
} from "../abg/event_store.js";
import type { ModulePublication } from "../gtl/contracts.js";
import type {
  ReadyGraphFunctionCatalog,
  GraphFunctionCatalogView,
  ProductInstall,
  ProductSet,
  ResolvedProductLock,
  WorkspaceBinding,
} from "../product/index.js";
import {
  isProductSet,
  isResolvedProductLock,
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

export interface PublicStartIdentity {
  readonly kind: "public_start_identity";
  readonly schemaVersion: "5.0.0";
  readonly programRef: string;
  readonly graphFunctionRef: string;
  readonly startRef: string;
  readonly scope: "program";
  readonly target: string;
  readonly until: "converged";
  readonly rootMode: "supervised";
}

export interface PublicGapAuthority {
  readonly kind: "public_gap_authority";
  readonly schemaVersion: "5.0.0";
  readonly prefix: DurablePrefixCoordinate;
  readonly reopenAuthority: EventStoreReopenAuthority;
  readonly installInvocationRef: string;
  readonly workspaceBindingInvocationRef: string;
  readonly install: ProductInstall;
  readonly resolvedProductLock: ResolvedProductLock;
  readonly productSet: ProductSet;
  readonly workspaceBinding: WorkspaceBinding;
  readonly catalog: ReadyGraphFunctionCatalog;
  readonly catalogView: GraphFunctionCatalogView;
  readonly publications: readonly Readonly<ModulePublication>[];
  readonly publicStart: PublicStartIdentity;
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
  "install",
  "installInvocationRef",
  "kind",
  "productSet",
  "prefix",
  "publications",
  "publicStart",
  "reopenAuthority",
  "resolvedProductLock",
  "schemaVersion",
  "source",
  "workspaceBinding",
  "workspaceBindingInvocationRef",
]);

const PUBLIC_START_KEYS = Object.freeze([
  "graphFunctionRef",
  "kind",
  "programRef",
  "rootMode",
  "schemaVersion",
  "scope",
  "startRef",
  "target",
  "until",
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
  if (!validateEventStoreCloseHandoff({
    prefix: input.prefix,
    reopenAuthority: input.reopenAuthority,
  })) {
    throw new TypeError("gap authority requires one exact durable close pair");
  }
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
  handoff: EventStoreCloseHandoff,
): PublicGapAuthority {
  const {
    authorityDigest: _authorityDigest,
    kind: _kind,
    schemaVersion: _schemaVersion,
    ...input
  } = authority;
  return constructPublicGapAuthority({
    ...input,
    ...handoff,
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
    !validateEventStoreCloseHandoff({
      prefix: value.prefix,
      reopenAuthority: value.reopenAuthority,
    }) ||
    !nonEmptyString(value.installInvocationRef) ||
    !nonEmptyString(value.workspaceBindingInvocationRef) ||
    !isRecord(value.install) ||
    value.install.kind !== "product_install" ||
    !isResolvedProductLock(value.resolvedProductLock) ||
    !isProductSet(value.productSet, value.resolvedProductLock) ||
    !isRecord(value.workspaceBinding) ||
    value.workspaceBinding.kind !== "workspace_binding" ||
    !isRecord(value.catalog) ||
    value.catalog.kind !== "graph_function_catalog" ||
    !isRecord(value.catalogView) ||
    value.catalogView.kind !== "graph_function_catalog_view" ||
    !Array.isArray(value.publications) ||
    value.publications.length === 0 ||
    !value.publications.every(
      (publication) => isRecord(publication) && publication.kind === "module_publication",
    ) ||
    !isRecord(value.publicStart) ||
    !hasExactKeys(value.publicStart, PUBLIC_START_KEYS) ||
    value.publicStart.kind !== "public_start_identity" ||
    value.publicStart.schemaVersion !== "5.0.0" ||
    !nonEmptyString(value.publicStart.programRef) ||
    !nonEmptyString(value.publicStart.graphFunctionRef) ||
    !nonEmptyString(value.publicStart.startRef) ||
    value.publicStart.scope !== "program" ||
    value.publicStart.target !== value.publicStart.startRef ||
    value.publicStart.until !== "converged" ||
    value.publicStart.rootMode !== "supervised" ||
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
