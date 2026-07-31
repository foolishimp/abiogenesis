import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { copyFile, readFile, rm, stat } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

import {
  importInstalledPackageExport,
} from "../support/root-cli-environment.mjs";
import {
  publicOperationBasis,
  rawProgramInput,
  requireRawAdmission,
  setupInstalledRootCatalog,
} from "../support/root-installed-environment.mjs";
import { runAxF08 } from "./runtime-f08.mjs";
import { runAxF09 } from "./runtime-f09.mjs";

function passedControl(controlId, observed) {
  return { controlId, observed, passed: true };
}

function caseRecord(caseId, expected, observed, passed) {
  return { caseId, expected, observed, passed };
}

function runJsonWorker(workerPath, cwd, input) {
  return new Promise((resolve, reject) => {
    const child = execFile(
      process.execPath,
      [workerPath],
      {
        cwd,
        env: { ...process.env, NODE_OPTIONS: "" },
        encoding: "utf8",
        maxBuffer: 20 * 1024 * 1024,
        timeout: 120_000,
      },
      (error, stdout, stderr) => {
        if (error !== null) {
          reject(
            new Error(
              `runtime worker failed (${String(error.code)}): ${stderr}\n${stdout}`,
            ),
          );
          return;
        }
        try {
          resolve(JSON.parse(stdout));
        } catch (parseError) {
          reject(
            new Error(
              `runtime worker returned invalid JSON: ${String(parseError)}\n${stdout}\n${stderr}`,
            ),
          );
        }
      },
    );
    child.stdin.end(JSON.stringify(input));
  });
}

