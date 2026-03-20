# GAP: Root gtl/ and gtl_spec/ violate four-territory model

**Date**: 2026-03-20
**Severity**: Structural inconsistency — external-facing installer is correct, internal layout is not
**Related**: genesis_sdlc ADR-008 (four-territory model), abiogenesis 0.3.0 release

---

## Problem Statement

The abiogenesis 0.3.0 installer correctly writes `gtl/` and `gtl_spec/` under `.genesis/` in downstream projects. But within abiogenesis itself, both directories sit at the **project root** — outside any territory defined by the four-territory model.

```
abiogenesis/                        ← WHAT EXISTS
├── gtl/                            ← BUILD SOURCE at root (violation)
│   ├── __init__.py
│   └── core.py
├── gtl_spec/                       ← BUILD SOURCE at root (violation)
│   ├── __init__.py
│   ├── GENESIS_BOOTLOADER.md
│   └── packages/
│       ├── genesis_core.py         ← THE spec (V1 type definitions)
│       ├── abiogenesis.py          ← project spec
│       ├── abiogenesis_meta.py     ← bootstrap meta-spec
│       └── project_package.py      ← template for downstream
├── .genesis/
│   ├── gtl/                        ← INSTALLED copy (correct territory)
│   ├── gtl_spec/                   ← INSTALLED copy (correct territory)
│   └── genesis/                    ← INSTALLED engine (genesis_sdlc bootstrap compiler)
├── builds/
│   └── claude_code/
│       ├── code/genesis/           ← engine source (correct territory)
│       ├── tests/
│       └── design/adrs/
├── specification/
└── .ai-workspace/
```

By the four-territory model:
- `gtl/` is implementation source code (the type system) — it belongs in `builds/`
- `gtl_spec/` contains the project spec and shared spec assets — it belongs in `builds/`
- The installer copies them into `.genesis/` at install time — that's correct
- But the **source** sitting at root means root is a fifth, unnamed territory

This is the exact same violation genesis_sdlc had with `gtl_spec/` at root before ADR-008.

---

## What needs to move

### gtl/ (GTL type system)

**Current**: `/abiogenesis/gtl/`
**Target**: `/abiogenesis/builds/claude_code/code/gtl/`

Rationale: `gtl/` is vendored source code (copied from `ai_sdlc_method/imp_codex/code/gtl/` per pyproject.toml comment). The engine at `builds/claude_code/code/genesis/` imports `from gtl.core import ...`. Colocating `gtl/` with the engine it serves keeps build source in `builds/`.

### gtl_spec/ (spec package)

**Current**: `/abiogenesis/gtl_spec/`
**Target**: `/abiogenesis/builds/claude_code/code/gtl_spec/`

Rationale: `gtl_spec/packages/genesis_core.py` IS the V1 spec. `abiogenesis.py` is the project spec. `project_package.py` is a template. These are all build assets — they define what the engine compiles against and what gets installed into downstream projects.

Note: `GENESIS_BOOTLOADER.md` is a compiled asset derived from `specification/`. It travels with `gtl_spec/` because it's installed alongside the spec package. Its authoring surface could arguably be `specification/` but its deployed location is `.genesis/gtl_spec/`.

---

## Exhaustive inventory of references requiring update

### 1. gen-install.py — source path resolution

**File**: `builds/claude_code/code/gen-install.py`

```python
# Current — reads gtl from project root
def _gtl_source() -> Path:
    return _source_root() / "gtl"                    # → abiogenesis/gtl/

# Current — reads spec from project root
SPEC_FILES = [
    "gtl_spec/__init__.py",                           # source at root/gtl_spec/
    "gtl_spec/packages/__init__.py",
    "gtl_spec/packages/genesis_core.py",
    "gtl_spec/GENESIS_BOOTLOADER.md",
]
for rel in SPEC_FILES:
    src = source_root / rel                           # → abiogenesis/gtl_spec/...
    dst = target / ".genesis" / rel                   # → target/.genesis/gtl_spec/...
```

