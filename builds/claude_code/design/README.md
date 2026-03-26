# builds/claude_code — Design

Claude Code build — shipping design surface.

## ADRs

Current governing truth lives in:

- `specification/GTL_2_CONSTITUTIONAL_DESIGN.md` — language + engine boundary
- `specification/requirements/` — 4-layer requirement surface (gtl/abg/mapping/product)

### Current ADRs

| ADR | Decision | Why it exists |
|-----|----------|----------------|
| ADR-022 | Subprocess transport with env sanitization | Shipping transport surface for F_P dispatch |
| ADR-023 | Graph and vector identity via opaque ids | Operational identity is distinct from labels |
| ADR-024 | Markov as a first-class node field | Node-owned declared conditions remain in the GTL surface |
| ADR-030 | Semantic Job/Role in GTL, ExecutableJob/Binding in ABG | Shipping work-model split for the Claude build |

New ADRs will be numbered from ADR-031 and implement REQ-L-GTL2-* / REQ-R-ABG2-* keys.

## Traceability

Traceability derives from the active 2.x requirement surface.
Live requirement headers carry `Status` and `Category` metadata per `specification/SPEC_METHOD.md`.
The shipping verification harness is downstream of this design surface in `builds/claude_code/test_env/`.
