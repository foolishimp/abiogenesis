---
id: T-116
title: Enable GTL plugin traversal observer bindings for Transform and Eval
type: feature
ticket_category: gtl_plugin_traversal_binding
status: completed
goal: rc-next-gtl-qualified-plugin-traversal-prompts
change_class: design_reframe
re_entry_point: design
created_at: 2026-05-06T01:02:45+10:00
updated_at: 2026-05-06T02:11:39+10:00
owning_repo: abiogenesis
governance_scope: STDO Method
priority: high
build_tenant: typescript
affected_boundary:
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - specification/requirements/abg/REQ-R-ABG3-BINDING.md
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/fp_stages.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts
  - build_tenants/abiogenesis/typescript/test_env/tests/
  - build_tenants/abiogenesis/typescript/test_env/live/
governing_requirements:
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/gtl/REQ-L-GTL3-OPERATOR.md
  - specification/requirements/gtl/REQ-L-GTL3-EVALUATOR.md
  - specification/requirements/abg/REQ-R-ABG3-BINDING.md
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
dependencies:
  - T-107
  - T-112
  - T-115
proof_commands:
  - npm run build:semantic
  - npm run lint:semantic
  - npm run test:t116
  - npm run test:t116:live
  - npm run test:t087
  - npm run test:t113:live
intake_source: User identified that deployed F_P uses one actor and one worker, and that the effective traversal shape is worker.prompt materialized from an actor/generic observer prompt. The same observer-binding pattern applies to the two major plugin traversal lanes: Transform and Eval.
target_truth: GTL declares plugin traversal observer bindings as hook/config truth on GraphVector or GraphFunction surfaces. ABG materializes those bindings into prompt/manifest/runtime carriers for Transform and Eval, and falls back to a generic observer prompt when no qualifier is present.
superseded_truth: Transform and Eval prompt shape is hidden in runtime code, tests, worker prose, agent labels, or product-local controller conventions rather than declared through GTL hook/config surfaces and emitted as ABG materialization truth.
---

# T-116 Enable GTL Plugin Traversal Observer Bindings For Transform And Eval

## STDO Triage

### First Missing Layer

Design.

Existing GTL authority already allows edge and graph-function hook/config
declarations. `GraphVector.declarations` is the primary edge qualifier surface,
and `GraphFunction.declarations` plus `Role.policy_hooks` may provide defaults.

The missing piece is not a new prompt language inside GTL. The missing piece is
a named GTL hook/config convention for plugin traversal observer bindings that
ABG can resolve and materialize.

### Lawful Re-Entry

`design_reframe`.

Use existing GTL hook/declaration authority first. Reprice requirements only if
review finds that current hook language cannot lawfully carry Transform/Eval
observer prompt bindings.

## Problem

The current Transform/Eval plugin traversal model has the required runtime
pieces, but the observer-prompt binding is implicit.

Current effective shape:

```text
Transform:
  F_P edge -> actor/generic observer prompt -> worker.prompt -> result artifact

Eval:
  evaluator/proof edge -> evaluator observer prompt -> eval prompt/input -> assessment
```

Current code surfaces:

- `fp_dispatch` binds one actor invocation to one F_P attempt.
- `fpTransformRequest` carries Transform request/runtime context.
- `fd_evaluator` carries deterministic Eval plugin execution.
- live T113 now proves an actor can observe a completed worker result and
  respond with causation through ABG event boundaries.

Gap:

GTL does not currently declare the observer prompt binding for Transform or
Eval. The binding exists in runtime/test prompt construction, not as published
graph/vector/function truth.

## Best-Practice Direction

Keep GTL declarative.

GTL should declare:

- which traversal kind is being qualified;
- which observer prompt ref should be used;
- what input contract that prompt expects;
- what output/result/eval contract the prompt must produce;
- optional progress or continuation signal refs;
- opaque hook config needed by the resolved implementation.

GTL should not declare:

- concrete worker identity;
- backend name;
- PTY/process transport;
- executable prompt rendering logic;
- downstream strategy semantics as language law;
- hidden worker tactics.

ABG should own:

- resolving the GTL hook/config qualifier;
- applying precedence;
- materializing a prompt/manifest for the bound actor/worker pair;
- emitting replay-visible materialization/runtime events;
- falling back to a reference generic observer prompt from visible
  configuration when absence is lawful;
