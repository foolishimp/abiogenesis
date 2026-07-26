# T-286 Exact-Candidate Review: Changes Requested

## Verdict

Do not close T-286 or promote M4 at implementation commit
`16bca623008b76f0e0e7d619e15ff6991db3ed7e`. The sunny installed root is
real and remains the repair basis, but its assurance boundary is not yet
closure-grade.

Two decorrelated read-only reviews independently ran the focused M4 suite and
audited the exact implementation. Both verified 12/12 tests, deterministic
packed bytes, source-independent installation, private event-writer exports,
and the intended GTL -> validator -> HoG -> host -> ABG positive relation.
They also reproduced the following load-bearing defects.

## Accepted Findings

1. `verifyProduct` verifies an internally consistent artifact but receives no
   externally expected artifact/content/manifest digest. A modified package
   with a recomputed self-manifest can therefore verify under the same version.
2. the ABG store is in-memory during execution and writes the replay log only
   after traversal, contrary to durable append-before-next-effect law;
3. replay folds the whole mutable store rather than one invocation/run episode,
   so a second valid `run.invoke` in one transcript projects the first Run and
   fails R10;
4. post-admission open/traversal/load failures escape into a public-authored
   refusal without ABG failure truth or replay lineage;
5. an implementation exception or malformed return can strand an opened CCall
   instead of completing the mandatory evidence/result/judgment spine;
6. B8's six cases all hit one exact-payload schema guard and therefore do not
   satisfy the design's real-path mutation contract; and
7. R10 evidence embeds temporary paths, deletes its referenced event log, and
   changes digest across identical-candidate reruns.

## Bounded Repair

The repair does not re-enter Product or design and does not open M5. It shall:

- require externally pinned artifact, content, and manifest digests;
- durably append every configured public-path event before downstream effects;
- replay one causally closed invocation/run episode;
- admit every post-admission failure through ABG;
- totalize implementation failures through the uniform CCall spine;
- replace schema-only B8 claims with installed owner-boundary and real-path
  mutations; and
- retain deterministic exact evidence and its durable event log.

The prior B8 post remains truthful only as evidence that undeclared request
fields fail closed. It is superseded as a B8 closure claim by this review.
