// Validates: REQ-L-GTL3-CONTRACT-LAW-API, REQ-L-GTL3-GRAPHFUNCTION,
// REQ-L-GTL3-C-ALGEBRA, REQ-R-ABG3-PLUGIN-SEAMS, REQ-R-ABG3-HANDLERS.

import assert from "node:assert/strict";
import test from "node:test";

import { ABG_CONSENSUS_GTL_MODULE } from "../../build/semantic/code/src/abg/m03/contracts/consensus_gtl_body.js";
import { typecheckGtlProgram } from "../../build/semantic/code/src/abg/m03/contracts/gtl_program_conformance.js";
import { emptySerializedAttrs } from "../../build/semantic/code/src/gtl/m01/contracts/constructors.js";
import {
  constructEnvRef,
  constructGraph,
  constructGraphFunction,
  constructGraphVector,
  constructNode,
  constructTemplateRef
} from "../../build/semantic/code/src/gtl/m01/contracts/constructors.js";
import {
  constructContractRef,
  constructJob,
  constructModule,
  constructRole
} from "../../build/semantic/code/src/gtl/m02/contracts/constructors.js";
import { admitModule } from "../../build/semantic/code/src/gtl/m02/admission/carriers.js";
import { serializeModule } from "../../build/semantic/code/src/gtl/m02/serialization/carriers.js";
import { stableSha256Digest } from "../../build/semantic/code/src/shared/runtime_identity.js";

const ABG_VERSION = "5.0.0-dev.0";

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function nonConsensusModule() {
  const input = constructNode({
    name: "Observation",
    schema: { kind: "symbolic", ref: "schema://example/observation" },
    markov: ["bounded"],
    assetSurface: { kind: "observation" },
    tags: ["t264"]
  });
  const output = constructNode({
    name: "Decision",
    schema: { kind: "symbolic", ref: "schema://example/decision" },
    markov: ["derived"],
    assetSurface: { kind: "decision" },
    tags: ["t264"]
  });
  const operator = Object.freeze({
    name: "decide",
    regime: "F_D",
    binding: "binding://example/decide",
    tags: Object.freeze(["t264"])
  });
  const rule = Object.freeze({
    name: "decision-rule",
    kind: "policy",
    config: emptySerializedAttrs(),
    tags: Object.freeze(["t264"])
  });
  const vector = constructGraphVector({
    name: "observe-to-decide",
    source: [input],
    target: output,
    operators: [operator],
    evaluators: [],
    contexts: [],
    rule,
    allowsSubwork: false,
    declarations: emptySerializedAttrs(),
    tags: ["t264"]
  });
  const graph = constructGraph({
    name: "decision-graph",
    inputs: [input],
    outputs: [output],
    nodes: [input, output],
    vectors: [vector],
    contexts: [],
    rules: [rule],
    effects: ["effect://example/decision"],
    tags: ["t264"]
  });
  const graphFunction = constructGraphFunction({
    name: "example.decide",
    environment: constructEnvRef({
      requires: [input],
      provides: [output],
      carries: [input, output]
    }),
    inputs: [input],
    outputs: [output],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://example/decide",
      graph,
      version: null
    }),
    effects: ["effect://example/decision"],
    declarations: emptySerializedAttrs(),
    tags: ["t264"]
  });
  const role = constructRole({
    name: "decision-reviewer",
    tags: ["t264"],
    policyHooks: emptySerializedAttrs()
  });
  const job = constructJob({
    name: "decision-job",
    contracts: [
      constructContractRef({
        kind: "graph_function",
        targetId: graphFunction.id
      })
    ],
    roles: [role],
    tags: ["t264"],
    policyHooks: emptySerializedAttrs()
  });
  return constructModule({
    name: "example.proportional-conformance",
    graphs: [graph],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [job],
    roles: [role],
    operators: [operator],
    evaluators: [],
    rules: [rule],
    imports: [],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs()
  });
}

function submittedReport(moduleValue) {
  return typecheckGtlProgram({
    subjectRef: "workspace://t264/proportional",
    abiPackageVersion: ABG_VERSION,
    scopeKind: "submitted_structure",
    modules: [moduleValue]
  });
}

function ruleRefs(report) {
  return new Set(report.issues.map((row) => row.ruleRef));
}

