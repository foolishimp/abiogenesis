# Abiogenesis

Abiogenesis is the constitutional source for a GTL-native AI SDLC engine.

The repo is organized around spec-driven development:
- `specification/` is the constitutional source
- `build_tenants/TENANT_REGISTRY.md` is the canonical tenant registry
- `build_tenants/common/` is the shared tenant-local realization root
- `build_tenants/abiogenesis/python/design/` is the shipping design surface for the current GTL 3 / ABG 3 line
- `build_tenants/abiogenesis/python/code/` is the shipping Python realization
- `build_tenants/abiogenesis/python/test_env/` is the shipping Python test harness

The active engine and language surface is GTL 3 / ABG 3:
- GTL: `Module`, `Graph`, `Node`, `GraphVector`, `Context`, `Job`, `Role`
- ABG: interpreter, event stream, projection, convergence, binding, run, graph call, continuation, transport, provenance

## Source of Truth

Read these first:
- [SPEC_METHOD.md](/Users/jim/src/apps/genesis_sdlc/specification/standards/SPEC_METHOD.md)
- [INTENT.md](specification/INTENT.md)
- [requirements/](specification/requirements/)
- [GTL_3_CONSTITUTIONAL_DESIGN.md](specification/GTL_3_CONSTITUTIONAL_DESIGN.md)
- [ABG_3_CONSTITUTIONAL_DESIGN.md](specification/ABG_3_CONSTITUTIONAL_DESIGN.md)
- [TENANT_REGISTRY.md](build_tenants/TENANT_REGISTRY.md)
- [build_tenants/common/design/README.md](build_tenants/common/design/README.md)
- [build_tenants/abiogenesis/python/design/README.md](build_tenants/abiogenesis/python/design/README.md)

The project method is explicit:
- requirements are the constitutional `what`
- design is the structural bridge
- code must derive from requirements plus design
- live requirements need downstream realization or explicit deferment
- shipping behavior must trace back to constitutional authority

## Shipping Surface

The current shipping line is the Python realization under `build_tenants/abiogenesis/python/`.

Relevant directories:

```text
build_tenants/abiogenesis/python/
├── code/         shipping engine + GTL types + domain packages
├── design/       shipping design / ADR surface
├── test_env/     shipping test harness
└── test_runs/    persistent test archives
```

`build_tenants/abiogenesis/codex/` is non-shipping and not part of the canonical publish gate.

## Test Harness

The canonical Claude harness is:

```bash
cd build_tenants/abiogenesis/python/test_env
./run_tests
./run_tests e2e
./run_tests live
./run_tests file tests/test_live_fp_qualification.py -m live_fp -k TestLiveFpSmoke -v
```

The repo root is not the active test bed.

## Installer

The Claude build installer lives at:

```bash
python build_tenants/abiogenesis/python/code/gen-install.py --target /path/to/project
```

That installs a `.genesis/` runtime into the target project. The root repo itself is not the installed runtime.

## Notes

- Historical V1 doctrine and supersession history still exist in the specification where they matter constitutionally.
- Compatibility debt is being pruned aggressively from shipping surfaces.
- Live domain artifacts are versioned constitutional history and must change by supersession or withdrawal, not silent in-place mutation.
