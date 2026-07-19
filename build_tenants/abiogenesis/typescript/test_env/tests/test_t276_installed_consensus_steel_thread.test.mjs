// Validates: T-276 early source-blind installed Consensus delivery governor.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  access,
  chmod,
  copyFile,
  lstat,
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  rm,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { prepareT223AbgCandidate } from "../tools/t223_abg_candidate.mjs";
import {
  generateT223HelloWorldFixture,
  T223_FIXTURE_GRAPH_HANDLE
} from "../tools/t223_hello_world_fixture.mjs";

const TENANT_ROOT = path.resolve(import.meta.dirname, "../..");
const DRIVER_SOURCE = path.join(
  TENANT_ROOT,
  "test_env",
  "tools",
  "t276_installed_consensus_driver.mjs"
);
const FP_TRANSPORT_SOURCE = path.join(
  TENANT_ROOT,
  "test_env",
  "fixtures",
  "t276_installed_consensus",
  "fp-transport"
);
const ORACLE_SOURCE = path.join(
  TENANT_ROOT,
  "test_env",
  "fixtures",
  "t276_installed_consensus",
  "target-operation-family.json"
);
const ORACLE_DIGEST =
  "sha256:811227e7419d8d3c348bc6f50ab171696a55133f9c7f8a076513307908363ec1";
const REQUIREMENT_SOURCE = path.resolve(
  TENANT_ROOT,
  "../../../specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md"
);
const REQUIREMENT_SOURCE_DIGEST =
  "sha256:eed6bfd474d8e572a82d25a7e227f5e1e447f0f78f75933a32fdaf3ed7c43764";