function consensusLeafModule() {
  const canonical = serializeModule(ABG_CONSENSUS_GTL_MODULE);
  const graphFunction = cloneJson(
    canonical.graphFunctions.find(
      (row) => row.name === "consensus.review-one-profile"
    )
  );
  assert.notEqual(graphFunction, undefined);
  return {
    name: "example.consensus-leaf-negative-fixture",
    graphs: [graphFunction.template.graph],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: { entries: [] },
    metadata: { entries: [] }
  };
}

test("T-264 scope is explicit and invalid scope fails toward the complete branch", () => {
  const missing = typecheckGtlProgram({
    subjectRef: "workspace://t264/missing-scope",
    abiPackageVersion: ABG_VERSION
  });
  const unknown = typecheckGtlProgram({
    subjectRef: "workspace://t264/unknown-scope",
    abiPackageVersion: ABG_VERSION,
    scopeKind: "partial"
  });
  for (const report of [missing, unknown]) {
    assert.equal(report.scopeKind, "declared_complete_program");
    assert(
      ruleRefs(report).has("abg://gtl-program/input/conformance-scope-field")
    );
    assert(
      ruleRefs(report).has(
        "abg://gtl-program/coverage/expected-coverage-required"
      )
    );
  }
});

test("T-264 submitted structure permits omitted assertions and lawful zero families", () => {
  const report = typecheckGtlProgram({
    subjectRef: "workspace://t264/empty-submission",
    abiPackageVersion: ABG_VERSION,
    scopeKind: "submitted_structure"
  });
  assert.equal(report.passed, true);
  assert.equal(report.featureCoverageManifest, null);
  assert.equal(report.derivedConformanceInventory.counts.moduleJobCount, 0);
  assert.equal(report.derivedConformanceInventory.counts.moduleRoleCount, 0);
  assert.equal(
    report.derivedConformanceInventory.capabilityCompatibilityStatus,
    "not_applicable_no_effect_requirements"
  );
});

test("T-264 complete scope retains claims but permits structurally lawful zero counts", () => {
  const report = typecheckGtlProgram({
    subjectRef: "workspace://t264/complete-zero",
    abiPackageVersion: ABG_VERSION,
    scopeKind: "declared_complete_program",
    expectedCoverage: {
      catalogGraphFunctionCount: 0,
      publishedGraphFunctionCount: 0,
      graphVectorCount: 0,
      targetCarrierContractCount: 0,
      edgeClosureContractCount: 0,
      overlayCount: 0,
      publicStartTargetCount: 0,
      promptAssetCount: 0,
      pluginContractCount: 0,
      sourceIdentitySurfaceCount: 0
    }
  });
  assert.equal(
    report.issues.some(
      (row) =>
        row.ruleRef === "abg://gtl-program/coverage/expected-count-nonzero"
    ),
    false
  );
  assert(
    ruleRefs(report).has("abg://gtl-program/feature-coverage/manifest-required")
  );
});

test("T-264 derives non-Consensus effects, jobs, roles, and feature applicability", () => {
  const report = submittedReport(nonConsensusModule());
  const inventory = report.derivedConformanceInventory;
  assert.deepEqual(inventory.counts, {
    graphFunctionCount: 1,
    graphVectorCount: 1,
    effectRequirementCount: 1,
    pluginSelectionCount: 0,
    hogProgramCount: 0,
    hogHandlerBindingCount: 0,
    hogHandlerConfigCount: 0,
    moduleJobCount: 1,
    moduleRoleCount: 1
  });
  assert.equal(
    inventory.featureApplicability.find(
      (row) => row.featureKind === "job_binding"
    ).inventoryBacked,
    true
  );
  assert.equal(
    report.issues.some((row) => row.ruleRef.includes("declaration-inventory")),
    false
  );
  assert.match(report.inventoryDigests.derivedConformanceInventory, /^sha256:/u);
});

