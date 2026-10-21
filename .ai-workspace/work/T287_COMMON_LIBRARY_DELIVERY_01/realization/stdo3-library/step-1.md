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

## Return
- commit: `44be3cbce` on `main`, not pushed. Staged by path (the five grant files, this file, the plan post); see residual 11.
- changed paths:
  - `build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`: 429 -> 678
  - `build_tenants/abiogenesis/typescript/design/ABI5_STDO3_COMPUTATIONAL_BINDING.md`: 451 -> 451 (§4 operator table and lead paragraph; §1 lines 20-21, see residual 1)
  - `build_tenants/abiogenesis/typescript/design/ABG_EVENT_CALCULUS_IACS.md`: 35 -> 61
  - `.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md`: 5186 -> 5238 (section appended)
  - `specification/GOALS.md`: 989 -> 989 (GOAL-035 sentence group replaced by two sentences)
- self-check:
  1. Pass. Domain, sequence (two diagrams) and state views each name the same 18 carriers and no other: `JsonValue`, `Sha256Digest`, `StructuralRefusal`, `Outcome`, `ExactMatch`, `RecordCheck`, `CheckedRecord`, `RuntimeEvent`, `EventCalculusEffect`, `DerivedEffectRule`, `FoldState`, `HoldsAt`, `RuntimeFluent`, `OwnedProcessFacts`, `ExactDefinitionCallable`, `DefinitionCall`, `DefinitionReturn`, `DefinitionExecutionFault` (scripted check). All six Mermaid blocks parse with local `mmdc`.
  2. Pass. Design §6 has 11 rows (B5 plus `holdsAt`); each has an admitted domain and a falsifier.
  3. Pass. No `K01`-`K12` match in the three design documents.
  4. Pass. One match, design §9.3: "`process-failure.json` is not used."
  5. Pass. No match in the binding document.
  6. Pass. 78 relative links on changed lines across the five files resolve, anchors included.
  7. Pass for the library design and the IACS (the IACS `Date:` line removed). Remaining word matches are domain vocabulary: "human acceptance" (A5-F16 Product outcome, retained verbatim). Binding: my lines pass except the §5.6.1 signature word "proposal"; pre-existing marker text outside the grant remains at line 3 ("is accepted") and line 5 (date).
- retained passages (design doc §7, §8), now §11 and §12:
  - old §7 intro sentence (verbatim).
  - old §7 paths table, three rows: route column re-expressed over route labels (new §11 legend); outcome column verbatim.
  - "Sequence view: prepared native work" heading, Mermaid and both paragraphs (verbatim; heading kept for the `proof/README.md` anchor).
  - "State view: physical resource and admitted truth" Mermaid (verbatim); following paragraph with "Pure K01–K07 operations" -> "Pure library atoms and Product resolution".
  - static-binders paragraph (verbatim).
  - cross-view checks paragraph, first two sentences.
  - old §8 coverage-unit paragraph ("selected capability contract" -> "library family or owner route").
  - V1-V7 table: K labels -> module and route labels; V1 "accepted input set" -> "admitted input set".
  - V1-V7 evidence paragraph (narration "were performed for this design activity" rewritten; binding §7 link kept).
  - method-assessment paragraph (verbatim).
  - all-fifteen-families table: route column re-expressed; outcome column verbatim.
  - closing paragraph on F08/F12 and reserved 5.1 (verbatim).
  - Also carried from outside §7/§8: §1 body (location, C1-C5, item 5 and DS1 sentences rewritten; Product delivery sentence reworded); K06 partition contract -> §2; K01 seven I-JSON codes -> §4.1; K04 occurrence preservation and K08 null-digest partitions -> §4.2; K02 sink rule -> §4.3; K12 process-lifetime cases table -> §4.6; old §5 foundations -> §2 Foundations; old §6 D05, D06, D08, D09, D11 -> §10.4; old §9 O-* rows and E04 -> §10.3.
- dropped passages:
  - header Status line: conjunction acceptance, dates and Root history; history belongs to T-287.
  - header "Historical L1 basis" line: history, kept in its work record.
  - Selection line date: removed; sentence kept.
  - old §1.1 table and finite-scope paragraph: C1-C5 incorporated subjects, hashes, freezes and counts, superseded by this design.
  - old §2 table, domain-scaffold Mermaid and lineage paragraph: catalog organization, replaced by the B2 module table and §7 views.
  - old §3 K01-K12 sections: catalog, replaced by §3 and §4 (live content carried as listed above).
  - old §4: K mapping, demotion of operator classes to classifications, prose laws, functor paragraph; replaced by §5 laws and §8 accounts.
  - old §5 foundation table and discovery narrative: K-keyed and dated; condensed to §2 Foundations.
  - old §6 D01-D04, D07, D10: C1-C5 consolidation rows, superseded by §4 and §10.1; D10's failure file withdrawn by D0.
  - old §7 last two sentences of the cross-view paragraph: catalog-only, contradicted by §6.
  - old §9 intro, "Two native composite classifications" row (closed by D3), E02/E03 supersession paragraph, "Finite delivery order" list and closing paragraph: conjunction process history, replaced by §10.1 and the plan ledger.
- residuals:
  1. The demotion sentence is binding §1 lines 20-21, not §4. I replaced it with a pointer to §4 to satisfy self-check 5; outside the stated line range, inside the granted file.
  2. Constitution §10 "exact-match cardinality" and Table 5.6.3-B `N06` pin `product/exact_match.ts`. Move 2 leaves that location column stale once realized (plan steps 2 and 5). Relation, role and prohibited role are unchanged, so I did not treat it as a constitution amendment (no stop). The constitution owner should refresh the location column. Constitution §10 also prohibits caller axioms; the design states the axiom and rule tables are module constants.
  3. Gap closures beyond the post, all flagged for the Executive: (a) `StructuralRefusal.stage` gains `"materialize"` because B13 routes process facts through `Outcome` and B3's union had no such stage; (b) the `hasConfirmedOwnedProcessBoundary` body is the worker formula `scopeAbsence === "absent" && directExit !== null`, inferred from B13 and P-LIFECYCLE; (c) the lifecycle rule's S, T, U, A, R are defined from `abg/actor_process.ts:602-631` because B3 leaves them undefined; (d) `FoldState` and `HoldsAt` are prime in the library IACS, not subordinate as in B6, per this activation; `RuntimeEventCalculusProjection` is stated as the published projection of one `FoldState`; (e) JSON encoding of the `Error` and `bigint` fields of `OwnedProcessFacts` in refusal evidence is left to realization.
  4. Shared modules that B2 does not assign and that the design places explicitly: `rooted_topology_partition.ts` (`derive` atom); `public_function_contracts.ts`, `public_function_family.ts`, `public_function_projections.ts`, `public_invocation.ts`, `operation_definition_coordinate.ts`, `capability_contracts.ts`, `index.ts` (keep their roles; no atom).
  5. B11 is not carried: a comparison with superseded contracts is history; the T-287 section records the supersession.
  6. B12's "independence from my own earlier two reviews" and "decision completeness for D1 to D4" are not carried: review commentary, and the decisions are taken. B8's "candidate pack, not an accepted gate" is rewritten as the gate owner running the cross-view matrix.
  7. Design retirement rows 1-6 are plan steps 2-7. The ticket follow-up cites plan step 6.
  8. The inbound anchor `#k03--capturing-and-preserving-immutable-values` from `final-review-dispositions-01` (`capsules.md`, `K11-public-summary.md` and three preflight JSON files) now dangles; historical records outside the grant.
  9. Source line references carried from B3 and B13 (for example `actor_process.ts:631`, `event_calculus.ts:258` and `:1909`, the B13 sites) are realization coordinates at `93a4b08df`. I spot-checked 258, 631 and 1909; the B13 sites are not re-verified.
  10. The design document is 678 lines, 416 outside code and diagram blocks, above the guide of about 600.
  11. Tree state: at start, 16 out-of-grant files were modified (`build/code/src/*`, three contract inventories, `product-toolchain-manifest.json`). I did not use `git add -A` and staged by path. By commit time those files matched HEAD again (rewritten around 04:21-04:23 by something outside this session). I did not touch them. The commit holds exactly the seven intended paths.
  12. **B14 appeared after the read and contradicts the commit.** The design post gained "B14. Correction to B13" at 04:25, after I read Part B and before I found it at Return time. It is uncommitted and I did not stage it. `44be3cbce` transcribes B13 as written. I checked B14 against source:
      - PRODUCT.md lines 812-818 say "Ordinary internal handoffs use its established state". The opening of design §9.1 ("No interface hands a copy of a fact to another interface") overstates the law against Product.
      - `worker_transport.ts:455` delivers the facts through `onProcessFinalized`, and `actor_process.ts:1306` retains them. The outer catch at about `:1403` builds the refusal from the error message alone through `refuseActorProcessEffect`, which returns the owner refusal `actor_process_effect_refusal`. That makes the change site in §9.3 item 1 (`runProcess` yields `Outcome`) wrong.
      - `event_store.ts:1189` recognizes exactly the legacy and current digests, and reopen (`:3608`) rejects any other stamp. The committed D5, a new profile that keeps only the legacy digest, cannot be realized as written.

      (a) Factual corrections that one bounded follow-up edit can carry:
      - design §9.1, the law statement, per B14's three layers.
      - §9.3 items 1-2: the refusal is `refuseActorProcessEffect` carrying `finalProcessFacts`.
      - The `"materialize"` stage (residual 3a), the §3 admitted-domain sentence, the §4.6 "returns its terminal facts as an `Outcome`" sentence, the domain edge `OwnedProcessFacts --> StructuralRefusal` and the second sequence diagram. The facts travel in the owner refusal, not the library carrier. This changes the self-check 1 carrier lists.
      - §10.1 row 6 ("the throw path of the facts").
      - Residual 3e: B14 specifies the encoding. An `Error` becomes a description record and a `bigint` becomes a tagged base-10 string.
      - P-LIFECYCLE: B14's second negative, an error after launch with cleanup unresolved.
      - The D0 replacement text in the T-287 section.

      (b) Owner-decision conflict: D5 in design §10.2, in the T-287 section and in the plan's D5 row. Under this activation the owner took a new profile that keeps the legacy digest; B14 takes the alternative (keep the field, check it against the fluent at fold time, retire it at the next profile change). Only the Executive and the owner can resolve this. It blocks plan step 7, not steps 2-6.
- return route: this file

## Repair activation

