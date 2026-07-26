# T-248 - Qualify And Release Stable ABIogenesis 5.0

- id: T-248
- title: Qualify and release stable ABIogenesis 5.0
- type: release
- ticket_category: release_qualification
- status: backlog
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- owner: abiogenesis
- priority: high
- governance_scope: RELEASE_METHOD, STDO Method
- change_class: realization_refactor
- re_entry_point: release_candidate
- created_at: 2026-07-12
- updated_at: 2026-07-16 (qualification-law and installed-RC authorization lineage bound)
- source_ticket: T-242
- admission_condition: >-
    T-249 is complete, every T-244 row admitted to 5.0 has closure evidence,
    and T-247 supplies one green ExactCandidateQualificationVerdict over the
    exact ExactCandidateQualificationBasis and QualificationLawBasis selected
    for the first RC
- dependencies:
  - completed T-244 exact 5.0 feature register
  - closure evidence for every retained T-244 row
  - completed T-247 self-conformance and qualification result
  - completed T-249 stable-baseline constitutional reprice

## Purpose

Own the immutable RC window, installed-RC qualification, terminal release
addendum, and direct final tap for the feature-complete stable ABIogenesis 5.0
product. This ticket is the sole owner of `ReleaseCut` and
`ReleaseSnapshotManifest` materialization in the 5.0 release wave.

The mutable 5.0 source project is authored and realized under STDO, accepted
three-view designs, GTL admission, the ABG semantic compiler, and the retained
T-244 feature gates. Release does not require ABIogenesis or odd_glc to build
5.0. Dogfooding begins only after stable 5.0 and belongs to the 5.0.1 wave.

## Scope

- Consume one immutable `ExactCandidateQualificationBasis` and one green
  `ExactCandidateQualificationVerdict` whose cited subject-basis and bound
  `QualificationLawBasis` refs/digests are identical.
  The source, package, public-contract catalog, schemas, generated assets,
  conformance manifest, proof inventory, and release metadata must identify the
  same content.
- Invoke `AF-25 materializeReleaseCut(published_rc, basis, verdict)` only after
  that exact match, producing one immutable versioned RC `ReleaseCut` and its
  exact `ReleaseSnapshotManifest`. Neither artifact is a prerequisite of the
  verdict that authorizes this transition.
- Fresh-install the latest published RC and run the T-244 row gates and T-247
  `ExactCandidateQualification` contract family against that installed RC's
  exact identity and bytes. Link the selected installed-RC qualification
  evidence as a separately immutable qualification addendum addressed by the
  RC cut and snapshot digests; the RC read projection may compose those records
  but no cut, snapshot, or pre-RC verdict is rewritten.
- Pack and fresh-install without mutable-source imports or rebuild fallback.
- Prove the retained installed public paths, including Hello World, declared C
  execution, malformed GTL and F_P differentials, the complete operator loop,
  Consensus, result/replay, native operation, and the bounded Codex projection
  exactly as their constitutional requirements and accepted designs define
  them, with closure traced by T-244.
- Publish at least one immutable versioned RC, hold a bounded mutable RC window,
  and publish a new RC after any product-significant fix. Every such fix creates
  a new qualification basis, a new same-basis verdict, and a new `AF-25`
  `published_rc` cut; no old basis, verdict, cut, or snapshot is mutated or
  relabeled.
- After the latest accepted RC qualifies, derive one prospective final
  candidate through a closed `FinalTapDelta` containing only the assigned final
  version and reconciled release-scoped assets. A deterministic diff shall
  refuse any product behavior, declaration, public-contract, dependency, or
  other product-significant change and reopen the RC window.
- Bind a new `ExactCandidateQualificationBasis` over the prospective final
  artifact, exact qualification-law basis, exact accepted-RC lineage, the exact
  installed-RC qualification basis ref/digest and same-basis green non-bypassed
  verdict ref/digest that authorize final derivation, and `FinalTapDelta`. The
  installed-RC evidence must bind the exact RC bytes and installed identity
  named by that lineage. Rerun every
  deterministic, install, identity, and bounded-behavior gate affected by that
  delta before publication under each gate's existing owning contract.
  Structurally admit their complete ordered same-basis citations through the
  same `QualificationGateResultVector<K>` contract used by T-247, then invoke
  the existing
  `C.of(AF-22 evaluateConformance(exact_candidate_qualification, ...))` total
  reducer and require its exactly-one same-basis green non-bypassed verdict.
- Invoke `AF-25 materializeReleaseCut(tapped_release, finalBasis,
  finalVerdict, finalDelta)` only after that pre-publication verdict and after
  verifying the basis-bound installed-RC authorization chain. Then invoke
  `AF-26 publishProduct` over the exact tapped cut, prospective final artifacts,
  and product toolchain manifest.
