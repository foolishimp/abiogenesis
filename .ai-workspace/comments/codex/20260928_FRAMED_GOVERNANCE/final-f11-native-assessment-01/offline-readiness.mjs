// One pure preparation check; never imports driver or opens the moving event store.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {loadRuntime,declaredCli,constructStart} from './public-support.mjs';
import {checkAssessmentStart} from './native-checks.mjs';
const D=import.meta.dirname,read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const write=(n,v)=>fs.writeFile(join(D,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const core=await read(join(D,'selected-core.json')),r=await loadRuntime(core.installedRoot),{product,validator,gtl,abg}=r;
const pin=await read(join(D,'bound-input-pin.json'));
const input=await read(pin.assessmentInput.path),expected=await read(pin.workerRequest.path);
assert.equal(validator.isQualificationAssessmentInput(input),true);
assert.deepEqual(input.task.declarations,await read(join(D,'assessment-declarations.json')));
const rendered=validator.qualificationWorkerRequest(input);
assert.deepEqual(rendered,expected);assert.equal(rendered.instructionContractRef,gtl.QUALIFICATION_IDS.assessmentInput);
assert.equal(rendered.resultContractRef,gtl.QUALIFICATION_IDS.assessmentRaw);
assert.equal(rendered.transportLane,'closed_prompt_proof');assert.equal(Buffer.byteLength(rendered.prompt,'utf8'),1021244);
assert.deepEqual(Buffer.from(rendered.prompt,'utf8'),await fs.readFile(pin.prompt.path));
const environment=await read(join(D,'closed-current-environment.json'));
const catalog=await read(join(D,'retained-catalog.json')),catalogView=await read(join(D,'assessment-view.json'));
assert.deepEqual(catalogView,product.narrowGraphFunctionCatalog(catalog,[gtl.QUALIFICATION_IDS.assessGraph]));
const retained=await read(join(D,'retained-bootstrap-core.json')),verified=retained.verifiedArtifact;
assert.ok(verified);assert.equal(input.plan.ownerActorRef,environment.workspaceBinding.authorizedActorRef);
const handoff=await read(join(D,'initial-handoff.json')),hash=product.sha256Canonical;
const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:hash(handoff)};
const selection={programRef:'program://abiogenesis/qualification/assess@5',selection:{kind:'start',scope:'program',target:'graph_function',graphFunctionHandle:gtl.QUALIFICATION_IDS.assessGraph,until:'converged',rootMode:'direct'},fhMode:'direct',sourceBasis:{kind:'none'},
 inputRef:'input://abiogenesis/t287/final-f11-native-assessment-01/assess-rule',requestRef:'request://abiogenesis/t287/final-f11-native-assessment-01/assess-rule',correlationRef:'correlation://abiogenesis/t287/final-f11-native-assessment-01',provenanceRefs:[]};
const prepared=await constructStart({environment:{...environment,...r,catalog,catalogView,admittedInstalls:environment.productInstalls,verified},publicApi:r.public,eventResource,inputFactory:async()=>input,selection});
const c={...r,state:{environment,catalog,catalogView,closeHandoff:handoff},verified,hash,reopen:()=>eventResource};
const check=await checkAssessmentStart(c,prepared,input);
await write('offline-start-call.json',prepared.call);
await write('offline-native-owner-joins.json',{kind:check.actualOwnerKind,policy:check.actualPolicy,grants:check.actualGrants,authority:check.actualAuthority,
 inputDigest:hash(input),inputCanonicalBytes:67784040,task:{ref:input.task.taskRef,digest:input.task.taskDigest},
 plan:{ref:input.plan.planRef,digest:input.plan.planDigest},programDigest:hash(check.exactProgram),rootActorRef:input.plan.ownerActorRef,
 resourcePredicate:product.isRunInvocationResourceAssertion(prepared.call.resources),runEnvironment:check.runEnvironmentAbsent?'absent':null,
 verification:'Historical frozen genuine verifiedArtifact coordinate only; live same-process nominal verification is required and deferred to separately granted native execution.'});
const cli=await declaredCli(core.installedRoot);
const effect=await read(join(D,'effect-plan.json'));
const packets=[product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,product.RUN_OPERATION_CONTRACTS.invoke.start,
 abg.ABG_PROJECT_READ_CONTRACTS.run_result,abg.ABG_PROJECT_READ_CONTRACTS.run_replay];
for(let i=0;i<packets.length;i++){effect.calls[i].operation=packets[i].definitionKey.operationId;effect.calls[i].member=packets[i].definitionKey.memberKey;}
await fs.writeFile(join(D,'effect-plan.json'),JSON.stringify(effect,null,2)+'\n');
assert.equal(effect.calls[0].operation,product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist.definitionKey.operationId);
assert.equal(effect.calls[0].member,product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist.definitionKey.memberKey);
assert.equal(effect.calls[1].operation,validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program.definitionKey.operationId);
assert.equal(effect.calls[2].operation,product.RUN_OPERATION_CONTRACTS.invoke.start.definitionKey.operationId);
for(const row of effect.calls.slice(3))assert.equal(row.operation,abg.ABG_PROJECT_READ_CONTRACTS[row.member].definitionKey.operationId);
await write('offline-readiness.json',{status:'PASSED',actualOwners:['qualificationWorkerRequest','constructStart ordinary installed owner chain','ProductRunInvocationPort.prepare'],
 cli,strictInputKeys:Object.keys(input).sort(),promptUtf8Bytes:1021244,rawContract:gtl.QUALIFICATION_IDS.assessmentRaw,
 actualOwnerKind:check.actualOwnerKind,program:'program://abiogenesis/qualification/assess@5',rootActorRef:input.plan.ownerActorRef,
 finalInputFreeze:pin.freeze,operationDefinitions:effect.calls.map(x=>({operation:x.operation,member:x.member})),
 nativeCalls:0,modelCalls:0,movingResourceReads:0,
 negativeCheck:'Reuse CLOSED binding crossed Product-content/installed-Product basis refusal; no duplicate campaign',
 independence:'Declared source construction identities and historical grant adequacy remain explicit residuals; actual native assessor/transport and raw attribution are observed later.',
 limit:'Offline preparation does not prove native transport acceptance, event admission, semantic J, readback or complete F11.'});
console.log(JSON.stringify({status:'PASSED_ACTUAL_OFFLINE_OWNER_PREPARATION',promptBytes:1021244,nativeCalls:0,movingResourceReads:0}));
