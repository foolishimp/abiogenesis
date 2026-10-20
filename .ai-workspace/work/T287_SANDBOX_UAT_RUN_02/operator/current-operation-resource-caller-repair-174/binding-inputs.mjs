import assert from 'node:assert/strict';
import {join} from 'node:path';

/** Caller field projection only; no nominal/admitted truth is constructed here. */
export function bindingCoordinateOf(binding) {
 return {ref:binding.bindingId,digest:binding.bindingDigest};
}

/** Actual execution supplies the full records from canonical ABG owner projections. */
export function prepareBindingInputs(p,{oldBinding,workspaceAuthority,nativeInstall,consumerInstall,nativeTargetRoot,resolvedLock}) {
 assert.equal(workspaceAuthority.workspaceId,oldBinding.workspaceId);
 assert.equal(workspaceAuthority.authorityBasisId,oldBinding.authorityBasisId);
 assert.equal(workspaceAuthority.authorityBasisDigest,oldBinding.authorityBasisDigest);
 assert.equal(workspaceAuthority.authorizedActorRef,oldBinding.authorizedActorRef);
 assert.equal(nativeInstall.installedRoot,join(nativeTargetRoot,'node_modules',...nativeInstall.packageName.split('/')));
 const productSet=p.constructProductSet([nativeInstall,consumerInstall],resolvedLock);
 assert.equal(productSet.kind,'product_set',JSON.stringify(productSet));
 const roots={...oldBinding.roots,toolchainRoot:nativeTargetRoot,productRoot:consumerInstall.installedRoot};
 const fields={toolchain:'toolchainRoot',product:'productRoot',event_log:'eventLogRoot',runtime_state:'runtimeStateRoot',projection:'projectionRoot',archive:'archiveRoot'};
 const request={workspaceAuthority:{ref:workspaceAuthority.authorityBasisId,digest:workspaceAuthority.authorityBasisDigest},installedSet:[nativeInstall,consumerInstall].map(p.productInstallCoordinate),resolvedLock:{ref:resolvedLock.lockId,digest:resolvedLock.lockDigest},declaredRoots:Object.entries(fields).map(([rootKind,key])=>({rootKind,path:roots[key]}))};
 // Canonical JSON rejects undefined; actual Public construction applies the unchanged owned schema.
 const requestDigest=p.sha256Canonical(request);
 return {roots,request,requestDigest,productSet};
}
