# Internal data_mapper Induction Fixture

Lane: live sandbox regression for mandatory first SDLC traversal.

This checked-in fixture is copied from the historical
`data_mapper.template` source inputs and is now owned by the `odd_sdlc`
TypeScript test environment.

It is intentionally local-only. Tests that use this fixture must not read
external workspace templates and must not require
`ODD_SDLC_DATA_MAPPER_TEMPLATE_ROOT`.

## Purpose

The fixture preserves a real legacy data_mapper bootstrap shape so induction
can prove:

- unknown or legacy input state enters `Fg_conform_project`
- legacy `project_constraints.yml` output roots are canonicalized by traversal
- imported source documents produce concrete REQ authority
- `00-imported-sources.md` remains lineage, not the only requirements surface
- downstream traversal stays closed until the inducted project passes

## Source Files

- `README.md`
- `.ai-workspace/context/project_constraints.yml`
- `specification/INTENT.md`
- `specification/REQUIREMENTS.md`
- `specification/requirements/00-imported-sources.md`
- `specification/mapper_requirements.md`
- `specification/appendices/APPENDIX_A_FROBENIUS_ALGEBRAS.md`

## Command

```bash
npm run test:t087-t096:data-mapper-sandbox
```
