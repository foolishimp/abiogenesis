# Independent Code Review: T-270 S05 Realization Candidate `3a10bd56`

- reviewer: claude (independent, heterogeneous)
- date: 2026-07-27T04:00Z
- candidate: `3a10bd562193e4028c38a37208cd6d8175be2609`
- candidate tree: `1a89378f3027443b37953e08a64520a39abf8d44` — **exact**
- evidence head: `16b30f39`, local == remote
- accepted design basis: `283325aa`
- scope: 26 files, +3,118 / −1,102; 17 source files

## Verdict

**ACCEPT for direct human S05 acceptance. No P0/P1/P2 finding.**

The implementation is an exact projection of the accepted design. I answered
all six review questions affirmatively after reading the code, not the gate
counts — and every claim in the handoff reproduces. Two smaller notes are
recorded at the end; neither blocks.

## My Design-Review Findings Were All Repaired

I reviewed the predecessor design cut (aggregate `6a809f94…`) and found it not
design-method complete. Measured at the accepted design `283325aa`:

| My finding | Then | Now |
|---|---:|---:|
| Whole-family Prime contraction absent | 0 | **10** |
| Ontology absent | 0 | **8** |
| Cross-view axiom evaluation absent | 0 | **2** |
| Mermaid views absent (bullets only) | 0 | **3** |
| REQ-006 panel cardinality unprojected | 0 | **14** |
| REQ-013 temporary/three-application workspace unprojected | 0 | **4** |
| REQ-003 downstream contribution unprojected | 0 | **16** |
| REQ-015A human affirmation unsurfaced | 0 | **1** |
| §13 supersession relation unstated | 0 | **2** |

All five recommended repairs landed before implementation began. That is the
correct order, and it is the first time in this milestone that a design
finding was fully discharged before code rather than during it.

## Mechanical Evidence — All Exact

Run in a disposable worktree at the candidate.

| Gate | Claimed | Verified |
|---|---:|---:|
| S05 module | 15/15 | **15/15** |
| Installed Consensus | 23/23 | **23/23** |
| Full M5 | 152/152 | **152/152**, 0 skipped / 0 todo |
| M4 | 26/26 | **26/26** |
| S03 module | 4/4 | **4/4** |
| Installed external Product | 36/36 | **36/36** |

Package: SHA-256 `303985d0…064e54d` — **byte-identical across two independent
packs**, 183 entries, 298,202 bytes. All three match the handoff exactly.

## Answers To The Six Review Questions

### Q1 — Does every changed code relation project the accepted design without inventing another semantic choice?

**Yes.** The module projection in the design is realized literally (see Q6).
The twelve design relations appear as named code relations, and the repaired
design elements are realized: panel cardinality is never a literal — every
comparison is against `panel.profiles.length` (`consensus.ts:1706, 2154`),
with only a `< 1` non-empty floor at `:1794`. The three workspace applications
are exercised through one parameterized harness path
(`workspace-applications/<label>`), which is the "three applications of one
contract, not three runtime modes" relation REQ-013 demands — realized as
data, not as branches.

### Q2 — Can any successor round begin without the exact Product-valid, ABG-admitted submitter response?

**No, and the guarantee is structural rather than defensive.**

`reduceConsensusRound(response: ConsensusSubmitterResponse)` takes the
submitter response as its **only** parameter, and reaches the findings vector
*through* it — `const vector = response.task.findingsVector`. There is no
signature by which a caller can reduce a vector without the response that
embeds it, so "successor round without response" is unrepresentable rather
than merely rejected. The runtime guard `isConsensusSubmitterResponse` backs
it, and the round-consistency check then requires every finding to agree on
invocation, round ref, round ordinal, subject ref+digest, panel digest, and
policy digest before any outcome is computed.

Test evidence asserts the same property semantically, not by count:
"every admitted round must expose one exact submitter response";
"round-two reviewers must receive the exact admitted round-one response";
"S05 exact submitter-response basis gates reviewer reconsideration".

