import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,writeFile,mkdtemp,lstat,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL,fileURLToPath} from 'node:url';

test('installed environment owner authenticates once and preserves exact outputs and entry refusals',{
  skip:!process.env.P0_ENVIRONMENT_NATIVE_SCRATCH,timeout:120000,
},async()=>{
  const scratch=process.env.P0_ENVIRONMENT_NATIVE_SCRATCH;
  const load=(root,name)=>import(pathToFileURL(join(root,'build/code/src',name+'.js')));
  const roots=[process.env.P0_ENVIRONMENT_PREDECESSOR_ROOT,process.env.P0_ENVIRONMENT_FINAL_ROOT];
  const modules=await Promise.all(roots.map(async root=>({env:await load(root,'abg/environment_admission'),artifact:await load(root,'abg/artifact_truth'),digest:await load(root,'shared/digests')})));
  const call=JSON.parse(await readFile(join(scratch,'full-call.json'))),outcome=JSON.parse(await readFile(join(scratch,'full-outcome.json')));
  const prefix=outcome.resources.eventResource.closeHandoff.prefix,binding=call.invocation.invocationAuthority.slots.workspace_binding;
  const results=[],counts=[];
  for(const m of modules){const before=globalThis.p0Work?.physicalReads??0;results.push(m.env.projectExactPrefixWorkspaceEnvironment(prefix,binding));counts.push((globalThis.p0Work?.physicalReads??0)-before);}
  assert.equal(results[0].kind,'exact_prefix_workspace_environment');assert.deepEqual(results[1],results[0]);
  if(globalThis.p0Work){assert.equal(counts[0],8);assert.equal(counts[1],1);}
  for(const selected of [{...binding,digest:'sha256:'+'0'.repeat(64)},{...binding,ref:'workspace-binding://absent'}]){
    const values=modules.map(m=>m.env.projectExactPrefixWorkspaceEnvironment(prefix,selected));assert.deepEqual(values[1],values[0]);assert.equal(values[0].kind,'exact_prefix_workspace_environment_refusal');
  }
  for(let i=0;i<modules.length;i++){
    const m=modules[i],projection=results[i].artifactTruth,row=projection.rows.find(r=>r.operationId==='abg.operation.product.install');
    const valid=m.env.projectAdmittedProductInstallByAdmissionEventRef(projection,row.admissionEventRef);
    assert.deepEqual(m.env.projectAdmittedProductInstallByAdmissionEventRef(structuredClone(projection),row.admissionEventRef),valid);
    const forged=structuredClone(projection);forged.rows.find(r=>r.admissionEventRef===row.admissionEventRef).artifactDigest='sha256:'+'0'.repeat(64);
    assert.equal(m.env.projectAdmittedProductInstallByAdmissionEventRef(forged,row.admissionEventRef),null);
  }
  const temporary=await mkdtemp(join(tmpdir(),'environment-owner-drift-'));
  try{
    const path=join(temporary,'events.jsonl'),bytes=await readFile(fileURLToPath(prefix.eventLogRef));await writeFile(path,bytes);const stat=await lstat(path);
    const {coordinateDigest:_,...body}=prefix;Object.assign(body,{eventLogRef:pathToFileURL(path).href,storeIdentity:{...prefix.storeIdentity,device:stat.dev,inode:stat.ino}});
    const copiedPrefix={...body,coordinateDigest:modules[1].digest.sha256Canonical(body)};
    const prior=modules.map(m=>m.env.projectExactPrefixWorkspaceEnvironment(copiedPrefix,binding));assert.deepEqual(prior[1],prior[0]);
    const changed=Buffer.from(bytes);changed[0]=91;await writeFile(path,changed);
    for(let i=0;i<modules.length;i++){
      const m=modules[i],p=prior[i].artifactTruth,install=p.rows.find(r=>r.operationId==='abg.operation.product.install'),workspace=p.rows.find(r=>r.operationId==='abg.operation.workspace.bind');
      assert.equal(m.env.projectAdmittedProductInstallByAdmissionEventRef(p,install.admissionEventRef),null);
      assert.equal(m.env.projectAdmittedProductInstallByInvocationRef(p,install.invocationRef),null);
      assert.equal(m.env.projectAdmittedWorkspaceBindingByInvocationRef(p,workspace.invocationRef,prior[i].resolvedProductLock),null);
    }
    const refused=modules.map(m=>m.env.projectExactPrefixWorkspaceEnvironment(copiedPrefix,binding));assert.deepEqual(refused[1],refused[0]);assert.equal(refused[1].code,'artifact_truth_invalid');
  }finally{await rm(temporary,{recursive:true,force:true});}
  console.log(JSON.stringify({kind:'installed_environment_owner_conservation',roots,scratch,prefix,physicalReads:counts,exactOutput:true,copiedProjection:true,forgedProjectionRefused:true,standalonePhysicalDriftRefused:true}));
});
