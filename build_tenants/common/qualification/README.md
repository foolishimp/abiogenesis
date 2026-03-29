# Common Qualification Surfaces

This directory is reserved for shared tenant-local qualification and test-law surfaces.

At the current migration stage, most executable qualification still lives in the canonical python tenant root:

- `build_tenants/abiogenesis/python/test_env/`

and the paused codex comparison root:

- `build_tenants/abiogenesis/codex/tests/`

Promote material into `build_tenants/common/qualification/` only when it becomes genuine shared qualification law across tenants.

The current shared-vs-tenant classification lives in:

- `build_tenants/common/qualification/qualification_surface_map.md`
- `build_tenants/common/qualification/qualification_refactor_loop.md`
