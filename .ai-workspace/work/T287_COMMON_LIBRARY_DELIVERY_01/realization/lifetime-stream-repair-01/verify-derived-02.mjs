import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const base=dirname(fileURLToPath(import.meta.url)),tenant=join(base,'stage/build_tenants/abiogenesis/typescript');
const {payloadInventoryDigest,sha256File,sha256Bytes}=await import(pathToFileURL(join(tenant,'build/code/src/product/index.js')).href);
const {WORKSITE_COMMAND_EXECUTION_CONTEXT_INVENTORY}=await import(pathToFileURL(join(tenant,'build/code/src/gtl/worksite_command_execution.js')).href);
const manifestPath=join(tenant,'product-toolchain-manifest.json');
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
const expected='sha256:8c0521d15ade43c503c56d46c8b7a10a42d6e172a8841443de9ad6980ed0cf21';
assert.equal(manifest.productContentDigest,expected);
const rows=[];
for(const path of manifest.productRelativeLocators){
  const sha256=await sha256File(join(tenant,path));
  assert.match(sha256,/^sha256:[0-9a-f]{64}$/u);rows.push({path,sha256});
}
const aggregate=payloadInventoryDigest(rows);assert.equal(aggregate,expected);
const c2=WORKSITE_COMMAND_EXECUTION_CONTEXT_INVENTORY;
assert.equal(await readFile(join(tenant,c2.path),'utf8'),c2.content);
const member=await readFile(join(tenant,'build/code/src/product/worksite_command_execution.js'));
assert.equal(member.length,110016);assert.equal(sha256Bytes(member),'sha256:c1480f09bedaba0a9d2a329623f9c668ece6dc02d6b683639d478aebed804373');
assert.equal(sha256Bytes(member.subarray(100071,102379)),'sha256:10916fee7c20d82621f49651753d134eb66631cd4872531b8cb635ffa2367345');
assert.equal(manifest.capabilityDefinitionGraph.assetLocator.contentDigest,await sha256File(join(tenant,'contracts/capabilities/capability-definition-graph.json')));
await writeFile(join(base,'payload-inventory-02.json'),JSON.stringify(rows,null,2)+'\n');
const result={kind:'mechanical_owner_typed_payload_correspondence',sourceType:'string path -> sha256File -> Promise<Sha256Digest>',rowType:'readonly PayloadInventoryRow[] with path: string and sha256: Sha256Digest',destinationType:'payloadInventoryDigest -> Sha256Digest',productContentDigest:aggregate,payloadRows:rows.length,toolchainManifestSha256:await sha256File(manifestPath),C2InventorySha256:sha256Bytes(c2.content),memberSha256:sha256Bytes(member),memberBytes:member.length,rendererStart:100071,rendererEnd:102379,rendererSha256:sha256Bytes(member.subarray(100071,102379)),graphAssetSha256:manifest.capabilityDefinitionGraph.assetLocator.contentDigest};
await writeFile(join(base,'typed-derived-correspondence-02.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
