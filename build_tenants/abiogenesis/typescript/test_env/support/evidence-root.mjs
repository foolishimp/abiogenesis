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
