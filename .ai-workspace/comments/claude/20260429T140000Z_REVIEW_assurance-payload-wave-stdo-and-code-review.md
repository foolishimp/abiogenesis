# REVIEW: ABG Assurance + Payload Wave — STDO and Code Review

**Author**: Claude
**Date**: 2026-04-29T14:00:00Z
**Scope**: Active wave T-086, T-090, T-091, T-092-PY, T-092-TS, T-093-TS, T-094, T-095, T-095-TS
**Posture**: Commentary, not law. External-agent review.
**Anchoring**: STDO scope letters S/T/D/O on each finding.
**Method**: All nine tickets read in full. Implementation surfaces verified by parallel code-review passes against:
- TypeScript assurance + gate + payload-ledger code (`code/src/abg/m03/{contracts,runner}/`, `code/src/app/m04/`, `code/src/qualification/m05/`)
- Python assurance code (`code/genesis/assurance.py`, `code/genesis/interpret.py`)
- Two-hop register and payload-ledger live archive `20260429T133349413Z`
- Scenario authority `specification/scenarios/10-total-assurance-projection-uat.md`

## Headline Verdict By Ticket

| Ticket | Status | STDO verdict | Code verdict | Closure recommendation |
|---|---|---|---|---|
| T-086 | active / closure candidate | clean | n/a (design only) | **Close on this review.** No new requirement family needed; envelope is a derived view. |
| T-090 | active / closure candidate | clean with one cross-link gap | n/a (design only) | **Close on this review** subject to S-1 below. |
| T-091 | active / proof plan accepted | clean | proof matrix realized in tenant tests | **Active until tenant proofs accepted.** T-091 cannot close before T-092-PY/T-092-TS/T-093-TS close. |
| T-092-PY | active / closure candidate | clean | clean — 14 tests pass; replay-bypass fix verified | **Close.** |
| T-092-TS | active / closure candidate | clean | clean — all 10 ambiguity statuses, provider-authority guard, deterministic replay | **Close.** |
| T-093-TS | active / closure candidate | clean | clean — gate distinguishes traversal convergence from assurance closure | **Close.** |
| T-094 | active / external review received not closure-ready | one design clarification gap | clean — register is a read model; live archive shows full admitted-event chain | **Active**. One blocker remains and one needs explicit design note (see T-094 §). |
| T-095 | active / external review blockers applied not closure-ready | clean shape; Python triage gap | n/a (upstream design) | **Active.** Upstream cannot close until external STDO accepts payload-ledger design AND Python parity/sufficiency triage exists. |
| T-095-TS | active / external review accepted closure-ready | clean | clean — payload events admit, ledger projects, provider-only closure blocked | **Close** as tenant slice. Does not close T-095. |

## Reading Order As Requested

The operator requested reviews in the order: T-086 → T-090 → T-091 → T-092-PY ∥ T-092-TS → T-093-TS → T-095 → T-095-TS → T-094. I follow that order; the cross-cutting findings are at the end.

---

## T-086 — Generic Traversal Envelope Topology

**Frontmatter**: `change_class: requirement_reprice`, `re_entry_point: requirement`, `governance_scope: STDO Method`, all four S/T/D/O standards declared. Authority refs cite four `specification/PRODUCT.md` clauses, four `specification/INTENT.md` clauses, and eight ABG3 requirements files. Design refs name three sibling docs (derivation / first-slice IACS / structural carrier diagram). Dependencies enumerate B-013, B-014, B-031, T-072, T-084, T-085, T-087, T-089. ✅

### S [SPEC]
- **(positive)** Requirement audit (lines 116–134) is the right STDO move under `requirement_reprice`: it walks each envelope obligation against its ABG requirement file and concludes existing requirements already authorize the envelope. This is the ratification-from-existing-law path SPEC_METHOD prefers over a new requirement family. The audit anchors each obligation to a specific REQ-R-ABG3 file.
- **(positive)** Closure-candidate text correctly demotes the envelope from "controller state" to "derived view over admitted runtime truth" (lines 97–100, 113–114). This avoids the rival-aggregate trap that `non_goal` line 63 forbids.
- **(low)** Closure language at lines 92–95 says "T-086 is a closure candidate pending external agent review" — reasonable. But the related `closure_law` at line 66 says "no implementation claim is made by this ticket" — that's a strong constraint. Confirm the design surfaces (`M03_TRAVERSAL_ENVELOPE_TOPOLOGY_*`) carry the IACS without leaking pseudo-implementation. (Out of scope for this review pass; could be checked alongside T-090 review.)

