// External identity check only. No build, pack, install, Product import or verdict.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {T,VERSION,GENERATED,archiveMembers,inventory,hex,pin,writeOnce,parseArgs,required} from './cut-common.mjs';
const usage='node freeze-candidate-inputs.mjs --record CUT_RECORD.json --root FINAL_CLEAN_ROOT --commit SHA --tree SHA --output EXTERNAL_RECEIPT';
const a=parseArgs(process.argv.slice(2),{values:['record','root','commit','tree','output'],flags:[],usage});
required(a,['record','root','commit','tree','output'],usage);
const root=resolve(a.root),tenant=join(root,T),r=JSON.parse(readFileSync(a.record,'utf8'));
assert.equal(r.stage,'prospective_candidate_preparation');assert.equal(r.version,VERSION);
const git=(...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8',timeout:120000,maxBuffer:16777216,env:{...process.env,GIT_OPTIONAL_LOCKS:'0'}}).trim();
assert.equal(git('rev-parse','HEAD'),a.commit);assert.equal(git('rev-parse',a.commit+'^{tree}'),a.tree);
assert.equal(git('status','--porcelain=v1'),'','Final qualification source must be clean');
const derived=[...GENERATED,'test_env/fixtures/abi5-root-candidate-basis.json',
 'test_env/qualification/classification.json','test_env/qualification/recipe/expected-output-inventory.json',
 'test_env/qualification/recipe/declared-commands.json','test_env/qualification/recipe/verification-recipe.json',
 'test_env/qualification/tenant-manifest.json','test_env/qualification/resources.json','test_env/qualification/inventory.json'];
const changed=git('diff','--name-only',r.source.commit,a.commit,'--',T,'specification','AGENTS.md','CLAUDE.md','stdo_abiogenesis.json').split('\n').filter(Boolean);
assert(changed.every(path=>path.startsWith(T+'/')&&derived.includes(path.slice(T.length+1))),'Final source changed outside explicit derived metadata; re-enter the candidate basis');
assert.equal(pin(r.archive.path).sha256,r.archive.sha256);
const members=archiveMembers(r.archive.path),paths=new Set(members.map(row=>row.path));
for(const dir of ['build','contracts'])assert(inventory(join(r.buildRoot,dir),{hash:false}).every(row=>paths.has(dir+'/'+row.path)),'Unrepresented generated member in retained build');
for(const path of derived)if(!GENERATED.includes(path))assert(!paths.has(path),'Qualification metadata unexpectedly enters package payload');
for(const row of members)assert.equal(hex(readFileSync(join(r.buildRoot,row.path))),row.sha256,'Prepared payload changed: '+row.path);
for(const path of [...GENERATED,'test_env/fixtures/abi5-root-candidate-basis.json'])
 assert(readFileSync(join(tenant,path)).equals(readFileSync(join(r.buildRoot,path))),'Derived source differs from prepared candidate: '+path);
assert.equal(pin(join(tenant,'release-claim.md')).sha256,r.source.releaseClaim.sha256,'Frozen claim changed');
const expected=JSON.parse(readFileSync(join(tenant,'test_env/qualification/recipe/expected-output-inventory.json'),'utf8'));
assert.equal(expected.source.archive,r.archive.name);assert.equal(expected.source.archiveDigest,'sha256:'+r.archive.sha256);
assert.equal(expected.source.sourceCommit,r.source.commit,'Expected inventory must retain actual compile-input lineage');
assert.deepEqual(expected.files.map(row=>[row.path,row.digest,row.byteCount]),members.map(row=>[row.path,'sha256:'+row.sha256,row.bytes]));
writeOnce(resolve(a.output),{kind:'prospective_rc14_candidate_input_freeze',qualified:false,publicationAuthorized:false,
 compiledSource:r.source,qualificationSource:{root,commit:a.commit,tree:a.tree},allowedDerivedChanges:changed,
 archive:pin(r.archive.path),identity:r.identity,releaseClaim:pin(join(tenant,'release-claim.md')),
 inventory:pin(join(tenant,'test_env/qualification/inventory.json')),expectedOutputs:pin(join(tenant,'test_env/qualification/recipe/expected-output-inventory.json')),
 archiveMatchesPreparedBuild:true,generatedSourceMatchesCandidate:true,claim:'Identity correspondence only; AF22/AF25 retain qualification and publication authority.'});
