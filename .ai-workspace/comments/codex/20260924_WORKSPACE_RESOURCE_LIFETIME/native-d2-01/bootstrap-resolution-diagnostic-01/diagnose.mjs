import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const D=import.meta.dirname,P=join(D,'../bootstrap-preparation-02');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const save=async(n,v)=>writeFile(join(D,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const selection=await read(join(P,'selection.json')),core=await read(selection.coreSelection);
const pkg=await read(join(core.packageRoot,'package.json'));
const load=key=>import(pathToFileURL(join(core.packageRoot,pkg.exports['./'+key].import)).href);
const [product,abg]=await Promise.all(['product','abg'].map(load));
const close=await read(join(P,'final-close.json'));
const retained=await read(join(P,'calls/08-intake-conformance.jsonl'));
const {catalog,catalogView}=retained.invocation.resources.declarationCatalog;
const binding=retained.invocation.invocation.invocationAuthority.slots.workspace_binding;
const selectionInput={kind:'start',scope:'program',target:'next',until:'converged',rootMode:'direct'};
await save('input-selection.json',{core:core.basis,close,programRef:selection.programRef,selection:selectionInput,
 catalogDigest:product.sha256Canonical(catalog),catalogViewDigest:product.sha256Canonical(catalogView),workspaceBinding:binding,
 retainedRequest:{path:join(P,'calls/08-intake-conformance.jsonl'),digest:await product.sha256File(join(P,'calls/08-intake-conformance.jsonl'))},
 boundary:'New diagnostic of same resolver input relation. Missing original response remains missing. One existing-owner read-only acquisition recreates the authentic callback basis; no admission, actor or append.'});
const timing={},t0=performance.now();let owner;
try{
 const start=performance.now();const acquired=abg.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:close,handoffDigest:product.sha256Canonical(close)});
 timing.acquisitionMs=performance.now()-start;
 if(acquired.kind!=='acquired_abg_event_resource'){await save('acquisition-refusal.json',acquired);throw Error(acquired.kind);}
 owner=acquired.resource;
 const project=performance.now(),environment=abg.projectExactPrefixWorkspaceEnvironment(owner.entryPrefix,binding);timing.environmentProjectionMs=performance.now()-project;
 assert.equal(environment.kind,'exact_prefix_workspace_environment');
 await save('authenticated-basis.json',{prefix:owner.entryPrefix,workspaceBinding:{ref:environment.workspaceBinding.bindingId,digest:environment.workspaceBinding.bindingDigest},
 installs:environment.productInstalls.map(install=>({installId:install.installId,productId:install.productId,admissionEventRef:install.admissionEventRef,valueDigest:product.sha256Canonical(install)}))});
 const resolve=performance.now();const result=await product.ProductExecutionResolutionPort.resolve({catalog,catalogView,admittedInstalls:environment.productInstalls,
 verifyInstallAdmission:install=>abg.hasAdmittedProductInstall(environment.artifactTruth,install),programRef:selection.programRef,selection:selectionInput});timing.resolutionMs=performance.now()-resolve;
 await save('resolution-result.json',result);
 console.log(JSON.stringify({kind:result.kind,code:result.code,stage:result.stage,message:result.message,timing}));
}finally{
 if(owner){const closeStart=performance.now();const receipt=abg.closeAbgEventResource(owner,owner.entryPrefix);timing.closeMs=performance.now()-closeStart;await save('close-receipt.json',receipt);assert.deepEqual(receipt.closeHandoff.prefix,close.prefix);}
 timing.totalMs=performance.now()-t0;await save('timing.json',timing);
}
