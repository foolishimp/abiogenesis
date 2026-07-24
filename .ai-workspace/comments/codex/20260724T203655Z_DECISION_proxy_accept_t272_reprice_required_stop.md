# T-272 Proxy Decision: Accept Typed Reprice-Required Stop

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

- implementation candidate:
  `f611a72de605520b1637d51e5bdc956e9868f07e`
- design-status evidence head:
  `4dbbeb5b3ae5dde2119ee17fd21c084345376665`
- complete M05 design SHA-256:
  `ad54dc33fb127506a024843af258771b79e99e161577e0e887e33075675fd441`
- packed artifact SHA-256:
  `a7d45ef7781593c5d8218759a79070fa664e892eaff716188e85c4c8090fcc12`
- Product content digest:
  `sha256:0635e99468368e66acecd8d6122346e66488aa8ed6758994cb0ffc93c8fcb323`
- manifest digest:
  `sha256:0cae4ef613e2b3bdca9010d068953cdcf0daed5e81fb3e69cd4221d80e248141`

## Review

The candidate advances the same independently packed external Product:

1. the observation carries factual change-authority state rather than a
   caller-selected no-action result;
2. Product-owned `evalGap` derives constitutional pressure and Product-owned
   `evaluateNext` emits `reprice_required`;
3. ABG admits that exact result and judgment, stops the unresolved Run, and
   preserves the exact disposition in `run_stopped` and replay;
4. the public invocation and a fresh-context `project.read(gaps)` render
   `reprice_required` without appending runtime truth; and
5. ordinary gap re-entry and unsupported observation authority state refuse
   before opening another Run.

The result is a reprice proposal and typed stop only. It performs no reprice,
changes no constitutional authority, and does not claim the
`escalation_or_reprice` consequence route or `reprice` runtime action.

Verification:

- `test:m5`: `96/96`;
- `test:m4`: `26/26`;
- external developer Product: `25/25`;
- conservation projection: `44` pass and `18` explicit TODO;
- two independently produced package archives are byte-identical; and
- `git diff --check` passes.

No compiler, lowering carrier, public controller, second runtime, new event
family, new public operation, or new ticket was introduced.

## Decision

Accept implementation candidate `f611a72d`, evidence head `4dbbeb5b`, and M05
Section 12.7 at design digest `ad54dc33...d441`. T-272 remains active. The
next slice must continue through the same externally packed Product and may
not treat this proposal as authority to apply a reprice.
