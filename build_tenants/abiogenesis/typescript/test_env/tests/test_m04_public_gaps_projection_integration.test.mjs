// Validates: REQ-P-POLICY-008
// Validates: REQ-P-POLICY-016
// Validates: REQ-P-POLICY-017

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { publicGaps } from "../../build/semantic/code/src/app/m04/index.js";
import {
  admitModule,
  admitNode,
  admitExecutionBasis,
  admitLeafTaskPayload,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  constructConstructionPriorityRule,
  constructConstructionPriorityScheme,
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  constructLeafTaskEnvelope,
  constructLeafTaskFailedEvent,
  constructLeafTaskOpenedEvent,
  deriveRuntimeAggregateProjection,
  edge,
  graphFunctionForVector,
  materializeGraphFunction
} from "../../build/semantic/code/src/index.js";
import {
  installPackedTenantPackage,
  provisionInstalledRoot,
  rewriteInstalledPackageImports,
  runInstalledNodeScript
} from "./support/m05-installed-fixtures.mjs";

function twoStageRuntimeBindingSource() {
  return `
    import {
      admitModule,
      admitNode,
      admitResolvedPolicyIdentity,
      admitResolvedRuntimeIdentity,
      compose,
      edge,
      graphFunctionForVector,
      materializeGraphFunction
    } from "@abiogenesis/typescript-tenant";

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

    function stage(id, name, source, target, edgeName, evaluatorId) {
      const vector = edge([source], target, {
        id: \`graph-\${id}\`,
        name: edgeName,
        evaluators: [
          {
            name: evaluatorId,
            regime: "F_P",
            description: \`\${edgeName} accepted\`,
            binding: \`binding://\${id}\`,
            tags: ["fulfillment"]
          }
        ],
        declarations: { entries: [] }
      }).vectors[0];
      return graphFunctionForVector(vector, {
        id: \`graph-function-\${id}\`,
        name,
        declarations: { entries: [] }
      });
    }

    const inputSet = node("node-gaps-input", "Input", "input_set");
    const design = node("node-gaps-design", "Design", "design");
    const code = node("node-gaps-code", "Code", "code");
    const captureDesign = stage(
      "capture-design",
      "capture_design",
      inputSet,
      design,
      "input_to_design",
      "design_complete"
    );
    const implementCode = stage(
      "implement-code",
      "implement_code",
      design,
      code,
      "design_to_code",
      "code_complete"
    );
    const executive = compose(captureDesign, implementCode);
    const executiveGraph = materializeGraphFunction(executive);

    export const runtimeBinding = {
      module: admitModule({
        name: "gaps_projection_runtime",
        graphs: [executiveGraph],
        graphFunctions: [executive],
        refinementBoundaries: [],
        candidateFamilies: [],
        jobs: [
          {
            id: "job-gaps-executive",
            name: "gaps_executive_job",
            contracts: [{ kind: "graph_function", targetId: executive.id }],
            roles: [],
            tags: ["semantic_work"]
          }
        ],
        roles: [],
        operators: [],
        evaluators: [],
        rules: [],
        imports: [],
        metadata: { entries: [] }
      }),
      runtimeIdentity: admitResolvedRuntimeIdentity({
        workerId: "worker://gaps-projection",
        backendId: "backend://node",
        buildId: "build://typescript-gaps-projection",
        resolvedRuntimeRef: "runtime://typescript/node"
      }),
      resolvedPolicy: admitResolvedPolicyIdentity({
        resolvedPolicyBundleRef: "policy://gaps-fp",
        defaultRegime: "F_P",
        dispatchRef: "dispatch://gaps-projection"
      }),
      runId: "run://gaps-projection",
      workKey: "wk://gaps-projection"
    };
  `;
}

