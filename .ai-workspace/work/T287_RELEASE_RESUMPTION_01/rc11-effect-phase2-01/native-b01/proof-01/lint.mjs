import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
const [recipe]=process.argv.slice(2);
const run=args=>{const r=spawnSync(process.execPath,args,{stdio:'inherit',env:process.env});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status??1);};
for(const row of JSON.parse(readFileSync(recipe)).lint.files)if(row.kind==='mjs')run(['--check',row.path]);
run(['scripts/lint-verification.mjs',recipe]);
