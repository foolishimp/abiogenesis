# Product

Order desk is a small set of Node modules with no dependencies.

- `priceOrder(lines)` in `src/order.mjs` takes order lines
  `{ quantity, unitPrice }` and returns
  `{ itemCount, subtotal, discount, total, managerApproval }`.
- Amounts are in one currency and rounded to cents.

Requirements live in `specification/requirements/`. Each states one rule and
a table of whole-order examples. The examples are acceptance cases: a column
names a field of the `priceOrder` result, and `yes`/`no` mean true/false.

## Traceability

| Requirement | Realized by | Verified by |
|---|---|---|
| REQ-ORDER-APPROVAL | src/approval.mjs, src/order.mjs | test/approval.test.mjs |
| REQ-ORDER-DISCOUNT | src/discount.mjs, src/order.mjs | test/discount.test.mjs |
