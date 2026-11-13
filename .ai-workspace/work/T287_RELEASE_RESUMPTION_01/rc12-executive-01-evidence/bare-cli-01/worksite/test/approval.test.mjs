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

// Whole-order examples from REQ-ORDER-APPROVAL.
const examples = [
  { lines: [{ quantity: 1, unitPrice: 7500 }], total: 7500, managerApproval: false },
  { lines: [{ quantity: 1, unitPrice: 10000 }], total: 10000, managerApproval: false },
  { lines: [{ quantity: 1, unitPrice: 10000.01 }], total: 10000.01, managerApproval: true },
  { lines: [{ quantity: 10, unitPrice: 1040 }], total: 9880, managerApproval: false },
];

for (const { lines, total, managerApproval } of examples) {
  const label = lines.map(l => `${l.quantity} × ${l.unitPrice}`).join(' + ');
  test(`order ${label} totals ${total} and approval is ${managerApproval}`, () => {
    const order = priceOrder(lines);
    assert.equal(order.total, total);
    assert.equal(order.managerApproval, managerApproval);
  });
}

test('approval uses the total after the bulk discount', () => {
  // 10 × 1,040.00 = 10,400.00 subtotal, above the threshold before discount.
  const order = priceOrder([{ quantity: 10, unitPrice: 1040 }]);
  assert.equal(order.subtotal, 10400);
  assert.equal(order.total, 9880);
  assert.equal(order.managerApproval, false);
});
