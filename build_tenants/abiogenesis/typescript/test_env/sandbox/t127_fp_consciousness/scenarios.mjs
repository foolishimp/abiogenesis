import assert from "node:assert/strict";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

import {
  admitExecutionBasis,
  admitModule,
  admitNode,
  admitPublicStartRequest,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitConstructionIntentCandidate,
  admitConstructionRuntimeEvents,
  constructConstructionActionCatalogProjection,
  constructConstructionActionRefForTraversalTarget,
  constructConstructionActionRow,
  constructConstructionGraphActionInvokedEvent,
  constructConstructionIntentCandidate,
  constructConstructionObservationSnapshot,
  constructConstructionPriorityRule,
  constructConstructionPriorityScheme,
  constructEnvRef,
  constructGraph,
  constructGraphFunction,
  constructObservationPressureRow,
  constructRuntimeFluent,
  constructTemplateRef,
  constructVectorClosedEvent,
  constructVectorEvaluatedEvent,
  deriveConstructionEventCalculusProjection,
  deriveConstructionPriorityProjection,
  deriveConstructionProgressLedgerFromDeltaEvents,
  deriveConstructionProjection,
  deriveObservationToActionBindingProjection,
  edge,
  graphFunctionForVector,
  holdsAt,
  materializeGraphFunction,
  publicGaps
} from "../../../build/semantic/code/src/index.js";
import {
  installPackedTenantPackage,
  provisionInstalledRoot,
  runInstalledNodeScript
} from "../../tests/support/m05-installed-fixtures.mjs";

const EMPTY_ATTRS = Object.freeze({ entries: Object.freeze([]) });

function node(id, name, kind) {
  return admitNode({
    id,
    name,
    schema: { kind: "symbolic", ref: `Vector[${kind}]` },
    markov: ["declared"],
    assetSurface: {
      kind,
      requiredContexts: ["workspace"],
      standardsRefs: [`${kind}-standard`],
      outputContractRefs: [`${kind}-contract`]
    },
    tags: [kind]
  });
}

function jsonAttrValue(value) {
  if (value === null || ["string", "number", "boolean"].includes(typeof value)) {
    return value;
  }
  if (Array.isArray(value)) {
    return Object.freeze({
      kind: "array",
      items: Object.freeze(value.map((entry) => jsonAttrValue(entry)))
    });
  }
  return Object.freeze({
    kind: "object",
    entries: Object.freeze(
      Object.entries(value).map(([key, entry]) =>
        Object.freeze({
          key,
          value: jsonAttrValue(entry)
        })
      )
    )
  });
}

function fpConsciousnessHookAttrs(hookRef, priorityRules) {
  return Object.freeze({
    entries: Object.freeze([
      Object.freeze({
        key: "abg.fp_consciousness",
        value: Object.freeze({
          kind: "hook_ref",
          value: Object.freeze({
            ref: hookRef,
            config: Object.freeze({
              entries: Object.freeze([
                Object.freeze({
                  key: "concerns",
                  value: Object.freeze({
                    kind: "string_list",
                    value: Object.freeze(["priority_scheme"])
                  })
                }),
                Object.freeze({
                  key: "priorityRules",
                  value: Object.freeze({
                    kind: "json_blob",
                    value: jsonAttrValue(priorityRules)
                  })
                })
              ])
            })
          })
        })
      })
    ])
  });
}

function stage(id, source, target, options = {}) {
  const vector = edge([source], target, {
    id: `graph-vector://t127/${id}`,
    name: options.edgeName ?? `${source.name}_to_${target.name}`,
    evaluators: [
      {
        name: options.evaluatorName ?? `${id}_accepted`,
        regime: "F_P",
        description: `${id} accepted`,
        binding: `binding://t127/${id}`,
        tags: ["fulfillment"]
      }
    ],
    declarations: options.vectorDeclarations ?? EMPTY_ATTRS
  }).vectors[0];
  return graphFunctionForVector(vector, {
    name: `t127_${id}`,
    declarations: options.graphFunctionDeclarations ?? EMPTY_ATTRS
  });
}

function jobForGraphFunction(id, graphFunction) {
  return Object.freeze({
    id: `job://t127/${id}`,
    name: `t127_${id}_job`,
    contracts: Object.freeze([
      Object.freeze({
        kind: "graph_function",
        targetId: graphFunction.id
      })
    ]),
    roles: Object.freeze([]),
    tags: Object.freeze(["semantic_work"]),
    policyHooks: EMPTY_ATTRS
  });
}

function runtimeContext(module, options = {}) {
  return Object.freeze({
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: `worker://t127/${module.name}`,
      backendId: "backend://node",
      buildId: `build://t127/${module.name}`,
      resolvedRuntimeRef: "runtime://typescript/node"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: `policy://t127/${module.name}`,
      defaultRegime: "F_P",
      dispatchRef: `dispatch://t127/${module.name}`
    }),
    runId: `run://t127/${module.name}`,
    workKey: `work-key://t127/${module.name}`,
    ...options
  });
}

function moduleForGraphFunctions(name, graphFunctions) {
  return admitModule({
    name,
    graphs: graphFunctions.map((graphFunction) =>
      materializeGraphFunction(graphFunction)
    ),
    graphFunctions,
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: graphFunctions.map((graphFunction, index) =>
      jobForGraphFunction(`${name}/${index}`, graphFunction)
    ),
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: EMPTY_ATTRS,
    metadata: EMPTY_ATTRS
  });
}

function releasePriorityScheme(ref, outcomeRef) {
  return constructConstructionPriorityScheme({
    schemeRef: `construction-priority-scheme://t127/${ref}`,
    sourcePolicyRef: `policy://t127/${ref}`,
    rules: [
      constructConstructionPriorityRule({
        priorityRuleRef: `priority-rule://t127/${ref}/release-blocking`,
        axis: "release_blocking",
        weight: 20,
        appliesToActionKinds: ["invoke_graph_function"],
        appliesToOutcomeRefs: [outcomeRef],
        sourcePolicyRef: `policy://t127/${ref}/release`,
        strategyLabel: "release-blocking"
      })
    ]
  });
}

function priorityRuntimeContext() {
  const input = node("node-t127-priority-input", "Priority Input", "input_set");
  const alphaTarget = node("node-t127-alpha", "Alpha", "design");
  const releaseTarget = node("node-t127-z-release", "Z Release", "code");
  const alpha = stage("priority-alpha", input, alphaTarget);
  const release = stage("priority-release", input, releaseTarget);
  const module = moduleForGraphFunctions("t127_priority_runtime", [alpha, release]);
  return {
    context: runtimeContext(module, {
      constructionPriorityScheme: releasePriorityScheme(
        "configured",
        `typed-asset-outcome:${releaseTarget.id}`
      )
    }),
    alpha,
    release,
    releaseTarget
  };
}

function hookPriorityRuntimeContext() {
  const input = node("node-t127-hook-input", "Hook Input", "input_set");
  const alphaTarget = node("node-t127-hook-alpha", "Hook Alpha", "design");
  const releaseTarget = node("node-t127-hook-z-release", "Hook Release", "code");
  const alpha = stage("hook-alpha", input, alphaTarget);
  const release = stage("hook-release", input, releaseTarget, {
    vectorDeclarations: fpConsciousnessHookAttrs(
      "hook://t127/vector/release-priority",
      [
        {
          priorityRuleRef: "priority-rule://t127/hook/release-blocking",
          axis: "release_blocking",
          weight: 20,
          appliesToActionKinds: ["invoke_graph_function"],
          appliesToOutcomeRefs: [`typed-asset-outcome:${releaseTarget.id}`],
          sourcePolicyRef: "policy://t127/hook/release",
          strategyLabel: "release-blocking"
        }
      ]
    )
  });
  const module = moduleForGraphFunctions("t127_hook_priority_runtime", [
    alpha,
    release
  ]);
  return {
    context: runtimeContext(module),
    alpha,
    release,
    releaseTarget
  };
}

