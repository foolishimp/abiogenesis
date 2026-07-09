// T-217 exit rider SR-7 — REQ-R-ABG3-WITNESS-012 directly.
// "Witness truth shall audit the supervisor role separation. A
// constructive act performed outside admitted work (bypassing the ticket
// effector) shall surface as a reprice or hygiene violation in replay;
// witness events record the separation, they do not substitute for it."
//
// Both out-of-band constructive act classes, one differential each way:
// the act SURFACES (violation), and after lawful ratification the SAME
// act passes — proving the events record the separation rather than
// substitute for it.
import test from "node:test";
import assert from "node:assert/strict";

import {
  constructDeclarationRepriceAdmittedEvent,
  deriveCitabilityPredicate,
  deriveHaltDiagnosis,
  deriveWorkspaceHygieneRows,
  constructWorkspaceHygieneStampedEvent,
  deriveWorkspaceHygienePredicate
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";
import { emit } from "../../build/semantic/code/src/abg/m03/events/index.js";
import {
  constructGtlLibraryEntryDeclaration,
  constructProductRegistryStartupConfig,
  runEngineStart
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageStartContext } from "./support/m03-iteration-fixtures.mjs";

function declaration(marker, graphFunctionRef) {
  return constructGtlLibraryEntryDeclaration({
    declarationRef: "gtl-declaration://t217/sr7/subject",
    entryRef: "registry-entry://t217/sr7/subject",
    libraryScope: "product",
    entryKind: "graph_function",
    namespace: "t217.sr7",
    ownerRef: "owner://abg/t217",
    version: "4.6.0-dev",
    graphFunctionRef,
    interfaceRef: "interface://t217/sr7/subject",
    sourceContractRef: "contract://t217/sr7/source",
    targetContractRef: "contract://t217/sr7/target",
    contextRefs: ["context://t217/sr7"],
    authorityRefs: ["authority://t217/sr7/abg-runtime"],
    overlayRefs: ["overlay://t217/sr7/subject"],
    provenanceRefs: ["provenance://t217/sr7"],
    readinessRefs: ["readiness://t217/sr7"],
    proofRefs: [`proof://t217/sr7/${marker}`],
    policyRefs: ["policy://t217/sr7"],
    declarationSourceRefs: ["gtl://module/t217/sr7"]
  });
}

function startupConfig() {
  return constructProductRegistryStartupConfig({
    configRef: "product-registry-startup://t217/sr7",
    productNamespace: "t217.sr7",
    ownerRef: "owner://abg/t217",
    version: "4.6.0-dev",
    enabledLibraryRefs: [
      "registry-entry://t217/sr7/subject",
      "gtl-declaration://t217/sr7/subject",
      "gtl://module/t217/sr7"
    ],
    overlayRefs: ["overlay://t217/sr7/subject"],
    pluginRefs: ["plugin://t217/sr7/fp-worker"],
    readinessRefs: ["readiness://t217/sr7"],
    proofRefs: ["proof://t217/sr7"],
    policyRefs: ["policy://t217/sr7"],
    configSourceRefs: ["config://t217/sr7"]
  });
}

test("T-217 SR-7 (WITNESS-012): an out-of-band SUBSTRATE act surfaces as a reprice violation; ratified, the same act passes — recorded, not substituted", () => {
  const { input, context, executive } = buildThreeStageStartContext({
    defaultRegime: "F_P"
  });
  const run = (runtimeEvents, marker, sink = () => {}) =>
    runEngineStart({
      startIntent: input,
      module: context.module,
      runtimeIdentity: context.runtimeIdentity,
      resolvedPolicy: context.resolvedPolicy,
      runtimeEvents,
      eventSink: sink,
      runtimeRegistryStartup: {
        systemDeclarations: [],
        productStartupConfig: startupConfig(),
        productDeclarations: [declaration(marker, executive.id)],
        correlationId: `correlation://t217/sr7/${marker}`
      }
    });
  const runOneEvents = [];
  run([], "content-v1", (event) => runOneEvents.push(event));
  const admittedV1 = runOneEvents.find(
    (event) => event.kind === "registry_entry_admitted"
  );
  const basisAdmitted = runOneEvents.find(
    (event) => event.kind === "basis_admitted"
  );

  // the out-of-band constructive act: the declaration was edited without
  // a ticketed reprice — the witness SURFACES it as a violation
  const blockedEvents = [];
  const blocked = run([...runOneEvents], "content-v2", (event) =>
    blockedEvents.push(event)
  );
  assert.equal(blocked.transition.terminalKind, "gap_stop");
  assert.match(blocked.transition.reason ?? "", /declaration_reprice_required/u);
  // the violation is diagnosable replay truth (the observer's view of it)
  const diagnosis = deriveHaltDiagnosis([...runOneEvents, ...blockedEvents]);
  assert.equal(diagnosis.halted, true);
  assert.match(diagnosis.haltReason ?? "", /declaration_reprice_required/u);

  // the separation is RECORDED, not substituted: the ticketed reprice
  // (the lawful effector) ratifies the same act and it passes
  const expectedV2 = runOneEvents.length; // placeholder no-op to keep flow explicit
  void expectedV2;
  const v2Digest = (() => {
    const probeEvents = [];
    run([], "content-v2", (event) => probeEvents.push(event));
    return probeEvents.find((event) => event.kind === "registry_entry_admitted")
      .declarationDigest;
  })();
  const [ratified] = emit(
    constructDeclarationRepriceAdmittedEvent({
      basisId: basisAdmitted.basisId,
      runId: basisAdmitted.runId,
      workKey: basisAdmitted.workKey,
      declarationRef: admittedV1.declarationRef,
      beforeDigest: admittedV1.declarationDigest,
      afterDigest: v2Digest,
      changeClass: "requirement_reprice",
      owningTicketRef: "ticket://T-217",
      operatorActorRef: "operator://jim",
      reason: "SR-7: the same act, ratified through the ticket effector"
    }),
    () => {}
  );
  const ratifiedRun = run([...runOneEvents, ratified], "content-v2");
  const stillViolating =
    ratifiedRun.transition.terminalKind === "gap_stop" &&
    /declaration_reprice_required/u.test(ratifiedRun.transition.reason ?? "");
  assert.equal(stillViolating, false, "the ratified act passes the witness");
});

test("T-217 SR-7 (WITNESS-012): an out-of-band WORKSITE act surfaces as a hygiene violation; re-measured clean, citability recovers", () => {
  const artifact = {
    kind: "actor_result_artifact_observed",
    basisId: "basis://t217/sr7",
    graphFunctionId: "graph-function://t217/sr7",
    runId: "run://t217/sr7",
    workKey: "wk://t217/sr7",
    graphCallId: "graph-call://t217/sr7",
    frameId: "frame://t217/sr7",
    vectorIndex: 0,
    edge: "input_set→requirements",
    actorInvocationId: "actor-invocation://t217/sr7",
    workerId: "worker://t217",
    backendId: "backend://node",
    causationEventRefs: [],
    correlationId: "correlation://t217/sr7/artifact",
    resultRef: "result://t217/sr7/report",
    artifactRef: "artifact://t217/sr7/report",
    artifactContentDigest: "digest-admitted",
    artifactContentExcerpt: null
  };
  const converged = {
    kind: "terminal_reached",
    basisId: "basis://t217/sr7",
    terminalKind: "converged",
    reason: null
  };
  // the out-of-band act: the evidence file was rewritten by hand — the
  // instrument measures it and the kernel classifies the violation
  const rows = deriveWorkspaceHygieneRows({
    observations: [
      {
        artifactRef: "artifact://t217/sr7/report",
        observedDigest: "digest-hand-edited",
        copyOutRef: "copyout://t217/sr7/report/1"
      }
    ],
    replayEvents: [artifact]
  });
  assert.equal(rows[0].classification, "foreign_write");
  const [taintStamp] = emit(
    constructWorkspaceHygieneStampedEvent({
      basisId: "basis://t217/sr7",
      runId: "run://t217/sr7",
      workKey: "wk://t217/sr7",
      segmentRef: null,
      observedBy: "operator://jim/digest-instrument",
      rows
    }),
    () => {}
  );
  const violated = deriveCitabilityPredicate([artifact, converged, taintStamp]);
  assert.equal(violated.citable, false);
  assert.deepEqual(violated.failingConjuncts, ["hygiene_clean"]);
  assert.deepEqual(violated.taintedArtifactRefs, ["artifact://t217/sr7/report"]);

  // recorded, not substituted: lawful re-measurement (the artifact
  // restored/re-admitted) resolves the taint and citability recovers
  const cleanRows = deriveWorkspaceHygieneRows({
    observations: [
      {
        artifactRef: "artifact://t217/sr7/report",
        observedDigest: "digest-admitted"
      }
    ],
    replayEvents: [artifact]
  });
  const [cleanStamp] = emit(
    constructWorkspaceHygieneStampedEvent({
      basisId: "basis://t217/sr7",
      runId: "run://t217/sr7",
      workKey: "wk://t217/sr7",
      segmentRef: null,
      observedBy: "operator://jim/digest-instrument",
      rows: cleanRows
    }),
    () => {}
  );
  const recovered = deriveCitabilityPredicate([
    artifact,
    converged,
    taintStamp,
    cleanStamp
  ]);
  assert.equal(recovered.citable, true);
  assert.equal(
    deriveWorkspaceHygienePredicate([taintStamp, cleanStamp]).hygieneClean,
    true
  );
});
