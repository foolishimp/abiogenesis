// Operator orchestration only. Native-authored tests own Product assertions.
// Retain all independent lane outcomes; any failed selected predicate fails C2.
// Product changes select new execution; older package and lane receipts remain historical only.
// Preserve the current actual archive before fixture cleanup; no package-equality reuse is selected.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const work=process.cwd(),tenant=join(work,'build_tenants/abiogenesis/typescript');
const inputs=join(work,'consolidation-inputs/native-09');
const h=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(await readFile(join(inputs,'C2_INPUTS.json'),'utf8'));
const environment={...process.env,NODE_OPTIONS:'--max-old-space-size=8192',ABI5_CONSOLIDATION_INPUTS:inputs};
const reportRoot=join(tenant,'test_env/test_runs/single-address-space-native-09');
const results=[],failures=[];
let retainedProof=null;

let retainedEvidenceVerification=null;
// Product code changes: preserve current actual bytes, never compare them as old execution.
try {
  const sourcePath=manifest.candidatePackageRelativePath;
  const packed=await readFile(join(work,sourcePath));
  await mkdir(reportRoot,{recursive:true});
  await writeFile(join(reportRoot,'candidate-package.tgz'),packed,{flag:'wx'});
  const observation={sourcePath,bytes:packed.length,sha256:h(packed),integrity:'sha512-'+createHash('sha512').update(packed).digest('base64'),standing:'Actual new candidate package retained before fixture cleanup; no old package-equality or retained-execution credit'};
  await writeFile(join(reportRoot,'candidate-package-observation.json'),JSON.stringify(observation,null,2)+'\n',{flag:'wx'});
} catch(error) { failures.push({lane:'candidate-package-custody',reason:'Actual candidate package unavailable',detail:String(error.message)}); }

for(const lane of manifest.lanes){
  const started=performance.now();
  const child=spawnSync(process.execPath,['--experimental-vm-modules','--test','--test-concurrency=1',
    '--test-reporter=tap',...lane.files],{
      cwd:tenant,env:environment,encoding:'utf8',timeout:lane.timeoutMs,maxBuffer:64*1024*1024});
  const stdout=child.stdout??'',stderr=child.stderr??'';
  await mkdir(reportRoot,{recursive:true});
  await writeFile(join(reportRoot,lane.id+'.stdout.log'),stdout,{flag:'wx'});
  await writeFile(join(reportRoot,lane.id+'.stderr.log'),stderr,{flag:'wx'});
  const tally=key=>{
    const match=[...stdout.matchAll(new RegExp('^# '+key+' (\\d+)$','gm'))].at(-1);
    return match?Number(match[1]):null;
  };
  const row={id:lane.id,files:lane.files,exitCode:child.status,signal:child.signal,
    error:child.error?.message??null,pass:tally('pass'),fail:tally('fail'),skipped:tally('skipped'),
    wallMs:performance.now()-started,stdoutSha256:h(Buffer.from(stdout)),stderrSha256:h(Buffer.from(stderr))};
  const unmet=[];
  if(row.exitCode!==0||row.signal!==null||row.error!==null)unmet.push('process did not complete successfully');
  if(row.fail!==0)unmet.push('failed or absent test tally');
  if(!Number.isSafeInteger(row.pass)||!(row.pass>=lane.minimumPasses))unmet.push('required cases did not execute');
  if(lane.requireNoSkips&&row.skipped!==0)unmet.push('required unskipped lane did not execute without skips');
  row.unmet=unmet;
  results.push(row);
  for(const reason of unmet)failures.push({lane:lane.id,reason});
  await writeFile(join(reportRoot,lane.id+'.json'),JSON.stringify(row,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify(row));

  if(lane.id==='single-address-space-whole-path'){
    // Preserve this producer before later fixture cleanup can remove artifacts/.
    // Its presence never turns a failed lane into a pass.
    const producerPath=join(tenant,'artifacts/single-address-space-proof.json');
    try{
      const proofBytes=await readFile(producerPath),proof=JSON.parse(proofBytes);
      assert(proof!==null&&typeof proof==='object'&&!Array.isArray(proof),'native test proof must be an object');
      const path=join(reportRoot,'single-address-space-proof.json');
      await writeFile(path,proofBytes,{flag:'wx'});
      retainedProof={proof,nativeTestProof:{path,producerPath,bytes:proofBytes.length,sha256:h(proofBytes),producerLanePassed:unmet.length===0}};
    }catch(error){
      failures.push({lane:lane.id,reason:'native producer proof unavailable or invalid',detail:String(error.message)});
    }
  }
}

if(retainedProof===null)failures.push({lane:'single-address-space-whole-path',reason:'no retained whole-path producer proof'});
const report={kind:'actual_single_address_space_c2_orchestration_result',lanes:results,failures,retainedEvidenceVerification,
  nativeTestProof:retainedProof?.nativeTestProof??null,
  sourceManifestSha256:h(await readFile(join(inputs,'C2_INPUTS.json'))),
  authority:'Tests and native-authored proof retain their own claims; this wrapper records outcomes and fails every unmet selected predicate.',
  qualified:false,published:false};
await mkdir(reportRoot,{recursive:true});
const c2ReportBytes=Buffer.from(JSON.stringify(report,null,2)+'\n');
const c2ReportPath=join(reportRoot,'single-address-space-c2.json');
await writeFile(c2ReportPath,c2ReportBytes,{flag:'wx'});
const c2Report={path:c2ReportPath,bytes:c2ReportBytes.length,sha256:h(c2ReportBytes)};
// The complete proof already has a helper-observed file and exact locator/digest in report.
// Keep the final record finite and await standard stdout completion before a failing assertion.
await new Promise((resolve,reject)=>process.stdout.write(JSON.stringify({status:failures.length===0?'SELECTED_C2_LANES_COMPLETED':'SELECTED_C2_LANES_FAILED',c2Report,report})+'\n',error=>error?reject(error):resolve()));
assert.equal(failures.length,0,'Selected C2 predicates failed: '+JSON.stringify(failures));
