import type { EventStoreReopenAuthority } from "../abg/event_store.js";
import type {
  ClosureContract,
  GtlGraph,
  GtlProgram,
} from "../gtl/contracts.js";
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

export interface PublicContinuationAuthority {
  readonly kind: "public_continuation_authority";
  readonly schemaVersion: "5.0.0";
  readonly continuationRef: string;
  readonly reopenAuthority: EventStoreReopenAuthority;
  readonly runtimeInvocationRef: string;
  readonly outputContractRef: string;
  readonly invocationAdmissionRef: string;
  readonly runId: string;
  readonly install: ProductInstall;
  readonly workspaceBinding: WorkspaceBinding;
  readonly catalog: AdmittedCatalog;
  readonly catalogView: CatalogView;
  readonly program: Readonly<GtlProgram>;
  readonly graph: Readonly<GtlGraph>;
  readonly closureContract: Readonly<ClosureContract>;
  readonly authorityDigest: Sha256Digest;
}

type PublicContinuationAuthorityInput = Omit<
  PublicContinuationAuthority,
  "authorityDigest" | "kind" | "schemaVersion"
>;

const AUTHORITY_KEYS = Object.freeze([
  "authorityDigest",
  "catalog",
  "catalogView",
  "closureContract",
  "continuationRef",
  "graph",
  "install",
  "invocationAdmissionRef",
  "kind",
  "outputContractRef",
  "program",
  "reopenAuthority",
  "runId",
  "runtimeInvocationRef",
  "schemaVersion",
  "workspaceBinding",
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

function authorityBody(input: PublicContinuationAuthorityInput) {
  return {
    kind: "public_continuation_authority" as const,
    schemaVersion: "5.0.0" as const,
    ...input,
  };
}

export function constructPublicContinuationAuthority(
  input: PublicContinuationAuthorityInput,
): PublicContinuationAuthority {
  const body = authorityBody(input);
  return deepFreeze(
    JSON.parse(canonicalJson({
      ...body,
      authorityDigest: sha256Canonical(body as unknown as JsonValue),
    } as unknown as JsonValue)),
  ) as PublicContinuationAuthority;
}

export function updatePublicContinuationAuthority(
  authority: PublicContinuationAuthority,
  reopenAuthority: EventStoreReopenAuthority,
): PublicContinuationAuthority {
  const {
    authorityDigest: _authorityDigest,
    kind: _kind,
    schemaVersion: _schemaVersion,
    ...input
  } = authority;
  return constructPublicContinuationAuthority({
    ...input,
    reopenAuthority,
  });
}

export function parsePublicContinuationAuthority(
  value: unknown,
  expectedContinuationRef: string,
): PublicContinuationAuthority | null {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, AUTHORITY_KEYS) ||
    value.kind !== "public_continuation_authority" ||
    value.schemaVersion !== "5.0.0" ||
    value.continuationRef !== expectedContinuationRef ||
    typeof value.runtimeInvocationRef !== "string" ||
    value.runtimeInvocationRef.length === 0 ||
    typeof value.outputContractRef !== "string" ||
    value.outputContractRef.length === 0 ||
    typeof value.invocationAdmissionRef !== "string" ||
    value.invocationAdmissionRef.length === 0 ||
    typeof value.runId !== "string" ||
    value.runId.length === 0 ||
    !isRecord(value.reopenAuthority) ||
    value.reopenAuthority.kind !== "event_store_reopen_authority" ||
    !isRecord(value.install) ||
    value.install.kind !== "product_install" ||
    !isRecord(value.workspaceBinding) ||
    value.workspaceBinding.kind !== "workspace_binding" ||
    !isRecord(value.catalog) ||
    value.catalog.kind !== "admitted_catalog" ||
    !isRecord(value.catalogView) ||
    value.catalogView.kind !== "catalog_view" ||
    !isRecord(value.program) ||
    value.program.kind !== "gtl_program" ||
    !isRecord(value.graph) ||
    value.graph.kind !== "gtl_graph" ||
    !isRecord(value.closureContract) ||
    value.closureContract.kind !== "closure_contract" ||
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
    ) as PublicContinuationAuthority;
  } catch {
    return null;
  }
}
