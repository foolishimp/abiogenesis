# T-272 Proxy Decision: Accept Exact Gap Re-entry Repair

## Authority

Direct human instruction on 2026-07-25 delegated authority to Codex to
continue the accepted ABIogenesis 5.0 plan through completion or until the
human returns for status review.

This decision exercises that authority as a bounded `F_H` proxy. The human
remains the underlying authority. The proxy may accept implementation and
design cuts that preserve the accepted Product and current ticket plan. It
does not authorize a Product reprice, a new ticket hierarchy, a compiler,
controller, second runtime, or replacement Product trajectory.

## Exact Subject

- candidate commit:
  `305a3b93525f6898e15b995ff1789683d97de7e8`
- complete M05 design SHA-256:
  `69bd9493c017102a53dc5d52a0c36fc3a377a1a08276911677a49e8b0d046682`
- packed artifact SHA-256:
  `345354e8e85fe0f9d341037ab172101a64523665d32212597a7cbd197a51f49a`
- Product content digest:
  `sha256:6fc0c68d69a29b66b150fd1efebdd4fbd9421bae3ba0b7c6caaa7a1177eca82e`
- manifest digest:
  `sha256:79e7181512e2950d56cf1029df8893007b51f4a0b48e3f2f8cee71e8dd1555b0`

## Review

The candidate repairs the exact findings against `91f3640f`:

1. an admitted source gap is consumed at most once, even when its historical
   identity is rebound to the latest lawful event-log prefix;
2. `evalGap` emits unresolved pressure and an unselected basis, while
   Product-owned `evaluateNext` owns obligation binding, deterministic
   priority, and total selected-action or no-action projection;
3. re-entry restores and verifies the exact ResolvedProductLock, ProductSet,
   WorkspaceBinding, Program, and public start identity; and
4. installed mutations refuse missing authority, wrong workspace, wrong
   Program, non-gap source, reduced ProductSet, substituted prior gap, stale
   authority, and rebased duplicate consumption before another Run opens.

The bounded scenario requirement now explicitly admits one successor Run from
an exact `gap_stop` under a single-use re-entry basis. Product meaning is
unchanged.

Verification:

- `test:m5`: `95/95`;
- `test:m4`: `26/26`;
- external developer Product: `24/24`;
- conservation projection: `44` pass, `18` explicit `todo`;
- two independently produced package archives are byte-identical; and
- `git diff --check` passes.

No compiler, lowering carrier, public controller, second runtime, new event
family, or new ticket was introduced.

## Decision

Accept candidate `305a3b93` and M05 design digest `69bd9493...046682`.
Release the exact-review hold on Section 12.5. T-272 remains active and may
continue only through the same independently packed external Product toward
the remaining `ABG5-S03` consequence, runtime-disposition, and public-control
outcomes.
