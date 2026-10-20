import { constructProductSet, constructResolvedProductLock, constructWorkspaceAuthorityBasis, constructWorkspaceBinding, } from "./environment.js";
export function resolveProductEnvironment(packet) {
    return constructResolvedProductLock(packet.verifiedArtifacts);
}
export function constructExactWorkspaceBinding(packet) {
    const productSet = constructProductSet(packet.admittedInstalls, packet.resolvedLock);
    if (productSet.kind !== "product_set")
        return productSet;
    const authority = constructWorkspaceAuthorityBasis(packet.authority);
    if (authority.kind !== "workspace_authority_basis")
        return authority;
    return constructWorkspaceBinding(authority, productSet, packet.resolvedLock, packet.roots);
}
export const ProductEnvironmentPort = Object.freeze({
    resolve: resolveProductEnvironment,
    bindWorkspace: constructExactWorkspaceBinding,
});
export const PRODUCT_ENVIRONMENT_CONTRACTS = Object.freeze({
    resolve: ProductEnvironmentPort.resolve,
    bind: ProductEnvironmentPort.bindWorkspace,
});
