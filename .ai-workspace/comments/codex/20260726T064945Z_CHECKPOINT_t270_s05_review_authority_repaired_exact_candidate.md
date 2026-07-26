# T-270 S05 Review-Authority Repaired Exact Candidate

## Exact Subject

- candidate commit:
  `61c7676ec38dcf91d6ab14396c5f1b87eb1f4ff3`
- candidate tree:
  `a8c44d88686543673676178556a2aaff9876710f`
- parent:
  `22a1ea1fccf79d558e4ebe1bb5c07b2d8c7acac1`
- branch:
  `codex/t286-abi5-root`
- candidate delta:
  `21 files, 689 insertions, 354 deletions`
- M05 digest:
  `4da2abf9c39b4662212a6c0584713f91ea4a29e2a0d5b54f90c67f770c5c951d`
- `REQ-P-CONSENSUS.md` digest:
  `8f945dbb6b2e715e8a70a0643f69d469e68e258a6d2703ece921e54492374f44`
- Product-owned Consensus schema source digest:
  `ee773448a2804ef0737a66e0a9d6dd5afc20dcc917e171a0433d257dca7ae46a`

The candidate was pushed before this evidence carrier. The three pre-existing
untracked review/strategy posts are outside both subjects.

## Bounded Repair

The cut retains the ordinary GTL/HoG/ABG Consensus implementation and repairs
the exact review findings:

1. Canonical public Consensus enters through the existing supervised
   `run.invoke(start)` path and `until=converged`. Only the non-public,
   replay-bound F_H support GraphFunction may use direct invocation.
2. Only a replay-bound `unresolved_disagreement` result with `escalate_fh` and
   no contract-failure ref is eligible for support invocation. Agreement,
   dissent, and typed `contract_failure` refuse before target invocation or
   F_H hold truth.
3. One Product-owned TypeScript source now defines the reviewer candidate
   predicate, response schema, public schema, required keys, and closed
   vocabularies. Package preparation generates the schema and both vocabulary
   assets. The two checked-in vocabulary projections were removed.
4. Native reviewer parsing and serialized schema enforce the same
   recommendation/findings cardinality: `accept` has no findings and `revise`
   has at least one.
5. A valid reviewer candidate observed before timeout or non-zero exit is
   deterministically salvaged while exact failed process evidence remains
   replay-visible. Transport failure without a valid preserved candidate and
   no-output remain failed/stopped ABG truth.
6. The existing generic ABG admission guard now has a direct module mutation
   proving that direct invocation of a supervised Program refuses before event
   admission.
7. M05 Section 13 reconciles those relations in its Ontology, lifecycle,
   authority, atomic-function, Prime, IACS, three-view, axiom, operational
   lifecycle, proof, and promotion surfaces.

No Consensus-specific Public, HoG, ABG, validator, event, continuation,
result-store, controller, scheduler, or CLI branch was added. No S06,
observer/tuner, conservation qualification, qualification, release, Product
rewrite, new ticket, or new runtime family entered the candidate.

## Exact Package

Two serial clean `npm pack` executions from the candidate produced
byte-identical archives:

- entries:
  `183`
- archive SHA-256:
  `85ca145e7d6755285f9c18f999f840888f8637c3e9788e35dd702a476f16d733`
- archive SHA-1:
  `c0533f8c47a2af9032f5e71043646dde641babd5`
- npm integrity:
  `sha512-+3XMXPUAiHsSMj0/LvYo0dNJbuJ80hYXaUUEYsJrOVpXyc4pmdEMXabyztAwgikbG7DSfvQ6qtWMoAJqpqb9nw==`
- archive size:
  `281446`
- unpacked size:
  `2019224`
- sorted payload inventory SHA-256:
  `112d8cb84308315cf58c9e1e3f596423f219f4564247d9b326cbdbc6f8dd4ec3`
- Product content digest:
  `sha256:465931bf6be4570ef793399d89d407d765a2aac9d2e7b25c7c66998ce23ff38a`
- canonical manifest digest:
  `sha256:9d2f8fe49618a7e210c684f5a5c6f1bd73d40b44ca9b70511801875608c194e0`

Generated public asset digests are:

- Consensus schema:
  `166a6dc9ada294f6e7a4195edf615224b59bbf29c3a8dfdec2964c07ec718954`
- review-ruling vocabulary:
  `5acf0968ee02689ff4ce3fb77deb69e6bfab5a16e5045c0415cb6887342ee738`
- round-outcome vocabulary:
  `1ce4c83aecc57abb7c0b2367d9b3e7b9e9dc0b2bfa9c0e5e1f74ceeb35f7f0c1`

The candidate-basis carrier contains the exact archive, Product-content, and
manifest identities above.

## Verification

- module-owned Consensus proof:
  `12/12`
- installed Consensus:
  `21/21`
- installed external Product:
  `36/36`
- complete M5:
  `147/147`
- retained M4:
  `26/26`
- M05 Mermaid rendering:
  `10/10`
- TypeScript build/no-emit:
  pass
- schema/native reviewer predicate agreement:
  pass
- direct generic ABG supervised-entry mutation:
  pass
- package A/B archive comparison:
  exact
- package A/B inventory comparison:
  exact
- `git diff --check`:
  pass
- root governor:
  `root_satisfied`, R1-R10 green

The refreshed M4 proof hashes are:

- governor:
  `e400736e041f4a28fd950239dd466f3bb28a75cbbdb1f6da60d17d2403ef929d`
- events:
  `cabb8b688f5de6a667b21ceecea1202d5c0aac554bcadcdffa00c4e8d370db45`
- R10 proof:
  `a6f6f14f99637246dffd50a11157f506c012971c24e99b040c019923a2e25e88`
- outcomes:
  `fccd0d83a00304aca4d4f3742d343f91149d015b53e004a50e2e7199ee9f3c85`
- transcript:
  `19181f3ba67a663857dd46fcb3bff6dc240f1b3e4f71c2987ff82ca263c83b28`

## Exact Review Boundary

Independent review must bind candidate
`61c7676ec38dcf91d6ab14396c5f1b87eb1f4ff3`, not this evidence commit. It
must falsify:

1. whether canonical Consensus can enter outside supervised One Surface;
2. whether any non-unresolved or contract-failure result can enter the support
   Program or create F_H truth;
3. whether native reviewer parsing and generated serialized contracts can
   disagree;
4. whether valid output observed before transport failure is lost, or
   outputless transport failure becomes semantic Product truth;
5. whether the generic ABG direct-entry guard is independently effective;
6. whether Section 13 now matches the exact runtime and Product authority
   relations; and
7. whether any Consensus-specific runtime or later Product outcome entered the
   cut.

## Disposition

This is a promoted exact candidate, not S05 acceptance.

S05 remains open for independent exact-cut review and direct human acceptance.
S06, observer/tuner, complete conservation, qualification, and release remain
held.
