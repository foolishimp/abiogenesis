import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {commandRecorder} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
const root=fileURLToPath(new URL('.',import.meta.url));
console.log(JSON.stringify({stage:'dynamic_source_preparation',recorderPID:process.pid,sourceResultRef:'result://abiogenesis/b5e95b06c2c7cf7f99836a96b53fe871573ecc8a4bc2b4ea8e74706810445356',nativeLaunch:false}));
const command=commandRecorder(root,{environment:process.env,timeoutMs:19260000,maxOutputBytes:536870912});
const result=await command('dynamic-source-preparation','/opt/homebrew/bin/node',[join(root,'prepare.mjs'),'--prepare','result://abiogenesis/b5e95b06c2c7cf7f99836a96b53fe871573ecc8a4bc2b4ea8e74706810445356'],{cwd:root});
console.log(JSON.stringify({stage:'dynamic_source_preparation_closed',exitCode:result.exitCode,signal:result.signal,wallMs:result.wallMs,timedOut:result.timedOut,truncated:result.truncated,failure:result.failure,nativeLaunch:false}));
process.exitCode=result.exitCode??1;
