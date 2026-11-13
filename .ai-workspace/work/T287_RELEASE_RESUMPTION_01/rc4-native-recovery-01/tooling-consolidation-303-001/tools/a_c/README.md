# Axiomatic Calculus Implementations

a_c's next Product increment makes these tools usable on **your own STDO
project**: represent its axiomatic program, read its constraints, run supported
checks, and supply selected context to LLM builders and reviewers. See the
[user-project requirements](specification/requirements/project-use.md) and
[delivery plan](.ai-workspace/work/T015_USER_PROJECT_PRODUCT/PLAN.md). Existing
components are usable now; the unified installed user workflow remains in work.

The [ABIogenesis code explorer](applications/abiogenesis-code-explorer/index.html)
adds requirement→implementation→test-source navigation to that offline reader.
Its [quickstart](applications/abiogenesis-code-explorer/README.md) walks through
five proposed links over four selected files. Use the
[public code-overlay commands](build_tenants/graphify/README.md#follow-requirements-into-code-and-test-sources)
on another nominated project. [T-019's delivery](.ai-workspace/work/T019_CODE_REPRESENTATION/DELIVERY.md)
is independently reviewed within its structural, public-path and reader scope;
these links do not assert test execution, correctness or requirement satisfaction.

The [STDO constraint explorer](applications/stdo-constraint-explorer/README.md)
provides a local **3D/2D view with a full constraint reader**. Search constraints,
follow labelled connections, inspect caveats and source passages, and navigate
back through the reading trail. Its initial subject is the frozen common
35fb4824 representation used in the Lean work.

The [ABIogenesis reader](applications/abiogenesis-constraint-explorer/README.md)
adds a **Files** flyout: browse the represented folder/file structure, open a
file's records or source, follow logical relationships, and use **Back to file**
or **Show in files** to move between the two views. The same navigation is part
of the reusable viewer generator.

The [unified ABIogenesis reader](applications/abiogenesis-constraint-explorer/index.html)
switches the middle panel between 3D, 2D and left-to-right Layered tracks while
retaining the selected information and navigation state. All three views share
one embedded representation and source files. Public project builds produce one
offline HTML page; no service or network is needed.

`a_c` means **axiomatic calculus**. This independent source project builds
realizations of the carrier-neutral STDO calculus. Shared requirements define
the WHAT; each `build_tenants/` child binds those requirements to its own
computational representation and execution stack.

The tenants are [Graphify](build_tenants/graphify/README.md) and
[Lean/Mathlib](build_tenants/lean/README.md). Graphify supplies a graph carrier
and support operations. Lean supplies formal definitions, checked proofs and an
executable dependency-closure/projection fragment under the common
[formalisation contract](specification/requirements/formalisation.md).
[T-011](.ai-workspace/tickets/active/T-011-lean-formalisation.md) records completed
bounded implementation and independent review of FR-001–FR-007. The
[delivery handoff](.ai-workspace/work/T011_LEAN_FORMALISATION/DELIVERY.md) links
runnable commands, the exact source freeze and the satisfied final assessment:
46 actual projections, 46 insufficient-budget refusals and 204 deciding theorem
reports. T-011 and T-012 are checkpointed and pushed on `main` at
`a971d38583da8a06b91ec2ca1b65940ce2ecec08`; no owner acceptance or release is
issued. Axiom Indexer, STDO Representation and
Specification Methodology v3 are not prerequisites or composed Products.

[T-012](.ai-workspace/tickets/active/T-012-reusable-formal-gate.md) delivered
a reusable exact-subject formal gate for new supported subjects,
portable proof evidence, and optional required verification in ordinary
generation and actual Worker context/preflight/dispatch. Its
[closed independent assessment](.ai-workspace/work/T012_FORMAL_GATE/review/final-assessment-001/REVIEW.md)
supports the declared fragment with no blocking findings. The
[baseline](.ai-workspace/work/T012_FORMAL_GATE/baseline/BASELINE.json) preserves
T-011's exact reviewed tenant and common source before that work.

[T-013](.ai-workspace/tickets/active/T-013-practical-formal-gate.md) completes the
bounded practical-gate delivery and experiment. The checker covers the exact 1,987-record/1,021-external
model and actual 29-record Worker view, with fresh kernel replay and full data
correspondence. The gated dispatch and supervisor then reuse that exact proof
through the normal public path. The [delivery handoff](.ai-workspace/work/T013_PRACTICAL_FORMAL_GATE/DELIVERY.md)
links runnable instructions, exact identities, costs and preserved failed work.
Use the [Lean README](build_tenants/lean/README.md) and
[formal-gate contract](build_tenants/lean/design/FORMAL_GATE.md) for the CLI and
JSON interface; there is no dedicated gate UI.

Both matched native F_P Workers completed with their exact selected input bytes.
[Independent quality review](.ai-workspace/work/T013_PRACTICAL_FORMAL_GATE/review/matched-quality-001/REVIEW.md)
found an S2 numeric-fidelity defect in the ungated helper and an S3 exponent-error
defect in the gated helper. These remain uncorrected disposable evaluation
observations; neither helper is adopted as a Product feature. The pair does not
establish a causal quality benefit or lower total cost. Successful cold preflight
took 273.07 seconds; actual reused checks took 9.30 and 9.22 seconds. The compiler
uses `-M4096`, but observed child high-water RSS reached 14.61 GB.
[Independent operational review](.ai-workspace/work/T013_PRACTICAL_FORMAL_GATE/review/matched-operation-001/REVIEW.md)
supports the selected proof/reuse/received-input path with no new actionable defect.
A local source archive and installed full-view cold check are
[independently reviewed](.ai-workspace/work/T013_PRACTICAL_FORMAL_GATE/review/package-final-002/REVIEW.md),
including exact byte-preserving transport of all 24 oversized proof files.
Fresh-host/cross-platform qualification, complete economics and positive practical
benefit remain open. No owner acceptance or public release is issued.

Read [stdo_a_c.json](stdo_a_c.json), [Goals](specification/GOALS.md),
[Intent](specification/INTENT.md), [Product](specification/PRODUCT.md), and
[requirements](specification/requirements/README.md) before changing the project.
The exact calculus remains owned by the selected published STDO standard; this
project does not create a competing definition of `a_c`.

The additional [F_D support toolset](specification/PRODUCT.md#f_d-support-for-f_p-development-actors)
has a provisional public CLI/MCP implementation in the existing Graphify tenant.
STDO3.0 owns the methodology; a_c supports its exact caller-selected contracts.
The [current repair handoff](.ai-workspace/qualification/t008/review-fixes-001/README.md)
records seven implementation repairs, closed nonauthor reviews and fresh
303-test integration. [T-009](.ai-workspace/tickets/completed/T-009-review-repairs.md)
closes that bounded repair work; [T-008](.ai-workspace/tickets/active/T-008-fd-tenant-implementation.md#current-review-repairs--t-009)
remains active for qualification, retaining partial/failed actor trials.
A [separate Claude-direct correction](dogfood/stdo-v3-generation-rc9-review-correction/README.md)
is an unaccepted proposal; the four frozen RC9 representations are unchanged.
[T-007](.ai-workspace/tickets/active/T-007-executive-lifecycle-tooling.md)
remains the historical specification-only increment. The installed builder,
Product composition and method binding are unchanged. Accepted-result benefit
remains Deferred/unqualified, and frozen methodology models are not a maintained
whole-workspace index.

This is a development candidate, with no Product acceptance or release claim.
See each tenant README for runnable commands and its bounded proof or
qualification claim.

The completed RC9 rebuild is
[T-006](.ai-workspace/tickets/active/T-006-rc9-rebuild-comparison.md):
[four fresh representations](dogfood/stdo-v3-generation-rc9/README.md) use
the same implementation and settings as the preserved earlier study. The
[older/newer comparison index](dogfood/stdo-v3-generation-rc9/COMPARISON.md)
provides eight Graphify/direct models across Codex and Claude source cuts.
Codex RC9's selected source equals RC5; Claude RC9 changes two owner files.
The new builds pass their mechanical checks; their semantic assessment and
the planned comparison tests remain separate work.

The earlier source-first creation increment is
[T-005](.ai-workspace/tickets/active/T-005-source-first-graphify-generation.md):
the [new Graphify representations and direct baselines](dogfood/stdo-v3-generation/README.md)
were generated from frozen Codex RC5 and Claude RC8 owner source. F_P is inside
this tenant workflow; an existing native a_c model is not a prerequisite.
Both paths preserve all 24 sampled distinctions per candidate in fresh
nonauthor assessments. The [review](dogfood/stdo-v3-generation/REVIEW.md) retains
all 85 construction calls, resource tradeoffs and limits; overall cost saving
and compression remain unestablished. The earlier I5 evaluation below measured
reading existing models and supplies no source-generation verdict.

From this `a_c/` directory, check the included example without installing a
runtime package:

```sh
python3 build_tenants/graphify/code/ac_graph.py validate build_tenants/graphify/test_env/fixtures/toy_model.json
```

The [implementation record](.ai-workspace/comments/codex/20261015_AC_GRAPHIFY_IMPLEMENTATION.md)
retains the initial frozen candidate's review, verification and qualification
boundaries. The consumer trial below records the current bounded codec repairs.

The [two I5 V3 Graphify versions](dogfood/stdo-v3-i5/README.md) separately
represent the completed Codex and Claude candidates selected on 2026-10-17.
They retain each line's authored coverage, complete selector closures and frozen
source custody, with actual Graphify graph/browser outputs. The candidate
worktrees and their independent reviews remain unchanged by these builds.

The [direct-LLM versus Graphify evaluation](dogfood/stdo-v3-i5-evaluation/README.md)
adds self-contained native baselines and matched source-grounded trials for
both candidates. The focused actual-use comparisons preserved quality in both
approaches, with higher Graphify input-token use and mixed elapsed times. This
supports optional discovery/acquisition use for that consumption workload;
quality improvement and lower total cost were not demonstrated there. The report retains all runs and blind
assessments, including the initial pilot's failed run and scope limits.

The historical [frozen v3 iteration-3 example](dogfood/stdo-v3-i3-c29b2be/README.md)
transports the completed Codex candidate's authored interpretation into a
separate Graphify representation, with source custody and complete selector
acquisition checks. It is a consumer example of this independent tenant.
