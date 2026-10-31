import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { resolveDependencyResources } from './dependency-resources.mjs';

test('declared dependencies require unique explicit roots and records', async () => {
  const base = await mkdtemp(join(tmpdir(), 'abg-witness-map-'));
  try {
    const a = join(base, 'a'), b = join(base, 'b'), ar = join(base, 'record-a.json'), br = join(base, 'record-b.json');
    await mkdir(a); await mkdir(b); await writeFile(ar, '{}'); await writeFile(br, '{}');
    const declaration = { dependencies: [{dependencyRef:'source:a'}, {dependencyRef:'source:b'}] };
    const mappings = [{dependencyRef:'source:b',root:b,recordPath:br}, {dependencyRef:'source:a',root:a,recordPath:ar}];
    const resolved = await resolveDependencyResources(declaration, mappings);
    assert.deepEqual(resolved.map(x => x.dependencyRef), ['source:a','source:b']);
    assert.notEqual(resolved[0].root, resolved[1].root);
    await assert.rejects(resolveDependencyResources(declaration, mappings.slice(0, 1)));
    await assert.rejects(resolveDependencyResources(declaration, [mappings[0], mappings[0]]));
    await assert.rejects(resolveDependencyResources(declaration, [...mappings, {dependencyRef:'other',root:a,recordPath:ar}]));
    await assert.rejects(resolveDependencyResources(declaration, [{...mappings[0],root:'relative'},mappings[1]]));
  } finally { await rm(base, {recursive:true,force:true}); }
});
