# Intake triage: REQ-ORDER-APPROVAL threshold change

Change class: requirement_reprice
Re-entry: Requirements
Amended requirement: REQ-ORDER-APPROVAL (specification/requirements/REQ-ORDER-APPROVAL.md)
Affected surfaces: specification/requirements/REQ-ORDER-APPROVAL.md (already amended; not edited here), src/approval.mjs, src/order.mjs (shared with REQ-ORDER-DISCOUNT), test/approval.test.mjs
Preserved surfaces: REQ-ORDER-DISCOUNT (specification/requirements/REQ-ORDER-DISCOUNT.md), src/discount.mjs, test/discount.test.mjs; also unchanged: specification/INTENT.md, specification/PRODUCT.md, review/*. REQ-ORDER-DISCOUNT behaviour through the shared order module must also hold (see the cross-requirement seam below)
Open questions: (1) Does src/order.mjs need any edit, or does the trace list it as affected only because it is shared? (2) Should the approval tests keep calling requiresManagerApproval directly, or check every example through priceOrder? (3) The worksite has no declared test command. (4) The superseded 5,000 rule exists only in the request and in the current code and tests; no superseded requirement artifact is present.

## Task model

### What the sources say (quoted or close paraphrase)

- Requested change: "Raise the order total that needs manager approval from
  5,000 to 10,000."
- Amended REQ-ORDER-APPROVAL: an order whose total is above 10,000 requires
  manager approval, and an order of 10,000 or less does not. The total is the
  amount the customer pays after any REQ-ORDER-DISCOUNT discount. The
  examples are 7,500.00 → no, 10,000.00 → no, 10,000.01 → yes, and
  10 × 1,040.00 (total 9,880.00) → no.
- INTENT: business staff own the pricing and approval rules. "A change to a
  rule changes only what that rule governs."
- PRODUCT: `priceOrder(lines)` in `src/order.mjs` returns
  `{ itemCount, subtotal, discount, total, managerApproval }`. Amounts are
  rounded to cents. The requirement examples are acceptance cases evaluated on
  `priceOrder` result fields.
- Trace (specification/PRODUCT.md, Traceability):
  - REQ-ORDER-APPROVAL → realized by src/approval.mjs and src/order.mjs,
    verified by test/approval.test.mjs.
  - REQ-ORDER-DISCOUNT → realized by src/discount.mjs and src/order.mjs,
    verified by test/discount.test.mjs.
- Conserved task: change only the realization and tests that the trace gives
  the amended requirement. Every other requirement keeps its behaviour, files
  and tests. Closure needs acceptance plus every required review (impact and
  preservation) to be satisfied on the current files.

### Interpretation (mine, not stated by the sources)

- **Outcome:** `priceOrder(...).managerApproval` is true exactly when
  `total > 10000`. Totals are post-discount and cent-rounded.
- **Users:** order desk staff, who read `managerApproval`. Business staff own
  the rule.
- **Modality:** Node ESM modules with no dependencies. Tests use `node:test`.
- **Change class rationale:** the change alters the rule of one existing
  requirement (a threshold value). It does not change Goals, Intent or Product
  meaning, and it needs no new structural decision. That makes it
  `requirement_reprice`, and work re-enters at Requirements. The successor
  requirement text is already in place, so the flow continues forward to
  design impact and then realization.
- **Observed current state (read only, at triage time):**
  - `src/approval.mjs` has `APPROVAL_THRESHOLD = 5000` with a strict `>`
    comparison. The comparison already matches "above"; only the value
    disagrees with the amended rule.
  - `src/order.mjs` already passes the post-discount `total` to
    `requiresManagerApproval`. That is consistent with the amended text, so a
    content change there looks unnecessary (see Open question 1).
  - `test/approval.test.mjs` asserts the 5,000 boundary and a 10 × 520 order
    (total 4,940). It encodes the superseded rule.
- **Cross-requirement seam:** the example 10 × 1,040.00 has a subtotal of
  10,400.00, which is above the new threshold. It needs the 5% bulk discount
  (520.00) to reach a total of 9,880.00 and "no" approval. This shows that
  REQ-ORDER-DISCOUNT behaviour inside the shared `src/order.mjs` must remain
  intact.
- **Constraints:** do not modify the specification, the rubrics,
  `src/discount.mjs` or `test/discount.test.mjs`. The discount examples
  (9 × 100 → 0 / 900; 10 × 100 → 50 / 950; 6 × 100 + 4 × 100 → 50 / 950) must
  keep holding through `priceOrder`.

### Conflicts

- No conflict between sources was found. The current code and approval tests
  differ from the amended requirement, but that is the expected realization gap
  of this change, not a conflict between specification sources.

### Assumptions

- The amended requirement file is the sole current truth for
  REQ-ORDER-APPROVAL, and the 5,000 rule is superseded.
- Amounts are in one currency, as PRODUCT states, and are compared after
  rounding to cents.

### Unknowns and open questions (unresolved, kept for downstream owners)

1. Whether `src/order.mjs` needs any edit, or is affected only because the
   trace assigns it to both requirements. The impact assessment decides this.
   Any edit there falls under the preservation review.
2. How `test/approval.test.mjs` should verify the amended rule: by unit checks
   of `requiresManagerApproval`, by every example through `priceOrder`, or
   both. Acceptance A1 evaluates the examples through `priceOrder`.
3. The worksite declares no test command. The Testing result that acceptance
   A2 needs depends on one being declared, for example `node --test`. This is
   unresolved.
4. No superseded requirement artifact for the 5,000 rule exists in the
   worksite. The prior rule is evidenced only by the request wording and the
   current code and tests.
5. Realization correctness is not established. No tests were run during
   triage, and nothing yet shows that the amended rule holds.

## Scope note

This triage wrote only `work/intake-triage.md`, creating the `work/`
directory to hold it. It did not change any specification, rubric, source or
test file.