function priorityRuntimeBindingSource() {
  return `
    import {
      admitModule,
      admitNode,
      admitResolvedPolicyIdentity,
      admitResolvedRuntimeIdentity,
      constructConstructionPriorityRule,
      constructConstructionPriorityScheme,
      edge,
      graphFunctionForVector,
      materializeGraphFunction
    } from "@abiogenesis/typescript-tenant";

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

    function stage(id, name, source, target, edgeName, evaluatorId) {
      const vector = edge([source], target, {
        id: \`graph-\${id}\`,
        name: edgeName,
        evaluators: [
          {
            name: evaluatorId,
            regime: "F_P",
            description: \`\${edgeName} accepted\`,
            binding: \`binding://\${id}\`,
            tags: ["fulfillment"]
          }
        ],
        declarations: { entries: [] }
      }).vectors[0];
      return graphFunctionForVector(vector, {
        id: \`graph-function-\${id}\`,
        name,
        declarations: { entries: [] }
      });
    }

    const inputSet = node("node-installed-priority-input", "Input", "input_set");
    const alphaTarget = node("node-installed-alpha", "Alpha", "design");
    const releaseTarget = node("node-installed-z-release", "Z Release", "code");
    const alpha = stage(
      "installed-alpha",
      "installed_alpha",
      inputSet,
      alphaTarget,
      "input_to_alpha",
      "alpha_complete"
    );
    const release = stage(
      "installed-release",
      "installed_release",
      inputSet,
      releaseTarget,
      "input_to_release",
      "release_complete"
    );

    export const runtimeBinding = {
      module: admitModule({
        name: "gaps_installed_priority_runtime",
        graphs: [materializeGraphFunction(alpha), materializeGraphFunction(release)],
        graphFunctions: [alpha, release],
        refinementBoundaries: [],
        candidateFamilies: [],
        jobs: [
          {
            id: "job-installed-alpha",
            name: "installed_alpha_job",
            contracts: [{ kind: "graph_function", targetId: alpha.id }],
            roles: [],
            tags: ["semantic_work"],
            policyHooks: { entries: [] }
          },
          {
            id: "job-installed-release",
            name: "installed_release_job",
            contracts: [{ kind: "graph_function", targetId: release.id }],
            roles: [],
            tags: ["semantic_work"],
            policyHooks: { entries: [] }
          }
        ],
        roles: [],
        operators: [],
        evaluators: [],
        rules: [],
        imports: [],
        policyHooks: { entries: [] },
        metadata: { entries: [] }
      }),
      runtimeIdentity: admitResolvedRuntimeIdentity({
        workerId: "worker://gaps-installed-priority",
        backendId: "backend://node",
        buildId: "build://typescript-gaps-installed-priority",
        resolvedRuntimeRef: "runtime://typescript/node"
      }),
      resolvedPolicy: admitResolvedPolicyIdentity({
        resolvedPolicyBundleRef: "policy://gaps-installed-priority",
        defaultRegime: "F_P",
        dispatchRef: "dispatch://gaps-installed-priority"
      }),
      constructionPriorityScheme: constructConstructionPriorityScheme({
        schemeRef: "priority-scheme://installed-gaps/read-only-evaluator",
        sourcePolicyRef: "policy://gaps-installed-priority/default",
        rules: [
          constructConstructionPriorityRule({
            priorityRuleRef: "priority-rule://installed-gaps/release-blocking",
            axis: "release_blocking",
            weight: 20,
            appliesToActionKinds: ["invoke_graph_function"],
            appliesToOutcomeRefs: ["typed-asset-outcome:node-installed-z-release"],
            sourcePolicyRef: "policy://gaps-installed-priority/release",
            strategyLabel: "release-blocking"
          })
        ]
      }),
      runId: "run://gaps-installed-priority",
      workKey: "wk://gaps-installed-priority"
    };
  `;
}

function malformedPriorityRuntimeBindingSource() {
  return priorityRuntimeBindingSource()
    .replace(
      "constructionPriorityScheme: constructConstructionPriorityScheme({",
      'constructionPriorityScheme: ({ kind: "construction_priority_scheme",'
    )
    .replace(
      "constructConstructionPriorityRule({",
      '({ kind: "construction_priority_rule",'
    )
    .replace(
      'schemeRef: "priority-scheme://installed-gaps/read-only-evaluator"',
      'schemeRef: ""'
    );
}

