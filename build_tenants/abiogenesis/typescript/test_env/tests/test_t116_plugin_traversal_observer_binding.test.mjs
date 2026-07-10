// Validates: T-116
// Validates: T-117
// Validates: REQ-L-GTL3-HOOKS
// Validates: REQ-R-ABG3-POLICY
// Validates: REQ-R-ABG3-PROVENANCE

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  assertRuntimeEvent,
  constructEnginePluginContract,
  constructEnginePluginInput,
  constructFpDispatchOutcome,
  deriveRuntimeAggregateProjection,
  loadAbgFallbackBundleFromFile,
  resolvePluginTraversalObserverBinding,
  runEngineIterate as runEngineIterateBase,
  tryResolvePluginTraversalObserverBinding
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildFpBasis } from "./support/m03-fixtures.mjs";
import { loadFallbackBundleFromConfig } from "./support/abg_config_fallback.mjs";
import { m03InstructionAssemblyRequestFields } from "./support/m03-iteration-fixtures.mjs";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const TYPESCRIPT_ROOT = path.resolve(TEST_DIR, "..", "..");
const REFERENCE_FALLBACK_PATH = path.join(
  TYPESCRIPT_ROOT,
  "config",
  "abg.config.json"
);

function runEngineIterate(input) {
  return runEngineIterateBase({
    ...m03InstructionAssemblyRequestFields(input.basis),
    ...input
  });
}

function attrs(entries = []) {
  return Object.freeze({ entries: Object.freeze(entries) });
}

function scalarEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "scalar",
      value
    })
  });
}

function stringListEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "string_list",
      value: Object.freeze(value)
    })
  });
}

function hookEntry(key, input) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "hook_ref",
      value: Object.freeze({
        ref: input.ref,
        config: attrs([
          scalarEntry("traversal_kind", input.traversalKind),
          scalarEntry("observer_prompt_ref", input.observerPromptRef),
          scalarEntry("prompt_template_ref", input.promptTemplateRef),
          scalarEntry("prompt_input_contract_ref", input.promptInputContractRef),
          scalarEntry(
            "expected_output_contract_ref",
            input.expectedOutputContractRef
          ),
          stringListEntry("progress_signal_refs", input.progressSignalRefs),
          stringListEntry(
            "continuation_request_refs",
            input.continuationRequestRefs
          ),
          stringListEntry("policy_refs", input.policyRefs ?? [])
        ])
      })
    })
  });
}

function observerHook(key, input) {
  const traversalKind = input.traversalKind ?? "transform";
  return hookEntry(key, {
    traversalKind,
    ref: input.ref,
    observerPromptRef:
      input.observerPromptRef ?? `prompt://t116/${traversalKind}/${input.label}`,
    promptTemplateRef:
      input.promptTemplateRef ?? `template://t116/${traversalKind}/${input.label}`,
    promptInputContractRef:
      input.promptInputContractRef ?? `contract://t116/${traversalKind}/input`,
    expectedOutputContractRef:
      input.expectedOutputContractRef ?? `contract://t116/${traversalKind}/output`,
    progressSignalRefs: input.progressSignalRefs ?? [
      `progress://t116/${traversalKind}/${input.label}`
    ],
    continuationRequestRefs: input.continuationRequestRefs ?? [
      `continuation://t116/${traversalKind}/${input.label}`
    ],
    policyRefs: input.policyRefs ?? [`policy://t116/${traversalKind}`]
  });
}

function scalarAttr(key, value) {
  return scalarEntry(key, value);
}

function roleWithPolicyHooks(id, policyHooks) {
  return Object.freeze({
    id,
    name: id,
    tags: Object.freeze([]),
    policyHooks
  });
}

function withVectorDeclarations(basis, declarations, vectorIndex = 0) {
  const vector = basis.graph.vectors[vectorIndex];
  assert.ok(vector);
  const vectors = basis.graph.vectors.map((candidate, index) =>
    index === vectorIndex
      ? Object.freeze({
          ...candidate,
          declarations
        })
      : candidate
  );
  return Object.freeze({
    ...basis,
    graph: Object.freeze({
      ...basis.graph,
      vectors: Object.freeze(vectors)
    })
  });
}

function withGraphFunctionDeclarations(basis, declarations) {
  return Object.freeze({
    ...basis,
    graphFunction: Object.freeze({
      ...basis.graphFunction,
      declarations
    })
  });
}

function withRoles(basis, roles) {
  return Object.freeze({
    ...basis,
    job: Object.freeze({
      ...basis.job,
      roles: Object.freeze(roles)
    })
  });
}

function fpDispatchContract() {
  return constructEnginePluginContract({
    driverRequirement: "sync_compatible",
    ref: "plugin://t116/fp-dispatch",
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome"
  });
}

function bundle() {
  return loadFallbackBundleFromConfig(REFERENCE_FALLBACK_PATH);
}

