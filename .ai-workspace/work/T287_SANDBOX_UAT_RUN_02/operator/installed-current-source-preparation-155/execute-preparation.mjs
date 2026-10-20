import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {commandRecorder} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
const root=fileURLToPath(new URL('.',import.meta.url));
process.stdout.write(JSON.stringify({stage:'installed-current-source-preparation',recorderPID:process.pid,nativeDispatch:false})+'\n');
const command=commandRecorder(root,{environment:process.env,timeoutMs:19260000,maxOutputBytes:536870912});
const result=await command('current-source-preparation','/opt/homebrew/bin/node',[join(root,'prepare.mjs')],{cwd:root});
process.stdout.write(JSON.stringify({stage:'preparation-command-closed',exitCode:result.exitCode,signal:result.signal,wallMs:result.wallMs,timedOut:result.timedOut,truncated:result.truncated,failure:result.failure,nativeDispatch:false})+'\n');
process.exitCode=result.exitCode??1;
