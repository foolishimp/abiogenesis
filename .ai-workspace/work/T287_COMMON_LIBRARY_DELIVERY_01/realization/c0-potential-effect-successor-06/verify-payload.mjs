import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { payloadInventoryDigest, sha256Bytes } from './stage/build_tenants/abiogenesis/typescript/build/code/src/product/index.js';

const work = import.meta.dirname;
const inputBytes = await readFile(join(work, 'archive-payload-owner-input.json'));
const input = JSON.parse(inputBytes);
const manifestBytes = await readFile(join(work, 'stage/build_tenants/abiogenesis/typescript/product-toolchain-manifest.json'));
const manifest = JSON.parse(manifestBytes);
assert.equal(sha256Bytes(manifestBytes), `sha256:${input.manifestByteSha256}`);
assert.equal(input.rows.length, 5269);
assert.deepEqual(input.rows.map(row => row.path).sort(), [...manifest.productRelativeLocators].sort());
assert.ok(input.rows.every(row => /^sha256:[a-f0-9]{64}$/.test(row.sha256)));
const actualProductContentDigest = payloadInventoryDigest(input.rows);
assert.equal(actualProductContentDigest, input.expectedProductContentDigest);
assert.equal(actualProductContentDigest, manifest.productContentDigest);
assert.equal(input.actualGraphByteDigest, input.graphByteDigest);
const result = {
  kind: 'archive_payload_correspondence_via_existing_Product_owner',
  inputSha256: sha256Bytes(inputBytes),
  payloadRows: input.rows.length,
  actualProductContentDigest,
  expectedProductContentDigest: manifest.productContentDigest,
  graphByteDigest: input.actualGraphByteDigest,
  manifestByteSha256: input.manifestByteSha256,
  owner: 'Product export of build/code/src/shared/digests.js::payloadInventoryDigest',
  status: 'satisfied',
  scope: 'Pure digest calculation over rows derived from actual archive member bytes; no installed or native workload',
};
await writeFile(join(work, 'archive-payload-owner-result.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
process.stdout.write(JSON.stringify(result) + '\n');
