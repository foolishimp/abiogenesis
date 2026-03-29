# REQ-R-ABG2-JOB-WORKER — Superseded by Explicit Job / Role / Worker / Run Split

**Status**: Superseded
**Category**: Capability
**Date**: 2026-03-25
**Derives from**: INT-GTL2-008
**Superseded by**: REQ-L-GTL2-JOB, REQ-L-GTL2-ROLE, REQ-R-ABG2-WORKER, REQ-R-ABG2-BINDING, REQ-R-ABG2-RUN
**Wave**: 1

---

## Disposition

This requirement compressed semantic `Job`, semantic `Role`, concrete `Worker`, and execution `Run` into a single runtime family.

That formulation is no longer authoritative.

Use the split requirement family instead:

- GTL semantic job contract: `REQ-L-GTL2-JOB`
- GTL semantic role: `REQ-L-GTL2-ROLE`
- ABG concrete worker identity: `REQ-R-ABG2-WORKER`
- ABG worker/role/job realization: `REQ-R-ABG2-BINDING`
- ABG execution-instance lifecycle: `REQ-R-ABG2-RUN`