- failing closed on malformed qualifier config.

## Proposed GTL Qualifier Shape

Use one shared hook/config model for both plugin traversals:

```ts
interface PluginTraversalObserverBindingQualifier {
  readonly kind: "plugin_traversal_observer_binding";
  readonly traversalKind: "transform" | "eval";
  readonly hookRef: string;
  readonly observerPromptRef: string;
  readonly promptInputContractRef: string;
  readonly expectedOutputContractRef: string;
  readonly progressSignalRefs: readonly string[];
  readonly continuationRequestRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly configDigest: string;
}
```

Declaration keys should remain stable and namespaced:

```text
abg.plugin_traversal_observer.transform
abg.plugin_traversal_observer.eval
```

Precedence should follow existing hook rules:

```text
1. GraphVector.declarations
2. GraphFunction.declarations
3. Role.policy_hooks
4. ABG reference default when qualifier absence is lawful
```

## Reference Default Bundle

Current ABG requirement authority already says default bundles must be ordinary
configuration, not hidden hardcoded law. T-116 shall apply that rule to
Transform/Eval observer fallbacks.

ABG should ship a JSON reference bundle that users can copy, edit, and
reference from GTL/ABG surfaces. This bundle is governed by the `abg_defaults`
work in T-117; T-116 consumes it for Transform/Eval observer fallback binding.

Shipped reference fallback bundle:

```text
build_tenants/abiogenesis/typescript/config/abg.reference-fallbacks.json
```

Installed/editable fallback copy:

```text
.abiogenesis/config/abg.fallbacks.json
```

Illustrative bundle shape:

```json
{
  "kind": "abg_fallback_bundle",
  "version": 1,
  "bundleRef": "fallback-bundle://abg/reference",
  "pluginTraversalObserverBindings": {
    "transform": {
      "absenceLawful": true,
      "observerPromptRef": "prompt://abg/reference/generic-transform-observer",
      "promptInputContractRef": "contract://abg/plugin-traversal/transform-input",
      "expectedOutputContractRef": "contract://abg/plugin-traversal/transform-output",
      "promptTemplateRef": "template://abg/reference/generic-transform-observer",
      "continuationRequestRefs": [
        "continuation://abg/drive-transform-forward"
      ],
      "progressSignalRefs": [
        "progress://abg/stream-observed",
        "progress://abg/artifact-candidate-observed"
      ]
    },
    "eval": {
      "absenceLawful": true,
      "observerPromptRef": "prompt://abg/reference/generic-eval-observer",
      "promptInputContractRef": "contract://abg/plugin-traversal/eval-input",
      "expectedOutputContractRef": "contract://abg/plugin-traversal/eval-output",
      "promptTemplateRef": "template://abg/reference/generic-eval-observer",
      "continuationRequestRefs": [
        "continuation://abg/continue-evaluation"
      ],
      "progressSignalRefs": [
        "progress://abg/evaluation-observed"
      ]
    }
  }
}
```

The JSON bundle is configuration. It may name prompt refs, contracts, policy
refs, and template refs. It must not become executable prompt rendering logic,
concrete worker identity, backend transport, or closure authority.

Resolved selections must record the source bundle and digest so fallback
behavior is auditable:

```ts
interface AbgFallbackBundleRef {
  readonly bundleRef: string;
  readonly bundlePath: string | null;
  readonly bundleDigest: string;
}
```

## Generic Fallback

If no qualifier is present and policy declares absence lawful, ABG may
materialize the reference generic observer prompt.

Fallback intent:

```text
observe and respond to continuation requests; drive the transform or eval
traversal forward without selecting the next graph vector or claiming closure
outside ABG event calculus
```

Fallback must be explicit runtime truth, not hidden behavior:

```ts
interface PluginTraversalObserverBindingSelection {
  readonly kind: "plugin_traversal_observer_binding_selection";
  readonly selectionRef: string;
  readonly traversalKind: "transform" | "eval";
  readonly source:
    | "graph_vector_declarations"
    | "graph_function_declarations"
    | "role_policy_hooks"
    | "abg_reference_default";
  readonly observerPromptRef: string;
  readonly promptInputContractRef: string;
  readonly expectedOutputContractRef: string;
  readonly absenceWasLawful: boolean;
  readonly fallbackBundleRef: string | null;
  readonly fallbackBundleDigest: string | null;
  readonly configDigest: string;
}
```

