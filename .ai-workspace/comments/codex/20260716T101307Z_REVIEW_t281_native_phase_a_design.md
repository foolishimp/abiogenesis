# T-281 Native Phase A Design Review

- review seat: independent Codex subagent `/root/t281_native_design_review`
- rejected precursor digest: `ba6bef8f3505590534c92a63ca79d1f813b7a5487ce8dfe970ad17fe009022ed`
- accepted semantic candidate digest: `0d099c7bf949b421ec3dfcf656a5aebcdb8bfe82d1d6b251e57787c417f8ee11`
- verdict: accept Phase A only

## Findings

No blocking finding remains.

The repaired design resolves the four implementation-readiness defects:

1. one closed seven-action Valibot projector mapping replaces the contradictory
   no-transform/brand rule; every unlisted action or override throws;
2. defaults are exactly `none | literal`; no speculative named derivation is
   implemented;
3. catalog coordinates, eight authority slots, grant coordinates,
   `InvocationAuthority<K>`, `PublicInvocation<K>`, and `PublicOutcome<K>` are
   exact and digest-bound; and
4. domain, sequence, and state views name the actual admission, projection,
   build-gate, fixture-owner, semantic-owner, and AF-24 boundaries. Public
   ingress admits and transports but never constructs outcome truth.

`CapabilityGrantCoordinate` realizes the accepted Ontology `CapabilityGrant`;
it is not a new authority. Phase A proves only its native schema and digest
relation. T-270 still owns the per-instance approval-attribution/event gap.

The result is proportional: one pinned projector, seven closed mappings, no
extension registry, no general schema language, and no hostile-workstation
machinery.

## Verification

- Mermaid: 3/3
- Prime candidate gate: passed
- Pandoc: passed
- target diff check: passed
- digest stable before and after independent review

Acceptance authorizes the private schema-only Phase A mechanism. It does not
authorize the private 19-operation P1 family or the public P2 cutover.
