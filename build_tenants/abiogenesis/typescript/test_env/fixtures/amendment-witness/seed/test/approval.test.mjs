import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requiresManagerApproval } from '../src/approval.mjs';
import { priceOrder } from '../src/order.mjs';

test('a total of exactly 5,000 does not require approval', () => {
  assert.equal(requiresManagerApproval(5000), false);
});

test('a total just above 5,000 requires approval', () => {
  assert.equal(requiresManagerApproval(5000.01), true);
});

test('a total just below 5,000 does not require approval', () => {
  assert.equal(requiresManagerApproval(4999.99), false);
});

test('approval uses the total after the bulk discount', () => {
  const order = priceOrder([{ quantity: 10, unitPrice: 520 }]);
  assert.equal(order.total, 4940);
  assert.equal(order.managerApproval, false);
});
