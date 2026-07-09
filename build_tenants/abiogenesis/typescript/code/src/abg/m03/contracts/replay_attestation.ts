// T-217 Phase 1 (absorbing T-211 item 2 / T-195 P1-10) — replay-log
// attestation. The replay store is append-only by law but its INGRESS is
// unauthenticated: a canonical-shape-valid forged event supplied via
// request.runtimeEvents mints truth (the Review A probe closed an
// eligible fold with zero campaign). This module makes the record
// TAMPER-EVIDENT between attestations: an attested chain digest over the
// canonical envelope sequence; any insertion, removal, or reorder inside
// an attested span flips verification. Composes with (does not replace)
// the emit-side caller-context flag named under T-195 P1-10
// (events/emit.ts) — that refinement authenticates pre-stamps at mint
// time; this one witnesses the assembled record. Trust boundary:
// attestation coverage is campaign law (the same coverage-conjunct family
// as hygiene stampCount — zero attestations is vacuous integrity).
// WITNESS-014 disposition: attestation verification is derived predicate
// truth, never event authority.

import type { ReplayLogAttestedEvent, RuntimeEvent } from "./carriers.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import {
  eventAdmissionOrdinalOf,
  sortByAdmissionOrdinalStrict
} from "./admission_hygiene.js";

export interface ReplayChainDigest {
  readonly kind: "replay_chain_digest";
  readonly chainDigest: string;
  readonly eventCount: number;
}

export interface ReplayAttestationVerificationRow {
  readonly kind: "replay_attestation_verification_row";
  readonly attestationRef: string;
  readonly verified: boolean;
  readonly attestedChainDigest: string;
  readonly derivedChainDigest: string | null;
  readonly attestedEventCount: number;
  readonly derivedEventCount: number | null;
  readonly failureReason:
    | "chain_digest_mismatch"
    | "event_count_mismatch"
    | "unplaceable_events"
    | null;
}

function canonicalEnvelopeOf(event: RuntimeEvent): {
  readonly eventId: string;
  readonly eventAdmissionOrdinal: number;
  readonly kind: string;
} | null {
  const ordinal = eventAdmissionOrdinalOf(event);
  const eventId = (event as { readonly eventId?: unknown }).eventId;
  if (ordinal === null || typeof eventId !== "string" || eventId.length === 0) {
    return null;
  }
  return { eventId, eventAdmissionOrdinal: ordinal, kind: event.kind };
}

// The chain: a left fold over the ordinal-sorted canonical envelopes.
// Fails closed on any non-canonical event — an unplaceable event cannot
// be attested (and cannot hide inside an attested span).
export function deriveReplayChainDigest(
  events: readonly RuntimeEvent[]
): ReplayChainDigest {
  const sorted = sortByAdmissionOrdinalStrict(events, "Replay attestation");
  let chain = "replay-chain:genesis";
  let count = 0;
  for (const event of sorted) {
    const envelope = canonicalEnvelopeOf(event);
    if (envelope === null) {
      throw new TypeError(
        `Replay attestation requires canonical stamped events: ${event.kind} carries no canonical envelope`
      );
    }
    // codex P1: eventIds are random, not content-derived — an
    // envelope-only chain let a payload mutation gap_stop->converged
    // verify. The attested surface is exactly replay truth: hash the
    // FULL canonical event. (envelope retained above as the
    // canonicality gate.)
    void envelope;
    chain = stableSha256Digest({ previous: chain, event });
    count += 1;
  }
  return Object.freeze({
    kind: "replay_chain_digest",
    chainDigest: chain,
    eventCount: count
  });
}

export function deriveAdmittedReplayAttestations(
  events: readonly RuntimeEvent[]
): readonly ReplayLogAttestedEvent[] {
  return Object.freeze(
    events.filter(
      (event): event is ReplayLogAttestedEvent =>
        event.kind === "replay_log_attested"
    )
  );
}

// Verification: for each admitted attestation, re-derive the chain over
// every canonical event that PRECEDES it (ordinal order) and compare.
// Appends after an attestation never disturb it (append-only friendly);
// insertion, removal, or reorder INSIDE the attested span flips
// verified. Zero attestations returns zero rows — coverage is the
// campaign-law conjunct, not this predicate's claim.
export function verifyReplayLogAttestations(
  events: readonly RuntimeEvent[]
): readonly ReplayAttestationVerificationRow[] {
  const attestations = deriveAdmittedReplayAttestations(events);
  return Object.freeze(
    attestations.map((attestation) => {
      const attestationOrdinal = eventAdmissionOrdinalOf(attestation);
      if (attestationOrdinal === null) {
        return Object.freeze({
          kind: "replay_attestation_verification_row" as const,
          attestationRef: attestation.attestationRef,
          verified: false,
          attestedChainDigest: attestation.chainDigest,
          derivedChainDigest: null,
          attestedEventCount: attestation.eventCount,
          derivedEventCount: null,
          failureReason: "unplaceable_events" as const
        });
      }
      // codex P1: the mint attests the BASIS-SCOPED record (route
      // filters via runtimeEventsForBasis: null-basis events plus the
      // attesting basis) — verification applies the identical scope, so
      // a foreign-basis event in a shared workspace log never breaks a
      // valid attestation (its own basis's attestations cover it).
      const inScope = (event: RuntimeEvent): boolean => {
        const basisId = (event as { readonly basisId?: unknown }).basisId;
        const scoped =
          typeof basisId === "string" && basisId.length > 0 ? basisId : null;
        return scoped === null || scoped === attestation.basisId;
      };
      const attestedSpan = events.filter((event) => {
        if (event === attestation || !inScope(event)) {
          return false;
        }
        const ordinal = eventAdmissionOrdinalOf(event);
        return ordinal !== null && ordinal < attestationOrdinal;
      });
      const unplaceable = events.some(
        (event) =>
          event !== attestation &&
          inScope(event) &&
          eventAdmissionOrdinalOf(event) === null
      );
      if (unplaceable) {
        return Object.freeze({
          kind: "replay_attestation_verification_row" as const,
          attestationRef: attestation.attestationRef,
          verified: false,
          attestedChainDigest: attestation.chainDigest,
          derivedChainDigest: null,
          attestedEventCount: attestation.eventCount,
          derivedEventCount: null,
          failureReason: "unplaceable_events" as const
        });
      }
      const derived = deriveReplayChainDigest(attestedSpan);
      const failureReason =
        derived.eventCount !== attestation.eventCount
          ? ("event_count_mismatch" as const)
          : derived.chainDigest !== attestation.chainDigest
            ? ("chain_digest_mismatch" as const)
            : null;
      return Object.freeze({
        kind: "replay_attestation_verification_row" as const,
        attestationRef: attestation.attestationRef,
        verified: failureReason === null,
        attestedChainDigest: attestation.chainDigest,
        derivedChainDigest: derived.chainDigest,
        attestedEventCount: attestation.eventCount,
        derivedEventCount: derived.eventCount,
        failureReason
      });
    })
  );
}