async function axF04(harness) {
  const nonce = `ax-f04=${Date.now()}`;
  const [abg, product, admission] = await Promise.all([
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/abg",
      nonce,
    ),
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/product",
      nonce,
    ),
    import(
      `${pathToFileURL(join(
        harness.installedPackageRoot,
        "build/code/src/abg/environment_admission.js",
      )).href}?${nonce}`
    ),
  ]);
  const store = new abg.AbgEventStore();
  const digestA = product.sha256Canonical({ artifact: "A" });
  const digestB = product.sha256Canonical({ artifact: "B" });
  const scopeA = "workspace://s06/ax-f04/a";
  const scopeB = "workspace://s06/ax-f04/b";
  const scopeDigestA = product.sha256Canonical({ scope: scopeA });
  const scopeDigestB = product.sha256Canonical({ scope: scopeB });
  const artifactRef = "artifact://s06/ax-f04/collision";
  const operationId = "abg.operation.catalog.admit";
  const basisA1 = publicOperationBasis(
    product,
    operationId,
    scopeA,
    scopeDigestA,
    "invocation://s06/ax-f04/a/1",
  );
  const basisB1 = publicOperationBasis(
    product,
    operationId,
    scopeB,
    scopeDigestB,
    "invocation://s06/ax-f04/b/1",
  );
  const basisA2 = publicOperationBasis(
    product,
    operationId,
    scopeA,
    scopeDigestA,
    "invocation://s06/ax-f04/a/2",
  );
  assert.equal(
    admission.validatePublicOperationBasis(basisA1, operationId),
    null,
  );
  assert.equal(
    admission.validatePublicOperationBasis(basisB1, operationId),
    null,
  );
  assert.equal(
    admission.validatePublicOperationBasis(basisA2, operationId),
    null,
  );
  const first = admission.admitArtifact(
    store,
    basisA1,
    operationId,
    artifactRef,
    digestA,
  );
  const otherScope = admission.admitArtifact(
    store,
    basisB1,
    operationId,
    artifactRef,
    digestA,
  );
  const countBeforeCollision = store.readAll().length;
  const collision = admission.admitArtifact(
    store,
    basisA2,
    operationId,
    artifactRef,
    digestB,
  );
  const rows = store.readAll();
  const effects = rows.map((event) => abg.eventCalculusEffect(event));
  const observed = {
    firstKind: typeof first,
    otherScopeKind: typeof otherScope,
    collisionKind: typeof collision,
    eventCountBeforeCollision: countBeforeCollision,
    eventCountAfterCollision: rows.length,
    admittedScopes: rows.map((event) => event.payload.authorityScopeRef),
    admittedDigests: rows.map((event) => event.payload.artifactDigest),
    initiatedFluents: effects.map((effect) => effect.initiates),
  };
  const expected = {
    crossScopeAdmissions: "both return event references",
    sameScopeConflictingDigest: "also returns an event reference",
    collisionEventDelta: 1,
    artifactFluent: "public_operation_artifact_available",
    fluentKeying: "unkeyed",
  };
  const passed =
    typeof first === "string" &&
    typeof otherScope === "string" &&
    typeof collision === "string" &&
    rows.length === countBeforeCollision + 1 &&
    rows[0]?.payload.authorityScopeRef === scopeA &&
    rows[1]?.payload.authorityScopeRef === scopeB &&
    rows[2]?.payload.authorityScopeRef === scopeA &&
    rows[0]?.payload.artifactDigest === digestA &&
    rows[2]?.payload.artifactDigest === digestB &&
    effects.every(
      (effect) =>
        effect.initiates.length === 1 &&
        effect.initiates[0] === "public_operation_artifact_available",
    );
  assert.equal(passed, true, JSON.stringify(observed));
  return {
    relationId: "AX-F04",
    disposition: "confirmed_red",
    claim:
      "artifact identity must permit cross-scope coexistence and refuse a conflicting digest within one scope before admission",
    ingress:
      "installed src/abg/environment_admission.ts::admitArtifact plus Event Calculus projection",
    fixtureSource:
      "two valid public-operation admission bases over two explicit workspace scopes and one shared artifact reference",
    processBoundary:
      "one installed ABG owner context; two explicit workspace scopes followed by one same-scope conflicting digest",
    mutation: {
      kind: "same_scope_artifact_digest_collision",
      artifactRef,
      firstDigest: digestA,
      conflictingDigest: digestB,
      scopes: [scopeA, scopeB],
    },
    oracle: {
      crossScopeCoexistence: true,
      sameScopeDigestCollisionMustRefuseBeforeEvent: true,
      eventCalculusArtifactIdentityMustBeScopeKeyed: true,
    },
    expectedBaselineSignature: expected,
    observedSignature: observed,
    maskControls: [
      passedControl("all_public_operation_bases_validate", {
        basisA1: true,
        basisB1: true,
        basisA2: true,
      }),
      passedControl("cross_scope_control_admits", {
        first,
        otherScope,
      }),
    ],
    cases: [
      caseRecord(
        "cross_scope_coexistence",
        { admitted: true, eventDelta: 2 },
        {
          admitted: typeof first === "string" && typeof otherScope === "string",
          eventDelta: countBeforeCollision,
        },
        typeof first === "string" &&
          typeof otherScope === "string" &&
          countBeforeCollision === 2,
      ),
      caseRecord(
        "same_scope_conflicting_digest",
        expected,
        observed,
        passed,
      ),
    ],
  };
}

