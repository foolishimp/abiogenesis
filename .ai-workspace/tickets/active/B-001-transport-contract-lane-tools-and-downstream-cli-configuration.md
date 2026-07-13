# B-001 Agent Transport Contract: Lane-Parameterized Tools And Downstream CLI Configuration

- id: B-001 (support-line-local series; line: `support/4.6.x`)
- title: claude transport hardwires `--tools ""` against the execution-default law; worker command line is not downstream-configurable
- type: bug
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- library_usage: extend
- governing_library: `shared/abg_library` agent transport contract family (`agent_transport.ts`, `transport_contracts.ts`)
- status: active
- goal: abg-4.6-support
- release_line: `support/4.6.x` (cut from `v4.6.0-rc.3`); release scope: next RC cut `v4.6.0-rc.4`
- governance_scope: STDO Method
- governance_scope_expansion: [S, T, D, O]
- intake_source: corporate downstream consumer bug report 2026-07-13 (bugs #1 and #4; consumer of abg 4.6 + odd_glc 0.1), promoted upstream by Jim's ruling 2026-07-13 ("#4 we need to allow for downstream configuration of command line"); locally verified at source on `support/4.6.x`
- affected_boundary: F_P actor transport seam (m03) — claude stream-json dispatch args, per-agent transport contracts, m03 transport protocol proof lane, release-snapshot semantic gate
- change_intent: make worker transport capability a declared, lane- and install-parameterized binding instead of hardwired argv truth
- change_class: design_reframe
- re_entry_point: design surface (transport-contract design under m03/actor seam; requirement law stays stable)
- triaged_at: 2026-07-13
- created_at: 2026-07-13
- updated_at: 2026-07-13
- links: sibling ticket `odd_glc-0.1-support/.ai-workspace/tickets/active/B-001-software-build-overlay-plan-result-convergence.md`

## Intake Triage (performed)

1. **Substantive?** Yes. Two independent failure classes at one boundary: (a) live claude workers structurally cannot satisfy execution-default-law stages; (b) lawful downstream argv localization is rejected by the 4.6 release-snapshot hard gate.
2. **Boundary:** ABG-owned actor transport seam. Consumer evidence + local source verification agree the defect is upstream ABG, not consumer code.
3. **Upward propagation walk:**
   - Requirement layer: execution-default law exists and is enforced (worker runs declared commands in its own turn; framework does not execute). Install/environment binding law exists in precedent (runtime truth rule 11: "the codex model is account-dependent" → `ABG_TS_CODEX_MODEL`, `ABG_TS_CODEX_SANDBOX`). Requirements are NOT missing.
   - Design layer: **first missing layer.** No design decision reconciles (i) per-lane tool posture (closed-prompt fixture lanes are lawfully tool-less; execution-evidence lanes must have tools) and (ii) bounded downstream argv configuration. The hardwired argv + exact-match assertions are accidental law.
   - ⇒ `design_reframe`, re-enter at transport-contract design, flow to code, tests, release gate expectations.
4. **Affected span:** `code/src/shared/abg_library/agent_transport.ts` (`claudeStreamJsonArgs`, lines ~116–137), `code/src/shared/abg_library/transport_contracts.ts` (per-agent `argsTemplate`s), m03 dispatch/actor seam consumers, `test_env/tests/test_m03_transport_protocol_unit.test.mjs` (+ any deepStrictEqual argv assertions), release-snapshot `test:semantic` gate expectations, install-binding docs.
5. **Release scope:** contained in `support/4.6.x` → `v4.6.0-rc.4`. Propagation of the ratified design to `main` (5.0 line) is a separate follow-up ticket after Jim's ruling.

## Evidence

- **Consumer bug #1:** claude transport ran with `--tools ""` while the prompt body demanded "run node --test yourself". Honest worker admitted "no shell/execution tool was used" → `payload_rejected` ×7, rejectionClass "contradictory" → retry budget exhausted at the execution vector → block. Titled "Live worker cannot execute — fabricates test results": the report-only framing invites narration of *expected* results.
- **Local source verification (2026-07-13, `support/4.6.x`):** `agent_transport.ts` `claudeStreamJsonArgs()` hardwires `"--tools", ""` for every claude stream-json dispatch. Asymmetry: codex contract gets `--full-auto`/`--sandbox` (tools on, env-configurable via `ABG_TS_CODEX_SANDBOX`); claude has no lane or env parameterization at all.
- **Consumer bug #4:** their lawful localization (`--append-system-prompt`) diverges from `test_m03_transport_protocol_unit` "disables tools for closed prompt proofs" asserting pristine `claudeStreamJsonArgs` via `deepStrictEqual`; 4.6's release-snapshot `test:semantic` hard gate turns that latent freeze (since 4.5.1) into a repack blocker (1/1430 fail).
- **Consumer's local fixes (reference designs, not authority):** lane-parameterized claude transport (`toolEnabled` flag; fixture lane keeps `--tools ""`, execution lane drops it + "run those exact commands yourself, report OBSERVED results" prompt; odd_glc signals via `stageSpec.workerExecutes`); tolerant m03 assertion (invariants: required flags present, tools-disabled in fixture lane, prompt not leaked; extra params permitted) + companion test that the execution lane keeps tools.

## Target Truth

- target_truth: one declared transport-contract carrier per agent with (a) per-lane capability posture (`closed_prompt_proof` = tool-less; `worker_executes` = tools enabled) selected by the dispatching stage's declared contract, and (b) a bounded, declared downstream argv-extension binding (install/environment-level, per runtime truth rule 11 precedent) that the release gate and protocol tests accept by invariant, not by exact argv equality.
- superseded_truth: hardwired `claudeStreamJsonArgs` argv; exact-match (deepStrictEqual) argv assertions as authoritative protocol proof.

## Migration Declaration

- old_truth_path: hardwired per-agent argv builders + exact-argv protocol assertions
- new_truth_path: declared lane+install-parameterized transport contract carrier
- producers: `agent_transport.ts`, `transport_contracts.ts`
- consumers: m03 actor dispatch, fp-dispatch/fp-evaluator live plugins, protocol unit lanes, live actor lanes (t113), release-snapshot semantic gate
- derived_surfaces: transport transcripts/transport.json archives, release-snapshot gate verdicts
- closure_law: see Closure below; mixed old/new (hardwired path still authoritative anywhere) is non-closure

## Migration Checklist

- [ ] old truth path named explicitly (hardwired argv + exact-match assertions)
- [ ] new truth path named explicitly (lane+install-parameterized contract carrier)
- [ ] producer set listed; consumer set listed; projection/proof surfaces listed
- [ ] old path removed or explicitly demoted (no silent fallback to hardwired argv)
- [ ] mixed-state proof not accepted as closure
- [ ] exact-argv tests removed/repriced under this ticket's authority (test-case authority rule)
- [ ] library extension lands in `shared/abg_library` (no boundary-local rebuild)
- [ ] single-tenant: typescript tenant only on this line; no sibling suffix needed
- [ ] ticket/product/proof wording reconciled before closure

## Closure

- closure_law: closes only when (1) a claude execution-lane dispatch can produce worker-executed observed evidence live; (2) a closed-prompt fixture dispatch remains provably tool-less (negative proof: tool use in fixture lane is rejected); (3) a downstream argv localization equivalent to `--append-system-prompt` passes the m03 protocol lane and the release-snapshot semantic gate unmodified; (4) protocol tests assert declared invariants (required flags, lane tool posture, prompt containment) and no authoritative exact-argv assertion remains.
- evaluation_criteria: m03 unit lane green with invariant-form assertions + companion execution-lane-keeps-tools case; live claude actor lane (t113 family) green with tools in execution lane; release-snapshot gate green on a localized-argv fixture.
- proof_surface: `test_env/tests/test_m03_transport_protocol_unit.test.mjs` (repriced), new negative fixture-lane case, `test_env/live/test_t113_live_pty_claude_actor_worker.test.mjs`, release-snapshot semantic gate run.
- non_closure_conditions: exact-argv deepStrictEqual anywhere authoritative; claude execution lane still tool-less; configurability landed as undeclared env sprawl instead of a declared binding surface; fixture lane loses its tool-less guarantee; consumer localization case still blocked at the gate.

## Execution Findings (2026-07-13, during fix)

- Implemented: `TransportCapabilityLane` on `claudeStreamJsonArgs` (default `closed_prompt_proof` preserves all existing callers; `worker_executes` drops the execution-gating flags); `admitTransportAppendArgs` + `TRANSPORT_PROTOCOL_OWNED_FLAGS` + `withTransportAppendArgs` in `transport_contracts.ts`; all four agent contracts wired through `ABG_TS_<AGENT>_APPEND_ARGS`.
- Live-proof discovery: `--safe-mode` forces tool approval even under `bypassPermissions` (worker honestly reported "required approval and was not permitted"), so it is execution-gating and lane-owned exactly like `--tools` — both now ride only the closed-prompt lane, and both are protocol-owned (append cannot reintroduce them).
- Gates: m03 transport lane 18/18 (invariant-form + worker-executes + bounded-append + env-binding cases); `lint:semantic` green; full `test:semantic` 1433/1433.
- Live lane proof: library-built `claudeStreamJsonArgs(lane: "worker_executes")` dispatched a real claude worker that executed the declared command in its turn (`tool_use` observed, `OBSERVED=42`). The closed-prompt default remains tool-less by test invariant.
- Scope extension by F_H ruling (2026-07-13, "have a flag to disable it — in corporate world everything already runs in multiple layers of secured sandboxes in the cloud"): `ABG_TS_WORKER_SANDBOX=external` declares that sandboxing is provided by the environment; agent transports drop their own confinement (codex: `--sandbox danger-full-access` replaces `--full-auto`). Agent-specific bindings take precedence; unknown values fail closed; proof-law postures (closed-prompt tool-less lane) unaffected. Commit `db4c4cba`; gates 1434/1434 + lint green. Discovered during the odd_glc B-001 closure ladder (rust-service socket denial, BUG #6 class).
- **Downstream RCA reopening (2026-07-14).** The corporate consumer, running all six hello worlds with claude workers, proved the rc.4 lane was plumbed but unconnected: `claudeStreamJsonArgs` accepted `{lane}` while `runAgentTransport` never passed it (`AgentTransportRequest` had no field), so every stream-json claude dispatch stayed tool-less at worker-executes stages; honest workers disclosed the defect and burned retry budgets. **Verification-gap confession**: rc.4's "live worker-executes proof" called `claudeStreamJsonArgs` directly, bypassing `runAgentTransport` — it proved the args function, not the dispatch path; and the 6/6 odd_glc witness ran codex, whose tooled template masks the lane entirely. Fix `2acd0271`: (a) `AgentTransportRequest.lane` composed at one exported seam (`composeAgentTransportArgs`) used by the real dispatch path, with the m03 proof now at that seam; (b) **second seam the RCA had not reached**: `classifyFailure` treated any tool use as `contract_failure` — closed-prompt law hardwired into result classification — so even correct argv would fail-close every honest executing worker; the classifier is now lane-scoped (closed-prompt negatives preserved). Live proof v3 through `runAgentTransport` itself: gating flags absent from dispatched argv, `toolCalls: 1`, observed output returned, `failureClass: null`. Gates: lint green, 1435/1435. Closure clause (1) is only now honestly satisfied.
- Remaining before closure claim: Jim's ruling on the residual (below) and release-scope decision (rc.5 cut timing — rc.4 is tagged immutable and carries the unconnected lane).

## Notes

- Consumer bugs #3 (their monorepo .gitignore swallowing repacked tarballs) and the remainder of #4 were fixed downstream; no upstream action beyond this ticket.
- Coordination: odd_glc `substrate.provenance.json` pins abg `4.6.0-rc.3` exactly (tarball sha). If this ticket lands in `v4.6.0-rc.4`, the odd_glc 0.1 support line must reprice its compatibility pin in its own ticket.
