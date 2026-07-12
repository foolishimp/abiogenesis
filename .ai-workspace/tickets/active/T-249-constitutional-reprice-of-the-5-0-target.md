# T-249 - Constitutional Reprice Of 5.0 To The Stable Baseline

- id: T-249
- title: Constitutional reprice of 5.0 to the stable baseline before dogfood
- type: reprice
- ticket_category: constitutional_reprice
- status: active
- goal: GOAL-035 (candidate constitutional reprice present; F_H ratification
  pending)
- owner: abiogenesis
- priority: critical
- governance_scope: SPEC_METHOD, ODD_METHOD
- change_class: intent_reprice
- re_entry_point: specification/INTENT.md
- created_at: 2026-07-12
- updated_at: 2026-07-13 (stable-first drafting brief)
- source_ticket: T-242
- admission_condition: >-
    T-242 records the stable-first superseding decision and T-244 carries the
    exact full-product register candidate. Candidate constitutional propagation
    may be authored while T-244 remains active; both tickets require F_H
    confirmation before closure.
- dependencies:
  - T-242 Stable-First Superseding Decision Record
  - active T-244 exact 5.0 feature-register candidate; completed before T-249 closure
  - completed T-243 rc.3 predecessor-evidence disposition (context only, not a build dependency)

## Intake Triage

1. Substantive: yes. The committed INTENT, PRODUCT, GOALS, requirements, and
   scenarios at intake required a two-stage C1/C2 bootstrap and a released-GLC
   campaign before the 5.0 final tap. F_H instead ruled that 5.0 is the stable
   baseline before dogfooding begins; the candidate propagation is now present
   in the working tree.
2. Direction changes while the product goal remains: deliver the complete,
   source-independent, specification-method-compliant ABIogenesis 5.0 product.
   The first affected layer is INTENT, so `intent_reprice` is the single
   governing change class.
3. The stable 5.0 source project is authored and realized directly under STDO,
   accepted three-view designs, GTL admission, and semantic compilation. It is
   not required to be built by installed 4.6, installed 5.0, or odd_glc.
4. Installed released 5.0 plus independently released odd_glc 1.0 becomes the
   development product for the successor 5.0.1 dogfood wave. That future proof
   is not a 5.0 release claim.
5. Only self-use evidence moves. Constitutional requirements continue to govern
   runtime, operator workflow, Consensus, self-conformance, qualification,
   compatibility, and release functionality; T-244 traces their exact closure
   state.

## Stable-Baseline Constitutional Truth

The reprice shall establish all of the following without inventing a parallel
feature list:

- ABIogenesis 5.0 is the feature-complete stable baseline for one trusted
  developer desktop.
- GOALS, INTENT, PRODUCT, and requirements own constitutional scope; T-244 is
  the sole exact derived feature and release-gate traceability register.
- The mutable source project is distinct from every installed or released
  product used for testing or downstream compatibility.
- The 5.0 release proves source independence, public-contract completeness,
  malformed-input handling, the full operator workflow, Consensus,
  specification-method compliance, qualification, and exact immutable release
  identity.
- 5.0 publishes the installed product contracts needed for downstream products
  and for a future successor build, but it does not claim operational self-use
  until the 5.0.1 wave executes that path.
- T-248 owns the direct 5.0 RC/final path. T-245/T-246, odd_glc 1.0, a
  data-mapper campaign, and released-pair evidence do not gate 5.0.
- Exact `4.6.0-rc.3` remains predecessor evidence only per T-243.

## Exact Affected Span

Every named surface receives an explicit edit or recorded no-change. The list
is a minimum; the closure census catches additional active references.

1. `specification/INTENT.md`
   - retain current item 12's no-exemption self-conformance direction;
   - replace the at-intake item 12 two-stage fixed point with current item 13's
     stable-baseline readiness and explicit 5.0.1 dogfood timing;
   - narrow the Review/Consensus exclusion to admit bounded
     `A5-CONSENSUS-01` while continuing to exclude scheduler, automatic wake,
     ticket mutation, and unrelated Review/homeostatic products; and
   - align success criteria so no 5.0 criterion requires C1/C2, GLC 1.0, a
     campaign, or released-pair proof.
2. `specification/PRODUCT.md`
   - replace `ABG Self-Hosting Fixed Point` and every P4/I4/B5/S5/C1/C2/R5
     release claim with the stable-baseline/successor-dogfood boundary;
   - retain full operator, GraphFunction, F_P, self-conformance,
     observer/tuner, atom, trusted-desktop, and exact-release law;
   - admit the bounded ABG SYSTEM-owned Consensus free construction; and
   - remove C1/C2, G5-campaign, and released-pair evidence from the 5.0 release
     identity without weakening source independence or downstream catalog law.
