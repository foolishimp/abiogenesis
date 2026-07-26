# T-270 S05 Submitter-Response Exact Candidate

## Exact Subject

- candidate commit:
  `9f13d85e1088b50c88ec2529024408326ea9d98c`
- candidate tree:
  `e40fed0b94016250c2435f2d3af3ac29f433ce52`
- parent:
  `7eede0d0d395b77a5e0d85e9f1328631ffd9da8f`
- bounded delta:
  `19 files, 2,756 insertions, 452 deletions`
- requirement digest:
  `c21cd25b28c6f731d800b715141bbbc674a434fddd78fcb82d2c27a897145982`
- M05 design digest:
  `d4f3006e8e0667bd4c421be273129cb242d41e44ea55489b7489e1afc10bb261`
- Goals digest:
  `360db299bb29bfa21a83876b84a136450577a150610077f8152d612c83ebaebd`

The candidate was pushed before this evidence carrier. This post and the
ticket projection are evidence about the candidate; they are not candidate
members.

## Bounded Repair

Candidate `48103ed9` proved repeated reviewer rounds but omitted the required
submitter-response relation. The replacement candidate retains its ordinary
GTL, HoG, ABG, One Surface, replay, and public-read behavior and adds exactly:

1. one canonical submitter GraphFunction and response contract;
2. one subject-bound attributed submitter profile and exact instruction;
3. one F_P submitter task over the complete admitted reviewer findings vector;
4. ordinary actor/process, evidence, result, and judgment admission of the
   submitter response before deterministic reduction;
5. prior-response lineage carried into every recursively created reviewer task;
6. typed refusal of missing, wrong-submitter, wrong-prior-round, forged, and
   findings-vector-unbound responses before successor-round truth; and
7. the matching Product requirement, Section 13 Ontology, atomic family, Prime
   contraction, IACS, three views, axioms, module proof, generated schema, and
   installed proof.

The generated serialized contract now has one named
`ConsensusSubmitterResponseRecord` definition shared by prior-response arrays,
the full response schema, and native required-key validation.

No ABG, HoG, Public, validator, event-family, controller, scheduler, compiler,
lowering, S06, observer/tuner, qualification, or release implementation changed.

## Verification

From the candidate worktree, with one serial gate runner:

- complete M5:
  `149/149`, zero skipped or TODO;
- retained M4:
  `26/26`, zero skipped or TODO;
- module-owned Consensus proof:
  `13/13` within M5;
- installed Consensus proof:
  `22/22` within M5;
- installed external Product:
  `36/36` within M5; and
- `git diff --check`:
  pass.

The exact candidate was also exported with:

```sh
git archive 9f13d85e | tar -x -C <empty-directory>
```

The archive initially contained neither the generated Consensus schema nor its
vocabulary directory. After `npm ci`, an ordinary clean build regenerated all
three assets. From that fresh archive:

- module-owned Consensus proof:
  `13/13`;
- installed Consensus proof:
  `22/22`;
- M05 Mermaid rendering with `mmdc 11.3.0`:
  `10/10`; and
- packed archive SHA-256:
  `64b3ed4e4bdddde142f6dbd9ff7af5aefc01675e5b44f1af6733337609223377`,
  equal to the candidate worktree pack.

Two serial packs from the candidate worktree were byte-identical:

- entries:
  `183`;
- archive SHA-256:
  `64b3ed4e4bdddde142f6dbd9ff7af5aefc01675e5b44f1af6733337609223377`;
- archive SHA-1:
  `53f6ce1690ac209a40bc99558ada44021a2838bb`;
- npm integrity:
  `sha512-ZT7z/wZCjwB8etYfvA6w74hAEjqsPcY4YvEmCgjYyqzpc4TYaBk0pqUlU2albWEyY8WIjsqjjo0O/4uM0Zx7Bg==`;
- archive size:
  `288,966`;
- unpacked size:
  `2,119,679`;
- sorted payload inventory SHA-256:
  `aeccb9312e5410c335c18eabab150e0d723f36b721e35f1c9c74196e0eb0fa38`;
- Product content digest:
  `sha256:5a2ba3a12b72c7c3e0baeea20fff5b1c0a345963d614acb2b2285bdabe0d86ff`;
  and
- canonical manifest digest:
  `sha256:ff155df642922dc5d472033d85df384bf3cf155c84da9b0eb2a158be4d434f2c`.

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

Root proof digests are:

| Proof | SHA-256 |
|---|---|
| governor | `918ec198181cbab06845157b2b647b58a91dd560f7de25f8e0cce279dc49f289` |
| events | `0a699e1627a58809204e3838c2459779316efbb102ea2578f7874a3ce36855f1` |
| result | `ea95b1964edbda2821def0cf719aeffd691cdc082cca71e27ac68b48baaaaf58` |
| outcomes | `c92bfddaf82928086db91e24a7dece83a39be2fde0f090dd7bcfb24d14a72230` |
| transcript | `7663feb0bf4acaf755a244cd1b78cd5443d51d2a5d9c52ff2d7ce2e56d6b3ca2` |

## Exact Review Boundary

Independent review must bind candidate `9f13d85e`, not this evidence commit,
and begin from requirements rather than inherited findings. It must verify:

1. every active S05 requirement has an irreducible Product/GTL/HoG/ABG atom;
2. the exact admitted findings vector reaches the attributed submitter F_P
   effect before reduction;
3. round two is impossible before the exact response is Product-valid and
   ABG-admitted;
4. all five response-basis negative families are mutation-sensitive;
5. the three outcome by three workspace matrix enters through One Surface;
6. Section 13 and runtime topology agree without a rival authority; and
7. no later Product outcome entered the cut.

## Remaining Human Gate

Even if independent review is clean, S05 remains open until direct human
authority:

1. affirms the bounded `requirement_reprice`;
2. affirms that the replay-bound direct F_H support GraphFunction is a
   support-only, non-public exception that preserves One Surface and creates no
   rival selection, continuation, or closure authority; and
3. accepts this exact S05 candidate.

S06, observer/tuner, complete conservation, qualification, and release remain
held.