function closeVectorScript(vectorIndex) {
  return `
    import { appendFile, mkdir, readFile } from "node:fs/promises";
    import {
      admitExecutionBasis,
      admitPublicStartRequest,
      constructVectorClosedEvent,
      constructVectorEvaluatedEvent,
      emit,
      seedRuntimeEventAdmissionOrdinal
    } from "@abiogenesis/typescript-tenant";
    import { runtimeBinding } from "./typescript-runtime.mjs";

    const startInput = {
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
    };
    const startRequest = admitPublicStartRequest(startInput);
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
    // T-195 P1-10: ledger rows must be canonical — route through emit(),
    // exactly as the CLI does, instead of appending raw constructions.
    // REPLAY INGEST LAW (dual review 2026-07-10): "exactly as the CLI
    // does" includes SEEDING past the persisted record first — a fresh
    // appender process that skips the seed re-mints ordinal 0 and the
    // ingest chokepoints fail the log closed as an ordinal collision.
    const priorText = await readFile(".ai-workspace/events/events.jsonl", "utf8").catch(() => "");
    const priorEvents = priorText.split(/\\r?\\n/u).filter(Boolean).map((line) => JSON.parse(line));
    seedRuntimeEventAdmissionOrdinal(priorEvents);
    const canonical = [];
    emit(events, (event) => canonical.push(event));
    await mkdir(".ai-workspace/events", { recursive: true });
    await appendFile(
      ".ai-workspace/events/events.jsonl",
      canonical.map((event) => JSON.stringify(event)).join("\\n") + "\\n",
      "utf8"
    );
    console.log(JSON.stringify({ appended: events.map((event) => event.kind) }));
  `;
}

async function installGapsRuntime(source = twoStageRuntimeBindingSource()) {
  const { targetRoot } = await provisionInstalledRoot();
  const { packageRoot } = await installPackedTenantPackage(targetRoot);
  await mkdir(path.join(targetRoot, ".abiogenesis"), { recursive: true });
  await writeFile(
    path.join(targetRoot, ".abiogenesis", "typescript-runtime.mjs"),
    await rewriteInstalledPackageImports(targetRoot, source),
    "utf8"
  );
  return { targetRoot, packageRoot };
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

function parsePayload(run) {
  assert.notEqual(run.stdout.trim(), "", run.stderr);
  return JSON.parse(run.stdout);
}

async function eventLineCount(targetRoot) {
  const text = await readFile(
    path.join(targetRoot, ".ai-workspace", "events", "events.jsonl"),
    "utf8"
  );
  return text.trim().split(/\r?\n/u).filter(Boolean).length;
}

function directNode(id, name, kind) {
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

function directStage(id, name, source, target, edgeName, evaluatorId, options = {}) {
  const vector = edge([source], target, {
    id: `graph-${id}`,
    name: edgeName,
    evaluators: [
      {
        name: evaluatorId,
        regime: "F_P",
        description: `${edgeName} accepted`,
        binding: `binding://${id}`,
        tags: ["fulfillment"]
      }
    ],
    declarations: options.vectorDeclarations ?? { entries: [] }
  }).vectors[0];
  return graphFunctionForVector(vector, {
    id: `graph-function-${id}`,
    name,
    declarations: options.graphFunctionDeclarations ?? { entries: [] }
  });
}

function priorityProjectionRuntimeContext() {
  const inputSet = directNode("node-priority-input", "Input", "input_set");
  const alphaTarget = directNode("node-alpha-low", "Alpha Low", "design");
  const releaseTarget = directNode("node-z-release", "Z Release", "code");
  const alpha = directStage(
    "alpha-low",
    "alpha_low",
    inputSet,
    alphaTarget,
    "input_to_alpha",
    "alpha_complete"
  );
  const release = directStage(
    "z-release",
    "z_release",
    inputSet,
    releaseTarget,
    "input_to_release",
    "release_complete"
  );
  const module = admitModule({
    name: "gaps_priority_runtime",
    graphs: [materializeGraphFunction(alpha), materializeGraphFunction(release)],
    graphFunctions: [alpha, release],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      {
        id: "job-alpha-low",
        name: "alpha_low_job",
        contracts: [{ kind: "graph_function", targetId: alpha.id }],
        roles: [],
        tags: ["semantic_work"],
        policyHooks: { entries: [] }
      },
      {
        id: "job-z-release",
        name: "z_release_job",
        contracts: [{ kind: "graph_function", targetId: release.id }],
        roles: [],
        tags: ["semantic_work"],
        policyHooks: { entries: [] }
      }
    ],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: { entries: [] },
    metadata: { entries: [] }
  });

  return {
    module,
    alphaGraphFunctionId: alpha.id,
    releaseGraphFunctionId: release.id,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://gaps-priority",
      backendId: "backend://node",
      buildId: "build://typescript-gaps-priority",
      resolvedRuntimeRef: "runtime://typescript/node"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://gaps-priority",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://gaps-priority"
    }),
    constructionPriorityScheme: constructConstructionPriorityScheme({
      schemeRef: "priority-scheme://gaps/read-only-evaluator",
      sourcePolicyRef: "policy://gaps-priority/default",
      rules: [
        constructConstructionPriorityRule({
          priorityRuleRef: "priority-rule://gaps/release-blocking",
          axis: "release_blocking",
          weight: 20,
          appliesToActionKinds: ["invoke_graph_function"],
          appliesToOutcomeRefs: ["typed-asset-outcome:node-z-release"],
          sourcePolicyRef: "policy://gaps-priority/release",
          strategyLabel: "release-blocking"
        })
      ]
    }),
    runId: "run://gaps-priority",
    workKey: "wk://gaps-priority"
  };
}

