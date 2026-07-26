# T-270 S05 Bounded Review Repair Exact Candidate

## Exact Subject

- candidate commit:
  `3a955d6938856d09a0d8ef19af0bb629e20cd8a3`
- candidate tree:
  `6acb6c81f22bafe4f3b4806826e5488cefe86b76`
- parent:
  `96db0dadc0c3f1b566d2db2574064ca9c04899bc`
- branch:
  `codex/t286-abi5-root`
- candidate delta:
  17 files, 872 insertions, 566 deletions
- M05 digest:
  `8eefe639bbec51e82206da0df7b3d42954d798c2289a96f506a4b0a3775284e9`

The three pre-existing untracked review/strategy posts are outside the subject.

## Bounded Repair

The candidate retains the S05 implementation and repairs the exact Product and
proof defects found in review:

1. `src/gtl/consensus_schema.ts` is the one Product-owned source for the
   public schema, reviewer response schema, closed value rosters, and native
   required-key families. Package preparation deterministically generates the
   JSON Schema asset from that source; the generated copy is not a second
   checked-in authority.
2. A ticket Consensus subject binds `ticketRef` and `ticketDigest` to the exact
   selected subject identity and bytes. Cross-paired ticket refs or digests
   refuse before a Run opens.
3. Product construction and ABG admission independently refuse a direct
   invocation against any supervised Program before Run or actor truth. The
   canonical Consensus root therefore has no direct public bypass around One
   Surface.
4. Only a successfully observed reviewer transport with a semantically
   malformed payload becomes typed refused `ReviewFindings` and then Product
   `contract_failure`. Timeout, non-zero exit, and no-output remain ordinary
   implementation failure candidates and ABG failed/stopped truth.
5. M05 Section 13 now distinguishes those identities and failure families,
   completes the Promotion Test and M03 eight-family Prime disposition,
   corrects the composition algebra, and reconciles the domain, sequence,
   state, axiom, operational-lifecycle, and module-proof projections.

No Consensus-specific Public, HoG, ABG, validator, event, continuation,
result-store, controller, scheduler, or CLI branch was added. No S06,
observer/tuner, conservation qualification, qualification, release, Product
rewrite, requirement reprice, or new ticket entered the candidate.

## Exact Package

Two serial `npm pack` executions from the exact committed candidate performed
clean builds and produced byte-identical archives:

- entries:
  `183`
- archive SHA-256:
  `52b56666d2ebc0773204bcbf2298477a3f2414904a35190d866bc909ee2cc3cf`
- archive SHA-1:
  `40608798160f44905e05fda869bac75d6068cef7`
- npm integrity:
  `sha512-MWGGjI3xHEOHURwVmDyAEpMsqn8w+YaVVPe4/POPulCfNTKQat4bzAPZ1OqoDNxYjrIbT+vYS+pNupu/FWtdLg==`
- archive size:
  `280685`
- unpacked size:
  `2011576`
- sorted payload inventory SHA-256:
  `b77a1d4e30823f4cd7d219d83b6d949cc7fd8eb27a54e1b209d68b628fbc186c`
- Product content digest:
  `sha256:ef7ee98cf152a700d781564f3c70ef71989e2c24dfda4b954f99a5b8044b8904`
- canonical manifest digest:
  `sha256:78b560af9dd0197f801099d7df9fbfd71e3f78b77178be3177118e3e4e6865a9`

The sorted payload inventory algorithm is:

```sh
tar -xzf <archive> -C <empty-directory>
cd <empty-directory>/package
find . -type f -print | LC_ALL=C sort |
  while IFS= read -r file; do
    digest=$(shasum -a 256 "$file" | awk '{print $1}')
    printf '%s  %s\n' "$digest" "${file#./}"
  done |
  shasum -a 256
```

Canonical public asset digests are:

- generated Consensus schema:
  `e0222398652cb732a8a8776df48f9809a2e13b56f66234b93c02409c5f77b294`
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
  `19/19`
- installed external Product:
  `36/36`
- complete M5:
  `145/145`
- retained M4:
  `26/26`
- M05 Mermaid rendering:
  `10/10`
- TypeScript no-emit check:
  pass
- generated schema/native-source equality:
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
  `3171e1c16b1a52a16651df5c85481f7f29715ae080a145f1b39d40c6a6b11fe4`
- events:
  `8e00777ef7527458b20883a5aafdc9ca222d90a98e40505354555420ddbc180c`
- R10 proof:
  `d198ffba048613b1490535363889c803a23c712c5933ce47465ff359e0fe595f`
- outcomes:
  `49e97490ec2c7e2fe25bb8307f350baed35846fb1659a994af990797488728fe`
- transcript:
  `407b9b4391ad1eed687f92699833535ef2b773a6ad6a928970097e4f7d6c252a`

## Exact Review Boundary

Independent review must bind candidate `3a955d6938856d09a0d8ef19af0bb629e20cd8a3`,
not this evidence commit. It must falsify:

1. whether the nine outcome/workspace cases enter through the canonical
   supervised One Surface Program without a direct-root bypass;
2. whether exact subject bytes, exact ticket identity, and resolved profile
   instructions reach every attributed reviewer task;
3. whether generated serialized contracts and native Product predicates have
   one source and equal meaning;
4. whether semantic malformed-output truth and transport/process failure truth
   remain distinct through ABG admission, replay, and public projection;
5. whether Section 13 closes the bounded Ontology, atomic/Prime/IACS,
   three-view, operational-lifecycle, and module-proof obligations; and
6. whether any Consensus-specific runtime or later Product outcome entered the
   cut.

## Disposition

This is a promoted exact candidate, not S05 acceptance.

S05 remains open for independent exact-cut review and direct human acceptance.
S06, observer/tuner, complete conservation, qualification, and release remain
held.
