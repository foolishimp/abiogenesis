# T-270 Ingress-Order Design Acceptance

## Decision

Accept the bounded T-270 design amendment under delegated F_H authority at
exact final digest
`17e1e0a3fe35e26def51c49ea67d9f58d4316ca41bcc87266fcf058a541a4421`.
Runtime implementation may proceed only within this boundary.

## Accepted Boundary

Public preparation admits request, workspace, manifest, catalog, view, program,
AF-13 constraint, and any invoke root carrier. It returns no selected execution
binding, schema capability, final execution ingress, witness, or effect
authority. The admitted One Surface program owns AF-13 selection and AF-14
intent admission. Only the post-AF-14 finalizer may derive the unique ready
GraphFunction entry from the admitted view, use the existing exact catalog
binding resolver, call the total all-or-nothing M04 schema projector, and seal
final execution ingress.

The M04 relation key is the complete
`symbolicSchemaRef + contractId + contractVersion` tuple. Only identical full
keys may reuse one exact source-definition relation. Divergent symbolic refs
require distinct exact relations even when their contract coordinates are
equal.

## Review And Scope

Independent review found no residual defect after the two bounded P1 repairs:
the phantom per-row projector was removed in favor of the realized total
`projectM04RuntimeSchemaAdmission` boundary, and repeated-key law was corrected
through the design, IACS, proof matrix, and ticket. The final digest differs
from the reviewed candidate only by replacing pending-review status text with
this accepted runtime authorization.

This decision adds no public operation, semantic authority, selector, registry,
store, or motivating-feature path. `start(asset)` remains a typed existing gap
until its published ownership projection exists. Runtime closure still requires
focused negative proof, full gates, self-review, and independent implementation
review.
