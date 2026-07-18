# T-252 Repaired Body And Schema Ownership Self-Review

## Scope

This checkpoint realizes only the accepted T-252 design at digest
`f1e119d5f38209409310c7f3631c3b3ee10663c02464b218cdae80e2e8e25444`.
It changes the canonical pure-data Consensus Module, its existing native
contract family, and the T-252/T-263 proof surfaces. It does not change T-270,
T-272, M04 admission, T-274B publication, the public catalog, or runtime
execution.

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
remain independent assertions. The older T-275 design that admits only a
`closed_done` result is stale against `REQ-P-CONSENSUS-008A`,
`REQ-P-CONSENSUS-017`, and this later accepted T-252 terminal partition. It must
be repaired downstream; the canonical body must not be narrowed back to hide
that design gap.

The same review found that the first fifteen-source implementation was not
directly consumable by the accepted T-281 projector: it was an array without
owner-source locators, and numeric array positions are not lawful locator
members. The repair makes the family a keyed map whose rows are themselves
`OwnerNativeContractSourceRow` values. The focused proof resolves every row
through `resolveSemanticBuildNativeSchemaSource`, derives all fifteen asserted
native definitions, and exact-matches each resulting contract coordinate.

## Evidence

- repaired body digest:
  `sha256:88b01c74ccce70a6cbce47d7db67ddb508666debd0b4402408451b02a0d528c2`
- regenerated probe manifest digest:
  `sha256:064d84e04369921002762d042f27f7e3f1fd4d48d3d7e4171ca128dd58f4090b`
- strict TypeScript build: pass
- GTL law: 82/82
- T-252 focused body/admission/probe: 15/15 and exact manifest check
- T-263 strict Module plus T-252: 24/24
- T-274A projector and artifact proofs: 11/11
- Consensus Prime projection: 6/6
- Prime gate: pass; Prime gate tests: 9/9
- host lint: zero findings
- `git diff --check`: pass

## Remaining Boundary

T-252 is implementation-complete for this isolated slice, not release-closed.
T-274B must still derive the exact fifteen asserted native definitions, prove
the total M04 key join, keep six non-reachable public assets outside the join,
and prove that no private key enters the public catalog. T-270/T-272 own runtime
admission and continuation after their separate checkpoints merge.
