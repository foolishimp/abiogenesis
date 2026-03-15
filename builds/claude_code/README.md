# Genesis Engine — V1 Reference Build

A clean, GTL-first implementation of the Genesis SDLC engine.

## Installation

Bootstrap the engine into a target project with `gen-install`:

```bash
# From the abiogenesis source directory
python builds/claude_code/code/gen-install.py --target /path/to/your/project
```

This creates `.genesis/` in the target directory containing the engine and a
`genesis.yml` that resolves the project's GTL Package and Worker.

**Prerequisites**: Python 3.11+, a GTL spec package importable from the target root.

## First Session — Getting Started

After `gen-install`, open the target project and start the SDLC loop:

```bash
cd /path/to/your/project

# 1. Write your intent (what problem are you solving?)
#    → edit INTENT.md

# 2. Check workspace state
PYTHONPATH=.genesis python -m genesis gaps

# 3. Start the convergence loop
PYTHONPATH=.genesis python -m genesis start --auto --human-proxy
```

The engine drives: `intent → requirements → feature_decomp → design → code ↔ unit_tests`

At each F_H gate (intent approved, decomp approved, design approved), the engine
pauses and surfaces the criteria. With `--human-proxy`, Claude evaluates gates
automatically and writes a proxy-log for your morning review.

## Operating Loop

| Command | What it does |
|---------|-------------|
| `genesis gaps` | Show delta per edge — which evaluators are failing |
| `genesis start --auto --human-proxy` | Drive the loop from current state to next block |
| `genesis iterate --edge "E"` | Run one bind-and-iterate pass on a specific edge |
| `genesis start` (no flags) | Single iteration, stops for human at every gate |

**Typical session**:
```bash
# Morning: review proxy decisions from last run
PYTHONPATH=.genesis python -m genesis gaps

# Drive forward
PYTHONPATH=.genesis python -m genesis start --auto --human-proxy

# If blocked at fd_gap: fix the deterministic failure, then re-run start
```

**Event log** at `.ai-workspace/events/events.jsonl` is the authoritative record.
All state is derived by projecting the log — nothing is stored separately.
