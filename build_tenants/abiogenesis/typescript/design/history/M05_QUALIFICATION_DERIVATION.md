# M05 Qualification Derivation

**Status**: Active
**Date**: 2026-04-24
**Purpose**: Derive the first TypeScript `M05-qualification-scenarios`
foundation from the paused Python reference qualification line and the completed
TypeScript `M01` through `M04` surfaces without widening immediately into
installed sandbox, live transport, or archive mechanics.

## 1. Source Material

This boundary derives from:

- `build_tenants/common/design/modules/M05-qualification-scenarios.yml`
- `build_tenants/common/qualification/qualification_surface_map.md`
- `build_tenants/common/qualification/qualification_refactor_loop.md`
- `build_tenants/abiogenesis/python/design/GSDLC_LITE_QUALIFICATION_LADDER.md`
- `build_tenants/abiogenesis/python/design/SCENARIO_INTENT_TO_TAGGED_REQUIREMENTS.md`
- `build_tenants/abiogenesis/python/design/SCENARIO_REQUIREMENTS_TO_UAT.md`
- `build_tenants/abiogenesis/python/design/SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md`
- `build_tenants/abiogenesis/python/test_env/test_surface_map.md`
- `build_tenants/abiogenesis/python/test_env/tests/test_spec_method_trace.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_usecases_fake.py`
- `build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M04_PUBLIC_ASSET_ADDRESSING_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M04_RESULT_ASSESSMENT_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M04_LIVE_STATUS_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/test_env/test_surface_map.md`

## 2. Position

The first TypeScript `M05` wave is a qualification foundation, not the full
installed sandbox line.

It starts from the paused Python reference truths:

- qualification is a product surface with its own law
- method trace is a first-class gate, not commentary
- fake-lane scenario proof should exercise completed module truth rather than
  helper internals
- installed sandbox, live transport, and archive proof remain part of a later
  `M05` slice once enough installed-runtime infrastructure exists

## 3. Preserved Boundary Truth

The first TypeScript `M05` slice preserves these truths from the Python line:

- qualification remains derived from live requirements, design, module, and
  scenario authority
- method-trace proof remains module-owned and fail-closed on missing authority
- fake-lane proof composes completed public/runtime surfaces without inventing
  rival runtime semantics
- later live-lane and archive proof must preserve the same interface and
  provenance expectations as the fake lane

## 4. Demoted Python Delivery Detail

The TypeScript line intentionally defers these Python-shaped details to the
later installed-runtime wave:

- installer-backed sandbox bootstrapping
- subprocess or agent-readiness probing
- durable archive file materialization
- live transport retries and timeout layering
- test-run directory and archive-runner mechanics

Those remain valid Python reference evidence, but they do not define the first
TypeScript `M05` foundation.

## 5. First TypeScript M05 Target

The first TypeScript `M05` slice should realize only:

- one method-trace qualification request/outcome family
- one fake-lane qualification request/outcome family
- one bounded qualification kernel under `code/src/qualification/m05/**`
- one module-derived method-trace unit lane
- one module-derived fake-lane integration lane
- one fail-closed negative lane for missing authority or broken fake-lane truth

This first slice should **not** widen into:

- installed sandbox qualification
- live-lane qualification
- run archive or postmortem materialization
- delivery/install bootstrap ownership
- bootloader file injection
- alternate-runtime mapping or `M06`

## 6. Python-To-TypeScript Mapping

| Python design truth | TypeScript target boundary | TypeScript consequence |
| --- | --- | --- |
| `test_spec_method_trace.py` gates constitutional and design trace | bounded method-trace request/outcome family | TypeScript qualification proves declared module/design authority exists before later closure |
| `test_sandbox_usecases_fake.py` proves composed fake-lane scenarios | bounded fake-lane request/outcome family | first TypeScript fake lane composes completed `M04` public/runtime surfaces over deterministic fixtures |
| `GSDLC_LITE_QUALIFICATION_LADDER.md` separates fake lane from live/archive ladder stages | defer installed sandbox, live, and archive to successor wave | `T-021` stays source-tree and module-derived only |
| Python `test_surface_map.md` binds tests to design/module authority | TypeScript `test_surface_map.md` becomes the declared proof map for `M05` lanes | later qualification closures cannot rely on unnamed tests |
| shared qualification law keeps qualification tenant-local until more than one tenant consumes it unchanged | bounded TypeScript qualification module remains tenant-local | no propagation to `build_tenants/common/` in this wave |

## 7. Required Next Assets

Before `M05` implementation starts, this derivation must be followed by:

- the `M05` qualification first-slice IACS
- the `M05` qualification structural carrier diagram
- the `M05` strict-lane expansion
- the `M05` module-derived proof lanes in `test_surface_map.md`

Only then is the first TypeScript `M05` qualification wave ready for
implementation.
