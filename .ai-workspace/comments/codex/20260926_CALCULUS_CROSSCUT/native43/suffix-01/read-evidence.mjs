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

const memberKey='run_evidence',start=performance.now();
const call=publicReadDefinition({product,abg,installedPublic,workspaceAuthorityBasis:basis.environment.workspaceAuthorityBasis,
 workspaceBinding:basis.environment.workspaceBinding,admittedInstalls:basis.environment.productInstalls,install:{verified:basis.abiArtifact}}, {closeHandoff,receipt},memberKey);
const path=join(record.scratch,'read-run_evidence.jsonl');
await save('read-run_evidence.jsonl',JSON.stringify({kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition:{kind:'reopen',closeHandoff},invocation:call})+'\n');
let processResult;
try{processResult=await exec(process.execPath,[record.cliPath,'--jsonl',path],{cwd:record.scratch,env:{...process.env,NODE_OPTIONS:'',ABG_TS_CLAUDE_COMMAND:'/unavailable/observational-read-no-actors'},timeout:600000,maxBuffer:128*1024*1024});}
catch(error){processResult={stdout:error.stdout??'',stderr:error.stderr??String(error)};await save('read-run_evidence.process-failure.json',{code:error.code??null,signal:error.signal??null,message:error.message});}
await save('read-run_evidence.json',processResult.stdout);await save('read-run_evidence.stderr',processResult.stderr);
const fresh=JSON.parse(processResult.stdout).receipt;same(fresh.resources.eventResource.closeHandoff.prefix,prefix);
assert.equal(fresh.ownerOutput.outcomeKind,'result');assert.equal(fresh.exitCode,0);
const projection=fresh.ownerOutput.value.projection;same(projection.subject,run);
const boundary={memberKey,disposition:'preserved_and_checked',elapsedMs:performance.now()-start,run,prefix,
 resultPath:join(record.scratch,'read-run_evidence.json'),resultDigest:await product.sha256File(join(record.scratch,'read-run_evidence.json'))};
await save('read-run_evidence.boundary.json',boundary);
const bodies=(projection.evidence??[]).filter(e=>e.ref.startsWith('data:application/json,')).map(e=>({coordinate:e,value:JSON.parse(decodeURIComponent(e.ref.slice('data:application/json,'.length)))}));
await save('first-cause-public-evidence.json',{scope:'ordinary Public run_evidence returned payloads',boundary,bodies});
console.log(JSON.stringify({memberKey,elapsedMs:boundary.elapsedMs,returnedBodies:bodies.length}));
