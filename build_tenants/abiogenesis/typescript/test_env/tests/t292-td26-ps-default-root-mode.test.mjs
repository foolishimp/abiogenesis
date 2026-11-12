import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,writeFile,mkdir,cp,chmod,realpath} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import * as product from '../../build/code/src/product/index.js';
import * as gtl from '../../build/code/src/gtl/index.js';
import {resolveProgramStart,graphFunctionStartRefusal} from '../../build/code/src/gtl/public_start.js';
import {admitRuntimeContract} from '../../build/code/src/shared/public_function_contracts.js';
import {installOncePerFile,installTenantOnce,openCaseEnvironment} from '../support/root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct,runInstalledCliRequest} from '../support/registered-graph-selection.mjs';
import {libraryConsumerDeclaration,libraryEnvironment,witnessInput,witnessRef,assessmentSchema,schemaPath} from '../support/default-library.mjs';

// REQ-P-POLICY-013, REQ-P-POLICY-023 and the Product's Standard System
// Program: the start request's root mode defaults to `direct`, so a start that
// states nothing but defaults, with target `next`, of a Program whose default
// start is the Executive selects the Executive. `supervised` selects only the
// declared start of a supervised Program, and only when the request states it.
// The start law (`gtl/public_start.ts`) is unchanged; only the request default
// is. An omitted root mode reads as `direct` in every row.
const packageRoot=new URL('../..',import.meta.url).pathname;
const witnessRoot=new URL('../../../../../.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/default-library-witness/',import.meta.url).pathname;
const basis={productId:product.ABI5_PRODUCT_ID,packageName:'@abiogenesis/typescript-tenant',packageVersion:product.ABI5_PACKAGE_VERSION,artifactDigest:'sha256:'+'1'.repeat(64),productContentDigest:'sha256:'+'2'.repeat(64),productManifestDigest:'sha256:'+'3'.repeat(64)};
const constructors=['constructDefaultGovernanceLibraryModulePublication','constructNativeWorkspaceWorkModulePublication','constructWorksiteCommandExecutionModulePublication'];
const COMPLETE=witnessRef('support','complete-source-outcome');
const SUPERVISED=witnessRef('program','supervised');
const ZERO='sha256:'+'0'.repeat(64);
const coord=ref=>({ref,digest:ZERO});
const library=gtl.constructDefaultGovernanceLibraryModulePublication(basis),libraryProgram=library.programs[0],libraryStart=libraryProgram.starts[0];
const MODES=[['absent',undefined],['direct','direct'],['supervised','supervised']];

// One start request with every field but the two defaulted modes.
const sampleRequest=target=>({program:coord(libraryProgram.programRef),scope:'program',target,until:'converged',catalogView:coord('catalog-view://td26-ps'),allowlist:[],
  input:{contract:coord('contract://td26-ps'),valueRef:'value://td26-ps',valueDigest:ZERO,value:{}},sourceBasis:{kind:'none'}});

test('the start request admits an omitted root mode as direct and a stated root mode as stated',()=>{
  const start=product.RUN_OPERATION_CONTRACTS.invoke.start;
  assert.deepEqual(start.metadata.defaults,{fhMode:'direct',rootMode:'direct'});
  assert.deepEqual(start.metadata.closedDomains.rootMode,['direct','supervised']);
  const omitted=admitRuntimeContract(start.requestSchema,sampleRequest({kind:'next'}));
  assert.equal(omitted.disposition,'admitted');assert.deepEqual([omitted.value.fhMode,omitted.value.rootMode],['direct','direct']);
  for(const rootMode of ['direct','supervised']){
    const stated=admitRuntimeContract(start.requestSchema,{...sampleRequest({kind:'next'}),rootMode});
    assert.equal(stated.disposition,'admitted');assert.equal(stated.value.rootMode,rootMode);
  }
  assert.deepEqual(admitRuntimeContract(start.requestSchema,{...sampleRequest({kind:'next'}),rootMode:'other'}),{disposition:'refused',issuePaths:['/rootMode']});
});

