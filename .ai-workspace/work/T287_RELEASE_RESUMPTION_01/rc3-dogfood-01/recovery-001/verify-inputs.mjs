import assert from 'node:assert/strict';
import {readFile,lstat,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
export const root=new URL('.',import.meta.url).pathname;
export const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export const json=async path=>JSON.parse(await readFile(path,'utf8'));
export async function verifyInputs(){
 const manifest=await json(join(root,'INPUT_MANIFEST.json'));
 for(const pin of manifest.files){const path=join(root,pin.path),s=await lstat(path);assert(s.isFile()&&!s.isSymbolicLink(),pin.path);const b=await readFile(path);assert.equal(b.length,pin.bytes,pin.path);assert.equal(sha(b),pin.sha256,pin.path);}
 const config=await json(join(root,'config.json'));
 assert.equal('sha256:'+sha(await readFile(config.frozenArtifact.artifactPath)),config.frozenArtifact.artifactSha256,'runtime archive changed');
 const payload=await json(join(root,'installed-payload.json'));
 for(const pin of payload.members){const path=join(payload.installedRoot,pin.path),s=await lstat(path);assert(s.isFile()&&!s.isSymbolicLink(),pin.path);const b=await readFile(path);assert.equal(b.length,pin.bytes,pin.path);assert.equal(sha(b),pin.sha256,pin.path);}
 for(const pin of Object.values(config.executables)){assert.equal(await realpath(pin.configuredPath),pin.realPath);const b=await readFile(pin.realPath);assert.equal(b.length,pin.bytes);assert.equal(sha(b),pin.sha256);}
 assert.equal(config.provider.enabled,true);
 return config;
}