function hookPriorityRuntimeContext() {
  const inputSet = directNode("node-hook-priority-input", "Input", "input_set");
  const alphaTarget = directNode("node-hook-alpha", "Alpha", "design");
  const releaseTarget = directNode("node-hook-z-release", "Z Release", "code");
  const alpha = directStage(
    "hook-alpha",
    "hook_alpha",
    inputSet,
    alphaTarget,
    "input_to_alpha",
    "alpha_complete"
  );
  const release = directStage(
    "hook-release",
    "hook_release",
    inputSet,
    releaseTarget,
    "input_to_release",
    "release_complete",
    {
      vectorDeclarations: fpConsciousnessHookAttrs(
        "hook://gaps/vector/release-priority",
        [
          {
            priorityRuleRef: "priority-rule://gaps/vector-release",
            axis: "release_blocking",
            weight: 20,
            appliesToActionKinds: ["invoke_graph_function"],
            appliesToOutcomeRefs: ["typed-asset-outcome:node-hook-z-release"],
            sourcePolicyRef: "policy://gaps/vector-release",
            strategyLabel: "release-blocking"
          }
        ]
      )
    }
  );
  const module = admitModule({
    name: "gaps_hook_priority_runtime",
    graphs: [materializeGraphFunction(alpha), materializeGraphFunction(release)],
    graphFunctions: [alpha, release],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      {
        id: "job-hook-alpha",
        name: "hook_alpha_job",
        contracts: [{ kind: "graph_function", targetId: alpha.id }],
        roles: [],
        tags: ["semantic_work"],
        policyHooks: { entries: [] }
      },
      {
        id: "job-hook-release",
        name: "hook_release_job",
        contracts: [{ kind: "graph_function", targetId: release.id }],
        roles: [],
        tags: ["semantic_work"],
        policyHooks: { entries: [] }
      }
    ],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: { entries: [] },
    metadata: { entries: [] }
  });

  return {
    module,
    alphaGraphFunctionId: alpha.id,
    releaseGraphFunctionId: release.id,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://gaps-hook-priority",
      backendId: "backend://node",
      buildId: "build://typescript-gaps-hook-priority",
      resolvedRuntimeRef: "runtime://typescript/node"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://gaps-hook-priority",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://gaps-hook-priority"
    }),
    runId: "run://gaps-hook-priority",
    workKey: "wk://gaps-hook-priority"
  };
}

