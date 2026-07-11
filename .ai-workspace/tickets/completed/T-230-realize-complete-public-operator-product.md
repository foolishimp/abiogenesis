# T-230 - Realize The Complete Public Operator Product

- id: T-230
- title: Realize the complete public operator product
- type: feature
- ticket_category: implementation_migration
- status: superseded
- closed_at: 2026-07-12
- terminal_disposition: superseded_by_demand_driven_reentry
- disposition_authority: F_H course-correction ruling 2026-07-12, carried by T-242
- goal: abg-5-0-full-product-delivery
- phase: DS-3
- priority: high
- change_intent: >-
    Implement the exact public SDK and thin `abg.cli` contract, migrate current
    operations to it, and prove the installed interactive operator loop plus
    native and Codex adapter entry.
- change_class: realization_refactor
- re_entry_point: build_tenants/abiogenesis/typescript/code
- triaged_at: 2026-07-11
- created_at: 2026-07-11
- updated_at: 2026-07-11
- source_ticket: T-229
- build_tenant: typescript
- admission_condition: T-229 is completed and its design is current
- migration_strategy: inside_out_hard_break
- library_usage: consume
- governing_library: existing M03 runtime truth and M04 public-operation modules
- old_truth_path: individually exported operation adapters, incomplete CLI grammar, and private/test-only access to current operations
- new_truth_path: one versioned public SDK operation contract with thin native CLI and Codex projections
- old_producer_set: individually exported M04 command adapters, CLI-local parsers/defaults, and private/test-only operation wrappers
- new_producer_set: M03 admitted runtime truth plus one versioned M04 public operation contract and SDK
- old_consumer_set: incomplete native CLI grammar, direct adapter imports, test harness routes, and host-local projections
- new_consumer_set: native CLI, source-blind installed SDK consumers, and the selected Codex CLI/skill projection
- projection_surfaces: status, result, evidence, replay, gaps, actions, observe, tune, and operator-facing dispositions
- affected_boundary: M04 public SDK and CLI over M03 runtime truth
- dependencies:
  - T-229
- authority_refs:
  - specification/requirements/product/REQ-P-POLICY.md
  - specification/requirements/product/REQ-P-CATALOG.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - .ai-workspace/tickets/backlog/T-229-design-complete-public-operator-contract.md

## Target Truth

Installed consumers can use the public SDK or `abg.cli` for every current
operation and complete the primary interactive loop without source/private
imports or a second controller. Native operation is host-independent. The
Codex CLI/skill projection delegates to the same contract and contains no
copied graph logic or orchestration.

## Required Work

1. Implement the approved SDK carriers and operation mappings.
2. Publish every `abg.operation.*` contract-catalog row with exact native and
   canonical request/result/error/invocation locators, defaults, closed domains,
   actor/mutation class, dispositions, exit classifications, versions, and digests.
3. Implement the exact CLI grammar with typed parsing, output, and errors.
4. Implement public resume, lawful-action reads, and typed F_H actions with
   actor and capability provenance.
5. Complete installed result, replay, assess-result, witness, observe, tune,
   typecheck, catalog, and install-time operations.
6. Add the bounded Codex CLI/skill projection.
7. Remove or internalize superseded public grammar and direct adapters.
8. Prove the installed primary loop through agent-edit and typed-F_H branches.
9. Prove native no-host operation and adapter structural non-sovereignty. For
   the selected Codex comparison, fixed-result lanes compare declared result
   digests; live F_P lanes compare declared schemas and replay-significant
   invariants or consume one identical recorded admitted result.

## Impacted Interface Review Checklist

- [ ] the versioned public operation contract exports every POLICY-021
  operation with exact input, output, default, refusal, exit, actor,
  capability, provenance, and read/write semantics.
- [ ] catalog resolve, verify, install, bind, admit, list, describe, allow, and
  invoke preserve their distinct states; no adapter silently composes or skips one.
- [ ] start and invoke enter M03 admission; resume identifies public run or
  continuation truth and cannot accept caller-built private frontier state.
- [ ] status, result, evidence, replay, gaps, actions, observe, and tune-report
  wrappers are pure projections and do not reconstruct or mutate lifecycle truth.
- [ ] F_H, assess-result, witness, and tuner mutations use the one actor-
  attributed admission boundary and bind the current interaction/basis/capability.
- [ ] typecheck, context-bootstrap, install, gen-config, and release-snapshot
  return their product-boundary manifests/provenance without becoming traversal events.
- [ ] native CLI parsing, allowed flags, defaults, exit codes, and rendering
  consume public SDK schemas and contain no operation-specific runtime authority.
- [ ] package exports, installed command bindings, cold-agent references, and
  source-blind consumers resolve only the public SDK/CLI contract.
- [ ] the Codex CLI/skill projection delegates to public SDK/CLI and has no
  worker, event, traversal, continuation, retry, catalog, or closure implementation.
