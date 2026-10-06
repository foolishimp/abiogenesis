// Bounded caller evidence consumer. Source-linked current owner protocol;
// this does not construct F11 material or confer qualification authority.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {join,resolve,relative,isAbsolute} from 'node:path';
import {createRequire} from 'node:module';
const keys=x=>Object.keys(x).sort();
// Source-derived caller binding, not native admission. The caller must supply the
// successful supported observation; the existing Product predicates retain its
// task/attempt/plan and artifact identities before any physical output read.
async function canonicalOutputFile(root,relativePath){
 assert.equal(typeof relativePath,'string');assert.ok(relativePath&&!isAbsolute(relativePath)&&!relativePath.includes('\\'));
 const path=resolve(root,relativePath),rel=relative(root,path);
 assert.ok(rel&&rel!=='..'&&!rel.startsWith('../')&&!isAbsolute(rel),'output path must stay inside its exact snapshot');
 assert.equal(rel,relativePath,'output path must retain its canonical relative identity');
 assert.equal(await fs.realpath(path),path,'output file and ancestors must not be aliases');
 assert.equal((await fs.lstat(path)).isFile(),true,'output must be a regular file');
 return fs.readFile(path);
}
export async function bindObservedOutputReader({product,task,observation}){
 assert.equal(product.isObservedWorksiteCommandExecutionObservation(observation),true,'actual installed observed-result predicate');
 assert.deepEqual(observation.task,task);
 const plan=observation.provenance.helperPlan;
 assert.equal(product.isWorksiteCommandExecutionHelperPlan(task,plan),true,'current task/attempt helper plan');
 assert.equal(observation.provenance.helperArtifactPath,plan.artifactPath);
 const archiveRoot=task.workspaceBinding.roots.archiveRoot;
 assert.equal(await fs.realpath(archiveRoot),archiveRoot,'archive root must retain canonical identity');
 const helperBytes=await canonicalOutputFile(archiveRoot,relative(archiveRoot,plan.artifactPath)),helper=JSON.parse(helperBytes);
 assert.equal(product.isWorksiteExecutionHelperArtifact(task,helper),true,'actual installed task-bound helper artifact');
 assert.equal(helperBytes.length,observation.provenance.helperArtifactByteLength);
 assert.equal(helper.artifactDigest,observation.helperArtifactDigest);assert.equal(helper.artifactRef,observation.helperArtifactRef);
 assert.equal(helper.disposition,'success');assert.equal(helper.snapshotRoot,plan.sandboxRoot,'artifact snapshot belongs to the retained task/attempt plan');
 for(const key of ['snapshotRef','snapshotDigest','snapshotMembers','commandResults','predicateObservations','worksiteDelta','productDelta'])assert.deepEqual(helper[key],observation[key]);
 const outputRoot=helper.snapshotRoot;
 assert.notEqual(outputRoot,task.workspaceAuthorityBasis.canonicalRoot,'snapshot output and protected worksite remain separate');
 assert.equal(await fs.realpath(outputRoot),outputRoot,'snapshot root must retain canonical identity');
 assert.equal((await fs.lstat(outputRoot)).isDirectory(),true);
 return Object.freeze({helper,outputRoot,readOutput:relativePath=>canonicalOutputFile(outputRoot,relativePath)});
}
export function makeOutputChecks({product,installedRoot}){
 const v=createRequire(join(installedRoot,'package.json'))('valibot'),count=v.pipe(v.number(),v.integer(),v.minValue(0)),text=v.pipe(v.string(),v.minLength(1));
 const testRow=v.variant('type',[
  v.strictObject({ordinal:count,type:v.literal('begin'),format:v.literal('node-test-events-jsonl@1'),nodeVersion:text}),
  v.strictObject({ordinal:count,type:v.literal('end')}),
  v.strictObject({ordinal:count,type:v.literal('case'),passed:v.boolean(),name:text,file:v.nullable(text),nesting:count,testNumber:count,suite:v.boolean(),skip:v.union([v.boolean(),v.string()]),todo:v.union([v.boolean(),v.string()]),error:v.nullable(v.unknown())}),
  v.strictObject({ordinal:count,type:v.literal('summary'),file:v.nullable(text),counts:v.object({tests:count,passed:count,failed:count,cancelled:count,skipped:count,todo:count,suites:count,topLevel:count}),success:v.boolean(),durationMs:v.pipe(v.number(),v.minValue(0))})]);
 const lintSchema=v.strictObject({kind:v.literal('qualification_syntax_lint'),schemaVersion:v.literal('1'),passed:v.boolean(),files:v.array(v.strictObject({path:text,kind:v.picklist(['mjs','json']),disposition:v.picklist(['passed','failed']),diagnostic:v.nullable(text)}))});
 const stream=s=>{const b=Buffer.from(s.payload,'base64');assert.equal(b.toString('base64'),s.payload);assert.equal(b.length,s.byteLength);assert.equal(product.sha256Bytes(b),s.digest);return new TextDecoder('utf-8',{fatal:true}).decode(b);};
 const processPassed=c=>{assert.equal(c.exitStatus,0,c.commandId);assert.equal(c.timedOut,false);assert.equal(c.processSignal,null);assert.deepEqual(c.signalSequence,[]);assert.equal(c.terminationConfirmed,true);};
 async function consume({value,task,recipe,selection,expected,protectedInputs,write,mark}){
  assert.equal(value.disposition,'completed');assert.equal(value.stop,null);const terminal=value.terminalResult;assert.equal(terminal.kind,'abg_typed_terminal_result');assert.equal(terminal.producer.runRef,value.run.ref);assert.equal(terminal.valueDigest,product.sha256Canonical(terminal.value));const o=terminal.value;
  assert.equal(product.isObservedWorksiteCommandExecutionObservation(o),true,'actual installed observed-result predicate');assert.deepEqual(o.task,task);assert.equal(o.task.sourceObservedInput.sourceSetDigest,product.sha256Canonical(task.protectedObservations));mark('typed terminal/current producer/task/source-set');
  const {helper,outputRoot,readOutput}=await bindObservedOutputReader({product,task,observation:o});assert.deepEqual(helper.commandResults,o.commandResults);assert.deepEqual(helper.predicateObservations,o.predicateObservations);assert.deepEqual(helper.protectedBefore,task.protectedObservations.map(x=>x.observation));assert.deepEqual(helper.protectedAfter,helper.protectedBefore);assert.ok(Array.isArray(protectedInputs)&&protectedInputs.length>0);assert.equal(helper.protectedBefore.length,protectedInputs.length);const actualProtected=task.protectedObservations.map(p=>({path:p.subject.relativePath,digest:p.observation.fileDigest,bytes:p.observation.byteLength})).sort((a,b)=>a.path.localeCompare(b.path));const expectedProtected=protectedInputs.map(p=>({path:p.target,digest:"sha256:"+p.sha256,bytes:p.bytes})).sort((a,b)=>a.path.localeCompare(b.path));assert.deepEqual(actualProtected,expectedProtected);assert.deepEqual(o.productDelta,[]);assert.ok(o.worksiteDelta.every(d=>d.matchedTerritoryRef!==null));await write('helper-observation.json',helper);mark('actual helper/exact declared protected before-after/product conservation');
  assert.equal(o.commandResults.length,recipe.commands.length);assert.equal(o.predicateObservations.length,task.outcomePredicates.length);const commands=[];
  for(let i=0;i<recipe.commands.length;i++){const c=o.commandResults[i],d=task.commands[i];for(const k of ['ordinal','commandId','executable','args','relativeCwd','environment','timeoutMs','terminationGraceMs'])assert.deepEqual(c[k],d[k]);processPassed(c);const stdout=stream(c.stdout),stderr=stream(c.stderr);await write('command-'+String(i).padStart(2,'0')+'-streams.json',{commandId:c.commandId,stdout,stderr,stdoutObservation:c.stdout,stderrObservation:c.stderr});for(const r of c.reports){assert.equal(r.state,'file');const bytes=await readOutput(r.relativePath);assert.equal(bytes.length,r.byteLength);assert.equal(product.sha256Bytes(bytes),r.digest);}commands.push({commandId:c.commandId,exitStatus:c.exitStatus,stdoutDigest:c.stdout.digest,stderrDigest:c.stderr.digest,reports:c.reports});mark('command '+i+' '+c.commandId);}
  for(let i=0;i<task.outcomePredicates.length;i++){const p=task.outcomePredicates[i],actual=o.predicateObservations[i];assert.equal(actual.ordinal,i);assert.equal(actual.predicateId,p.predicateId);assert.equal(actual.predicateKind,p.predicateKind);assert.ok(['process_exit','stdout_exact'].includes(p.predicateKind));assert.deepEqual(actual.observedValue,p.declaration.equals);mark('predicate '+i);}
  const tests=[];for(const t of recipe.tests){const c=o.commandResults.find(x=>x.commandId===t.commandId),s=selection.tests.find(x=>x.commandId===t.commandId);assert.ok(c&&s);const raw=stream(c.stdout);assert.ok(raw.endsWith('\n'));const rows=raw.slice(0,-1).split('\n').map(l=>v.parse(testRow,JSON.parse(l)));assert.ok(rows.length>=3);assert.equal(rows[0].type,'begin');assert.equal(rows.at(-1).type,'end');rows.forEach((r,i)=>{assert.equal(r.ordinal,i);if(r.type==='begin')assert.equal(i,0);if(r.type==='end')assert.equal(i,rows.length-1);});const summaries=rows.filter(r=>r.type==='summary'),global=summaries.filter(r=>r.file===null),perFile=summaries.filter(r=>r.file!==null),cases=rows.filter(r=>r.type==='case'),leaves=cases.filter(r=>!r.suite);assert.equal(global.length,1);assert.strictEqual(rows.at(-2),global[0]);assert.equal(new Set(perFile.map(s=>s.file)).size,perFile.length);assert.deepEqual(perFile.map(s=>s.file).sort(),[...t.files].sort());assert.deepEqual([...new Set(cases.flatMap(c=>c.file===null?[]:[c.file]))].sort(),[...t.files].sort());assert.deepEqual(leaves.map(c=>c.name).sort(),[...s.selectedTitles].sort());assert.equal(leaves.length,s.expectedTestCount);assert.ok(leaves.every(c=>c.passed&&!c.skip&&!c.todo&&c.error===null));assert.ok(summaries.every(s=>s.success));const n=global[0].counts;assert.equal(n.tests,leaves.length);assert.equal(n.passed,leaves.length);for(const k of ['failed','cancelled','skipped','todo'])assert.equal(n[k],0);assert.equal(n.suites,cases.filter(c=>c.suite).length);for(const k of ['tests','passed','failed','cancelled','skipped','todo','suites'])assert.equal(perFile.reduce((sum,s)=>sum+s.counts[k],0),n[k]);tests.push({commandId:t.commandId,counts:n,files:t.files,cases,summaries});mark('strict test report '+t.commandId);}
  assert.equal(tests.reduce((n,t)=>n+t.counts.tests,0),selection.totalSelectedTitles);
  const lintCommand=o.commandResults.find(c=>c.commandId===recipe.lint.commandId),lint=v.parse(lintSchema,JSON.parse(stream(lintCommand.stdout)));assert.deepEqual(lint.files.map(({path,kind})=>({path,kind})),recipe.lint.files);assert.equal(new Set(lint.files.map(f=>f.path)).size,lint.files.length);assert.equal(lint.passed,true);assert.ok(lint.files.every(f=>f.disposition==='passed'&&f.diagnostic===null));mark('strict syntax lint full population');
  const comparison=JSON.parse(await readOutput('verification/reports/generated-comparison.json'));assert.deepEqual(keys(comparison),['actualCount','basisInventorySha256','changed','equal','expectedCount','extra','kind','missing']);assert.equal(comparison.kind,'exact_generated_comparison');assert.equal(comparison.basisInventorySha256,expected.basisInventorySha256);assert.equal(comparison.expectedCount,expected.paths.length);assert.equal(comparison.actualCount,expected.paths.length);assert.deepEqual(comparison.missing,[]);assert.deepEqual(comparison.extra,[]);assert.deepEqual(comparison.changed,[]);assert.equal(comparison.equal,true);for(const r of expected.paths){const bytes=await readOutput(join('verification',r.path));assert.equal(bytes.length,r.bytes);assert.equal(product.sha256Bytes(bytes),'sha256:'+r.sha256);}mark('complete declared output comparisons');

  const componentDescriptor=protectedInputs.find(r=>r.target==='recipe/component-stage-plan.json');assert.ok(componentDescriptor);
  const componentPlanBytes=await readOutput('recipe/component-stage-plan.json');assert.equal(componentPlanBytes.length,componentDescriptor.bytes);assert.equal(product.sha256Bytes(componentPlanBytes),'sha256:'+componentDescriptor.sha256);
  const componentPlan=JSON.parse(componentPlanBytes),componentReport=JSON.parse(await readOutput('verification/reports/component-staging.json'));
  assert.deepEqual(componentReport,{kind:'isolated_component_staging',componentRoot:componentPlan.destinationRoot,files:componentPlan.members.length,bytes:componentPlan.members.reduce((n,r)=>n+r.bytes,0),roles:componentPlan.counts,historicalCatalogSHA256:componentPlan.historicalCatalogSHA256,currentCatalogSHA256:componentPlan.currentCatalogSHA256,currentQualificationTenantOverwritten:false});
  for(const r of componentPlan.members){const bytes=await readOutput(join('verification',componentPlan.destinationRoot,r.destination));assert.equal(bytes.length,r.bytes);assert.equal(product.sha256Bytes(bytes),'sha256:'+r.sha256);}mark('all declared historical component outputs use actual helper snapshot');
  const result={status:'passed',componentReport,outputRoot,actualRun:value.run,actualProducer:terminal.producer,task:{ref:task.taskRef,digest:task.taskDigest},sourceObservedInput:task.sourceObservedInput,commands,predicates:o.predicateObservations,tests,lint,comparison,protectedObservations:protectedInputs.length,qualification:'not constructed; no executionSelectionRef/tenant basis invented'};await write('observed-output-checks.json',result);return {observation:o,checks:result};
 }
 function cold(value,reads){const rp=reads.run_result.ownerOutput.value,re=reads.run_replay.ownerOutput.value;assert.deepEqual(rp.source,value.run);assert.deepEqual(re.source,value.run);assert.deepEqual(rp.projection.terminalResult,value.terminalResult);assert.deepEqual(re.projection.terminalResult,value.terminalResult);assert.deepEqual(rp.projection.result,value.result);assert.deepEqual(rp.projection.replay,value.replay);assert.deepEqual(re.projection.replay,value.replay);assert.equal(re.projection.status,'closed');assert.equal(rp.projection.terminalResult.producer.runRef,value.run.ref);return {status:'passed',source:value.run,producer:value.terminalResult.producer,typedTerminalResultEqual:true,resultEqual:true,replayEqual:true,closed:true};}
 return {consume,cold};
}
