# REQ-P-CATALOG - Catalog Product And Public Catalog Contract

**Status**: Active - accepted by T-283 F_H closure
**Category**: Capability
**Date**: 2026-07-11
**Derives from**: [PRODUCT.md](../../PRODUCT.md), [REQ-P-INSTALL.md](REQ-P-INSTALL.md), [REQ-P-POLICY.md](REQ-P-POLICY.md)
**Wave**: ABG 5.0 target admission

---

## Purpose

Abiogenesis admits immutable product contributions into one ABG-owned catalog.
Publishing a catalog product supplies declarations and policy; it does not give
the publisher runtime, traversal, event, continuation, or closure authority.

This family defines the product descriptor, contribution, dependency, lock,
provenance, conflict, visibility, callability, and session-allowlist contract
required by the ABG 5.0 product line.

## Catalog Product Identity

**REQ-P-CATALOG-001**: Every catalog product shall publish one immutable,
versioned product descriptor. The descriptor shall identify its schema version,
publisher namespace, product identity, product version, compatibility
predicates, contribution-manifest identity, declared dependencies, artifact
content digest, provenance reference, and declared capability or effect
summary.

**REQ-P-CATALOG-002**: A product descriptor shall identify one exact immutable
artifact. Reusing the same publisher, product, and version identity for
different descriptor, contribution, or artifact content shall be a typed
identity conflict.

**REQ-P-CATALOG-003**: The descriptor and contribution manifest shall be
publisher-authored product truth. Catalog admission may verify, reject, and
project that truth, but shall not infer missing contribution declarations from
files, runtime observations, adapter metadata, or prior installations.

**REQ-P-CATALOG-004**: A catalog product shall not acquire authority merely by
being installed, bound, present in a registry, or visible in a catalog.
Installation, workspace binding, catalog admission, readiness, session
visibility, authorization, and invocation are distinct product states.

## Contribution Manifest

**REQ-P-CATALOG-005**: Every catalog product shall publish one immutable
contribution manifest bound to its descriptor and artifact digest. Every
contribution row shall identify a canonical handle, contribution kind,
declaration or contract reference, owning product identity, compatibility
requirements, provenance, and any readiness prerequisites.

**REQ-P-CATALOG-006**: The public ABG 5.0 catalog kinds shall include:

- `graph_function`
- `node_type`
- `overlay`

The product may retain additional internal kinds, but an internal kind shall
not become public merely because an implementation stores it in the same
registry.

**REQ-P-CATALOG-007**: `GraphFunction` shall be the sole public named callable
catalog kind. A node type, overlay, policy, interface, plugin, public start,
candidate family, role, job, or other declaration shall not be invoked as if it
were a GraphFunction.

**REQ-P-CATALOG-008**: Public presence of `node_type` and `overlay` rows shall
provide list and describe semantics. Presence alone shall not authorize
application, traversal, worker dispatch, event emission, continuation, or
closure. A non-callable application contract shall be a complete canonical
deterministic construction from an admitted immutable install, deterministic
catalog view, exact declaration, and explicit durable-prefix coordinate. Equal
independently reconstructed inputs shall produce an acceptable equal carrier.
Construction shall not admit an event, change runtime truth, or depend on an
originating object, store, context, constructor brand, ambient capability, or
actor identity. The invoking owner shall revalidate the carrier and its inputs
against ABG truth and record its exact use in the owning invocation event.

**REQ-P-CATALOG-009**: A contribution manifest shall not republish generic ABG
catalog truth as product-owned content. A publisher may publish its own domain
vocabulary, overlays, policy, schemas, and specialization-owned GraphFunctions;
HoG owns direct traversal. ABG owns admission, readiness, selection truth,
GraphCall, replay, and
closure.

**REQ-P-CATALOG-009A**: The ABIogenesis product may publish SYSTEM-owned reusable
GraphFunctions in its own native catalog when PRODUCT names them as product
capabilities. The canonical Consensus function is such a row. Downstream
products may bind declared reviewer profiles, subject contracts, policies, and
overlays to that function, but shall not republish or shadow its canonical
handle, graph body, outer contracts, or SYSTEM ownership.

## Dependencies And Resolved Locks

**REQ-P-CATALOG-010**: Product dependencies shall be declared in the product
descriptor. Each dependency shall identify the required product, an admitted
version or compatibility constraint, and any required public contract or
contribution capability.

**REQ-P-CATALOG-011**: Dependency resolution shall produce one immutable
resolved lock before installation or binding. The lock shall identify the exact
selected product versions, descriptor identities, artifact content digests,
contribution-manifest identities, compatibility results, and dependency edges.

**REQ-P-CATALOG-012**: The resolved lock shall be complete for the products
selected into one workspace binding. An unresolved dependency, incompatible
version, missing required contract, dependency cycle, or ambiguous selection
shall produce a typed refusal and shall not be silently satisfied from a source
checkout, ambient package, prior workspace, or mutable local path.

**REQ-P-CATALOG-013**: A resolved lock shall not change through automatic
upgrade or ambient re-resolution. Selecting different product bytes requires
an explicit new resolution and a new lock identity. ABG 5.0 does not thereby
claim update, disable, unbind, uninstall, retirement, revocation, or
supersession lifecycle behavior.

## Admission, Provenance, And Conflicts

**REQ-P-CATALOG-014**: Catalog admission shall verify coherence among the
workspace lock, installed artifact identity, product descriptor, contribution
manifest, declared dependencies, and compatibility results before any
contribution becomes ready or callable.

**REQ-P-CATALOG-015**: Every admitted catalog row shall preserve publisher,
product, version, descriptor, contribution-manifest, declaration, artifact
digest, dependency-lock, and admission provenance sufficient for a public
consumer to identify the source product without inspecting its source tree.