### T [TICKET]
- **(positive)** `non_closure_conditions` (lines 82–88) are sharp and STDO-correct. They name the antipatterns: closure-by-downstream-test, ABG absorbing SDLC requirement meaning, downstream owning next-vector selection. Each is a real failure mode the wave was at risk of.
- **(positive)** `evaluation_criteria` (lines 67–74) match the audit: requirement audit, design surface, structural diagram, B-013/B-014/T-084/T-087/T-082 reconciliation, generic-edge proof, negative proof, downstream classification.
- **(positive)** Downstream classification clause (lines 161–164): "Downstream odd_sdlc traversal-pressure work should be classified as a temporary local adapter/quality-gate pressure fix until it consumes ABG's generic envelope." This is the correct re-entry on my prior odd_sdlc T-091 review (`/Users/jim/src/apps/odd_sdlc/.ai-workspace/comments/claude/20260427T230000Z_REVIEW_active-tickets-and-assurance-ledger-wave.md` CC-1: integration gap between assurance ledgers and operator traversal). T-086 routes the ratification of that integration gap through ABG.

### D [DESIGN_MODULE]
- **(positive)** Carrier mapping table (lines 137–151) is exemplary Prime decomposition. Each envelope surface is mapped to exactly one ABG carrier with a single role. No duplicate truth surfaces. `EnginePluginContract`, `RuntimeAggregateProjection`, `IterationAdvanceDecision`, `ResultArtifact`, `LeafTaskEnvelope` each own one slot. This satisfies the `non_closure_conditions` requirement that "topology proof ignores existing B-013, B-014, T-084, T-087, or T-082 surfaces" by inversion: explicitly reconciles all of them.

### O [ODD]
- **(positive)** The line "ABG carries and replays the mechanism without absorbing domain HOW" (line 59) is a direct paraphrase of ODD_METHOD §4 boundary law.
- **(positive)** "Domains supply graph functions, domain-specific obligation constructors, evaluator implementations, and acceptance interpretation" matches ODD_METHOD §11 product-vs-substrate split.
- **(positive)** T-082 disposition (lines 153–157): output instance allocation deferred; absence is "explicit ambiguity row or lawful defer state. Absence is not success." This is exactly what total assurance T-090 needs as a downstream guarantee.

### Closure Recommendation
**Close T-086.** The audit-and-mapping shape is the right ratification artifact for `requirement_reprice` over an existing-law envelope. It explicitly does not claim implementation, which is correctly delegated to T-090/T-091/T-092.

---

## T-090 — Total Assurance Carriers And Plugin Seams

**Frontmatter**: `change_class: design_reframe`, `re_entry_point: design`, design refs name three sibling docs, dependencies on T-088/T-089/T-086/B-016, IoC plugin model named as `governing_library`. ✅

### S [SPEC]
- **(positive)** `change_class: design_reframe` is the right choice — the requirement layer was already established by T-088/T-089, and what T-090 contributes is a structural shape over those requirements. Not a `requirement_reprice` (existing requirements suffice per T-086 audit) and not a `realization_refactor` (no implementation claim).
- **(positive)** The Prime Assurance Carriers table (lines 87–98) is constitutional shape, not realization. Each carrier has a one-line role description with no overlap. `AssuranceScopeRef` is explicitly demoted: "not a new product aggregate. It is an assurance-model identity over existing runtime truth" (lines 99–100).

### T [TICKET]
- **(positive)** `core_interface_migration_inventory_required` (lines 45–52) is the IoC migration discipline B-016 governs. Listing old/new producers and consumers, projections, reports, proof surfaces, superseded closure paths, compatibility boundaries, and **negative proof** that superseded paths cannot still close — that's the right inventory shape for an `inside_out_core_interface_migration`.
- **(positive)** `superseded_closure_paths` (lines 114–127) is the load-bearing list: worker-success, transport-success, prompt-self-assessment, `unresolvedReasons: []`, passing tests, archive shape, local-report-all-green, null closure-register state, plugin success claims. Every one of these has been a real bypass mechanism in the wave's history. Demoting all nine to "evidence only, not closure authority" is the correct design move.
- **(low)** **S-1**: T-090 has `closure_candidate_at` set but `T-086` is named as a dependency at `active/awaiting_external_agent_review`. T-090 cannot close before T-086 closes (per its own activation_requires line). The wave-management shape is correct — both can be closure candidates simultaneously, but T-090's closure is gated. State this explicitly in the closure note so the reviewer doesn't over-close.

