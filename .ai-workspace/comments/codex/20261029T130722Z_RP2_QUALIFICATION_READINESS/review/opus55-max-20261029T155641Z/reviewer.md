## Product Frame

- **Fixed 5.0 feature set.** ABIogenesis 5.0 selects fifteen feature families. F08 and F12 stay reserved for 5.1, and selected families exclude their reserved portions (`specification/PRODUCT.md:1114-1117`).
- **Active wave and slice.** GOAL-035, T-287 Phase D, release/qualification readiness (`specification/GOALS.md:20,96-107`). The literal token "GOAL-035" sits on an omitted long line (`GOALS.md:18`), so that identity comes from the operator frame. The slice is RP-2: memo (item 0), yield reprice (1), seven behavior carriers (2), Q20 selection (3) and the P4 proof-complement bound (4).
- **Outcome under review.** RP-2 bounded closure with explicit residuals. It is not dispatch-ready, not release-qualified, not complete performance, not native-agent adequacy and not Public disposition fidelity.
- **Authority split.**
  - GTL declares Programs; HoG traverses the admitted Program and graph directly.
  - ABG alone admits events and Event Calculus truth; replay only reconstructs and projects it.
  - Module/catalog own publication; bindings realize leaf seams only; SDK/CLI are thin shells; F_D, F_P and F_H stay distinct.
  - Immutable Product/Program/GraphFunction/catalog/lock/WorkspaceBinding coordinates are separate from the mutable worksite. A physical change becomes runtime truth only through a declared owner effect, ABG admission, events and fresh replay (`AGENTS.md:38-41,135-153`).
- **Prohibitions that apply here.** No compiler, lowered Program, controller, registry, second runtime, hidden default, private event writer or process-local runtime authority. The only approved reprice is reserving `yield_continuation` production for 5.1. No typed outcome may be erased into a generic success/failure flag (`PRODUCT.md:436-437`).
- **Subjects classified before assigning any runtime authority.**

| Subject | Classification |
|---|---|
| Record-set memo | Derived tool: a pure memo of a deterministic hash inside resource acquisition |
| Yield reservation | Immutable definition (Product, release claim) plus derived tool (generator roster → generated coverage) |
| Carrier tests | Observation/evidence over runtime execution entities (installed ABG runs) |
| rp2-correction / rp2-probabilistic fixtures | Product-declared leaf bindings |
| Q20 selection, P4 bound | Deterministic construction plus pure projection, in test territory |
| 16-GiB launcher | Operator tool configuration |
| Codex trailer mapping | Provenance evidence |

  No subject is promoted to ABG authority, and I found no new runtime authority.

## Subject, basis, claim, independence

- **Basis.** I followed PRODUCT_BASIS.md. Exactly one definition applies: `stdo_abiogenesis.json`, `urn:stdo:product-definition:abiogenesis`, empty composition, no extra authorities. The operator's read-only `stdo status --verify` receipt shows `stdo://releases/v3.0.2/`, manifest `f7f3f824…4477`, installed: true, valid: true, failures: []. Member digests match `verified-members.json` (stdo-review SKILL `1c5ab11a…`, PRODUCT_BASIS `d4d1528a…`). I did not re-run this, because Bash was unavailable.
- **Severity scale.** S0–S4 from `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md:372-380`.
- **Subject.** `08ace9918…` → `f8396e6bc…` (31 files, +804/−224). `31917f66a` is the documentary record commit. `before-status.json` shows a clean tracked diff at that HEAD; the pre-existing untracked files are excluded.
- **Independence.** I am Claude Opus 5.5. I independently assessed only the Codex/gpt-6-astra delta. The inherited Opus-authored baseline was not requalified, and I share a model family with its author. I make no F11/AF22 or final-assessor claim.
- **Evidence class.** Everything below is source inspection plus historical receipts. **Nothing was newly executed.**

## Per-claim coverage

