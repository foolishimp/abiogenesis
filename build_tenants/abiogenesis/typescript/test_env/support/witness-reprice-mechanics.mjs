import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import * as events from '../../build/code/src/abg/event_store.js';
import * as resources from '../../build/code/src/abg/definition_event_resource.js';
import * as nativeWitness from '../../build/code/src/abg/witness_admission_operation.js';
import {WITNESS_OPERATION_CONTRACTS} from '../../build/code/src/abg/witness_operation_contracts.js';
import {PUBLIC_FUNCTION_DEFINITION_FAMILY,PUBLIC_OPERATION_CONTRACT_PROJECTIONS} from '../../build/code/src/shared/public_function_family.js';
import {PUBLIC_PROJECTION_PAYLOADS} from '../../build/code/src/shared/public_function_projections.js';
import {DS1_CAPABILITY_CONTRACT_REGISTER,constructCapabilityDefinitionGraph} from '../../build/code/src/shared/capability_contracts.js';
import {sha256Canonical as hash} from '../../build/code/src/shared/digests.js';
import {admitExactDefinitionCall} from '../../build/code/src/shared/definition_binding_mechanics.js';
import {runExactDefinition} from '../../build/code/src/shared/effect_definition.js';
import {productInstallCoordinate} from '../../build/code/src/product/environment.js';
import {privateOwner} from './r10-private-owner-harness.mjs';
import {canonicalJson} from '../../build/code/src/shared/canonical_json.js';

export {hash,events,resources,nativeWitness,WITNESS_OPERATION_CONTRACTS,admitExactDefinitionCall};
const schemaVersion='5.0.0',root=resolve(import.meta.dirname,'../..');
const coord=(ref,value)=>({ref,digest:hash(value)});
export async function loadMechanism(relative,overrides={}) {
  const path=join(root,'build/code/src',relative),module=new SourceTextModule(readFileSync(path,'utf8'),{
    identifier:path,initializeImportMeta:meta=>{meta.url=pathToFileURL(path).href;},
  }),links=new Map();
  await module.link(async specifier=>{
    if(links.has(specifier))return links.get(specifier);
    const imported=await import(specifier.startsWith('.')?pathToFileURL(resolve(dirname(path),specifier)).href:specifier);
    const values={...imported,...overrides[specifier]},linked=new SyntheticModule(Object.keys(values),function(){
      for(const [name,value]of Object.entries(values))this.setExport(name,value);
    });links.set(specifier,linked);return linked;
  });await module.evaluate();return module.namespace;
}

function declarationFixture() {
  const catalog={productId:'product://mechanical/witness-owner@5',productContentDigest:hash('mechanical-owner'),
    catalogId:'catalog://mechanical/witness-owner@5',catalogVersion:schemaVersion,catalogDigest:hash('mechanical-catalog')};
  const assets=new Map(PUBLIC_PROJECTION_PAYLOADS.operationContractAssets.map(row=>[row.operationId,row]));
  const contractIds=[...new Set([...DS1_CAPABILITY_CONTRACT_REGISTER.flatMap(row=>row.owningPublicContractIds),...assets.keys()])];
  const definitions=PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions;
  const coordinates=[],contracts=[];
  for(const contractId of contractIds){
    const flatRow={contractId,contractVersion:schemaVersion,contractDigest:assets.get(contractId)?.contentDigest??hash(contractId)};
    coordinates.push({contractCatalog:catalog,flatRow,nestedSelector:{selectorKind:'flat_contract',definitionKey:null,slot:null,definitionRef:null}});
    contracts.push(flatRow);
  }
  const byKey=new Map();
  for(const projection of PUBLIC_OPERATION_CONTRACT_PROJECTIONS)for(const member of projection.definitions){
    const flatRow=contracts.find(row=>row.contractId===projection.operationId);assert.ok(flatRow);
    const slots={};for(const [name,slot]of [['request','request'],['result','result'],['refusal','refusal'],['nonTerminal','non_terminal']]){
      const owner=member[name+'Contract'];slots[name]=owner===null?null:{contractCatalog:catalog,flatRow,nestedSelector:{
        selectorKind:'operation_definition_slot',definitionKey:member.definitionKey,slot,definitionRef:owner.definitionRef}};
      if(slots[name])coordinates.push(slots[name]);
    }byKey.set(projection.operationId+'#'+member.definitionKey.memberKey,slots);
  }
  return {catalog,contracts,definitions,byKey,graph:constructCapabilityDefinitionGraph(coordinates)};
}

