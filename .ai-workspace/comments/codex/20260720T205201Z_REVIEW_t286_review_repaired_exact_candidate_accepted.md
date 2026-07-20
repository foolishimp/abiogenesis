# T-286 Review-Repaired Exact-Candidate Review

## Subject

- implementation commit: `ffba4e71456cf19168fa2bbf2981b463e018a0cf`
- implementation tree: `5c0b9ea7e4e93dbdaf79a7cf9527c4aafcda7aa3`
- manifest: `.ai-workspace/comments/codex/20260720T204540Z_CHECKPOINT_t286_review_repaired_exact_candidate_manifest.md`
- root: `ABI5-ROOT-001`
- scope: `GOAL-035 M4` only; M5 excluded

## Independent Reviews

| Reviewer | Method | Verdict |
|---|---|---|
| `Nietzsche` (`019f8148-32f2-7ea1-be2c-632b63cbc30e`) | architecture and authority review using `gpt-5.6-luna`, high reasoning | accept; no P0, P1, or P2 findings |
| `Carson` (`019f8148-53dc-7581-8270-2d6cb6ab2889`) | proof and installed-surface review using `gpt-5.3-codex-spark`, high reasoning | no runtime or proof findings; ticket bookkeeping was the sole remaining non-closure condition |

Both reviewers were instructed not to edit files or alter the shared branch.
They independently ran the installed M4 suite against the exact subject and
reported `25/25` passing.

The architecture review confirmed that:

- implementation exceptions, malformed returns, and throwing judgment
  relations complete the admitted CCall evidence/result/judgment spine;
- setup operations and nested workspace roots reject undeclared fields;
- GTL, validator, HoG, Product, ABG, and public authority remain distinct; and
- no M5 behavior entered the subject.

The proof review confirmed that:

- package, Product content, and Product manifest identities match the manifest;
- all six retained proof SHA-256 values reproduce;
- exact durable-prefix and 39-event accounting hold;
- the retained root has two distinct successful run identities; and
- all twelve installed mutations refuse, block, fail, or leave the root red at
  their owning boundary.

## Verdict

Accept exact implementation subject
`ffba4e71456cf19168fa2bbf2981b463e018a0cf` for T-286 M4 closure.

This review does not authorize M5, qualification, release, or any broader
ABIogenesis 5.0 completion claim.
