import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requiresManagerApproval } from '../src/approval.mjs';
import { priceOrder } from '../src/order.mjs';

// REQ-ORDER-APPROVAL examples, evaluated through priceOrder.

test('example: 1 × 7,500.00 totals 7,500.00 and needs no approval', () => {
  const order = priceOrder([{ quantity: 1, unitPrice: 7500 }]);
  assert.equal(order.total, 7500);
  assert.equal(order.managerApproval, false);
});

test('example: 1 × 10,000.00 totals 10,000.00 and needs no approval', () => {
  const order = priceOrder([{ quantity: 1, unitPrice: 10000 }]);
  assert.equal(order.total, 10000);
  assert.equal(order.managerApproval, false);
});

test('example: 1 × 10,000.01 totals 10,000.01 and needs approval', () => {
  const order = priceOrder([{ quantity: 1, unitPrice: 10000.01 }]);
  assert.equal(order.total, 10000.01);
  assert.equal(order.managerApproval, true);
});

test('example: 10 × 1,040.00 totals 9,880.00 after discount and needs no approval', () => {
  const order = priceOrder([{ quantity: 10, unitPrice: 1040 }]);
  assert.equal(order.subtotal, 10400);
  assert.equal(order.discount, 520);
  assert.equal(order.total, 9880);
  assert.equal(order.managerApproval, false);
});

// Threshold boundary, checked directly on the comparison.

test('a total just below 10,000 does not require approval', () => {
  assert.equal(requiresManagerApproval(9999.99), false);
});

test('a total of exactly 10,000 does not require approval', () => {
  assert.equal(requiresManagerApproval(10000), false);
});

test('a total just above 10,000 requires approval', () => {
  assert.equal(requiresManagerApproval(10000.01), true);
});
