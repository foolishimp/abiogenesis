# T-211 rc.10 Review Survivors (T-195 close-review reprice)

- id: T-211
- type: chore
- ticket_category: ordinary
- status: backlog
- goal: foundation-release-hygiene
- change_intent: retire the three rc.10-review items that survived the
  T-195 forensic close review (2026-07-09) on the 4.5 line
- change_class: realization_refactor (items 1-2), product_reprice (item 3)
- re_entry_point: realized surfaces; PRODUCT.md for item 3
- intake_source: T-195 forensic close review, 2026-07-09
- triaged_at: 2026-07-09
- created_at: 2026-07-09
- updated_at: 2026-07-09
- links: T-195 (completed with this successor)

## Intake Triage (the entry)

1. SUBSTANTIVE? Marginal but real: two realization residues plus one
   product-wording overclaim. No requirement or design change — the
   governing law exists for all three (P1-12/P1-10 findings cite it;
   item 3 is the live product text exceeding proven scope).
2. UPWARD WALK: items 1-2 have requirement+design authority and deviated
   code => realization_refactor. Item 3 is live PRODUCT.md text claiming
   more than the tree proves => product_reprice (wording narrowed to
   proven scope, or the proof extended — narrowing is the honest move
   while per-vector formulas remain deferred to T-206).
3. NOTE: P0-5's recurrence was fixed IN the close review itself
   (evaluation_set double-prefix + default-instruction fake digests;
   sweep differential pins the class) — not carried here.

## Items

1. P1-12 residue: temporal_properties.ts unstamped-eventId fallback
   (:621-624) persists; cli/command.ts coerceRuntimeBinding carries five
   `as unknown as` ingress casts (:963-1078). Retire the fallback with a
   typed rejection; collapse the casts through admitted ingress shapes.
2. P1-10 named refinement: pre-stamped envelope authentication —
   distinguish replayed lawful pre-stamps from forged ones (emit.ts
   :55-59 names it).
3. C7 residue: PRODUCT.md temporal-property claim (:533-537) states
   blanket "online safety gating" while composed-path enforcement is
   transitional and per-vector formulas are deferred; add the scope note
   or narrow the claim.
4. RECORD (no work): P0-2 was adjudicated in-tree rather than fixed as
   proposed — dispatched-defaults are replay-visible and halt at the m04
   dispatch_required surface; engine_runner.ts:2297 still maps
   dispatched→accepted at stage-task level, so that adjudication's
   honesty RESTS on the downstream halt. Any change to the halt surface
   must re-open this record.

## Proof commands

- cd build_tenants/abiogenesis/typescript && npm run test:semantic
- git diff --check

## Installer valibot-payload defect (recorded 2026-07-09, review LOW)

RECURRING (3+ installs: rc.7, rc.10, rc.11): every toolchain install
leaves lib/node_modules/valibot EMPTY; the working state at rc.5+ is a
symlink into the abiogenesis source tree's node_modules/valibot —
repair ritual, not a fix. OWNED HERE as an installer defect: the
install must hoist a REAL valibot payload (or declare the dependency
resolution lawfully); a toolchain whose runtime dependency resolves
through a mutable source tree violates the release-cut immutability
boundary. Reproduce: install any cut to a clean toolchain root and
list lib/node_modules/valibot.