### D [DESIGN_MODULE]
- **(positive)** Provider Contracts list (lines 102–110): five named providers (`AuthoritySnapshotProvider`, `EvidenceAdapter`, `AmbiguityClassifier`, `ClosurePolicyProvider`, `GainFunctionAdapter`). Each has one role. This is Prime decomposition over the input side of the assurance fold. The note "Providers supply typed data and proposals. ABG admits provider outputs into the projection and owns final row totality, precedence, and closure fold" (lines 111–113) is the correct projection-source coherence law: providers propose, ABG admits, ABG owns the fold.

### O [ODD]
- **(positive)** "Do not let plugins append runtime events, choose next vectors, or close work" (`non_goal` line 42) is a direct application of ODD_METHOD §4 (ABG owns runtime mechanics; products supply meaning) and §7 truth rule 2 (`emit()` is the only lawful write path).

### Closure Recommendation
**Close T-090** subject to S-1 (explicit dependency-on-T-086 acknowledgement in the closure note). Design is constitutionally clean.

---

## T-091 — Total Ambiguity Projection Proof

**Frontmatter**: `change_class: design_reframe`, `re_entry_point: proof`, `proof_plan_status: accepted`, dependencies on T-088/T-089/T-090/T-086. ✅

### S [SPEC]
- **(positive)** `re_entry_point: proof` is the right value. The reframe lives at the proof layer: the requirements (T-089) and design (T-090) are settled; this ticket proves the design enforces the requirement law without bypass paths.
- **(positive)** The 13-criterion `evaluation_criteria` matrix (lines 49–61) names every ambiguity status, mixed-state behavior, plugin negative lane, old-path bypass prevention, and deterministic replay. This is the right level of completeness for a row-totality proof.

### T [TICKET]
- **(positive)** `non_closure_conditions` (lines 71–76) explicitly forbid: success-path-only proof, untyped failure bucket, no stale-input test, nullable register or plugin result as independent closure authority, dependency on odd_sdlc-specific semantics. Each addresses a real STDO failure mode.
- **(positive)** Tenant decoupling clause (lines 70–71): "tenant follow-on proof remains tenant-local". This is the right discipline — T-091 owns the proof matrix; T-092-PY and T-092-TS own tenant-local realization of the matrix. Neither can claim shared closure.
- **(low)** Status remains `active` even though tenant proofs (T-092-PY, T-092-TS, T-093-TS) are now closure candidates per their own bodies. T-091 should remain active until the upstream proof-matrix-completeness review accepts the tenant proofs. The closure-candidate-evidence section (lines 95–122) lists the verifications correctly. No issue with the current status.

### Code review (proof side)
The TS proof at `test_env/tests/test_t092_total_assurance_projection_unit.test.mjs` exercises every status the criteria require. The Python proof at `test_env/tests/test_t092_total_assurance_projection.py` runs 14 parametric cases covering the same matrix; my code-review pass confirmed the projection deterministically distinguishes stale-input from fulfilled (Python `assurance.py:456-473`, TS `assurance.ts:520-540`) and rejects provider output containing closure-authority fields (Python `assurance.py:703-718`, TS `assurance.ts:810-823`).

### Closure Recommendation
**T-091 stays active** until T-092-PY, T-092-TS, T-093-TS close. After those close, T-091 closes by absorption: the proof plan is realized when the tenant proofs hold.

---

## T-092-PY — Python Tenant Implementation

**Frontmatter**: `change_class: realization_refactor`, `re_entry_point: realized_surface`, `build_tenant: python`, `governing_library: M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md`. ✅

### S [SPEC]
- **(positive)** `change_class: realization_refactor` is correct — implementing ratified upstream design in a tenant.
- **(positive)** `non_goal` lines 34–37: "Do not start before T-089/T-090/T-091 authority exists. Do not use Python proof as TypeScript closure. Do not hard-code odd_sdlc semantics into ABG." These are the three traps a tenant ticket must avoid; ticket explicitly forbids each.

### T [TICKET]
- **(positive)** Tenant independence is built into the closure_law: "TypeScript remains independent." This is the right discipline; my prior odd_sdlc reviews caught a similar wave-misclassification where a closed ticket implied other-tenant closure.

