// One bounded pure current packet construction. No Run, Task admission or Runtime facts.
import assert from 'node:assert/strict';
import {readFile,writeFile,open} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {loadPackageExport,constructStart} from './public-support.mjs';
import {verificationRequest} from './ordinary-caller.mjs';
import {actualOwnerContext} from './proof-oracles.mjs';
import {assertionForInvokingView} from './prepare-resources.mjs';
import {constructRuntimeBoundInputs,assertMaterialRoleAliases} from './current-resources.mjs';
const report=dirname(dirname(fileURLToPath(import.meta.url))),read=async p=>JSON.parse(await readFile(p,'utf8'));
const write=(n,v)=>writeFile(join(report,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const start=performance.now();let frontier='pinned-current-public-owner-import';
try{
 const selected=await read(join(report,'candidate-binding.json')),coords=await read(join(report,'f11/actual-setup-coordinates.json'));
 const dependency=await readFile(join(report,'../rc1-setup09-acceptance-01/acceptance.json'));
 assert.equal(dependency.length,9596);assert.equal(createHash('sha256').update(dependency).digest('hex'),'4696d73552536c99a47e3a9db6cf277d7d318bf725ced3b2e95225aa0c8bba74');
 const root=coords.currentInstalledRoot;
 const [product,validator,gtl,abg,publicApi]=await Promise.all(['product','validator','gtl','abg','public'].map(n=>loadPackageExport(root,'@abiogenesis/typescript-tenant','./'+n)));
 const hash=product.sha256Canonical;
 const currentGtl=coords.catalog.boundPublications.find(p=>p.moduleRef===gtl.SELF_CONFORMANCE_IDS.moduleRef);
 assert.ok(currentGtl);assert.equal(currentGtl.graphFunctions.find(g=>g.name===gtl.QUALIFICATION_IDS.assessGraph).declarations['abg.raw_result_contract'],gtl.QUALIFICATION_IDS.assessmentRaw,'actual current catalog preserves F_P native raw publication');
 for(const pin of [coords.acceptance,coords.freeze,...coords.selectedOriginalRecordPins]){const b=await readFile(pin.path);assert.equal(b.length,pin.bytes);assert.equal('sha256:'+createHash('sha256').update(b).digest('hex'),'sha256:'+pin.sha256);}
 const installCoordinate=product.productInstallCoordinate(coords.coreInstall),installedProduct={installId:installCoordinate.ref,installDigest:installCoordinate.digest,productId:coords.coreInstall.productId,productContentDigest:coords.coreInstall.productContentDigest};
 frontier='concrete-full-current-b-task-plan-scope-material-construction';
 const declarationProofs=[{kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog:coords.catalog,catalogView:coords.catalogView}];
 const result=await constructRuntimeBoundInputs({product,validator,gtl,...coords,installedProduct,declarationProofs});
 await write('f11-material-role-negatives.json',{...(await read(join(report,'historical-q06/f11-material-role-negatives.json'))),evidenceStatus:'Q06 exact two unchanged alias negatives retained; not rerun'});
 frontier='exact-full-resource-readiness-artifact';
 // Stream members individually. Do not create a second giant resource string merely to retain it.
 const handle=await open(join(report,'f11-bound-resource-manifest.json'),'wx');let bytes=0;
 const emit=async s=>{const b=Buffer.from(s);bytes+=b.length;await handle.write(b);};
 try{
  await emit('{');const resource=result.packet.assertion.manifests[0];let first=true;
  for(const [key,value]of Object.entries(resource)){
   if(!first)await emit(',');first=false;await emit(JSON.stringify(key)+':');
   if(key==='entries'){
    await emit('[');for(let i=0;i<value.length;i++){if(i)await emit(',');await emit(JSON.stringify(value[i]));}await emit(']');
   }else await emit(JSON.stringify(value));
  }await emit('}\n');
 }finally{await handle.close();}
 const maxString=536870888,resourceCanonicalBytes=bytes-1;
 const assertionWrapperBytes=Buffer.byteLength(JSON.stringify({...result.packet.assertion,manifests:[]}));
 const actualAssertionBytes=assertionWrapperBytes+resourceCanonicalBytes;
 const embeddedCanonicalBytes=Buffer.byteLength(JSON.stringify(result.embeddedAssessment));
 assert.ok(resourceCanonicalBytes<maxString&&actualAssertionBytes<maxString&&embeddedCanonicalBytes<maxString,'actual full resource/assertion/embedded string envelope must fit frozen Node limit');
 result.ready.actualEnvelopeBytes={resourceJSON:bytes,resourceCanonical:resourceCanonicalBytes,assertionJSON:actualAssertionBytes,assertionCanonical:actualAssertionBytes,embeddedAssessmentJSONAndCanonical:embeddedCanonicalBytes,frozenNodeMaxString:maxString};
 const assertion={...result.packet.assertion,manifests:[]};
 await write('f11-bound-packet.json',{assessmentInput:result.packet.assessmentInput,assertionManifestRef:result.packet.assertion.manifests[0].resourceRef,
  assertionManifestFile:'f11-bound-resource-manifest.json',declarationProofs:assertion.declarationProofs,selfConformanceBase:result.packet.selfConformanceBase,
  coverageCatalog:result.packet.coverageCatalog,raw:result.packet.raw,sourceMemberSelections:result.packet.sourceMemberSelections,
  runtimeAdmission:false,coordinateStatus:'actual_admitted',newTaskOrRunAdmission:false,actualSetupAcceptance:coords.acceptance});
 frontier='actual-published-reference-owner-preparation';
 const setupRoot=join(report,'../f11-carrier-installed-setup-09'),prospect=await read(join(setupRoot,'prospective-cases.json'));
 const verifyPacket={kind:'product_verification_packet',schemaVersion:'5.0.0',memberKey:'verify',targetKind:'packed_artifact',request:verificationRequest(prospect.core)};
 const verification=await product.ProductVerificationPort.verify(verifyPacket);
 assert.equal(verification.kind,'product_verification_success','same-process current artifact nominal verification');
 assert.strictEqual(product.selectOwnedProductVerification(verifyPacket.request,verification.verifiedArtifact),verification.verifiedArtifact);
 const binding={ref:coords.workspaceBinding.bindingId,digest:coords.workspaceBinding.bindingDigest};
 const environment=abg.projectExactPrefixWorkspaceEnvironment(coords.closeHandoff.prefix,binding);
 assert.equal(environment.kind,'exact_prefix_workspace_environment');
 assert.deepEqual(environment.workspaceBinding,coords.workspaceBinding);
 const ownerEnvironment={...environment,product,abg,catalog:coords.catalog,catalogView:coords.catalogView,admittedInstalls:environment.productInstalls,verified:verification.verifiedArtifact};
 const archive=assertionForInvokingView(result.packet.assertion,coords.catalog,coords.catalogView,hash);
 const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:coords.closeHandoff,handoffDigest:hash(coords.closeHandoff)};
 const parentSelection=await read(join(report,'f11/parent-selection.json'));
 const selection=(programRef,graphFunctionHandle,label)=>({programRef,selection:{kind:'start',scope:'program',target:'graph_function',graphFunctionHandle,until:'converged',rootMode:'direct'},fhMode:'direct',sourceBasis:{kind:'none'},inputRef:'input://abiogenesis/t287/q07/'+label,requestRef:'request://abiogenesis/t287/q07/'+label,correlationRef:'correlation://abiogenesis/t287/q07/preparation',provenanceRefs:['file://'+join(report,'request.txt')]});
 const corePrepared=await constructStart({environment:ownerEnvironment,publicApi,eventResource,inputFactory:()=>result.packet.assessmentInput,selection:selection('program://abiogenesis/qualification/assess@5',gtl.QUALIFICATION_IDS.assessGraph,'child-prompt-preparation-only'),qualificationResources:archive,parentSelection});
 const owner=await actualOwnerContext({product,abg,state:{environment}},corePrepared);
 const established=owner.qualificationResources.assessment(owner.admittedInput,()=>{throw Error('actual preparation did not establish complete assessment view');});
 const currentRequest=validator.qualificationWorkerRequest(owner.admittedInput,established);
 const parentPrepared=await constructStart({environment:ownerEnvironment,publicApi,eventResource,inputFactory:()=>result.packet.assessmentInput,selection:selection(parentSelection.programRef,parentSelection.graphFunctionRef,'future-wrapper-parent'),qualificationResources:archive,parentSelection});
 await write('actual-owner-preparation-readiness.json',{status:'CLOSED',kind:owner.kind,actualSetupAcceptance:coords.acceptance,actualBinding:binding,sameProcessNominalChecks:1,coreProgram:corePrepared.resolution.resolution.programRef,parentProgram:parentPrepared.resolution.resolution.programRef,referenceOwnerPrepared:true,completeEstablishedAssessmentView:true,requestDigest:hash(currentRequest),promptUtf8Bytes:Buffer.byteLength(currentRequest.prompt),promptSHA256:'sha256:'+createHash('sha256').update(currentRequest.prompt).digest('hex'),scope:'pure preparation over already admitted Setup09 coordinates',newTaskOrRunAdmission:false,RunInvocation:false,providerCalls:0});
 await writeFile(join(report,'f11-bound-prompt.txt'),currentRequest.prompt,{flag:'wx'});
 await write('f11-bound-worker-request.json',currentRequest);
 result.ready.promptBytes=Buffer.byteLength(currentRequest.prompt);
 result.ready.promptSHA256='sha256:'+createHash('sha256').update(currentRequest.prompt).digest('hex');
 result.ready.actualPublishedReferenceOwnerPrepared=true;
 result.ready.actualPublishedRenderer=true;
 result.ready.actualCurrentOwnerRequest=true;
 result.ready.actualEnvelopeBytes.currentRequestJSONAndCanonical=Buffer.byteLength(JSON.stringify(currentRequest));
 result.ready.actualEnvelopeBytes.promptUTF8=Buffer.byteLength(currentRequest.prompt);
 assert.ok(result.ready.actualEnvelopeBytes.currentRequestJSONAndCanonical<maxString&&result.ready.actualEnvelopeBytes.promptUTF8<maxString,'actual current request/prompt string envelope must fit frozen Node limit');
 await write('f11-packet-readiness.json',{kind:'current_C09_full_F11_input_preparation',status:'CLOSED',workResult:'GO_PREPARATION_EXISTING_SETUP_ASSERTIONS',frontier,
  ...result.ready,resourceSerializationBytes:bytes,actualAdmission:false,actualReferenceOwnerConsumption:'actual current published ProductRunInvocationPort.prepare and established resource assessment view inspected; no dispatch',
  cost:{elapsedMs:performance.now()-start,resourceUsage:process.resourceUsage(),heap:'default; no heap override',nativeTaskOrRuntimeEffects:0},
  limits:['Complete current embedded and reference input/material/scope guards, actual installed reference owner preparation, and its renderer were exercised with exact law and retained bodies.',
   'This constructs assertions over exact Root-accepted already admitted Setup09 A/W/install/catalog/View coordinates. It creates no new Task, Run, J or admission.',
   'All inventory byte selections are resource data. Three governing bodies, a 39KB alias derivation context and unchanged original attribution spans enter this prompt.',
   'No semantic criteria, source attribution sufficiency, independent J, F11, observed qualification, AF22 or release are established.']});
 process.stdout.write(JSON.stringify({workResult:'GO_PREPARATION_EXISTING_SETUP_ASSERTIONS',inventoryMembers:result.ready.inventoryMembers,resourceBytes:bytes,promptBytes:result.ready.promptBytes,elapsedMs:performance.now()-start})+'\n');
}catch(error){
 await write('f11-packet-readiness.json',{kind:'current_C09_full_F11_input_preparation',status:'CLOSED',workResult:'NO_GO',frontier,error:{name:error.name,message:error.message,stack:error.stack},
  noAutonomousRepair:true,RuntimeAdmission:false,cost:{elapsedMs:performance.now()-start,resourceUsage:process.resourceUsage()}});
 process.stderr.write(error.stack+'\n');process.exitCode=2;
}
