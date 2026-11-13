// Operator C2 orchestration. Product assertions live in the native-authored tests.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const work=process.cwd(),tenant=join(work,'build_tenants/abiogenesis/typescript');
const inputs=join(work,'consolidation-inputs/native-01');
const h=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(await readFile(join(inputs,'C2_INPUTS.json'),'utf8'));
const environment={...process.env,NODE_OPTIONS:'--max-old-space-size=8192',
  ABI5_CONSOLIDATION_INPUTS:inputs};
const results=[];
for(const lane of manifest.lanes){
  const started=performance.now();
  const child=spawnSync(process.execPath,['--experimental-vm-modules','--test','--test-concurrency=1',
    '--test-reporter=tap',...lane.files],{cwd:tenant,env:environment,encoding:'utf8',timeout:lane.timeoutMs,maxBuffer:64*1024*1024});
  const stdout=child.stdout??'',stderr=child.stderr??'';
  await writeFile(join(tenant,'artifacts',lane.id+'.stdout.log'),stdout,{flag:'wx'});
  await writeFile(join(tenant,'artifacts',lane.id+'.stderr.log'),stderr,{flag:'wx'});
  const tally=key=>{const m=[...stdout.matchAll(new RegExp('^# '+key+' (\\d+)$','gm'))].at(-1);return m?Number(m[1]):null;};
  const row={id:lane.id,files:lane.files,exitCode:child.status,signal:child.signal,error:child.error?.message??null,
    pass:tally('pass'),fail:tally('fail'),skipped:tally('skipped'),wallMs:performance.now()-started,
    stdoutSha256:h(Buffer.from(stdout)),stderrSha256:h(Buffer.from(stderr))};
  results.push(row);console.log(JSON.stringify(row));
  assert.equal(child.status,0,lane.id+': '+stderr.slice(-3000)+'\n'+stdout.slice(-6000));
  assert.equal(row.fail,0,lane.id);
  assert(row.pass>=lane.minimumPasses,lane.id+' did not execute required cases');
  if(lane.requireNoSkips)assert.equal(row.skipped,0,lane.id+' must execute without optional skips');
}
const proofPath=join(tenant,'artifacts/single-address-space-proof.json');
const proofBytes=await readFile(proofPath),proof=JSON.parse(proofBytes);
assert(proof!==null&&typeof proof==='object'&&!Array.isArray(proof),'native test proof artifact missing');
const report={kind:'actual_single_address_space_c2_orchestration_result',lanes:results,
  nativeTestProof:{path:proofPath,bytes:proofBytes.length,sha256:h(proofBytes)},
  sourceManifestSha256:h(await readFile(join(inputs,'C2_INPUTS.json'))),
  authority:'Actual tests and native-authored proof retain their own claims; this wrapper only records their exits and artifacts.',
  qualified:false,published:false};
await writeFile(join(tenant,'artifacts/single-address-space-c2.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:'SELECTED_C2_LANES_COMPLETED',report,proof}));