/** Mechanical fixture: external approval is explicit. Product verification and
 * admitted environment are injected assumptions, NOT installed/native proof.
 * The fixed grant algorithm, call admission, event-resource ownership, native
 * witness transaction, event contracts and close/reopen machinery are real.
 */
export async function witnessMechanics({faultNative=null,transactionFault=false,seedPayloadBytes=0,legacyProfile=false,beforeClose=null}={}) {
  const territory=process.env.ABI5_WITNESS_TEST_ROOT;assert.ok(territory);
  assert.equal(resolve(territory),resolve(root,'../scratch'));
  const scratch=mkdtempSync(join(territory,'witness-')),eventLogPath=join(scratch,'events.jsonl');
  const declaration=declarationFixture(),actor=coord('actor://mechanical/developer','actor'),oldW=coord('workspace-binding://mechanical/old','old W'),newW=coord('workspace-binding://mechanical/current','current W');
  const historical=coord('execution-basis://mechanical/historical','historical basis');
  // Contract-admitted fixture seed only: no claim of a reconstructed Run or
  // real ExecutionBasis producer. No retained store is read, cloned or imported.
  const seedCandidate={kind:'basis_admitted',eventTime:'2026-09-11T00:00:00.000Z',aggregateType:'workspace',aggregateId:oldW.ref,
    parentAggregateId:null,causationEventRefs:[],correlationId:'correlation://mechanical/seed',workflowVersion:schemaVersion,scopeClass:'workspace',basisId:historical.ref,
    payload:{basisRef:historical.ref,basisDigest:historical.digest,basisClass:'root',rawInputValue:{kind:'mechanical-witness-seed',...(seedPayloadBytes?{material:'x'.repeat(seedPayloadBytes)}:{})}}};
  let acquired,seed;
  if(legacyProfile){
    // Disposable raw legacy fixture only, using the unchanged native projector;
    // the actual cold owner authenticates it before issuing a genuine handoff.
    const legacy=await privateOwner('abg/event_store.js',['projectRuntimeEventAtContract']);
    seed=legacy.projectRuntimeEventAtContract([],seedCandidate,events.LEGACY_ROOT_EVENT_CONTRACT_DIGEST);
    const bytes=Buffer.from(canonicalJson(seed)+'\n');writeFileSync(eventLogPath,bytes,{flag:'wx'});
    const stat=statSync(eventLogPath),body={kind:'event_store_reopen_authority',schemaVersion,eventLogPath,device:stat.dev,inode:stat.ino,
      eventLogDigest:'sha256:'+createHash('sha256').update(bytes).digest('hex'),durableByteLength:bytes.length,eventContractDigest:events.LEGACY_ROOT_EVENT_CONTRACT_DIGEST};
    acquired=events.reopenEventStore({...body,authorityDigest:hash(body)});
  }else{
    acquired=events.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion,eventLogPath});
    assert.ok('store'in acquired,JSON.stringify(acquired));seed=events.admitRuntimeEvent(acquired.store,seedCandidate);
  }
  assert.ok('store'in acquired,JSON.stringify(acquired));
  let handoff=acquired.store.projectReopenAuthorityAndClose();
  const ownerManifest={kind:'mechanical-manifest-preimage',schemaVersion};
  const verified={kind:'verified_product_artifact',schemaVersion,disposition:'verified',artifactRef:'artifact://mechanical/owner',artifactDigest:hash('artifact'),
    manifestDigest:hash(ownerManifest),...declaration.catalog,capabilityDefinitionGraph:declaration.graph,publicContracts:declaration.contracts};
  const install={...verified,kind:'product_install',installId:'install://mechanical/owner',admissionEventRef:seed.eventId};
  let environment={kind:'exact_prefix_workspace_environment',schemaVersion,prefix:handoff.prefix,
    artifactTruth:{assumption:'injected exact admitted environment'},workspaceAuthorityBasis:{authorizedActorRef:actor.ref,authorityMode:'trusted_developer'},
    workspaceBinding:{bindingId:newW.ref,bindingDigest:newW.digest,authorizedActorRef:actor.ref,admissionEventRef:seed.eventId},
    productInstalls:[install],resolvedProductLock:{lockId:'lock://mechanical/current',lockDigest:hash('current lock')},
    productSet:{productSetId:'product-set://mechanical/current',productSetDigest:hash('current set')}};
  let nativeCalls=0,observed=[],projectionOverride=null,invocation;
  const projection=(prefix,w)=>projectionOverride?.(prefix,w)??(prefix.coordinateDigest===environment.prefix.coordinateDigest&&w.ref===newW.ref&&w.digest===newW.digest?environment:{kind:'exact_prefix_workspace_environment_refusal'});
  const authority=await loadMechanism('product/admission_authority.js',{
    '../abg/environment_admission.js':{projectWorkspaceEnvironmentFromArtifactTruth:(truth,w)=>projection(truth.prefix,w)},
    '../abg/artifact_truth.js':{projectOwnedPrefixArtifactTruth:prefix=>({kind:'exact_prefix_artifact_truth_projection',prefix})},
    './verify_product.js':{isVerifiedProductArtifact:value=>value?.kind==='verified_product_artifact',verifyProduct:async request=>request.artifactRef===verified.artifactRef?verified:{kind:'product_verification_refusal'}},
    'node:fs/promises':{readFile:async path=>{assert.match(String(path),/product-toolchain-manifest\.json$/);return Buffer.from(JSON.stringify(ownerManifest));}},
    './invocation.js':{constructCapabilityGrant:(...args)=>invocation.constructCapabilityGrant(...args),
      constructAdmissionCapabilityGrants:(...args)=>invocation.constructAdmissionCapabilityGrants(...args)},
  });
  invocation=await loadMechanism('product/invocation.js',{'./admission_authority.js':authority});
  const witnessOwner=transactionFault?await loadMechanism('abg/witness_admission_operation.js',{
    './event_store.js':{admitRuntimeEvent:(store,candidate)=>{
      if(candidate.kind==='declaration_reprice_admitted')throw new Error('injected second-event transaction failure');
      return events.admitRuntimeEvent(store,candidate);
    }},
  }):nativeWitness;
  const binding=await loadMechanism('abg/witness_definition_bindings.js',{
    '../product/admission_authority.js':authority,
    './environment_admission.js':{projectExactPrefixWorkspaceEnvironment:projection},
    './witness_admission_operation.js':{admitWitnessedAct:(...args)=>{nativeCalls++;observed.push(structuredClone(args.slice(0,2)));return faultNative?.(...args)??witnessOwner.admitWitnessedAct(...args);}},
    './definition_event_resource.js':{closeAbgEventResource:(...args)=>{beforeClose?.(...args);return resources.closeAbgEventResource(...args);}},
  });
  function request(overrides={}) {
    const content={declarationRef:oldW.ref,beforeDigest:oldW.digest,afterDigest:newW.digest,changeClass:'realization_refactor',owningTicketRef:'ticket://T-287',reason:'Mechanical witness binding proof only'};
    const contentContract=nativeWitness.WITNESS_CONTENT_CONTRACTS.reprice;
    return {subjectKind:'authority_basis',subject:historical,act:'reprice',content:{kind:'typed_payload',contentContract:{ref:contentContract.ref,digest:contentContract.digest},value:content},
      context:{kind:'basis',basis:historical},evidence:[oldW,newW],provenance:[historical],...overrides};
  }
  async function call({request:body=request(),member='reprice',changeBasis=()=>{},changeAuthority=()=>{},serial='one'}={}) {
    const fixedPacket=WITNESS_OPERATION_CONTRACTS.admit[member],definition=declaration.definitions.find(row=>row.definitionKey.operationId==='abg.operation.witness.admit'&&row.definitionKey.memberKey===member);
    const contracts=declaration.byKey.get('abg.operation.witness.admit#'+member);
    const resource={kind:'witness_reprice_resource_assertion',schemaVersion,eventResource:{kind:'reopen_abg_event_resource',schemaVersion,closeHandoff:handoff,handoffDigest:hash(handoff)}};
    const slots=Object.fromEntries(['workspace_binding','product_set','dependency_lock','catalog_scope','execution_program','graph_function','input_contract','session_policy','capability_grants','actor','transport_steering','verification_references','execution_basis'].map(key=>[key,null]));
    Object.assign(slots,{workspace_binding:newW,product_set:[productInstallCoordinate(install)],dependency_lock:{ref:environment.resolvedProductLock.lockId,digest:environment.resolvedProductLock.lockDigest},actor:{actor,attribution:coord('attribution://mechanical/developer','explicit actor attribution')}});
    const basis={kind:'admission_capability_data',schemaVersion,definition:{definitionKey:definition.definitionKey,definitionRef:definition.definitionRef,definitionDigest:definition.definitionDigest,
      owner:{ref:fixedPacket.owner.authorityRef,digest:fixedPacket.owner.authorityDigest}},ownerArtifact:{request:{artifactPath:join(scratch,'unverified-fixture-placeholder.tgz'),artifactRef:verified.artifactRef,
        expectedArtifactDigest:verified.artifactDigest,expectedProductContentDigest:verified.productContentDigest,expectedManifestDigest:verified.manifestDigest,expectedProductId:verified.productId,expectedPackageName:'@mechanical/witness',expectedPackageVersion:'5.0.0'},verified},request:body,
      resourceScope:{resourcesDigest:hash(resource),authoritySlots:authority.admissionAuthoritySlots(slots)},boundEnvironment:authority.admissionEnvironmentSelection(handoff.prefix,newW)};
    changeBasis(basis);
    const authorityValue={actorRef:actor.ref,authorityMode:'trusted_developer'},approvalValue={decision:'allow',actorRef:actor.ref,definitionRef:definition.definitionRef,definitionDigest:definition.definitionDigest,requestDigest:hash(body),scopeDigest:authority.admissionAuthorityScope(basis).digest};
    const external={kind:'resolved_admission_authority',schemaVersion,actorRef:actor.ref,authorityMode:'trusted_developer',authority:{...coord('authority://mechanical/trusted',authorityValue),value:authorityValue},approval:{...coord('approval://mechanical/exact',approvalValue),value:approvalValue}};
    changeAuthority(external);
    const grants=await Promise.all(definition.capabilityRefs.map(cap=>invocation.constructCapabilityGrant(external,actor.ref,definition.definitionKey.operationId,cap,{kind:'admission_capability_grant_construction_basis',fixedPacket,data:basis})));
    slots.capability_grants={requiredCapabilityRefs:definition.capabilityRefs,grants:grants.map(grant=>({ref:grant.grantRef,digest:grant.grantDigest}))};
    const authBody={kind:'invocation_authority',definitionKey:definition.definitionKey,slots};
    const invocationBody={kind:'public_invocation',schemaVersion,invocationContract:{contractCatalog:declaration.catalog,flatRow:{contractId:'abg.schema.public-operation-invocation',contractVersion:schemaVersion,contractDigest:PUBLIC_PROJECTION_PAYLOADS.commonSchemaAsset.contentDigest},nestedSelector:{selectorKind:'schema_definition',definitionKey:null,slot:null,definitionRef:'#/$defs/PublicInvocation'}},
      definitionRef:definition.definitionRef,definitionVersion:schemaVersion,definitionDigest:definition.definitionDigest,definitionKey:definition.definitionKey,contractCatalog:declaration.catalog,
      invocationAuthority:{...authBody,authorityDigest:hash(authBody)},requestContract:contracts.request,requestRef:'request://mechanical/witness/'+serial,requestDigest:hash(body),request:body,
      expectedResultContract:contracts.result,expectedRefusalContract:contracts.refusal,expectedNonTerminalContract:contracts.nonTerminal,correlationRef:'correlation://mechanical/witness',eventTime:'2026-09-11T00:01:00.000Z',provenanceRefs:[]};
    const invocationDigest=hash(invocationBody);
    return {invocation:{...invocationBody,invocationDigest,invocationRef:`invocation://abiogenesis/${invocationDigest.slice(7)}`},resources:{...resource,admissionAuthority:{basis,authority:external,grants}}};
  }
  function advance(receipt){handoff=receipt.resources.eventResource.closeHandoff;environment={...environment,prefix:handoff.prefix};}
  return {scratch,eventLogPath,seed,historical,oldW,newW,actor,get environment(){return environment;},verified,declaration,authority,invocation,binding,request,call,advance,
    setProjection:fn=>{projectionOverride=fn;},get nativeCalls(){return nativeCalls;},get observed(){return observed;},get handoff(){return handoff;},
    run:call=>runExactDefinition(call,binding.WITNESS_DEFINITION_BINDINGS.admit.reprice(call))};
}