// The start law over each Program root-mode policy, as Product resolution
// calls it, for each admitted root mode: the absent rows equal the direct rows.
test('start law table: an omitted root mode selects as direct over each Program policy',()=>{
  const start=product.RUN_OPERATION_CONTRACTS.invoke.start;
  const {'abg.root_mode':_mode,...noPolicy}=libraryProgram.policies;
  const programs={direct:libraryProgram,supervised:{...libraryProgram,policies:{...libraryProgram.policies,'abg.root_mode':'supervised'}},absent:{...libraryProgram,policies:noPolicy}};
  const targets={next:{kind:'next'},declared:{kind:'declared_start',start:coord(libraryStart.startRef)},other:{kind:'declared_start',start:coord('start://td26-ps/other@5')},
    asset:{kind:'asset',handle:'td26-ps-none'},graph_function:{kind:'graph_function',handle:libraryStart.graphFunctionRef}};
  const UC='refused unsupported_control',started=kind=>`started ${kind} ${libraryStart.graphFunctionRef}`;
  // Rows by stated root mode, then by Program policy; targets in the order above.
  const direct={direct:[started('next'),UC,UC,'refused missing_target',started('graph_function')],
    supervised:[UC,UC,UC,UC,UC],absent:[UC,UC,UC,UC,UC]};
  const supervised={direct:[UC,UC,UC,UC,started('graph_function')],
    supervised:[UC,started('declared_start'),'refused missing_target',UC,UC],absent:[UC,UC,UC,UC,UC]};
  const expected={absent:direct,direct,supervised};
  for(const [modeLabel,rootMode] of MODES)for(const [policy,program] of Object.entries(programs)){
    const observed=Object.values(targets).map(target=>{
      const admitted=admitRuntimeContract(start.requestSchema,{...sampleRequest(target),...(rootMode===undefined?{}:{rootMode})});
      assert.equal(admitted.disposition,'admitted');const r=admitted.value;
      if(r.target.kind==='graph_function'){
        const refused=graphFunctionStartRefusal(program,{scope:r.scope,until:r.until});
        return refused===null?started('graph_function'):`refused ${refused.code}`;
      }
      const selection=r.target.kind==='next'?{scope:'program',target:'next',until:r.until,rootMode:r.rootMode}
        :r.target.kind==='asset'?{scope:'program',target:`asset:${r.target.handle}`,until:r.until,rootMode:r.rootMode}
        :{scope:'program',target:r.target.start.ref,startRef:r.target.start.ref,until:r.until,rootMode:r.rootMode};
      const resolved=resolveProgramStart(program,selection);
      return resolved.kind==='resolved_program_start'?`started ${resolved.targetKind} ${resolved.start.graphFunctionRef}`:`refused ${resolved.code}`;
    });
    assert.deepEqual(observed,expected[modeLabel][policy],`root mode ${modeLabel}, Program policy ${policy}`);
  }
});

// The Public rows run on one packed, verified and installed Product: the
// tenant, whose default library Program declares `direct`, and a fixture
// Product whose one Program composes the library Executive under a
// `supervised` policy with one declared start. That supervised Program is
// this lane's own fixture; no existing Program changes its policy.
const shared=installOncePerFile(async()=>{
  const selected={};
  const install=await installTenantOnce(packageRoot,{candidateBasisSource:'packed_artifact',rootPublicationKind:'worksite_construction',
    prepareAdditionalProducts:async setup=>{
      selected.environment=await libraryEnvironment({...setup,packageRoot:setup.bootstrapPackage});
      const owned=setup.gtl.constructDefaultGovernanceLibraryModulePublication({...basis,packageName:setup.abiPublication.productSemanticsBinding.packageName,packageVersion:setup.abiPublication.productSemanticsBinding.packageVersion});
      const schema=join(setup.scratch,'assessment.schema.json');await writeFile(schema,JSON.stringify(assessmentSchema)+'\n');
      return [await prepareRegisteredSelectionProduct({...setup,abiPackageArchivePath:setup.abiPackageArchivePath,
        declarationFactory:g=>supervisedCopy(libraryConsumerDeclaration(g,owned,selected.environment.declaration)),
        fixtureFiles:[{path:'build/index.mjs',source:new URL('../fixtures/default-library-product/index.mjs',import.meta.url)}],
        schemaAssets:[{path:schemaPath,source:schema,contractId:witnessRef('contract','assessment'),requirementAuthorityRefs:[COMPLETE]}]})];
    }});
  return {install,selectedEnvironment:selected.environment,dispose:()=>install.dispose()};
});
function supervisedCopy(declaration){
  const [program]=declaration.programs;
  return {...declaration,programs:[{...program,programRef:SUPERVISED,policies:{...program.policies,'abg.root_mode':'supervised'}}],
    contributions:declaration.contributions.map(c=>({...c,programMembershipRefs:[SUPERVISED],readinessPrerequisiteRefs:[SUPERVISED]}))};
}

