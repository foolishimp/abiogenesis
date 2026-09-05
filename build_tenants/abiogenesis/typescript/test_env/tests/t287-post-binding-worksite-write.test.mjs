import assert from "node:assert/strict";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

import { proveFreshProcessRuntimeProjectionEquality } from
  "../support/fresh-process-runtime-proof.mjs";
import { cloneEventPrefixFixture } from
  "../support/new-empty-append-sink.mjs";
import {
  publicOperationBasis,
  requireRawAdmission,
  setupInstalledRootExecutionBasis,
} from "../support/root-installed-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("T-287 C0 publishes one reachable worksite F_D leaf without a new runtime authority", async () => {
  const gtl = await import(
    `${pathToFileURL(join(root, "build/code/src/gtl/index.js")).href}?t287-c0=${Date.now()}`,
  );
  const implementation = await import(
    `${pathToFileURL(join(root, "build/code/src/implementation/index.js")).href}?t287-c0=${Date.now()}`,
  );
  const product = await import(
    `${pathToFileURL(join(root, "build/code/src/product/index.js")).href}?t287-c0=${Date.now()}`,
  );
  const digest = (label) => product.sha256Canonical({ label, subject: "t287-c0" });
  const publication = gtl.constructWorksiteC0ModulePublication({
    productId: "product://abiogenesis/t287-c0",
    artifactDigest: digest("artifact"),
    productContentDigest: digest("content"),
    productManifestDigest: digest("manifest"),
    packageName: "@abiogenesis/typescript-tenant",
    packageVersion: "5.0.0-dev.286",
  });
  const graphFunction = publication.graphFunctions.find(
    (candidate) => candidate.name === gtl.WORKSITE_C0_IDS.graphFunctionRef,
  );
  assert.ok(graphFunction);
  assert.deepEqual(graphFunction.effects, [
    product.WORKSITE_FILE_REPLACE_EFFECT_URI,
  ]);
  assert.equal(publication.implementationBindings.length, 1);
  assert.deepEqual(publication.implementationBindings[0], {
    kind: "implementation_binding",
    bindingRef:
      "implementation-binding://abiogenesis/worksite/file-replace-fd@5",
    implementationRef:
      "implementation://abiogenesis/worksite/file-replace-fd@5",
    packageName: "@abiogenesis/typescript-tenant",
    packageVersion: "5.0.0-dev.286",
    modulePath: "build/code/src/implementation/worksite_file_replace.js",
    namedSymbol: "realizeWorksiteFileReplace",
    computeRegime: "F_D",
    inputContractRef: gtl.WORKSITE_C0_IDS.inputContractRef,
    outputContractRef: gtl.WORKSITE_C0_IDS.outputContractRef,
    failureContractRef: gtl.WORKSITE_C0_IDS.failureContractRef,
    refusalContractRef: gtl.WORKSITE_C0_IDS.refusalContractRef,
  });
  assert.equal(
    implementation.WORKSITE_FILE_REPLACE_IMPLEMENTATION_DESCRIPTOR.namedSymbol,
    "realizeWorksiteFileReplace",
  );
  assert.equal(typeof implementation.realizeWorksiteFileReplace, "function");
  assert.equal(
    publication.programs[0].graphFunctionRef,
    undefined,
    "a Program carries starts/callable membership; it is not a second executor",
  );
  assert.deepEqual(publication.programs[0].callableMembership, [
    gtl.WORKSITE_C0_IDS.graphFunctionRef,
  ]);
  const manifest = JSON.parse(
    await readFile(join(root, "product-toolchain-manifest.json"), "utf8"),
  );
  const binding = manifest.contributionManifest.publicationBindings.find(
    (candidate) =>
      candidate.moduleRef === product.WORKSITE_CONSTRUCTION_IDS.moduleRef,
  );
  const manifestPublication = gtl.constructWorksiteConstructionModulePublication({
    productId: manifest.productId,
    artifactDigest: `sha256:${"0".repeat(64)}`,
    productContentDigest: manifest.productContentDigest,
    productManifestDigest: `sha256:${"0".repeat(64)}`,
    packageName: manifest.packageName,
    packageVersion: manifest.packageVersion,
  });
  assert.equal(
    manifestPublication.contributionManifestRef,
    manifest.contributionManifestRef,
  );
  assert.deepEqual(binding, {
    moduleRef: product.WORKSITE_CONSTRUCTION_IDS.moduleRef,
    publicationDigest: product.modulePublicationSemanticDigest(
      manifestPublication,
    ),
  });
  assert.equal(
    manifest.contributionManifest.publicationBindings.some(
      (candidate) => candidate.moduleRef === gtl.WORKSITE_C0_IDS.moduleRef,
    ),
    false,
    "the static Product publishes C0 only through the composite C1 module",
  );
});

function runtimeBasis(label) {
  return {
    eventTime: "2026-09-01T00:00:00.000Z",
    correlationId: `correlation://t287/c0/${label}`,
    causationEventRefs: [],
  };
}

function openRootTraversal(abg, store, executionBasis, label) {
  return abg.openTraversalScope(
    store,
    abg.selectHeldEventStoreDurablePrefix(store),
    { kind: "root", executionBasis },
    runtimeBasis(label),
  );
}

function delegateLeafPort(leafPort, invoke) {
  const delegated = Object.fromEntries(
    Object.entries(leafPort).map(([key, value]) => [
      key,
      typeof value === "function" ? value.bind(leafPort) : value,
    ]),
  );
  delegated.invoke = invoke;
  return Object.freeze(delegated);
}

function deepFreezeFixture(value, visited = new Set()) {
  if (typeof value !== "object" || value === null || visited.has(value)) {
    return value;
  }
  visited.add(value);
  for (const child of Object.values(value)) {
    deepFreezeFixture(child, visited);
  }
  return Object.freeze(value);
}

