/** Pure caller binding of frozen body inputs to EXISTING qualification owners.
 * No actor selection, planner, dispatch, native authority or alternate renderer.
 * Caller chooses one or more same-role packets and supplies genuine bindings.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const D = path.dirname(fileURLToPath(import.meta.url));
const C = path.join(D, '../final-candidate-construction-01');
const Q = path.join(D, '../final-qualification-inputs-01');
const installed = path.join(C, 'install/node_modules/@abiogenesis/typescript-tenant');
const require = createRequire(path.join(installed, 'package.json'));
const v = require('valibot');
export const contracts = await import(pathToFileURL(path.join(installed, 'build/code/src/validator/qualification_contracts.js')));
export const owner = await import(pathToFileURL(path.join(installed, 'build/code/src/validator/qualification.js')));
const digests = await import(pathToFileURL(path.join(installed, 'build/code/src/shared/digests.js')));
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const scopeBody = read(path.join(D, 'scope-body.json'));
const basisTemplate = read(path.join(Q, 'basis-template.json')).body;
const catalog = read(path.join(installed, 'contracts/qualification/rule-catalog.json'));
const bodyIndex = read(path.join(D, 'body-input-index.json'));
const materialIndex = read(path.join(D, 'material-index.json'));
const materialByRef = new Map(materialIndex.materials.map(m => [m.ref, m]));
// Role authority bindings use the catalog's source path; same original bytes.
for (const m of materialIndex.authorityMaterials) materialByRef.set(m.ref, m);
const sha = digests.sha256Canonical;
const bytesDigest = digests.sha256Bytes;
const same = (a,b) => sha(a) === sha(b);
const coord = (ref,digest) => ({ref,digest});
const must = (ok, why) => { if (!ok) throw new TypeError(why); };

export function loadBodyInputs(labels) {
  must(Array.isArray(labels) && labels.length > 0 && new Set(labels).size === labels.length, 'explicit distinct packet labels required');
  const packets = labels.map(label => {
    const row = bodyIndex.packets.find(p => p.label === label);
    must(row !== undefined, 'unknown frozen body input');
    return read(path.join(D, row.file));
  });
  must(new Set(packets.map(p => p.roleName)).size === 1, 'one existing published role per assessment');
  const unique = (rows,key) => [...new Map(rows.map(row => [key(row),row])).values()];
  const subjectMembers = unique(packets.flatMap(p => p.subjectMembers),m => m.ref);
  const refs = [...new Set(packets.flatMap(p => p.materialRefs))];
  const material = refs.map(ref => {
    const entry = materialByRef.get(ref); must(entry !== undefined, 'selected material absent');
    const m = read(path.join(D, entry.file));
    v.parse(contracts.QUALIFICATION_MATERIAL_SCHEMA,m);
    const bytes = Buffer.from(m.contentBase64,'base64');
    must(bytes.toString('base64') === m.contentBase64 && bytes.length === m.byteCount && bytesDigest(bytes) === m.digest, 'selected material bytes differ');
    must(['ref','path','digest','byteCount'].every(k => m[k] === entry[k]), 'selected material coordinate differs');
    return m;
  });
  const members = material.map(m => ({memberRef:m.ref,path:m.path,digest:m.digest,byteCount:m.byteCount}));
  must(new Set(members.map(m=>m.path)).size===members.length,'ambiguous context paths');
  const coverage = unique(packets.flatMap(p=>p.coverage),c=>c.criterionRef);
  const context = { contextRef:'qualification-context://abiogenesis/'+sha(members).slice(7),
    sourceLocator:pathToFileURL(D+'/').href,inventoryDigest:sha(members),members };
  const result={roleName:packets[0].roleName,subjectMembers,material,coverage,context,
    requiredLaterMaterial:[...new Set(packets.flatMap(p=>p.requiredLaterMaterial))]};
  for(const key of ['subjectMembers','material','context'])
    v.parse(contracts.QUALIFICATION_ASSESSMENT_TASK_SCHEMA.entries[key],result[key]);
  if(result.coverage.length>0)v.parse(contracts.QUALIFICATION_ASSESSMENT_TASK_SCHEMA.entries.coverage,result.coverage);
  else must(result.roleName==='tenant','only actual tenant-manifest criterion may remain unbound');
  return result;
}

export function bindScope(basis) {
  must(basis !== undefined && basis !== null, 'genuine completed qualification basis required');
  v.parse(contracts.EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA,basis);
  must(contracts.qualificationIdentity(basis,'basisRef','basisDigest','qualification-basis://abiogenesis/'),'basis identity differs');
  must(basis.installedProduct !== null && basis.workspaceBinding !== null && basis.tenantManifest !== null,
    'native installed Product, workspace binding and tenant manifest are still unbound');
  for(const [key,value] of Object.entries(basisTemplate)) {
    if(['installedProduct','workspaceBinding','tenantManifest','toolchain'].includes(key))continue;
    must(same(basis[key],value),'basis differs from closed candidate/Q input: '+key);
  }
  // The external toolchain description in Q is a structural preview input.
  // Actual F11's installed_candidate_basis relation uses the native manifest.
  must(basis.toolchain.digest===basis.productManifest.digest,'actual native toolchain/manifest basis join unresolved');
  const scope=contracts.constructQualificationIdentity({...scopeBody,
    subjectBasis:coord(basis.basisRef,basis.basisDigest)},'scopeRef','scopeDigest','qualification-scope://abiogenesis/');
  v.parse(contracts.QUALIFICATION_SCOPE_SCHEMA,scope);
  must(owner.qualificationScopeCorrespondence(scope,catalog,scopeBody.catalog.digest).length===0,'scope correspondence differs');
  return scope;
}

export function bindTask(labels,binding) {
  must(binding !== undefined && binding !== null,'genuine binding input required');
  const scope=bindScope(binding.basis);
  must(binding.executionSelectionRef !== undefined && binding.executionSelectionRef !== null,
    'actual observed executionSelectionRef still unbound');
  v.parse(contracts.QUALIFICATION_VERIFICATION_SELECTION_SCHEMA.entries.executionSelectionRef,binding.executionSelectionRef);
  must(binding.provenance !== undefined,'actual construction and author Context required');
  v.parse(contracts.QUALIFICATION_CONSTRUCTION_PROVENANCE_SCHEMA,binding.provenance);
  must(same(binding.provenance.subjectInventory,coord(scope.inventory.inventoryRef,scope.inventory.inventoryDigest)),
    'construction Context belongs to another inventory');
  must(Array.isArray(binding.declarations) && binding.declarations.length>0,'actual owner-validated grant/declarations required');
  must(binding.actorRef !== undefined && binding.independence !== undefined && binding.assetSurface !== undefined,
    'actual role, independence and asset-surface bindings required');
  must(binding.slotRef !== undefined && binding.taskOrdinal !== undefined,'actual finite slot and ordinal required');
  const bodies=loadBodyInputs(labels);
  if(bodies.roleName==='tenant'){
    const c={ruleRef:'qualification-role://abiogenesis/tenant@5',surfaceRef:binding.basis.tenantManifest.ref,evidenceRole:'tenant_realization'};
    bodies.coverage=[{criterionRef:'criterion://abiogenesis/'+sha(c).slice(7),...c}];
  }
  // Actual manifest/verification/execution bodies are provided by the caller;
  // no source record is fabricated or silently substituted here.
  const provided=binding.additionalMaterial??[];
  v.parse(contracts.QUALIFICATION_ASSESSMENT_TASK_SCHEMA.entries.material,provided);
  for(const m of provided){
    const previous=bodies.material.find(x=>x.ref===m.ref);
    must(previous===undefined||same(previous,m),'additional material cannot replace a selected frozen body');
    if(previous===undefined)bodies.material.push(m);
  }
  if(bodies.roleName==='tenant')must(bodies.material.some(m=>m.ref===binding.basis.tenantManifest.ref),'actual typed tenant manifest material required');
  const contextMembers=bodies.material.map(m=>({memberRef:m.ref,path:m.path,digest:m.digest,byteCount:m.byteCount}));
  bodies.context={contextRef:'qualification-context://abiogenesis/'+sha(contextMembers).slice(7),sourceLocator:pathToFileURL(D+'/').href,inventoryDigest:sha(contextMembers),members:contextMembers};
  // Supplemental selection/rationale bodies are not candidate members. The
  // existing F11 consumer accepts these only as genuine external records.
  const supplemental=bodies.material.filter(m=>m.ref.startsWith('material://abiogenesis/final-f11-scope-inputs-01/'));
  must(supplemental.length===0||binding.provenance.kind==='external_construction'&&supplemental.every(m=>binding.provenance.records.some(r=>same(r,m))),
    'selected external scope/rationale material is not joined to genuine retained construction records');
  const policy=contracts.QUALIFICATION_ROLE_POLICY;
  const role={roleRef:'qualification-role://abiogenesis/'+bodies.roleName+'@5',authorityRef:policy.authorityRef,
    sourceBindings:policy.authoritySourceRefs.map(ref=>catalog.sources.find(s=>s.ref===ref)),
    actorRef:binding.actorRef,workerBindingRef:policy.workerBindingRef,rendererRef:policy.rendererRef,
    materializationPlanRef:policy.materializationPlanRef,independence:binding.independence};
  const body={kind:'qualification_assessment_task',schemaVersion:'5.0.0',slotRef:binding.slotRef,taskOrdinal:binding.taskOrdinal,
    subjectBasis:scope.subjectBasis,lawBasis:scope.lawBasis,catalog:scope.catalog,
    inventory:coord(scope.inventory.inventoryRef,scope.inventory.inventoryDigest),scope,role,
    context:bodies.context,declarations:binding.declarations,assetSurface:binding.assetSurface,
    material:bodies.material,subjectMembers:bodies.subjectMembers,coverage:bodies.coverage,
    provenance:binding.provenance,priorEvidenceRefs:binding.priorEvidenceRefs??[],residuals:binding.residuals??[]};
  const task=contracts.constructQualificationIdentity(body,'taskRef','taskDigest','qualification-task://abiogenesis/');
  must(contracts.isQualificationAssessmentTask(task),'bound task identity/schema differs');
  must(owner.qualificationMaterialMatches(task),'bound scope, construction Context, role or material correspondence differs');
  return task;
}

export function materializeWorkerRequest(task,plan) {
  must(plan !== undefined && plan !== null,'actual selected finite assessment plan required');
  const input={kind:'qualification_assessment_input',schemaVersion:'5.0.0',task,plan};
  must(owner.isQualificationAssessmentInput(input),'actual task/plan/Context correspondence differs');
  // Sole renderer; returned request is data. This helper has no dispatch path.
  return owner.qualificationWorkerRequest(input);
}

export const bindingLimits = Object.freeze({
  noDispatch:true,noSyntheticProvenance:true,noNativeOutcome:true,noIndependentJudgment:true,
  callerMustSupply:'Actual completed basis, observed execution selection, construction author Context, owner-validated declarations, role/independence, asset surface and exact finite plan.',
  authority:'Pure identity/schema/material checks do not authenticate a made-up caller record or replace ABG admission, attribution J, independence J or native authorization.'
});
