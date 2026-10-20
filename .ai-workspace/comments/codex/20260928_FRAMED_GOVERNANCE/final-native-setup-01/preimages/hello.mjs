import assert from 'node:assert/strict';
import {join} from 'node:path';
import {here,read,write,caller} from './ordinary-caller.mjs';
const c=await caller('hello'),saved=await read(join(here,'setup-state.json'));
for(const key of ['closeHandoff','environment','catalog','catalogView','binding','resolvedLock'])c.state[key]=saved[key];
try{
 c.refresh();const input=c.gtl.constructHelloWorldInput('prospective 5.0.0-rc.1 qualification');
 const started=await c.start(c.gtl.HELLO_WORLD_IDS.programRef,c.gtl.HELLO_WORLD_IDS.graphFunctionRef,input,'root','hello');
 const reads=await c.freshReads('root',started);
 assert.ok(reads.run_result&&reads.run_replay);
 await write('hello-result.json',{status:'native_root_and_fresh_public_reads_completed',input,rootReceipt:started.receipt,reads,closeHandoff:c.state.closeHandoff,calls:c.state.calls,claim:'One installed deterministic Hello root episode and Result/replay readback; no S02, LLM, C2, independent sufficiency or whole Product qualification claim.'});
 console.log(JSON.stringify({status:'CLOSED_Hello',closeHandoff:c.state.closeHandoff,calls:c.state.calls}));
}catch(error){await write('hello-failure.json',{status:'CLOSED_first_failure',message:String(error),stack:error.stack,closeHandoff:c.state.closeHandoff,calls:c.state.calls});throw error;}
