# Bootstrap (REQ-F-BOOT-*)

**Traces to**: INT-001

### REQ-F-BOOT-001 — gen-install bootstraps .genesis/ into target project

The installer copies the engine into a target project so it can run without an installed package.

**Acceptance Criteria**:
- AC-1: `gen-install --target <dir> --project-slug <slug>` creates `.genesis/genesis/` with engine modules
- AC-2: Creates `.genesis/genesis.yml` pointing to `gtl_spec.packages.<slug>:package`
- AC-3: Creates `.genesis/gtl_spec/packages/<slug>.py` starter spec if absent — never overwrites existing
- AC-4: Idempotent — re-running updates engine files, preserves workspace state

### REQ-F-BOOT-002 — .genesis/genesis.yml config resolves Package/Worker

The engine reads its Package and Worker from a config file at startup.

**Acceptance Criteria**:
- AC-1: `genesis.yml` contains `package:` and `worker:` fields as resolvable symbol references
- AC-2: Missing `genesis.yml` → informative error, not a crash
- AC-3: Engine resolves Package and Worker dynamically from the import path

### REQ-F-PKG-001 — Starter spec generated for new projects

gen-install creates a starter GTL Package spec so new projects have a working baseline.

**Acceptance Criteria**:
- AC-1: `gen-install --project-slug <slug>` generates a starter Package definition under `.genesis/gtl_spec/packages/<slug>`
- AC-2: Starter spec includes: two assets (spec, output), one edge, one evaluator, one worker
- AC-3: Never overwrites existing spec — only created if absent
