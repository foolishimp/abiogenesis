# Review: T-270 Declared-Gate Checkpoint bfc4cafc And The 33-Commit Span Since 1d42e7d9

- reviewer: claude (independent, direct F_H commission)
- date: 2026-07-23T00:30Z (about 10:30 +1000)
- subject: `codex/t286-abi5-root` head `bfc4cafc` (= origin); span
  `1d42e7d9..bfc4cafc`, 33 commits
- verdict: every checkpoint claim verified by independent rerun, including a
  live-model execution; all four findings from my 20260722T112500Z review are
  addressed; one new minor finding (live-gate assertion brittleness); no
  authority, scope, or process violations found

## Claims Measured (all green)

| Claim | My measurement |
|---|---|
| M4: 26/26 | `npm run test:m4` rerun: **26/26, 0 fail** (census grown to ten mutation classes — two new: `forged_leaf_execution_port`, `post_install_implementation_substitution`) |
| M5: 55/55 | `npm run test:m5` rerun: **55/55, 0 fail** across 12 files including worker-transport |
| Conservation 19/40, 21 explicit gaps | Matrix hard-asserts `length 40`, `proven 19`, `open 21`; solo run: 41 tests = binder + 40 rows → 20 pass, **21 todo**, 0 fail. Open rows carry typed gap strings in all four evidence fields — no silence |
| ABI5-ROOT-001 R1–R10 green | Within my test:m4 rerun |
| Reproducible package digest `eca20ec…8994` | Exact match in `abi5-root-candidate-basis.json`; R1 exact-byte verification passed in my rerun (independent build reproduces the pack) |
| Remote checkpoint `bfc4cafc` | = local HEAD = origin head; worktree clean except the three Claude review comments |
| No compiler / lowering / public controller / new ticket surface | `assertNoCompiledCarrier` censuses in the installed tests; active tickets unchanged (nine, no additions) |
| Gate slice semantics | Evaluator runs as an ordinary C-call with bound `compositionRef`; judgment `advance`/block; the gate route's `causationEventRefs` includes the evaluator judgment event; block path stops **before** target traversal. "Admit block or advance from evaluator truth; never select a candidate" holds |

## The Span's Real Story (larger than the checkpoint message)

1. **F_P execution-authority defect found, repaired, and F_H-accepted.**
   `fef14403`/`d7cabbec` repaired six boundaries against the accepted design:
   Public stripped of implementation imports (~385 lines out of
   `public/operations.ts`); HoG reduced to an opaque install-bound leaf port
   that rechecks installed bytes per invocation; the complete transport
   binding admitted by ABG before actor identity exists; process exit only
   from observed child exit (SIGTERM → bounded SIGKILL → distinct
   termination-unconfirmed event, never fabricated); the F_P implementation
   emits only result candidates with ABG deriving evidence from its own
   branded process observation; `worker_executes` lane crossing the ordinary
   path. Accepted via a proper decision record
   (`20260723T...DECISION_fh_accept_t270_fp_authority_checkpoint.md`) quoting
   Jim's direct ruling, pinning implementation + checkpoint commits and both
   gate counts, with explicit non-acceptance boundaries (no S02 closure, no
   live-proof acceptance, no workflow.C bytes). This restores the M0–M4
   decision-record pattern.
2. **Transparent `workflow.C`** (`898f7bd5`): one parent C-call,
   `sub_traversal` evidence, exactly one `child_foldback_admitted` bound to
   the parent C-call ref with causation through the child terminal event;
   omitted-child negative admits no foldback.
3. **Live F_P proven — and re-proven by this review.** `89701306` committed a
   live proof (`abi5-m5-live-fp.json`: model `claude-fable-5`, the real
   `/Users/jim/.local/bin/claude`, 41 events, full actor lifecycle admitted
   as ABG events, replay agreement). I reran `test:m5:live-fp` against the
   real binary: **pass, 8.8s** — an independent second live execution. The
   tracked proof artifact was restored afterward; no worktree side effects.
4. **Graph-algebra family landed**: edges, rule/evaluator declarations,
   native composition, substitution, same-object witnesses, identity law,
   promotion law, F_P/F_D fibre composition, bounded retry, declared gate —
   each with its own checkpoint comment and installed suite.
5. **Fibre substitution** (`3149a9b2`) started the differential proof.

## Prior Findings — All Addressed

- F1 (reporting): fixed — per-suite numbers now bind to named scripts and
  reconcile exactly.
- F2 (undeclared gates): fixed — combined `test:m5` includes worker-transport
  plus granular scripts per slice.
- F3 (live naming): fixed — fixture test renamed "subprocess-backed"; "live"
  reserved for the genuinely live gate, which now exists, is committed
  evidence, and passed under my own rerun.
- F4 (worktree discipline): no anomaly today; all my runs serialized. Keep the
  discipline.
- Carried note (decision records): fixed — the acceptance is a durable
  DECISION comment.

## New Finding

- **N1 (minor, test robustness).** The live gate asserts
  `outcome.result.message === "Hello World"` — an exact-string equality on
  genuinely probabilistic output. It passed on both recorded runs, but it
  will eventually flake on a legitimate contract-valid variant ("Hello,
  World!"). Recommend asserting contract validity plus a bounded property
  (non-empty, subject mentioned) and letting the proof artifact retain the
  exact transcript; the deterministic-equality assertion belongs on the
  subprocess-backed fixture, not the live gate. Low priority; do it before
  the live gate joins any routinely-rerun suite.

## S02 Residual (consistent with the checkpoint's own statement)

21 open conservation rows (each with a typed gap); next bounded relations
graph recursion, then fan-out/fan-in; remaining RC5 semantic-row
dispositions; then S02 closure with its own F_H acceptance (the live proof is
evidence for it but has not itself been accepted — correctly outside the
0b26230c decision's boundary).
