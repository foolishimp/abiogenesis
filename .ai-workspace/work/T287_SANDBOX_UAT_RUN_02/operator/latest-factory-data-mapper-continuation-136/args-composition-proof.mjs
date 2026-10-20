import assert from 'node:assert/strict';
import {readFile,open} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {exclusiveRecord,workerEnvironment} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
import {readOperatorControl,effectiveWorkerConfiguration,qualityClock} from './operator-control.mjs';
const root=fileURLToPath(new URL('.',import.meta.url)),selected=JSON.parse(await readFile(join(root,'inputs.json'),'utf8'));
const old=JSON.parse(await readFile(join(selected.archive,'run.json'),'utf8'));
const setup=JSON.parse(await readFile(join(selected.archive,'setup-identity.json'),'utf8'));
const control=await readOperatorControl(),effective=effectiveWorkerConfiguration(old.configuration,control.value);
const restored={...effective,provider:{...effective.provider,appendArgs:old.configuration.provider.appendArgs}};
assert.deepEqual(restored,old.configuration,'Only provider.appendArgs changes in the derived worker configuration');
const environment=workerEnvironment(effective),baseEnvironment=workerEnvironment(old.configuration);
const argv=JSON.parse(environment.ABG_TS_CLAUDE_APPEND_ARGS),baseArgv=JSON.parse(baseEnvironment.ABG_TS_CLAUDE_APPEND_ARGS);
assert.deepEqual(argv,[...baseArgv,'--append-system-prompt',control.value.declaration]);
assert.equal(argv.filter(x=>x==='--append-system-prompt').length,1);
// Full live worker environment is used only for argument derivation and safe auth.
// Static plan receives ONLY non-secret argument policy, never token/base values.
const staticEnvironment={ABG_TS_CLAUDE_APPEND_ARGS:environment.ABG_TS_CLAUDE_APPEND_ARGS};
const baseStaticEnvironment={ABG_TS_CLAUDE_APPEND_ARGS:baseEnvironment.ABG_TS_CLAUDE_APPEND_ARGS};
const store=join(selected.archive,'resources/events/runtime.events.jsonl'),f=await open(store,'r');
let bytes;try{bytes=Buffer.alloc(1525455);assert.equal((await f.read(bytes,0,bytes.length,1404602415)).bytesRead,bytes.length);}finally{await f.close();}
assert.equal(createHash('sha256').update(bytes).digest('hex'),'9ffa301518dfa88608c7a95b3249e9b2448af1e68a86769a5d20e5adbbe9efa9');
const binding=JSON.parse(bytes.toString('utf8')).payload,assembly=binding.instructionAssembly;
const installedRoot=setup.installations[0].installedRoot;
const at=rel=>import(pathToFileURL(join(installedRoot,'build/code/src',rel+'.js')).href);
const transport=await at('abg/worker_transport'),contracts=await at('abg/transport_contracts'),{sha256Canonical}=await at('shared/digests');
const contract=contracts.constructKnownWorkerTransportContract('claude',{command:old.configuration.provider.command,environment:staticEnvironment});
assert.equal(sha256Canonical(contract),binding.transportContractDigest);
const prompt=await readFile(binding.paths.prompt,'utf8');assert.equal(prompt,assembly.request.prompt);
assert.equal(createHash('sha256').update(prompt).digest('hex'),'b75699fd92274cee14608eca90e1a427dfee8df78068f97044ec725247c7c03b');
const schemaArgument=binding.args[binding.args.indexOf('--json-schema')+1];
const responseJsonSchema=JSON.parse(schemaArgument);
assert.deepEqual(responseJsonSchema,assembly.request.responseJsonSchema);
assert.equal(JSON.stringify(responseJsonSchema),schemaArgument,'Authenticated original carrier preserves its actual opaque argument serialization');
for(const key of ['type','properties','required','additionalProperties'])assert.deepEqual(responseJsonSchema[key],assembly.envelope.sections.response[key]);
const request={contract,prompt,lane:binding.lane,cwd:root,archiveRoot:join(root,'static-transport'),label:'current-control-composition',timeoutMs:binding.timeoutMs,absoluteTimeoutMs:binding.absoluteTimeoutMs,terminationGraceMs:binding.terminationGraceMs,responseJsonSchema};
assert.equal(request.lane,'closed_prompt_proof');
const basePlan=await transport.prepareWorkerTransport({...request,environment:baseStaticEnvironment});
assert.deepEqual(basePlan.args,binding.args,'Current captured native protocol/declared arguments must match exact installed owner composition');
const plan=await transport.prepareWorkerTransport({...request,environment:staticEnvironment});
const appendIndex=plan.args.indexOf('--append-system-prompt');assert.ok(appendIndex>=0);
assert.equal(plan.args[appendIndex+1],control.value.declaration);
assert.deepEqual([...plan.args.slice(0,appendIndex),...plan.args.slice(appendIndex+2)],basePlan.args);
assert.equal(plan.args.filter(x=>x==='--append-system-prompt').length,1);
assert.equal(plan.args[plan.args.indexOf('--tools')+1],'');assert.ok(plan.args.includes('--safe-mode'));
assert.equal(plan.args[plan.args.indexOf('--json-schema')+1],JSON.stringify(responseJsonSchema));
assert.equal(plan.promptDigest,binding.promptDigest);assert.equal(plan.responseJsonSchemaDigest,binding.responseJsonSchemaDigest);
const {kind,schemaVersion,planDigest,...body}=plan;assert.equal(sha256Canonical(body),planDigest);
const testClock=qualityClock(control.value,{started:'2026-10-09T00:00:00.000Z'});
assert.equal(testClock.qualityCheckpointUTC,'2026-10-09T05:00:00.000Z');
const facts={status:'PASS',classification:'Installed-owner argument/plan composition only; no model/actor/Run/native admission',operatorControl:control.pin,
 capturedBinding:{path:store,offset:1404602415,byteCount:1525455,sha256:'9ffa301518dfa88608c7a95b3249e9b2448af1e68a86769a5d20e5adbbe9efa9',ref:binding.transportBindingRef},
 prompt:{path:binding.paths.prompt,sha256:'b75699fd92274cee14608eca90e1a427dfee8df78068f97044ec725247c7c03b',byteCount:Buffer.byteLength(prompt),unchangedHistoricalDeadline:true},
 contractDigest:plan.contractDigest,argumentDigest:sha256Canonical(plan.args),planDigest:plan.planDigest,canonicalResponseDigest:sha256Canonical(assembly.envelope.sections.response),carrierResponseDigest:plan.responseJsonSchemaDigest,
 exactlyOneAppendSystemPrompt:true,appendDeclarationExact:true,baseArgumentsEqualCapturedNativeBinding:true,strictSchemaProtocolToolsAndLimitsUnchanged:true,schemaWitness:'Actual authenticated binding argument reproduces byte-for-byte; deep equality to canonical assembly request and full schema root fields retained',effectiveConfigurationDifference:'provider.appendArgs only',
 environmentNames:Object.keys(environment).sort(),staticPlanEnvironmentNames:Object.keys(staticEnvironment),credentialValues:'Not serialized, printed or hashed; static plan environment includes only non-secret argument policy',
 clockTest:{classification:'Synthetic timestamp for pure shared-control calculation only; not actual native start/checkpoint',...testClock},nativeDispatch:false};
await exclusiveRecord(root,'static-transport-plan.json',plan);
await exclusiveRecord(root,'args-composition-proof.json',facts);
console.log(JSON.stringify({status:facts.status,operatorControl:control.pin,argumentDigest:facts.argumentDigest,planDigest:plan.planDigest,baseArgumentsEqualCapturedNativeBinding:true,exactlyOneAppendSystemPrompt:true,nativeDispatch:false}));
