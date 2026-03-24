# ADR-007: gen-install — Bootstrap Command

**Status**: accepted
**Date**: 2026-03-15
**Implements**: REQ-F-BOOT-001, REQ-F-BOOT-002, REQ-F-PKG-001

## Decision

`gen-install <target>` is a subcommand in `__main__.py` that bootstraps `.genesis/`
into a target project. It copies the genesis engine files and writes `.genesis/genesis.yml`
that resolves the Package (GTL spec) and Worker (agent identity) for that project.

```
.genesis/
  genesis/          # engine modules (copied from source)
  genesis.yml       # config: package locator + worker id
```

`genesis.yml` structure:
```yaml
package: gtl_spec.packages.<project>:<package_var>
worker: <worker_id>
workspace: .
```

## Rationale

- Install is a bootstrap operation — it runs once before the engine can run itself
- `genesis.yml` is the single authority for Package + Worker resolution; no ambient inference
- Copying engine files into `.genesis/` makes the project self-contained

## Consequences

- `__main__.py` exposes `install` and `upgrade` subcommands
- Scope resolution reads `genesis.yml`; missing file → informative error, not a guess
- `gen-install` is idempotent — re-running updates engine files, preserves workspace state
