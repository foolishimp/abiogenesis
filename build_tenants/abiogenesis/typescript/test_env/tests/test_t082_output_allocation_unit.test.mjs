// Validates: T-082-TS
// Validates: REQ-R-ABG3-BINDING
// Validates: REQ-R-ABG3-PROVENANCE
// Validates: REQ-R-ABG3-EVENTS

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitExecutionBasis,
  admitPublicStartRequest,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  constructOutputBindingAdmittedEvent,
  constructOutputInstanceAllocatedEvent,
  constructOutputMaterializationObservedEvent,
  constructOutputPluginHandoffManifest,
  deriveOutputAllocationProjection,
  deriveOutputInstanceAllocation,
  emit,
  isMaterializationPathWithinAllocation
} from "../../build/semantic/code/src/index.js";
import {
  buildThreeStageBasis,
  buildThreeStageModule
} from "./support/m03-iteration-fixtures.mjs";

function allocateDesignOutput() {
  const basis = buildThreeStageBasis({ runId: "run://t082/output-allocation" });
  const result = deriveOutputInstanceAllocation({
    basis,
    outputName: "design_surface",
    outputAssetType: "Workspace.design_surface",
    relativePath: "design/design_surface.md"
  });
  assert.equal(result.ok, true);
  return { basis, allocation: result.allocation };
}