## ABG Materialization Shape

ABG should materialize selected observer bindings into replay-visible prompt
truth:

```ts
interface PluginTraversalPromptMaterializedEvent {
  readonly kind: "plugin_traversal_prompt_materialized";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly traversalKind: "transform" | "eval";
  readonly actorInvocationId: string | null;
  readonly workerId: string | null;
  readonly bindingSelectionRef: string;
  readonly observerPromptRef: string;
  readonly renderedPromptRef: string;
  readonly promptInputDigest: string;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}
```

Transform materialization should feed `FpTransformRequest` and F_P dispatch.

Eval materialization should feed evaluator plugin input and assessment/proof
execution.

## Acceptance Criteria

- GTL can declare a Transform observer binding on a graph vector.
- GTL can declare an Eval observer binding on a graph vector.
- GraphFunction defaults work for both traversal kinds.
- GraphVector declaration overrides GraphFunction default.
- Role policy default is used only when vector/function declarations are absent.
- Malformed qualifier config fails closed.
- Absence can resolve to the ABG reference generic observer prompt only when
  absence is explicitly lawful.
- Reference fallback behavior is loaded from a visible JSON bundle, not from a
  hidden hardcoded table.
- Domain users can copy/edit/reference the fallback JSON bundle.
- Selection/projection truth records the fallback bundle ref and digest when a
  fallback participates.
- ABG emits replay-visible prompt materialization truth with prompt ref,
  rendered prompt ref, input digest, causation, and correlation.
- Transform plugin input exposes the selected/materialized observer binding.
- Eval plugin input exposes the selected/materialized observer binding.
- Live proof shows one actor/worker Transform traversal using the generic
  fallback and one declared qualifier path.

## Non-Closure Conditions

- Prompt selection remains hidden in test code or runtime prose.
- Worker labels such as `worker.claude` or `actor.claude` become GTL truth.
- GTL embeds backend transport, PTY, CLI args, or executable rendering logic.
- Transform and Eval use incompatible one-off binding models.
- Generic fallback happens silently without runtime materialization truth.
- Generic fallback is hardcoded with no JSON/config bundle reference.
- Users cannot override or reference the fallback bundle from GTL/ABG surfaces.
- Eval remains outside the observer-binding model while Transform is repaired.

## 2026-05-06 closure verification

Status: completed.

Implementation surfaces:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugin_traversal_observer.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_factories.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/projection.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts`
- `build_tenants/abiogenesis/typescript/config/abg.reference-fallbacks.json`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_t116_plugin_traversal_observer_binding.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/live/test_t113_live_pty_claude_actor_worker.test.mjs`

Commands run:

```text
npm run build:semantic
npm run lint:semantic
npm run lint:test-harness
npm run test:t097
npm run test:t106
npm run test:t115
npm run test:t116
npm run test:t116:live
```

Latest live proof:

```text
build_tenants/abiogenesis/typescript/test_env/test_runs/t113_live_pty_claude_actor_worker/20260505T161759398Z/summary.json
```

The live proof records all four requested combinations:

```text
defaultPluginActorEnabled
defaultPluginActorDisabled
customPluginActorEnabled
customPluginActorDisabled
```

Actor-disabled cases carry `actorInvocationId: null` while still preserving
prompt materialization truth. Default-plugin cases record the fallback bundle
ref and digest. Custom-plugin cases resolve through the GraphVector declaration
and record no fallback bundle digest.

## 2026-05-06 review feedback repair

External review found that `plugin_traversal_prompt_materialized` refs were
selection-stable but not materialization-unique. That weakened the
replay-visible prompt materialization claim.

Repair:

- `selectionRef` remains the stable binding-selection identity.
- `materializationRef` is now computed per materialization from basis, vector,
  selection, binding config digest, actor invocation identity when present,
  causation refs, and correlation id.
- `promptInputDigest` is computed from the same materialization basis plus the
  selected prompt and contract refs.
- the live matrix asserts four unique materialization refs and four unique
  prompt input digests.
