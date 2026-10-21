# Closed evidence portability02 — verified successor04

This is a repository-plus-archives handoff for reviewing **closed historical evidence** on another machine. It preserves exact byte and source-coordinate relations; copied journals and installations never become original runtime authority. It is not a final C0 candidate, L5 acceptance or release claim.

The corrected verifier passed once: 69,428 original file addresses, 74,736 original metadata rows, six original packages and 15,829 package members. The map uses 7,736 repository-file relations (1,651 distinct mapped files), 61,340 package-member relations, 351 archive-object relations and one ordered two-chunk file. It checked 389 archive objects and all 2,353 exact V8 exclusions. Finite coverage counts include repeated owning relations; they are not extra tests or Product outcomes.

## Required checkpoint contents

Keep this directory, `../successor-03` unchanged, the original stopped files in `..`, the prior `../../closed-evidence-portability-01` carrier, and every repository dependency in `manifest.json`. This is not a standalone copy of the ten archives. The manifest pins all 1,750 existing required repository files and the new local records. The source address map and archive inventories remain in successor03; no payload or map was recopied.

Ten successor03 archives total **55,685,201 compressed bytes**. Four reused prior archives total **136,487,957 bytes**; the combined compressed set is **192,173,158 bytes**. Each archive is below 90 MiB. This successor created no archive. `transport-size.json` gives the admitted logical scope, existing repository-file extent and explicit final-record reserve, all within the selected limits.

## Verify on another machine

1. Compare `freeze.json` SHA-256 against the Executive handoff. Its `manifestSha256` pins `manifest.json`, which pins local records and the required repository dependencies.
2. From the received checkout root, run the filesystem-only verifier:

```sh
python3 .ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/closed-evidence-portability-02/successor-04/verify-transport.py --repo-root .
```

The verifier reads repository-relative files and inert archive members without extraction. Original absolute addresses are lookup keys and historical metadata only; none is opened as a fallback. It runs no Product, test, native provider or EventStore owner. The retained construction run reports `finalFreezePresent: false` because it preceded final manifest closure. The final manifest was checked separately after creation; that later check is not retroactively attributed to the original verifier receipt.

3. Start at `subject-map.json`. Find an original path in `../successor-03/population.json`. A `repository_file` relation names checkpoint bytes; `archive_object` names an inert tar member; `package_member` names a member of an exact original package object; `archive_chunks` orders chunks by offset while retaining the whole-source digest and size. `original-metadata.json` retains original mode, device, inode, timestamps and link targets independently of normalized transport metadata. Do not extract over an original runtime path, append a copied log, or reinterpret copy identity as currentness or admission.

## Subjects, exclusions and preserved failures

The six selected cuts are the baseline P1 diagnostic's original coverage stop; its separate read-only coverage successor; baseline P3 diagnostics with repaired support; historical combined-final-02; its successful P1; and its closed binding preparation. Their exact original freezes, baseline/final02 archive identities and transport routes are in `subject-map.json`. Raw observer traces, requests/results, event-prefix bytes, package/member/source/support correspondence, task-owned cache bytes and original physical observations are retained through the map. Reuse preserves bytes, not original inode or authority.

Recomputable V8 caches retain 2,353 exact source-row/route/reason exclusions; their bytes are not copied. System executable/provider identities remain metadata only. No credentials, ambient caches, continuation17 or active C0 work were acquired. Non-Node tar per-PID IO/CPU/memory remain unobserved under the original diagnostic scopes. Nothing here expands semantic acceptance or measurement scope.

The original provider-reader failure remains at `../stopped-freeze.json`. Successor03's verifier failure remains at `../successor-03/stopped-freeze.json`: 577 repository-relative cache rows were compared with absolute addresses despite exact exclusions being retained. Successor04 changes only that address relation and separates its output root from the immutable data root. Exemptions require the exact original source row, exact route and exact reason under four declared bases; every exclusion is consumed. Neither old failure has been rewritten as a pass. `HOW.md`, `verifier-construction.json`, the one command/receipt and `verification.stdout` retain the successor proof.

Original source/main936 preservation evidence remains at its immutable successor03 cut. This successor rechecked all predecessor/prior carrier records and required repository dependencies without reacquiring original runtime addresses. Future C0, final installed/native proof and final acceptance require their own later transport selection.
