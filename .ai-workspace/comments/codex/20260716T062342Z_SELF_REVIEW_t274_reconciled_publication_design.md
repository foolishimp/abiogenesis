# T-274 Reconciled Publication Design Self-Review

## Subject

- ticket: `T-274`
- design: `M02_M04_CONSENSUS_PUBLICATION_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md`
- semantic candidate digest independently reviewed: `bbc456bbd936c52e078a41365f1315eee79e973cd9928798fcbc78656b6cb547`
- accepted design digest after status-only promotion: `930c26a2fa5e144ebe0d0ba1aa639fd2aaf531b51e4b5921df434860718313e8`
- ontology digest: `f817a7e730bec935f053138e85cb09aa6e0f693e558eaf287be502803da20ee8`

## Result

The reconciled design preserves one `ConsensusContractFamily`, nine
addressable schema identities, two derived vocabularies, and one canonical
Module-owned GraphFunction declaration. It keeps three authorities distinct:

1. AF-24 publishes the `PublicContractCatalog` rows.
2. AF-24 publishes the GraphFunction declaration through a
   `ContributionManifest`.
3. AF-08 admits that contribution into the workspace-bound `Catalog`.

The admitted `GtlProgram` binds the GraphFunction itself. Neither the Module,
contribution, nor catalog row proves program membership, selection, intent, or
execution authority. Historical catalog and manifest truth remains evidence;
the design adds no public retirement operation, Consensus operation, or legacy
`catalog.invoke` facade.

## Independent Review

Independent review rejected the first candidate for merging public-contract
and contribution catalog authority, binding the program to a catalog row, and
inventing row retirement. The bounded repairs were re-reviewed and accepted.
The remaining wording correction was applied before this checkpoint: GTL/M02,
not AF-24, owns Module declaration truth.

## Gates

- exact design Mermaid: 3/3 rendered with the pinned renderer
- Pandoc: pass
- Prime contraction: pass
- DS governance: pass
- `git diff --check`: pass

No runtime implementation is accepted by this review.
