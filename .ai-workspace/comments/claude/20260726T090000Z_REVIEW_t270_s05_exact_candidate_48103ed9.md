# Independent Exact-Cut Review: T-270 S05 Candidate `48103ed9`

- reviewer: claude (independent)
- date: 2026-07-26T09:00Z
- candidate: `48103ed936aa9326d546f4dcd667b16a5c803f9c`
- tree: `e954654fe57eff416808ca7370f43b8327a9f04d`
- evidence head: `7eede0d0` (2 docs-only commits), local == remote
- span reviewed: 17 commits since S03 acceptance `2fbf1a41`; 53 files,
  +7,673 / −901

## Verdict

**Substantively sound. I concur that S05 is ready for direct human
acceptance, with one process finding Jim should see before ruling.**

Every mechanical claim verifies exactly. The design-method closure that was
missing at the S03 candidate is now genuinely present for S05 — I checked it
against `DESIGN_MODULE_METHOD.md`'s stated column requirements rather than
against its own section headings, which is the check I got wrong last round.
The historical S05 defect from the Prime audit is closed. No S06 intrusion.

The one finding is a **retroactive change-class reclassification** (F1). It
does not falsify any claim in the candidate, and I do not think it blocks —
but it is a triage-order defect against Jim's stated discipline, and the
ruling should acknowledge it rather than absorb it silently.

## Mechanical Verification — All Exact

Run in a disposable worktree at `48103ed9`.

| Claim | Result |
|---|---|
| Candidate / tree | `48103ed9` → tree `e954654f` — **exact** |
| Evidence head `7eede0d0` | local == remote; the 2 commits touch `.ai-workspace/` only |
| `test:m5` 147/147 | **147/147**, 0 fail / 0 skipped / 0 todo |
| `test:m4` 26/26 | **26/26** |
| `test:m5:consensus` 21/21 | **21/21** |
| `test:m5:external` 36/36 | **36/36** |
| Package `85ca145e…d733` | **exact**, reproduced twice, byte-identical |
| 183 entries | **183** |
| Tracked worktree clean | confirmed; my two untracked reviews + the codex strategy post preserved |

**Gates the report did not claim, which I ran anyway** (all green):
`test:m5:consensus-unit` **12/12**, `test:m5:s03-unit` **4/4**,
`test:m5:conservation` **62/62** (expanded from 40),
`test:m5:portability` **3/3**.

## Design-Method Closure For S05 — Now Real

At the S03 candidate I recorded that "Sections 13 and 14 show none of the new
derivation substructure and no diagrams." §13 has since been rebuilt to the
same standard §12 reached, and this time I verified conformance against the
standard's requirements:

- **§13.5 Prime contraction** carries exactly the six columns `STDO-UP-003`
  demands — candidate family, contraction relation, retained meaning,
  authority before → after, accepted loss, falsification condition — plus IACS
  disposition, across 11 candidate families.
- **§13.8 Cross-view axioms** carries all ten columns `DMM:993` demands, 18
  axiom rows, explicit verdicts, including a `not_applicable` with a stated
  reason ("immutable release asset, not runtime state").
- §13.1–13.10 provide Boundary Ontology, entity-lifecycle completeness,
  authority matrix, atomic functions, IACS/module ownership, three semantic
  views (3 mermaid diagrams at 2570/2795/2904), operational lifecycle and
  proof, and a promotion boundary.

## The Prime Audit's S05 Defect Is Closed

The 2026-07-25 audit's S05 finding was that "S05 proof bypassed
`project.read` (no `ticket_consensus` variant exists)."

`m5-installed-consensus.test.mjs` now drives `abg.operation.project.read`
through `runInstalledCli` with explicit variants, for both projection
authority and continuation authority, and asserts at :697 that "project.read
must not append runtime truth." That is the ordinary public path, not a
bypass.

## Strengthened Acceptance Conditions Are Evidenced

GOALS Order 2 was **tightened** during this wave, not relaxed — conditions
gained "exact ticket bytes and resolved profile instructions carried into
every attributed reviewer task" and "malformed attributed reviewer output
produces a typed, replay-visible, publicly readable `contract_failure`."
Strengthening acceptance mid-outcome under review pressure is the right
direction and worth crediting.

