import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requiresManagerApproval } from '../src/approval.mjs';

test('a total of exactly 10,000 does not require approval', () => {
  assert.equal(requiresManagerApproval(10000), false);
});

test('a total just above 10,000 requires approval', () => {
  assert.equal(requiresManagerApproval(10000.01), true);
});

test('a total just below 10,000 does not require approval', () => {
  assert.equal(requiresManagerApproval(9999.99), false);
});
