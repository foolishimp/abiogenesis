# Project Requirements

This directory already contains the live abiogenesis requirement surface.

The active requirement families are grouped by constitutional domain:

- `gtl/` — GTL 3 language and graph law
- `abg/` — Abiogenesis engine/runtime law
- `mapping/` — GTL-to-runtime mapping and provenance law
- `product/` — product policy, qualification, and scenario law

Use [SPEC_METHOD.md](../../.genesis/docs/standards/SPEC_METHOD.md) as the process constitution when writing or revising these files.

## Rules

- Keep live requirement families as separate `*.md` files under the appropriate domain folder.
- Use deterministic REQ headers inside each family file.
- Preserve the split between constitutional truth in `specification/` and realization detail in `build_tenants/`.
- Treat `build_tenants/abiogenesis/typescript/` as the primary release
  realization, `build_tenants/abiogenesis/python/` as a withdrawn released
  reference line, and `build_tenants/abiogenesis/codex/` as a paused partial
  alternate realization unless explicitly repriced.

## Release Applicability

ABIogenesis 5.0 selects `A5-F01` through `A5-F11` and `A5-F13` through
`A5-F17`. It selects pre-RC scenarios `ABG5-S01`, `ABG5-S02`, `ABG5-S03`,
`ABG5-S05`, and `ABG5-S06`; `ABG5-S07` owns release.

`A5-F12` and `ABG5-S04` are planned ABIogenesis 5.1 identities. Their frozen
design and requirement text are preserved as non-operative future input. They
are not applicable 5.0 realization, self-conformance, qualification, release,
public-contract, or no-silence obligations.

The exact deferred relation set is:

- `REQ-P-SCENARIOS-011` and `REQ-P-QUAL-060A`;
- `REQ-P-POLICY-036`, `REQ-P-POLICY-037`, and only the observer/tuning
  variants named by `REQ-P-POLICY-021`, `REQ-P-POLICY-041`, and
  `REQ-P-POLICY-042`;
- the `abg.contract.abg.executive`, observer/tuning `project.read`, and
  `abg.operation.tuning.transition` rows formerly selected by
  `REQ-P-PUBLIC-CONTRACTS-005` and `REQ-P-PUBLIC-CONTRACTS-008`;
- `REQ-R-ABG3-TUNER-001` through `REQ-R-ABG3-TUNER-014`;
- `REQ-R-ABG3-FPC-018`, `REQ-R-ABG3-FPC-019`,
  `REQ-R-ABG3-FN-COMP-025`, `REQ-R-ABG3-PAYLOAD-027`,
  `REQ-R-ABG3-ITERATION-019`, and `REQ-R-ABG3-CONTINUATION-010`;
- only the executive observer/tuning variants in
  `REQ-R-ABG3-PROJECTION-023`, `REQ-R-ABG3-WITNESS-009`, and the tuner row of
  the runtime event-kind census; and
- `REQ-L-GTL3-CONTEXT-007`, `REQ-L-GTL3-ASSET-SURFACE-012`,
  `REQ-L-GTL3-GRAPHFUNCTION-020`, and `REQ-L-GTL3-HOOKS-019`.

Runtime liveness observation, ordinary replay/projection, One Surface
evaluation, yielded handoff, retry, convergence, generic `evaluate.C`, and
5.0 self-conformance remain applicable. The word `observer` alone does not
defer a requirement.

## Active Requirement Domains

| Domain | Path | Scope |
| --- | --- | --- |
| GTL | `specification/requirements/gtl/` | language semantics, graph law, jobs, roles, operators, identity, epistemic notation over ratified ontology |
| ABG | `specification/requirements/abg/` | engine transport, binding, run model, projection, provenance, convergence |
| Mapping | `specification/requirements/mapping/` | bridge law between GTL constitutional surfaces and runtime realization |
| Product | `specification/requirements/product/` | policy, qualification, and end-to-end scenario obligations |
