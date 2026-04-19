# Release Process — abiogenesis

## Source of Truth

| Artifact | Source | Derived (do not edit directly) |
|----------|--------|-------------------------------|
| gen-start, gen-gaps | `build_tenants/abiogenesis/python/.claude-plugin/plugins/genesis/commands/` | `.claude/commands/` |
| gen-install.py | `build_tenants/abiogenesis/python/code/gen-install.py` | — |
| Engine (gtl, genesis) | `build_tenants/abiogenesis/python/code/genesis/` | `.genesis/genesis/`, `.genesis/gtl/` |

## Command Ownership

abiogenesis owns the active release flow in this repo.

This document is abiogenesis-only. It does not assume any external cascade into
retired downstream installers.

## Fix → Release → Install

### Release in abiogenesis

1. Fix source in `build_tenants/abiogenesis/python/.claude-plugin/plugins/genesis/commands/`
   and/or engine source under `build_tenants/abiogenesis/python/code/genesis/`

2. Bump version in **all active version surfaces**:
   - `build_tenants/abiogenesis/python/code/gen-install.py` → `VERSION = "3.x.y"`
   - `build_tenants/abiogenesis/python/code/genesis/__init__.py` → `__version__ = "3.x.y"`
   - `pyproject.toml` → `version = "3.x.y"`

3. Commit source changes in abiogenesis

4. Install abiogenesis into itself:
   ```bash
   python build_tenants/abiogenesis/python/code/gen-install.py \
     --target . \
     --project-slug abiogenesis
   ```

5. Commit installed artifacts in this repo (`.claude/commands/`, `.genesis/`, stamp file)

## Version Alignment

Bump locations:

| Repo | File | Field |
|------|------|-------|
| abiogenesis | `build_tenants/abiogenesis/python/code/gen-install.py` | `VERSION` |
| abiogenesis | `build_tenants/abiogenesis/python/code/genesis/__init__.py` | `__version__` |
| abiogenesis | `pyproject.toml` | `version` |

## Why This Pattern

abiogenesis is self-hosted — it uses its own engine to develop itself.
The installer is the composition point. `.claude/commands/` and `.genesis/`
are derived artifacts. Editing them directly is invisible to the release chain
and will be overwritten on the next install.