- Fresh-install the remotely published `5.0.0` product and link its bounded
  installed catalog, public invocation, Consensus, and replay result as a
  separately immutable terminal addendum to the same release read model. The
  addendum cannot change or make green any earlier qualification verdict.

T-244 is the sole derived feature/gate traceability inventory over
constitutional scope. This ticket may aggregate or rerun owning evidence; it
may not reinterpret a missing row, create a second checker, or waive a
definition-bearing claim.

## Prime Contraction Input

On activation, consume T-277 `PC-009` and the T-247 measured proof topology.
Reuse accepted source-blind product/install/catalog, runtime/operator,
Consensus, conformance, and release journeys without collapsing Git ref,
artifact, manifest, checksum, install, proof, or T-244 claim identity. Release
aggregation remains a read model over owning proof, not a new semantic checker.

## Release State Sequence

The release sequence is linear and basis-preserving:

1. T-247 produces pre-RC basis `B0` and green same-basis verdict `Q0`.
2. `AF-25(published_rc, B0, Q0)` materializes immutable RC cut `RC0` and
   snapshot `S0`.
3. The exact installed latest RC is qualified through the T-247 contract family;
   its basis and verdict are distinct from `B0/Q0` and are linked as an
   immutable RC-qualification addendum. The RC read projection composes the
   cut, snapshot, and addendum without mutating any of them.
4. A bounded product-significant fix returns to step 1 with new basis and
   verdict identities and publishes a new immutable RC. It never patches an
   existing cut or snapshot.
5. The latest accepted RC and its green installed-RC verdict authorize only
   derivation of a prospective final candidate. The future final basis binds
   the installed-RC basis and verdict refs/digests, and both must identify the
   exact accepted RC bytes, installed identity, and qualification-law basis. A
   closed `FinalTapDelta`
   permits the assigned final version and reconciled release assets only.
6. The prospective final bytes, exact qualification-law basis, accepted-RC
   lineage, installed-RC green-qualification evidence, and final delta form a
   new exact qualification basis. Every
   deterministic, install, identity, and bounded-behavior gate affected by the
   delta reruns before publication under its owning contract; the complete
   same-basis `QualificationGateResultVector<K>` admits, and `C.of(AF-22)`
   reduces it once into a same-basis green non-bypassed verdict.
7. `AF-25(tapped_release, finalBasis, finalVerdict, finalDelta)` materializes
   the tapped cut and snapshot only after verifying that complete lineage;
   `AF-26` then publishes the immutable Product.
8. Source-blind installation of the remotely published Product produces a
   terminal addendum linked by digest to the final release read model. The
   projection composes the records; it does not mutate them.

Snapshot evidence is an output of `AF-25`, never the qualification input that
authorizes that same `AF-25` transition. Candidate, published-RC, tapped-cut,
Product, and installed-Product identities remain distinct throughout.

## No Second Rung

The following are expressly not dependencies of the 5.0 final tap:

- T-243 or any new 4.6 release;
- T-245/T-246 campaign evidence;
- odd_glc 1.0 maturation or release;
- a data-mapper campaign;
- released-over-released ABG/GLC pair evidence; or
- a self-host, self-build, or 5.0.0-as-odd_glc-project run.

Downstream compatibility required by an admitted T-244 row may use a bounded
fixture or currently released catalog evidence. It does not create a
cross-repository release dependency. Installed stable 5.0 plus later released
odd_glc 1.0 becomes the development product for 5.0.1 only after this ticket
closes.

## Closure Condition

One exact immutable ABIogenesis `5.0.0` release exists after a passed RC window.
Its Git ref, remote tag, tarball, manifest, checksums, public contracts,
installed identity, qualification-law basis, qualification verdict, release
snapshot, and cited row
evidence identify the same cut and allowed release-only delta; at least one
immutable RC was published and the latest accepted RC was qualified through
the T-247 contract family; the prospective-final basis conserved the exact
accepted-RC and installed-RC green qualification refs/digests; every bounded
fix, if any, produced a new basis, verdict, and RC; the tapped cut was
materialized by `AF-25(tapped_release, ...)` only after the closed final delta
and all affected pre-publication gates were
represented by one complete same-basis `QualificationGateResultVector<K>` and
admitted green over the prospective final basis, and was published by `AF-26`;
a source-blind fresh install succeeds without rebuild
and its immutable terminal addendum is linked to the same release read model;
all retained T-244 and T-247 gates are green; and the final release record is
pushed and independently addressable. Alternatively, F_H records one explicit
terminal release-window disposition under T-221's honesty standard.
