# M05 Installed Sandbox Derivation

**Status**: Completed
**Date**: 2026-04-24
**Purpose**: Derive the second TypeScript `M05-qualification-scenarios` slice
from the released Python installed sandbox, live-lane, and archive proof line
without reintroducing Python-specific transport or installer mechanics as the
TypeScript authority surface.

## 1. Source Material

This boundary derives from:

- `build_tenants/common/design/modules/M05-qualification-scenarios.yml`
- `build_tenants/common/qualification/qualification_surface_map.md`
- `build_tenants/abiogenesis/python/design/GSDLC_LITE_QUALIFICATION_LADDER.md`
- `build_tenants/abiogenesis/python/test_env/test_surface_map.md`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_usecases_live.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_run_archive.py`
- `build_tenants/abiogenesis/python/test_env/tests/run_archive.py`
- `build_tenants/abiogenesis/python/test_env/tests/sandbox_runtime.py`
- `build_tenants/abiogenesis/typescript/design/M05_QUALIFICATION_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M05_QUALIFICATION_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M04_INSTALL_BOOTSTRAP_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M04_BOOTLOADER_DERIVATION.md`
- `.ai-workspace/tickets/completed/T-019-realize-typescript-m04-install-bootstrap-under-package-first-installed-runtime-law.md`
- `.ai-workspace/tickets/completed/T-020-realize-typescript-m04-bootloader-and-project-facing-delivery-operations-under-explicit-bootloader-law.md`
- `.ai-workspace/tickets/completed/T-028-realize-a-tenant-local-abg-common-delivery-library-for-installed-root-plans-verification-and-instruction-file-injection.md`

## 2. Position

The second TypeScript `M05` slice is the installed-line qualification wave.

It starts from the released Python truths:

- install/bootstrap proof is not interchangeable with source-tree imports
- live-lane scenario proof must execute against the installed line
- archive output is qualification truth, not disposable temp output
- archive shape, install shape, and scenario shape are all module-owned proof
  surfaces

## 3. Preserved Boundary Truth

This TypeScript slice preserves these truths from the Python line:

- installed-runtime qualification proves the installed line, not only the
  source workspace
- live-lane proof must reuse the same public/runtime interface families as the
  fake lane
- archive proof must validate stable run-root structure plus durable artifact
  records
- install/bootstrap and bootloader ownership remain in completed `M04` and are
  consumed as upstream delivery truth

## 4. Demoted Python Delivery Detail

The TypeScript line intentionally demotes these Python-shaped details to
delivery binding or later refinement:

- Python module bootstrapping through `.genesis`
- Python subprocess transport contracts and readiness probes
- pytest fixture shape and class-level timeout decorators
- Python-specific archive helper implementation details

Those remain valid reference evidence, but they do not define the TypeScript
installed-line authority surface.

## 5. First TypeScript M05 Installed Target

The installed `M05` slice should realize only:

- one installed-sandbox qualification request/outcome family
- one run-archive qualification request/outcome family
- one bounded installed-line qualification kernel extending
  `code/src/qualification/m05/**`
- one installed-root integration lane
- one installed live-lane integration lane
- one archive-proof integration lane
- one fail-closed negative lane

This slice should **not** widen into:

- real external agent transport
- entropy campaigns
- alternate-runtime mapping
- product release automation

## 6. Python-To-TypeScript Mapping

| Python design truth | TypeScript target boundary | TypeScript consequence |
| --- | --- | --- |
| `test_sandbox_install.py` proves installed runtime separately from source imports | installed-sandbox qualification request/outcome family | TypeScript installed-line proof validates bootstrap entry, package binding, and delivered files over a temp installed root |
| `test_sandbox_usecases_live.py` proves scenario execution through the installed line | installed live-lane integration over installed imports | TypeScript installed proof runs one bounded scenario through the installed package surface, not direct source imports |
| `test_run_archive.py` and `run_archive.py` prove archive shape and durable files | run-archive qualification request/outcome family | TypeScript archive proof validates stable run-root shape and required output files |
| `sandbox_runtime.py` separates install, env shaping, and installed invocation | installed-line support remains test/support only | `T-022` consumes completed `M04` delivery truth and local package binding without creating a rival install semantic center |

## 7. Required Next Assets

Before installed-line implementation starts, this derivation must be followed
by:

- the `M05` installed-sandbox first-slice IACS
- the `M05` installed-sandbox structural carrier diagram
- the `M05` strict-lane expansion
- the `M05` installed proof lanes in `test_surface_map.md`

Only then is the installed `M05` wave ready for implementation.
