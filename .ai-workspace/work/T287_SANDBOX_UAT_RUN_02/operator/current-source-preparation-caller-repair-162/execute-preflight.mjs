import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {commandRecorder} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
const root=fileURLToPath(new URL('.',import.meta.url));
const environment={...process.env};delete environment.NODE_OPTIONS;
const command=commandRecorder(root,{environment,timeoutMs:19260000,maxOutputBytes:536870912});
const result=await command('caller-preflight',process.execPath,[join(root,'preflight.mjs')],{cwd:root});
process.stdout.write(JSON.stringify({stage:'caller-preflight-closed',exitCode:result.exitCode,signal:result.signal,wallMs:result.wallMs,timedOut:result.timedOut,truncated:result.truncated,noResourceAcquisition:true,noPublicDispatch:true})+'\n');
process.exitCode=result.exitCode??1;
