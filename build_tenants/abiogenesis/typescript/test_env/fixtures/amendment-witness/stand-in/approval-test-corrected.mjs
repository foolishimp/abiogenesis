import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requiresManagerApproval } from '../src/approval.mjs';
import { priceOrder } from '../src/order.mjs';

test('a total of exactly 10,000 does not require approval', () => {
  assert.equal(requiresManagerApproval(10000), false);
});

test('a total just above 10,000 requires approval', () => {
  assert.equal(requiresManagerApproval(10000.01), true);
});

test('a total just below 10,000 does not require approval', () => {
  assert.equal(requiresManagerApproval(9999.99), false);
});

test('a total of 7,500 no longer requires approval', () => {
  assert.equal(requiresManagerApproval(7500), false);
});

test('approval uses the total after the bulk discount', () => {
  const order = priceOrder([{ quantity: 10, unitPrice: 1040 }]);
  assert.equal(order.total, 9880);
  assert.equal(order.managerApproval, false);
});
