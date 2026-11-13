// Existing finite Node test orchestration after candidate compile/generation.
// Test algorithms and qualification predicates belong only to candidate source.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const work=process.cwd(),tenant=join(work,'build_tenants/abiogenesis/typescript');
const input=JSON.parse(await readFile(join(work,'qualification-inputs/q23-identity-02/C2_INPUTS.json'),'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex'),out=join(tenant,'test_env/test_runs/qualification-q23-identity-02');
await mkdir(out,{recursive:true});await mkdir(process.env.TMPDIR,{recursive:true});
const environment={...process.env};
for(const key of ['ABI5_EVIDENCE_ROOT','ABI5_RESULT_LINEAGE_BASELINE','ABI5_RESULT_LINEAGE_REPORT','ABI5_F11_FP_ASSESSMENT_PACKET','ABI5_F11_BASELINE_TENANT','ABI5_F11_CARRIER_FULL_FIXTURE'])delete environment[key];
const lanes=[],failures=[];
for(const lane of input.lanes){
 const child=spawnSync(process.execPath,['--experimental-vm-modules','--test','--test-concurrency=1','--test-reporter=tap',...lane.files],
  {cwd:tenant,env:environment,encoding:'utf8',timeout:lane.timeoutMs,maxBuffer:16*1024*1024});
 const stdout=child.stdout??'',stderr=child.stderr??'';
 const tally=k=>{const m=[...stdout.matchAll(new RegExp('^# '+k+' (\\d+)$','gm'))].at(-1);return m?Number(m[1]):null;};
 const stdoutPath=join(out,lane.id+'.stdout.tap'),stderrPath=join(out,lane.id+'.stderr.log');
 await writeFile(stdoutPath,stdout,{flag:'wx'});await writeFile(stderrPath,stderr,{flag:'wx'});
 const result={id:lane.id,files:lane.files,exitCode:child.status,signal:child.signal,error:child.error?.message??null,
  tests:tally('tests'),pass:tally('pass'),fail:tally('fail'),skipped:tally('skipped'),cancelled:tally('cancelled'),todo:tally('todo'),
  sourceDeclaredMinimumTests:lane.minimumTests,
  stdout:{path:stdoutPath,bytes:Buffer.byteLength(stdout),sha256:sha(Buffer.from(stdout))},
  stderr:{path:stderrPath,bytes:Buffer.byteLength(stderr),sha256:sha(Buffer.from(stderr))}};
 lanes.push(result);
 if(result.exitCode!==0||result.signal!==null||result.error!==null)failures.push(lane.id+': process failure');
 if(result.tests===null||result.tests<lane.minimumTests||result.pass!==result.tests||result.fail!==0||result.skipped!==0||result.cancelled!==0||result.todo!==0)
  failures.push(lane.id+': full selected unskipped population did not pass');
}
const report={kind:'bounded_q23_candidate_component_results',lanes,failures,claim:input.componentClaim,
 limits:['Source-derived population floors are guards against omitted tests, not semantic sufficiency.','Actual new positive/negative assertions and fixture premises require rubric assessment.','No actual production cross-family eligibility, paid F11 or whole-release closure is claimed.']};
const bytes=Buffer.from(JSON.stringify(report,null,2)+'\n'),path=join(out,'component-result.json');
await writeFile(path,bytes,{flag:'wx'});
console.log(JSON.stringify({status:failures.length?'FAILED':'COMPONENT_COMPLETED',report:{path,bytes:bytes.length,sha256:sha(bytes)}}));
assert.equal(failures.length,0,'Selected component predicates failed: '+JSON.stringify(failures));