3. `specification/GOALS.md`
   - rewrite GOAL-035 from the retired DS/T-224..T-241 ladder to the T-244
     retained register, T-247 compliance gate, and T-248 direct release;
   - name T-245/T-246 only as post-5.0 5.0.1 successors, never as goal gates;
   - retain the trusted-desktop proportionality and phase self-review laws; and
   - make the exact accepted diagrams and compiler gap census the design/entry
     gate for product-code changes.
4. `specification/requirements/abg/REQ-R-ABG3-SELFHOSTING.md`
   - retain or relocate clauses 001-003 as ordinary derived-artifact governance;
   - remove clauses 004-013 from active 5.0 fixed-point and release truth; and
   - do not replace them with an unexecuted 5.0 self-host claim. Future
     successor-build proof re-enters with the 5.0.1 goal.
5. `specification/requirements/product/REQ-P-INSTALL.md`
   - retain exact 5.0 public-contract installation and source-independence law;
   - remove the exact-I4/B5 self-host exception and any active bootstrap role
     for 4.6.
6. `specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md`
   - remove the P4/I4 exception and mandatory
     `abg.capability.qualification.self-host@5` identity;
   - retain the mandatory self-conformance, install, catalog, runtime,
     operator, schema, vocabulary, corpus, and capability contracts; and
   - record no new Consensus operation identity: the feature uses the existing
     workspace, `catalog.invoke`, result, and replay public operations.
7. `specification/requirements/product/REQ-P-SELF-CONFORMANCE.md`
   - retain the no-exemption claim and align `builder` wording to the exact
     source/candidate constitutional and release surfaces without implying a
     self-build run.
8. `specification/requirements/product/REQ-P-QUAL.md`
   - retain executable-change witnessing, packed/live proof, release-grade
     bypass refusal, self-conformance, observer/tuner, source independence, and
     one bounded exact-cut read model;
   - change the T-239 gap owner to T-247 and remove the `before R5 freeze`
     condition in favor of the T-248 candidate gate;
   - remove or reprice the self-host, exact G5 campaign, released-pair, and
     two-rung release clauses, including 060A/061/062/064 and 067-069 where
     their current wording carries those claims; and
   - retain ordinary RC/final delta law for the direct 5.0 release.
9. `specification/requirements/product/REQ-P-SCENARIOS.md`
   - replace `ABG5-S05` through `ABG5-S08` where they require self-host,
     odd_glc campaign, or released-pair closure;
   - add the bounded Consensus scenario and preserve Hello World, declared C,
     full operator, self-conformance, native/Codex, and exact-release scenarios;
   - make the scenario catalog match T-244 exactly.
10. `specification/scenarios/08-derived-artifact-governance.md` and
    `specification/scenarios/TESTCASE_AUTHORITY.md`
    - retain ordinary derived-artifact governance proof while removing the
      claim that the scenario proves the discarded 5.0 fixed point.
11. T-241 propagation surfaces
    - keep completed T-241 as historical evidence;
    - reprice its active INSTALL/PUBLIC-CONTRACTS/SELFHOSTING text through the
      requirement edits above rather than preserving a dead bootstrap exception.
12. Python-carrier reconciliation
    - `TENANT_REGISTRY.md`, remaining constitutional `Python paused` language,
      and obsolete carrier direction become `withdrawn`, consistent with the
      existing TypeScript product line.
13. Consensus admission
    - admit the exact subject/panel/round/result, workspace binding,
      ticket-bound read projection, ownership, malformed-F_P, escalation, and
      packed qualification contracts required by T-244;
    - generic standalone Review, scheduler, automatic wake, and direct ticket
      mutation remain excluded.
14. B-010 alignment
    - record the 5.0 source line as manually governed under STDO and accepted
      design gates; full installed-product governance induction re-enters in
      the 5.0.1 dogfood era.

## Retained T-247 Claims

F_H's stable-first ruling decides these claims, so they do not remain an open
retain/narrow/remove queue:

| Claim | 5.0 disposition | Owner |
|---|---|---|
| Exact self-conformance without product exemption | retained | T-247 |
| General executable-change witnessing | retained | T-247 |
| Packed/live proof and release-grade bypass refusal | retained | T-247 |
| Bounded self-certifying release snapshot/read model | retained | T-247, consumed by T-248 |

Campaign observation or future dogfood cannot substitute for these gates.

## Consensus Admission Boundary

`A5-CONSENSUS-01` is a mandatory 5.0 feature by direct F_H ruling. ABIogenesis
owns the reusable ABG SYSTEM GraphFunction. Catalog products and hosts may
contribute reviewer profiles, bindings, policies, and overlays only.

The feature uses one public workspace contract across an existing bound root,
another explicitly selected root, and a caller-created temporary root. It
returns typed consensus/dissent, attributed findings, governed round outcome,
lineage, result, replay, and a triage-ready next action. It never owns ticket
status, invokes automatic triage, schedules itself, or mutates a ticket.

