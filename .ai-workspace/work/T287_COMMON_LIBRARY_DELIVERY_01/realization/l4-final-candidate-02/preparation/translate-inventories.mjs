#!/usr/bin/env node
// Closed-record carrier translation only. This file never imports Product or activates a lane.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lstat,mkdir,readFile,readlink,realpath,writeFile} from 'node:fs/promises';
import {dirname,isAbsolute,join,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const TENANT='build_tenants/abiogenesis/typescript';
export const SOURCE_SUCCESSORS=Object.freeze([
  TENANT+'/contracts/capabilities/capability-definition-graph.json',
  TENANT+'/contracts/worksite/command-execution-context.inventory.json',
]);
export const SUPPORT=Object.freeze([
  'test_env/uat/public-setup.mjs','test_env/uat/consumer.mjs',
  'test_env/support/installed-language-test.mjs','test_env/support/root-installed-environment.mjs',
  'test_env/support/root-cli-environment.mjs','test_env/support/candidate-basis.mjs',
  'test_env/support/language-smoke-fixture.mjs','test_env/support/registered-graph-selection.mjs',
  'test_env/fixtures/language-smoke/program.mjs','test_env/fixtures/language-smoke/leaf.mjs',
  'test_env/fixtures/registered-selection-product/index.mjs','test_env/fixtures/registered-selection-product/native.mjs',
  'test_env/fixtures/abi5-root-candidate-basis.json','test_env/support/stdo3-run-environment.mjs',
]);
const sha=b=>createHash('sha256').update(b).digest('hex');
const inside=(root,p)=>{const r=relative(root,p);return r===''||(!r.startsWith('..')&&!isAbsolute(r));};
const asMode=x=>typeof x==='string'?Number(x):x;
const object=async p=>JSON.parse(await readFile(p,'utf8'));
const safeRelative=p=>typeof p==='string'&&p!==''&&!isAbsolute(p)&&p===p.split('/').filter(x=>x!==''&&x!=='.'&&x!=='..').join('/');
const identity=r=>({type:r.type,mode:r.mode,...(r.type==='symlink'?{target:r.target}:{sha256:r.sha256,bytes:r.bytes})});
export function rowForRunner(row,path=row.path) {
  assert.ok(safeRelative(path),'safe exact relative inventory path');
  const type=row.kind??row.type??(typeof row.sha256==='string'?'file':undefined);
  if(row.kind!==undefined&&row.type!==undefined)assert.equal(row.kind,row.type);
  assert.ok(['file','symlink'].includes(type));
  assert.ok(Number.isSafeInteger(asMode(row.mode))&&asMode(row.mode)>=0&&asMode(row.mode)<=0o777);
  const out={path,type,mode:row.mode};
  if(type==='file') {
    assert.match(row.sha256,/^[a-f0-9]{64}$/u);assert.ok(Number.isSafeInteger(row.bytes)&&row.bytes>=0);
    Object.assign(out,{sha256:row.sha256,bytes:row.bytes});
  } else {assert.ok(typeof row.target==='string'&&row.target.length>0&&!isAbsolute(row.target));out.target=row.target;}
  return out;
}
export function uniqueRows(rows) {
  assert.equal(new Set(rows.map(x=>x.path)).size,rows.length,'duplicate path');
  return rows.toSorted((a,b)=>a.path.localeCompare(b.path));
}
async function checkRow(root,row) {
  const p=resolve(root,row.path);assert.ok(inside(root,p));const s=await lstat(p);
  assert.equal(s.mode&0o777,asMode(row.mode),p+' mode');
  if(row.type==='symlink') {assert.ok(s.isSymbolicLink());assert.equal(await readlink(p),row.target);assert.ok(inside(root,await realpath(p)),'external dependency symlink');}
  else {assert.ok(s.isFile());assert.equal(s.size,row.bytes,p+' bytes');assert.equal(sha(await readFile(p)),row.sha256,p);}
}
async function pinned(pin) {
  assert.ok(pin&&isAbsolute(pin.path));assert.match(pin.sha256,/^[a-f0-9]{64}$/u);
  const b=await readFile(pin.path);assert.equal(sha(b),pin.sha256,pin.path);return b;
}
function stripTenant(path) {assert.ok(path.startsWith(TENANT+'/'));return path.slice(TENANT.length+1);}
export function translateSource(source,post,correspondence) {
  assert.equal(correspondence.immutable_source_union_preserved,true);
  assert.equal(correspondence.all_other_source_inputs_unchanged,true);
  const changes=correspondence.derived_source_successors;
  assert.deepEqual(changes.map(x=>x.before.path).sort(),[...SOURCE_SUCCESSORS].sort());
  const before=new Map(uniqueRows(source.map(x=>rowForRunner(x))).map(x=>[x.path,x]));
  const after=new Map(uniqueRows(post.map(x=>rowForRunner(x))).map(x=>[x.path,x]));
  const derivations=[];
  for(const change of changes) {
    assert.equal(change.producer,'scripts/generate-product-manifest.mjs');assert.equal(change.receipt,'commands/generate.result.json');
    assert.equal(change.before.path,change.after.path);
    const b=rowForRunner(change.before),a=rowForRunner(change.after);
    assert.deepEqual(before.get(b.path),b,'exact immutable source preimage');
    assert.deepEqual(after.get(a.path),a,'exact generated afterimage');
    assert.notEqual(a.sha256,b.sha256,'explicit producer successor');
    before.set(a.path,a);derivations.push(change);
  }
  for(const [path,row] of before)assert.deepEqual(after.get(path),row,'unexpected source delta: '+path);
  const tenant=[],context=[];
  for(const row of before.values())(row.path.startsWith(TENANT+'/')?tenant:context).push(
    row.path.startsWith(TENANT+'/')?{...row,path:stripTenant(row.path)}:row);
  return {tenant:uniqueRows(tenant),context:uniqueRows(context),derivations};
}
export async function translateClosed(binding) {
  assert.equal(binding.kind,'t287_closed_candidate_inventory_binding');
  assert.equal(binding.status,'closed_candidate_selected','pending template is not a closed subject');
  assert.equal(binding.subjectId,'candidate');
  const repo=await realpath(binding.repoRoot),closed=await realpath(binding.closedRoot);
  const stage=join(closed,'stage'),tenant=join(stage,TENANT);
  assert.equal(tenant,await realpath(tenant));
  assert.ok(!/\/combined-final-01$/u.test(closed),'historical final01 is not this subject');
  assert.ok(closed.startsWith(join(repo,'.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/')));
  assert.equal(binding.freeze.path,join(closed,'freeze.json'));
  const freeze=JSON.parse(await pinned(binding.freeze));assert.equal(freeze.status,'ready_for_separately_granted_L4');
  assert.ok(freeze.files.length>0);
  const frozen=new Map();
  for(const x of freeze.files) {
    const row=rowForRunner(x);await checkRow(repo,row);
    const absolute=join(repo,row.path);assert.ok(inside(closed,absolute),'closed subject row containment');
    if(row.type==='symlink')assert.ok(inside(closed,await realpath(absolute)),'closed subject link containment');
    assert.ok(!frozen.has(absolute));frozen.set(absolute,row);
  }
  const get=async name=>{
    const path=join(closed,name);assert.ok(frozen.has(path),'input absent from frozen subject: '+name);
    return object(path);
  };
  const candidate=await get('candidate.json');assert.equal(candidate.status,'ready_for_separately_granted_L4');
  const archive=resolve(repo,candidate.archive.path),manifest=resolve(repo,candidate.manifest.path);
  for(const [path,entry] of [[archive,candidate.archive],[manifest,candidate.manifest]]) {
    assert.ok(frozen.has(path));assert.deepEqual(identity(rowForRunner(entry)),identity(frozen.get(path)));
  }
  assert.equal(manifest,join(tenant,'product-toolchain-manifest.json'));
  const m=await object(manifest);assert.equal(m.productContentDigest,candidate.productContentDigest);
  const source=await get('source-union-manifest.json'),post=await get('stage-post-generation-inventory.json');
  const correspondence=await get('source-generated-correspondence.json');
  const selected=translateSource(source.files,post.files,correspondence);
  const generated=uniqueRows((await get('generated-inventory.json')).files.map(x=>rowForRunner(x,stripTenant(x.path))));
  const dependencies=uniqueRows((await get('dependency-inventory.json')).files.map(x=>rowForRunner(x,'node_modules/'+x.path)));
  const supportAll=await get('support-manifest.json');const supportByPath=new Map();
  for(const x of supportAll.files) {
    assert.ok(safeRelative(x.tenantPath));assert.equal(resolve(repo,x.path),join(tenant,x.tenantPath));
    assert.ok(!supportByPath.has(x.tenantPath));supportByPath.set(x.tenantPath,x);
  }
  const support=uniqueRows(SUPPORT.map(path=>{assert.ok(supportByPath.has(path),'missing selected support '+path);return rowForRunner(supportByPath.get(path),path);}));
  assert.ok(support.every(x=>!x.path.includes('native-registered-selection.mjs')));
  const members=await get('archive-members.json'),packageProof=await get('package-source-correspondence.json');
  assert.equal(members.all_bytes_match_stage,true);assert.equal(packageProof.all_archive_member_bytes_match_stage,true);
  assert.equal(packageProof.all_archive_modes_match_npm_projection,true);
  assert.equal(members.archive.sha256,candidate.archive.sha256);assert.equal(packageProof.archive.sha256,candidate.archive.sha256);
  const packageRows=uniqueRows(members.files.map(x=>rowForRunner(x)));assert.equal(packageRows.length,candidate.archiveMembers);
  for(const x of members.files) {
    const row=rowForRunner(x);await checkRow(tenant,{...row,mode:x.stage_mode??row.mode});
  }
  for(const [root,rows] of [[tenant,selected.tenant],[stage,selected.context],[tenant,generated],[tenant,dependencies],[tenant,support]])for(const row of rows)await checkRow(root,row);
  // Output begins only after exact complete closed-subject and translation checks.
  const out=binding.outputRoot,allowed=resolve(dirname(fileURLToPath(import.meta.url)),'..');
  assert.ok(isAbsolute(out)&&resolve(out)===out&&inside(allowed,out)&&out!==allowed);
  assert.equal(dirname(out),allowed,'new sibling binding directory only');
  try{await lstat(out);assert.fail('output already exists');}catch(e){if(e.code!=='ENOENT')throw e;}
  await mkdir(out);assert.equal(await realpath(out),out);
  const write=async(name,value)=>{const path=join(out,name),bytes=JSON.stringify(value,null,2)+'\n';await writeFile(path,bytes,{flag:'wx'});return {path,sha256:sha(bytes)};};
  const inventories=[];
  for(const [name,root,rows] of [['source',tenant,selected.tenant],['source-context',stage,selected.context],['generated',tenant,generated],['dependencies',tenant,dependencies]]) {
    assert.ok(rows.length>0);inventories.push({...await write(name+'-inventory.json',{files:rows}),root});
  }
  const supportManifest=await write('selected-support.json',{files:support});
  const packageInventory=await write('package-inventory.json',{files:packageRows});
  const sourceAfterimages=await write('source-afterimages.json',{derived_source_successors:selected.derivations,all_other_source_inputs_unchanged:true,
    originalCorrespondence:{path:join(closed,'source-generated-correspondence.json'),sha256:frozen.get(join(closed,'source-generated-correspondence.json')).sha256}});
  const subject={id:'candidate',stageTenant:tenant,archive:{path:archive,sha256:candidate.archive.sha256},manifest:{path:manifest,sha256:candidate.manifest.sha256},packageInventory,supportManifest,inventories};
  const result={status:'NOT_GRANTED',subject,closedFreeze:binding.freeze,candidateRecord:{path:join(closed,'candidate.json'),sha256:frozen.get(join(closed,'candidate.json')).sha256},
    productContentDigest:candidate.productContentDigest,sourceAfterimages,counts:{closedRows:frozen.size,tenantSource:selected.tenant.length,contextSource:selected.context.length,generated:generated.length,dependencies:dependencies.length,support:support.length,packageMembers:packageRows.length},
    effects:'record translation only; no Product import, source mutation, runtime allocation or execution grant'};
  await write('subject.NOT_GRANTED.json',result);return result;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  assert.equal(process.argv.length,3,'node translate-inventories.mjs CLOSED_BINDING_JSON');
  const result=await translateClosed(await object(resolve(process.argv[2])));
  process.stdout.write(JSON.stringify({status:result.status,counts:result.counts,archive:result.subject.archive})+'\n');
}
