# Independent Exact-Cut Review: T-270 S03 Candidate `19f50c17`

- reviewer: claude (independent)
- date: 2026-07-25T09:45Z
- candidate: `19f50c17`; evidence head `dea9700a` (docs-only, +1 commit)
- branch `codex/t286-abi5-root`; local == origin; worktree clean (0 paths)

## Verdict

> **SUPERSEDED — my acceptance recommendation was wrong (claude, 2026-07-25T10:15Z).**
> An independent review rejected `19f50c17` with two P1 blockers and one P2
> proof gap. I verified all three against the bytes and they hold. S03 stays
> open; S05 stays unselected. Correction recorded at the end of this file.
> The gate reruns, identity, and package-reproducibility evidence below remain
> valid — the reviewer confirms them too. The **design-depth assessment and the
> destination-gate paragraph are falsified** and should not be relied on.

~~Every claim verifies. Recommend acceptance of the S03 candidate.~~ This is
the first checkpoint in this lineage where the design-derivation depth the
Prime audit demanded is present in *structure* — but structural presence is
not conformance, which is the error corrected below.

Three findings, all minor; none blocks.

## Gates — Rerun Independently, Not Repeated

| Gate | Claim | My result |
|---|---|---|
| `test:m4` | 26/26 | **26/26 pass** |
| `test:m5` | 123/123 | **123/123 pass** (clean worktree) |
| `test:m5:external` | 36/36 | **36/36 pass** |
| Package digest | `de1af9e7…b2a6a` | **exact**, reproduced twice |
| Inventory | 172 files | **172**, identical across both packs |

Package reproducibility is genuinely strong: two independent `npm pack` runs in
a clean worktree produced **bit-identical tarballs** whose SHA-256 equals the
recorded `artifactDigest` exactly. Content digest over sorted members also
matched across packs (`cd58a884…`).

The freeze commit `dea9700a` touches only the checkpoint and T-270 — the code
subject is `19f50c17` as stated.

## Design-Derivation Depth — The Audit's Core Finding Is Answered

The 2026-07-25 Prime audit's central charge was that S03/S05/S06 were "appended
after that design gate without repeating or extending the affected Ontology and
Prime derivation," with zero mermaid after line 1167. M05 §12.0 now carries a
real derivation, which I read rather than counted:

- **Ontology slice** — 11 entity/value families with identity + cardinality,
  authority, and lifecycle; 5 explicit cardinality/authority invariants; an
  entity-lifecycle closure table.
- **Functions, authority, composition** — 8 function families as
  input → output with proposer/semantic-evaluator, verifier/admitter, and
  executor/projector columns. The F_D/F_P/F_H split is explicit per function.
- **Whole-family Prime contraction** — four alternatives with dispositions and
  reasons; the retained one is justified against the three rejected. It
  concludes no ninth Prime family is introduced.
- **IACS** — six S03 members mapped onto M3's accepted eight-family IACS with
  stereotypes and module/visibility.
- **Three views** — three mermaid diagrams at lines 1278/1331/1362, i.e.
  precisely in the region the audit found empty.
- **Cross-view axioms and module proof** — present as its own subsection.

This is derivation, not an appended prose section with authority tables.

Notably, three of the audit's five realization defects are closed *at the
design level* by the Prime table and invariants: the process-local continuation
registry is a **rejected** Prime alternative (the ambient WeakMap fallback);
invariant 3 puts Product semantics — not shape — in charge of F_H response
meaning; invariant 5 makes `until = converged` singular for both
`root_mode = direct` and `supervised`, resolving the REQ-P-POLICY-013
contradiction. The S05 `project.read` defect is correctly out of scope.

## Scope Discipline

§12.0 states plainly: "Sections 13 and 14 remain outside the selected outcome."
Sections 13 (S05) and 14 (S06) show none of the new derivation substructure and
no diagrams — correct for a bounded S03 correction under GOALS Order 1, and the
absence of S05/S06 derivation is not a gap here.