function missingInputRuntimeContext() {
  const input = node("node-t127-missing-input-root", "Root Input", "input_set");
  const design = node("node-t127-missing-design", "Design", "design");
  const authority = node(
    "node-t127-unproduced-authority",
    "Unproduced Authority",
    "policy"
  );
  const release = node("node-t127-missing-release", "Release", "code");
  const designVector = edge([input], design, {
    id: "graph-vector://t127/missing/design",
    name: "input_to_design",
    evaluators: [
      {
        name: "design_complete",
        regime: "F_P",
        description: "design accepted",
        binding: "binding://t127/missing/design",
        tags: ["fulfillment"]
      }
    ],
    declarations: EMPTY_ATTRS
  }).vectors[0];
  const releaseVector = edge([design, authority], release, {
    id: "graph-vector://t127/missing/release",
    name: "design_authority_to_release",
    evaluators: [
      {
        name: "release_complete",
        regime: "F_P",
        description: "release accepted",
        binding: "binding://t127/missing/release",
        tags: ["fulfillment"]
      }
    ],
    declarations: EMPTY_ATTRS
  }).vectors[0];
  const graph = constructGraph({
    name: "t127_missing_input_graph",
    inputs: [input],
    outputs: [release],
    nodes: [input, design, authority, release],
    vectors: [designVector, releaseVector],
    contexts: [],
    rules: [],
    effects: [],
    tags: ["t127_missing_input"]
  });
  const graphFunction = constructGraphFunction({
    name: "t127_missing_input_graph_function",
    environment: constructEnvRef({
      requires: [input],
      provides: [release],
      carries: [input, design, authority, release]
    }),
    inputs: [input],
    outputs: [release],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "inline:t127_missing_input_graph",
      graph,
      version: null
    }),
    effects: [],
    declarations: EMPTY_ATTRS,
    tags: ["t127_missing_input"]
  });
  const module = moduleForGraphFunctions("t127_missing_input_runtime", [
    graphFunction
  ]);
  const context = runtimeContext(module, {
    constructionPriorityScheme: releasePriorityScheme(
      "missing-input",
      `typed-asset-outcome:${release.id}`
    )
  });
  return {
    context,
    graphFunction,
    release,
    authority
  };
}

function publicGapsProjection(context) {
  return publicGaps(
    {
      scope: {
        kind: "workspace",
        workspaceRoot: process.cwd(),
        moduleName: context.module.name
      }
    },
    context
  );
}

function vectorClosureEvents(context, graphFunction, vectorIndex) {
  const startRequest = admitPublicStartRequest({
    scope: {
      kind: "workspace",
      workspaceRoot: process.cwd(),
      moduleName: context.module.name
    },
    target: {
      kind: "graph_function",
      handle: graphFunction.id
    },
    until: "converged"
  });
  const basis = admitExecutionBasis({
    startIntent: startRequest.startIntent,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runId: context.runId,
    workKey: context.workKey,
    frameId: null,
    frameLineageId: null
  });
  return Object.freeze([
    constructVectorEvaluatedEvent({
      basis,
      vectorIndex,
      status: "accepted"
    }),
    constructVectorClosedEvent({
      basis,
      vectorIndex,
      closureKind: "assessed"
    })
  ]);
}

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function writeEvidence(options, scenarioName, evidence) {
  if (options.archiveRoot === undefined) {
    return;
  }
  await mkdir(options.archiveRoot, { recursive: true });
  await writeFile(
    path.join(options.archiveRoot, `${scenarioName}.json`),
    `${JSON.stringify(evidence, null, 2)}\n`,
    "utf8"
  );
}

function parseCliPayload(run) {
  assert.equal(run.status, 0, run.stderr);
  assert.notEqual(run.stdout.trim(), "", run.stderr);
  return JSON.parse(run.stdout);
}

function runCli(targetRoot, packageRoot, args) {
  return spawnSync(
    "node",
    [path.join(packageRoot, "build/semantic/code/src/bin/abiogenesis.js"), ...args],
    {
      cwd: targetRoot,
      encoding: "utf8"
    }
  );
}

async function installRuntime(source) {
  const { targetRoot } = await provisionInstalledRoot();
  const { packageRoot } = await installPackedTenantPackage(targetRoot);
  await mkdir(path.join(targetRoot, ".abiogenesis"), { recursive: true });
  await writeFile(
    path.join(targetRoot, ".abiogenesis", "typescript-runtime.mjs"),
    source,
    "utf8"
  );
  return { targetRoot, packageRoot };
}

async function eventLineCount(targetRoot) {
  const eventLogPath = path.join(
    targetRoot,
    ".ai-workspace",
    "events",
    "events.jsonl"
  );
  if (!(await pathExists(eventLogPath))) {
    return 0;
  }
  const text = await readFile(eventLogPath, "utf8");
  return text.trim().split(/\r?\n/u).filter(Boolean).length;
}

function installedRuntimeSourcePrelude() {
  return `
    import {
      admitModule,
      admitNode,
      admitResolvedPolicyIdentity,
      admitResolvedRuntimeIdentity,
      constructConstructionPriorityRule,
      constructConstructionPriorityScheme,
      constructEnvRef,
      constructGraph,
      constructGraphFunction,
      constructTemplateRef,
      edge,
      graphFunctionForVector,
      materializeGraphFunction
    } from "@abiogenesis/typescript-tenant";

    const EMPTY_ATTRS = Object.freeze({ entries: Object.freeze([]) });

    function node(id, name, kind) {
      return admitNode({
        id,
        name,
        schema: { kind: "symbolic", ref: \`Vector[\${kind}]\` },
        markov: ["declared"],
        assetSurface: {
          kind,
          requiredContexts: ["workspace"],
          standardsRefs: [\`\${kind}-standard\`],
          outputContractRefs: [\`\${kind}-contract\`]
        },
        tags: [kind]
      });
    }

    function jsonAttrValue(value) {
      if (value === null || ["string", "number", "boolean"].includes(typeof value)) {
        return value;
      }
      if (Array.isArray(value)) {
        return Object.freeze({
          kind: "array",
          items: Object.freeze(value.map((entry) => jsonAttrValue(entry)))
        });
      }
      return Object.freeze({
        kind: "object",
        entries: Object.freeze(
          Object.entries(value).map(([key, entry]) =>
            Object.freeze({ key, value: jsonAttrValue(entry) })
          )
        )
      });
    }

    function fpConsciousnessHookAttrs(hookRef, priorityRules) {
      return Object.freeze({
        entries: Object.freeze([
          Object.freeze({
            key: "abg.fp_consciousness",
            value: Object.freeze({
              kind: "hook_ref",
              value: Object.freeze({
                ref: hookRef,
                config: Object.freeze({
                  entries: Object.freeze([
                    Object.freeze({
                      key: "concerns",
                      value: Object.freeze({
                        kind: "string_list",
                        value: Object.freeze(["priority_scheme"])
                      })
                    }),
                    Object.freeze({
                      key: "priorityRules",
                      value: Object.freeze({
                        kind: "json_blob",
                        value: jsonAttrValue(priorityRules)
                      })
                    })
                  ])
                })
              })
            })
          })
        ])
      });
    }

    function stage(id, source, target, options = {}) {
      const vector = edge([source], target, {
        id: \`graph-vector://t127-live/\${id}\`,
        name: options.edgeName ?? \`\${source.name}_to_\${target.name}\`,
        evaluators: [
          {
            name: options.evaluatorName ?? \`\${id}_accepted\`,
            regime: "F_P",
            description: \`\${id} accepted\`,
            binding: \`binding://t127-live/\${id}\`,
            tags: ["fulfillment"]
          }
        ],
        declarations: options.vectorDeclarations ?? EMPTY_ATTRS
      }).vectors[0];
      return graphFunctionForVector(vector, {
        name: \`t127_live_\${id}\`,
        declarations: options.graphFunctionDeclarations ?? EMPTY_ATTRS
      });
    }

    function jobForGraphFunction(id, graphFunction) {
      return Object.freeze({
        id: \`job://t127-live/\${id}\`,
        name: \`t127_live_\${id}_job\`,
        contracts: Object.freeze([
          Object.freeze({ kind: "graph_function", targetId: graphFunction.id })
        ]),
        roles: Object.freeze([]),
        tags: Object.freeze(["semantic_work"]),
        policyHooks: EMPTY_ATTRS
      });
    }

    function runtimeBindingFor(name, graphFunctions, options = {}) {
      return Object.freeze({
        module: admitModule({
          name,
          graphs: graphFunctions.map((graphFunction) =>
            materializeGraphFunction(graphFunction)
          ),
          graphFunctions,
          refinementBoundaries: [],
          candidateFamilies: [],
          jobs: graphFunctions.map((graphFunction, index) =>
            jobForGraphFunction(\`\${name}/\${index}\`, graphFunction)
          ),
          roles: [],
          operators: [],
          evaluators: [],
          rules: [],
          imports: [],
          policyHooks: EMPTY_ATTRS,
          metadata: EMPTY_ATTRS
        }),
        runtimeIdentity: admitResolvedRuntimeIdentity({
          workerId: \`worker://t127-live/\${name}\`,
          backendId: "backend://node",
          buildId: \`build://t127-live/\${name}\`,
          resolvedRuntimeRef: "runtime://typescript/node"
        }),
        resolvedPolicy: admitResolvedPolicyIdentity({
          resolvedPolicyBundleRef: \`policy://t127-live/\${name}\`,
          defaultRegime: "F_P",
          dispatchRef: \`dispatch://t127-live/\${name}\`
        }),
        runId: \`run://t127-live/\${name}\`,
        workKey: \`work-key://t127-live/\${name}\`,
        ...options
      });
    }
  `;
}

