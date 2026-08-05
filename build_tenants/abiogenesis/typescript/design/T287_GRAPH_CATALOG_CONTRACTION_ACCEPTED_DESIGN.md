# T-287 Graph Catalog Contraction Accepted Design

## Authority

This design is the accepted bounded correction for the active T-287 slice. It
implements the Product authority split and `REQ-P-CATALOG-030`. It supersedes
every catalog, catalog-view, catalog-application, registry-entry, and catalog
Event Calculus relation in the terminal-quiescence design. Other conforming
execution relations remain donor candidates subject to code review.

## Construction

Published GTL GraphFunction definitions are the semantic source. The one public
`catalog.admit` operation is a pure readiness validator and constructor. It
consumes one exact workspace binding, resolved lock, installed and verified
Product set, descriptors, contribution manifests, dependency/compatibility
results, provenance, and publication set. It refuses an unrelated workspace,
missing direct dependency, incompatible edge, mismatched artifact, or divergent
provenance before returning one immutable `GraphFunctionCatalog` snapshot and
typed row dispositions.

HoG consumes that plain dictionary. Equal complete bases produce byte-identical
snapshots regardless of caller order. A changed exact complete basis produces a
replacement snapshot. Cache loss changes neither result nor acceptance.

The catalog provides lookup, ordered enumeration, pure narrowing, and dynamic
refresh. Canonical handle collision is fail-closed; unequal definitions,
owners, contracts, Program membership, or publication provenance never use
last-write-wins. Non-callable declarations use separate typed pure indexes and
cannot enter callable lookup.

Catalog readiness, view, and deterministic declaration application have no
runtime event, Event Calculus fluent, replay lifecycle, process-object brand,
or RootOperationState ledger. The immutable catalog result records its complete
validated construction basis and row dispositions; it is reconstructible and
does not become persistent runtime truth.

HoG consumes the exact snapshot. The owning invocation validates and records
the catalog basis, GTL definition, selected fibre, selected plan, and any
application refs/digests. ABG events and Event Calculus begin at execution and
own the causal facts and admitted effects that explain workspace mutation.

## Hard Break

Delete or rebind every reachable competing path in the same cut:

- catalog and view artifact events;
- `registry_entry_admitted` catalog membership and its Event Calculus effects;
- catalog replay/currentness projectors;
- eventful or process-branded candidate/view/application lifecycle APIs;
- catalog semantic WeakMaps and WeakSets;
- RootOperationState catalog, view, and application maps;
- Public and ABG consumers of those paths; and
- tests or proof artifacts that treat catalog tool state as runtime truth.

No compatibility adapter translates an old admitted catalog into the new
snapshot.

## Proof

The candidate proves deterministic construction under permutation and cache
loss, dynamic addition and replacement, exact duplicate and collision law,
complete workspace/lock/install/dependency/compatibility/provenance validation,
cross-workspace and direct-edge refusal, pure narrowing/application, exact HoG
and invocation binding, zero catalog lifecycle events or fluents, zero
reachable process-local catalog authority, and causal replay of the resulting
execution and workspace effects.
