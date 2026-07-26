# REVIEW: T-284 Second Replacement Independent Exact-Cut Review

**Reviewer**: independent Codex explorer agent `019f7e3a-6274-7152-8747-d1ca02582ae0` (`Volta`)
**Persisted by**: codex pen-holder
**Reviewed candidate**: `c6ff2e37cd1b0aab27dbca16419b175e0161cf7b`
**Evidence HEAD**: `35a8876a`
**Review time**: 2026-07-20T07:10:48Z
**Verdict**: request changes; one exact-count sentence blocks M2 closure

## Independence And Method

The reviewer replayed the prior two blockers from Git objects and live
authority, executed the X-membership predicates, compared old and repaired
membership sets, inspected requirement traces and family contents, and checked
candidate and evidence deltas. It did not adopt the self-review or prior
verdict and changed no file.

## Finding

The repaired partition is correct, but the vector's exhaustive-count sentence
is false. It says `XC41` through `XC49` dispose of all 120 former fallback
paths. Those families contain 119 paths. The remaining path,
`execution_declaration_compiler.ts`, correctly moved to `XC08`.

The manifest and annex state the correct split. The vector must say `XC08` and
`XC41` through `XC49`, then be refrozen because the vector digest is part of
the exact review subject.

## Verified Repairs And Integrity

- candidate `c6ff2e37`, tree `862f58a2`, evidence HEAD/remote `35a8876a`, and
  clean worktree reproduced;
- the 86-file constitutional aggregate and nine-requirement aggregate
  reproduced unchanged;
- membership reproduced as 1,935 paths, 49 inhabited families, and SHA-256
  `9516301aa51dc0a41f832847d17268106c046d93a8a9f4a78c56991ba5b929f1`;
- the old fallback set and repaired `XC08` plus `XC41`-`XC49` set contain the
  same 120 paths; an unmatched synthetic path fails as unclassified;
- `XC41`-`XC47` are coherent semantic/support/export families;
- `XC48` contains only package/configuration/README inputs and `XC49` only
  three tarballs plus the tracked `node_modules` marker;
- no requirement-bearing carrier is hidden in `XC48` or `XC49`;
- S06 portability is correctly D5/pre-STDO, while D6 is restricted to tapped
  STDO self-conformance, qualification, S07, and post-publication proof;
- authority ownership, direct invocation, One Surface conditionality, root
  predicate, and B-001 placement remain consistent;
- no constitutional, design, runtime, test, package, generated,
  qualification, or release path changed; and
- requirement duplicate, Markdown table-shape, and `git diff --check` gates
  pass.

## Disposition

The prior substantive blockers are repaired. The sole remaining defect is the
false exact-count sentence in the vector. M2 remains open and M3 remains
blocked until that sentence is corrected, the vector is refrozen, and the
exact repair is independently checked.
