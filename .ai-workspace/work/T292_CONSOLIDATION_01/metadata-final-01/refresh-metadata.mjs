// B22's bounded metadata projection. Execute only under the final metadata grant.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join,basename,resolve} from 'node:path';
import {archiveMembers,hex,pin,writeOnce} from '/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T292_CONSOLIDATION_01/rc13-local-cut-01/cut/cut-common.mjs';
const [rootArg,archiveArg,commit,receiptArg]=process.argv.slice(2);
assert(rootArg && archiveArg && /^[0-9a-f]{40}$/.test(commit) && receiptArg);
const root=resolve(rootArg),archive=resolve(archiveArg),receipt=resolve(receiptArg);
assert(!existsSync(receipt),'receipt must be new');
const Q='test_env/qualification';
const read=p=>JSON.parse(readFileSync(join(root,p),'utf8'));
const c=read(Q+'/classification.json'),d=read(Q+'/recipe/declared-commands.json');
const expected=read(Q+'/recipe/expected-output-inventory.json');
const authority=read('contracts/qualification/authority-inputs.json');
const basis=read('test_env/fixtures/abi5-root-candidate-basis.json');
const rows=archiveMembers(archive),archivePin=pin(archive);
assert.equal(basis.packageVersion,'5.0.0-rc.13');
assert.equal(basis.artifactDigest,'sha256:'+archivePin.sha256);
const retired=new Set([
 'test_env/qualification/fixtures/rp2-correction-product.mjs',
 'test_env/tests/t287-multi-candidate-admission.test.mjs',
 'test_env/tests/t287-native-selection-profile-scope.test.mjs',
 'test_env/tests/t287-rp2-correction-carriers.test.mjs',
 'test_env/tests/t287-selected-action.test.mjs',
 'test_env/uat/continuation.test.mjs',
]);
for(const p of retired)assert(!existsSync(join(root,p)),`retired path exists: ${p}`);
const retiredSchema='contracts/schemas/consensus.schema.json';
assert(!existsSync(join(root,retiredSchema)));
const beforeCommands=d.commands.length,beforeLint=d.lint.files.length;
d.lint.files=d.lint.files.filter(r=>!retired.has(r.path));
const emptyCommands=new Set();
d.tests=d.tests.map(r=>{
 const files=r.files.filter(p=>!retired.has(p));
 if(!files.length)emptyCommands.add(r.commandId);
 return {...r,files};
}).filter(r=>r.files.length);
assert.deepEqual([...emptyCommands],['command://abiogenesis/qualification/test-uat-continuation']);
d.commands=d.commands.filter(r=>!emptyCommands.has(r.commandId)).map(r=>({...r,args:r.args.filter(p=>!retired.has(p))}));
for(const group of d.tests){
 const command=d.commands.find(r=>r.commandId===group.commandId);assert(command);
 for(const p of group.files){assert(existsSync(join(root,p)),`kept test missing: ${p}`);assert(command.args.includes(p));}
}
for(const row of d.lint.files)assert(existsSync(join(root,row.path)),`kept lint member missing: ${row.path}`);
const withoutSchema=roots=>{
 assert.equal(roots.filter(r=>r.pathKind==='file' && r.relativePath===retiredSchema).length,1);
 return roots.filter(r=>r.relativePath!==retiredSchema);
};
d.allowedWriteTerritories=withoutSchema(d.allowedWriteTerritories);
expected.generatedRoots=withoutSchema(expected.generatedRoots);
const predicate=d.outcomePredicates.find(r=>r.predicateId==='predicate://abiogenesis/qualification/candidate-pack-reproduced');
assert.equal(predicate.declaration.equals,'candidate pack reproduced: 5317 files\n');
predicate.declaration.equals=`candidate pack reproduced: ${rows.length} files\n`;
d.purpose='The declared C2 command input of the verification recipe; verification-recipe.json binds its constructed digests. The C2 helper runs commands in its snapshot sandbox, so commands use relative paths. ABI5_EVIDENCE_ROOT is an absolute external fixture path read outside that sandbox and unprotected by the recipe by declaration. Those retained fixtures are historical inputs, not newly obtained RC13 execution evidence.';
assert(c.purpose.includes('pre-RC candidate') && c.purpose.includes('5.0.0-rc.1'));
c.purpose=c.purpose.replace('pre-RC candidate','local unqualified candidate').replace('5.0.0-rc.1','5.0.0-rc.13');
assert(c.outsideSelectedRoots[0].reason.includes("catalog's 95 sources"));
c.outsideSelectedRoots[0].reason=c.outsideSelectedRoots[0].reason.replace("catalog's 95 sources",`catalog's ${authority.sources.length} sources`);
assert.equal(c.roles[0].id,'release-claim');
assert(c.roles[0].reason.includes('5.0.0-rc.1'));
c.roles[0].reason=c.roles[0].reason.replace('5.0.0-rc.1','5.0.0-rc.13');
assert.deepEqual(c.surfaceGroups.ownerRefs,['product://abiogenesis/typescript-tenant@5.0.0-rc.1']);
c.surfaceGroups.ownerRefs=['product://abiogenesis/typescript-tenant@5.0.0-rc.13'];
for(const id of ['release-method','identity-method','method-standards']){
 const family=c.applicationDomains.families.find(r=>r.id===id);assert(family);
 const value=JSON.stringify(family.match);assert(value.includes('stdo://releases/v3.0.2/'));
 family.match=JSON.parse(value.replaceAll('stdo://releases/v3.0.2/','stdo://releases/v3.0.4/'));
}
expected.source={archive:basename(archive),archiveDigest:'sha256:'+archivePin.sha256,sourceCommit:commit,method:'every file of the extracted archive package/ root, by relative path'};
expected.files=rows.map(({path,bytes,sha256})=>({path,digest:'sha256:'+sha256,byteCount:bytes}));
const outputs=[[Q+'/classification.json',c],[Q+'/recipe/declared-commands.json',d],[Q+'/recipe/expected-output-inventory.json',expected]];
const changes=outputs.map(([p,value])=>({path:p,before:pin(join(root,p)),data:JSON.stringify(value,null,2)+'\n'}));
for(const r of changes)writeFileSync(join(root,r.path),r.data);
writeOnce(receipt,{activation:'T292-B22-FINAL-METADATA-01',claim:'metadata correspondence only; no qualification or command execution',sourceCommit:commit,archive:archivePin,archiveMembers:rows.length,authoritySourceCount:authority.sources.length,retiredPaths:[...retired,retiredSchema],removedCommands:[...emptyCommands],commandCounts:[beforeCommands,d.commands.length],lintCounts:[beforeLint,d.lint.files.length],changes:changes.map(({path,before})=>({path,before,after:pin(join(root,path))}))});
console.log(JSON.stringify({archiveMembers:rows.length,commands:d.commands.length,lintFiles:d.lint.files.length,receipt}));
