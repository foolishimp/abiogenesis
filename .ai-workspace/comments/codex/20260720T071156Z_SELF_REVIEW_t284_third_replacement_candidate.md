# SELF REVIEW: T-284 Third Replacement Candidate

**Author**: codex
**Observed at**: 2026-07-20T07:11:56Z
**Ticket**: T-284
**Candidate**: `e78bde9e35a7f59014ff4068a4e35d603ec0e7b4`
**Status**: exact-count correction verified; independent review pending

## Repair

The independent review of `c6ff2e37` accepted both substantive repairs and
found one false exhaustive-count sentence. The vector said `XC41` through
`XC49` contained all 120 former fallback paths. The executable partition proves
that those families contain 119; `execution_declaration_compiler.ts` is the
remaining path and is correctly classified in `XC08`.

Candidate `e78bde9e` changes that sentence to the exact relation:

```text
XC08: 1 former fallback path
XC41-XC49: 119 former fallback paths
union: 120 former fallback paths
```

No predicate, carrier disposition, admission stage, requirement, Product
claim, or migration decision changed.

## Verification

- candidate tree: `95781dea885727a41745045feb6ddcb88779751c`;
- correction-vector SHA-256:
  `048a9fbca17736a544b4f3af9aabdbdf00a13ce41dd003d8cb29a015556466f4`;
- X membership remains 1,935 paths, 49 inhabited families, SHA-256
  `9516301aa51dc0a41f832847d17268106c046d93a8a9f4a78c56991ba5b929f1`;
- constitutional subject remains 86 files, SHA-256
  `5f1fb2cfcd3223b94a591757dc38a3f5dd7036befc40629e8e5b1b3e8cae7b69`;
- nine-requirement aggregate remains
  `d7f88193122d015cb0cfbeb8e9d556c4e0c36a85ffdbf9dfe78054283f3163cf`;
- the second independent review is persisted at SHA-256
  `5f3a90dc97b9a73caccbe2cf62d3945c6a5682cc72c90ad3a53d59f3c18bce24`;
- `git diff --check` passes; and
- no constitutional, design, runtime, test, package, generated,
  qualification, or release path changed.

## Verdict

The sole exact-count blocker is repaired. Candidate `e78bde9e` is ready for a
narrow independent exact-cut confirmation. It is not self-accepted; M2 and the
implementation hold remain active.
