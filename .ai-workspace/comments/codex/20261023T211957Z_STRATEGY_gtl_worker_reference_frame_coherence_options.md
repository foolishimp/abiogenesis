# STRATEGY: GTL, Worker and reference-frame coherence options

**Author**: Codex
**Date**: 2026-10-23T21:19:57Z (2026-10-24 Sydney)
**Addresses**: GTL's exhaustive construction contract; Worker/frame/context bindings; Harness²-inspired improvement work; owner option selection
**Status**: Open

## Summary

The owner's intended GTL is an exhaustive graph and contract language for LLM construction. Its value depends on exposing the program's computations, composition, effects, evidence and closure before execution. The discussion has established no cost or quality advantage from adding more structure; that remains an empirical question.

The promising direction is to make reusable reference-frame meaning and per-call context bindings explicit through existing GTL Context, contract and policy surfaces, with GraphFunctions performing declared lifecycle operations. This is option B below, proposed for investigation. Whether those surfaces suffice, and whether frames need a core declaration type, remain open. This post selects no implementation, migration or release work.

## Analysis

### Source basis and current boundary

ABI sources were read at `main` commit `2b585b87f11d81246a57b05877e8620a2b3d186e`; Harness² sources at `1cfe254e8d25b15f37048c3730134686abe60335`. Source positions below refer to those cuts. The [Definition](../../../stdo_abiogenesis.json) selects STDO `v3.0.0-rc.1`, manifest `069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232`, with empty companion composition. The selected frame is `repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#governed-outcome-and-workspace`.