Executive disposition of commit `44be3cbce`: accepted as the step 1 transcription
of the post as it stood. One bounded repair before review, on an external
invalidator: the former Executive's review of the plan (received 2026-10-22,
after this Worker started) showed that B13's invariant was overstated and its
failure route mis-traced. The Executive verified the cited lines and wrote the
correction as **B14** in the design post. Carry B14 into the committed
documents. Worker: Opus 5.5, xhigh, fresh context, Writer grant. Same five
files as the Activation above, plus this file's `## Repair return`.

**Read first.** The design post's B14 only
(`/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/claude/20261021T135156Z_REVIEW_compute_calculus_and_library_design.md`,
section "B14. Correction to B13"), then the plan's decisions table and step 7
(`/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/claude/20261021T162409Z_PLAN_library_consolidation_pen.md`),
then the committed design document §3, §4.6, §9, §10 and the IACS. The
Activation's hard constraints and writing rules stand.

**What changes.**

1. Design §9.1, the law. Replace the sentence that no interface hands a copy
   of a fact to another with B14's three layers: physical observation (once,
   by the owner, handed in memory to the admitting actor; permitted and
   required, per PRODUCT.md "Ordinary internal handoffs use its established
   state" and constitution §4.1); admission (the only point where an
   observation becomes history); derived state (from the fold, through
   `holdsAt`; never recomputed from copied fields, never read from a second
   store; `holdsAt` answers admitted questions only). What is forbidden is
   the second store written by one interface and read back by another.
2. Design §9.3, the route. Replace the throw-based route with B14's: the
   transport hands final facts through `onProcessFinalized`; the actor
   retains them (`actor_process.ts:1306`); the loss is the actor's outer
   catch (`:1403`), whose `refuseActorProcessEffect` drops them;
   `refuseActorProcessEffect` carries the retained facts as evidence, encoded
   once (`Error` to a description record, `bigint` to a tagged base-10 string,
   `null` kept); the refusal reaches `failCCall` (`ccall_lifecycle.ts:541`)
   and `failTraversal` admits it; the command and HTTP adapters return their
   facts the same way to the helper's result route; if admission itself fails
   the refusal is returned with the facts in memory and the physical state
   stays unknown; nothing is written beside the log. Remove the claim that
   the `invocation.complete` catch is the loss point.
3. `StructuralRefusal.stage` `"materialize"` (your residual 3a): B14 routes
   the facts through the existing `actor_process_effect_refusal`, not through
   `Outcome`. Remove `"materialize"` unless some process-family function in
   the design still returns `Outcome`; if you keep it, say which.
4. Design §10.2 decisions. D0: withdrawn on the basis of §9.1 and §9.3 as
   repaired. D3: per site, decided when each ingress site is touched, recorded
   in the step record; not a blanket closure. D5: the alternative. The field
   `terminationConfirmed` stays in payloads; the `actor_process_lifecycle`
   rule derives the fluent and checks the copied field against it at fold
   time; readers use `holdsAt`; retirement of the field is an obligation for
   the next root event contract profile change, because the store recognizes
   exactly two digests (`event_store.ts:1189`) and reopening rejects any other
   stamp (`:3608`). Adjust §9.2's sentence that the siblings leave the payload
   accordingly, §10.1 row 7, and the IACS wherever it says the field leaves
   the payload.
5. Design §10.5 proofs. P-LIFECYCLE whole path has two negatives: a no-child
   launch failure, and an error after launch with unresolved cleanup
   (`scopeAbsence` not `"absent"`, `firstError` set); each yields the admitted
   refusal with the encoded facts and the same `holdsAt` answer on worker,
   command and HTTP.
6. Ticket section: add the review as the invalidator, the B14 basis for D0,
   D3 per site, D5 alternative, and the deferred field-retirement obligation.
   GOALS sentence: unchanged unless it states the profile change.
7. Residual 2 (constitution §10 and Table 5.6.3-B `N06` pin
   `product/exact_match.ts`): do not touch the constitution; add one sentence
   to design §2 that the location column is updated as a realization
   coordinate when step 2 moves the module.

**Self-check before the commit:** (1) `grep -n "hands a copy\|No interface hands"`
over the design returns nothing; (2) `grep -n "profile"` over the three design
documents shows only the deferred-obligation sentence and the IACS, none
stating a new profile as the decision; (3) `grep -n "invocation.complete"`
over the design returns nothing claiming it as the loss point; (4) `grep -n
materialize` over the design shows no `StructuralRefusal` stage unless kept
by rule 3; (5) relative links on changed lines resolve; (6) the three views
still name the same carriers (list them again if the set changed).

**Return contract.** Stage by path, commit on `main`, no push. Message first
line `Step 1 repair: carry B14 (observation, admission, derived state; refusal route; D5 alternative)`,
last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Append
`## Repair return` to this file: commit, changed paths with line deltas,
self-check 1 to 6, residuals. Final report to the Executive: at most eight lines.

ACTION: execute the step 1 repair as activated.

## Repair return
- commit: `0e89859bf` on `main`, not pushed. Staged by path: the four changed grant files only. This file and the plan and post edits are left unstaged for the Executive.
- changed paths:
  - `build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`: 678 -> 703. Changed sections: §1.1 decision completeness, §2 (process imports `value`; one N06 location sentence), §3 (stage union, admitted domain, `OwnedProcessFacts` row, lifecycle), §4.3 D3 sentence, §4.6, §6 (`holdsAt` falsifier; `encodeOwnedProcessFacts` row), §7 (domain edge; second sequence diagram), §9.1, §9.2, §9.3, §9.4, §10.1 row 6, §10.2 D0/D3/D5, §10.3 O-TYPE, §10.5 P-LIFECYCLE.
  - `build_tenants/abiogenesis/typescript/design/ABI5_STDO3_COMPUTATIONAL_BINDING.md`: 451 -> 451 (§4 `materialize` row adds `encodeOwnedProcessFacts`).
  - `build_tenants/abiogenesis/typescript/design/ABG_EVENT_CALCULUS_IACS.md`: 61 -> 69 (Proof Surface: reader-side falsifier; the fold-time check of `terminationConfirmed` and its falsifier).
  - `.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md`: 5238 -> 5278 (content source B1 to B14; decisions lead; D0, D3, D5 bullets; follow-up bullet; new "Step 1 repair" paragraph).
  - `specification/GOALS.md`: unchanged. The GOAL-035 sentences do not state the profile change.
- self-check:
  1. Pass. No match for "hands a copy" or "No interface hands".
  2. Pass. Six matches, none decides a new profile. The deferred obligation appears in design :532 (D5) and IACS :65. The other matches predate this repair and are unrelated: design :669 (the V5 case "profile-changed prefix"), binding :11 (the DESIGN_MODULE profile), binding :69 (the event-contract profile of history) and binding :186 (staged profile state in the commit sequence).
  3. Pass. No `invocation.complete` in the design.
  4. Pass. `materialize` appears only as the operator name (§2 table, §2 owners paragraph, §11 route legend). No `StructuralRefusal` stage, because no process-family function returns `Outcome`.
  5. Pass. The five relative links on changed lines resolve with their anchors: constitution §10, Table 5.6.3-B, §4.1, and PRODUCT live-state. The slug checker was sanity-checked against a missing anchor.
  6. Pass. Domain, sequence and state views each name the same 18 carriers. The set is unchanged: `JsonValue`, `Sha256Digest`, `StructuralRefusal`, `Outcome`, `ExactMatch`, `RecordCheck`, `CheckedRecord`, `RuntimeEvent`, `EventCalculusEffect`, `DerivedEffectRule`, `FoldState`, `HoldsAt`, `RuntimeFluent`, `OwnedProcessFacts`, `ExactDefinitionCallable`, `DefinitionCall`, `DefinitionReturn`, `DefinitionExecutionFault`. Edge changes: the domain edge to `StructuralRefusal` is replaced by `OwnedProcessFacts --> JsonValue` (`encodeOwnedProcessFacts`) and `OwnedProcessFacts ..> RuntimeEvent`. The second sequence diagram runs along the actor route. All six Mermaid blocks parse with `mmdc`.
  - Also rechecked: no K01-K12 match; `process-failure.json` appears once (§9.3 item 6, "not used"); added design lines contain no date, agent or model name, review reference or accepted/proposed marker.