function installedPriorityRuntimeSource() {
  return `
    ${installedRuntimeSourcePrelude()}
    const input = node("node-t127-live-priority-input", "Priority Input", "input_set");
    const alphaTarget = node("node-t127-live-alpha", "Alpha", "design");
    const releaseTarget = node("node-t127-live-z-release", "Z Release", "code");
    const alpha = stage("priority-alpha", input, alphaTarget);
    const release = stage("priority-release", input, releaseTarget);

    export const runtimeBinding = runtimeBindingFor(
      "t127_live_priority_runtime",
      [alpha, release],
      {
        constructionPriorityScheme: constructConstructionPriorityScheme({
          schemeRef: "construction-priority-scheme://t127-live/configured",
          sourcePolicyRef: "policy://t127-live/configured",
          rules: [
            constructConstructionPriorityRule({
              priorityRuleRef: "priority-rule://t127-live/configured/release-blocking",
              axis: "release_blocking",
              weight: 20,
              appliesToActionKinds: ["invoke_graph_function"],
              appliesToOutcomeRefs: [\`typed-asset-outcome:\${releaseTarget.id}\`],
              sourcePolicyRef: "policy://t127-live/configured/release",
              strategyLabel: "release-blocking"
            })
          ]
        })
      }
    );
  `;
}

function installedHookRuntimeSource() {
  return `
    ${installedRuntimeSourcePrelude()}
    const input = node("node-t127-live-hook-input", "Hook Input", "input_set");
    const alphaTarget = node("node-t127-live-hook-alpha", "Hook Alpha", "design");
    const releaseTarget = node("node-t127-live-hook-z-release", "Hook Release", "code");
    const alpha = stage("hook-alpha", input, alphaTarget);
    const release = stage("hook-release", input, releaseTarget, {
      vectorDeclarations: fpConsciousnessHookAttrs(
        "hook://t127-live/vector/release-priority",
        [
          {
            priorityRuleRef: "priority-rule://t127-live/hook/release-blocking",
            axis: "release_blocking",
            weight: 20,
            appliesToActionKinds: ["invoke_graph_function"],
            appliesToOutcomeRefs: [\`typed-asset-outcome:\${releaseTarget.id}\`],
            sourcePolicyRef: "policy://t127-live/hook/release",
            strategyLabel: "release-blocking"
          }
        ]
      )
    });

    export const runtimeBinding = runtimeBindingFor(
      "t127_live_hook_priority_runtime",
      [alpha, release]
    );
  `;
}

function installedMissingInputRuntimeSource() {
  return `
    ${installedRuntimeSourcePrelude()}
    const input = node("node-t127-live-missing-input-root", "Root Input", "input_set");
    const design = node("node-t127-live-missing-design", "Design", "design");
    const authority = node(
      "node-t127-live-unproduced-authority",
      "Unproduced Authority",
      "policy"
    );
    const release = node("node-t127-live-missing-release", "Release", "code");
    const designVector = edge([input], design, {
      id: "graph-vector://t127-live/missing/design",
      name: "input_to_design",
      evaluators: [
        {
          name: "design_complete",
          regime: "F_P",
          description: "design accepted",
          binding: "binding://t127-live/missing/design",
          tags: ["fulfillment"]
        }
      ],
      declarations: EMPTY_ATTRS
    }).vectors[0];
    const releaseVector = edge([design, authority], release, {
      id: "graph-vector://t127-live/missing/release",
      name: "design_authority_to_release",
      evaluators: [
        {
          name: "release_complete",
          regime: "F_P",
          description: "release accepted",
          binding: "binding://t127-live/missing/release",
          tags: ["fulfillment"]
        }
      ],
      declarations: EMPTY_ATTRS
    }).vectors[0];
    const graph = constructGraph({
      name: "t127_live_missing_input_graph",
      inputs: [input],
      outputs: [release],
      nodes: [input, design, authority, release],
      vectors: [designVector, releaseVector],
      contexts: [],
      rules: [],
      effects: [],
      tags: ["t127_missing_input"]
    });
    const graphFunction = constructGraphFunction({
      name: "t127_live_missing_input_graph_function",
      environment: constructEnvRef({
        requires: [input],
        provides: [release],
        carries: [input, design, authority, release]
      }),
      inputs: [input],
      outputs: [release],
      template: constructTemplateRef({
        kind: "inline_graph",
        ref: "inline:t127_live_missing_input_graph",
        graph,
        version: null
      }),
      effects: [],
      declarations: EMPTY_ATTRS,
      tags: ["t127_missing_input"]
    });

    export const runtimeBinding = runtimeBindingFor(
      "t127_live_missing_input_runtime",
      [graphFunction],
      {
        constructionPriorityScheme: constructConstructionPriorityScheme({
          schemeRef: "construction-priority-scheme://t127-live/missing-input",
          sourcePolicyRef: "policy://t127-live/missing-input",
          rules: [
            constructConstructionPriorityRule({
              priorityRuleRef: "priority-rule://t127-live/missing/release-blocking",
              axis: "release_blocking",
              weight: 20,
              appliesToActionKinds: ["invoke_graph_function"],
              appliesToOutcomeRefs: [\`typed-asset-outcome:\${release.id}\`],
              sourcePolicyRef: "policy://t127-live/missing/release",
              strategyLabel: "release-blocking"
            })
          ]
        })
      }
    );
  `;
}

