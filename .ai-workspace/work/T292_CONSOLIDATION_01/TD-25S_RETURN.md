# TD-25S Return: the human-response and resume residue, second part

Writer: Claude Opus 5.5. Branch `claude/td25s-residue-second-part` from local
`main` at `d5c1be89a`, worktree `/private/tmp/abg-td25s`. T is
`build_tenants/abiogenesis/typescript`. No push, no tag.

**Status: done. The event store no longer admits the `fh_resume_success`
retry completion class. Admission and decode both refuse it with the
store's existing message, and a new lane shows this: it is red on base and
green on final. The census finds no recorded event that carries the class.
Replay of 11 recorded logs and 12 extra logs is identical on base and final,
and no lane other than the new one changes its result. The two owner-ruling
projectors carry a comment that hands the ruling leaf to TD-29. Three design
notes are restated or cut: 55 ranges, 127 original lines moved verbatim to
design history. No stop condition holds. Four items need the Executive's
ruling (section 9).**

Commits on the branch, oldest first:

| Commit | Content |
| --- | --- |
| `2c694d1a9` | source change and its lane: `event_store.ts`, `qualification_proof.ts` comments, `m5-retry-lifecycle-authority` test |
| `ee16ec815` | design A: common-library rows 637, 649 and 663 restated; D2 row 357 retired |
| `0867f88d8` | design B: M05 direct-traversal note, 51 ranges restated or cut |
| this commit | the Return |

## 1. The entry's removal and the store's refusal

`assertRuntimeEventContract` (`T/code/src/abg/event_store.ts:2795`) checks
each `retry_progress_recorded` payload. Both store entries reach it through
`projectRuntimeEventAtContract` (`:2484`):

- admission: `projectRuntimeEventFromValidatedHistory` (`:2450`);
- decode: `validateHistoricalEvents` (`:3407`).

A `completed` progress must carry a listed `completionClass`. The list
(`:2927-2931`) now holds `judged_success`, `fan_out_success` and
`structural_identity_success`. The base list also held `fh_resume_success`.
That line is the only line removed from the check. A payload with an unlisted class
fails the check, and the store throws
`TypeError("retry progress payload carries invalid required value types")`
(`:2941`). It is the message every other unlisted class already gets.

No owner writes the class. TD-25R removed the F_H resume path and its writer
(`eebb079f2`). After this change, only the new lane names the class in
`T/design`, `T/code/src`, `T/contracts` or `T/test_env`, with `test_runs`,
`downstream` and `evidence` excluded.

## 2. The lane

The lane is a new test in
`T/test_env/tests/m5-retry-lifecycle-authority.test.mjs:221`:
"the store refuses a completed retry progress of class fh_resume_success, at
admission and at decode, as any class it does not list".

It builds one completed `retry_progress_recorded` candidate and runs four
checks:

- With `judged_success`, `projectRuntimeEventFromValidatedHistory` admits
  the candidate.
- With `fh_resume_success`, admission throws the store's message (`:251`).
- The admitted row is re-stamped with the store's own formula: payload digest
  first, then event id. With `judged_success`, `validateHistoricalEvents`
  decodes it to the projector's event id (`:263`).
- The same re-stamped row with `fh_resume_success` throws the same message
  at decode (`:265`).

The test matches the error by `{ message }`, so the `TypeError:` prefix does
not affect the match.

On the base build the lane is red: "Missing expected exception: admission
refuses the class". On the final build it is green.

## 3. Census

The census looks for the class as a `completionClass` member value. The
pattern covers both spacing forms and the single-escaped form:

```text
completionClass\\?"\s*:\s*\\?"fh_resume_success\\?"
```

Every search runs `rg -uuu`, which ignores no files, searches hidden and
binary files, and applies no size cap.

| Store | Files searched | Bytes searched | Hits |
| --- | ---: | ---: | ---: |
| every file under the evidence root `/Users/jim/src/apps/abiogenesis/.ai-workspace`, with `-z` (gz, bz2, xz, zst and lz4 archives decompressed, `.tar.zst` included) | 2,830,912 | 244,173,967,100 | 0 |
| every file under the worktree's `T/test_env/proof`, `fixtures` and `uat` | 107 | 9,204,202 | 0 |
| the main checkout's `T/test_env/test_runs`, `uat/runs` and `evidence` | not searched | | see below |