### Q3 — Do retry, recursion, foldback, durable reopening, and same-Run F_H continuation preserve one occurrence lineage and one final result?

**Yes.** The new generic machinery in `hog/graph_execute.ts`
(`suspendHeldWorkflowTraversal`, `resumeHeldWorkflowTraversal`,
`resumeHeldRecursionTraversal`, `restoreDeferredRecursion`) carries
suspension/resume as HoG capability. Assertions bind the invariants directly:
"one held Consensus Run must admit exactly one final result"; "an unresolved
source must remain in the same open Run"; "the admitted Product result
candidate must not fabricate future replay identity"; "S05 public result binds
real replay while its authority rejects digest tampering".

### Q4 — Are the outcomes total and mutually exclusive?

**Yes.** The classification is a single if/else chain with no fallthrough:

```
contractFailureRef !== null   -> contract_failure
: terminalOutcome === escalate_fh -> unresolved_disagreement
: dissentProfileRefs.length === 0 -> unanimous_agreement
: partial_agreement_with_dissent
```

Total (every input lands), exclusive (chained), and exactly the four states
REQ-P-CONSENSUS-008A requires without collapsing to a boolean. Both F_H
finalizations map distinctly: `accept_with_dissent →
partial_agreement_with_dissent`, `reject → unresolved_disagreement`. The
module test names this directly: "round reduction and same-Run human
finalization form one total Product algebra."

### Q5 — Do generated serialized assets and native semantics carry one digest-bound meaning?

**Yes.** `consensus_schema.ts` constrains digests to
`^sha256:[0-9a-f]{64}$` and states "All digests are recomputed from their
Product-declared canonical bodies." The module gate asserts it as a projection
relation: "S05 serialized Consensus schema is one exact projection of native
Product meaning." Panel identity is self-verifying — `isConsensusPanel`
recomputes `panelDigest` over the canonical body and rejects mismatch.

### Q6 — Are the generic module boundaries preserved with no Consensus-specific runtime authority?

**Yes — and this is the strongest structural result in the candidate.**

| Module | Consensus references |
|---|---:|
| `gtl/` | 1,631 |
| `implementation/` | 280 |
| `product/` | 99 |
| **`hog/`** | **0** |
| **`abg/`** | **0** |
| **`public/`** | **0** |
| **`validator/`** | **0** |

That matches the design's module projection exactly. The new 512 lines in
`hog/graph_execute.ts` (1,497 total) contain **zero** occurrences of
`reviewer`, `submitter`, `panel`, `round`, `ruling`, `finding`, or `ticket` —
it is generic traversal suspension/resume, not a Consensus round-runner in
generic clothing. That was the single highest-risk possibility in a change
that adds this much to HoG, and it is clean.

The candidate also keeps the July-24 antibody executable: "S05 generic Public
and ABG invocation basis contain no Consensus branch."

## S03 Anti-Pattern Check — Clean

The defect I missed at S03 was a test encoding a prohibited sequence as the
expected contract. Here: 8 `disposition, "succeeded"` assertions in the
installed suite, **zero** followed by a `refused` expectation. The pattern is
absent, and the assertion messages are semantic claims rather than count
checks.

## Notes (Non-Blocking)

**N1 — REQ-015A's affirmation is now owed at this gate.** The design surfaces
it, and it is worth restating at the point of decision: S05 closure requires
*direct human affirmation* that the non-public F_H support GraphFunction
preserves one public entry, and REQ-015A explicitly bars prior implementation,
tests, review, or delegated acceptance from supplying it. Nothing in this
candidate discharges that; nothing in it should. This review does not supply
it either.

**N2 — the conservation placeholder still stands.**
`m5-traversal-conservation.test.mjs:202` still carries the `PENDING immutable
RC5 witness` string the gate accepts. Order 6, so deferral remains lawful, but
this is now its fourth review.

## Recommendation

Accept. The candidate projects the accepted design faithfully, the six
questions answer clean on the code, and every mechanical claim reproduces
exactly. The remaining gate is the direct human affirmation REQ-015A names —
which is Jim's act, not a reviewer's.
