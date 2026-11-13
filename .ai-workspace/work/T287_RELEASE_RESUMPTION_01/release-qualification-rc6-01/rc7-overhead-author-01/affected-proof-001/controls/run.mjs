import { readFile, writeFile, mkdir, cp, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const sha=b=>createHash('sha256').update(b).digest('hex');
const pin=async path=>{const bytes=await readFile(path);return {path,bytes:bytes.length,sha256:sha(bytes)};};
const keep=async(name,value)=>writeFile(join(root,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const input=JSON.parse(await readFile(join(root,'INPUTS.json'),'utf8'));
const started=performance.now(),stage=join(root,'stage'),tenant=join(stage,input.tenantRelativePath),scratch='/private/tmp/abg-o7p';
const report={kind:'root_affected_frozen_source_proof',status:'started',startedUtc:new Date().toISOString(),subject:input.subject,resourceManifest:input.resourceManifest,source397Digest:input.source397Digest,input:await pin(join(root,'INPUTS.json')),commands:[],timings:{},limits:input.limits};
async function checked(p){const b=await readFile(p.path);if(b.length!==p.bytes||sha(b)!==p.sha256)throw Error('Selected bytes differ: '+p.path);return b;}
async function copySelected(row){const dest=join(stage,row.relativePath);await mkdir(dirname(dest),{recursive:true});await writeFile(dest,await checked(row),{flag:'wx'});}
const failure=r=>r.timedOut||r.truncated||r.failure!==null||r.signal!==null;
const tally=(text,key)=>{const m=[...text.matchAll(new RegExp('^# '+key+' (\\d+)$','gm'))].at(-1);return m?Number(m[1]):null;};
function testSummary(r,lane){const passed=[...r.stdout.matchAll(/^\s*ok \d+ - (.*)$/gm)].map(m=>m[1]);const skips=passed.filter(n=>n.includes('# SKIP')).map(n=>n.split(/\s+# SKIP/)[0]);return {tests:tally(r.stdout,'tests'),pass:tally(r.stdout,'pass'),fail:tally(r.stdout,'fail'),cancelled:tally(r.stdout,'cancelled'),skipped:tally(r.stdout,'skipped'),todo:tally(r.stdout,'todo'),failedNames:[...r.stdout.matchAll(/^\s*not ok \d+ - (.*)$/gm)].map(m=>m[1]),passedNames:passed.filter(n=>!n.includes('# SKIP')),skippedNames:skips,declaredSkipPredicate:skips.length===(tally(r.stdout,'skipped')??-1)&&skips.every(n=>(lane.allowedHistoricalSkippedTests??[]).includes(n)),allowedHistoricalSkippedTests:lane.allowedHistoricalSkippedTests??[]};}
try {
  await checked(input.control);for(const p of input.runnerDependencies)await checked(p);
  const {commandRecorder}=await import(pathToFileURL(input.runnerDependencies[0].path).href);
  await mkdir(stage);await mkdir(scratch);await mkdir(join(root,'reports'));
  for(const row of input.source397)await copySelected(row);
  for(const row of input.resources)await copySelected(row);
  await copySelected(input.harness);
  for(const p of [...input.dependencies.toolchainEntryPins,...input.dependencies.contractSeedPins])await checked(p);
  await cp(input.dependencies.toolchainRoot,join(tenant,'node_modules'),{recursive:true,verbatimSymlinks:true});
  await cp(input.dependencies.contractSeedRoot,join(tenant,'contracts'),{recursive:true});
  await mkdir(join(tenant,'artifacts'),{recursive:true});
  const environment={PATH:dirname(process.execPath)+':/usr/bin:/bin:/usr/sbin:/sbin',TMPDIR:scratch,TMPPREFIX:scratch+'/zsh',LANG:'en_US.UTF-8',LC_ALL:'en_US.UTF-8',NPM_CONFIG_CACHE:scratch+'/npm-cache',NPM_CONFIG_USERCONFIG:'/dev/null',NPM_CONFIG_GLOBALCONFIG:'/dev/null',NPM_CONFIG_UPDATE_NOTIFIER:'false',NPM_CONFIG_OFFLINE:'true',ABI5_UAT_UNIT_ROOT:scratch+'/uat-units'};
  report.environment=environment;report.node=await pin(process.execPath);report.timings.setupMs=performance.now()-started;
  await keep('reports/STAGE.json',{stage,tenant,sourceCount:397,sourceDigest:input.source397Digest,resources:50,addedHarness:1,copyCount:448,sourceSelection:input.subject,resourceSelection:input.resourceManifest,harness:input.harness,setupMs:report.timings.setupMs,dependencies:input.dependencySelection});
  const command=commandRecorder(root,{environment,maxOutputBytes:64*1024*1024});
  const run=async(label,args,timeoutMs,lane)=>{const r=await command(label,process.execPath,args,{cwd:tenant,environment,timeoutMs});const row={label,request:await pin(join(root,'commands',label+'.request.json')),result:await pin(join(root,'commands',label+'.result.json')),stdout:await pin(join(root,'commands',label+'.stdout')),stderr:await pin(join(root,'commands',label+'.stderr')),exitCode:r.exitCode,signal:r.signal,timedOut:r.timedOut,truncated:r.truncated,failure:r.failure,wallMs:r.wallMs};if(lane)row.tap=testSummary(r,lane);report.commands.push(row);report.timings[label+'Ms']=r.wallMs;await keep('reports/'+label+'.json',row);console.log(JSON.stringify({label,exitCode:r.exitCode,wallMs:r.wallMs,timedOut:r.timedOut,truncated:r.truncated,counts:row.tap&&{tests:row.tap.tests,pass:row.tap.pass,fail:row.tap.fail,skipped:row.tap.skipped,cancelled:row.tap.cancelled,declaredSkipPredicate:row.tap.declaredSkipPredicate}}));return {r,row};};
  for(const [label,args,budget] of [['compile',['node_modules/typescript/bin/tsc','-p','tsconfig.json'],240000],['generate',['scripts/generate-product-manifest.mjs'],180000],['lifecycle',['scripts/check-lifecycle-boundary.mjs'],60000]]){const {r}=await run(label,args,budget);if(failure(r)||r.exitCode!==0)throw Error('Build phase stopped: '+label);}
  report.generatedManifest=await pin(join(tenant,'product-toolchain-manifest.json'));
  const after=[];for(const row of input.source397){const p=await pin(join(stage,row.relativePath));if(p.sha256!==row.sha256||p.bytes!==row.bytes)after.push({relativePath:row.relativePath,before:{bytes:row.bytes,sha256:row.sha256},after:p});}
  report.source397ChangesDuringBuild=after;
  await keep('reports/BUILD_RELATION.json',{subject:input.subject,source397Digest:input.source397Digest,source397ChangesDuringBuild:after,generatedManifest:report.generatedManifest,commands:report.commands});
  for(const lane of input.lanes){const {r,row}=await run(lane.id,['--experimental-vm-modules','--test','--test-concurrency=1','--test-reporter=tap',...lane.files],lane.timeoutMs,lane);if(failure(r)||row.tap.tests===null||row.tap.cancelled!==0||/FATAL ERROR:|heap out of memory|ENOSPC|EMFILE|EACCES|EPERM/.test(r.stderr+'\n'+r.stdout))throw Error('Host/resource execution failure: '+lane.id);}
  report.status='AFFECTED_LANES_COMPLETED_NO_ACCEPTANCE';
} catch(error){report.status='STOPPED_WITH_PRESERVED_PARTIAL_EVIDENCE';report.error=String(error);process.exitCode=1;}
report.endedUtc=new Date().toISOString();report.timings.totalMs=performance.now()-started;await keep('reports/RESULT.json',report);console.log(JSON.stringify({status:report.status,error:report.error??null,totalMs:report.timings.totalMs}));
