// Frozen operator recipe: isolated source freeze -> offline build -> one declared serial test lane.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {cp,mkdir,readFile,writeFile,readdir,statfs,lstat,chmod} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const dir=dirname(fileURLToPath(import.meta.url)),b=JSON.parse(await readFile(join(dir,'BINDING.002.json'),'utf8'));
const {commandRecorder,exclusiveRecord}=await import(pathToFileURL(b.sourceHelpers['runner.mjs'].path));
const sha=x=>createHash('sha256').update(x).digest('hex'),root=join(b.scratchRoot,'proof'),[mode,label,laneName]=process.argv.slice(2);
const exists=async p=>{try{await lstat(p);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}};
await mkdir(root,{recursive:true});assert(!(await exists(join(root,'HALT.json'))),'Prior failed proof requires Root re-entry');
const s=await statfs(root);assert(s.bavail*s.bsize>b.reserveBytes,'Disk reserve reached');
const names=await readdir(root),stages=names.filter(n=>/^stage-\d\d$/.test(n)),lanes=names.filter(n=>/^lane-\d\d$/.test(n));
for(const n of [...stages,...lanes])assert(await exists(join(root,n,'RESULT.json')),'Prior allocation incomplete: '+n);
const env={...b.environment};for(const k of Object.keys(env))if(/CLAUDE|ANTHROPIC|OPENAI|PROVIDER/.test(k))delete env[k];
let output,results=[],sourceDigest;
try{
  if(mode==='stage'){
    assert(stages.length<b.maxStages,'Stage cap reached');const name='stage-'+String(stages.length+1).padStart(2,'0');output=join(root,name);await mkdir(output);
    const source=join(output,'source'),work=join(output,'work'),rows=[];
    const tracked=execFileSync('/usr/bin/git',['-C',b.sourceRoot,'ls-files','-v','-z']).toString().split('\0').filter(x=>x&&!x.startsWith('S ')).map(x=>x.slice(2));
    for(const rel of [...new Set([...tracked,...b.optionalNewSourceFiles])].sort()){
      const path=join(b.sourceRoot,rel);if(!(await exists(path))){assert(b.optionalNewSourceFiles.includes(rel),'Missing tracked source '+rel);continue;}
      const st=await lstat(path);assert(st.isFile(),'Non-file source '+rel);const bytes=await readFile(path);await mkdir(dirname(join(source,rel)),{recursive:true});
      await writeFile(join(source,rel),bytes,{flag:'wx'});await chmod(join(source,rel),st.mode&0o777);rows.push({path:rel,bytes:bytes.length,sha256:sha(bytes)});
    }
    sourceDigest=sha(Buffer.from(JSON.stringify(rows)));await exclusiveRecord(output,'source-freeze.json',{status:'FROZEN_BEFORE_BUILD',name,source,sourceDigest,rows});
    console.log(JSON.stringify({status:'FROZEN_BEFORE_BUILD',name,sourceDigest,freeze:join(output,'source-freeze.json')}));
    await cp(source,work,{recursive:true});const tenant=join(work,b.tenantRelative);
    for(const pin of b.dependencyPins){const bytes=await readFile(pin.path);assert.equal(sha(bytes),pin.sha256);}
    await cp(b.dependencyRoot,join(tenant,'node_modules'),{recursive:true,verbatimSymlinks:true});await cp(b.contractSeedRoot,join(tenant,'contracts'),{recursive:true});
    const command=commandRecorder(output,{environment:env,timeoutMs:b.proofTimeoutMs});
    for(const [id,args] of [['compile',['node_modules/typescript/bin/tsc','-p','tsconfig.json']],['generate',['scripts/generate-product-manifest.mjs']],['imports',['scripts/check-import-direction.mjs']],['lifecycle',['scripts/check-lifecycle-boundary.mjs']],['calculus',['scripts/check-calculus-boundary.mjs']]]){
      const r=await command(id,process.execPath,args,{cwd:tenant});results.push({id,exitCode:r.exitCode,wallMs:r.wallMs,timedOut:r.timedOut});if(r.exitCode!==0||r.timedOut||r.truncated){const error=new Error(id+' failed or incomplete');error.readinessOnly=id==='compile';throw error;}
    }
    await exclusiveRecord(output,'RESULT.json',{status:'BUILT',name,sourceDigest,tenant,results});console.log(JSON.stringify({status:'BUILT',name,sourceDigest,tenant,results}));
  }else{
    assert.equal(mode,'test','Use stage or test <stage-01..04> <lane>');assert(stages.includes(label));assert(lanes.length<b.maxProofInvocations,'Proof invocation cap reached');assert(Object.hasOwn(b.lanes,laneName),'Unknown lane');
    const stage=JSON.parse(await readFile(join(root,label,'RESULT.json'),'utf8'));assert.equal(stage.status,'BUILT');sourceDigest=stage.sourceDigest;
    const name='lane-'+String(lanes.length+1).padStart(2,'0');output=join(root,name);await mkdir(output);const lane=b.lanes[laneName];
    const args=['--experimental-vm-modules','--test','--test-concurrency=1','--test-reporter=tap',...(lane.pattern?['--test-name-pattern',lane.pattern]:[]),...lane.files.map(f=>'test_env/tests/'+f)];
    const r=await commandRecorder(output,{environment:env,timeoutMs:b.proofTimeoutMs})('test',process.execPath,args,{cwd:stage.tenant});
    const counts=Object.fromEntries(['tests','pass','fail','cancelled','skipped','todo'].map(k=>[k,Number(r.stdout.match(new RegExp('^# '+k+' (\\d+)','m'))?.[1]??NaN)]));
    assert(r.exitCode===0&&!r.timedOut&&!r.truncated&&counts.pass>0&&counts.fail===0&&counts.cancelled===0&&counts.todo===0,'Selected proof did not pass completely');
    await exclusiveRecord(output,'RESULT.json',{status:'PASSED',name,lane:laneName,stage:label,sourceDigest,counts,wallMs:r.wallMs,pattern:lane.pattern??null});
    console.log(JSON.stringify({status:'PASSED',name,lane:laneName,stage:label,sourceDigest,counts,wallMs:r.wallMs}));
  }
}catch(error){if(output)await exclusiveRecord(output,'RESULT.json',{status:error.readinessOnly?'COMPILE_READINESS_FAILED':'FAILED',sourceDigest,results,error:error.message});if(!error.readinessOnly)await exclusiveRecord(root,'HALT.json',{output,error:error.message});throw error;}
