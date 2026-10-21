#!/usr/bin/env node
// Read-only actual-owner follow-up. No EventStore acquisition, admission or fixture construction.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,lstat,realpath,mkdir,writeFile} from 'node:fs/promises';
import {dirname,isAbsolute,join,relative} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const sha=b=>createHash('sha256').update(b).digest('hex');
const pin=async p=>{assert.ok(isAbsolute(p.path));const b=await readFile(p.path);assert.equal(sha(b),p.sha256,p.path);return b;};
const object=async p=>JSON.parse(await pin(p));
const inside=(r,p)=>{const x=relative(r,p);return x===''||(!x.startsWith('..')&&!isAbsolute(x));};
async function main(){
  assert.equal(process.argv.length,3,'node owner-resolution.mjs ABSOLUTE_CONFIG');
  const bytes=await readFile(process.argv[2]),c=JSON.parse(bytes);
  assert.equal(c.kind,'t287_final_owner_resolution_configuration');assert.equal(c.status,'activated');
  const g=JSON.parse(await readFile(c.activationFile));
  assert.equal(g.status,'granted');assert.equal(g.configurationSha256,sha(bytes));
  assert.equal(g.scriptSha256,sha(await readFile(fileURLToPath(import.meta.url))));
  assert.equal(g.subjectId,c.subjectId);assert.equal(g.nativeCalls,0);assert.equal(g.outputRoot,c.outputRoot);
  assert.equal(c.environment.NODE_OPTIONS,undefined);assert.equal(c.environment.ABG_TS_CLAUDE_COMMAND,undefined);
  const result=await object(c.p1.result),setup=await object(c.p1.ownerState);
  assert.equal(result.status,'satisfied');assert.equal(result.lane,'public-preparation');assert.equal(result.subjectId,c.subjectId);
  for(const p of c.requiredPins)await pin(p);
  assert.equal(await realpath(c.installedRoot),c.installedRoot);
  const members=await object(c.installedInventory);
  for(const row of members.files){const p=join(c.installedRoot,row.path);assert.ok(inside(c.installedRoot,p));if(row.type==='symlink')throw new Error('owner inventory must select regular callable payload');await pin({path:p,sha256:row.sha256});}
  const prefixBefore=await readFile(new URL(setup.closeHandoff.prefix.eventLogRef));
  assert.equal('sha256:'+sha(prefixBefore),setup.closeHandoff.prefix.prefixDigest);
  assert.equal(prefixBefore.length,setup.closeHandoff.prefix.prefixLength);
  try{await lstat(c.outputRoot);assert.fail('output root already exists');}catch(e){if(e.code!=='ENOENT')throw e;}
  await mkdir(c.outputRoot,{recursive:true});assert.equal(await realpath(c.outputRoot),c.outputRoot);
  const record=async(n,v)=>{const p=join(c.outputRoot,n);assert.ok(inside(c.outputRoot,p));await mkdir(dirname(p),{recursive:true});await writeFile(p,JSON.stringify(v,null,2)+'\n',{flag:'wx'});};
  await record('preconditions.json',{configurationSha256:sha(bytes),subjectId:c.subjectId,installedRoot:c.installedRoot,closeHandoff:setup.closeHandoff,noAcquisition:true});
  const load=n=>import(pathToFileURL(join(c.installedRoot,'build/code/src',n,'index.js')).href);
  const [product,abg,api]=await Promise.all(['product','abg','public'].map(load));
  const truth=abg.projectExactPrefixArtifactTruth(setup.closeHandoff.prefix);
  assert.equal(truth.kind,'exact_prefix_artifact_truth_projection');
  const environment=abg.projectWorkspaceEnvironmentFromArtifactTruth(truth,setup.workspaceBinding);
  assert.equal(environment.kind,'exact_prefix_workspace_environment');
  const catalogRequest=(await object(c.p1.catalogCall)).invocation;
  const catalogOutcome=await object(c.p1.catalogOutcome);
  const resources=catalogRequest.resources;
  const installedProducts=environment.productInstalls.map(x=>abg.projectAdmittedProductInstallByAdmissionEventRef(truth,x.admissionEventRef).candidate);
  const catalog=product.CatalogOperationPort.admit({kind:'catalog_admit_packet',schemaVersion:'5.0.0',memberKey:'admit',readinessBasis:{
    workspaceBinding:environment.workspaceBindingCandidate,resolvedLock:setup.resolvedLock,
    verifiedProducts:resources.verifiedProducts,installedProducts,publications:resources.publications}});
  assert.equal(catalog.kind,'graph_function_catalog');assert.equal(catalog.basisDigest,catalogOutcome.receipt.ownerOutput.value.catalog.digest);
  const viewCall=(await object(c.p1.viewCall)).invocation;
  const view=product.narrowGraphFunctionCatalog(catalog,viewCall.invocation.request.allowlist);
  assert.equal(view.kind,'graph_function_catalog_view');
  const args={catalog,catalogView:view,admittedInstalls:environment.productInstalls,
    verifyInstallAdmission:x=>abg.hasAdmittedProductInstall(truth,x),programRef:setup.selectedProgram.programRef,
    selection:{kind:'start',scope:'program',target:'next',until:'converged',rootMode:'direct'}};
  const positive=await product.ProductExecutionResolutionPort.resolve(args);
  assert.equal(positive.kind,'loaded_product_execution_resolution');assert.deepEqual(positive.resolution,setup.resolution);
  const warm=await product.ProductExecutionResolutionPort.resolve(args);
  assert.equal(warm.kind,'loaded_product_execution_resolution');assert.equal(warm.programValidation,positive.programValidation);
  assert.equal(abg.hasAdmittedProductInstall(truth,positive.programInstall),true);
  const duplicated=await product.ProductExecutionResolutionPort.resolve({...args,admittedInstalls:[...args.admittedInstalls,positive.programInstall]});
  await record('actual-owner-results.json',{positive:positive.resolution,warm:warm.resolution,validationIdentityPreserved:warm.programValidation===positive.programValidation,duplicated,
    duplicatedInstall:positive.programInstall,rule:'D03-OWNER-ORACLE-TRIAGE-01: earlier admitted-install bijection refuses duplicates; no invented second admission'});
  assert.equal(duplicated.kind,'product_execution_resolution_refusal');assert.equal(duplicated.stage,'dependency');assert.equal(duplicated.code,'incompatible_or_unproven');
  const family=api.PUBLIC_FUNCTION_DEFINITION_FAMILY;
  assert.ok(Object.isFrozen(family)&&Object.isFrozen(family.definitions));
  const keys=family.definitions.map(d=>{assert.ok(Object.isFrozen(d)&&Object.isFrozen(d.definitionKey));return product.canonicalJson(d.definitionKey);});
  assert.equal(new Set(keys).size,keys.length);
  await record('immutable-family-domain.json',{familyRef:family.familyRef,familyDigest:family.familyDigest,keySetDigest:family.keySetDigest,keys,unique:true,mutated:false});
  // Adapter only: this existing source-owned case expects a raw call and parallel receipt path.
  const resolveCall=(await object(c.p1.resolveCall)).invocation,resolveOutcome=await object(c.p1.resolveOutcome);
  await record('calls/preparation-resolve.json',resolveCall);await record('receipts/preparation-resolve.json',resolveOutcome);
  assert.deepEqual(await readFile(new URL(setup.closeHandoff.prefix.eventLogRef)),prefixBefore);
  await record('result.json',{status:'satisfied',subjectId:c.subjectId,nativeCalls:0,actualOwner:true,noNewAdmission:true,eventBytesUnchanged:true,
    preparationCaseEnvironment:{ABI5_PREPARATION_RESOLVE_CALL:join(c.outputRoot,'calls/preparation-resolve.json')},
    limit:'controlled actual-owner read; existing static preparation test is a separately granted invocation, not run by this script'});
}
await main();
