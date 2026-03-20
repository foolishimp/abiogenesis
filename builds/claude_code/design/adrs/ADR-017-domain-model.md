# ADR-017: Domain Model — Python Implementation Choices

**Status**: accepted | **Date**: 2026-03-20
**Spec reference**: `specification/domain_model.md`

The domain model is specified in `specification/domain_model.md`. This ADR records the Python-specific design decisions for the claude_code build.

---

## 1. Frozen Dataclasses for GTL Types

All GTL types (Asset, Edge, Evaluator, Job, Worker, Package, Context, Operator) are implemented as `@dataclass(frozen=True)`. This enforces immutability at the language level — field assignment after construction raises `FrozenInstanceError`.

**Why frozen**: The type system is constitutional. Mutable types would allow in-place modification that breaks the event-stream-as-model-substrate invariant. Frozen dataclasses make the constraint structural rather than conventional.

**Exception**: `EventStream` is a regular class (mutable) because it holds a file handle and the `workflow_version` binding which changes at runtime.

---

## 2. Module-Level Stream Singleton

`core.py` uses a module-level `_stream: Optional[EventStream]` bound by `init_stream()` / `workspace_bootstrap()`. The `emit()` function reads this singleton.

**Why**: Avoids threading the stream through every function call in the engine. The stream is process-wide — there is exactly one event log per workspace per process.

**Trade-off**: Makes unit testing require explicit `init_stream()` setup/teardown. Acceptable in V1 single-tenant.

---

## 3. F_D Evaluators as Subprocess Commands

F_D evaluators run their `command` field via `subprocess.run(shell=True)`. PYTHONPATH is propagated by joining `sys.path` with `os.pathsep` and prepending to the environment.

**Constants**:
- `FD_TIMEOUT_SECONDS = 120` (overridable via env var)
- stdout capture: last 3000 characters
- stderr capture: last 500 characters

**Why subprocess**: F_D commands are specified in the GTL Package as shell strings (e.g., `pytest -x -m 'not e2e'`). Running them in-process would require parsing and reimplementing arbitrary shell commands. Subprocess is the natural execution model.

**Why timeout**: Prevents unbounded hangs from misconfigured commands, particularly cyclic genesis invocations where the engine calls itself.

---

## 4. Context Truncation

Each context document is capped at 4000 characters in the F_P prompt. Content beyond this is replaced with `…[truncated]`.

**Why 4000**: Balances providing sufficient context for the F_P actor against token budget. Each edge may have multiple contexts; unbounded contexts overwhelm the prompt.

---

## 5. genesis.yml Hand-Rolled Parser

`_load_project_config()` in `__main__.py` parses `.genesis/genesis.yml` with a simple line-by-line parser supporting `key: value` pairs and YAML-style lists (`- item`).

**Why not a YAML library**: The engine has zero external dependencies beyond the Python standard library. genesis.yml uses a trivially simple subset (flat keys + one list). Adding PyYAML for this would violate the zero-dependency constraint.

---

## 6. Symbol Import via importlib

`_import_symbol(ref, workspace)` parses `"module.path:variable_name"`, calls `importlib.import_module()`, then `getattr()`.

**Why**: The Package and Worker are Python objects defined in user-written modules. importlib is the standard mechanism for dynamic module loading. The `MODULE:VAR` convention follows Python packaging patterns (e.g., setuptools entry_points).

---

## 7. Edge Slug for File Naming

Manifest and result files use an edge slug derived from the edge name: `→` and `↔` replaced with `_`, combined with an ISO timestamp.

Example: `design_code_20260320T183000.json`

**Why**: Filesystem-safe naming that preserves traceability to the originating edge.
