import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { copyFile, readFile, rm, stat } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

import {
  importInstalledPackageExport,
} from "../support/root-cli-environment.mjs";
import { acquireNewEmptyAppendSinkResource } from "../support/new-empty-append-sink.mjs";
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

export async function axF04(harness) {
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
  const storeResource = await acquireNewEmptyAppendSinkResource(
    abg.createNewEmptyAppendSink,
    "abi5-ax-f04-",
  );
  const store = storeResource.store;
  const digestA = product.sha256Canonical({ artifact: "A" });
  const digestB = product.sha256Canonical({ artifact: "B" });
  const scopeA = "workspace://s06/ax-f04/a";
  const scopeB = "workspace://s06/ax-f04/b";
  const scopeDigestA = product.sha256Canonical({ scope: scopeA });
  const scopeDigestB = product.sha256Canonical({ scope: scopeB });
  const artifactRef = "artifact://s06/ax-f04/collision";
  const operationId = "abg.operation.product.install";
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
  assert.equal(
    admission.validatePublicOperationBasis(basisA1, operationId),
    null,
  );
  assert.equal(
    admission.validatePublicOperationBasis(basisB1, operationId),
    null,
  );
  const first = admission.admitArtifact(
    store,
    { ...basisA1, predecessorPrefix: storeResource.prefix },
    operationId,
    artifactRef,
    digestA,
  );
  assert.equal(first.disposition, "admitted", JSON.stringify(first));
  const otherScope = admission.admitArtifact(
    store,
    { ...basisB1, predecessorPrefix: first.successorPrefix },
    operationId,
    artifactRef,
    digestA,
  );
  assert.equal(otherScope.disposition, "admitted", JSON.stringify(otherScope));
  const exactTruth = abg.projectExactPrefixArtifactTruth(
    otherScope.successorPrefix,
  );
  assert.equal(
    exactTruth.kind,
    "exact_prefix_artifact_truth_projection",
    JSON.stringify(exactTruth),
  );
  assert.deepEqual(
    exactTruth.rows.map((row) => ({
      authorityScopeRef: row.authorityScopeRef,
      authorityScopeDigest: row.authorityScopeDigest,
      artifactRef: row.artifactRef,
      artifactDigest: row.artifactDigest,
    })),
    [
      {
        authorityScopeRef: scopeA,
        authorityScopeDigest: scopeDigestA,
        artifactRef,
        artifactDigest: digestA,
      },
      {
        authorityScopeRef: scopeB,
        authorityScopeDigest: scopeDigestB,
        artifactRef,
        artifactDigest: digestA,
      },
    ],
  );
  const prefixBeforeCollision = structuredClone(otherScope.successorPrefix);
  const eventLogPath = fileURLToPath(prefixBeforeCollision.eventLogRef);
  const bytesBeforeCollision = await readFile(eventLogPath);
  const storeRowsBeforeCollision = store.readAll();
  const countBeforeCollision = storeRowsBeforeCollision.length;
  const collision = admission.admitArtifact(
    store,
    { ...basisA1, predecessorPrefix: otherScope.successorPrefix },
    operationId,
    artifactRef,
    digestB,
  );
  const storeRowsAfterCollision = store.readAll();
  const countAfterCollision = storeRowsAfterCollision.length;
  const rows = abg.readRuntimeEventsAtDurablePrefix(
    otherScope.successorPrefix,
  );
  const effects = rows.map((event) => abg.eventCalculusEffect(event));
  assert.equal(collision.disposition, "refused", JSON.stringify(collision));
  assert.equal(collision.refusal.kind, "abg_admission_refusal");
  assert.equal(collision.refusal.schemaVersion, "5.0.0");
  assert.equal(collision.refusal.disposition, "refused");
  assert.equal(collision.refusal.code, "artifact_truth_conflict");
  assert.deepEqual(collision.successorPrefix, prefixBeforeCollision);
  assert.deepEqual(await readFile(eventLogPath), bytesBeforeCollision);
  assert.deepEqual(storeRowsAfterCollision, storeRowsBeforeCollision);
  assert.equal(rows.length, 2);

  const calculus = abg.deriveRuntimeEventCalculusProjection(
    abg.selectValidatedRuntimeEventPrefix(rows),
  );
  const unscopedAvailability = abg.constructRuntimeFluent({
    name: "public_operation_artifact_available",
  });
  const scopedAvailability = [scopeA, scopeB].map((authorityScopeRef) =>
    abg.constructRuntimeFluent({
      name: "public_operation_artifact_available",
      identity: authorityScopeRef,
    })
  );
  const initiatedFluentRefs = effects.map((effect) =>
    effect.initiates.map(abg.runtimeFluentKey)
  );
  const expectedScopedFluentRefs = scopedAvailability.map(abg.runtimeFluentKey);
  const unscopedFluentRef = abg.runtimeFluentKey(unscopedAvailability);
  const scopedEffectsExact = initiatedFluentRefs.every(
    (refs, index) =>
      refs.length === 1 && refs[0] === expectedScopedFluentRefs[index],
  );
  const scopedHolds = scopedAvailability.map((fluent) =>
    abg.holdsAt(calculus, fluent)
  );
  const unscopedHolds = abg.holdsAt(calculus, unscopedAvailability);
  const scopedArtifactAvailability =
    scopedEffectsExact && scopedHolds.every(Boolean) && !unscopedHolds;
  const unscopedArtifactAvailability =
    initiatedFluentRefs.every(
      (refs) => refs.length === 1 && refs[0] === unscopedFluentRef,
    ) &&
    unscopedHolds &&
    scopedHolds.every((held) => !held);
  assert.equal(
    scopedArtifactAvailability || unscopedArtifactAvailability,
    true,
    JSON.stringify({ initiatedFluentRefs, scopedHolds, unscopedHolds }),
  );
  const observed = {
    firstDisposition: first.disposition,
    otherScopeDisposition: otherScope.disposition,
    collisionDisposition: collision.disposition,
    collisionCode: collision.refusal.code,
    eventCountBeforeCollision: countBeforeCollision,
    eventCountAfterCollision: countAfterCollision,
    admittedScopes: rows.map((event) => event.payload.authorityScopeRef),
    admittedDigests: rows.map((event) => event.payload.artifactDigest),
    initiatedFluentRefs,
    heldFluentRefs: calculus.holds.map(abg.runtimeFluentKey),
    expectedScopedFluentRefs,
    unscopedFluentRef,
    scopedHolds,
    unscopedHolds,
  };
  const expected = {
    crossScopeAdmissions: "both are admitted under distinct authority scopes",
    sameScopeConflictingDigest: "typed artifact_truth_conflict before append",
    collisionEventDelta: 0,
    artifactFluent: "public_operation_artifact_available",
    fluentIdentities: [scopeA, scopeB],
  };
  const ownerRelationExact =
    first.disposition === "admitted" &&
    otherScope.disposition === "admitted" &&
    collision.disposition === "refused" &&
    collision.refusal.code === "artifact_truth_conflict" &&
    countAfterCollision === countBeforeCollision &&
    rows[0]?.payload.authorityScopeRef === scopeA &&
    rows[1]?.payload.authorityScopeRef === scopeB &&
    rows[0]?.payload.artifactDigest === digestA &&
    rows[1]?.payload.artifactDigest === digestA;
  await storeResource.dispose();
  assert.equal(ownerRelationExact, true, JSON.stringify(observed));
  return {
    relationId: "AX-F04",
    disposition: scopedArtifactAvailability
      ? "preserved_green"
      : "confirmed_red",
    claim:
      "artifact availability must preserve the admitted authority-scope identity while same-scope conflicts remain eventless",
    ingress:
      "installed internal src/abg/environment_admission.ts::admitArtifact followed by the installed exact-prefix artifact and Event Calculus projections",
    fixtureSource:
      "two valid product.install admission bases over two explicit authority scopes and one shared artifact reference/digest",
    processBoundary:
      "one installed owner-acquired append sink; two admitted scopes followed by one same-scope digest-only collision at the exact second prefix",
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
      artifactAvailabilityIdentity: "authorityScopeRef",
    },
    expectedBaselineSignature: expected,
    observedSignature: observed,
    maskControls: [
      passedControl("all_public_operation_bases_validate", {
        basisA1: true,
        basisB1: true,
      }),
      passedControl("cross_scope_owner_admissions_and_exact_projection", {
        firstDisposition: first.disposition,
        otherScopeDisposition: otherScope.disposition,
        projectedScopes: exactTruth.rows.map((row) => row.authorityScopeRef),
      }),
      passedControl("same_scope_collision_is_typed_and_eventless", {
        collisionDisposition: collision.disposition,
        collisionCode: collision.refusal.code,
        prefixUnchanged: true,
        bytesUnchanged: true,
        eventCountUnchanged: countAfterCollision === countBeforeCollision,
      }),
      passedControl("artifact_availability_shape_is_decision_exact", {
        scopedArtifactAvailability,
        unscopedArtifactAvailability,
      }),
    ],
    cases: [
      caseRecord(
        "cross_scope_coexistence",
        { admitted: true, eventCount: 2, projectedScopes: [scopeA, scopeB] },
        {
          admitted:
            first.disposition === "admitted" &&
            otherScope.disposition === "admitted",
          eventCount: countBeforeCollision,
          projectedScopes: exactTruth.rows.map((row) => row.authorityScopeRef),
        },
        first.disposition === "admitted" &&
          otherScope.disposition === "admitted" &&
          countBeforeCollision === 2,
      ),
      caseRecord(
        "same_scope_conflicting_digest",
        { disposition: "refused", code: "artifact_truth_conflict", eventDelta: 0 },
        {
          disposition: collision.disposition,
          code: collision.refusal.code,
          eventDelta: countAfterCollision - countBeforeCollision,
        },
        collision.disposition === "refused" &&
          collision.refusal.code === "artifact_truth_conflict" &&
          countAfterCollision === countBeforeCollision,
      ),
      {
        caseId: "authority_scope_keyed_artifact_availability",
        expected,
        observed,
      },
    ],
  };
}

