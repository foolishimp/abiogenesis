---
kind: authority_compression_asset
asset_ref: authority-compression://stdo/axiomatic-calculus/v1
source_ref: ../AXIOMATIC_CALCULUS.md
source_digest: cbe2edb928d3e75e23446f6d525baea664966e8d5920e6fa389cbaa4af8f1f8d
compression_profile: prompt_authority_compact_v1
target_prompt_families:
  - transform
  - evaluate_design_depth
  - evaluate_review_grade
generated_by: codex
generated_at: 2026-08-29
stale_if_source_digest_changes: true
---

# STDO Axiomatic Calculus Compressed Authority

## Identity And Boundary

`a_c` is the domain-specific, carrier-neutral constitutional calculus owned by
`AXIOMATIC_CALCULUS.md` in
`urn:stdo:bounded-context:axiomatic-calculus`. Its stable concept identity is
`urn:stdo:concept:axiomatic-calculus:a-c`.

It makes no claim of universal applicability, logical completeness,
consistency, decidability, soundness, or category-theoretic status except where
separately proved for an exact scope.

Exact predecessor STDO principles derive `a_c`; application to any subject is
a separately owned downstream relation. Keep three governed layers distinct:

```text
a_c       = pure constitutional calculus
a_c.X     = content-first interpretation of exact subject X
a_c.X.C   = content-first carrier-C encoding of that model
```

Acceptance and admission are external judgments over the latter two unchanged
layers. A layer becomes a released Product only through separately authorized
Product acceptance and release.

The calculus contains no selected subject interpretation, carrier profile or
bytes, runtime, repository layout, deterministic semantic assessor, or
downstream Product binding.

## Model Kernel

One closed signature declares the fixed core record kinds, all sorts, relation
kinds, constraint kinds, residual kinds, functor kinds, judgment kinds, stop
kinds, their fields, value domains, and reference domains. The finite core
record kinds are semantic object, typed relation, constraint, latitude,
residual, traversal, transformation, and judgment. One model is:

```text
RecordKind_ac = {
  urn:stdo:concept:axiomatic-calculus:record-kind:semantic-object,
  urn:stdo:concept:axiomatic-calculus:record-kind:typed-relation,
  urn:stdo:concept:axiomatic-calculus:record-kind:constraint,
  urn:stdo:concept:axiomatic-calculus:record-kind:latitude,
  urn:stdo:concept:axiomatic-calculus:record-kind:residual,
  urn:stdo:concept:axiomatic-calculus:record-kind:traversal,
  urn:stdo:concept:axiomatic-calculus:record-kind:transformation,
  urn:stdo:concept:axiomatic-calculus:record-kind:judgment
}

M_b = (b, I, O, E, C, L, X, V, T, J)
```

`b` is exact basis; `I` identities; `O` typed semantic objects; `E` typed
directed relations; `C` constraints; `L` explicit latitude; and `X` residual
uncertainty; `V` traversals; `T` transformations; and `J` judgments. A total
finite population map assigns every fundamental record to exactly one of those
families. Record identities are unique across their disjoint union; every
remaining identity resolves exactly once through a declared external target.
The exact model identity also commits `External_M` and one exact
`Resolution_M(x)` coordinate for each external identity: reference domain,
external target kind, resolved target identity, basis relation, resolution
basis, and evidence identity.
A traversal, transformation, or judgment is not smuggled into `O` by reifying
its name as a semantic object. Unknown or shadowed record kinds, missing or
extra populations, duplicate identities, and hidden records refuse.

Every fundamental record directly binds exact context, owner, scope, and
basis; every constraint also names its judgment kind. The closed
`RefDomain_Sigma(record_kind, field)` function declares each identity-bearing
field's cardinality, allowed local record families, semantic-object sorts where
applicable, external target kinds, and `required_basis_relation`. References
resolve across the exact model
populations; wrong-family, wrong-sort, ambiguous, dangling, or undeclared-field
references refuse. Equal spelling, value, carrier, or graph position creates
no identity or equivalence. Authority and residuals survive interpretation,
projection, overlay, transformation, and encoding.

## Core Operations

- `closure_R(M,Z)` is the least finite unique lawful record closure under one
  exact dependency family. It is not a claim of minimal prose, tokens, or cost.
- `project(M,Z,R)` returns the material closure and an explicit boundary of
  excluded, external, unresolved, translated, and invalidation-sensitive
  seams. Required members cannot be silently trimmed.
- An overlay adds explicit records to declared model populations without
  mutating its basis. Override, equivalence, specialization, translation, and
  disambiguation are typed owned relations, never nominal inference.
