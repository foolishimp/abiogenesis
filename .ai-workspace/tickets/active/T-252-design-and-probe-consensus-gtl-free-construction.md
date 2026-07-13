# T-252 - Design And Probe Consensus GTL Free Construction

- id: T-252
- status: active
- phase_status: body_implemented_probe_correction_ready_for_review
- review_status: pending_explicit_fh_acceptance
- implementation_admission: body_landed_probe_corrected_without_runtime_realization
- proof_status: fresh_clean_gates_green_pending_explicit_fh
- delivery_phase: DS-1
- change_class: design_reframe
- owner: abiogenesis
- priority: critical
- correction_ref: .ai-workspace/comments/codex/20260713T041830Z_REVIEW_GATE_t252_t263_t264_authority_correction.md
- proof_ref: .ai-workspace/comments/codex/20260713T043615Z_PROOF_t252_t263_t264_clean_correction_gates.md
- design_ref: build_tenants/abiogenesis/typescript/design/M01_M03_CONSENSUS_GTL_FREE_CONSTRUCTION_BEHAVIOR_DESIGN.md

## Boundary

T-252 owns one result: a canonical Consensus GTL body built only from public
GTL atoms, plus an independently derived first compiler-gap census. It does not
realize a reported gap, introduce a Consensus runtime, or infer catalog-owner,
capability, execution, event, replay, or closure truth.

## Current State

The canonical body is implemented at
`build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/consensus_gtl_body.ts`.
Its serialized body digest is
`sha256:e4555c21cdb4292b64f7f4d5a625c2a520195aa8d6e9c759498eed4bf28d0ea0`.
The body is pure GTL data and its static source-import closure reaches none of
the fenced runner, transport, events, app, qualification, or bin implementation
directories. Pure contract modules remain visible in that closure.

The prior checkpoint was not lawfully closed. Commit `ebe0eea` inferred F_H
acceptance from a generic instruction to continue. That inference is void. Its
body and design work remain reviewable evidence; its closure claims do not.

The corrected probe now:

1. derives gap observations from focused compiler outcomes, full-conformance
   issues, and explicit structural predicates before reading ticket ownership;
2. joins the independently observed families to singular active owners;
3. reports active owned families no longer observed as closure candidates
   rather than fabricating them back into the census; and
4. limits the no-execution statement to static source reachability. It records
   that runtime calls were not observed rather than emitting literal zero call
   counts.

## Authority Split

- T-252 publishes the pure-data construction and observed compiler frontier.
- T-263 owns strict raw Module admission.
- T-264 projects exact effect requirements and proportional structural
  conformance inventory.
- T-255 admits an exact capability profile and performs compatibility
  admission.
- DS-4 supplies the published tenant capability profile used by T-255.
- ABG runtime owners retain traversal, effects, events, replay, and closure.

## Review Gate

Explicit F_H review must decide whether:

1. the landed three-view design and canonical body are accepted;
2. the corrected observation-first census is an honest exact checkpoint;
3. the static reachability claim is proportionate; and
4. T-263 and T-264 may close on their separately presented implementations.

No later realization ticket may cite T-252 closure until this decision is
recorded explicitly.

## Exit

- body digest remains unchanged;
- canonical serialization round-trips through strict M02 admission;
- structural invalidity count is zero;
- every observed gap has compiler or structural observation evidence before
  ownership is joined;
- every observed gap has exactly one active successor owner;
- active implemented families may appear as not observed pending review;
- static source reachability is reported without runtime-call claims;
- focused GTL, body, manifest, strict TypeScript, and diff gates pass; and
- explicit F_H acceptance is recorded.

## Non-Closure

Hard-coded successor expectations presented as compiler output, ticket status
shaping the observed census, literal zero call counts without instrumentation,
declaration counts presented as execution evidence, a local Consensus runtime,
or inferred F_H acceptance.
