# T-209 Standard-Path Adoption: odd_glc Ships Declarations Only

- id: T-209
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- library_usage: consume
- governing_library: abg/m03 standard F_P pipeline handler family (T-205 B3 handlers; REQ-R-ABG3-HANDLERS-009/-010)
- status: backlog
- goal: hog-iteration-2-standard-path
- change_intent: realize the T-205 acceptance clause that closure was
  narrowed away from — a product on the standard F_P path ships ZERO plugin
  code, and the odd_glc data-mapper runs on the substrate's standard worker
  plugin with its binding reduced to declarations
- change_class: design_reframe
- re_entry_point: design_surface
- triaged_at: 2026-07-09 (re-triaged; original 2026-07-08 was pro forma)
- created_at: 2026-07-08
- updated_at: 2026-07-09 (governance-failure addendum, user ruling)
- dependencies: T-205 (CLOSED — handler law, interpretation seam, internal
  gate, carry-through applicability all earned there; substrate 4.5.0-rc.7)
- links: T-208 (commonization escrow), REQ-R-ABG3-HANDLERS-001/-014,
  REQ-R-ABG3-CCALL-014/-017

## Scope

The successor to T-205's P4 phase, carried out on the 4.5.0-rc.7+ substrate:

1. odd_glc adoption: the generated binding's remaining worker-loop code
   (transport invocation, manifest consumption, response parsing,
   materialization, post-validation execution, evidence archiving,
   evaluator prompting) is replaced by declarations — catalog + selections
   + response contracts + materialization specs + calibration — consumed by
   the substrate's standard F_P pipeline handler. The plugin SEAM remains
   for exotic fibres; the standard path ships no code.
2. Campaign rerun as the proof: the odd_glc data-mapper runs on the
   standard worker plugin; -012 audit green on the result; per-
   configuration cost rows feed the offline tuner boundary (§13.1 holds).
3. Execution-authority audit (ODD 11.5B) on the adopted binding: no
   product-local worker supervision, retry, continuation, event append, or
   closure survives in odd_glc.

## Acceptance

- odd_glc standard-path binding contains declarations only; generated
  worker-loop code deleted, not wrapped (proxy prohibition applies)
- data-mapper campaign run converges on the standard worker plugin with
  -012 green and release-grade classification
- handler obligations O1-O8 hold at the adopted boundary (already law;
  proof rides the run)

## Non-closure

- a thinner generated binding that still implements any standard worker
  loop step downstream
- adoption proven only by harnessed lanes while the product claim cites the
  live campaign


## Intake Triage (2026-07-09, performed)

1. SUBSTANTIVE? Yes — an authoritative truth path is REPLACED: the
   generated binding's worker-loop code (old truth) is demoted for the
   substrate's standard pipeline handler consuming declarations (new
   truth). That is an implementation_migration, not ordinary work —
   category upgraded; migration discipline below is ticket law.
2. UPWARD WALK: requirements EXIST (HANDLERS-001/-014, CCALL-014/-017);
   the substrate design and handlers EXIST (T-205 B3); what is missing
   is the downstream ADOPTION realization => design_reframe at the
   adoption boundary, correct as filed.
3. EXECUTION-DEFAULT CORRECTION (kernel law + typed-F_P-first,
   2026-07-09): the binding's deletion targets SPLIT —
   (a) transport invocation, manifest consumption, response parsing,
   materialization admission, evidence archiving, evaluator prompting
   -> the standard F_P pipeline handler (kernel; declarations select it);
   (b) EXECUTION stages (the plan executor that runs sbt inside the
   plugin) -> TYPED F_P WORKER TURNS as the default (the stage declares
   the worker executes and returns the typed execution result) — NOT
   kernel F_D handlers; those anneal later via T-206 with equivalence
   contracts. The earlier framing ("migrate the executor to kernel
   handlers") is superseded.
4. STALENESS: "substrate 4.5.0-rc.7" references are historical; the
   adoption runs on the current rc line at activation.
5. SPAN: binding generation -> standard handler selection declarations
   -> live campaign proof -> 11.5B execution-authority audit.

## Governance-Failure Triage Addendum (2026-07-09, user ruling)

USER RULING: the framework calling sbt was the constitutional trigger;
that every safeguard supposed to block it failed is itself the finding.
This ticket's scope is therefore not adoption alone: REMOVE the entire
framework-side execution machinery and REPLACE the failed safeguard
pattern with mechanically enforced constitutional framework.

ROOT CAUSE WALK (why the safeguards did not fire):

1. CATEGORY BLIND SPOT. Every boundary law (kernel law, HANDLERS
   product-boundary rule, 11.5B) governs "the product binding" or "the
   handler"; the offending machinery lives in the LIVE TEST HARNESS
   (test/glc-software-build-overlay-live.test.mjs), nominally a proof
   surface. The harness became the de facto worker loop — product
   realization wearing a test file's category — and so sat outside
   every governed category.
2. BYPASS, NOT BREACH. The kernel's mechanical gates (handler census,
   -002 interiors-only, payload admission) gate what ENTERS the
   handler/admission path. The harness never presented its sbt
   execution as a handler or payload at all; the kernel cannot gate
   what never enters the gated path. Prose safeguards without an
   admission chokepoint are advisory.
