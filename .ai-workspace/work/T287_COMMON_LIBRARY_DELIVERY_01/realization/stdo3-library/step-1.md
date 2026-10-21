# Step 1. Design re-entry at the operator algebra

Plan: `.ai-workspace/comments/claude/20261021T162409Z_PLAN_library_consolidation_pen.md`, step 1.
Executive: Claude Fable (main session). Worker: Opus 5.5, xhigh, fresh context, Writer grant.

## Activation

**Role and outcome.** You are the Worker holding the Writer grant for step 1.
Outcome: the common computational library design of ABIogenesis 5 is
re-entered from a catalog of modules (K01 to K12, Codex's accepted C1 to C5
contracts) to a design derived from the operator algebra of constitution
§5.6.1, as written in the Executive's design post, Parts B1 to B13. Change
class: `design_reframe`. One commit on `main`, no push.

**Subject and frame.** Repository `/Users/jim/src/apps/abiogenesis`, branch
`main`, head `93a4b08df`, tree clean except the Executive's step file and the
plan ledger row. Frames from the project basis
`build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`:
`f-law`, `f-checks`, `f-claim`. Derived Worker frame: released STDO 3.0.0
`EXECUTIVE_BASELINE.md` §9 (copy at
`/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/c5e4c12f-3ef0-4d89-89e0-6d0073419181/scratchpad/EXECUTIVE_BASELINE.md`).

**Files in the grant.** Exactly these five, all under `/Users/jim/src/apps/abiogenesis`:

1. `build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` (429 lines now).
2. `build_tenants/abiogenesis/typescript/design/ABI5_STDO3_COMPUTATIONAL_BINDING.md`, §4 "Existing operator classes" only (lines 78 to 96 now); §4's "Seven C constructors" and "Composition and refinement" stay.
3. `build_tenants/abiogenesis/typescript/design/ABG_EVENT_CALCULUS_IACS.md` (35 lines now).
4. `.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md`: one new section appended at the end.
5. `specification/GOALS.md`: the `GOAL-035` row (line 18), one sentence group replaced.

Plus this file: append your `## Return` section. Nothing else is in the grant.
No file under `code/`, no other design document, no constitution text, no
requirement, no other GOALS row, no other ticket.

**Hard constraints.**

- The design post is the content authority:
  `/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/claude/20261021T135156Z_REVIEW_compute_calculus_and_library_design.md`,
  Part B (B1 to B13). Part A is background. Do not re-derive the design; transcribe it into design form.
- Constitution `build_tenants/abiogenesis/typescript/design/ABI5_REALIZATION_CONSTITUTION.md`
  §5.6.1 (the eight operator signatures) and §5.6.2C (the three module-static
  combinators `bindStaticOwner`, `bindExactPrefixRead`, `bindExactPrefixTransition`;
  no fourth combinator, registry, callback, controller or mode selector) are
  untouched and must be quoted consistently. The design realizes them.
- Writing: the released WRITING_GUIDE (copy at
  `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/c5e4c12f-3ef0-4d89-89e0-6d0073419181/scratchpad/WRITING_GUIDE.md`).
  Design documents are live design in the present tense: no narration, no
  dates, no "proposed" or "accepted" markers, no agent or model names, no
  commentary about reviews. Introduce every term once, plainly. Direct
  technical prose. The ticket section is the one place for dates, decisions
  and history.
- Structure: released `DESIGN_MODULE.md` (copy at
  `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/c5e4c12f-3ef0-4d89-89e0-6d0073419181/scratchpad/DESIGN_MODULE.md`),
  §5 ontology-first design: boundary, ontology, irreducible carrier set,
  atomic function families with typed parameters, higher-order composition
  with laws, Prime atoms with admitted domain and falsifier, three views,
  three accounts. Read §5 before writing; do not read the whole standard.
- Decisions, already taken by the owner on 2026-10-22 at the recommended
  defaults (plan, "Decisions Jim owns"): D0 the cross-consumer handoff is
  withdrawn; D1 `ROOT_DERIVED_RULES` carries contextual Event Calculus
  effects; D2 the digest leg of `checkExactRecord` runs after projection;
  D3 the native composite classifications are ingress questions answered by
  `admitContract`; D4 the throwing `i_json` entry stays as a lift over
  `admitJson` until retired; D5 `terminationConfirmed` leaves event payloads
  and artifacts through a new root event profile with the legacy digest
  retained. Write these as design, not as open questions.

**What changes in each file.**

