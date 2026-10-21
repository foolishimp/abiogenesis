import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lstat,readFile,writeFile,mkdir} from 'node:fs/promises';
import {join,relative,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const R=fileURLToPath(new URL('.',import.meta.url)).replace(/\/$/u,''),W=resolve(R,'../..');
const old=join(W,'realization/l4-final-candidate-04'),C=join(W,'realization/c2-source-prefix-candidate-01');
const stage=join(C,'stage'),T=join(stage,'build_tenants/abiogenesis/typescript');
const runtime='/private/tmp/abg-stdo3-c2-05-2a945e70cf0d6b81';
const priorRuntime='/private/tmp/abg-stdo3-final-04-6f42d9a31e5870bc';
const sha=b=>createHash('sha256').update(b).digest('hex'),read=async p=>JSON.parse(await readFile(p,'utf8'));
const pins=[];
async function pin(path,expected){const b=await readFile(path),s=await lstat(path),h=sha(b);if(expected)assert.equal(h,expected,path);const p={path,sha256:h,bytes:b.length,mode:'0o'+(s.mode&0o777).toString(8)};pins.push(p);return p;}
async function put(name,v){const p=join(R,name);await mkdir(join(p,'..'),{recursive:true});await writeFile(p,JSON.stringify(v,null,2)+'\n',{flag:'wx'});return pin(p);}
const freeze=await pin(join(C,'freeze.json'),'96b9ce2062ab04f1a456ba28d3122160e1093d8b6ecdfb88ae1cd8b6f0338ee8');
const frozen=await read(freeze.path);assert.equal(frozen.status,'candidate_ready');
const rows=new Map(frozen.files.map(x=>[x.path,x]));
const get=async name=>{const p=await pin(join(C,name),rows.get(name).sha256);return {pin:p,value:await read(p.path)};};
const predecessor=await pin(join(old,'freeze.json'),'e58e78c1a3c1b4086ba5d5f16dd1676105c99059a5fc31377c00eaa37e24fbce');
const translator=await pin(join(W,'realization/l4-final-candidate-02/preparation/translate-inventories.mjs'));
const {rowForRunner,uniqueRows,TENANT}=await import(pathToFileURL(translator.path).href);
const oldBinding=await read(join(old,'intake/input-pins.json'));
assert.equal(translator.sha256,oldBinding.pins.find(x=>x.path===translator.path).sha256);
const selected={};for(const n of ['source-inputs.json','generated-inventory.json','dependency-inputs.json','stage-post-generation-inventory.json','emitted-correspondence.json','package-source-correspondence.json','archive-members.json','archive-member-delta.json','archive-payload-owner-result.json','complete-delta.json'])selected[n]=await get(n);
const src=selected['source-inputs.json'].value,gen=selected['generated-inventory.json'].value,deps=selected['dependency-inputs.json'].value;
const sources=new Map(src.files.map(x=>{const r=rowForRunner(x);return [r.path,r];}));
const post=new Map(selected['stage-post-generation-inventory.json'].value.files.map(x=>{const r=rowForRunner(x);return [r.path,r];}));
const emitted=selected['emitted-correspondence.json'].value;
assert.equal(src.noOtherSourceDelta,true);assert.equal(deps.allBytesModesTargetsExact,true);assert.equal(deps.sharedWritableInodes,0);
assert.deepEqual(emitted.sourceDerivedChanges.map(x=>x.before.path),[TENANT+'/contracts/capabilities/capability-definition-graph.json']);
for(const x of emitted.sourceDerivedChanges){assert.deepEqual(sources.get(x.before.path),rowForRunner(x.before));sources.set(x.after.path,rowForRunner(x.after));}
for(const [p,r]of sources)assert.deepEqual(post.get(p),r,p);
assert.equal(sources.size,1320);assert.equal(gen.files.length,940);assert.equal(deps.files.length,4576);
const oldSupport=await pin(join(old,'intake/selected-support.json'),'00eff68a7329e05420c7669dac48fdbc717acca880a361e865aecb934b549665');
const support=await read(oldSupport.path);assert.equal(support.files.length,14);
for(const r of support.files)assert.deepEqual(sources.get(TENANT+'/'+r.path),{...r,path:TENANT+'/'+r.path});
const sourceView=await put('intake/stage-source-inventory.json',{files:uniqueRows([...sources.values()])});
const supportView=await put('intake/selected-support.json',support);
const members=selected['archive-members.json'].value,pack=selected['package-source-correspondence.json'].value,delta=selected['archive-member-delta.json'].value;
assert.equal(members.files.length,5271);assert.equal(pack.all_archive_member_bytes_match_stage,true);assert.equal(pack.all_archive_modes_match_npm_projection,true);assert.equal(pack.stage_unchanged_by_pack,true);
assert.deepEqual(delta.added,[]);assert.deepEqual(delta.removed,[]);
assert.deepEqual(delta.changes.map(x=>x.after.path).sort(),['build/code/src/abg/execution_basis.js','contracts/capabilities/capability-definition-graph.json','product-toolchain-manifest.json'].sort());
const archive=await pin(join(C,'artifacts/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz'),'fadd07e06799be957087419527c683ce18650ecf0abfe669c0f28e034d84aef6');assert.equal(archive.bytes,10681875);
const manifest=await pin(join(T,'product-toolchain-manifest.json'),'51de2eb3af366ce1089f074d56258312620266f67759344acc549966447c6a84');
assert.equal(selected['archive-members.json'].pin.sha256,'4623ff7a5c388cd43ffb9726bad5824811ae06cfb3b3d9dfc2920babb2a6c850');
const payload=selected['archive-payload-owner-result.json'].value;assert.equal(payload.status,'satisfied');assert.equal(payload.actualProductContentDigest,'sha256:349c24b4c4cc15431d92a5d6f46f48420367f56a8d25dc1fb2cbb97f44a3e5d3');
assert.equal((await read(manifest.path)).productContentDigest,payload.actualProductContentDigest);
const oldClosurePin=await pin(join(old,'intake/archive-closure.json'),'d0b211d48703e9fd14160e91e8beaa004779cdba5c64f5de5d5923287ec4e587');
const closure=await read(oldClosurePin.path),memberMap=new Map(members.files.map(x=>[x.path,x]));
assert.equal(closure.status,'satisfied');assert.equal(closure.packageCount,14);assert.equal(closure.edgeCount,17);
for(const x of closure.packageRelations)assert.equal(memberMap.get(x.path).sha256,x.current.sha256);
for(const x of closure.edges){if(x.target)assert.equal(memberMap.get(x.target).sha256,x.metadataSha256);else for(const p of x.candidates)assert.equal(memberMap.has(p),false);}
const archiveClosure=await put('intake/archive-closure.json',{status:'satisfied',archive,predecessor:oldClosurePin,packageCount:14,edgeCount:17,relation:'All 14 runtime package metadata bytes and all 17 dependency/peer edges are conserved in the exact closed member inventory; only the three declared non-package-metadata members changed. Empty offline seeds remain sufficient; no runtime receipt transferred.'});
const seed=await put('intake/empty-seed.json',{kind:'explicit_empty_seed',files:[],sourceRoot:null,selectedBy:'/root',basis:archiveClosure,globalCacheRead:false,globalCacheWrite:false,networkFallback:false});
const subject={id:'candidate',stageTenant:T,archive,manifest,packageInventory:selected['archive-members.json'].pin,supportManifest:supportView,inventories:[{...sourceView,root:stage},{...selected['generated-inventory.json'].pin,root:stage},{...selected['dependency-inputs.json'].pin,root:join(T,'node_modules')}]};
try{await lstat(runtime);assert.fail('runtime parent already exists');}catch(e){if(e.code!=='ENOENT')throw e;}
const absent=await put('intake/resource-preconditions.json',{status:'parent_absent_before_allocation',runtime,realParent:'/private/tmp',maxAdditionalRetainedBytes:4294967296,cleanup:false});
for(const name of ['npmrc.user','npmrc.global'])await writeFile(join(R,'intake',name),'',{flag:'wx'});
const npmrc=[await pin(join(R,'intake/npmrc.user')),await pin(join(R,'intake/npmrc.global'))];
const runner=await pin(join(W,'proof/run-installed.mjs'),'fb20ffc2a5f3bdfcbbbebc51e68d17ac1ec52b4fc20093aaa652efcfd84a7164');
const oracle=await pin(join(W,'realization/proof/oracle.mjs'),'dee13b0b642c9b3184d5ed27a5ee1bbd07a951c19b7481469bc4a681aff995dc');
const owner=await pin(join(W,'realization/final-proof-preparation-01/owner-resolution.mjs'),'ec16ec05680ec4702302482cc9d121e715da79ef85819c43ea6b20ae5ac05185');
const supervisor=await pin(join(W,'realization/hog-final06-binding-01/execution/run-command.py'),'270a6cd23729666dc788f2b89473f2d9be27003905d94146ab994d45f7f347d1');
const retain=await pin(join(W,'realization/l4-final-candidate-02/execution-intake-01/retain-lane.py'));
const rebase=v=>typeof v==='string'?v.replaceAll(priorRuntime,runtime).replaceAll('t287-final04-','t287-c2-05-').replaceAll('6f42d9a31e5870bc','2a945e70cf0d6b81').replaceAll(old,R):Array.isArray(v)?v.map(rebase):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,rebase(x)])):v;
for(const lane of ['p1','p2','p3','owner-resolution']){
 const c=rebase(await read(join(old,lane,'configuration.json'))),g=rebase(await read(join(old,lane,'effect-grant.json')));
 c.status='NOT_ACTIVATED';g.status='NOT_GRANTED';delete g.configurationSha256;delete g.runtimeCondition;
 g.rootActivation='L4-C2-CANDIDATE-INTEGRATION-05';g.maxAdditionalRetainedBytes=4294967296;
 c.environment.npm_config_userconfig=npmrc[0].path;c.environment.npm_config_globalconfig=npmrc[1].path;
 if(lane!=='owner-resolution'){c.subject=subject;c.requiredEvidence=[];g.npmCache.seedInventory=seed;g.npmCache.status='granted explicit empty seed after lane activation';}
 else{delete c.installedRoot;delete c.p1;c.installedInventory=subject.packageInventory;c.requiredPins=[archive,subject.packageInventory,supportView,freeze];}
 if(lane==='p2')for(const key of ['preparationResult','preparationSetup','verificationCall','verificationOutcome'])delete c.lanes['partial-install'][key];
 await put('intake/'+lane+'.configuration.template.json',c);await put('intake/'+lane+'.grant.template.json',g);
}
const activation=await put('activation.json',{activation:'L4-C2-CANDIDATE-INTEGRATION-05',issuedBy:'/root',writer:'/root/stdo3_final_proof_writer',frame:'repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration',method:'stdo://releases/v3.0.0-rc.1/',manifestSha256:'069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232',composition:[],candidate:freeze,sequence:['P1','owner-resolution','P2','P3','three repaired HoG cases after new P1-P3 success'],runtime,limits:{maxP1P3RetainedBytes:4294967296,maxHoGRetainedBytes:4294967296,realNativeProviderCalls:0,retries:0},authority:'Root explicitly grants dependent binding and execution once when each prior original endpoint passes. Freeze exact config/grant before each effect. Stop first genuine failure. P5 runs separately; P4 and L5 are not granted.',environment:'Original explicit runtime environment omits NODE_OPTIONS; outer supervisory launch clears ambient NODE_OPTIONS. Distinct empty task npmrc files override user/global configuration; exact offline dependency closure and task caches only.'});
await writeFile(join(R,'HOW.md'),'# L4 C2 candidate integration 05\n\nExecute the original P1 → read-only owner-resolution → P2 → P3 sequence on the exact C2 successor. Reuse final04 controls and typed-row translation; only candidate identity, exact afterimages, isolated resources and observed prerequisite pins change. Each original preflight owns the full input check. There is no extra manual full-tree scan.\n\nThe selected package has exactly three member deltas: execution_basis JavaScript and its two existing generated identity carriers. The source fix and design note remain the separate closed Writer subject. The 14 runtime package metadata files, 17 edges and selected 14 supports preserve the offline relation. Empty caches and distinct empty npmrc files are explicit.\n\nBefore each effect, freeze the exact active configuration, grant, command, environment and supervisor. Run the unchanged endpoint with its unchanged inner limits under the existing finite 1,800-second process-group supervisor. Preserve stdout/stderr and original receipts, cleanup callbacks and all physical roots. Stop on the first actual failure with no repair or retry. Use the existing finite evidence copier once per endpoint; it retains originals.\n\nAfter P1/P2/P3 success, bind the corrected HoG driver and actual new P1 evidence before its three original cases. Keep zero native/provider calls, 4 GiB per allocated proof scope, no main936 or old-cut changes, no continuation17 access, no Git, no P4 and no L5 acceptance.\n',{flag:'wx'});
await put('intake/input-pins.json',{pins,selected:Object.fromEntries(Object.entries(selected).map(([k,v])=>[k,v.pin])),predecessor,freeze,runner,oracle,owner,supervisor,retain,npmrc,activation});
await put('intake/binding-result.json',{status:'bound_for_original_lane_activation',subject,freeze,predecessor,runner,oracle,owner,supervisor,retain,seed,archiveClosure,runtime,counts:{source:1320,generated:940,dependencies:4576,support:14,archiveMembers:5271},resourcePreconditions:absent,noRuntimeYet:true});
console.log(JSON.stringify({status:'bound',runtime,archive:archive.sha256,source:1320,support:14}));