| # | Relation | Verdict | Key evidence |
|---|---|---|---|
| 1 | Record-set memo: tamper refusal, scoped reuse, digest/ordering/coordinates | **Satisfied** | See analysis below |
| 2 | Seven carriers: owner admission and fresh replay | **Satisfied in bounded form; F1 (S3)** | Real installed CLI runs; the Public residual matches the disclosure (see A1) |
| 3 | Yield reserved for 5.1 only | **Satisfied** | Scoped consistently; no other 5.0 promise removed |
| 4 | Selection criterion, membership/coverage, per-part independence, unknown | **Satisfied (mechanical); adequacy remains J** | See analysis below |
| 5 | Packet bounds and cost/performance honestly qualified | **Satisfied; F2 (S4)** | Receipt figures match exactly |

**Relation 1, memo.**
- The memo key is (ref, path, digest, byteCount) per record, in order (`qualification_resources.ts:29-37`).
- The schema is strict, with exactly those fields plus `contentBase64` (`qualification_contracts.ts:17,100`).
- Every entry passes `material()` at construction: it checks the canonical base64 round-trip, the length and SHA-256 (`qualification_resources.ts:42-48,87-94`). This happens on a detached, deep-frozen copy (`:63`).
- So under SHA-256 collision resistance the key determines the value, and the memo is extensionally identical to recomputing the hash.
- The comparison is still made against this invocation's `p.recordSet.digest` (`:203`), and full views stay per-instance (`:57,200-204`).
- The memo test covers same-coordinate changed bytes (refused at `material_bytes`, test `:34`), a stale digest on the memo-hit path, reordering, a changed path, and new bytes.

**Relation 2, carriers.**
- Ticket and asset (`t287-rp2-behavior-carriers.test.mjs:46-89`): real installed runs, an undeclared-asset `invalid_target` refusal (`:60`), `run_closed`/`c_call_result_admitted`, cold `run_result`/`run_replay`, and a check that reads cannot append.
- Corrections (`t287-rp2-correction-carriers.test.mjs:35-48`): typed `run_stopped` and `traversal_route_admitted` stops, no `run_closed`, no `interaction_responded`, cold replay. The disposition flows from admitted child evidence through product leaf functions (`rp2-correction-product.mjs`). Nothing writes events.
- Fibre substitution (`t287-rp2-fibre-substitution.test.mjs:37-60`): topology and C-call spine conserved, actor transport invoked once on the F_P side, and the validator refuses a changed output boundary.
- Evidence writes fall inside the declared `test_env/test_runs` territory (`declared-commands.json:282`). The recipe uses skipPolicy `incomplete` and binds the selected-action root (`:215`).

**Relation 3, yield.**
- The Product paragraph (`PRODUCT.md:432-434`) and release-boundary row (`:1139`) carry the reservation; so do `release-claim.md` and the generator roster (`generate-qualification-rule-catalog.mjs:65`).
- Generated coverage removes exactly `traversal/disposition/yield_continuation`.
- Rule-catalog changes are 282 span/digest shifts with zero ruleRef/claim/version changes.
- `REQ-R-ABG3-PROJECTION.md:50` still requires projections to *distinguish* "yield continuation". That is consistent with the conserved type and is not a production claim.

**Relation 4, selection.**
- `representativeSources` (`build-resources.mjs:113-123`) implements the declared rule (`classification.json:36,46`): first and last member within 131,072 bytes, in inventory order, falling back to the first member. It fails closed on an unknown kind or an absent member.
- It is applied separately to global groups, governed parts and complements (`build-resources.mjs:94-96,136,158`). `memberRefs` is unchanged.
- Installed law requires only that group `sourceRefs` be unique, non-empty and bound, and be carried as task material (`validator/qualification.ts:404-409,427-450`). There is no equal-set rule, which confirms the Worker's "no stop" statement.
- The text "insufficient context is unknown" travels inside the classification material that every slot carries.

