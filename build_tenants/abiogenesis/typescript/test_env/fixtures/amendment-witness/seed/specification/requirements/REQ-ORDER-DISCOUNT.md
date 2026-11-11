# REQ-ORDER-DISCOUNT: Bulk discount

An order of ten or more items receives a 5% discount on its subtotal. An
order of fewer than ten items receives no discount. Items are counted across
all order lines.

## Examples

| Order lines | Discount | Total |
|---|---|---|
| 9 × 100.00 | 0.00 | 900.00 |
| 10 × 100.00 | 50.00 | 950.00 |
| 6 × 100.00 + 4 × 100.00 | 50.00 | 950.00 |
