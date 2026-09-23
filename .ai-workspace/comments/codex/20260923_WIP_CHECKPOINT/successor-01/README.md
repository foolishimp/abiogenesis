# Incremental WIP checkpoint successor

This is preservation of completed development work, not a release cut or qualification claim. Accepted component/source work, installed read/cursor evidence, failed native/preparation attempts and F11 proposals keep their original scopes. In particular RC-recipe successor-02 is partial preparation; S02 carrier-02 is a component fixture, and F11 population/HOW remains proposal-only. No F11 implementation is included by implication.

The preceding checkpoint remains the restoration basis. Its accepted archive/member/restore receipts are referenced in `classification.json`. Already banked payloads were neither rehashed nor reuploaded. Their original logical files were checked by metadata; that is reuse of prior byte proof, not a new content assertion. `incremental-inventory.jsonl.gz` classifies inherited, new, changed, direct and initially active paths. Final reconciliation and publication receipts supersede initial pending status.

`checkpoint_transport.py` reuses the preceding lossless archive, bounded49MiB parts, hash, credential-shape scan and restoration code. The only collection change is an optional exact selected-path list, avoiding another full archive. `transport-selection.diff` records it. Each transport directory has its own catalog/member index, part hashes and actual restoration verification against the originals. Original files remain physically present. Exact transport-backed ignore paths suppress only preserved originals and named reproducible caches; new authored names remain visible.

To restore this successor's complete new files into a restoration tree, run the existing restoration owner for each transport directory listed by final composition:

```sh
python3 .ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-01/checkpoint_transport.py restore --checkpoint .ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-01/transport-01 --destination /absolute/path/to/restoration
```

No tests, native actors, provider calls, package builds or runtime operations are launched by these preservation tools. Final ordinary Git commits/pushes require the Root's closed-write-boundary effect selection; no force/amend/reset/tag/default changes are selected. `publication-receipt.json` will separate WIP checkpoint and accepted proof and report actual remote equality without inventing self-referential commit hashes.
