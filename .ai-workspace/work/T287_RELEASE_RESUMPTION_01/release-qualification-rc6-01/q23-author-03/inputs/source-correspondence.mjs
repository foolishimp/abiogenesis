// C2 input custody only. This does not implement a candidate predicate.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,lstat} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const root=process.cwd(),input=join(root,'qualification-inputs/q23-author-03');
const json=async p=>JSON.parse(await readFile(p,'utf8')),sha=b=>createHash('sha256').update(b).digest('hex');
const selected=await json(join(input,'C2_INPUTS.json')),dependencies=await json(join(input,'DEPENDENCY_SOURCE_SELECTION.json'));
const pins=new Map(selected.immutableSourcePins.map(p=>[p.relativePath,p]));
const files=[];
for(const path of [...selected.protectedSourcePaths,...selected.stagedControlPaths,...selected.expectedFutureFiles]){
 const absolute=join(root,path),stat=await lstat(absolute);assert(stat.isFile()&&!stat.isSymbolicLink(),path);
 const bytes=await readFile(absolute),row={path,bytes:bytes.length,sha256:sha(bytes)},pin=pins.get(path);
 if(pin){assert.equal(row.bytes,pin.bytes,path);assert.equal(row.sha256,pin.sha256,path);}
 files.push(row);
}
for(const pin of [...dependencies.toolchainEntryPins,...dependencies.contractSeedPins]){
 const bytes=await readFile(pin.path);assert.equal(bytes.length,pin.bytes,pin.path);assert.equal(sha(bytes),pin.sha256,pin.path);
}
await mkdir(process.env.TMPDIR,{recursive:true});
if(process.env.NPM_CONFIG_CACHE)await mkdir(process.env.NPM_CONFIG_CACHE,{recursive:true});
const out=join(root,'build_tenants/abiogenesis/typescript/test_env/test_runs/qualification-q23-author-03');
await mkdir(out,{recursive:true});
const report={kind:'q23_complete_candidate_input_correspondence',sourceCommit:selected.sourceCommit,files,
 dependencyEntryPins:[...dependencies.toolchainEntryPins,...dependencies.contractSeedPins],
 limits:['Current byte custody and protected-read-only-source correspondence only.','Mutable candidate identities are actual measured inputs, not compared to old source hashes.','Dependency entry/lock pins are not a separate whole dependency inventory attestation.']};
const bytes=Buffer.from(JSON.stringify(report,null,2)+'\n'),path=join(out,'source-correspondence.json');
await writeFile(path,bytes,{flag:'wx'});
console.log(JSON.stringify({status:'SOURCE_CORRESPONDENCE_RECORDED',files:files.length,report:{path,bytes:bytes.length,sha256:sha(bytes)}}));
