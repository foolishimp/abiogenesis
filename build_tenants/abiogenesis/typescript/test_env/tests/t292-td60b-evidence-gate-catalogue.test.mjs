// T-292 TD-60: the evidence gate catalogue and the code that reads it agree.
// Needs no evidence root. With ABI5_EVIDENCE_ROOT set, the same file also
// checks every input the catalogue pins (verifyEvidenceGateCatalogue).
import assert from 'node:assert/strict';
import test from 'node:test';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {verifyEvidenceGateCatalogue} from '../support/evidence-root.mjs';

const testEnv=fileURLToPath(new URL('..',import.meta.url));
const catalogue=join(testEnv,'support/evidence-gates.json');
const rows=JSON.parse(readFileSync(catalogue,'utf8')).gates;
// Run outputs, downstream copies and retained evidence are not test code.
const notCode=new Set(['test_runs','downstream','evidence','node_modules']);
function sources(dir) {
  return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const path=join(dir,entry.name);
    if(entry.isDirectory())return dir===testEnv&&notCode.has(entry.name)?[]:sources(path);
    return /\.(mjs|js)$/u.test(entry.name)?[{path,text:readFileSync(path,'utf8')}]:[];
  });
}
const code=sources(testEnv);
const calls=new Map();
for(const {path,text} of code)
  for(const [,,name] of text.matchAll(/evidenceGate\(\s*(['"])([^'"]+)\1\s*\)/gu))
    calls.set(name,[...(calls.get(name)??[]),relative(testEnv,path)]);

test('every gate row is named once and every case file it names exists',()=>{
  const names=rows.map(row=>row.gate);
  assert.deepEqual(names.filter((name,i)=>names.indexOf(name)!==i),[],'duplicated rows');
  const missing=rows.flatMap(row=>row.cases.map(c=>c.file).filter(file=>!existsSync(join(testEnv,file))).map(file=>`${row.gate}: ${file}`));
  assert.deepEqual(missing,[],'rows naming a case file that does not exist');
});

test('every evidenceGate call names a row, and every runs_with_root row is read by the code',()=>{
  const names=new Set(rows.map(row=>row.gate));
  assert.deepEqual([...calls.keys()].filter(name=>!names.has(name)),[],'evidenceGate calls naming no row');
  // A class A lane pins its inputs through evidenceInput with the literal
  // sha256 rather than calling evidenceGate; such a row counts as read when
  // every input digest it pins appears in test code.
  const pinned=row=>row.inputs?.length>0&&row.inputs.every(input=>{
    const hex=input.sha256.replace(/^sha256:/u,'');
    return code.some(({text})=>text.includes(hex));
  });
  const unread=rows.filter(row=>row.status==='runs_with_root'&&!calls.has(row.gate)&&!pinned(row)).map(row=>row.gate);
  assert.deepEqual(unread,[],'runs_with_root rows that no code reads');
});

test('with the evidence root set, every pinned input has its recorded bytes',
  {skip:!process.env.ABI5_EVIDENCE_ROOT&&'ABI5_EVIDENCE_ROOT unset; the pinned-input check reads the root'},()=>{
  const checked=verifyEvidenceGateCatalogue();
  assert.equal(checked.gates,rows.length);
});
