# T-270 S03 Semantics Provenance Exact Candidate

**Recorded**: 2026-07-26
**Status**: exact candidate frozen; independent review and human acceptance pending
**Ticket**: T-270
**Product outcome**: ABG5-S03

## Exact Subject

- Candidate commit:
  `1d8fd3b0bcbc1fcc39cceb1e9f78c1454e880314`
- Parent:
  `756b531b3ad042680885c3a25ca8cc4ad925e8dc`
- Candidate tree:
  `0dd5fc4be733bacfe66f2144928f8662b4a52445`
- Changed files: 28
- M05 design SHA-256:
  `3056c4e097fda9640bfb3fb8731c99b446e39a2d6274d9672d1faad095da49c0`
- Package SHA-256:
  `5c98e1498024721873f0459758b1a7f9e24a865b5242dec881fa41dbce929082`
- Product content digest:
  `sha256:3390a947fdc98845dcb05ce5786f72071b74c60fc8aec10984d08a18e32cd27f`
- Canonical Product manifest digest:
  `sha256:9472f3b5292c1405a13769746643375ed6df59a838177f33ec2f3095065d5b5c`

The candidate commit is the immutable implementation, design, test, package
basis, and regenerated M4 proof subject. This checkpoint and the ticket freeze
fields are separate evidence carriers and do not modify that subject. Both
pre-existing untracked Claude review posts are excluded.

## Findings Disposition

The reviews of rejected candidate `5956d533` were aggregated and repaired
inside T-270:

1. Product now mints an opaque leaf-only semantics projection only from the
   exact provider loaded from the admitted publication and install. An
   internal provenance registry binds the projection to current installed-byte
   verification, contract validation, and judgment resolution. HoG refuses an
   identical-label structural substitute.
2. The trusted-developer WorkspaceAuthorityBasis selects one exact actor.
   WorkspaceBinding, InvocationPolicyBasis, Product grant construction, and
   independent ABG verification all bind that actor. Caller-supplied
   alternative labels refuse.
3. HoG imports no Product type or concrete Product verification function. Its
   internal binder consumes the opaque projection and is absent from the
   public HoG export. Product retains installed semantic-provider ownership;
   HoG retains only F_D/F_P leaf traversal.
4. M05 Section 12 includes Product input admission, opaque projection,
   projection inspection, and HoG cursor derivation in the atomic family. The
   resume sequence now records ABG successor-input derivation, HoG cursor
   derivation, ABG resume admission, then HoG traversal.
5. The ordered effectful S03 chain no longer claims a false global identity or
   associativity law. Typed identity remains limited to carrier-preserving
   pure functions; effectful regrouping is not applicable without a declared
   typed law.
6. The module-owned S03 proof includes an intentionally permissive
   identical-label callback family and proves that it cannot bind or obtain an
   admitted leaf port.

The shared projection is an internal subordinate bridge, not a new Product
authority, Prime family, controller, runtime, or event family. No ticket or
later Product outcome entered the candidate.

## Verification

Run serially against the committed candidate source:

| Gate | Result |
|---|---|
| `npm run test:m5:s03-unit` | 4/4 pass |
| `npm run test:m5:external` | 36/36 pass |
| `npm run test:m5` | 127/127 pass |
| `npm run test:m4` | 26/26 pass |
| exact-file Mermaid render | 7/7 pass |
| `git diff --check 756b531b..1d8fd3b0` | pass |

Two serial clean builds followed by
`npm pack --ignore-scripts --json` produced byte-identical archives:

- SHA-256:
  `5c98e1498024721873f0459758b1a7f9e24a865b5242dec881fa41dbce929082`
- SHA-1:
  `61766f28bf49f6216c9a2ab9b044f7cafc949755`
- npm integrity:
  `sha512-UPku6GBrQJbAoRb+TF2WEgwJbzRI2NjRChyfG95Zzt6kOFUvmzJ6glxRf0hZ2O/5bF47GmAzvx0RdgGko+N2kg==`
- archive size: 262549 bytes
- unpacked size: 1849165 bytes
- tar entries: 178

## Review Boundary

T-270's four defects continue to bound what may change. Acceptance remains
bounded by the full causal S03 path, all seven GOALS conditions, T-270's
functional review and non-closure conditions, applicable requirements and
accepted design, retained predecessor claims, and every applicable STDO hard
stop.

Accepted M03 and M05 Sections 1 through 11 remain the baseline. M05 Section 12
is the reconciled candidate under review. Completed T-272 evidence has no
growth or acceptance authority.

The Codex pen-holder cannot accept this subject. Independent review must bind
candidate `1d8fd3b0bcbc1fcc39cceb1e9f78c1454e880314`; direct human authority may
then accept or reject it. Until then T-270 and S03 remain open, and S05/S06
remain held.
