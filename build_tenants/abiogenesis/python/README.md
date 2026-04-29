# Genesis Engine - ABG 3.0

GTL-native AI SDLC engine. ABG 3 surface using Module, Graph, Node, GraphVector, GraphFunction, and GraphCall.

Status: paused released reference line. TypeScript is the primary release line
for the current abiogenesis cut.

## Structure

```
build_tenants/abiogenesis/python/
├── code/                   <- reference engine + GTL type system
│   ├── genesis/            <- engine modules
│   ├── gtl/                <- GTL 3 types (Graph, Node, Module, Evaluator, ...)
│   ├── gtl_spec/           <- domain packages (abiogenesis, project_package)
│   └── gen-install.py      <- reference installer
├── design/                 <- ADRs, module design, bootloader
├── test_env/               <- reference test harness (sandboxed from the build)
│   ├── tests/              <- test source
│   ├── run_tests           <- test runner (replaces root Makefile)
│   └── pyproject.toml      <- pytest config
└── test_runs/              <- persistent run archives (gitignored)
```

## Installation

The Python installer is retained for reference and compatibility inspection.
It is not the active release installer while Python is paused.

Install the engine into a target project:

```bash
python build_tenants/abiogenesis/python/code/gen-install.py --target /path/to/your/project
```

This installs `.genesis/` in the target containing the engine, GTL types, and a bootstrap `genesis.yml`.
It also injects the precreated GTL bootstrap into `CLAUDE.md` between GTL markers.

**Prerequisites**: Python 3.11+, a GTL spec package importable from the target root, and an existing target directory.

## First Session

After install, open the target project:

```bash
cd /path/to/your/project
PYTHONPATH=.genesis python -m genesis gaps --scope workspace
PYTHONPATH=.genesis python -m genesis start --scope workspace --target next --until converged --fh-mode human-proxy
PYTHONPATH=.genesis python -m genesis start --scope workspace --target graph_function:code-flow --until first_traversal
```

Current public control-mode families are:

- `fh_mode = direct | human-proxy`
- `root_mode = direct | supervised`

The CLI binds them as `--fh-mode` and `--root-mode`. Both default to `direct`.
In the current cut, both are lawful only with `--until converged`.

## Testing

These commands are reference checks, not TS-primary RC gates while Python is
paused.

```bash
cd build_tenants/abiogenesis/python/test_env
./run_tests              # default lane: unit + integration (~60s)
./run_tests e2e          # sandbox lifecycle (no LLM)
./run_tests live         # live F_P qualification (~45min, needs claude CLI)
./run_tests all          # everything
./run_tests file tests/test_algebra.py   # single file
```

## Operating Loop

| Command | What it does |
|---------|-------------|
| `genesis gaps --scope workspace` | Show delta per edge over the requested scope |
| `genesis start --scope workspace --target next --until first_traversal` | Apply one lawful advancement |
| `genesis start --scope workspace --target graph_function:code-flow --until first_traversal` | Apply one lawful advancement constrained to one published graph-function carrier |
| `genesis start --scope workspace --target next --until blocked` | Advance until the next canonical stop |
| `genesis start --scope workspace --target next --until converged --fh-mode human-proxy` | Drive toward convergence using the configured control modes |

Event log at `.ai-workspace/events/events.jsonl` is the authoritative record.
All state is derived by projecting the log.

`asset:<published_handle>` is available only when the installed runtime
publishes an operator asset registry and ownership surface.
