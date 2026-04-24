# TypeScript Strict Lane

**Status**: Active
**Date**: 2026-04-24
**Derived from**: [TYPESCRIPT_REALIZATION_GUARDRAILS.md](./TYPESCRIPT_REALIZATION_GUARDRAILS.md), [GTL_3_FIRST_SLICE_IACS.md](./GTL_3_FIRST_SLICE_IACS.md), [ABG_3_FIRST_SLICE_IACS.md](./ABG_3_FIRST_SLICE_IACS.md)

## Purpose

Pin the first bounded strict typing lane before code exists so the first
TypeScript implementation wave cannot silently pick weaker defaults under time
pressure.

## Validator Choice

The TypeScript tenant uses `valibot` for runtime ingress validation.

Reason:

- package-first deployment keeps runtime footprint load-bearing
- the semantic center wants explicit parser functions rather than ambient
  schema objects threaded through every module

Changing the validator requires a design reframe or ADR update first.

## Canonical Compiler Lane

The first semantic lane shall be checked with a dedicated
`tsconfig.semantic-strict.json` carrying at least:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "allowUnreachableCode": false,
    "allowUnusedLabels": false,
    "noEmitOnError": true,
    "skipLibCheck": false,
    "forceConsistentCasingInFileNames": true
  }
}
```

Runtime-shell `target`, `module`, and bundler settings may live in a parent
tenant config, but the semantic lane must extend or include these exact strict
options unchanged.

## Canonical ESLint Lane

The first semantic lane shall enable the following rules at `error`:

- `@typescript-eslint/no-explicit-any`
- `@typescript-eslint/consistent-type-assertions`
  with `assertionStyle: "never"`
- `@typescript-eslint/no-unnecessary-type-assertion`
- `@typescript-eslint/ban-ts-comment`
- `@typescript-eslint/no-unsafe-assignment`
- `@typescript-eslint/no-unsafe-argument`
- `@typescript-eslint/no-unsafe-call`
- `@typescript-eslint/no-unsafe-member-access`
- `@typescript-eslint/no-unsafe-return`
- `@typescript-eslint/switch-exhaustiveness-check`
- `@typescript-eslint/no-unused-vars`
- `@typescript-eslint/no-empty-object-type`
- `@typescript-eslint/no-wrapper-object-types`
- `@typescript-eslint/no-redundant-type-constituents`

These rules govern the semantic center.
Boundary-only exceptions must remain explicit and local.

For this tenant, "strictest possible" means:

- the compiler rejects unused parameters and unused locals in the semantic lane
- the linter rejects every `@ts-` suppression form rather than allowing
  description-based escape hatches
- no semantic lane file may preserve an intentionally ignored type escape by
  naming convention alone

## Bounded Module Set

Phase 1, the first active bounded strict lane, covers only the GTL first-slice
semantic files:

- `code/src/gtl/m01/contracts/**`
- `code/src/gtl/m01/admission/**`
- `code/src/gtl/m01/algebra/**`
- `code/src/gtl/m01/serialization/**`
- `code/src/shared/validation/**`

Phase 2 expands the same lane to the GTL `M02-work-publication` files only
after a successor ticket opens that publication/work wave:

- `code/src/gtl/m02/contracts/**`
- `code/src/gtl/m02/admission/**`
- `code/src/gtl/m02/serialization/**`

Phase 3 expanded the same lane to the ABG first-slice runtime files under the
completed `T-011` steel-thread wave:

- `code/src/abg/m03/contracts/**`
- `code/src/abg/m03/admission/**`
- `code/src/abg/m03/events/**`

Phase 4 expanded the same lane to the first bounded `M04` public-start files
under completed `T-012`:

- `code/src/app/m04/contracts/**`
- `code/src/app/m04/admission/**`
- `code/src/app/m04/public_start.ts`

Phase 5 expanded the same lane to the bounded `M04` control-loop files under
completed `T-013`:

- `code/src/app/m04/control/**`

Phase 6 expanded the same lane to the bounded `M02 -> M03` lookup-authority
files under completed `T-014`:

- `code/src/gtl/m02/contracts/lookup.ts`
- `code/src/abg/m03/contracts/**/*.ts`
- `code/src/abg/m03/admission/**/*.ts`

Phase 7 expanded the same lane to the bounded `T-026` transport/result
protocol wave:

- `code/src/abg/m03/transport/**`

Phase 8 expanded the same lane to the completed `T-027` ABG common realization
library wave:

- `code/src/shared/abg_library/**`

Phase 9 expanded the same lane to the completed `T-016` event-ingress wave:

- `code/src/app/m04/event_ingress/**`

Phase 10 expanded the same lane to the completed `T-017` result-assessment
wave:

- `code/src/app/m04/result_assessment/**`

Phase 11 expanded the same lane to the completed `T-018` live-status wave:

- `code/src/app/m04/live_status/**`

Phase 12 expanded the same lane to the completed `T-028` ABG common delivery
library wave:

- `code/src/shared/abg_delivery_library/**`

Phase 13 expanded the same lane to the completed `T-019`
install/bootstrap wave:

- `code/src/app/m04/install_bootstrap/**`

Phase 14 expanded the same lane to the completed `T-020` bootloader wave:

- `code/src/app/m04/bootloader/**`

Phase 15 expanded the same lane to the completed `T-025`
public-asset-addressing wave:

- `code/src/app/m04/asset_addressing/**`

Phase 16 expanded the same lane to the completed `T-021`
qualification-foundation wave:

- `code/src/qualification/m05/**`

Phase 17 kept the same lane green through the completed `T-022`
installed-sandbox and archive-proof wave:

- `code/src/qualification/m05/**`

The following are explicitly outside the active bounded lane unless a later
design slice reprices them in:

- `code/src/app/bootstrap/**`
- `code/src/app/m04/auto/**`
- `code/src/app/m04/proxy/**`
- `code/src/app/m04/install/**`
- `code/src/runtime-shell/**`
- scenario/test harness code outside the semantic contracts under test

Expanding the lane is allowed only after the earlier bounded lanes are green
and an active successor ticket explicitly authorizes the runtime wave.

## Semantic Boundary Rules

- `unknown` is lawful only at ingress to a named parser/validator
- `as` is not lawful in semantic kernels
- `any` is not lawful in semantic kernels
- discriminated unions must be consumed with exhaustive `never` checks
- effect-shell boundaries must not accept open object bags as semantic truth

## Negative-Proof Obligation

The first code wave must name one fail-closed fixture that:

1. constructs an open object payload outside the declared carrier family,
2. attempts to enter the canonical ingress path, and
3. proves the ingress parser rejects it before semantic code can consume it.
