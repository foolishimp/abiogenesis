# T-286 R5 Invocation Admission Complete

## Result

`ABI5-ROOT-001` obligation `R5 exact target Program selected and admitted` is
satisfied by implementation commit
`3d5ee71631379ccb45f72e61637b62d505cc42d6` while preserving R1-R4.

The installed path raw-admits one Hello World input, consumes the exact
non-lowering ProgramValidation, and selects the canonical Program and
GraphFunction from the admitted narrowed view. Product constructs explicit
policy, capability-grant, actor-authority, and direct-invocation candidates.
ABG rehashes and verifies the admitted workspace and view, then emits
`public_operation_admitted -> invocation_admitted`.

## Boundary Evidence

| Identity | Value |
|---|---|
| packed artifact SHA-256 | `sha256:6eee6b18db689e6b11fdb6f3f9a289ee8c85446296059e28ce3d2b9ba50e9307` |
| invocation | `invocation://abiogenesis/cad01573ff2dc7bd1d8abe0ad97fbf7d21d3725d595e21036930854f0e066aa8` |
| InvocationAdmission | `invocation-admission://abiogenesis/a2c891919b0da26517b361f1b5e6800a85d14e9e5d1ee18c88a642d590eefe51` |
| Program | `program://abiogenesis/conformance/hello-world@5` |
| GraphFunction | `graph-function://abiogenesis/conformance/hello-world@5` |
| input contract | `contract://abiogenesis/conformance/hello-input@5` |
| output contract | `contract://abiogenesis/conformance/hello-output@5` |
| actor | `actor://abiogenesis/t286/trusted-developer` |
| total admitted events | `7` |

The direct invocation has no `root_mode`, `until`, One Surface,
ConstructionIntent, graph, implementation selection, ExecutionBasis, traversal
cursor, or closure authority.

## Negative Proof

- an input whose value kind differs from the declared input contract refuses
  with `contract_mismatch`;
- missing or duplicate grants refuse with `capability_mismatch`;
- altered Program membership refuses with `selection_mismatch`;
- mutated workspace and catalog-view projections fail exact admitted-content
  verification;
- a cloned invocation candidate refuses with `invocation_not_constructed`; and
- every refusal leaves the event count unchanged.

## Verification

```text
npm run test:r5
npm audit --omit=dev --audit-level=high
```

R1-R5 pass from the packed and installed Product. The dependency audit reports
zero vulnerabilities. The root remains red at `R6 exact GraphFunction and
contracts resolved`.