**Refactor**:
- `_gtl_source()` → `_source_root() / "builds" / "claude_code" / "code" / "gtl"`
- `SPEC_FILES` source base → `_source_root() / "builds" / "claude_code" / "code"` (paths stay as `gtl_spec/...` relative to code dir)
- Or introduce a `_code_root()` helper that returns the `builds/claude_code/code/` directory

### 2. pyproject.toml — pythonpath and package discovery

**File**: `pyproject.toml`

```toml
# Current
pythonpath = ["builds/claude_code/code", ".genesis", "."]
packages = ["genesis", "gtl"]

[tool.setuptools.package-dir]
"genesis" = "builds/claude_code/code/genesis"
"gtl" = "gtl"
```

**Refactor**:
```toml
pythonpath = ["builds/claude_code/code", ".genesis"]
# Remove "." — no longer needed; gtl/ and gtl_spec/ are under builds/claude_code/code/

[tool.setuptools.package-dir]
"genesis" = "builds/claude_code/code/genesis"
"gtl" = "builds/claude_code/code/gtl"
```

The `.` pythonpath entry exists solely because `gtl/` and `gtl_spec/` are at root. Once they move under `builds/claude_code/code/`, the existing `builds/claude_code/code` entry resolves both `gtl` and `gtl_spec` imports.

### 3. Engine source — Python imports (NO CHANGE)

All engine files import `from gtl.core import ...`. These are module-path imports resolved via PYTHONPATH, not filesystem paths. Since `builds/claude_code/code` is already on the pythonpath, and `gtl/` will be at `builds/claude_code/code/gtl/`, imports resolve without change.

Files (no modification needed):
- `builds/claude_code/code/genesis/__main__.py` — `from gtl.core import Package, Worker`
- `builds/claude_code/code/genesis/core.py` — `from gtl.core import Context`
- `builds/claude_code/code/genesis/bind.py` — `from gtl.core import Context, Evaluator, F_D, F_H, F_P, Job`
- `builds/claude_code/code/genesis/commands.py` — `from gtl.core import Job, Package, Worker`
- `builds/claude_code/code/genesis/manifest.py` — `from gtl.core import Evaluator, Job`
- `builds/claude_code/code/genesis/schedule.py` — `from gtl.core import Evaluator, F_D, F_H, F_P, Job, Worker, WorkingSurface`

### 4. Spec packages — Python imports (NO CHANGE)

All spec files import `from gtl.core import ...`. Same resolution — no change needed.

Files (no modification needed):
- `gtl_spec/packages/genesis_core.py` → moves to `builds/claude_code/code/gtl_spec/packages/genesis_core.py`
- `gtl_spec/packages/abiogenesis.py` → moves to `builds/claude_code/code/gtl_spec/packages/abiogenesis.py`
- `gtl_spec/packages/abiogenesis_meta.py` → moves (imports from `gtl_spec.packages.genesis_core` — resolves via same pythonpath)
- `gtl_spec/packages/project_package.py` → moves to `builds/claude_code/code/gtl_spec/packages/project_package.py`

### 5. Test files — Python imports (NO CHANGE)

All test files import `from gtl.core import ...`. Resolved via pyproject.toml `pythonpath` which already includes `builds/claude_code/code`.

Files (no modification needed — 11 test files):
- `test_bind.py`, `test_cli_config.py`, `test_commands.py`, `test_core.py`
- `test_integration_workflows.py`, `test_property_invariants.py`, `test_schedule.py`
- `test_provenance_integration.py`, `test_e2e_sandbox.py`, `test_e2e_domain_blind.py`
- `test_main.py`

### 6. Test helper — _subprocess_env

**File**: `builds/claude_code/tests/test_cli_config.py`

```python
# Current
paths = [
    str(workspace / ".genesis"),
    str(workspace),
    str(root / "builds" / "claude_code" / "code"),
    str(root),                                        # ← needed only for root gtl/
]
```

