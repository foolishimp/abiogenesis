// T-217 Phase 1 (T-211 item 2 / T-195 P1-10) — replay-log attestation.
// The Review A probe: a canonical-shape-valid FORGED event supplied via
// request.runtimeEvents minted closure truth. The chain makes the record
// tamper-evident between attestations.
import test from "node:test";
import assert from "node:assert/strict";

import {
  assertRuntimeEvent,
  constructReplayLogAttestedEvent,
  deriveReplayChainDigest,
  verifyReplayLogAttestations
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";
import { emit } from "../../build/semantic/code/src/abg/m03/events/index.js";
import { admitReplayLogAttestation, runEngineStart } from "../../build/semantic/code/src/index.js";
import {
  buildThreeStageBasis,
  buildThreeStageStartContext
} from "./support/m03-iteration-fixtures.mjs";

test("T-217 m1: attestation admission — self-certified ref, full authority fields", () => {
  const valid = constructReplayLogAttestedEvent({
    basisId: "basis://t217/m1",
    runId: "run://t217/m1",
    workKey: "wk://t217/m1",
    chainDigest: "chain-digest-fixture",
    eventCount: 3,
    attestedBy: "operator://jim/attestation-instrument"
  });
  assertRuntimeEvent(valid);
  assert.match(valid.attestationRef, /^replay-attestation:/u);
  assert.throws(
    () =>
      assertRuntimeEvent({ ...valid, attestationRef: "replay-attestation:forged" }),
    /attestationRef must be the content-derived identity/u
  );
  // identity binds content: changing the count without re-mint is inadmissible
  assert.throws(
    () => assertRuntimeEvent({ ...valid, eventCount: 4 }),
    /attestationRef must be the content-derived identity/u
  );
  assert.throws(
    () => assertRuntimeEvent({ ...valid, attestedBy: "" }),
    /attestedBy/u
  );
});

test("T-217 m2: the chain is ordinal-deterministic and fails closed on uncanonical events", () => {
  const [first] = emit(
    { kind: "terminal_reached", basisId: "basis://t217/m2", terminalKind: "converged", reason: null },
    () => {}
  );
  const [second] = emit(
    { kind: "terminal_reached", basisId: "basis://t217/m2", terminalKind: "gap_stop", reason: "m2" },
    () => {}
  );
  const forward = deriveReplayChainDigest([first, second]);
  const shuffled = deriveReplayChainDigest([second, first]);
  assert.equal(forward.chainDigest, shuffled.chainDigest, "ordinal order, not array order");
  assert.equal(forward.eventCount, 2);
  assert.throws(
    () =>
      deriveReplayChainDigest([
        first,
        { kind: "terminal_reached", basisId: "basis://t217/m2", terminalKind: "converged", reason: null }
      ]),
    /requires canonical stamped events|requires admission ordinals/u
  );
});

test("T-217 m3: the route attests a live run; forging inside the attested span is EVIDENT; appends after it are lawful", () => {
  const { input, context } = buildThreeStageStartContext({ defaultRegime: "F_P" });
  const runEvents = [];
  runEngineStart({
    startIntent: input,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runtimeEvents: [],
    eventSink: (event) => runEvents.push(event)
  });
  const basisAdmitted = runEvents.find((event) => event.kind === "basis_admitted");
  const fixture = buildThreeStageBasis({ defaultRegime: "F_P" });
  const basis = Object.freeze({
    ...fixture,
    id: basisAdmitted.basisId,
    runId: basisAdmitted.runId,
    workKey: basisAdmitted.workKey
  });
  const sunk = [];
  const attested = admitReplayLogAttestation({
    basis,
    runtimeEvents: [...runEvents],
    eventSink: (event) => sunk.push(event),
    attestedBy: "operator://jim/attestation-instrument"
  });
  assert.equal(attested.kind, "replay_log_attestation_result");
  assert.equal(attested.eventCount, runEvents.length);
  const record = [...runEvents, ...attested.emittedEvents];

  // clean record verifies
  const cleanRows = verifyReplayLogAttestations(record);
  assert.equal(cleanRows.length, 1);
  assert.equal(cleanRows[0].verified, true);
  assert.equal(cleanRows[0].failureReason, null);

  // the Review A forgery class: a canonical-SHAPED event smuggled inside
  // the attested span (fake envelope, ordinal below the attestation)
  const forged = {
    kind: "terminal_reached",
    basisId: basisAdmitted.basisId,
    terminalKind: "converged",
    reason: "forged-closure",
    eventId: "runtime-event:forged:0:deadbeef",
    eventTime: "2026-07-09T00:00:00.000Z",
    eventTimeUnixMs: 1783900800000,
    eventAdmissionOrdinal: 0
  };
  const tamperedRows = verifyReplayLogAttestations([...record, forged]);
  assert.equal(tamperedRows[0].verified, false, "the forgery is evident");
  assert.ok(
    tamperedRows[0].failureReason === "chain_digest_mismatch" ||
      tamperedRows[0].failureReason === "event_count_mismatch"
  );

  // append-only friendliness: lawful events AFTER the attestation do not
  // disturb it; a NEW attestation covers them
  const [later] = emit(
    { kind: "terminal_reached", basisId: basisAdmitted.basisId, terminalKind: "converged", reason: null },
    () => {}
  );
  const appendedRows = verifyReplayLogAttestations([...record, later]);
  assert.equal(appendedRows[0].verified, true, "appends never disturb a prior attestation");
  const reSunk = [];
  const attestedAgain = admitReplayLogAttestation({
    basis,
    runtimeEvents: [...record, later],
    eventSink: (event) => reSunk.push(event),
    attestedBy: "operator://jim/attestation-instrument"
  });
  const fullRows = verifyReplayLogAttestations([
    ...record,
    later,
    ...attestedAgain.emittedEvents
  ]);
  assert.equal(fullRows.length, 2);
  assert.ok(fullRows.every((row) => row.verified));
});
