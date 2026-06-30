---
id: T-181
title: Preserve installed package identity on upgrade
type: bug
status: completed
goal: >-
  Make the TypeScript installer CLI handle refresh upgrades by preserving an
  existing target package identity when --installed-package-name is omitted.
created_at: 2026-07-01
updated_at: 2026-07-01
completed_at: 2026-07-01
priority: high
ticket_category: realization_refactor
change_class: realization_refactor
re_entry_point: installer_cli_refresh
owner: abiogenesis
governance_scope: STDO Method, install product law, downstream upgrade safety
source_documents:
  - build_tenants/abiogenesis/typescript/code/src/cli/command.ts
  - build_tenants/abiogenesis/typescript/code/src/app/m04/install_bootstrap/install.ts
  - build_tenants/abiogenesis/typescript/test_env/tests/test_m04_typescript_installer_integration.test.mjs
closure_law: >-
  Close only when a CLI install refresh into an existing target can omit
  --installed-package-name and still preserve the existing installed package
  name, while an explicitly conflicting installed package name remains
  rejected.
non_closure_conditions:
  - The installer defaults an omitted installed package name to a generic name
    before checking the target's existing package.json or install manifest.
  - A refresh requires downstream products to pass a manual package-name
    workaround to avoid rejection.
  - An explicitly supplied conflicting installed package name is silently
    accepted.
required_work:
  - Keep explicit --installed-package-name behavior unchanged.
  - When the flag is omitted, resolve the installed package name from the
    existing target package.json or .abiogenesis/install-manifest.json before
    falling back to the default clean-install name.
  - Add regression coverage for omitted-name refresh and explicit-name
    mismatch.
proof_commands:
  - cd build_tenants/abiogenesis/typescript && npm run build:semantic
  - cd build_tenants/abiogenesis/typescript && node --test test_env/tests/test_m04_typescript_installer_integration.test.mjs
  - git diff --check
closure_evidence:
  - `command.ts` now resolves an omitted installed package name from existing
    `package.json` or `.abiogenesis/install-manifest.json` before falling back
    to the clean-install default.
  - `test_m04_typescript_installer_integration.test.mjs` covers omitted-name
    refresh and explicit-name mismatch.
  - `npm run build:semantic` passed.
  - `node --test test_env/tests/test_m04_typescript_installer_integration.test.mjs`
    passed 5/5.
  - `node --test test_env/tests/test_t163_shared_product_toolchain_resolution.test.mjs`
    passed 1/1.
  - `git diff --check` passed.
---

# T-181: Preserve Installed Package Identity On Upgrade

The installer already rejects mismatched installed package names correctly. The
upgrade defect is earlier in the CLI: when a downstream refresh omits
`--installed-package-name`, the parser supplies the clean-install default
instead of preserving the existing target identity. That makes a lawful refresh
look like a mismatch.

The fix keeps explicit mismatch rejection, but treats an omitted package-name
flag as "resolve from the existing install when present."
