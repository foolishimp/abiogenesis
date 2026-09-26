// Pure owner regression from the actual installed refusal. No runtime admission.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const D=import.meta.dirname,repo=resolve(D,'../../../../');
const load=root=>import(pathToFileURL(join(root,'build/code/src/product/index.js')));
const current=await load(join(repo,'build_tenants/abiogenesis/typescript'));
const predecessor=JSON.parse(await readFile(join(D,'../20260923_COMPOSITE_READINESS/compiled-45/selected-core.json'),'utf8'));
const before=await load(predecessor.packageRoot);
const bytes=gunzipSync(await readFile(join(D,'catalog-input.json.gz')));
const r=JSON.parse(bytes).resources;
const {admissionEventRef,...workspace}=r.workspaceBinding;
const basis={workspaceBinding:{...workspace,kind:'workspace_binding_candidate'},resolvedLock:r.resolvedLock,
  verifiedProducts:r.verifiedProducts,publications:r.publications,
  installedProducts:r.admittedInstalls.map(({kind,disposition,admissionEventRef,...rest})=>({kind:'product_install_candidate',disposition:'materialized',...rest}))};
const invoke=(owner,selected=basis)=>owner.CatalogOperationPort.admit({kind:'catalog_admit_packet',schemaVersion:'5.0.0',memberKey:'admit',readinessBasis:selected});
const started=performance.now(),old=invoke(before),accepted=invoke(current),checks=[];
assert.equal(old.code,'binding_lock_mismatch');checks.push('unchanged core45 reproduces actual refusal');
assert.equal(accepted.kind,'graph_function_catalog',JSON.stringify(accepted));checks.push('exact three-Product lock order accepted');
assert.equal(accepted.readinessBasis.workspaceBinding.productSetDigest,basis.workspaceBinding.productSetDigest);
assert.deepEqual(accepted.readinessBasis.installedProducts.map(x=>x.installId),basis.installedProducts.map(x=>x.installId));
checks.push('original ordered ProductSet and binding conserved');
assert.equal(invoke(current,{...basis,installedProducts:[...basis.installedProducts].reverse()}).code,'binding_lock_mismatch');
checks.push('reordered installs under unchanged lock refused');
const permuted=invoke(current,{...basis,verifiedProducts:[...basis.verifiedProducts].reverse(),publications:[...basis.publications].reverse()});
assert.equal(permuted.kind,'graph_function_catalog');assert.equal(permuted.basisDigest,accepted.basisDigest);
checks.push('independent verified/publication order remains canonical');
assert.equal(invoke(current,{...basis,installedProducts:basis.installedProducts.slice(1)}).code,'installed_product_mismatch');
checks.push('missing install still refused');
const result={status:'passed',checks,inputSha256:current.sha256Bytes(bytes),sourceSha256:await current.sha256File(join(repo,'build_tenants/abiogenesis/typescript/code/src/product/catalog.ts')),
  elapsedMs:performance.now()-started,scope:'pure readiness over retained actual input; no installed successor or runtime qualification'};
await writeFile(join(D,'regression-result.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(result));
