// Operator-only post-return observer. No Public calls, provider calls or service creation.
import assert from 'node:assert/strict';
import { readFile, writeFile, lstat, realpath } from 'node:fs/promises';
import { readFileSync, lstatSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir=fileURLToPath(new URL('.',import.meta.url)), parent=resolve(dir,'..'), root=join(parent,'runtime-b11-004');
// PENDING: Root must bind actual accepted B11 artifact, selected input and 004 launch manifest after native outcome.
// Every value is mandatory; this module refuses before reading or importing the future runtime while any is null.
const REQUIRED=Object.freeze({manifestName:'B11_004_LAUNCH_MANIFEST.json',manifestSha256:'sha256:8f1b4b005658917e0920872ef25dddbf8f4d129bf7ff212563c62168833b31a4',selectionName:'selected-c2-b11-004.json',selectionSha256:'sha256:6f66ebb195146f727db22a983cae775b7b6bf3004207f5b51a354efff545ff83',
 artifactSha256:'sha256:0f77694c1930b069477afd39f0f33bcd53d1e60522b45c32da75b93b1628ac2c',productContentDigest:'sha256:34cfb9f8b401178dd170bac58c8b74f2f57689b2501b5d1d28687622f21de951',productManifestDigest:'sha256:14d5b7d1379ba17f6f425bbf3766c1b4ff524cfc4b25dbeedc30e64b5d03c700',selectionStatus:'ROOT_SELECTED_B11_C2_FOR_WITNESS'});
const must=(v,m)=>assert.ok(v,m), one=(a,m)=>{assert.equal(a.length,1,m);return a[0];};
const bytes=async p=>readFile(p), json=async p=>JSON.parse((await bytes(p)).toString('utf8'));
const sha=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const digestFile=async p=>sha(await bytes(p));
const hashFields=(p,b)=>({path:p,bytes:b.length,sha256:sha(b)});
const fail=m=>{throw new Error(m)};
assert.equal(process.argv.length,3,'usage: node observe.mjs --observe-after-return');
assert.equal(process.argv[2],'--observe-after-return');
for(const [key,value] of Object.entries(REQUIRED))
 assert.ok(typeof value==='string'&&value.length>0,'PENDING actual Root-selected B11 binding: '+key);
assert.equal(REQUIRED.manifestName,'B11_004_LAUNCH_MANIFEST.json','only the new 004 launch manifest');
assert.equal(REQUIRED.selectionName,'selected-c2-b11-004.json','only the selected B11 producer input');
assert.equal(REQUIRED.selectionStatus,'ROOT_SELECTED_B11_C2_FOR_WITNESS','only Root-selected B11 standing');
for(const value of [REQUIRED.manifestSha256,REQUIRED.selectionSha256,REQUIRED.artifactSha256,REQUIRED.productContentDigest,REQUIRED.productManifestDigest])
 assert.match(value,/^sha256:[0-9a-f]{64}$/u,'exact SHA-256 binding');
// Refuse before imports or any output if the actual one-shot Return and closed handoff are absent.
for(const n of ['NATIVE_LAUNCH_STARTED.json','native-execution.json','native-final-close.json'])
 try {await lstat(join(root,n))} catch {fail('PENDING: missing actual '+n)}
const start=await json(join(root,'NATIVE_LAUNCH_STARTED.json'));
const execution=await json(join(root,'native-execution.json'));
const close=await json(join(root,'native-final-close.json'));
const output=execution?.receipt?.ownerOutput;
must(execution?.receipt?.exitCode===0 && output?.outcomeKind==='result' && output.value?.run?.ref,'actual native result/run required');
must(close?.prefix && close?.reopenAuthority,'actual returned closeHandoff required');
const runId=output.value.run.ref;
const manifestBytes=await bytes(join(parent,REQUIRED.manifestName));
assert.equal(sha(manifestBytes),REQUIRED.manifestSha256,'selected launch manifest');
const manifest=JSON.parse(manifestBytes);
const selectionPath=join(parent,REQUIRED.selectionName), selectionBytes=await bytes(selectionPath);
assert.equal(sha(selectionBytes),REQUIRED.selectionSha256,'selected B11 producer selection');
assert.ok(manifest.files.some(x=>x.path===selectionPath && 'sha256:'+x.sha256===REQUIRED.selectionSha256),'selection is in the exact frozen launch manifest');
const selection=JSON.parse(selectionBytes);
assert.equal(selection.status,REQUIRED.selectionStatus,'actual Root selection standing');
assert.equal(selection.artifact.sha256,REQUIRED.artifactSha256,'selected actual B11 artifact');
assert.equal(selection.artifact.productContentDigest,REQUIRED.productContentDigest,'selected Product content');
assert.equal(selection.artifact.manifestDigest,REQUIRED.productManifestDigest,'selected Product manifest');
assert.equal(selection.finalNativeOutcome.outcomeKind,'result');
assert.equal(selection.finalNativeOutcome.disposition,'completed');
assert.equal(selection.finalNativeOutcome.uatDisposition,'satisfied');
const saved=await json(join(root,'operator-resume-material.json'));
const profileBytes=await bytes(join(parent,'provider-profile-b09.json'));
assert.equal(sha(profileBytes),'sha256:d7ae7f9db390f9f637d288c695471fddc3061547cea966f33880b267a38bdd1a','selected provider profile changed');
const profile=JSON.parse(profileBytes); assert.equal(start.profileDigest,sha(profileBytes));
const installedRoot=await realpath(saved.installedRoot);
assert.equal(installedRoot,await realpath(join(root,'sandbox/installed/abg/node_modules/@abiogenesis/typescript-tenant')),'installed identity');
const installed=one(manifest.installedPayloads.filter(x=>x.root===installedRoot),'one exact installed B11 payload');
assert.equal(installed.productContentDigest,REQUIRED.productContentDigest,'installed B11 content');
assert.equal(installed.manifestDigest,REQUIRED.productManifestDigest,'installed B11 manifest');
assert.equal(await realpath(process.execPath),profile.executablePins.node.realPath,'observer must use selected Node');
assert.equal(await digestFile(process.execPath),'sha256:'+profile.executablePins.node.sha256,'selected Node changed');
// Verify frozen installed file bytes before importing them; verify task/rubric/fixture against launch pins.
const operatorPaths=new Set(manifest.operatorExecutableClosure.map(x=>x.path));
const runnerPath=resolve(parent,'../operator-client/runner.mjs');
must(operatorPaths.has(runnerPath),'runner absent from frozen operator closure');
const selectedPins=manifest.files.filter(v=>v.path.startsWith(installedRoot+sep)||operatorPaths.has(v.path)||['task.md','rubric.json','fixture.txt'].some(n=>v.path===join(root,'worksite',n)));
must(selectedPins.length>3 && [...operatorPaths].every(path=>selectedPins.some(x=>x.path===path)),'missing frozen installation/operator inventory');
for(const pin of selectedPins){const st=await lstat(pin.path);must(st.isFile()&&!st.isSymbolicLink()&&st.size===pin.bytes,'selected member changed');assert.equal(await digestFile(pin.path),'sha256:'+pin.sha256,'selected member digest changed')}

const load=async p=>import(pathToFileURL(join(installedRoot,'build/code/src',p+'.js')).href);
const [store,prefixOwner,basisOwner,library,envOwner,owner,product]=await Promise.all([
 load('abg/event_store'),load('abg/event_prefix'),load('abg/execution_basis'),load('abg/default_library'),load('abg/stdo_environment'),
 load('abg/governed_context'),load('product/index')]);
const prefix=prefixOwner.readOwnedRuntimeEventPrefixAtDurablePrefix(close.prefix);
const events=store.readRuntimeEventsAtDurablePrefix(close.prefix).filter(e=>e.runId===runId);
const at=k=>events.filter(e=>e.kind===k);
const construction=one(at('c_call_result_admitted').filter(e=>e.payload?.value?.kind==='native_workspace_work_observation' &&
 e.payload.resultClass==='success' && e.aggregateId===e.payload.value.provenance?.cCallRef &&
 e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef && e.payload.value.task?.assessment===undefined),'unique admitted Construction leaf Result');
const task=construction.payload.value.task, provenance=construction.payload.value.provenance;
must(product.isNativeWorkspaceWorkTask(task),'admitted native task');
const binding=one(at('actor_transport_binding_admitted').filter(e=>e.aggregateId===provenance.transportBindingRef),'transport binding');
assert.equal(binding.payload.transportBindingDigest,provenance.transportBindingDigest);
const started=one(at('actor_invocation_started').filter(e=>e.payload.actorInvocationRef===provenance.actorInvocationRef),'actor start');
const opened=one(at('c_call_opened').filter(e=>e.aggregateId===provenance.cCallRef),'Construction call');
const artifact=one(at('actor_result_artifact_observed').filter(e=>e.payload.actorInvocationRef===provenance.actorInvocationRef),'admitted stdout artifact');
assert.equal(started.payload.transportBindingRef,binding.aggregateId);assert.equal(binding.payload.cCallRef,provenance.cCallRef);
assert.equal(binding.payload.actorRef,product.NATIVE_WORKSPACE_WORK_IDS.workerActorRef);
const occurrence={runId,cCallRef:provenance.cCallRef,actorInvocationRef:provenance.actorInvocationRef};
const basis=basisOwner.rehydrateExecutionBasisAtPrefix(prefix,opened.basisId);
must(basis && basis.basisRef===binding.basisId,'owner basis rehydration');
const publication=one(saved.state.catalog.boundPublications.filter(p=>p.programs.some(q=>q.programRef===basis.programRef)),'bound publication');
const program=one(publication.programs.filter(q=>q.programRef===basis.programRef),'bound program');
const selected=owner.selectOwnedGovernedContext({constructionTask:true,publication,program,
 roleEvidence:envOwner.projectRunEnvironmentRoleEvidenceAtPrefix(prefix,basis.invocationAdmissionRef,publication,basis.programRef,
  opened.graphFunctionRef,opened.payload.programLocusRef,'constructor')});
assert.equal(selected.kind,'governed_context_selected','owner policy and role selection');
const policy=selected.policy;
const testing=library.projectGovernedContextTestingAtPrefix(prefix,basis,task,runId,policy.sources.testing.fieldPath);
must(testing!==null,'owner-selected same-Run Testing field');
const testingEvent=one(at('c_call_result_admitted').filter(e=>e.eventId===testing.eventRef && e.payload.resultRef===testing.resultRef && e.payload.resultClass==='success'),'admitted Testing producer');
assert.ok(testingEvent.admissionOrdinal<started.admissionOrdinal,'Testing precedes actor');
const fixture=await bytes(join(root,'worksite/fixture.txt')); assert.equal(fixture.length,4616);assert.equal(sha(fixture),'sha256:bee000fc220e14f318f5b37558dc96d113ef3428ad7d9d0a0043b7aa4a9787b6');
assert.deepEqual(Buffer.from(testing.bytes),fixture,'Testing producer actual bytes');
const files=new Map(task.context.entries.flatMap(e=>e.state==='file'?[[e.relativePath,e.digest]]:[]));
const testingKey=`${testing.resultRef}#${JSON.stringify(testing.fieldPath)}`;
const sourceKeys=[policy.sources.task,policy.sources.rubric,...policy.sources.worksite,testingKey];
const grantDigest=product.sha256Canonical({policyRef:selected.policyRef,policyDigest:selected.policyDigest,principal:policy.principal,sourceKeys});
const workroot=task.workspaceAuthorityBasis.canonicalRoot;assert.equal(await realpath(workroot),await realpath(join(root,'worksite')),'actual admitted worksite');
const worksiteSource=path=>{const full=resolve(workroot,path);if(!full.startsWith(workroot.endsWith(sep)?workroot:workroot+sep))return null;
 try{return lstatSync(full).isFile()?readFileSync(full):null}catch{return null}};
const held={runId,prefixDigest:product.sha256Canonical({runId,testingEventRef:testing.eventRef,resultDigest:testing.resultDigest}),
 admittedResult:ref=>ref!==testing.resultRef?null:{resultDigest:testing.resultDigest,cCallRef:testing.cCallRef,actorInvocationRef:testing.actorInvocationRef,
 field:path=>JSON.stringify(path)===JSON.stringify(testing.fieldPath)?testing.bytes:null}};
const pageBound=owner.gc03PolicyPageBound(policy.release.policyPath,policy.release.policyDigest);
const authority={occurrence:{...occurrence,actorRef:binding.payload.actorRef,attempt:opened.payload.attempt},role:selected.role,
 context:{observationRef:task.context.observationRef,readRoots:task.context.readRoots,entries:task.context.entries.map(e=>({relativePath:e.relativePath,state:e.state}))},
 original:{task:{path:policy.sources.task,digest:files.get(policy.sources.task)},rubric:{path:policy.sources.rubric,digest:files.get(policy.sources.rubric)}},
 worksiteSources:[...policy.sources.worksite].sort().map(path=>({path,digest:files.get(path)})),
 testing:{resultRef:testing.resultRef,resultDigest:testing.resultDigest,fieldPath:testing.fieldPath,producer:{cCallRef:testing.cCallRef,actorInvocationRef:testing.actorInvocationRef},provenance:[testing.eventRef]},
 grant:{principalId:policy.principal.principalId,grantId:policy.principal.grantId,grantDigest,sourceKeys},pageBound,
 release:{identity:policy.release.identity,inventorySha256:policy.release.inventorySha256,pythonDigest:policy.python.digest,pythonVersion:policy.python.version,adapterDigest:policy.adapter.digest,policyDigest:policy.release.policyDigest},
 reacquire:{prefix:()=>held,occurrenceActive:()=>false,grantDigest:()=>grantDigest,worksiteSource},
 host:async()=>{throw new Error('cold observer never serves or starts a host')}};
const lookup=owner.reacquireOwnedContextLookupCold(authority);assert.equal(lookup.closed,'completed');
const stdoutPath=binding.payload.paths.stdout;must(stdoutPath.startsWith(join(root,'resources/archives')+sep)&&stdoutPath.endsWith('-stdout.log'),'admitted stdout path');
const sidecarPath=stdoutPath.replace(/-stdout\.log$/u,'-governed-context.json');
const stdout=await bytes(stdoutPath), sidecar=await bytes(sidecarPath), index=JSON.parse(sidecar.toString('utf8'));
const stdoutDigest=artifact.payload.artifactDigests.stdout;assert.equal(sha(stdout),stdoutDigest,'admitted stdout digest');
const endpoint=index?.invocation?.endpoint;
must(typeof endpoint==='string'&&endpoint.length>0,'untrusted sidecar endpoint must be a nonempty string');
const invocation={executable:profile.executablePins.node.realPath,client:join(installedRoot,'build/code/src/abg/governed_context_client.js'),endpoint};
// Candidate endpoint has no authority until the installed owner renderer matches the one whole admitted prompt.
const args=binding.payload.args,atPrompt=args.indexOf('--append-system-prompt');must(atPrompt>=0 && args.lastIndexOf('--append-system-prompt')===atPrompt,'single admitted prompt');
assert.equal(args[atPrompt+1],owner.governedContextPrompt(invocation,lookup.keys,pageBound),'admitted owner-rendered prompt');
// The full admitted environment digest remains a retained transport fact. Its launch-time preimage is not reconstructed here.
const admittedEnvironmentDigest=binding.payload.environmentDigest;
must(typeof admittedEnvironmentDigest==='string' && /^sha256:[0-9a-f]{64}$/u.test(admittedEnvironmentDigest),'admitted environment digest absent');
const joined=owner.coldVerifyGovernedContext({stdout,stdoutDigest,transcript:sidecar,owner:{occurrence,invocation,lookup}});
assert.equal(joined.kind,'governed_context_correspondence','exact Claude fixed-client response correspondence');
const parsed=index.exchanges.map(e=>({request:e.request,response:Buffer.from(e.responseBytes,'base64'),value:JSON.parse(Buffer.from(e.responseBytes,'base64').toString('utf8'))}));
const recon=(key,expected)=>{const pages=parsed.filter(e=>e.request?.key===key && e.value.kind==='governed_context_page');must(pages.length,'no pages for '+key);
 const coverage=Buffer.alloc(expected.length),first=pages[0].value.source;
 for(const p of pages){const q=p.value,c=Buffer.from(q.content,'base64');assert.equal(c.toString('base64'),q.content,'canonical base64');
  assert.ok(Number.isSafeInteger(q.offset)&&q.offset>=0&&q.offset+c.length<=expected.length,'page range');assert.equal(q.totalBytes,expected.length);
  assert.equal(q.length,c.length);assert.equal(q.pageDigest,sha(c));assert.equal(q.source.digest,sha(expected));assert.deepEqual(q.source,first);
  assert.deepEqual(c,expected.subarray(q.offset,q.offset+c.length),'overlapping pages match selected source');coverage.fill(1,q.offset,q.offset+c.length);
  assert.equal(q.nextOffset,q.offset+c.length===expected.length?null:q.offset+c.length,'continuation');}
 assert.ok(coverage.every(x=>x===1),'full byte coverage');return {bytes:expected,source:first,pages:pages.length}};
const a=recon('late/0',await bytes(join(workroot,policy.sources.task))),b=recon('late/1',await bytes(join(workroot,policy.sources.rubric))),c=recon('late/2',fixture);
assert.equal(c.source.digest,sha(testing.bytes));assert.deepEqual(c.source.producer,{cCallRef:testing.cCallRef,actorInvocationRef:testing.actorInvocationRef});assert.deepEqual(c.source.provenance,[testing.eventRef]);
const denials=parsed.filter(e=>e.value.kind==='governed_context_refusal'&&e.value.code==='key_denied');must(denials.length>0,'actual denied key');
for(const d of denials){assert.deepEqual(d.value.occurrence,occurrence);assert.deepEqual(d.value.request,d.request);assert.equal(Object.hasOwn(d.value,'content'),false)}
// Exact actor result line is a review aid, not an automatic semantic judgment.
const terminalLines=stdout.toString('utf8').split('\n').filter(Boolean).flatMap(line=>{try{const v=JSON.parse(line);return v.type==='result'?[{line,value:v}]:[]}catch{return []}});
const terminal=one(terminalLines,'one Claude terminal result');
const proof={kind:'b11_native_witness_observation',status:'mechanical_cold_correspondence_only',selectedArtifact:selection.artifact,selectedProducer:selection.producer,launchManifestDigest:REQUIRED.manifestSha256,selectionDigest:REQUIRED.selectionSha256,run:output.value.run,parentDisposition:output.value.disposition,terminalResult:output.value.terminalResult,
 occurrence,events:{construction:construction.eventId,testing:testingEvent.eventId,started:started.eventId,opened:opened.eventId,binding:binding.eventId,artifact:artifact.eventId},
 testing:{resultRef:testing.resultRef,resultDigest:testing.resultDigest,producer:{cCallRef:testing.cCallRef,actorInvocationRef:testing.actorInvocationRef},fieldPath:testing.fieldPath,bytes:fixture.length,digest:sha(fixture)},
 stdout:hashFields(stdoutPath,stdout),sidecar:hashFields(sidecarPath,sidecar),endpointAuthentication:'exact_one_whole_admitted_owner_rendered_prompt',admittedEnvironmentDigest,environmentDigestReproduced:false,sourcePages:[a,b,c].map((x,i)=>({key:'late/'+i,pages:x.pages,source:x.source,bytes:x.bytes.length,digest:sha(x.bytes)})),
 actorReportedResult:{terminalLineSha256:sha(Buffer.from(terminal.line)),subtype:terminal.value.subtype,result:terminal.value.result},
 correspondence:{kind:joined.kind,exchanges:joined.exchanges},denied:denials.map(x=>({request:x.request,responseDigest:sha(x.response)})),
 limits:['W1 null-subject and selector-to-Testing relationship require independent native-event review','W4 diagnosis and any unmediated fallback require review of complete raw actor output and trace','reconstructed prefix/grant formulas mirror native owner; compare against installed actor_process','the admitted environment digest is retained as a transport fact; its full preimage was not reconstructed or verified','not Product qualification or host-wide confinement']};
const target=join(dir,'proof.json');await writeFile(target,JSON.stringify(proof,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:proof.status,proof:target,runId,testingResult:testing.resultRef,pages:proof.sourcePages.map(x=>x.pages),denied:denials.length}));