test("T-116 fallback observer binding is opt-in; normal F_P runs have no observer binding", () => {
  const defaultsBundle = bundle();
  const { basis } = buildFpBasis();
  const vector = basis.graph.vectors[0];

  assert.equal(
    tryResolvePluginTraversalObserverBinding({
      traversalKind: "transform",
      vector,
      graphFunction: basis.graphFunction,
      roles: basis.job.roles,
      defaultsBundle
    }),
    null
  );

  const projection = deriveRuntimeAggregateProjection(basis, []);
  const normalInput = constructEnginePluginInput({
    contract: fpDispatchContract(),
    basis,
    projection,
    vectorIndex: 0,
    edge: vector.name,
    regime: "F_P",
    actorInvocationRef: {
      actorInvocationId: "actor://t116/normal",
      attemptIndex: 1,
      dispatchRef: "dispatch://t116",
      resultRef: "result://t116"
    },
    abgFallbackBundle: defaultsBundle
  });
  assert.equal(normalInput.pluginTraversalObserverBinding, null);
  assert.equal(
    normalInput.fpTransformRequest.pluginTraversalObserverBindingRef,
    null
  );
});

test("T-116 fallback observer binding can be enabled per traversal kind", () => {
  const defaultsBundle = bundle();
  const { basis } = buildFpBasis();
  const projection = deriveRuntimeAggregateProjection(basis, []);
  const vector = basis.graph.vectors[0];

  const transformInput = constructEnginePluginInput({
    contract: fpDispatchContract(),
    basis,
    projection,
    vectorIndex: 0,
    edge: vector.name,
    regime: "F_P",
    actorInvocationRef: {
      actorInvocationId: "actor://t116/transform-enabled",
      attemptIndex: 1,
      dispatchRef: "dispatch://t116",
      resultRef: "result://t116"
    },
    abgFallbackBundle: defaultsBundle,
    pluginTraversalObserverFallbackKinds: ["transform"]
  });
  assert.equal(
    transformInput.pluginTraversalObserverBinding.source,
    "abg_defaults"
  );
  assert.equal(
    transformInput.pluginTraversalObserverBinding.binding.observerPromptRef,
    "prompt://abg/reference/generic-transform-observer"
  );
  assert.equal(
    transformInput.fpTransformRequest.observerPromptRef,
    "prompt://abg/reference/generic-transform-observer"
  );
  assert.equal(
    transformInput.fpTransformRequest.defaultsBundleDigest,
    defaultsBundle.bundleDigest
  );

  const evalInput = constructEnginePluginInput({
    contract: constructEnginePluginContract({
      driverRequirement: "sync_compatible",
      ref: "plugin://t116/fd-evaluator",
      pluginKind: "fd_evaluator",
      authority: "effect_plugin",
      inputCarrier: "EnginePluginInput",
      outputCarrier: "FdEvaluationOutcome"
    }),
    basis,
    projection,
    vectorIndex: 0,
    edge: vector.name,
    regime: "F_D",
    abgFallbackBundle: defaultsBundle,
    pluginTraversalObserverFallbackKinds: ["transform"]
  });
  assert.equal(evalInput.pluginTraversalObserverBinding, null);
});

test("T-116 GTL qualifier precedence is GraphVector, then GraphFunction, then Role", () => {
  const defaultsBundle = bundle();
  const base = buildFpBasis().basis;
  const graphFunctionDefault = withGraphFunctionDeclarations(
    base,
    attrs([
      observerHook("abg.plugin_traversal_observer.transform", {
        label: "graph-function",
        ref: "hook://t116/graph-function"
      })
    ])
  );
  const role = roleWithPolicyHooks(
    "role://t116/default",
    attrs([
      observerHook("abg.plugin_traversal_observer.transform", {
        label: "role",
        ref: "hook://t116/role"
      })
    ])
  );
  const vectorQualified = withRoles(
    withVectorDeclarations(
      graphFunctionDefault,
      attrs([
        observerHook("abg.plugin_traversal_observer.transform", {
          label: "vector",
          ref: "hook://t116/vector"
        })
      ])
    ),
    [role]
  );

  const vectorSelection = resolvePluginTraversalObserverBinding({
    traversalKind: "transform",
    vector: vectorQualified.graph.vectors[0],
    graphFunction: vectorQualified.graphFunction,
    roles: vectorQualified.job.roles,
    defaultsBundle,
    fallbackEnabled: true
  });
  assert.equal(vectorSelection.source, "graph_vector_declarations");
  assert.equal(vectorSelection.hookRef, "hook://t116/vector");

  const graphFunctionSelection = resolvePluginTraversalObserverBinding({
    traversalKind: "transform",
    vector: graphFunctionDefault.graph.vectors[0],
    graphFunction: graphFunctionDefault.graphFunction,
    roles: [role],
    defaultsBundle,
    fallbackEnabled: true
  });
  assert.equal(graphFunctionSelection.source, "graph_function_declarations");
  assert.equal(graphFunctionSelection.hookRef, "hook://t116/graph-function");

  const roleSelection = resolvePluginTraversalObserverBinding({
    traversalKind: "transform",
    vector: base.graph.vectors[0],
    graphFunction: base.graphFunction,
    roles: [role],
    defaultsBundle,
    fallbackEnabled: true
  });
  assert.equal(roleSelection.source, "role_policy_hooks");
  assert.equal(roleSelection.hookRef, "hook://t116/role");
});