function closeVectorScript(vectorIndex) {
  return `
    import { appendFile, mkdir } from "node:fs/promises";
    import {
      admitExecutionBasis,
      admitPublicStartRequest,
      constructVectorClosedEvent,
      constructVectorEvaluatedEvent
    } from "@abiogenesis/typescript-tenant";
    import { runtimeBinding } from "./typescript-runtime.mjs";

    const startRequest = admitPublicStartRequest({
      scope: {
        kind: "workspace",
        workspaceRoot: process.cwd(),
        moduleName: runtimeBinding.module.name
      },
      target: {
        kind: "graph_function",
        handle: runtimeBinding.module.graphFunctions[0].id
      },
      until: "converged"
    });
    const basis = admitExecutionBasis({
      startIntent: startRequest.startIntent,
      module: runtimeBinding.module,
      runtimeIdentity: runtimeBinding.runtimeIdentity,
      resolvedPolicy: runtimeBinding.resolvedPolicy,
      runId: runtimeBinding.runId,
      workKey: runtimeBinding.workKey,
      frameId: null,
      frameLineageId: null
    });
    const events = [
      constructVectorEvaluatedEvent({
        basis,
        vectorIndex: ${vectorIndex},
        status: "accepted"
      }),
      constructVectorClosedEvent({
        basis,
        vectorIndex: ${vectorIndex},
        closureKind: "assessed"
      })
    ];
    await mkdir(".ai-workspace/events", { recursive: true });
    await appendFile(
      ".ai-workspace/events/events.jsonl",
      events.map((event) => JSON.stringify(event)).join("\\n") + "\\n",
      "utf8"
    );
    console.log(JSON.stringify({ appended: events.map((event) => event.kind) }));
  `;
}

function assertPriorityProjection(projection, expected) {
  assert.equal(projection.eventCount, expected.eventCount ?? 0);
  assert.equal(projection.readOnlyEvaluator.mutationAllowed, false);
  assert.equal(projection.readOnlyEvaluator.bestAssetRef, expected.bestAssetRef);
  assert.equal(
    projection.readOnlyEvaluator.bestGraphFunctionRef,
    expected.bestGraphFunctionRef
  );
  const alphaGap = projection.gaps
    .find((gap) => gap.graphFunctionId === expected.alphaGraphFunctionRef)
    ?.typedAssetGaps.at(0);
  const releaseGap = projection.gaps
    .find((gap) => gap.graphFunctionId === expected.releaseGraphFunctionRef)
    ?.typedAssetGaps.at(0);
  assert.ok(alphaGap);
  assert.ok(releaseGap);
  assert.equal(releaseGap.priorityRank, 0);
  assert.equal(alphaGap.priorityRank, 1);
  assert.equal(releaseGap.bestActionRef, projection.readOnlyEvaluator.bestActionRef);
  assert.equal(
    projection.readOnlyEvaluator.evaluatorRef,
    releaseGap.priorityProjectionRef
  );
  assert.ok(
    releaseGap.rankingReasonRefs.includes(expected.priorityRuleRef),
    JSON.stringify(releaseGap.rankingReasonRefs)
  );
}

function assertCliPriorityProjection(payload, expected) {
  assert.equal(payload.event_count, 0);
  assert.equal(payload.read_only_evaluator.mutation_allowed, false);
  assert.equal(payload.read_only_evaluator.best_asset_ref, expected.bestAssetRef);
  assert.equal(
    payload.read_only_evaluator.best_graph_function_ref,
    expected.bestGraphFunctionRef
  );
  const alphaGap = payload.gaps
    .find((gap) => gap.graph_function_id === expected.alphaGraphFunctionRef)
    ?.typed_asset_gaps.at(0);
  const releaseGap = payload.gaps
    .find((gap) => gap.graph_function_id === expected.releaseGraphFunctionRef)
    ?.typed_asset_gaps.at(0);
  assert.ok(alphaGap);
  assert.ok(releaseGap);
  assert.equal(releaseGap.priority_rank, 0);
  assert.equal(alphaGap.priority_rank, 1);
  assert.equal(
    releaseGap.best_action_ref,
    payload.read_only_evaluator.best_action_ref
  );
  assert.ok(
    releaseGap.ranking_reason_refs.includes(expected.priorityRuleRef),
    JSON.stringify(releaseGap.ranking_reason_refs)
  );
}

async function runInstalledPriorityScenario(options, source, expected) {
  const { targetRoot, packageRoot } = await installRuntime(source);
  const run = runCli(targetRoot, packageRoot, [
    "gaps",
    "--workspace",
    ".",
    "--scope",
    "workspace"
  ]);
  const payload = parseCliPayload(run);
  assertCliPriorityProjection(payload, expected(payload));
  assert.equal(await eventLineCount(targetRoot), 0);
  await writeEvidence(options, expected(payload).scenarioName, {
    mode: "live",
    targetRoot,
    bestAssetRef: payload.read_only_evaluator.best_asset_ref,
    bestGraphFunctionRef: payload.read_only_evaluator.best_graph_function_ref,
    eventCount: payload.event_count
  });
  return payload;
}

export async function runConfiguredPriorityScenario(options = {}) {
  if (options.mode === "live") {
    return runInstalledPriorityScenario(
      options,
      installedPriorityRuntimeSource(),
      (payload) => {
        const releaseGap = payload.gaps.find((gap) =>
          gap.typed_asset_gaps.some(
            (row) => row.asset_ref === "node-t127-live-z-release"
          )
        );
        const alphaGap = payload.gaps.find((gap) =>
          gap.typed_asset_gaps.some((row) => row.asset_ref === "node-t127-live-alpha")
        );
        assert.ok(releaseGap);
        assert.ok(alphaGap);
        return {
          scenarioName: "01-configured-priority-live",
          bestAssetRef: "node-t127-live-z-release",
          bestGraphFunctionRef: releaseGap.graph_function_id,
          alphaGraphFunctionRef: alphaGap.graph_function_id,
          releaseGraphFunctionRef: releaseGap.graph_function_id,
          priorityRuleRef: "priority-rule://t127-live/configured/release-blocking"
        };
      }
    );
  }

  const { context, alpha, release, releaseTarget } = priorityRuntimeContext();
  const projection = publicGapsProjection(context);
  assertPriorityProjection(projection, {
    bestAssetRef: releaseTarget.id,
    bestGraphFunctionRef: release.id,
    alphaGraphFunctionRef: alpha.id,
    releaseGraphFunctionRef: release.id,
    priorityRuleRef: "priority-rule://t127/configured/release-blocking"
  });
  await writeEvidence(options, "01-configured-priority-sandbox", {
    mode: options.mode ?? "sandbox",
    bestAssetRef: projection.readOnlyEvaluator.bestAssetRef,
    bestGraphFunctionRef: projection.readOnlyEvaluator.bestGraphFunctionRef,
    eventCount: projection.eventCount
  });
  return projection;
}

