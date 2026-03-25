# REQ-L-GTL2-ENGINE-INDEPENDENCE — Engine Independence

**Status**: Active
**Date**: 2026-03-25
**Derives from**: INT-GTL2-009, INT-GTL2-011, INT-GTL2-012, INT-GTL2-013
**Supersedes**: (new constraint)
**Wave**: 1

---

## Purpose

GTL 2.x is defined independently of any single engine. The language owns structure; engines own execution.

## Acceptance Criteria

**REQ-L-GTL2-ENGINE-INDEPENDENCE-001**: GTL shall be defined independently of ABG or any single engine implementation.

**REQ-L-GTL2-ENGINE-INDEPENDENCE-002**: GTL shall remain an embedded Python DSL/SDK (INT-GTL2-002). It shall not depend on a new standalone parser or syntax.

**REQ-L-GTL2-ENGINE-INDEPENDENCE-003**: It shall be possible to interpret or map GTL programs onto ABG, Temporal, Prefect, Step Functions, or other runtimes — with full, partial, or capability-profile mappings.

**REQ-L-GTL2-ENGINE-INDEPENDENCE-004**: GTL owns: graph structure, typed nodes, interfaces, operators, evaluators, rules, graph functions, jobs, roles, composition, substitution, module structure. ABG owns: workers, bindings, runs, events, projection, convergence, lineage, correction, provenance, replay, and external identity/authority integration hooks.