**Main checkout stores.** I did not search them, because the brief allows
reading only the main checkout's `.ai-workspace`. A bound covers them. The
removed writer derived an `fh_resume_success` completion from an admitted
`FhInteractionResumeAdmission`, and its `completionWitnessEventRef` was that
admission's event (TD-25R `eebb079f2`). A recorded progress of the class
therefore needs an `fh_interaction_resume_admitted` event in the same log.
TD-25R's census searched those stores and found no such event: "No recorded
log holds `fh_interaction_responded`, `fh_interaction_resume_admitted` or
`continuation_abandoned`" (TD-25R Return, section 1).

**Substring classification.** A first pass over the `*.jsonl` files under the
evidence root also parsed every line that holds the substring
`fh_resume_success`:

| Measure | Value |
| --- | ---: |
| `*.jsonl` files searched | 4,350 (65,426,442,746 bytes) |
| files that hold the substring | 1,808 |
| string occurrences that are only `fh_resume_successor_input` | 2,577 |
| string occurrences in TS source or declaration text embedded in logs | 3,054 |
| lines a JSON parser rejects (all counted, no cap) | 100; the member pattern matches none of them |
| JSON objects whose `completionClass` is `fh_resume_success` | 0 |

No recorded event carries the class, so the first stop condition does not
hold.

## 4. Replay and lanes, base against final

The 11 recorded replay logs give identical output on base and final. The
12 extra logs also give identical output.

| Lane | Base | Final |
| --- | --- | --- |
| `m5-retry-lifecycle-authority` | 7/7 | 8/8 (the new test; the other seven are unchanged) |
| `t287-r4-aba-retry` | 1/1 | 1/1 |
| `t287-r6-retry-success-exit` | 1/1 | 1/1 |
| `t287-retry-run-prefix` | 3/3 | 3/3 |
| `m5-event-store-reopen` | 27/27 | 27/27 |
| `r1-packed-artifact` | 1/1 | 1/1 |
| `t287-single-address-space-consolidation` | 17 tests: 11 pass, 6 skip (no evidence root), 0 fail | same |

The import, lifecycle and calculus lints exit 0 on final. I did not run
`witness-reprice-definition-binding`, which is not in the lane list.

## 5. What a caller observes at the ruling leaf

This section comes from reading the code. No lane runs either ruling
Program. `T/test_env/qualification/dispatch.mjs:30` and
`T/test_env/support/exact-candidate-qualification.mjs:65` name
`program://abiogenesis/qualification/ruling@5`, but nothing invokes the
finalize leaf.

`T/code/src/gtl/self_conformance.ts` publishes the leaf in two forms.
`leaf()` (`:129-161`) publishes every leaf as its own Program, so a caller
can reach the leaf either way.

**(a) `program://abiogenesis/qualification/ruling@5` (`:187-190`).** Its one
node (`:180-186`) is

```text
C.compose(C.of(F_H, interaction_leaf_requirement qualification_owner_ruling),
          workflow.C(graph-function://abiogenesis/qualification/ruling-finalize@5))
```

1. The F_H member runs first. HoG proposes the hold (`holdOwnedInteraction`,
   `hog/interaction_lifecycle.ts:62`), ABG admits it
   (`admitOwnedFhInteractionHold`, `abg/continuation.ts:358`), and the Run
   completes as `held`.
2. Only `interaction.respond` could answer the hold, and it is unbound. Its
   packet locator names `./product` →
   `INTERACTION_DEFINITION_BINDINGS.respond.<member>`, which `./product` does
   not export.
3. The transport's `selectedCallable`
   (`public/installed_definition_call_transport.ts:240-298`) therefore refuses
   with `installed_binding_unavailable`, "manifest-bound installed definition
   export is unavailable" (`:271-283`).

The caller sees a held Run with one open F_H continuation. The finalize leaf
is never reached.

**(b) `program://abiogenesis/qualification/ruling-finalize@5`, invoked
directly.** The leaf is F_D, and its implementation is
`graph-function://.../ruling-fd@5` (`:85`, `:88`, `:163`).

1. `realizeQualificationRuling` (`implementation/qualification.ts:82`) calls
   `projectQualificationRulingForConsumer`
   (`abg/qualification_proof.ts:511`), which returns `null`.
2. The leaf therefore returns `failure("owner_ruling_unadmitted", ...)`
   (`:85`).
3. The call owner refuses the judgment with `reasonRef` set to that
   diagnostic (`hog/ccall_lifecycle.ts:650-662`). The judgment is `blocked`
   (`hog/judgment.ts:84`).
