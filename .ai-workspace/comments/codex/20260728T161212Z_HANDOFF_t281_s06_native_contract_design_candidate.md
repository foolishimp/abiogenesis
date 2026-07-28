# Handoff: T-281 S06 Native Contract Design Candidate

## Disposition

Review one exact design cut. Do not review or promote the provisional
implementation worktree, resume S06 realization, reopen S03/S05, or select
S04/M6/M7.

| Coordinate | Exact value |
|---|---|
| candidate | `b645595c16d23e98c7f65b958fcdf3e206ad3893` |
| tree | `130af56655ec46ec26ff66dd6a4f2bbe99d8bed8` |
| parent | `2f95184c2e1944291593232ac68acda822164fd9` |
| design | `build_tenants/abiogenesis/typescript/design/M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md` |
| design SHA-256 | `815369932469eb6c833417116c63d130b0e9629b9721a0f8d429e693e0e69507` |
| owner | T-281 under T-270 |
| change class | `design_reframe` |
| realization | held |

## Why This Is Reviewed

Returned implementation candidate `4f9bf707` exposed one unresolved semantic
relation: how immutable packed TypeScript declarations acquire exact native
contract meaning across Product dependencies.

Code had begun selecting:

- declaration roots;
- closure digest meaning;
- external package and symbol authority;
- compiler/toolchain basis;
- analyzer visibility; and
- lock identity.

Those are design decisions. Under Design Module Method they must be resolved
as one global-to-local constraint network before retained realization. The
candidate therefore replaces implementation-driven choice with one candidate
Ontology and design. It does not claim S06 implementation closure.

## What The Candidate Resolves

The complete function is:

```text
AnalyzeLocalNativeContracts
  ; LinkNativeContractSet
  ; ConstructResolvedProductLock
  ; InstallResolvedProduct
```

The candidate fixes these relations:

- exact packed `package.json.exports[*].types` entries select roots;
- the canonical reachable local declaration inventory owns native digest
  identity;
- `product.verify` establishes local meaning and records unresolved external
  occurrences privately;
- `product.resolve` establishes final linked TypeScript meaning;
- external authority is relative to the containing Product's direct
  dependencies and exact required native contracts;
- imported symbol, package export, target Product, target bytes, and toolchain
  basis all enter one canonical native-closure digest;
- that digest is subordinate to the existing resolved-lock identity;
- installation consumes the exact context-owned successful lock; and
- analyzer, occurrence, binding, and diagnostic evidence remain private.

Prime is applied at design level. Whole-family contraction places all changed
relations inside the already accepted `EnvironmentBasis`. There is no new
Prime carrier, public analyzer, resolver service, registry, catalog, runtime,
operation, or event family.

The design includes:

- constitutional derivation and global-to-local falsification conditions;
- the complete function and total failure partition;
- Ontology entities, relations, cardinalities, invariants, lifecycle, and
  authority;
- atomic-function derivation and higher-order composition;
- whole-family Prime contraction and root conservation;
- IACS, Promotion Test, module ownership, interfaces, and allowed dependency
  direction;
- domain, sequence, and lifecycle Mermaid views;
- the ten-column cross-view axiom evaluation;
- native constructability and compiler constraints;
- operational lifecycle confirmation;
- module-owned proof obligations; and
- the exact allowed realization projection.

## Exact Candidate Scope

The candidate changes only:

- `build_tenants/abiogenesis/typescript/design/M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md`;
- `specification/GOALS.md`;
- `.ai-workspace/tickets/active/T-281-publish-prime-19-operation-definition-family.md`;
- `.ai-workspace/tickets/active/T-270-bind-public-catalog-invocation-to-execution-authority.md`;
- `AGENTS.md`;
- `CLAUDE.md`; and
- `README.md`.

Fourteen pre-existing modified implementation/design/test paths remain
unstaged and outside the candidate. They are a disposable constructability
probe, not review authority. The following paths are relative to
`build_tenants/abiogenesis/typescript/`:

- `code/src/product/contracts.ts`;
- `code/src/product/declaration_exports.ts`;
- `code/src/product/environment.ts`;
- `code/src/product/index.ts`;
- `code/src/product/install_product.ts`;
- `code/src/product/verify_product.ts`;
- `contracts/schemas/public-contract-catalog.schema.json`;
- `design/M04_PUBLIC_CONTRACT_PUBLICATION_BEHAVIOR_DESIGN.md`;
- `design/M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md`;
- `scripts/generate-product-manifest.mjs`;
- `test_env/fixtures/abi5-root-candidate-basis.json`;
- `test_env/support/flavored-catalog-product.mjs`;
- `test_env/tests/m5-installed-portability.test.mjs`; and
- `test_env/tests/m5-s06-prime.test.mjs`.

The eight pre-existing untracked review/strategy posts are also excluded and
untouched.

## Mechanical Evidence

| Gate | Result |
|---|---|
| GFM/Pandoc parse | `7/7` |
| Mermaid render | `3/3` |
| required DMM section inventory | present |
| `git diff --cached --check` | pass |
| candidate staged-path boundary | exactly seven files |
| implementation/runtime tests | not run; design-only candidate and provisional code excluded |

## Review Questions

1. Is local versus linked TypeScript meaning complete and total?
2. Does owner-relative resolution prevent ambient and transitive authority?
3. Does exact required-contract and imported-symbol binding close external
   meaning without another resolver authority?
4. Does every changed relation remain inside `EnvironmentBasis` without a new
   Prime carrier or public analyzer?
5. Do Ontology, lifecycle, authority, composition, IACS, module mapping, three
   views, interfaces, and proof project one meaning?
6. Does lock identity change for every source, target, symbol, direct edge,
   toolchain, and link-result change?
7. Can realization still choose a materially different authority, identity,
   lifecycle, failure, digest, dependency, or module topology?

The reviewer should return either acceptance of this exact design cut or one
consolidated design finding set. The worker does not issue a semantic verdict.
Retained implementation resumes only after independent review and direct F_H
acceptance set both design verdicts to `accepted`.