// The scripted selector: every selection is a gap, so a started Run reaches
// the Executive's selector once and stops blocked. Any other role exits 1.
const ACTOR=`
import {readFileSync,appendFileSync} from 'node:fs';
const args=process.argv.slice(2),at=args.indexOf('--json-schema'),log=process.env.ABI5_TD26_ACTOR_LOG;readFileSync(0,'utf8');
const props=at<0?{}:(JSON.parse(args[at+1]).properties??{});
if(!('interpretation' in props)){appendFileSync(log,JSON.stringify({role:'other'})+'\\n');process.stderr.write('only the selector is scripted\\n');process.exit(1);}
const refs=(props.nextGraphFunctionRef.enum??[]).filter(g=>typeof g==='string'),items=props.contributions.items.properties.supportRefs.items,support=items&&Array.isArray(items.enum)?[...items.enum]:[];
const output={interpretation:'Scripted gap.',contributions:[{graphFunctionRef:refs.find(g=>g.includes('/construction@'))??refs[0],contribution:'Scripted contribution.',reason:'Scripted gap.',supportRefs:support,evidenceRefs:[],dependsOn:[]}],
 gaps:[{supportRefs:support.slice(0,1),reason:'Scripted gap.',evidenceRefs:[]}],nextGraphFunctionRef:null,nextReason:'Scripted gap.',nextEvidenceRefs:[],subjectEvidenceRef:null,
 revisionReason:'Scripted.',revisionEvidenceRefs:[],...('reviewRef' in props?{reviewRef:null}:{})};
appendFileSync(log,JSON.stringify({role:'select:gap'})+'\\n');
console.log(JSON.stringify({type:'system',subtype:'init'}));
console.log(JSON.stringify({type:'result',subtype:'success',is_error:false,result:JSON.stringify(output),structured_output:output}));
`;

