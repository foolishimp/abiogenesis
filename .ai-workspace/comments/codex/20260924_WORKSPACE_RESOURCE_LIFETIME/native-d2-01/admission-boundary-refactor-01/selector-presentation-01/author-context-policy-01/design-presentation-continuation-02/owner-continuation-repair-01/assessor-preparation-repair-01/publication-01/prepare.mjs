import fs from 'node:fs';import {join} from 'node:path';import {pathToFileURL} from 'node:url';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const D=import.meta.dirname,read=p=>JSON.parse(fs.readFileSync(p,'utf8')),save=(n,v)=>fs.writeFileSync(join(D,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'}),inputs=read(join(D,'inputs.json')),core=read(inputs.coreSelection),sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(sha(inputs.sourceSubject.path),inputs.sourceSubject.sha256);for(const row of read(inputs.sourceSubject.path).members)assert.equal(sha(row.path),row.sha256);
const [gtl,product]=await Promise.all(['gtl','product'].map(n=>import(pathToFileURL(join(core.packageRoot,'build/code/src',n,'index.js')).href)));
const {constructNativeRevisionDeclarations,constructNativeRevisionEnvironmentRoles}=await import(pathToFileURL(inputs.factory).href);
const old=read(inputs.originalPublication),lifecycle=gtl.constructSemanticJobLifecycleDeclaration(old.semanticJobLifecycle),oldProgram=old.programs.find(p=>!p.programRef.includes('/native-semantic-revision/')),closures=[];
const close=(name,predicateRef,resultContractRef,closureScope='graph_call')=>{const closureContractRef=`contract://odd-glc/fresh-native-lifecycle/${name}/closure@5`;closures.push(gtl.constructSemanticClosureContract({closureContractRef,predicateRef,resultContractRef,closureScope}));return closureContractRef;};
const generated=constructNativeRevisionDeclarations({gtl,product,lifecycle,close,program:oldProgram});
const newGraphs=generated.graphs.filter(g=>!old.graphFunctions.some(o=>o.name===g.name));
const programs=generated.programs.filter(p=>!old.programs.some(o=>o.programRef===p.programRef));assert.equal(programs.length,4);assert.equal(newGraphs.length,12);
const graphs=[...old.graphFunctions,...newGraphs],oldRows=old.runEnvironments.flatMap(e=>e.roles),environments=[];
for(const program of programs){
 const name=program.programRef.split('/').at(-1).replace('@5',''),environmentRef=old.runEnvironments[0].declarationRef+'/native-revision-'+name;
 program.policies={...program.policies,[gtl.RUN_ENVIRONMENT_POLICY]:environmentRef};
 const roleRows=program.callableMembership.flatMap(ref=>{
  let rows=oldRows.filter(row=>row.graphFunctionRef===ref);
  if(rows.length===0){const graph=graphs.find(g=>g.name===ref),stageRef=graph?.declarations['abg.semantic_revision_stage'];if(stageRef){
   const stage=lifecycle.stages.find(s=>s.declarationRef===stageRef);rows=oldRows.filter(row=>row.role==='assessor'&&row.programLocusRef===stage.assessorLocusRef).map(row=>({...row,graphFunctionRef:ref}));
  }}
  return rows;
 });
 const unique=[...new Map(roleRows.map(r=>[product.sha256Canonical(r),r])).values()];
 const roles=constructNativeRevisionEnvironmentRoles({publication:{...old,graphFunctions:graphs},roles:unique});
 assert.deepEqual(roles,unique,'new assessor entry reuses exact existing stage-role policy and immutable source spans');
 environments.push(gtl.constructRunEnvironmentDeclaration({...old.runEnvironments[0],declarationRef:environmentRef,roles}));
}
const allPrograms=[...old.programs,...programs],newClosures=closures.filter(c=>!old.closureContracts.some(o=>o.closureContractRef===c.closureContractRef));
const template=old.contracts[0],contributions=graphs.map(graph=>{
 const previous=old.contributions.find(c=>c.handle===graph.name),membership=allPrograms.filter(p=>p.callableMembership.includes(graph.name)).map(p=>p.programRef);
 return {...(previous??{handle:graph.name,kind:'graph_function',declarationOrContractRef:graph.name,owningProductId:old.owningProductId,compatibilityRefs:['compatibility://abiogenesis/major/5'],provenanceRefs:[old.artifactDigest,old.productManifestDigest]}),programMembershipRefs:membership,readinessPrerequisiteRefs:membership};
});
const publication=gtl.modulePublication({...old,graphFunctions:graphs,programs:allPrograms,runEnvironments:[...old.runEnvironments,...environments],closureContracts:[...old.closureContracts,...newClosures],contracts:[...old.contracts,...newClosures.map(c=>({...template,contractRef:c.closureContractRef}))],contributions});
assert.deepEqual(publication.semanticJobLifecycle,old.semanticJobLifecycle);
for(const field of ['graphFunctions','programs','runEnvironments','closureContracts','contracts']){const key={graphFunctions:'name',programs:'programRef',runEnvironments:'declarationRef',closureContracts:'closureContractRef',contracts:'contractRef'}[field];for(const original of old[field])assert.deepEqual(publication[field].find(row=>row[key]===original[key]),original,field+':'+original[key]);}
save('prospective-publication.json',publication);save('correspondence.json',{scope:'Pure canonical GLC/GTL declaration construction; no runtime authority',inputs,originalPublicationDigest:product.sha256Canonical(old),publicationDigest:product.sha256Canonical(publication),historicalLifecycleDigest:product.sha256Canonical(lifecycle),addedPrograms:programs.map(p=>p.programRef),addedGraphs:newGraphs.map(g=>g.name),addedClosures:newClosures.map(c=>c.closureContractRef),preserved:['all original graphs/Programs/environments/closures/contracts','historical lifecycle and original source spans/role policies'],updated:'contribution membership only to include the four new whole suffixes'});console.log(JSON.stringify({programs:publication.programs.length,addedPrograms:programs.length,addedGraphs:newGraphs.length,lifecycle:product.sha256Canonical(lifecycle)}));
