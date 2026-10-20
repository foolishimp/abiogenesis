import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,lstat,stat,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {installedModules,requireKind} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/public-setup.mjs';
import {verifyExpectedArtifacts} from './verify-artifacts.mjs';
import {bindingCoordinateOf,prepareBindingInputs} from './binding-inputs.mjs';
import {recordedPackedResource} from './packed-resources.mjs';
import {borrowCurrentOperationResource} from './operation-resource.mjs';
const root=dirname(fileURLToPath(import.meta.url)),read=async path=>JSON.parse(await readFile(path,'utf8'));
const record=async(name,value)=>{const path=join(root,name);await mkdir(dirname(path),{recursive:true});await writeFile(path,JSON.stringify(value,null,2)+'\n',{flag:'wx'});};
const pin=async path=>{const s=await lstat(path);assert(s.isFile()&&!s.isSymbolicLink());const bytes=await readFile(path);return {path,sha256:createHash('sha256').update(bytes).digest('hex'),byteCount:bytes.length};};
const mem=()=>({...process.memoryUsage(),at:new Date().toISOString(),elapsedMs:performance.now()-t0});
const t0=performance.now();let stage='preflight',resource=null,runtime=null,selection=null;let sequence=0;
async function pulse(name,data={}){stage=name;const value={stage:name,...mem(),...data};await record('stages/'+String(sequence++).padStart(3,'0')+'-'+name+'.json',value);process.stdout.write(JSON.stringify(value)+'\n');}
function pulseNow(name,data={}){stage=name;const value={stage:name,...mem(),...data};mkdirSync(join(root,'stages'),{recursive:true});writeFileSync(join(root,'stages',String(sequence++).padStart(3,'0')+'-'+name+'.json'),JSON.stringify(value)+'\n',{flag:'wx'});process.stdout.write(JSON.stringify(value)+'\n');}
try {
 const selected=await read(join(root,'inputs.json'));
 const completed=selected.completed213;
 const selectedRows=[selected.candidateIdentity,selected.candidateFreeze,selected.host,selected.acquisition,selected.handoff,selected.closed136,selected.rootControl,selected.historicalCaller,selected.consumerAcquisition,selected.consumerPublication,selected.historical136Handoff,selected.recoveryReceipt,selected.recoveryFreeze,selected.setupIdentity,selected.workspaceManifest,...Object.values(completed).filter(x=>x?.path),...Object.values(completed.calls),...Object.values(selected.publicationAcceptance),...Object.values(selected.repairEvidence)];
 const completedCall=async label=>requireKind(await read(completed.calls[label].path),'installed_definition_call_transport_result','completed213-'+label);
 for(const row of selectedRows)assert.deepEqual(await pin(row.path),row);
 const host=await read(selected.host.path),archive=selected.archive,old=await read(join(archive,'run.json')),setup=await read(join(archive,'setup-identity.json'));
 const recovery=await read(selected.recoveryReceipt.path);assert.equal(recovery.kind,'abg_event_resource_recovery_receipt');assert.equal(recovery.outcome.kind,'recovered');assert.deepEqual(recovery.outcome.closeHandoff,await read(selected.historical136Handoff.path));
 //213 is the latest genuine closed entry;136 remains the historical producer.
 //Existing29 installs/binding/catalog/View/covers are owner-authenticated below, with no setup dispatch.
 const physical={material:await read(completed.physical.path)},quiet=await read(completed.quiescence.path);
 assert.equal(physical.material.physicalRows.length,49);
 for(const row of physical.material.physicalRows){const path=join(physical.material.workspaceRoot,row.relativePath);assert(path.startsWith(physical.material.workspaceRoot+'/'));
  if(row.state==='absent')await assert.rejects(access(path),e=>e.code==='ENOENT');else{const s=await lstat(path);assert(s.isFile()&&!s.isSymbolicLink());const b=await pin(path);assert.equal(b.sha256,row.sha256);assert.equal(b.byteCount,row.byteCount);}}
 await assert.rejects(access(quiet.selectedLockPath),e=>e.code==='ENOENT');
 const processFacts=[];for(const {pid} of quiet.ownedProcesses){try{process.kill(pid,0);throw new Error('Previously owned PID exists; exact argv/ancestry recheck required before acquisition: '+pid);}catch(e){if(e.code!=='ESRCH')throw e;processFacts.push({pid,absent:true});}}
 const handoff=await read(selected.handoff.path),s=await stat(fileURLToPath(handoff.prefix.eventLogRef));assert.deepEqual({device:s.dev,inode:s.ino,byteCount:s.size},{device:handoff.prefix.storeIdentity.device,inode:handoff.prefix.storeIdentity.inode,byteCount:handoff.prefix.prefixLength});
 const exactStat=await stat(fileURLToPath(handoff.prefix.eventLogRef),{bigint:true});assert.equal(exactStat.mtimeNs.toString(),selected.preparedPhysicalStat.current213MtimeNsDecimal);
 const originalCall=(await read(join(archive,'calls/lifecycle-start.request.jsonl'))).invocation;
 const sourceCall=(await read(join(selected.currentClosedPhase,'calls/continuation-start.request.jsonl'))).invocation;
 const sourceOutcome=await read(join(selected.currentClosedPhase,'calls/continuation-start.outcome.json'));
 assert.equal(sourceOutcome.receipt.resources.run.ref,selected.sourceRunRef);assert.equal(sourceOutcome.receipt.ownerOutput.value.disposition,'runtime_failed');assert.deepEqual(sourceOutcome.receipt.resources.eventResource.closeHandoff,await read(selected.historical136Handoff.path));
 runtime=await installedModules(host.installedRoot);const {product:p,abg:a,api,gtl:g,invocationTruth:truth}=runtime,hash=p.sha256Canonical;
 const items=await verifyExpectedArtifacts({product:p,acquisitionRows:[{label:'native29',pin:selected.acquisition},{label:'consumer',pin:selected.consumerAcquisition}],pulse});
 const native=items[0];
 assert.equal(native.verified.productContentDigest,host.productContentDigest);assert.equal(native.verified.artifactDigest,'sha256:'+host.artifactSha256);
 const verificationRequests=items.map(item=>{const v=item.verified;return {targetKind:'packed_artifact',artifact:{ref:v.artifactRef,digest:v.artifactDigest},productContent:{ref:'product-content://abi5-tests/'+v.productContentDigest.slice(7),digest:v.productContentDigest},descriptor:item.verification.coordinates.descriptor,contributionManifest:{ref:v.contributionManifestRef,digest:v.contributionManifestDigest},declaredDependencies:v.declaredDependencies,compatibilityInputs:v.compatibilityRefs.map(compatibilityRef=>({compatibilityRef,subjectRef:'product-content://abi5-tests/'+v.productContentDigest.slice(7)}))};});
 const packed=items.map((item,i)=>recordedPackedResource(item,verificationRequests[i]));
 await pulse('packed-resource-correspondence-complete',{beforeAcquisition:true,resources:packed.map(x=>({kind:x.kind,artifactPath:x.artifactPath,artifact:x.artifact,productContent:x.productContent,descriptor:x.descriptor,contributionManifest:x.contributionManifest}))});
 pulseNow('early-fixed-product-resolve-start',{beforeAcquisition:true});
 const fixedResolution=p.ProductEnvironmentPort.resolve({kind:'product_resolution_packet',schemaVersion:'5.0.0',memberKey:'resolve',verifiedArtifacts:items.map(x=>x.verified)});
 pulseNow('early-fixed-product-resolve-returned',{beforeAcquisition:true,returned:fixedResolution===null?null:{kind:fixedResolution.kind}});
 const lock=requireKind(fixedResolution,'resolved_product_lock','actual-current29-lock');
 const lockRef={ref:lock.lockId,digest:lock.lockDigest};
 await pulse('early-fixed-product-resolve-complete',{beforeAcquisition:true,lockRef,meaning:'Actual live29+consumer owner-produced complete lock; retained213 resolve coordinate and full admitted installs/environment must agree'});
 for(const fn of ['acquireAbgEventResource','selectAcquiredAbgEventResource','closeAbgEventResource','readRuntimeEventsAtDurablePrefix','rehydrateInvocationAdmissionAtPrefix','deriveInvocationSourceResultBasisAtPrefix'])assert.equal(typeof a[fn],'function',fn);
 assert.equal(typeof api.runInstalledDefinitionCallWithResource,'function');assert.equal(typeof truth.projectGovernanceCoveredSourceUse,'function');
 await record('physical-preflight.json',{materialReference:physical.material.physicalRows,workspaceRoot:physical.material.workspaceRoot,sourceStat:{device:s.dev,inode:s.ino,byteCount:s.size},processFacts,mtimeNsDecimal:exactStat.mtimeNs.toString(),lockAbsent:true,stockHeap:true,noRuntimeDispatch:true});
 await pulse('acquisition-start',{prefixLength:handoff.prefix.prefixLength,host:host.installedRoot});
 const acquired=a.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:hash(handoff)});
 requireKind(acquired,'acquired_abg_event_resource','genuine213-resource-acquisition');resource=acquired.resource;
 const refreshSelection=()=>a.selectAcquiredAbgEventResource(resource,a.selectHeldEventStoreDurablePrefix(resource.store));selection=refreshSelection();
 const eventsAt=()=>a.readRuntimeEventsAtDurablePrefix(selection.prefix,{requireCurrent:true});
 const prefixAt=()=>a.selectValidatedRuntimeEventPrefix(eventsAt());
 await pulse('acquisition-complete',{eventCount:eventsAt().length,prefix:selection.prefix});
 const sourceAdmission=a.rehydrateInvocationAdmissionAtPrefix(prefixAt(),sourceOutcome.receipt.resources.invocationAdmission.ref);assert.ok(sourceAdmission,'Actual136 invocation admission rehydration refused');
 const derive=()=>a.deriveInvocationSourceResultBasisAtPrefix(prefixAt(),{publicAuthorityDigest:sourceCall.invocation.invocationDigest,runtimeInvocationRef:sourceAdmission.invocationRef,invocationAdmissionRef:sourceAdmission.invocationAdmissionRef,runId:selected.sourceRunRef,resultRef:selected.sourceResultRef});
 let source=derive();assert.ok(source,'Actual34-observation source basis refused');const input=p.retainedGovernanceWorkInput(source.sourceResultValue);assert.ok(input);assert.equal(input.observations.length,34);assert.equal(input.terminal,false);assert.deepEqual(input.original,originalCall.invocation.request.input.value.original);
 await record('source-initial.json',source);await pulse('source-initial',{basisRef:source.basisRef,basisDigest:source.basisDigest,inputDigest:hash(input),observations:34});
 const {deepFreeze}=await import(pathToFileURL(join(host.installedRoot,'build/code/src/shared/immutable.js')).href);
 const readPorts=await import(pathToFileURL(join(host.installedRoot,'build/code/src/abg/project_read_ports.js')).href);
 const oldDeclaration=deepFreeze({kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog:sourceCall.resources.catalog,catalogView:sourceCall.resources.catalogView});
 const lastObservation=input.observations.at(-1),observed=eventsAt().find(e=>e.kind==='c_call_result_admitted'&&e.payload.resultRef===lastObservation.resultRef);assert.ok(observed);assert.equal(observed.payload.resultDigest,lastObservation.resultDigest);
 await pulse('terminal-resource-start',{graphCallId:observed.graphCallId,resultRef:observed.payload.resultRef,admissionOrdinal:observed.admissionOrdinal});
 const terminal=a.projectClosedGraphCallTerminalAtDurablePrefix(selection.prefix,observed.graphCallId,oldDeclaration);
 await record('terminal-discriminator.json',{operation:'projectClosedGraphCallTerminalAtDurablePrefix',prefix:selection.prefix,graphCallId:observed.graphCallId,selectedObservation:lastObservation,admissionEventRef:observed.eventId,admissionOrdinal:observed.admissionOrdinal,declarationProofDigest:hash(oldDeclaration),returned:terminal===null?null:{result:terminal.result,contract:terminal.contract,valueKind:terminal.valueKind,valueDigest:terminal.valueDigest,producer:terminal.producer,projectionBasis:terminal.projectionBasis},meaning:'Auxiliary authentic closed-child declaration-resource lineage; parent200991 remains nonterminal with34 observations.'});
 assert.ok(terminal,'Existing closed-child terminal owner returned null for the actual latest observation; historicalSource resource cannot be fabricated');
 const {value:terminalValue,projectionBasis,...terminalSelection}=terminal;
 const historicalSource=deepFreeze({kind:'abg_historical_graph_call_source_resource',schemaVersion:'5.0.0',terminal:terminalSelection,input:{graphFunctionRef:sourceAdmission.graphFunctionRef,contractRef:sourceAdmission.inputContractRef},declarationProof:oldDeclaration});
 const historicalProjection=readPorts.projectHistoricalGraphCallSourceAtDurablePrefix(selection.prefix,historicalSource);
 await record('historical-source-discriminator.json',{operation:'projectHistoricalGraphCallSourceAtDurablePrefix',declarationReference:{catalogBasisDigest:oldDeclaration.catalog.basisDigest,catalogViewDigest:oldDeclaration.catalogView.viewDigest},returned:historicalProjection===null?null:{terminalResult:terminalSelection.result,publicationRef:historicalProjection.publication.moduleRef,inputGraphFunctionRef:historicalProjection.input.graphFunctionRef,inputContractRef:historicalProjection.input.contractRef,inputDigest:hash(historicalProjection.input.value)}});
 assert.ok(historicalProjection,'Existing historical-source owner returned null for actual terminal and original admitted root input selection');
 await pulse('terminal-resource-complete',{resultRef:terminal.result.ref,sourceInputGraphFunctionRef:historicalProjection.input.graphFunctionRef});
 let bindingCoordinate=setup.workspaceBinding,binding=null,environment=null,catalog=null,view=null;
 const actorRef=setup.workspaceAuthority.authorizedActorRef,coord=(ref,value={ref})=>({ref,digest:hash(value)}),actor={actor:coord(actorRef),attribution:coord(actorRef+'/test-owner')};
 const empty=()=>Object.fromEntries(['workspace_binding','product_set','dependency_lock','catalog_scope','execution_program','graph_function','input_contract','session_policy','capability_grants','actor','transport_steering','verification_references','execution_basis'].map(k=>[k,null]));
 const artifactTruth=()=>requireKind(a.projectOwnedPrefixArtifactTruth(selection.prefix),'exact_prefix_artifact_truth_projection','actual-owned-prefix');
 const refresh=()=>{pulseNow('environment-refresh-start',{workspaceBinding:bindingCoordinate});const actualEnvironment=a.projectWorkspaceEnvironmentFromArtifactTruth(artifactTruth(),bindingCoordinate);pulseNow('environment-refresh-returned',{returned:actualEnvironment===null?null:{kind:actualEnvironment.kind},workspaceBinding:bindingCoordinate});environment=requireKind(actualEnvironment,'exact_prefix_workspace_environment','actual-workspace-environment');binding=environment.workspaceBinding;assert.deepEqual(bindingCoordinateOf(binding),bindingCoordinate);return environment;};
 refresh();const oldBinding=binding,oldAuthority=environment.workspaceAuthorityBasis;assert.deepEqual(oldAuthority,setup.workspaceAuthority);
 await pulse('old-environment-complete',{bindingCoordinate,workspaceId:oldBinding.workspaceId,canonicalRoot:oldAuthority.canonicalRoot});
 //Recorded receipts select actual admissions; they do not supply nominal proof.
 const priorNative=await completedCall('product-install29'),priorConsumer=await completedCall('product-install-consumer29'),priorBinding=await completedCall('workspace-bind29'),priorResolve=await completedCall('product-resolve');
 assert.deepEqual(priorResolve.receipt.ownerOutput.value.resolvedLock,lockRef);
 pulseNow('native-install-query-start',{invocationRef:priorNative.receipt.invocationRef});
 const currentInstall=a.projectAdmittedProductInstallByInvocationRef(artifactTruth(),priorNative.receipt.invocationRef);
 pulseNow('native-install-query-returned',{returned:currentInstall===null?null:{installCoordinate:p.productInstallCoordinate(currentInstall.install)}});
 assert.ok(currentInstall?.install);assert.deepEqual(currentInstall.resolvedLock,lock);assert.deepEqual(p.productInstallCoordinate(currentInstall.install),priorNative.receipt.ownerOutput.value.installedProduct);assert.equal(currentInstall.install.productContentDigest,host.productContentDigest);assert.equal(currentInstall.install.artifactDigest,native.verified.artifactDigest);assert.equal(currentInstall.install.manifestDigest,native.verified.manifestDigest);
 assert.equal(currentInstall.install.installedRoot,join(priorNative.receipt.resources.targetRoot,'node_modules',...native.verified.packageName.split('/')));
 const consumer=items[1];pulseNow('consumer-install-query-start',{invocationRef:priorConsumer.receipt.invocationRef});
 const currentConsumer=a.projectAdmittedProductInstallByInvocationRef(artifactTruth(),priorConsumer.receipt.invocationRef);
 pulseNow('consumer-install-query-returned',{returned:currentConsumer===null?null:{installCoordinate:p.productInstallCoordinate(currentConsumer.install)}});
 assert.ok(currentConsumer?.install);assert.deepEqual(currentConsumer.resolvedLock,lock);assert.deepEqual(p.productInstallCoordinate(currentConsumer.install),priorConsumer.receipt.ownerOutput.value.installedProduct);assert.equal(currentConsumer.install.productContentDigest,consumer.verified.productContentDigest);assert.equal(currentConsumer.install.artifactDigest,consumer.verified.artifactDigest);assert.equal(currentConsumer.install.manifestDigest,consumer.verified.manifestDigest);
 assert.equal(currentConsumer.install.installedRoot,join(priorConsumer.receipt.resources.targetRoot,'node_modules',...consumer.verified.packageName.split('/')));
 const installations=[currentInstall.install,currentConsumer.install],workspaceManifest=await read(selected.workspaceManifest.path);
 assert.equal(workspaceManifest.workspaceRef,oldBinding.workspaceId);assert.equal(workspaceManifest.canonicalRoot,oldAuthority.canonicalRoot);
 bindingCoordinate=priorBinding.receipt.ownerOutput.value.binding;
 pulseNow('binding-query-start',{invocationRef:priorBinding.receipt.invocationRef});
 const currentBinding=a.projectAdmittedWorkspaceBindingByInvocationRef(artifactTruth(),priorBinding.receipt.invocationRef,lock);
 pulseNow('binding-query-returned',{returned:currentBinding===null?null:{workspaceBinding:bindingCoordinateOf(currentBinding.binding)}});
 assert.ok(currentBinding?.binding);assert.deepEqual(bindingCoordinateOf(currentBinding.binding),bindingCoordinate);
 refresh();assert.deepEqual(environment.resolvedProductLock,lock);assert.deepEqual(binding,currentBinding.binding);assert.deepEqual(environment.workspaceAuthorityBasis,oldAuthority);assert.equal(binding.workspaceId,oldBinding.workspaceId);assert.equal(binding.authorizedActorRef,oldBinding.authorizedActorRef);
 for(const field of ['eventLogRoot','runtimeStateRoot','projectionRoot','archiveRoot'])assert.equal(binding.roots[field],oldBinding.roots[field]);
 assert.deepEqual(environment.productInstalls,installations);assert.deepEqual(priorBinding.receipt.ownerOutput.value.installedSet,installations.map(p.productInstallCoordinate));
 assert.deepEqual(binding.roots,prepareBindingInputs(p,{oldBinding,workspaceAuthority:oldAuthority,nativeInstall:currentInstall.install,consumerInstall:currentConsumer.install,nativeTargetRoot:priorNative.receipt.resources.targetRoot,resolvedLock:lock}).roots);
 await pulse('completed213-install-binding-reuse',{nativeInstallInvocationRef:priorNative.receipt.invocationRef,consumerInstallInvocationRef:priorConsumer.receipt.invocationRef,workspaceBinding:bindingCoordinate});
 const constructors=['constructConsensusModulePublication','constructDefaultGovernanceLibraryModulePublication','constructSelfConformanceModulePublication','constructRequirementHandoffModulePublication','constructSemanticRevisionModulePublication','constructSemanticStageModulePublication','constructWorksiteCommandExecutionModulePublication','constructWorksiteCommandForwardModulePublication','constructWorksiteConstructionModulePublication','constructNativeWorkspaceWorkModulePublication'];
 const consumerRecord=await read(selected.consumerPublication.path),consumerPublication=g.modulePublication(consumerRecord.publication);
 for(const [field,verifiedField] of [['artifactDigest','artifactDigest'],['productContentDigest','productContentDigest'],['productManifestDigest','manifestDigest'],['owningProductId','productId']])assert.equal(consumerPublication[field],consumer.verified[verifiedField]);
 const consumerBindings=consumer.verified.contributionManifest.publicationBindings.filter(row=>row.moduleRef===consumerPublication.moduleRef);assert.equal(consumerBindings.length,1);assert.equal(p.modulePublicationSemanticDigest(consumerPublication),consumerBindings[0].publicationDigest);
 //Canonical catalog admission below independently checks exact lock identities and provenance.
 const publications=constructors.map(name=>g[name]({...native.verified,productManifestDigest:native.verified.manifestDigest})).concat(consumerPublication);
 //Rebuild disposable context with the existing pure canonical owners. No Public catalog/view admission is repeated.
 const priorCatalog=await completedCall('catalog-admit29'),priorView=await completedCall('catalog-view29');
 const installedProducts=environment.productInstalls.map(i=>{const owned=a.projectAdmittedProductInstallByAdmissionEventRef(environment.artifactTruth,i.admissionEventRef);assert.ok(owned);return owned.candidate;});
 catalog=requireKind(p.CatalogOperationPort.admit({kind:'catalog_admit_packet',schemaVersion:'5.0.0',memberKey:'admit',readinessBasis:{workspaceBinding:environment.workspaceBindingCandidate,resolvedLock:lock,verifiedProducts:items.map(x=>x.verified),installedProducts,publications}}),'graph_function_catalog','retained213-current29-catalog');
 assert.deepEqual({ref:'graph-function-catalog://abiogenesis/'+catalog.basisDigest.slice(7),digest:catalog.basisDigest},priorCatalog.receipt.ownerOutput.value.catalog);
 view=requireKind(p.narrowGraphFunctionCatalog(catalog,oldDeclaration.catalogView.allowlist),'graph_function_catalog_view','retained213-current29-view');
 assert.deepEqual({ref:'graph-function-catalog-view://abiogenesis/'+view.viewDigest.slice(7),digest:view.viewDigest},priorView.receipt.ownerOutput.value.view);
 const recordedSetup=await read(completed.setup.path);assert.deepEqual(recordedSetup.workspaceBinding,bindingCoordinate);assert.deepEqual(recordedSetup.installations,installations.map(p.productInstallCoordinate));assert.deepEqual(recordedSetup.resolvedLock,lockRef);assert.deepEqual(recordedSetup.catalog,priorCatalog.receipt.ownerOutput.value.catalog);assert.deepEqual(recordedSetup.view,priorView.receipt.ownerOutput.value.view);
 await pulse('completed213-catalog-view-reconstruction',{catalog:recordedSetup.catalog,view:recordedSetup.view,noPublicAdmissionReplay:true});
 const resolution=requireKind(await p.ProductExecutionResolutionPort.resolve({catalog,catalogView:view,admittedInstalls:environment.productInstalls,verifyInstallAdmission:i=>a.hasAdmittedProductInstall(environment.artifactTruth,i),programRef:setup.program.programRef,selection:{kind:'start',scope:'program',target:'next',until:'converged',rootMode:'direct'}}),'loaded_product_execution_resolution','actual-current29-resolution');
 assert.equal(hash(resolution.program),sourceCall.invocation.request.program.digest);assert.equal(hash(resolution.program),'sha256:804754973e3c8cc6ff1dd91eb59824aa3d4bdf7ac7be8820c17d8e71c33bd8e2');
 await record('current-setup-scalars.json',{installations:installations.map(p.productInstallCoordinate),resolvedLock:lockRef,workspaceBinding:bindingCoordinate,catalog:{ref:'graph-function-catalog://abiogenesis/'+catalog.basisDigest.slice(7),digest:catalog.basisDigest},view:{ref:'graph-function-catalog-view://abiogenesis/'+view.viewDigest.slice(7),digest:view.viewDigest},program:resolution.resolution.programRef,programDigest:resolution.resolution.programDigest,currentNativeOwnerRoot:currentInstall.install.installedRoot,meaning:'Documentary coordinates only; complete declarations remain actual owner-created and admitted, not reconstructed from this recording'});
 const usedResults=[{resultRef:source.sourceResultRef,resultDigest:source.sourceResultDigest},...input.observations,...(input.synthesis===null?[]:[input.synthesis])],bases=new Map();
 for(const reference of usedResults){const event=eventsAt().find(e=>e.kind==='c_call_result_admitted'&&e.payload.resultRef===reference.resultRef);assert.ok(event);assert.equal(event.payload.resultDigest,reference.resultDigest);let basis=truth.projectExactExecutionBasisAtPrefix(prefixAt(),event.basisId);assert.ok(basis);
  while(basis!==null&&!bases.has(basis.basisRef)){bases.set(basis.basisRef,basis);basis=basis.parentExecutionBasisRef===null?null:truth.projectExactExecutionBasisAtPrefix(prefixAt(),basis.parentExecutionBasisRef);}}
 await record('consumed-bases.json',[...bases.values()].map(b=>({basisRef:b.basisRef,basisDigest:b.basisDigest,admissionEventRef:b.admissionEventRef,workspaceBindingId:b.workspaceBindingId,workspaceBindingDigest:b.workspaceBindingDigest,invocationAdmissionRef:b.invocationAdmissionRef,graphFunctionRef:b.graphFunctionRef,parentExecutionBasisRef:b.parentExecutionBasisRef})));
 const revision=await import(pathToFileURL(join(host.installedRoot,'build/code/src/abg/worksite_revision.js')).href);
 const recordedBases=await read(completed.consumedBases.path);assert.equal(recordedBases.length,bases.size);
 for(const basis of bases.values()){
  const expected=recordedBases.filter(row=>row.basisRef===basis.basisRef);assert.equal(expected.length,1);assert.equal(expected[0].basisDigest,basis.basisDigest);assert.equal(expected[0].workspaceBindingId,basis.workspaceBindingId);assert.equal(expected[0].workspaceBindingDigest,basis.workspaceBindingDigest);
  const before=revision.projectAdmittedWorkspaceBindingAtCoordinate(prefixAt(),basis.workspaceBindingId,basis.workspaceBindingDigest);assert.ok(before);
  assert.ok(revision.projectWorksiteRevisionBindingCover(prefixAt(),before,binding,[basis]),'Existing213 exact direct D2 cover must reproject; no witness dispatch or transitive inference');
 }
 await pulse('covers-complete',{consumedBases:bases.size});
 source=derive();assert.ok(source,'Source basis no longer applicable at actual current prefix');assert.equal(hash(p.retainedGovernanceWorkInput(source.sourceResultValue)),hash(input));await record('source-current.json',source);
 const currentDeclaration={kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog,catalogView:view};
 // Existing owner projection only: scalar evidence of the actual source
 // invocation and supplied comparison coordinates, not an inner-cause claim.
 const actualSourceInvocation=truth.projectExactInvocationAdmissionAtPrefix(prefixAt(),source.sourceInvocationAdmissionRef);
 const sourceInvocationScalars=actualSourceInvocation===null?null:Object.fromEntries(['invocationAdmissionRef','invocationAdmissionDigest','invocationRef','invocationDigest','workspaceId','workspaceBindingId','workspaceBindingDigest','actorRef','catalogBasisRef','catalogBasisDigest','catalogViewId','catalogViewDigest','programRef','programDigest','graphFunctionRef','graphFunctionDigest','inputContractRef','inputContractDigest','inputContractOwner','outputContractRef','outputContractDigest','outputContractOwner'].map(field=>[field,actualSourceInvocation[field]]));
 const comparisonInput={predecessorPrefix:selection.prefix,source,workspaceBinding:binding,program:resolution.program,graphFunction:resolution.graphFunction,currentDeclaration,historicalDeclarations:[oldDeclaration]};
 await record('source-use-input-scalars.json',{owner:'projectExactInvocationAdmissionAtPrefix',prefix:selection.prefix,sourceInvocation:sourceInvocationScalars,source:{basisRef:source.basisRef,basisDigest:source.basisDigest,invocationAdmissionRef:source.sourceInvocationAdmissionRef,resultRef:source.sourceResultRef,resultDigest:source.sourceResultDigest,valueDigest:source.sourceResultValueDigest,producerGraphFunctionRef:source.sourceGraphFunctionRef,resultAdmissionEventRef:source.sourceResultAdmissionEventRef,resultJudgmentEventRef:source.sourceResultJudgmentEventRef},selected:{programRef:resolution.resolution.programRef,programDigest:resolution.resolution.programDigest,graphFunctionRef:resolution.resolution.graphFunctionRef,graphFunctionDigest:resolution.resolution.graphFunctionDigest,workspaceBinding:bindingCoordinate,historicalCatalogBasisDigest:oldDeclaration.catalog.basisDigest,historicalViewDigest:oldDeclaration.catalogView.viewDigest,currentCatalogBasisDigest:catalog.basisDigest,currentViewDigest:view.viewDigest},meaning:'Actual owner-derived scalar inputs only; producer child and root entry remain distinct; no reconstructed inner refusal.'});
 const use=truth.projectGovernanceCoveredSourceUse(prefixAt(),comparisonInput);
 await record('current-source-use-discriminator.json',{owner:'projectGovernanceCoveredSourceUse',inputRecord:'source-use-input-scalars.json',returned:use===null?null:{useDigest:use.useDigest,sourceBasisRef:use.sourceBasisRef,sourceBasisDigest:use.sourceBasisDigest},meaning:'Null preserved before assert; no fabricated inner cause.'});
 assert.ok(use,'Actual current29→historical24 covered source use refused');assert.equal(use.useDigest,(await read(completed.currentUse.path)).useDigest,'Existing213 result is a correspondence expectation only; actual current owner must derive the use');await record('current-source-use.json',use);await pulse('current-source-use-complete',{useDigest:use.useDigest,owners:use.declarationOwners.length});
 await pulse('pre-close-authority-build-start');
 const packet=p.RUN_OPERATION_CONTRACTS.invoke.start,regimes=new Set([...resolution.programValidation.executableLeafRows,...resolution.programValidation.interactionLeafRows].map(r=>r.fibre)),policy=p.constructRootInvocationPolicy(binding,resolution.program,resolution.programValidation.interactionLeafRows.map(row=>({requirementKey:row.requirementKey,requirementKeyDigest:row.requirementKeyDigest,actorCapabilityRef:row.requirement.actorCapabilityRef})),['F_D','F_P','F_H'].filter(r=>regimes.has(r)),sourceCall.resources.applications);
 const grants=[p.constructCapabilityGrant(policy,actorRef,packet.definitionKey.operationId,p.DIRECT_INVOKE_CAPABILITY,{admittedInstalls:environment.productInstalls,workspaceBinding:binding,fixedPacket:packet})],authority=p.constructInvocationAuthority(actorRef,binding,view,setup.program.programRef,resolution.selectedCatalogEntry,policy,grants,{admittedInstalls:environment.productInstalls,workspaceBinding:binding,fixedPacket:packet});
 const r=sourceCall.resources.runEnvironmentResources,coordinates={dependencies:r.dependencies,pythonPath:r.pythonPath,temporaryRoot:r.temporaryRoot},runEnvironmentResources=p.constructRunEnvironmentResources({...r,permission:{...r.permission,authorityRef:authority.authorityRef,authorityDigest:authority.authorityDigest,...coordinates}});
 await pulse('pre-close-authority-build-complete');
 const finalPrefix=selection.prefix,finalValidatedPrefix=prefixAt();
 await pulse('resource-close-start');const closed=a.closeAbgEventResource(resource,finalPrefix);resource=null;await record('final-resource-receipt.json',closed);await record('final-close-handoff.json',closed.closeHandoff);await pulse('resource-close-complete',{prefixLength:closed.closeHandoff.prefix.prefixLength,coordinateDigest:closed.closeHandoff.prefix.coordinateDigest});
 await pulse('post-close-request-slots-build-start');
 const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:closed.closeHandoff,handoffDigest:hash(closed.closeHandoff)},steering=hash(eventResource),program={ref:resolution.resolution.programRef,digest:resolution.resolution.programDigest},viewRef={ref:'graph-function-catalog-view://abiogenesis/'+view.viewDigest.slice(7),digest:view.viewDigest};
 const boundInput={contract:{ref:resolution.resolution.inputContract.contractRef,digest:resolution.resolution.inputContractDigest},valueRef:'value://abi5-tests/sandbox-uat/'+old.runId+'/continuation-216',valueDigest:hash(input),value:input};
 const request={...sourceCall.invocation.request,catalogView:viewRef,input:boundInput,sourceBasis:{kind:'admitted_source_result',projectionAuthority:{ref:sourceCall.invocation.invocationRef,digest:source.publicAuthorityDigest},sourceResult:{ref:source.sourceResultRef,digest:source.sourceResultDigest}}};
 const slots={...empty(),workspace_binding:bindingCoordinate,product_set:environment.productInstalls.map(p.productInstallCoordinate),dependency_lock:lockRef,catalog_scope:{catalog:{ref:'graph-function-catalog://abiogenesis/'+catalog.basisDigest.slice(7),digest:catalog.basisDigest},view:viewRef,allowlist:request.allowlist},execution_program:program,input_contract:boundInput,session_policy:{ref:policy.policyRef,digest:policy.policyDigest},capability_grants:{requiredCapabilityRefs:[...packet.metadata.capabilityRefs],grants:grants.map(g=>({ref:g.grantRef,digest:g.grantDigest}))},actor:{actor:{ref:actorRef,digest:hash({actorRef})},attribution:{ref:authority.authorityRef,digest:authority.authorityDigest}},transport_steering:{ref:'transport-steering://abiogenesis/'+steering.slice(7),digest:steering}};
 const operation=native.verified.definitionContractCoordinates.operations.find(v=>v.operationId===packet.definitionKey.operationId),member=operation.members.find(v=>v.memberKey==='start');
 const resources={catalog,catalogView:view,applications:sourceCall.resources.applications,source:{kind:'admitted_source_result',basis:source},historicalSource,runEnvironmentResources};
 await pulse('post-close-request-slots-build-complete',{inputDigest:boundInput.valueDigest,programDigest:program.digest});
 await pulse('public-call-construction-start');
 const call=api.constructInstalledPublicDefinitionCall({product:p,installedPublic:api,definitionContractCoordinates:native.verified.definitionContractCoordinates,contractCatalog:member.slots.request.contractCatalog,...packet.definitionKey,request,slots,resources:{...resources,kind:'run_invocation_resource_assertion',schemaVersion:'5.0.0',eventResource},requestRef:'request://abi5-tests/sandbox-uat/'+old.runId+'/continuation-216',correlationRef:'correlation://abi5-tests/sandbox-uat/'+old.runId+'/continuation-216',eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(join(root,'activation.json')).href]});
 await record('authority-correspondence-inputs.json',{actor:slots.actor,requestTarget:request.target,graphFunction:slots.graph_function,policy:{ref:policy.policyRef,digest:policy.policyDigest},interactionLeafCount:resolution.programValidation.interactionLeafRows.length,executableLeafCount:resolution.programValidation.executableLeafRows.length,applicationCount:resources.applications.length,declaredRegimes:[...regimes],grantCoordinates:slots.capability_grants,transportSteering:slots.transport_steering,meaning:'Actual finite selected context before private Product preparation; no dynamic matcher PASS is inferred.'});
 assert.ok(p.isRunInvocationResourceAssertion(call.resources),'Exact native run resource assertion must pass its existing canonical schema before preparation/request recording');
 await pulse('public-call-construction-complete',{invocationRef:call.invocation.invocationRef,invocationDigest:call.invocation.invocationDigest,requestDigest:call.invocation.requestDigest});
 await pulse('private-preparation-start');
 const prepared=await p.ProductRunInvocationPort.prepare({memberKey:'start',invocation:call.invocation,resources,admittedInstalls:environment.productInstalls,workspaceBinding:binding,verifyInstallAdmission:i=>a.hasAdmittedProductInstall(environment.artifactTruth,i),transportResourceAssertion:eventResource,deriveCurrentSourceUse:(basis,resolved)=>{
  pulseNow('covered-use-callback-start',{sourceBasisRef:basis.basisRef,sourceBasisDigest:basis.basisDigest,programRef:resolved.program.programRef,graphFunctionRef:resolved.graphFunction.name});
  const actual=truth.projectGovernanceCoveredSourceUse(finalValidatedPrefix,{predecessorPrefix:finalPrefix,source:basis,workspaceBinding:binding,program:resolved.program,graphFunction:resolved.graphFunction,currentDeclaration,historicalDeclarations:[oldDeclaration]});
  pulseNow('covered-use-callback-complete',{returned:actual===null?null:{useDigest:actual.useDigest,sourceBasisRef:actual.sourceBasisRef,sourceBasisDigest:actual.sourceBasisDigest}});
  return actual;
 }});
 await pulse('private-preparation-complete',{kind:prepared.kind,code:prepared.code??null});
 await pulse('preparation-result-recording-start');
 await record('product-preparation-result.json',prepared.kind==='prepared_product_run_invocation'?{kind:prepared.kind,rawInputDigest:prepared.rawInput.subjectDigest,sourceResultBasis:prepared.sourceResultBasis,currentSourceUse:prepared.currentSourceUse,program:prepared.resolution.resolution,runEnvironment:prepared.runEnvironment}:prepared);
 await pulse('preparation-result-recording-complete',{kind:prepared.kind});
 requireKind(prepared,'prepared_product_run_invocation','actual-private-Product-preparation');
 await pulse('future-request-recording-start');
 await record('calls/continuation-start.request.jsonl',{kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition:{kind:'reopen',closeHandoff:closed.closeHandoff},invocation:call});
 await pulse('future-request-recording-complete',{invocationRef:call.invocation.invocationRef});
 await record('prepared-setup.json',{classification:'Actual installed current29 remaining-consumer preparation; no run.invoke/start dispatch/admission',sourceResultRef:source.sourceResultRef,sourceBasisRef:source.basisRef,sourceInputDigest:hash(input),observations:34,terminal:false,workspaceAuthority:setup.workspaceAuthority,workspaceBinding:binding,program,view:viewRef,installedRoot:currentInstall.install.installedRoot,currentUseDigest:use.useDigest,consumedBases:bases.size,finalPrefix,limits:{nativeMs:old.configuration.processTimeoutMs,nativeBytes:old.configuration.maxProcessOutputBytes,outerMs:19260000,outerBytes:536870912},operatorControlReference:selected.rootControl,qualityWindow:'Actual future nativeCLI command.request.started+18000000ms; no216 clock/native authority',launch:{executable:old.configuration.nodePath,args:[join(currentInstall.install.installedRoot,'build/code/src/public/cli.js'),'--jsonl',join(root,'calls/continuation-start.request.jsonl')],cwd:root},noCopyResetOrRetag:true});
 await pulse('preparation-complete',{currentUseDigest:use.useDigest,observations:34,sourceResultRef:source.sourceResultRef});
} catch(error) {
 await record('first-cause.json',{stage,...mem(),name:error?.name,message:error?.message,stack:error?.stack,actualOutcome:error?.actualOutcome??null,disposition:'HOLD; first actual failure preserved; no retry or model dispatch',action:'Root multi-frame owner triage and selected Product-bounded action required before any retry'});
 process.stderr.write(String(error?.stack??error)+'\n');process.exitCode=1;
} finally {
 if(resource!==null&&runtime!==null){const current=runtime.abg.selectHeldEventStoreDurablePrefix(resource.store);const closed=runtime.abg.closeAbgEventResource(resource,current);await record('final-resource-receipt.json',closed);await record('final-close-handoff.json',closed.closeHandoff);resource=null;}
}
