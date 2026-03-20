# Abiogenesis

A minimal interpreter that runs software work as a typed graph. You define what assets exist, how they transform into each other, and what it means for a transformation to be complete. The engine tracks the gap between current state and done.

The engine is self-hosting: it ran itself through design → code → tests and its own workspace reports `converged: true`.

---

## Key Concepts

### The six types

| Type | What it is |
|------|-----------|
| **Asset** | A typed artifact — spec, code, tests, design, etc. Each asset has a name and an ID format. |
| **Edge** | A directed transition from one asset type to another. `spec → output` is an edge. |
| **Evaluator** | A test that decides whether an edge is complete. An edge can have several evaluators. |
| **Job** | An edge paired with its evaluators. The unit of work the engine schedules. |
| **Worker** | Declares which jobs an agent or team can execute. |
| **Package** | A complete graph — all assets, edges, operators, and the workers that can run them. |

### The three evaluator kinds

Every evaluator is one of three kinds. These are the engine's core distinction:

| Kind | Symbol | What it checks | Passes when |
|------|--------|---------------|-------------|
| **Deterministic test** | `F_D` | Scripts, test suites, coverage checks, tag counts — anything with a binary pass/fail | The command exits 0 or the check passes |
| **Agent assessment** | `F_P` | LLM or automated agent judgment — "does this output satisfy the spec?" | An agent records a passing assessment in the event log |
| **Human approval** | `F_H` | Explicit human sign-off | `holdsAt(operative(edge, wv))` — an `approved` event exists and has not been `revoked` |

The engine always runs deterministic tests (`F_D`) first. Agent assessment (`F_P`) only runs when all deterministic tests pass. Human approval (`F_H`) only runs when agent assessment passes. This ordering prevents agent calls on work that has obvious deterministic failures.

### The event stream

All state lives in `.ai-workspace/events/events.jsonl`, an append-only log. Assets are not stored — they are derived by reading the event stream. If you want to know whether an edge is done, the engine scans the log for a `edge_converged` event.

### Delta

Each edge has a **delta** — the number of evaluators not yet passing. `delta = 0` means the edge is converged. The workspace is converged when every edge has `delta = 0`.

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

`total_delta: 0` means all evaluators pass. The workspace is at rest.

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
├── builds/claude_code/
│   ├── code/
│   │   ├── genesis/               # Engine source (6 modules + __main__)
│   │   │   ├── core.py            #   workspace_bootstrap, EventStream, project
│   │   │   ├── bind.py            #   bind_fd, bind_fp, PrecomputedManifest
│   │   │   ├── manifest.py        #   BoundJob, prompt construction
│   │   │   ├── schedule.py        #   delta, iterate, schedule
│   │   │   ├── commands.py        #   gen_gaps, gen_iterate, gen_start, Scope
│   │   │   └── __main__.py        #   CLI entry point
│   │   ├── gtl/                   # GTL type system (vendored, v0.3.0)
│   │   │   └── core.py            #   Asset, Edge, Job, Evaluator, Worker, F_D/F_P/F_H
│   │   ├── gtl_spec/              # Spec package
│   │   │   ├── GENESIS_BOOTLOADER.md  #   LLM constraint context
│   │   │   └── packages/
│   │   │       ├── genesis_core.py    #   V1 Package + Worker (the spec)
│   │   │       └── abiogenesis.py     #   Project spec for self-hosting
│   │   └── gen-install.py         # Bootstrap installer for other projects
│   ├── design/                     # ADRs
│   └── tests/                      # 310+ tests
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

Install abiogenesis as an editable package, write a GTL spec, and configure it.

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
- `.genesis/gtl/` — GTL type system
- `.genesis/gtl_spec/packages/my_domain.py` — starter spec (only if absent — never overwrites)
- `.genesis/genesis.yml` — config pointing to `gtl_spec.packages.my_domain:package`

Then run via:

```bash
PYTHONPATH=.genesis python -m genesis gaps --workspace .
```

---

## GTL Primer

A minimal spec defines assets, edges, evaluators, and the worker that can execute them:

```python
from gtl.core import Asset, Edge, Evaluator, Job, Operator, Package, Worker, F_D, F_P, F_H

# Assets — the typed nodes in your graph
spec   = Asset(name="spec",   id_format="SPEC-{SEQ}")
output = Asset(name="output", id_format="OUT-{SEQ}", lineage=[spec])

# Operators — who performs the work
# F_P = agent/LLM, F_D = deterministic script, F_H = human
agent = Operator("agent", F_P, "agent://claude/genesis")
tests = Operator("tests", F_D, "exec://python -m pytest tests/ -q")

# Edge — one transition between asset types
edge = Edge(name="spec→output", source=spec, target=output, using=[agent])

# Evaluators — convergence tests for this edge
eval_done  = Evaluator("output_complete", F_P, "agent: output satisfies spec")
eval_tests = Evaluator(
    "tests_pass", F_D,
    "all unit tests pass",
    command="python -m pytest tests/ -q",   # F_D evaluators run this command
)

# Job, Package, Worker
job     = Job(edge=edge, evaluators=[eval_done, eval_tests])
package = Package(name="my_domain", assets=[spec, output], edges=[edge], operators=[agent])
worker  = Worker(id="claude_code", can_execute=[job])
```

See `builds/claude_code/code/gtl_spec/packages/genesis_core.py` for a complete, working example.

---

## Event Stream

All state is derived from `.ai-workspace/events/events.jsonl`. The log is append-only.

Key event types:

| Event | When emitted |
|-------|-------------|
| `edge_started` | An iteration begins on an edge |
| `edge_converged` | An edge reaches delta = 0 (all evaluators pass) |
| `fp_dispatched` | An agent evaluator needs work — the agent should act and record results |
| `fh_gate_pending` | A human approval gate is waiting |
| `found` | A deterministic test failed (`kind: fd_gap` in data) |

---

## Traceability Checks

```bash
# Every engine module has an Implements: tag
gen check-tags --type implements --path builds/claude_code/code/

# Every test has a Validates: tag
gen check-tags --type validates --path builds/claude_code/tests/

# Every REQ key in the spec appears in a feature vector
gen check-req-coverage \
    --package gtl_spec.packages.genesis_core:genesis_v1 \
    --features .ai-workspace/features/
```

---

## Running Tests

```bash
# Full test suite (183 tests)
pytest

# Single test module
pytest builds/claude_code/tests/test_commands.py -v

# Skip end-to-end tests (no Claude API needed)
pytest -m "not e2e"
```

---

## Current Limitations (V1)

- `--feature` validates that a feature ID exists in `.ai-workspace/features/` but does not route individual jobs to specific features. Per-job feature routing is V2.
- Agent dispatch (`F_P`) emits an event but does not invoke an agent directly — the agent reads the event and acts externally. The fold-back (recording the result) is manual in V1.
- Multi-tenant scheduling (multiple workers with conflict detection) is deferred to V2. V1 has a single `claude_code` worker.

---

See [USER_GUIDE.md](USER_GUIDE.md) for the full operating guide.
