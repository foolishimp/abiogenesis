# Impact assessment

Change class: requirement_reprice
Amended requirement: REQ-ORDER-APPROVAL
Affected surfaces: src/approval.mjs, src/order.mjs, test/approval.test.mjs
Preserved surfaces: REQ-ORDER-DISCOUNT (specification/requirements/REQ-ORDER-DISCOUNT.md), src/discount.mjs, test/discount.test.mjs
Shared surfaces: src/order.mjs also realizes REQ-ORDER-DISCOUNT; its discount behaviour must not change.
Tests to change: test/approval.test.mjs moves its boundary cases from 5,000 to 10,000 and its discount case to ten items at 1,040.00.
Design change: the threshold constant in src/approval.mjs changes from 5000 to 10000. No structural change.