### D [DESIGN_MODULE]
- **(positive)** All 10 ambiguity statuses present in `assurance.py`. Per code-review verification:
  - `fulfilled`: lines 554–569
  - `partial`: lines 571–585
  - `missing`: lines 522–535
  - `stale_input`: lines 456–473
  - `authority_missing`: lines 424–437
  - `orphan_evidence`: lines 475–496
  - `contradictory_authority`: lines 439–454
  - `contradictory_evidence`: lines 537–552
  - `deferred`: lines 506–520
  - `event_ledger_invalid`: lines 409–422
- **(positive)** `FORBIDDEN_ASSURANCE_PROVIDER_FIELDS` (lines 161–175): blocks 11 engine-owned fields including `closure_decision`, `runtime_events`, `next_vector_index`, `may_close_traversal`. `admit_assurance_provider_output()` raises `TypeError` if any forbidden field present (lines 703–718). This is the projection-source coherence guard at the API boundary.
- **(positive)** `AssuranceReportReadModel` (lines 153–158): only derived attributes (`projection_ref`, `closure_decision`, `row_statuses`, `row_ids`). No mutable state. Validates projection/decision agree on `projection_ref` (line 693).

### O [ODD]
- **(positive)** Module docstring (lines 8–10) explicitly states "intentionally independent of downstream product semantics". Verified by `grep`: no imports of `odd_sdlc` or downstream-domain semantics anywhere in `assurance.py`. ODD §4 boundary clean.
- **(positive)** Replay-bypass fix in `interpret.py` (lines 140–180, 2069–2085) is verified real: previously, replayed `edge_converged` keys could shortcut spec-hash/workflow-version evaluation; the fix re-evaluates via `resolve_published_fulfillment_ledger()` with current `spec_hash` and `workflow_version`, and `fulfillment_ledger.py:239–244` returns None on mismatch. The bind_fd call sites at `interpret.py:787, 914, 1092, 1253, 2216, 2551` all pass the new params. This closes the "stale input after prior closure" hole at the runtime layer, not just the projection layer.

### Closure Recommendation
**Close T-092-PY.** All 14 tests pass, all 10 statuses covered, all closure_law obligations enforced, no ODD §4 violations, replay-bypass fix verified.

---

## T-092-TS — TypeScript Tenant Implementation

**Frontmatter**: `change_class: realization_refactor`, `re_entry_point: realized_surface`, `build_tenant: typescript`. ✅

### S/T/D/O

Per code-review verification:
- **All 10 ambiguity statuses** declared at `assurance.ts:22-33` and constructed in `deriveAssuranceProjection` at `assurance.ts:466-662`. ✓
- **Stale-input invalidation**: `assurance.ts:520-540` checks prior closure snapshot digest mismatch. ✓
- **Provider authority limits**: `FORBIDDEN_ASSURANCE_PROVIDER_FIELDS` at `assurance.ts:140-152` blocks `runtimeEvents`, `events`, `nextVectorIndex`, `closureKind`, `closureDecision`, `mayCloseTraversal`, `mayEmitRuntimeEvents`, `maySelectNextVector`. `admitAssuranceProviderOutput` at `assurance.ts:810-823` rejects offending fields. ✓
- **Provider plugin contract additions**: `plugins.ts:188-200` `FORBIDDEN_OUTCOME_AUTHORITY_FIELDS` mirror the assurance side. ✓
- **Reports as read models**: `deriveAssuranceReportReadModel` at `assurance.ts:791-808` produces frozen `AssuranceReportReadModel` from projection/decision; `Object.freeze` throughout. ✓

### Code review verdict
Clean. No regressions. No ODD §4 leakage. Carrier shapes match the ratified Python shape in `assurance.py` (verified by independent code-review pass).

### Closure Recommendation
**Close T-092-TS.** Tenant-local proof complete; runner integration deferred correctly to T-093-TS.

---

## T-093-TS — Runner / Release Gate Integration

**Frontmatter**: `change_class: realization_refactor`, depends on T-092-TS being a closure candidate. ✅

### S/T/D/O

