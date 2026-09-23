# WIP checkpoint transport

This directory preserves current development work for a Git checkpoint. It does not assert ABI 5.0 or odd_glc release qualification, RC acceptance, scenario completion, or successful assessment. The current generic run failed before assessment; its original evidence remains historical and unchanged.

`catalog.json` lists ordered transport parts and whole reconstructed-asset hashes. `members.jsonl.gz` maps every archived member to its original repository-relative path, exact bytes and SHA-256. `path-reconciliation.jsonl.gz` assigns every enumerated candidate to direct Git representation, archive-backed representation, an explicit reproducible exclusion, or pending active evidence. `exclusions.json` explains exclusions; no comments, test_runs, sandbox, source, report, or genuine runtime-evidence directory is excluded merely by name.

Original compressed archives are copied exactly and split only for transport. Other retained material is stored in lossless tar/gzip. Every part is at most 49 MiB. Originals remain in their original locations and are never rewritten or deleted by this preparation.

From the repository root, verify all transport parts, reconstructed assets, member paths and bytes:

```sh
python3 .ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/checkpoint_transport.py verify --checkpoint .ai-workspace/comments/codex/20260923_WIP_CHECKPOINT
```

`verification.json` is an immutable preparation receipt. Repeated verification prints its current result without replacing that receipt. A fresh clone contains all direct Git files and this transport. Restore archived paths into a new empty directory, then copy them into the clone if desired:

```sh
python3 .ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/checkpoint_transport.py restore --checkpoint .ai-workspace/comments/codex/20260923_WIP_CHECKPOINT --destination /absolute/path/to/new-empty-restoration
```

Restoration verifies hashes and sizes, restores exact file paths and modes, and refuses overwrite or traversal through symlinks. Symlink targets are preserved as evidence, including any historical absolute paths; no symlink is dereferenced by archival. The restore directory need not be an installed/runtime workspace. No program, test, package, build, native command or model is executed.

ABIogenesis also has two immutable supplements. `composition.json` resolves the original pending cursor record through `cursor-supplement`, and moves completed witness runtime files from the provisional direct list to `scratch-supplement`. After restoring the main archive, restore both supplements into that same restoration directory:

```sh
python3 .ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/checkpoint_transport.py restore --checkpoint .ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/cursor-supplement --destination /absolute/path/to/new-empty-restoration
python3 .ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/checkpoint_transport.py restore --checkpoint .ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/scratch-supplement --destination /absolute/path/to/new-empty-restoration
```

All three transports were restored together and compared with their original files. `final-direct-paths.nul` supersedes the provisional direct list for final Git staging. The separate `restoration-verification.json` receipts preserve the supplemental restoration checks.

`direct-paths.nul` is a preparation inventory, not a claim that moving canonical source was frozen. Final canonical source, tests, generated metadata, tracking changes and any closed active-evidence supplement must be reconciled after final source acceptance before staging. The final publication receipt will identify actual commits and remote heads separately.