function sha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalizeIJson(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalizeIJson).join(",")}]`;
  }
  return `{${Object.keys(value).sort(compareText).map(
    (key) => `${JSON.stringify(key)}:${canonicalizeIJson(value[key])}`
  ).join(",")}}`;
}

function digestCanonicalIJson(value) {
  return sha256(Buffer.from(canonicalizeIJson(value), "utf8"));
}

function cloneIJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function run(command, args, options) {
  const outcome = spawnSync(command, args, {
    cwd: options.cwd,
    env: options.env ?? process.env,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024
  });
  assert.equal(
    outcome.status,
    0,
    `${command} ${args.join(" ")} failed\nstdout:\n${outcome.stdout}\nstderr:\n${outcome.stderr}`
  );
  assert.equal(outcome.stderr, "", `${command} wrote stderr`);
  return outcome.stdout;
}

async function pathExists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function writeInstalledPublication(
  packageRoot,
  originalCatalog,
  originalManifest,
  operationRows
) {
  const catalogBasis = {
    ...originalCatalog,
    rows: [
      ...originalCatalog.rows.filter((row) => row.contractKind !== "operation"),
      ...operationRows
    ]
  };
  delete catalogBasis.catalogDigest;
  const catalog = {
    ...catalogBasis,
    catalogDigest: digestCanonicalIJson(catalogBasis)
  };
  await writeFile(
    path.join(packageRoot, "contracts", "public-contract-catalog.json"),
    canonicalizeIJson(catalog),
    "utf8"
  );
  await writeFile(
    path.join(packageRoot, "product-toolchain-manifest.json"),
    canonicalizeIJson({
      ...originalManifest,
      publicContractCatalog: catalog,
      publicContractCatalogDigest: catalog.catalogDigest
    }),
    "utf8"
  );
}

test("T-276 packed temporary workspace runs the source-blind create-to-ready installed skeleton", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t276-consensus-thread-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  const candidate = await prepareT223AbgCandidate({
    outputRoot: path.join(root, "candidate")
  });
  const helloWorldFixture = await generateT223HelloWorldFixture({
    root: path.join(root, "hello-world-product"),
    abgVersion: candidate.descriptor.version
  });
  const helloWorldDescriptorPath = path.join(
    helloWorldFixture.root,
    "sidecars",
    "product-descriptor.json"
  );
  const helloWorldContributionPath = path.join(
    helloWorldFixture.root,
    "sidecars",
    "contribution-manifest.json"
  );
  const helloWorldDescriptor = JSON.parse(
    await readFile(helloWorldDescriptorPath, "utf8")
  );
  const helloWorldContribution = JSON.parse(
    await readFile(helloWorldContributionPath, "utf8")
  );
  const expectedArtifactDigest = candidate.artifact.expectedArtifactDigest;
  const oracleBytes = await readFile(ORACLE_SOURCE);
  const oracle = JSON.parse(oracleBytes);
  const requirementBytes = await readFile(REQUIREMENT_SOURCE);
  const requirementSource = requirementBytes.toString("utf8");
  const requirementSection = requirementSource.match(
    /\*\*REQ-P-PUBLIC-CONTRACTS-008\*\*[\s\S]+?This is a hard break\./u
  )?.[0];
  assert.equal(sha256(oracleBytes), ORACLE_DIGEST);
  assert.equal(sha256(requirementBytes), REQUIREMENT_SOURCE_DIGEST);
  assert.equal(
    oracle.basis.targetRequirementSourceDigest,
    REQUIREMENT_SOURCE_DIGEST
  );
  assert.deepEqual(
    [...requirementSection.matchAll(/`(abg\.operation\.[^`]+)`/gu)]
      .map((match) => match[1]),
    oracle.targetOperationIds
  );
  const consumerRoot = path.join(root, "consumer");
  await mkdir(consumerRoot, { recursive: true });
  await writeFile(
    path.join(consumerRoot, "package.json"),
    `${JSON.stringify({ name: "t276-installed-consumer", private: true })}\n`,
    "utf8"
  );
  run(
    "npm",
    [
      "install",
      "--save-exact",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      candidate.artifactPath
    ],
    { cwd: consumerRoot }
  );

  const packageRoot = path.join(
    consumerRoot,
    "node_modules",
    "@abiogenesis",
    "typescript-tenant"
  );
  const packageEntry = await lstat(packageRoot);
  assert.equal(packageEntry.isDirectory(), true);
  assert.equal(packageEntry.isSymbolicLink(), false);
  assert.equal(
    (await realpath(packageRoot)).startsWith(`${await realpath(consumerRoot)}${path.sep}`),
    true
  );

  const driverSource = await readFile(DRIVER_SOURCE, "utf8");
  assert.doesNotMatch(
    driverSource,
    /@abiogenesis|code\/src|build\/semantic|\.\.\/\.\./u
  );
  const installedDriverPath = path.join(consumerRoot, "t276-driver.mjs");
  await copyFile(DRIVER_SOURCE, installedDriverPath);
  const installedTransportPath = path.join(consumerRoot, "fp-transport");
  await copyFile(FP_TRANSPORT_SOURCE, installedTransportPath);
  await chmod(installedTransportPath, 0o755);
  const liveSteeringPath = path.join(consumerRoot, "live-steering.json");
  await writeFile(
    liveSteeringPath,
    JSON.stringify({
      agent: "generic",
      model: null,
      profile: "local-spawn",
      timeoutMs: 30000
    }),
    "utf8"
  );
  const transportCallLogPath = path.join(
    consumerRoot,
    "fp-transport-calls.txt"
  );
  const installedOraclePath = path.join(
    consumerRoot,
    "target-operation-family.json"
  );
  await copyFile(ORACLE_SOURCE, installedOraclePath);
  const workspaceRoot = path.join(root, "temporary-workspace");
  const driverStateRoot = path.join(consumerRoot, ".t276-driver-state");
  const actorRef = "actor://t276/source-blind-caller";
  const operatorCapabilityId =
    "abg.capability.operator.public-contract@5";
  const installCapabilityId =
    "abg.capability.install.bind-products@5";
  const catalogContributionCapabilityId =
    "abg.capability.catalog.contribute@5";
  const catalogApplyCapabilityId =
    "abg.capability.catalog.apply-overlay@5";
  const catalogInvokeCapabilityId =
    "abg.capability.catalog.invoke-graph-function@5";
  const runtimeExecuteCapabilityId =
    "abg.capability.runtime.execute-seven-term-c@5";
  const runtimeReplayCapabilityId =
    "abg.capability.runtime.replay-continuation@5";
  const runtimeAssessCapabilityId =
    "abg.capability.runtime.admit-fp-result@5";
  const authorityBasisRef = "authority-basis://t276/source-blind-caller";
  const authorityBasisDigest = digestCanonicalIJson({
    authorityBasisRef,
    candidateArtifactDigest: expectedArtifactDigest
  });
  const configPath = path.join(consumerRoot, "t276-config.json");
  const config = {
    artifactPath: candidate.artifactPath,
    candidateArtifact: candidate.artifact,
    candidateContributionPath: candidate.contributionPath,
    candidateDescriptorPath: candidate.descriptorPath,
    callerAuthority: {
      actor: {
        state: "admitted_actor",
        actorRef,
        attributionRef: "attribution://t276/source-blind-caller",
        attributionDigest: digestCanonicalIJson({ actorRef })
      },
      authorityBasisRef,
      authorityBasisDigest,
      capabilityGrantActorRef: actorRef,
      capabilityGrants: [{
        capabilityId: operatorCapabilityId,
        capabilityDefinitionRef:
          "capability-definition://abg/operator/public-contract/v5",
        capabilityDefinitionDigest: digestCanonicalIJson({
          capabilityId: operatorCapabilityId
        }),
        approvalRef: "approval://t276/source-blind-caller",
        policyRef: "policy://t276/installed-qualification",
        scopeRef: "scope://t276/temporary-workspace",
        scopeDigest: digestCanonicalIJson({
          application: "temporary",
          workspaceRoot
        })
      }, {
        capabilityId: installCapabilityId,
        capabilityDefinitionRef:
          "capability-definition://abg/install/bind-products/v5",
        capabilityDefinitionDigest: digestCanonicalIJson({
          capabilityId: installCapabilityId
        }),
        approvalRef: "approval://t276/source-blind-installer",
        policyRef: "policy://t276/installed-qualification",
        scopeRef: "scope://t276/temporary-toolchain",
        scopeDigest: digestCanonicalIJson({
          application: "temporary",
          toolchainRoot: path.join(root, "toolchain")
        })
      }, {
        capabilityId: catalogContributionCapabilityId,
        capabilityDefinitionRef:
          "capability-definition://abg/catalog/contribute/v5",
        capabilityDefinitionDigest: digestCanonicalIJson({
          capabilityId: catalogContributionCapabilityId
        }),
        approvalRef: "approval://t276/source-blind-catalog-bootstrap",
        policyRef: "policy://t276/installed-qualification",
        scopeRef: "scope://t276/temporary-workspace-catalog",
        scopeDigest: digestCanonicalIJson({
          application: "temporary",
          workspaceRoot,
          role: "catalog_bootstrap"
        })
      }, {
        capabilityId: catalogApplyCapabilityId,
        capabilityDefinitionRef:
          "capability-definition://abg/catalog/apply-overlay/v5",
        capabilityDefinitionDigest: digestCanonicalIJson({
          capabilityId: catalogApplyCapabilityId
        }),
        approvalRef: "approval://t276/source-blind-catalog-apply",
        policyRef: "policy://t276/installed-qualification",
        scopeRef: "scope://t276/temporary-workspace-catalog",
        scopeDigest: digestCanonicalIJson({
          application: "temporary",
          workspaceRoot,
          role: "catalog_apply"
        })
      }, {
        capabilityId: catalogInvokeCapabilityId,
        capabilityDefinitionRef:
          "capability-definition://abg/catalog/invoke-graph-function/v5",
        capabilityDefinitionDigest: digestCanonicalIJson({
          capabilityId: catalogInvokeCapabilityId
        }),
        approvalRef: "approval://t276/source-blind-catalog-invoke",
        policyRef: "policy://t276/installed-qualification",
        scopeRef: "scope://t276/temporary-workspace-catalog",
        scopeDigest: digestCanonicalIJson({
          application: "temporary",
          workspaceRoot,
          role: "catalog_invoke"
        })
      }, {
        capabilityId: runtimeExecuteCapabilityId,
        capabilityDefinitionRef:
          "capability-definition://abg/runtime/execute-seven-term-c/v5",
        capabilityDefinitionDigest: digestCanonicalIJson({
          capabilityId: runtimeExecuteCapabilityId
        }),
        approvalRef: "approval://t276/source-blind-runtime-execute",
        policyRef: "policy://t276/installed-qualification",
        scopeRef: "scope://t276/temporary-workspace-runtime",
        scopeDigest: digestCanonicalIJson({
          application: "temporary",
          workspaceRoot,
          role: "runtime_execute"
        })
      }, {
        capabilityId: runtimeReplayCapabilityId,
        capabilityDefinitionRef:
          "capability-definition://abg/runtime/replay-continuation/v5",
        capabilityDefinitionDigest: digestCanonicalIJson({
          capabilityId: runtimeReplayCapabilityId
        }),
        approvalRef: "approval://t276/source-blind-runtime-replay",
        policyRef: "policy://t276/installed-qualification",
        scopeRef: "scope://t276/temporary-workspace-runtime-replay",
        scopeDigest: digestCanonicalIJson({
          application: "temporary",
          workspaceRoot,
          role: "runtime_replay"
        })
      }, {
        capabilityId: runtimeAssessCapabilityId,
        capabilityDefinitionRef:
          "capability-definition://abg/runtime/admit-fp-result/v5",
        capabilityDefinitionDigest: digestCanonicalIJson({
          capabilityId: runtimeAssessCapabilityId
        }),
        approvalRef: "approval://t276/source-blind-runtime-assess",
        policyRef: "policy://t276/installed-qualification",
        scopeRef: "scope://t276/temporary-workspace-runtime-assess",
        scopeDigest: digestCanonicalIJson({
          application: "temporary",
          workspaceRoot,
          role: "runtime_assess"
        })
      }],
      correlationRef: "correlation://t276/source-blind-workspace-create",
      provenanceRefs: ["proof://t276/installed-caller-authority"]
    },
    cliPath: path.join(consumerRoot, "node_modules", ".bin", "abg.cli"),
    driverStateRoot,
    expectedArtifactDigest,
    helloWorldProduct: {
      artifact: {
        format: "npm_package_tgz",
        artifactPath: helloWorldFixture.artifactPath,
        expectedArtifactDigest:
          helloWorldDescriptor.distributionArtifactDigest,
        expectedProductContentDigest:
          helloWorldDescriptor.productContentDigest
      },
      contributionPath: helloWorldContributionPath,
      descriptorPath: helloWorldDescriptorPath,
      liveSteeringPath,
      targetGraphFunctionHandle: T223_FIXTURE_GRAPH_HANDLE,
      transportCallLogPath
    },
    packageRoot,
    qualificationOraclePath: installedOraclePath,
    toolchainRoot: path.join(root, "toolchain"),
    workspaceRoot
  };
  await writeFile(configPath, JSON.stringify(config), "utf8");

  const report = JSON.parse(
    run(process.execPath, [installedDriverPath, "--config", configPath], {
      cwd: consumerRoot,
      env: {
        ...process.env,
        PATH: `${consumerRoot}${path.delimiter}${path.join(
          consumerRoot,
          "node_modules",
          ".bin"
        )}${path.delimiter}${process.env.PATH ?? ""}`,
        T223_FP_CALL_LOG: transportCallLogPath
      }
    })
  );
  assert.deepEqual(
    {
      kind: report.kind,
      phase: report.phase,
      coordinate: report.coordinate,
      reason: report.reason,
      targetOperationInvocationCount: report.targetOperationInvocationCount,
      workspaceOperationInvoked: report.workspace.workspaceOperationInvoked
    },
    {
      kind: "accepted_installed_steel_thread",
      phase: "installed_consensus_driver",
      coordinate: null,
      reason: null,
      targetOperationInvocationCount: 22,
      workspaceOperationInvoked: true
    },
    JSON.stringify(report.cliFailure ?? report)
  );
  assert.equal(report.candidate.packageName, "@abiogenesis/typescript-tenant");
  assert.equal(report.candidate.artifactDigest, expectedArtifactDigest);
  const installedCatalog = JSON.parse(
    await readFile(
      path.join(packageRoot, "contracts", "public-contract-catalog.json"),
      "utf8"
    )
  );
  const installedOperationRows = installedCatalog.rows
    .filter((row) => row.contractKind === "operation");
  const workspaceCreateRow = installedOperationRows.find(
    (row) => row.contractId === "abg.operation.workspace.create"
  );
  const installedOperationIds = installedOperationRows.map(
    (row) => row.contractId
  );
  assert.equal(installedCatalog.profile, "abg-5-release");
  assert.deepEqual([...installedOperationIds].sort(), [
    ...oracle.targetOperationIds
  ].sort());
  assert.equal(
    installedOperationRows.every(
      (row) => row.operationContract?.kind ===
        "abg_public_operation_definition_family"
    ),
    true
  );
  assert.deepEqual(report.familyDelta, {
    missingTargetOperationIds: [],
    duplicateTargetOperationIds: [],
    incompleteTargetOperationIds: [],
    retiredOperationIds: []
  });
  assert.deepEqual(
    {
      operationRowCount: report.familyProof.operationRowCount,
      definitionMemberCount: report.familyProof.definitionMemberCount,
      schemaCoordinateCount: report.familyProof.schemaCoordinateCount,
      schemaAssetCount: report.familyProof.schemaAssetCount,
      absentNonterminalCount: report.familyProof.absentNonterminalCount,
      operationContractMetaSchemaValidatedAssetCount:
        report.familyProof.operationContractMetaSchemaValidatedAssetCount,
      legacyOperationIds: report.familyProof.legacyOperationIds
    },
    {
      operationRowCount: 19,
      definitionMemberCount: 62,
      schemaCoordinateCount: 196,
      schemaAssetCount: 196,
      absentNonterminalCount: 52,
      operationContractMetaSchemaValidatedAssetCount: 19,
      legacyOperationIds: []
    }
  );
  assert.equal(report.familyProof.familyDigests.length, 1);
  assert.equal(
    report.familyProof.familyDigests[0],
    report.familyProof.recomputedFamilyDigest
  );
  assert.match(
    report.familyProof.operationContractMetaSchemaDigest,
    /^sha256:[0-9a-f]{64}$/u
  );
  assert.equal(report.qualificationOracle.digest, ORACLE_DIGEST);
  assert.equal(report.workspace.application, "temporary");
  assert.equal(report.workspace.requestedRoot, workspaceRoot);
  assert.equal(await pathExists(workspaceRoot), true);
  assert.deepEqual(report.workspace.eventKinds.slice(0, 10), [
    "public_operation_admitted",
    "public_operation_artifact_admitted",
    "public_operation_admitted",
    "public_operation_artifact_admitted",
    "public_operation_admitted",
    "public_operation_artifact_admitted",
    "public_operation_admitted",
    "public_operation_artifact_admitted",
    "public_operation_admitted",
    "registry_entry_admitted"
  ]);
  for (const kind of [
    "basis_admitted",
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "payload_observed",
    "payload_validated",
    "evidence_admitted",
    "vector_evaluated",
    "vector_closed"
  ]) {
    assert.equal(report.workspace.eventKinds.includes(kind), true, kind);
  }
  assert.equal(
    report.workspace.eventLogPath,
    path.join(workspaceRoot, ".ai-workspace", "events", "events.jsonl")
  );
  assert.equal(report.workspace.readiness, "ready");
  assert.deepEqual(report.operationTrace, [
    "abg.operation.workspace.create",
    "abg.operation.product.resolve",
    "abg.operation.product.verify",
    "abg.operation.product.verify",
    "abg.operation.product.install",
    "abg.operation.product.install",
    "abg.operation.workspace.bind",
    "abg.operation.project.read",
    "abg.operation.project.read",
    "abg.operation.catalog.admit",
    "abg.operation.catalog.view",
    "abg.operation.catalog.apply",
    "abg.operation.run.invoke",
    "abg.operation.project.read",
    "abg.operation.project.read",
    "abg.operation.project.read",
    "abg.operation.project.read",
    "abg.operation.project.read",
    "abg.operation.project.read",
    "abg.operation.result.assess",
    "abg.operation.project.read",
    "abg.operation.project.read"
  ]);
  assert.deepEqual(report.eventCalculusProof, {
    immutableArtifactOperations: [
      "abg.operation.workspace.create",
      "abg.operation.product.install",
      "abg.operation.workspace.bind",
      "abg.operation.catalog.apply"
    ],
    pureOperations: [
      "abg.operation.product.resolve",
      "abg.operation.product.verify",
      "abg.operation.project.read",
      "abg.operation.catalog.view"
    ],
    eventAdmissionOperations: [
      "abg.operation.catalog.admit"
    ],
    runtimeTransitionOperations: [
      "abg.operation.run.invoke"
    ],
    eventCount: report.workspace.eventKinds.length,
    artifactReplayEquivalent: true,
    readByteEquivalent: true,
    ruleBArtifactAvailabilityCount: 4,
    ruleBArtifactBoundaryCount: 5,
    readiness: "ready",
    installedRuntimeFluentProjection: {
      caseKey: "run_status",
      subjectRef: report.carrierChain.runInvoke.runRef,
      programRef: report.eventCalculusProof.installedRuntimeFluentProjection
        .programRef,
      workspaceBindingRef: report.workspace.bindingRef,
      executionBasisRef: report.eventCalculusProof.installedRuntimeFluentProjection
        .executionBasisRef,
      lifecycle: "completed",
      terminalEventRef: report.eventCalculusProof.installedRuntimeFluentProjection
        .terminalEventRef,
      replayRef: report.eventCalculusProof.installedRuntimeFluentProjection
        .replayRef,
      byteEquivalent: true,
      readsEventFree: true
    }
  });
  assert.equal(
    report.eventCalculusProof.installedRuntimeFluentProjection.subjectRef,
    report.carrierChain.runInvoke.runRef
  );
  assert.equal(
    report.eventCalculusProof.installedRuntimeFluentProjection.programRef,
    report.carrierChain.catalogApplication.targetProgram.ref
  );
  assert.match(
    report.eventCalculusProof.installedRuntimeFluentProjection.executionBasisRef,
    /^execution_basis:/u
  );
  assert.match(
    report.eventCalculusProof.installedRuntimeFluentProjection.terminalEventRef,
    /^runtime-event:/u
  );
  assert.match(
    report.eventCalculusProof.installedRuntimeFluentProjection.replayRef,
    /^replay:\/\/abg\/project\.read\/run-status\/[0-9a-f]{64}$/u
  );
  assert.equal(report.persistedRuntimeReplayProof.rule, "A");
  assert.equal(report.persistedRuntimeReplayProof.appendOnly, true);
  assert.equal(report.persistedRuntimeReplayProof.readsEventFree, true);
  assert.equal(report.persistedRuntimeReplayProof.runStatusByteEquivalent, true);
  assert.equal(report.persistedRuntimeReplayProof.runResultByteEquivalent, true);
  assert.equal(report.persistedRuntimeReplayProof.runReplayByteEquivalent, true);
  assert.equal(report.persistedRuntimeReplayProof.appendedEventCount > 0, true);
  assert.equal(report.persistedRuntimeReplayProof.replayRowCount > 0, true);
  assert.equal(
    new Set([
      report.carrierChain.workspaceCreate.boundaryEventRef,
      ...report.carrierChain.installedProducts.map(
        (product) => product.boundaryEventRef
      ),
      report.carrierChain.workspaceBind.boundaryEventRef,
      report.carrierChain.catalogApplication.boundaryEventRef
    ]).size,
    5
  );
  assert.equal(
    report.carrierChain.workspaceBind.workspaceBindingRef,
    report.workspace.bindingRef
  );
  assert.equal(
    report.carrierChain.workspaceBind.workspaceBindingDigest,
    report.workspace.bindingDigest
  );
  assert.equal(report.carrierChain.projectRead.readiness, "ready");
  assert.deepEqual(
    report.carrierChain.projectRead.artifactAvailability,
    [
      {
        operationId: "abg.operation.workspace.create",
        scope: {
          ref: report.carrierChain.workspaceCreate.workspaceRef,
          digest: report.carrierChain.workspaceCreate.manifestDigest
        },
        artifact: {
          ref: report.carrierChain.workspaceCreate.manifestRef,
          digest: report.carrierChain.workspaceCreate.manifestDigest
        },
        boundaryEventRef:
          report.carrierChain.workspaceCreate.boundaryEventRef
      },
      ...report.carrierChain.installedProducts.map((product) => ({
        operationId: "abg.operation.product.install",
        scope: {
          ref: product.installedProductRef,
          digest: product.installedProductDigest
        },
        artifact: {
          ref: product.installedProductRef,
          digest: product.installedProductDigest
        },
        boundaryEventRef: product.boundaryEventRef
      })),
      {
        operationId: "abg.operation.workspace.bind",
        scope: {
          ref: report.carrierChain.workspaceCreate.workspaceRef,
          digest: report.carrierChain.workspaceCreate.manifestDigest
        },
        artifact: {
          ref: report.carrierChain.workspaceBind.workspaceBindingRef,
          digest: report.carrierChain.workspaceBind.workspaceBindingDigest
        },
        boundaryEventRef: report.carrierChain.workspaceBind.boundaryEventRef
      }
    ]
  );
  assert.equal(report.carrierChain.catalogAdmission.role, "bootstrap");
  assert.equal(report.carrierChain.catalogView.effectiveHandles.length, 3);
  const baseContributionRow = candidate.contribution.rows.find(
    (row) =>
      row.locator.modulePath ===
        report.carrierChain.catalogView.baseModulePath &&
      row.locator.moduleDigest ===
        report.carrierChain.catalogView.baseModuleDigest
  );
  assert.notEqual(baseContributionRow, undefined);
  assert.equal(baseContributionRow.publicKind, "graph_function");
  assert.equal(baseContributionRow.contractRef, "abg.schema.gtl-graph-function");
  assert.equal(baseContributionRow.ownerProductId, "abiogenesis");
  const helloWorldGraphRow = helloWorldContribution.rows.find(
    (row) => row.canonicalHandle === T223_FIXTURE_GRAPH_HANDLE
  );
  const helloWorldOverlayRow = helloWorldContribution.rows.find(
    (row) => row.publicKind === "overlay"
  );
  assert.notEqual(helloWorldGraphRow, undefined);
  assert.notEqual(helloWorldOverlayRow, undefined);
  assert.deepEqual(
    report.carrierChain.catalogView.effectiveHandles,
    [
      baseContributionRow.canonicalHandle,
      helloWorldGraphRow.canonicalHandle,
      helloWorldOverlayRow.canonicalHandle
    ].sort(compareText)
  );
  assert.equal(report.carrierChain.catalogView.eventFree, true);
  assert.equal(report.carrierChain.catalogView.baseVectorCount > 0, true);
  assert.match(
    report.carrierChain.catalogView.baseModuleDigest,
    /^sha256:[0-9a-f]{64}$/u
  );
  assert.deepEqual(
    [...report.carrierChain.catalogAdmission.admittedEntryRefs].sort(compareText),
    [
      ...candidate.contribution.rows,
      ...helloWorldContribution.rows
    ].map((row) => row.canonicalHandle).sort(compareText)
  );
  assert.deepEqual(
    Object.keys(report.carrierChain.catalogView.applicationCandidate).sort(),
    [
      "applicationBasisDigest",
      "applicationBasisRef",
      "catalogRowDigest",
      "catalogRowRef",
      "catalogViewDigest",
      "catalogViewRef",
      "declarationDigest",
      "declarationRef",
      "targetDigest",
      "targetRef"
    ]
  );
  assert.equal(
    report.carrierChain.catalogView.applicationCandidate.catalogRowRef,
    helloWorldOverlayRow.canonicalHandle
  );
  assert.equal(
    report.carrierChain.catalogView.applicationCandidate.declarationRef,
    helloWorldOverlayRow.declarationRef
  );
  assert.equal(
    report.carrierChain.catalogView.applicationCandidate.targetRef,
    helloWorldGraphRow.declarationRef
  );
  assert.equal(
    report.carrierChain.catalogView.applicationCandidate.catalogViewRef,
    report.carrierChain.catalogView.catalogViewRef
  );
  assert.equal(
    report.carrierChain.catalogView.applicationCandidate.catalogViewDigest,
    report.carrierChain.catalogView.catalogViewDigest
  );
  assert.equal(
    report.carrierChain.catalogApplication.declarationRef,
    helloWorldOverlayRow.declarationRef
  );
  assert.equal(
    report.carrierChain.catalogApplication.applicationKind,
    "overlay"
  );
  assert.match(
    report.carrierChain.catalogApplication.applicationRef,
    /^declaration-application:\/\/abg\/catalog\/overlay\/[0-9a-f]{64}$/u
  );
  assert.match(
    report.carrierChain.catalogApplication.applicationArtifactDigest,
    /^sha256:[0-9a-f]{64}$/u
  );
  assert.match(
    report.carrierChain.catalogApplication.targetProgram.ref,
    /^gtl-program:\/\/abg\/catalog-application\/[0-9a-f]{64}$/u
  );
  assert.match(
    report.carrierChain.catalogApplication.targetProgram.digest,
    /^sha256:[0-9a-f]{64}$/u
  );
  assert.equal(report.carrierChain.runInvoke.disposition, "completed");
  assert.match(report.carrierChain.runInvoke.runRef, /^public-invocation:/u);
  assert.match(report.carrierChain.runInvoke.runDigest, /^sha256:[0-9a-f]{64}$/u);
  assert.match(report.carrierChain.runInvoke.resultRef, /^payload:/u);
  assert.match(
    report.carrierChain.runInvoke.resultDigest,
    /^sha256:[0-9a-f]{64}$/u
  );
  assert.equal(report.carrierChain.runtimeRead.eventFree, true);
  assert.equal(report.carrierChain.runtimeRead.replayStable, true);
  assert.equal(report.carrierChain.runtimeRead.runReplayRowCount > 0, true);
  for (const digest of [
    report.carrierChain.productResolve.resolvedLockDigest,
    report.carrierChain.productVerify.verifiedArtifactDigest,
    report.carrierChain.productInstall.installedProductDigest,
    report.carrierChain.workspaceBind.workspaceBindingDigest,
    report.carrierChain.projectRead.projectionDigest,
    report.carrierChain.catalogApplication.applicationArtifactDigest,
    report.carrierChain.catalogApplication.targetProgram.digest,
    report.carrierChain.runtimeRead.runResultProjectionDigest,
    report.carrierChain.runtimeRead.runReplayProjectionDigest
  ]) {
    assert.match(digest, /^sha256:[0-9a-f]{64}$/u);
  }
  assert.deepEqual(
    {
      source: report.constructorProof.source,
      definitionDigest: report.constructorProof.definitionDigest,
      requestContract: report.constructorProof.requestContract,
      invocationDigest: report.constructorProof.invocationDigest,
      tamperedDefinitionDigestRefused:
        report.constructorProof.tamperedDefinitionDigestRefused,
      tamperedExitCode: report.constructorProof.tamperedExitCode,
      workspaceExistedAfterTamper:
        report.constructorProof.workspaceExistedAfterTamper
    },
    {
      source: "installed_operation_metadata",
      definitionDigest: workspaceCreateRow.operationContract.definitions.find(
        (definition) => definition.definitionKey.variant === "clean"
      ).definitionDigest,
      requestContract: Object.fromEntries(
        Object.entries(
          workspaceCreateRow.operationContract.definitions.find(
            (definition) => definition.definitionKey.variant === "clean"
          ).schemaCoordinates.request
        ).filter(([key]) => key !== "assetLocator")
      ),
      invocationDigest: report.constructorProof.invocationDigest,
      tamperedDefinitionDigestRefused: true,
      tamperedExitCode: 2,
      workspaceExistedAfterTamper: false
    }
  );
  assert.match(
    report.constructorProof.invocationDigest,
    /^sha256:[0-9a-f]{64}$/u
  );
  const constructedInvocation = JSON.parse(
    await readFile(path.join(driverStateRoot, "workspace-create.json"), "utf8")
  );
  assert.doesNotMatch(
    JSON.stringify(constructedInvocation),
    /(?:asset|native)Locator|private_source_module/u
  );
  assert.deepEqual(constructedInvocation.contractCatalog, {
    kind: "public_contract_catalog_coordinate",
    catalogId: installedCatalog.catalogId,
    catalogVersion: installedCatalog.catalogVersion,
    catalogDigest: installedCatalog.catalogDigest
  });
  assert.equal(constructedInvocation.authority.actor.actorRef, actorRef);
  assert.equal(
    constructedInvocation.definitionDigest,
    report.constructorProof.definitionDigest
  );
  const {
    invocationDigest: constructedInvocationDigest,
    ...constructedInvocationBasis
  } = constructedInvocation;
  assert.equal(
    constructedInvocationDigest,
    digestCanonicalIJson(constructedInvocationBasis)
  );
  const {
    kind: authorityKind,
    authoritySetRef,
    authoritySetDigest,
    ...constructedAuthorityBasis
  } = constructedInvocation.authority;
  assert.equal(authorityKind, "invocation_authority");
  assert.equal(authoritySetDigest, digestCanonicalIJson(constructedAuthorityBasis));
  assert.equal(authoritySetRef, `invocation-authority:${authoritySetDigest}`);
  for (const grant of constructedInvocation.authority.capabilityGrants) {
    const { kind, grantRef, grantDigest, ...grantBasis } = grant;
    assert.equal(kind, "capability_grant");
    assert.equal(grantDigest, digestCanonicalIJson(grantBasis));
    assert.equal(grantRef, `capability-grant:${grantDigest}`);
  }
  const tamperedInvocation = JSON.parse(
    await readFile(
      path.join(driverStateRoot, "workspace-create-tampered-definition.json"),
      "utf8"
    )
  );
  assert.notEqual(
    tamperedInvocation.definitionDigest,
    constructedInvocation.definitionDigest
  );
  assert.equal(
    tamperedInvocation.authority.definitionDigest,
    tamperedInvocation.definitionDigest
  );
  const {
    invocationDigest: tamperedInvocationDigest,
    ...tamperedInvocationBasis
  } = tamperedInvocation;
  assert.equal(
    tamperedInvocationDigest,
    digestCanonicalIJson(tamperedInvocationBasis)
  );
  const chainedInvocations = await Promise.all([
    "product-resolve.json",
    "product-verify-abiogenesis.json",
    "product-verify-hello-world.json",
    "product-install-abiogenesis.json",
    "product-install-hello-world.json",
    "workspace-bind.json",
    "project-read-workspace-status.json",
    "project-read-workspace-status-replay.json",
    "catalog-admit.json",
    "catalog-view.json",
    "catalog-apply.json",
    "run-invoke-hello-world-fp.json",
    "project-read-fp-run-status.json",
    "project-read-fp-run-status-repeat.json",
    "project-read-fp-run-result.json",
    "project-read-fp-run-result-repeat.json",
    "project-read-fp-run-replay.json",
    "project-read-fp-run-replay-repeat.json",
    "result-assess-fp.json",
    "project-read-fp-run-result-assessed.json",
    "project-read-fp-run-replay-assessed.json"
  ].map(async (filename) => JSON.parse(await readFile(
    path.join(driverStateRoot, filename),
    "utf8"
  ))));
  for (const chainedInvocation of chainedInvocations) {
    assert.doesNotMatch(
      JSON.stringify(chainedInvocation),
      /"nativeLocator":(?!null)|private_source_module|code\/src|build\/semantic/u
    );
    const { invocationDigest, ...basis } = chainedInvocation;
    assert.equal(invocationDigest, digestCanonicalIJson(basis));
    const key = chainedInvocation.definitionKey;
    const member = key.memberKind === "variant" ? key.variant : key.caseKey;
    const selectedDefinition = installedOperationRows
      .find((row) => row.contractId === key.operationId)
      ?.operationContract.definitions.find((definition) => {
        const candidate = definition.definitionKey;
        return candidate.memberKind === key.memberKind &&
          (candidate.memberKind === "variant"
            ? candidate.variant === member
            : candidate.caseKey === member);
      });
    assert.notEqual(selectedDefinition, undefined);
    assert.equal(
      chainedInvocation.authority.actor.state,
      selectedDefinition.authoritySlotRequirements.actor === "forbidden"
        ? "forbidden"
        : "admitted_actor"
    );
    assert.deepEqual(
      chainedInvocation.authority.capabilityGrants.map(
        (grant) => grant.capabilityId
      ).sort(),
      [...selectedDefinition.capabilityRefs].sort()
    );
  }
  assert.deepEqual(
    chainedInvocations.map((invocation) => invocation.definitionKey.operationId),
    [
      "abg.operation.product.resolve",
      "abg.operation.product.verify",
      "abg.operation.product.verify",
      "abg.operation.product.install",
      "abg.operation.product.install",
      "abg.operation.workspace.bind",
      "abg.operation.project.read",
      "abg.operation.project.read",
      "abg.operation.catalog.admit",
      "abg.operation.catalog.view",
      "abg.operation.catalog.apply",
      "abg.operation.run.invoke",
      "abg.operation.project.read",
      "abg.operation.project.read",
      "abg.operation.project.read",
      "abg.operation.project.read",
      "abg.operation.project.read",
      "abg.operation.project.read",
      "abg.operation.result.assess",
      "abg.operation.project.read",
      "abg.operation.project.read"
    ]
  );
  const catalogApplyInvocation = chainedInvocations.find(
    (invocation) =>
      invocation.definitionKey.operationId === "abg.operation.catalog.apply"
  );
  assert.notEqual(catalogApplyInvocation, undefined);
  assert.deepEqual(
    catalogApplyInvocation.request,
    report.carrierChain.catalogView.applicationCandidate
  );
  const runInvocations = chainedInvocations.filter(
    (invocation) =>
      invocation.definitionKey.operationId === "abg.operation.run.invoke"
  );
  assert.equal(runInvocations.length, 1);
  for (const runInvocation of runInvocations) {
    assert.equal(
      runInvocation.request.programRef,
      report.carrierChain.catalogApplication.targetProgram.ref
    );
    assert.equal(
      runInvocation.request.programDigest,
      report.carrierChain.catalogApplication.targetProgram.digest
    );
    assert.equal(
      runInvocation.authority.executionProgram.admittedGtlProgramRef,
      report.carrierChain.catalogApplication.targetProgram.ref
    );
    assert.equal(
      runInvocation.authority.executionProgram.admittedGtlProgramDigest,
      report.carrierChain.catalogApplication.targetProgram.digest
    );
    assert.equal(
      runInvocation.authority.catalogScope.viewRef,
      report.carrierChain.catalogView.catalogViewRef
    );
    assert.equal(
      runInvocation.authority.catalogScope.viewDigest,
      report.carrierChain.catalogView.catalogViewDigest
    );
  }
  assert.deepEqual(
    await readFile(
      path.join(driverStateRoot, "project-read-workspace-status.json")
    ),
    await readFile(
      path.join(driverStateRoot, "project-read-workspace-status-replay.json")
    )
  );

  const workspaceCreateAssetPath = path.join(
    packageRoot,
    workspaceCreateRow.assetLocator.relativePath
  );
  const workspaceCreateAssetBytes = await readFile(workspaceCreateAssetPath);
  await writeFile(
    workspaceCreateAssetPath,
    Buffer.concat([workspaceCreateAssetBytes, Buffer.from("\n", "utf8")])
  );
  const mixedDeltaReport = JSON.parse(
    run(process.execPath, [installedDriverPath, "--config", configPath], {
      cwd: consumerRoot
    })
  );
  assert.deepEqual(
    {
      coordinate: mixedDeltaReport.coordinate,
      missingTargetOperationIds:
        mixedDeltaReport.familyDelta.missingTargetOperationIds,
      incompleteTargetOperationIds:
        mixedDeltaReport.familyDelta.incompleteTargetOperationIds,
      targetOperationInvocationCount:
        mixedDeltaReport.targetOperationInvocationCount
    },
    {
      coordinate: {
        kind: "operation_contract",
        operationId: "abg.operation.workspace.create"
      },
      missingTargetOperationIds: [],
      incompleteTargetOperationIds: [
        "abg.operation.workspace.create"
      ],
      targetOperationInvocationCount: 0
    }
  );
  await writeFile(workspaceCreateAssetPath, workspaceCreateAssetBytes);

  const installedManifest = JSON.parse(
    await readFile(
      path.join(packageRoot, "product-toolchain-manifest.json"),
      "utf8"
    )
  );
  const originalCatalogBytes = await readFile(
    path.join(packageRoot, "contracts", "public-contract-catalog.json")
  );
  const originalManifestBytes = await readFile(
    path.join(packageRoot, "product-toolchain-manifest.json")
  );
  const callerOraclePath = path.join(consumerRoot, "caller-operation-family.json");
  const callerOracleBytes = Buffer.from(JSON.stringify({
    ...oracle,
    targetFamily: {
      ...oracle.targetFamily,
      definitionMemberCount: 61
    }
  }));
  await writeFile(callerOraclePath, callerOracleBytes);
  const callerConfigPath = path.join(consumerRoot, "caller-oracle-config.json");
  await writeFile(
    callerConfigPath,
    JSON.stringify({
      ...config,
      expectedQualificationOracleDigest: sha256(callerOracleBytes),
      qualificationOraclePath: callerOraclePath
    }),
    "utf8"
  );
  const callerOracleReport = JSON.parse(
    run(
      process.execPath,
      [installedDriverPath, "--config", callerConfigPath],
      { cwd: consumerRoot }
    )
  );
  assert.deepEqual(
    {
      kind: callerOracleReport.kind,
      coordinate: callerOracleReport.coordinate,
      reason: callerOracleReport.reason,
      targetOperationInvocationCount:
        callerOracleReport.targetOperationInvocationCount
    },
    {
      kind: "frontier_gap",
      coordinate: {
        kind: "qualification_oracle",
        asset: "public_operation_family"
      },
      reason: "qualification_oracle_digest_mismatch",
      targetOperationInvocationCount: 0
    }
  );

  const divergentRows = cloneIJson(installedOperationRows);
  const divergent = divergentRows[0];
  divergent.operationContract.definitions[0].definitionDigest =
    `sha256:${"f".repeat(64)}`;
  const divergentAsset = {
    kind: divergent.operationContract.kind,
    schemaVersion: 1,
    operationId: divergent.operationContract.operationId,
    operationVersion: divergent.operationContract.operationVersion,
    familyDigest: divergent.operationContract.familyDigest,
    definitions: divergent.operationContract.definitions
  };
  const divergentBytes = Buffer.from(canonicalizeIJson(divergentAsset));
  const divergentDigest = sha256(divergentBytes);
  divergent.digest = divergentDigest;
  divergent.assetLocator.digest = divergentDigest;
  divergent.operationContract.operationDigest = divergentDigest;
  await writeFile(
    path.join(packageRoot, divergent.assetLocator.relativePath),
    divergentBytes
  );
  await writeInstalledPublication(
    packageRoot,
    installedCatalog,
    installedManifest,
    divergentRows
  );
  const divergentReport = JSON.parse(
    run(process.execPath, [installedDriverPath, "--config", configPath], {
      cwd: consumerRoot
    })
  );
  assert.deepEqual(
    {
      kind: divergentReport.kind,
      coordinate: divergentReport.coordinate,
      reason: divergentReport.reason,
      familyDigest: divergentReport.familyProof.familyDigests[0],
      recomputedFamilyDigest:
        divergentReport.familyProof.recomputedFamilyDigest,
      targetOperationInvocationCount:
        divergentReport.targetOperationInvocationCount
    },
    {
      kind: "frontier_gap",
      coordinate: {
        kind: "operation_family",
        family: "abg-5-release"
      },
      reason: "operation_family_mismatch",
      familyDigest: installedOperationRows[0].operationContract.familyDigest,
      recomputedFamilyDigest:
        divergentReport.familyProof.recomputedFamilyDigest,
      targetOperationInvocationCount: 0
    }
  );
  assert.notEqual(
    divergentReport.familyProof.familyDigests[0],
    divergentReport.familyProof.recomputedFamilyDigest
  );

  await writeFile(
    path.join(packageRoot, "contracts", "public-contract-catalog.json"),
    originalCatalogBytes
  );
  await writeFile(
    path.join(packageRoot, "product-toolchain-manifest.json"),
    originalManifestBytes
  );
  await writeFile(workspaceCreateAssetPath, workspaceCreateAssetBytes);

  const legacyOperationId = "abg.operation.catalog.invoke";
  await writeInstalledPublication(
    packageRoot,
    installedCatalog,
    installedManifest,
    [
      ...installedOperationRows,
      {
        ...installedOperationRows[0],
        contractId: legacyOperationId
      }
    ]
  );
  const legacyReport = JSON.parse(
    run(process.execPath, [installedDriverPath, "--config", configPath], {
      cwd: consumerRoot
    })
  );
  assert.deepEqual(
    {
      coordinate: legacyReport.coordinate,
      retiredOperationIds: legacyReport.familyDelta.retiredOperationIds,
      legacyOperationIds: legacyReport.familyProof.legacyOperationIds,
      targetOperationInvocationCount:
        legacyReport.targetOperationInvocationCount
    },
    {
      coordinate: {
        kind: "retired_operation_identity",
        operationId: legacyOperationId
      },
      retiredOperationIds: [legacyOperationId],
      legacyOperationIds: [legacyOperationId],
      targetOperationInvocationCount: 0
    }
  );
});
