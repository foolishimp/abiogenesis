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
  reconstructRouteBasisFromReplay,
  verifyReplayLogAttestations
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";
import { emit } from "../../build/semantic/code/src/abg/m03/events/index.js";
import { admitReplayLogAttestation, runEngineStart } from "../../build/semantic/code/src/index.js";
import { buildThreeStageStartContext } from "./support/m03-iteration-fixtures.mjs";

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
  // C-5 (S2.4): the route-invocable spine comes FROM REPLAY — the
  // kernel API replaces the fixture-spread reconstruction hack
  const basis = reconstructRouteBasisFromReplay(runEvents);
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
    basisId: basis.id,
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
    { kind: "terminal_reached", basisId: basis.id, terminalKind: "converged", reason: null },
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

test("T-217 m4 (codex P1): the chain hashes FULL content — a payload mutation with a preserved envelope is evident", () => {
  const [genuine] = emit(
    { kind: "terminal_reached", basisId: "basis://t217/m4", terminalKind: "gap_stop", reason: "honest halt" },
    () => {}
  );
  const attestation = (() => {
    const [event] = emit(
      constructReplayLogAttestedEvent({
        basisId: "basis://t217/m4",
        runId: null,
        workKey: null,
        chainDigest: deriveReplayChainDigest([genuine]).chainDigest,
        eventCount: 1,
        attestedBy: "operator://jim/attestation-instrument"
      }),
      () => {}
    );
    return event;
  })();
  assert.equal(verifyReplayLogAttestations([genuine, attestation])[0].verified, true);
  // the codex probe: mutate the PAYLOAD, preserve the canonical envelope
  const mutated = { ...genuine, terminalKind: "converged", reason: null };
  const rows = verifyReplayLogAttestations([mutated, attestation]);
  assert.equal(rows[0].verified, false, "content mutation must be evident");
  assert.equal(rows[0].failureReason, "chain_digest_mismatch");
});

test("T-217 m5 (codex P1): verification applies the mint's basis scope; unplaceable and uncanonical events fail closed", () => {
  const [scoped] = emit(
    { kind: "terminal_reached", basisId: "basis://t217/m5", terminalKind: "converged", reason: null },
    () => {}
  );
  const [foreign] = emit(
    { kind: "terminal_reached", basisId: "basis://t217/m5/OTHER", terminalKind: "gap_stop", reason: "foreign spine" },
    () => {}
  );
  const [attestation] = emit(
    constructReplayLogAttestedEvent({
      basisId: "basis://t217/m5",
      runId: null,
      workKey: null,
      chainDigest: deriveReplayChainDigest([scoped]).chainDigest,
      eventCount: 1,
      attestedBy: "operator://jim/attestation-instrument"
    }),
    () => {}
  );
  // a foreign-basis event preceding the attestation in a shared store
  // must NOT break it (its own basis's attestations cover it)
  const rows = verifyReplayLogAttestations([foreign, scoped, attestation]);
  assert.equal(rows[0].verified, true, "foreign-basis events are out of scope");

  // an event with an ordinal but NO eventId cannot be attested
  assert.throws(
    () =>
      deriveReplayChainDigest([
        { kind: "terminal_reached", basisId: "basis://t217/m5", terminalKind: "converged", reason: null, eventAdmissionOrdinal: 7 }
      ]),
    /requires canonical stamped events/u
  );
  // a raw (never-admitted) attestation event is itself unplaceable
  const rawAttestation = constructReplayLogAttestedEvent({
    basisId: "basis://t217/m5",
    runId: null,
    workKey: null,
    chainDigest: "chain://raw",
    eventCount: 0,
    attestedBy: "operator://forger"
  });
  const rawRows = verifyReplayLogAttestations([scoped, rawAttestation]);
  assert.equal(rawRows[0].verified, false);
  assert.equal(rawRows[0].failureReason, "unplaceable_events");

  // an in-scope RAW event hiding in the record poisons verification of a
  // placeable attestation (nothing unplaceable can hide in an attested
  // record)
  const rawInScope = {
    kind: "terminal_reached",
    basisId: "basis://t217/m5",
    terminalKind: "converged",
    reason: "raw smuggle"
  };
  const poisoned = verifyReplayLogAttestations([scoped, rawInScope, attestation]);
  assert.equal(poisoned[0].verified, false);
  assert.equal(poisoned[0].failureReason, "unplaceable_events");
});
