**PREPARED_NOT_DISPATCHED — minimal successor to operational-preparation-001.** Closed001 pins remain unchanged.

The host no longer writes or rereads `prepared-call.json`, hashes the acquired call, or eagerly stringifies the constructor result. `PREPARED_CALL.json` now records only the existing owner-issued invocation ref/digest/definition key, Product input digest, durable prefix, source/context coordinates, capacity and phase metadata. The actual call, caller, environment and resource remain in memory through the SDK invocation. Refusal diagnostics use scalar kind/code.

The large retained resume is now read, pinned and parsed once through the existing pin reader; the author overlay no longer retains a separate raw byte buffer. The only full successor-state output is the required actual resume, with resource/selection/environment null. Actual SDK outcome/receipt and the separate owner close receipt remain mandatory. The close uses the actual completion successor, or held current prefix on failure; no capability-bearing call/store is serialized there and no replay/history acquisition was added.

Only the host template changes operationally. Inherit001’s launcher, filter correction, executable-provider checks, three-stage/four-invocation limits, five Product paths and unbound future N pins.002 supersedes001’s descriptions of a full prepared-call evidence file. Root materializes this host instead of001’s version.

Syntax-only check passed; no prepared script or runtime operation ran. Root admission, actual N source/checker/close bindings, cold proof and acceptance remain pending.