1. Library design document. Replace the catalog with the derived design.
   Keep the title. Keep §1 (selected asset and Product boundary) and rewrite
   §1.1 so it names the design's boundary in and out (post B1) instead of
   Codex's contracts. Then: library organization and dependency direction
   (B2, including the module table and the three moves); the structural
   refusal carrier and the atomic families with typed signatures (B3: validate
   in `shared/admit/`, select in `shared/select/`, derive in `shared/value/`,
   project in `abg/calculus/`, lift in `shared/binding/`, process facts in
   `shared/process/`); higher-order composition with laws (B4); Prime atoms
   with admitted domain and falsifier (B5, plus the `holdsAt` atom from B13);
   irreducible carrier set (B6, with the `OwnedProcessFacts` row as amended in
   B13); three accounts (B7); three views as Mermaid (B8); the recovery
   invariant as a library law (B13: one fact, one event, every consumer folds
   the log; the `terminationConfirmed` case as the worked example; the
   replacement for the withdrawn handoff; the held-suspension instance named
   as a follow-up); retirement sequence and proofs (B9, B10 as amended, with
   D0 to D5 written as design); conformance claimed and not claimed (B12).
   Current §7 (source-to-library-to-outcome paths) and §8 (finite coverage,
   all fifteen Product families) state live obligations: retain them,
   re-expressed over the new module names, unless a passage only describes
   the K catalog or Codex's C1 to C5, in which case it goes. List every
   retained passage and every dropped passage in Return.
2. Binding document §4 "Existing operator classes". Replace the demotion
   ("classifications, not a sufficient library specification") with: the
   eight operator classes are exported function signatures, realized by named
   atoms in named modules; one table, operator to module to atom, consistent
   with the design document.
3. Event Calculus IACS. In the Irreducible Carrier Set, realize
   `RuntimeDerivedFluentRule` as `DerivedEffectRule` with the declared table
   `ROOT_DERIVED_RULES`; add `FoldState` and `HoldsAt` as carriers; state that
   `RuntimeEventCalculusDerivation` is the memoized realization of the pure
   `foldStep`, not a carrier. In the Proof Surface, `holdsAt` is the only
   admitted reader of a lifecycle fact; name the falsifier.
4. Ticket T-287. Append `## STDO 3 Library Re-entry (2026-10-22)`: change
   class `design_reframe`; D0 withdraws the acceptance recorded in
   `.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/common-consolidation-conjunction-01/decision.md`
   (row "Cross-consumer handoff") and states the replacement; D1 to D5 as
   taken; the plan post as the step ledger; the five Codex source cuts keep
   their static readiness as historical evidence and are superseded by this
   design; the held-suspension follow-up (`HeldWorkflowSuspension`,
   `HeldRecursionSuspension`, `rehydrateParentReturnFrames`) recorded for its
   own re-entry. Dates and decisions belong here, not in the design documents.
5. GOALS `GOAL-035` row. Replace the sentences from "Root's design
   conjunction accepts" through "Five source cuts retain static/syntax
   readiness only." with one or two sentences: the operator-family library
   design (relative link to the design document) supersedes the conjunction's
   bounded contracts; the cross-consumer handoff is withdrawn; realization
   proceeds by the eight-step plan (relative link to the plan post). Keep the
   rest of the row verbatim.

**Open solution space.** Section numbering and headings, prose, and the
Mermaid views are yours. Reuse the post's wording where it is already design
prose; rewrite where it is review prose. Keep the design document under
about 600 lines; proportionality is ambiguity removed per concept added.

**Self-check before the commit** (record each result in Return):

1. The three views name the same carriers; list the carriers per view.
2. Every Prime atom has an admitted domain and a falsifier.
3. `grep -n "K0[1-9]\|K1[0-2]" ` over the three design documents returns nothing.
4. `grep -n "process-failure.json"` over the three design documents returns nothing except the recovery law's statement that it is not used.
5. `grep -n "classifications, not a sufficient"` over the binding document returns nothing.
6. Every relative link you wrote resolves to an existing file.
7. No model or agent name, date or "proposed"/"accepted" marker in the three design documents.

**Return contract.** Commit with `git add -A` from `/Users/jim/src/apps/abiogenesis`
(the tree holds only your edits, this file and the plan ledger row). Message:
first line `Step 1: re-enter the common library design at the operator algebra`,
a short body, last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
Do not push. Then append to this file:

```
## Return
- commit: <hash>
- changed paths: <path: lines before -> after>, one per line
- self-check: 1..7 with result
- retained passages (design doc §7, §8): <list>
- dropped passages: <list with one-line reason each>
- residuals: anything in B1..B13 not carried, with reason; anything uncertain
- return route: this file
```

Your final report to the Executive is at most twelve lines: commit hash,
files changed, self-check summary, residual count. Do not paste the diff.

**Stop contract.** Stop without committing, and write the reason with exact
lines under `## Return`, if: (a) carrying the post requires amending the
constitution; (b) a live obligation in the current design document cannot be
re-expressed over the new modules without a Product or requirement change;
(c) the GOALS row cannot be changed within the sentence group named above.

ACTION: execute step 1 as activated.
