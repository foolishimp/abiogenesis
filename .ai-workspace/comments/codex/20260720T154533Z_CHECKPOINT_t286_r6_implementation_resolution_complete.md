# T-286 R6 Implementation Resolution Complete

## Result

`ABI5-ROOT-001` obligation `R6 exact GraphFunction and contracts resolved` is
satisfied by implementation commit
`2cf9201577af000f034431cda415aafaf234a63b` while preserving R1-R5.

The GTL Module declares one F_D ImplementationBinding. Product resolves that
binding against one exact descriptor carried inside the packed Product. The
validator independently checks the selected catalog row, ProgramValidation,
GraphFunction, node, binding, package locator, implementation identity, and
input, output, failure, and refusal contracts.

## Boundary Evidence

| Identity | Value |
|---|---|
| packed artifact SHA-256 | `sha256:9389f80837c8067e35b49a153d5a8b2a3ca0a9615f7a5efde4b7e97afa085d13` |
| GraphFunction digest | `sha256:5d0fae3024f84f619dc790243eb8ea31120a3ea0b575cfe515170fbf518d3640` |
| node | `node://abiogenesis/conformance/hello-world/fd-leaf@5` |
| ImplementationBinding | `implementation-binding://abiogenesis/conformance/hello-world-fd@5` |
| implementation | `implementation://abiogenesis/conformance/hello-world-fd@5` |
| implementation descriptor digest | `sha256:f76ce598cb23b0685647369d41b130b51749d3323fd6116a1461c47e15e0ff7c` |
| package | `@abiogenesis/typescript-tenant@5.0.0-dev.286` |
| implementation-resolution validation | `implementation-resolution-validation://abiogenesis/9b15501b8aa799c4564d2cc07a17ffe12224cb805a3fcf6d9934e21ae34428c1` |

The packaged implementation subpath is not exported. Neither the Product root
nor Product subpath exports the leaf callable. Resolution emits no event and
does not invoke the implementation.

## Negative Proof

- an unknown graph node refuses with `implementation_absent`;
- a changed CatalogView refuses with `selection_mismatch`;
- a changed binding invalidates the exact ProgramValidation basis;
- a cloned resolution candidate fails package-authenticity validation; and
- a changed implementation descriptor fails exact static validation.

## Verification

```text
npm run test:r6
npm audit --omit=dev --audit-level=high
```

R1-R6 pass from the packed and installed Product. The event store remains
unchanged during R6. The root remains red at `R7 materialized GTL graph
validated`.
