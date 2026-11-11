import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {isAbsolute,join,normalize} from 'node:path';

// Historical evidence lives outside the repository, under the one directory
// ABI5_EVIDENCE_ROOT names; a lane names each input by its path below that
// root, its sha256 and its byte count. With the variable unset the input is
// absent and the lane skips with the returned reason. With it set, the input
// must be exactly the named bytes: a missing file, another byte count or
// another digest is a failure (the owner chose a root; a wrong root is not a
// skip). The bytes are read only; nothing is written under the root.
const ROOT_VARIABLE='ABI5_EVIDENCE_ROOT';
const hexDigest=value=>{
  const hex=String(value).replace(/^sha256:/u,'');
  if(!/^[0-9a-f]{64}$/u.test(hex))throw new TypeError(`evidence input digest must be sha256 hex: ${value}`);
  return hex;
};

export function evidenceInput({path,sha256,bytes}) {
  if(typeof path!=='string'||path.length===0||isAbsolute(path)||normalize(path).startsWith('..'))
    throw new TypeError(`evidence input path must be relative to ${ROOT_VARIABLE}: ${path}`);
  if(!Number.isSafeInteger(bytes)||bytes<0)throw new TypeError(`evidence input ${path} needs its byte count`);
  const expected=hexDigest(sha256),root=process.env[ROOT_VARIABLE];
  if(!root)return {kind:'absent',reason:`${ROOT_VARIABLE} unset; requires ${path} (sha256:${expected.slice(0,12)})`};
  const absolute=join(root,path);
  let body;
  try { body=readFileSync(absolute); }
  catch(error) { throw new Error(`${ROOT_VARIABLE}=${root}: evidence input ${path} unreadable (${error.code??error.message}); expected sha256:${expected}`); }
  const actual=createHash('sha256').update(body).digest('hex');
  if(actual!==expected||body.length!==bytes)
    throw new Error(`${ROOT_VARIABLE}=${root}: evidence input ${path} differs: expected sha256:${expected} (${bytes} bytes), actual sha256:${actual} (${body.length} bytes)`);
  return {kind:'present',path:absolute,bytes:body};
}

// The gate catalogue beside this owner (evidence-gates.json) names every
// suite gate: its class, variables, cases, input and status, and for a gate
// whose input is retained under the root, each input's path, sha256 and
// bytes. A lane resolves its gate by name; the skip reason names the row.
const CATALOGUE=new URL('./evidence-gates.json',import.meta.url);
const CLASSES=new Set(['A','B','C','D']);
let catalogue;
function gateRows() {
  if(catalogue)return catalogue;
  const body=JSON.parse(readFileSync(CATALOGUE,'utf8'));
  if(body.kind!=='abi5_evidence_gate_catalogue'||body.schemaVersion!=='1'||body.rootVariable!==ROOT_VARIABLE)
    throw new TypeError(`evidence gate catalogue ${CATALOGUE.pathname} has an unknown kind or schema`);
  const rows=new Map();
  for(const row of body.gates) {
    if(rows.has(row.gate))throw new TypeError(`evidence gate ${row.gate} appears twice`);
    if(!CLASSES.has(row.class)||!Object.hasOwn(body.statuses,row.status))throw new TypeError(`evidence gate ${row.gate} has class ${row.class}, status ${row.status}`);
    rows.set(row.gate,row);
  }
  return catalogue=rows;
}

// Present: {kind:'present', gate, inputs:{<name>:{path, bytes}}}, each input
// read through evidenceInput. Absent: {kind:'absent', reason}, the reason
// starting `evidence gate <name>:`. A gate whose status is not
// runs_with_root is absent with its status. An unknown name is an error.
export function evidenceGate(name) {
  const row=gateRows().get(name);
  if(!row)throw new TypeError(`evidence gate ${name} is not in ${CATALOGUE.pathname}`);
  if(row.status!=='runs_with_root')return {kind:'absent',reason:`evidence gate ${name}: ${row.status.replaceAll('_',' ')}; requires ${row.input}`};
  const inputs={};
  for(const input of row.inputs) {
    const resolved=evidenceInput(input);
    if(resolved.kind==='absent')return {kind:'absent',reason:`evidence gate ${name}: ${resolved.reason}`};
    inputs[input.name]={path:resolved.path,bytes:resolved.bytes};
  }
  return {kind:'present',gate:name,inputs};
}

// Checks every root input the catalogue pins, whatever its row's status:
// path, sha256 and bytes under the root. Requires the root; a missing or
// different input throws (evidenceInput). Run from the package root:
//   ABI5_EVIDENCE_ROOT=<root> node -e "import('./test_env/support/evidence-root.mjs').then(m=>console.log(m.verifyEvidenceGateCatalogue()))"
export function verifyEvidenceGateCatalogue() {
  if(!process.env[ROOT_VARIABLE])throw new Error(`${ROOT_VARIABLE} unset; the catalogue check reads every pinned input`);
  const checked=new Map();
  let rows=0;
  for(const row of gateRows().values()) {
    if(!row.inputs?.length)continue;
    rows++;
    for(const input of row.inputs) {
      const prior=checked.get(input.path);
      if(prior){if(prior.sha256!==input.sha256||prior.bytes!==input.bytes)throw new Error(`evidence gate ${row.gate}: ${input.path} pinned twice with different digests`);continue;}
      evidenceInput(input);
      checked.set(input.path,input);
    }
  }
  return {gates:gateRows().size,rowsWithInputs:rows,inputsChecked:checked.size};
}