export async function runHookPriorityScenario(options = {}) {
  if (options.mode === "live") {
    return runInstalledPriorityScenario(
      options,
      installedHookRuntimeSource(),
      (payload) => {
        const releaseGap = payload.gaps.find((gap) =>
          gap.typed_asset_gaps.some(
            (row) => row.asset_ref === "node-t127-live-hook-z-release"
          )
        );
        const alphaGap = payload.gaps.find((gap) =>
          gap.typed_asset_gaps.some(
            (row) => row.asset_ref === "node-t127-live-hook-alpha"
          )
        );
        assert.ok(releaseGap);
        assert.ok(alphaGap);
        return {
          scenarioName: "02-hook-priority-live",
          bestAssetRef: "node-t127-live-hook-z-release",
          bestGraphFunctionRef: releaseGap.graph_function_id,
          alphaGraphFunctionRef: alphaGap.graph_function_id,
          releaseGraphFunctionRef: releaseGap.graph_function_id,
          priorityRuleRef: "priority-rule://t127-live/hook/release-blocking"
        };
      }
    );
  }

  const { context, alpha, release, releaseTarget } = hookPriorityRuntimeContext();
  const projection = publicGapsProjection(context);
  assertPriorityProjection(projection, {
    bestAssetRef: releaseTarget.id,
    bestGraphFunctionRef: release.id,
    alphaGraphFunctionRef: alpha.id,
    releaseGraphFunctionRef: release.id,
    priorityRuleRef: "priority-rule://t127/hook/release-blocking"
  });
  await writeEvidence(options, "02-hook-priority-sandbox", {
    mode: options.mode ?? "sandbox",
    bestAssetRef: projection.readOnlyEvaluator.bestAssetRef,
    bestGraphFunctionRef: projection.readOnlyEvaluator.bestGraphFunctionRef,
    rankingReasonRefs: projection.readOnlyEvaluator.rankingReasonRefs
  });
  return projection;
}

function assertMissingInputProjection(projection, expected) {
  assert.equal(projection.eventCount, 2);
  assert.equal(projection.readOnlyEvaluator.bestAssetRef, expected.releaseAssetRef);
  assert.equal(projection.readOnlyEvaluator.bestActionRef, null);
  assert.equal(projection.readOnlyEvaluator.bestGraphFunctionRef, null);
  assert.ok(
    projection.readOnlyEvaluator.admissionBlockerRefs.includes(
      `missing-input:${expected.missingAssetRef}`
    ),
    JSON.stringify(projection.readOnlyEvaluator.admissionBlockerRefs)
  );
  const typedGap = projection.gaps[0]?.typedAssetGaps.at(0);
  assert.ok(typedGap);
  assert.equal(typedGap.assetRef, expected.releaseAssetRef);
  assert.deepEqual(typedGap.eligibleActionRefs, []);
  assert.equal(typedGap.bestActionRef, null);
  assert.ok(
    typedGap.admissionBlockerRefs.includes(
      `missing-input:${expected.missingAssetRef}`
    ),
    JSON.stringify(typedGap.admissionBlockerRefs)
  );
}

function assertCliMissingInputProjection(payload, expected) {
  assert.equal(payload.event_count, 2);
  assert.equal(payload.read_only_evaluator.best_asset_ref, expected.releaseAssetRef);
  assert.equal(payload.read_only_evaluator.best_action_ref, null);
  assert.equal(payload.read_only_evaluator.best_graph_function_ref, null);
  assert.ok(
    payload.read_only_evaluator.admission_blocker_refs.includes(
      `missing-input:${expected.missingAssetRef}`
    ),
    JSON.stringify(payload.read_only_evaluator.admission_blocker_refs)
  );
  const typedGap = payload.gaps[0]?.typed_asset_gaps.at(0);
  assert.ok(typedGap);
  assert.equal(typedGap.asset_ref, expected.releaseAssetRef);
  assert.deepEqual(typedGap.eligible_action_refs, []);
  assert.equal(typedGap.best_action_ref, null);
}

export async function runMissingInputAdmissionScenario(options = {}) {
  if (options.mode === "live") {
    const { targetRoot, packageRoot } = await installRuntime(
      installedMissingInputRuntimeSource()
    );
    const closeFirst = await runInstalledNodeScript(targetRoot, closeVectorScript(0));
    assert.equal(closeFirst.status, 0, closeFirst.stderr);
    const run = runCli(targetRoot, packageRoot, [
      "gaps",
      "--workspace",
      ".",
      "--scope",
      "workspace"
    ]);
    const payload = parseCliPayload(run);
    assertCliMissingInputProjection(payload, {
      releaseAssetRef: "node-t127-live-missing-release",
      missingAssetRef: "node-t127-live-unproduced-authority"
    });
    assert.equal(await eventLineCount(targetRoot), 2);
    await writeEvidence(options, "03-missing-input-live", {
      mode: "live",
      targetRoot,
      bestAssetRef: payload.read_only_evaluator.best_asset_ref,
      admissionBlockerRefs:
        payload.read_only_evaluator.admission_blocker_refs
    });
    return payload;
  }

  const { context, graphFunction, release, authority } = missingInputRuntimeContext();
  const events = vectorClosureEvents(context, graphFunction, 0);
  const projection = publicGapsProjection(
    runtimeContext(context.module, {
      runtimeEvents: events,
      constructionPriorityScheme: context.constructionPriorityScheme,
      runId: context.runId,
      workKey: context.workKey
    })
  );
  assertMissingInputProjection(projection, {
    releaseAssetRef: release.id,
    missingAssetRef: authority.id
  });
  await writeEvidence(options, "03-missing-input-sandbox", {
    mode: options.mode ?? "sandbox",
    bestAssetRef: projection.readOnlyEvaluator.bestAssetRef,
    admissionBlockerRefs: projection.readOnlyEvaluator.admissionBlockerRefs
  });
  return projection;
}

function bootstrapConstructionWorld(input = {}) {
  const suffix = input.suffix ?? "bootstrap-induction";
  const episodeId = input.episodeId ?? `construction-episode://t127/${suffix}`;
  const observationId = `construction-observation://t127/${suffix}/0`;
  const catalogRef = `construction-catalog://t127/${suffix}`;
  const inductionOutcome = "typed-asset-outcome:asset://workspace/typed-assets";
  const inductionAction = constructConstructionActionRow({
    actionRef: constructConstructionActionRefForTraversalTarget({
      graphFunctionRef: "graph-function://t127/induce-assets",
      graphVectorRef: "graph-vector://t127/induce-assets"
    }),
    actionKind: "invoke_graph_function",
    graphFunctionRef: "graph-function://t127/induce-assets",
    graphVectorRef: "graph-vector://t127/induce-assets",
    publishedTraversalTargetRef: "graph-function://t127/induce-assets",
    targetOutcomeRef: inductionOutcome,
    inputAssetRefs: ["asset://workspace/root"],
    expectedOutputAssetRefs: ["asset://workspace/typed-assets"],
    requiredAuthorityRefs: ["requirement://t127/typed-asset-induction"],
    eligibleReasonRefs: ["eligible://t127/published-graph-function"]
  });
  const lowerAction = constructConstructionActionRow({
    actionRef: "construction-action://t127/lower-value-cleanup",
    actionKind: "invoke_graph_function",
    graphFunctionRef: "graph-function://t127/cleanup",
    graphVectorRef: "graph-vector://t127/cleanup",
    publishedTraversalTargetRef: "graph-function://t127/cleanup",
    targetOutcomeRef: "typed-asset-outcome:asset://workspace/cleanup",
    inputAssetRefs: ["asset://workspace/root"],
    expectedOutputAssetRefs: ["asset://workspace/cleanup"],
    requiredAuthorityRefs: ["requirement://t127/cleanup"],
    eligibleReasonRefs: ["eligible://t127/cleanup"]
  });
  const catalog = constructConstructionActionCatalogProjection({
    catalogRef,
    episodeId,
    hookResolutionRef: "construction-hook-resolution://t127/bootstrap",
    fallbackConfigDigest: "sha256:t127-bootstrap-fallback",
    rows: [lowerAction, inductionAction]
  });
  const observation = constructConstructionObservationSnapshot({
    episodeId,
    observationId,
    basisRef: `basis://t127/${suffix}`,
    currentProjectionRef: `runtime-projection://t127/${suffix}/0`,
    iterationOrdinal: 0,
    basisProjectionRef: `basis-projection://t127/${suffix}/0`,
    priorIntentId: null,
    causationRef: "causation://t127/bootstrap",
    correlationId: "correlation://t127/bootstrap",
    linkedAssetRefs: ["asset://workspace/root"],
    actionCatalogRef: catalog.catalogRef,
    authorityDigest: "sha256:t127-bootstrap-authority",
    pressureRows: [
      constructObservationPressureRow({
        pressureRef: "pressure://t127/bootstrap/typed-asset-gap",
        pressureKind: "gap_row",
        sourceRef: "public-gaps://t127/bootstrap",
        affectedAssetRefs: ["asset://workspace/typed-assets"],
        targetOutcomeRefs: [inductionOutcome],
        evidenceRefs: ["gap://t127/bootstrap/untyped-assets"],
        severity: 8,
        ambiguityClass: "requires_fp_judgment",
        authorityRefs: ["requirement://t127/typed-asset-induction"]
      })
    ]
  });
  const binding = deriveObservationToActionBindingProjection({
    observation,
    actionCatalog: catalog
  });
  const priority = deriveConstructionPriorityProjection({
    observation,
    actionCatalog: catalog,
    bindingProjection: binding,
    priorityScheme: constructConstructionPriorityScheme({
      schemeRef: "construction-priority-scheme://t127/bootstrap-induction",
      sourcePolicyRef: "policy://t127/bootstrap-induction",
      rules: [
        constructConstructionPriorityRule({
          priorityRuleRef: "priority-rule://t127/bootstrap/induce-assets",
          axis: "highest_expected_delta",
          weight: 30,
          appliesToActionKinds: ["invoke_graph_function"],
          appliesToOutcomeRefs: [inductionOutcome],
          sourcePolicyRef: "policy://t127/bootstrap/induce-assets",
          strategyLabel: "bootstrap-typed-asset-induction"
        })
      ]
    })
  });
  return { episodeId, observation, catalog, binding, priority, inductionAction };
}

