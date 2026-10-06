// Pure installed owner construction only. Reuses CLOSED unchanged render and
// static conformance; never imports effectful driver/caller or invokes a CLI.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {join} from 'node:path';
import {loadRuntime,constructStart,declaredCli} from './public-support.mjs';
import {checkAssessmentStart} from './native-checks.mjs';
const D=import.meta.dirname,P=join(D,'../final-f11-native-assessment-01');
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const write=(n,v)=>fs.writeFile(join(D,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const core=await read(join(D,'selected-core.json')),r=await loadRuntime(core.installedRoot);
const {product,validator,gtl,abg}=r,began=performance.now();
const pin=await read(join(D,'bound-input-pin.json')),input=await read(pin.assessmentInput.path);
const former=await read(join(P,'offline-native-owner-joins.json'));
const environment=await read(join(D,'closed-current-environment.json'));
const catalog=await read(join(D,'retained-catalog.json')),catalogView=await read(join(D,'assessment-view.json'));
assert.deepEqual(catalogView,product.narrowGraphFunctionCatalog(catalog,[gtl.QUALIFICATION_IDS.assessGraph]));
const retained=await read(join(D,'retained-bootstrap-core.json')),verified=retained.verifiedArtifact;
assert.ok(verified);assert.equal(input.plan.ownerActorRef,environment.workspaceBinding.authorizedActorRef);
const handoff=await read(join(D,'initial-handoff.json'));
const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)};
const base='abiogenesis/t287/final-f11-current-resource-caller-02';
const selection={programRef:'program://abiogenesis/qualification/assess@5',selection:{kind:'start',scope:'program',target:'graph_function',graphFunctionHandle:gtl.QUALIFICATION_IDS.assessGraph,until:'converged',rootMode:'direct'},fhMode:'direct',sourceBasis:{kind:'none'},
 inputRef:'input://'+base+'/assess-rule',requestRef:'request://'+base+'/assess-rule',correlationRef:'correlation://'+base,provenanceRefs:[]};
const prepared=await constructStart({environment:{...environment,...r,catalog,catalogView,admittedInstalls:environment.productInstalls,verified},publicApi:r.public,eventResource,inputFactory:async()=>input,selection});
const c={...r,state:{environment,catalog,catalogView,closeHandoff:handoff},verified,hash:product.sha256Canonical,reopen:()=>eventResource};
const check=await checkAssessmentStart(c,prepared,input);
assert.deepEqual(check.actualPolicy,former.policy);
assert.deepEqual(check.actualGrants,former.grants);
assert.deepEqual(check.actualAuthority,former.authority);
const inputDigest=product.sha256Canonical(input);
assert.equal(inputDigest,former.inputDigest);
assert.equal(input.task.taskDigest,'sha256:acf5b524e60a6b391109215c4a403bfa13b4b175f9547204fbd86aad0248dd85');
assert.equal(input.plan.planDigest,'sha256:c97523f6a25977187211cf35060642c2a57b4949a2e3705345c0ef0eb4444e98');
assert.equal(validator.isQualificationAssessmentInput(input),true);
const {value,...inputCoordinate}=prepared.call.invocation.request.input;
await write('offline-current-start-joins.json',{kind:check.actualOwnerKind,policy:check.actualPolicy,grants:check.actualGrants,authority:check.actualAuthority,
 definitionKey:prepared.call.invocation.definitionKey,requestContract:prepared.call.invocation.requestContract,
 request:{...prepared.call.invocation.request,input:inputCoordinate},authoritySlots:{...prepared.call.invocation.invocationAuthority.slots,input_contract:inputCoordinate},
 currentEventResource:prepared.call.resources.eventResource,invocationRef:prepared.call.invocation.invocationRef,
 inputDigest,task:{ref:input.task.taskRef,digest:input.task.taskDigest},plan:{ref:input.plan.planRef,digest:input.plan.planDigest},
 programDigest:product.sha256Canonical(check.exactProgram),rootActorRef:input.plan.ownerActorRef,
 inputPayload:'Unchanged frozen input; referenced without copying/restaging or rewriting full render',
 runEnvironment:check.runEnvironmentAbsent?'absent':null,
 verification:'Retained genuine verification coordinate; live same-process nominal verification remains a later effect.'});
const effect=await read(join(D,'effect-plan.json'));
const packets=[product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,product.RUN_OPERATION_CONTRACTS.invoke.start,abg.ABG_PROJECT_READ_CONTRACTS.run_result,abg.ABG_PROJECT_READ_CONTRACTS.run_replay];
for(let i=0;i<packets.length;i++){
 assert.equal(effect.calls[i].operation,packets[i].definitionKey.operationId);
 assert.equal(effect.calls[i].member,packets[i].definitionKey.memberKey);
}
await write('owner-readiness.json',{status:'PASSED',actualOwners:['constructStart ordinary installed owner chain','ProductRunInvocationPort.prepare'],actualOwnerKind:check.actualOwnerKind,
 strictInputKeys:Object.keys(input).sort(),unchangedPolicyGrantsAuthority:true,inputDigest,
 taskDigest:input.task.taskDigest,planDigest:input.plan.planDigest,rawContract:gtl.QUALIFICATION_IDS.assessmentRaw,
 reusedRender:{record:pin.workerRequest,prompt:pin.prompt,promptUtf8Bytes:1021244,renderRepeated:false},
 reusedProgramConformance:'Prior exact installed Program conformance and unchanged publication; later declared five-call plan rechecks it ordinarily',
 cli:await declaredCli(core.installedRoot),elapsedMs:performance.now()-began,nativeCalls:0,modelCalls:0,
 residuals:['usable actual native provider access','live same-process nominal verification','actual raw assessment/J','semantic sufficiency/applicability','historical author/grant and assessor independence','full F11/AF22/RC1'],
 claim:'Current136 successor owner preparation ready; mechanical correspondence does not establish semantic context sufficiency or actual transport acceptance.'});
console.log(JSON.stringify({status:'PASSED_CURRENT136_ACTUAL_OWNER_PREPARATION',nativeCalls:0,fullRenderRepeated:false}));