Per code-review verification:
- **Convergence-vs-closure distinction**: `engine_runner.ts:249` checks `decision.kind === "converged"` first; `:253-287` only evaluates assurance gate at convergence (terminal). ✓
- **Non-closing assurance row blocks closure**: `assurance_gate.ts:304-308` filters for non-`close` and non-`qualified_defer` decisions; any blocking row triggers `assurance_blocked` kind. `engine_runner.ts:261-276` emits `gap_stop` terminal when `assurance_blocked` and returns without claiming convergence as closure. ✓
- **Close decision permits closure only when fulfilled or deferred**: precedence at `assurance.ts:682-789` walks event_ledger_invalid → contradictory_authority → stale_input → authority_missing → contradictory_evidence → orphan_evidence → partial/missing → deferred → all-fulfilled → fallback. Only `close` (line 777) or `qualified_defer` (line 762) allow progression. ✓
- **Reports/archives as read models**: `deriveAssuranceReportReadModel` at `assurance.ts:791-808`; `engine_runner.ts:204-209` carries assuranceGate in result without mutation. ✓

### STDO concerns
- **(positive)** The clean separation of `converged: true` (graph traversal complete) from `assurance_closed: true` (every row fulfilled or lawfully deferred) is the load-bearing fix the wave was after. It directly answers `non_closure_conditions` line 56 ("runner still treats terminal convergence as assurance closure") and the prior odd_sdlc finding that converged graph traversal was masquerading as RC closure.

### Closure Recommendation
**Close T-093-TS.** Five integration tests pass; full semantic suite (271 tests) passes; gate distinguishes convergence from closure.

---

## T-095 — Event-Sourced Payload Ledger Upstream

**Frontmatter**: `change_class: requirement_reprice`, `re_entry_point: requirement`, `migration_strategy: inside_out_hard_break`. ✅

### S [SPEC]
- **(positive)** `change_class: requirement_reprice` is correct because the migration introduces a new requirement family `REQ-R-ABG3-PAYLOAD` that names the event-sourced payload ledger obligation sharply. The triage decision (lines 119–128) is honest: "Existing event, projection, transport, and assurance requirements point toward event sourcing, but they do not yet name the payload ledger obligation sharply enough to govern implementation and legal tests."
- **(positive)** Migration declaration (lines 138–199) is exemplary inside-out-hard-break inventory: old_truth_path, new_truth_path, retained_compatibility, producers_old (8 file:function pairs), producers_new (6 file paths), consumers_old (8 file:line refs), consumers_new (7 carrier names), derived_surfaces. Each old seam has a new replacement; each retained compatibility is explicitly noted as "non-authoritative".

### T [TICKET]
- **(positive)** `core_interface_migration_inventory_required` (lines 60–67) demands legal tests proving shadow ledger paths cannot close. This is the discipline that prevents the migration from leaving authoritative-old-path residue.
- **(positive)** `required_follow_on_before_closure` (lines 68–72): T-095-TS, T-095-PY parity audit, T-094b register rerun, downstream odd_sdlc adapter. This is the right wave-shape — upstream requirement/design gates tenant implementation.
- **(concern)** **T-1**: T-095 listing "T-094b event-derived two-hop live UAT rerun over admitted ABG payload facts" as required follow-on but the live archive named in T-094 (`20260429T133349413Z`) is the rerun T-095-TS produced. There is no separate T-094b file; the rerun is folded into T-094's archive list. This is consistent with T-094 still being active. Confirm the wave-shape decision: is "T-094b" a separate ticket, or is the rerun folded into T-094? T-095's text says "T-094b" as if separate. T-094's body shows the rerun under T-094's own archive. **Recommendation**: pick one. Either file T-094b explicitly with the rerun as its proof_surface, or amend T-095 to say "T-094 rerun over admitted ABG payload facts" and remove the "T-094b" naming.

### D [DESIGN_MODULE]
- **(positive)** Required Break Order (lines 200–237) sequences seven steps with old-seam-and-negative-proof per step. Each step names what's removed, what's added, and what the negative proof is. This is Prime migration discipline.
- **(positive)** Migration checklist (lines 239–250) is intentionally unchecked — the ticket text says "Unchecked items are intentional. T-095 is active design authority, not a closure claim." This is the right framing.

### O [ODD]
- **(positive)** Triage explicitly forbids GTL becoming a payload-ledger DSL (`non_goal` line 53) and ABG owning domain payload meaning (line 54). The split is clean: ABG owns runtime payload envelope, provenance, digest, binding, closure relevance; products own payload bodies and gain semantics.
- **(positive)** External Review Response (lines 255–268) corrected three real STDO concerns: invalid migration strategy name, blurred ABG/downstream lifecycle and gain projection boundary, downstream odd_sdlc follow-on wording that could violate the ABG-first wave. The revision moved gain reports back to downstream read-model responsibility — that's the correct ODD §4 reading.

