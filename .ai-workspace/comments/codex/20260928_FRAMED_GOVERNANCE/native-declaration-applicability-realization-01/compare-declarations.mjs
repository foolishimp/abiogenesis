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
const sourceContracts=[];
for (const path of await paths(join(candidate,'contracts'))) {
  const fresh=await readFile(join(candidate,'contracts',path));
  const old=await readFile(join(dirname(report),'final-candidate-construction-03/final-source/build_tenants/abiogenesis/typescript/contracts',path));
  assert.deepEqual(fresh,old,path+': exact frozen source population');
  sourceContracts.push({path:`contracts/${path}`,bytes:fresh.length,sha256:digest(fresh)});
}
const generatedAssetReferences=[];
for(const path of [...new Set([...catalog.rows.flatMap(row=>row.assetLocator ? [row.assetLocator.path] : []),manifest.capabilityDefinitionGraph.assetLocator.path])].sort()) {
  const old=await readFile(join(baseline,path));
  let fresh;try {fresh=await readFile(join(candidate,path));} catch(error) {if(error.code!=='ENOENT')throw error;}
  generatedAssetReferences.push({path,bytes:old.length,sha256:digest(old),candidateSourceStatus:fresh===undefined?'generated artifact absent from frozen source':digest(fresh)===digest(old)?'same exact body':'source population differs from generated installed body',credit:'immutable C03 reference only; successor generation and verification pending'});
}
const result={kind:'mechanical_exact_public_native_declaration_conservation',passed:true,baseline,candidate,emittedDeclarationFiles:declarations.length,emittedDeclarations:declarations,nativeRows:native.length,nativeContracts:native,sourceContractFiles:sourceContracts,catalogRowsReferenceDigest:digest(Buffer.from(JSON.stringify(catalog.rows))),declaredCapabilityRefsReference:manifest.declaredCapabilityRefs,capabilityDefinitionGraphReference:manifest.capabilityDefinitionGraph,generatedAssetReferences,limit:'Every emitted public/native declaration and all 37 native-row declaration inventories are exact C03 bytes. All frozen source contract inputs are preserved. Catalog/capability rows and generated asset payloads are C03 reference inputs, not freshly constructed candidate claims. Successor construction must regenerate and verify these payloads. C03 manifest is a compiler-basis input only; no successor Product, Public lock or installed-runtime credit.'};
await writeFile(join(report,'proof/declaration-conservation.json'),JSON.stringify(result,null,2)+'\n');
process.stdout.write(JSON.stringify({passed:true,declarations:declarations.length,nativeRows:native.length,sourceContracts:sourceContracts.length,generatedAssetReferences:generatedAssetReferences.length})+'\n');
