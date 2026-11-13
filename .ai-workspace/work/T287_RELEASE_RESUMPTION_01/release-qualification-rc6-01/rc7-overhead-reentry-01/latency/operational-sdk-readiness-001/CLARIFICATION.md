# Product Frame

Unchanged ABIogenesis 5.0, GOAL-035/T-287, STDO 3.0.4 with `composition: []`. This clarification preserves the closed READINESS pair and separates an existing Product SDK capability from its operator harness export barrier.

**There is no exported equivalent of the complete installed-identity guard in the selected helper chain.** `operator-client/runner.mjs:332–345` keeps `checkInstalledIdentity` private. Its sole exported wrapper, `invokeLifecycle:349–355`, forces the cold CLI and provides no alternative transport argument.

The exported Product function `installedProductContentMatches(install)` supplies the underlying per-install boolean. It does not enforce the harness's exact two-install selection, record all install observations, or raise the same phase-specific boundary failure. Rebuilding those operations at another caller would copy the guard. `verifyArtifact` checks a packed artifact and is not equivalent either.

The smallest maintained change is to **export the existing `checkInstalledIdentity` declaration**, preserving its body and the current `invokeLifecycle` unchanged. The owner is `build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs` (frozen A checker at line 357). This is one native-Worker-owned harness change after B freezes, not a Product/SDK capability extension. No copied checker, extraction/eval, helper framework, or bypass is needed. A transport-neutral extension to `invokeLifecycle` would change more control flow and is unnecessary for this narrow barrier.

The next fixed-route selection currently lists five files and excludes this runner. Root can explicitly add this one existing path to that native task's grant. After its frozen return and Root disposition, the existing operator-client copy can be refreshed and pinned under control authority; subsequent SDK controls can import the actual guard and preserve its before-run and after-run/finally checks. The task must not bootstrap itself from its own mutable candidate helper.

**The next native task can meanwhile consolidate preparation, call construction and mechanical preflight into one host while retaining the existing exported `invokeLifecycle`.** Keep the same **reopen-based** prepared call in memory through those phases, using the existing preparation read-prefix/environment reuse. The unchanged wrapper performs both trusted checks and returns the genuine cold CLI execution/close evidence.

Do not pass an acquired selection to that CLI or leave an outer append resource held while it reopens. If such a resource was acquired, close it genuinely and rebuild the call against its actual close; changing only `eventResource` would invalidate transport-steering and invocation identity. The simpler interim route keeps the current reopen-based construction without acquiring that outer append resource.

This interim composition removes the parent preparation-to-dispatch restart/reparse boundary when Root selects it. It still serializes the real CLI request and performs the child's history acquisition, so it does **not** implement the complete one-resource sequence or establish a speedup. It can lawfully launch the native increment that exposes the guard; the fully guarded acquired SDK composition becomes available to later controls after the maintained change is admitted.

B's full cold readbacks and all existing close/source/review/proof requirements remain selected. Root owns future grant and proof sequencing. Only CLARIFICATION.json and CLARIFICATION.md were written; no source/control edits, tests, runtime acquisition or provider activity occurred. Exact deciding pins are in [CLARIFICATION.json](./CLARIFICATION.json).
