import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url))),sha=b=>createHash('sha256').update(b).digest('hex');
const pin=async path=>{const b=await readFile(path);return{path,bytes:b.length,sha256:sha(b)};};
const checked=async p=>{const b=await readFile(p.path);if(b.length!==p.bytes||sha(b)!==p.sha256)throw Error('Pin differs: '+p.path);return b;};
const keep=(name,value)=>writeFile(join(root,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const input=JSON.parse(await readFile(join(root,'INPUTS.json'),'utf8')),correction=JSON.parse(await readFile(join(root,'ROOT_ENV_CORRECTION.json'),'utf8'));
const tenant=join(root,'stage',input.tenantRelativePath),started=performance.now();
const report={kind:'root_affected_proof_finite_environment_reentry',status:'started',startedUtc:new Date().toISOString(),subject:input.subject,resources:input.resourceManifest,source397Digest:input.source397Digest,correction:await pin(join(root,'ROOT_ENV_CORRECTION.json')),compileReused:correction.compileReused,commands:[],timings:{},limits:input.limits};
const fatal=r=>r.timedOut||r.truncated||r.failure!==null||r.signal!==null;
const tally=(text,key)=>{const m=[...text.matchAll(new RegExp('^# '+key+' (\\d+)$','gm'))].at(-1);return m?Number(m[1]):null;};
function tap(r,lane){const passed=[...r.stdout.matchAll(/^\s*ok \d+ - (.*)$/gm)].map(m=>m[1]),skips=passed.filter(n=>n.includes('# SKIP')).map(n=>n.split(/\s+# SKIP/)[0]);return {tests:tally(r.stdout,'tests'),pass:tally(r.stdout,'pass'),fail:tally(r.stdout,'fail'),cancelled:tally(r.stdout,'cancelled'),skipped:tally(r.stdout,'skipped'),todo:tally(r.stdout,'todo'),failedNames:[...r.stdout.matchAll(/^\s*not ok \d+ - (.*)$/gm)].map(m=>m[1]),passedNames:passed.filter(n=>!n.includes('# SKIP')),skippedNames:skips,declaredSkipPredicate:skips.length===(tally(r.stdout,'skipped')??-1)&&skips.every(n=>(lane.allowedHistoricalSkippedTests??[]).includes(n)),allowedHistoricalSkippedTests:lane.allowedHistoricalSkippedTests??[]};}
try {
 await checked(correction.resumeControl);for(const p of input.runnerDependencies)await checked(p);for(const p of correction.configPins)await checked(p);
 for(const row of input.source397.concat(input.resources,[input.harness]))await checked({...row,path:join(root,'stage',row.relativePath)});
 const {commandRecorder}=await import(pathToFileURL(input.runnerDependencies[0].path).href);
 const environment={...correction.originalEnvironment,...correction.replacementEnvironmentFields};report.environment=environment;
 const command=commandRecorder(root,{environment,maxOutputBytes:64*1024*1024});
 const run=async(label,args,timeoutMs,lane)=>{const r=await command(label,process.execPath,args,{cwd:tenant,environment,timeoutMs});const row={label,request:await pin(join(root,'commands',label+'.request.json')),result:await pin(join(root,'commands',label+'.result.json')),stdout:await pin(join(root,'commands',label+'.stdout')),stderr:await pin(join(root,'commands',label+'.stderr')),exitCode:r.exitCode,signal:r.signal,timedOut:r.timedOut,truncated:r.truncated,failure:r.failure,wallMs:r.wallMs};if(lane)row.tap=tap(r,lane);report.commands.push(row);report.timings[label+'Ms']=r.wallMs;await keep('reports/'+label+'.json',row);console.log(JSON.stringify({label,exitCode:r.exitCode,wallMs:r.wallMs,timedOut:r.timedOut,truncated:r.truncated,counts:row.tap&&{tests:row.tap.tests,pass:row.tap.pass,fail:row.tap.fail,skipped:row.tap.skipped,cancelled:row.tap.cancelled,declaredSkipPredicate:row.tap.declaredSkipPredicate}}));return {r,row};};
 for(const [label,args,budget] of [['generate-env-01',['scripts/generate-product-manifest.mjs'],180000],['lifecycle',['scripts/check-lifecycle-boundary.mjs'],60000]]){const {r}=await run(label,args,budget);if(fatal(r)||r.exitCode!==0)throw Error('Build phase stopped: '+label);}
 report.generatedManifest=await pin(join(tenant,'product-toolchain-manifest.json'));const changes=[];
 for(const row of input.source397){const p=await pin(join(root,'stage',row.relativePath));if(p.sha256!==row.sha256||p.bytes!==row.bytes)changes.push({relativePath:row.relativePath,before:row,after:p});}
 report.source397ChangesDuringBuild=changes;await keep('reports/BUILD_RELATION.json',{subject:input.subject,source397Digest:input.source397Digest,source397ChangesDuringBuild:changes,generatedManifest:report.generatedManifest,compileReused:correction.compileReused,generation:report.commands[0],lifecycle:report.commands[1]});
 if(changes.length)throw Error('Selected frozen source changed during canonical generation');
 for(const lane of input.lanes){const {r,row}=await run(lane.id,['--experimental-vm-modules','--test','--test-concurrency=1','--test-reporter=tap',...lane.files],lane.timeoutMs,lane);if(fatal(r)||row.tap.tests===null||row.tap.cancelled!==0||/FATAL ERROR:|heap out of memory|ENOSPC|EMFILE/.test(r.stderr+'\n'+r.stdout))throw Error('Host/resource execution failure: '+lane.id);}
 report.status='AFFECTED_LANES_COMPLETED_NO_ACCEPTANCE';
} catch(error){report.status='STOPPED_WITH_PRESERVED_PARTIAL_EVIDENCE';report.error=String(error);process.exitCode=1;}
report.endedUtc=new Date().toISOString();report.timings.reentryTotalMs=performance.now()-started;await keep('reports/REENTRY_RESULT.json',report);console.log(JSON.stringify({status:report.status,error:report.error??null,reentryTotalMs:report.timings.reentryTotalMs}));