**Relation 5, bounds and cost.**
- `slotPromptBound` applies 1,300,000 bytes only to `rule` + `rule/complement/proof/` slots (`assessment-plan.mjs:25-28,324,338`).
- `projection.json` has exactly nine rows with a 1,300,000 bound, 447 slots, 5,831 criteria and 421,551,779 bytes (`:1216-1217,1407`). Its `limits` field (`:7-12`) states it is structural only.
- The figures in `start-0-after.json` and `start-302-after.json` match the README to the millisecond. The heap limit of 17.38 GB is consistent with the 16-GiB launcher.
- The cold start not improving and the full-plan work not being benchmarked are both disclosed.
- The `Co-Authored-By: Codex gpt-6-astra` trailer is present in the commit message recorded in `verification.json:3`. It maps through `provenance.mjs:45,52-56`; an unmapped trailer throws. Mode 100755 is now admitted and symlinks/submodules are still refused.

## Verdict: `falsified` (narrow)

The verdict is falsified only because of F1 (S3) and F2 (S4). There is no S0–S2 finding, no authority or category violation, and no counterexample to the memo, yield, selection or bound relations. Whether these block promotion is the Executive's call under EVALUATION §5.

## Findings

**F1 — S3. A correction carrier treats the known Public erasure as a pass condition.**
- **Violated relation.** A proof predicate must not encode a Product-nonconforming projection as expected behavior. Product forbids erasing a typed outcome into a generic failure flag (`PRODUCT.md:436-437`). Test presence creates no authority.
- **Path.** `t287-rp2-correction-carriers.test.mjs:35` asserts `receipt.ownerOutput.value.disposition === 'runtime_failed'`. The test also confirms `runtime_failure_observed` is absent (`:36`), so Public is reporting a failure ABG never observed. The lane belongs to the declared vector `command://abiogenesis/qualification/test-rp2-behavior`.
- **Trigger.** Run that command. The lane passes only while the defect persists. Once Public projects `escalate` or `inspect_runtime_archive` correctly, the lane fails, so the regression signal is inverted.
- **Root cause.** A characterization of the known residual was placed among the pass predicates instead of being recorded as a residual observation.
- **Impact (credible, not yet realized).** A green verification vector would carry a Public non-conformance into the F11/J material, and it would obstruct the later repair.
- **Boundary.** Test territory and the qualification recipe only; no runtime effect.
- **Containment.** README and Return disclose the residual, and no fidelity closure is claimed.
- **Minimum fix.** Replace the equality with a non-pinning predicate (for example, "not `completed`") and record the observed value as a residual. Then regenerate the recipe and refresh the candidate basis through their owner commands. Cost is small.
- **Regression risk.** Low, but recipe and candidate digests change, which requires a re-freeze.
- **Uncertainty.** The Executive may accept this as a disclosed characterization. Confidence that the predicate exists: high.

**F2 — S4. The O2 driver's projection header does not record the new class bound.**
- **Path.** `test_env/support/exact-candidate-qualification.mjs:676` (and `:548`) writes `bounds` with only `PROMPT_BOUND_BYTES` and `EXECUTION_CLASS_BOUND_BYTES`. The per-row `promptBoundBytes` is correct (`assessment-plan.mjs:338`).
- **Impact.** Future O2 projection records under-describe the bound set.
- **Fix.** Add `proofComplementBoundBytes` to the header. One line; risk is negligible.

## Adjacent observations (not findings)

- **A1 — extent of the Public residual (matches the disclosure, not worse in kind).**
  - The start receipt reports `runtime_failed` (`escalate-receipt.json:20`).
  - The cold `run_replay` projection shows only `status: "stopped"` and `terminalResult: null`, with no typed disposition field (`test_runs/rp2/correction-carriers/escalate-replay.json:21-35`).
  - The exact disposition appears only in admitted raw events that the harness parses directly (`behavior-evidence.json:553-558,898-903`).
  - So the residual covers Public `project.read` replay as well as the start receipt. It may also affect `REQ-R-ABG3-PROJECTION-017` and the "replay-derived … disposition" row at `PRODUCT.md:1141`; I did not evaluate those.