function failedLeafTaskEventsForGraphFunction(context, graphFunctionId, leafTaskId) {
  const basis = admitExecutionBasis({
    startIntent: {
      scope: {
        kind: "workspace",
        workspaceRoot: process.cwd(),
        moduleName: context.module.name
      },
      target: {
        kind: "graph_function",
        handle: graphFunctionId
      },
      until: "converged"
    },
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runId: context.runId,
    workKey: context.workKey,
    frameId: null,
    frameLineageId: null
  });
  const parentEvents = [
    constructGraphCallOpenedEvent(basis),
    constructFrameOpenedEvent(basis)
  ];
  const envelope = constructLeafTaskEnvelope({
    basis,
    projection: deriveRuntimeAggregateProjection(basis, parentEvents),
    leafTaskId,
    vectorIndex: 0,
    inputSchemaRef: "schema://public-gaps/leaf-input",
    outputSchemaRef: "schema://public-gaps/leaf-output",
    input: admitLeafTaskPayload({
      schemaRef: "schema://public-gaps/leaf-input",
      value: Object.freeze({ target: graphFunctionId }),
      requiredKeys: ["target"]
    }),
    workerRef: "worker://public-gaps-leaf"
  });
  return Object.freeze([
    ...parentEvents,
    constructLeafTaskOpenedEvent(envelope),
    constructLeafTaskFailedEvent({
      envelope,
      failure: {
        failureClass: "capability_missing",
        detail: "fixture marks the highest-priority action ineligible",
        evidenceRefs: ["evidence://public-gaps/ineligible-action"]
      }
    })
  ]);
}

function legacyAssessedEvent(input) {
  return Object.freeze({
    kind: "assessed",
    assessmentKind: "fp",
    edge: input.edge,
    obligationId: input.obligationId,
    publishedLedgerRef: "ledger://public-gaps/legacy-assessed",
    actor: "codex",
    specHash: "sha256:legacy",
    manifestId: "manifest://public-gaps/legacy-assessed",
    workflowVersion: "workflow://public-gaps/legacy",
    runId: input.runId,
    workKey: input.workKey,
    selectedWorkerId: "worker://public-gaps/legacy",
    selectedBackend: "backend://node",
    roleId: "role://public-gaps/legacy",
    authorityRef: "authority://public-gaps/legacy",
    assignmentSource: "legacy_assessed_without_basis",
    resolvedRuntimeRef: "runtime://typescript/node"
  });
}

test("M04 public gaps projection integration: package export surface stays aligned at root, m04, and gaps subpath", async () => {
  const root = await import("@abiogenesis/typescript-tenant");
  const m04 = await import("@abiogenesis/typescript-tenant/app/m04");
  const gapsModule = await import("@abiogenesis/typescript-tenant/app/m04/gaps");

  assert.equal(root.publicGaps, publicGaps);
  assert.equal(m04.publicGaps, publicGaps);
  assert.equal(gapsModule.publicGaps, publicGaps);
});

test("M04 public gaps projection integration: read-only gaps renders the T-127 construction priority projection", () => {
  const context = priorityProjectionRuntimeContext();
  const projection = publicGaps(
    {
      scope: {
        kind: "workspace",
        workspaceRoot: process.cwd(),
        moduleName: context.module.name
      }
    },
    context
  );

  assert.equal(projection.eventCount, 0);
  assert.equal(projection.readOnlyEvaluator.mutationAllowed, false);
  assert.equal(projection.readOnlyEvaluator.bestAssetRef, "node-z-release");
  assert.match(
    projection.readOnlyEvaluator.bestActionRef,
    /^construction-action:/u
  );
  assert.equal(
    projection.readOnlyEvaluator.bestGraphFunctionRef,
    context.releaseGraphFunctionId
  );

  const alphaGap = projection.gaps
    .find((gap) => gap.graphFunctionId === context.alphaGraphFunctionId)
    ?.typedAssetGaps.at(0);
  const releaseGap = projection.gaps
    .find((gap) => gap.graphFunctionId === context.releaseGraphFunctionId)
    ?.typedAssetGaps.at(0);
  assert.ok(alphaGap);
  assert.ok(releaseGap);
  assert.equal(releaseGap.priorityRank, 0);
  assert.equal(alphaGap.priorityRank, 1);
  assert.equal(releaseGap.bestActionRef, projection.readOnlyEvaluator.bestActionRef);
  assert.equal(projection.readOnlyEvaluator.evaluatorRef, releaseGap.priorityProjectionRef);
  assert.equal(
    releaseGap.priorityProjectionRef,
    projection.readOnlyEvaluator.sourceProjectionRefs.at(-1)
  );
  assert.ok(
    releaseGap.rankingReasonRefs.includes(
      "priority-rule://gaps/release-blocking"
    )
  );
  assert.doesNotMatch(releaseGap.bestActionRef ?? "", /^public-gaps-action:/u);
});