3. CLOSURE-TIME AUDIT, ADMISSION-TIME DRIFT. The 11.5B
   execution-authority audit is scheduled at ticket exit; the drift
   accreted during campaign mode ("patch and continue") — bugs #11
   (maxBuffer) and #12 (PATH expansion) were each repaired IN PLACE
   inside the framework executor, deepening the unlawful surface,
   because nothing raised the boundary question at patch time.
4. EVIDENCE PROVENANCE UNGATED. Execution evidence assembled by the
   framework is currently admissible closure truth — nothing requires
   execution results to carry ADMITTED WORKER-TURN PROVENANCE. This is
   the deepest gap: even perfect prose cannot hold while the kernel
   accepts the fruit of unlawful execution.

REQUIRED WORK ADDED (the replacement, both halves mandatory):

- (a) REMOVAL: delete (not wrap — proxy prohibition) the harness plan
  executor, runForEvidence, the sbt Test/compile post-materialization
  gate, and all framework-side execution evidence assembly. Execution
  stages become typed F_P worker turns returning typed execution-result
  nodes; the compile gate becomes worker-turn work whose typed result
  F_D checks.
- (b) MECHANICAL ENFORCEMENT (requirement_reprice, HANDLERS/CCALL
  family): (b1) provenance gate — an execution-result payload is
  closure-bearing ONLY when admitted as the typed result of a declared
  worker turn; framework-assembled execution evidence is inadmissible
  by construction. (b2) conformance differential in the standing proof
  surface (runs every suite, not at closure): the product binding and
  its proof harness contain no process-execution capability outside
  the declared worker-turn seam; a binding that spawns is a red test
  TODAY, not an audit finding later.
- 11.5B remains as the closure audit, now auditing what the mechanics
  already enforced continuously.

## Migration Declaration

- old_truth_path: generated binding worker-loop code (transport calls,
  manifest consumption, response parsing, plan execution, archiving,
  evaluator prompting in test/glc-software-build-overlay-live.test.mjs
  template)
- new_truth_path: declarations (catalog + selections + response
  contracts + materialization specs + calibration) consumed by the
  standard F_P pipeline handler; execution stages as typed F_P worker
  turns declared in scenario data
- producers_old: odd_glc binding template
- producers_new: odd_glc declaration surfaces; abg standard handlers
- consumers: live campaign lanes, -012 audit, canary read models
- closure_law: no standard worker-loop step survives downstream (proxy
  prohibition); 11.5B audit proves single execution authority

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
- [ ] single tenant lifecycle (odd_glc typescript); no sibling duplicate
- [ ] ticket wording, product wording, and proof claims are reconciled before closure
## Execution-Authority Core: PROVEN LIVE (2026-07-09)

The governance-failure ruling's required work is REALIZED AND PROVEN:
(a) REMOVAL — the odd_glc framework executes nothing: plan executor
rewritten verify-only, sbt compile gate retired, execution stages are
typed F_P worker turns (run-fix-run); proven by the T-032 citable run —
74/74 subject executions were worker turns, audited independently
(Review D-final claim 5 = the 11.5B execution-authority evidence for
the execution half). (b) MECHANICAL ENFORCEMENT — executionAuthority
contract vocabulary (rc.14+), provenance-scoped evidence ledger
(framework-assembled execution evidence inadmissible), kernel-minted
mutation evidence (rc.15+), standing signature-pinned conformance
differentials in BOTH repos.

REMAINING SCOPE (this ticket stays open): the declarations-only
adoption — the generated binding still owns worker-loop plumbing
(transport invocation, manifest consumption, response parsing,
materialization, evidence archiving, evaluator prompting) that the
substrate's standard F_P pipeline handler family should absorb.
ESCROWED: kernel-witnessed workspace digests (D1.4; worker-reported
restore digests spot-check-verified by the D-final audit but still
self-reported at admission).