- **A2 — memo coupling.** The memo's soundness depends on the strict schema and on `material()` running first. Adding a material field without adding it to the key would let a stale record-set digest be accepted for a changed set within the same process (fail-open). No test pins the key fields to the schema fields.
- **A3 — ticket_traversal.** The carrier is a Public start of a declared ticket GraphFunction. It matches `PRODUCT.md:398` literally, but it never checks a consequence-proposed `traversal_route_admitted`. Whether it is adequate for the roster's `consequence` class is a judgment for J.
- **A4 — selected-action, inherited.** Re-entry evidence is two admitted `construction_intent_selected` events (`t287-selected-action-host.mjs:49,87-88`), plus an in-process fixture call asserting `re_enter` (`:31`). I found no explicit assertion of an admitted `re_enter` route kind in this lane; `t287-s03-automatic.mjs:85` has one but is not in the RP-2 command.
- **A5 — fibre substitution.** Result equivalence is guaranteed by construction: the stub returns schema constants and the fixture requires hash equality. The discriminating evidence is the conserved topology/spine, the transport count and the validator refusal. This is disclosed.

## Unknowns and inherited limits

- The declared `test-rp2-behavior` command was never executed as one unit. The receipts cover subsets.
- I did not re-run the owner zero-byte regeneration receipts. I did not reconcile the digest bumps in the capability graph, authority-inputs, law-basis, toolchain manifest or candidate-basis fixture.
- I did not verify byte-for-byte that `record.diff` restores the historical ticket snapshot.
- `run_result` for the correction runs was never exercised.
- Whether J can reacquire the unprovided members is unknown.
- There is no ablation showing the warm speedup comes from the memo, and the memo's hit rate under FIFO eviction at 256 entries was not measured.
- I applied ACTIVATION §2/§7 and EVALUATION §3–5 through the skill's restatement and did not re-read them. I did not read INTENT.md, `T287_D4_SELF_CONFORMANCE_DESIGN.md` or `T287_D4_D5_NATIVE_QUALIFICATION_DESIGN.md`. The Q20/P4/P6 approvals are taken from the activation record.
- RP-1's whole-suite result (199 lanes, 1,229 tests, 1,058 pass, 0 fail, 171 skipped) is historical mechanical evidence only.
- The retained residuals stand as stated: Q23, the 32 oversized slots, Public coarsening and absent native qualification.

## Scope

- **Reviewed:** `qualification_resources.ts` in full; the schemas; the memo, material and three carrier tests; both fixtures; the selected-action diff and host excerpts; the recipe and declared commands; the diffs to assessment-plan, build-resources, classification and material-selection; validator scope law; driver excerpts; `provenance.mjs`; the PRODUCT/release-claim/roster/coverage diffs; the requirements grep for yield; and the evidence artifacts cited above.
- **Not reviewed:** the ticket and `phase_d` diffs (documentary), the large generated JSON bodies, per-span rule correctness, the harness scripts, the logs and `Q23-proposal.md`.

## Skill benefit and friction; invalidation; re-entry

- **Benefit.** Binding the basis and the claim first kept this review to the five relations.
- **Friction.** `implementation.diff` is 6.8 MB because generated JSON is on single lines, so I navigated it with grep. Read/Glob/Grep only means no re-execution and no git. The plan-mode tools were unavailable, so this result is returned inline as instructed.
- **Invalidation.** This result goes stale on any change to:
  - the frozen subtree bytes, the material schema or `qualification_resources.ts`;
  - the carriers or recipe;
  - the Product release rows or the installed manifest;
  - the severity scale or capability envelope.

  A Public disposition repair, which flips F1, also invalidates it.
- **Re-entry points.** F1: test territory, then owner recipe regeneration. F2: the driver header.

Closed result returned to root Executive, which alone applies priority and disposition. Reviewer stops.
