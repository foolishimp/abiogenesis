import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const repo='/Users/jim/src/apps/abiogenesis',tenant=repo+'/build_tenants/abiogenesis/typescript';
const phase=repo+'/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/crosscut-command-budget-repair-73';
const {commandRecorder}=await import(pathToFileURL(tenant+'/test_env/uat/runner.mjs').href);
const record=commandRecorder(phase,{environment:{PATH:'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',ABI5_GENERIC_JOB_BUILD_ROOT:phase+'/isolated',ABG_WORKSITE_BUILD_ROOT:phase+'/isolated/build/code/src'},timeoutMs:180000,maxOutputBytes:1048576});
function requirePass(r){assert.equal(r.exitCode,0);assert.equal(r.signal,null);assert(!r.timedOut&&!r.truncated&&!r.failure);}
const compile=await record('isolated-compile','/opt/homebrew/bin/node',[tenant+'/node_modules/typescript/bin/tsc','--project',tenant+'/tsconfig.json','--outDir',phase+'/isolated/build/code/src'],{cwd:tenant});
console.log(JSON.stringify({stage:'isolated-compile',exitCode:compile.exitCode,wallMs:compile.wallMs}));requirePass(compile);
const selection='native Design command budget|command cleanup budget|command budget shares HTTP|extended original C2 plan';
const focused=await record('focused','/opt/homebrew/bin/node',['--experimental-vm-modules','--test','--test-name-pattern='+selection,tenant+'/test_env/tests/t287-native-semantic-job.test.mjs',phase+'/isolated/t287-observed-worksite-command.test.mjs'],{cwd:tenant});
console.log(JSON.stringify({stage:'focused',exitCode:focused.exitCode,wallMs:focused.wallMs}));requirePass(focused);
await writeFile(phase+'/check-summary.json',JSON.stringify({compile:{exitCode:compile.exitCode,wallMs:compile.wallMs},focused:{exitCode:focused.exitCode,wallMs:focused.wallMs,selection},isolatedCompileOnly:true,normalGeneratedUntouched:true,nativeExecutionOrQualification:false},null,2)+'\n',{flag:'wx'});