- residuals:
  1. The activation's "§10.1 row 7" is read as design row 6, which is plan step 7. The design has six rows.
  2. Beyond B14: the encoding is named as an atom, `encodeOwnedProcessFacts(facts): JsonValue` in `shared/process/`. Its consequences:
     - it adds a §4.6 signature, a §6 row with an admitted domain and a falsifier, and the binding `materialize` atoms entry;
     - `shared/process/` imports `value` instead of `refusal`.
     The reason: one encoding is shared by the worker, command and HTTP routes. The name is mine.
  3. B14 does not say what happens at runtime when the copied `terminationConfirmed` disagrees with the derived fluent at fold time. The design states only the check and its falsifier (IACS; P-LIFECYCLE), not an outcome.
  4. Result artifacts: B14 says only that the payload field stays. The design and the ticket keep the field in the result artifacts that record it too, which is the status quo; no decision removes it there.
  5. Attribution of D5: the ticket attributes the switch from the new profile to the alternative to the Executive's repair activation and the plan's revised decisions table. Neither commit records an owner confirmation of the revised D5.
  6. Beyond the activation's list, carried for consistency with B14:
     - the `holdsAt` falsifier (design §6, §10.5, IACS) is now reader-side, so the field write and the owner's physical observation do not falsify it;
     - §1.1 decision completeness names D3 per site and the deferred D5;
     - §9.4 was made neutral. Whether a held return frame is a permitted in-memory handoff or derived state rebuilt from copies depends on untraced recovery-boundary and recoverability facts. The ticket follow-up bullet matches.
  7. §9.3 item 5: B14's "as the Product's qualification law requires" is carried as "the physical state stays unknown", without a citation.
  8. I spot-checked `event_store.ts:1189` and `:3608` only: two digests are recognized, and on reopen any stamp other than the current digest is rejected (legacy events carry no stamp). The other B14 line references are carried as the Executive verified them.
  9. Type gap, present in `44be3cbce` and now visible: §9.2 has the rule in `abg/calculus/` apply `hasConfirmedOwnedProcessBoundary` to the admitted facts. That predicate takes `OwnedProcessFacts`, which holds `Error` and `bigint` values, but the admitted facts are the `encodeOwnedProcessFacts` JSON. The rule's form of the test over the encoded facts is decided when rows 5 and 6 are realized.
  10. The design is 703 lines, further above the guide of about 600 (see the first return's residual 10). The ticket's D3 bullet keeps the plan's wording ("answered by `admitContract`"); design D3 says "`admitContract` or `admitJson`, or refuses".
- return route: this file

## Review activation

Reviewer: Opus 5.5, max effort, fresh context. Subject frozen by identity:
commit `0e89859bf` on `main` of `/Users/jim/src/apps/abiogenesis` (the step 1
Worker commit `44be3cbce` plus the B14 repair). Read-only: no edits, no
commits, no builds, no tests (no code changed in this step).

**Independence.** You never held the Worker's or the Executive's context. The
design's author is the Executive (the design post); the Worker and repair
Worker transcribed it; you are independent of both by authorship. All actors
are one vendor family; say so in your review. Your judgment is your own:
the Worker's `## Return` and `## Repair return` above are claims to test,
not assurance.

**Subject files, at `0e89859bf`** (use `git show 0e89859bf:<path>` or the
working tree, which is identical for these paths):
- `build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`
- `build_tenants/abiogenesis/typescript/design/ABI5_STDO3_COMPUTATIONAL_BINDING.md` (§1 lines 20-21 and §4)
- `build_tenants/abiogenesis/typescript/design/ABG_EVENT_CALCULUS_IACS.md`
- `.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md`, section "STDO 3 Library Re-entry (2026-10-22)" (the last section)
- `specification/GOALS.md`, row `GOAL-035`

**Authorities to evaluate against** (read these, nothing else under
`.ai-workspace/comments/`):
- Content: the design post
  `.ai-workspace/comments/claude/20261021T135156Z_REVIEW_compute_calculus_and_library_design.md`,
  Part B (B1 to B14). B14 corrects B13; where they differ, B14 governs.
- Law the design must realize without amendment:
  `build_tenants/abiogenesis/typescript/design/ABI5_REALIZATION_CONSTITUTION.md`
  §5.6.1 (eight operator signatures) and §5.6.2C (three module-static
  combinators; no fourth combinator, registry, callback, controller or mode
  selector); §4.1 (distribution and risk proportionality).
- Product law for the recovery section: `specification/PRODUCT.md`, "Live
  State, Recovery And Valid Reuse" (about lines 798 to 822) and row `A5-F10`.
- Structure: released STDO 3.0.0 `DESIGN_MODULE.md` §5 (ontology-first
  design: boundary, ontology, irreducible carrier set, atomic families with
  typed parameters, higher-order composition with laws, Prime atoms with
  admitted domain and falsifier, three views, three accounts; decision
  completeness `M(B)`, `U(B)`), copy at
  `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/c5e4c12f-3ef0-4d89-89e0-6d0073419181/scratchpad/DESIGN_MODULE.md`.
  Writing: `WRITING_GUIDE.md` copy in the same directory.
- Source lines the design cites as realization coordinates (verify the ones
  the recovery section depends on): `code/src/abg/worker_transport.ts:455`,
  `code/src/abg/actor_process.ts:1306` and `:1403`,
  `code/src/hog/ccall_lifecycle.ts:541`, `code/src/abg/event_store.ts:1189`
  and `:3608`, `code/src/shared/owned_process_lifetime.ts:104`, all under
  `build_tenants/abiogenesis/typescript/`.

**Questions the review answers**, each with chaseable evidence (file and
line, or command and output):
1. Fidelity: does the design document state the operator-family library of
   B2 to B10 and B13/B14 without adding or dropping an atom, a law, a
   carrier or a decision? List every divergence.
2. Law: does any passage amend, contradict or restate inconsistently
   constitution §5.6.1 or §5.6.2C? Does the recovery section (§9) now agree
   with PRODUCT.md's handoff permission and derived-state rule and with
   constitution §4.1? Is the failure route (§9.3) consistent with the cited
   source lines?
3. Decision completeness: is `U(B)` empty for the library boundary as the
   document claims, or does an unresolved material relation remain? Are D0 to
   D5 stated as design, consistently across the design document, the IACS,
   the ticket section and GOALS?
4. Prime atoms: does every atom in §6 have an admitted domain and a
   falsifier that a test or check could execute? Name any falsifier that is
   not executable.
5. Views: do the domain, sequence and state views name the same carriers and
   transitions? Name any carrier present in one view and absent in another.
6. Live text: any history, dates, agent or model names, "proposed" or
   "accepted" markers, or review commentary in the three design documents
   (the ticket section is exempt)? Any dangling relative link on changed
   lines?
7. The Worker's residuals (both `## Return` lists): which are real defects
   and which are acceptable?

Do not re-decide D0 to D5; the owner took them. Evaluate whether the
documents state them correctly and consistently.

**Grading.** Each finding gets technical severity on the project scale
(`build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`,
"Executive, Writer, And Reviewer Binding": `S0` catastrophic or
non-waivable; `S1` mandatory outcome or hard-stop failure; `S2` material
semantic, authority, causal, proportionality or proof defect with a bounded
workaround; `S3` minor ambiguity or evidence defect; `S4` editorial) and a
one-line triage (what repair would close it). Do not assign priority; that
is the Executive's.

**Return contract.** Append to this file:

```
## Review
- subject: 0e89859bf; independence statement
- findings: one per line: S<n> | file:line | claim | evidence | triage
- answers 1..7 (one paragraph each, evidence cited)
- residual uncertainty: what you did not verify
```

Final report to the Executive: at most ten lines: counts by severity, the
S0 to S2 findings in one line each, and your overall reading.

ACTION: review commit 0e89859bf as activated.

## Review
- subject: `0e89859bf` on `main` of `/Users/jim/src/apps/abiogenesis`, which is `44be3cbce` (parent `93a4b08df`) plus the B14 repair; neither commit changes source code. Independence: Reviewer Opus 5.5, max effort, fresh context. I never held the Worker's or the Executive's context, and I am independent of the design's author (the Executive, through the design post) and of its transcribers (the Worker and the repair Worker) by authorship only. All actors, this Reviewer and the advisor model it consulted included, are one vendor family (Anthropic Claude); this review adds no cross-vendor independence. The Worker's `## Return` and `## Repair return` were tested as claims. Read-only: this section is the only edit; no commit, build, test or Mermaid render. Not read, per the activation: the plan post and `.ai-workspace/comments/codex/`.
- path keys: `design` = `build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`; `binding`, `iacs` and `const` = `ABI5_STDO3_COMPUTATIONAL_BINDING.md`, `ABG_EVENT_CALCULUS_IACS.md` and `ABI5_REALIZATION_CONSTITUTION.md` in the same directory; `ticket` = `.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md`; `post` = `.ai-workspace/comments/claude/20261021T135156Z_REVIEW_compute_calculus_and_library_design.md` (working tree, B14 uncommitted); `src/` = `build_tenants/abiogenesis/typescript/code/src/`; `PRODUCT` = `specification/PRODUCT.md`; `DM` = the `DESIGN_MODULE.md` copy named in the Review activation. Line numbers are at `0e89859bf`.
- findings: S0 0, S1 0, S2 4, S3 12, S4 7. Overall reading: B2 to B10 and B14's corrections are transcribed faithfully and the recovery lines B14 cites match the source, but §9's route does not put the facts into `L`, the lifecycle rule has no admitted facts to test, and `holdsAt` has no command or HTTP events to answer over, so `U(B)` is not empty; each finding has a bounded repair.
  - S2 | design:501, :504, :105, :482, :488-489; ticket:5222-5228 | The encoded `OwnedProcessFacts` are "in `L` once, in the event the fold consumes", and the lifecycle rule initiates `actor_process_terminated` "when the admitted `OwnedProcessFacts` satisfy `hasConfirmedOwnedProcessBoundary`". | Failure leg: `failCCall` receives the refusal as candidate together with the refusal's own `diagnosticRef` (src/hog/ccall_lifecycle.ts:541-548), a `diagnostic://` URI (src/abg/actor_process.ts:197); `admitRuntimeFailure` keeps the subject inline only for a `data:` reference (src/abg/runtime_failure.ts:239-242) and otherwise writes `subjectDigest` alone (:243-251, :277; src/abg/event_store.ts:1008-1019), so `L` holds a digest of the facts, and `runtime_failure_observed` is not among the rule's inputs (design:186). Success leg: `actor_process_exited` carries `actorInvocationRef`, `processRef`, `signal` and `status` only (src/abg/event_store.ts:655-660), and the owner emits that kind only when `scopeAbsence` is `"absent"`, `directExit` is set and the process started (src/abg/actor_process.ts:1318-1322): the kind records the boundary, and no admitted facts exist for the rule to test. The same misreading makes forms 3 and 4 wrong: src/abg/replay.ts:2444 reads that kind, which carries the scope-absence condition, and src/abg/invocation_admission.ts:512 reads replay's projection (replay.ts:2392-2397), not a copied payload field. The error is B14's (post:712-713, :725-726), carried faithfully; repair residual 9 records only the type gap. | Name the carrier that puts the encoded facts into `L` (the existing inline route `constructRuntimeFailureDiagnosticRef`, src/abg/runtime_failure.ts:83-86, at the `failCCall` call, or a payload change under a profile change); derive `actor_process_terminated` from the `actor_process_exited` kind; correct forms 3 and 4 and the views at design:337, :388-390 and :438.
  - S2 | design:566, :502, :521, :478; ticket:5222-5228 | P-LIFECYCLE: each negative yields "the same `holdsAt` answer on worker, command and HTTP, and no file is read". | The root event kinds have process events for actor processes only (src/abg/event_store.ts:61-122). Command and HTTP lifetimes run inside the helper child, which computes its own boolean (src/implementation/worksite_command_helper.ts:769, :1136) and consumes it there (:1362-1366, :1376-1380), so the fold has no event for them and `holdsAt` has nothing to answer. Their facts leave through the helper's `result.json` (src/product/worksite_command_execution.ts:741), which design:478 makes lawful while :566 says no file is read. Row 6 sends their facts "to `failTraversal`" (:521); §9.3 item 4 sends them "to the helper's result route" (:502). Sites that declare, validate or copy the field and are absent from the census: src/product/worksite_command_execution.ts:528, :1693, :1709, :1729; src/validator/qualification_contracts.ts:389; src/implementation/contracts.ts:92. The clause is B14's (post:732-736). | Scope the `holdsAt` clause to actor processes, or name the fluent, its admitted event and its owner for command and HTTP lifetimes; choose one destination for their facts; sort the census by layer (observation, admission, derived read).
  - S2 | design:32, :523, :530; ticket:5233-5237 | "No other material semantic alternative remains inside the library, so design, implementation and tests co-evolve for each row of §10.1." | DM:493-506 admits co-evolution only when `U(B)` is empty. Open at `0e89859bf`: the D3 ingress answer at each site, "recorded with that site's change" (:530); the carrier of the facts into `L` and the rule's input (first S2; repair residual 9); the fluent and owner for command and HTTP lifetimes (second S2); the outcome when the copied field disagrees with the fluent (iacs:63-67; repair residual 3); the encoding's tag and unavailable-member form (:214); whether callers may supply axioms and rules (fourth S2). The post gated the rule table (post:175-178); the design drops that gate while :523 classifies row 5 as a `design_reframe`. | State `U(B)` with these members; design-gate rows 2 and 3 at the D3 sites, row 5, and row 6 until the first two S2 findings close.
  - S2 | design:177-178, :182, :236, :701; binding:92 | `effectOf` and `foldStep` take `axioms` and `rules` as parameters, while :182 says "no caller supplies an axiom or a rule" and :701 claims FS-17. | const:3517 admits the typed Event Calculus projection under "closed module law" and prohibits "caller axioms"; FS-17 (const:508) prohibits runtime-supplied semantic callbacks, and each rule carries a `derive` function (design:173), the ground on which design:163 rejects an `encode` parameter. Present code reads `ROOT_EVENT_CALCULUS` directly (src/abg/event_calculus.ts:1361, :1512) and derives from the prefix alone (:2074-2077). The fold law holds only "at equal axioms and rules" (:236), a qualifier closed signatures do not need. | Export `effectOf` and `foldStep` closed over `ROOT_EVENT_CALCULUS` and `ROOT_DERIVED_RULES`; keep any parameterized form module-private.
  - S3 | design:503; ticket:5222-5228 | "If admission itself fails, the refusal is still returned to HoG with the facts in memory, and the Run fails with it." | `admitRuntimeFailure` throws a `TypeError` that carries no subject when its scope check or durable successor fails (src/abg/runtime_failure.ts:237, :281), and `failTraversal` has no catch around it (src/hog/traversal_failure.ts:70-96); §10.1 row 6 names no change on that path. From B14 (post:727-729). | Name the change that keeps the candidate on that throw path, or state that the facts are lost when admission fails.
  - S3 | binding:82, :86, :93; design:151 | The operator classes "are exported function signatures"; `checkExactRecord` is a `select` atom; `hasConfirmedOwnedProcessBoundary` and `encodeOwnedProcessFacts` sit under `materialize`. | const:578: "These names classify functions; they are not a runtime instruction language." The step removed the binding's guard "the class name is not a new callable or semantic atom" (binding:82 at `93a4b08df`). design:151 composes `select`, `validate` and `derive` in `checkExactRecord`, which const:534 calls a composition. The two process atoms are pure (design:207-209), while const:590 defines `materialize` as performing the declared physical effect. | Restore the classification sentence; list `checkExactRecord` as a composition over `select`; classify the predicate under `validate` and the encoder under `derive`.
  - S3 | design:94, :200, :567 | `StructuralRefusal` "never crosses `DefinitionExecutionFault`", while `bindStaticOwner` consumes `admitContract` and keeps its behavior. | `bindStaticOwner` maps a failed resource assertion and a failed receipt to `definitionFault` (src/shared/static_definition_bindings.ts:134-145, :153-164); once `admitContract` replaces `v.safeParse`, that refusal becomes the fault, so :94 and P-BIND's "behave unchanged" (:567) cannot both hold. const:1893-1894 lets only substrate failure cross. | State that the binder maps its own admission refusal to its existing resource and receipt faults, or scope :94 to owner functions.
  - S3 | design:257, :565; iacs:51-54 | The `effectOf` and `foldStep` falsifier is "an effect differing from `advance` on the same event", and P-FOLD requires `advance` and `foldStep*` to agree. | Row 5 rewrites `advance` over `foldStep` (design:520), after which the check compares `foldStep` with itself; before row 5 the intended changes (the formulas at :189-191 and the initiation moved by :194) differ from `advance` by design. No falsifier tests the fold law of :236 directly. | Use the fold law and cold-equals-warm as the falsifier, with expected-effect tables for counterexamples A and B.
  - S3 | design:258, :482; iacs:56-61 | The `holdsAt` falsifier: any module outside `abg/calculus/` that answers a lifecycle question "from process facts". | No closed list of lifecycle fluents or questions exists, so a check cannot decide membership. The owner's choice of which event to report answers "is the process gone" from process facts (src/abg/worker_transport.ts:461; src/abg/actor_process.ts:1318); iacs:60-61 exempts it, design §6 does not. The call `holdsAt(state, { kind: "actor_process_terminated", processRef })` (:482) does not fit `RuntimeFluentPattern` `{ kind: "runtime_fluent_pattern", name, identity }` (src/abg/event_calculus.ts:56-67), and the existing `holdsAt(projection, fluent): boolean` (:2107-2121) differs from design:179 with no migration stated. | Enumerate the lifecycle fluents; carry the IACS exemption into §6; state the pattern shape and the migration of the existing `holdsAt`.
  - S3 | design:102-104, :111, :266, :273 onward, :351-356, :376-382 | `FoldState` and `HoldsAt` are prime; `RuntimeFluentPattern` and `RuntimeEventCalculusProjection` are listed prime (:102) and "appear in no view" (:266). | :111 says `FoldState` is "recomputed from the event log, never persisted as truth", and B6 and B8 keep it subordinate (post:389, :391, :422); `RuntimeEventCalculusProjection` "publishes one `FoldState`" (:104), a second prime name for one carrier. DM:1403-1412 puts IACS carriers and downstream-only projections in the domain view. The view uses `<<prime>>` and `<<ABG_prime>>`, outside the standard set (DM:1414-1416). The sequence participants are modules or readers absent from the domain view (DM:1430). The Worker followed the step Activation on standing (Return residual 3d). | Make `FoldState` and `HoldsAt` subordinate or state their promotion argument; show every prime carrier, projections as `<<downstream>>`; use the standard stereotypes; put the participating families in the domain view or mark the participants external.
  - S3 | design:45, :207-214, :259; binding:93 | `encodeOwnedProcessFacts` is a Prime atom in `shared/process/`, which imports `value`. | B14 specifies an encoding, not an atom (post:717-723), and B2 has `shared/process/` import `refusal` (post:189); repair residual 2 records the addition. The format leaves the `bigint` tag and the form of a named unavailable member open (:214), so the :259 falsifier ("without an available member", "an untagged string") has no fixed oracle. | Ratify the atom in the post or move the encoding into the refusal owner; fix the tag and the unavailable-member form.
  - S3 | iacs:63-67; design:482, :532, :566 | At fold time the rule checks the copied `terminationConfirmed` against the derived fluent. | No outcome on disagreement is stated (repair residual 3): refusal of the prefix, a diagnostic fact, or none. Existing prefixes carry the field in actor observation payloads (src/abg/event_store.ts:301, :732); whether every one agrees with the derived fluent is unverified, so a refusing check could reject existing history on reopen. | State the outcome and its reach over existing prefixes.
  - S3 | design:466 | "What is forbidden is a second store of observations, written by one interface and read back by another as evidence or truth." | PRODUCT:809 recovers through `recover(P, L, referencedEvidence)`. Referenced evidence outside `L`, written by the transport and read back by the actor at admission (src/abg/actor_process.ts:1109-1158) and on reconstruction (src/abg/worksite_construction_recovery.ts:247-262), falls under the sentence as written; :478 excepts only the spawn-boundary transport files. | Add the referenced-evidence case: an artifact bound by digest in `L` and read back for verification against that digest is not a second store.
  - S3 | design:212, :433-440 | Adapters "choose between reporting an exit and reporting unconfirmed termination". | The worker owner has a third report, `actor_process_spawn_failed` for a no-child launch failure (src/abg/actor_process.ts:1312-1317), which the case row (:222) and the rule input `T` (:186) require; the lifecycle state view has no spawn-failure path. | Name the three reported events and add the spawn-failure path to the state view.
  - S3 | design:61; const:3746-3750, :4121-4128 | The design adds library functions (`checkExactRecord`, `effectOf`, `foldStep`, `ROOT_DERIVED_RULES`, the two process atoms) and moves N06's callable, calling the N06 location a realization coordinate updated later. | const §10.2 (:3746-3750) requires each algorithmic function in a coding plan to declare `catalog_reuse`, `catalog_extension` or `catalog_addition_proposal`; const:4121-4128 classifies catalog law as `design_reframe` and callable location as `realization_refactor`, each with an amendment record on "this single surface". None of the new names appears in the constitution (grep at `0e89859bf`: 0 matches), the design declares no disposition, and :61 names no amendment record for the N06 move; the plan may declare them (not read). | Declare the catalog disposition of each new function and record the amendments; record the N06 move as a `realization_refactor`.
  - S3 | design:530, :532; ticket:5203-5205, :5233-5237, :5274-5278; step-1.md:62-65 | D3 and D5 are stated as the owner's decisions. | The owner took D3 as "answered by `admitContract`" and D5 as a new root event profile retaining the legacy digest (step-1.md:62-65); the documents state D3 per site through `admitContract` or `admitJson`, and D5 as B14's alternative, which B14 itself re-decides (post:737-746). The ticket attributes the D5 change to "the Executive's repair activation and the plan's revised decisions table" (:5274-5277), and the subject records no owner ruling (repair residual 5). Not re-decided here. | Record the owner's ruling on the revised D3 and D5, or mark both pending that ruling.
  - S4 | ticket:5233-5234; design:530 | Ticket D3 says "answered by `admitContract`"; design D3 says "through `admitContract` or `admitJson`, or refuses". | Repair residual 10. | Align the ticket with design:530.
  - S4 | design:251, :252, :255, :256 | Four falsifiers test one direction. | `isRecord`: nothing catches null, an array or a primitive returning true (:251); `hasExactKeys`: unequal key sets returning true is covered by P-KEYS (:562), not the row (:252); `resolveExactMatch`: a correct count with wrong members passes (:255); `checkExactRecord`: a valid unique record returned as other than `one` passes (:256). | State both directions in each row.
  - S4 | design:43, :142, :364 | The §2 imports column gives `shared/select/` only `refusal`. | `RecordCheck` types its digests as `Sha256Digest` (:142) and the first sequence view has `shared/select` call `sha256Canonical` (:364), both from `shared/value/`. | Add `value` to the `shared/select/` imports.
  - S4 | design:487 | "`c_call.ts:6607` compares two copies with each other." | src/abg/c_call.ts:6607 compares `candidate.exitObserved` with `candidate.terminationConfirmed`, two different facts. | Reword the entry.
  - S4 | binding:88 | The `derive` row lists `deepFreeze` without `isDeeplyFrozen`. | design:161 lists both in `shared/value/`. | Add `isDeeplyFrozen`, classified under `validate`.
  - S4 | design:415 | The state view moves "CheckedRecord invalid" into the state "refused StructuralRefusal". | `invalid` is a `CheckedRecord` variant (design:147), not a `StructuralRefusal`. | Give `invalid` its own state, or name the owner mapping that turns it into a refusal.
  - S4 | design (703 lines) | The document exceeds its length guide. | The step Activation sets about 600 lines (step-1.md:123); Return residual 10 and repair residual 10 record 678 and 703. | Trim toward the guide, or record why the added length removes ambiguity.
- answers:
  1. Fidelity. B2 to B10 are carried with these divergences: `shared/process/` imports `value` where B2 has `refusal` (design:45; post:189); `encodeOwnedProcessFacts` is a new atom with a §4.6 signature, a §6 row and a binding entry (design:209, :259; binding:93; repair residual 2); `FoldState` and `HoldsAt` are prime where B6 and B8 keep them subordinate (design:104; post:389, :391, :422), as the step Activation directed; B1's design gate on the rule table is dropped (design:32; post:175-178); the failure carrier's scope widens from "the pure layer" to "the library" (design:78, :100; post:385) while design:94 keeps the pure-layer domain; the `holdsAt` falsifier is reader-side, with its exemption only in the IACS (design:258; iacs:60-61); FS-13 is cited and claimed but appears nowhere in the post (design:476, :701; post:656); D3 adds `admitJson` (design:530); D5 follows B14 (design:532). I found no B3 atom, B4 law or B10 decision dropped. The old design's §7 and §8 are re-expressed correctly in §11 and §12 (all fifteen families and V1 to V7 compared with `93a4b08df`). B13 and B14 are carried as written, errors included: forms 3 and 4 (design:488-489; post:545-576), the facts "in `L` once" (design:501; post:712-713, :725-726), the admission-failure path (design:503; post:727-729) and the command and HTTP `holdsAt` clause (design:566; post:732-736).
  2. Law. §5.6.2C: design:31 and §4.5 (:200) state the three binders and no fourth, as const §5.6.2C does; the exported `effectOf` and `foldStep` parameters contradict the closed-law row (const:3517) and FS-17 (fourth S2), and design:94 conflicts with the binder's fault mapping (S3). §5.6.1: binding:82 restates the classes as exported signatures against const:578, and two classifications conflict with const:534 and :590 (S3). §9.1's three layers (design:462-466) agree with const:225 (§4.1) and with PRODUCT:817-818 on derived state. PRODUCT:812-814 permits handoffs of the live runtime's established state; the design applies it to the in-memory handoff of observations, which PRODUCT does not state but does not forbid, and the prohibition at design:466 omits the referenced evidence of PRODUCT:809 (S3). Route: each cited line matches the source (src/abg/worker_transport.ts:455; src/abg/actor_process.ts:1306-1311 and :1403-1410; src/hog/ccall_lifecycle.ts:541-548; src/abg/event_store.ts:1181-1190 and :3608-3610; src/shared/owned_process_lifetime.ts:104-118), and the `invocation.complete` catch (ccall_lifecycle.ts:551-561) is downstream, as B14 says. The route's conclusion fails at `admitRuntimeFailure`, which admits a digest of the refusal (first S2), and item 5 fails at src/abg/runtime_failure.ts:237 and :281 (S3).
  3. Decision completeness. No. `U(B)` has at least six members: the D3 answer at each ingress site; the carrier of the facts into `L` and the rule's input; the fluent and owner for command and HTTP lifetimes; the outcome of a fold-time disagreement; the encoding's tag and unavailable-member form; whether callers may supply axioms and rules (third S2). D0 agrees across design:527, ticket:5207-5228 and GOALS:18. D1, D2 and D4 agree between design:528-531 and the ticket. D3's wording differs between design:530 and ticket:5233-5234 (S4). D5 agrees across design:532, iacs:63-67 and ticket:5240-5249; GOALS does not state it, which fits a design decision. D3 and D5 as stated differ from the decisions the owner took (step-1.md:62-65), and no owner ruling on the change is recorded (S3).
  4. Prime atoms. All twelve §6 rows (design:249-260) state an admitted domain and a falsifier. Executable as written: `canonicalEquals`, `sha256Canonical`, `admitJson`, `admitContract` and `then`; `encodeOwnedProcessFacts` once its format is fixed (S3). One-sided: `isRecord`, `hasExactKeys`, `resolveExactMatch`, `checkExactRecord` (S4). Not executable: `holdsAt`, which has no closed fluent list and collides with the owner's observation (S3), and `effectOf` and `foldStep`, whose oracle is `advance` (S3). `hasConfirmedOwnedProcessBoundary` is exported (design:207) and classified (binding:93) but has no §6 row, so it remains a candidate atom (DM:1000-1002).
  5. Views. The domain, sequence and state views name the same eighteen carriers listed at design:266 (checked by reading the four §7 blocks; not rendered). They share three false premises: the domain edge `OwnedProcessFacts ..> RuntimeEvent` (:337), the refusal admission in the second sequence view (:388-390) and the lifecycle transition on facts that confirm the boundary (:438) (first S2). The state view moves `CheckedRecord invalid` into the `StructuralRefusal` state (:415, S4) and has no spawn-failure path (:433-440, S3). Two prime carriers appear in no view, the stereotypes are outside DM's set, and the sequence participants are absent from the domain view (S3).
  6. Live text. The library design and the IACS carry no dates, agent or model names, proposed or accepted markers or review commentary (grep at `0e89859bf`; the two hits, "Executive" at design:24 and "Worker" at :212, are domain roles); the IACS `Date:` line is gone. The binding's lines 20-21 and §4 are clean; binding:3 ("is accepted") and :5 (a date) predate the step and lie outside the grant. All 80 relative links on lines added between `93a4b08df` and `0e89859bf` in the five subject files resolve, anchors included (scripted slug check, sanity-checked against a missing anchor). The only link the step leaves dangling is inbound: `#k03--capturing-and-preserving-immutable-values` from the historical `final-review-dispositions-01` records (Return residual 8).
  7. Residuals. Real defects: Return 2 (the location update is lawful; its amendment record is missing, S3), 3d (S3), 3e (B14 closed most of it; the format stays open, S3), 9 (the B13 sites carry the errors of the first S2), 10 (S4), 12b (persists as repair residual 5, S3); repair 2 (S3), 3 (S3), 5 (S3), 6 (the reader-side wording leaves the falsifier unexecutable, S3), 9 (understated: on both legs no admitted facts reach the rule, first S2), 10 (S4). Acceptable: Return 1, 3a (closed by the repair), 3b (matches src/abg/worker_transport.ts:461), 3c (matches src/abg/actor_process.ts:598-645), 4, 5, 6, 8 (verified), 11, 12a (carried by the repair); repair 1, 4, 7 and 8 (src/abg/event_store.ts:1189 and :3608 verified). Return 7 is unverified because the plan was not read; inside the ticket, design row n maps to plan step n+1 consistently.
- residual uncertainty: The plan post was not read, per the activation, so Return 7's mapping and any owner ruling in its revised decisions table are unconfirmed. No Mermaid render, build or test was run; view agreement was checked by reading. Not established: whether any existing prefix holds a copied `terminationConfirmed` that disagrees with the derived fluent; how the helper's `result.json` content enters `L`, and whether the helper child's own `actor_process_*` events could answer for command and HTTP; the emission of `actor_process_exited` under the legacy profile. The old design's §3 and §6 obligations were not fully audited: old D07 ("raw/owned/prospective distinctions") and old D03 ("justified ordered-first raw controls") are not restated, and I did not establish whether they remain live. B13 census sites beyond those cited were not all re-verified. Part A of the post was read at its header and A4 only. All actors, the advisor model included, are one vendor family.

## Disposition of the review (Executive)

Review of `0e89859bf`: 4 S2, 12 S3, 7 S4; overall No. Priorities: the four
S2 are `P1` (they shape steps 6 and 7's realization); the S3 findings that
sit in the same sections are repaired with them at no extra activation; the
remaining S3 and all S4 go to the ledger as `P3` to `P4`. One bounded repair
round, then a re-review on the blocking findings only. The Executive verified
the first two S2 against source and wrote the resolution as the "B14
addendum" in the design post.

## Repair activation 2

Worker: Opus 5.5, xhigh, fresh context, Writer grant: the same five files as
the Activation, plus this file's `## Repair return 2`. Subject: commit
`0e89859bf` plus the `## Review` section above (your defect list) and the
design post's **B14 addendum** (the content authority for the route). Read
first: the Review section, the B14 addendum, design §4.4, §4.6, §6, §7, §9,
§10, the IACS, binding §4, the ticket section. The original Activation's
hard constraints and writing rules stand.

**Close the four S2.**

1. *Facts in `L` (Review S2 one).* Rewrite §9.3, §4.4's rule inputs and
   §10.1 row 6 per the B14 addendum: the lifecycle rule folds the three
   process terminal events (`actor_process_spawn_failed`,
   `actor_process_exited`, `actor_process_termination_unconfirmed`) plus
   `actor_process_signal_requested` and the timeout events; it takes no
   `OwnedProcessFacts`. `hasConfirmedOwnedProcessBoundary` is the owner's
   reporting choice at the boundary, one body in `shared/process/`, used by
   the actor and the helper adapters. Attribution evidence travels as the
   refusal's diagnostic subject through `constructRuntimeFailureDiagnosticRef`
   and is retained inline by `admitRuntimeFailure`. The admission-failure
   throw path (Review S3 one) is stated as lossy: no change there.
2. *Command and HTTP (S2 two).* State once, in §9.3 and P-LIFECYCLE (§10.5):
   helper-run processes have no lifecycle events; their facts are members
   of the admitted leaf result or the admitted failure subject; their
   lifecycle question is a projection of that admitted event. Remove every
   sentence that promises a `holdsAt` answer for them. Resolve the two
   placements the Review cites (design:566 against :502, :521) to this one.
3. *Co-evolution (S2 three).* Replace the blanket claim with a table of
   `U(B)` per §10.1 row: name each unresolved relation, who decides it and
   at which step; rows with an empty `U(B)` are co-evolution admissible; row
   5 is design-gated on D1 as accepted at this step's disposition (state it
   so). Resolve inside this repair whatever the B14 addendum and the items
   below settle; leave the rest named, not hidden.
4. *Closed module law (S2 four).* `effectOf(state, event, dependencies)` and
   `foldStep(state, event, dependencies)` close over the module constants
   `ROOT_EVENT_CALCULUS` and `ROOT_DERIVED_RULES`; no caller supplies an
   axiom or a rule; each rule's `derive` is module-owned, so FS-17 holds.
   Fix the signatures in the design, the binding §4 table and the IACS.

**Fold in these S3 while in the same sections** (each closed or stated):
- binding §4: restore the guard "the class name is not a new callable or
  semantic atom"; `checkExactRecord` is named a composition of `select`,
  `validate` and `derive`, not an operator class.
- §4.5 / P-BIND: `bindStaticOwner` maps its own admission refusal to its
  existing resource or receipt fault; "behaves unchanged" means the fault
  surface, not the inner predicate.
- §6 falsifiers: `effectOf`/`foldStep` are falsified by the fold law and
  cold-equals-warm with expected-effect tables for counterexamples A and B;
  `holdsAt`'s falsifier names the closed list of lifecycle fluents the rule
  table declares (`actor_process_terminated`, `actor_process_unconfirmed`,
  `actor_process_spawn_failed`, and any the rule table adds) and uses the
  real pattern shape `{ kind: "runtime_fluent_pattern", name, identity }`.
- Carrier standing: `FoldState` and `HoldsAt` subordinate (B6, B8);
  `RuntimeEventCalculusProjection` publishes one `FoldState`, one prime
  name per carrier; views and §3 agree; remove the "appear in no view"
  listing or make the views show them.
- `encodeOwnedProcessFacts`: ratified in the B14 addendum with a fixed
  encoding; carry that form into §4.6 and §6 (falsifier with a fixed
  oracle).
- Fold-time disagreement of the copied `terminationConfirmed` with the
  fluent: the fluent wins; the disagreement is recorded as a diagnostic
  fluent `terminationConfirmed_copy_disagrees(processRef)`; no prefix is
  refused, so existing history reopens unchanged. State it in §9.2 and the
  IACS.
- §9.1: add the referenced-evidence case: an artifact bound by digest in `L`
  and read back by that digest is part of `recover(P, L, referencedEvidence)`
  and is permitted; the forbidden case is a store read as truth without a
  binding in `L`.
- §4.6 and the state view: three reported events, including
  `actor_process_spawn_failed`; add the spawn-failure path.
- §10.1 or a new §10.6 catalog table (constitution §10.2): for each library
  function the design adds or moves, declare `catalog_reuse`,
  `catalog_extension` or `catalog_addition_proposal`; note that the N06
  location move is a `realization_refactor` whose amendment record lands in
  the constitution at step 2 (the step 2 Worker writes it).
- Ticket section: record the owner ruling: "D3 per site and D5 alternative
  were put to the owner on 2026-10-22 with the reason; the owner answered
  'ok go'." Also record the review and this disposition in two lines.

**Not in this repair:** the remaining S3 and the S4 editorial items; list
them under residuals as "ledger".

**Self-check:** (1) `grep -n "effectOf(axioms\|foldStep(axioms"` over the three
design documents returns nothing; (2) `grep -n "same \`holdsAt\` answer\|same holdsAt"` returns nothing; (3) the `U(B)` table exists and row 5 says design-gated; (4) `grep -n "OwnedProcessFacts" ` in §4.4 shows it is not a rule input; (5) links on changed lines resolve; (6) the views and §3 list the same carriers (list them).

**Return contract.** Stage by path, commit on `main`, no push. Message first
line `Step 1 repair 2: facts in L via terminal events and diagnostic subject; closed module law; U(B) table`,
last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Append
`## Repair return 2`: commit, changed paths with deltas, each S2 closed/how,
each S3 closed/stated/ledger, self-check 1 to 6, residuals. Final report: at
most eight lines.

ACTION: execute step 1 repair 2 as activated.

## Repair return 2
- commit: `97b1200bc` on `main` (amended once before return, same message), not pushed. Staged by path: the four changed grant files only. This file, the post, the plan and step-2/3 are left unstaged for the Executive, as in repair 1.
- changed paths:
  - `build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`: 703 -> 795. Sections changed: §1.1, §2 (one pointer), §3, §4.4, §4.5, §4.6, §5, §6, §7, §9.1, §9.2, §9.3, §10.1, §10.2 (D0, D5), §10.5 (P-LIFECYCLE, P-BIND), and new §10.6 and §10.7.
  - `build_tenants/abiogenesis/typescript/design/ABI5_STDO3_COMPUTATIONAL_BINDING.md`: 451 -> 453 (§4 lead, `select` and `project` rows, `checkExactRecord` sentence).
  - `build_tenants/abiogenesis/typescript/design/ABG_EVENT_CALCULUS_IACS.md`: 69 -> 83.
  - `.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md`: 5278 -> 5301.
  - `specification/GOALS.md`: unchanged. GOAL-035 states none of the changed relations.
- S2 closed:
  1. Facts in `L`. §4.4: the rule folds `S`, `T`, `U`, `G` (signal), `O` (timeout), `A` and `R`, and "takes no `OwnedProcessFacts`". `actor_process_terminated` is initiated from the `actor_process_exited` kind (`actor_process.ts:1318`).
     - §4.6: the owner reports three outcomes.
     - §9.3 rewritten. Every refusal after finalization carries the encoded facts: `:1362` as well as `:1403`, because the carrier refusal fires after `onProcessFinalized`. The inline `data:` reference is built at `ccall_lifecycle.ts:541`, then retained by `admitRuntimeFailure`.
     - Admission failure is stated as lossy.
     - Forms 3 and 4 in §9.2 are corrected. The views are corrected: domain edges, second sequence diagram, lifecycle state. Row 6 and D0 are rewritten.
     - **Divergence from the B14 addendum (see residual 1).**
  2. Command and HTTP. One statement in §9.3 item 4 and P-LIFECYCLE: no `actor_process_*` events; the facts are in the admitted leaf result or failure subject; the lifecycle answer is a projection, not `holdsAt`. Every sentence promising `holdsAt` for them is removed, and §6, row 6, §9.3 item 6 and the IACS agree.
  3. Co-evolution. The §1.1 blanket claim is replaced by a pointer. The new §10.6 table gives `U(B)` per row, who decides it and when:
     - row 1: acceptance of the failure-carrier `catalog_addition_proposal` with its cost ledger, design-gated;
     - row 4: empty, co-evolution;
     - rows 2 and 3: D3 sites, plus O-SCHEMA in row 2, design-gated at those sites;
     - row 5: the `actor_process_exited` emission premise, which also decides whether `actor_process_terminated` is a kind-only axiom effect under D1 or stays contextual in the rule; "design-gated on D1: retained only after the design gate accepts D1 with this design";
     - row 6: ratification of the reference site, acceptance of the process-atom addition, and the helper route; design-gated on all three.
  4. Closed module law. `effectOf(state, event, dependencies)` and `foldStep(state, event, dependencies)` are closed over both tables. This is stated in §4.4 (FS-17, and the constitution §10 "caller axioms" prohibition), binding §4 `project` row and IACS. The fold law's "at equal axioms and rules" qualifier is removed (§5).
- S3 (12):
  - Closed:
    - binder fault mapping (§3, §4.5, P-BIND);
    - `effectOf`/`foldStep` falsifier (§6: fold law, cold equals warm, A/B expected-effect tables; §5 fold falsifier). P-FOLD stays as the memoization check.
    - carrier standing (§3: `FoldState` and `HoldsAt` subordinate; views show all named carriers; standard stereotypes; IACS rows moved);
    - encoding fixed form (§4.6, §6);
    - fold-time disagreement (§4.4, §9.2, D5, P-LIFECYCLE, IACS);
    - referenced evidence (§9.1);
    - three reported outcomes and the spawn-failure state path (§4.6, §7);
    - catalog disposition and the N06 `realization_refactor` note (§10.7);
    - owner ruling on D3 and D5 (ticket).
  - Stated: the admission-failure path is lossy (§9.3 item 5, D0).
  - Partly closed, rest to ledger:
    - binding classification: guard restored and `checkExactRecord` named a composition; ledger: the two process atoms stay under `materialize`.
    - `holdsAt` falsifier: closed list and real pattern shape; ledger: the migration of the existing `holdsAt(projection, fluent): boolean` (`event_calculus.ts:2107`).
    - carrier views: ledger: sequence participants absent from the domain view.
- S4 (7): all ledger:
  - ticket D3 wording;
  - four one-sided falsifiers;
  - the `shared/select/` imports column;
  - `c_call.ts:6607` wording;
  - binding `isDeeplyFrozen`;
  - state view `CheckedRecord invalid` mapped to refused;
  - document length.
- self-check:
  1. Pass: no `effectOf(axioms` or `foldStep(axioms` in the three design documents.
  2. Pass: no "same `holdsAt` answer" or "same holdsAt" in the three design documents or the ticket section.
  3. Pass: the §10.6 table is at design:628-639. Row 5 (design:638) reads "design-gated on D1".
  4. Pass: §4.4 has one `OwnedProcessFacts` match (design:185), "it takes no `OwnedProcessFacts`".
  5. Pass: 13 relative links on added lines in the four changed files resolve, anchors included. Working-tree check against `0e89859bf`, sanity-checked with a planted missing anchor that was then removed.
  6. Pass: domain, sequence (both §7 diagrams) and state views each name the same 21 carriers, equal to §3's named rows: `JsonValue`, `Sha256Digest`, `StructuralRefusal`, `Outcome`, `ExactMatch`, `ExactMatchSource`, `RecordCheck`, `CheckedRecord`, `RuntimeEvent`, `RuntimeFluent`, `RuntimeFluentPattern`, `EventCalculusEffect`, `RuntimeEventCalculusProjection`, `DerivedEffectRule`, `FoldState`, `HoldsAt`, `OwnedProcessFacts`, `ExactDefinitionCallable`, `DefinitionCall`, `DefinitionReturn`, `DefinitionExecutionFault`. The scripted check is on word boundaries.
     - Change from 18: `ExactMatchSource`, `RuntimeFluentPattern` and `RuntimeEventCalculusProjection` added; `FoldState` and `HoldsAt` now subordinate.
     - All six Mermaid blocks render with mmdc 11.3.0.
     - Annotations use the in-body form, because Mermaid rejects a hyphen in the `<<x>> Class` form.
  - Also rechecked: no K01-K12 match; `process-failure.json` appears once ("not used"); added design lines carry no date, agent or model name, review reference or marker.
- residuals:
  1. **Site corrected from the B14 addendum; needs Executive ratification in the post.** The addendum has `refuseActorProcessEffect` set `diagnosticRef = constructRuntimeFailureDiagnosticRef(encodedFacts)`. Transcribed literally, admission throws:
     - `failTraversal` admits `subject = { stage, candidate }` (`hog/traversal_failure.ts:87`), and `admitRuntimeFailure` requires a `data:` reference to decode to exactly that subject (`abg/runtime_failure.ts:239-241` -> `:100-104`, rechecked on read at `:127`).
     - The actor cannot build that subject: it lacks the C-call stage, and the reference would contain itself.

     The design therefore has the refusal carry the encoded facts as one member, keeps its `diagnostic://` class reference, and has HoG build the inline reference of `{ stage, candidate }` at `ccall_lifecycle.ts:541`. This is recorded as `U(B)` in row 6 and in the ticket.
  2. Fluent names: the activation's `actor_process_unconfirmed` is written as the existing fluent `actor_process_termination_unconfirmed` (`event_calculus.ts:258`, `:874`). The closed list also includes `actor_process_live` and `actor_cleanup_pending`, which the rule's formulas produce. `actor_process_spawn_failed` is an axiom fluent; the other four are rule fluents.
  3. Additions beyond the activation's list:
     - §4.4: the axiom entries for `actor_process_live` and `actor_process_termination_unconfirmed` (`event_calculus.ts:222-258`) move into the rule with `actor_cleanup_pending`, so each lifecycle fluent has one producer;
     - row 6 names the observable change at the new site: the traversal failure result's `diagnosticRef` and `message` (`hog/traversal_failure.ts:51-52`, `:62-66`) carry the inline reference instead of the class reference. A grep of `code/src` finds no reader keyed on `diagnostic://abiogenesis/actor-process/`. The `startsWith("diagnostic://abiogenesis/")` checks at `c_call.ts:1648`, `:3911` and `graph_application.ts:717` guard other carriers;
     - rule inputs `G` and `O`, named from the activation's "signal_requested and the timeout events";
     - the checked inputs of the copy check (`actor_result_artifact_observed`, `c_call_evidenced`/`probabilistic_transport`, `event_store.ts:301`, `:732`);
     - the row 5 emission premise and the O-SCHEMA entry in `U(B)`;
     - the `catalog_addition_proposal` mapping to constitution §10.2's items, with the cost ledger deferred to each row's coding plan;
     - "amendment records land with the rows that realize them" for catalog extensions and additions.
  4. `N05` is a Table 5.6.3-B neutral mechanic, not a §10 catalog row. The `catalog_extension` of the `admit` atoms against it is my reading.
  5. The addendum's fixed `Error` form makes `errno` a string; Node's `errno` is a number. Carried as written.
  6. Unverified, and named in `U(B)` row 6: whether the helper's thrown cleanup failure (`worksite_command_helper.ts:1362-1366`) reaches `L` as an admitted failure subject; how `result.json` content enters `c_call_result_admitted`.
  7. The design is 795 lines, further above the guide of about 600 (ledger S4).
- return route: this file

## Re-review activation

Reviewer: Opus 5.5, max effort, fresh context. Subject frozen by identity:
commit `97b1200bc` on `main` (step 1 after repair 2). Read-only: no edits
except appending `## Re-review` to this file; no commits, builds or tests.
Independence as in the Review activation: you never held the Worker's or
the Executive's context; all actors are one vendor family; say so.

**Scope: the blocking findings only.** The four S2 of the `## Review`
section above, and the S3 the `## Repair return 2` claims closed. Do not
re-open the ledgered S3 and S4, and do not re-review unchanged passages.
Do not re-decide D0 to D5.

**Read:** the `## Review` section (the original findings with their
evidence), `## Repair return 2` (the Worker's claims; test them), the
design post's last two sections ("B14 addendum" and "B14 addendum,
ratified correction") in
`.ai-workspace/comments/claude/20261021T135156Z_REVIEW_compute_calculus_and_library_design.md`,
and at `97b1200bc` the passages those claims cite in
`build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`
(§4.4, §4.6, §6, §7, §9, §10 including §10.6), `ABG_EVENT_CALCULUS_IACS.md`,
`ABI5_STDO3_COMPUTATIONAL_BINDING.md` §4, and the ticket section. Verify
source lines you rely on under `build_tenants/abiogenesis/typescript/code/src`
(`abg/actor_process.ts:1306-1330`, `:1362`, `:1403`; `hog/ccall_lifecycle.ts:541-548`;
`hog/traversal_failure.ts:80-96`; `abg/runtime_failure.ts:84-105`, `:232-246`;
`abg/event_calculus.ts:258`, `:874`).

**Questions.** For each S2: closed, partly closed, or open, with the
evidence line. Specifically: (1) does §9.3 now state a route by which the
facts are in `L` on the failure path that matches the cited source, and
does the rule's input set exclude the facts? (2) is the command and HTTP
answer stated once, as a projection of the admitted result or failure
subject, with no `holdsAt` promise left anywhere, including the ticket and
GOALS? (3) does §10.6 list every unresolved relation you can find, with a
decider and a step, and is any row's "empty `U(B)`" claim false? (4) are
`effectOf` and `foldStep` closed over module constants in the design, the
binding and the IACS, with no caller-supplied axiom, rule or callback? Then
one line per S3 claimed closed: closed or not, evidence. Any new S2
introduced by the repair: report it with severity and evidence.

**Return contract.** Append `## Re-review` to this file: subject,
independence statement, verdict per S2, verdict per claimed S3, new
findings (severity, file:line, evidence, triage), residual uncertainty.
Final report to the Executive: at most eight lines: each S2 verdict in one
line, count of claimed S3 confirmed, any new S2.

ACTION: re-review commit 97b1200bc as activated.

## Re-review
- subject: `97b1200bc` on `main` of `/Users/jim/src/apps/abiogenesis`, step 1 after repair 2 (parent `0e89859bf`); no source code changed. The four changed subject files, `specification/GOALS.md` and `build_tenants/abiogenesis/typescript/code/src` in the working tree equal the commit (`git diff --stat 97b1200bc` over them prints nothing).
- independence: Reviewer Opus 5.5, max effort, fresh context. I never held the Worker's or the Executive's context, and I did not write the design, its transcriptions or the `## Review` above. All actors, this Reviewer and the advisor model it consulted included, are one vendor family (Anthropic Claude); this re-review adds no cross-vendor independence. Read-only: this section is the only edit; no commit, build, test or Mermaid render. Read: this file, `post:666-800` (B14, the B14 addendum and its ratified correction), the subject passages and the source lines cited below. Not read: `.ai-workspace/comments/codex/`, the plan post, `post` Parts A and B1 to B13.
- path keys: as in `## Review`; line numbers at `97b1200bc`. `post` is the working tree; its ratified correction (`post:788-800`) postdates the freeze.
- summary: S2 1 partly closed; S2 2 closed; S2 3 partly closed; S2 4 closed. Claimed S3: 8 of 9 confirmed closed, 1 partly closed. New S2: none. Findings below: 1 S2 (the residue of S2 1, not new), 4 S3, 3 S4. No ledgered S3 or S4 is reopened.
- S2 verdicts:
  1. **Facts in `L`: partly closed.** The refusal leg is closed and matches the source:
     - The transport hands the facts through `onProcessFinalized` (src/abg/worker_transport.ts:455). The actor retains them before it reports (src/abg/actor_process.ts:1310-1311), then reports one terminal event (:1312-1328).
     - The refusals after finalization are at :1362 and :1403. The refusal kind has one consumer, src/hog/ccall_lifecycle.ts:541-548, which passes the refusal as the candidate.
     - `failTraversal` admits `subject: { stage, candidate }` (src/hog/traversal_failure.ts:87). `admitRuntimeFailure` hashes that subject (src/abg/runtime_failure.ts:239), keeps a `data:` reference only when it decodes to the same digest (:240-241, :100-105), and stores the reference in the payload (:243-251, :277).
     - A reference built at :541 from `{ stage, candidate }` therefore puts the encoded facts in `L`; one built from the facts alone throws. src/owner_bindings/run_invocation.ts:1726-1727 already uses this pattern, and the post's ratified correction states the same route.
     - The rule takes no facts (design:185). It initiates `actor_process_terminated` from the `actor_process_exited` kind, which the owner reports only when `scopeAbsence === "absent" && directExit !== null && processStarted` (actor_process.ts:1318).
     - Forms 3 and 4 (design:546-547) match src/abg/replay.ts:2444 and :2392 and src/abg/invocation_admission.ts:512. The three views are corrected (design:384-386, :432-448, :489-498).
     - The unresolved-cleanup negative is on the route: the transport throws (worker_transport.ts:551-554) and the actor refuses at :1403.
     - Open: the no-child negative of P-LIFECYCLE is not on the route (first finding).
  2. **Command and HTTP: closed.** P-LIFECYCLE (design:624), §6 (:276), §9.3 items 4 and 6 (:560, :562), row 6 (:579), iacs:70-72 and ticket:5228-5230 all give one answer:
     - no `actor_process_*` events;
     - the facts are in the admitted leaf result or the failure subject;
     - the answer is a projection of that admitted event, not `holdsAt`.
     The contradiction between row 6 and §9.3 item 4 is gone, and GOALS:18 says nothing about either. No sentence promises a `holdsAt` answer for a helper-run process. design:522 and ticket:5217 state the general rule without scope. Read with design:195, which defines lifecycle questions over the five actor-process fluents, they promise nothing for helpers. Their wording still conflicts with :560 (residue, S3).
  3. **Decision completeness: partly closed.** The blanket claim is gone (design:32). §10.6 (design:628-639) gives every row a `U(B)`, a decider and a point in the sequence, and row 5 reads "design-gated on D1" (:638). Row 4 is the only empty row. It depends on row 1 (:577) and inherits that row's gate, so its "empty" is not false. Missing members:
     - row 2's dependency on the carrier and row 2's catalog disposition (second and third findings, S3);
     - row 6's receipt-path relation (first finding, S2);
     - in row 5's member, the existing fluent `actor_process_exited` (fourth finding, S3).
     Row 6's first member is stale since `post:788-800` (S4).
  4. **Closed module law: closed.**
     - design:176-177 give `effectOf(state, event, dependencies)` and `foldStep(state, event, dependencies)`, "closed over both tables".
     - design:181 states module constants, no caller axiom or rule, and a module-owned `derive`. It quotes FS-17 (const:508) and the §10 row (const:3517) consistently. binding:92 and iacs:23-28 agree.
     - The fold law drops "at equal axioms and rules" (design:250). `grep -n "effectOf(axioms\|foldStep(axioms"` over the three documents returns nothing.
     - `dependencies` is event data and the `holdsAt` pattern is a query, so no exported signature takes an axiom, a rule or a callback.
- claimed S3 (9):
  1. Binder fault mapping: closed. design:94, :203 and :625 match src/shared/static_definition_bindings.ts, where :134-145 yields `invalid_resource_assertion` and :153-164 yields `invalid_resource_receipt`.
  2. `effectOf`/`foldStep` falsifier: closed. design:271 and :257 use the fold-law split and cold against warm; `advance` is no longer the oracle. See the S4 on :271.
  3. Carrier standing: closed.
     - `FoldState` and `HoldsAt` are subordinate, and the fold's result has one prime name (design:102, :106; iacs:31-42).
     - A scripted word-boundary check finds all 21 carriers of design:280 in the domain view, in the union of the two sequence views and in the state view, and no other CamelCase identifier.
     - `prime-conformant` and `subordinate` are standard stereotypes (DM:1414-1416).
  4. Encoding fixed form: closed. design:223-228 and :273 carry `post:771-779`. See the S4 on :273.
  5. Fold-time disagreement: closed. design:197, :540, :590 and :624 and iacs:74-81 agree:
     - the fluent wins;
     - the disagreement initiates `terminationConfirmed_copy_disagrees(processRef)`;
     - no prefix is refused.
  6. Referenced evidence: closed. design:524.
  7. Three reported outcomes and the spawn-failure state path: closed. design:215-221 match src/abg/actor_process.ts:1312-1328, and the state view adds the path (design:493-494).
  8. Catalog disposition and N06: partly closed. design:641-660 declares a disposition for every added or moved function and records move 2 as a `realization_refactor`. The constitution pins only N06's location (const:2595, :3514); the modules of moves 1 and 3 do not appear in it. The admit row stays open (third finding).
  9. Owner ruling on D3 and D5: closed as recorded (ticket:5203-5207, worded as the disposition asked).
  - outside the count, also confirmed:
    - the admission-failure path is stated as lossy (design:561, :585; ticket:5230-5232);
    - the binding guard (binding:82) and `checkExactRecord` named a composition (binding:95);
    - the closed fluent list and the real pattern shape (design:195, :272; iacs:60-65; src/abg/event_calculus.ts:63-67), subject to the fourth finding.
- findings: one per line: S<n> | file:line | claim | evidence | triage
  - S2 (residue of S2 1, not new) | design:624; :104, :110, :521, :585; row 6 at :579 and :639 | P-LIFECYCLE says the no-child launch failure "yields its reported terminal event and the admitted failure whose retained diagnostic subject holds the encoded facts". Elsewhere the design says that "on a failure" the encoded facts are the admitted failure's diagnostic subject. | The chain, read in source:
      - A spawn `error` without a pid sets `launchFailure`, not `firstError` (src/shared/owned_process_lifetime.ts:273-278). The probe then finds no child and finishes without a signal (:182, :251-257). `firstError` is set only if a further error arrives, such as a stream error routed to `fail` (:291-293).
      - If `firstError` stays null, `failed` is false. The transport neither throws (src/abg/worker_transport.ts:549-558) nor rethrows (:661-665); it returns a failure-disposition result.
      - The actor reports `actor_process_spawn_failed` (src/abg/actor_process.ts:1312-1317). The artifact check passes for `noChildEstablished` (:1111-1114), and `actor_invocation_failed` is admitted (:1332-1358).
      - The carrier check passes. Null status and signal are valid (:427-430), and the empty signal sequence is valid (:330). Both classifications are `transport_failure` through `!terminationConfirmed` (src/abg/transport_contracts.ts:64, :76; actor_process.ts:519-543). On the current profile, empty output is assessed `absent` (:1043).
      - The actor returns a receipt (:1369-1376). src/hog/ccall_lifecycle.ts:541 does not branch, and `complete` totalizes the failure into an owner receipt (src/implementation/leaf_invocation_port.ts:752-799).
      - On that path no refusal and no `runtime_failure_observed` carries the facts. Of the launch failure, `L` holds only the message digest (actor_process.ts:1316).
      - If a stream error does set `firstError`, the transport throws (worker_transport.ts:661-664) and the case reaches the refusal at :1403. Either way, the route for this negative depends on an incidental error that the design does not establish, so the finding holds whichever way Node behaves.
    | Leave D0 unchanged. Name where the facts go when the carrier admits a reported failure as a receipt. Two candidates: an actor refusal on a no-child finalization, or the encoded facts as referenced evidence bound by digest in `L` (design:524). Add that relation to row 6 of §10.6. Until then:
      - mark P-LIFECYCLE's first negative as unreachable by the stated route;
      - scope design:104, :110, :521 and :585 to refusals.
  - S3 (new) | design:575, :635 | Row 2 "Depends on: nothing" and co-evolves outside the D3 and O-SCHEMA sites. | `admitJson`, `admitContract` and `admitRef` return `Outcome` (design:122-124), and `shared/admit/` imports `refusal` (:42). The carrier is a `catalog_addition_proposal`, and "neither is coded before its acceptance" (:655, :658; const:3765). Row 1 gates that acceptance (:634). The plan's step order bounds the risk. | Make row 2 depend on row 1, and give the three `Outcome` atoms row 1's gate.
  - S3 (new) | design:649 | The five admit atoms are a `catalog_extension` of `N05`. | `N05` is a row of Table 5.6.3-B, the "selected leaf-instance catalog" (const:2559, :2594). The §10 catalog, which contains §10.2, has no strict-schema or I-JSON admission relation (const:3511-3521). Repair return 2 residual 4 flags the reading as the Worker's own. If §10.2's catalog means the §10 table, the three new atoms `admitJson`, `admitContract` and `admitRef` are an addition proposal under the same acceptance gate. `isRecord` and `hasExactKeys` already exist in src/shared/admission_predicates.ts. | Add the disposition to row 2's `U(B)`. The constitution owner decides it before row 2 is coded.
  - S3 (new) | design:193, :195, :638; iacs:60-63 | The lifecycle fluents are closed, and the rule initiates `actor_process_terminated` from the `actor_process_exited` kind. | The same event already initiates `actor_process_exited(processRef)` from the axiom table (src/abg/event_calculus.ts:253-256, :879-892). Under row 5's premise, two fluents therefore carry one fact. The list also omits `actor_process_active`, which the rule itself reads (design:193). A reader can answer "is the process gone" through `holdsAt` on an unlisted fluent and pass the falsifier. | Extend row 5's member to choose one fluent for the fact, and list or exclude `actor_process_active`.
  - S3 (residue of S2 2) | design:522; ticket:5217; design:544-547 | Lifecycle questions "such as whether a process is gone" are answered through `holdsAt`. | design:195 defines a lifecycle question over the actor-process fluents, while design:560 and :624 apply the phrase to helper-run processes, which are answered by projection. The census sites the Review named are still absent from §9.2: src/product/worksite_command_execution.ts:528, :1693, :1709 and :1729; src/validator/qualification_contracts.ts:389; src/implementation/contracts.ts:92. | Scope :522 to actor processes. Add the census sites, or point to row 6's helper route.
  - S4 (new) | design:273 | The encoding falsifier lists cases. | `post:777-779` falsifies "any member whose encoding is not one of those forms". :273 misses a changed boolean, number or string. It also misses the nested record `directExit` (src/shared/owned_process_lifetime.ts:105), which no form names. | Name the `directExit` form, and falsify any member outside the forms.
  - S4 (new) | design:271 | "the expected-effect table of counterexample A or B (§4.4)". | §4.4 gives the formulas (:188-190) and the two sites (:193), not tables. | Write the two tables, or point to the formulas.
  - S4 (stale after the freeze) | design:639; ticket:5296-5301 | The C-call failure site awaits ratification. | `post:788-800` ratifies it. | Drop the member, and update the ticket line at the next touch.
- residual uncertainty:
  - Not executed, only read: whether Node emits a stream error after a spawn failure without a pid (src/shared/owned_process_lifetime.ts:291-293). The first finding holds either way.
  - Not executed, only read: whether `isNativeWorkerResultAssessment` accepts an `absent` assessment on the current profile.
  - Not traced: failures the transport returns rather than throws, such as a timeout with confirmed termination. The same code would route them to the receipt; that is inferred, not traced.
  - The owner's "ok go" is recorded in the ticket and cannot be verified from the subject.
  - Not read: the plan post, the Codex comments, and the step 2 to 4 files in the working tree.
  - All actors are one vendor family.

## Disposition 2 (Executive)

Re-review of `97b1200bc`: S2 2 and S2 4 closed; S2 1 and S2 3 partly closed;
8 of 9 claimed S3 confirmed; no new S2; 4 new S3 and 3 S4 ledgered.

The remaining S2-level gap under S2 1: a no-child launch failure ends in an
actor receipt (`actor_process.ts:1369`), not a refusal, so on that path the
encoded facts do not reach `L` by the refusal route, and P-LIFECYCLE's first
negative is not on the stated route. The fluent itself is unaffected:
`actor_process_spawn_failed` is admitted on that path and drives the rule.

Priority `P2`, narrowed out of step 1's claim (project basis: a `P2` is
repaired, explicitly narrowed out of the current claim, or retained by an
authority allowed to accept the risk). The plan allows one repair round per
reviewed step; a third design-only round for one path would be
disproportionate. The relation is recorded as design-gated for step 7, where
the route is realized: the receipt path must carry the encoded facts into
`L` either as members of the admitted leaf result or, when completion
throws, as the `failTraversal` candidate at `ccall_lifecycle.ts:551`. Step
7's activation opens with that design closure before any code change, and
the step 7 Fable review checks §9.3, §10.5 and §10.6 row 6 against it.

Also carried to step 7's design closure: §9.2's missing census sites and the
unscoped sentence at design:522; §10.6 row 2's `N05` dependency to step 3's
Return. Step 1 is accepted on this basis. D0 is now withdrawn.
