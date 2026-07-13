import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { TextEncoder } from "node:util";

import {
  openFhInteraction
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  abiogenesisPublicSdk,
  constructAbgCliInvocation,
  constructPublicOperationInvocation,
  constructToolchainWorkspaceBindingV3,
  digestCanonicalIJson,
  resolveAbgCliOperationId
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";

const PACKAGE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const PUBLIC_CONTRACT_CATALOG = JSON.parse(
  await readFile(
    path.join(PACKAGE_ROOT, "contracts/public-contract-catalog.json"),
    "utf8"
  )
);
const WORKSPACE_ID = "workspace:t258-public";
const WORKSPACE_ROOT = "/tmp/t258-public-workspace";
const TOOLCHAIN_ROOT = "/tmp/t258-public-toolchain";
const ACTOR_REF = "actor://t258/reviewer";
const CAPABILITY_REF = "capability://t258/human-review";
const CAPABILITY_PROVENANCE_REF = "capability-provenance://t258/reviewer";
const RESPONSE_CONTRACT_REF = "contract://t258/human-decision";

function sha(character) {
  return `sha256:${character.repeat(64)}`;
}

function declaredRequest(overrides = {}) {
  const startupBlock = canonicalStartupBlock();
  const variant = Object.freeze({
    kind: "declared_execution_request",
    handoffRef: "abg://handoff/t258/fh",
    stageRole: "human_callout",
    stageTermDigest: stableSha256Digest({ stage: "human_callout" }),
    contextContractRef: "abg://execution-context/t258/fh",
    contextContractDigest: stableSha256Digest({ context: "t258/fh" }),
    startupBlock,
    startupBlockDigest: startupBlock.blockDigest,
    regime: "F_H",
    interactionSubjectRef: "interaction-subject://t258/review",
    declarationClosureDigest: stableSha256Digest({ declarations: "t258" }),
    instructionProtocol: Object.freeze({
      instructionProtocolRef: "instruction-protocol://t258/human",
      version: "1.0.0",
      instructionAssetNodeRef: "node://t258/human-instruction",
      instructionAssetSurface: Object.freeze({ kind: "t258_human_instruction" }),
      allowedStageRoles: Object.freeze(["human_callout"]),
      sections: Object.freeze([]),
      relevancePolicies: Object.freeze([]),
      compressionPolicy: Object.freeze({
        policyRef: "policy://t258/full",
        mode: "full_admitted_content"
      }),
      proportionalityPolicyRef: "policy://t258/proportionality",
      runtimeBindingSlotClasses: Object.freeze(["source_node"]),
      policyRefs: Object.freeze(["policy://t258/human"]),
      sourceModuleRef: "gtl://module/t258/instructions",
      sourceModuleDigest: stableSha256Digest({ module: "t258/instructions" }),
      protocolDigest: stableSha256Digest({ protocol: "t258/human" })
    }),
    selectedProtocolSectionRefs: Object.freeze([]),
    protocolClosureDigest: stableSha256Digest({ protocolClosure: "t258" }),
    resultContractRef: RESPONSE_CONTRACT_REF,
    eligibleOperationIds: Object.freeze([
      "abg.operation.fh.select",
      "abg.operation.fh.approve",
      "abg.operation.fh.reject",
      "abg.operation.fh.assess",
      "abg.operation.fh.answer-escalation"
    ]),
    resumeEligibleOperationIds: Object.freeze([
      "abg.operation.fh.select",
      "abg.operation.fh.approve",
      "abg.operation.fh.reject",
      "abg.operation.fh.answer-escalation"
    ]),
    declaredChoiceRefs: Object.freeze([
      "choice://t258/option-a",
      "choice://t258/option-b"
    ]),
    targetBindingDigest: stableSha256Digest({ target: "t258" }),
    capabilityRefs: Object.freeze([CAPABILITY_REF]),
    capabilityBasisDigest: stableSha256Digest({ capabilities: [CAPABILITY_REF] }),
    sourceCarrierRefs: Object.freeze(["carrier://t258/review"]),
    sourceCarrierDigests: Object.freeze([
      stableSha256Digest({ carrier: "t258/review" })
    ]),
    ...overrides
  });
  const requestDigest = stableSha256Digest(variant);
  return Object.freeze({
    ...variant,
    requestRef:
      `abg://declared-execution-request/${requestDigest.slice("sha256:".length)}`,
    requestDigest
  });
}

function canonicalStartupBlock() {
  const basis = Object.freeze({
    kind: "graph_vector_traversal_startup_block",
    status: "startup_blocked_awaiting_t267",
    gapFamily: "traversal_execution_contracts",
    runtimeAddressable: false,
    effectsPermitted: false,
    authorityRefs: Object.freeze([
      "REQ-L-GTL3-C-ALGEBRA-016",
      "REQ-R-ABG3-INTERPRET-010",
      "REQ-R-ABG3-INTERPRET-027"
    ])
  });
  return Object.freeze({
    ...basis,
    blockDigest: stableSha256Digest(basis)
  });
}

function workspaceManifest() {
  return Object.freeze({
    kind: "abg_workspace_manifest",
    schemaVersion: 1,
    workspaceId: WORKSPACE_ID,
    root: WORKSPACE_ROOT,
    authorityMode: "clean_no_project_authority",
    scaffoldState: "none",
    bindingRef: ".abiogenesis/toolchain-binding.json",
    configurationRefs: Object.freeze([]),
    createdAt: "2026-07-13T00:00:00.000Z",
    actorRef: ACTOR_REF,
    provenanceRefs: Object.freeze(["provenance://t258/workspace"])
  });
}

function publicFixture(request = declaredRequest()) {
  const manifest = workspaceManifest();
  const productRoot = path.join(TOOLCHAIN_ROOT, "products/abiogenesis/5.0.0");
  const product = Object.freeze({
    installedProductId: "installed:abiogenesis:5.0.0",
    publisher: "abiogenesis",
    productId: "abiogenesis",
    packageName: "@abiogenesis/typescript-tenant",
    version: "5.0.0",
    productContentDigest: sha("a"),
    descriptorId: "descriptor:abiogenesis:5.0.0",
    descriptorDigest: sha("b"),
    contributionId: "contribution:abiogenesis:5.0.0",
    contributionDigest: sha("c"),
    artifactDigest: sha("d"),
    installedRoot: productRoot,
    productRoot,
    packageRoot: productRoot,
    manifestPath: path.join(productRoot, "product-toolchain-manifest.json"),
    manifestDigest: sha("e"),
    compatibilityRange: "5.0.0",
    compatibility: Object.freeze({
      productId: "abiogenesis",
      compatible: true,
      reason: null
    }),
    commandRefs: Object.freeze(["abg.cli"]),
    publicContractCatalogId: PUBLIC_CONTRACT_CATALOG.catalogId,
    publicContractCatalogVersion: PUBLIC_CONTRACT_CATALOG.catalogVersion,
    publicContractCatalogDigest: PUBLIC_CONTRACT_CATALOG.catalogDigest
  });
  const binding = constructToolchainWorkspaceBindingV3({
    workspaceId: manifest.workspaceId,
    workspaceManifestDigest: digestCanonicalIJson(manifest),
    targetRoot: manifest.root,
    toolchainRoot: TOOLCHAIN_ROOT,
    resolvedLockId: "lock:t258-public",
    resolvedLockDigest: sha("f"),
    products: [product],
    mutableStateRoots: {
      observedWorkspaceRoot: WORKSPACE_ROOT,
      observerStateRoot: path.join(WORKSPACE_ROOT, ".ai-workspace/observer"),
      executorStateRoot: path.join(WORKSPACE_ROOT, ".ai-workspace/executor"),
      eventRoot: path.join(WORKSPACE_ROOT, ".ai-workspace/events"),
      eventLogPath: path.join(WORKSPACE_ROOT, ".ai-workspace/events/events.jsonl"),
      runtimeRoot: path.join(WORKSPACE_ROOT, ".ai-workspace/runtime"),
      projectionRoot: path.join(WORKSPACE_ROOT, ".ai-workspace/projections"),
      archiveRoot: path.join(WORKSPACE_ROOT, ".ai-workspace/archives")
    },
    provenanceRefs: [ACTOR_REF]
  });
  const events = [];
  const opened = openFhInteraction({
    request,
    basisId: "basis://t258/1",
    graphFunctionId: "graph-function://example/non-consensus-review",
    graphCallId: "graph-call://t258/1",
    frameId: "frame://t258/1",
    vectorIndex: 2,
    edge: "Review -> Decision",
    cCallRef: "c-call://t258/1/human",
    causationEventRefs: [],
    correlationId: "correlation://t258/open",
    priorEvents: [],
    eventSink: (event) => events.push(event)
  });
  const context = Object.freeze({
    kind: "bound_workspace",
    workspaceManifest: manifest,
    binding,
    publicContractCatalog: PUBLIC_CONTRACT_CATALOG,
    effects: Object.freeze({
      readRecord: async () => null,
      readInputAsset: async () => null,
      readRuntimeEventBytes: async () =>
        new TextEncoder().encode(
          events.map((event) => JSON.stringify(event)).join("\n")
        ),
      createRuntimeEventSink: () => (event) => events.push(event),
      operatorCapabilityFactories: Object.freeze({})
    })
  });
  return { context, events, opened };
}

function invocation(operationId, request, identity) {
  return constructPublicOperationInvocation({
    publicContractCatalog: PUBLIC_CONTRACT_CATALOG,
    operationId,
    request,
    invocationId: `invocation://t258/${identity}`,
    requestId: `request://t258/${identity}`,
    actorRef: ACTOR_REF,
    adapter: Object.freeze({ kind: "native_sdk", ref: "sdk://t258/test" }),
    provenanceRefs: Object.freeze(["provenance://t258/test"]),
    correlationId: `correlation://t258/${identity}`
  });
}

function responseRequest(fixture, overrides = {}) {
  return Object.freeze({
    workspaceId: WORKSPACE_ID,
    interactionRef: fixture.opened.interactionRef,
    interactionBasisDigest: fixture.opened.interactionBasisDigest,
    responseContractRef: RESPONSE_CONTRACT_REF,
    choiceRef: null,
    value: Object.freeze({ approved: true }),
    evidenceRefs: Object.freeze(["evidence://t258/review/1"]),
    capabilityRefs: Object.freeze([CAPABILITY_REF]),
    capabilityProvenanceRefs: Object.freeze([CAPABILITY_PROVENANCE_REF]),
    ...overrides
  });
}

test("T-258 publishes exact generic F_H and resume CLI operation identities", () => {
  assert.deepEqual(
    [
      ["fh", "select"],
      ["fh", "approve"],
      ["fh", "reject"],
      ["fh", "assess"],
      ["fh", "answer-escalation"],
      ["resume", null]
    ].map(([command, subcommand]) =>
      resolveAbgCliOperationId(command, subcommand)
    ),
    [
      "abg.operation.fh.select",
      "abg.operation.fh.approve",
      "abg.operation.fh.reject",
      "abg.operation.fh.assess",
      "abg.operation.fh.answer-escalation",
      "abg.operation.run.resume"
    ]
  );
});

test("T-258 SDK admits one response and one nonterminal resume with exact replay", async () => {
  const fixture = publicFixture();
  const approveInvocation = invocation(
    "abg.operation.fh.approve",
    responseRequest(fixture),
    "approve-1"
  );
  const approved = await abiogenesisPublicSdk.fhApprove(
    fixture.context,
    approveInvocation
  );
  assert.equal(approved.kind, "accepted", JSON.stringify(approved));
  assert.equal(approved.disposition, "responded");
  assert.equal(approved.exitClassification, "accepted_non_terminal");
  assert.equal(approved.value.responseActorRef, ACTOR_REF);
  assert.equal(fixture.events.length, 2);

  const replayed = await abiogenesisPublicSdk.fhApprove(
    fixture.context,
    approveInvocation
  );
  assert.equal(replayed.kind, "accepted");
  assert.equal(replayed.value.responseRef, approved.value.responseRef);
  assert.equal(fixture.events.length, 2);

  const resumeInvocation = invocation(
    "abg.operation.run.resume",
    {
      workspaceId: WORKSPACE_ID,
      interactionRef: approved.value.interactionRef,
      interactionBasisDigest: approved.value.interactionBasisDigest,
      responseRef: approved.value.responseRef,
      continuationRef: approved.value.continuationRef
    },
    "resume-1"
  );
  const resumed = await abiogenesisPublicSdk.runResume(
    fixture.context,
    resumeInvocation
  );
  assert.equal(resumed.kind, "accepted", JSON.stringify(resumed));
  assert.equal(resumed.disposition, "resume_admitted");
  assert.equal(resumed.exitClassification, "accepted_non_terminal");
  assert.equal(resumed.value.continuationRef, approved.value.continuationRef);
  assert.equal(resumed.value.responseRef, approved.value.responseRef);
  assert.equal(fixture.events.length, 3);

  const resumedReplay = await abiogenesisPublicSdk.runResume(
    fixture.context,
    resumeInvocation
  );
  assert.equal(resumedReplay.kind, "accepted");
  assert.equal(resumedReplay.value.resumeRef, resumed.value.resumeRef);
  assert.equal(fixture.events.length, 3);
});

test("T-258 CLI construction and SDK use the same admitted request contract", async () => {
  const fixture = publicFixture();
  const request = responseRequest(fixture, {
    choiceRef: "choice://t258/option-a",
    value: Object.freeze({ selection: "option-a" })
  });
  const cliInvocation = constructAbgCliInvocation({
    operationId: "abg.operation.fh.select",
    request,
    publicContractCatalog: PUBLIC_CONTRACT_CATALOG,
    actorRef: ACTOR_REF,
    identity: "select-cli-1"
  });
  assert.equal(cliInvocation.operationId, "abg.operation.fh.select");
  assert.equal(cliInvocation.adapter.kind, "abg_cli");
  const selected = await abiogenesisPublicSdk.fhSelect(
    fixture.context,
    cliInvocation
  );
  assert.equal(selected.kind, "accepted", JSON.stringify(selected));
  assert.equal(selected.value.responseChoiceRef, "choice://t258/option-a");
});

test("T-258 keeps non-resume-eligible assessment held", async () => {
  const fixture = publicFixture();
  const assessed = await abiogenesisPublicSdk.fhAssess(
    fixture.context,
    invocation(
      "abg.operation.fh.assess",
      responseRequest(fixture, { value: Object.freeze({ assessment: "revise" }) }),
      "assess-1"
    )
  );
  assert.equal(assessed.kind, "accepted", JSON.stringify(assessed));
  assert.equal(assessed.disposition, "held");
  assert.equal(assessed.value.status, "held");
});

test("T-258 public boundary returns typed identity and evidence refusals", async () => {
  const fixture = publicFixture();
  const stale = await abiogenesisPublicSdk.fhApprove(
    fixture.context,
    invocation(
      "abg.operation.fh.approve",
      responseRequest(fixture, { interactionBasisDigest: sha("0") }),
      "stale-1"
    )
  );
  assert.equal(stale.kind, "refused");
  assert.equal(stale.code, "stale_basis");

  const wrongWorkspace = await abiogenesisPublicSdk.fhApprove(
    fixture.context,
    invocation(
      "abg.operation.fh.approve",
      responseRequest(fixture, { workspaceId: "workspace:other" }),
      "workspace-1"
    )
  );
  assert.equal(wrongWorkspace.kind, "refused");
  assert.equal(wrongWorkspace.code, "workspace_mismatch");

  assert.throws(
    () =>
      invocation(
        "abg.operation.fh.approve",
        responseRequest(fixture, { evidenceRefs: [] }),
        "evidence-1"
      ),
    /evidenceRefs/u
  );

  assert.throws(
    () =>
      constructPublicOperationInvocation({
        publicContractCatalog: PUBLIC_CONTRACT_CATALOG,
        operationId: "abg.operation.fh.approve",
        request: responseRequest(fixture),
        invocationId: "invocation://t258/no-actor",
        requestId: "request://t258/no-actor",
        actorRef: null,
        adapter: { kind: "native_sdk", ref: "sdk://t258/test" },
        correlationId: "correlation://t258/no-actor"
      }),
    /actor rule mismatch/u
  );
});
