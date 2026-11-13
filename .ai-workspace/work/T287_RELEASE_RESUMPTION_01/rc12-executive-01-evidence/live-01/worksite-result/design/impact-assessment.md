# Impact assessment: REQ-ORDER-APPROVAL threshold change

Change class: requirement_reprice
Amended requirement: REQ-ORDER-APPROVAL
Affected surfaces: src/approval.mjs, src/order.mjs, test/approval.test.mjs
Preserved surfaces: REQ-ORDER-DISCOUNT, src/discount.mjs, test/discount.test.mjs
Shared surfaces: src/order.mjs
Tests to change: test/approval.test.mjs, covering the boundary and every amended example
Design change: none, because only the threshold value in src/approval.mjs changes

## Basis

- Request: raise the order total that needs manager approval from 5,000 to
  10,000.
- Amended requirement: `specification/requirements/REQ-ORDER-APPROVAL.md`.
  Approval is needed when the total is above 10,000 and not needed when it is
  10,000 or less. The total is the amount after any discount under
  REQ-ORDER-DISCOUNT.
- Trace (`specification/PRODUCT.md`, Traceability):
  - REQ-ORDER-APPROVAL: realized by src/approval.mjs and src/order.mjs,
    verified by test/approval.test.mjs.
  - REQ-ORDER-DISCOUNT: realized by src/discount.mjs and src/order.mjs,
    verified by test/discount.test.mjs.
- Intake triage: `work/intake-triage.md`. It was reused, not rerun. Its class,
  amended requirement and surface lists match the trace.

## Surface derivation

- **Affected:** the trace gives REQ-ORDER-APPROVAL exactly src/approval.mjs,
  src/order.mjs and test/approval.test.mjs. Being listed as affected means a
  file is in the amended requirement's trace. It does not mean the file must
  be edited (see Q1).