test("T-264 inventories the T-252 declarations without erasing real gaps", () => {
  const report = submittedReport(ABG_CONSENSUS_GTL_MODULE);
  const inventory = report.derivedConformanceInventory;
  const refs = ruleRefs(report);
  assert.deepEqual(inventory.counts, {
    graphFunctionCount: 7,
    graphVectorCount: 35,
    effectRequirementCount: 93,
    pluginSelectionCount: 10,
    hogProgramCount: 34,
    hogHandlerBindingCount: 11,
    hogHandlerConfigCount: 0,
    moduleJobCount: 0,
    moduleRoleCount: 0
  });
  assert.equal(report.coverage.pluginContractCount, 0);
  assert.equal(
    inventory.capabilityCompatibilityStatus,
    "deferred_missing_exact_profile"
  );
  assert.equal(
    report.issues.some((row) => row.ruleRef.includes("declaration-inventory")),
    false
  );
  assert.equal(
    report.issues.some((row) => row.ruleRef.includes("feature-coverage")),
    false
  );
  assert.equal(
    report.issues.some((row) => row.ruleRef.includes("coverage/expected")),
    false
  );
  assert.equal(
    refs.has("abg://gtl-program/c-algebra/semantic-not-realized"),
    false
  );
  assert(refs.has("abg://gtl-program/graph-vector/target-carrier-required"));
  assert.equal(
    stableSha256Digest(serializeModule(ABG_CONSENSUS_GTL_MODULE)),
    "sha256:dc4686b3acd145181ffa58c9377bc33f5324914139b38f052aec53060a21c1c8"
  );
});

test("T-264 rejects duplicate effects and plugin authority in Operator.binding", () => {
  const duplicateEffect = cloneJson(serializeModule(nonConsensusModule()));
  duplicateEffect.graphFunctions[0].effects.push(
    duplicateEffect.graphFunctions[0].effects[0]
  );
  const duplicateReport = submittedReport(admitModule(duplicateEffect));
  assert(
    ruleRefs(duplicateReport).has(
      "abg://gtl-program/declaration-inventory/effect-unique"
    )
  );

  const pluginBinding = cloneJson(serializeModule(nonConsensusModule()));
  pluginBinding.operators[0].binding = "plugin://abg/fd-evaluator";
  const pluginBindingReport = submittedReport(admitModule(pluginBinding));
  assert(
    ruleRefs(pluginBindingReport).has(
      "abg://gtl-program/declaration-inventory/operator-binding-not-plugin"
    )
  );
});

test("T-264 enforces transitive effects and effect-authority separation", () => {
  const missingTransitiveEffect = cloneJson(
    serializeModule(ABG_CONSENSUS_GTL_MODULE)
  );
  const fanOut = missingTransitiveEffect.graphFunctions.find(
    (row) => row.name === "fan_out(consensus.review-one-profile)"
  );
  assert.notEqual(fanOut, undefined);
  fanOut.effects = [];
  const transitiveReport = submittedReport(missingTransitiveEffect);
  assert(
    ruleRefs(transitiveReport).has(
      "abg://gtl-program/declaration-inventory/effect-transitive"
    )
  );

  const sharedAuthority = consensusLeafModule();
  sharedAuthority.graphFunctions[0].effects.push("plugin://abg/fp-dispatch");
  const authorityReport = submittedReport(sharedAuthority);
  assert(
    ruleRefs(authorityReport).has(
      "abg://gtl-program/declaration-inventory/effect-authority-separation"
    )
  );
});

test("T-264 rejects missing structurally required plugin and handler declarations", () => {
  const missingPlugin = consensusLeafModule();
  missingPlugin.graphFunctions[0].declarations.entries =
    missingPlugin.graphFunctions[0].declarations.entries.filter(
      (row) => row.key !== "abg.plugin_selection"
    );
  const missingPluginReport = submittedReport(admitModule(missingPlugin));
  assert(
    ruleRefs(missingPluginReport).has(
      "abg://gtl-program/declaration-inventory/plugin-selection-exact"
    )
  );

  const missingHandler = consensusLeafModule();
  missingHandler.graphFunctions[0].declarations.entries =
    missingHandler.graphFunctions[0].declarations.entries.filter(
      (row) => row.key !== "abg.hog_handler_bindings"
    );
  const missingHandlerReport = submittedReport(admitModule(missingHandler));
  assert(
    ruleRefs(missingHandlerReport).has(
      "abg://gtl-program/declaration-inventory/handler-coverage"
    )
  );
});

test("T-264 rejects handler configs without an exact binding", () => {
  const unusedConfig = cloneJson(serializeModule(nonConsensusModule()));
  unusedConfig.graphFunctions[0].declarations.entries.push({
    key: "abg.hog_handler_configs",
    value: {
      kind: "json_blob",
      value: {
        kind: "object",
        entries: [
          {
            key: "config://example/unused",
            value: "unused"
          }
        ]
      }
    }
  });
  const report = submittedReport(admitModule(unusedConfig));
  assert(
    ruleRefs(report).has(
      "abg://gtl-program/declaration-inventory/handler-config-usage"
    )
  );
});
