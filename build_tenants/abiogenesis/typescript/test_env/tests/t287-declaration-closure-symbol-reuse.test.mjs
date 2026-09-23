import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {focusedDeclarationCases,loadClosureOwner,sha256} from '../support/t287-declaration-closure-symbol-reuse.mjs';

test('direct-symbol reuse conserves complete closure output and ownership refusals', async context => {
  if (!process.env.ABI5_DECLARATION_BASELINE_MODULE || !process.env.ABI5_DECLARATION_PROOF_ROOT) {
    context.skip('requires exact frozen baseline module and proof-local output root'); return;
  }
  const baseline = await loadClosureOwner(process.env.ABI5_DECLARATION_BASELINE_MODULE);
  const candidate = await loadClosureOwner(resolve(import.meta.dirname, '../../build/code/src/product/declaration_exports.js'));
  const reports = [];
  for (const fixture of focusedDeclarationCases()) {
    const before = await baseline.resolveNativeDeclarationClosures(fixture.request);
    const after = await candidate.resolveNativeDeclarationClosures(fixture.request);
    assert.deepEqual(after, before, fixture.name);
    assert.equal(JSON.stringify(after), JSON.stringify(before), fixture.name + ': complete ordered bytes');
    if (fixture.refusal) assert.equal(after, null, fixture.name);
    else { assert.ok(after, fixture.name); fixture.check(after); }
    reports.push({name: fixture.name,refused: after === null,sha256: sha256(JSON.stringify(after))});
  }
  // Read-only shape guard: cache lifetime is this one owner call, not module/global.
  const source = await readFile(resolve(import.meta.dirname, '../../code/src/product/declaration_exports.ts'),'utf8');
  const start = source.indexOf('function exportedSymbolPhysicalRelationRefs('),end = source.indexOf('export async function resolveNativeDeclarationClosures(',start);
  const cache = source.indexOf('const directBySymbol =',start);
  assert.ok(start >= 0 && end > start && cache > start && cache < end);
  await writeFile(join(process.env.ABI5_DECLARATION_PROOF_ROOT,'focused.json'),JSON.stringify({kind:'pure_owner_output_conservation',passed:true,reports},null,2)+'\n');
});
