# UAT Clean Install: `test_install`

## Target

- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/test_env/test_install`

## Install

- Wiped the target directory completely.
- Reinstalled using:
  - `python build_tenants/abiogenesis/python/code/gen-install.py --target build_tenants/abiogenesis/python/test_env/test_install`

Installer result:

- `version`: `1.1.0`
- `status`: `installed`
- `errors`: `[]`

## Verify

- `python build_tenants/abiogenesis/python/code/gen-install.py --target build_tenants/abiogenesis/python/test_env/test_install --verify`

Verify result:

- `status`: `ok`
- `missing_engine`: `[]`
- `missing_gtl`: `[]`
- `config_present`: `true`
- `agent_cli`: `true`

## Direct smoke checks

### Installed runtime import / CLI

- `env PYTHONPATH=<target>/.genesis python -m genesis emit-event ... --workspace <target>`
- result: `{"status": "ok", "event_type": "approved"}`

### Installed bootstrap

- `env PYTHONPATH=<target>/.genesis python -c "... workspace_bootstrap(...)" `
- result:
  - `.ai-workspace/events/events.jsonl` created and bound

### Installed surfaces present

- `.genesis/genesis/` present with full engine module set
- `.genesis/gtl/` present with full vendored GTL module set
- `.genesis/genesis.yml` present
- `CLAUDE.md` present with GTL bootloader markers

## Bootloader status

Compared the installed `CLAUDE.md` GTL bootloader section against
`build_tenants/abiogenesis/python/code/gtl_spec/GTL_BOOTLOADER.md`.

Result:

- `bootloader_match=True`

So the GTL bootloader installed by `gen-install.py` is current with source on
this branch.

## Install lane regression check

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_v2_sandbox_install.py -q`
- result: `5 passed`

## UAT status

The clean install target is ready for manual UAT.