**REQ-P-CATALOG-016**: Two rows claiming the same canonical catalog identity
with different owning product, declaration, contract, or content identity shall
fail as a typed conflict. Catalog order, install order, adapter preference, or
unqualified metadata shall not silently shadow an admitted canonical identity.

**REQ-P-CATALOG-017**: Re-admission of the same canonical row is idempotent only
when its owning product, descriptor, contribution, declaration, contract, and
content identities agree exactly.

**REQ-P-CATALOG-018**: Catalog metadata may describe already admitted rows, but
metadata shall not create authority, compatibility, readiness, eligibility,
callability, ranking, or closure truth. Storefront and recommendation ranking
metadata are outside the ABG 5.0 catalog contract.

## Public Read Contract

**REQ-P-CATALOG-019**: The public SDK and operator contract shall provide
source-blind catalog-list and catalog-describe variants of
`abg.operation.project.read` for the retained public kinds. The variants shall
be read-only projections over admitted catalog and workspace-binding truth.

**REQ-P-CATALOG-020**: A public list row shall expose at least the canonical
handle, kind, owning product and version, readiness, eligibility, callability,
session visibility, compatibility disposition, and provenance references.

**REQ-P-CATALOG-021**: Public describe shall expose the selected row's declared
contract or schema identity, dependency and compatibility disposition,
readiness blockers, owning product and artifact identity, and provenance. It
shall not expose a private runtime object as the public contract.

**REQ-P-CATALOG-022**: Unknown, ambiguous, incompatible, unbound, inadmissible,
or not-ready catalog identities shall remain distinguishable typed outcomes.
List or describe shall not collapse them into absence when the product can
truthfully report the reason.

## Session Allowlist

**REQ-P-CATALOG-023**: A start or invocation session may declare an allowlist
over admitted catalog identities. The effective session view shall be the
intersection of the workspace-authorized catalog and the declared allowlist and
shall be derived through `abg.operation.catalog.view`.

**REQ-P-CATALOG-024**: An allowlist shall be narrowing-only. It shall not admit
an unbound product, make an inadmissible or not-ready row eligible, change a
canonical identity, authorize a non-callable kind, or widen the workspace
catalog.

**REQ-P-CATALOG-025**: Unknown, duplicate, ambiguous, or unauthorized allowlist
entries shall fail with typed reasons before invocation. An empty effective
callable view shall remain a lawful explicit result and shall not activate an
unrestricted fallback.

**REQ-P-CATALOG-026**: Catalog list, describe, lawful-action, invocation, and
replay projections shall identify the effective session view when session
narrowing affects the result. Read behavior shall bind
`abg.operation.project.read`; invocation shall bind
`abg.operation.run.invoke`. Neither may rederive or widen the view.

## Bounded 5.0 Distribution Scope

**REQ-P-CATALOG-027**: Conformance to this family shall not require a hosted
registry, storefront, ranking service, billing service, organization RBAC,
signing service, or multi-user catalog administration. Immutable repository or
Git release artifacts with exact content identity are sufficient distribution
inputs for ABG 5.0.

**REQ-P-CATALOG-028**: The ABG 5.0 catalog contract covers initial resolution,
verification, installation, binding, admission, inspection, session narrowing,
typed declaration application, and GraphFunction invocation. These behaviors
bind respectively to `abg.operation.product.resolve`,
`abg.operation.product.verify`, `abg.operation.product.install`,
`abg.operation.workspace.bind`, `abg.operation.catalog.admit`,
`abg.operation.project.read`, `abg.operation.catalog.view`,
`abg.operation.catalog.apply`, and `abg.operation.run.invoke`. Product
lifecycle mutation and registry-entry lifecycle are outside this family until
separately admitted.

**REQ-P-CATALOG-029**: Public catalog admission shall consume one exact
workspace binding, resolved lock, verified product descriptors, and verified
contribution manifests and shall produce one admitted catalog identity plus a
typed disposition for every submitted row. Binding shall not imply admission,
and admission shall not imply session visibility, eligibility, callability, or
invocation. This is the `abg.operation.catalog.admit` definition; no catalog
store method or adapter path may publish a second admission operation identity.

**REQ-P-CATALOG-030**: ABIogenesis 5.0 shall publish typed non-callable
application contracts for admitted `node_type` and `overlay` rows. Node-type
application shall bind a published reusable type to admitted node or program
truth. Overlay application shall bind a published program composition over
admitted GraphFunctions, vectors, node types, starts, roles, policies, proof
obligations, and contracts. Product shall own application as the total
deterministic construction defined by REQ-P-CATALOG-008; it is not an
admission boundary. ABG shall remain the sole owner of runtime Product-catalog
admission and runtime truth. Neither kind shall invoke a worker, open a
GraphCall, emit a runtime event, or control traversal merely by being present
or applied. `run.invoke` shall revalidate the exact application against its
admitted inputs and durable prefix, and the owning invocation event shall
record the application ref and digest used. Both behaviors shall be closed
variants of `abg.operation.catalog.apply`; neither shall receive a separate
operation identity.

## Acceptance

The catalog product contract is satisfied only when a source-blind consumer can
bind exact product artifacts, inspect retained public contribution kinds
through `project.read`, narrow one session through `catalog.view`, apply a
node type or overlay through `catalog.apply`, and invoke a program-owned
admitted GraphFunction through `run.invoke` while:

- descriptor, contribution, dependency, lock, and provenance identities agree;
- incompatible, missing, ambiguous, duplicate, and shadowing cases fail typed;
- node types and overlays remain visible but non-callable;
- every execution-scoped invocation names the admitted GTL program that
  publishes the selected GraphFunction;
- catalog presence does not become runtime authority; and
- no hosted service, source checkout, private import, legacy operation facade,
  or second controller is required.