// One installed case: the Program, its Catalog view, run environment and
// scripted actor, and every start-table row as one installed CLI process
// over the closed event resource, in order.
async function publicStartTable(t,{name,index,rows}){
  const {install,selectedEnvironment}=await shared();
  const own=index===0;
  const env=await openCaseEnvironment(t,install,{workspaceProductIndex:index,additionalCorePublicationConstructors:constructors,...(own?{graphFunctionRef:libraryStart.graphFunctionRef}:{})});
  const programRef=own?libraryProgram.programRef:SUPERVISED;
  const publication=env.catalog.boundPublications.find(p=>p.programs?.some(pr=>pr.programRef===programRef));
  const program=publication.programs.find(pr=>pr.programRef===programRef),[declaredStart]=program.starts;
  assert.equal(program.policies['abg.root_mode'],own?'direct':'supervised');assert.equal(program.policies['abg.default_start_ref'],declaredStart.startRef);
  const executive=declaredStart.graphFunctionRef;
  if(own){
    assert.deepEqual([programRef,declaredStart.startRef,executive],[libraryProgram.programRef,libraryStart.startRef,libraryStart.graphFunctionRef]);
    // HS3: the workspace product root is the library Program owner's install root.
    assert.equal(env.workspaceBinding.roots.productRoot,env.installCandidates[0].installedRoot);
  }
  env.catalogView=env.product.narrowGraphFunctionCatalog(env.catalog,[...program.callableMembership].sort());
  assert.equal(env.catalogView.kind,'graph_function_catalog_view');
  const declaration=publication.runEnvironments.find(d=>d.declarationRef===program.policies['abg.run_environment']);
  const ownResources=async({authority,program:resolved,workspaceBinding})=>{
    const dependencyRoot=await realpath(join(workspaceBinding.roots.productRoot,'contracts/default-library/stdo'));
    const supportRoot=join(workspaceBinding.roots.archiveRoot,'run-environment-support');await mkdir(supportRoot,{recursive:true});
    const coordinates={dependencies:declaration.dependencies.map(d=>({dependencyRef:d.dependencyRef,root:dependencyRoot,recordPath:join(dependencyRoot,'context.inventory.json')})),pythonPath:null,temporaryRoot:await realpath(supportRoot)};
    return env.product.constructRunEnvironmentResources({kind:'run_environment_resources',schemaVersion:'5.0.0',...coordinates,
      permission:{authorityRef:authority.authorityRef,authorityDigest:authority.authorityDigest,actorRef:authority.actorRef,programRef:resolved.programRef,
        environmentRef:declaration.declarationRef,environmentDigest:env.product.sha256Canonical(declaration),operations:['read_context'],...coordinates}});
  };
  const runEnvironmentResources=own?ownResources:populated=>selectedEnvironment.resources({...populated,product:env.product});
  const proof=join(env.scratch,'td26-ps-'+name);await mkdir(proof);
  const actor=join(proof,'gap-actor.mjs'),actorLog=join(proof,'gap-actor.jsonl');
  await writeFile(actor,'#!'+process.execPath+'\n'+ACTOR);await chmod(actor,0o755);
  const worksite=env.workspaceBinding.canonicalRoot??env.workspaceAuthority?.canonicalRoot??join(env.scratch,'workspace');
  await cp(join(witnessRoot,'seed'),worksite,{recursive:true});
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8'));
  const input=await witnessInput({product:env.product,selection,seedRoot:worksite});
  const load=async path=>import(pathToFileURL(join(env.installedRoot,`build/code/src/${path}.js`)).href);
  const publicApi=await load('public/index'),storeOwner=await load('abg/event_store');
  const installedContracts=await load('product/run_operation_contracts'),installedAdmission=await load('shared/public_function_contracts');
  const startSchema=installedContracts.RUN_OPERATION_CONTRACTS.invoke.start.requestSchema;
  const admit=request=>{const admitted=installedAdmission.admitRuntimeContract(startSchema,request);assert.equal(admitted.disposition,'admitted',JSON.stringify(admitted));return admitted.value;};
  // The installed contract's own default: the admitted mode of a request that omits it.
  const installedDefault=admit(sampleRequest({kind:'next'})).rootMode;
  const sdkTarget={next:{kind:'next'},declared:{kind:'declared_start',startRef:declaredStart.startRef},asset:{kind:'asset',handle:'td26-ps-none'},graph_function:{kind:'graph_function',handle:executive}};
  const publicTarget={...sdkTarget,declared:{kind:'declared_start',start:{ref:declaredStart.startRef,digest:env.product.sha256Canonical(declaredStart)}}};
  const lawful=own?{target:'next',rootMode:'direct'}:{target:'declared',rootMode:'supervised'};
  const envelope=id=>({definitionContractCoordinates:env.verified.definitionContractCoordinates,requestRef:`public-request://td26-ps/${name}/${id}`,
    correlationRef:`correlation://td26-ps/${name}/${id}`,eventTime:'2026-11-12T00:00:00.000Z',provenanceRefs:[`provenance://td26-ps/${name}`]});
  const construct=(target,rootMode,eventResource,id)=>publicApi.constructInstalledStartCall({
    selection:{memberKey:'start',target:sdkTarget[target],rootMode,fhMode:'direct'},programRef,catalog:env.catalog,catalogView:env.catalogView,applications:[],
    admittedInstalls:env.admittedInstalls,workspaceBinding:env.workspaceBinding,verifyInstallAdmission:i=>env.abg.hasAdmittedProductInstall(env.artifactTruth,i),
    actorRef:env.workspaceBinding.authorizedActorRef,input:{value:input},inputValueRef:`value://td26-ps/${name}/${id}/input`,source:{kind:'none'},
    runEnvironmentResources,eventResource,envelope:envelope(id)});
  // A row's call. The SDK populates every lawful selection. A selection the
  // start law refuses has no population, so its call carries the Program's
  // lawful population with the row's target and mode, and a structural
  // graph_function slot when the target names one: Product resolves the start
  // before it compares any slot. A row that omits its root mode sends no
  // `rootMode` and no `fhMode`; its digests name the request as the installed
  // contract admits it, with both defaults applied.
  async function rowCall(id,target,stated,eventResource){
    const rootMode=stated??installedDefault;
    let call=null;
    const constructed=await construct(target,rootMode,eventResource,id);
    if(constructed.kind==='installed_start_call')call=constructed.call;
    else{
      const template=await construct(lawful.target,lawful.rootMode,eventResource,id);
      assert.equal(template.kind,'installed_start_call',JSON.stringify(template.ownerOutput??template).slice(0,2000));
      const request=admit({...template.population.request,target:publicTarget[target],rootMode});
      const slots={...template.population.slots,graph_function:target==='graph_function'?{graphFunction:coord(executive),membership:coord(programRef)}:template.population.slots.graph_function};
      const e=envelope(id);
      call=publicApi.constructInstalledPublicDefinitionCall({product:env.product,installedPublic:publicApi,definitionContractCoordinates:e.definitionContractCoordinates,
        contractCatalog:template.call.invocation.contractCatalog,operationId:'abg.operation.run.invoke',memberKey:'start',request,slots,resources:template.call.resources,
        requestRef:e.requestRef,correlationRef:e.correlationRef,eventTime:e.eventTime,provenanceRefs:e.provenanceRefs});
    }
    if(stated!==undefined)return call;
    const {fhMode:_fh,rootMode:_root,...wire}=call.invocation.request;
    assert.equal(call.invocation.requestDigest,env.product.sha256Canonical(admit(wire)),'the default-only call names its admitted request');
    return {...call,invocation:{...call.invocation,request:wire}};
  }
  const environment={...process.env,ABG_TS_CLAUDE_COMMAND:actor,ABI5_TD26_ACTOR_LOG:actorLog};
  const actorRoles=async()=>(await readFile(actorLog,'utf8').catch(error=>error.code==='ENOENT'?'':Promise.reject(error))).trim().split('\n').filter(Boolean).map(l=>JSON.parse(l).role);
  let handoff=env.store.projectReopenAuthorityAndClose();
  const observed=[],expected=[];
  for(const [modeLabel,stated] of MODES)for(const target of ['next','declared','asset','graph_function']){
    const id=`${modeLabel}-${target}`,eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:env.product.sha256Canonical(handoff)};
    const call=await rowCall(id,target,stated,eventResource);
    const before=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).length,rolesBefore=(await actorRoles()).length;
    const {output}=await runInstalledCliRequest({scratch:proof,installedRoot:env.installedRoot,identity:`${name}-${id}`,acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:null,environment});
    const receipt=output.receipt;assert.ok(receipt,JSON.stringify(output).slice(0,4000));
    if(receipt.resources?.eventResource?.closeHandoff)handoff=receipt.resources.eventResource.closeHandoff;
    const events=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).slice(before),roles=(await actorRoles()).slice(rolesBefore),owner=receipt.ownerOutput;
    let row;
    if(owner?.outcomeKind==='refusal')row=`refused ${owner.value?.code} at ${JSON.stringify(owner.value?.issuePaths)}, ${events.length} events, ${roles.length} actor calls`;
    else{
      const s=events.find(e=>e.kind==='invocation_admitted')?.payload?.publicStart;
      const gap=events.filter(e=>e.kind==='c_call_result_admitted'&&e.payload.value?.kind==='registered_graph_choice'&&e.payload.value.disposition==='gap').length;
      row=`started ${s?.programRef===programRef?'this Program':s?.programRef}, target ${s?.target}, start ${s?.startRef===declaredStart.startRef?'declared':'graph_function row'}, `+
        `${s?.graphFunctionRef===executive?'the Executive':s?.graphFunctionRef}, rootMode ${s?.rootMode}; ${owner?.value?.disposition} at ${gap} selection gap, actor ${roles.join(',')}`;
    }
    observed.push(`${modeLabel} ${target}: ${row}`);
    expected.push(`${modeLabel} ${target}: ${rows[modeLabel][target]({executive,declaredStart})}`);
  }
  t.diagnostic(JSON.stringify({installedDefault,observed},null,1));
  assert.deepEqual(observed,expected);
}

