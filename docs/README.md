# ABIogenesis Documentation

This directory contains version-bound explanatory documentation for
ABIogenesis, GTL.TypeScript, HoG, and ABG.

Documentation is a derived projection. It does not define Product,
requirements, design, runtime truth, or release status. When documentation
conflicts with an owning source, the owning source decides and the
documentation is stale.

## Live Documentation

| Described contract | Status | Package coordinate | Source cut | Documents |
|---|---|---|---|---|
| GTL.TypeScript / ABG `5.0.0` | Provisional development documentation; not an RC or released Product | `@abiogenesis/typescript-tenant@5.0.0-dev.286` | `22a1ea1fccf79d558e4ebe1bb5c07b2d8c7acac1` | [LLM context](./5.0.0/LLM_CONTEXT.md), [human guide](./5.0.0/USER_GUIDE.md) |

The exact Product source for this first documentation cut is
`specification/PRODUCT.md`, SHA-256
`a3e27405d59a613a3933f3b3b9261e9ae895be72a7d289bca0e6d4662b49265c`.

ABIogenesis currently selects STDO `v2.2.0`. STDO release material and its
compression remain project-level inputs and are referenced by version only;
they are not copied or restated here.

## Read Order

For an LLM working inside an initialized project:

1. load the project-selected STDO compression through the project bootstrap;
2. load [5.0.0/LLM_CONTEXT.md](./5.0.0/LLM_CONTEXT.md);
3. load the exact Product, requirement, design, or task surfaces needed for the
   current question.

For a person learning or using the Product:

1. read [5.0.0/USER_GUIDE.md](./5.0.0/USER_GUIDE.md);
2. follow its source references when constitutional or realization detail is
   required.

## Derivation Boundary

| Documentation claim | Owning source |
|---|---|
| Product identity, purpose, language meaning, runtime authority, feature and scenario scope | `specification/PRODUCT.md` and applicable requirements |
| Current selected work and acceptance state | `specification/GOALS.md` |
| Realization structure | Accepted design under `build_tenants/abiogenesis/typescript/design/` |
| Exported TypeScript names, request shapes, schemas, and command spelling | Public package declarations and schemas, subordinate to specification and accepted design |
| Command and request examples | Exported contracts plus source-independent installed-package proof lanes |
| Version and release identity | Exact package and release manifest |

Documentation must not resolve an absent Product, requirement, or design
decision. It records the gap and re-enters at the owning source.

## Current Qualification

This first cut is intentionally provisional:

- S03 is the accepted implementation base.
- S05 Consensus reconciliation is current and is not yet accepted.
- S06 portability and later Product outcomes are not selected.
- no ABIogenesis 5.0 RC or stable 5.0 Product exists.

Stable language and authority descriptions are usable now. The request
transcript is a schema example until a complete neutral installed-package
example is added. S05 and S06 examples remain provisional until their exact
implementation subjects are accepted and installed-package verified.

## Historical Material

[old/](./old/) contains superseded pre-5.0 guides, schematics, release notes,
renders, and strategy material. Those files are retained as history only and
must not be loaded as current GTL or ABG guidance.
