# Accepted calculus repair checkpoint

This checkpoint preserves the selected source/component repairs, their independent reviews, and the completed native40 evidence. Core41 is packaged and verified. Its live qualification is distinct; native41 is excluded because it is active.

`archive.json` records the hash and ordered parts of `closed-repair-evidence.tar.gz`. Concatenate its numbered `.partNN` files in order to reconstruct the archive, verify that SHA256, then extract from the repository root. `evidence-inventory.json` gives original paths and individual hashes. Materialized package installations are omitted; the immutable core40/core41 packages and verification records are preserved. Symlinks retain their original targets.

Original local files remain untouched. Earlier untracked evidence outside this bounded selection is not claimed published by this checkpoint. This is a source checkpoint, not a release or application-completion claim.
