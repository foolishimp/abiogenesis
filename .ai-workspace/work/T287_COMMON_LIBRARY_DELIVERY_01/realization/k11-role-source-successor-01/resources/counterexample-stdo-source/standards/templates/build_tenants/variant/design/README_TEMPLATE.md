# Tenant Design

Tenant-local design surfaces live here.

Resolve the governing method from the exact installed STDO basis in the
applicable Product Definition and use `build_tenants/common/design/` for shared
realization law.

## Adopted Common Surfaces

List the exact shared surfaces from `build_tenants/common/` that this tenant
adopts.

- Shared design law under `build_tenants/common/design/`
- Shared qualification law under `build_tenants/common/qualification/` when it
  constrains tenant-local tests or evidence

If no common surface is currently adopted, say that explicitly.

## Computational And Execution Binding

Bind this tenant under the selected method's `SPEC_METHOD.md` §11:

- governing requirements and their exact basis:
- computational calculus: the objects, operations, constraints and result
  meanings used to realise those requirements:
- concrete execution environment: technology stack, human process or mixed
  process, with the capability and resource assumptions it requires:
- binding from the calculus to that environment, including authority,
  evidence, effects, uncertainty and recovery:
- conformance evidence for the requirements and the execution binding:
- remaining obligations, unsupported claims and their owners:

A shared calculus may have several execution bindings. The actor's identity
selects neither a calculus nor an operation kind. Record any required
independent assessment or human decision without replacing it with a matching
output. Adopt a profile only through the existing authority that owns it.

## ADRs

Tenant-local Architecture Decision Records live under `design/adrs/`.

ADRs are the durable design memory layer per `SPEC_METHOD.md` section 10, Design records. Use `design/adrs/ADR-NNN-short-slug.md` as the default filename pattern; namespace-prefixed local IDs are permitted when this tenant's design surface already uses them.

Cross-tenant decisions belong under `build_tenants/common/design/adrs/`, not here.

See `design/adrs/README.md` for the full ADR conventions and `design/adrs/ADR_TEMPLATE.md` for the canonical ADR shape.

## F_P Customization

Use `design/fp/` to describe tenant-local F_P tuning for bounded constructive turns.
