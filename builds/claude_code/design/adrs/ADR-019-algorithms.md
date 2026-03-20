# ADR-019: Algorithms — Python Implementation Choices

**Status**: accepted | **Date**: 2026-03-20
**Spec reference**: `specification/convergence_model.md`

The convergence algorithms (delta, hashing, projection, context resolution) are specified in `specification/convergence_model.md`. This ADR records the Python-specific implementation details for the claude_code build.

---

## 1. PYTHONPATH Propagation for F_D Evaluators

F_D evaluators run as subprocesses. To ensure `genesis` and `gtl` packages resolve inside the subprocess:

```python
env = os.environ.copy()
extra = os.pathsep.join(p for p in sys.path if p)
existing = env.get("PYTHONPATH", "")
env["PYTHONPATH"] = os.pathsep.join(filter(None, [extra, existing]))
```

The entire parent `sys.path` is propagated. This ensures genesis engine modules (in `.genesis/`) and spec modules are importable in the subprocess even though it runs in a different working directory context.

---

## 2. Output Capture Limits

F_D evaluator subprocess output is truncated to prevent memory issues with verbose test runners:

- `stdout`: last 3000 characters (`result.stdout[-3000:]`)
- `stderr`: last 500 characters (`result.stderr[-500:]`)

**Why these limits**: pytest with `-v` on a large test suite can produce megabytes of stdout. The engine only needs the tail (failure summaries). stderr is typically shorter and more critical.

---

## 3. FD_TIMEOUT_SECONDS

Default: 120 seconds. Overridable via `FD_TIMEOUT_SECONDS` environment variable.

```python
FD_TIMEOUT_SECONDS: int = int(os.environ.get("FD_TIMEOUT_SECONDS", "120"))
```

**Why overridable**: Slow CI environments or large test suites may legitimately exceed 120s. The env var allows per-environment tuning without code changes.

---

## 4. Whitespace Normalisation in job_evaluator_hash

```python
raw = "\n".join(re.sub(r'\s+', ' ', line.strip()) for line in lines)
```

Before hashing, each evaluator definition line has multiple whitespace collapsed to single space and leading/trailing whitespace trimmed. This prevents cosmetic whitespace changes in evaluator descriptions from invalidating all F_P assessments.

---

## 5. Context Content Cap at 4000 Characters

```python
snippet = content[:4000] + ("…[truncated]" if len(content) > 4000 else "")
```

Each context document in the F_P prompt is capped at 4000 characters. This is a prompt-engineering constant balancing context richness against token budget. Multiple contexts per edge can compound.

---

## 6. Event Stream Backend: JSON Lines File

The spec defines EventStream as a logical abstraction (any ordered, append-only, replayable store). This build implements it as a local JSONL file (`.ai-workspace/events/events.jsonl`). Each line is one `json.dumps()` call followed by `\n`. The file is opened in append mode (`"a"`) for each write. A cloud-native build might use Kafka, EventStore, or a database WAL instead.

**Why JSONL**: Simple, append-friendly, line-level corruption isolation. A corrupted line does not invalidate preceding events. Standard tooling (jq, grep) works directly on the file.

**Why not SQLite**: Zero-dependency constraint. JSONL requires only the standard library `json` module.

---

## 7. Event Log Corruption Handling

```python
except json.JSONDecodeError as exc:
    raise ValueError(
        f"Corrupted event log at {self.path}:{lineno}: {exc}\n"
        f"  line: {line!r}\n"
        "Replay is not possible until the corrupted line is repaired."
    ) from exc
```

The error message includes the file path, line number, the corrupted line content, and a clear instruction. This is a deliberate design choice — the engine halts rather than silently degrading, because partial replay is worse than no replay.