export async function axF06(harness, packageRoot) {
  const workerSource = join(
    dirname(new URL(import.meta.url).pathname),
    "runtime-f06-worker.mjs",
  );
  const workerPath = join(harness.cliHost, "runtime-f06-worker.mjs");
  await copyFile(workerSource, workerPath);
  const supportPath = join(
    packageRoot,
    "test_env/support/root-installed-environment.mjs",
  );
  const pairs = {};
  for (const caseId of ["tampered", "equal"]) {
    let producer;
    try {
      producer = await runJsonWorker(workerPath, harness.cliHost, {
        action: "produce",
        caseId,
        packageRoot,
        supportPath,
      });
      assert.equal(producer.action, "produce");
      assert.equal(producer.caseId, caseId);
      const consumer = await runJsonWorker(workerPath, harness.cliHost, {
        action: "consume",
        caseId,
        handoff: producer.handoff,
      });
      assert.equal(consumer.action, "consume");
      assert.equal(consumer.caseId, caseId);
      pairs[caseId] = { producer, consumer };
    } finally {
      if (typeof producer?.cleanupRoot === "string") {
        await rm(producer.cleanupRoot, { force: true, recursive: true });
      }
    }
  }

  const tampered = pairs.tampered;
  const equal = pairs.equal;
  assert.notEqual(tampered, undefined);
  assert.notEqual(equal, undefined);
  const allProcessIds = [
    tampered.producer.pid,
    tampered.consumer.pid,
    equal.producer.pid,
    equal.consumer.pid,
  ];
  const processesAreDistinct = new Set(allProcessIds).size === 4;
  const cleanPrefixesAreIndependent =
    tampered.producer.handoff.prefix.prefix.eventLogRef !==
      equal.producer.handoff.prefix.prefix.eventLogRef &&
    tampered.producer.handoff.prefix.prefix.coordinateDigest !==
      equal.producer.handoff.prefix.prefix.coordinateDigest;
  const pairPrerequisitesReconstructed = [tampered, equal].every((pair) =>
    pair.producer.audit.exactHandoffKeys === true &&
    pair.producer.audit.handoffExcludesConstructedAuthorityObjects === true &&
    pair.producer.audit.readinessPublicationMatchesInstalledIdentity === true &&
    pair.producer.audit.productConstructorsProducedExactInputs === true &&
    pair.consumer.audit.exactInputKeys === true &&
    pair.consumer.audit.prefixReopened === true &&
    pair.consumer.audit.admittedInstallProjected === true &&
    pair.consumer.audit.workspaceBindingProjected === true &&
    pair.consumer.audit.publicationCanonicallyEqual === true &&
    pair.consumer.audit.catalogConstructed === true &&
    pair.consumer.audit.viewConstructed === true &&
    pair.consumer.audit.applicationConstructed === true &&
    pair.consumer.audit.applicationIdentityExact === true
  );
  const equalCarrierAcceptedWithoutOriginObject =
    equal.consumer.audit.changedApplicationFields.length === 0 &&
    equal.consumer.audit.retainedOriginalIdentity === true &&
    equal.consumer.result.kind === "invocation_admission" &&
    equal.consumer.result.disposition === "admitted" &&
    equal.consumer.audit.eventDelta === 2 &&
    equal.consumer.audit.exactInvocationAtoms === true &&
    equal.consumer.audit.resultRefDigestExact === true &&
    equal.consumer.audit.publicAtomRefDigestExact === true &&
    equal.consumer.audit.invocationAtomRefDigestExact === true &&
    equal.consumer.audit.admittedAtFinalPrefix === true;
  const tamperChangesOneBodyFieldAndRetainsIdentity =
    tampered.consumer.audit.changedApplicationFields.length === 1 &&
    tampered.consumer.audit.changedApplicationFields[0] === "targetRef" &&
    tampered.consumer.audit.retainedOriginalIdentity === true;
  const tamperedRefusedBeforeAppend =
    tampered.consumer.result.kind === "invocation_admission_refusal" &&
    tampered.consumer.result.code === "catalog_view_not_admitted" &&
    tampered.consumer.audit.eventDelta === 0 &&
    tampered.consumer.audit.eventsUnchanged === true &&
    tampered.consumer.audit.bytesUnchanged === true &&
    tampered.consumer.audit.prefixUnchanged === true &&
    tampered.consumer.audit.typedEventlessRefusal === true;
  const tamperedAcceptedWithExactInvocationAtoms =
    tampered.consumer.result.kind === "invocation_admission" &&
    tampered.consumer.result.disposition === "admitted" &&
    tampered.consumer.audit.eventDelta === 2 &&
    tampered.consumer.audit.exactInvocationAtoms === true &&
    tampered.consumer.audit.resultRefDigestExact === true &&
    tampered.consumer.audit.publicAtomRefDigestExact === true &&
    tampered.consumer.audit.invocationAtomRefDigestExact === true &&
    tampered.consumer.audit.admittedAtFinalPrefix === true;
  const tamperedDecisionExact =
    tamperedRefusedBeforeAppend !==
      tamperedAcceptedWithExactInvocationAtoms;

  assert.equal(processesAreDistinct, true, JSON.stringify(allProcessIds));
  assert.equal(
    cleanPrefixesAreIndependent,
    true,
    JSON.stringify({
      tampered: tampered.producer.handoff.prefix.prefix,
      equal: equal.producer.handoff.prefix.prefix,
    }),
  );
  assert.equal(
    pairPrerequisitesReconstructed,
    true,
    JSON.stringify({
      tampered: tampered.consumer.audit,
      equal: equal.consumer.audit,
    }),
  );
  assert.equal(
    equalCarrierAcceptedWithoutOriginObject,
    true,
    JSON.stringify({
      resultKind: equal.consumer.result.kind,
      resultDisposition: equal.consumer.result.disposition,
      resultCode: equal.consumer.result.code ?? null,
      eventDelta: equal.consumer.audit.eventDelta,
      exactInvocationAtoms: equal.consumer.audit.exactInvocationAtoms,
      resultRefDigestExact: equal.consumer.audit.resultRefDigestExact,
      publicAtomRefDigestExact:
        equal.consumer.audit.publicAtomRefDigestExact,
      invocationAtomRefDigestExact:
        equal.consumer.audit.invocationAtomRefDigestExact,
      admittedAtFinalPrefix: equal.consumer.audit.admittedAtFinalPrefix,
    }),
  );
  assert.equal(tamperChangesOneBodyFieldAndRetainsIdentity, true);
  assert.equal(tamperedDecisionExact, true, JSON.stringify(tampered));

  const observed = {
    processesAreDistinct,
    cleanPrefixesAreIndependent,
    equal: {
      resultKind: equal.consumer.result.kind,
      resultDisposition: equal.consumer.result.disposition,
      eventCountBefore: equal.consumer.audit.eventCountBefore,
      eventCountAfter: equal.consumer.audit.eventCountAfter,
      eventDelta: equal.consumer.audit.eventDelta,
      exactInvocationAtoms: equal.consumer.audit.exactInvocationAtoms,
      applicationRef: equal.producer.handoff.expected.applicationRef,
      applicationDigest: equal.producer.handoff.expected.applicationDigest,
      appendedAtoms: equal.consumer.audit.appendedAtoms,
    },
    tampered: {
      resultKind: tampered.consumer.result.kind,
      resultDisposition: tampered.consumer.result.disposition,
      refusalCode: tampered.consumer.result.code ?? null,
      refusalMessage: tampered.consumer.result.message ?? null,
      changedApplicationFields:
        tampered.consumer.audit.changedApplicationFields,
      retainedOriginalIdentity:
        tampered.consumer.audit.retainedOriginalIdentity,
      eventCountBefore: tampered.consumer.audit.eventCountBefore,
      eventCountAfter: tampered.consumer.audit.eventCountAfter,
      eventDelta: tampered.consumer.audit.eventDelta,
      byteLengthBefore: tampered.consumer.audit.byteLengthBefore,
      byteLengthAfter: tampered.consumer.audit.byteLengthAfter,
      eventsUnchanged: tampered.consumer.audit.eventsUnchanged,
      bytesUnchanged: tampered.consumer.audit.bytesUnchanged,
      prefixUnchanged: tampered.consumer.audit.prefixUnchanged,
      exactInvocationAtoms: tampered.consumer.audit.exactInvocationAtoms,
      applicationRef: tampered.producer.handoff.expected.applicationRef,
      applicationDigest:
        tampered.producer.handoff.expected.applicationDigest,
      appendedAtoms: tampered.consumer.audit.appendedAtoms,
    },
  };
  return {
    relationId: "AX-F06",
    disposition: tamperedRefusedBeforeAppend
      ? "preserved_green"
      : "confirmed_red",
    claim:
      "Catalog application prerequisites are pure Product reconstructions across process loss, and run.invoke must accept the equal reconstruction while refusing a body that conflicts with its retained canonical identity before append",
    ingress:
      "fresh-process installed Product admitGraphFunctionCatalog, narrowGraphFunctionCatalog, and applyCatalogDeclaration followed by src/abg/invocation_admission.ts::admitInvocation",
    fixtureSource:
      "two independently installed Consensus readiness bases; each P1 hands off only its explicit durable prefix, serialized readiness inputs, application construction inputs, and Product-issued expected identities",
    processBoundary:
      "four sequential fresh Node processes form two P1-to-P2 pairs over independent clean prefixes; neither P2 receives a P1 catalog, view, application object, store, or context",
    mutation: {
      kind: "catalog_application_body_identity_mismatch",
      changedFields: ["targetRef"],
      retainedFields: ["applicationRef", "applicationDigest"],
      carrierBoundary: "p1_json_exit_fresh_p2",
      originatingObjectOrStoreRetained: false,
    },
    oracle: {
      equalCarrierAcceptedWithoutOriginObject: true,
      runInvokeRevalidatesDeterministicApplication: true,
      noOriginStoreContextOrConstructorBrandRequired: true,
      bodyIdentityMismatchRefusedBeforeAppend: true,
      admittedCarrierRecordedByExactInvocationAtoms: true,
    },
    expectedBaselineSignature: {
      equal: {
        kind: "invocation_admission",
        disposition: "admitted",
        eventDelta: 2,
        exactApplicationRefAndDigestInBothAtoms: true,
      },
      tampered: {
        kind: "invocation_admission_refusal",
        code: "catalog_view_not_admitted",
        eventDelta: 0,
        eventBytesAndPrefixUnchanged: true,
      },
    },
    observedSignature: observed,
    maskControls: [
      passedControl("four_fresh_processes_and_two_clean_prefixes", {
        processIds: allProcessIds,
        processesAreDistinct,
        cleanPrefixesAreIndependent,
      }),
      passedControl("pure_product_reconstruction_from_serialized_inputs", {
        pairPrerequisitesReconstructed,
        p1AuthorityObjectsExcluded: true,
      }),
      passedControl("tamper_is_one_body_field_with_original_identity", {
        changedApplicationFields:
          tampered.consumer.audit.changedApplicationFields,
        retainedOriginalIdentity:
          tampered.consumer.audit.retainedOriginalIdentity,
      }),
      passedControl("equal_carrier_produces_exact_invocation_atoms", {
        equalCarrierAcceptedWithoutOriginObject,
        eventDelta: equal.consumer.audit.eventDelta,
      }),
      passedControl("tampered_decision_is_append_exact", {
        tamperedRefusedBeforeAppend,
        tamperedAcceptedWithExactInvocationAtoms,
      }),
    ],
    cases: [
      caseRecord(
        "equal_reconstructed_application",
        {
          kind: "invocation_admission",
          eventDelta: 2,
          exactApplicationIdentityInBothAtoms: true,
        },
        {
          kind: equal.consumer.result.kind,
          disposition: equal.consumer.result.disposition,
          eventDelta: equal.consumer.audit.eventDelta,
          exactApplicationIdentityInBothAtoms:
            equal.consumer.audit.exactInvocationAtoms,
        },
        equalCarrierAcceptedWithoutOriginObject,
      ),
      caseRecord(
        "tampered_body_with_retained_identity",
        {
          desired: {
            kind: "invocation_admission_refusal",
            code: "catalog_view_not_admitted",
            eventDelta: 0,
            eventBytesAndPrefixUnchanged: true,
          },
          characterizedCurrentRed: {
            kind: "invocation_admission",
            eventDelta: 2,
            exactApplicationIdentityInBothAtoms: true,
          },
        },
        {
          kind: tampered.consumer.result.kind,
          disposition: tampered.consumer.result.disposition,
          code: tampered.consumer.result.code ?? null,
          eventDelta: tampered.consumer.audit.eventDelta,
          eventsUnchanged: tampered.consumer.audit.eventsUnchanged,
          bytesUnchanged: tampered.consumer.audit.bytesUnchanged,
          prefixUnchanged: tampered.consumer.audit.prefixUnchanged,
          exactApplicationIdentityInBothAtoms:
            tampered.consumer.audit.exactInvocationAtoms,
        },
        tamperChangesOneBodyFieldAndRetainsIdentity && tamperedDecisionExact,
      ),
    ],
  };
}