test("M04 public gaps projection integration: read-only gaps consumes GTL hook priority precedence", () => {
  const context = hookPriorityRuntimeContext();
  const projection = publicGaps(
    {
      scope: {
        kind: "workspace",
        workspaceRoot: process.cwd(),
        moduleName: context.module.name
      }
    },
    context
  );

  assert.equal(projection.readOnlyEvaluator.bestAssetRef, "node-hook-z-release");
  assert.equal(
    projection.readOnlyEvaluator.bestGraphFunctionRef,
    context.releaseGraphFunctionId
  );
  assert.ok(
    projection.readOnlyEvaluator.rankingReasonRefs.includes(
      "priority-rule://gaps/vector-release"
    )
  );
});

test("M04 public gaps projection integration: assessed events without basisId do not satisfy scoped public gaps truth", () => {
  const context = hookPriorityRuntimeContext();
  const projection = publicGaps(
    {
      scope: {
        kind: "workspace",
        workspaceRoot: process.cwd(),
        moduleName: context.module.name
      }
    },
    {
      ...context,
      runtimeEvents: [
        legacyAssessedEvent({
          edge: "input_to_alpha",
          obligationId: "alpha_complete",
          runId: context.runId,
          workKey: context.workKey
        })
      ]
    }
  );

  const alphaGap = projection.gaps
    .find((gap) => gap.graphFunctionId === context.alphaGraphFunctionId)
    ?.typedAssetGaps.at(0);
  assert.ok(alphaGap);
  assert.deepEqual(alphaGap.missingTruthRefs, [
    "evaluator-obligation:alpha_complete"
  ]);
});

test("M04 public gaps projection integration: ineligible highest priority actions are not exposed as best actions", () => {
  const base = priorityProjectionRuntimeContext();
  const projection = publicGaps(
    {
      scope: {
        kind: "workspace",
        workspaceRoot: process.cwd(),
        moduleName: base.module.name
      }
    },
    {
      ...base,
      runtimeEvents: failedLeafTaskEventsForGraphFunction(
        base,
        base.releaseGraphFunctionId,
        "leaf://public-gaps/release-blocker"
      )
    }
  );

  assert.equal(
    projection.readOnlyEvaluator.bestGraphFunctionRef,
    base.alphaGraphFunctionId
  );
  assert.deepStrictEqual(projection.readOnlyEvaluator.admissionBlockerRefs, []);

  const releaseGap = projection.gaps
    .find((gap) => gap.graphFunctionId === base.releaseGraphFunctionId)
    ?.typedAssetGaps.at(0);
  assert.ok(releaseGap);
  assert.equal(releaseGap.priorityRank, 0);
  assert.equal(releaseGap.bestActionRef, null);
  assert.deepStrictEqual(releaseGap.eligibleActionRefs, []);
  assert.ok(
    releaseGap.admissionBlockerRefs.includes(
      "failed-leaf-task:leaf://public-gaps/release-blocker"
    )
  );
});

test("M04 public gaps projection integration: priority projection identity changes with ranking policy", () => {
  const base = priorityProjectionRuntimeContext();
  const input = {
    scope: {
      kind: "workspace",
      workspaceRoot: process.cwd(),
      moduleName: base.module.name
    }
  };
  const releaseFirst = publicGaps(input, base);
  const alphaFirst = publicGaps(input, {
    ...base,
    constructionPriorityScheme: constructConstructionPriorityScheme({
      schemeRef: "priority-scheme://gaps/alpha-first",
      sourcePolicyRef: "policy://gaps-priority/alpha",
      rules: [
        constructConstructionPriorityRule({
          priorityRuleRef: "priority-rule://gaps/alpha-first",
          axis: "steel_thread",
          weight: 30,
          appliesToActionKinds: ["invoke_graph_function"],
          appliesToOutcomeRefs: ["typed-asset-outcome:node-alpha-low"],
          sourcePolicyRef: "policy://gaps-priority/alpha",
          strategyLabel: "steel-thread"
        })
      ]
    })
  });

  assert.notEqual(
    releaseFirst.readOnlyEvaluator.evaluatorRef,
    alphaFirst.readOnlyEvaluator.evaluatorRef
  );
  assert.equal(releaseFirst.readOnlyEvaluator.bestAssetRef, "node-z-release");
  assert.equal(alphaFirst.readOnlyEvaluator.bestAssetRef, "node-alpha-low");
});

