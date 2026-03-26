# builds/claude_code — Design

Claude Code build — V2 design surface.

## ADRs

V1 ADRs (001–029) retired. Governing truth now lives in:

- `specification/GTL_2_CONSTITUTIONAL_DESIGN.md` — language + engine boundary
- `specification/requirements/` — 4-layer requirement surface (gtl/abg/mapping/product)

### Surviving V1 ADR

| ADR | Decision | Why it survives |
|-----|----------|----------------|
| ADR-022 | Subprocess transport with env sanitization | Implementation decision, engine-agnostic |
| ADR-030 | Semantic Job/Role in GTL, ExecutableJob/Binding in ABG | Build-specific implementation of the V2 work-model correction |

New ADRs will be numbered from ADR-031 and implement REQ-L-GTL2-* / REQ-R-ABG2-* keys.

## Traceability

V1 trace matrices retired. New traceability derives from the 2.0 requirement surface.
Live requirement headers carry `Status` and `Category` metadata per `specification/SPEC_METHOD.md`.
