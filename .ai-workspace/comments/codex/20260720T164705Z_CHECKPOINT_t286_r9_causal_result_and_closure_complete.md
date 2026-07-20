# T-286 R9 Causal Result And Closure Checkpoint

## Claim

`ABI5-ROOT-001` has advanced through `R9`. The exact installed GTL graph now
reaches one declared all-`F_D` locus through HoG, opens one ABG-owned C-call,
admits evidence, result, and judgment on that same spine, admits the declared
terminal transition, and closes the Run through the required causal event
chain.

This checkpoint does not claim `R10`, a public outcome, a CLI result, or M4
closure.

## Exact Implementation

- commit: `79f0e00b02992afe920bb65ac324d8b4f26e222e`
- branch: `codex/t286-abi5-root`
- root binding: `ABI5-ROOT-001`
- admitted artifact digest:
  `sha256:1c8271108d024539ab5f441392daabe24c8045b4dbbfb19a0e2fd884759498f6`

## Positive Path

The installed test dynamically loads the exact packaged implementation named
by `ImplementationResolution`. The implementation returns a candidate value;
it does not write events, judgments, transitions, closure, or public outcomes.

ABG admits this exact C-call sequence:

```text
c_call_opened
  -> c_call_fibre_selected
  -> c_call_evidenced
  -> c_call_result_admitted
  -> c_call_judged
```

The declared `F_D` transition and closure then produce:

```text
fd_advance_ready
  -> terminal_reached
  -> frame_closed
  -> graph_call_closed
  -> run_closed
```

Replay derives `closed` from the admitted ledger. No compiled representation,
controller, implementation event writer, HoG event writer, or fixture-authored
terminal state participates.

## Real Rejection Path

The proportional negative changes the implementation result after evidence is
produced. ABG rejects the result against the declared contract. A copied
rejection carrier cannot complete the call. The authentic rejection is
totalized on the same C-call as:

```text
admission_rejection evidence
  -> typed refusal result
  -> blocked judgment
```

No terminal or closure event is produced.

## Verification

- strict TypeScript build: pass
- root suite through R9: `10/10` pass
- package audit: `0` vulnerabilities
- `git diff --check`: pass
- positive evidence: `test_env/evidence/abi5-root-r9.json`
- rejection evidence: `test_env/evidence/abi5-root-r9-rejection.json`

## Frontier

`R10_replay_and_cli_typed_outcome_agree`

The next admitted work is the stateless public `run.invoke` composition,
replay-only `PublicOutcome` projection, and thin installed `abg.cli`. The CLI
must not author an ExecutionBasis, events, result, or runtime topology.
