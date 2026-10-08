# Standards Templates

This directory holds starter templates for shared specification surfaces and
agent bootstrap surfaces.

Use these templates as source material for project-local files such as:

- `stdo_default.json` or `stdo_<label>.json`, copied from
  `PRODUCT_DEFINITION_TEMPLATE.json`
- `GOALS.md`
- `INTENT.md`
- `PRODUCT.md`
- `CLAUDE.md`
- `AGENTS.md`
- a Product-owned Project Reference-Frame Basis copied from
  `PROJECT_REFERENCE_FRAME_BASIS_TEMPLATE.md`

## Product Definition Overlay

`PRODUCT_DEFINITION_TEMPLATE.json` is the one per-product fill-in overlay. Its
normative schema is `../schemas/product-definition.schema.json`.

The current schema identity is `urn:stdo:schema:product-definition:3`. Revision
3 replaces the undifferentiated `constitution.authorities` array with one
explicit STDO source, mutable version-line selector, exact installed basis and
manifest digest, plus `additional_authorities`. Constitutional entrypoints are
basis-qualified objects, and `agent_bootstrap` declares the entrypoint and local
instruction targets managed between stable markers. Other Product Definition
relations retain their revision-2 meaning.

Copy it to the logical root of one product definition:

- use `stdo_default.json` for a singleton default project;
- use `stdo_<label>.json` for a named product;
- place several `stdo_<label>.json` files at one monorepo root when that root
  hosts several distinct product `WHAT` definitions; or
- place one or more definitions at arbitrarily deep nested project roots in a
  hierarchical repository.

The containing directory is the definition root. Resolve relative URI
references from the copied JSON file. Fill its bindings over the project's
existing files and systems; do not restructure an existing project merely to
match the default paths in the template.

The template's `$schema` value is relative to the same exact logical release
basis selected in `constitution.stdo.basis`; it contains no machine-local store
path. Install the cut once through the STDO toolchain manager and resolve the
`stdo:` URI through that manager. A project-local `.genesis` copy is not
required.

One definition represents one distinct product `WHAT`. Put multiple
independent realizations of that same `WHAT` in `how.build_tenants`, not in
additional definition files.

`reference_frame_bases` is required and non-empty. Point each `uri` at the
accepted project frame-basis declaration already carried by Product,
requirements, local constitutional authority, accepted design, or another
lawful surface. Bind every admitting authority and exact governed scope. The
default path uses `./specification/REFERENCE_FRAME_BASIS.md`; replace it when
the owning project chooses another layout. Do not put agent identities or
temporary frame activations in the Product Definition Overlay; their authorized
work instruction or activation packet cites the applicable basis.

`PROJECT_REFERENCE_FRAME_BASIS_TEMPLATE.md` is the copyable structured-prose
starter for that referenced declaration. It projects the normative binding law
from `SPEC_METHOD.md`; it does not become authority by being copied. A project
may use another carrier when it preserves the same exact sources, roles,
frames, grants, results, coverage, invalidation, and re-entry relations.

The template includes one `local_constitution.disambiguations` placeholder to
show the complete binding. Replace it for every material local term resolution,
or remove it and retain an empty array when the product has none. Each binding
names the exact term, target bounded context, complete material candidate set,
selected concept, owning resolution carrier and authority, semantic bases, and
governed scope. When candidates cross contexts, the referenced `uri` also owns
the complete import, translation, or equivalence relation required by
`SPEC_METHOD.md`; the JSON entry does not restate that meaning.

Replace at least:

- `$schema` with the exact immutable release URI selected below;
- `product.definition_id`, name, source-project locator, and bounded-context
  declaration, keeping definition identity distinct from immutable Product and
  release identities;
- `constitution.stdo.source.repository`, the non-operative
  `stdo://channels/<version>` selector, and the exact
  `stdo://releases/<immutable-rc>/` basis plus installed-manifest digest;
- every additional constitutional authority, basis-qualified entrypoint, agent
  bootstrap target, and local constitutional relation;
- every retained disambiguation placeholder, including its term, context,
  candidate concepts, selected concept, authority, basis, and scope;
- collective reference-frame basis URIs, admitting authorities, and scopes;
- Intent, Product, and specification URIs;
- shared and tenant-local `HOW` URIs;
- Goals, ticket, comment, and optional sprint carrier URIs; and
- explicit composition edges to other `stdo_*.json` definitions, including
  expected target definition identity, relation authority, and at least one
  governing contract.

Set `product.bounded_context` to `null` when the product does not claim a
separate enclosing bounded context. The field is not an exhaustive registry;
subordinate, peer, composed, tenant, user, and runtime contexts remain in their
own authority and are related explicitly. Remove the illustrative
disambiguation when it does not apply. Empty local-constitution and composition
arrays are explicit declarations of none.

Portable Draft 2020-12 schema validation proves JSON shape. Use an
assertion-capable RFC 3986 validator for the annotated URI and URI-reference
formats, then resolve every URI and fragment, verify the selected immutable
constitutional set, confirm unique definition and tenant identities, verify
composition target identities and contracts, and evaluate constitutional
sufficiency, semantic resolution, cross-context relation completeness, and
authority congruence under `SPEC_METHOD.md`.

For a filled definition, `stdo sync --definition <file>` installs and verifies
only its already selected exact basis. Run
`stdo adopt --definition <file> --dry-run` to show the immutable cut currently
advertised by its annotated version-line selector and its exact plan digest;
apply with `--accept-plan-sha256 <digest>` in a separate invocation only after
explicitly accepting that basis change. `stdo bootstrap --definition <file>`
preflights targets relative to `product.source_project` and refreshes only the
declared marker-bounded agent bootstrap. Fleet writes require `--all`; fleet
adoption also requires its separately presented aggregate plan digest.
