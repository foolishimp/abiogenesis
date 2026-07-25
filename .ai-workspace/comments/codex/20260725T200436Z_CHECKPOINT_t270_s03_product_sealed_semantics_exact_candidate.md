# T-270 S03 Product-Sealed Semantics Exact Candidate

**Recorded**: 2026-07-26
**Status**: exact candidate frozen; independent review pending
**Ticket**: T-270
**Product outcome**: ABG5-S03

## Exact Subject

- Candidate commit:
  `8865ccff844d06f4f97765f014ae2b59c1e7d84b`
- Parent:
  `beb85a44c19a5ab0b8c1f96f9d67235504b46be0`
- Candidate tree:
  `f1a66a2c79f01972f063189bf7668fdb762ce2e6`
- Changed files: 15
- M03 design SHA-256:
  `39b396c7d58b0e9e2a4c288baedb78462657210d1dac892bcf2a7045c63c1a85`
- M05 design SHA-256:
  `b385ce64745cdb531d8002719d0a3a6f36995c6b8f2418e76eaecdaf46ef15a5`
- Package SHA-256:
  `e4345ce38807abd4a988aeff76c3d83274e88ed6e0926adfb635d07fe933732b`
- Product content digest:
  `sha256:ee3e31130541b45bc88939279c57ad316e3df95e8f9fc470ae96dec76f99a7ed`
- Canonical Product manifest digest:
  `sha256:f6b8682c6bc4d6948017557b8d27133f2579e37fa10eea7feea0e24094d65449`

The candidate commit is the immutable implementation, design, test, package
basis, and regenerated M4 proof subject. This checkpoint, the delegation
receipt, and ticket fields are separate evidence carriers. Both pre-existing
untracked Claude posts are excluded.

## Findings Disposition

The review of rejected candidate `1d8fd3b0` was repaired inside T-270:

1. `src/shared/leaf_semantics_projection.ts` is deleted. Product owns the
   authenticity WeakMap, the unexported mint, projection construction, and the
   narrow verifier in `src/product/semantics.ts`.
2. HoG imports only that Product verifier and projection type. M03 and M05
   explicitly admit this one dependency while continuing to prohibit Product
   input/F_H evaluation, install resolution, catalog selection, or runtime
   truth in HoG.
3. The module proof first creates a real Product-sealed projection and
   admitted port over an exact installed Product, store, install, publication,
   and implementation set. It then substitutes a metadata-identical object
   carrying permissive callbacks. The forged twin refuses with zero event
   delta. The package contains no shared mint, and Product's mint is absent
   even from its implementation-module exports.
4. The M05 sequence now matches runtime: Product loads the provider and admits
   input, ABG admits invocation and execution basis and opens the call, Product
   projects leaf semantics, then HoG verifies, binds, and traverses.
5. The domain, sequence, and state views now bind terminal source Run,
   durable gap authority, and at most one distinct successor Run. Projection
   never reactivates the stopped source.

No new feature, ticket, schema, controller, runtime, event family, or deferred
continuation behavior entered the candidate.

## Verification

Run serially against the candidate source state:

| Gate | Result |
|---|---|
| `npm run test:m5:s03-unit` | 4/4 pass |
| `npm run test:m5:external` | 36/36 pass |
| `npm run test:m5` | 127/127 pass |
| `npm run test:m4` | 26/26 pass |
| exact M03 Mermaid render | 3/3 pass |
| exact M05 Mermaid render | 7/7 pass |
| `git diff --check beb85a44..8865ccff` | pass |

Two serial clean builds followed by
`npm pack --ignore-scripts --json` produced byte-identical archives:

- SHA-256:
  `e4345ce38807abd4a988aeff76c3d83274e88ed6e0926adfb635d07fe933732b`
- SHA-1:
  `b03efb23a63bed3f07119f76ed4a3e8fa8a25d35`
- npm integrity:
  `sha512-G+gmIPB2H1mtr/uhfFHgNuI4pZHdXa61VoYcOmvMd63+dtBWDV+eT0UgI6rG2Z6sJlAencvswPIegJkySmHE7w==`
- archive size: 262271 bytes
- unpacked size: 1848449 bytes
- tar entries: 176

## Review Boundary

Independent review must bind candidate
`8865ccff844d06f4f97765f014ae2b59c1e7d84b`, not this checkpoint commit.
It must falsify Product ownership, HoG dependency scope, the admitted
positive-control mutation, all S03 causal acceptance conditions, applicable
hard stops, and regression of retained behavior.

The pen-holder cannot provide that independent review. The bounded human
delegation permits progression only after a decorrelated exact-cut review is
recorded and every blocking finding is repaired. Until then T-270 and S03
remain open, and S05/S06 remain held.
