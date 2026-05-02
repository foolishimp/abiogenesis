// Validates: T-104-TS
// Validates: REQ-R-ABG3-BINDING-015
// Validates: REQ-R-ABG3-PROVENANCE
// Validates: REQ-R-ABG3-EVENTS

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitExecutionBasis,
  admitOutputWorkspaceBinding,
  admitPublicStartRequest,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitWorkspaceAssetBinding,
  constructOutputBindingAdmittedEvent,
  constructOutputInstanceAllocatedEvent,
  constructOutputMaterializationObservedEvent,
  constructOutputPluginHandoffManifest,
  deriveOutputAllocationProjection,
  deriveOutputInstanceAllocation
} from "../../build/semantic/code/src/index.js";
import {
  buildThreeStageBasis,
  buildThreeStageModule
} from "./support/m03-iteration-fixtures.mjs";

function buildCrossWorkspaceScenario() {
  const { module, executive } = buildThreeStageModule();
  const inputWorkspaceRoot = "/workspace/t104-input";
  const outputWorkspaceRoot = "/workspace/t104-review-stream-a";
  const request = admitPublicStartRequest({
    scope: {
      kind: "workspace",
      workspaceRoot: inputWorkspaceRoot,
      moduleName: module.name
    },
    target: {
      kind: "graph_function",
      handle: executive.name
    },
    until: "converged",
    input_bindings: [
      {
        asset_ref: "workspace://source/requirements/current",
        asset_type: "Workspace.requirements_surface",
        uri: `${inputWorkspaceRoot}/requirements.md`
      }
    ],
    requested_outputs: [
      {
        output_name: "design_surface",
        output_asset_type: "Workspace.design_surface",
        relative_path: "design/design_surface.md",
        output_workspace: {
          workspace_ref: "workspace://review-streams/stream-a",
          workspace_root: outputWorkspaceRoot,
          authority_ref: "authority://review-streams/stream-a"
        }
      }
    ]
  });
  const basis = admitExecutionBasis({
    startIntent: request.startIntent,
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://t104-cross-workspace",
      backendId: "backend://node",
      buildId: "build://typescript",
      resolvedRuntimeRef: "runtime://typescript/node"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://t104-cross-workspace",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://t104-cross-workspace",
      approvalSubjectRef: null
    }),
    runId: "run://t104-cross-workspace",
    workKey: "wk://t104-cross-workspace",
    frameId: null,
    frameLineageId: null
  });
  const requestedOutput = basis.startIntent.requestedOutputs[0];
  const outputWorkspace = admitOutputWorkspaceBinding({
    workspaceRef: requestedOutput.outputWorkspace.workspaceRef,
    workspaceRoot: requestedOutput.outputWorkspace.workspaceRoot,
    authorityRef: requestedOutput.outputWorkspace.authorityRef,
    source: "caller"
  });
  assert.equal(outputWorkspace.ok, true);
  const inputBinding = admitWorkspaceAssetBinding({
    assetRef: basis.startIntent.inputBindings[0].assetRef,
    assetType: basis.startIntent.inputBindings[0].assetType,
    uri: basis.startIntent.inputBindings[0].uri,
    workspaceRoot: inputWorkspaceRoot,
    bindingRole: "input",
    source: "caller"
  });
  assert.equal(inputBinding.ok, true);
  const allocation = deriveOutputInstanceAllocation({
    basis,
    outputName: requestedOutput.outputName,
    outputAssetType: requestedOutput.outputAssetType,
    relativePath: requestedOutput.relativePath,
    outputWorkspaceBinding: outputWorkspace.binding
  });
  assert.equal(allocation.ok, true);

  return Object.freeze({
    basis,
    inputBinding: inputBinding.binding,
    outputWorkspace: outputWorkspace.binding,
    allocation: allocation.allocation
  });
}

test("T-104 allocates W1 input truth into an admitted W2 output workspace", () => {
  const { basis, inputBinding, outputWorkspace, allocation } =
    buildCrossWorkspaceScenario();

  assert.equal(allocation.inputWorkspaceRoot, basis.workspaceRoot);
  assert.equal(allocation.outputWorkspaceRef, outputWorkspace.workspaceRef);
  assert.equal(allocation.outputWorkspaceRoot, outputWorkspace.workspaceRoot);
  assert.equal(
    allocation.outputWorkspaceAuthorityRef,
    outputWorkspace.authorityRef
  );
  assert.match(
    allocation.materializationRoot,
    /^\/workspace\/t104-review-stream-a\/\.ai-workspace\/runtime\/runs\//
  );
  assert.equal(
    allocation.materializationUri,
    `${allocation.materializationRoot}/design/design_surface.md`
  );
  assert.equal(allocation.allowedWriteRoots[0], allocation.materializationRoot);
  assert.match(
    allocation.assetRef,
    /^workspace:\/\/review-streams\/stream-a\/capture_requirements_synthesize_design_implement_code/
  );

  const manifest = constructOutputPluginHandoffManifest({
    basis,
    manifestRef: "manifest://t104/cross-workspace",
    admittedInputRefs: [inputBinding.assetRef],
    admittedInputBindings: [inputBinding],
    allocatedOutputs: [allocation],
    proofObligationRefs: ["obligation://t104/requirements-covered"]
  });

  assert.deepEqual(manifest.admittedInputRefs, [inputBinding.assetRef]);
  assert.deepEqual(manifest.inputWorkspaceRoots, [basis.workspaceRoot]);
  assert.deepEqual(manifest.outputWorkspaceRefs, [outputWorkspace.workspaceRef]);
  assert.deepEqual(manifest.outputWorkspaceRoots, [outputWorkspace.workspaceRoot]);
  assert.deepEqual(manifest.allowedWriteRoots, [allocation.materializationRoot]);
});