test("T-082 output allocation mints an ABG-owned output root from input-only start truth", () => {
  const { basis, allocation } = allocateDesignOutput();

  assert.equal(allocation.basisId, basis.id);
  assert.equal(allocation.graphFunctionId, basis.graphFunction.id);
  assert.match(allocation.assetRef, /^workspace:\/\//);
  assert.match(allocation.materializationRoot, /\/\.ai-workspace\/runtime\/runs\//);
  assert.equal(allocation.allowedWriteRoots.length, 1);
  assert.equal(allocation.allowedWriteRoots[0], allocation.materializationRoot);
  assert.equal(
    isMaterializationPathWithinAllocation({
      allocation,
      materializedPath: `${allocation.materializationRoot}/design/design_surface.md`
    }),
    true
  );
  assert.equal(
    isMaterializationPathWithinAllocation({
      allocation,
      materializedPath: `${basis.workspaceRoot}/build_tenants/typescript/design/outside.md`
    }),
    false
  );
  assert.equal(
    isMaterializationPathWithinAllocation({
      allocation,
      materializedPath: `${allocation.materializationRoot}/../outside.md`
    }),
    false
  );
  assert.equal(
    isMaterializationPathWithinAllocation({
      allocation,
      materializedPath: `${allocation.materializationRoot}/nested/../../outside.md`
    }),
    false
  );
});

test("T-082 output events project allocated binding and materialization truth", () => {
  const { basis, allocation } = allocateDesignOutput();
  const materializedPath = `${allocation.materializationRoot}/design/design_surface.md`;
  const events = [
    constructOutputInstanceAllocatedEvent({
      basis,
      vectorIndex: 0,
      allocation
    }),
    constructOutputBindingAdmittedEvent({
      basis,
      vectorIndex: 0,
      allocation,
      bindingRef: "binding://t082/design-output"
    }),
    constructOutputMaterializationObservedEvent({
      basis,
      vectorIndex: 0,
      allocation,
      materializedRef: "materialized://t082/design-surface",
      materializedPath,
      digest: "digest://t082/design-surface",
      observerRef: "observer://t082/postflight",
      artifactRefs: ["artifact://t082/design-surface"]
    })
  ];
  const emitted = [];
  emit(events, (event) => emitted.push(event));

  const projection = deriveOutputAllocationProjection({ basis, events: emitted });

  assert.deepEqual(projection.allocatedOutputRefs, [allocation.assetRef]);
  assert.deepEqual(projection.materializedOutputRefs, [allocation.assetRef]);
  assert.equal(projection.allocations[0].materializationUri, allocation.materializationUri);
  assert.equal(projection.bindings[0].source, "abg_allocation");
  assert.equal(projection.materializations[0].materializedPath, materializedPath);
});

test("T-082 output allocation rejects unsafe relative paths and allocation collisions", () => {
  const { basis, allocation } = allocateDesignOutput();
  const unsafe = deriveOutputInstanceAllocation({
    basis,
    outputName: "design_surface",
    outputAssetType: "Workspace.design_surface",
    relativePath: "../design_surface.md"
  });
  assert.equal(unsafe.ok, false);
  assert.equal(unsafe.reason, "unsafe_relative_path");

  const collision = deriveOutputInstanceAllocation({
    basis,
    outputName: "design_surface",
    outputAssetType: "Workspace.design_surface",
    relativePath: "design/design_surface.md",
    existingAllocations: [allocation]
  });
  assert.equal(collision.ok, false);
  assert.equal(collision.reason, "collision");
});

test("T-082 output materialization observation fails outside the allocated root", () => {
  const { basis, allocation } = allocateDesignOutput();

  assert.throws(
    () =>
      constructOutputMaterializationObservedEvent({
        basis,
        vectorIndex: 0,
        allocation,
        materializedRef: "materialized://t082/outside",
        materializedPath: `${basis.workspaceRoot}/outside/design_surface.md`,
        digest: "digest://t082/outside",
        observerRef: "observer://t082/postflight",
        artifactRefs: ["artifact://t082/outside"]
      }),
    /allocated write root/
  );
  assert.throws(
    () =>
      constructOutputMaterializationObservedEvent({
        basis,
        vectorIndex: 0,
        allocation,
        materializedRef: "materialized://t082/dotdot",
        materializedPath: `${allocation.materializationRoot}/../outside.md`,
        digest: "digest://t082/dotdot",
        observerRef: "observer://t082/postflight",
        artifactRefs: ["artifact://t082/dotdot"]
      }),
    /allocated write root/
  );
});

test("T-082 projection rejects replayed dot-dot materialization escape", () => {
  const { basis, allocation } = allocateDesignOutput();
  const allocated = constructOutputInstanceAllocatedEvent({
    basis,
    vectorIndex: 0,
    allocation
  });

  assert.throws(
    () =>
      deriveOutputAllocationProjection({
        basis,
        events: [
          allocated,
          {
            kind: "output_materialization_observed",
            basisId: basis.id,
            graphCallId: allocated.graphCallId,
            frameId: allocated.frameId,
            vectorIndex: 0,
            edge: allocated.edge,
            allocationId: allocation.allocationId,
            assetRef: allocation.assetRef,
            materializedRef: "materialized://t082/replayed-dotdot",
            materializedPath: `${allocation.materializationRoot}/../outside.md`,
            digest: "digest://t082/replayed-dotdot",
            observerRef: "observer://t082/postflight",
            artifactRefs: ["artifact://t082/replayed-dotdot"]
          }
        ]
      }),
    /outside allocated root/
  );
});

test("T-082 public start admits input bindings and requested outputs into basis truth", () => {
  const { module, executive } = buildThreeStageModule();
  const request = admitPublicStartRequest({
    scope: {
      kind: "workspace",
      workspaceRoot: "/workspace/t082-public-start",
      moduleName: module.name
    },
    target: {
      kind: "graph_function",
      handle: executive.name
    },
    until: "converged",
    input_bindings: [
      {
        asset_ref: "workspace://requirements/current",
        asset_type: "Workspace.requirements_surface",
        uri: "/workspace/t082-public-start/requirements.md"
      }
    ],
    requested_outputs: [
      {
        output_name: "design_surface",
        output_asset_type: "Workspace.design_surface",
        relative_path: "design/design_surface.md"
      }
    ]
  });
  assert.equal(request.startIntent.inputBindings[0].assetRef, "workspace://requirements/current");
  assert.equal(request.startIntent.requestedOutputs[0].outputName, "design_surface");

  const basis = admitExecutionBasis({
    startIntent: request.startIntent,
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://t082-public-start",
      backendId: "backend://node",
      buildId: "build://typescript",
      resolvedRuntimeRef: "runtime://typescript/node"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://t082-public-start",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://t082-public-start",
      approvalSubjectRef: null
    }),
    runId: "run://t082-public-start",
    workKey: null,
    frameId: null,
    frameLineageId: null
  });
  const requestedOutput = basis.startIntent.requestedOutputs[0];
  const allocation = deriveOutputInstanceAllocation({
    basis,
    outputName: requestedOutput.outputName,
    outputAssetType: requestedOutput.outputAssetType,
    relativePath: requestedOutput.relativePath
  });

  assert.equal(allocation.ok, true);
  assert.equal(allocation.allocation.outputName, "design_surface");
});