async function axF06(harness, packageRoot) {
  const workerSource = join(
    dirname(new URL(import.meta.url).pathname),
    "runtime-f06-worker.mjs",
  );
  const workerPath = join(harness.cliHost, "runtime-f06-worker.mjs");
  await copyFile(workerSource, workerPath);
  let producer;
  try {
    producer = await runJsonWorker(workerPath, harness.cliHost, {
      action: "produce",
      packageRoot,
      supportPath: join(
        packageRoot,
        "test_env/support/root-installed-environment.mjs",
      ),
    });
    assert.equal(producer.action, "produce");
    const consumer = await runJsonWorker(workerPath, harness.cliHost, {
      action: "consume",
      handoff: producer.handoff,
    });
    assert.equal(consumer.action, "consume");

    const processesAreDistinct = producer.pid !== consumer.pid;
    const prerequisitesReconstructed =
      producer.audit.exactHandoffKeys === true &&
      producer.audit.publicationMatchesInstalledIdentity === true &&
      producer.audit.applicationDigestSelfConsistent === true &&
      consumer.audit.exactInputKeys === true &&
      consumer.audit.prefixReopened === true &&
      consumer.audit.installAdmitted === true &&
      consumer.audit.workspaceAdmitted === true &&
      consumer.audit.catalogAdmitted === true &&
      consumer.audit.viewAdmitted === true &&
      consumer.audit.publicationMatchesP1 === true &&
      consumer.audit.applicationStructurallyExact === true;
    const canonicalCarrierEqual =
      producer.handoff.application.applicationDigest ===
        consumer.applicationDigest;
    const reachesApplicationBrandCheck =
      producer.audit.originatingApplicationAdmitted === true &&
      consumer.audit.reconstructedApplicationAdmitted === false &&
      consumer.refusal.kind === "invocation_admission_refusal" &&
      consumer.refusal.code === "catalog_view_not_admitted" &&
      consumer.refusal.message ===
        "invocation catalog applications require unique ABG admission under the exact CatalogView" &&
      consumer.audit.eventDelta === 0;

    assert.equal(processesAreDistinct, true);
    assert.equal(prerequisitesReconstructed, true, JSON.stringify(consumer.audit));
    assert.equal(canonicalCarrierEqual, true);
    assert.equal(reachesApplicationBrandCheck, true, JSON.stringify(consumer));

    const observed = {
      processesAreDistinct,
      originatingApplicationAdmitted:
        producer.audit.originatingApplicationAdmitted,
      reconstructedApplicationAdmitted:
        consumer.audit.reconstructedApplicationAdmitted,
      canonicalCarrierEqual,
      explicitPrefixReopened: consumer.audit.prefixReopened,
      installAdmitted: consumer.audit.installAdmitted,
      workspaceAdmitted: consumer.audit.workspaceAdmitted,
      catalogAdmitted: consumer.audit.catalogAdmitted,
      viewAdmitted: consumer.audit.viewAdmitted,
      declarationReconstructedFromInstalledExport:
        consumer.audit.publicationMatchesP1,
      applicationStructurallyExact:
        consumer.audit.applicationStructurallyExact,
      refusalKind: consumer.refusal.kind,
      refusalCode: consumer.refusal.code,
      refusalMessage: consumer.refusal.message,
      eventDelta: consumer.audit.eventDelta,
    };
    return {
      relationId: "AX-F06",
      disposition: "confirmed_red",
      claim:
        "an equal deterministic CatalogApplication carrier must not depend on its originating JavaScript object, store, context, or brand",
      ingress:
        "fresh-process installed src/abg/invocation_admission.ts::admitInvocation after explicit-prefix reconstruction of every non-application prerequisite",
      fixtureSource:
        "installed Consensus publication and subject node-type application serialized from P1 and independently reconstructed with installed declarations in P2",
      processBoundary:
        "P1 constructs the application and closes the exact durable prefix, exits, and passes only serialized immutable carriers plus the explicit prefix to fresh P2",
      mutation: {
        kind: "independently_reconstructed_equal_catalog_application",
        carrierBoundary: "p1_json_exit_fresh_p2",
        originatingObjectOrStoreRetained: false,
      },
      oracle: {
        equalCarrierAcceptedWithoutOriginObject: true,
        runInvokeRevalidatesDeterministicApplication: true,
        noOriginStoreContextOrConstructorBrandRequired: true,
      },
      expectedBaselineSignature: {
        kind: "invocation_admission_refusal",
        code: "catalog_view_not_admitted",
        message:
          "invocation catalog applications require unique ABG admission under the exact CatalogView",
        eventDelta: 0,
      },
      observedSignature: observed,
      maskControls: [
        passedControl("real_fresh_process_boundary", {
          processesAreDistinct,
        }),
        passedControl("all_non_application_owner_facts_reconstructed", {
          prerequisitesReconstructed,
        }),
        passedControl("reconstructed_carrier_is_structurally_exact", {
          canonicalCarrierEqual,
          applicationStructurallyExact:
            consumer.audit.applicationStructurallyExact,
        }),
      ],
      cases: [
        caseRecord(
          "reconstructed_equal_application_reaches_brand_check",
          {
            kind: "invocation_admission_refusal",
            code: "catalog_view_not_admitted",
            eventDelta: 0,
          },
          {
            kind: consumer.refusal.kind,
            code: consumer.refusal.code,
            eventDelta: consumer.audit.eventDelta,
          },
          reachesApplicationBrandCheck,
        ),
      ],
    };
  } finally {
    if (typeof producer?.cleanupRoot === "string") {
      await rm(producer.cleanupRoot, { force: true, recursive: true });
    }
  }
}
async function axF07(harness, packageRoot) {
  const proofRoot = join(packageRoot, "test_env/proof");
  const sourceEventLog = join(proofRoot, "abi5-root-r10.events.jsonl");
  const eventLogPath = join(harness.scratch, "ax-f07.events.jsonl");
  await copyFile(sourceEventLog, eventLogPath);
  const [bytes, transcript, outcomes, manifest] = await Promise.all([
    readFile(eventLogPath),
    readFile(join(proofRoot, "abi5-root-r10.transcript.json"), "utf8")
      .then(JSON.parse),
    readFile(join(proofRoot, "abi5-root-r10.outcomes.json"), "utf8")
      .then(JSON.parse),
    readFile(join(packageRoot, "product-toolchain-manifest.json"), "utf8")
      .then(JSON.parse),
  ]);
  const nonce = `ax-f07=${Date.now()}`;
  const [product, eventStore] = await Promise.all([
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/product",
      nonce,
    ),
    import(
      `${pathToFileURL(join(
        harness.installedPackageRoot,
        "build/code/src/abg/event_store.js",
      )).href}?${nonce}`
    ),
  ]);
  const status = await stat(eventLogPath);
  const reopenBody = {
    kind: "event_store_reopen_authority",
    schemaVersion: "5.0.0",
    eventLogPath,
    device: status.dev,
    inode: status.ino,
    eventLogDigest:
      `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
    durableByteLength: bytes.byteLength,
    eventContractDigest: eventStore.ROOT_EVENT_CONTRACT_DIGEST,
  };
  const reopenAuthority = {
    ...reopenBody,
    authorityDigest: product.sha256Canonical(reopenBody),
  };
  const events = eventStore.validateHistoricalEvents(bytes);
  const runOpen = events.find((event) => event.kind === "run_segment_opened");
  assert.notEqual(runOpen, undefined);
  const invocationEvent = events.find(
    (event) =>
      event.kind === "invocation_admitted" &&
      event.payload.invocationAdmissionRef ===
        runOpen.payload.invocationAdmissionRef,
  );
  assert.notEqual(invocationEvent, undefined);
  const resultEvent = events.find(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      event.runId === runOpen.runId,
  );
  assert.notEqual(resultEvent, undefined);
  const installEvent = events.find(
    (event) =>
      event.kind === "public_operation_artifact_admitted" &&
      event.payload.operationId === "abg.operation.product.install",
  );
  const catalogEvent = events.find(
    (event) =>
      event.kind === "public_operation_artifact_admitted" &&
      event.payload.operationId === "abg.operation.catalog.admit",
  );
  const catalogViewEvent = events.find(
    (event) =>
      event.kind === "public_operation_artifact_admitted" &&
      event.payload.operationId === "abg.operation.catalog.view",
  );
  assert.notEqual(installEvent, undefined);
  assert.notEqual(catalogEvent, undefined);
  assert.notEqual(catalogViewEvent, undefined);
  const verificationInvocation = transcript.find(
    (row) => row.operationId === "abg.operation.product.verify",
  );
  const installInvocation = transcript.find(
    (row) => row.operationId === "abg.operation.product.install",
  );
  const installOutcome = outcomes.find(
    (row) => row.operationId === "abg.operation.product.install",
  );
  const catalogInvocation = transcript.find(
    (row) => row.operationId === "abg.operation.catalog.admit",
  );
  assert.notEqual(verificationInvocation, undefined);
  assert.notEqual(installInvocation, undefined);
  assert.notEqual(installOutcome, undefined);
  assert.notEqual(catalogInvocation, undefined);
  const verification = verificationInvocation.payload;
  const publicContractRefs = [
    ...new Set(manifest.publicContractCatalog.rows.map((row) => row.contractId)),
  ].sort();
  const publicCapabilityRefs = [
    ...new Set(
      manifest.publicContractCatalog.rows.flatMap(
        (row) => row.capabilityIdentities,
      ),
    ),
  ].sort();
  const publication = catalogInvocation.payload.publication;
  const install = {
    kind: "product_install",
    schemaVersion: "5.0.0",
    disposition: "admitted",
    installId: installEvent.aggregateId,
    installedRoot: join(
      installInvocation.payload.targetRoot,
      "node_modules",
      "@abiogenesis",
      "typescript-tenant",
    ),
    productId: verification.expectedProductId,
    packageName: verification.expectedPackageName,
    packageVersion: verification.expectedPackageVersion,
    artifactDigest: verification.expectedArtifactDigest,
    productContentDigest: verification.expectedProductContentDigest,
    manifestDigest: verification.expectedManifestDigest,
    descriptorRef: manifest.descriptorRef,
    publisherNamespace: manifest.publisherNamespace,
    contributionManifestRef: manifest.contributionManifestRef,
    contributionManifestDigest: manifest.contributionManifestDigest,
    contributionManifest: manifest.contributionManifest,
    compatibilityRefs: manifest.compatibilityRefs,
    declaredDependencies: manifest.declaredDependencies,
    provenanceRef: manifest.provenanceRef,
    declaredCapabilityRefs: manifest.declaredCapabilityRefs,
    catalogId: manifest.publicContractCatalog.catalogId,
    catalogDigest: manifest.publicContractCatalog.catalogDigest,
    publicContracts: manifest.publicContractCatalog.rows,
    publicContractRefs,
    publicCapabilityRefs,
    resolvedLockId: installOutcome.result.resolvedLockId,
    resolvedLockDigest: installOutcome.result.resolvedLockDigest,
    admissionEventRef: installEvent.eventId,
  };
  const productSemanticsBasis = {
    install,
    workspaceBindingId: catalogEvent.payload.authorityScopeRef,
    workspaceBindingDigest: catalogEvent.payload.authorityScopeDigest,
    catalogId: catalogViewEvent.payload.authorityScopeRef,
    catalogDigest: catalogEvent.payload.artifactDigest,
    catalogAdmissionEventRef: catalogEvent.eventId,
    catalogViewId:
      `catalog-view://abiogenesis/${catalogViewEvent.payload.artifactDigest.slice("sha256:".length)}`,
    catalogViewDigest: catalogViewEvent.payload.artifactDigest,
    catalogViewAdmissionEventRef: catalogViewEvent.eventId,
    publicationDigest: catalogEvent.payload.publicationDigest,
    productSemanticsBinding: publication.productSemanticsBinding,
  };
  const derivation = {
    publicAuthorityDigest: product.sha256Canonical({
      relationId: "AX-F07",
      eventLogDigest: reopenAuthority.eventLogDigest,
      runId: runOpen.runId,
      resultRef: resultEvent.payload.resultRef,
    }),
    runtimeInvocationRef: invocationEvent.payload.invocationRef,
    invocationAdmissionRef: runOpen.payload.invocationAdmissionRef,
    runId: runOpen.runId,
    resultRef: resultEvent.payload.resultRef,
  };
  const workerSource = join(dirname(new URL(import.meta.url).pathname), "runtime-worker.mjs");
  const workerPath = join(harness.cliHost, "ax-f07-runtime-worker.mjs");
  await copyFile(workerSource, workerPath);
  const input = {
    action: "derive_source_result",
    reopenAuthority,
    productSemanticsBasis,
    derivation,
  };
  const first = await runJsonWorker(workerPath, harness.cliHost, input);
  const second = await runJsonWorker(workerPath, harness.cliHost, input);
  const sameBasis =
    product.canonicalJson(first.basis) === product.canonicalJson(second.basis);
  const observed = {
    processIdsDistinct: first.pid !== second.pid,
    firstProductSemanticsBasisAdmitted:
      first.admittedProductSemanticsBasis,
    secondProductSemanticsBasisAdmitted:
      second.admittedProductSemanticsBasis,
    firstConsumerAccepted: first.acceptedByBasisConsumer,
    secondConsumerAccepted: second.acceptedByBasisConsumer,
    sameBasis,
    basisRef: first.basis?.basisRef ?? null,
    basisDigest: first.basis?.basisDigest ?? null,
    sourceRunId: first.basis?.sourceRunId ?? null,
    sourceResultRef: first.basis?.sourceResultRef ?? null,
    sourceResultValueDigest: first.basis?.sourceResultValueDigest ?? null,
    firstReplayStatus: first.replay.runtimeStatus,
    secondReplayStatus: second.replay.runtimeStatus,
  };
  const passed =
    first.pid !== second.pid &&
    first.basis !== null &&
    second.basis !== null &&
    first.admittedProductSemanticsBasis === true &&
    second.admittedProductSemanticsBasis === true &&
    first.acceptedByBasisConsumer === true &&
    second.acceptedByBasisConsumer === true &&
    sameBasis &&
    first.basis.basisRef === second.basis.basisRef &&
    first.basis.basisDigest === second.basis.basisDigest &&
    first.basis.sourceRunId === derivation.runId &&
    first.basis.sourceResultRef === derivation.resultRef &&
    first.replay.runtimeStatus === "closed" &&
    second.replay.runtimeStatus === "closed";
  assert.equal(passed, true, JSON.stringify(observed));
  return {
    relationId: "AX-F07",
    disposition: "preserved_green",
    claim:
      "source-result truth is reconstructed by ABG from the exact durable prefix and remains consumable after process restart",
    ingress:
      "installed src/abg/invocation_admission.ts::deriveInvocationSourceResultBasis and isInvocationSourceResultBasis",
    fixtureSource:
      "committed abi5-root-r10 durable event proof copied to an isolated exact-prefix sink",
    processBoundary:
      "two sequential fresh Node processes independently reopen the same exact durable ABG prefix and derive the source-result basis",
    mutation: {
      kind: "fresh_process_source_result_derivation",
      durablePrefixDigest: reopenAuthority.eventLogDigest,
      runId: derivation.runId,
      invocationAdmissionRef: derivation.invocationAdmissionRef,
      resultRef: derivation.resultRef,
    },
    oracle: {
      sameCanonicalBasisAcrossProcesses: true,
      sameBasisRefDigestAndValue: true,
      acceptedByAbgBasisConsumerInFreshProcess: true,
    },
    expectedBaselineSignature: {
      disposition: "preserved_green",
      runtimeStatus: "closed",
      basisDerivation: "non-null and canonically identical",
      consumerAcceptance: true,
    },
    observedSignature: observed,
    maskControls: [
      passedControl("historical_prefix_is_contract_valid", {
        eventCount: events.length,
        eventLogDigest: reopenAuthority.eventLogDigest,
      }),
      passedControl("exact_run_inputs_exist", {
        runtimeInvocationRef: derivation.runtimeInvocationRef,
        invocationAdmissionRef: derivation.invocationAdmissionRef,
        runId: derivation.runId,
        resultRef: derivation.resultRef,
      }),
      passedControl("fresh_processes_are_distinct", {
        distinct: first.pid !== second.pid,
      }),
    ],
    cases: [
      caseRecord(
        "derive_after_first_restart",
        { basis: "non-null", consumerAccepted: true, runtimeStatus: "closed" },
        {
          basisRef: first.basis?.basisRef ?? null,
          consumerAccepted: first.acceptedByBasisConsumer,
          runtimeStatus: first.replay.runtimeStatus,
        },
        first.basis !== null &&
          first.acceptedByBasisConsumer === true &&
          first.replay.runtimeStatus === "closed",
      ),
      caseRecord(
        "derive_after_second_restart",
        { canonicalEqualityWithFirst: true, consumerAccepted: true },
        {
          canonicalEqualityWithFirst: sameBasis,
          consumerAccepted: second.acceptedByBasisConsumer,
        },
        sameBasis && second.acceptedByBasisConsumer === true,
      ),
    ],
  };
}

export async function runRuntimeLanes({ harness, packageRoot }) {
  return [
    await axF04(harness),
    await axF06(harness, packageRoot),
    await axF07(harness, packageRoot),
    await runAxF08({ harness, packageRoot }),
    await runAxF09({ harness, packageRoot }),
  ];
}
