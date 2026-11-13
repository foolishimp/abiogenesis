// Root-only capture of the same two application commands for either reviewed arm.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join,relative} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const D=dirname(fileURLToPath(import.meta.url)),[arm,worksite,expected]=process.argv.slice(2),hash=b=>createHash('sha256').update(b).digest('hex');
assert(['direct','abg'].includes(arm));const bytes=await readFile(join(D,'EXTERNAL_CHECKS.json'));assert.equal(hash(bytes),expected);const c=JSON.parse(bytes);
const root=await realpath(worksite);assert.equal(root,worksite);if(arm==='direct')assert.equal(root,c.directRoot);else assert(root.startsWith(c.abgArchiveRoot+'/basic-cli/')&&root.endsWith('/sandbox/worksite'),'Actual Root-selected ABG worksite required');
for(const r of [c.runner,c.node]){const b=await readFile(r.path);assert.equal(b.length,r.bytes);assert.equal(hash(b),r.sha256);}
const sourcePins=async()=>{for(const s of c.initialApplicationFiles)assert.equal(hash(await readFile(join(root,s.path))),s.source.sha256,s.path);};await sourcePins();
const environment=Object.fromEntries(c.environmentKeys.filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));Object.assign(environment,c.literalEnvironment);
const output=join(D,'external-checks-'+arm);await mkdir(output);
const {commandRecorder}=await import(pathToFileURL(c.runner.path).href);const record=commandRecorder(output,{environment,maxOutputBytes:16777216});const results=[];
for(const cmd of c.commands){const result=await record(cmd.label,c.node.path,cmd.args,{cwd:root,environment,timeoutMs:cmd.timeoutMs});results.push({label:cmd.label,exitCode:result.exitCode,signal:result.signal,wallMs:result.wallMs,timedOut:result.timedOut,truncated:result.truncated,failure:result.failure});}
await sourcePins();const artifacts=[];for(const path of c.requiredArtifacts){try{const b=await readFile(join(root,path));artifacts.push({path,bytes:b.length,sha256:hash(b)});}catch(e){if(e.code!=='ENOENT')throw e;artifacts.push({path,absent:true});}}
await writeFile(join(output,'EXTERNAL_RETURN.json'),JSON.stringify({arm,worksite:root,results,inputBytesPreserved:true,artifacts,assessment:'PENDING independent symmetric content/stdout/test-output judgment; process exit is not acceptance; no admitted event fabricated'},null,2)+'\n',{flag:'wx'});
process.exitCode=results.every(r=>r.exitCode===0&&!r.timedOut&&!r.truncated&&!r.failure)?0:1;
