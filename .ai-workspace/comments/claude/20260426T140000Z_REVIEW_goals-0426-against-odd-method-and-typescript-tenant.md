# REVIEW: goals_0426 Against ODD_METHOD and the TypeScript Tenant

**Author**: Claude
**Date**: 2026-04-26T14:00:00Z
**Addresses**: `.ai-workspace/comments/jim/goals_0426`; `specification_methodology/specification/standards/ODD_METHOD.md` (2026-04-26 amendment); current `build_tenants/abiogenesis/typescript/` carrier surface
**Status**: Draft

## Summary

This review evaluates the five-item user-authored goal set in `goals_0426`
against `ODD_METHOD.md` and the current TypeScript tenant carrier. The goals
are well-aligned with the constitutional method — each item traces to a
specific clause — but the carrier as it stands is in a recurring §16 failure
pattern #10 (operative behavior implemented imperatively with GTL types
declared but not made the carrier). The smallest method-aligned move that
closes the largest gap is to realize the named SDLC loop functions
(`Triage`, `Process_Ticket`, `Consensus`) as published graph functions and
to operationalize `RefinementBoundary` in M03 transport. Both moves are
required by ODD method as currently written; both are absent from the
current code.

This post describes both current reality and target direction. Findings are
separated from recommended action.

## Method Anchors Used

This review reads against `ODD_METHOD.md` (amended 2026-04-26) — in
particular:

