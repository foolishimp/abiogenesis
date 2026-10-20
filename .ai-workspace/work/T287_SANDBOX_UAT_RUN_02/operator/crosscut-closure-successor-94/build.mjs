import assert from 'node:assert/strict';
import {commandRecorder} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
import {dirname} from 'node:path';import {fileURLToPath} from 'node:url';
const phase=dirname(fileURLToPath(import.meta.url));const command=commandRecorder(phase,{environment:{PATH:'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',npm_config_cache:phase+'/npm-cache'}});
const result=await command('build','/opt/homebrew/bin/npm',['run','build'],{cwd:'/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript'});
console.log(JSON.stringify({exitCode:result.exitCode,signal:result.signal,wallMs:result.wallMs,timedOut:result.timedOut,truncated:result.truncated,stdout:result.stdout,stderr:result.stderr}));
assert.equal(result.exitCode,0);assert.equal(result.signal,null);assert.equal(result.timedOut,false);assert.equal(result.truncated,false);assert.equal(result.failure,null);
