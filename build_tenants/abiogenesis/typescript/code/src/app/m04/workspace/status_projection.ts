// Implements the project.read(workspace_status) owner projection over
// persisted binding authority and replay-derived Event Calculus truth.

import { join } from "node:path";

import {
  assertPublicOperationArtifactAvailableInReplay,
  type CanonicalRuntimeEvent,
  type PublicOperationArtifactAdmittedRuntimeEvent
} from "../../../abg/m03/index.js";
import type {
  AdmittedWorkspaceReplay
} from "../../../abg/m03/runner/public_runtime_projections.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import type { BoundWorkspaceContext } from "../public_sdk/carriers.js";
import type {
  WorkspaceStatusReadRequest
} from "./operation_contracts.js";
import {
  admitWorkspaceStatusProjection,
  type WorkspaceStatusProjection
} from "./operation_contracts.js";
import { WORKSPACE_MANIFEST_RELATIVE_PATH } from "./operations.js";

const BINDING_BOUNDARY_MISSING_REF =
  "gap://abg/project-read/workspace-status/artifact-boundary-not-admitted";
const WORKSPACE_BOUNDARY_MISSING_REF =
  "gap://abg/project-read/workspace-status/workspace-create-boundary-not-admitted";
const PRODUCT_BOUNDARY_MISSING_PREFIX =
  "gap://abg/project-read/workspace-status/product-install-boundary-not-admitted/";
const BINDING_AUTHORITY_MISMATCH_REF =
  "gap://abg/project-read/workspace-status/binding-authority-mismatch";
const CONFIGURATION_DIGEST_GAP_REF =
  "gap://abg/project-read/workspace-status/configuration-digest-unavailable";

function unique(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
}

interface ArtifactAvailabilityRow {
  readonly operationId: string;
  readonly scope: Readonly<{ readonly ref: string; readonly digest: string }>;
  readonly artifact: Readonly<{ readonly ref: string; readonly digest: string }>;
  readonly boundaryEventRef: string;
}

function exactArtifactAvailability(input: {
  readonly replay: AdmittedWorkspaceReplay;
  readonly operationId: string;
  readonly scopeRef: string;
  readonly expectedScopeDigest?: string;
  readonly artifactRef: string;
  readonly expectedArtifactDigest?: string;
}): ArtifactAvailabilityRow | null {
  const matches = input.replay.orderedEvents.filter(
    (event): event is CanonicalRuntimeEvent &
      PublicOperationArtifactAdmittedRuntimeEvent =>
    event.kind === "public_operation_artifact_admitted" &&
    event.operationId === input.operationId &&
    event.scopeRef === input.scopeRef &&
    event.artifactRef === input.artifactRef &&
    (input.expectedScopeDigest === undefined ||
      event.scopeDigest === input.expectedScopeDigest) &&
    (input.expectedArtifactDigest === undefined ||
      event.artifactDigest === input.expectedArtifactDigest)
  );
  const boundary = matches[0];
  if (matches.length !== 1 || boundary === undefined) {
    return null;
  }
  assertPublicOperationArtifactAvailableInReplay({
    events: input.replay.orderedEvents,
    operationId: input.operationId,
    scopeRef: boundary.scopeRef,
    scopeDigest: boundary.scopeDigest,
    artifactRef: boundary.artifactRef,
    artifactDigest: boundary.artifactDigest
  });
  return Object.freeze({
    operationId: input.operationId,
    scope: Object.freeze({
      ref: boundary.scopeRef,
      digest: boundary.scopeDigest
    }),
    artifact: Object.freeze({
      ref: boundary.artifactRef,
      digest: boundary.artifactDigest
    }),
    boundaryEventRef: boundary.eventId
  });
}

