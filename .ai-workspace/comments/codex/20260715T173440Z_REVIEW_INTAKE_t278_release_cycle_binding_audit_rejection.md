# Review Intake - T-278 Release Cycle, Binding Cardinality, And Audit Rejection

**Received at**: 2026-07-15 17:34:40Z

**Received by**: Codex pen-holder `/root`

**Source transport**: F_H relay

**Claimed reviewer class**: independent

**Reviewer identity**: not supplied

**Review source ref**: unavailable

**Audit status**: unattributed external-review relay; valid finding intake but
not auditable independent acceptance

## Reviewed Subject

The relayed review applied to the following pre-repair candidate state:

| Subject | SHA-256 |
|---|---|
| `build_tenants/abiogenesis/typescript/design/ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md` | `54bde2dda20d33557abcb4288b63cf6c279c229ba24cdf4cb5bd5cfd370f48e9` |
| `specification/GOALS.md` | `6b4c98f75c44774b73439ef6b4ab7dd9712e6b4914d6beeb81c9eb5b95f1b21c` |
| `.ai-workspace/tickets/active/T-278-derive-public-control-plane-ontology-and-reprice-operation-surface.md` | `555227afb89d21461d10cb133450297d5778fa6d7c9dc8ec13269316679fa285` |
| `.ai-workspace/comments/codex/20260715T165410Z_REVIEW_t278_bounded_one_surface_rereview.md` | `49d3d25aa42a0e73ff9780feaa1725182dd2e31821f953040ab11ed87f167597` |

## Findings

### P1 - Release qualification is cyclic

GOALS placed `release.snapshot` before T-247 qualification, while Ontology
AF-25 consumed an already-qualified candidate to create the `ReleaseCut` and
snapshot. T-247 then required the snapshot to cite qualification evidence and
T-248 required T-247 to be complete. The design needs a distinct
pre-qualification candidate subject or an explicit existing-carrier
composition. The repair can change the Prime and operation censuses, so the
27-atom and 19-operation claims remain held until it is applied and reviewed.

### P1 - Workspace-binding cardinality is contradictory

The aggregate model allowed `PublicInvocation -> 0..1 WorkspaceBinding`, while
invariant 3 required exactly one binding for every invocation. That is
impossible for pre-binding workspace creation/opening and product operations.
Binding cardinality and the basis taxonomy must be indexed by the exact public
function and variant, with workspace/execution-scoped invocations requiring a
binding and pre-binding variants forbidding one.

### P2 - Independent-review status is not auditable

The only persisted re-review was written by the Codex pen-holder and omitted
reviewer identity, independence basis, and reviewer-authored evidence. It
cannot substantiate the ticket's claim that independent re-reviews accepted
the candidate. The finding remains true even if the technical assessment was
sound.

## Ruling Carried By The Relay

| Claim | Disposition |
|---|---|
| GTL composition is the program; GraphFunction is callable | Accept |
| Four distinct One Surface authorities | Accept in substance |
| 27 atoms and seven compositions | Reject pending release-lifecycle repair |
| 19 public operations | Hold pending the candidate-qualification decision |

The linked T-278 target is rejected pending the bounded release-lifecycle and
workspace-binding repairs plus a reviewer-authored independent re-review over
the exact repaired subject. Runtime work remains frozen. This intake creates no
constitutional or design authority and does not itself satisfy that review
gate.