[Goals](../../../specification/GOALS.md#current-selection) retains release/debt work and separate acceptance obligations. [Intent](../../../specification/INTENT.md#governing-intent) and [Product:542](../../../specification/PRODUCT.md#exhaustive-llm-first-contract) own GTL's construction contract. This source-grounded strategy commentary changes none of that authority. Native [posting](stdo://releases/v3.0.0-rc.1/standards/POSTING_GUIDE.md) and [writing](stdo://releases/v3.0.0-rc.1/standards/WRITING_GUIDE.md) guides govern this carrier.

### What GTL contributes

GTL's contribution is whole-program inspectability: typed handoffs, declared membership, composition and recursion, permitted effects, result/refusal shapes, proof obligations, and versioned publishable contracts. HoG traverses the admitted Program directly; ABG admits results and events and derives continuation and closure. An ordinary workflow hidden in TypeScript methods would require a different account of where those relations remain inspectable and enforceable. Treating GTL as a convenient DSL or a program-data wrapper would dilute the owner's stated purpose.

That purpose has costs: richer declarations, authoring and validation effort, compatibility maintenance, context acquisition, and evidence needed to establish semantic sufficiency. Structural checks eliminate some ambiguity; they do not prove a useful program, a sufficient frame or a cheaper execution. GraphFunctions may declare `F_D`, `F_P` and `F_H`. Open-world interpretation remains declared judgment even when exact source acquisition and rendering are deterministic. [Product:567–735](../../../specification/PRODUCT.md#hog-and-abg-runtime-contract) and the [project basis:11–16](../../../build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#status-and-boundary) preserve these distinctions.

### The Harness² relation

Harness²'s task-level Propose–Probe–Compose loop edits a harness, probes alternatives on the same task, and composes from behavioral contrasts. Its improvement harness retains adopted material and evidence-supported lessons across tasks. The model weights stay fixed; adopted harness edits do not rewrite the driver’s fixed phase scheduling. These claims follow the pinned [README:19–33](../../../../harness2/README.md#L19), [core recursion:365–425](../../../../harness2/harness2/core/recursion.py#L365), the [primary repository](https://github.com/google-research/harness2), and [paper](https://arxiv.org/abs/2610.14224).

As an architectural inference, ABG can express this policy as ordinary GraphFunction composition, including zoom into child computations. Propose, probe, assess, compose and preserve lessons need no alternative runtime. GraphFunctions could create or evaluate candidate GraphFunctions, frame declarations and overlays, and apply lawful existing publication owners.

Expressibility and release selection differ. Ordinary candidate authoring can produce definitions for later validation, acceptance and publication. [Product:1122–1127](../../../specification/PRODUCT.md#50-and-51-release-boundaries) excludes dynamic graph generation/recomposition and its runtime publication path from 5.0 acceptance. This discussion selects neither that capability nor the reserved observer/tuner Product.

### One coherent vocabulary

The discussion's “two algorithm carriers” means declared GraphFunction computations and methods expressed in reference-frame prose. Prose can direct an `F_P` evaluation through referenced Context and contracts. It does not become a parallel admitted Program, topology source or deterministic interpreter. [Product:644–679](../../../specification/PRODUCT.md#graph-composition-and-reference-frames) supplies that boundary.

| Subject | Meaning and binding |
|---|---|
| Program / overlay | The admitted Program owns semantic topology. An overlay declares non-callable composition/binding; GraphFunctions may create, evaluate or apply overlay candidates. |
| GraphFunction | Sole named callable graph-template/work contract; owns declared input, context, effects, outputs and closure relations. |
| Traversal unit | A declared computation occurrence or boundary under HoG, including nested calls; does not imply one dedicated Worker. |
| Role / Job | GTL semantic capability / durable work contract. A Job references published GraphFunctions and outlives one Run. |
| Reference-frame definition | Reusable evaluation/work meaning: question, applicability, material relations, authority, evidence, criteria, result and invalidation. |
| GTL Context | Language-owned external source/snapshot declaration with locator and digest; preserves source identity without making a mutable workspace immutable. |
| Per-call context view | Selected, rendered material for the current call, role and locus; reconstructable projection of the binding. |
| Worker / actor | Externally resolved concrete execution identity, admitted against declared requirements and authority. |
| Actor session / process | Execution realization; history, access, termination and reuse remain subject to their owners. |
| ABG runtime Frame | Recursive invocation aggregate with call, attempt and lineage identity; distinct from a reference frame. |

The [ROLE](../../../specification/requirements/gtl/REQ-L-GTL3-ROLE.md#acceptance-criteria), [JOB](../../../specification/requirements/gtl/REQ-L-GTL3-JOB.md#acceptance-criteria), [WORKER](../../../specification/requirements/abg/REQ-R-ABG3-WORKER.md#acceptance-criteria), [JOB-WORKER](../../../specification/requirements/abg/REQ-R-ABG3-JOB-WORKER.md#acceptance-criteria) and [FRAME](../../../specification/requirements/abg/REQ-R-ABG3-FRAME.md#acceptance-criteria) requirements retain these distinctions.

STDO's Worker responsibility does not define ABG's concrete Worker identity. A frame binds to the call/role/locus; the selected Worker consumes its context view. There is no necessary 1:1 Worker-to-traversal-unit mapping. Fresh sessions or different models alone establish no independence; candidate custody, evidence access, authorship separation and assessment authority matter.

The older [attached-worker derivation:54–85](../../../build_tenants/abiogenesis/typescript/design/M03_ATTACHED_FP_WORKER_LOOP_DERIVATION.md#python-capability-retained) preserves dispatch → ingest → assess → retry and refreshed prompt construction. Its ABG-owned traversal-loop wording is historical: current Product assigns direct traversal to HoG and runtime admission/truth to ABG. The capability survives without restoring the old controller allocation.

### What exists, and what remains incomplete

The current implementation already joins substantial coordinates:

| Existing owner | Present mechanism |
|---|---|
| [GTL run environment:44,165–211](../../../build_tenants/abiogenesis/typescript/code/src/gtl/stdo_run_environment.ts#L44) | Role rows bind GraphFunction/locus/role, string `frameRefs`, hashed instruction policy, exact source spans and Context selectors. |
| [ABG environment:293–339](../../../build_tenants/abiogenesis/typescript/code/src/abg/stdo_environment.ts#L293) | Projects role material from authenticated invocation evidence and the selected publication; preserves source bytes and policy identity. |
| [Instruction assembly:117–160,588–690](../../../build_tenants/abiogenesis/typescript/code/src/abg/instruction_assembly.ts#L117) | Authenticates call/input/basis; binds selected context, materialization and request identities; renders bounded role-specific sections. |
| [Worker request:62–75](../../../build_tenants/abiogenesis/typescript/code/src/implementation/contracts.ts#L62), [actor process:822–836](../../../build_tenants/abiogenesis/typescript/code/src/abg/actor_process.ts#L822) | Carries actor/binding/input/renderer/contracts and checks required assembly against dispatch. |

This join is specialized and partial. String frame references plus role-level source spans do not provide a typed per-frame source/version → semantic contract/applicability/subject/evidence/criteria/result/invalidation → call binding. [CONTEXT-009–012](../../../specification/requirements/gtl/REQ-L-GTL3-CONTEXT.md#acceptance-criteria) require the semantic relations already; their presence does not prove a general implemented solution.

Proposed annotations would reference owning prose once and expose the needed binding through existing Context/contract/policy surfaces. This needs design and evidence. The [catalog contribution schema:202–204](../../../build_tenants/abiogenesis/typescript/code/src/gtl/serialization_contracts.ts#L202) currently admits `graph_function`, `node_type` and `overlay`, with no native `reference_frame` contribution kind. Whether published references offer enough discovery is unresolved; option B may require validator/discovery extensions. No standalone frame-registry API is claimed.

### Proposed lifecycle and separable changes

```text
candidate → structural + semantic assessment → owner acceptance/version/publication
          → call binding + materialization → execution/evaluation → improvement candidate
```

This is a proposed lifecycle through existing owners. Structural acceptance, semantic assessment, publication, invocation and runtime result admission retain distinct authority. `F_D` can check exact bytes, references, closed constraints and materialization. `F_P` judges applicability, sufficiency and candidate improvement where those questions remain open-world. `F_H` retains reserved owner choices.

Changing frame text or meaning creates a semantic candidate and may invalidate dependent support. Selecting a smaller context view, sharing exact references or changing presentation can preserve meaning, but must demonstrate required material remains accessible and sufficient. Optimization cost includes acquisition, repeated reasoning, latency, failed work, repair and assurance. Token reduction alone establishes no improvement. A missing required context item remains a typed gap. These constraints follow [Product:706–735](../../../specification/PRODUCT.md#role-specific-context) and CONTEXT-010/012.

### Options for selection

| Option | Benefit | Cost, limit and appropriate use |
|---|---|---|
| **A — Reconcile documentation and opaque bindings** | Clarifies current ownership and makes present behavior easier to inspect. | Lowest conceptual disruption, but leaves per-frame semantics dependent on prose and specialized joins. Appropriate if documented bindings suffice for a bounded use. |
| **B — Typed annotations through existing GTL extension points, with GraphFunctions for operations** | Makes source/meaning/call relations explicit while retaining existing semantic and runtime owners. | Requires a coherent annotation contract, validation, discovery decisions, invalidation and end-to-end evidence. Existing hooks do not make this zero-change. Appropriate if they preserve all required meaning without hidden conventions. |
| **C — Explicit core frame declaration/binding language** | Could give reusable frame assets uniform language-level identity and validation where B cannot. | Requires a justified GTL/Product decision, compatibility and publication changes. A new immutable declaration type remains distinct from a prohibited second FrameEngine/runtime. Appropriate only after showing the specific relation B cannot preserve. |
| **D — Ordinary TypeScript workflow baseline** | Measures the practical cost and benefit of direct imperative construction. | Requires Product repricing if adopted as the program model: inspectability, composition, replay and authority still need an account. Useful counterfactual evidence; it cannot quietly replace the exhaustive GTL intent. |

Core representation and lifecycle operations are separate decisions. A frame annotation does not mandate a new engine. GraphFunctions can operate over source-linked frame material whether the selected representation is prose plus annotations or a later core declaration.

### One discriminating slice

A proposed Executive → Worker → Reviewer → Executive slice should use one task, frozen source cuts, common outcome oracle and declared resources. The Executive selects a preregistered construction call with exact current producer/input, role/frame bindings, context, allowed effects and result contract. The Worker returns a candidate and evidence; that candidate is frozen. An independently activated Reviewer assesses it under its own bound context and operation restrictions. The Executive conjoins closed returns and proposes the resulting disposition and next work under declared policy. ABG admits runtime outcomes, HoG applies the lawful continuation, and cold reconstruction establishes what became runtime truth.

Illustrative execution bindings are Fable Executive, Opus 5.5 `xhigh` Worker and `max` Reviewer, or Fable escalation. These are discussion examples, with no availability, independence or performance claim. Session reuse must preserve current context validity; cold reconstruction must not depend on the participants' remembered conversation.

Compare present bindings with the proposed annotation approach on outcome correctness, unsupported claims, context omissions, refusal quality, diagnostic traceability, total cost/latency and change effort. Repetition and ordinary variations should challenge the actual proposed benefit. Preserve unsuccessful probes and evidence-supported lessons without upgrading them to acceptance. No experiment or gain is claimed here.

## Recommended Action

Investigate B after reconciling terminology and current bindings, keeping C available if a concrete meaning-preservation failure requires it. Preserve current release work; this post authorizes no new implementation or migration schedule.

The owner’s decisions are:

1. Which identity, versioning and discovery requirements belong to reusable frame definitions, and which invocation-specific bindings belong to per-call annotations and views?
2. Can existing GTL declarations preserve that meaning, or does a core language addition have a demonstrable purpose?
3. Is the improvement target frame semantics/prose, context selection/presentation, or separately evaluated changes to both?
4. Who accepts frame meaning, versions it and owns policy/invalidation? How do Worker/session validity and required independence constrain reuse?
5. When should adoption enter the selected work without displacing release obligations?

STDO owns generic reference-frame meaning. ABG Product and requirements own its application and authority relations. GTL design/code own the chosen representation and validation; existing publication, effect and ABG owners retain their operations. The next decision needs that ownership map and one discriminating slice, without a new frame registry, runtime or compiler.
