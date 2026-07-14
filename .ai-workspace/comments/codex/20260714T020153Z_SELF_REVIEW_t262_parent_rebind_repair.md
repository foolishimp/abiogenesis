# SELF REVIEW: T-262 Parent-Rebind Repair

**Ticket:** T-262  
**Repair checkpoint:** `7a9cfb01`  
**Disposition:** implementation repaired; external reverification pending

## Authority Trace

The child result, termination decision, admitted foldback event, exact next
input, foldback declaration digest, policy identity, budget source, frame
lineage, and preserved evidence all enter one deterministic parent-rebind
witness. The parent stage re-derives that witness from admitted event truth.
It does not accept a generic evidence ref or trust the proposed payload by
shape alone.

The witness is structural admission, not a claim that ABG inferred the domain
meaning of the foldback. The next operand invocation still performs semantic
parent re-evaluation. This remains within the trusted-desktop boundary.

## Adversarial Checks

1. An unrelated next-input payload with generic evidence reaches the live
   parent stage and closes `blocked` before a second child invocation.
2. A positive foldback carries the exact witness and reaches round two.
3. Replay recomputes the same predicate; a forged `admitted` parent event
   cannot bypass missing foldback evidence.
4. Binding, carrier, source payload, policy, budget, lineage, and preserved
   evidence checks remain unchanged.
5. The helper remains internal to the module and absent from the packed M03
   public surface.

## Proof

- focused T-262: 10/10
- adjacent focused lane: 42/42
- packed public API: 1/1
- GTL law: 82/82
- strict TypeScript build: passed
- `git diff --check`: passed

The ticket remains active until an external authority-path review confirms the
repair. T-267 and T-271 may consume the repaired checkpoint without treating
that as T-262 closure.
