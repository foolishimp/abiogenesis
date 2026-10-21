import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';
const root=dirname(fileURLToPath(import.meta.url));
const repo='/Users/jim/src/apps/abiogenesis';
const stage=join(repo,'.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/c0-potential-effect-successor-06/stage/build_tenants/abiogenesis/typescript');
const oldPath=join(root,'preimages/t287-worksite-command-execution.test.mjs');
const newPath=join(repo,'build_tenants/abiogenesis/typescript/test_env/tests/t287-worksite-command-execution.test.mjs');
const rawPath=join(root,'../successor05/archive/scratch-evidence/workspace/.ai-workspace/archive/fp-1d0fccf9fa2982a8-stdout.log');
const owner=join(stage,'build/code/src/abg/worker_transport.js');
const canonicalOwner=join(stage,'build/code/src/shared/canonical_json.js');
const hash=b=>createHash('sha256').update(b).digest('hex');
const inputs=[];
for(const path of [oldPath,newPath,rawPath,owner,canonicalOwner]){const b=await readFile(path);inputs.push({path,bytes:b.length,sha256:hash(b)});}
assert.equal(inputs[0].sha256,'5ad45c964c5e37d0d19504c8f085c20e0a52b68df8ac4fa9d2fa78a233517329');
assert.equal(inputs[3].sha256,'93f10c172f44646cf8ea910114dd3e99011893c782fa7d84aee1e2e5f265dccc');
const oldSource=await readFile(oldPath,'utf8'),newSource=await readFile(newPath,'utf8'),raw=await readFile(rawPath,'utf8');
function generatedLine(line){return JSON.parse(line.trim().replace(/,$/u,''));}
const finals=s=>s.split('\n').filter(l=>/type:\s*'result'/u.test(l)&&l.includes('subtype:')).map(generatedLine);
const oldFinal=finals(oldSource),newFinal=finals(newSource);assert.equal(oldFinal.length,2);assert.equal(newFinal.length,2);
const lines=raw.trimEnd().split('\n');const actualC1=JSON.parse(JSON.parse(lines.at(-1)).result);
const unchangedToolLine=newSource.split('\n').find(l=>l.includes('"const tool={type:'));const unchangedAssistantLine=newSource.split('\n').find(l=>l.includes("message:{content:[tool]}"));
assert.ok(oldSource.split('\n').includes(unchangedToolLine));assert.ok(oldSource.split('\n').includes(unchangedAssistantLine));
const controlledInput={command:'PURE_PROTOCOL_INPUT_NO_PROCESS_EXECUTION'};
const controlledHelperStdout=JSON.stringify(actualC1)+'\n';
function emit(code){let text='';vm.runInNewContext(code,{result:actualC1,helper:{stdout:controlledHelperStdout},input:controlledInput,process:{stdout:{write:s=>{text+=s;}}},console:{log:s=>{text+=s+'\n';}},JSON});return text;}
const observed={C1old:raw,C1new:lines.slice(0,-1).join('\n')+'\n'+emit(newFinal[0]),C2old:emit(generatedLine(unchangedToolLine)+'\n'+generatedLine(unchangedAssistantLine)+'\n'+oldFinal[1]),C2new:emit(generatedLine(unchangedToolLine)+'\n'+generatedLine(unchangedAssistantLine)+'\n'+newFinal[1])};
await writeFile(join(root,'carrier-check-inputs.json'),JSON.stringify({inputs,generatedFinalLines:{old:oldFinal,successor:newFinal},controlledInput,controlledHelperStdout,streams:observed,scope:'C1 old payload is retained actual output; C2 pure input/JSON stand-in and tool row are not actual effect evidence. Actual helper/tool counts remain for installed execution.'},null,2)+'\n',{flag:'wx'});
const {createWorkerTransportOutputObserver}=await import(pathToFileURL(owner).href);
const {canonicalJson}=await import(pathToFileURL(canonicalOwner).href);
const results={};
for(const [name,stream] of Object.entries(observed)){const o=createWorkerTransportOutputObserver(true);o.observe(stream);results[name]=o.finish();}
await writeFile(join(root,'carrier-check-observations.json'),JSON.stringify(results,null,2)+'\n',{flag:'wx'});
assert.equal(results.C1old.finalOutput,'');assert.equal(results.C2old.finalOutput,'');
assert.equal(results.C1new.finalOutput,canonicalJson(actualC1));assert.equal(results.C2new.finalOutput,canonicalJson(actualC1));
assert.equal(results.C1old.toolCallCount,0);assert.equal(results.C1new.toolCallCount,0);
assert.equal(results.C2old.toolCallCount,1);assert.equal(results.C2new.toolCallCount,1);
assert.deepEqual(results.C2new.toolInvocations,results.C2old.toolInvocations);
assert.equal(results.C2new.toolInvocations[0].toolName,'Bash');
console.log(JSON.stringify({passed:true,finiteCases:4,oldMissingOutput:true,newCanonicalValues:true,C1tools:0,C2tools:1,scope:'pure carrier correspondence only; no subprocess/helper/Public invocation'}));