export async function runBootstrapInductionScenario(options = {}) {
  const world = bootstrapConstructionWorld();
  const priorityRow = world.priority.rows[0];
  assert.ok(priorityRow);
  assert.equal(priorityRow.actionRef, world.inductionAction.actionRef);
  const candidate = constructConstructionIntentCandidate({
    candidateId: "candidate://t127/bootstrap/induce-assets",
    episodeId: world.episodeId,
    rank: priorityRow.rankOrdinal,
    valueScore: 30,
    priorityScore: priorityRow.finalScore,
    selectedActionRef: priorityRow.actionRef,
    selectedBindingRef: priorityRow.bindingRef,
    selectedOutcomeRef: priorityRow.targetOutcomeRef,
    targetGraphFunctionRef: world.inductionAction.graphFunctionRef,
    targetVectorRef: world.inductionAction.graphVectorRef,
    inputAssetRefs: world.inductionAction.inputAssetRefs,
    expectedOutputAssetRefs: world.inductionAction.expectedOutputAssetRefs,
    gapRefs: ["gap://t127/bootstrap/untyped-assets"],
    obligationRefs: ["obligation://t127/bootstrap/typed-asset-induction"],
    lawfulBasisRefs: ["law://t127/published-graph-function"]
  });
  const admission = admitConstructionIntentCandidate({
    candidate,
    observation: world.observation,
    actionCatalog: world.catalog,
    bindingProjection: world.binding,
    priorityProjection: world.priority
  });
  assert.equal(admission.decision, "admitted");
  assert.ok(admission.admittedIntent);
  assert.equal(
    admission.admittedIntent.selectedGraphFunctionRef,
    "graph-function://t127/induce-assets"
  );
  const invoked = constructConstructionGraphActionInvokedEvent({
    constructionEventRef: "event://t127/bootstrap/graph-action-invoked",
    admittedIntent: admission.admittedIntent,
    basisId: "basis://t127/bootstrap-induction",
    graphFunctionId: "graph-function://t127/bootstrap-construction",
    runId: "run://t127/bootstrap-induction",
    workKey: "work-key://t127/bootstrap-induction",
    eventSequence: 5,
    graphCallId: "graph-call://t127/bootstrap-induction",
    frameId: "frame://t127/bootstrap-induction",
    continuationId: "continuation://t127/bootstrap-induction"
  });
  assert.deepEqual(invoked.causationEventRefs, [admission.admissionRef]);
  assert.doesNotThrow(() =>
    admitConstructionRuntimeEvents({
      episodeId: world.episodeId,
      events: [
        constructionEvent("construction_episode_started", {
          constructionEventRef: "event://t127/bootstrap/episode-started",
          eventSequence: 0,
          episodeId: world.episodeId,
          basisId: "basis://t127/bootstrap-induction",
          graphFunctionId: "graph-function://t127/bootstrap-construction",
          runId: "run://t127/bootstrap-induction",
          workKey: "work-key://t127/bootstrap-induction",
          basisProjectionRef: world.observation.basisProjectionRef,
          startProjectionRef: "construction-projection://t127/bootstrap/start"
        }),
        constructionEvent("construction_evaluator_invoked", {
          constructionEventRef: "event://t127/bootstrap/evaluator-invoked",
          eventSequence: 1,
          episodeId: world.episodeId,
          basisId: "basis://t127/bootstrap-induction",
          graphFunctionId: "graph-function://t127/bootstrap-construction",
          runId: "run://t127/bootstrap-induction",
          workKey: "work-key://t127/bootstrap-induction",
          basisProjectionRef: world.observation.basisProjectionRef,
          observationId: world.observation.observationId,
          catalogRef: world.catalog.catalogRef,
          evaluatorPluginRef: "evaluator-plugin://t127/bootstrap",
          inputDigest: "sha256:t127-bootstrap-evaluator-input"
        }),
        constructionEvent("construction_intent_candidate_returned", {
          constructionEventRef: "event://t127/bootstrap/candidate-returned",
          eventSequence: 2,
          episodeId: world.episodeId,
          basisId: "basis://t127/bootstrap-induction",
          graphFunctionId: "graph-function://t127/bootstrap-construction",
          runId: "run://t127/bootstrap-induction",
          workKey: "work-key://t127/bootstrap-induction",
          basisProjectionRef: world.observation.basisProjectionRef,
          evaluatorPluginRef: "evaluator-plugin://t127/bootstrap",
          evaluatorOutcomeRef: "evaluator-outcome://t127/bootstrap",
          candidateSetDigest: "sha256:t127-bootstrap-candidates",
          candidateRefs: [candidate.candidateId]
        }),
        constructionEvent("construction_intent_candidate_admitted", {
          constructionEventRef: "event://t127/bootstrap/candidate-admitted",
          eventSequence: 3,
          episodeId: world.episodeId,
          basisId: "basis://t127/bootstrap-induction",
          graphFunctionId: "graph-function://t127/bootstrap-construction",
          runId: "run://t127/bootstrap-induction",
          workKey: "work-key://t127/bootstrap-induction",
          basisProjectionRef: world.observation.basisProjectionRef,
          candidateId: admission.candidateId,
          admissionRef: admission.admissionRef,
          intentId: admission.admittedIntent.intentId,
          authorityRefs: admission.admittedIntent.authorityRefs
        }),
        constructionEvent("construction_intent_selected", {
          constructionEventRef: "event://t127/bootstrap/intent-selected",
          eventSequence: 4,
          episodeId: world.episodeId,
          basisId: "basis://t127/bootstrap-induction",
          graphFunctionId: "graph-function://t127/bootstrap-construction",
          runId: "run://t127/bootstrap-induction",
          workKey: "work-key://t127/bootstrap-induction",
          basisProjectionRef: world.observation.basisProjectionRef,
          intentId: admission.admittedIntent.intentId,
          selectedActionRef: admission.admittedIntent.selectedActionRef,
          selectedBindingRef: admission.admittedIntent.selectedBindingRef,
          selectionPolicyRef: "policy://t127/bootstrap-induction"
        }),
        invoked
      ]
    })
  );
  const projection = deriveConstructionProjection({
    episodeId: world.episodeId,
    priorityProjection: world.priority,
    admissions: [admission],
    actionCatalog: world.catalog
  });
  assert.equal(projection.publicState, "construction_progressing_yield");
  assert.equal(projection.nextActionRef, world.inductionAction.actionRef);
  await writeEvidence(options, "04-bootstrap-induction", {
    mode: options.mode ?? "sandbox",
    selectedGraphFunctionRef:
      admission.admittedIntent.selectedGraphFunctionRef,
    invokedGraphCallId: invoked.graphCallId,
    publicState: projection.publicState,
    nextActionRef: projection.nextActionRef
  });
  return projection;
}

