# RC8 after bootstrap and measurement preparation

Stage04 is bound as preparation: base `27c08ce597b71c383eb3d032b25fa0791646c6c6` plus frozen digest `2b5849ec8b4fea58173c47109d9a89128e40d67745f69789c080eb6ac16b75bd` and source-freeze SHA `73bf1ee98bbe79ff9cbb93148f5b8bc848b39b44a7a74e5461961a86a67ed7f1`. The base hash is explicitly `base_only`, not a candidate checkpoint. Source acceptance and execution remain pending.

Root's selected sequence uses one `npm pack --ignore-scripts` of the accepted already-built stage, retained by existing commandRecorder. The candidate RC8 Product owners then perform `verifyProduct`, `constructResolvedProductLock`, `installProduct`, `isProductInstallCandidate` and `installedProductContentMatches`. They save actual verification, lock, installation and content-check outputs. This avoids the old wrong-version builder mismatch. No compile/generation, identity rewrite, final immutable install or new setup graph is introduced.

```sh
/opt/homebrew/bin/node prepare-after-bootstrap-001.mjs ROOT_AFTER_BOOTSTRAP_BINDINGS_001.json <bindings-sha256>
/opt/homebrew/bin/node run-measurement-after-004.mjs ROOT_AFTER_BINDINGS_004.json <bindings-sha256> ROOT_AFTER_ADMISSION_004.json <admission-sha256>
```

Root binds the first command to `AFTER_BOOTSTRAP_MANIFEST_001.json`, source acceptance and the concrete template, setting status `ROOT_SELECTED_RC8_AFTER_BOOTSTRAP`. All allocations are new: custody `bootstrap-rc8-001`, temp `/private/tmp/abg-r8m-rc8-bootstrap-001`, install `host` inside that temp root. Existing npm dependency resolution is reused offline; no reinstall into an immutable root. The one packed archive becomes the measured artifact and the archive later shipped. Final cut permits only byte-equal clean reproduction, not another changed archive.

On actual success the wrapper emits `SOURCE_ARTIFACT_RELATION.json` and `AFTER_BINDINGS.pre-admission.json` with the real `installation.json`, candidate digest and `cutRecord:null`. Root reads those and binds the separate measurement admission to `PREPARATION_MANIFEST_AFTER_004.json`; no receipt is fabricated or presumed. Family004 validates the frozen/source/artifact/installation relation and counts the retained bootstrap output/temp roots in its existing 1GiB aggregate boundary checks. Checks remain outside construction/call/profile intervals. The 600s envelope, 16MiB output cap, actual close, two matched unprofiled calls and separate profile call remain; overshoot between checks is possible, with no quota claim.

Absolute owner snapshots and missing-counter handling remain family003. All six probes are explicitly bound to candidate exports; raw snapshots retain absent dynamic keys without zero synthesis. Focused named receipts and exact owner semantics support interpretation. Successful before family002 stays unchanged.

Run the after pair/profile before the CPU-heavy broad suite. Full lifecycle/performance is proof on an installed scratch consumer of this exact archive. Later direct immutable-install smoke remains separately bounded to verification/content/export/empty-resource-read/actual-close; no native workflow claim. Preparation has run syntax checks only.