test("T-104 events and projection preserve W1 source lineage and W2 output lineage", () => {
  const { basis, allocation, outputWorkspace } = buildCrossWorkspaceScenario();
  const materializedPath =
    `${allocation.materializationRoot}/design/design_surface.md`;
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
      bindingRef: "binding://t104/design-surface"
    }),
    constructOutputMaterializationObservedEvent({
      basis,
      vectorIndex: 0,
      allocation,
      materializedRef: "materialized://t104/design-surface",
      materializedPath,
      digest: "digest://t104/design-surface",
      observerRef: "observer://t104/postflight",
      artifactRefs: ["artifact://t104/design-surface"]
    })
  ];

  const projection = deriveOutputAllocationProjection({ basis, events });

  assert.equal(projection.allocations[0].inputWorkspaceRoot, basis.workspaceRoot);
  assert.equal(
    projection.allocations[0].outputWorkspaceRef,
    outputWorkspace.workspaceRef
  );
  assert.equal(
    projection.allocations[0].outputWorkspaceRoot,
    outputWorkspace.workspaceRoot
  );
  assert.equal(projection.bindings[0].workspaceRoot, outputWorkspace.workspaceRoot);
  assert.equal(projection.materializations[0].materializedPath, materializedPath);
});

test("T-104 rejects W1-root leakage and W2-root escape materialization", () => {
  const { basis, allocation } = buildCrossWorkspaceScenario();
  const allocated = constructOutputInstanceAllocatedEvent({
    basis,
    vectorIndex: 0,
    allocation
  });

  assert.throws(
    () =>
      constructOutputMaterializationObservedEvent({
        basis,
        vectorIndex: 0,
        allocation,
        materializedRef: "materialized://t104/w1-leak",
        materializedPath:
          `${basis.workspaceRoot}/.ai-workspace/runtime/runs/leak/out.md`,
        digest: "digest://t104/w1-leak",
        observerRef: "observer://t104/postflight",
        artifactRefs: ["artifact://t104/w1-leak"]
      }),
    /allocated write root/
  );
  assert.throws(
    () =>
      constructOutputMaterializationObservedEvent({
        basis,
        vectorIndex: 0,
        allocation,
        materializedRef: "materialized://t104/w2-root-escape",
        materializedPath: `${allocation.outputWorkspaceRoot}/outside.md`,
        digest: "digest://t104/w2-root-escape",
        observerRef: "observer://t104/postflight",
        artifactRefs: ["artifact://t104/w2-root-escape"]
      }),
    /allocated write root/
  );
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
            materializedRef: "materialized://t104/replayed-w2-escape",
            materializedPath: `${allocation.materializationRoot}/../outside.md`,
            digest: "digest://t104/replayed-w2-escape",
            observerRef: "observer://t104/postflight",
            artifactRefs: ["artifact://t104/replayed-w2-escape"]
          }
        ]
      }),
    /outside allocated root/
  );
});

test("T-104 preserves T-082 same-workspace allocation when W2 is absent", () => {
  const basis = buildThreeStageBasis({ runId: "run://t104/same-workspace" });
  const allocation = deriveOutputInstanceAllocation({
    basis,
    outputName: "design_surface",
    outputAssetType: "Workspace.design_surface",
    relativePath: "design/design_surface.md"
  });

  assert.equal(allocation.ok, true);
  assert.equal(allocation.allocation.inputWorkspaceRoot, basis.workspaceRoot);
  assert.equal(allocation.allocation.outputWorkspaceRoot, basis.workspaceRoot);
  assert.equal(
    allocation.allocation.outputWorkspaceRef,
    `workspace://${basis.moduleName}/scope`
  );
  assert.equal(
    allocation.allocation.assetRef,
    `workspace://${basis.moduleName}/${basis.graphFunction.name}` +
      `/run_t104_same-workspace/outputs/design_surface`
  );
  assert.match(
    allocation.allocation.materializationRoot,
    /^\/workspace\/m03-iteration\/\.ai-workspace\/runtime\/runs\//
  );
});

test("T-104 fails closed when W2 is a path shortcut instead of a workspace binding", () => {
  const { module, executive } = buildThreeStageModule();

  assert.throws(
    () =>
      admitPublicStartRequest({
        scope: {
          kind: "workspace",
          workspaceRoot: "/workspace/t104-input",
          moduleName: module.name
        },
        target: {
          kind: "graph_function",
          handle: executive.name
        },
        until: "converged",
        requested_outputs: [
          {
            output_name: "design_surface",
            output_asset_type: "Workspace.design_surface",
            relative_path: "design/design_surface.md",
            output_workspace: "/workspace/not-a-binding"
          }
        ]
      }),
    /expected a plain object/
  );

  const emptyWorkspace = admitOutputWorkspaceBinding({
    workspaceRef: "",
    workspaceRoot: "/workspace/t104-output",
    authorityRef: null,
    source: "caller"
  });
  assert.equal(emptyWorkspace.ok, false);
  assert.equal(emptyWorkspace.reason, "empty_workspace_ref");
});