test("T-116 engine emits prompt materialization event only when observer fallback is enabled", () => {
  const defaultsBundle = bundle();
  const { basis } = buildFpBasis();
  const contract = fpDispatchContract();

  const disabledEvents = [];
  runEngineIterate({
    basis,
    eventSink: (event) => disabledEvents.push(event),
    abgFallbackBundle: defaultsBundle,
    plugins: {
      fpDispatch: {
        contract,
        dispatch(input) {
          assert.equal(input.pluginTraversalObserverBinding, null);
          return constructFpDispatchOutcome({
            status: "dispatched",
            resultRef: "result://t116/disabled"
          });
        }
      }
    }
  });
  assert.equal(
    disabledEvents.some(
      (event) => event.kind === "plugin_traversal_prompt_materialized"
    ),
    false
  );

  const enabledEvents = [];
  runEngineIterate({
    basis,
    eventSink: (event) => enabledEvents.push(event),
    abgFallbackBundle: defaultsBundle,
    pluginTraversalObserverFallbackKinds: ["transform"],
    plugins: {
      fpDispatch: {
        contract,
        dispatch(input) {
          assert.equal(
            input.pluginTraversalObserverBinding.binding.observerPromptRef,
            "prompt://abg/reference/generic-transform-observer"
          );
          return constructFpDispatchOutcome({
            status: "dispatched",
            resultRef: "result://t116/enabled"
          });
        }
      }
    }
  });
  const materialized = enabledEvents.filter(
    (event) => event.kind === "plugin_traversal_prompt_materialized"
  );
  assert.equal(materialized.length, 1);
  assertRuntimeEvent(materialized[0]);
  assert.equal(materialized[0].traversalKind, "transform");
  assert.equal(materialized[0].selectionSource, "abg_defaults");
  assert.equal(materialized[0].defaultsBundleDigest, defaultsBundle.bundleDigest);

  const projection = deriveRuntimeAggregateProjection(basis, enabledEvents);
  assert.equal(projection.pluginTraversalPromptMaterializationRefs.length, 1);
  assert.equal(
    projection.pluginTraversalPromptMaterializationRefs[0].observerPromptRef,
    "prompt://abg/reference/generic-transform-observer"
  );
});

test("T-116 observer qualifier and fallback config fail closed when malformed", () => {
  const defaultsBundle = bundle();
  const { basis } = buildFpBasis();

  assert.throws(
    () =>
      resolvePluginTraversalObserverBinding({
        traversalKind: "transform",
        vector: withVectorDeclarations(
          basis,
          attrs([
            scalarAttr(
              "abg.plugin_traversal_observer.transform",
              "prompt://bad"
            )
          ])
        ).graph.vectors[0],
        graphFunction: basis.graphFunction,
        roles: [],
        defaultsBundle,
        fallbackEnabled: true
      }),
    /hook_ref/u
  );

  assert.throws(
    () =>
      resolvePluginTraversalObserverBinding({
        traversalKind: "transform",
        vector: basis.graph.vectors[0],
        graphFunction: basis.graphFunction,
        roles: [
          roleWithPolicyHooks(
            "role://t116/one",
            attrs([
              observerHook("abg.plugin_traversal_observer.transform", {
                label: "one",
                ref: "hook://t116/one"
              })
            ])
          ),
          roleWithPolicyHooks(
            "role://t116/two",
            attrs([
              observerHook("abg.plugin_traversal_observer.transform", {
                label: "two",
                ref: "hook://t116/two"
              })
            ])
          )
        ],
        defaultsBundle,
        fallbackEnabled: true
      }),
    /Multiple role plugin traversal observer defaults/u
  );

  const disabledFallbackBundle = {
    ...defaultsBundle,
    pluginTraversalObserverBindings: {
      ...defaultsBundle.pluginTraversalObserverBindings,
      transform: {
        ...defaultsBundle.pluginTraversalObserverBindings.transform,
        absenceLawful: false
      }
    }
  };
  assert.throws(
    () =>
      resolvePluginTraversalObserverBinding({
        traversalKind: "transform",
        vector: basis.graph.vectors[0],
        graphFunction: basis.graphFunction,
        roles: [],
        defaultsBundle: disabledFallbackBundle,
        fallbackEnabled: true
      }),
    /absence is not lawful/u
  );
});
