import {
  validateEventStoreCloseHandoff,
  type DurablePrefixCoordinate,
  type EventStoreCloseHandoff,
  type EventStoreReopenAuthority,
} from "../abg/event_store.js";
import type {
  ClosureContract,
  GtlGraph,
  GtlProgram,
  ModulePublication,
} from "../gtl/contracts.js";
import type { HeldParentTraversalSuspension } from "../hog/graph_execute.js";
import type {
  ReadyGraphFunctionCatalog,
  GraphFunctionCatalogView,
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
  readonly prefix: DurablePrefixCoordinate;
  readonly reopenAuthority: EventStoreReopenAuthority;
  readonly runtimeInvocationRef: string;
  readonly outputContractRef: string;
  readonly invocationAdmissionRef: string;
  readonly runId: string;
  readonly install: ProductInstall;
  readonly workspaceBinding: WorkspaceBinding;
  readonly catalog: ReadyGraphFunctionCatalog;
  readonly catalogView: GraphFunctionCatalogView;
  readonly publications: readonly Readonly<ModulePublication>[];
  readonly program: Readonly<GtlProgram>;
  readonly graph: Readonly<GtlGraph>;
  readonly heldGraph: Readonly<GtlGraph>;
  readonly heldClosureContract: Readonly<ClosureContract>;
  readonly parentSuspensions: readonly HeldParentTraversalSuspension[];
  readonly invocationInput: Readonly<Record<string, JsonValue>>;
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
  "heldClosureContract",
  "heldGraph",
  "install",
  "invocationInput",
  "invocationAdmissionRef",
  "kind",
  "outputContractRef",
  "program",
  "publications",
  "reopenAuthority",
  "runId",
  "runtimeInvocationRef",
  "schemaVersion",
  "workspaceBinding",
  "parentSuspensions",
  "prefix",
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
  if (!validateEventStoreCloseHandoff({
    prefix: input.prefix,
    reopenAuthority: input.reopenAuthority,
  })) {
    throw new TypeError("continuation authority requires one exact durable close pair");
  }
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
  handoff: EventStoreCloseHandoff,
): PublicContinuationAuthority {
  const {
    authorityDigest: _authorityDigest,
    kind: _kind,
    schemaVersion: _schemaVersion,
    ...input
  } = authority;
  return constructPublicContinuationAuthority({
    ...input,
    ...handoff,
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
    !validateEventStoreCloseHandoff({
      prefix: value.prefix,
      reopenAuthority: value.reopenAuthority,
    }) ||
    !isRecord(value.install) ||
    value.install.kind !== "product_install" ||
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
    !isRecord(value.program) ||
    value.program.kind !== "gtl_program" ||
    !isRecord(value.graph) ||
    value.graph.kind !== "gtl_graph" ||
    !isRecord(value.heldGraph) ||
    value.heldGraph.kind !== "gtl_graph" ||
    !isRecord(value.heldClosureContract) ||
    value.heldClosureContract.kind !== "closure_contract" ||
    !Array.isArray(value.parentSuspensions) ||
    !value.parentSuspensions.every(
      (suspension) =>
        isRecord(suspension) &&
        [
          "held_recursion_suspension",
          "held_workflow_suspension",
        ].includes(String(suspension.kind)) &&
        suspension.schemaVersion === "5.0.0",
    ) ||
    !isRecord(value.invocationInput) ||
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
