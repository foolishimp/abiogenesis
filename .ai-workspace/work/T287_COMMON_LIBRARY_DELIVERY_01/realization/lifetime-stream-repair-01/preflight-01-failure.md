# Source/generator boundary preflight stop

The initial source inventory includes the frozen baseline contracts/ files because they were copied as declared source-owned generator inputs/support. tsc and the source-owned generator returned zero. The next preflight incorrectly required every member in that initial inventory to remain byte-identical after generation, and stopped on contracts/capabilities/capability-definition-graph.json. Exact differences are in preflight-01-deltas.json. This is not an observed process/stream counterexample.

The command then entered the diagnostic script, which refused before process launch because F2-preflight.json had not been written. No host or child was launched, no actual process evidence exists for this repair yet, and no test was retried. The original 8 MiB counterexample is preserved in the closed review-triage subject.

Attributed tool-output transcription:

```
AssertionError: build_tenants/abiogenesis/typescript/contracts/capabilities/capability-definition-graph.json
FileNotFoundError: .../lifetime-stream-repair-01/F2-preflight.json
```

Return to Executive for classification of deterministic generated members versus immutable source inputs and permission for the smallest corrected preflight. No code or expectation repair follows from this stop. A lawful successor must retain the initial inventory, both successful generator receipts, and this failure; exclude only authenticated generator-owned outputs from the pre-generation invariant, bind their actual post-generation bytes, and recheck all real source inputs. No blanket identity stripping is proposed.
