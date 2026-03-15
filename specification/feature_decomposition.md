# Genesis V1 — Feature Decomposition

**Traces to**: INT-001
**Requirements**: specification/requirements.md
**Status**: Approved
**Date**: 2026-03-15

---

## Feature Map

| Feature | Title | Satisfies | Depends On | MVP |
|---------|-------|-----------|------------|-----|
| REQ-F-CORE | Core engine functions | REQ-F-CORE-001..006 | — | ✓ |
| REQ-F-BIND | bind_fd + PrecomputedManifest | REQ-F-CORE-004 | REQ-F-CORE | ✓ |
| REQ-F-WKSP | Workspace projection + schedule | REQ-F-CORE-006, REQ-F-WKSP-001, REQ-F-WKSP-002 | REQ-F-CORE | ✓ |
| REQ-F-CMD-START | gen-start command | REQ-F-CMD-001 | REQ-F-WKSP | ✓ |
| REQ-F-CMD-ITER | gen-iterate command | REQ-F-CMD-002 | REQ-F-BIND | ✓ |
| REQ-F-CMD-GAPS | gen-gaps command | REQ-F-CMD-003 | REQ-F-WKSP | ✓ |

Note: REQ-NFR-TEST-001, REQ-NFR-E2E-001, REQ-NFR-SELF-001 are quality gates woven across all features, not standalone features.

---

## Dependency DAG

```
REQ-F-CORE
    ├── REQ-F-BIND        (needs iterate, emit, project)
    └── REQ-F-WKSP        (needs schedule, project, emit)
         ├── REQ-F-CMD-START   (needs schedule, workspace state)
         └── REQ-F-CMD-GAPS    (needs feature vectors, workspace)

REQ-F-BIND
    └── REQ-F-CMD-ITER    (needs bind_fd, iterate)
```

**Build order** (topological sort):
1. REQ-F-CORE
2. REQ-F-BIND (parallel with REQ-F-WKSP)
3. REQ-F-WKSP (parallel with REQ-F-BIND)
4. REQ-F-CMD-START, REQ-F-CMD-ITER, REQ-F-CMD-GAPS (all unblock at this point)

---

## MVP Scope

All 6 features are MVP. This is the minimum engine that can run the full asset graph for any project.

**Deferred** (V2+):
- Consensus engine (multi-agent quorum)
- Spawn/fold-back (parallel feature execution)
- Release workflow (gen-release command)
- Observer stack (dispatch_monitor, intent observer)
- gen-consensus-*, gen-spawn, gen-release commands
- Bedrock / Gemini / Codex builds

---

## Module Mapping

The 6 features map to 6 modules (one-to-one — clean separation):

| Feature | Module |
|---------|--------|
| REQ-F-CORE | `builds/claude_code/code/genesis/core.py` |
| REQ-F-BIND | `builds/claude_code/code/genesis/bind.py` |
| REQ-F-WKSP | `builds/claude_code/code/genesis/schedule.py` |
| REQ-F-CMD-START | `builds/claude_code/code/genesis/commands.py` |
| REQ-F-CMD-ITER | `builds/claude_code/code/genesis/commands.py` |
| REQ-F-CMD-GAPS | `builds/claude_code/code/genesis/commands.py` |
| Entry point | `builds/claude_code/code/genesis/__main__.py` |
| Manifest types | `builds/claude_code/code/genesis/manifest.py` |

Exactly 6 modules + `__main__` + `manifest` = 8 files. The spec (`genesis_core.py`) asserts `six_modules_only` — commands, manifest, and __main__ collapse to 3 of the 6 (core, bind, schedule are the other 3).

**The 6 modules per spec**:
1. `core.py` — iterate, project, emit, delta
2. `bind.py` — bind_fd, PrecomputedManifest
3. `schedule.py` — schedule, workspace projection, feature vector management
4. `manifest.py` — PrecomputedManifest type, WorkingSurface type
5. `commands.py` — gen-start, gen-iterate, gen-gaps implementations
6. `__main__.py` — CLI entry point, `gen` script

---
