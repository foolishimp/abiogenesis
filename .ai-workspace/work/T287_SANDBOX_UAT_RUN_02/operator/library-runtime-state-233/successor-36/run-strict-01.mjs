import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const args=['/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/node_modules/typescript/bin/tsc','--project',root+'tsconfig-01.json'];
const start=performance.now();const r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
writeFileSync(root+'commands/strict-01.stdout',r.stdout??'');writeFileSync(root+'commands/strict-01.stderr',r.stderr??'');
const result={kind:'isolated_strict_runtime_dependency_compile',sourceCut:36,command:[process.execPath,...args],exitCode:r.status,signal:r.signal,elapsedMs:performance.now()-start,sourceFiles:264,input:root+'inputs-01.json',limits:['Source-only; no normal generation/package/installed/runtime qualification']};
writeFileSync(root+'commands/strict-01.result.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));if(r.stdout)console.log(r.stdout);if(r.stderr)console.error(r.stderr);process.exitCode=r.status??1;
