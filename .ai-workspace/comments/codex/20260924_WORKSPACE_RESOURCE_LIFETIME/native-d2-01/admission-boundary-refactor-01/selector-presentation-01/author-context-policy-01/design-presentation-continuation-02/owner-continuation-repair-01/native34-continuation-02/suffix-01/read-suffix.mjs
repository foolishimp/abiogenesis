// Thin successor caller: the existing two Public reads own terminal truth.
// Their typed terminal value replaces the optional duplicate SDK replay.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {installedFullSandboxApis,evaluateOrdinaryJobObservation} from '/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01/setup-overhead-repair-01/installed-preparation-02/caller/test/full-sandbox-support.mjs';
import {publicReadDefinition} from '/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01/setup-overhead-repair-01/installed-preparation-02/caller/test/generic-live-workflow-support.mjs';
const exec=promisify(execFile),record=JSON.parse(await readFile(process.argv[2],'utf8'));
const read=async n=>JSON.parse(await readFile(join(record.scratch,n),'utf8'));
const save=async(n,v)=>writeFile(join(record.scratch,n),typeof v==='string'?v:JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const basis=await read('readback-basis.json'),receipt=(await read('live-receipt.json')).receipt;
const {product,abg,installedPublic}=await installedFullSandboxApis(record.abiRoot);
const closeHandoff=receipt.resources.eventResource.closeHandoff,prefix=closeHandoff.prefix,run=receipt.ownerOutput.value.run,result=receipt.ownerOutput.value.result??null;
const same=(a,b)=>assert.equal(product.sha256Canonical(a),product.sha256Canonical(b));
const installedAfter=[];
for(const install of basis.environment.productInstalls){assert.equal(await product.installedProductContentMatches(install),true);installedAfter.push({installId:install.installId,productContentDigest:install.productContentDigest});}
const publicReads=[],projections={};
for(const memberKey of ['run_result','run_replay']){
 const start=performance.now();
 try{
  const call=publicReadDefinition({product,abg,installedPublic,workspaceAuthorityBasis:basis.environment.workspaceAuthorityBasis,
   workspaceBinding:basis.environment.workspaceBinding,admittedInstalls:basis.environment.productInstalls,install:{verified:basis.abiArtifact}}, {closeHandoff,receipt},memberKey);
  const path=join(record.scratch,`read-${memberKey}.jsonl`);
  await save(`read-${memberKey}.jsonl`,JSON.stringify({kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition:{kind:'reopen',closeHandoff},invocation:call})+'\n');
  let processResult;
  try{processResult=await exec(process.execPath,[record.cliPath,'--jsonl',path],{cwd:record.scratch,env:{...process.env,NODE_OPTIONS:'',ABG_TS_CLAUDE_COMMAND:'/unavailable/observational-read-no-actors'},timeout:600000,maxBuffer:128*1024*1024});}
  catch(error){processResult={stdout:error.stdout??'',stderr:error.stderr??String(error)};await save(`read-${memberKey}.process-failure.json`,{code:error.code??null,signal:error.signal??null,message:error.message});}
  await save(`read-${memberKey}.json`,processResult.stdout);await save(`read-${memberKey}.stderr`,processResult.stderr);
  const fresh=JSON.parse(processResult.stdout).receipt;same(fresh.resources.eventResource.closeHandoff.prefix,prefix);
  const absent=memberKey==='run_result'&&result===null&&['blocked','runtime_failed'].includes(receipt.ownerOutput.value.disposition);
  if(absent){assert.equal(fresh.ownerOutput.outcomeKind,'refusal');assert.equal(fresh.ownerOutput.value.code,'not_found');assert.equal(fresh.exitCode,1);}
  else{assert.equal(fresh.ownerOutput.outcomeKind,'result');assert.equal(fresh.exitCode,0);const projection=fresh.ownerOutput.value.projection;same(projection.subject,run);projections[memberKey]=projection;
   if(memberKey==='run_result')same(projection.result,result);
   else if(receipt.ownerOutput.value.disposition==='completed'){assert.equal(projection.status,'closed');same(projection.terminalResult.result,result);}
   else{assert.equal(projection.terminalResult,null);assert.equal(projection.status,receipt.ownerOutput.value.disposition==='runtime_failed'?'failed':'blocked');}}
  publicReads.push({memberKey,disposition:'preserved_and_checked',elapsedMs:performance.now()-start,resultPath:join(record.scratch,`read-${memberKey}.json`),resultDigest:await product.sha256File(join(record.scratch,`read-${memberKey}.json`)),...(absent?{observation:'result_absent_not_found'}:{})});
 }catch(error){publicReads.push({memberKey,disposition:'read_failed',elapsedMs:performance.now()-start,message:error.message});}
 await save(`read-${memberKey}.boundary.json`,publicReads.at(-1));
 console.log(JSON.stringify(publicReads.at(-1)));
}
await save('public-readback.json',{prefix,publicReads});assert.ok(publicReads.every(row=>row.disposition==='preserved_and_checked'),'both fresh native Public reads required');
const terminal=projections.run_result?.terminalResult??null;
const proof={kind:'native_semantic_revision_suffix_readback',run,result,prefix,publicReads,installedAfter,inputDigest:record.inputDigest,duplicateSdkProjection:false};
if(result===null||receipt.ownerOutput.value.disposition!=='completed'){proof.status='no_completed_suffix_result';}
else{
 same(terminal,projections.run_replay.terminalResult);const revision=terminal.value;
 assert.equal(product.sha256Canonical(revision),terminal.valueDigest);assert.equal(product.isSemanticJobRevisionEnvelope(revision),true);
 const output=revision.current,selection=JSON.parse(await readFile(join(record.scratch,'../preparation/selection.json'),'utf8'));
 const originalInput=JSON.parse(await readFile(selection.ordinaryInput,'utf8'));
 same(output.job,originalInput);same(output.declaration,basis.declaration);assert.equal(output.applicationCoverage,'non_closing');
 assert.ok(output.assets.every(asset=>asset.assessment?.disposition==='satisfied'));
 const supplied=JSON.parse(await readFile(record.launchPath,'utf8')).invocation.invocation.request.input.value;
 same(revision.revisionBasis.request,supplied);
 const interpreted=evaluateOrdinaryJobObservation({output,input:originalInput,workspaceRoot:record.workspaceRoot});
 const artifacts=[];
 for(const artifact of output.evidence?.artifacts??[]){
  const observations=output.evidence.executionObservation.task.protectedObservations.filter(row=>row.subject.subjectRef===artifact.subjectRef && row.observation.observationRef===artifact.observationRef);
  assert.equal(observations.length,1);const path=join(record.workspaceRoot,observations[0].subject.relativePath);
  const bytes=await readFile(path);assert.equal(bytes.toString('base64'),artifact.base64);
  artifacts.push({path,bytes:bytes.length,digest:product.sha256Bytes(bytes),subjectRef:artifact.subjectRef,observationRef:artifact.observationRef});
 }
 await save('suffix-terminal-value.json',revision);await save('ordinary-outcome-projection.json',interpreted);
 Object.assign(proof,{status:interpreted.applicationQualification,applicationCoverage:output.applicationCoverage,remainingGaps:output.remainingGaps,
  terminalResult:terminal.result,valueDigest:terminal.valueDigest,artifacts,assessments:output.assets.map(asset=>({stageRef:asset.stageRef,assetRef:asset.assetRef,disposition:asset.assessment?.disposition}))});
}
proof.boundary='Ordinary Public terminal Result/replay, typed revision/job conservation and existing oracle/artifact checks; no duplicate SDK reconstruction or application acceptance inferred from native completion.';
await save('suffix-readback.json',proof);console.log(JSON.stringify(proof));
