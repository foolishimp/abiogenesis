import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const read=async name=>JSON.parse(await readFile(new URL(name,import.meta.url),'utf8'));
const save=(name,value)=>writeFile(new URL(name,import.meta.url),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const inputs=await read('inputs.json'),sha=bytes=>createHash('sha256').update(bytes).digest('hex');
for(const row of [inputs.originalPublication,inputs.canonicalFactory,inputs.historicalLifecycle,inputs.coreSelection,...Object.values(inputs.publicEntries)])assert.equal(sha(await readFile(row.path)),row.sha256,row.path);
const [gtl,product,validator]=await Promise.all(['gtl','product','validator'].map(name=>import(pathToFileURL(inputs.publicEntries[name].path).href)));
const {constructNativeRevisionEnvironmentRoles}=await import(pathToFileURL(inputs.canonicalFactory.path).href);
const original=JSON.parse(await readFile(inputs.originalPublication.path,'utf8'));
const lifecycle=gtl.constructSemanticJobLifecycleDeclaration(JSON.parse(await readFile(inputs.historicalLifecycle.path,'utf8')));
assert.deepEqual(original.semanticJobLifecycle,lifecycle);
const environments=original.runEnvironments.map(environment=>gtl.constructRunEnvironmentDeclaration({...environment,
 roles:constructNativeRevisionEnvironmentRoles({publication:original,roles:environment.roles})}));
const publication=gtl.modulePublication({...original,runEnvironments:environments});
assert.deepEqual({...publication,runEnvironments:original.runEnvironments},original,'only declared environments change');
const changed=[];
for(let i=0;i<environments.length;i++){
 const before=original.runEnvironments[i],after=environments[i];assert.deepEqual({...after,roles:before.roles},before);
 for(let j=0;j<after.roles.length;j++){
  const old=before.roles[j],current=after.roles[j];assert.deepEqual({...current,contextPolicy:old.contextPolicy},old,'exact source/frame/instruction policy retained');
  if(JSON.stringify(current)!==JSON.stringify(old))changed.push({environmentRef:after.declarationRef,graphFunctionRef:current.graphFunctionRef,programLocusRef:current.programLocusRef,role:current.role,before:old.contextPolicy,after:current.contextPolicy});
 }
}
assert(changed.length>0);
const raw=(value,kind)=>validator.rawAdmitValue(value,kind,'contract://abiogenesis/gtl/'+kind+'@5');
// Component materialization only: the author's zero archive/manifest placeholders
// are not installed coordinates. Use distinct fixture identities for raw validation.
const archive=product.sha256Canonical('component:prospective-archive'),manifest=product.sha256Canonical('component:prospective-manifest');
const validationSubject=gtl.modulePublication({...publication,artifactDigest:archive,productContentDigest:product.sha256Canonical('component:prospective-content'),productManifestDigest:manifest,
 contributions:publication.contributions.map(row=>({...row,provenanceRefs:[archive,manifest]}))});
const result=validator.validatePublication(raw(validationSubject,'module_publication'),validationSubject.contributions.map(c=>raw(c,'catalog_contribution')));
await save('component-validation.json',{scope:'Full prospective publication under explicit distinct component package coordinates; actual installed package verification remains pending.',result});assert.equal(result.kind,'publication_validation','complete refusal retained before assertion');
await save('prospective-publication.json',publication);
await save('correspondence.json',{scope:inputs.scope,sourceInputs:inputs,originalPublicationDigest:product.sha256Canonical(original),publicationDigest:product.sha256Canonical(publication),historicalLifecycleDigest:product.sha256Canonical(lifecycle),changedRoles:changed,
 unchanged:['historical lifecycle','graphs','contracts','Programs','original environment and native workspace/selector/C2 rows','all source/frame/access/instruction bytes and coordinates'],publicationValidation:result.kind});
console.log(JSON.stringify({kind:result.kind,changedRoleRows:changed.length,publicationDigest:product.sha256Canonical(publication),historicalLifecycleDigest:product.sha256Canonical(lifecycle)}));
