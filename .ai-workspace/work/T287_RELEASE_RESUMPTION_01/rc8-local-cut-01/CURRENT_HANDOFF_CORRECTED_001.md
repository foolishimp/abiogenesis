# Corrected RC8 cut preparation — control001

Prepared only; final source/archive acceptance and execution remain unbound. Preserve the original manifest and recipe as history. Use `PREPARATION_MANIFEST_CORRECTED_001.json`, `run-local-cut.corrected-001.mjs` and the two corrected binding templates for the future selected phases.

The driver now stages only the exact accepted changed paths, verifies every tracked delta is in that set, checks explicit expected new source files and reads back the exact staged set. Excluded untracked paths (including retained `.abiogenesis/` and `qualification-scratch/` progress) are recorded as paths and preserved. They neither join the source nor cause an exact-source mismatch.

Before compile, the extracted clean archive must match frozen inventory bytes for the compiler/generator controls, default-library STDO manifest and six members, qualification input manifest and its 95 source members, required schema/corpus seeds and governed-context adapter. Read-only base-tree inspection confirmed all 115 required inputs are tracked. The rule catalog is a generated output. No external seed tree is copied.

```sh
/opt/homebrew/bin/node run-local-cut.corrected-001.mjs build ROOT_BUILD_BINDINGS.json <bindings-sha256>
/opt/homebrew/bin/node run-local-cut.corrected-001.mjs install ROOT_INSTALL_BINDINGS.json <bindings-sha256>
```

Root binds each phase to the corrected preparation manifest. Build still requires accepted exact source, focused/review, broad-close and after-measurement proof; no checkpoint, build or install was performed here. The exact tested rc.8 archive must equal clean reproduction and is the archive shipped. Actual immutable-install smoke remains fresh owner verification/content/export/empty-event-read/actual-close; full lifecycle/performance remains exact-shipped-archive scratch proof.