const RECURSIVE_EPISODE_ID = "construction-episode://t127/recursive-replay";
const RECURSIVE_BASIS_ID = "basis://t127/recursive-replay";
const RECURSIVE_GRAPH_FUNCTION_ID = "graph-function://t127/recursive-replay";
const RECURSIVE_RUN_ID = "run://t127/recursive-replay";
const RECURSIVE_WORK_KEY = "work-key://t127/recursive-replay";

function constructionEvent(kind, input = {}) {
  return Object.freeze({
    kind,
    constructionEventRef:
      input.constructionEventRef ?? `event://t127/recursive/${input.eventSequence}`,
    basisId: input.basisId ?? RECURSIVE_BASIS_ID,
    graphFunctionId: input.graphFunctionId ?? RECURSIVE_GRAPH_FUNCTION_ID,
    runId: input.runId ?? RECURSIVE_RUN_ID,
    workKey: input.workKey ?? RECURSIVE_WORK_KEY,
    episodeId: input.episodeId ?? RECURSIVE_EPISODE_ID,
    iterationOrdinal: input.iterationOrdinal ?? 0,
    eventSequence: input.eventSequence ?? 0,
    basisProjectionRef:
      input.basisProjectionRef ?? "basis-projection://t127/recursive-replay/0",
    priorIntentId: input.priorIntentId ?? null,
    causationEventRefs: input.causationEventRefs ?? ["event://t127/root"],
    correlationId: input.correlationId ?? "correlation://t127/recursive-replay",
    ...input
  });
}

function recursiveReplayEvents() {
  const intent1 = "construction-intent://t127/recursive/1";
  const intent2 = "construction-intent://t127/recursive/2";
  return Object.freeze([
    constructionEvent("construction_episode_started", {
      constructionEventRef: "event://t127/recursive/episode-started",
      eventSequence: 1,
      startProjectionRef: "construction-projection://t127/recursive/start"
    }),
    constructionEvent("construction_evaluator_invoked", {
      constructionEventRef: "event://t127/recursive/evaluator-invoked/1",
      eventSequence: 2,
      observationId: "construction-observation://t127/recursive/1",
      catalogRef: "construction-catalog://t127/recursive/1",
      evaluatorPluginRef: "evaluator-plugin://t127/fp-consciousness",
      inputDigest: "sha256:recursive-evaluator-input-1"
    }),
    constructionEvent("construction_intent_candidate_returned", {
      constructionEventRef: "event://t127/recursive/candidate-returned/1",
      eventSequence: 3,
      evaluatorPluginRef: "evaluator-plugin://t127/fp-consciousness",
      evaluatorOutcomeRef: "evaluator-outcome://t127/recursive/1",
      candidateSetDigest: "sha256:recursive-candidates-1",
      candidateRefs: ["candidate://t127/recursive/1"]
    }),
    constructionEvent("construction_intent_candidate_admitted", {
      constructionEventRef: "event://t127/recursive/candidate-admitted/1",
      eventSequence: 4,
      candidateId: "candidate://t127/recursive/1",
      admissionRef: "construction-admission://t127/recursive/1",
      intentId: intent1,
      authorityRefs: ["law://t127/recursive/repair"],
      selectedActionRef: "action://t127/recursive/repair",
      selectedBindingRef: "binding://t127/recursive/repair",
      selectedOutcomeRef: "outcome://t127/recursive/repair"
    }),
    constructionEvent("construction_intent_selected", {
      constructionEventRef: "event://t127/recursive/intent-selected/1",
      eventSequence: 5,
      intentId: intent1,
      selectedActionRef: "action://t127/recursive/repair",
      selectedBindingRef: "binding://t127/recursive/repair",
      selectedOutcomeRef: "outcome://t127/recursive/repair",
      selectionPolicyRef: "policy://t127/recursive/highest-rank"
    }),
    constructionEvent("construction_graph_action_invoked", {
      constructionEventRef: "event://t127/recursive/graph-action/1",
      eventSequence: 6,
      intentId: intent1,
      selectedActionRef: "action://t127/recursive/repair",
      runtimeInvocationPlanRef: "runtime-invocation-plan://t127/recursive/1",
      graphCallId: "graph-call://t127/recursive/1",
      frameId: "frame://t127/recursive/1",
      continuationId: "continuation://t127/recursive/1",
      selectedGraphFunctionRef: RECURSIVE_GRAPH_FUNCTION_ID,
      selectedVectorRef: "graph-vector://t127/recursive/repair"
    }),
    constructionEvent("construction_delta_observed", {
      constructionEventRef: "event://t127/recursive/delta/1",
      eventSequence: 7,
      intentId: intent1,
      attemptOrdinal: 0,
      graphCallId: "graph-call://t127/recursive/1",
      frameId: "frame://t127/recursive/1",
      continuationId: "continuation://t127/recursive/1",
      deltaRef: "delta://t127/recursive/1",
      assetDeltaRefs: ["asset-delta://t127/recursive/1"],
      runtimeEventRefs: ["runtime-event://t127/recursive/1"],
      beforeProjectionRef: "projection://t127/recursive/before/1",
      afterProjectionRef: "projection://t127/recursive/after/1",
      artifactDigestBefore: "sha256:before-1",
      artifactDigestAfter: "sha256:after-1",
      blockerBefore: "blocker://t127/compile",
      blockerAfter: "blocker://t127/test",
      fulfilledObligationRefs: ["obligation://t127/recursive/design"],
      remainingObligationRefs: ["obligation://t127/recursive/test"],
      newEvidenceRefs: ["evidence://t127/recursive/design"],
      fhDecisionAccepted: false,
      reentryMoved: false,
      closed: false
    }),
    constructionEvent("construction_evaluator_invoked", {
      constructionEventRef: "event://t127/recursive/evaluator-invoked/2",
      iterationOrdinal: 1,
      eventSequence: 8,
      priorIntentId: intent1,
      observationId: "construction-observation://t127/recursive/2",
      catalogRef: "construction-catalog://t127/recursive/2",
      evaluatorPluginRef: "evaluator-plugin://t127/fp-consciousness",
      inputDigest: "sha256:recursive-evaluator-input-2"
    }),
    constructionEvent("construction_intent_candidate_returned", {
      constructionEventRef: "event://t127/recursive/candidate-returned/2",
      iterationOrdinal: 1,
      eventSequence: 9,
      priorIntentId: intent1,
      evaluatorPluginRef: "evaluator-plugin://t127/fp-consciousness",
      evaluatorOutcomeRef: "evaluator-outcome://t127/recursive/2",
      candidateSetDigest: "sha256:recursive-candidates-2",
      candidateRefs: ["candidate://t127/recursive/2"]
    }),
    constructionEvent("construction_intent_candidate_admitted", {
      constructionEventRef: "event://t127/recursive/candidate-admitted/2",
      iterationOrdinal: 1,
      eventSequence: 10,
      priorIntentId: intent1,
      candidateId: "candidate://t127/recursive/2",
      admissionRef: "construction-admission://t127/recursive/2",
      intentId: intent2,
      authorityRefs: ["law://t127/recursive/repair"],
      selectedActionRef: "action://t127/recursive/repair",
      selectedBindingRef: "binding://t127/recursive/repair",
      selectedOutcomeRef: "outcome://t127/recursive/repair"
    }),
    constructionEvent("construction_intent_selected", {
      constructionEventRef: "event://t127/recursive/intent-selected/2",
      iterationOrdinal: 1,
      eventSequence: 11,
      priorIntentId: intent1,
      intentId: intent2,
      selectedActionRef: "action://t127/recursive/repair",
      selectedBindingRef: "binding://t127/recursive/repair",
      selectedOutcomeRef: "outcome://t127/recursive/repair",
      selectionPolicyRef: "policy://t127/recursive/highest-rank"
    }),
    constructionEvent("construction_graph_action_invoked", {
      constructionEventRef: "event://t127/recursive/graph-action/2",
      iterationOrdinal: 1,
      eventSequence: 12,
      priorIntentId: intent1,
      intentId: intent2,
      selectedActionRef: "action://t127/recursive/repair",
      runtimeInvocationPlanRef: "runtime-invocation-plan://t127/recursive/2",
      graphCallId: "graph-call://t127/recursive/2",
      frameId: "frame://t127/recursive/2",
      continuationId: "continuation://t127/recursive/2",
      selectedGraphFunctionRef: RECURSIVE_GRAPH_FUNCTION_ID,
      selectedVectorRef: "graph-vector://t127/recursive/repair"
    }),
    constructionEvent("construction_delta_observed", {
      constructionEventRef: "event://t127/recursive/delta/2",
      iterationOrdinal: 1,
      eventSequence: 13,
      priorIntentId: intent1,
      intentId: intent2,
      attemptOrdinal: 0,
      graphCallId: "graph-call://t127/recursive/2",
      frameId: "frame://t127/recursive/2",
      continuationId: "continuation://t127/recursive/2",
      deltaRef: "delta://t127/recursive/2",
      assetDeltaRefs: [],
      runtimeEventRefs: ["runtime-event://t127/recursive/2"],
      beforeProjectionRef: "projection://t127/recursive/before/2",
      afterProjectionRef: "projection://t127/recursive/after/2",
      artifactDigestBefore: "sha256:after-1",
      artifactDigestAfter: "sha256:after-1",
      blockerBefore: "blocker://t127/test",
      blockerAfter: "blocker://t127/test",
      fulfilledObligationRefs: [],
      remainingObligationRefs: ["obligation://t127/recursive/test"],
      newEvidenceRefs: [],
      fhDecisionAccepted: false,
      reentryMoved: false,
      closed: false
    })
  ]);
}

