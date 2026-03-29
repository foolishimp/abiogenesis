# Genesis Engine — Claude Build

GTL-native AI SDLC engine. ABG 2.x surface using Module, Graph, Node, GraphVector.

## Structure

```
build_tenants/abiogenesis/python/
├── code/                   ← shipping engine + GTL type system
│   ├── genesis/            ← engine modules
│   ├── gtl/                ← GTL 2.x types (Graph, Node, Module, Evaluator, ...)
│   ├── gtl_spec/           ← domain packages (abiogenesis, project_package)
│   └── gen-install.py      ← installer
├── design/                 ← ADRs, module design, bootloader
├── test_env/               ← test harness (sandboxed from the build)
│   ├── tests/              ← test source
│   ├── run_tests           ← test runner (replaces root Makefile)
│   └── pyproject.toml      ← pytest config
└── test_runs/              ← persistent run archives (gitignored)
```

## Installation

Install the engine into a target project:

```bash
python build_tenants/abiogenesis/python/code/gen-install.py --target /path/to/your/project
```

This creates `.genesis/` in the target containing the engine, GTL types, and a bootstrap `genesis.yml`.

**Prerequisites**: Python 3.11+, a GTL spec package importable from the target root.

## First Session

After install, open the target project:

```bash
cd /path/to/your/project
PYTHONPATH=.genesis python -m genesis gaps       # check workspace state
PYTHONPATH=.genesis python -m genesis start --auto --human-proxy  # drive the loop
```

## Testing

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
| `genesis gaps` | Show delta per edge — which evaluators are failing |
| `genesis start --auto --human-proxy` | Drive the loop from current state to next block |
| `genesis iterate --edge "E"` | One bind-and-iterate pass on a specific edge |

Event log at `.ai-workspace/events/events.jsonl` is the authoritative record.
All state is derived by projecting the log.
