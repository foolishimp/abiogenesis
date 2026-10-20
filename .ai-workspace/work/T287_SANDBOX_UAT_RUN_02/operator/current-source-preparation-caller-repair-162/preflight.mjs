import assert from 'node:assert/strict';
import {readFile,writeFile,lstat,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {installedModules,requireKind} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/public-setup.mjs';
import {verifyExpectedArtifacts} from './verify-artifacts.mjs';
const root=dirname(fileURLToPath(import.meta.url)),read=async path=>JSON.parse(await readFile(path,'utf8'));
const pin=async path=>{const s=await lstat(path);assert(s.isFile()&&!s.isSymbolicLink());const bytes=await readFile(path);return {path,sha256:createHash('sha256').update(bytes).digest('hex'),byteCount:bytes.length};};
const record=async(name,value)=>{const path=join(root,name);await mkdir(dirname(path),{recursive:true});await writeFile(path,JSON.stringify(value,null,2)+'\n',{flag:'wx'});};
const start=performance.now();let stage='syntax';const stages=[];
async function pulse(name,data={}){stage=name;const value={stage:name,elapsedMs:performance.now()-start,...process.memoryUsage(),...data};stages.push(value);await record('preflight-stages/'+String(stages.length-1).padStart(3,'0')+'-'+name+'.json',value);process.stdout.write(JSON.stringify(value)+'\n');}
try {
 assert(!process.env.NODE_OPTIONS,'Stock heap required; NODE_OPTIONS must be unset');
 const selected=await read(join(root,'preflight-inputs.json'));
 for(const row of [selected.host,selected.acquisition,selected.consumerAcquisition,selected.candidateIdentity,selected.candidateFreeze])assert.deepEqual(await pin(row.path),row);
 const syntax=[];for(const name of ['prepare.mjs','verify-artifacts.mjs','preflight.mjs','execute-preflight.mjs']){
  const checked=spawnSync(process.execPath,['--check',join(root,name)],{env:process.env,encoding:'utf8'});
  assert.equal(checked.status,0,checked.stderr);syntax.push({name,exitCode:checked.status});
 }
 const host=await read(selected.host.path),runtime=await installedModules(host.installedRoot);
 const {product:p,abg:a,api,gtl:g,invocationTruth:truth}=runtime;
 const readPorts=await import(pathToFileURL(join(host.installedRoot,'build/code/src/abg/project_read_ports.js')).href);
 const revision=await import(pathToFileURL(join(host.installedRoot,'build/code/src/abg/worksite_revision.js')).href);
 const immutable=await import(pathToFileURL(join(host.installedRoot,'build/code/src/shared/immutable.js')).href);
 const namespaces={p,a,api,g,truth,revision,readPorts},source=await readFile(join(root,'prepare.mjs'),'utf8'),helper=await readFile(join(root,'verify-artifacts.mjs'),'utf8');
 const bindings=new Set([...(source+helper).matchAll(/\b(p|a|api|g|truth|revision|readPorts)\.([A-Za-z]\w*(?:\.[A-Za-z]\w*)*)\s*\(/g)].map(m=>m[1]+'.'+m[2]));
 for(const name of ['p.sha256Canonical','p.productInstallCoordinate'])bindings.add(name);
 for(const match of source.match(/const constructors=\[([^\]]+)\]/)[1].matchAll(/'([^']+)'/g))bindings.add('g.'+match[1]);
 const availability=[];for(const binding of [...bindings].sort()){
  const [namespace,...path]=binding.split('.');let value=namespaces[namespace];for(const key of path)value=value?.[key];assert.equal(typeof value,'function','Canonical function unavailable: '+binding);availability.push({binding,available:true});
 }
 for(const [name,value] of [['installedModules',installedModules],['requireKind',requireKind],['deepFreeze',immutable.deepFreeze]]){assert.equal(typeof value,'function',name);availability.push({binding:name,available:true});}
 assert.equal(typeof a.projectHistoricalGraphCallSourceAtDurablePrefix,'undefined');
 await pulse('binding-preflight-complete',{syntaxChecks:syntax.length,callableBindings:availability.length,noAcquisition:true});
 const items=await verifyExpectedArtifacts({product:p,acquisitionRows:[{label:'native26',pin:selected.acquisition},{label:'consumer',pin:selected.consumerAcquisition}],pulse});
 const checks=[];
 for(let i=0;i<items.length;i++){
  const item=items[i],copy=JSON.parse(JSON.stringify(item.verified));
  assert.strictEqual(p.selectOwnedProductVerification(item.request,item.verified),item.verified);
  assert.equal(p.selectOwnedProductVerification(item.request,copy),null);
  assert.equal(p.selectOwnedProductVerification({...item.request,artifactRef:item.request.artifactRef+'-mismatch'},item.verified),null);
  const reused=await p.ProductVerificationPort.verify({kind:'product_verification_packet',schemaVersion:'5.0.0',memberKey:'verify',targetKind:'packed_artifact',request:item.request,verifiedArtifact:item.verified});
  assert.strictEqual(reused.verifiedArtifact,item.verified);
  checks.push({label:i===0?'native26':'consumer',exactOwnedIdentity:true,copiedBodyRefusesNominalReceipt:true,mismatchedRequestRefusesNominalReceipt:true,canonicalVerifierConsumerRetainsIdentity:true});
 }
 const native=items[0],v=native.verified,hash=p.sha256Canonical,packet=p.PRODUCT_VERIFICATION_SOURCE_DECLARATIONS.verify;
 const definition=api.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d=>d.definitionKey.operationId===packet.definitionKey.operationId&&d.definitionKey.memberKey===packet.definitionKey.memberKey);assert.ok(definition);
 const pack={kind:'product_verification_artifact_resource',schemaVersion:'5.0.0',artifactPath:native.request.artifactPath,artifact:{ref:v.artifactRef,digest:v.artifactDigest},productContent:{ref:'product-content://abi5-tests/'+v.productContentDigest.slice(7),digest:v.productContentDigest},descriptor:native.verification.coordinates.descriptor,contributionManifest:{ref:v.contributionManifestRef,digest:v.contributionManifestDigest},manifestDigest:v.manifestDigest,productId:v.productId,packageName:v.packageName,packageVersion:v.packageVersion};
 const request={targetKind:'packed_artifact',artifact:pack.artifact,productContent:pack.productContent,descriptor:pack.descriptor,contributionManifest:pack.contributionManifest,declaredDependencies:v.declaredDependencies,compatibilityInputs:v.compatibilityRefs.map(compatibilityRef=>({compatibilityRef,subjectRef:pack.productContent.ref}))};
 const resources={kind:'product_verification_resources',schemaVersion:'5.0.0',targetKind:'packed_artifact',packedArtifact:pack,verifiedArtifact:v};
 const slots=Object.fromEntries(['workspace_binding','product_set','dependency_lock','catalog_scope','execution_program','graph_function','input_contract','session_policy','capability_grants','actor','transport_steering','verification_references','execution_basis'].map(k=>[k,null]));
 const actorRef='actor://abi5-tests/caller-repair-162/preflight',coord=(ref,value)=>({ref,digest:hash(value)});
 const data={kind:'admission_capability_data',schemaVersion:'5.0.0',definition:{definitionKey:definition.definitionKey,definitionRef:definition.definitionRef,definitionDigest:definition.definitionDigest,owner:{ref:packet.owner.authorityRef,digest:packet.owner.authorityDigest}},ownerArtifact:{request:native.request,verified:v},request,resourceScope:{resourcesDigest:hash(resources),authoritySlots:p.admissionAuthoritySlots(slots)},boundEnvironment:null};
 const authorityValue={actorRef,authorityMode:'trusted_developer'},approvalValue={decision:'allow',actorRef,definitionRef:definition.definitionRef,definitionDigest:definition.definitionDigest,requestDigest:hash(request),scopeDigest:p.admissionAuthorityScope(data).digest};
 const authority={kind:'resolved_admission_authority',schemaVersion:'5.0.0',actorRef,authorityMode:'trusted_developer',authority:{...coord('authority://abi5-tests/caller-repair-162/preflight',authorityValue),value:authorityValue},approval:{...coord('approval://abi5-tests/caller-repair-162/preflight',approvalValue),value:approvalValue}};
 await pulse('eventless-grant-construction-start',{eventResource:null});
 const admitted=await p.constructAdmissionCapabilityGrants(authority,actorRef,{kind:'admission_capability_grant_construction_basis',fixedPacket:packet,data},null);
 assert.strictEqual(admitted.data.ownerArtifact.verified,v);assert.equal(admitted.boundEnvironment,null);assert.equal(admitted.grants.length,definition.capabilityRefs.length);
 slots.capability_grants={requiredCapabilityRefs:[...definition.capabilityRefs],grants:admitted.grants.map(grant=>({ref:grant.grantRef,digest:grant.grantDigest}))};
 const operation=v.definitionContractCoordinates.operations.find(x=>x.operationId===packet.definitionKey.operationId),member=operation.members.find(x=>x.memberKey===packet.definitionKey.memberKey);
 const call=api.constructInstalledPublicDefinitionCall({product:p,installedPublic:api,definitionContractCoordinates:v.definitionContractCoordinates,contractCatalog:member.slots.request.contractCatalog,...packet.definitionKey,request,slots,resources:{...resources,admissionAuthority:{basis:admitted.data,authority,grants:admitted.grants}},requestRef:'request://abi5-tests/caller-repair-162/preflight',correlationRef:'correlation://abi5-tests/caller-repair-162/preflight',eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(join(root,'activation.json')).href]});
 assert.strictEqual(call.resources.admissionAuthority.basis.ownerArtifact.verified,v);assert.strictEqual(call.resources.verifiedArtifact,v);
 await pulse('eventless-grant-construction-complete',{ownerReceiptRetained:true,sdkResourceIdentityRetained:true,capabilities:admitted.grants.length,publicDispatch:false});
 await record('binding-preflight.json',{classification:'Exact installed binding and artifact-owner identity proof only; no event resource or Public dispatch',syntax,availability,functionCount:availability.length,artifactChecks:checks,sharedGrantOwnerIdentity:true,sdkOwnerAndTargetResourceIdentity:true,controlledApprovalPremise:'Only eventless Product attestation construction; no authority/currentness/admission for the actual app or source use',installedRoot:host.installedRoot,script:await pin(join(root,'prepare.mjs')),helper:await pin(join(root,'verify-artifacts.mjs')),canonicalOwners:await Promise.all(['abg/index.js','abg/project_read_ports.js','abg/worksite_revision.js','abg/invocation_execution_truth.js','product/index.js','product/verify_product.js','product/admission_authority.js','product/invocation.js','public/index.js','shared/immutable.js'].map(name=>pin(join(host.installedRoot,'build/code/src',name)))),stages,noResourceAcquisition:true,noPublicEffects:true,noModel:true});
 process.stdout.write(JSON.stringify({disposition:'PASS',syntax:syntax.length,callableBindings:availability.length,artifacts:checks.length,sharedGrantOwnerIdentity:true,sdkResourceIdentity:true,noResourceAcquisition:true,noPublicDispatch:true})+'\n');
} catch(error){await record('preflight-first-cause.json',{stage,elapsedMs:performance.now()-start,...process.memoryUsage(),name:error?.name,message:error?.message,stack:error?.stack,action:'STOP; Root evidence-backed Product-bounded action required before retry',noResourceAcquisition:true,noPublicDispatch:true});process.stderr.write(String(error?.stack??error)+'\n');process.exitCode=1;}
