import {commandRecorder} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const phase=dirname(fileURLToPath(import.meta.url));
const environment={...process.env};delete environment.NODE_OPTIONS;for(const k of Object.keys(environment))if(k.startsWith('ABG_TS_'))delete environment[k];
const command=commandRecorder(phase,{environment});
const result=await command('driver',process.execPath,[join(phase,'driver.mjs'),'--execute','/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/crosscut-installed-host-83/exacthost-identity.json']);
console.log(JSON.stringify({exitCode:result.exitCode,signal:result.signal,wallMs:result.wallMs,timedOut:result.timedOut,truncated:result.truncated,stdout:result.stdout,stderr:result.stderr}));
process.exitCode=result.exitCode??1;