- [ ] existing direct/private public wrappers are removed or explicitly internal;
  no test can close through them.
- [ ] primary operator-loop, read/write, actor, native, adapter, malformed
  input, missing capability, stale contract, and mixed-path fixtures exercise
  the named public consumers.

## Required Break Order

1. Census every existing operation adapter, export, parser, wrapper, command,
   projection, installed binding, host projection, and proof lane.
2. Publish the one versioned public operation contract and SDK carrier family.
3. Sever CLI-local defaults/contracts and private/test-only public entrypoints;
   preserve explicit structural negatives for each.
4. Rebind deepest M04 runtime mutations and pure reads to M03 admitted truth.
5. Rebind catalog/install and F_H/observer/tuner/conformance operation families.
6. Rebind native CLI parsing/rendering and installed package/command exports.
7. Add the Codex projection only after native closure, then prove structural non-sovereignty.
8. Remove superseded grammar and mixed-state tests; reconcile public docs and proof claims.

## Break-To-Closure Map

| Break | Old seam kept broken | Required negative proof | Closes |
|---|---|---|---|
| SDK publication | adapter-local operation meaning | same operation with conflicting adapter defaults refuses or uses SDK truth | one exact operation contract |
| runtime/read rebind | direct M03/private wrapper access | public consumer cannot mutate through a read or bypass admission | read/write and actor truth |
| catalog/install rebind | implicit bind/admit or source fallback | installed-but-unbound and bound-but-unadmitted remain distinct typed states | source-blind product workflow |
| resume/F_H rebind | caller-local continuation or unbound human act | private cursor and wrong-interaction response refuse | interactive operator loop |
| CLI rebind | CLI-owned orchestration/defaults | removing SDK contract makes CLI fail closed, not execute locally | thin native graph shell |
| Codex projection | copied worker/graph/runtime logic | structural scan and native-with-adapter-broken differential pass | host compatibility without dependence |
| old-path retirement | private/test-only public access | every superseded entry is unreachable from package/install exports | migration completion |

## Migration Declaration

The versioned SDK operation contract becomes the source for all public
operation meaning. Existing commands and adapters migrate as consumers, then
the native CLI and Codex projection bind that same source. Private/test-only
public access and superseded public grammar are removed or explicitly made
internal. Mixed output or lifecycle semantics cannot satisfy closure.

## Migration Checklist

- [ ] old truth path is named explicitly
- [ ] new truth path is named explicitly
- [ ] producer set for the new truth is listed
- [ ] consumer set for the new truth is listed
- [ ] projection/read-model surfaces are listed
- [ ] old truth path is removed or explicitly demoted from authority
- [ ] mixed-state behavior is no longer accepted as closure evidence
- [ ] tests proving mixed old/new behavior are removed or repriced
- [ ] recurring realization patterns are checked against existing library/commonization surfaces
- [ ] ticket declares library usage and names the governing library or rationale
- [ ] this ticket carries only the TypeScript tenant lifecycle
- [ ] ticket wording, product wording, and proof claims are reconciled before closure

## Closure Law

Close when the complete operation census is implemented through one public SDK,
the CLI and Codex projection are behaviorally subordinate, both installed
primary-loop branches converge truthfully, actor/read-write laws pass, and all
existing gates remain green.

## Non-Closure Conditions

- Any current operation remains reachable only through a private/test import.
- CLI and SDK return materially different runtime truth.
- An F_H act is not bound to the pending interaction, actor, and capability.
- The adapter directly invokes workers, emits events, advances traversal, or retries.
- Native operation requires Codex, Claude, or another marketplace host.

## Proof Surface

- per-operation public contract tests
- installed SDK and CLI workflow tests
- start-to-stop-to-action-to-resume agent-edit proof
- typed F_H response/resume proof
- actor attribution and read/write differentials
- native no-host and Codex projection equivalence/structural tests
- fixed-result digest and live schema/replay-invariant Codex comparison
- full deterministic gates and phase-end code review against T-229, T-218, and PRODUCT

## Course-Correction Closure Record (2026-07-12)

- Disposition: superseded_by_demand_driven_reentry
- Authority: F_H ruling 2026-07-12 ("run the course correction ... retire anything
  overblown"), carried by T-242; analysis: rev 3 of
  `.ai-workspace/comments/claude/20260711T151500Z_STRATEGY_5_0_course_correction_glc_over_abg_build_environment.md`.
- Reason: Realizes the complete public operator product designed by T-229.
- Re-entry: Same demand channel as T-229.
- No code, specification, design, or release surface changed by this closure.

### Review Amendment (2026-07-12, codex governance review of 34d7f56)

- Claim/shape boundary: same as T-229 — the PRODUCT operator-product claim
  remains live until T-249 disposes it; this record retires the work shape
  only.
