import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const args=['--experimental-vm-modules','--test',root+'input-01/test_env/tests/t287-runtime-failure-diagnostic.test.mjs'];
const start=performance.now();const r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
writeFileSync(root+'commands/focused-01.stdout',r.stdout??'');writeFileSync(root+'commands/focused-01.stderr',r.stderr??'');
const result={kind:'runtime_selected_component_check',sourceCut:38,command:[process.execPath,...args],exitCode:r.status,signal:r.signal,elapsedMs:performance.now()-start,source:root+'inputs-01.json',limits:['Deterministic boundary diagnostic alternatives and existing failure projection/cold/tamper/legacy controls. Finite caller callbacks and controlled basis/frame/replay premises; no installed authority/Testing/C2/native or effect/currentness credit.']};
writeFileSync(root+'commands/focused-01.result.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));if(r.stdout)console.log(r.stdout);if(r.stderr)console.error(r.stderr);process.exitCode=r.status??1;
