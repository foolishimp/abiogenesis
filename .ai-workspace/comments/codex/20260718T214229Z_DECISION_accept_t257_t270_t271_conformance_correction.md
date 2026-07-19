# Decision - Accept T-257/T-270/T-271 Conformance Correction

## Ruling

Accept the corrected design set and resume bounded implementation.

The accepted execution boundary is:

```text
compiler-selected locus
  -> one T-257 wire admission family
  -> transform: ResultArtifact evidence + distinct target_value candidate
     or evaluator: normalized FpEvaluationOutcome candidate + finding evidence
  -> exact T-255/T-256/T-270 target-schema and target-binding admission
  -> one CProgramAtomInvocationSubmission
  -> T-271 admits open -> interior -> evidence -> result -> judgment
  -> replay and AF-16 projection
```

T-271 is the sole C-call enclosure owner. The atom callback owns only its
bounded effect interior. `projectAtomRuntimeEvents` is removed. A successful
transform or evaluator locus requires one exact admitted target carrier; a
blocked outcome carries none.

## Guardrails

Rejected implementation shapes are: `ResultArtifact` treated as target `B`, a
profile alias, a caller-selected target schema, a second callback/event
projection, a second C-call, an SDK-selected F_P branch, raw declaration
selection, `runEngineStartAsync`, a new event/fluent/operation, or serialized
process-local callables.

The defense budget remains proportional to the trusted-desktop product:
malformed external F_P output and exact authority joins fail closed; hostile
in-process tamper machinery is outside this delivery.

## Evidence

- T-257 design digest: `sha256:0a1d4879d2de4e2824e62a5258b4408dc7dd4318c2d97c5a23f45b60010d4acf`
- T-270 design digest: `sha256:4e0efafcc5feb01edf51672c797e752bff8c59f5cd4bf19b756f1f743a0bb8c2`
- T-271 design digest: `sha256:94d816dd05301e865d70a7ab45ebc9b7e6aa752e1df6de0fc0e759d705b69828`
- all three designs contain and render exactly three Mermaid views;
- Prime and `git diff --check` gates pass; and
- independent re-review reported no blocking findings and recommended
  acceptance.

This decision authorizes only the existing T-257, T-270, and T-271 delivery
surfaces. It does not close their repaired runtime proof or the installed steel
thread.