4. `proposeFailedRoute` (`hog/route_proposal.ts:863-872`) proposes the failed
   route. The completion is failed and carries `diagnosticRef`
   `diagnostic://abiogenesis/qualification/owner_ruling_unadmitted@5`
   (`hog/ccall_lifecycle.ts:289-301`).
5. ABG admits the failed route with `run_stopped` (failed), unless
   `terminalizeRun === false` (`abg/traversal_route.ts:4831-4860`).
6. There is no retry. Retry applies only to a probabilistic transport
   failure (`abg/c_call_outcome.ts:1218-1230`), and finalize is F_D.

The caller sees a stopped, failed Run whose failure names
`owner_ruling_unadmitted`.

**(c) The assessment path in the validator.** Here the ruling enters
through the acknowledgment branch of `constructionAuthorSet`
(`abg/qualification_proof.ts:665`):

1. When an external construction's attribution is not `grounded` (`:678`),
   the branch selects the ruling and calls `projectQualificationOwnerRuling`
   (`:682`, defined at `:618`). That call returns `null`, so the branch
   returns `null` at `:683`.
2. Lines `:684-689` after that return cannot run in 5.0.
3. Its caller `resolveQualificationAssessments` (`:771`) returns `null` for
   the whole resolution when any slot's author set is `null` (`:791-792`).
4. In `validator/self_conformance.ts:85-90`, `resolved` is then
   `undefined`, because the `?.map` short-circuits, and `assessment` is
   `null`. `assess` returns `null` for every role (`:101`). Each `assessed`
   call then adds one `blocked_incomplete` finding with provenance
   `J_required`, naming the surfaces whose result is `null` (`:137`).

Native construction and grounded external attribution do not consult the
ruling.

The comment on both projectors (`qualification_proof.ts:513-515`, `:621-623`)
reads:

```ts
// An owner ruling arrives as a human response, which 5.0 reserves to 5.1: no
// 5.0 history carries one, so this returns null. What becomes of the ruling
// leaf of the self-conformance Program is TD-29's decision.
```

## 6. Design notes

Each cut range moves verbatim to the note's retired-sections file in
`T/design/history/`. Its header reads "Cut from `<path>` at commit
`d5c1be89a`, lines a-b, ..., verbatim." A restated range moves its original
text there too, and the note keeps the restatement in its place.

`T/design/history/README.md` lists the two new retired files in its sorted
"Retired sections" list. M05 already had a retired file; the new block is
appended after a `---` separator.

What each note designs does not change, so `T/design/README.md` is not
edited.

| Note | Ranges | Original lines moved | Retired file | Pointer line |
| --- | ---: | ---: | --- | --- |
| `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` | 3 restated | 3 | new | inserted before `## 1.` (line 9) |
| `T287_D2_REQUIREMENT_LIFECYCLE_DESIGN.md` | 1 cut | 1 | new | inserted after the title (line 3) |
| `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` | 51: 38 restated, 13 cut | 123 | existing, block appended | already present |

### 6.1 Checks run for every note

Each check uses a script in `/private/tmp/abg-td25s-work/scripts/`.

**Script check (`verify.py <root> <spec.json>`).** It runs independently of
the script that applied the edits, and checks three things:

- Over a difflib comparison of the base note and the final note, every
  changed original line lies in a declared range, every declared range
  changes, and every pure insertion is a declared pointer line.
- The retired file equals its base content plus exactly one block, whose
  header names the ranges and whose body is the original range text.
- Every replacement text is present in the note.

All three specs pass on final:

```text
ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md: 3 ranges, 3 lines moved, 1 inserts; OK
T287_D2_REQUIREMENT_LIFECYCLE_DESIGN.md: 1 ranges, 1 lines moved, 1 inserts; OK
M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md: 51 ranges, 123 lines moved, 0 inserts; OK
```

**Link check (`linkcheck.py T/design`).** It lists every dangling relative
link and anchor across all design markdown, history included, without line
numbers. The count is 251 on base and 251 on final, and the two lists are
identical. All 251 are missing files that predate this package. The package
adds no dangling link.

**Citation check.** Line citations into the edited notes are re-resolved:

- Row 141 of ticket T-290 cites M05 `:1228`, `:1299`, `:1300` and `:1496`.
  The same text is now at `:1225`, `:1296`, `:1297` and `:1485`. Row 1300 is
  restated, not cut, so the citation keeps a target.
- The five anchors that `ABI5_STDO3_COMPUTATIONAL_BINDING.md` cites into
  these notes resolve.