## Non-Closure Is Correctly Preserved

- T-270: `review_status: pending_independent_exact_cut_review`; "The
  implementation at `bcd8769a` is retained behavior, not accepted closure";
  "This state does not close S03 or authorize S05, S06, qualification, or
  release."
- Checkpoint: "The Codex pen-holder cannot accept this subject. An independent
  reviewer must … Until then T-270 and S03 remain open, and S05/S06 remain
  held."

The pen-holder explicitly declining to self-accept is the direct antidote to
postmortem §6.2 (implementer, self-reviewer, and delegated F_H seat collapsed).
Worth recording as a behavioral change, not just a process note.

## Propagation Defects From The Adoption Wave — Both Fixed

My 06:20Z adoption review missed two defects a later review caught. Both are
now closed, and I verified them directly:

- **STDO 2.0 in qualification law:** `REQ-P-QUAL`, `REQ-P-SELF-CONFORMANCE`,
  `REQ-P-SCENARIOS`, `PRODUCT.md`, and `GOALS.md` all now name `v2.2.0`, each
  carrying "STDO `v2.2.0` qualification identity amended by direct F_H
  adoption." A negative grep for `v2.0.0` / `94ccf4fa` / `284efbb3` across
  `specification/`, `CLAUDE.md`, `AGENTS.md` returns **nothing**.
- **T-272 as current design owner:** T-272 is in `tickets/completed/`, and
  every live reference marks it historical — GOALS:75 "historical input, not
  current execution authority"; CLAUDE.md:89 "Completed T-272 is evidence
  only."

## Destination Gate

What a user can do now that they could not: hold an F_H interaction, cross a
process boundary, and resume by explicitly supplying a durable continuation
authority — with an invalid F_H response refused on Product meaning rather than
admitted on shape. Previously continuation admissibility could depend on
ambient process state. That is user-facing Product behavior on the external
path, covered by the 36/36 external-product gate, not internal completion.

## Findings

**F1 (gate reproducibility, non-blocking) — `test:m5` is state-sensitive in
the main checkout.** Run in `abiogenesis-5-root-build` directly I got
**115/123 twice, with different failure sets** (portability once; Consensus ×3
+ F_P/CLI/worker-lane/salvage the next). Those same tests pass in isolation —
and the signature is diagnostic: in the aggregate the "failures" died in
~320 ms, while in isolation they take 3,000–5,700 ms. They failed before doing
work. In a clean disposable worktree at `dea9700a` the full gate is
**123/123**.

So the 123/123 claim is true, and the residual state lives in the main
checkout, not in the candidate. But a reviewer who runs the gate the obvious
way gets 8 red and has to work out why. Recommend either a `clean` step in
`test:m5` or an explicit note in the checkpoint that the gate is
worktree-sensitive. This is the third recurrence of the
one-gate-runner-per-worktree hazard.

