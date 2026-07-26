import type { EventStoreReopenAuthority } from "../abg/event_store.js";
import type { ProductSemanticsBinding } from "../gtl/index.js";
import type { ProductInstall } from "../product/index.js";
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

export interface PublicRunProjectionAuthority {
  readonly kind: "public_run_projection_authority";
  readonly schemaVersion: "5.0.0";
  readonly reopenAuthority: EventStoreReopenAuthority;
  readonly runtimeInvocationRef: string;
  readonly invocationAdmissionRef: string;
  readonly runId: string;
  readonly graphCallId: string | null;
  readonly resultRef: string | null;
  readonly outputContractRef: string;
  readonly install: ProductInstall;
  readonly workspaceId: string;
  readonly workspaceBindingId: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly catalogId: string;
  readonly catalogDigest: Sha256Digest;
  readonly catalogAdmissionEventRef: string;
  readonly catalogViewId: string;
  readonly catalogViewDigest: Sha256Digest;
  readonly catalogViewAdmissionEventRef: string;
  readonly publicationDigest: Sha256Digest;
  readonly productSemanticsBinding: Readonly<ProductSemanticsBinding>;
  readonly authorityDigest: Sha256Digest;
}

type PublicRunProjectionAuthorityInput = Omit<
  PublicRunProjectionAuthority,
  "authorityDigest" | "kind" | "schemaVersion"
>;

const AUTHORITY_KEYS = Object.freeze([
  "authorityDigest",
  "catalogAdmissionEventRef",
  "catalogDigest",
  "catalogId",
  "catalogViewAdmissionEventRef",
  "catalogViewDigest",
  "catalogViewId",
  "graphCallId",
  "install",
  "invocationAdmissionRef",
  "kind",
  "outputContractRef",
  "productSemanticsBinding",
  "publicationDigest",
  "reopenAuthority",
  "resultRef",
  "runId",
  "runtimeInvocationRef",
  "schemaVersion",
  "workspaceId",
  "workspaceBindingDigest",
  "workspaceBindingId",
]);

const PRODUCT_SEMANTICS_BINDING_KEYS = Object.freeze([
  "bindingRef",
  "kind",
  "modulePath",
  "namedSymbol",
  "packageName",
  "packageVersion",
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

function authorityBody(input: PublicRunProjectionAuthorityInput) {
  return {
    kind: "public_run_projection_authority" as const,
    schemaVersion: "5.0.0" as const,
    ...input,
  };
}

export function constructPublicRunProjectionAuthority(
  input: PublicRunProjectionAuthorityInput,
): PublicRunProjectionAuthority {
  const body = authorityBody(input);
  return deepFreeze(
    JSON.parse(canonicalJson({
      ...body,
      authorityDigest: sha256Canonical(body as unknown as JsonValue),
    } as unknown as JsonValue)),
  ) as PublicRunProjectionAuthority;
}

export function updatePublicRunProjectionAuthority(
  authority: PublicRunProjectionAuthority,
  reopenAuthority: EventStoreReopenAuthority,
): PublicRunProjectionAuthority {
  const {
    authorityDigest: _authorityDigest,
    kind: _kind,
    schemaVersion: _schemaVersion,
    ...input
  } = authority;
  return constructPublicRunProjectionAuthority({
    ...input,
    reopenAuthority,
  });
}

export function parsePublicRunProjectionAuthority(
  value: unknown,
): PublicRunProjectionAuthority | null {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, AUTHORITY_KEYS) ||
    value.kind !== "public_run_projection_authority" ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.runtimeInvocationRef !== "string" ||
    value.runtimeInvocationRef.length === 0 ||
    typeof value.invocationAdmissionRef !== "string" ||
    value.invocationAdmissionRef.length === 0 ||
    typeof value.runId !== "string" ||
    value.runId.length === 0 ||
    !(
      value.graphCallId === null ||
      (
        typeof value.graphCallId === "string" &&
        value.graphCallId.length > 0
      )
    ) ||
    !(
      value.resultRef === null ||
      (typeof value.resultRef === "string" && value.resultRef.length > 0)
    ) ||
    typeof value.outputContractRef !== "string" ||
    value.outputContractRef.length === 0 ||
    !isRecord(value.install) ||
    value.install.kind !== "product_install" ||
    typeof value.workspaceId !== "string" ||
    value.workspaceId.length === 0 ||
    typeof value.workspaceBindingId !== "string" ||
    value.workspaceBindingId.length === 0 ||
    !isSha256Digest(value.workspaceBindingDigest) ||
    typeof value.catalogId !== "string" ||
    value.catalogId.length === 0 ||
    !isSha256Digest(value.catalogDigest) ||
    typeof value.catalogAdmissionEventRef !== "string" ||
    value.catalogAdmissionEventRef.length === 0 ||
    typeof value.catalogViewId !== "string" ||
    value.catalogViewId.length === 0 ||
    !isSha256Digest(value.catalogViewDigest) ||
    typeof value.catalogViewAdmissionEventRef !== "string" ||
    value.catalogViewAdmissionEventRef.length === 0 ||
    !isSha256Digest(value.publicationDigest) ||
    !isRecord(value.productSemanticsBinding) ||
    !hasExactKeys(
      value.productSemanticsBinding,
      PRODUCT_SEMANTICS_BINDING_KEYS,
    ) ||
    value.productSemanticsBinding.kind !== "product_semantics_binding" ||
    typeof value.productSemanticsBinding.bindingRef !== "string" ||
    value.productSemanticsBinding.bindingRef.length === 0 ||
    typeof value.productSemanticsBinding.packageName !== "string" ||
    value.productSemanticsBinding.packageName.length === 0 ||
    typeof value.productSemanticsBinding.packageVersion !== "string" ||
    value.productSemanticsBinding.packageVersion.length === 0 ||
    typeof value.productSemanticsBinding.modulePath !== "string" ||
    value.productSemanticsBinding.modulePath.length === 0 ||
    typeof value.productSemanticsBinding.namedSymbol !== "string" ||
    value.productSemanticsBinding.namedSymbol.length === 0 ||
    !isRecord(value.reopenAuthority) ||
    value.reopenAuthority.kind !== "event_store_reopen_authority" ||
    !isSha256Digest(value.authorityDigest)
  ) {
    return null;
  }
  const { authorityDigest, ...body } = value;
  try {
    if (sha256Canonical(body as unknown as JsonValue) !== authorityDigest) {
      return null;
    }
    return deepFreeze(
      JSON.parse(canonicalJson(value as unknown as JsonValue)),
    ) as PublicRunProjectionAuthority;
  } catch {
    return null;
  }
}
