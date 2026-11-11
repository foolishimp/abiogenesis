# REQ-ORDER-APPROVAL: Manager approval for large orders

An order whose total is above 5,000 requires manager approval. An order
whose total is 5,000 or less does not. The total is the amount the customer
pays after any discount under REQ-ORDER-DISCOUNT.

## Examples

| Order lines | Total | Manager approval |
|---|---|---|
| 1 × 5,000.00 | 5,000.00 | no |
| 1 × 5,000.01 | 5,000.01 | yes |
| 10 × 520.00 | 4,940.00 | no |
