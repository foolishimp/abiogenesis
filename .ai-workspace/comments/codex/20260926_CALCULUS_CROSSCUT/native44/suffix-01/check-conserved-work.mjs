import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const directory = import.meta.dirname;
const read = async path => JSON.parse(await readFile(path, 'utf8'));
const prepared = await read(join(directory, 'native-prepared.json'));
const product = await import(pathToFileURL(join(prepared.abiRoot, 'build/code/src/product/index.js')).href);
const prior = await read(join(directory, '../../evidence-context-01/native42-selected-events.json'));
const producer = prior.events.find(event => event.admissionOrdinal === 109418);
assert.equal(producer?.kind, 'c_call_result_admitted');
const before = producer.payload.value.current;
const after = (await read(join(directory, 'suffix-terminal-value.json'))).current;
const same = (a, b) => assert.equal(product.sha256Canonical(a), product.sha256Canonical(b));
same(after.job, before.job);
same(after.sourceContext, before.sourceContext);
same(after.evidence, before.evidence);
assert.equal(before.assets.length, 4);
assert.equal(after.assets.length, 5);
same(after.assets.slice(0, before.assets.length), before.assets);
assert.equal(after.assets.at(-1).assessment?.disposition, 'satisfied');
const proof = {
  status: 'PRESERVED_COMPLETED_WORK_AND_NEW_EVIDENCE_ASSESSMENT',
  sourceProducer: { resultRef: producer.payload.resultRef, valueDigest: producer.payload.valueDigest },
  evidenceDigest: product.sha256Canonical(after.evidence),
  constructionResultRef: after.evidence.constructionResultRef,
  executionResultRef: after.evidence.executionResultRef,
  preservedAcceptedAssets: before.assets.map(asset => asset.assetRef),
  newEvidenceAsset: after.assets.at(-1).assetRef,
  boundary: 'Consumes the fresh Public terminal value retained by read-suffix.mjs. Proves exact original evidence and accepted-asset conservation; historical effects retain their old identities.'
};
await writeFile(join(directory, 'conserved-work.json'), JSON.stringify(proof, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(proof));
