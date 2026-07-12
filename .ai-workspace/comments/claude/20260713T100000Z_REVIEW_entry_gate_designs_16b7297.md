# REVIEW: Entry-Gate Designs T-250/T-251 (16b7297)

**Type:** REVIEW (monitoring seat; second run of the three-view gate).
**Author:** claude · 2026-07-13
**Subject:** T-250 (constitutional version basis) + T-251 (entry proof gates),
their two behavior designs, the self-review, and the register correction.

## Verdict

**Recommend `accepted` for both designs.** These are the two entry-gate items
my Phase-1 checkpoint flagged, converted into singular leaves exactly as
amendment A2 prescribed (leaves per §5E boundary, no tree). Code freeze holds
(`code/` diff empty). Execution order T-251 → T-250 endorsed — reproducible
gates first, then the semantic fix runs under them.

## T-250 — constitutional version basis: ACCEPT

The design solves t193/t195 at the right layer. The triage found the true
defect: LAWS-028's single `packageVersion` fact predates the recursive product
taxonomy and cannot represent multiple lawful version subjects — the failures
were category errors (source-subject compared against published-RC-subject),
not doc typos. What makes the design strong:

- **The five-subject tagged union** (source project / published RC cut /
  tapped release cut / product / installed product) realizes the SPEC_METHOD
  taxonomy in the type system; comparison is lawful only between identical
  tagged subjects.
- **"A surface cannot select its own subject authority"** — a separate
  authority-bearing binding resolves each surface's subject. This kills the
  relabel-cheat categorically; the closure law additionally forbids rewriting
  any rc.3 snapshot/tag/bootloader/note bytes to simulate closure.
- **The proposed bindings table is honest**: source package → `5.0.0-dev.0`;
  rc.3 bootloader blocks, RC note, and README labels → `published_rc_cut`
  4.6.0-rc.3 by byte/tag/digest evidence; and **no facts admitted** for tapped
  release, product, or install — because none exist. No installed truth by
  inference.
- **No public vocabulary expansion**: internal basis-resolution reasons map to
  the existing repair edit classes; new carriers are subordinate payloads
  under the existing prime, not new primes. The t195 anti-sed-bump purpose
  survives as a separate release-note integrity proof with lawful comparators.
- Bonus defect found and covered: the standalone t195 scan misses final
  versions (e.g. `4.5.1`) — differential 7 addresses note integrity properly.
- Axiom matrix: 8/8 pass; GraphFunction row honestly `not_applicable`
  (conformance meta-carrier). The state view models a pure compiler transform
  with an explicit no-persisted-lifecycle declaration — lawful application of
  the M1 criterion, worth noting as precedent.

Watch-note: acceptance opens the LAWS-028 requirement edit — that reprice text
itself passes through F_H ratification within T-250's declared
`requirement_reprice` class.

## T-251 — entry proof gates: ACCEPT

- **Proportionality is designed in, not assumed**: explicitly no pixel
  comparison, screenshots, browser matrices, or historical scans
  (trusted-desktop law applied to tooling).
- **Reproducibility done right (A6 closed)**: pinned local dev-dependency
  renderer, global-only `mmdc` rejected, committed config, SVGs only under a
  temp root with try/finally cleanup; fail-closed on file removal, block
  add/remove/reorder, or syntax break.
- **Honest scope**: "syntax does not prove semantics" — the gate emits
  structural/render truth only; axiom and F_H review remain external.
- **The lint set shows real analysis**: the 10 reported errors plus 6
  transitively-dead symbols as one deletion-only semantic set, with the sharp
  observation that removing only the reported 10 would manufacture a new lint
  failure. Behavior preservation proven by existing T-188/T-180 tests.
- **A check I hadn't asked for**: `npm pack --dry-run` census proving proof
  tooling never enters the product package.

## Findings (non-blocking)

1. **Status-field inconsistency**: T-250 is `blocked` +
   `review_status: pending_fh_design_review`; T-251 says `active` with no
   review_status, though both await the same F_H disposition. One-line fix for
   consistency of the review queue.
2. **Render claims remain attested** until T-251's checker lands — acceptable
   by construction; this is the last attested instance if T-251 executes.
3. The register correction (stale authority-conflict note → persisted
   stable-first basis) is lawful and correctly keeps the register a derived
   surface.

## For F_H

Two dispositions: `accepted` on both designs (my recommendation), which opens
exactly: T-251's deletion-only lint repair + local proof gate, then T-250's
LAWS-028 reprice + bounded compiler work. Neither authorizes Consensus or any
other product implementation. After both close, the per-phase full-gates runs
stop tripping on known noise — and Phase 2 (the Consensus GTL probe) starts
clean.
