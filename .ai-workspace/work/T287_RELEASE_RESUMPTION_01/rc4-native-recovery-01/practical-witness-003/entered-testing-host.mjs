
import fs from 'node:fs';import {syncBuiltinESMExports} from 'node:module';import {join} from 'node:path';import {pathToFileURL} from 'node:url';
const input=JSON.parse(fs.readFileSync(process.env.ABI5_PENDING_TESTING_HOST,'utf8')),save=(n,v)=>fs.writeFileSync(join(input.proof,n),JSON.stringify(v,null,2)+'\n');
const eventOwner=await import(pathToFileURL(join(input.installedRoot,'build/code/src/abg/event_store.js')).href),nativeFsync=fs.fsyncSync;let seen=0;
fs.fsyncSync=function(fd){nativeFsync(fd);let stop=false;
 try{const bytes=fs.readFileSync(input.eventLogPath),fresh=bytes.subarray(seen).toString('utf8');seen=bytes.length;
  if(fresh.includes('traversal_cursor_entered')){const rows=eventOwner.validateHistoricalEvents(bytes,input.profileDigest);
   const entered=rows.filter(r=>r.kind==='traversal_cursor_entered'&&r.payload.graphFunctionRef===input.testingGraphFunctionRef);
   if(entered.length>0){fs.writeFileSync(join(input.proof,'interrupted-prefix.jsonl'),bytes);
    save('interruption.json',{hook:'test-only native fsync -> owner historical decode -> first durable Testing-wrapper cursor entry',processId:process.pid,signal:'SIGKILL',eventCount:rows.length,
     entered:entered.map(e=>({eventId:e.eventId,cursorRef:e.payload.cursorRef})),openedAtInterruption:rows.filter(r=>r.kind==='c_call_opened'&&entered.some(e=>e.payload.cursorRef===r.payload.cursorRef)).length});stop=true;}}}
 catch(error){try{save('observer-failure.json',{message:String(error&&error.stack||error)});}finally{stop=true;}}
 if(stop)process.kill(process.pid,'SIGKILL');};
syncBuiltinESMExports();save('recovery-origin.json',{lastCloseHandoff:input.closeHandoff,ownerPid:process.pid});
const cliPath=join(input.installedRoot,'build/code/src/public/cli.js');process.argv=[process.execPath,cliPath,'--jsonl',input.requestPath];
await import(pathToFileURL(cliPath).href);fs.fsyncSync=nativeFsync;syncBuiltinESMExports();save('unexpected-completion.json',{exitCode:process.exitCode??0});
