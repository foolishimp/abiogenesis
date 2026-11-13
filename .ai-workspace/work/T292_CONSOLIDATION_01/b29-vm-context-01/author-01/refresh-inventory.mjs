// T292 B29 only: unchanged payload, four changed proof sources, inventory last.
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const [rootArg,receipt] = process.argv.slice(2);
assert(rootArg && receipt);
const root = resolve(rootArg), Q = 'test_env/qualification';
const load = p => import(pathToFileURL(join(root,p)).href);
const {classification,constructInventory} = await load(Q+'/build-resources.mjs');
const preparation = await load('build/code/src/qualification/m05.js');
const old = JSON.parse(readFileSync(join(root,Q,'inventory.json')));
const inventory = await constructInventory({preparation}, await classification(root), root);
assert.equal(inventory.members.length,1280);
assert.deepEqual(inventory.members.map(m=>m.path),old.members.map(m=>m.path));
const delta = inventory.members.filter((m,i)=>JSON.stringify(m)!==JSON.stringify(old.members[i])).map(m=>m.path);
assert.deepEqual(delta,[
  'build_tenants/abiogenesis/typescript/test_env/support/d2-binding-harness.mjs',
  'build_tenants/abiogenesis/typescript/test_env/support/d2-evidence-owner-harness.mjs',
  'build_tenants/abiogenesis/typescript/test_env/tests/d2-binding-transition.test.mjs',
  'build_tenants/abiogenesis/typescript/test_env/tests/d2-evidence-owner-lookup.test.mjs'
]);
assert(!inventory.members.some(m=>m.path.endsWith('/qualification/inventory.json')));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const before = sha(readFileSync(join(root,Q,'inventory.json')));
writeFileSync(join(root,Q,'inventory.json'),JSON.stringify(inventory)+'\n');
const record = {activation:'T292-B29-INTEGRATION-INVENTORY-01',
  owner:'test_env/qualification/build-resources.mjs:constructInventory',
  sourceBeforeInventoryCheckpoint:execFileSync('/usr/bin/git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),
  memberCount:inventory.members.length,changedMembers:delta,inventoryRef:inventory.inventoryRef,
  inventoryDigest:inventory.inventoryDigest,beforeSha256:before,
  afterSha256:sha(readFileSync(join(root,Q,'inventory.json'))),selfExcluded:true,
  recipeUnchanged:'No path or command configuration change; source inputs are path references.',
  runtimePayloadUnchanged:true,qualification:false};
writeFileSync(receipt,JSON.stringify(record,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(record,null,2));
