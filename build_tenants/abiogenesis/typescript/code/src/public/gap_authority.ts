import {
  validateEventStoreCloseHandoff,
  type DurablePrefixCoordinate,
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
  canonicalJson,
  type JsonValue,
} from "../shared/canonical_json.js";
import {
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";

export type PublicGapSource = {
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
};

export type PublicStartIdentity = {
  readonly kind: "public_start_identity";
  readonly schemaVersion: "5.0.0";
  readonly programRef: string;
  readonly graphFunctionRef: string;
  readonly startRef: string;
  readonly scope: "program";
  readonly target: string;
  readonly until: "converged";
  readonly rootMode: "supervised";
};

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
      authorityDigest: sha256Canonical(body),
    })),
  ) as PublicGapAuthority;
}
