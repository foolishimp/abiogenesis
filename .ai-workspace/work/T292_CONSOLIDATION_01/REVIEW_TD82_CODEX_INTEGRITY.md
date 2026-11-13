# TD-82 integrity QA and integration

Product frame: the fixed ABIogenesis 5.0 Product, T-292 consolidation, A5-F10 event-store integrity. The append lock is physical ownership; ABG admits runtime truth and replay projects it. The supported claim is trusted-desktop, same-user/current-build operation. This record carries QA evidence, not release acceptance.

| Binding | Result |
|---|---|
| Subject | `97371cec79b7874afc0a1712aa6008a75e728762`, authored source/design/tests `88a13a047e0fafa03883176f59dee0a5010beb79`, predecessor `891a39c44877fc1edfdc4b9159336992d37dd4c0` |
| Basis | `urn:stdo:product-definition:abiogenesis`; `stdo://releases/v3.0.4/`; manifest `102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b` |
| QA | `/root/td82_integrity_review`, separate read-only activation, 2026-11-13; no candidate authorship |
| Verdict | No new technical finding; evaluated integrity predicates satisfied. Full independent-assessment conjunction out_of_frame for same-family semantic independence of Codex-authored completion |
| Independent rerun | 8 passes, 0 fail/skip; overlap with Writer's 62, not additive |
| Independent physical probe | Different TMPDIR/TMP/TEMP/HOME/USERPROFILE; hard-link alias of the same inode refuses while held; live-owner recovery refuses without changing bytes/residue; reopen succeeds after release |
| Source/build binding | Isolated ESM emission equals tested event_store.js: `e6d308f3e0c5197c856bee76ab51e418abc39b97298704b8a0f246ea91216608` |
| Evidence inspected | Predecessor both-owned 10/10 and duplicate ordinals 3/10; candidate both-owned 0/10 and duplicates 0/10; 10 reopen handoffs. Writer 62 focused plus 3 installed-consumer passes |
| Integration | Main `a3c03d90c`; build passes; detached merged rerun 27 passes, 0 fail/skip in t288-logical-prefix-digest and t292-event-store-lock-namespace |

The same helper supplies acquisition and recovery's exact namespace. Atomic hard-link publication remains the exclusivity point, before admission. Existing append currentness, rollback and absent-owner recovery checks remain. Fixed older-artifact fixtures are unchanged. The legacy-local guard is not mixed-version coordination.

Scratch evidence: `/private/tmp/abg-td82-work/reviewer-probes/` contains `hardlink-contention.mjs`, `hardlink-contention.json`, and `source-build-binding.json`. The hard-link probe rehashes a physical authority to test the lock; it makes no public-provenance acceptance claim. Integration receipts are `/private/tmp/abg-codex-integration-20261113/td82/post-commands.json`, `post-build.log`, and `post-focused.tap`.

The original POSIX implementation is Claude-authored. Codex materially authored non-POSIX completion, associated design and tests. This QA supplies non-author counterexample inspection and repeatable tests; it does not claim the semantic independence that EVALUATION section 3 leaves unavailable without an applicable declared policy. This is an assurance limitation, not a code finding or a new merge gate. Native Windows, broad qualification and live provider execution are unperformed. Cross-user operation, isolated filesystem namespaces, hostile mutation, concurrent maintenance and simultaneous mixed-version ownership are outside the claim. Relevant source/basis/platform changes invalidate the affected evidence. Executive disposition: integrate the technical repair, retain those qualification limits.