test("M04 public gaps projection integration: installed CLI gaps carries configured construction priority", async () => {
  const { targetRoot, packageRoot } = await installGapsRuntime(
    priorityRuntimeBindingSource()
  );

  const run = runCli(targetRoot, packageRoot, [
    "gaps",
    "--workspace",
    ".",
    "--scope",
    "workspace"
  ]);
  assert.equal(run.status, 0, run.stderr);
  const payload = parsePayload(run);

  assert.equal(payload.read_only_evaluator.best_asset_ref, "node-installed-z-release");
  assert.equal(
    payload.read_only_evaluator.ranking_reason_refs.includes(
      "priority-rule://installed-gaps/release-blocking"
    ),
    true
  );
  assert.ok(
    payload.read_only_evaluator.evaluator_ref.includes(
      "priority-scheme://installed-gaps/read-only-evaluator"
    )
  );
});

test("M04 public gaps projection integration: installed CLI gaps rejects malformed construction priority ingress", async () => {
  const { targetRoot, packageRoot } = await installGapsRuntime(
    malformedPriorityRuntimeBindingSource()
  );

  const run = runCli(targetRoot, packageRoot, [
    "gaps",
    "--workspace",
    ".",
    "--scope",
    "workspace"
  ]);

  assert.notEqual(run.status, 0);
  assert.match(run.stderr, /constructionPriorityScheme\.schemeRef/u);
});

test("M04 public gaps projection integration: installed CLI gaps is read-only and replay-derived across open, partial, and converged states", async () => {
  const { targetRoot, packageRoot } = await installGapsRuntime();

  const openRun = runCli(targetRoot, packageRoot, [
    "gaps",
    "--workspace",
    ".",
    "--scope",
    "workspace"
  ]);
  assert.equal(openRun.status, 0, openRun.stderr);
  const open = parsePayload(openRun);

  assert.equal(open.command, "gaps");
  assert.equal(open.status, "blocked");
  assert.equal(open.jobs_considered, 1);
  assert.equal(open.total_delta, 1);
  assert.equal(open.open_frames, 0);
  assert.equal(open.converged, false);
  assert.equal(open.event_count, 0);
  assert.equal(open.gaps[0].edge, "input_to_design");
  assert.equal(open.gaps[0].vector_count, 2);
  assert.equal(open.gaps[0].open_vector_count, 2);
  assert.equal(open.gaps[0].status, "dispatch_required");
  assert.equal(open.gaps[0].next_step, "start");
  assert.deepStrictEqual(open.gaps[0].failing, ["design_complete"]);
  assert.equal(open.read_only_evaluator.mutation_allowed, false);
  assert.equal(open.read_only_evaluator.best_asset_ref, "node-gaps-design");
  assert.equal(
    open.read_only_evaluator.best_graph_function_ref,
    open.gaps[0].graph_function_id
  );
  assert.equal(open.gaps[0].typed_asset_gaps[0].asset_kind, "design");
  assert.equal(open.gaps[0].typed_asset_gaps[0].asset_ref, "node-gaps-design");
  assert.equal(open.gaps[0].typed_asset_gaps[0].priority_rank, 0);
  assert.deepStrictEqual(open.gaps[0].typed_asset_gaps[0].missing_truth_refs, [
    "evaluator-obligation:design_complete"
  ]);
  assert.equal(
    open.gaps[0].typed_asset_gaps[0].best_graph_function_ref,
    open.gaps[0].graph_function_id
  );
  assert.equal(await eventLineCount(targetRoot), 0);

  const closeFirst = await runInstalledNodeScript(targetRoot, closeVectorScript(0));
  assert.equal(closeFirst.status, 0, closeFirst.stderr);
  assert.equal(await eventLineCount(targetRoot), 2);

  const partialRun = runCli(targetRoot, packageRoot, [
    "gaps",
    "--workspace",
    ".",
    "--scope",
    "workspace"
  ]);
  assert.equal(partialRun.status, 0, partialRun.stderr);
  const partial = parsePayload(partialRun);

  assert.equal(partial.status, "blocked");
  assert.equal(partial.total_delta, 0.5);
  assert.equal(partial.open_frames, 1);
  assert.equal(partial.converged, false);
  assert.equal(partial.event_count, 2);
  assert.equal(partial.gaps[0].edge, "design_to_code");
  assert.equal(partial.gaps[0].closed_vector_count, 1);
  assert.equal(partial.gaps[0].open_vector_count, 1);
  assert.deepStrictEqual(partial.gaps[0].failing, ["code_complete"]);
  assert.equal(partial.read_only_evaluator.mutation_allowed, false);
  assert.equal(partial.read_only_evaluator.best_asset_ref, "node-gaps-code");
  assert.equal(partial.gaps[0].typed_asset_gaps[0].asset_kind, "code");
  assert.equal(partial.gaps[0].typed_asset_gaps[0].asset_ref, "node-gaps-code");
  assert.deepStrictEqual(partial.gaps[0].typed_asset_gaps[0].missing_truth_refs, [
    "evaluator-obligation:code_complete"
  ]);
  assert.equal(await eventLineCount(targetRoot), 2);

  const closeSecond = await runInstalledNodeScript(targetRoot, closeVectorScript(1));
  assert.equal(closeSecond.status, 0, closeSecond.stderr);
  assert.equal(await eventLineCount(targetRoot), 4);

  const convergedRun = runCli(targetRoot, packageRoot, [
    "gaps",
    "--workspace",
    ".",
    "--scope",
    "workspace"
  ]);
  assert.equal(convergedRun.status, 0, convergedRun.stderr);
  const converged = parsePayload(convergedRun);

  assert.equal(converged.status, "converged");
  assert.equal(converged.total_delta, 0);
  assert.equal(converged.open_frames, 0);
  assert.equal(converged.converged, true);
  assert.equal(converged.event_count, 4);
  assert.equal(converged.gaps[0].edge, null);
  assert.equal(converged.gaps[0].status, "converged");
  assert.equal(converged.gaps[0].next_step, "none");
  assert.equal(converged.read_only_evaluator.mutation_allowed, false);
  assert.equal(converged.read_only_evaluator.best_asset_ref, null);
  assert.deepStrictEqual(converged.gaps[0].typed_asset_gaps, []);
});

