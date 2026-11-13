# Closed affected source review

Result: falsified. The frozen 1,340-row subject is `41060a774e0891617a944beae8ec3426d5c4110f2db94d91ba917ffdabe72fb3`; exactly eight authorized paths differ from source-001.

The introduced O3 shortcut is removed: semantics and leaf invocation port match exact RC8 Git blobs, and both HOWs withdraw the optimization. The original successor fixture defect is repaired and all three held Runs execute. RC9 metadata is the minimal three-file change; unaffected core hashes and the nine-file unit script are conserved.

OWN-01 now fails at line 102: it passes a durable coordinate into nominal RuntimeEventPrefix calculus. The existing route is `projectOwnedRuntimeEventPrefixAtDurablePrefix(selection.prefix)`, preserving the same held cut and scope. Keep the durable coordinate for resource close. This is S2 (RC9-SOURCE-003).

The complete remainder was audited against actual callees. No further deterministic type mismatch was found. Two S3 oracle defects remain: the earlier-cut work snapshot excludes its projection (005), and the command comparison also changes the hashed label (004). Copied/changed row, worker, public verifier and actual retained-semantics first-use paths are detailed in REVIEW.json, including absent duplicate/foreign/rollback coverage and the synthetic worker producer limitation.

Build and three boundary checks passed. Unit evidence is complete but failed: 95 tests, 88 passed, 1 failed, 6 skipped; no parser/resource failure, timeout, truncation or missing unit file. REF-01 passes. Every assertion after line 102, including retained-semantics first-use changed-content refusal, remains unexecuted; the final OWN diagnostic is absent.

Root owns priority and disposition. Native actual-close/readback, archive/reproduction, installed measurement and all historical qualification/human gates remain outside this review. No source repair or tests were run by Reviewer.

See [ProductFrame.md](ProductFrame.md) and [REVIEW.json](REVIEW.json).
