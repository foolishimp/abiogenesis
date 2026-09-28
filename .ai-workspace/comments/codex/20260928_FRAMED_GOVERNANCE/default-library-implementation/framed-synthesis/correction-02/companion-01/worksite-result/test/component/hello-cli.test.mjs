import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('CLI process satisfies its output contract', () => {
  const result = spawnSync(process.execPath, ['generated/hello-world.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.equal(result.stdout, 'Hello, world!\n');
});