// ── A5-P1 fix (dual review agent-3 F1, T-217 closure campaign
// 2026-07-10): the CROSS-PROCESS pin for the C-4 foreign-input law. A
// workspace plugin factory that hands the start path a PRE-STAMPED
// canonical envelope (a forged admission-ordinal claim) must be refused
// TYPED by the installed CLI — the forgery never reaches the persisted
// event log.
test("A5-P1 C-4: installed CLI start refuses a plugin-supplied pre-stamped envelope typed, cross-process", async () => {
  const preStampSource = twoStageRuntimeBindingSource().replace(
    "export const runtimeBinding = {",
    `export const runtimeBinding = {
      createPlugins({ eventSink }) {
        // hostile plugin: transport-allowed kind, forged canonical envelope
        eventSink({
          kind: "actor_process_heartbeat",
          eventId: "runtime-event:forged:0:x",
          eventTime: "2026-01-01T00:00:00.000Z",
          eventTimeUnixMs: 1767225600000,
          eventAdmissionOrdinal: 0
        });
        return undefined;
      },`
  );
  const { targetRoot, packageRoot } = await installGapsRuntime(preStampSource);
  const run = runCli(targetRoot, packageRoot, [
    "start",
    "--workspace",
    ".",
    "--scope",
    "workspace",
    "--target",
    "next",
    "--until",
    "converged"
  ]);
  assert.notEqual(run.status, 0, "forged pre-stamp must refuse the start");
  assert.match(
    `${run.stderr}\n${run.stdout}`,
    /pre-stamped canonical envelope/u,
    "the refusal is the typed C-4 message, not a generic failure"
  );
  // and the forgery never landed in replay truth
  const eventsPath = path.join(targetRoot, ".ai-workspace", "events", "events.jsonl");
  let logText = "";
  try {
    logText = await readFile(eventsPath, "utf8");
  } catch {
    logText = "";
  }
  assert.equal(logText.includes("runtime-event:forged"), false);
});