function prefixConflictLeafPort({
  eventStore,
  leafPort,
  product,
  retained,
  store,
}) {
  return delegateLeafPort(
    leafPort,
    async (call) => {
      retained.call = call;
      const owner = await leafPort.invoke(call);
      if (
        owner.kind === "closed_leaf_owner_receipt" &&
        owner.computeRegime === "F_D" &&
        owner.candidate.disposition === "success"
      ) {
        retained.output = owner.candidate.resultCandidate;
        const { occurrence } = call;
        eventStore.admitRuntimeEvent(store, {
          kind: "runtime_failure_observed",
          eventTime: "2026-09-01T00:00:01.000Z",
          aggregateType: "frame",
          aggregateId: occurrence.frameId,
          parentAggregateId: occurrence.graphCallId,
          causationEventRefs: [],
          correlationId: "correlation://t287/c0/injected-prefix-conflict",
          workflowVersion: "5.0.0",
          scopeClass: "run",
          basisId: occurrence.executionAuthority.executionBasisRef,
          runId: occurrence.runId,
          graphFunctionRef: occurrence.executionAuthority.graphFunctionRef,
          graphCallId: occurrence.graphCallId,
          frameId: occurrence.frameId,
          payload: {
            cCallRef: occurrence.cCallRef,
            code: "injected_prefix_conflict",
            failureClass: "concurrent_append_after_physical_commit",
            subjectDigest: product.sha256Canonical({
              cCallRef: occurrence.cCallRef,
              fault: "post_effect_prefix_conflict",
            }),
          },
        });
      }
      return owner;
    },
  );
}

function crossedReceiptLeafPort({ leafPort, product, retained }) {
  return delegateLeafPort(
    leafPort,
    async (call) => {
      const owner = await leafPort.invoke(call);
      if (
        owner.kind !== "closed_leaf_owner_receipt" ||
        owner.computeRegime !== "F_D" ||
        owner.candidate.disposition !== "success"
      ) return owner;
      const crossed = structuredClone(owner);
      const output = crossed.candidate.resultCandidate;
      const receipt = output.receipt;
      receipt.beforeObservationRef =
        "worksite-observation://abiogenesis/crossed-before-observation";
      const {
        kind: _kind,
        schemaVersion: _schemaVersion,
        receiptRef: _receiptRef,
        receiptDigest: _receiptDigest,
        ...receiptBody
      } = receipt;
      receipt.receiptDigest = product.sha256Canonical(receiptBody);
      receipt.receiptRef =
        `worksite-file-replace-receipt://abiogenesis/${receipt.receiptDigest.slice("sha256:".length)}`;
      crossed.candidate.evidenceCandidates[0].outputDigest =
        product.sha256Canonical(output);
      if (crossed.receipt !== null) {
        crossed.receipt.candidate = crossed.candidate;
      }
      retained.output = output;
      return crossed;
    },
  );
}

function captureInvocationLeafPort({ leafPort, retained }) {
  return delegateLeafPort(
    leafPort,
    async (call) => {
      retained.call = call;
      return leafPort.invoke(call);
    },
  );
}

