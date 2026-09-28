---
kind: authority_compression_asset
asset_ref: authority-compression://stdo/bootstrap/v1
source_refs:
  - ../SPEC_METHOD.md
  - ../REFERENCE_FRAME_METHOD.md
  - ../STDO_REFERENCE_FRAME_BASELINE.md
  - ../RELEASE_METHOD.md
  - ../schemas/product-definition.schema.json
source_digests:
  SPEC_METHOD.md: ff93375a862cd3c31b27a2cc79f8f6a4111586ca7e31e5514b8af88d3fbb99e3
  REFERENCE_FRAME_METHOD.md: 6e9148d7c8eff847abf172315b0e282e4477f3d40866b28f7fef21c41cb067e7
  STDO_REFERENCE_FRAME_BASELINE.md: 29ac1367a77bf686e621a3e1b88bb39a0ba8e6c44b40e2b29904a7eb5606571d
  RELEASE_METHOD.md: 582bc15451855670495e559db3ae6a89ba37edaa3656f33499d02220cbdb141c
  schemas/product-definition.schema.json: e0a3b544dae6c83bf941096b440700d02fa988fd2767f3b4ab297a1a03f67abf
compression_profile: discovery_bootstrap_v1
target_prompt_families:
  - bootstrap
generated_by: codex
generated_at: 2026-09-20
stale_if_source_digest_changes: true
---

# STDO Discovery Bootstrap

This is a small routing projection. The exact installed release and its raw
owning standards remain constitutional authority.

1. Discover `stdo_<label>.json` definitions recursively from the requested
   workspace scope. Prune `.git`, `.hg`, `.svn`, `.bzr`, `.venv`, `venv`,
   `node_modules`, `vendor`, `site-packages`, `build`, `dist`, `out`, `target`,
   `.gradle`, `.tox`, `.nox`, `.cache`, `.ruff_cache`, `.mypy_cache`,
   `.pytest_cache`, `__pycache__`, `.genesis`, and `.stdo`; refuse symlinked
   Product Definitions. Directory nesting creates no inheritance or
   composition.
2. Select exactly one definition applicable to the requested Product scope.
   Zero or multiple unresolved definitions fail closed.
3. Read `constitution.stdo.basis`. Its immutable release URI and manifest digest
   are the sole operative STDO selection. The source repository and
   `constitution.stdo.selector` are discovery inputs only.
4. Synchronize and verify that exact basis through the STDO toolchain manager.
   Do not substitute mutable authoring source, another installed cut, a moving
   version alias, a cache record, or a project-local copy selected by proximity.
5. Resolve the Product Definition's declared bootstrap entrypoint against its
   named basis. Load raw owning standards whenever this projection is
   insufficient or its source digests are stale.
6. Resolve the applicable accepted Project Reference-Frame Basis or its
   declared composition. Bind the exact outcome, basis and existing work grant.
   Use direct Writer entry when that configuration permits it and one capable
   context is sufficient. For material coordination, use its Executive frame
   or declared project equivalent and activate only the smallest dependency-ready
   frontier. Determine required evaluations from their owning applicability
   conditions; unknown applicability remains unresolved. A role name grants no
   effects and Executive performs no file or Git mutation.
   Executive attention is event-driven by default; supervision exceptions and
   conserved assurance remain owned by
   `STDO_REFERENCE_FRAME_BASELINE.md#event-driven-executive-attention`.
7. Load the Product Definition's bound `WHAT`, local constitutional relations,
   `HOW`, work carriers, composition contracts, and exact source material only
   as required by that activation and governed scope. A prompt, summary,
   symbolic map, or prior result may route attention but cannot replace current
   source authority or a closed frame result.
   When the selected evaluation needs the cross-interface refinement, acquire
   `STDO_REFERENCE_FRAME_BASELINE.md#derived-end-to-end-interface-integration-frame`;
   it separates design, actual-boundary, runnable-path and user-usability claims.
   Its computational whole-path refinement covers material composition and
   recurrence; inspect the causal cone within access authority even when the
   mutation grant names narrower write territory.
8. Reuse applicable computed facts, recorded judgments and original owner
   rulings through their exact source/evidence routes. Refresh affected support
   on a material invalidator; do not reclassify merely because a session or role
   changed. Closure requires satisfied applicable conditions, not a review
   event. The raw owning standards decide sufficiency and reserved authority.

Derived guidance preserves source permissions and conditions as well as
prohibitions. A digest does not establish that fidelity. Complete enclosing
admission permits applicable established facts; a function or role boundary
alone does not require repeating their derivation. Material invalidation and
required independent judgment retain their own checks. Bind findings and test
predicates to the supported operating/threat model. Retirement is the default
for superseded responsibility; source law places the burden on retention.

`sync` materializes only the already selected exact basis. `adopt --dry-run`
presents a digest-bound plan to the highest-ordinal published immutable RC and
refuses a lagging selector or same-line downgrade; a later mutating `adopt`
must be given that plan digest and must re-derive it unchanged. Fleet adoption
requires the aggregate plan digest. `adopt` is the sole toolchain operation
that may resolve the mutable version-line selector and atomically change a
Product Definition basis after explicit acceptance. Moving the selector alone
never changes a consumer.

Bootstrap targets are relative to the resolved `product.source_project` and
cannot escape or traverse a redirected component. Fleet bootstrap additionally
confines every source project to its authorized root and preflights all targets
before writing. Only one correctly ordered marker span is manager-owned; all
prefix and suffix bytes remain exact project-owned bytes.
