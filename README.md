# Abiogenesis

Abiogenesis is the constitutional source for a GTL-native AI SDLC engine.

The repo is organized around spec-driven development:
- `specification/` is the constitutional source
- `builds/claude_code/design/` is the shipping design surface for `abg 1.0`
- `builds/claude_code/code/` is the shipping Claude build
- `builds/claude_code/test_env/` is the shipping Claude test harness

The active engine and language surface is 2.x:
- GTL: `Module`, `Graph`, `Node`, `GraphVector`, `Context`, `Job`, `Role`
- ABG: interpreter, event stream, projection, convergence, binding, run, transport, provenance

## Source of Truth

Read these first:
- [SPEC_METHOD.md](specification/SPEC_METHOD.md)
- [INTENT.md](specification/INTENT.md)
- [requirements/](specification/requirements/)
- [GTL_2_CONSTITUTIONAL_DESIGN.md](specification/GTL_2_CONSTITUTIONAL_DESIGN.md)
- [builds/claude_code/design/README.md](builds/claude_code/design/README.md)

The project method is explicit:
- requirements are the constitutional `what`
- design is the structural bridge
- code must derive from requirements plus design
- live requirements need downstream realization or explicit deferment
- shipping behavior must trace back to constitutional authority

## Shipping Surface

`abg 1.0` ships the Claude build only.

Relevant directories:

```text
builds/claude_code/
├── code/         shipping engine + GTL types + domain packages
├── design/       shipping design / ADR surface
├── test_env/     shipping test harness
└── test_runs/    persistent test archives
```

`builds/codex/` is non-shipping and is not part of the 1.0 publish gate.

## Test Harness

The canonical Claude harness is:

```bash
cd builds/claude_code/test_env
./run_tests
./run_tests e2e
./run_tests live
./run_tests file tests/test_live_fp_qualification.py -m live_fp -k TestLiveFpSmoke -v
```

The repo root is not the active test bed.

## Installer

The Claude build installer lives at:

```bash
python builds/claude_code/code/gen-install.py --target /path/to/project
```

That installs a `.genesis/` runtime into the target project. The root repo itself is not the installed runtime.

## Notes

- Historical V1 doctrine and supersession history still exist in the specification where they matter constitutionally.
- Compatibility debt is being pruned aggressively from shipping surfaces.
- Live domain artifacts are versioned constitutional history and must change by supersession or withdrawal, not silent in-place mutation.