Implementation begins only after an executable GTL graph body passes GTL
admission and the ABG semantic compiler. Compiler gaps re-enter design/algebra;
they never authorize an imperative plugin, orchestration loop, prompt shell,
or private closure classifier.

## One Change-Class Propagation Law

The edits above are consistency propagation from this one F_H-directed
`intent_reprice`. They do not require one ticket per downstream layer. A new
independent capability or policy not entailed by stable-first or the already
ruled Consensus feature still requires separate intake and its own smallest
change class.

## Candidate Execution Record - 2026-07-13

The stable-first candidate propagation is present for review:

| Surface | Candidate disposition |
|---|---|
| `specification/GOALS.md` | Replaced the fixed-point/campaign ladder with DS-0 through DS-7 stable-first delivery, retained the full product, and moved operational dogfood to 5.0.1. |
| `specification/INTENT.md` | Admitted bounded Consensus, retained the complete operator and self-conformance intent, replaced self-hosting with stable-first/post-release successor use, and preserved exclusions. |
| `specification/PRODUCT.md` | Replaced the self-host fixed point with stable-baseline and exact successor-composition law; retained runtime, operator, Consensus, conformance, observer/tuner, compatibility, and release truth. |
| `REQ-R-ABG3-SELFHOSTING` | Retained derived-artifact clauses 001-003 and repriced 004-013 to stable 5.0 plus post-release 5.0/odd_glc 1.0 successor use. |
| `REQ-P-INSTALL`, `REQ-P-PUBLIC-CONTRACTS` | Removed bootstrap exceptions and the obsolete self-host capability; retained the exact 36-operation roster and 16 mandatory capability identities, with Consensus using existing invoke/read operations. |
| `REQ-P-SELF-CONFORMANCE`, `REQ-P-QUAL`, `REQ-P-SCENARIOS` | Retained exact-candidate product self-conformance, complete qualification, direct release, operator, Consensus, native/Codex, and packed scenarios without builder/self-host implication. |
| `REQ-P-CONSENSUS`, `REQ-P-CATALOG`, product requirement index | Added the SYSTEM-owned executable-GTL Consensus contract, ownership boundary, schemas, bounded recursion/F_H outcomes, workspace applications, and packed qualification gate. |
| ABG residual requirement families | Rebound superseded T-227/T-230/T-239 owner pointers to T-244 routing, T-247 qualification, and singular realization leaves without changing the underlying product claims. |
| `specification/scenarios/08-derived-artifact-governance.md` | Reworded the expected outcome from self-hosting artifacts to derived artifacts. |
| `specification/scenarios/TESTCASE_AUTHORITY.md` | `no_change`: its existing row already describes ordinary derived-artifact event, replay, and drift-detection proof and carries no fixed-point claim. |
| `build_tenants/TENANT_REGISTRY.md`, `specification/requirements/README.md` | Reconciled the Python tenant from paused to withdrawn historical reference. |
| `B-010` | Deferred installed-product governance induction to the post-5.0 5.0.1 dogfood wave. |

Candidate self-review evidence:

- T-220 semantic/compiler gate: `35/35` passed;
- T-223 packed public-product gate: `70/70` passed;
- public operation roster: exactly `36`; mandatory capability identities:
  exactly `16`; duplicate requirement identities: `0`;
- changed-document link census: `71`, missing: `0`; and
- no active constitutional 5.0 gate requires C1/C2, P4/I4/B5/S5/R5, odd_glc
  1.0, T-245/T-246, a data-mapper campaign, released-pair evidence, or the
  obsolete self-host capability.

Two standing gates remain red outside this candidate's edited implementation
span and are already bound by T-242 amendment A1: T-193/T-195 reports the
pre-existing 4.6 bootstrap/release-note version against `5.0.0-dev.0`, and
`lint:test-harness` reports ten pre-existing unused-variable errors. They require
a bounded fix or lawful reprice before release evidence; neither weakens or
expands this constitutional reprice. Product code remains paused while the F_H
confirmation gate below is open.

## Closure Condition

1. Every surface in the affected span has an explicit edit or recorded
   no-change disposition.
2. Mechanical census finds no active 5.0 gate requiring P4/I4/B5/S5/C1/C2/R5,
   T-245/T-246, odd_glc 1.0, a data-mapper campaign, released-pair evidence, or
   `abg.capability.qualification.self-host@5`.
3. The full T-244 feature set, Consensus, T-247 claims, and T-248 direct release
   remain positively grounded; nothing except operational dogfood/self-use
   evidence moved to 5.0.1.
4. GOALS, INTENT, PRODUCT, requirements, scenarios, tickets, and the accepted
   design register describe one stable-first product and dependency order.
5. F_H confirms the T-244 register and ratifies the resulting load-bearing
   constitutional diff. No product-code implementation begins while this
   consistency gate is open.