**F2 (reporting hygiene, minor) — "Mermaid: 7/7" is not a gate.** It is the
count of ```mermaid blocks in the M05 design doc. Listed among four real gate
results it reads as a fifth gate. The underlying fact is good — and it is the
right fact to report, since the audit's charge was diagram absence — but label
it as an artifact count. Same class as the "178 references" note from the
adoption review.

**F3 (deferred structural hole) — the conservation gate still accepts
placeholder witnesses.** `m5-traversal-conservation.test.mjs:202` still carries
`PENDING immutable RC5 witness reconciliation for ${behavior}`. The *claim* was
correctly repaired — GOALS now says the forty-row matrix "is implementation-
coverage evidence. It is not RC5 conservation closure while its immutable 4.6
witnesses remain pending" — so this is no longer an over-claim, and
conservation is Order 6 (qualification), not S03. Deferring is lawful. But the
gate itself still cannot reject a placeholder, and that is the exact mechanism
that produced the false 40/40. Schedule the hardening before M6 rather than
rediscovering it there.

## Coverage Statement

I verified GOALS S03 acceptance conditions 1–5 and 7 through the design text,
the invariants, the Prime/IACS tables, and the green external-product and M5
gates. Condition 6 ("existing One Surface, correction, re-entry, replay, and
negative behavior remains green") I take from the full 123/123 + 26/26 + 36/36
reruns rather than from per-behavior tracing. I did not audit every code path
implementing the design; I read the derivation and confirmed the gates that
bind it.

---

## Correction (2026-07-25T10:15Z) — Acceptance Recommendation Withdrawn

An independent review rejected `19f50c17`. I verified all three findings
against the bytes; all hold. **My recommendation to accept was wrong.**

**F1 (P1) — confirmed.** `m5-installed-external-product.test.mjs:2348`, the
test named "refuses expected but unobserved output assets before continuation
resume", submits `semanticEvidenceAssetRefs: []` and then asserts
`result.responded.disposition === "succeeded"` with
`result.completed.disposition === "refused"`. The evidence/intent equality is
enforced at `code/src/abg/continuation.ts:1126-1127`
(`semanticEvidenceAssetRefs.join("\0") !== intent.outputAssetRefs.join("\0")`)
— at ABG resume, not in the installed Product evaluator. That is verbatim
T-270 defect 2: "an F_H response that differs from the Product-owned pending
choice can be recorded as succeeded before later continuation refuses to
close." It also falsifies M05:1215 invariant 3, **which I quoted approvingly
as evidence the defect was fixed**.

Worth stating beyond the reject: the test *name* documents the deferred
rejection as intended behavior. This was not an overlooked path — the
prohibited sequence was written down as the expected contract. The design
invariant and the test disagreed, and the test won. The fix is not only moving
the check; it is that a wrong contract was encoded and gated green.

**F2 (P1) — confirmed.** I checked DMM §562 in the installed projection: Prime
review must "evaluate the complete candidate function and carrier family, not
only each proposed unit in isolation" and answer five named contraction
questions. M05:1255 compares four *architecture alternatives* with
dispositions. That is an architecture-choice table, not a family contraction,
and it answers none of the five questions. I called it "whole-family Prime
contraction" because the document is headed that way.

**F3 (P2) — confirmed.** `m5-installed-external-product.test.mjs:650` maps
`publicTarget === null ? "supervised" : "direct"`; the first_traversal
scenario passes a non-null target, so it exercises **direct** only. No
supervised first_traversal negative exists anywhere in `test_env/tests/`.

### T-270's Four Owned Defects — Status

| # | Defect | Status |
|---|---|---|
| 1 | process-local continuation fallback | **fixed** — `requireContinuationAuthority` (`public/operations.ts:1649`) refuses `missing_prerequisite`; no lookup fallback |
| 2 | response recorded succeeded before continuation refuses | **not fixed** (F1) |
| 3 | `until` singular across requirement/design/code/proof | runtime correct (`gtl/public_start.ts`); **under-proven** (F3) |
| 4 | S03 design-method closure | **not closed** (F2) |

One of four closed cleanly.

### My Review Error

I ran the gates and confirmed identity and package reproducibility — the
reviewer confirms those too, and they stand. What I failed to do was read what
the green **asserted**, and compare the design against the installed
standard's **requirements** rather than against its own section headings.

Both failures are one class, and it is the class my own recorded review law
names: never accept a status label without reading the data beneath it, and
check design-derivation *conformance*, not the presence of correctly-titled
sections. I checked that Ontology / Prime / IACS / three-views / axioms
existed as headings and never opened `DESIGN_MODULE_METHOD.md` to compare. A
36/36 green suite was treated as verification when one of its members
certifies the defect.

This is the same error I made this morning repeating a conservation label over
PENDING witnesses. Reading the gate output is not reading the evidence.
