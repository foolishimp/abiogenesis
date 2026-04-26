# Review: Live Test Run Claim Confirmation

## Scope

This note reviews the session claims that live TypeScript ABG RC gates ran after
T-074 and T-075.

This pass did not rerun the live gates. It reviewed local comments, completed
tickets, test definitions, and archived run artifacts.

## Confirmed Claims

### Live semantic UAT

Claimed command:

```text
CODEX_LIVE_FP=1 npm run test:live:uat
tests 2
pass 2
fail 0
duration_ms 53448.786
```

The claim is recorded in:

- `.ai-workspace/comments/codex/20260426T124225Z_PROOF_live_semantic_generation_uat.md`
- `.ai-workspace/tickets/completed/T-075-add-live-semantic-generation-uat-proof-over-nonce-bound-derived-content.md`

Archive reviewed:

- `build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_rc_live/requirements_to_uat/2026-04-26T124109700Z`

Evidence found:

- `run.json` records `npm run test:live:uat`, `agentKey: codex`, installed
  package root, package tarball, nonce-bound `data_mapper` challenge, and
  `startedAt: 2026-04-26T12:41:10.137Z`.
- `readiness.json` records a successful `codex exec` readiness call returning
  `ABG_TS_READY`.
- `transport.json` records a successful `codex exec` dispatch call using
  `gpt-5.5` through the Codex backend and a non-empty generated result artifact.
- `result_artifact.json` contains synthesized UAT content, not only transport
  acknowledgement.
- `semantic_evaluation.json` records exact requirement coverage for
  `REQ-DM-INGEST`, `REQ-DM-LINEAGE`, and `REQ-DM-REJECT-UNMAPPED`, three
  generated cases, nonce preservation, and the expected live evidence ref.
- `assessment_projection.json` records `assessmentOutcome.kind: accepted`,
  `projection.kind: ready`, `projection.runStatus: assessed`, and emitted
  `assessed` truth.

The test definition confirms this lane only runs when `ABG_TS_LIVE_UAT=1` or
`CODEX_LIVE_FP=1` is present, otherwise it skips.

Verdict: confirmed by archive evidence as a live Codex-backed semantic UAT run.

### Live scenario portfolio

Claimed command:

```text
CODEX_LIVE_FP=1 npm run test:live
tests 1
pass 1
fail 0
duration_ms 153622.118375
```

The claim is recorded in:

- `.ai-workspace/comments/codex/20260426T115447Z_CORRECTION_t074_f_p_reentry_and_b016_overclaim.md`
- `.ai-workspace/tickets/completed/T-074-repair-typescript-fp-assessed-result-reentry-and-plugin-proof-overclaim.md`

Archive reviewed:

- `build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_rc_live_portfolio/2026-04-26T120918850Z`

Evidence found:

- `run.json` records `npm run test:live`, `agentKey: codex`, installed package
  root, package tarball, and `startedAt: 2026-04-26T12:09:19.315Z`.
- `portfolio_report.json` records `runKind: typescript_rc_live_portfolio`,
  `scenarioCount: 5`, `stageCount: 12`, and `outcome.kind: passed`.
- all five scenario families are marked `passed: true` with final run status
  `assessed`.
- stage records show Codex backend/worker bindings and ABG event chains ending
  in accepted assessment.

The test definition confirms this portfolio lane fails closed unless
`ABG_TS_LIVE_PORTFOLIO=1` or `CODEX_LIVE_FP=1` is present.

Verdict: confirmed by archive evidence as a live Codex-backed scenario
portfolio run.

## Boundary

The exact pass counts and durations are present in the ticket/comment transcript,
not in the JSON archives. The archives independently support that the claimed
live runs occurred and reached accepted/passed outcomes.

This confirmation does not replace a fresh rerun for release-cut stamping. It
supports the narrower claim that the session's live-run statements are backed by
local evidence.
