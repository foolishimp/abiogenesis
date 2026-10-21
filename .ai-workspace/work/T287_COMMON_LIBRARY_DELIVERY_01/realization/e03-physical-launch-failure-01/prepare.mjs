import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
const root=import.meta.dirname;
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
try {
 const preflight=JSON.parse(await readFile(join(root,'preflight.json'),'utf8'));
 const config=JSON.parse(await readFile(join(root,'config.json'),'utf8'));
 assert.equal(preflight.status,'ready_for_definition_only_preparation');
 for(const pin of preflight.inputs) assert.equal(hash(await readFile(pin.path)),pin.sha256);
 assert.equal(process.execPath,config.nodeExecutable);assert.equal(process.version,'v24.7.0');
 assert.equal(process.platform,'darwin');
 const load=name=>import(pathToFileURL(join(preflight.frozenTenant,'build/code/src',name+'.js')).href);
 const {constructKnownWorkerTransportContract}=await load('abg/transport_contracts');
 const worker=await load('abg/worker_transport'),lifetime=await load('shared/owned_process_lifetime');
 assert.equal(typeof worker.runWorkerTransport,'function');assert.equal(typeof lifetime.createOwnedProcessLifetime,'function');
 const contract=constructKnownWorkerTransportContract('claude',{command:config.absentExecutable,prefixArgs:[],environment:{}});
 assert.equal(contract.promptTransport,'stdin');
 const prompt=config.promptCharacter.repeat(config.promptByteLength);
 const command={commandId:'command://e03-physical-launch-failure',executable:config.absentExecutable,args:[],relativeCwd:'.',environment:[],
  timeoutMs:config.timeoutMs,terminationGraceMs:config.terminationGraceMs,expectedReports:[]};
 const result={activation:config.activation,contract,prompt:{character:config.promptCharacter,bytes:Buffer.byteLength(prompt),sha256:hash(prompt)},
  worker:{lane:'worker_executes',cwd:join(config.scratchRoot,'worker-cwd'),archiveRoot:join(config.evidenceRoot,'worker-archive'),label:'failed-spawn',
   timeoutMs:config.timeoutMs,absoluteTimeoutMs:config.absoluteTimeoutMs,terminationGraceMs:config.terminationGraceMs,environment:{}},
  command:{task:{commands:[command]},executionRoot:join(config.scratchRoot,'command-cwd'),ordinal:0,attemptRef:'attempt://component/e03-no-launch'},
  direct:{command:config.absentExecutable,args:[],options:{cwd:join(config.scratchRoot,'direct-cwd'),env:{},detached:true,stdio:['pipe','pipe','pipe']},terminationGraceMs:config.terminationGraceMs},
  sourceScope:'Exact frozen exported worker and private command owner plus separate actual common-lifetime attempt; no Product task or ABG admission assertion.',
  node:{executable:process.execPath,version:process.version,platform:process.platform},physicalWorkPerformed:false};
 await writeFile(join(root,'prepared-inputs.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({status:'prepared_no_spawn',prompt:result.prompt,command:contract.command}));
} catch(error) {
 await writeFile(join(root,'first-failure.json'),JSON.stringify({phase:'definition_only_preparation',name:error.name,message:error.message,stack:error.stack},null,2)+'\n',{flag:'wx'});
 console.error(error);process.exitCode=1;
}
