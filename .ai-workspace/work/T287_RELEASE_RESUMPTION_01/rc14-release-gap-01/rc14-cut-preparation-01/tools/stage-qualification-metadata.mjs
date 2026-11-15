// External derived-metadata preparation; existing constructors retain their law.
// This script is not activated by its presence. Root must grant exact source writes.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,copyFileSync,mkdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {T,VERSION,FROM_VERSION,GENERATED,archiveMembers,pin,parseArgs,required,childEnvironment,run} from './cut-common.mjs';
const usage='node stage-qualification-metadata.mjs --root SOURCE --record CUT_RECORD.json --package ACTUAL_PUBLIC_INSTALL --install-record PUBLIC_IDENTITY.json --scratch FRESH_DIR';
const a=parseArgs(process.argv.slice(2),{values:['root','record','package','install-record','scratch'],flags:[],usage});
required(a,['root','record','package','install-record','scratch'],usage);
const root=resolve(a.root),tenant=join(root,T),scratch=resolve(a.scratch),q=join(tenant,'test_env/qualification');
const read=p=>JSON.parse(readFileSync(p,'utf8')),write=(p,v)=>writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const r=read(a.record),installed=read(a['install-record']).install,pkg=read(join(a.package,'package.json'));
assert.equal(r.stage,'prospective_candidate_preparation');assert.equal(r.version,VERSION);
assert.equal(pkg.version,VERSION);assert.equal(pkg.name,'@abiogenesis/typescript-tenant');
assert(installed,'Actual maintained Public install identity with .install is required; no synthesized carrier');
assert.equal(installed.installedRoot,resolve(a.package));assert.equal(installed.artifactDigest,'sha256:'+r.archive.sha256);
assert.equal(pin(r.archive.path).sha256,r.archive.sha256);assert.equal(pin(join(tenant,'release-claim.md')).sha256,r.source.releaseClaim.sha256);
assert.equal(read(join(tenant,'package.json')).version,VERSION);
const rows=archiveMembers(r.archive.path),old=read(join(q,'recipe/expected-output-inventory.json'));
const declared=read(join(q,'recipe/declared-commands.json'));
const compare=declared.outcomePredicates.filter(p=>p.predicateId==='predicate://abiogenesis/qualification/candidate-pack-reproduced');
assert.equal(compare.length,1);assert.equal(compare[0].predicateKind,'stdout_exact');
assert.equal(compare[0].declaration.validationCommandId,'command://abiogenesis/qualification/compare');
mkdirSync(scratch);const env=childEnvironment(scratch);
for(const p of [...GENERATED,'test_env/fixtures/abi5-root-candidate-basis.json'])copyFileSync(join(r.buildRoot,p),join(tenant,p));
// Only the classified current-candidate declaration is restated; historical fixture literals stay intact.
const current=read(join(q,'classification.json'));
const restate=v=>typeof v==='string'?v.split(FROM_VERSION).join(VERSION):Array.isArray(v)?v.map(restate):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,restate(x)])):v;
write(join(q,'classification.json'),restate(current));
write(join(q,'recipe/expected-output-inventory.json'),{...old,source:{archive:r.archive.name,archiveDigest:'sha256:'+r.archive.sha256,
 sourceCommit:r.source.commit,method:'every file of the exact prepared archive package/ root, by relative path'},
 files:rows.map(row=>({path:row.path,digest:'sha256:'+row.sha256,byteCount:row.bytes}))});
compare[0].declaration.equals=`candidate pack reproduced: ${rows.length} files\n`;write(join(q,'recipe/declared-commands.json'),declared);
run('qualification-metadata',process.execPath,['test_env/qualification/build-resources.mjs','--package',resolve(a.package),
 '--install-record',resolve(a['install-record']),'--scratch',join(scratch,'owner')],{cwd:tenant,env,timeoutMs:600000,logDir:join(scratch,'commands')});
