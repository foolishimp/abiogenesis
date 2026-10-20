import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {installedFullSandboxApis} from '../bootstrap-preparation-03/caller/test/full-sandbox-support.mjs';
import {publicReadDefinition} from '../bootstrap-preparation-03/caller/test/generic-live-workflow-support.mjs';
const D=import.meta.dirname,read=async n=>JSON.parse(await readFile(join(D,n),'utf8')),save=(n,v)=>writeFile(join(D,n),typeof v==='string'?v:JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const [record,basis,live]=await Promise.all(['native-prepared.json','readback-basis.json','live-receipt.json'].map(read)),receipt=live.receipt;
const {product,abg,installedPublic}=await installedFullSandboxApis(record.abiRoot),closeHandoff=receipt.resources.eventResource.closeHandoff;
const call=publicReadDefinition({product,abg,installedPublic,workspaceAuthorityBasis:basis.environment.workspaceAuthorityBasis,workspaceBinding:basis.environment.workspaceBinding,admittedInstalls:basis.environment.productInstalls,install:{verified:basis.abiArtifact}},{closeHandoff,receipt},'run_evidence');
const path=join(D,'read-run_evidence-02.jsonl');await save('read-run_evidence-02.jsonl',JSON.stringify({kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition:{kind:'reopen',closeHandoff},invocation:call})+'\n');
const start=performance.now();let processResult;
try{processResult=await promisify(execFile)(process.execPath,[record.cliPath,'--jsonl',path],{cwd:D,env:{...process.env,NODE_OPTIONS:'',ABG_TS_CLAUDE_COMMAND:'/unavailable/observational-read-no-actors'},timeout:300000,maxBuffer:128*1024*1024});}
catch(error){processResult={stdout:error.stdout??'',stderr:error.stderr??String(error)};await save('read-run_evidence-02.process-failure.json',{code:error.code??null,signal:error.signal??null,message:error.message});}
await save('read-run_evidence-02.json',processResult.stdout);await save('read-run_evidence-02.stderr',processResult.stderr);
const returned=JSON.parse(processResult.stdout);assert.equal(returned.kind,'installed_definition_call_transport_result',JSON.stringify(returned));const fresh=returned.receipt;await save('read-run_evidence-02.boundary.json',{elapsedMs:performance.now()-start,outcomeKind:fresh.ownerOutput.outcomeKind,prefix:fresh.resources.eventResource.closeHandoff.prefix});
assert.equal(product.sha256Canonical(fresh.resources.eventResource.closeHandoff.prefix),product.sha256Canonical(closeHandoff.prefix));assert.equal(fresh.ownerOutput.outcomeKind,'result');assert.equal(fresh.exitCode,0);
console.log(JSON.stringify({status:'fresh run_evidence retained',elapsedMs:performance.now()-start,projectionKeys:Object.keys(fresh.ownerOutput.value.projection)}));
