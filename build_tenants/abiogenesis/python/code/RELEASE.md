# Release Process — abiogenesis

## Source of Truth

| Artifact | Source | Derived (do not edit directly) |
|----------|--------|-------------------------------|
| gen-start, gen-gaps, gen-status | `build_tenants/abiogenesis/python/.claude-plugin/plugins/genesis/commands/` | `.claude/commands/` |
| gen-install.py | `build_tenants/abiogenesis/python/code/gen-install.py` | — |
| Engine (gtl, genesis) | `build_tenants/abiogenesis/python/code/genesis/` | `.genesis/genesis/`, `.genesis/gtl/` |

## Command Ownership

abiogenesis owns: `gen-start`, `gen-gaps`, `gen-status`
genesis_sdlc owns: `gen-iterate`, `gen-review`
genesis_sdlc's installer composes both sets at install time.

## Fix → Release → Install Cascade

### Release in abiogenesis

1. Fix source in `build_tenants/abiogenesis/python/.claude-plugin/plugins/genesis/commands/`
   and/or engine source under `build_tenants/abiogenesis/python/code/genesis/`

2. Bump version in **all active version surfaces**:
   - `build_tenants/abiogenesis/python/code/gen-install.py` → `VERSION = "2.x.y"`
   - `build_tenants/abiogenesis/python/code/genesis/__init__.py` → `__version__ = "2.x.y"`
   - `pyproject.toml` → `version = "2.x.y"`

3. Commit source changes in abiogenesis

4. Install abiogenesis into itself (via genesis_sdlc installer — it reads from sibling `abiogenesis/`):
   ```bash
   cd ../genesis_sdlc
   python build_tenants/<family>/<variant>/src/genesis_sdlc/install.py \
     --target ../abiogenesis \
     --project-slug abiogenesis
   ```

5. Install abiogenesis into genesis_sdlc:
   ```bash
   python build_tenants/<family>/<variant>/src/genesis_sdlc/install.py \
     --target . \
     --project-slug genesis_sdlc
   ```

6. Commit installed artifacts in both repos (`.claude/commands/`, `.genesis/`, stamp file)

### Bug in genesis_sdlc only

Same as above steps 1–3 but for genesis_sdlc source, then only step 5 (genesis_sdlc self-install).

## Version Alignment

Both repos use the same version string when releasing together.
Bump locations:

| Repo | File | Field |
|------|------|-------|
| abiogenesis | `build_tenants/abiogenesis/python/code/gen-install.py` | `VERSION` |
| abiogenesis | `build_tenants/abiogenesis/python/code/genesis/__init__.py` | `__version__` |
| abiogenesis | `pyproject.toml` | `version` |
| genesis_sdlc | `build_tenants/<family>/<variant>/src/genesis_sdlc/install.py` | `VERSION` |
| genesis_sdlc | `build_tenants/<family>/<variant>/pyproject.toml` | `version` |

## Why This Pattern

abiogenesis and genesis_sdlc are self-hosted — they use their own engine to develop themselves.
The installer is the composition point. `.claude/commands/` and `.genesis/` are derived artifacts.
Editing them directly is invisible to the release chain and will be overwritten on the next install.
