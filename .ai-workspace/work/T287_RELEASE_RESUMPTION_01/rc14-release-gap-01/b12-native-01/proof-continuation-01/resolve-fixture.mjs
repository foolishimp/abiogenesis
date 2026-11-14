// Operator fixture custody: genuine eventless Public calls against the new
// candidate. No workspace, Catalog, provider, old authority, or runtime copy.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile,stat} from 'node:fs/promises';
import {dirname,join,relative,isAbsolute} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const control=dirname(fileURLToPath(import.meta.url));
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const hex=bytes=>createHash('sha256').update(bytes).digest('hex');
const binding=await json(join(control,'INPUT_BINDING.json'));
const raw=dirname(control),root=join(control,'execution/fixture');
const candidate=await json(join(raw,'proof/CANDIDATE_PACKAGE.json'));
assert.equal(candidate.subject,binding.builtSubject);
assert.equal(candidate.sourcePostimageSha256,binding.sourcePostimage.sha256);
assert.equal(hex(await readFile(candidate.archive.path)),candidate.archive.sha256);
const installation=await json(join(raw,'proof/INSTALLATION.json'));
assert.equal(installation.installedRoot,candidate.installedRoot);
await mkdir(root,{recursive:false});
const record=async (name,value,rawBytes=false)=>{
  const path=join(root,name),rel=relative(root,path);
  assert(rel&&!rel.startsWith('..')&&!isAbsolute(rel));
  const bytes=Buffer.from(rawBytes?value:JSON.stringify(value,null,2)+'\n');
  // Full calls are bounded evidence artifacts; stdout/stderr retain the
  // separate unchanged 16 MiB command-capture limit.
  assert(bytes.length<=binding.fullCallArtifactBytesLimit,'fixture artifact size');
  await mkdir(dirname(path),{recursive:true});await writeFile(path,bytes,{flag:'wx'});
  return {path,bytes:bytes.length,sha256:hex(bytes)};
};
let result={status:'FIRST_FIXTURE_FAILURE',providerCalls:0,eventResourceAcquisitions:0,workspaceCalls:0,catalogCalls:0};
try {
  await record('run.json',{activation:binding.activation,sourceHead:binding.sourceHead,
    sourcePostimageSha256:binding.sourcePostimage.sha256,candidateArchive:candidate.archive,
    continuationStart:await json(join(control,'execution/START.json')),
    selection:'Two genuine eventless Public calls for the candidate-bound detachment fixture; no provider or workspace setup.'});
  const setup=await import(pathToFileURL(join(binding.builtSubject,'test_env/uat/public-setup.mjs')));
  const runtime=await setup.installedModules(candidate.installedRoot),{product}=runtime;
  assert(await product.installedProductContentMatches(installation));
  const manifest=await json(join(candidate.installedRoot,'product-toolchain-manifest.json'));
  const native=await setup.verifyArtifact(runtime,{artifactPath:candidate.archive.path,manifest,
    expectedArtifactDigest:'sha256:'+candidate.archive.sha256},record,'candidate');
  assert.deepEqual(native.request,candidate.request);
  assert.equal(native.verified.productContentDigest,manifest.productContentDigest);
  assert.deepEqual(native.verified.declaredDependencies,[],'one-candidate fixture requires its actual empty dependency set');
  const caller=setup.publicCaller({root,runtime,native,record,
    command:()=>{throw new Error('No subprocess in the eventless fixture');},
    actorRef:'actor://abiogenesis/operator/rc14-b12-proof-continuation',
    config:{runId:'rc14-b12-proof-continuation-01'}});
  const {authorize,invoke}=caller,v=native.verified,hash=product.sha256Canonical;
  const callPins=[];
  async function actual(label,call) {
    assert.equal(setup.transportAcquisition(call).kind,'eventless');
    assert.equal(call.resources.eventResource,undefined);
    assert.equal(call.resources.admissionAuthority.basis.boundEnvironment,null);
    assert.equal(call.resources.admissionAuthority.basis.ownerArtifact.request.artifactPath,candidate.archive.path);
    // Capture the actual constructed full call before invocation; invoke keeps
    // every raw outcome before applying its success assertions.
    callPins.push(await record('calls/'+label+'.full-call.json',JSON.stringify(call)+'\n',true));
    const returned=await invoke(label,call);
    assert.equal(returned.outcome.acquisitionKind,'eventless');
    assert.equal(returned.receipt.exitCode,0);assert.equal(returned.receipt.failure,null);
    assert.equal(returned.receipt.ownerOutput.outcomeKind,'result');
    assert.equal(caller.state.resource,null);assert.equal(caller.state.selection,null);
    return returned;
  }
  const packed={kind:'product_verification_artifact_resource',schemaVersion:'5.0.0',artifactPath:native.request.artifactPath,
    artifact:{ref:v.artifactRef,digest:v.artifactDigest},
    productContent:{ref:'product-content://abi5-tests/'+v.productContentDigest.slice(7),digest:v.productContentDigest},
    descriptor:native.verification.coordinates.descriptor,
    contributionManifest:{ref:v.contributionManifestRef,digest:v.contributionManifestDigest},
    manifestDigest:v.manifestDigest,productId:v.productId,packageName:v.packageName,packageVersion:v.packageVersion};
  const checked=await actual('product-verify',await authorize(product.PRODUCT_VERIFICATION_SOURCE_DECLARATIONS.verify,
    {targetKind:'packed_artifact',artifact:packed.artifact,productContent:packed.productContent,descriptor:packed.descriptor,
      contributionManifest:packed.contributionManifest,declaredDependencies:v.declaredDependencies,
      compatibilityInputs:v.compatibilityRefs.map(compatibilityRef=>({compatibilityRef,subjectRef:packed.productContent.ref}))},
    {kind:'product_verification_resources',schemaVersion:'5.0.0',targetKind:'packed_artifact',packedArtifact:packed,verifiedArtifact:v}));
  const verification={invocation:{ref:checked.call.invocation.invocationRef,digest:checked.call.invocation.invocationDigest},
    outcome:checked.receipt.ownerOutput.value.verifiedArtifact};
  const resolved=await actual('product-resolve',await authorize(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.resolve,
    {requirements:[{productId:v.productId,packageVersion:v.packageVersion,requiredContractRefs:[],requiredCapabilityRefs:[]}],
      verifiedCandidates:[verification]},
    {kind:'product_resolution_resource_assertion',schemaVersion:'5.0.0',
      verifiedPreimages:[{verification,verifiedArtifact:v,verificationOutput:checked.receipt.ownerOutput}],
      nativeContractClosure:{selectorDispositions:[],occurrences:[],nativeBindings:[]}},{verification_references:[verification]}));
  const value=resolved.receipt.ownerOutput.value;
  assert.equal(value.selections.length,1);assert.equal(value.selections[0].requirement.productId,v.productId);
  assert.deepEqual(value.selections[0].verification,verification);assert.deepEqual(value.residuals,[]);
  const fixture=callPins.at(-1);
  const retained=await json(fixture.path);
  assert.deepEqual(retained.invocation,resolved.call.invocation);
  assert.equal(hash(retained.resources),hash(resolved.call.resources));
  assert.deepEqual(retained.resources.admissionAuthority.basis.ownerArtifact.request,candidate.request);
  assert.equal(retained.resources.verifiedPreimages.length,1);
  assert.equal((await stat(fixture.path)).size,fixture.bytes);
  assert.equal(hex(await readFile(candidate.archive.path)),candidate.archive.sha256);
  assert(await product.installedProductContentMatches(installation));
  result={...result,status:'CURRENT_CANDIDATE_RESOLVE_FIXTURE_READY',candidateArchive:candidate.archive,
    sourcePostimageSha256:binding.sourcePostimage.sha256,fixture,fullCalls:callPins,
    calls:caller.state.calls,resolveInvocation:{ref:resolved.call.invocation.invocationRef,digest:resolved.call.invocation.invocationDigest},
    resourceAcquisitions:0,limit:'Actual successful eventless verification and resolution; the later existing gate captures its resolve receiver and proves transport detachment only.'};
  await record('RESULT.json',result);console.log(JSON.stringify({status:result.status,fixture:result.fixture,calls:result.calls.length}));
}catch(error){
  result.error=String(error.stack??error);await record('RESULT.json',result);throw error;
}