### Closure Recommendation
**T-095 stays active.** Two open requirements:
- External STDO review acceptance of the design pack
- Python parity or sufficiency triage exists (T-095-PY filed, or an explicit row-by-row sufficiency note that records why Python doesn't need T-095-TS-equivalent payload events)

These cannot be closed by tenant implementation evidence alone, per `closure_law` line 73.

---

## T-095-TS — TypeScript Payload Ledger Implementation

**Frontmatter**: `change_class: design_reframe`, `migration_strategy: inside_out_hard_break`, `external_review_accepted_closure_ready` per Huygens. ✅

### Code review

Per parallel code-review verification:
- **Payload source events**: `carriers.ts:589-641` declares `PayloadObservedRuntimeEvent`, `PayloadValidatedRuntimeEvent`, `PayloadRejectedRuntimeEvent`. `payload_ledger.ts:46-53` `PayloadLedgerSourceEvent` union covers seven event variants including `AuthoritySnapshotAdmittedRuntimeEvent`, `EvidenceAdmittedRuntimeEvent`, `AmbiguityObservationAdmittedRuntimeEvent`, `ClosureInputPublishedRuntimeEvent`. ✓
- **Replay projection, not stored state**: `payload_ledger.ts:161-226` `derivePayloadLedgerProjection` filters events by scope and kind; returns frozen structure; no mutable cache. ✓
- **Provider output cannot close**: `assurance_gate.ts:180-215` `scopeResultForProvider` shows provider returns snapshot or null; never emits authority. `:221-226` evidence rows only come from ledger when `ledger.hasAuthority` (so providers can't synthesize evidence outside admitted authority). ✓
- **Attached F_P worker rebound**: `attached_fp_worker.ts:151-249` `payloadEventsForAcceptedResult` emits `authority_snapshot_admitted` → `payload_observed` → `payload_validated` → `evidence_admitted` in strict order. Authority first, then payloads, then evidence. ✓
- **Assessed alone cannot satisfy assurance**: `payload_ledger.ts:279-333` `deriveAssuranceEvidenceRowsFromPayloadLedger` requires both observed AND validated payloads with matching digest:
  ```
  const payloadAccepted = observed !== undefined && validated !== undefined;
  ...
  boundToScope = payloadAccepted;
  shallow = !payloadAccepted;
  ```
  This is the correct CQRS implementation. ✓

### STDO verdict
Clean. The tenant slice closes correctly. The Huygens external review accepted: provider-only closure resolved, assessed-replay closure resolved, payload acceptance requires observed-plus-validated with matching digest, rejected/contradictory payload facts cannot satisfy evidence, classification proof coverage adequate.

### Closure Recommendation
**Close T-095-TS as tenant slice.** Does not close upstream T-095.

---

## T-094 — Requirement-Derived Live UAT

**Frontmatter**: `change_class: design_reframe`, `re_entry_point: scenario_proof`, status `external_review_received_not_closure_ready`. The most recent live archive is `20260429T133349413Z` (rerun after T-095-TS rebound the proof through admitted ABG payload facts). ✅

### S [SPEC]
- **(positive)** Scenario authority is requirement-derived: `specification/scenarios/10-total-assurance-projection-uat.md` exists and validates `REQ-R-ABG3-ASSURANCE`, `REQ-R-ABG3-LINEAGE`, `REQ-R-ABG3-PROJECTION`, `REQ-R-ABG3-CONVERGENCE`. UAT cases reference REQ-R-ABG3-ASSURANCE-005, -009, -017, -019, -025 directly. Significant paths are declared (lines 20–40 of the scenario doc): success, shallow worker, stale input, orphan evidence, invalid ledger, plugin boundary, actor-observed worker, subordinate assurance, downstream register. ✓
- **(positive)** `non_closure_conditions` (lines 95–105) cover the live-lane discipline (no skip on Claude unavailable; observer evidence archived; live archive includes stdout/stderr/manifests/event-logs/assurance-projection/closure-decision/failure-class).

### T [TICKET]
- **(positive)** `benchmark_truth` (lines 46–51) is honest: it names test35's specific qualities (71/71 source-visible REQ coverage, 103 main files, 34 test files, 173 passing tests, qualified release, 20-edge closure) and the test57 trade-offs. Treats test35 as comparator, not as authority — consistent with the rejected T-090-equivalent in the odd_sdlc tenant.
- **(positive)** Closure_law explicitly requires that "missing facts are represented as explicit `missing`/`partial`/`authority_missing`/`orphan_evidence` rows rather than hidden gaps". The live archive proves this: hop 2 has zero evidence rows (`hop2-payload-ledger.json` `evidenceRows: []`) which projects a `missing` row, which folds to `retry`, which folds to register `deepen` with `mayConverge: false`.

### D [DESIGN_MODULE]
- **(positive)** `assurance_register.ts` is a genuine read model. `deriveAssuranceLifecycleRegister` is a pure function over hops (themselves read models). No mutations. All `Object.freeze`. The register doesn't store the projection — it stores `rowStatuses` and `rowIds` only (lines 125–131). DESIGN_MODULE projection-source coherence law satisfied.
- **(positive)** Live archive shows the full admitted-event chain: `event_log.json` records `authority_snapshot_admitted` → `payload_observed` → `payload_validated` → `evidence_admitted` for hop 1, and `authority_snapshot_admitted` → `payload_observed` → `payload_validated` (with `evidenceRef: null`) → no evidence for hop 2. This means the register IS projected from admitted ABG payload events, not from harness-local rows.

### O [ODD]
- **(positive)** Register decision kinds (`close`, `deepen`, `block`, `qualified_defer`) are ABG-owned, not borrowed from any product domain. The register doesn't know about release, deployment, or product-specific closure gates — confirmed by `grep` returning no SDLC-specific imports in `assurance_register.ts`.
- **(positive)** Test35 effectiveness is translated through generic predicates per the table at T-094 lines 222–228: each test35 quality (source-visible REQ coverage, large passing test corpus, qualified release, multi-edge traversal, gap pressure, reviewable artifacts) becomes a row predicate over ABG facts. The register doesn't reify test35 shape into the carrier; it expresses what test35-class effectiveness looks like in generic terms.

### Open blockers per external review
- **Blocker 1: live proof was UAT/read-model rather than admitted ABG event-log-derived semantic proof.** **Status: resolved by T-095-TS rerun.** The `20260429T133349413Z` archive's `event_log.json` is the full admitted-event chain. The register projects from `payload_ledger.ts` projections that consume admitted events. No harness-local fact construction.
- **Blocker 2: hop 2 is intentionally prompt-shaped.** **Status: open as design clarification, not as code defect.** Hop 2's prompt at `test_t094_assurance_register_two_hop_live.test.mjs:198` says "You must not infer closure from hop 1. Return a gap observation." This is **intentional UAT design** matching scenario UAT case 002 ("no closure from missing downstream evidence"). The "prompt-shaping" is the experimental setup, not a semantic shortcut. **Recommendation**: amend T-094 closure note to explicitly state that hop 2's gap-observation shape is required experimental design, citing scenario UAT case 002. This is a one-paragraph clarification, not a code change.
- **Blocker 3: Python parity gap.** **Status: open and correctly recorded as gap.** No Python implementation of T-094 exists. T-094 closure_law doesn't strictly require Python parity (it requires "live Claude lane is attempted" and "test35 effectiveness translated"), but the ABG wave-shape implies tenant parity for any cross-tenant claim. **Recommendation**: file T-094-PY as a sibling tenant ticket (matching T-092-PY/T-092-TS pattern), or amend T-094 to declare Python parity explicitly out of scope and record why.

### Closure Recommendation
**T-094 stays active.** Two follow-on actions:
1. Add a one-paragraph clarification in the T-094 body explaining that hop 2's prompt-shape is required experimental design (resolves Blocker 2 by clarification, not code change)
2. Decide on Python parity: either file T-094-PY, or scope it out explicitly with a reason. Without either, the ABG-first wave-shape has an asymmetric tenant claim.

---

## Cross-Cutting Findings

### CC-1 [S,T] (positive): wave shape is constitutionally clean
The dependency chain T-086 (envelope) → T-090 (carriers) → T-091 (proof matrix) → T-092-{PY,TS} (tenant impl) → T-093-TS (runner integration) → T-095 (payload ledger upstream) → T-095-TS (TS payload impl) → T-094 (UAT/live proof) walks the STDO re-entry hierarchy correctly: requirement → design → proof → realization → integration → next-layer requirement reprice → realization → end-to-end UAT. Each ticket cites its predecessors as `dependencies` with explicit status (`active/awaiting_external_agent_review`, `proof plan accepted`, etc.) so reviewers can see the gate state at a glance.

### CC-2 [O] (positive): ABG/odd_sdlc boundary held under pressure
This wave was at risk of absorbing SDLC semantics into ABG. Multiple `non_goal` clauses guard against it (T-086 line 62, T-090 line 41, T-091 line 46, T-094 lines 53–58, T-095 lines 53–57). The implementation honors the boundary: zero imports of `odd_sdlc` in any of the assurance/payload TypeScript or Python source verified by `grep`. ODD §4 boundary clean throughout.

### CC-3 [D] (positive): projection-source coherence preserved
Every projection in the wave is derived, not stored:
- TS `AssuranceProjection` derived in `assurance.ts:466-662`
- TS `PayloadLedgerProjection` derived in `payload_ledger.ts:161-226`
- TS `AssuranceLifecycleRegister` derived in `assurance_register.ts:135-216`
- PY `AssuranceProjection` derived in `assurance.py:394-599`

No backpointers, no mutable caches. DESIGN_MODULE projection-source coherence law satisfied.

### CC-4 [T] (concern): wave is at "many closure candidates simultaneously" risk
Six tickets (T-086, T-090, T-091, T-092-PY, T-092-TS, T-093-TS) are simultaneously closure candidates pending external review. T-091 cannot close until T-092-{PY,TS}/T-093-TS close. T-090 cannot close until T-086 closes. T-095 cannot close until T-095-TS plus Python parity triage and external STDO design acceptance. This is a fan-in pattern where the reviewer must walk the dependency chain in order.

**Recommendation**: when these are reviewed, close in the order T-086 → T-090 → T-092-PY/T-092-TS in parallel → T-093-TS → T-091 (by absorption when its tenant proofs close) → T-095-TS as tenant slice. T-094 and T-095 stay active per their open blockers.

### CC-5 [T] (concern): T-094 has two open follow-ons that block its closure but neither is filed yet
- The hop-2-prompt-shape clarification (Blocker 2) is a one-paragraph T-094 body amendment.
- The Python parity decision (Blocker 3) is either a new T-094-PY ticket or an explicit scope-out amendment.

These can be done in one editing pass on T-094. Once done, T-094 is closure-ready.

### CC-6 [S] (low): T-095 wave-shape ambiguity around T-094b
T-095 names "T-094b event-derived two-hop live UAT rerun over admitted ABG payload facts" as a `required_follow_on_before_closure` (line 71), but the rerun lives under T-094's archive list. Either file T-094b or rename in T-095 to "T-094 rerun over admitted ABG payload facts" without the "b" suffix. Current state risks reviewers looking for a separate T-094b ticket that doesn't exist.

---

## Closing

The wave is in good STDO shape. Six tickets are closure-ready pending external review (T-086, T-090, T-091, T-092-PY, T-092-TS, T-093-TS, T-095-TS). Two stay active for substantive reasons (T-094 needs design-note clarifications; T-095 needs upstream design acceptance plus Python parity triage). All closure_law obligations that require tenant code are realized; all closure_law obligations that require external review or parallel tenant work are honestly held open.

The largest remaining structural risk is wave-coordination, not implementation: when six closure candidates land simultaneously, the dependency-walk has to be careful so that T-091 doesn't close before its tenant proofs and T-090 doesn't close before T-086. The ticket frontmatters carry the dependency state, but the closure-pass needs to honor it.

The smallest set of follow-on actions to convert this from "many closure candidates" to "wave closed":

1. **Close T-086 first** (envelope topology). It has no dependencies on the rest of the wave.
2. **Close T-090** (carriers/seams) noting explicit dependency-on-T-086 in the closure note.
3. **Close T-092-PY and T-092-TS in parallel** (tenant implementations). Each is independent of the other.
4. **Close T-093-TS** (runner integration). Depends on T-092-TS closing.
5. **Close T-091 by absorption** when steps 3–4 are done.
6. **Close T-095-TS as tenant slice**. Does not close T-095 upstream.
7. **Amend T-094 body** with hop-2-prompt-shape clarification and Python-parity decision; **then close** when external reviewer accepts the amended T-094.
8. **Hold T-095 open** until external STDO design review accepts the payload-ledger requirement/design and Python parity/sufficiency triage exists.

Steps 1–6 can land in one review pass; step 7 needs one editing pass on T-094; step 8 needs upstream STDO acceptance plus Python triage which is its own work item.
