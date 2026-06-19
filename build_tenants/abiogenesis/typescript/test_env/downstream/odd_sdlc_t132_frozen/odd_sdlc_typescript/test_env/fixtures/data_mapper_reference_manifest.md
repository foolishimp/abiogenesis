# data_mapper.template Reference Fixture Manifest

Lane: optional local reference comparison.

This fixture is not part of required TypeScript semantic closure. Required
semantic closure uses checked-in portable source snapshots in
`test_t031_workspace_ingress.test.mjs`.

The full `data_mapper.template` project is copied into this repository as a
reference comparison against the Python discovery line and later RC
qualification.

## Binding

- Environment variable: `ODD_SDLC_DATA_MAPPER_TEMPLATE_ROOT`
- Default repo-local source:
  `build_tenants/typescript/test_env/fixtures/data_mapper_reference/data_mapper.template`
- Script: `npm run test:reference:data-mapper`

The environment variable is an internal fixture selector only. It must resolve
under `build_tenants/typescript/test_env/fixtures`; internal scenarios must not
read or write `ai_sdlc_examples` template roots. If the default or override path
is absent, the reference lane fails with a governed fixture diagnostic. That
failure is not semantic-lane product failure.
