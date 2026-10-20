import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {commandRecorder,exclusiveRecord} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
const root=fileURLToPath(new URL('.',import.meta.url));
await exclusiveRecord(root,'recorder-pid.json',{pid:process.pid,started:new Date().toISOString(),stockHeap:true,inheritedEnvironment:true});
const command=commandRecorder(root,{environment:process.env,timeoutMs:19260000,maxOutputBytes:536870912});
const result=await command('recovery-stop-source','/opt/homebrew/bin/node',[join(root,'recover-stop-source.mjs')],{cwd:root});
process.stdout.write(JSON.stringify({stage:'recovery-stop-source-closed',exitCode:result.exitCode,signal:result.signal,wallMs:result.wallMs,timedOut:result.timedOut,truncated:result.truncated,failure:result.failure})+'\n');
process.exitCode=result.exitCode===0?0:1;
