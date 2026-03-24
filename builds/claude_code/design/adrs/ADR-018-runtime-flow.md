# ADR-018: Runtime Flow — Python Implementation Choices

**Status**: accepted | **Date**: 2026-03-20
**Spec reference**: `specification/convergence_model.md`

The convergence model, state machine, and algorithms are specified in `specification/convergence_model.md`. This ADR records the Python-specific implementation choices for the claude_code build.

---

## 1. CLI Entry via __main__.py

The engine is invoked as `python -m genesis <command>`. `__main__.py` uses `argparse` for CLI parsing with subcommands.

**Lightweight commands** (check-tags, check-req-coverage, emit-event, etc.) execute without initialising the engine stack — no EventStream, no Scope, no Package import. This keeps traceability checks fast and dependency-free.

**sys.path configuration**: The workspace root and any `pythonpath` entries from genesis.yml are inserted at the front of `sys.path` before importing the Package/Worker. Entries from genesis.yml are resolved relative to the workspace root.

---

## 2. Engine Stack Initialisation Order

```python
workspace = Path(args.workspace).resolve()
sys.path.insert(0, str(workspace))
# Insert pythonpath from genesis.yml (reversed to preserve order)
stream = workspace_bootstrap(workspace)       # creates dirs, binds _stream
package, worker = _resolve_package_worker(args, workspace)
scope = Scope(package, workspace_root, ...)   # reads active-workflow.json
```

The ordering matters: sys.path must be configured before importing the Package module. workspace_bootstrap must run before any emit() call. Scope construction reads active-workflow.json from `.ai-workspace/runtime/` (or explicit path via genesis.yml), defaulting to `"unknown"` on any failure (REQ-F-PROV-001).

---

## 3. emit-event CLI as Separate Write Path

`_emit_event_cmd()` in `__main__.py` provides a CLI write path that bypasses the engine stack entirely. It opens events.jsonl directly (no EventStream object), validates governance rules, annotates workflow_version, and appends.

**Why separate**: The skill layer (gen-start.md) calls `python -m genesis emit-event` after reading F_P results. This runs in a different process from the engine that produced the manifest. The CLI path must be self-contained.

**Workflow version annotation**: Reads active-workflow.json directly via `_read_workflow_version()` rather than through Scope, since no Scope exists in this code path.

---

## 4. F_P Manifest Files

When F_P dispatch is needed, two files are written:

- **Manifest**: `.ai-workspace/fp_manifests/{edge_slug}_{ts}.json` — contains edge, failing evaluators, assembled prompt, result_path, spec_hash
- **Result placeholder**: `.ai-workspace/fp_results/{edge_slug}_{ts}.json` — path given to F_P actor for writing assessment output

**Why files**: The F_P actor runs in a subprocess with environment sanitization (ADR-022). The manifest provides the prompt; the result path provides the write-back location. The skill layer bridges the two.

---

## 5. Event Detection in Auto-Loop

The auto-loop in `gen_start` detects stopping conditions by inspecting new events appended since the last iteration:

```python
new_events = stream.all_events()[last_event_count:]
new_types = {e["event_type"] for e in new_events}
```

**Why re-read**: `all_events()` re-reads the file each time. This is intentional — it ensures the auto-loop sees events emitted by subprocesses (F_D evaluators) that write to the same events.jsonl. An in-memory cache would miss cross-process events.

**Trade-off**: Re-reading the full event log on each iteration is O(n) in total events. Acceptable for V1 where event logs are small (hundreds to low thousands of events).

---

## 6. human_proxy Flag Passthrough

`--human-proxy` is validated at CLI level (requires `--auto`) and passed through to the result dict as `result["human_proxy"] = True`. The engine itself does not implement proxy evaluation — the methodology skill layer reads this flag and performs the F_H evaluation.

**Why not in engine**: Proxy evaluation requires LLM judgment (reading candidate, evaluating criteria). The engine is F_D-only; F_P/F_H actors are external. The flag is a routing signal, not an engine feature.