/** @internal */
export function projectWorkspaceStatusFromReplay(input: {
  readonly request: WorkspaceStatusReadRequest;
  readonly context: BoundWorkspaceContext;
  readonly replay: AdmittedWorkspaceReplay;
}): WorkspaceStatusProjection {
  const manifest = input.context.workspaceManifest;
  const binding = input.context.binding;
  const workspaceDigest = stableSha256Digest(manifest);
  const authorityMatches =
    binding.workspaceId === manifest.workspaceId &&
    binding.workspaceManifestDigest === workspaceDigest;
  const workspaceAvailability = exactArtifactAvailability({
    replay: input.replay,
    operationId: "abg.operation.workspace.create",
    scopeRef: manifest.workspaceId,
    expectedScopeDigest: workspaceDigest,
    artifactRef: join(manifest.root, WORKSPACE_MANIFEST_RELATIVE_PATH),
    expectedArtifactDigest: workspaceDigest
  });
  const productAvailability = binding.products.map((product) =>
    exactArtifactAvailability({
      replay: input.replay,
      operationId: "abg.operation.product.install",
      scopeRef: product.installedProductId,
      artifactRef: product.installedProductId
    })
  );
  const bindingAvailability = exactArtifactAvailability({
    replay: input.replay,
    operationId: "abg.operation.workspace.bind",
    scopeRef: manifest.workspaceId,
    expectedScopeDigest: workspaceDigest,
    artifactRef: binding.bindingId,
    expectedArtifactDigest: binding.bindingDigest
  });
  const artifactAvailability = Object.freeze([
    ...(workspaceAvailability === null ? [] : [workspaceAvailability]),
    ...productAvailability.filter(
      (row): row is ArtifactAvailabilityRow => row !== null
    ),
    ...(bindingAvailability === null ? [] : [bindingAvailability])
  ]);
  const residualRefs = unique([
    ...(authorityMatches ? [] : [BINDING_AUTHORITY_MISMATCH_REF]),
    ...(workspaceAvailability === null ? [WORKSPACE_BOUNDARY_MISSING_REF] : []),
    ...binding.products.flatMap((product, index) =>
      productAvailability[index] === null
        ? [`${PRODUCT_BOUNDARY_MISSING_PREFIX}${encodeURIComponent(product.installedProductId)}`]
        : []
    ),
    ...(bindingAvailability === null ? [BINDING_BOUNDARY_MISSING_REF] : []),
    ...(manifest.configurationRefs.length === 0
      ? []
      : [CONFIGURATION_DIGEST_GAP_REF])
  ]);
  const projectionBasis = Object.freeze({
    kind: "workspace_status_projection_basis" as const,
    requestProjectionBasis: input.request.projectionBasis,
    workspaceAuthorityRef: manifest.workspaceId,
    workspaceAuthorityDigest: workspaceDigest,
    bindingRef: binding.bindingId,
    bindingDigest: binding.bindingDigest,
    artifactAvailability,
    residualRefs
  });
  const projectionDigest = stableSha256Digest(projectionBasis);
  return admitWorkspaceStatusProjection({
    kind: "workspace_status_projection",
    projection: Object.freeze({
      ref:
        `projection://abg/workspace-status/${projectionDigest.slice("sha256:".length)}`,
      digest: projectionDigest
    }),
    workspace: Object.freeze({
      ref: manifest.workspaceId,
      digest: workspaceDigest
    }),
    workspaceAuthority: Object.freeze({
      ref: manifest.workspaceId,
      digest: workspaceDigest
    }),
    binding: Object.freeze({
      ref: binding.bindingId,
      digest: binding.bindingDigest
    }),
    authorityMode: manifest.authorityMode,
    readiness: residualRefs.length === 0 ? "ready" : "stale",
    boundProductRefs: Object.freeze(
      binding.products.map((product) => product.installedProductId)
    ),
    artifactAvailability,
    configurations: Object.freeze([]),
    catalog: null,
    residualRefs,
    provenanceRefs: unique([
      ...binding.provenanceRefs,
      ...artifactAvailability.map((row) => row.boundaryEventRef)
    ])
  });
}