export async function axF13(harness, packageRoot) {
  const workerSource = join(
    dirname(new URL(import.meta.url).pathname),
    "runtime-f06-worker.mjs",
  );
  const workerPath = join(harness.cliHost, "runtime-f06-worker.mjs");
  await copyFile(workerSource, workerPath);
  const supportPath = join(
    packageRoot,
    "test_env/support/root-installed-environment.mjs",
  );
  const producers = [];
  const produceCase = async (caseId) => {
    const producer = await runJsonWorker(workerPath, harness.cliHost, {
      action: "produce",
      caseId,
      packageRoot,
      supportPath,
    });
    assert.equal(producer.action, "produce");
    assert.equal(producer.caseId, caseId);
    producers.push(producer);
    return producer;
  };
  try {
    const duplicateProducer = await produceCase("f13-duplicate");
    const duplicateRetained = await runJsonWorker(
      workerPath,
      harness.cliHost,
      {
        action: "f13_duplicate_retained",
        caseId: "f13-duplicate",
        handoff: duplicateProducer.handoff,
      },
    );
    const duplicateFresh = await runJsonWorker(
      workerPath,
      harness.cliHost,
      {
        action: "f13_duplicate_fresh",
        caseId: "f13-duplicate",
        handoff: {
          ...duplicateProducer.handoff,
          prefix: duplicateRetained.handoff,
        },
      },
    );

    const semanticProducer = await produceCase("f13-semantic");
    const semanticRefusal = await runJsonWorker(
      workerPath,
      harness.cliHost,
      {
        action: "f13_semantic_refusal",
        caseId: "f13-semantic",
        handoff: semanticProducer.handoff,
      },
    );
    const semanticCorrected = await runJsonWorker(
      workerPath,
      harness.cliHost,
      {
        action: "f13_semantic_corrected",
        caseId: "f13-semantic",
        handoff: {
          ...semanticProducer.handoff,
          prefix: semanticRefusal.handoff,
        },
      },
    );

    const pureProducer = await produceCase("f13-pure");
    const pureRetained = await runJsonWorker(workerPath, harness.cliHost, {
      action: "f13_pure_projection",
      caseId: "f13-pure",
      handoff: pureProducer.handoff,
    });
    const pureFresh = await runJsonWorker(workerPath, harness.cliHost, {
      action: "f13_pure_projection",
      caseId: "f13-pure",
      handoff: {
        ...pureProducer.handoff,
        prefix: pureRetained.handoff,
      },
    });

    const processIds = [
      duplicateProducer.pid,
      duplicateRetained.pid,
      duplicateFresh.pid,
      semanticProducer.pid,
      semanticRefusal.pid,
      semanticCorrected.pid,
      pureProducer.pid,
      pureRetained.pid,
      pureFresh.pid,
    ];
    const processesAreDistinct = new Set(processIds).size === processIds.length;
    const producerPrefixes = producers.map((producer) =>
      producer.handoff.prefix.prefix);
    const independentPrefixes =
      new Set(producerPrefixes.map((prefix) => prefix.eventLogRef)).size === 3 &&
      new Set(producerPrefixes.map((prefix) => prefix.coordinateDigest)).size ===
        3;
    const producerPrerequisitesExact = producers.every((producer) =>
      producer.audit.exactHandoffKeys === true &&
      producer.audit.handoffExcludesConstructedAuthorityObjects === true &&
      producer.audit.readinessPublicationMatchesInstalledIdentity === true &&
      producer.audit.productConstructorsProducedExactInputs === true &&
      producer.audit.eventCountAtHandoff > 0
    );
    const consumerPrerequisitesExact = [
      duplicateRetained.audit,
      duplicateFresh.audit,
      semanticRefusal.audit,
      semanticCorrected.audit,
      pureRetained.audit,
      pureFresh.audit,
    ].every((audit) =>
      (audit.prefixReopened === true ||
        audit.initialPrefixReopened === true) &&
      audit.admittedInstallProjected === true &&
      audit.workspaceBindingProjected === true &&
      audit.publicationCanonicallyEqual === true &&
      audit.catalogConstructed === true &&
      audit.viewConstructed === true &&
      audit.applicationConstructed === true &&
      audit.applicationIdentityExact === true
    );
    const fullHandoffs = [
      ...producers.map((producer) => producer.handoff.prefix),
      duplicateRetained.firstHandoff,
      duplicateRetained.handoff,
      duplicateFresh.handoff,
      semanticRefusal.handoff,
      semanticCorrected.handoff,
      pureRetained.handoff,
      pureFresh.handoff,
    ];
    const fullHandoffsExact = fullHandoffs.every((handoff) =>
      handoff?.prefix?.kind === "durable_prefix_coordinate" &&
      handoff?.reopenAuthority?.kind === "event_store_reopen_authority" &&
      handoff.prefix.prefixLength ===
        handoff.reopenAuthority.durableByteLength &&
      handoff.prefix.prefixDigest === handoff.reopenAuthority.eventLogDigest &&
      handoff.prefix.storeIdentity.device === handoff.reopenAuthority.device &&
      handoff.prefix.storeIdentity.inode === handoff.reopenAuthority.inode &&
      handoff.prefix.storeIdentity.eventContractDigest ===
        handoff.reopenAuthority.eventContractDigest
    );

    const duplicateCarrierIdentityExact =
      harness.product.canonicalJson(duplicateRetained.carrierIdentity) ===
        harness.product.canonicalJson(duplicateFresh.carrierIdentity);
    const firstAdmissionExact =
      duplicateRetained.firstResult.kind === "invocation_admission" &&
      duplicateRetained.firstResult.disposition === "admitted" &&
      duplicateRetained.audit.firstEventDelta === 2 &&
      duplicateRetained.audit.firstByteDelta > 0 &&
      duplicateRetained.audit.firstAppendedAtoms.length === 2 &&
      duplicateRetained.audit.firstAppendedAtoms[0]?.kind ===
        "public_operation_admitted" &&
      duplicateRetained.audit.firstAppendedAtoms[1]?.kind ===
        "invocation_admitted";
    const expectedPriorAdmission = firstAdmissionExact
      ? {
        operationId: "abg.operation.run.invoke",
        publicInvocationRef:
          duplicateRetained.firstResult.publicRequestInvocationRef,
        ownerInvocationRef: duplicateRetained.firstResult.invocationRef,
        ownerInvocationDigest: duplicateRetained.firstResult.invocationDigest,
        publicOperationEventRef:
          duplicateRetained.firstResult.publicOperationEventRef,
        admissionEventRef: duplicateRetained.firstResult.admissionEventRef,
      }
      : null;
    const retainedPriorAdmissionExact =
      expectedPriorAdmission !== null &&
      duplicateRetained.retryResult.priorAdmission !== undefined &&
      harness.product.canonicalJson(
        duplicateRetained.retryResult.priorAdmission,
      ) === harness.product.canonicalJson(expectedPriorAdmission);
    const freshPriorAdmissionExact =
      expectedPriorAdmission !== null &&
      duplicateFresh.result.priorAdmission !== undefined &&
      harness.product.canonicalJson(duplicateFresh.result.priorAdmission) ===
        harness.product.canonicalJson(expectedPriorAdmission);
    const duplicatePriorAdmissionExact =
      retainedPriorAdmissionExact && freshPriorAdmissionExact;
    const retainedTypedDuplicate =
      duplicateRetained.retryResult.kind === "invocation_admission_refusal" &&
      duplicateRetained.retryResult.code === "duplicate_invocation" &&
      retainedPriorAdmissionExact &&
      duplicateRetained.audit.retryEventDelta === 0 &&
      duplicateRetained.audit.retryEventsUnchanged === true &&
      duplicateRetained.audit.retryBytesUnchanged === true &&
      duplicateRetained.audit.retryPrefixUnchanged === true;
    const freshTypedDuplicate =
      duplicateFresh.result.kind === "invocation_admission_refusal" &&
      duplicateFresh.result.code === "duplicate_invocation" &&
      freshPriorAdmissionExact &&
      duplicateFresh.audit.eventDelta === 0 &&
      duplicateFresh.audit.eventsUnchanged === true &&
      duplicateFresh.audit.bytesUnchanged === true &&
      duplicateFresh.audit.prefixUnchanged === true &&
      duplicateFresh.audit.fullHandoffUnchanged === true;
    const duplicatePreservedGreen =
      retainedTypedDuplicate && freshTypedDuplicate;
    const retainedReadmission =
      duplicateRetained.retryResult.kind === "invocation_admission" &&
      duplicateRetained.retryResult.disposition === "admitted" &&
      duplicateRetained.audit.retryEventDelta === 2 &&
      duplicateRetained.audit.retryByteDelta > 0 &&
      duplicateRetained.audit.retryAppendedAtoms.length === 2 &&
      duplicateRetained.audit.retryAppendedAtoms[0]?.kind ===
        "public_operation_admitted" &&
      duplicateRetained.audit.retryAppendedAtoms[1]?.kind ===
        "invocation_admitted";
    const freshReadmission =
      duplicateFresh.result.kind === "invocation_admission" &&
      duplicateFresh.result.disposition === "admitted" &&
      duplicateFresh.audit.eventDelta === 2 &&
      duplicateFresh.audit.byteLengthAfter >
        duplicateFresh.audit.byteLengthBefore &&
      duplicateFresh.audit.exactInvocationAtoms === true &&
      duplicateFresh.audit.appendedAtoms.length === 2;
    const readmissionIdentityExact =
      retainedReadmission &&
      freshReadmission &&
      duplicateRetained.firstResult.invocationAdmissionRef ===
        duplicateRetained.retryResult.invocationAdmissionRef &&
      duplicateRetained.firstResult.invocationAdmissionDigest ===
        duplicateRetained.retryResult.invocationAdmissionDigest &&
      duplicateRetained.firstResult.invocationAdmissionRef ===
        duplicateFresh.result.invocationAdmissionRef &&
      duplicateRetained.firstResult.invocationAdmissionDigest ===
        duplicateFresh.result.invocationAdmissionDigest &&
      new Set([
        ...duplicateRetained.audit.firstAppendedAtoms,
        ...duplicateRetained.audit.retryAppendedAtoms,
        ...duplicateFresh.audit.appendedAtoms,
      ].map((atom) => atom.eventId)).size === 6;
    const duplicateConfirmedRed =
      retainedReadmission && freshReadmission && readmissionIdentityExact;
    const duplicateDecisionExact =
      duplicatePreservedGreen !== duplicateConfirmedRed;
    const duplicateHandoffChainExact =
      duplicateRetained.audit.firstEventCountBefore ===
        duplicateProducer.audit.eventCountAtHandoff &&
      duplicateRetained.audit.retryEventCountBefore ===
        duplicateRetained.audit.firstEventCountAfter &&
      duplicateFresh.audit.eventCountBefore ===
        duplicateRetained.audit.retryEventCountAfter &&
      duplicateRetained.audit.firstByteLengthBefore ===
        duplicateProducer.handoff.prefix.prefix.prefixLength &&
      duplicateRetained.audit.retryByteLengthBefore ===
        duplicateRetained.firstHandoff.prefix.prefixLength &&
      duplicateFresh.audit.byteLengthBefore ===
        duplicateRetained.handoff.prefix.prefixLength &&
      duplicateRetained.audit.successorPrefixReopenedExact === true;

    const semanticCarrierIdentityExact =
      harness.product.canonicalJson(semanticRefusal.carrierIdentity) ===
        harness.product.canonicalJson(semanticCorrected.carrierIdentity);
    const semanticRefusalExact =
      semanticRefusal.result.kind === "invocation_admission_refusal" &&
      semanticRefusal.result.code === "catalog_view_not_admitted" &&
      semanticRefusal.audit.changedApplicationFields.length === 1 &&
      semanticRefusal.audit.changedApplicationFields[0] === "targetRef" &&
      semanticRefusal.audit.retainedOriginalIdentity === true &&
      semanticRefusal.audit.typedEventlessRefusal === true &&
      semanticRefusal.audit.eventDelta === 0 &&
      semanticRefusal.audit.fullHandoffUnchanged === true;
    const semanticCorrectionExact =
      semanticCorrected.result.kind === "invocation_admission" &&
      semanticCorrected.result.disposition === "admitted" &&
      semanticCorrected.audit.changedApplicationFields.length === 0 &&
      semanticCorrected.audit.eventDelta === 2 &&
      semanticCorrected.audit.exactInvocationAtoms === true &&
      semanticCorrected.audit.eventCountBefore ===
        semanticRefusal.audit.eventCountAfter &&
      semanticCorrected.audit.byteLengthBefore ===
        semanticRefusal.audit.byteLengthAfter;

    const pureProjectionExact =
      pureRetained.audit.projectionOperation ===
        "Product.narrowGraphFunctionCatalog" &&
      pureFresh.audit.projectionOperation ===
        "Product.narrowGraphFunctionCatalog" &&
      pureRetained.audit.retainedCanonicalEquality === true &&
      pureFresh.audit.retainedCanonicalEquality === true &&
      pureRetained.projection.kind === "graph_function_catalog_view" &&
      pureFresh.projection.kind === "graph_function_catalog_view" &&
      pureRetained.projection.viewDigest === pureFresh.projection.viewDigest &&
      pureRetained.projection.canonicalDigest ===
        pureFresh.projection.canonicalDigest &&
      [pureRetained.audit, pureFresh.audit].every((audit) =>
        audit.eventDelta === 0 &&
        audit.eventsUnchanged === true &&
        audit.bytesUnchanged === true &&
        audit.prefixUnchanged === true &&
        audit.fullHandoffUnchanged === true
      );

    const prerequisites = {
      processesAreDistinct,
      independentPrefixes,
      producerPrerequisitesExact,
      consumerPrerequisitesExact,
      fullHandoffsExact,
      duplicateCarrierIdentityExact,
      firstAdmissionExact,
      duplicateDecisionExact,
      duplicateHandoffChainExact,
      semanticCarrierIdentityExact,
      semanticRefusalExact,
      semanticCorrectionExact,
      pureProjectionExact,
    };
    const failedPrerequisite = Object.entries(prerequisites).find(
      ([, passed]) => !passed,
    );
    assert.equal(
      failedPrerequisite,
      undefined,
      `AX-F13 prerequisite mask failed: ${JSON.stringify({
        failedPrerequisite,
        prerequisites,
        duplicateRetained,
        duplicateFresh,
        semanticRefusal,
        semanticCorrected,
        pureRetained,
        pureFresh,
      })}`,
    );

    const disposition = duplicateConfirmedRed
      ? "confirmed_red"
      : "preserved_green";
    const observed = {
      processIds,
      duplicate: {
        carrierIdentity: duplicateRetained.carrierIdentity,
        first: {
          kind: duplicateRetained.firstResult.kind,
          invocationAdmissionRef:
            duplicateRetained.firstResult.invocationAdmissionRef ?? null,
          invocationAdmissionDigest:
            duplicateRetained.firstResult.invocationAdmissionDigest ?? null,
          eventDelta: duplicateRetained.audit.firstEventDelta,
          byteDelta: duplicateRetained.audit.firstByteDelta,
          appendedAtoms: duplicateRetained.audit.firstAppendedAtoms,
        },
        retainedRetry: {
          kind: duplicateRetained.retryResult.kind,
          code: duplicateRetained.retryResult.code ?? null,
          priorAdmission:
            duplicateRetained.retryResult.priorAdmission ?? null,
          invocationAdmissionRef:
            duplicateRetained.retryResult.invocationAdmissionRef ?? null,
          invocationAdmissionDigest:
            duplicateRetained.retryResult.invocationAdmissionDigest ?? null,
          eventDelta: duplicateRetained.audit.retryEventDelta,
          byteDelta: duplicateRetained.audit.retryByteDelta,
          eventsUnchanged: duplicateRetained.audit.retryEventsUnchanged,
          bytesUnchanged: duplicateRetained.audit.retryBytesUnchanged,
          prefixUnchanged: duplicateRetained.audit.retryPrefixUnchanged,
          appendedAtoms: duplicateRetained.audit.retryAppendedAtoms,
        },
        freshRetry: {
          kind: duplicateFresh.result.kind,
          code: duplicateFresh.result.code ?? null,
          priorAdmission: duplicateFresh.result.priorAdmission ?? null,
          invocationAdmissionRef:
            duplicateFresh.result.invocationAdmissionRef ?? null,
          invocationAdmissionDigest:
            duplicateFresh.result.invocationAdmissionDigest ?? null,
          eventDelta: duplicateFresh.audit.eventDelta,
          byteDelta:
            duplicateFresh.audit.byteLengthAfter -
            duplicateFresh.audit.byteLengthBefore,
          eventsUnchanged: duplicateFresh.audit.eventsUnchanged,
          bytesUnchanged: duplicateFresh.audit.bytesUnchanged,
          prefixUnchanged: duplicateFresh.audit.prefixUnchanged,
          appendedAtoms: duplicateFresh.audit.appendedAtoms,
        },
        desiredDuplicateObserved: duplicatePreservedGreen,
        currentReadmissionObserved: duplicateConfirmedRed,
      },
      semanticRefusalThenCorrection: {
        carrierIdentity: semanticRefusal.carrierIdentity,
        refusal: {
          kind: semanticRefusal.result.kind,
          code: semanticRefusal.result.code,
          eventDelta: semanticRefusal.audit.eventDelta,
          eventsUnchanged: semanticRefusal.audit.eventsUnchanged,
          bytesUnchanged: semanticRefusal.audit.bytesUnchanged,
          prefixUnchanged: semanticRefusal.audit.prefixUnchanged,
        },
        corrected: {
          kind: semanticCorrected.result.kind,
          invocationAdmissionRef:
            semanticCorrected.result.invocationAdmissionRef,
          invocationAdmissionDigest:
            semanticCorrected.result.invocationAdmissionDigest,
          eventDelta: semanticCorrected.audit.eventDelta,
          appendedAtoms: semanticCorrected.audit.appendedAtoms,
        },
      },
      pureProjection: {
        operation: pureRetained.audit.projectionOperation,
        viewDigest: pureRetained.projection.viewDigest,
        canonicalDigest: pureRetained.projection.canonicalDigest,
        retainedEventDelta: pureRetained.audit.eventDelta,
        freshEventDelta: pureFresh.audit.eventDelta,
        canonicalEquality:
          pureRetained.projection.canonicalDigest ===
            pureFresh.projection.canonicalDigest,
      },
    };
    return {
      relationId: "AX-F13",
      disposition,
      claim:
        "invocation identity is durable ABG admission truth, semantic refusal before admission does not consume it, and declared pure Product projections remain repeatable without append",
      ingress:
        "installed Product invocation constructors and src/abg/invocation_admission.ts::admitInvocation over exact full EventStoreCloseHandoffs",
      fixtureSource:
        "three independent instances of the existing AX-F06 installed runtime invocation fixture: duplicate, semantic refusal/correction, and pure Product projection",
      processBoundary:
        "one worker admits and retries after exact close/reopen in the same PID; fresh workers retry its successor, correct an eventless refusal, and repeat the pure projection; every producer and consumer PID is distinct",
      mutation: {
        duplicate:
          "retry the exact Product-issued invocation candidate and admission identity against its exact successor prefix",
        semantic:
          "supply one conflicting catalog application body, retain Product-issued identity, then restore the exact body after restart",
        pure:
          "repeat Product.narrowGraphFunctionCatalog retained and after restart",
      },
      oracle: {
        duplicate:
          "retained and fresh retries return the same typed duplicate_invocation and append zero",
        semantic:
          "parse-valid catalog_view_not_admitted refusal preserves full prefix and does not consume the corrected invocation identity",
        pure:
          "retained and fresh projection digests are canonical-equal with zero events or bytes",
      },
      expectedBaselineSignature: {
        desired: {
          duplicateRetries: "refused:duplicate_invocation;event_delta=0",
          semantic:
            "refused:catalog_view_not_admitted;event_delta=0;corrected=admitted",
          pureProjection: "canonical_equal;event_delta=0",
        },
        characterizedCurrentRed: {
          duplicateRetries:
            "invocation_admission;event_delta=2;new public_operation_admitted and invocation_admitted atoms",
        },
      },
      observedSignature: observed,
      maskControls: [
        passedControl("nine_distinct_installed_processes", {
          processIds,
          processesAreDistinct,
        }),
        passedControl("three_independent_exact_full_handoffs", {
          independentPrefixes,
          fullHandoffsExact,
        }),
        passedControl("product_abg_constructor_prerequisites", {
          producerPrerequisitesExact,
          consumerPrerequisitesExact,
        }),
        passedControl("exact_successor_prefix_retry_chain", {
          duplicateCarrierIdentityExact,
          firstAdmissionExact,
          duplicateHandoffChainExact,
        }),
        passedControl("duplicate_decision_is_exact", {
          duplicatePreservedGreen,
          duplicateConfirmedRed,
          duplicateDecisionExact,
          duplicatePriorAdmissionExact,
        }),
        passedControl("semantic_refusal_does_not_consume_identity", {
          semanticCarrierIdentityExact,
          semanticRefusalExact,
          semanticCorrectionExact,
        }),
        passedControl("pure_product_projection_is_eventless", {
          pureProjectionExact,
        }),
      ],
      cases: [
        caseRecord(
          "exact_invocation_duplicate_retained_and_fresh",
          {
            desired: {
              retained: "refused:duplicate_invocation",
              fresh: "refused:duplicate_invocation",
              eventDeltas: [0, 0],
              priorAdmissionCoordinates: "exact_first_admission",
            },
            characterizedCurrentRed: {
              retained: "invocation_admission",
              fresh: "invocation_admission",
              eventDeltas: [2, 2],
            },
          },
          observed.duplicate,
          duplicateDecisionExact,
        ),
        caseRecord(
          "semantic_refusal_then_corrected_same_identity",
          {
            refusal: "catalog_view_not_admitted",
            refusalEventDelta: 0,
            corrected: "invocation_admission",
            correctedEventDelta: 2,
          },
          observed.semanticRefusalThenCorrection,
          semanticCarrierIdentityExact &&
            semanticRefusalExact &&
            semanticCorrectionExact,
        ),
        caseRecord(
          "retained_and_fresh_pure_product_projection",
          {
            canonicalEquality: true,
            eventDeltas: [0, 0],
          },
          observed.pureProjection,
          pureProjectionExact,
        ),
      ],
    };
  } finally {
    for (const producer of producers.reverse()) {
      if (typeof producer.cleanupRoot === "string") {
        await rm(producer.cleanupRoot, { force: true, recursive: true });
      }
    }
  }
}

async function axF07(harness, packageRoot) {
  const proofRoot = join(packageRoot, "test_env/proof");
  const sourceEventLog = join(proofRoot, "abi5-root-r10.events.jsonl");
  const eventLogPath = join(harness.scratch, "ax-f07.events.jsonl");
  await copyFile(sourceEventLog, eventLogPath);
  const bytes = await readFile(eventLogPath);
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
    derivation,
  };
  const first = await runJsonWorker(workerPath, harness.cliHost, input);
  const second = await runJsonWorker(workerPath, harness.cliHost, input);
  const sameBasis =
    product.canonicalJson(first.basis) === product.canonicalJson(second.basis);
  const observed = {
    processIdsDistinct: first.pid !== second.pid,
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
      "installed src/abg/invocation_admission.ts::deriveInvocationSourceResultBasisAtPrefix and isInvocationSourceResultBasis",
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
    await axF13(harness, packageRoot),
    await axF07(harness, packageRoot),
    await runAxF08({ harness, packageRoot }),
    await runAxF09({ harness, packageRoot }),
  ];
}
