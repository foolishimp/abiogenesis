# T-264 Proportional Conformance Design Review

**Timestamp**: 2026-07-13T02:53:17Z
**Ticket**: T-264
**Disposition**: structural design complete; one F_H authority ruling blocks implementation

## Result

The current conformance checker conflates two claims:

```text
bounded submitted-structure probe
declared complete product program
```

It requires caller-authored expected counts, nonzero optional inventories, and
a 26-row T-153 manifest even for the first claim. T-252 consequently receives
unrelated scope noise beside its real per-vector C, traversal, HOF, recursion,
and runtime gaps.

The design introduces an explicit closed scope discriminant and derives feature
presence and embedded declaration inventory from admitted structure. Complete
program claims retain exact expected-coverage and feature-manifest checks.

## Preserved Real Gaps

The 734 current issue rows are not treated as a target count and are not all
noise. The design retains:

- C-algebra `semantic_not_realized` rows;
- target-carrier, edge-closure, execution-basis, and conservation rows;
- HOF, application, recursion, admission, and runtime gaps; and
- malformed or incomplete inventory that is structurally applicable.

It removes only universal feature/nonzero requirements that do not follow from
the submitted root.

## Authority Finding

The ticket currently says T-264 proves effect-to-capability compatibility. That
cannot be derived from the current input:

- `GraphFunction.effects` provides effect requirement refs;
- the T-252 Module provides no exact tenant capability profile;
- `EnginePluginContract` provides plugin contract identity, not the versioned
  capability identity set required by `REQ-M-GTL3-CAPABILITY`; and
- no admitted mapping/profile carrier exists in `GtlProgramConformanceInput`.

Inferring compatibility from names, URI prefixes, package version, plugin refs,
or tests would fabricate authority.

## Recommended Ruling

Narrow T-264 to:

```text
explicit proportional scope
structure-derived applicability
exact effect/plugin/handler/Job/Role inventory
transitive and matchable effect requirement projection
```

Route actual effect-to-capability compatibility to the first boundary that
admits the exact tenant capability profile, likely T-255 execution-basis work or
DS-4 installed-product conformance. Do not reopen T-252 or add a local
effect/capability declaration.

## Self-Review Repairs

Before checkpoint, the design review corrected:

1. nonstandard axiom verdict labels to the required `pass`, `fail`, and
   `not_applicable` vocabulary; and
2. a negative proof that implied capability refs were recognizable by string
   shape. The repaired proof defers compatibility until the profile exists.

## Render Proof

The candidate's three Mermaid views render with the pinned renderer:

```text
fileCount: 1
diagramCount: 3
rendererVersion: 11.3.0
sourceSetDigest: sha256:5b4c7e12b62e0609000c807e89bd7813d54190c7ca12f30d4163b1cff2fa6494
```

No T-264 implementation file was changed. T-255 remains blocked behind T-264.
