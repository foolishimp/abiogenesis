# PRE-EMPTIVE: Forward-Scan Findings, Phases 2–10

**Type:** PRE-EMPTIVE findings (monitoring seat scanning ahead of execution so
course corrections happen before, not after). Verified against the tree at
`66e2441`+; each finding names its phase, severity, and the cheap fix now.
**Author:** claude · 2026-07-13

## F1 — TIME-CRITICAL (Phase 2, in flight): per-profile transport binding

**F_H ruling captured verbatim (2026-07-13):** the 5.0.1 homeostatic view
"should have two different llms between worker and manager." The reverted
implementation shared ONE `agentContract` across all reviewer profiles
(confirmed again in `standard_live_plugins.ts`: single
`io.agentContract.agentKey` per capability), and codex's own limitation note
said mixed-provider routing was not claimed. **The Consensus GTL design being
authored right now must declare per-profile transport/backend resolution
(profile → agent contract), or the single-backend shape gets baked in a second
time** and the two-LLM requirement forces a Phase-6 redesign. One declaration
in the probe design now; a redesign later. Route: probe design + T-245/T-246
(the 5.0.1 scaffold declares worker seats and the manager/observer seat on
different providers).

## F2 — Phase 2 census + Phase 4 oracle: expect CASCADING gaps, not monotone

Verified in `c_algebra_hog_compiler.ts`: the `c_workflow`, `c_batch`, and
`c_retry` cases return `stages: []` **without recursing into children**. A
nested composition (e.g. workflow wrapping batch wrapping retry) surfaces only
the OUTERMOST unrealized gap per branch. Consequences: (a) the Phase-2 typed
gap census may undercount — it is a frontier census, not a total census; (b)
Phase 4's exit gate ("each compiler gap disappears") must be read as: the
expected frontier gap disappears AND the expected next-inner gaps NEWLY
APPEAR. If anyone reads the gate as "gap count monotonically decreases," a
correct realization will look like a regression. Cheap fix: one clarifying
sentence in the probe design and the T-244 `A5-F03` row.

## F3 — Phase 4 relief + one targeted question

Good news: a GTL-side `instruction_set` kind and `fixed_protocol_field_*`
refs already exist in m01 contracts — the instruction/protocol rework likely
EXTENDS an existing declaration family rather than inventing a kind (which
would have collided with the public-kind narrowing law). Targeted question
for the Phase-4 design rework's first hour: is `instruction_set`
publishable/library-scoped, or internal-only? If internal-only, the rework
needs a scoped requirement decision — better discovered in hour one than
after the design.

## F4 — Phase 7 census: CLEAN (no action)

Zero self-host residue in REQ-P-PUBLIC-CONTRACTS' mandatory capability list —
T-249's reprice cleaned it. The Phase-7 exact census will not demand a
capability the constitution no longer means.

## F5 — Phase 10: odd_glc retarget still pending (pre-stage now)

All four odd_glc tickets (T-033/T-037/T-038/T-039) still sit in its tree
targeted at the dropped R5/I1 identities. Not urgent — but it is the only
Phase-10 entry work, it belongs to the odd_glc pen, and it can be retargeted
any time before the 5.0 RC. Pre-stage it as a named small task so the release
week doesn't discover it.

## Board effect

F1 and F2 go to codex now (probe in flight). F3 is a first-hour question for
the Phase-4 rework. F5 is pre-staged. The board gains a "forward flags" line;
estimates unchanged.
