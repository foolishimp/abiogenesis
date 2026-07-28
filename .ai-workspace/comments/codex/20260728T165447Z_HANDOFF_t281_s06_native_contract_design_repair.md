# Handoff: T-281 S06 Native Contract Design Repair

## Disposition

Review only the three repaired semantic relations and their affected
projections. Do not reopen the accepted Prime/IACS contraction, conduct
another whole-design review, inspect the provisional implementation worktree,
or resume realization.

| Coordinate | Exact value |
|---|---|
| replacement candidate | `4f80f84a826de86b4cfb4d9fec3baff428dcb44a` |
| tree | `7070dca7d0f2ca90374b525faa60d5b810488763` |
| parent evidence head | `80eb7307f4de143e11da6c48105852fb02523acb` |
| returned design candidate | `b645595c16d23e98c7f65b958fcdf3e206ad3893` |
| design | `build_tenants/abiogenesis/typescript/design/M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md` |
| design SHA-256 | `ab44417157853490f4a3d8f9055b5eca8c295fd16f9615020b70e327f57c09fe` |
| owner | T-281 under T-270 |
| realization | held |

## Why This Delta Exists

Independent review accepted the proportional re-entry, complete function,
Prime contraction, IACS placement, and overall design structure in
`b645595c`. It returned three unresolved choices that could still produce
different implementations:

1. publisher proposal versus local verification versus linked resolution;
2. exact contract-to-symbol ownership; and
3. cross-Product module/global augmentation inside one linked TypeScript
   Program.

This candidate repairs those choices together. It adds no operation, catalog,
service, registry, runtime, event family, Prime carrier, or implementation.

## Repaired Relations

### 1. Proposal And Admission

The authority order is now:

```text
publisher proposes immutable locator inventory and namedSymbol
  -> product.verify independently recomputes and admits local truth
  -> externally dependent namedSymbol remains explicit private pending evidence
  -> product.resolve alone admits linked cross-Product symbol truth
  -> resolved lock binds exact admitted bindings and symbol admissions
```

Publisher compiler output, receipts, generated rosters, and analyzer state
cannot satisfy verification or resolution. The public locator contains no
complete module export roster.

### 2. Contract-To-Symbol Ownership

One native contract authorizes only its exact `namedSymbol` at one exact
package export.

- `name(s)` requires one directly required contract with `namedSymbol = s`.
- `namespace` and `all` are expanded by the exact bundled checker.
- Every crossing symbol requires exactly one directly required contract.
- Missing coverage is unresolved; duplicate coverage is ambiguous.
- Extra module exports carry no cross-Product authority.

### 3. Augmentation Confinement

`product.resolve` rejects:

- Product-owned augmentation of another Product or platform module;
- Product-owned global contributions in a multi-Product closure;
- external side-effect-only declaration imports; and
- post-check module/global symbols containing declarations from multiple
  Product content identities.

Self/local module augmentation remains lawful only when its base,
augmentation, and complete declaration closure belong to and are digested by
one Product.

## Affected Projections

Only the following existing design projections changed:

- global decisions and complete F01/F02 meaning;
- failure partition;
- Ontology proposal/evidence/binding classifications;
- cardinality, lifecycle, and authority rows;
- function derivation and whole-family contraction evidence;
- IACS subordinate payload descriptions and module interfaces;
- domain, sequence, and lifecycle views;
- cross-view axioms;
- compiler constructability checks;
- module-owned mutations; and
- Section 8 schema/realization mapping.

The operation identities, variants, and dispatch semantics remain unchanged.
The native locator, public-contract catalog, resolved-lock payload, and their
serialized schemas are explicitly identified as changing projections.

## Mechanical Evidence

| Gate | Result |
|---|---|
| GFM/Pandoc parse | `7/7` |
| Mermaid render | `3/3` |
| `git diff --cached --check` | pass |
| replacement candidate path boundary | exactly seven design/status files |
| implementation/runtime tests | not run; design-only candidate |

Fourteen pre-existing modified implementation/design/test paths remain
unstaged and outside the candidate. The eight pre-existing untracked
review/strategy posts remain untouched.

## Bounded Review Questions

1. Are publisher proposal, local verification, linked resolution, and lock
   admission now acyclic and singular?
2. Does one contract authorize only its `namedSymbol`, with exact per-symbol
   coverage for namespace/star relations?
3. Do the preflight and post-check rules prevent unrelated Products from
   changing module or global meaning?
4. Do the affected Ontology, views, axioms, schema projection, and proof rows
   preserve those three decisions without reopening Prime/IACS?

The worker issues no semantic verdict. Direct F_H acceptance may follow one
independent delta review. Retained implementation remains stopped until then.
