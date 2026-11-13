// Existing component proof only; immutable RC6 executable staging precedes this command.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const work=process.cwd(),tenant=join(work,'build_tenants/abiogenesis/typescript'),input=join(work,'qualification-inputs/fixture-01');
const manifest=JSON.parse(await readFile(join(input,'C2_INPUTS.json'),'utf8')),sha=b=>createHash('sha256').update(b).digest('hex');
await mkdir(process.env.TMPDIR,{recursive:true});
const environment={...process.env,ABI5_GENERIC_JOB_BUILD_ROOT:tenant};delete environment.ABI5_EVIDENCE_ROOT;
const child=spawnSync(process.execPath,['--experimental-vm-modules','--test','--test-concurrency=1','--test-reporter=tap',manifest.testFile],{cwd:tenant,env:environment,encoding:'utf8',timeout:600000,maxBuffer:16*1024*1024});
const stdout=child.stdout??'',stderr=child.stderr??'',out=join(tenant,'test_env/test_runs/qualification-fixture-01');await mkdir(out,{recursive:true});
await writeFile(join(out,'component.stdout.tap'),stdout,{flag:'wx'});await writeFile(join(out,'component.stderr.log'),stderr,{flag:'wx'});
const tally=k=>{const m=[...stdout.matchAll(new RegExp('^# '+k+' (\\d+)$','gm'))].at(-1);return m?Number(m[1]):null;};
const report={kind:'bounded_native_semantic_revision_component_result',exitCode:child.status,signal:child.signal,error:child.error?.message??null,tests:tally('tests'),pass:tally('pass'),fail:tally('fail'),skipped:tally('skipped'),stdoutSha256:sha(Buffer.from(stdout)),stderrSha256:sha(Buffer.from(stderr)),historicalLimits:manifest.historicalGate,claim:manifest.claim};
const failures=[];if(report.exitCode!==0||report.signal!==null||report.error!==null)failures.push('process failure');if(report.tests!==7||report.pass!==5||report.fail!==0||report.skipped!==2)failures.push('required seven-test5/0/2 population not observed');report.failures=failures;
const bytes=Buffer.from(JSON.stringify(report,null,2)+'\n'),path=join(out,'component-result.json');await writeFile(path,bytes,{flag:'wx'});
await new Promise((resolve,reject)=>process.stdout.write(JSON.stringify({status:failures.length?'FAILED':'COMPONENT_COMPLETED',report:{path,bytes:bytes.length,sha256:sha(bytes)}})+'\n',e=>e?reject(e):resolve()));
assert.equal(failures.length,0,'Selected component predicates failed: '+JSON.stringify(failures));
