import {writeFile,readFile,readdir,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {createHash} from 'node:crypto';
import {setup} from './setup-driver.mjs';
const here=dirname(fileURLToPath(import.meta.url)),startedAt=new Date().toISOString();
try { await setup(here); }
catch(error){
 const handoffs=(await readdir(here)).filter(n=>n.startsWith('setup-')&&n.endsWith('-handoff.json'));
 const ordered=await Promise.all(handoffs.map(async name=>({name,mtimeMs:(await stat(join(here,name))).mtimeMs})));
 ordered.sort((a,b)=>b.mtimeMs-a.mtimeMs);const latest=ordered[0]?JSON.parse(await readFile(join(here,ordered[0].name),'utf8')):null;
 const eventPath=join(here,'resources/events/runtime.events.jsonl');let physical=null;
 try{const s=await stat(eventPath),b=await readFile(eventPath);physical={path:eventPath,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex'),device:s.dev,inode:s.ino};}catch(e){if(e.code!=='ENOENT')throw e;}
 const result={status:'FIRST_FAILURE_STOPPED',phase:'ordinary_wrapper_setup',startedAt,closedAt:new Date().toISOString(),error:{name:error.name,message:error.message,stack:error.stack},latestHandoff:latest,physical,realProviderCalls:0,newCallsAfterFailure:0};
 await writeFile(join(here,'first-failure.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
 console.error(JSON.stringify({status:result.status,phase:result.phase,error:result.error.message,physical}));process.exitCode=1;
}
