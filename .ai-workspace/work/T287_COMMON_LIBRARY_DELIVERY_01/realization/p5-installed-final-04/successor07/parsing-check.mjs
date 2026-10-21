import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';
const root=dirname(fileURLToPath(import.meta.url));
const stage='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/c0-potential-effect-successor-06/stage/build_tenants/abiogenesis/typescript';
const config=JSON.parse(await readFile(join(root,'configuration.json'),'utf8'));
const testPath=join(config.proofPackageRoot,'test_env/tests/t287-worksite-command-execution.test.mjs');
const assemblyPath=join(stage,'build/code/src/abg/instruction_assembly.js');
const productPath=join(stage,'build/code/src/product/index.js');
const commandPath=join(stage,'build/code/src/product/worksite_command_execution.js');
const taskPath=join(root,'../successor06/archive/test-evidence/task.json');
const inputs=[];for(const path of [testPath,assemblyPath,productPath,commandPath,taskPath]){const b=await readFile(path);inputs.push({path,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')});}
assert.equal(inputs[0].sha256,config.testSha256);assert.equal(inputs[1].sha256,'1ce940846906293365be5c03b9aca1ab37d86a01b9799eff42256cdeee5084cb');assert.equal(inputs[3].sha256,'c1480f09bedaba0a9d2a329623f9c668ece6dc02d6b683639d478aebed804373');
const source=await readFile(testPath,'utf8'),assembly=await readFile(assemblyPath,'utf8'),task=JSON.parse(await readFile(taskPath,'utf8'));
const product=await import(pathToFileURL(productPath).href);
function exactFunction(text,name){const start=text.indexOf('function '+name+'(');assert.ok(start>=0,name);const end=text.indexOf('\n}',start);assert.ok(end>start,name);return text.slice(start,end+2);}
const purePlanCode=['directOccurrence','attemptRefForOccurrence','helperPlanForOccurrence'].map(n=>exactFunction(source,n)).join('\n');
const plan=vm.runInNewContext(purePlanCode+'\nhelperPlanForOccurrence(product,task,directOccurrence("pure-request-parser-07",task.programLocusRef));',{product,task});
const ownerPrompt=product.renderWorksiteCommandExecutionPrompt(task,plan);
const renderCode=exactFunction(assembly,'renderInstructionSections');
const render=vm.runInNewContext('('+renderCode+')',{canonicalJson:product.canonicalJson});
const sectionOrder=['role','evidence','task','response'];
const sections={role:{scope:'pure formatting operand, not authenticated native role'},evidence:{environmentAccess:[]},task:{ownerPrompt},response:product.worksiteCommandExecutionWorkerResultSchema(task,plan)};
const prompt=render(sectionOrder,sections);
const generatedLines=source.split('\n').map(line=>line.trim()).filter(line=>line.startsWith('"const taskSections=')||line.startsWith('"if(taskSections.length')||line.startsWith('"const taskSection=')||line.startsWith('"if(taskSection===')||line.startsWith('"const input=JSON.parse(taskSection')||line.startsWith('"if(input==='));
assert.equal(generatedLines.length,6);
const parseCode=generatedLines.map(line=>JSON.parse(line.replace(/,$/u,''))).join('\n');
const expectedInput={command:plan.toolCommand};
await writeFile(join(root,'parsing-check-inputs.json'),JSON.stringify({inputs,scope:'Pure declared-section formatting and actual Product ownerPrompt only; retained06 task is not replayed or used for07 admission; no helper/process/native assembly executed',renderCode,parseCode,sectionOrder,sections,prompt,expectedInput,oracle:{uniqueTask:'exact command input',missingTask:'expected one canonical task section',duplicateTask:'expected one canonical task section'}},null,2)+'\n',{flag:'wx'});
const cases=[['unique',prompt],['missing',render(sectionOrder.filter(n=>n!=='task'),sections)],['duplicate',prompt+'\n\n## task\n'+product.canonicalJson(sections.task)]];
const observations=cases.map(([name,text])=>{try{return {name,returned:JSON.parse(JSON.stringify(vm.runInNewContext(parseCode+'\ninput',{prompt:text}))),error:null};}catch(error){return {name,returned:null,error:{name:error.name,message:error.message}};}});
await writeFile(join(root,'parsing-check-observations.json'),JSON.stringify(observations,null,2)+'\n',{flag:'wx'});
assert.deepEqual(observations[0].returned,expectedInput);assert.equal(observations[0].error,null);
for(const o of observations.slice(1)){assert.equal(o.returned,null);assert.equal(o.error.message,'expected one canonical task section');}
console.log(JSON.stringify({passed:true,cases:3,actualProductOwnerPrompt:true,exactFrozenSectionRenderer:true,missingAndDuplicateRefused:true,helperLaunches:0,nativeAssemblyAuthenticationClaim:false}));
