// One bounded pure current packet construction. No Run, Task admission or Runtime facts.
import assert from 'node:assert/strict';
import {readFile,writeFile,open} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {loadPackageExport} from './public-support.mjs';
import {constructRuntimeBoundInputs,assertMaterialRoleAliases} from './current-resources.mjs';
const report=dirname(dirname(fileURLToPath(import.meta.url))),read=async p=>JSON.parse(await readFile(p,'utf8'));
const write=(n,v)=>writeFile(join(report,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const start=performance.now();let frontier='pinned-current-public-owner-import';
try{
 const selected=await read(join(report,'candidate-binding.json')),coords=await read(join(report,'f11/actual-setup-coordinates.json'));
 const dependency=await readFile(join(report,'../rc1-final-input-controls-06/c05-dependency-acceptance.json'));
 assert.equal(dependency.length,2516);assert.equal(createHash('sha256').update(dependency).digest('hex'),'27a228e64e5c380812518098d53ce742555529cdd16483ca03cdc478462ff561');
 const root=selected.physicalBootstrapRoot;
 const [product,validator,gtl]=await Promise.all(['product','validator','gtl'].map(n=>loadPackageExport(root,'@abiogenesis/typescript-tenant','./'+n)));
 const hash=product.sha256Canonical;
 for(const pin of [coords.acceptance,coords.freeze,...coords.selectedOriginalRecordPins]){const b=await readFile(pin.path);assert.equal(b.length,pin.bytes);assert.equal('sha256:'+createHash('sha256').update(b).digest('hex'),'sha256:'+pin.sha256);}
 const installCoordinate=product.productInstallCoordinate(coords.coreInstall),installedProduct={installId:installCoordinate.ref,installDigest:installCoordinate.digest,productId:coords.coreInstall.productId,productContentDigest:coords.coreInstall.productContentDigest};
 frontier='concrete-full-current-b-task-plan-scope-material-construction';
 const declarationProofs=[{kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog:coords.catalog,catalogView:coords.catalogView}];
 const result=await constructRuntimeBoundInputs({product,validator,gtl,...coords,installedProduct,declarationProofs});
 frontier='nearest-material-role-negatives';
 const aliases=await read(join(report,'f11/member-alias-trace.json')),inventory=await read(join(report,'qualification-inventory.json')),
  catalog=await read(selected.catalog.path),negatives=[];
 assert.throws(()=>assertMaterialRoleAliases({...aliases,bijection:aliases.bijection.slice(1)},inventory,catalog),/material_member_alias_bijection_incomplete/);
 negatives.push({label:'one physical alias omitted',outcome:'refused',owner:'Q06 ordinary assertion constructor',predicate:'material_member_alias_bijection_incomplete',bodyMaterializationRepeated:false});
 const original=result.embeddedAssessment,physicalAuthority=aliases.bijection.find(x=>x.originalRef===validator.QUALIFICATION_ROLE_POLICY.authoritySourceRefs[0]);
 const material=original.task.material.map(m=>m.ref===physicalAuthority.originalRef?{...m,path:physicalAuthority.physicalMember.path}:m);
 const contextMembers=material.map(m=>({memberRef:m.ref,path:m.path,digest:m.digest,byteCount:m.byteCount})),contextDigest=hash(contextMembers);
 const context={...original.task.context,contextRef:'qualification-context://abiogenesis/'+contextDigest.slice(7),inventoryDigest:contextDigest,members:contextMembers};
 const task=validator.constructQualificationIdentity({...original.task,material,context,assetSurface:{...original.task.assetSurface,requiredContexts:[context.contextRef]}},'taskRef','taskDigest','qualification-task://abiogenesis/');
 const plan=validator.constructQualificationIdentity({...original.plan,slots:original.plan.slots.map(s=>({...s,task:{ref:task.taskRef,digest:task.taskDigest}}))},'planRef','planDigest','qualification-plan://abiogenesis/');
 assert.equal(validator.isQualificationAssessmentInput({kind:'qualification_assessment_input',schemaVersion:'5.0.0',task,plan}),false,'published material correspondence must reject a physical authority path with correct task/plan/context identities');
 negatives.push({label:'physical path crossed into packaged role authority material',outcome:'refused',owner:'./validator.isQualificationAssessmentInput',identitiesReconstructed:true,bodyMaterializationRepeated:false});
 await write('f11-material-role-negatives.json',{status:'CLOSED',allRefused:true,count:2,rows:negatives});
 frontier='exact-full-resource-readiness-artifact';
 // Stream members individually. Do not create a second giant resource string merely to retain it.
 const handle=await open(join(report,'f11-bound-resource-manifest.json'),'wx');let bytes=0;
 const emit=async s=>{const b=Buffer.from(s);bytes+=b.length;await handle.write(b);};
 try{
  await emit('{');const resource=result.packet.assertion.manifests[0];let first=true;
  for(const [key,value]of Object.entries(resource)){
   if(!first)await emit(',');first=false;await emit(JSON.stringify(key)+':');
   if(key==='entries'){
    await emit('[');for(let i=0;i<value.length;i++){if(i)await emit(',');await emit(JSON.stringify(value[i]));}await emit(']');
   }else await emit(JSON.stringify(value));
  }await emit('}\n');
 }finally{await handle.close();}
 const assertion={...result.packet.assertion,manifests:[]};
 await write('f11-bound-packet.json',{assessmentInput:result.packet.assessmentInput,assertionManifestRef:result.packet.assertion.manifests[0].resourceRef,
  assertionManifestFile:'f11-bound-resource-manifest.json',declarationProofs:assertion.declarationProofs,selfConformanceBase:result.packet.selfConformanceBase,
  coverageCatalog:result.packet.coverageCatalog,raw:result.packet.raw,sourceMemberSelections:result.packet.sourceMemberSelections,
  runtimeAdmission:false,coordinateStatus:'actual_admitted',newTaskOrRunAdmission:false,actualSetupAcceptance:coords.acceptance});
 await writeFile(join(report,'f11-bound-prompt.txt'),result.request.prompt,{flag:'wx'});
 await write('f11-bound-worker-request.json',result.request);
 await write('f11-packet-readiness.json',{kind:'current_C05_full_F11_input_preparation',status:'CLOSED',workResult:'GO_PREPARATION_EXISTING_SETUP_ASSERTIONS',frontier,
  ...result.ready,resourceSerializationBytes:bytes,actualAdmission:false,actualReferenceOwnerConsumption:'future actual Runtime preparation required',
  cost:{elapsedMs:performance.now()-start,resourceUsage:process.resourceUsage(),heap:'default; no heap override',nativeTaskOrRuntimeEffects:0},
  limits:['Published complete embedded input/material/scope owner and renderer were exercised with current law and exact retained bodies.',
   'This constructs assertions over exact Root-accepted already admitted Setup05 A/W/install/catalog/View coordinates. It creates no new Task, Run, J or admission.',
   'All inventory byte selections are resource data. Three governing bodies, a 39KB alias derivation context and unchanged original attribution spans enter this prompt.',
   'No semantic criteria, source attribution sufficiency, independent J, F11, observed qualification, AF22 or release are established.']});
 process.stdout.write(JSON.stringify({workResult:'GO_PREPARATION_EXISTING_SETUP_ASSERTIONS',inventoryMembers:result.ready.inventoryMembers,resourceBytes:bytes,promptBytes:result.ready.promptBytes,elapsedMs:performance.now()-start})+'\n');
}catch(error){
 await write('f11-packet-readiness.json',{kind:'current_C05_full_F11_input_preparation',status:'CLOSED',workResult:'NO_GO',frontier,error:{name:error.name,message:error.message,stack:error.stack},
  noAutonomousRepair:true,RuntimeAdmission:false,cost:{elapsedMs:performance.now()-start,resourceUsage:process.resourceUsage()}});
 process.stderr.write(error.stack+'\n');process.exitCode=2;
}
