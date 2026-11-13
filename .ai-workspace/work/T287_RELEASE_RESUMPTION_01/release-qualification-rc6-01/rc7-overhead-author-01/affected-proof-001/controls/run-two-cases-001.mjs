import {readFile,writeFile,mkdir,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url))),sha=b=>createHash('sha256').update(b).digest('hex');
const pin=async path=>{const b=await readFile(path);return {path,bytes:b.length,sha256:sha(b)};};
const check=async row=>{const b=await readFile(row.path);if(b.length!==row.bytes||sha(b)!==row.sha256)throw Error('Pin differs: '+row.path);return b;};
const keep=(name,value)=>writeFile(join(root,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const selection=JSON.parse(await readFile(join(root,'ROOT_SUPPLEMENTARY_SELECTION.json'),'utf8')),started=performance.now();
const result={kind:'root_exact_two_case_resource_reentry',status:'started',startedUtc:new Date().toISOString(),selection:await pin(join(root,'ROOT_SUPPLEMENTARY_SELECTION.json')),subject:selection.subject,uncoveredQualificationCarrierCases:7};
let rows;
try{
 await check(selection.control);const input=JSON.parse((await check(selection.inputs)).toString('utf8'));
 const manifest=JSON.parse((await check(selection.supplementaryManifest)).toString('utf8')),correction=JSON.parse((await check(selection.environmentCorrection)).toString('utf8'));
 for(const p of input.runnerDependencies)await check(p);for(const p of correction.configPins)await check(p);
 for(const p of selection.preservedReports)await check(p);await check(selection.generatedManifest);
 rows=input.source397.concat(input.resources,[input.harness]).map(r=>({...r,path:join(root,'stage',r.relativePath)}));for(const row of rows)await check(row);
 const [resource]=manifest.resources;if(manifest.resources.length!==1||resource.bytes!==730)throw Error('Supplementary selection differs');
 const target=join(root,'stage',resource.stageRelativePath);try{await lstat(target);throw Error('Supplementary target already exists');}catch(e){if(e.code!=='ENOENT')throw e;}
 const bytes=await check(resource);await mkdir(dirname(target),{recursive:true});await writeFile(target,bytes,{flag:'wx'});result.addedFixture=await pin(target);rows.push({...resource,path:target});
 const {commandRecorder}=await import(pathToFileURL(input.runnerDependencies[0].path).href),environment={...correction.originalEnvironment,...correction.replacementEnvironmentFields};
 const command=commandRecorder(root,{environment,maxOutputBytes:64*1024*1024});const p=manifest.proposedFiniteCommand;
 result.commandStartedUtc=new Date().toISOString();const observed=await command(p.commandLabel,p.executable,p.args,{cwd:p.cwd,environment,timeoutMs:p.timeoutMs});
 const tapRows=[...observed.stdout.matchAll(/^\s*(ok|not ok) (\d+) - (.*)$/gm)].map(m=>{const pieces=m[3].split(/\s+# SKIP(?:\s+)?/);return {outcome:m[1],number:Number(m[2]),name:pieces[0],skipped:pieces.length>1,skipReason:pieces.length>1?pieces.slice(1).join(' # SKIP '):null};});
 const selected=tapRows.filter(row=>p.selection.includes(row.name));const filtered=tapRows.filter(row=>row.skipped&&/test name does not match pattern/i.test(row.skipReason??''));
 const tally=key=>{const m=[...observed.stdout.matchAll(new RegExp('^# '+key+' (\\d+)$','gm'))].at(-1);return m?Number(m[1]):null;};
 result.command={label:p.commandLabel,executable:p.executable,args:p.args,cwd:p.cwd,timeoutMs:p.timeoutMs,exitCode:observed.exitCode,signal:observed.signal,timedOut:observed.timedOut,truncated:observed.truncated,failure:observed.failure,wallMs:observed.wallMs,request:await pin(join(root,'commands',p.commandLabel+'.request.json')),result:await pin(join(root,'commands',p.commandLabel+'.result.json')),stdout:await pin(join(root,'commands',p.commandLabel+'.stdout')),stderr:await pin(join(root,'commands',p.commandLabel+'.stderr'))};
 result.tap={tests:tally('tests'),pass:tally('pass'),fail:tally('fail'),skipped:tally('skipped'),cancelled:tally('cancelled'),todo:tally('todo')};
 result.selectedCases={requested:p.selection,observed:selected,pass:selected.filter(x=>x.outcome==='ok'&&!x.skipped).length,fail:selected.filter(x=>x.outcome==='not ok'&&!x.skipped).length,skip:selected.filter(x=>x.skipped).length,allRequestedObserved:p.selection.every(n=>selected.some(x=>x.name===n))};
 result.nameFilteredExclusions={observedRows:filtered,observedCount:filtered.length,meaning:'These are name-filter exclusions only and carry no source-declared skip or pass credit. If Node omits excluded cases from TAP, no excluded count is inferred from the TAP tally.'};
 result.otherReportedRows=tapRows.filter(row=>!p.selection.includes(row.name)&&!filtered.includes(row));
 result.status=observed.exitCode===0&&!observed.timedOut&&!observed.truncated&&observed.signal===null&&observed.failure===null&&result.selectedCases.pass===2&&result.selectedCases.fail===0&&result.selectedCases.skip===0&&result.selectedCases.allRequestedObserved?'SELECTED_TWO_CASES_PASSED_NO_ACCEPTANCE':'STOPPED_WITH_PRESERVED_SELECTED_FAILURE';
}catch(error){result.status='STOPPED_WITH_PRESERVED_PARTIAL_EVIDENCE';result.error=String(error);process.exitCode=1;}
if(rows){const changes=[];for(const row of rows){try{await check(row);}catch(e){changes.push({relativePath:row.relativePath,error:String(e)});}}result.afterEquality={checked:rows.length,changes};if(changes.length)result.status='STOPPED_WITH_POST_PROOF_INPUT_CHANGE';}
result.endedUtc=new Date().toISOString();result.totalMs=performance.now()-started;result.limits=selection.limits;await keep('reports/TWO_CASE_REENTRY.json',result);console.log(JSON.stringify({status:result.status,selected:result.selectedCases,tap:result.tap,nameFilteredExclusions:result.nameFilteredExclusions?.observedCount,wallMs:result.command?.wallMs,afterEquality:result.afterEquality,error:result.error??null}));
