# T-252 Repaired Body And Schema Ownership Self-Review

## Scope

This checkpoint realizes the accepted T-252 design at digest
`f1e119d5f38209409310c7f3631c3b3ee10663c02464b218cdae80e2e8e25444`.
It changes the canonical pure-data Consensus Module, its existing native
contract family, and the T-252/T-263 proof surfaces. The integration repair
also contracts metadata ordering into the neutral T-270 M03 authority and
proves the real T-252 Module through M04 admission. It does not change T-272,
T-274B production delivery, the public catalog, or runtime execution.

## Realized Relation

- Both F_H leaves now target `ConsensusRoundDisposition` and declare
  `escalate_fh`; `FhPendingInteraction` is absent from the GTL node/value graph.
- Bounded recurse declares `closed_done | escalate_fh` as terminal and
  `recurse_next_round` as its only foldback outcome.
- The outer result vector accepts both terminal outcomes.
- `CONSENSUS_RUNTIME_SCHEMA_SOURCE_FAMILY` contains exactly thirteen direct
  native schemas and two native Vector schemas. Three keys reuse standing
  public identities; twelve are engine-private definitions.
- The family is one keyed, addressable owner-source map. Every row carries the
  canonical T-281 `sourceLocator` and `namedChecks` coordinate; the runtime list
  is derived from that map and introduces no second source registry.
- The Module contains one strict
  `abg.runtime_schema_admission_bindings` entry with 34 containment-derived
  rows. Each row has only
  `{graphFunctionId,nodeRef,symbolicSchemaRef,contractId,contractVersion}`.
- Semantic admission rejects missing, duplicate, extra, divergent, reordered,
  generated-field, and non-source rows.

## ODD And Prime Review

- The constructive carrier remains the existing seven-GraphFunction GTL
  Module. No controller, traversal loop, runtime selector, prompt shell, event
  writer, or Consensus-specific execution path was introduced.
- Native schemas remain authored once in `CONSENSUS_DOMAIN_SCHEMAS`; the
  runtime source family is a keyed projection over those exact schema objects.
  The two Vector schemas are derived from their member schemas once.
- Module metadata is subordinate containment projection. It contains no M04
  coordinate, digest, locator, native symbol, projection witness, callable, or
  admission result.
- No public operation, capability, schema identity, catalog row, registry, or
  store was added.
- The static body import closure still reaches none of runner, transport,
  events, app, qualification, or bin implementation directories.

One defect was found during self-review: the first repair made recurse terminal
for `escalate_fh` while leaving the outer result route restricted to
`closed_done`. The checkpoint repairs that mismatch and pins both terminal
outcomes at the result projection.

One later Prime review also found duplicate Consensus version authority between
the M03 family and T-274A. M03 now exports the sole
`CONSENSUS_CONTRACT_VERSION`; T-274A consumes that value, while test literals
remain independent assertions. T-275 subsequently repaired its result family
and was accepted at digest
`d6480a9224df2d1268da80d687fedf75a2d60dcc36ba81e6256e89535f30985a`.
The canonical body remains the authority for its terminal partition.

The same review found that the first fifteen-source implementation was not
directly consumable by the accepted T-281 projector: it was an array without
owner-source locators, and numeric array positions are not lawful locator
members. The repair makes the family a keyed map whose rows are themselves
`OwnerNativeContractSourceRow` values. The focused proof resolves every row
through `resolveSemanticBuildNativeSchemaSource`, derives all fifteen asserted
native definitions, and exact-matches each resulting contract coordinate.

A later cross-path review found one remaining duplicate authority: T-252 used
locale ordering while M04 required code-point ordering. The repair defines one
neutral metadata row key/comparator/canonicalizer, consumes it from T-252 and
M04, and proves the actual 34-row T-252 Module joins all fifteen definitions.

The generic join review then found two boundary defects rather than a
Consensus defect. M04 initially accepted a partial Module metadata family, and
the zero-symbolic path incorrectly rejected lawful `runtime_ref`-only
GraphFunctions. The final repair derives the complete symbolic tuple census
from Module containment before joining definitions, rejects any selected or
non-selected omission, and admits zero requirements only when that derived
census is genuinely empty. Both a mixed Module and an all-`runtime_ref` Module
are pinned.

## Evidence

- repaired body digest:
  `sha256:dc4686b3acd145181ffa58c9377bc33f5324914139b38f052aec53060a21c1c8`
- regenerated probe manifest digest:
  `sha256:ed51074e47e1e5c469f2077d095d605ce1845d156d086162b04ac097450d5321`
- strict TypeScript build: pass
- GTL law: 82/82
- T-252 focused body/admission/probe: 15/15 and exact manifest check
- T-263 strict Module plus T-252: 24/24
- T-274A projector and artifact proofs: 11/11
- T-270 runtime-schema admission: 9/9
- neutral T-270/T-272 contracts: 9/9
- Consensus Prime projection: 6/6
- Prime gate: pass; Prime gate tests: 9/9
- full semantic suite: 1928/1928
- generated publication: 40 assets from 1241 immutable payloads
- host lint: zero findings
- `git diff --check`: pass

## Remaining Boundary

T-252 is ticket-closed, not a 5.0 release claim. The completed-ticket probe has
digest
`sha256:ed51074e47e1e5c469f2077d095d605ce1845d156d086162b04ac097450d5321`.
T-274B still owns process-local production supply, packaging, and publication;
T-270/T-272 own runtime admission and continuation. The sole observed active
compiler gap is T-268 tenant-conformance-manifest coverage.
