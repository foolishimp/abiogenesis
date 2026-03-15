# Abiogenesis

A minimal GTL interpreter. Software work as a typed graph — assets, edges, evaluators, workers — driven by an append-only event stream.

The engine is self-hosting: it ran itself through design → code → tests and its workspace reports `converged: true`.

---

## Getting Started

### Prerequisites

- Python 3.11+
- A virtual environment (recommended)

### Install

```bash
cd /path/to/abiogenesis
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

This installs two packages:
- `genesis` — the engine (entry point: `gen`)
- `gtl` — the type system (vendored at `gtl/`)

### Verify

```bash
# Confirm the entry point works
gen --help

# Check the self-hosted workspace (genesis running on itself)
PYTHONPATH=. gen gaps --workspace .
```

Expected output of `gen gaps`:

```json
{
  "total_delta": 0,
  "converged": true,
  "jobs_considered": 5,
  ...
}
```

`total_delta: 0` means the workspace is converged — all evaluators pass.

---

## Core Commands

All commands accept `--workspace DIR` (default: `.`).

| Command | What it does |
|---------|-------------|
| `gen gaps` | Report residual work — failing evaluators per edge, total delta |
| `gen iterate` | Run exactly one bind-and-iterate pass on the next open job |
| `gen start` | State-machine entry point — derive state, select job, iterate |
| `gen start --auto` | Loop until converged or blocked by external input |

The `gaps`, `iterate`, and `start` commands all accept `--package MODULE:VAR` and `--worker MODULE:VAR` to override the package/worker at runtime. Without flags, they read from `.genesis/genesis.yml`.

---

## Project Layout

```
abiogenesis/
├── gtl/                            # Type system (vendored, v0.3.0)
│   └── core.py                     #   Asset, Edge, Job, Evaluator, Worker, F_D/F_P/F_H
│
├── spec/                           # Self-hosting spec package
│   ├── GENESIS_BOOTLOADER.md       #   LLM constraint context
│   └── packages/
│       ├── genesis_core.py         #   V1 Package + Worker (the self-hosting spec)
│       └── abiogenesis_meta.py     #   Meta-package
│
├── builds/claude_code/
│   ├── code/genesis/               # Engine source (6 modules + __main__)
│   │   ├── core.py                 #   workspace_bootstrap, EventStream, project
│   │   ├── bind.py                 #   bind_fd, bind_fp, PrecomputedManifest
│   │   ├── manifest.py             #   BoundJob, prompt construction
│   │   ├── schedule.py             #   delta, iterate, schedule
│   │   ├── commands.py             #   gen_gaps, gen_iterate, gen_start, Scope
│   │   └── __main__.py             #   CLI entry point
│   ├── code/gen-install.py         # Bootstrap installer for other projects
│   ├── design/                     # ADRs
│   └── tests/                      # 183 tests
│
├── .genesis/
│   ├── genesis/                    # Engine copy for self-hosted invocation
│   └── genesis.yml                 # Package/worker config
│
├── .ai-workspace/                  # Runtime workspace state
│   ├── events/events.jsonl         #   Canonical event log
│   └── features/                   #   Feature vectors (active/ + completed/)
│
├── pyproject.toml                  # Package definition
└── V1_DOCTRINE.md                  # Design doctrine
```

---

## Using Genesis in Your Project

### Option A — Install and point at your spec

Install abiogenesis as an editable package, then write a GTL spec and configure it.

```bash
# In your project
pip install -e /path/to/abiogenesis

# Write your spec (see the GTL primer below)
# Then configure it
mkdir -p .genesis
cat > .genesis/genesis.yml <<EOF
package: mypackage.spec:my_package
worker:  mypackage.spec:my_worker
EOF

gen gaps --workspace .
```

### Option B — Bootstrap install (standalone, no pip dependency)

Copies the engine into `.genesis/genesis/` so the target project needs no installed packages:

```bash
python /path/to/abiogenesis/builds/claude_code/code/gen-install.py \
    --target /path/to/project \
    --project-slug my_domain
```

This creates:
- `.genesis/genesis/` — engine modules
- `.genesis/genesis.yml` — config pointing to `spec/packages/my_domain:package`
- `spec/packages/my_domain.py` — starter spec (only if absent — never overwrites)

Then run via:

```bash
PYTHONPATH=.genesis python -m genesis gaps --workspace .
```

---

## GTL Primer

A minimal spec has five types:

```python
from gtl.core import Asset, Edge, Evaluator, Job, Operator, Package, Worker, F_D, F_P, F_H

# 1. Assets — the typed nodes
spec   = Asset(name="spec",   id_format="SPEC-{SEQ}")
output = Asset(name="output", id_format="OUT-{SEQ}", lineage=[spec])

# 2. Operators — who does the work (F_D = deterministic, F_P = agent, F_H = human)
agent  = Operator("agent", F_P, "agent://claude/genesis")
tests  = Operator("tests", F_D, "exec://python -m pytest tests/ -q")

# 3. Edge — one transition
edge = Edge(name="spec→output", source=spec, target=output, using=[agent])

# 4. Evaluators — convergence tests
eval_done = Evaluator("output_complete", F_P, "agent: output satisfies spec")
eval_tests = Evaluator("tests_pass", F_D, "all tests pass", command="python -m pytest tests/ -q")

# 5. Job, Package, Worker
job     = Job(edge=edge, evaluators=[eval_done, eval_tests])
package = Package(name="my_domain", assets=[spec, output], edges=[edge], operators=[agent])
worker  = Worker(id="claude_code", can_execute=[job])
```

See `spec/packages/genesis_core.py` for a complete, working example.

---

## Event Stream

All state is derived from `.ai-workspace/events/events.jsonl`. The log is append-only.

Key event types:

| Event | When |
|-------|------|
| `edge_started` | An iteration begins on an edge |
| `edge_converged` | An edge reaches delta = 0 |
| `fp_dispatched` | An F_P (agent) evaluator needs work done |
| `fh_gate_pending` | An F_H (human) gate is waiting |
| `fd_gap_found` | A deterministic F_D check failed |

---

## Traceability Checks

```bash
# Every engine module has an Implements: tag
gen check-tags --type implements --path builds/claude_code/code/

# Every test has a Validates: tag
gen check-tags --type validates --path builds/claude_code/tests/

# Every REQ key in the spec appears in a feature vector
gen check-req-coverage \
    --package spec.packages.genesis_core:genesis_v1 \
    --features .ai-workspace/features/
```

---

## Running Tests

```bash
# Full test suite (183 tests)
pytest

# Single test module
pytest builds/claude_code/tests/test_commands.py -v

# Skip e2e tests (no Claude API needed)
pytest -m "not e2e"
```

---

## Current Limitations (V1)

- `--feature` in V1 validates that a feature ID exists in `.ai-workspace/features/` but does not route individual jobs to specific features. Per-job feature routing is V2.
- `F_P` dispatch emits an event but does not invoke an actual agent — the agent reads the event and acts externally. The fold-back is manual in V1.
- Multi-tenant scheduling (multiple workers with conflict detection) is deferred to V2. V1 has a single `claude_code` worker.

---

See [USER_GUIDE.md](USER_GUIDE.md) for the full operating guide.