- **Preserved:** REQ-ORDER-DISCOUNT is the only other requirement. The files
  traced only to it are src/discount.mjs and test/discount.test.mjs. None of
  these changes. specification/INTENT.md, specification/PRODUCT.md, the
  amended requirement file itself and review/* are also not changed by this
  work.
- **Shared:** src/order.mjs is the only realization file traced to both
  requirements.

## Settled open questions from the intake

1. **Does src/order.mjs need an edit? No.** `priceOrder` already computes
   `total = cents(subtotal - discount)` and passes that post-discount,
   cent-rounded total to `requiresManagerApproval(total)`. That matches the
   amended text ("the amount the customer pays after any discount"). It
   imports `discountFor` from `./discount.mjs` and `requiresManagerApproval`
   from `./approval.mjs`. Nothing in the amendment touches how items, the
   subtotal, the discount or the total are computed. src/order.mjs therefore
   stays byte-for-byte unchanged. That keeps the preservation review's
   subject (P1 discount examples, P2 import of `./discount.mjs`) exactly as it
   is now. Any proposed edit to src/order.mjs during construction would be
   outside this design and would need to come back here.
2. **How do the approval tests verify the rule? Both ways, each with its own
   role.**
   - Every amended example is asserted through `priceOrder` on whole orders,
     because the requirement's examples are acceptance cases over `priceOrder`
     result fields (PRODUCT.md, acceptance A1). For each example, the test
     asserts both `total` and `managerApproval`.
   - The threshold boundary is also asserted directly on
     `requiresManagerApproval`, as unit checks of the comparison: 9,999.99 →
     false, 10,000 → false, 10,000.01 → true. These pin the strict `>` at the
     new value independently of the pricing path.
3. **Test command:** the parent task declares
   `node --test test/approval.test.mjs test/discount.test.mjs` with an
   exit-zero predicate. The intake's "no test command" gap is closed by that
   declaration. No new command is introduced here.
4. **No superseded requirement artifact for the 5,000 rule.** This is noted
   only. The amended requirement file is the sole operative truth. The 5,000
   rule survives only in the current src/approval.mjs and
   test/approval.test.mjs, and construction replaces it there. Creating a
   superseded-requirement artifact is a specification action outside this
   unit's scope.

## Realization change (for the construction unit)

- `src/approval.mjs`: change `APPROVAL_THRESHOLD` from `5000` to `10000`.
  Keep the strict `>` comparison, the export names and the function's
  signature. The comment can stay as it is because it does not name a value.
- `src/order.mjs`: no change (Q1).
- `src/discount.mjs`, `test/discount.test.mjs`: no change (preserved).

## Test plan for test/approval.test.mjs

Replace the 5,000-boundary tests and the 10 × 520 (total 4,940) test. Both
encode the superseded rule. The 4,940 case would pass under either threshold,
so it discriminates nothing. The planned tests are:

| Test | Call | Assertions |
|---|---|---|
| Example 1 × 7,500.00 | `priceOrder([{ quantity: 1, unitPrice: 7500 }])` | `total === 7500`, `managerApproval === false` |
| Example 1 × 10,000.00 (boundary, inclusive "no") | `priceOrder([{ quantity: 1, unitPrice: 10000 }])` | `total === 10000`, `managerApproval === false` |
| Example 1 × 10,000.01 (just above) | `priceOrder([{ quantity: 1, unitPrice: 10000.01 }])` | `total === 10000.01`, `managerApproval === true` |
| Example 10 × 1,040.00 (post-discount) | `priceOrder([{ quantity: 10, unitPrice: 1040 }])` | `subtotal === 10400`, `discount === 520`, `total === 9880`, `managerApproval === false` |
| Unit boundary | `requiresManagerApproval(9999.99)`, `(10000)`, `(10000.01)` | false, false, true |

How the 10 × 1,040.00 case works through `priceOrder`: the subtotal of
10,400.00 is above the new threshold. Only the REQ-ORDER-DISCOUNT 5% bulk
discount (10 items, 520.00) brings the total to 9,880.00, which needs no
approval. Asserting `subtotal`, `discount` and `total` together with
`managerApproval === false` proves two things: approval is decided on the
post-discount total, and the cross-requirement seam in the shared
src/order.mjs still holds. An implementation that checked the pre-discount
subtotal would fail this test.

Discriminating power, observed read-only by running `priceOrder` in process
memory on the current, unmodified files with no files written:

| Order | total | managerApproval now (5,000) | required (10,000) |
|---|---|---|---|
| 1 × 7,500 | 7500 | true | false |
| 1 × 10,000 | 10000 | true | false |
| 1 × 10,000.01 | 10000.01 | true | true |
| 10 × 1,040 | 9880 (subtotal 10400, discount 520) | true | false |

The planned tests fail on the current realization (three of the four
examples) and pass only once the threshold is 10,000. Totals were already
correct, which confirms that no change to the pricing path is needed. In the
same probe the discount examples gave: 9 × 100 → discount 0, total 900;
10 × 100 → 50 / 950; 6 × 100 + 4 × 100 → 50 / 950.

## Proof plan

- Focused: the planned `test/approval.test.mjs`, run with
  `node --test test/approval.test.mjs test/discount.test.mjs`, must exit 0.
  Node v24.7.0 is present, and the project has no dependencies to install.
- Preservation: test/discount.test.mjs stays unchanged and is part of the same
  command. The REQ-ORDER-DISCOUNT examples through `priceOrder` remain
  evaluable by the preservation review (P1), and src/order.mjs keeps importing
  `./discount.mjs` (P2).
- Acceptance: every REQ-ORDER-APPROVAL example holds through `priceOrder`
  (A1). The test command result is recorded by Testing (A2). Specification
  and rubric files stay unchanged (A3).

## Residuals

- Realization not done: src/approval.mjs still has 5000, and
  test/approval.test.mjs still encodes the 5,000 rule.
- No Testing result exists yet for the declared command.
- The impact, preservation and acceptance reviews have not been run. This
  assessment does not accept itself.
