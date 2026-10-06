import assert from 'node:assert/strict';
import {readFile, readdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join, dirname, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const report=dirname(fileURLToPath(import.meta.url));
const candidate=join(report,'copied-tenant');
const baseline=join(dirname(report),'final-candidate-construction-03/final-install/node_modules/@abiogenesis/typescript-tenant');
const digest=bytes=>`sha256:${createHash('sha256').update(bytes).digest('hex')}`;
async function paths(root,prefix='') {
  const result=[];
  for (const entry of await readdir(join(root,prefix),{withFileTypes:true})) {
    const name=join(prefix,entry.name);
    if (entry.isDirectory()) result.push(...await paths(root,name));
    else if (entry.isFile()) result.push(name);
  }
  return result.sort();
}
const before=(await paths(join(baseline,'build/code/src'))).filter(x=>/\.d\.(?:c|m)?ts$/u.test(x));
const after=(await paths(join(candidate,'build/code/src'))).filter(x=>/\.d\.(?:c|m)?ts$/u.test(x));
assert.deepEqual(after,before,'complete emitted declaration file population');
const declarations=[];
for (const path of before) {
  const old=await readFile(join(baseline,'build/code/src',path)),fresh=await readFile(join(candidate,'build/code/src',path));
  assert.deepEqual(fresh,old,path);
  declarations.push({path:`build/code/src/${path}`,bytes:fresh.length,sha256:digest(fresh)});
}
const manifest=JSON.parse(await readFile(join(baseline,'product-toolchain-manifest.json'),'utf8'));
const catalog=manifest.publicContractCatalog;
const nativeRows=catalog.rows.filter(row=>row.nativeTypedLocator);
assert.equal(nativeRows.length,37);
const native=[];
for (const row of nativeRows) {
  for (const member of row.nativeTypedLocator.declarationInventory) {
    const old=await readFile(join(baseline,member.declarationPath)),fresh=await readFile(join(candidate,member.declarationPath));
    assert.equal(digest(old),member.declarationDigest,row.contractId+': baseline exact member');
    assert.equal(digest(fresh),member.declarationDigest,row.contractId+': fresh exact member');
  }
  native.push({contractId:row.contractId,contractDigest:row.contractDigest,owningProduct:row.owningProduct,capabilityIdentities:row.capabilityIdentities,nativeTypedLocator:row.nativeTypedLocator});
}
const contractPaths=await paths(join(baseline,'contracts'));
const contracts=[];
for(const path of contractPaths) {
  const old=await readFile(join(baseline,'contracts',path)),fresh=await readFile(join(candidate,'contracts',path));
  assert.deepEqual(fresh,old,path);
  contracts.push({path:`contracts/${path}`,bytes:fresh.length,sha256:digest(fresh)});
}
const result={kind:'mechanical_exact_public_native_declaration_conservation',passed:true,baseline,candidate,emittedDeclarationFiles:declarations.length,emittedDeclarations:declarations,nativeRows:native.length,nativeContracts:native,contracts:contracts.length,contractFiles:contracts,catalogRowsDigest:digest(Buffer.from(JSON.stringify(catalog.rows))),declaredCapabilityRefs:manifest.declaredCapabilityRefs,capabilityDefinitionGraph:manifest.capabilityDefinitionGraph,limit:'C03 public/native declarations and contract/capability payloads are exactly conserved in this mechanical source build; preserved C03 manifest is a compiler-basis input only. No successor manifest, Product verification, installed Public lock or wrapper identity is produced.'};
await writeFile(join(report,'proof/declaration-conservation.json'),JSON.stringify(result,null,2)+'\n');
process.stdout.write(JSON.stringify({passed:true,declarations:declarations.length,nativeRows:native.length,contracts:contracts.length})+'\n');
