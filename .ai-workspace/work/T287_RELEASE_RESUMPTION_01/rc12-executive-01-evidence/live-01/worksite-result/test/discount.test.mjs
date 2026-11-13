import { test } from 'node:test';
import assert from 'node:assert/strict';
import { discountFor } from '../src/discount.mjs';

test('nine items receive no discount', () => {
  assert.equal(discountFor(9, 900), 0);
});

test('ten items receive a 5% discount', () => {
  assert.equal(discountFor(10, 1000), 50);
});

test('the discount is rounded to cents', () => {
  assert.equal(discountFor(10, 109.9), 5.5);
});
