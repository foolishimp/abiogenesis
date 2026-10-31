// Pure RC2 owner configuration and actual-source checks. No call is prepared or dispatched.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFile,stat,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {installedModules,publicCaller} from '../operator-client/public-setup.mjs';
import {assessmentSelection} from '../operator-client/consumer.mjs';

const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01';
const folder=join(base,'attempt-002'),inc=join(base,'increment-a-01'),setup=join(base,'setup-001');
const work='/Users/jim/src/apps/abiogenesis-rc3-dogfood';
const args=process.argv.slice(2);assert(args.length===0 || args.length===1 && args[0]==='--check-only');
const checkOnly=args.length===1;
const sha=b=>createHash('sha256').update(b).digest('hex');
const retained=JSON.parse(await readFile(join(setup,'operator-resume-material.json'),'utf8'));
const summary=JSON.parse(await readFile(join(setup,'summary.json'),'utf8'));
const workloadRaw=await readFile(join(folder,'workload.json')),request=JSON.parse(workloadRaw);
const census=JSON.parse(await readFile(join(inc,'snapshot-census.json'),'utf8'));
const priorRaw=await readFile(join(base,'attempt-001/after-run-resume.json'));const prior=JSON.parse(priorRaw);
const original=JSON.parse(await readFile(join(inc,'workload.json'),'utf8'));
const removed=original.sources.filter(x=>!request.sources.some(y=>y.path===x.path));
assert.equal(removed.length,6);
const same={...original,sources:request.sources};assert.deepEqual(request,same,'A02 changed more than six inline source declarations');
assert.equal(summary.status,'workspace-prepared');assert.equal(summary.providerCalls,0);
assert.equal(retained.native.request.expectedArtifactDigest,'sha256:36e02dd927066db2f64d71446334982d65b9b8b4ab1c7666d83d04c530aca528');
assert.equal(retained.native.request.expectedManifestDigest,'sha256:4cbec075adc577e9a7544167ac858e04a4d9340e4c2eb18ccb752128c4da623d');
assert.equal(retained.native.request.expectedProductId,'product://abiogenesis/typescript-tenant@5.0.0-rc.2');
assert.equal(retained.setup.installations[0].productId,'product://abiogenesis/typescript-tenant@5.0.0-rc.2');
assert.equal(retained.installedRoot,summary.installedRoot);assert(retained.installedRoot.startsWith(setup+'/sandbox/installed/abg/'));
assert.equal(execFileSync('/usr/bin/git',['rev-parse','HEAD'],{cwd:work,encoding:'utf8'}).trim(),'d1e4527dbbc0b9ca1a929122c62ca225184f3341');
assert.equal(execFileSync('/usr/bin/git',['status','--porcelain=v1','-uno'],{cwd:work,encoding:'utf8'}),'');
const toolchain=JSON.parse(execFileSync('/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12',['-B',join(inc,'toolchain-census.py'),'--verify'],{encoding:'utf8'}));
const eventPath=fileURLToPath(prior.state.closeHandoff.prefix.eventLogRef),before=await readFile(eventPath);
assert.equal(before.length,prior.state.closeHandoff.prefix.prefixLength,'not the exact A01 after-run prefix');
const runtime=await installedModules(retained.installedRoot);
const c2=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/product/worksite_command_execution.js')).href);
const installedManifest=JSON.parse(await readFile(join(retained.installedRoot,'product-toolchain-manifest.json'),'utf8'));
assert.equal(runtime.product.sha256Canonical(installedManifest),retained.native.request.expectedManifestDigest);
const caller=publicCaller({root:setup,runtime,native:retained.native,command:()=>{throw Error('unexpected execution')},
 record:()=>{throw Error('unexpected recording')},config:retained.config,actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(caller.state,prior.state);caller.installedRoot=prior.installedRoot;caller.workspaceAuthority=prior.workspaceAuthority;
const environment=caller.refresh();
assert.equal(environment.workspaceAuthorityBasis.canonicalRoot,work);
let bytes=0;
for(const path of request.readRoots){const p=join(work,path),s=await stat(p);assert(s.isFile(),path);bytes+=s.size;}
assert.equal(request.readRoots.length,census.testingFiles);assert.equal(bytes,census.testingBytes);
for(const [path,expect] of Object.entries({...census.sourceRows,...census.operatorInputs})){
 const b=await readFile(join(work,path));assert.equal(sha(b),expect.sha256,path);assert.equal(b.length,expect.bytes,path);
}
for(const [path,expect] of Object.entries(census.contractSeedRows)){
 const b=await readFile(join(work,path)),original=await readFile(join(work,expect.source));
 assert.equal(sha(b),expect.sha256,path);assert.deepEqual(b,original,path);
}
for(const s of request.sources){const data=await readFile(join(work,s.path));assert.equal('sha256:'+sha(data),s.digest,s.path);}
const rubric=JSON.parse(await readFile(join(work,request.assessment.rubricPath),'utf8'));
assert.deepEqual(rubric.criteria.map(r=>r.id),['A1','A2','A3','A4','A5']);
assert.equal(request.workOrders.uat.outcome,rubric.outcome);assert.deepEqual(request.workOrders.uat.writeRoots,[]);
for(const [role,order] of Object.entries(request.workOrders)){
 for(const path of order.readFirst)assert(request.readRoots.includes(path),role+' readFirst: '+path);
 for(const path of order.writeRoots)assert(request.readRoots.includes(path),role+' writeRoot: '+path);
}
assert(request.testing.selectedPaths.includes('build_tenants/abiogenesis/typescript/test_env/tests/t287-native-semantic-revision.test.mjs'));
assert(request.testing.selectedPaths.includes('.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/default-library-witness/selection.json'));
assert(request.testing.selectedPaths.includes('.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s6-witness-contract.md'));
const revised={...request,assessment:{...request.assessment,...assessmentSelection}};
const input=runtime.product.constructGovernanceWorkState(revised);assert(runtime.product.isGovernanceWorkState(input));
const authority={workspaceAuthorityBasis:environment.workspaceAuthorityBasis,workspaceBinding:environment.workspaceBinding};
const subjects=request.testing.selectedPaths.map(relativePath=>runtime.product.constructWorksiteSubject({...authority,relativePath,subjectUri:pathToFileURL(join(work,relativePath)).href}));
const configuration=c2.constructWorksiteCommandConfiguration({...authority,protectedSubjects:subjects,
 commands:request.testing.commands,outcomePredicates:request.testing.outcomePredicates,allowedWriteTerritories:request.testing.allowedWriteTerritories},null);
const budget=c2.projectWorksiteCommandExecutionBudget(request.testing);
const candidateLimits={inactivityTimeoutMs:1800000,absoluteTimeoutMs:2100000};
assert(c2.worksiteCommandExecutionBudgetFits(budget.requiredExecutionBudgetMs,candidateLimits));
assert.deepEqual(await readFile(eventPath),before,'model-free preflight changed the native event log');
const result={kind:'rc3_increment_a02_model_free_preflight',status:'prepared_not_dispatched',
 selectedRuntime:retained.native.request,installedRoot:retained.installedRoot,sourceCommit:census.sourceCommit,priorAfterRunSha256:sha(priorRaw),removedInlineSources:removed.map(x=>x.path),
 workloadSha256:sha(workloadRaw),protectedFiles:subjects.length,readBytes:bytes,commandCount:configuration.commands.length,
 criteria:rubric.criteria.map(r=>r.id),uatOutcome:request.workOrders.uat.outcome,requiredExecutionBudgetMs:budget.requiredExecutionBudgetMs,
 candidateTimeoutLimits:candidateLimits,offlineToolchain:toolchain.canonicalInventorySha256,
 freshSetupEventLog:{bytes:before.length,sha256:sha(before),unchanged:true},
 observations:['actual RC2 pure governance and worksite-configuration owners accepted inputs on the A01 after-run prefix',
  'all 904 selected tracked test inputs and exact witness/contract seed preimages checked',
  'no call or provider was prepared, admitted or dispatched'],
 limits:['Future actual producer/assessment evidence must be authenticated by its native owner',
  'Candidate timeout values are a comparison with historical limits, not a selected provider configuration',
  'Existing gated historical tests may skip; they cannot count as this increment\u0027s required proof',
  'Native Claude tool allowlist excludes Skill; exact method bytes are supplied for declared reads, no Skill invocation claimed']};
if(checkOnly){
 const previous=JSON.parse(await readFile(join(folder,'model-free-preflight.json'),'utf8'));
 assert.deepEqual(result,previous,'current preflight differs from the frozen observation');
}else await writeFile(join(folder,'model-free-preflight.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(result));
