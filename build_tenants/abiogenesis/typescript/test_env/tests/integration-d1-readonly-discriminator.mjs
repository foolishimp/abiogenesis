import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {SourceTextModule,SyntheticModule} from 'node:vm';
const integration=path.resolve(import.meta.dirname,'../../..');
const origins=JSON.parse(fs.readFileSync(path.join(integration,'origins.json')));
const donor=origins.parents.find(p=>p.id==='d1');
const manifest=JSON.parse(fs.readFileSync(donor.manifestPath));
const oldWork=path.resolve(donor.candidate,'../work'),newWork=path.join(integration,'work');
const sha=b=>createHash('sha256').update(b).digest('hex');
for(const row of [...manifest.source,...manifest.tests,...manifest.compiled])assert.equal(sha(fs.readFileSync(path.join(oldWork,row.path))),row.sha256,'frozen D1 work/import member '+row.path);
const observation=JSON.parse(fs.readFileSync(path.join(integration,'preimages/source-observation.json')));
const log=observation.nativeEventStore.path;
function logIdentity(){const b=fs.readFileSync(log),s=fs.lstatSync(log);return {sha256:sha(b),byteLength:b.length,device:s.dev,inode:s.ino};}
const before=logIdentity(),commonArchive=path.join(integration,'scratch/unexecuted-current-archive');
const diagnosticOnly=process.argv.includes('--trace-composed');
const replacement="archiveRoot:resolve(packageRoot,'../scratch/unexecuted-current-archive')";
async function probe(projectorWork,label){
  const effect=await import(pathToFileURL(path.join(projectorWork,'build/code/src/product/worksite_effect.js')).href);
  const file=path.join(oldWork,'test_env/support/d1-preserved-result-harness.mjs');
  const original=fs.readFileSync(file,'utf8');
  assert.equal(original.split(replacement).length,2,'one fixture-coordinate substitution only');
  // Identical current-task input in both probes. This substitutes only a test
  // archive coordinate in memory; no production byte or external path is written.
  const nativeLocator="const nativePath=resolve(packageRoot,'build/code/src/abg/worksite_construction_recovery.js');";
  assert.equal(original.split(nativeLocator).length,2,'one actual projector locator');
  // Both probes construct the exact frozen D1 task and lookup rows. R10 changes
  // the Run packet schema, so independently deriving each current grant would
  // compare different inputs. Only the actual native projector/import cone is
  // switched; the same explicit unadmitted current lookup assumptions remain.
  const source=original.replace(replacement,'archiveRoot:'+JSON.stringify(commonArchive))
    .replace(nativeLocator,'const nativePath='+JSON.stringify(path.join(projectorWork,'build/code/src/abg/worksite_construction_recovery.js'))+';');
  const module=new SourceTextModule(source,{identifier:file,initializeImportMeta:meta=>{meta.url=pathToFileURL(file).href;meta.dirname=path.dirname(file);},
    importModuleDynamically:specifier=>import(specifier.startsWith('.')?pathToFileURL(path.resolve(path.dirname(file),specifier)).href:specifier)});
  const links=new Map();
  await module.link(async specifier=>{
    if(links.has(specifier))return links.get(specifier);
    const url=specifier.startsWith('.')?pathToFileURL(path.resolve(path.dirname(file),specifier)).href:specifier;
    const actual=await import(url),exports={...actual};
    if(diagnosticOnly&&specifier==='node:fs')exports.readFileSync=(target,...args)=>{
      const bytes=actual.readFileSync(target,...args);
      if(String(target)!==path.join(projectorWork,'build/code/src/abg/worksite_construction_recovery.js'))return bytes;
      let source=String(bytes);
      for(const [name,end]of [['materialized','function admittedLeaf('],['admittedLeaf','function sameInvocation('],['taskBridge','function currentTaskPhysical('],['authenticateWorksitePreservedResultBasis','export function constructWorksitePreservedResultNativeBasis(']]){
        const from=source.indexOf('function '+name+'('),to=source.indexOf(end);assert.ok(from>=0&&to>from);let branch=0;
        let body=source.slice(from,to).replace(/catch \{/g,'catch(error) { __integrationTrace.push({caught:String(error),stack:error?.stack});');
        body=body.replace(/return null;/g,()=>`return (__integrationTrace.push({functionName:${JSON.stringify(name)},refusalBranch:${++branch}}), null);`);
        if(name==='taskBridge')body=body.replace('return sources.length === 1 ? sources[0] : null;','return (__integrationTrace.push({functionName:"taskBridge",ownerCount:sources.length}), sources.length === 1 ? sources[0] : null);');
        source=source.slice(0,from)+body+source.slice(to);
      }
      // Diagnostic side-channel only, in memory: unchanged guard predicates and
      // return values, no persisted or admitted production fact.
      source='const __integrationTrace=[]; export const __integrationGuardTrace=()=>__integrationTrace;\n'+source;
      return source;
    };
    const linked=new SyntheticModule(Object.keys(exports),function(){for(const [key,value]of Object.entries(exports))this.setExport(key,value);});
    links.set(specifier,linked);return linked;
  });await module.evaluate();
  const h=await module.namespace.nativeHarness(),n=h.native;
  const authenticated=n.authenticateWorksitePreservedResultBasis(h.authBasis);
  const artifact=n.projectWorksitePreservedResultArtifact(h.authBasis,h.task);
  let preparationRelation;
  if(diagnosticOnly){const owner=await import(pathToFileURL(path.join(projectorWork,'build/code/src/product/semantic_stage.js')).href);
    const derived=owner.deriveSemanticWorksitePreparation(h.original.projected.envelope,h.task);
    preparationRelation={expectedDigest:module.namespace.product.sha256Canonical(h.preparation),derivedDigest:module.namespace.product.sha256Canonical(derived),isNull:derived===null};}
  let firstPhysicalMismatch=null;
  for(const [ordinal,target]of h.task.targets.entries()){
    const file=fileURLToPath(target.subject.subjectUri);let actual;
    try{const stat=fs.lstatSync(file),bytes=fs.readFileSync(file);actual=effect.constructWorksiteObservation({subject:target.subject,state:'file',fileIdentity:`${stat.dev}:${stat.ino}`,fileDigest:'sha256:'+sha(bytes),byteLength:bytes.length});}
    catch(error){if(error.code!=='ENOENT')throw error;actual=effect.constructWorksiteObservation({subject:target.subject,state:'absent'});}
    if(module.namespace.product.sha256Canonical(actual)!==module.namespace.product.sha256Canonical(target.predecessorObservation)){
      firstPhysicalMismatch={ordinal,subjectUri:target.subject.subjectUri,expected:target.predecessorObservation,actual};break;
    }
  }
  return {label,inputWork:oldWork,projectorWork,harnessSha256:sha(original),onlyInMemoryFixtureDelta:'common archive coordinate and actual native projector path',taskDigest:module.namespace.product.sha256Canonical(h.task),basisDigest:module.namespace.product.sha256Canonical(h.authBasis),sourceDigest:module.namespace.product.sha256Canonical(module.namespace.selector),authenticated:authenticated!==null,artifact:artifact===null?null:{ref:artifact.artifactRef,digest:artifact.artifactDigest},firstPhysicalMismatch,...(diagnosticOnly?{guardTrace:n.__integrationGuardTrace(),preparationRelation}: {})};
}
if(diagnosticOnly){
  const composed=await probe(newWork,'composed integration; traced return guards only');const after=logIdentity();assert.deepEqual(after,before);
  console.log(JSON.stringify({kind:'same_input_d1_guard_localization',scope:'Read-only instrumentation, not an admitted positive or corrected test expectation',before,after,composed},null,2));
}else{
const old=await probe(oldWork,'frozen D1 Source03'),composed=await probe(newWork,'composed integration');
console.log(JSON.stringify({old,composed},null,2));
assert.equal(old.taskDigest,composed.taskDigest,'exact same current task');
assert.equal(old.basisDigest,composed.basisDigest,'exact same current native-lookup basis');
assert.equal(old.sourceDigest,composed.sourceDigest,'exact same preserved source selector');
const after=logIdentity();assert.deepEqual(after,before,'read-only original log conservation');
console.log(JSON.stringify({kind:'same_input_readonly_d1_discriminator',scope:'Actual retained historical projection and physical observation; current occurrence is an unadmitted lookup fixture. No acquisition/append/Public/actor/helper/app writes.',before,after,commonArchive,old,composed},null,2));
assert.equal(old.authenticated,composed.authenticated,'authentication composition');
assert.deepEqual(old.artifact,composed.artifact,'same current-state disposition');
}
