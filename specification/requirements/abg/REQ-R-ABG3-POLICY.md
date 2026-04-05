# REQ-R-ABG3-POLICY — Hook Resolution And Default Bundles

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [/Users/jim/src/apps/genesis_sdlc/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/genesis_sdlc/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ABG_3_CONSTITUTIONAL_DESIGN.md](../../ABG_3_CONSTITUTIONAL_DESIGN.md)

---

## Purpose

Define the ABG side of hook resolution, runtime admissibility, and configured
default bundles.

## Acceptance Criteria

**REQ-R-ABG3-POLICY-001**: GTL shall declare hook attachment points, stable hook references, and opaque configuration. ABG shall resolve executable hook behavior from those declarations.

**REQ-R-ABG3-POLICY-002**: ABG shall govern admissible regimes, fallback law, proof, closure, and observability boundaries. It shall not define or own internal strategy for probabilistic workers.

**REQ-R-ABG3-POLICY-003**: ABG shall ship broad reference default bundles as ordinary configuration plus executable hook implementations, not hidden hardcoded law tables.

**REQ-R-ABG3-POLICY-004**: Domain users shall be able to copy, edit, and reference default bundles from their own GTL/ABG surfaces.

**REQ-R-ABG3-POLICY-005**: ABG shall fail closed on unresolved hook references, malformed config, or illegal resolved policy bundles.
