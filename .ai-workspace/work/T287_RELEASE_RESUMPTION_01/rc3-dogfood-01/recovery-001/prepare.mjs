import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile,stat} from 'node:fs/promises';
import {join} from 'node:path';
import {verifyInputs,root,sha,json} from './verify-inputs.mjs';
const config=await verifyInputs();
assert.equal(config.root,root.replace(/\/$/,''));
await mkdir(join(config.root,'runtime'),{recursive:true});
await writeFile(join(config.root,'runtime','PREPARATION_STARTED.json'),JSON.stringify({at:new Date().toISOString(),classification:'Root-selected preparation only; no provider expected'})+'\n',{flag:'wx'});
const tmp=join(config.root,'runtime','tmp');await mkdir(tmp,{recursive:true});process.env.TMPDIR=tmp;
await import('./frozen/test_env/tests/recovery-prepare.mjs');
const proof=join(config.root,'runtime','proof'),checkpoint=await json(join(proof,'prepared-checkpoint.json'));
const names=['continue-call.json','consumed-call.json','prepared-checkpoint.json','read-environment.json','initial-handoff.json','prepared-relation.json'];
const files=[];for(const name of names){const b=await readFile(join(proof,name));files.push({path:name,bytes:b.length,sha256:sha(b)});}
const eventPath=new URL(checkpoint.closeHandoff.prefix.eventLogRef),facts=await stat(eventPath,{bigint:true}),bytes=await readFile(eventPath);
await writeFile(join(proof,'PREPARED_CUSTODY.json'),JSON.stringify({at:new Date().toISOString(),files,eventFile:{path:eventPath.pathname,device:String(facts.dev),inode:String(facts.ino),bytes:bytes.length,sha256:sha(bytes)},classification:'genuine undispatched preparation frontier; no arbitrary crash or model claim'},null,2)+'\n',{flag:'wx'});
