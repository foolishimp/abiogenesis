import type { VerifiedProductArtifact } from "./contracts.js";
import type { WorkspaceManifest } from "./workspace_operations.js";
import {
  constructProductSet,
  constructResolvedProductLock,
  constructWorkspaceAuthorityBasis,
  constructWorkspaceBinding,
  type EnvironmentRefusal,
  type ProductInstall,
  type ResolvedProductLock,
  type WorkspaceBindingCandidate,
  type WorkspaceDeclaredRoots,
} from "./environment.js";

export interface ProductResolutionPacket {
  readonly kind: "product_resolution_packet";
  readonly schemaVersion: "5.0.0";
  readonly memberKey: "resolve";
  readonly verifiedArtifacts: readonly VerifiedProductArtifact[];
}

export interface WorkspaceBindingPacket {
  readonly kind: "workspace_binding_packet";
  readonly schemaVersion: "5.0.0";
  readonly memberKey: "bind";
  readonly admittedInstalls: readonly ProductInstall[];
  readonly resolvedLock: ResolvedProductLock;
  readonly workspaceManifest: WorkspaceManifest;
  readonly roots: WorkspaceDeclaredRoots;
}

export function resolveProductEnvironment(
  packet: ProductResolutionPacket,
): EnvironmentRefusal | ResolvedProductLock {
  return constructResolvedProductLock(packet.verifiedArtifacts);
}

export function constructExactWorkspaceBinding(
  packet: WorkspaceBindingPacket,
): EnvironmentRefusal | WorkspaceBindingCandidate {
  const productSet = constructProductSet(
    packet.admittedInstalls,
    packet.resolvedLock,
  );
  if (productSet.kind !== "product_set") return productSet;
  const authority = constructWorkspaceAuthorityBasis({
    workspaceManifest: packet.workspaceManifest,
  });
  if (authority.kind !== "workspace_authority_basis") return authority;
  return constructWorkspaceBinding(
    authority,
    productSet,
    packet.resolvedLock,
    packet.roots,
  );
}

export const ProductEnvironmentPort = Object.freeze({
  resolve: resolveProductEnvironment,
  bindWorkspace: constructExactWorkspaceBinding,
});

export const PRODUCT_ENVIRONMENT_CONTRACTS = Object.freeze({
  resolve: ProductEnvironmentPort.resolve,
  bind: ProductEnvironmentPort.bindWorkspace,
});