**Refactor**: Remove `str(root)` — no longer needed. `builds/claude_code/code` resolves `gtl` and `gtl_spec`.

### 7. Test _write_minimal_pkg helper

**File**: `builds/claude_code/tests/test_cli_config.py`

Already updated in 0.3.0 to write under `workspace/.genesis/gtl_spec/`. No further change needed.

### 8. gen-install.py — self-install detection

**File**: `builds/claude_code/code/gen-install.py`

```python
if src.resolve() == dst.resolve():
    # Installing into the source project itself — spec already in place
```

After the move, source is `abiogenesis/builds/claude_code/code/gtl_spec/...` and dest is `abiogenesis/.genesis/gtl_spec/...`. These never match, so the self-install guard becomes dead code. However, it's harmless — it just means self-installs always copy (idempotent). Can remove or keep for safety.

### 9. CLAUDE.md — structure diagram and spec references

**File**: `CLAUDE.md`

```
# Current references:
├── gtl_spec/                         ← the topology — tech-agnostic formal system
├── gtl/                              ← GTL type system (vendored from genesis_sdlc)
```

**Refactor**: Update structure diagram to show `builds/claude_code/code/gtl/` and `builds/claude_code/code/gtl_spec/`. Update any prose that says "gtl_spec/ at root" or "gtl/ at root".

### 10. README.md — structure references

**File**: `README.md`

References to `gtl/` and `gtl_spec/` in the project layout section need updating.

### 11. docs/ — any documentation referencing root gtl_spec/

**Files in**: `docs/`

Check for filesystem path references to `gtl_spec/` or `gtl/` that assume root location.

### 12. specification/ — if any references exist

**Files in**: `specification/`

Check for references to `gtl_spec/` paths.

### 13. .genesis/genesis.yml — import path (NO CHANGE)

```yaml
package: gtl_spec.packages.abiogenesis:package
worker:  gtl_spec.packages.abiogenesis:worker
```

This is a Python import path, not a filesystem path. Resolved via `PYTHONPATH=.genesis` which finds `.genesis/gtl_spec/`. No change needed.

### 14. gtl/core.py — version comment

**File**: `gtl/core.py` (line 17)

```python
v0.2.1 (Codex findings addressed 2026-03-14):
```

This is internal to the file — moves with it. No path reference to fix.

---

## Execution plan

### Step 1: Move files (git mv)

```bash
git mv gtl/ builds/claude_code/code/gtl/
git mv gtl_spec/ builds/claude_code/code/gtl_spec/
```

### Step 2: Update gen-install.py source resolution

Change `_gtl_source()` to point at `builds/claude_code/code/gtl/`.
Change SPEC_FILES source base to read from `builds/claude_code/code/` instead of project root.

### Step 3: Update pyproject.toml

Remove `.` from `pythonpath` (no longer needed).
Update `[tool.setuptools.package-dir]` for gtl.

### Step 4: Update test helper _subprocess_env

Remove `str(root)` from PYTHONPATH construction.

### Step 5: Update CLAUDE.md and README.md

Update structure diagrams and prose references.

### Step 6: Update docs/

Fix any remaining root gtl_spec/ or gtl/ references.

### Step 7: Cascade install

Run `gen-install.py --target .` to refresh `.genesis/` from the new source locations.

### Step 8: Run tests

All 310+ tests must pass. The key insight: **no Python import statements change** because `builds/claude_code/code` is already on the pythonpath.

### Step 9: Verify

Run `--verify` to confirm installed structure is correct.

---

## Risk assessment

**Low risk**: No Python import paths change. The only changes are:
1. Filesystem source locations (gen-install.py reads from)
2. pyproject.toml pythonpath (remove `.`)
3. Documentation paths

**The critical invariant**: `PYTHONPATH=.genesis` resolves `gtl` and `gtl_spec` for production. This is unaffected — `.genesis/` is populated by the installer from wherever the source lives.

**Version**: This would be abiogenesis 0.4.0 (MINOR — structural change to source layout).