- No citation names a cut range.
- `inventory.json` and the recipe are not edited.

**Stop check for cuts.** There are 14 cut ranges, 13 in M05 and 1 in D2.
Each names only functions, members or rows that are absent from `code/src`
at head, or an edge or step of the removed response and resume chain. Each
cut was checked for a rule that live code still realizes and that no other
passage states. One rule needed checking: D2 row 357 says
"No terminal/blocked Run is relabeled as held or gap-stopped". The same rule
is stated in `ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION.md:195-196` ("a
failed/stopped Run cannot be relabelled as active"). No cut is the only
statement of a live rule.

### 6.2 Source facts the restatements cite

| Fact | Source at final |
| --- | --- |
| F1 HoG proposes the hold and ABG admits it; the Run completes as held | `holdOwnedInteraction`, `hog/interaction_lifecycle.ts:62` (held at `:199`); `admitOwnedFhInteractionHold`, `abg/continuation.ts:358` |
| F2 `interaction.respond` is declared and unbound; the transport refuses with `installed_binding_unavailable` | `selectedCallable`, `public/installed_definition_call_transport.ts:240-298`, refusal `:271-283` |
| F3 the fold refuses an F_H continuation carrying a responded, resume-admitted, abandoned or superseded row | `eventCalculusEffectRefs`, `abg/calculus/axioms.ts:797`, case `:1314-1317` |
| F4 an F_H continuation has one lifecycle row and projects as `open` | `projectFhContinuations`, `abg/fh_continuation_projection.ts:236-245` |
| F5 F_H response and successor fields are null | `ReplayContinuationState`, `abg/fh_continuation_projection.ts:34` |
| F6 `run.continue` has the members `current_intent` and `selected_action`, which continue construction continuations | `RUN_OPERATION_CONTRACTS`, `product/run_operation_contracts.ts:323`; `isConstructionContinuationKind`, `abg/construction_continuation.ts:16` |
| F7 the installed Product semantics provider has no response member | `ProductSemanticsProvider`, `product/semantics.ts:146`; `loadInstalledProductSemantics`, `:381` |
| F8 any F_H respond or continue operation is `invalid_history` to the F_H fact owner | `projectFhEffectfulPublicInvocationFacts`, `abg/fh_continuation_projection.ts:320-327` |
| F9 the responded and resume-admitted kinds are declared, with effects | `LEGACY_ROOT_EVENT_KIND_VALUES`, `abg/event_store.ts:58`; `LEGACY_ROOT_EVENT_CONTRACTS`, `:329`; `ROOT_EVENT_CALCULUS`, `abg/calculus/axioms.ts:132` (rows `:320-339`) |
| F10 `project.read` run members | `shared/capability_contracts.ts:87` (`run_status`, `run_result`, `run_replay`, `run_lawful_actions`) |
| F11 Product input and contract admission | `admitInstalledProductInput`, `product/semantics.ts:557`; `admitInstalledProductInputValue`, `:540`; admission `:505`; `validateContractValue`, `:650` (admission `:654`, dispatch `:656`); `jsonRecord`, `product/default_library.ts:56` |
| F12 the RAW F_H hold seed and the complete-pair proof | `T/test_env/tests/t287-single-address-space-consolidation.test.mjs`: complete-pair case `:818` (test 7); "RAW F_H hold seed" cases `:1057`, `:1145` (tests 9, 10). All three run in the worktree; the lane's 6 skips are tests 1-4, 11 and 12 |

### 6.3 `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`

Every range in this note is a restatement.

| Base | Final | Rule as restated | Source |
| --- | --- | --- | --- |
| 637 | 639 | O-SCHEMA: two methods carry every external dispatch of `admitInput` and `validateContractValue`; the I-JSON domain covers Product input and contract values. `evaluateInstalledInteractionResponse` and `evaluateInteractionResponse` are dropped. Stale cites (`semantics.ts:499`, `:512`, `default_library.ts:45`) are re-resolved. | F11, F7 |
| 649 | 651 | The F_H continuation projection is `projectFhEffectfulPublicInvocationFacts`. It reads both operation classes, checks each open continuation's opening, and returns `invalid_history` for any F_H member. `commitFhInteractionResponseAtExpectedPrefix` is dropped from the complete-mode list, and the "response" join is dropped from qualification proof. | F8, F4 |
| 663 | 665 | P-FH-PAIR is rewritten to the RAW F_H hold seed proof. The fold refuses each responded, resume-admitted, abandoned or F_H superseded row. An orphan F_H response operation is `invocation_pair_invalid`. | F12, F3, F8 |

### 6.4 `T287_D2_REQUIREMENT_LIFECYCLE_DESIGN.md`

| Base | Kind | Passage | Reason |
| --- | --- | --- | --- |
| 357 | cut | row `abg/continuation.ts::prepareContinuationPublicOperation`: "Rehydrate a real held F_H continuation and its admitted response." | The function is absent from `code/src`. Its second sentence's rule is also stated at `ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION.md:195-196`. |

### 6.5 `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md`

Cut ranges (base numbering). Each describes only removed code or a removed
lifecycle edge:

| Base | Passage |
| --- | --- |
| 282 | §4.1 atomic family row `admitInteractionResponse` |
| 999 | §7.3 lifecycle edge `ResponseAdmitted --> ReplayRehydrated` |
| 1231 | §12.0 ontology row "F_H response candidate" |
| 1281-1282 | §12.0 function rows "Evaluate F_H response" and "Resume held traversal" |
| 1301 | function row `projectFhInteractionSemanticBasis` |
| 1305 | function row `evaluateInstalledInteractionResponse` |
| 1307 | function row `deriveFhResumeSuccessorInput` |
| 1309 | function row `admitFhInteractionResume` |
| 1336-1337 | algebra lines `; evaluate(Product response)` |
| 1470, 1488, 1514, 1524 | class-view members `-evaluateInteractionResponse()` and `-admitResponse()` |

Restated ranges:

| Base | Final | Rule as restated | Source |
| --- | --- | --- | --- |
| 135 | 135 | §3.1 `Continuation`: an F_H continuation has one lifecycle row and projects open; response and resumption are reserved to 5.1; the fold refuses the four rows | F4, F3 |
| 212 | 212 | §3.3 continuation lifecycle: open only, no 5.0 F_H terminal | F4, F3 |
| 224 | 224 | §3.3 `InteractionLeafRequirement`: request (hold) admission only | F1 |
| 234 | 234 | §3.3 `HumanInteractionBoundary`: no 5.0 return path | F2 |
| 238 | 238 | §3.3 `Continuation`: no 5.0 operation advances an F_H continuation | F2, F6, F3 |
| 239 | 239 | §3.3 `ContinuationBasis`: no `run.continue` member consumes an F_H basis | F4, F6 |
| 253 | 253 | §3.4 request or answer human work: hold only; the answer is reserved to 5.1 | F1 |
| 258 | 258 | §3.4 respond to hold: none in 5.0 | F2 |
| 340 | 339 | §5 `ContinuationBasis`: F_H response and successor fields are null | F5 |
| 364-369 | 363-369 | §6 hold opens the aggregate; no 5.0 operation answers or resumes it | F1, F2 |
| 558-560 | 558-561 | §6.3 item 6: non-F_H resume event stays; F_H appends nothing | F3 |
| 565-568 | 566-569 | §6.3: `interaction.respond` unbound | F2 |
| 870-886 | 871 | §7.2 sequence: the respond/continue exchange becomes one `Note over Human,Public` | F2 |
| 997 | 982 | §7.3 lifecycle: `note right of Held` replaces the response edge | F2 |
| 1011-1012 | 995-1002 | §7.3 prose: the view is the target algebra; F_H realizes open only | F4, F3 |
| 1017, 1019 | 1007, 1009 | §7.3 continuation edges labelled `reserved 5.1` | F3 |
| 1046 | 1036 | §8 F_H axiom row: invoke stops at the hold; respond unbound | F1, F2, F4 |
| 1048 | 1038 | §8 continuation axiom row: F_H open proven; other states reserved and refused | F4, F3 |
| 1059-1060 | 1049-1055 | §9: responded and resume-admitted rows are declared with no 5.0 producer | F9, F3 |
| 1153-1155 | 1148-1152 | §10 item 10: the F_H response port is reserved to 5.1 | F2 |
| 1227 | 1224 | §12.0 ontology: hold opens; no operation answers or continues | F1, F2, F6, F4, F3 |
| 1249-1250 | 1245-1247 | invariant 4: no 5.0 operation evaluates an F_H response | F7 |
| 1252-1253 | 1249-1252 | invariant 5: F_H response semantics reserved; provider has no response member | F7 |
| 1279 | 1278 | function row "Open F_H hold and continuation" | F1, F4 |
| 1280 | 1279 | function row "Admit continue operation"; respond unbound | F2 |
| 1300 | 1297 | function row "Admit a public continuation operation once": none for F_H | F2, F8 |
| 1405-1409 | 1396-1400 | §12.0 Product semantics paragraph: no F_H response member | F7 |
| 1598-1613 | 1585-1586 | sequence view: `held outcome` plus one `Note` | F1, F2 |
| 1638-1640 | 1611 | lifecycle view: `Held --> Held: interaction.respond refused, installed_binding_unavailable` | F2 |
| 1675 | 1646 | cross-view axiom row: no F_H Responded state in 5.0 | F4 |
| 1729 | 1700 | module proof path: stops at `project.read`; respond and F_H continue reserved | F1, F2 |
| 1797-1805 | 1768-1773 | §12.2: no 5.0 operation evaluates or admits an F_H response against the intent | F2, F7 |
| 1827-1828 | 1795-1796 | §12.2: an F_H continuation receives no response value | F5 |
| 1830-1831 | 1798-1801 | §12.2: `fh_interaction_resume_admitted` has no 5.0 producer | F3 |
| 1864 | 1834 | §12.2: the S03 path's F_H continuation realizes `open` only | F4 |
| 1930-1931 | 1900-1903 | §12.4: no installed proof admits or refuses an F_H response | F2 |
| 2041-2047 | 2013-2019 | §12.6: an F_H continuation does not resolve; `project.read` run members | F4, F10 |

## 7. Constitution and specification

I do not edit `ABI5_REALIZATION_CONSTITUTION.md`. These passages present the
removed chain as realized or current:

| Line | Passage |
| --- | --- |
| 484 | "For an F_H resume, held coordinate `H` and admitted successor coordinate `S` may have identical topology witnesses ..." |
| 1424 | `E33` `interaction.respond/{select,approve,reject,assess,answer_escalation}`: "pending interaction -> Product response evaluation -> expected-prefix response admission" |
| 1540 | `L47` names `A/fh_resume_relation.ts::deriveFhResumeSuccessorInputAtPrefix` "(current)"; the file is deleted |
| 1541-1542 | `L48`, `L49`: "none: the F_H resume operation is unbound (T-290 C-17)" (already states unbound) |
| 1546 | `L53` names `A/continuation.ts::projectFhInteractionSemanticBasisAtPrefix` "(current)"; absent from `code/src` |
| 1547 | `L54` names `P/semantics.ts::evaluateInstalledInteractionResponse` "(current)"; absent |
| 1548 | `L55` names `A/continuation.ts::prepareFhInteractionResponse` "(current)"; absent |
| 1549 | `L56` names `A/continuation.ts::commitFhInteractionResponseAtExpectedPrefix` "(current)"; absent |
| 1934 | `interaction.respond#{...}` → `./product` `InteractionResponsePort.respond`: "Runtime value absent; C2-pending five exact member bindings." |
| 2141 | `interaction.respond`: "one E33 kernel plus five frozen packets" |

TD-25R's Return cites the constitution at `:2660-2661` and `:3128`. Those
numbers predate TD-64C's move of five sections to history. `:2660-2661` were
L53 and L54, which are now at 1546-1547. `:3128` was the
`abg.operation.interaction.respond#select` row, which is now in
`history/ABI5_REALIZATION_CONSTITUTION__RETIRED_SECTIONS.md`.

I do not edit `specification/`. These passages bear on the removed chain and
the ruling leaf:

- `requirements/product/REQ-P-CONSENSUS.md:3`: "**Status**: Retained
  capability contract; dedicated F08/S05 qualification reserved for 5.1".
- `REQ-P-CONSENSUS.md:218-221`: "`interaction.respond` shall admit the exact
  actor, capability, hold, provisional unresolved result, and one decision
  from `accept_with_dissent | reject`; `run.continue` shall resume the same
  Run, admit exactly one final result, and close through the ordinary ABG
  path."
- `REQ-P-CONSENSUS.md:266-268`: "The unresolved fixture shall prove that
  `interaction.respond` and `run.continue` retain the exact original Run
  identity, consume one hold once, and produce one final result before
  ordinary closure."
- `requirements/product/REQ-P-PUBLIC-CONTRACTS.md:229-232`:
  "`abg.operation.interaction.respond` and its closed `select`, `approve`,
  `reject`, `assess` and `answer_escalation` variants are also reserved for
  5.1. Their response-driven `run.continue` use is excluded from 5.0
  qualification; automatic continuation and distinct new-action admission
  remain required."
- `requirements/product/REQ-P-POLICY.md:235`: "**REQ-P-POLICY-031**:
  Reserved for 5.1 native human interaction."
- `REQ-P-POLICY.md:241`: "**REQ-P-POLICY-032**: Reserved for 5.1 native
  human response admission."
- `REQ-P-POLICY.md:257-258`: "Native `interaction.respond` and
  response-driven same-run resumption are 5.1 scope."
- `requirements/README.md:93-97`: "The native human-response portions of
  F03/F06/F07/F10 are reserved for 5.1. `abg.operation.interaction.respond`
  and its five variants are outside the required 5.0 public operation family.
  Only response-driven human resumption and human-proxy interaction portions
  of `run.continue` are deferred; automatic current-intent continuation and
  new-action admission remain 5.0 obligations."
- `requirements/README.md:103-105`: "F_H hold/block, escalation reporting,
  reserved owner rulings and actual human RC acceptance are not deferred."
- `requirements/abg/REQ-R-ABG3-CONTINUATION.md:23-27`: "Only the native F_H
  response/resume portion of CONTINUATION-011 is deferred; automatic
  current-intent continuation, newly selected actions, local correction and
  CONTINUATION-009 runtime liveness remain 5.0."
- `PRODUCT.md:94`: "response and response-driven same-run resumption are
  reserved for 5.1."
- `PRODUCT.md:373`: "Native response admission and response-driven
  resumption are reserved for 5.1; attributed human authority is not
  impersonated or waived."
- `PRODUCT.md:374`: "native response/resume composition is reserved for 5.1."
- `PRODUCT.md:415`: "Native response admission and same-run response-driven
  resumption are reserved for 5.1."
- `PRODUCT.md:1230` names, as deferred, "Native response admission and
  response-driven same-run resumption, including evaluation of changed basis
  and lawful re-entry."
- `PRODUCT.md:1287`: "Reserved owner rulings remain with their owner."

## 8. Identity, lines and deviations

### 8.1 Identity

The final build in the worktree exits 0. After it I restored
`contracts/capabilities/capability-definition-graph.json` and
`product-toolchain-manifest.json`, which were the only tracked files the
build changed. The design edits do not change identity; the values equal
those after the source commit.

| Identity | Base `d5c1be89a` | Final |
| --- | --- | --- |
| productContentDigest | `sha256:8966d819...b6` | `sha256:d3a0220367e2faa95d7944ab10787b7a3c6bce64cd215261be5ab6a2d430d90c` |
| contributionManifestDigest | `sha256:3dca81fa...6a` | `sha256:072ebb4bf57af0739e9882f9134723c79f9abef7d34c0342289ce7b446000922` |
| catalogDigest | unchanged | `sha256:8c5f262f2e7b9fcdef40a80d18b262aa90e4ea3cee854b1f01d52b67773c1733` |
| graphDigest | `sha256:a6fb3171...755687` | `sha256:6590bd43eebdb0fbaba14df61e5004200b29fb05680da1aa9537677570331006` |
| capability graph contentDigest | `sha256:52480091...cec111` | `sha256:625eae3ad1a53fe3af79de91b2c2136c1821a71b56606fcba272474ecc94b3f7` |
| productId | unchanged | `product://abiogenesis/typescript-tenant@5.0.0-rc.12` |
| productRelativeLocators | unchanged | 5,325 |

### 8.2 Lines

| Surface | Added | Removed |
| --- | ---: | ---: |
| `code/src/abg/event_store.ts` | 0 | 1 |
| `code/src/abg/qualification_proof.ts` (two comments, 2 lines each replaced by 3) | 6 | 4 |
| `test_env/tests/m5-retry-lifecycle-authority.test.mjs` | 50 | 0 |
| `design/M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` | 92 | 120 |
| `design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` | 5 | 3 |
| `design/T287_D2_REQUIREMENT_LIFECYCLE_DESIGN.md` | 2 | 1 |
| `design/history/` (three retired files, README list) | 190 | 0 |

### 8.3 Deviations

- The design work is two commits. The brief allows one or more, and M05 is
  one block of 51 ranges in one commit.
- No mermaid parser is available on the host, so the edited diagrams are not
  machine-checked. Each edit uses a statement form the diagram already uses:
  `Note over A,B: ...` in sequence views, `note right of S : ...` and
  `S --> S: label` in state views.
- Restated row 637 of the common library re-resolves three cites that were
  already stale on base: `semantics.ts:499`, `:512` and
  `default_library.ts:45`.
- M05 row 1300 is restated rather than cut, because T-290 row 141 cites it.

## 9. Items for the Executive's ruling

1. **Constitution rows.** L47 and L53-L56 name deleted functions as
   "(current)". E33, 1934 and 2141 describe the respond kernel as the
   realization. The constitution is not mine to edit; the passages are in
   section 7.
2. **Consensus (TD-26).** `REQ-P-CONSENSUS.md:218-221` and `:266-268` require
   `interaction.respond` and `run.continue` to complete an F_H Consensus in
   the same Run. `REQ-P-PUBLIC-CONTRACTS.md:229-232`, POLICY-031/032 and
   `requirements/README.md:93-97` reserve both to 5.1. The Consensus status
   line reserves only "dedicated F08/S05 qualification". M05 lines 2190,
   2455 and 3077 and `M05_S05:713` keep the Consensus respond text, and I
   did not edit them.
3. **Owner rulings (TD-29).** `requirements/README.md:103-105` says
   "reserved owner rulings ... are not deferred", and `PRODUCT.md:1287` says
   "Reserved owner rulings remain with their owner". The ruling leaf receives
   its ruling as an F_H response, which 5.0 does not admit (section 5). The
   unreachable lines `qualification_proof.ts:684-689` belong to the same
   decision.
4. **Design residue outside the removed chain.** These passages are stale at
   head but do not present the removed chain as realized. I did not edit
   them; section 10 lists them. The Executive decides whether a later
   package restates them.

## 10. Residuals, listed and not edited

M05 line numbers below are final.

- Generic continuation text that names a resume but no F_H response:
  - `rehydrateContinuation` and `continueExecution` (282-283);
  - §3.4 row 260 "continue held run";
  - §6.3 item 3 (541);
  - `continuation_resume_admitted` (558, 1008, 1077), which no code writes
    at head;
  - §8 row 1039 "continuation resume is actor-authorized";
  - §11 item 6 (1173-1175), "`interaction.respond` remains separate from
    `run.continue`";
  - §12.0 rows 1304 "Traverse or resume" and 1305 "Totalize post-resume
    failure".
- Public carrier text that T-290 left stale: invariant 6 (1259-1261), 1327
  `; project(explicit durable authority)`, 1642, and the §12.2 carrier
  sentences.
- Invariant 2 (1238-1240) states a grant set, one `interaction.respond` and
  one `run.continue` grant per F_H capability, which I did not verify.
- The §12.2 grants paragraph (1775 onward) cites no source that can be
  checked.
- §12.2 line 1788, "admitted from the Product response".
- §12.3 item 4 says delta admission reads an F_H event. Delta admission at
  head reads none.
- §12.4 negatives 2 and 10.
- The S03 sequence and algebra keep post-resume steps. Head's automatic
  current-intent S03 path has no design in §12.
- Deferred rows 1079-1081 in §9, and rows 1285, 1316 and 1377, say the
  supersede and abandon kinds are unselected or have no current realization.
  The kinds are in `LEGACY_ROOT_EVENT_KIND_VALUES` (`event_store.ts:58`),
  and construction `continuation_superseded` is live
  (`construction_continuation.ts:591`, `:845`).
- §9 declaration rows 1076 and 1078 state the declared effects of
  `fh_interaction_responded` and `fh_interaction_resume_admitted`. They are
  correct as declarations, and the §9 prose above them (1049-1055) now says
  that neither kind has a 5.0 producer.
- Row 1301, `admitFhInteractionResponse`, is already marked retired at
  T-290 and is kept.
- `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:2218`
  names `product/interaction_response_operation.ts`, which has been absent
  since before `72ac59366`.
- The §7.1 class member `-respond` (693).
- `bindInstalledLeafInvocationPort` (1303), which is absent from
  `code/src`.
- Row 141 of ticket T-290 still cites M05 `:1228`, `:1299`, `:1300` and
  `:1496`. The same text is now at `:1225`, `:1296`, `:1297` and `:1485`.
  The ticket is not edited.
- Roster and reservation rows that are current were spot-checked and left
  alone:
  - `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md:297`,
    `:642`, `:1816`, `:2221` and `:2284` (packet names in that table are
    design names);
  - `T287_PUBLIC_DEFINITION:60`;
  - `T287_D6:191`.
