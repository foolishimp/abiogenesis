#!/opt/homebrew/bin/node
// Test-only adaptation of t287-default-library SCRIPTED_ACTOR's existing report protocol.
// No provider, model, worksite write, external command or semantic qualification.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const prompt=readFileSync(0,'utf8');
const lines=prompt.split('\n').filter(x=>x.startsWith('Read first: '));
assert.equal(lines.length,1);
const paths=JSON.parse(lines[0].slice('Read first: '.length));assert.equal(paths.length,1);
const sizes={'context-1MiB.txt':1048576,'context-4MiB.txt':4194304};
assert(Object.hasOwn(sizes,paths[0]));
const body=readFileSync(resolve(process.cwd(),paths[0]));assert.equal(body.length,sizes[paths[0]]);
const args=process.argv.slice(2),at=args.indexOf('--json-schema');assert(at>=0);
const schema=JSON.parse(args[at+1]);assert(schema.properties?.summary&&schema.properties?.gaps);
const report={summary:'Read the selected fixture without changing it.',gaps:[]};
console.log(JSON.stringify({type:'system',subtype:'init'}));
console.log(JSON.stringify({type:'result',subtype:'success',is_error:false,result:JSON.stringify(report),structured_output:report}));