Both are evidenced, largely in the new module lane:

- `contract_failure` asserted three times including on the replay-visible
  event payload (:1937).
- "S05 ticket Consensus binds ticket identity to the exact subject bytes."
- "S05 reviewer profiles bind every execution-affecting configuration field."
- "S05 reviewer realization carries the Product-declared instruction contract."
- "S05 module publishes the exact Consensus contracts, vocabularies, and
  ordinary GTL callable."
- **"S05 generic Public and ABG invocation basis contain no Consensus
  branch"** — this is the July-24 front-door hard-coding antibody running as
  an executable gate. That failure class is now mechanically defended, not
  just remembered.

## S03 Anti-Pattern Check — Clean

The defect I missed at S03 was a test asserting `responded: "succeeded"`
followed by `completed: "refused"` — the prohibited sequence encoded as the
expected contract. I checked for it here: 9 `disposition, "succeeded"`
assertions in the consensus suite, **zero** followed by a `refused`
expectation. The pattern is absent.

## Scope — No S06 Intrusion

No observer, tuner, portability, or S06 file appears in the 53-file span, and
§14 gained zero lines. GOALS still reads "S06 remains open and unselected."
T-270 holds `implementation_hold: held_for_direct_human_s05_acceptance` with
the effect that only acceptance or rejection of this exact subject may
proceed. The requested ruling correctly says "Do not select S06 through this
ruling."

## F1 (process, non-blocking) — The Change Class Was Reclassified After The Change

`REQ-P-CONSENSUS-015` — a Product requirement — was rewritten during
implementation. The sequence:

| Time | Event |
|---|---|
| …through 15:35 | T-270 `change_class: design_reframe` |
| **16:48** (`61c7676e`) | **REQ-P-CONSENSUS-015 edited** |
| **16:51** (`2e32a6ec`) | T-270 `change_class` → **`requirement_reprice`** |

The requirement changed first; the ticket was reclassified three minutes
later. `triaged_at:` still reads `2026-07-25` — the recorded triage is the one
that produced `design_reframe`, not the current `requirement_reprice`.

Under the recorded discipline that a ticket opens with a performed intake
triage and declares the smallest lawful re-entry *before* the change, this is
inverted. It is also the same shape as the S03 finding — authority text
adjusted to match work already done — though materially milder: nothing was
weakened or deleted, the reclassification moved *up* to the more
constitutional class, and REQ-P-CONSENSUS-015 is now correctly named as the
ticket's re-entry point.

**On the substance of the reprice itself, I do not object.** The rewrite
tightens the rule (from a generic `invoke` variant to the `start` variant,
supervised One Surface start identity, and `until=converged`). The one clause
worth Jim's eye is the added carve-out:

> The non-public replay-bound F_H support GraphFunction may use the existing
> direct variant only when ABG derives and admits its exact source-result
> basis.

That is a narrow, condition-bearing exception rather than a blanket one, and
it is consistent with the S03 evidence-basis law. But it is exactly the kind
of clause that gets added to legalize a realization, so it deserves an
explicit "I meant this" rather than passing through inside an accept.

**Recommended handling:** rule on it in one line — either affirm the reprice
and the carve-out as intended Product meaning, or direct that
`triaged_at` be corrected to record when the requirement_reprice was actually
triaged. Neither requires a new candidate.

## Standing Items Not Belonging To S05

- The conservation gate still accepts placeholder witnesses
  (`m5-traversal-conservation.test.mjs:202`, `PENDING immutable RC5
  witness…`). Conservation is Order 6, so deferring remains lawful — but this
  hole has now survived three reviews and should be hardened before M6 rather
  than rediscovered there.
- My two ABG reviews remain untracked. Seventh instance of review findings
  living outside the durable record.

## Recommendation

The subject is sound and the evidence is real. The ruling is Jim's to give,
not mine — I am the reviewer, not the acceptance authority. If he accepts, F1
warrants one accompanying sentence so the requirement reprice and its
carve-out are affirmed deliberately rather than absorbed.
