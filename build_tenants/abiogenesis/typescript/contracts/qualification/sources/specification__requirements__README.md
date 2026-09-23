# Project Requirements

This directory already contains the live abiogenesis requirement surface.

The active requirement families are grouped by constitutional domain:

- `gtl/` — GTL 3 language and graph law
- `abg/` — Abiogenesis engine/runtime law
- `mapping/` — GTL-to-runtime mapping and provenance law
- `product/` — product policy, qualification, and scenario law

Use [SPEC_METHOD.md](stdo://releases/v2.5.0-rc.6/standards/SPEC_METHOD.md) as the process constitution when writing or revising these files.

## Rules

- Keep live requirement families as separate `*.md` files under the appropriate domain folder.
- Use deterministic REQ headers inside each family file.
- Preserve the split between constitutional truth in `specification/` and realization detail in `build_tenants/`.
- Treat `build_tenants/abiogenesis/typescript/` as the primary release
  realization, `build_tenants/abiogenesis/python/` as a withdrawn released
  reference line, and `build_tenants/abiogenesis/codex/` as a paused partial
  alternate realization unless explicitly repriced.

## Release Applicability

The sole release allocation is [Product Release Boundaries](../PRODUCT.md#50-and-51-release-boundaries).
Every family below inherits that allocation, including mixed clauses that
describe both retained traversal and deferred response or supervision.

ABIogenesis 5.0 selects `A5-F01` through `A5-F07`, `A5-F09` through `A5-F11`, and `A5-F13` through
`A5-F17`. It selects pre-RC scenarios `ABG5-S01`, `ABG5-S02`, `ABG5-S03`,
and `ABG5-S06`; `ABG5-S07` owns release.

`A5-F08`/`ABG5-S05` and `A5-F12`/`ABG5-S04` are planned ABIogenesis 5.1 identities. Their frozen
design and requirement text are preserved as future input. Their dedicated
release-completeness obligations are not mandatory 5.0 realization,
self-conformance, qualification, release, public-contract or no-silence gates.
An optional published claim still obeys its current declared contract and
generic Product law.

The exact deferred relation set is:

- dedicated `REQ-P-CONSENSUS` qualification, `REQ-P-SCENARIOS-012`,
  `REQ-P-QUAL-061` and `REQ-P-QUAL-066`, host parity in
  `REQ-P-SCENARIOS-013`/`REQ-P-QUAL-063`, and their former mandatory
  Consensus/host portions in `REQ-P-QUAL-064/067`;
- mandatory Consensus capability publication in `REQ-P-PUBLIC-CONTRACTS-011`;
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

### Human Response And Whole-Run Oversight

The native human-response portions of F03/F06/F07/F10 are reserved for 5.1.
`abg.operation.interaction.respond` and its five variants are outside the
required 5.0 public operation family. Only response-driven human resumption
and human-proxy interaction portions of `run.continue` are deferred; automatic
current-intent continuation and new-action admission remain 5.0 obligations.

This scoped exclusion applies to POLICY-012 and POLICY-031/032, the human
response portions of POLICY-014/016/021/033, CONTINUATION-011, and every
response/resume proof derived from them. In particular, SCENARIOS-007/009/010,
QUAL-059/064 and the forty-row conservation inventory use the Product's
retained-behavior versus deferred-portion distinction. F_H hold/block,
escalation reporting, reserved owner rulings and actual human RC acceptance
are not deferred. Shared schema, identity, authority and refusal requirements
still apply to every retained or actually claimed operation.

Whole-run semantic executive oversight and autonomous upstream/out-of-traversal
A.0 routing are 5.1 scope. Ordinary recursive GraphFunctions, declared local
graph-span re-entry, bounded retry/repair, parent foldback/re-evaluation and
basic runtime liveness remain 5.0. A requirement containing `recursive`,
`supervised`, `continuation` or `re-entry` is not wholly deferred by that word.
Existing frozen future designs/tests remain reusable input, not current 5.0
qualification demands or evidence of implemented 5.1 capability.

### Selected Lifecycle Witness And Testing

F17/S06 binds a prospectively selected meaningful real-specification contract
under Product Release Boundaries. Every selected outcome, its prerequisites,
consequential correction and admitted evidence remain mandatory. Original and
excluded source obligations remain visible; full original Data Mapper delivery
stays open downstream and is not an ABI release gate. Proof carry-through and
generic runtime requirements remain applicable to every selected obligation.

`REQ-P-QUAL-071` owns the derived evidence sequencing: focused structural checks
during construction, early installed integration/UAT at usable steel threads,
and broad applicable assurance at integrated qualification. A deferred scenario
cannot remove a retained generic graph, admission, authority or replay law.
Optional published capabilities still obey their declared contracts and cannot
claim unexecuted dedicated qualification.

## Active Requirement Domains

| Domain | Path | Scope |
| --- | --- | --- |
| GTL | `specification/requirements/gtl/` | language semantics, graph law, jobs, roles, operators, identity, epistemic notation over ratified ontology |
| ABG | `specification/requirements/abg/` | engine transport, binding, run model, projection, provenance, convergence |
| Mapping | `specification/requirements/mapping/` | bridge law between GTL constitutional surfaces and runtime realization |
| Product | `specification/requirements/product/` | policy, qualification, and end-to-end scenario obligations |
