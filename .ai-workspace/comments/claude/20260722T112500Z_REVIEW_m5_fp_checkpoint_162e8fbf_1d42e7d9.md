# Review: M5 F_P Checkpoint At 162e8fbf / 1d42e7d9

- reviewer: claude (independent, direct F_H commission)
- date: 2026-07-22T11:25Z
- subject: `codex/t286-abi5-root` head `1d42e7d9`; checkpoint commits
  `162e8fbf` (installed F_P leaf) and `1d42e7d9` (refusal proofs), plus the
  sixteen commits since the accepted design freeze
- verdict: checkpoint claims verified; two claims are understated rather than
  overstated; four findings below, none blocking

## Acceptance Gate — Lawfully Discharged

The one gate from my 20260722T053703Z review closed correctly before any
implementation resumed:

- The design was repaired twice (`1ac26691` +368/-117, `d6da4269` +240/-74):
  my F1 diagram erratum is fixed (the `HoG->>Product` child-subset arrows are
  removed), and the repairs added a requirement trace, §6.3 durable
  continuation reconstruction, and a new §9 Runtime Event And Replay Delta —
  the accepted design is materially stronger than the 9e81af17 draft.
- `dfaa3f38` records direct F_H acceptance of the repaired design at
  `d6da4269`, SHA-256 `80269e7306f021723f8713e...738c0f3`, in both T-270
  (`implementation_hold: released`, `accepted_m5_design_commit`) and the
  GOALS basis table. The current file hash matches the accepted pin exactly.
  (Carried minor note: unlike M0–M4 there is no separate DECISION comment
  file; the ruling is recorded inline only.)

## Verified Claims

1. **Full declared M4 gate green at head — stronger than claimed.** The
   checkpoint said "root_satisfied, R1–R10 green"; I ran the complete
   `test:m4` (clean build + 13 files): **25/25 pass, exit 0**, including all
   nine B8 rival-authority mutations, the governor, and both scope
   regressions.
2. **M5 suites green.** Declared suites measured: `m5:gtl`+`m5:hog`+
   `m5:compose`+`m5:fp` = **17/17**; the (undeclared) worker-transport file =
   **5/5**. F_P suite **3/3** as claimed.
3. **B-001 re-adopted before the first F_P call — unclaimed but true.**
   `ffd7e477` (20:27) precedes `162e8fbf` (20:55), satisfying T-270 Order 3's
   ordering. The conservation is genuine, not cosmetic:
   `closed_prompt_proof`/`worker_executes` lanes with lane-aware Claude flags
   (`--safe-mode --tools ""` only on the closed lane); per-agent
   protocol-owned flag protection; bounded JSON-array append-arg admission
   with typed refusals (no placeholders, no protocol-flag overrides);
   declared `ABG_TS_WORKER_SANDBOX` posture with agent-specific binding
   precedence; environment sanitization; and a **runtime** closed-lane
   tool-activity rejection (`toolCallCount > 0` on the closed lane is a
   failure class). Five invariant-based tests prove it, including one that
   crosses a real spawned worker process, stream-json parser, tool event,
   and archive. RC5 rows B07–B14/B24 and donor class Y02 are conserved in
   substance.
4. **The F_P leaf preserves the F_D/F_P boundary exactly.** `fp_hello.ts`
   renders the instruction deterministically, spawns the worker on the
   closed-prompt lane, and returns only candidates: one
   `probabilistic_transport` evidence candidate with full attribution
   (actorRef, content-addressed actorInvocationRef, prompt/transport digests,
   process status/signal/timeout, progress and tool counts, five artifact
   digests) plus a result candidate. Malformed worker output becomes a typed
   `malformed_fp_output` candidate with the raw output digested — truth is
   preserved for ABG to refuse, never patched. The implementation writes no
   events; the worker cannot mint truth.
5. **Refusal proofs are real-path and correctly layered.** Both negatives run
   through the installed CLI. Unattributed output (forged actorRef) and
   syntactically malformed JSON are refused at result admission by the
   *declared* result contract (diagnostic `result-contract-mismatch`), the
   C-call spine totalizes (refusal result → judged `blocked`, last event),
   and no `terminal_reached` or `run_closed` is ever admitted. Test 3 also
   proves truth-layer separation: transport disposition stays `success`
   while the semantic result is refused (STDO-UP-008, STDO-UP-010).
6. **Branch state claims exact.** In sync with origin; worktree clean after
   all gate runs (proof regeneration is byte-stable); only the two Claude
   review comments untracked.

## Findings

- **F1 (reporting).** "Combined M5 suite: 21/21" reconciles with no
  partition at head: declared suites total 17, all five M5 files total 22.
  The suites are in fact green, so this is reporting hygiene — future
  checkpoints should report per-suite counts bound to named npm scripts.
- **F2 (gates law).** `m5-worker-transport.test.mjs` — the five B-001
  conservation proofs — is referenced by **no npm script**, and no combined
  `test:m5` script exists. The declared gate surface understates the real
  proof surface, and undeclared proofs can silently rot. Add
  `test:m5` enumerating all five files (transport included) and cite it in
  checkpoints.
- **F3 (closure discipline).** The passing test is titled "admits one
  **live** F_P leaf" but the worker is a scripted stream-json double via
  `ABG_TS_CLAUDE_COMMAND`. The transport/admission path is real; the model
  is not. T-270 Order 3's "execute one live F_P leaf" (and the A5-F14 F_P
  half) still requires a genuinely live worker run before `ABG5-S02`
  closure. The checkpoint honestly reports S02 open; rename or annotate the
  test so it is never later cited as the live proof.
- **F4 (ops discipline).** One of my three full-gate runs showed a
  transient census failure (three *consecutive* B8 rows —
  `copied_private_execution_basis`, `post_admission_validator_exception`,
  `post_open_judgment_exception` — missing, 9/12), unreproducible across a
  clean full-gate rerun and two isolated B8 reruns (9/9, 9/9). The
  contiguous-window pattern indicates transient interference — most
  plausibly a concurrent build/test run in the same worktree (shared
  `build/` is cleaned and rebuilt by every suite script). Adopt
  one-gate-runner-per-worktree discipline; concurrent gate runs can produce
  false reds and, worse, undermine confidence in greens.

## Residual For S02 (agreed with the checkpoint's own statement)

1. Transparent `workflow.C` child traversal (next frontier, as stated).
2. The complete 40-row traversal matrix and fibre-substitution differential
   from the same runtime path.
3. One genuinely live F_P worker execution (F3 above).
4. Terminal dispositions for the remaining RC5 semantic rows per T-270's
   4.6-conservation clause.

Execution interleaving (advancing Order-3 transport/F_P work before Order-2
completes) is within the ticket's proportionality discretion; closure order
is unaffected because S02 closes only in Order 3 with Order-2 evidence
present.
