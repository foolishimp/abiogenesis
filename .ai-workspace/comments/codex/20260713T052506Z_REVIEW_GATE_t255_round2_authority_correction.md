# T-255 Round-Two Authority Correction Review

## Verdict

`candidate_repaired_round_2_pending_explicit_fh`. The four reported findings
are accepted. The correction changes design and proof authority only. The
uncommitted T-255 prototype remains unadmitted and is not part of this review.

## Corrected Findings

### P1 - T-267 is a hard startup dependency

T-255 may publish an exact compiled GraphVector handoff. It may not make that
handoff runtime-addressable. Every published handoff reaches a typed startup
fence and stops before traversal, worker/plugin invocation, archive writes,
successful assessment, or closure truth until T-267 supplies the admitted
result-interface and bind-conservation authority needed for a closeable
`TraversalUnit`.

This makes `REQ-L-GTL3-C-ALGEBRA-016` explicit in the domain, sequence, state,
axiom, proof, non-closure, and lifecycle views. Existing stage support is not a
lawful bypass.

### P1 - The tenant-conformance manifest remains the only authority

The raw canonical input is
`abg.schema.tenant-conformance-manifest`. M04 admits it against the existing
public contract catalog and produces one shared
`AdmittedTenantConformanceManifest`. M03 derives a
`TenantCapabilityCoverageProjection` that preserves the admitted manifest and
catalog identity/version/digest basis. The projection is a read model; it cannot
be submitted or admitted independently.

T-268 is repriced in place to publish ABG 5.0 tenant-conformance-manifest
coverage including Consensus. It no longer proposes a Consensus-owned tenant
profile.

### P1 - M04 admission precedes M03

The sequence now begins with M04 admission or explicit absence. A refused raw
manifest terminates product intake before any M03 call. The caller passes only
the admitted carrier or absence to T-254/M03. M03 never calls or imports M04
application code.

### P1 - T-252 authority reference is repaired at the generator

The T-252 manifest generator now cites the completed T-252 ticket path. The
sealed fixture is regenerated from that source and must pass the focused,
semantic, manifest, and diff gates before this review is presented.

## Ownership

- T-264 projects exact effect requirements.
- T-268 publishes canonical ABG 5.0 manifest coverage including Consensus.
- M04 admits the canonical manifest against the installed public catalog.
- T-255 derives capability coverage and decides compatibility.
- T-267 admits traversal result-interface and bind-conservation authority and
  owns re-entry from startup block to runtime addressability.

## Proportional Limits

- no GTL atom or base-algebra change;
- no Consensus-specific runtime or manifest;
- no second manifest, profile, catalog, or admission authority;
- no implementation or prototype admission;
- no new ticket; and
- no T-267 implementation pulled into T-255.

## Verification

Pending clean detached regeneration and gates.

## F_H Gate

Do not infer acceptance from continuation. After clean proof, explicit F_H must
accept or reprice the corrected T-255 design before implementation changes are
admitted.
