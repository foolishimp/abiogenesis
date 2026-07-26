# T-286 R4 Catalog Admission Complete

## Result

`ABI5-ROOT-001` obligation `R4 catalog admitted and narrowed` is satisfied by
implementation commit `abcdca7027983fd16a802ee6cd9cb2fbf0eee155` while
preserving R1-R3.

The installed Product publishes one exact GTL.TypeScript Hello World Module,
Program, GraphFunction, contract family, and F_D implementation binding. Raw
admission preserves the original declarations. The validator emits immutable
PublicationValidation and ProgramValidation judgments without lowering. The
Product constructs candidates only from exact lock-bound declarations, and
ABG alone admits catalog and view truth.

## Boundary Evidence

| Identity | Value |
|---|---|
| packed artifact SHA-256 | `sha256:fac5e2fa0face7e505ce998073535efeb2acc4b67baa950210fc0a5d6421fd88` |
| module | `module://abiogenesis/conformance/hello-world@5` |
| Program | `program://abiogenesis/conformance/hello-world@5` |
| GraphFunction | `graph-function://abiogenesis/conformance/hello-world@5` |
| admitted catalog digest | `sha256:b4d9d88114fa03b6038c093011b338afcf061cd72e41338e6663da94317b1d1d` |
| narrowed view digest | `sha256:9aac888eb037039066fbc98c45d99d17b79fc0175207b71387b29f35e6f049da` |
| admitted event kinds | `public_operation_artifact_admitted` x4, `registry_entry_admitted` x1 |
| admission ordinals | `1, 2, 3, 4, 5` |

The view contains exactly the selected GraphFunction row and its Program
membership. An empty allowlist produces an empty candidate view and never
activates an unrestricted fallback. Catalog admission invokes nothing.

## Negative Proof

- malformed Program membership refuses with `missing_membership`;
- malformed GraphFunction declarations produce typed static diagnostics rather
  than throwing;
- a publication outside the exact Product lock refuses with
  `publication_not_bound`;
- duplicate and unknown allowlist entries remain distinct typed refusals;
- cloned or changed candidates refuse with `candidate_not_constructed`;
- all negative cases leave the event count unchanged; and
- the event store snapshots and freezes admitted payloads and exposes no public
  append method.

No materialized Graph, target InvocationAdmission, implementation resolution,
ExecutionBasis, HoG traversal, C-call, closure, replay, or CLI result is claimed
by this checkpoint.

## Verification

```text
npm run test:r4
npm audit --omit=dev --audit-level=high
```

R1-R4 pass from the packed and installed Product. The dependency audit reports
zero vulnerabilities. The root remains red at `R5 exact target Program selected
and admitted`.
