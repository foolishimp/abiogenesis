import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const args=['--expose-gc','--experimental-vm-modules','--test','--test-name-pattern=terminal route-only|selected replay guard|finite pure candidate|ordinary selected route|drop complete output',root+'input-02/test_env/tests/t287-route-reconstruction.test.mjs'];
const start=performance.now();const r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
writeFileSync(root+'commands/focused-02.stdout',r.stdout??'');writeFileSync(root+'commands/focused-02.stderr',r.stderr??'');
const result={kind:'runtime_selected_component_check',sourceCut:36,command:[process.execPath,...args],exitCode:r.status,signal:r.signal,elapsedMs:performance.now()-start,source:root+'inputs-02.json',limits:['Six unchanged finite conservation checks; controlled lower declaration/outcome/closure premises. No genuine structural/retry/native/Source41 installed join or capacity proof.']};
writeFileSync(root+'commands/focused-02.result.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));if(r.stdout)console.log(r.stdout);if(r.stderr)console.error(r.stderr);process.exitCode=r.status??1;