export async function runRecursiveReplayScenario(options = {}) {
  const events = recursiveReplayEvents();
  const ecProjection = deriveConstructionEventCalculusProjection({
    episodeId: RECURSIVE_EPISODE_ID,
    events
  });
  const progressLedger = deriveConstructionProgressLedgerFromDeltaEvents({
    episodeId: RECURSIVE_EPISODE_ID,
    events
  });
  assert.deepEqual(
    progressLedger.rows.map((row) => row.progressKind),
    ["new_artifact_digest", "no_material_progress"]
  );
  const progressFluent = constructRuntimeFluent({
    name: "construction_progress_observed",
    scope: "construction",
    basisId: RECURSIVE_BASIS_ID,
    graphFunctionId: RECURSIVE_GRAPH_FUNCTION_ID,
    graphCallId: "graph-call://t127/recursive/1",
    frameId: "frame://t127/recursive/1",
    runId: RECURSIVE_RUN_ID,
    workKey: RECURSIVE_WORK_KEY,
    continuationId: "continuation://t127/recursive/1",
    constraintRef: "delta://t127/recursive/1",
    ref: "construction-intent://t127/recursive/1"
  });
  const inFlightSecond = constructRuntimeFluent({
    name: "construction_graph_action_in_flight",
    scope: "construction",
    basisId: RECURSIVE_BASIS_ID,
    graphFunctionId: RECURSIVE_GRAPH_FUNCTION_ID,
    graphCallId: "graph-call://t127/recursive/2",
    frameId: "frame://t127/recursive/2",
    runId: RECURSIVE_RUN_ID,
    workKey: RECURSIVE_WORK_KEY,
    continuationId: "continuation://t127/recursive/2",
    ref: "construction-intent://t127/recursive/2"
  });
  assert.equal(holdsAt(ecProjection, progressFluent), true);
  assert.equal(holdsAt(ecProjection, inFlightSecond), false);

  const world = bootstrapConstructionWorld({
    episodeId: RECURSIVE_EPISODE_ID,
    suffix: "recursive-replay"
  });
  const projection = deriveConstructionProjection({
    episodeId: RECURSIVE_EPISODE_ID,
    priorityProjection: world.priority,
    progressLedger
  });
  assert.equal(projection.publicState, "construction_stalled");
  assert.equal(
    projection.selectedIntentId,
    "construction-intent://t127/recursive/2"
  );
  await writeEvidence(options, "05-recursive-replay", {
    mode: options.mode ?? "sandbox",
    progressKinds: progressLedger.rows.map((row) => row.progressKind),
    publicState: projection.publicState,
    selectedIntentId: projection.selectedIntentId,
    effectRows: ecProjection.effectRows.length
  });
  return projection;
}

export async function runDownstreamDesignDepthRepairScenario(options = {}) {
  const events = recursiveReplayEvents();
  const ecProjection = deriveConstructionEventCalculusProjection({
    episodeId: RECURSIVE_EPISODE_ID,
    events
  });
  const progressLedger = deriveConstructionProgressLedgerFromDeltaEvents({
    episodeId: RECURSIVE_EPISODE_ID,
    events
  });
  const world = bootstrapConstructionWorld({
    episodeId: RECURSIVE_EPISODE_ID,
    suffix: "downstream-design-depth-repair"
  });
  const projection = deriveConstructionProjection({
    episodeId: RECURSIVE_EPISODE_ID,
    priorityProjection: world.priority,
    progressLedger
  });
  const progressFluent = constructRuntimeFluent({
    name: "construction_progress_observed",
    scope: "construction",
    basisId: RECURSIVE_BASIS_ID,
    graphFunctionId: RECURSIVE_GRAPH_FUNCTION_ID,
    graphCallId: "graph-call://t127/recursive/1",
    frameId: "frame://t127/recursive/1",
    runId: RECURSIVE_RUN_ID,
    workKey: RECURSIVE_WORK_KEY,
    continuationId: "continuation://t127/recursive/1",
    constraintRef: "delta://t127/recursive/1",
    ref: "construction-intent://t127/recursive/1"
  });
  assert.equal(holdsAt(ecProjection, progressFluent), true);
  assert.deepEqual(
    progressLedger.rows.map((row) => row.progressKind),
    ["new_artifact_digest", "no_material_progress"]
  );
  assert.equal(projection.publicState, "construction_stalled");
  assert.notEqual(projection.publicState, "retry_same_edge");
  assert.notEqual(projection.publicState, "process_timeout");
  await writeEvidence(options, "06-downstream-design-depth-repair", {
    mode: options.mode ?? "sandbox",
    failureClass: "progressive_design_depth_repair",
    progressKinds: progressLedger.rows.map((row) => row.progressKind),
    publicState: projection.publicState,
    untypedRetryProjected: false,
    processTimeoutProjected: false
  });
  return projection;
}