const REFUSED=()=>'refused invalid_target at ["/program"], 0 events, 0 actor calls';
const STARTED=(target,rootMode)=>({executive})=>`started this Program, target ${target==='graph_function'?'graph_function:'+executive:target==='declared'?'<declared>':target}, `+
  `start ${target==='graph_function'?'graph_function row':'declared'}, the Executive, rootMode ${rootMode}; blocked at 1 selection gap, actor select:gap`;
const declaredStarted=rootMode=>({declaredStart})=>STARTED('declared',rootMode)({}).replace('<declared>',declaredStart.startRef);

test('Public start table over the default library Program: a default-only next start reaches the Executive',{timeout:900_000},async t=>{
  await publicStartTable(t,{name:'library',index:0,rows:{
    absent:{next:STARTED('next','direct'),declared:REFUSED,asset:REFUSED,graph_function:STARTED('graph_function','direct')},
    direct:{next:STARTED('next','direct'),declared:REFUSED,asset:REFUSED,graph_function:STARTED('graph_function','direct')},
    supervised:{next:REFUSED,declared:REFUSED,asset:REFUSED,graph_function:STARTED('graph_function','supervised')}}});
});

test('Public start table over a supervised Program: only a start that states supervised selects its declared start',{timeout:900_000},async t=>{
  await publicStartTable(t,{name:'supervised',index:1,rows:{
    absent:{next:REFUSED,declared:REFUSED,asset:REFUSED,graph_function:REFUSED},
    direct:{next:REFUSED,declared:REFUSED,asset:REFUSED,graph_function:REFUSED},
    supervised:{next:REFUSED,declared:declaredStarted('supervised'),asset:REFUSED,graph_function:REFUSED}}});
});
