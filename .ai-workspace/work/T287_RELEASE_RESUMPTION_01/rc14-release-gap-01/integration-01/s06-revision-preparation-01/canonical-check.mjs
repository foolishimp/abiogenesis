// Pure declaration construction/validation only. No Public operation, resource, actor or Tool.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join,relative,isAbsolute,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {revisionDeclarations,contextDeclarations,revisionPrograms} from './declarations.mjs';
const here=dirname(fileURLToPath(import.meta.url));
const pins=JSON.parse(await readFile(join(here,'INPUT_PINS.json'),'utf8'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const pinned=async row=>{const bytes=await readFile(row.path);assert.equal(bytes.length,row.bytes,row.path);assert.equal(sha(bytes),row.sha256,row.path);return bytes;};
for(const row of [pins.originalReturn,pins.nativeAcquisition,pins.rootReview,pins.activation,...pins.standards])await pinned(row);
const manifestBytes=await readFile(join(pins.originalControls,'CONTROL_MANIFEST.json'));assert.equal(sha(manifestBytes),pins.originalManifestSha256);
const manifest=JSON.parse(manifestBytes);
for(const row of manifest.controls){const bytes=await readFile(join(pins.originalControls,row.path));assert.equal(sha(bytes),row.sha256,row.path);}
const sourceRoot=dirname(dirname(dirname(pins.maintainedTenantRoot)));
for(const row of manifest.inputs){const bytes=await readFile(join(sourceRoot,row.path));assert.equal(sha(bytes),row.sha256,row.path);}
const root=pins.candidatePackageRoot,pkg=JSON.parse(await readFile(join(root,'package.json'),'utf8'));
assert.equal(pkg.version,'5.0.0-rc.14');
assert.equal(sha(await readFile(join(root,'product-toolchain-manifest.json'))),pins.candidateManifestSha256);
const load=async name=>{const target=pkg.exports['./'+name].import;assert(target.startsWith('./'));const url=new URL(target,pathToFileURL(join(root,'package.json')));const rel=relative(root,fileURLToPath(url));assert(rel&&!isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('../'));return import(url.href);};
const [product,gtl,validator]=await Promise.all(['product','gtl','validator'].map(load));
const D=await import(pathToFileURL(join(pins.maintainedTenantRoot,'test_env/support/default-library.mjs')).href);
const P=await import(pathToFileURL(join(pins.maintainedTenantRoot,'test_env/uat/public-setup.mjs')).href);
const previous=await import(pathToFileURL(join(pins.originalControls,'declarations.mjs')).href);
const inputs=JSON.parse(await readFile(join(pins.originalControls,'INPUTS.json'),'utf8'));
for(const row of inputs.declarations)await pinned(row);
const nativeDeclarations=await import(pathToFileURL(inputs.declarations.find(r=>r.path.endsWith('/native-lifecycle-declarations.mjs')).path).href);
const acquisition=JSON.parse(await pinned(pins.nativeAcquisition));
assert.equal(acquisition.verification.disposition,'verified');
const verified=acquisition.verification.verifiedArtifact;
const corePublications=P.corePublications(gtl,verified),environment=await D.libraryEnvironment({gtl,product,packageRoot:root});
const original=previous.declare({gtl,product,D,nativeDeclarations,corePublications,environment,recursionBound:16});
const standards=await Promise.all(pins.standards.map(async r=>({...r,bytes:await pinned(r)})));
const review={...pins.rootReview,bytes:await pinned(pins.rootReview)};
const context=contextDeclarations({gtl,product,standards,review});
const after=revisionDeclarations({gtl,product,nativeDeclarations,original,corePublications,environment,context});
assert.deepEqual(after.publications[1],original.publications[1]);
const unique=(key,values)=>[...new Map(values.map(value=>[value[key],value])).values()];
const raw=(value,kind)=>{const row=validator.rawAdmitValue(value,kind,'contract://s06/preparation/canonical-validation@5');assert.equal(row.kind,'raw_admitted_value',JSON.stringify(row));return row;};
function validate(publication,program,publications){const p=raw(publication,'module_publication');return validator.validateProgram({declarationBasisDigest:p.subjectDigest,programPublication:p,program:raw(program,'gtl_program'),graphFunctions:unique('name',publications.flatMap(p=>p.graphFunctions)).map(v=>raw(v,'graph_function')),contracts:unique('contractRef',publications.flatMap(p=>p.contracts)).map(v=>raw(v,'contract_declaration')),evaluators:unique('name',publications.flatMap(p=>p.evaluators)),rules:unique('name',publications.flatMap(p=>p.rules)),implementationBindings:unique('bindingRef',publications.flatMap(p=>p.implementationBindings)).map(v=>raw(v,'implementation_binding')),closureContracts:unique('closureContractRef',publications.flatMap(p=>p.closureContracts)).map(v=>raw(v,'closure_contract'))});}
const closure=[...corePublications,...after.publications],checks=[];
for(const ref of Object.values(revisionPrograms)){
 const publication=after.publications[0],program=publication.programs.find(p=>p.programRef===ref),validation=validate(publication,program,closure);
 assert.equal(validation.kind,'program_validation',JSON.stringify(validation));
 const declaration=publication.runEnvironments.find(d=>d.declarationRef===program.policies[gtl.RUN_ENVIRONMENT_POLICY]);
 const graphs=unique('name',closure.flatMap(p=>p.graphFunctions)).filter(g=>program.callableMembership.includes(g.name));
 const leaves=graphs.flatMap(g=>g.template.nodes.flatMap(n=>gtl.cLeafTerms(n.term).filter(l=>l.fibre==='F_P').map(l=>({graph:g.name,locus:l.programLocusRef,role:gtl.nativeContextLeafFamily(g,l)}))));
 assert.equal(leaves.length,declaration.roles.length);
 for(const leaf of leaves)assert.equal(declaration.roles.filter(r=>r.graphFunctionRef===leaf.graph&&r.programLocusRef===leaf.locus&&r.role===leaf.role).length,1);
 checks.push({programRef:ref,validation:validation.kind,roles:declaration.roles.map(r=>({graph:r.graphFunctionRef,locus:r.programLocusRef,role:r.role,selectors:r.contextPolicy.selectors,selectedBytes:r.sourceBindings.reduce((n,b)=>n+b.endByte-b.startByte,0)}))});
}
const d2=after.publications[1];assert.equal(validate(d2,d2.programs[0],closure).kind,'program_validation');
console.log(JSON.stringify({kind:'pure_declaration_preparation',candidateVersion:pkg.version,checks,D2ByteEquivalent:true,lifecycleByteEquivalent:true,unselectedProgramsByteEquivalent:true,contextRecords:context.records.map(r=>({name:r.name,bytes:r.record.length,sha256:sha(r.record),dependency:r.dependency,context:r.context})),runtimeAdmission:false,provider:false,qualified:false}));