test("T-287 C0 reaches its owner, admits specialized evidence, and replays O1 from a fresh process", async (context) => {
  context.diagnostic("C0 phase: installed setup start");
  const builtGtl = await import(
    `${pathToFileURL(join(root, "build/code/src/gtl/index.js")).href}?t287-c0-e2e=${Date.now()}`,
  );
  let targetPath;
  let predecessorObservation;
  const replacement = Buffer.from("hello from governed C0\n");
  const environment = await setupInstalledRootExecutionBasis(context, root, {
    candidateBasisSource: "packed_artifact",
    rootPublicationKind: "worksite_c0",
    programRef: builtGtl.WORKSITE_C0_IDS.programRef,
    graphFunctionRef: builtGtl.WORKSITE_C0_IDS.graphFunctionRef,
    inputContractRef: builtGtl.WORKSITE_C0_IDS.inputContractRef,
    inputFactory: async ({
      product,
      workspaceBinding,
      capabilityGrant,
    }) => {
      const relativeRoot = "c0-proof";
      const relativePath = `${relativeRoot}/message.txt`;
      await mkdir(join(workspaceBinding.roots.productRoot, relativeRoot), {
        recursive: true,
      });
      targetPath = join(workspaceBinding.roots.productRoot, relativePath);
      const subject = product.constructWorksiteSubject({
        workspaceBinding,
        subjectUri: pathToFileURL(targetPath).href,
        relativePath,
      });
      assert.equal(subject.kind, "worksite_subject", JSON.stringify(subject));
      const territory = product.constructWorksiteTerritory({
        workspaceBinding,
        territoryUri: pathToFileURL(
          join(workspaceBinding.roots.productRoot, relativeRoot),
        ).href,
        relativeRoot,
      });
      assert.equal(
        territory.kind,
        "worksite_territory",
        JSON.stringify(territory),
      );
      predecessorObservation = await product.observeWorksiteSubject(
        workspaceBinding,
        subject,
      );
      assert.equal(
        predecessorObservation.kind,
        "worksite_observation",
        JSON.stringify(predecessorObservation),
      );
      assert.equal(predecessorObservation.state, "absent");
      const request = product.constructWorksiteFileReplaceRequest({
        workspaceBinding,
        capabilityGrant,
        subject,
        territory,
        predecessorObservation,
        replacementBytes: replacement,
      });
      assert.equal(
        request.kind,
        "worksite_file_replace_request",
        JSON.stringify(request),
      );
      return request;
    },
  });
  context.diagnostic("C0 phase: installed setup complete");
  const {
    abg,
    admittedInstalls,
    actorRef,
    artifactTruth,
    capabilityGrant,
    catalogView,
    closureContract,
    executionBasis,
    executionBasisAdmission,
    executionResolution,
    graph,
    graphFunction,
    graphValidation,
    gtl,
    hog,
    implementationLeafPort,
    implementationRow,
    implementationSet,
    input,
    installedRoot,
    invocationAuthority,
    leafPort,
    lock,
    node,
    policy,
    product,
    productSet,
    program,
    programValidation,
    publication,
    rawInput,
    resolutionSetCandidate,
    resolutionSetValidation,
    semanticsProjection,
    store,
    validator,
    workspaceBinding,
  } = environment;
  assert.equal(actorRef, workspaceBinding.authorizedActorRef);
  assert.ok(targetPath);
  assert.ok(predecessorObservation);
  const eventStore = await import(
    pathToFileURL(
      join(installedRoot, "build/code/src/abg/event_store.js"),
    ).href,
  );
  const conflict = await cloneEventPrefixFixture(
    context,
    abg,
    eventStore,
    store.readAll(),
    "abi5-t287-c0-prefix-conflict-",
  );
  const staleOwner = await cloneEventPrefixFixture(
    context,
    abg,
    eventStore,
    store.readAll(),
    "abi5-t287-c0-stale-owner-",
  );
  const crossedReceipt = await cloneEventPrefixFixture(
    context,
    abg,
    eventStore,
    store.readAll(),
    "abi5-t287-c0-crossed-receipt-",
  );
  const alternateAuthority = await cloneEventPrefixFixture(
    context,
    abg,
    eventStore,
    store.readAll(),
    "abi5-t287-c0-alternate-authority-",
  );
  const substrateFailure = await cloneEventPrefixFixture(
    context,
    abg,
    eventStore,
    store.readAll(),
    "abi5-t287-c0-substrate-failure-",
  );
  context.diagnostic("C0 phase: conflict prefix cloned");

  const alternateWorkspaceRoot = join(
    environment.scratch,
    "alternate-authority-workspace",
  );
  await mkdir(alternateWorkspaceRoot, { recursive: true });
  const alternateActorRef = "actor://abiogenesis/t287/alternate-developer";
  const alternateAuthorityManifest = {
    workspaceId: "workspace://t287/c0/alternate-authority",
    canonicalRoot: alternateWorkspaceRoot,
    authorityMode: "trusted_developer",
    authorizedActorRef: alternateActorRef,
  };
  const alternateWorkspaceAuthority = product.constructWorkspaceAuthorityBasis({
    ...alternateAuthorityManifest,
    authorityManifestRef:
      "manifest://t287/c0/alternate-workspace-authority",
    authorityManifestDigest: product.sha256Canonical(
      alternateAuthorityManifest,
    ),
  });
  assert.equal(
    alternateWorkspaceAuthority.kind,
    "workspace_authority_basis",
    JSON.stringify(alternateWorkspaceAuthority),
  );
  const alternateBindingCandidate = product.constructWorkspaceBinding(
    alternateWorkspaceAuthority,
    productSet,
    lock,
    {
      ...workspaceBinding.roots,
      eventLogRoot: join(alternateWorkspaceRoot, ".ai-workspace/events"),
      runtimeStateRoot: join(alternateWorkspaceRoot, ".ai-workspace/runtime"),
      projectionRoot: join(alternateWorkspaceRoot, ".ai-workspace/projections"),
      archiveRoot: join(alternateWorkspaceRoot, ".ai-workspace/archive"),
    },
  );
  assert.equal(
    alternateBindingCandidate.kind,
    "workspace_binding_candidate",
    JSON.stringify(alternateBindingCandidate),
  );
  const alternateBindingAdmission = abg.admitWorkspaceBinding(
    alternateAuthority.store,
    alternateBindingCandidate,
    {
      ...publicOperationBasis(
        product,
        "abg.operation.workspace.bind",
        alternateBindingCandidate.bindingId,
        alternateBindingCandidate.bindingDigest,
        "invocation://t287/c0/alternate-workspace-bind",
        admittedInstalls.map((install) => install.admissionEventRef),
      ),
      predecessorPrefix: abg.selectHeldEventStoreDurablePrefix(
        alternateAuthority.store,
      ),
    },
    alternateWorkspaceAuthority,
  );
  assert.equal(
    alternateBindingAdmission.kind,
    "artifact_owner_result",
    JSON.stringify(alternateBindingAdmission),
  );
  const alternateWorkspaceBinding = alternateBindingAdmission.value;
  const alternatePolicy = product.constructRootInvocationPolicy(
    alternateWorkspaceBinding,
    program,
    [],
    ["F_D"],
  );
  const alternateGrantBasis = {
    admittedInstalls,
    workspaceBinding: alternateWorkspaceBinding,
    fixedPacket: product.RUN_OPERATION_CONTRACTS.invoke.invoke,
  };
  const alternateGrant = product.constructCapabilityGrant(
    alternatePolicy,
    alternateActorRef,
    "abg.operation.run.invoke",
    product.DIRECT_INVOKE_CAPABILITY,
    alternateGrantBasis,
  );
  assert.equal(
    product.isCapabilityGrantValue(alternateGrant),
    true,
    "the negative must use a structurally exact run.invoke grant for another W authority",
  );
  const alternateRawRequest = requireRawAdmission(
    validator,
    {
      kind: "public_invocation",
      schemaVersion: "5.0.0",
      operationId: "abg.operation.run.invoke",
      variant: "direct",
      invocationRef: "invocation://t287/c0/alternate-authority",
      eventTime: "2026-09-01T00:00:00.000Z",
      correlationId: "correlation://t287/c0/alternate-authority",
      payload: {
        programRef: program.programRef,
        catalogHandle: graphFunction.name,
      },
    },
    "public_operation_request",
    "contract://abiogenesis/public/run-invoke-request@5",
  );
  const alternateSelectedRow = product.lookupGraphFunction(
    catalogView,
    graphFunction.name,
  );
  assert.ok(alternateSelectedRow);
  const alternateInvocation = product.constructDirectInvocation(
    workspaceBinding,
    catalogView,
    program,
    alternateSelectedRow,
    alternateRawRequest,
    rawInput,
    policy,
    [capabilityGrant],
    invocationAuthority,
  );
  assert.equal(
    alternateInvocation.kind,
    "public_invocation_candidate",
    JSON.stringify(alternateInvocation),
  );
  const alternateBefore = alternateAuthority.store.readAll().length;
  const alternateGrantRefusal = abg.admitInvocation(
    alternateAuthority.store,
    {
      invocation: alternateInvocation,
      rawRequest: alternateRawRequest,
      rawInput,
      programPublication: publication,
      executionResolution: executionResolution.resolution,
      program,
      graphFunction,
      programValidation,
      workspaceBinding,
      artifactTruth: alternateBindingAdmission.artifactTruth,
      catalogView,
      policy,
      capabilityGrants: [alternateGrant],
      authority: invocationAuthority,
    },
    {
      ...publicOperationBasis(
        product,
        "abg.operation.run.invoke",
        workspaceBinding.bindingId,
        workspaceBinding.bindingDigest,
        alternateInvocation.publicRequestInvocationRef,
        [workspaceBinding.admissionEventRef],
      ),
      predecessorPrefix: abg.selectHeldEventStoreDurablePrefix(
        alternateAuthority.store,
      ),
    },
  );
  assert.equal(
    alternateGrantRefusal.kind,
    "invocation_admission_refusal",
    JSON.stringify(alternateGrantRefusal),
  );
  assert.equal(alternateGrantRefusal.code, "capability_mismatch");
  assert.equal(alternateAuthority.store.readAll().length, alternateBefore);
  await assert.rejects(readFile(targetPath), { code: "ENOENT" });

  const opened = openRootTraversal(
    abg,
    store,
    executionBasis,
    "success/open",
  );
  assert.equal(
    opened.kind,
    "traversal_scope_open_admission",
    JSON.stringify(opened),
  );
  const sunnyStop = hog.traverse({
    program,
    graphFunction,
    graph,
    graphValidation,
    executionBasis,
    openedTraversalScope: opened.scope,
  });
  assert.equal(sunnyStop.kind, "traversal_stop_ref", JSON.stringify(sunnyStop));
  const retainedSunnyInvocation = {};
  context.diagnostic("C0 phase: sunny traversal start");
  const completion = await hog.executeGraphTraversal({
    store,
    predecessorPrefix: opened.successorPrefix,
    executionBasis,
    openedTraversalScope: opened.scope,
    program,
    programValidation,
    graphFunction,
    graph,
    graphValidation,
    implementationSet,
    interactionSet: executionBasisAdmission.interactionSet,
    leafPort: captureInvocationLeafPort({
      leafPort,
      retained: retainedSunnyInvocation,
    }),
    actorRuntimeBinding: { workspaceBinding, artifactTruth },
    input,
    inputDigest: rawInput.subjectDigest,
    closureContract,
    eventTime: "2026-09-01T00:00:00.000Z",
    correlationId: "correlation://t287/c0/success/hog",
  });
  context.diagnostic("C0 phase: sunny traversal complete");
  assert.equal(completion.disposition, "closed", JSON.stringify(completion));
  assert.equal(
    completion.resultValue.kind,
    "worksite_file_replace_output",
    JSON.stringify(completion),
  );
  assert.deepEqual(await readFile(targetPath), replacement);
  const successorObservation = completion.resultValue.successorObservation;
  const cCallEvents = store.readAll().filter(
    (event) => event.aggregateId === completion.cCallRef,
  );
  assert.deepEqual(cCallEvents.map((event) => event.kind), [
    "c_call_opened",
    "c_call_fibre_selected",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged",
  ]);
  const crossedOrderEvents = structuredClone(store.readAll());
  const evidenceOrdinal = crossedOrderEvents.findIndex(
    (event) =>
      event.aggregateId === completion.cCallRef &&
      event.kind === "c_call_evidenced",
  );
  const resultOrdinal = crossedOrderEvents.findIndex(
    (event) =>
      event.aggregateId === completion.cCallRef &&
      event.kind === "c_call_result_admitted",
  );
  assert.notEqual(evidenceOrdinal, -1);
  assert.notEqual(resultOrdinal, -1);
  [crossedOrderEvents[evidenceOrdinal], crossedOrderEvents[resultOrdinal]] = [
    crossedOrderEvents[resultOrdinal],
    crossedOrderEvents[evidenceOrdinal],
  ];
  deepFreezeFixture(crossedOrderEvents);
  assert.throws(
    () => abg.selectValidatedRuntimeEventPrefix(crossedOrderEvents),
    /total, gap-free admission-ordinal order/u,
    "crossing exact C0 evidence/result order must be refused before replay",
  );
  const evidence = cCallEvents.find(
    (event) => event.kind === "c_call_evidenced",
  );
  const result = cCallEvents.find(
    (event) => event.kind === "c_call_result_admitted",
  );
  assert.ok(retainedSunnyInvocation.call);
  const sunnyAuthority =
    retainedSunnyInvocation.call.occurrence.executionAuthority;
  assert.ok(sunnyAuthority);
  const sunnyCCall = sunnyAuthority.cCall;
  assert.equal(sunnyCCall.cCallRef, completion.cCallRef);
  assert.deepEqual(sunnyCCall.retryPath, []);

  const sunnyEvents = store.readAll();
  const judgmentEventIndex = sunnyEvents.findIndex(
    (event) =>
      event.aggregateId === completion.cCallRef &&
      event.kind === "c_call_judged",
  );
  assert.notEqual(judgmentEventIndex, -1);
  const preJudgmentEvents = Object.freeze(
    sunnyEvents.slice(0, judgmentEventIndex),
  );
  const replayIdentityRefusal = await cloneEventPrefixFixture(
    context,
    abg,
    eventStore,
    preJudgmentEvents,
    "abi5-t287-c0-crossed-replay-identity-",
  );
  const exactAuthorityPrefix = abg.selectValidatedRuntimeEventPrefix(
    replayIdentityRefusal.store.readAll(),
  );
  const exactRunPrefix = abg.selectValidatedRuntimeEventPrefix(
    replayIdentityRefusal.store.readAll(),
    { runId: sunnyCCall.runId },
  );
  const exactReplay = abg.replayValidatedRuntimeEventPrefix(
    exactRunPrefix,
    exactAuthorityPrefix,
  );
  const resultEventIndex = preJudgmentEvents.findIndex(
    (event) => event.eventId === result.eventId,
  );
  assert.notEqual(resultEventIndex, -1);
  const priorEvents = Object.freeze(
    preJudgmentEvents.slice(0, resultEventIndex),
  );
  const priorAuthorityPrefix = abg.selectValidatedRuntimeEventPrefix(
    priorEvents,
  );
  const priorRunPrefix = abg.selectValidatedRuntimeEventPrefix(priorEvents, {
    runId: sunnyCCall.runId,
  });
  const priorReplay = abg.replayValidatedRuntimeEventPrefix(
    priorRunPrefix,
    priorAuthorityPrefix,
  );
  assert.notEqual(priorReplay.replayDigest, exactReplay.replayDigest);

  const admittedResult = deepFreezeFixture({
    ...structuredClone(result.payload),
    kind: "admitted_c_call_result",
    schemaVersion: "5.0.0",
    disposition: "admitted",
    admissionEventRef: result.eventId,
  });
  assert.deepEqual(
    abg.projectAdmittedCCallResultAtPrefix(
      exactAuthorityPrefix,
      sunnyCCall,
      admittedResult,
    ),
    admittedResult,
  );
  const judgmentRelation = leafPort.resolveJudgmentRelation(
    sunnyCCall.judgmentPredicateRef,
  );
  assert.ok(judgmentRelation);
  const judgmentDecision = {
    decisionClass: "evaluate",
    input,
    relation: judgmentRelation,
  };
  const exactJudgmentCandidate = hog.proposeJudgmentCandidate({
    cCall: sunnyCCall,
    result: admittedResult,
    replayState: exactReplay,
    contractRef: sunnyCCall.judgmentContractRef,
    decision: judgmentDecision,
  });
  const crossedReplayCandidate = hog.proposeJudgmentCandidate({
    cCall: sunnyCCall,
    result: admittedResult,
    replayState: priorReplay,
    contractRef: sunnyCCall.judgmentContractRef,
    decision: judgmentDecision,
  });
  const {
    candidateRef: _exactCandidateRef,
    candidateDigest: _exactCandidateDigest,
    replayStateDigest: _exactReplayStateDigest,
    ...exactJudgmentBody
  } = exactJudgmentCandidate;
  const {
    candidateRef: _crossedCandidateRef,
    candidateDigest: _crossedCandidateDigest,
    replayStateDigest: _crossedReplayStateDigest,
    ...crossedJudgmentBody
  } = crossedReplayCandidate;
  assert.deepEqual(crossedJudgmentBody, exactJudgmentBody);
  assert.equal(
    crossedReplayCandidate.replayStateDigest,
    priorReplay.replayDigest,
  );
  assert.notEqual(
    crossedReplayCandidate.replayStateDigest,
    exactReplay.replayDigest,
  );

  const replayRefusalPrefix = abg.selectHeldEventStoreDurablePrefix(
    replayIdentityRefusal.store,
  );
  const replayRefusalEventsBefore = replayIdentityRefusal.store.readAll();
  const replayRefusalDigestBefore = replayIdentityRefusal.store.digest();
  const replayRefusalBytesBefore = await readFile(
    new URL(replayRefusalPrefix.eventLogRef),
  );
  const crossedReplayRefusal = abg.admitJudgment(
    replayIdentityRefusal.store,
    exactAuthorityPrefix,
    graph,
    graphFunction,
    sunnyStop.cursor,
    sunnyCCall,
    admittedResult,
    crossedReplayCandidate,
    exactReplay,
    runtimeBasis("crossed-replay-identity/judgment"),
  );
  assert.equal(
    crossedReplayRefusal.kind,
    "c_call_admission_rejection",
    JSON.stringify(crossedReplayRefusal),
  );
  assert.equal(crossedReplayRefusal.stage, "judgment");
  assert.equal(
    crossedReplayRefusal.diagnosticRef,
    "diagnostic://abiogenesis/c-call/judgment-contract-mismatch@5",
  );
  assert.deepEqual(
    replayIdentityRefusal.store.readAll(),
    replayRefusalEventsBefore,
  );
  assert.equal(replayIdentityRefusal.store.digest(), replayRefusalDigestBefore);
  assert.deepEqual(
    await readFile(new URL(replayRefusalPrefix.eventLogRef)),
    replayRefusalBytesBefore,
  );
  assert.equal(evidence.payload.evidenceClass, "worksite_file_replace");
  assert.equal(
    evidence.payload.authorization.workspaceBindingIdentity,
    workspaceBinding.bindingId,
  );
  assert.deepEqual(result.payload.evidenceRefs, [evidence.payload.evidenceRef]);
  const calculus = abg.deriveRuntimeEventCalculusProjection(
    abg.selectValidatedRuntimeEventPrefix(store.readAll(), {
      runId: opened.scope.runId,
    }),
  );
  const beforeFluent = abg.constructWorksiteObservationCurrentFluent(
    predecessorObservation.observationRef,
  );
  const afterFluent = abg.constructWorksiteObservationCurrentFluent(
    successorObservation.observationRef,
  );
  assert.equal(abg.holdsAt(calculus, beforeFluent), false);
  assert.equal(abg.holdsAt(calculus, afterFluent), true);
  const resultEffect = calculus.effectRows.find(
    (row) => row.sourceEvent.eventId === result.eventId,
  );
  assert.equal(
    resultEffect.terminates.some(
      (fluent) => fluent.fluentRef === beforeFluent.fluentRef,
    ),
    true,
  );
  assert.equal(
    resultEffect.initiates.some(
      (fluent) => fluent.fluentRef === afterFluent.fluentRef,
    ),
    true,
  );
  assert.ok(retainedSunnyInvocation.call);
  const staleAuthorityReuse = await leafPort.invoke(
    retainedSunnyInvocation.call,
  );
  assert.equal(staleAuthorityReuse.kind, "closed_leaf_owner_receipt");
  assert.equal(staleAuthorityReuse.candidate.disposition, "failure");
  assert.equal(
    staleAuthorityReuse.candidate.resultCandidate.kind,
    "worksite_effect_refusal",
  );
  assert.equal(
    staleAuthorityReuse.candidate.resultCandidate.failureClass,
    "implementation_exception",
  );
  assert.deepEqual(await readFile(targetPath), replacement);
  await rm(targetPath, { force: true });
  const freshProof = await proveFreshProcessRuntimeProjectionEquality({
    abg,
    product,
    installedPackageRoot: installedRoot,
    store,
    requests: [{
      rowId: "c0-worksite-runtime-truth",
      owner: "abg",
      exportName: "projectRuntimeTruthAtDurablePrefix",
      input: "durable_prefix",
      args: [opened.scope.runId],
    }],
  });
  const freshReplay = freshProof.retainedRows[0].projection.replayState;
  assert.deepEqual(
    freshReplay.currentWorksiteObservations.map((row) => row.observation),
    [successorObservation],
  );
  assert.deepEqual(
    freshReplay.currentWorksiteObservations.map((row) => row.sourceEventRef),
    [result.eventId],
  );
  const replayedCall = freshReplay.cCalls.find(
    (row) => row.cCallRef === completion.cCallRef,
  );
  assert.ok(replayedCall);
  assert.equal(replayedCall.resultRef, completion.resultRef);
  assert.deepEqual(replayedCall.evidenceRefs, [evidence.payload.evidenceRef]);
  assert.deepEqual(replayedCall.resultValue, completion.resultValue);

  const externalBytes = Buffer.from("external change after O0\n");
  await writeFile(targetPath, externalBytes);
  const staleOpened = openRootTraversal(
    abg,
    staleOwner.store,
    executionBasis,
    "stale/open",
  );
  assert.equal(
    staleOpened.kind,
    "traversal_scope_open_admission",
    JSON.stringify(staleOpened),
  );
  const staleCompletion = await hog.executeGraphTraversal({
    store: staleOwner.store,
    predecessorPrefix: staleOpened.successorPrefix,
    executionBasis,
    openedTraversalScope: staleOpened.scope,
    program,
    programValidation,
    graphFunction,
    graph,
    graphValidation,
    implementationSet,
    interactionSet: executionBasisAdmission.interactionSet,
    leafPort,
    actorRuntimeBinding: { workspaceBinding, artifactTruth },
    input,
    inputDigest: rawInput.subjectDigest,
    closureContract,
    eventTime: "2026-09-01T00:00:00.000Z",
    correlationId: "correlation://t287/c0/stale/hog",
  });
  assert.equal(staleCompletion.disposition, "failed", JSON.stringify(staleCompletion));
  assert.equal(staleCompletion.resultValue.kind, "worksite_effect_refusal");
  assert.equal(staleCompletion.resultValue.code, "stale_observation");
  assert.deepEqual(await readFile(targetPath), externalBytes);
  const staleCallEvents = staleOwner.store.readAll().filter(
    (event) => event.aggregateId === staleCompletion.cCallRef,
  );
  assert.deepEqual(staleCallEvents.map((event) => event.kind), [
    "c_call_opened",
    "c_call_fibre_selected",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged",
  ]);
  assert.equal(
    staleCallEvents.some(
      (event) =>
        event.kind === "c_call_evidenced" &&
        event.payload.evidenceClass === "worksite_file_replace",
    ),
    false,
  );
  const staleCalculus = abg.deriveRuntimeEventCalculusProjection(
    abg.selectValidatedRuntimeEventPrefix(staleOwner.store.readAll(), {
      runId: staleOpened.scope.runId,
    }),
  );
  assert.equal(abg.holdsAt(staleCalculus, beforeFluent), true);
  assert.equal(abg.holdsAt(staleCalculus, afterFluent), false);
  const staleFreshProof = await proveFreshProcessRuntimeProjectionEquality({
    abg,
    product,
    installedPackageRoot: installedRoot,
    store: staleOwner.store,
    requests: [{
      rowId: "c0-stale-owner-runtime-truth",
      owner: "abg",
      exportName: "projectRuntimeTruthAtDurablePrefix",
      input: "durable_prefix",
      args: [staleOpened.scope.runId],
    }],
  });
  assert.deepEqual(
    staleFreshProof.retainedRows[0].projection.replayState
      .currentWorksiteObservations.map((row) => row.observation),
    [predecessorObservation],
  );
  await rm(targetPath, { force: true });

  const retainedCrossedReceipt = {};
  const crossedReceiptOpened = openRootTraversal(
    abg,
    crossedReceipt.store,
    executionBasis,
    "crossed-receipt/open",
  );
  assert.equal(
    crossedReceiptOpened.kind,
    "traversal_scope_open_admission",
    JSON.stringify(crossedReceiptOpened),
  );
  const crossedReceiptCompletion = await hog.executeGraphTraversal({
    store: crossedReceipt.store,
    predecessorPrefix: crossedReceiptOpened.successorPrefix,
    executionBasis,
    openedTraversalScope: crossedReceiptOpened.scope,
    program,
    programValidation,
    graphFunction,
    graph,
    graphValidation,
    implementationSet,
    interactionSet: executionBasisAdmission.interactionSet,
    leafPort: crossedReceiptLeafPort({
      leafPort,
      product,
      retained: retainedCrossedReceipt,
    }),
    actorRuntimeBinding: { workspaceBinding, artifactTruth },
    input,
    inputDigest: rawInput.subjectDigest,
    closureContract,
    eventTime: "2026-09-01T00:00:00.000Z",
    correlationId: "correlation://t287/c0/crossed-receipt/hog",
  });
  assert.equal(
    crossedReceiptCompletion.disposition,
    "refused",
    JSON.stringify(crossedReceiptCompletion),
  );
  assert.equal(
    crossedReceiptCompletion.resultValue.kind,
    "unadmitted_physical_commit",
  );
  assert.ok(retainedCrossedReceipt.output);
  assert.deepEqual(
    crossedReceiptCompletion.resultValue.receipt,
    retainedCrossedReceipt.output.receipt,
  );
  assert.deepEqual(
    crossedReceiptCompletion.resultValue.successorObservation,
    retainedCrossedReceipt.output.successorObservation,
  );
  assert.deepEqual(
    crossedReceiptCompletion.resultValue.refusedExpectedPrefix,
    abg.selectHeldEventStoreDurablePrefix(crossedReceipt.store),
  );
  assert.deepEqual(await readFile(targetPath), replacement);
  const crossedReceiptCallEvents = crossedReceipt.store.readAll().filter(
    (event) => event.aggregateId === crossedReceiptCompletion.cCallRef,
  );
  assert.deepEqual(crossedReceiptCallEvents.map((event) => event.kind), [
    "c_call_opened",
    "c_call_fibre_selected",
  ]);
  const crossedReceiptCalculus = abg.deriveRuntimeEventCalculusProjection(
    abg.selectValidatedRuntimeEventPrefix(crossedReceipt.store.readAll(), {
      runId: crossedReceiptOpened.scope.runId,
    }),
  );
  assert.equal(abg.holdsAt(crossedReceiptCalculus, beforeFluent), true);
  assert.equal(abg.holdsAt(crossedReceiptCalculus, afterFluent), false);
  await rm(targetPath, { force: true });

  const conflictOpened = openRootTraversal(
    abg,
    conflict.store,
    executionBasis,
    "conflict/open",
  );
  assert.equal(
    conflictOpened.kind,
    "traversal_scope_open_admission",
    JSON.stringify(conflictOpened),
  );
  const retainedConflict = {};
  const conflicted = await hog.executeGraphTraversal({
    store: conflict.store,
    predecessorPrefix: conflictOpened.successorPrefix,
    executionBasis,
    openedTraversalScope: conflictOpened.scope,
    program,
    programValidation,
    graphFunction,
    graph,
    graphValidation,
    implementationSet,
    interactionSet: executionBasisAdmission.interactionSet,
    leafPort: prefixConflictLeafPort({
      eventStore,
      leafPort,
      product,
      retained: retainedConflict,
      store: conflict.store,
    }),
    actorRuntimeBinding: { workspaceBinding, artifactTruth },
    input,
    inputDigest: rawInput.subjectDigest,
    closureContract,
    eventTime: "2026-09-01T00:00:00.000Z",
    correlationId: "correlation://t287/c0/conflict/hog",
  });
  assert.equal(conflicted.disposition, "refused", JSON.stringify(conflicted));
  assert.equal(conflicted.resultValue.kind, "unadmitted_physical_commit");
  assert.ok(retainedConflict.output);
  assert.deepEqual(conflicted.resultValue.receipt, retainedConflict.output.receipt);
  assert.deepEqual(
    conflicted.resultValue.successorObservation,
    retainedConflict.output.successorObservation,
  );
  assert.equal(
    conflicted.resultValue.refusedExpectedPrefix.prefixLength <
      abg.selectHeldEventStoreDurablePrefix(conflict.store).prefixLength,
    true,
  );
  assert.deepEqual(await readFile(targetPath), replacement);
  const conflictedCallEvents = conflict.store.readAll().filter(
    (event) => event.aggregateId === conflicted.cCallRef,
  );
  assert.deepEqual(conflictedCallEvents.map((event) => event.kind), [
    "c_call_opened",
    "c_call_fibre_selected",
  ]);
  const conflictCalculus = abg.deriveRuntimeEventCalculusProjection(
    abg.selectValidatedRuntimeEventPrefix(conflict.store.readAll(), {
      runId: conflictOpened.scope.runId,
    }),
  );
  assert.equal(abg.holdsAt(conflictCalculus, beforeFluent), true);
  assert.equal(abg.holdsAt(conflictCalculus, afterFluent), false);
  const conflictReplay = abg.projectRuntimeTruthAtDurablePrefix(
    abg.selectHeldEventStoreDurablePrefix(conflict.store),
    conflictOpened.scope.runId,
  ).replayState;
  assert.deepEqual(
    conflictReplay.currentWorksiteObservations.map((row) => row.observation),
    [predecessorObservation],
  );
  assert.deepEqual(
    conflictReplay.currentWorksiteObservations.map((row) => row.sourceEventRef),
    [executionBasis.admissionEventRef],
  );

  assert.ok(retainedConflict.call);
  const residueAuthorityReuse = await leafPort.invoke(retainedConflict.call);
  assert.equal(residueAuthorityReuse.kind, "closed_leaf_owner_receipt");
  assert.equal(residueAuthorityReuse.candidate.disposition, "failure");
  assert.equal(
    residueAuthorityReuse.candidate.resultCandidate.failureClass,
    "implementation_exception",
    "the post-commit call authority must be stale after the conflicting append",
  );
  assert.deepEqual(await readFile(targetPath), replacement);

  const freshObservation = await product.observeWorksiteSubject(
    workspaceBinding,
    input.subject,
  );
  assert.equal(
    freshObservation.kind,
    "worksite_observation",
    JSON.stringify(freshObservation),
  );
  assert.equal(freshObservation.state, "file");
  assert.notEqual(
    freshObservation.observationRef,
    input.predecessorObservation.observationRef,
  );
  const recoveredBytes = Buffer.from("recovered through a fresh C0 basis\n");
  const recoveryInput = product.constructWorksiteFileReplaceRequest({
    workspaceBinding,
    capabilityGrant,
    subject: input.subject,
    territory: input.territory,
    predecessorObservation: freshObservation,
    replacementBytes: recoveredBytes,
  });
  assert.equal(
    recoveryInput.kind,
    "worksite_file_replace_request",
    JSON.stringify(recoveryInput),
  );
  const recoveryRawInput = requireRawAdmission(
    validator,
    recoveryInput,
    "invocation_input",
    graphFunction.inputs[0],
  );
  const recoveryRawRequest = requireRawAdmission(
    validator,
    {
      kind: "public_invocation",
      schemaVersion: "5.0.0",
      operationId: "abg.operation.run.invoke",
      variant: "direct",
      invocationRef: "invocation://t287/c0/post-residue-recovery",
      eventTime: "2026-09-01T00:00:02.000Z",
      correlationId: "correlation://t287/c0/post-residue-recovery",
      payload: {
        programRef: program.programRef,
        catalogHandle: graphFunction.name,
      },
    },
    "public_operation_request",
    "contract://abiogenesis/public/run-invoke-request@5",
  );
  const recoverySelectedRow = product.lookupGraphFunction(
    catalogView,
    graphFunction.name,
  );
  assert.ok(recoverySelectedRow);
  const recoveryInvocationAuthority = invocationAuthority;
  assert.equal(
    recoveryInvocationAuthority.kind,
    "invocation_authority",
    JSON.stringify(recoveryInvocationAuthority),
  );
  const recoveryInvocation = product.constructDirectInvocation(
    workspaceBinding,
    catalogView,
    program,
    recoverySelectedRow,
    recoveryRawRequest,
    recoveryRawInput,
    policy,
    [capabilityGrant],
    recoveryInvocationAuthority,
  );
  assert.equal(
    recoveryInvocation.kind,
    "public_invocation_candidate",
    JSON.stringify(recoveryInvocation),
  );
  const recoveryInvocationPredecessor =
    abg.selectHeldEventStoreDurablePrefix(conflict.store);
  const recoveryArtifactTruth = abg.projectExactPrefixArtifactTruth(
    recoveryInvocationPredecessor,
  );
  assert.equal(
    recoveryArtifactTruth.kind,
    "exact_prefix_artifact_truth_projection",
    JSON.stringify(recoveryArtifactTruth),
  );
  const recoveryInvocationReceipt = abg.admitInvocation(
    conflict.store,
    {
      invocation: recoveryInvocation,
      rawRequest: recoveryRawRequest,
      rawInput: recoveryRawInput,
      programPublication: publication,
      executionResolution: executionResolution.resolution,
      program,
      graphFunction,
      programValidation,
      workspaceBinding,
      artifactTruth: recoveryArtifactTruth,
      catalogView,
      policy,
      capabilityGrants: [capabilityGrant],
      authority: recoveryInvocationAuthority,
    },
    {
      ...publicOperationBasis(
        product,
        "abg.operation.run.invoke",
        workspaceBinding.bindingId,
        workspaceBinding.bindingDigest,
        recoveryInvocation.publicRequestInvocationRef,
        [workspaceBinding.admissionEventRef],
      ),
      predecessorPrefix: recoveryInvocationPredecessor,
    },
  );
  assert.equal(
    recoveryInvocationReceipt.kind,
    "invocation_admission_receipt",
    JSON.stringify(recoveryInvocationReceipt),
  );
  const recoveryGraph = gtl.materializeGraph(graphFunction, {
    invocationAdmissionRef:
      recoveryInvocationReceipt.admission.invocationAdmissionRef,
    admittedInputRef: recoveryRawInput.admissionRef,
    admittedInputDigest: recoveryRawInput.subjectDigest,
    admittedInput: recoveryInput,
  });
  const recoveryGraphValidation = validator.validateGraph(
    recoveryGraph,
    programValidation,
    graphFunction,
    {
      invocationAdmissionRef:
        recoveryInvocationReceipt.admission.invocationAdmissionRef,
      admittedInputRef: recoveryRawInput.admissionRef,
      admittedInputDigest: recoveryRawInput.subjectDigest,
      admittedInput: recoveryInput,
    },
  );
  assert.equal(
    recoveryGraphValidation.kind,
    "graph_validation",
    JSON.stringify(recoveryGraphValidation),
  );
  const recoveryResolutionCandidate = product.resolveImplementation(
    catalogView,
    executionResolution.declarationClosure,
    programValidation,
    recoveryGraphValidation,
    graphFunction.name,
    node.nodeRef,
    executionResolution.packagedImplementations,
  );
  assert.equal(
    recoveryResolutionCandidate.kind,
    "implementation_resolution_candidate",
    JSON.stringify(recoveryResolutionCandidate),
  );
  const recoveryImplementationDescriptor =
    executionResolution.packagedImplementations.find(
      (descriptor) =>
        descriptor.descriptorDigest ===
          recoveryResolutionCandidate.implementationDescriptorDigest,
    );
  assert.ok(recoveryImplementationDescriptor);
  const recoveryResolutionValidation =
    validator.validateImplementationResolution(
      recoveryResolutionCandidate,
      publication,
      programValidation,
      recoveryGraphValidation,
      graphFunction,
      recoveryImplementationDescriptor,
    );
  assert.equal(
    recoveryResolutionValidation.kind,
    "implementation_resolution_validation",
    JSON.stringify(recoveryResolutionValidation),
  );
  const recoveryBasisAdmission = abg.admitExecutionBasis(
    conflict.store,
    recoveryInvocationReceipt.successorPrefix,
    {
      invocationAdmission: recoveryInvocationReceipt.admission,
      rawInputValue: recoveryInput,
      program,
      programValidation,
      graph: recoveryGraph,
      graphValidation: recoveryGraphValidation,
      resolutionSetCandidate,
      resolutionSetValidation,
      resolutionCandidate: recoveryResolutionCandidate,
      resolutionValidation: recoveryResolutionValidation,
      closureContract,
    },
    runtimeBasis("post-residue-recovery/basis"),
  );
  assert.equal(
    recoveryBasisAdmission.kind,
    "execution_basis_admission",
    JSON.stringify(recoveryBasisAdmission),
  );
  const recoveryLeafPort =
    await implementationLeafPort.constructAdmittedLeafInvocationPort({
      prefix: abg.selectValidatedRuntimeEventPrefix(
        abg.readRuntimeEventsAtDurablePrefix(
          recoveryBasisAdmission.successorPrefix,
        ),
      ),
      artifactTruth: recoveryArtifactTruth,
      implementationSet: recoveryBasisAdmission.implementationSet,
      executionResolution,
      semanticsProjection,
    });
  const recoveryOpened = openRootTraversal(
    abg,
    conflict.store,
    recoveryBasisAdmission.executionBasis,
    "post-residue-recovery/open",
  );
  assert.equal(
    recoveryOpened.kind,
    "traversal_scope_open_admission",
    JSON.stringify(recoveryOpened),
  );
  const recoveryCompletion = await hog.executeGraphTraversal({
    store: conflict.store,
    predecessorPrefix: recoveryOpened.successorPrefix,
    executionBasis: recoveryBasisAdmission.executionBasis,
    openedTraversalScope: recoveryOpened.scope,
    program,
    programValidation,
    graphFunction,
    graph: recoveryGraph,
    graphValidation: recoveryGraphValidation,
    implementationSet: recoveryBasisAdmission.implementationSet,
    interactionSet: recoveryBasisAdmission.interactionSet,
    leafPort: recoveryLeafPort,
    actorRuntimeBinding: {
      workspaceBinding,
      artifactTruth: recoveryArtifactTruth,
    },
    input: recoveryInput,
    inputDigest: recoveryRawInput.subjectDigest,
    closureContract,
    eventTime: "2026-09-01T00:00:02.000Z",
    correlationId: "correlation://t287/c0/post-residue-recovery/hog",
  });
  assert.equal(
    recoveryCompletion.disposition,
    "closed",
    JSON.stringify(recoveryCompletion),
  );
  assert.deepEqual(await readFile(targetPath), recoveredBytes);
  const recoveryEvents = conflict.store.readAll().filter(
    (event) => event.aggregateId === recoveryCompletion.cCallRef,
  );
  assert.deepEqual(recoveryEvents.map((event) => event.kind), [
    "c_call_opened",
    "c_call_fibre_selected",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged",
  ]);

  const installedImplementationPath = join(
    installedRoot,
    implementationRow.modulePath,
  );
  const liveImplementationPath = join(root, implementationRow.modulePath);
  assert.ok((await readFile(liveImplementationPath)).byteLength > 0);
  await rm(installedImplementationPath, { force: true });
  const substrateOpened = openRootTraversal(
    abg,
    substrateFailure.store,
    executionBasis,
    "substrate-failure/open",
  );
  assert.equal(
    substrateOpened.kind,
    "traversal_scope_open_admission",
    JSON.stringify(substrateOpened),
  );
  const substrateCompletion = await hog.executeGraphTraversal({
    store: substrateFailure.store,
    predecessorPrefix: substrateOpened.successorPrefix,
    executionBasis,
    openedTraversalScope: substrateOpened.scope,
    program,
    programValidation,
    graphFunction,
    graph,
    graphValidation,
    implementationSet,
    interactionSet: executionBasisAdmission.interactionSet,
    leafPort,
    actorRuntimeBinding: { workspaceBinding, artifactTruth },
    input,
    inputDigest: rawInput.subjectDigest,
    closureContract,
    eventTime: "2026-09-01T00:00:03.000Z",
    correlationId: "correlation://t287/c0/substrate-failure/hog",
  });
  assert.equal(
    substrateCompletion.disposition,
    "failed",
    JSON.stringify(substrateCompletion),
  );
  assert.equal(
    substrateCompletion.resultValue.failureClass,
    "implementation_exception",
  );
  const substrateCallEvents = substrateFailure.store.readAll().filter(
    (event) => event.aggregateId === substrateCompletion.cCallRef,
  );
  assert.deepEqual(substrateCallEvents.map((event) => event.kind), [
    "c_call_opened",
    "c_call_fibre_selected",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged",
  ]);
  assert.equal(
    substrateCallEvents.find((event) => event.kind === "c_call_evidenced")
      .payload.evidenceClass,
    "deterministic",
  );
  assert.equal(
    substrateCallEvents.find(
      (event) => event.kind === "c_call_result_admitted",
    ).payload.resultClass,
    "failure",
  );
  assert.equal(
    substrateCallEvents.find((event) => event.kind === "c_call_judged")
      .payload.judgment,
    "blocked",
  );
  assert.deepEqual(await readFile(targetPath), recoveredBytes);
  await assert.rejects(
    implementationLeafPort.constructAdmittedLeafInvocationPort({
      prefix: abg.selectValidatedRuntimeEventPrefix(
        abg.readRuntimeEventsAtDurablePrefix(
          executionBasisAdmission.successorPrefix,
        ),
      ),
      artifactTruth,
      implementationSet,
      executionResolution,
      semanticsProjection,
    }),
    /exact owner-selected admitted execution closure/u,
    "an installed module loss must not fall back to the live source tree",
  );
});
