import type { VerifiedProductArtifact } from "./contracts.js";
import { type EnvironmentRefusal, type ProductInstall, type ResolvedProductLock, type WorkspaceAuthorityBasisInput, type WorkspaceBindingCandidate, type WorkspaceDeclaredRoots } from "./environment.js";
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
    readonly authority: WorkspaceAuthorityBasisInput;
    readonly roots: WorkspaceDeclaredRoots;
}
export declare function resolveProductEnvironment(packet: ProductResolutionPacket): EnvironmentRefusal | ResolvedProductLock;
export declare function constructExactWorkspaceBinding(packet: WorkspaceBindingPacket): EnvironmentRefusal | WorkspaceBindingCandidate;
export declare const ProductEnvironmentPort: Readonly<{
    resolve: typeof resolveProductEnvironment;
    bindWorkspace: typeof constructExactWorkspaceBinding;
}>;
export declare const PRODUCT_ENVIRONMENT_CONTRACTS: Readonly<{
    resolve: typeof resolveProductEnvironment;
    bind: typeof constructExactWorkspaceBinding;
}>;
