# T-263 Strict Raw Module Admission Design Review

**Timestamp**: 2026-07-13T02:45:12Z
**Ticket**: T-263
**Disposition**: candidate three-view design complete; F_H review required

## Result

The current defect is confirmed. `admitModule(unknown)` and several nested
M01/M02 admitters read known fields without rejecting unknown siblings. T-252's
root mutation is one instance of a recursive serialized-validity gap.

Duplicate JSON property detection cannot be repaired at the parsed-object
boundary because JavaScript objects no longer retain duplicate names. The
design therefore reuses the existing duplicate-preserving `admitIJsonText`
parser for text ingress and keeps `admitModule` as recursively closed object
admission. No second parser or JSON AST is introduced.

## Design Decisions

1. Existing `Module` remains the sole prime admitted carrier.
2. Exact-key profiles are subordinate M01/M02 constants, not schemas or public
   carriers.
3. Canonical serializers remain emitted-shape authority; deterministic parity
   tests prevent profile drift.
4. Exact-key closure does not change required, optional, nullable, or defaulted
   field law.
5. Existing admitters and constructors retain type, identity, duplicate
   authority, and local relation judgments.
6. Existing `TypeError` admission semantics remain proportionate. The design
   does not create one diagnostic result family per carrier.
7. M03 retains whole-program reachability, completeness, and realization law.

## F_H Review Points

The design asks F_H to ratify three bounded choices:

- strict Module admission is recursive across the complete serialized carrier
  tree, not root-only;
- duplicate-property proof is available only through the text ingress, while
  object ingress states no impossible duplicate claim; and
- stable path-bearing `TypeError` refusal is sufficient for this DS-1 slice,
  with no new diagnostic carrier family.

## Proof Boundary

Implementation must keep the T-252 body digest unchanged, convert only the
unknown-field mutation to refusal, cover a maximal non-Consensus Module, and
prove no runtime/effect dependency. Post-admission digest comparison alone is
explicit non-closure.

The candidate design's three Mermaid views render successfully with the pinned
renderer:

```text
fileCount: 1
diagramCount: 3
rendererVersion: 11.3.0
sourceSetDigest: sha256:6008fe7cf55773fa5197ba72b15e8420c06c4e5c4103be9ec1ab22ea46fd7ba4
```

No implementation file was changed under T-263.