- §11.1 typed assets explicit
- §11.2 graph functions as primary constructive carrier
- §11.2A outcome-first realization order
- §11.3 published function catalog
- §11.5 current state as projection over constructive history
- §11.5A ABG owns continuation and re-entry
- §11.7 manual walkthrough must remain lawful
- §11.9 global convergence stable under zoom
- §12 scenario rule
- §14 dogfooding rule
- §16 failure pattern (in particular #1 and #10)
- §19 ramp-up checklist

## Goal-By-Goal Analysis

### Goal 1 — ABG Traversal as Forensic Probe

**Anchors**: §11.1, §11.2, §11.5.

**Current state.** `TraversalStructureProbe` is realized at
`code/src/abg/m03/contracts/traversal_structure_probe.ts:60–89` with a real
classification surface — `structureKind` (terminal,
`undefined_structural_morphism`, `typed_structural_morphism`,
`defined_constructive_morphism`), declared operator/evaluator regimes,
allowed/not-allowed claims, and a `sourceProjectionRef` for replay.
`RuntimeAggregateProjection` and `deriveRuntimeAggregateProjection()`
(`code/src/abg/m03/iteration.ts:18`) realize replay-derived projection.

**Gap.** The probe is an internal utility, not a published graph function.
Per §11.2, every operative constructive step must be carried by one named
`GraphFunction` or one lawful composition. Traversal forensics is operative
behavior in §14 dogfooding terms (the framework should walk itself), so it
should be carried by a published graph function rather than vended by
internal helpers.

**Carrier kind.** Imperative TypeScript over declared M03 types.

### Goal 2 — Gap → Triage; Start → Traverse / Process_Ticket / Consensus; Evaluate → Yield, Close, Stop; Iterate; Triage → Ticket / TBD

**Anchors**: §11.2, §11.2A, §11.5A, §16 failure #1.

**Current state — algebra realized.** `IterationAdvanceDecision`
(`code/src/abg/m03/contracts/carriers.ts:21–29`) carries the full terminal
vocabulary the goal names: `converged`, `nothing_to_do`, `gap_stop`,
`yielded`, `dispatch_required`, `human_gate_required`, `traversal_applied`.
This is Evaluate → (Yield, Close, Stop) at the algebra level. `publicStart`
(`code/src/app/m04/public_start.ts:147`) and `publicControlLoop`
(`code/src/app/m04/control/control_loop.ts`) carry Start and Iterate.
`publicGaps` carries Gap.

**Gap — named SDLC loop closers absent.** `Triage`, `Process_Ticket`, and
`Consensus`, which `goals_0426` line 10 explicitly tags as "SDLC functions
that close the ABG loop", **do not exist** as typed nodes, vectors, or
published graph functions in the TS tenant. They appear in M05 design docs
(`sdlc_bootstrap_lineage` derivation surfaces) but have no realization. Per
§16 failure #1 ("a claimed product step has no corresponding node or
vector"), this is a method violation in the form currently named.

**Gap — §11.5A audit overdue.** `publicControlLoop` re-enters `publicStart`
based on local progress checks. Whether that is the lawful imperative
adapter under §11.2A clause 3, or product-local control flow replacing ABG
continuation under §11.5A, hinges on whether each iteration genuinely
re-derives the next step from ABG-owned step selection or whether the
controller is making continuation choices. The answer needs to be stated
explicitly in design before more orchestration accretes around it.

**Carrier kind.** Algebra is declared; control is imperative. The named
SDLC closers have no carrier at all.

### Goal 3 — Templated Scenarios: Extraction, Synthesis, Transformation, Generalized Fan, Gap Evaluation

**Anchors**: §11.2, §12, GTL algebra (`fan_out`, `fan_in`).

**Current state.** Scenarios in M05 are *static reference obligations*
(`M05ReferenceLiveScenarioObligation`,
`InstalledLiveScenarioPortfolioOutcome` at
`code/src/qualification/m05/live_portfolio.ts`). There is no extraction
primitive (regex → list), no synthesis primitive (inference rules → list),
no transformation primitive (transform rules → list), and no generalized
"for every item in A →T→ list in A_t" combinator at the carrier level.

**Gap.** The four scenario shapes the goal names are a *scenario combinator
algebra* and are natural higher-order graph functions in the §11.2 sense.
They are also a clean cross-product surface — they would apply across
`odd_sdlc`, `odd_world_model`, and future `odd_*` packages without
domain-specific repetition. Currently this generalization is not carried.

**Carrier kind.** Imperative TS qualification logic; no graph-level
combinators.

### Goal 4 — Idempotent Instantiated Typed Nodes (Graph Template vs Project Instance)

**Anchors**: §10, §11.1, §11.5.

**Current state.** The template/instance distinction is *latent*.
`GraphFunction.template: TemplateRef` and `materializeGraphFunction()` exist
at `code/src/gtl/m01/contracts/carriers.ts:163–195`. Instance identity is
carried implicitly by `ExecutionBasis(runId × graphCallId × frameId ×
workKey)` at `code/src/abg/m03/contracts/carriers.ts:46–70`. There is **no
published `GraphInstance` (or `ProjectInstance`) type** at the surface, and
no executable proof that the same graph function run over different
instances produces cleanly distinct lineages.

**Gap.** The goal's framing — "a project is an instance of that graph" —
is faithful to GTL §3.1 (Graph as the one first-class structural type) and
ODD §10 (target project owns domain outputs). The runtime half-encodes the
distinction; promoting it to a published typed asset gives every other
goal a real noun to point at:

- the zoom-out gap-analysis flow (goal 4.3) gains a comparable subject
- reentrancy gains a typed witness
- §11.5 projections can cite the instance explicitly

**Carrier kind.** Latent in `ExecutionBasis` construction; no published
asset surface.

### Goal 5 — Zoom In / Zoom Out / Fold

**Anchors**: §11.9, §14, §16 failure #10.

**Current state — refinement.** `RefinementBoundary` and `CandidateFamily`
are declared in `code/src/gtl/m02/contracts/carriers.ts` and constructed in
`code/src/gtl/m02/contracts/constructors.ts`. They are **not exercised**.
M03 transport handles retry/repair at vector level
(`retry_repair_planned`, `retry_attempt_opened`) but does not open
frame-nested zoom. The "Design ADRs → Modules → Implementation"
intermediary the goal cites (5.2) has no carrier today.

**Current state — asset register and event ledger.** Built *outside* ODD
primitives. `RuntimeEvent[]`, the runtime event sink, and projection live
in `code/src/abg/m03/events/` and `code/src/abg/m03/iteration.ts` as
imperative store and helpers. There is no graph function or operator that
vends the ledger as an observable asset.

**Gap.** This is the largest single ODD gap in the tenant.

- Item 5.3 of the goals — "if I need an asset register or event ledger, it
  should be built using ODD and graph functions" — is a textbook §14
  dogfooding violation in current code.
- Item 5.2 — zoom for ADR → Module → Implementation refinement — requires
  operationalizing `RefinementBoundary` in M03 transport so an outer vector
  can stay open while a refined inner traversal runs and folds back. §11.9
  requires this, and it is not realized.

**Carrier kind.** Declared types in M02; no operational carrier.

## Cross-Cutting Findings

### F1. Recurring §16 Failure Pattern #10

Across goals 1, 3, and 5 the same shape recurs: operative behavior is
implemented imperatively with GTL types declared on the side but not made
the carrier. The TS tenant is currently more "ODD-shaped" than "ODD-built"
in §11.2A's terms. This is the dominant method risk in the current line.

### F2. No Machine-Readable Function Catalog (§11.3 violation)

Public callables exist as TypeScript exports (`publicStart`,
`publicControlLoop`, `publicGaps`, `publicEventIngress`,
`resultAssessment`, `resolvePublicAssetTarget`, `deliverBootloader`,
`installBootstrap`, etc.), but there is no published catalog with name,
inputs, outputs, intent, public/helper role. This blocks §19 ramp-up
checklist item 4 ("Where is the machine-readable function catalog?") and
makes audit harder than it needs to be.

### F3. §11.5A Audit Overdue on the Control Loop

`publicControlLoop` is the single file most exposed to the ABG-owns-
continuation rule. The answer to "does ABG own continuation here, or does
the controller?" needs to be stated in design before more orchestration
lands. If the answer is "the controller", that is not lawful under
§11.5A as currently amended (2026-04-24 / 2026-04-26).

### F4. Goals Form A Coherent Wave

Goals 1, 2, and 5 together define the dogfood surface — probe + SDLC loop
+ zoom + ledger. Goals 3 and 4 define the cross-product reuse layer —
scenario algebra + instance reification. Treating them as one wave with
explicit ordering will produce a coherent reprice; treating them as five
independent tickets will fragment.

### F5. Goal 5.3 Is The Constitutional Move

The single most decisive sentence in the goals is line 35: "If I need an
asset register, or some kind of event ledger, then itself should be built
using ODD and graph functions." That is the §14 dogfood rule applied to
the tenant's own runtime. Adopting it as a constraint reorganizes most of
the imperative surface in the current carrier.

## Recommended Action

In priority order. Each step names its method anchor.

1. **Ratify goals_0426 as a `product_reprice`** in
   `specification/PRODUCT.md`, anchoring each item to its ODD §-clause so
   the ratification is constitutional, not aspirational.
   *Anchor: SPEC_METHOD lawful re-entry; ODD §9 method governance.*

2. **Publish `Triage`, `Process_Ticket`, `Consensus` as graph functions**
   over typed `Ticket`, `TriageOutcome`, `ConsensusBallot` assets. This
   closes the SDLC loop the goal names and establishes the
   §11.2-compliant pattern the other goals will follow.
   *Anchor: §11.2, §14, §16 failure #1.*

3. **Audit `publicControlLoop` against §11.5A.** State the answer in
   design before adding any more controller logic. If continuation
   currently lives in the controller, plan its return to ABG ownership as
   a follow-up `realization_refactor`.
   *Anchor: §11.5A.*

4. **Promote `TraversalStructureProbe` to a published graph function**
   (Goal 1). Small move; makes forensics lawful in carrier terms.
   *Anchor: §11.2.*

5. **Operationalize `RefinementBoundary` in M03 transport** so an outer
   vector can stay open while a refined inner traversal runs and folds
   back (Goal 5.2). Largest single ODD gap; until it lands, "zoom" is
   prose.
   *Anchor: §11.9, §14.*

6. **Reify `GraphInstance` as a typed asset** distinct from
   `GraphFunction.template` (Goal 4). Gives the zoom-out gap-analysis flow
   and reentrancy a typed witness.
   *Anchor: §10, §11.1, §11.5.*

7. **Define the scenario combinator algebra** (Extract / Synthesize /
   Transform / Fan) as graph functions (Goal 3). Cross-product reuse
   surface; applies across `odd_sdlc` and future `odd_*` packages.
   *Anchor: §11.2, §12, GTL algebra `fan_out`/`fan_in`.*

8. **Rebuild the asset register and event ledger using ODD primitives**
   (Goal 5.3). Largest scope; do last but commit to it now in PRODUCT
   so the imperative ledger does not accrete more state.
   *Anchor: §14, §16 failure #10.*

9. **Publish a machine-readable function catalog** (§11.3, §19).
   *Anchor: §11.3.*

This post is commentary. It becomes consequential only if its content is
adopted into `specification/PRODUCT.md` and ratified design.