- Transformation `t` is an operation-bearing specialization of one exact
  traversal. It directly binds context, owner, scope, basis, operation
  authority, domain and codomain models, preconditions, preservation,
  additions, removals, residuals, provenance, invalidation, and re-entry.
  `domain_model` and `codomain_model` resolve exact complete model identities,
  not locators, family names, or projections. Ordinary transformation requires
  equal model, transformation, and traversal bases and one signature. Every
  cross-basis or cross-signature migration instead requires one separately
  identified specialization with exact composite-basis and compatible
  signature-extension relations; a changed basis or record kind is removal plus
  introduction, never preservation. Every
  preserved record retains record kind, identity, direct coordinates, and
  basis, and is either byte-identical under one exact shared grammar or equal
  under one exact typed equality relation binding both model identities and
  bases. Equivalence or meaning preservation connects removed and introduced
  identities; it cannot retain an identity. Broader or mismatched traversal,
  model, equality, or basis coordinates refuse. `T[t](M_b,inputs)` returns a
  proposed successor; it does not mutate or admit its input. The declared delta
  is closed over every population: every input local-record identity is exactly
  preserved or removed, every successor local-record identity is exactly
  preserved or introduced, introduced local records are absent from the input,
  removed local records are absent from the successor, and material residuals
  are retained or exactly dispositioned. A separate closed external delta
  partitions every domain resolution into `external_preserved` or
  `external_removed`, and every codomain resolution into `external_preserved`
  or `external_introduced`; introduced resolution coordinates are absent from
  the domain and removed resolution coordinates from the codomain. Every
  preserved resolution coordinate has one exact witness binding both model
  identities and two field-equal resolution tuples. A changed external
  resolution is removal plus introduction of the new coordinate, never
  preservation, even when the referenced external identity is unchanged. Any
  unclassified, silently retained, or silently dropped local record or external
  binding refuses.

  ```text
  Local_b       = P_t disjoint_union R_t
  Local_b_prime = P_t disjoint_union N_t
  N_t intersect Local_b = empty
  R_t intersect Local_b_prime = empty

  E_b       = EP_t disjoint_union ER_t
  E_b_prime = EP_t disjoint_union EN_t
  EN_t intersect E_b = empty
  ER_t intersect E_b_prime = empty
  ```

  `external_resolution_witnesses` contains exactly one
  `ExternalResolutionPreservationWitness` per member of `EP_t`, with exactly
  `external_resolution`, `domain_model`, `codomain_model`,
  `domain_resolution`, `codomain_resolution`, `decision: equal`, and
  non-empty `evidence`. Both resolution tuples are exactly field-equal; missing,
  duplicate, extra, or differently resolved witnesses refuse.
- A judgment points to an unchanged exact subject and binds kind, digest,
  basis, evaluator, authority, decision, evidence, provenance, and time.
  Judgment does not transform, reissue, or rename its subject.

## Traversal Functor Kinds

The generic functor-kind identities are:

```text
F_D = urn:stdo:concept:axiomatic-calculus:f-d
F_P = urn:stdo:concept:axiomatic-calculus:f-p
F_H = urn:stdo:concept:axiomatic-calculus:f-h
```

Use only:

```text
F_K[v](X_v) -> Y_v | Omega_v
```

`v` is one exact typed traversal. `F_D` classifies deterministic evaluation or
proof and returns a judgment rather than performing the domain construction.
`F_P` classifies bounded probabilistic interpretation, construction, or
proposal without acceptance authority. `F_H` classifies explicit human
adjudication under an exact identity and grant; human presence grants no
ambient authority.

These generic identities are introduced by `a_c`. They are not imported from
an equal-spelled graph, runtime, ODD, or application shorthand. Exact
predecessor Reference Frame Position/Evaluation clauses supply probabilistic
construction as a bounded evaluation class; `STDO-UP-020` supplies delegated
probabilistic construction, exact candidate production, and
construction-versus-assessment separation. The remaining derivation provenance
supplies human-adjudication, authority, evidence, and refusal principles;
nominal spelling supplies no import or equivalence.

Actor, executor, domain operation, and functor kind are distinct. Named
operations such as `Interpret`, `Encode`, `Serialize`, and `Measure` are not
`F_*` aliases. Two traversals sharing a kind do not share identity or contract.
Composition requires exact type and gate compatibility and preserves every
intermediate result, judgment, evidence, authority, provenance, and stop state.
The calculus prescribes no universal `F_P -> F_D -> F_H` topology.

An external application may declare a typed import, translation, or
specialization under its own exact authority and basis. Such a relation remains
external and cannot enter or amend the calculus.

## Interpretation And Admission

`Interpret_a_c` binds the exact calculus basis, subject population, signature,
mapping, residuals, provenance, structural evaluation, semantic acceptance,
source re-entry, and invalidation. Structural checks can prove closed shape,
identity, reference, and basis properties; they cannot prove semantic fidelity
or human acceptance.

Carrier encoding is separate:

```text
J_X = Accept_X(M_X) -> accepted | refuse
G_C = Encode_C(M_X,J_X) where J_X = accepted
D_C = F_D[v_carrier_admission](G_C, Profile_C, CarrierBasis_C)
      -> admitted | refuse
```

Encoding additionally requires an external accepted semantic judgment `J_X`
whose subject identity and digest exactly equal `M_X`. `J_X` remains outside
both content identities but is retained with `D_C` in the admitted evidence
triple `(G_C,J_X,D_C)`. `D_C` judges unchanged bytes.

An exact `AxiomaticCalculusBasis` is an external record with exact kind
`stdo.axiomatic-calculus-basis`, schema version `1`, and the calculus concept
identity. It uses RFC 8785 JCS bytes; duplicate object names refuse.
`derivation_basis` binds an absolute immutable accepted predecessor release,
its exact manifest bytes, and a non-empty, duplicate-free, unsigned-UTF-16
sorted `principle_refs` population. Every reference resolves an exact member
byte digest and heading fragment in that predecessor. The distinct
`publication_basis` binds an absolute immutable successor release, exact
manifest bytes, exact calculus `member_uri`, and `member_sha256`. Same-carrier
or cyclic derivation refuses. Publication and cross-context relations are not
derivation provenance. An `a_c.X`
content-first identity additionally binds the subject, interpretation contract,
selected model content, and semantic-selection ledger. Its external acceptance
judgment points to that unchanged identity. An `a_c.X.C` content-first identity
binds the model, carrier Product or cut, encoding profile, and canonical bytes.
Its external semantic prerequisite and admission judgment point to unchanged
subject identities. Neither judgment is embedded into the identity of its own
subject.

```text
id(AxiomaticCalculusBasis)
  = urn:stdo:axiomatic-calculus-basis:sha256:
    + sha256(JCS(AxiomaticCalculusBasis))
```
