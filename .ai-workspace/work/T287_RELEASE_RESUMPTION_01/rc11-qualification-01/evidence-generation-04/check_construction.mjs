import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const root=dirname(fileURLToPath(import.meta.url)),basis=JSON.parse(await fs.readFile(join(root,'VIEW_BASIS.json'),'utf8')),inputs=JSON.parse(await fs.readFile(join(root,'PREFLIGHT_INPUTS.json'),'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
for(const p of [...inputs.inputs,inputs.normalViewLeaf,inputs.priorActualLeaf]){const b=await fs.readFile(p.path);assert.equal(b.length,p.bytes);assert.equal(sha(b),p.sha256);}
for(const link of inputs.links){assert.equal(await fs.readlink(link.path),link.target);assert.equal(await fs.realpath(link.path),link.target);}
assert.equal(process.env.NODE_OPTIONS??'','');assert.equal(process.env.NODE_PATH??'','');
const load=rel=>import(pathToFileURL(join(basis.installedRoot,'build/code/src',rel+'.js')).href);
const {isDeeplyFrozen}=await load('shared/immutable'),{isRecord}=await load('shared/admission_predicates'),{canonicalJson,sha256Canonical}=await load('product/index');
const ownerSource=await fs.readFile(join(basis.installedRoot,'build/code/src/implementation/leaf_invocation_port.js'),'utf8');
const exactFields=ownerSource.slice(ownerSource.indexOf('function hasExactDataFields('),ownerSource.indexOf('function isDeterministicEvidenceCandidate('));
const exactPreparedGuard=ownerSource.slice(ownerSource.indexOf('const PROBABILISTIC_WORKER_REQUEST_FIELDS'),ownerSource.indexOf('function preimageRefusal('));
assert.ok(exactFields.startsWith('function hasExactDataFields('));assert.ok(exactPreparedGuard.includes('function isPreparedProbabilisticLeafInvocation('));
const guard=new Function('isRecord','isDeeplyFrozen',exactFields+exactPreparedGuard+'return isPreparedProbabilisticLeafInvocation;')(isRecord,isDeeplyFrozen);
const priorRoot=join(root,'../evidence-generation-03/raw/native-assessment');const input=JSON.parse(await fs.readFile(join(priorRoot,'environment.json'),'utf8')).input;
const actual03=JSON.parse(await fs.readFile(join(priorRoot,'request.json'),'utf8'));const beforeInput=canonicalJson(input);
const prior=await import(pathToFileURL(inputs.priorActualLeaf.path).href),normal=await import(pathToFileURL(inputs.normalViewLeaf.path).href),transformed=await import(pathToFileURL(join(root,'construction-preflight/leaf.mjs')).href);
const old=prior.worker(input),prepared=transformed.worker(input),standard=normal.worker(input);
assert.equal(guard(old),false);assert.equal(guard(prepared),true);assert.equal(guard(standard),true);assert.equal(isDeeplyFrozen(prepared),true);
assert.equal(canonicalJson(prepared.workerRequest),canonicalJson(actual03));assert.equal(canonicalJson(prepared.workerRequest),canonicalJson(old.workerRequest));assert.equal(canonicalJson(input),beforeInput);
assert.equal(Object.hasOwn(standard.workerRequest,'responsePresentation'),false);for(const key of Object.keys(standard.workerRequest))assert.equal(canonicalJson(standard.workerRequest[key]),canonicalJson(actual03[key]));assert.equal(Object.keys(standard.workerRequest).length+1,Object.keys(actual03).length);
assert.equal(prepared.complete.toString(),old.complete.toString());assert.equal(standard.complete.toString(),old.complete.toString());assert.equal(typeof prepared.complete,'function');
let objectCount=0;const visit=v=>{if(v===null||typeof v!=='object')return;objectCount++;assert.equal(Object.isFrozen(v),true);for(const child of Object.values(v))visit(child);};visit(prepared);
console.log(JSON.stringify({status:'pure_prepared_construction_checks_passed',priorMutableGuard:false,repairedDefaultGuard:true,repairedResultTextGuard:true,currentSharedDeepFreeze:true,frozenObjectArrayCount:objectCount,requestCanonicalDigest:sha256Canonical(prepared.workerRequest),priorRequestCanonicalDigest:sha256Canonical(actual03),inputCanonicalDigest:sha256Canonical(input),inputValuesUnchanged:true,normalPresentationDefaultUnchanged:true,callbackFunctionSourceUnchanged:true,callbackOutputsNotModifiedOrFrozenByRepair:true,exactOwnerGuardSourceSha256:sha(exactFields+exactPreparedGuard),guardMethod:'Exact pure field-set and prepared guard source slices from pinned installed owner, using its imported shared isRecord/isDeeplyFrozen; owner runtime module not imported or invoked.',actorProviderOrRuntimeOperations:0,nodeExecutable:process.execPath,nodeVersion:process.version},null,2));
