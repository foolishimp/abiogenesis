# Executed counterexample — RC10 source judgment revised

**New S2 finding F3: the start owner holds the wrong invocation identity. The earlier `source_lifetime: satisfied` judgment is invalidated and now falsified.** Original reports remain preserved.

Product frame is unchanged: ABIogenesis 5.0's fixed fifteen families, exact Product/ABG identity and existing owner scope, disposable computation only. This is a realization defect under the already selected lifetime contract.

The admitted log independently confirms:

- Event 4 maps Public request `c29a45ac…` through `publicRequestInvocationRef` to admitted invocation `e97a8b94…`.
- Event 6's execution basis carries `e97a8b94…`.
- Frozen start owner line 1272 opens retention for `call.invocation.invocationRef`, which is `c29a45ac…`.
- Both retaining roots require the basis payload's admitted invocation ref. Their hold lookup therefore never matches.

Product `invocation.ts:1213-1229` explicitly preserves the Public ref and derives a separate semantic candidate ref. ABG admission preserves that mapping; execution-basis admission consumes the latter. Archived compiled owner bytes contain the same mistaken key and match the stage build.

The first 1 MiB call returned its expected semantic result, but 87 active samples showed one handle and zero retained rows/body roots. It performed 18 row admissions and 18 body digests. Post-return zero cannot demonstrate disposal of entries that never existed. The remaining 49 calls, history/cold readbacks and normal close receipt were not performed.

The external adapter also compares basis metadata to the Public ref at lines 66 and 74. That positive-witness selector is defective and preparation suitability is revised accordingly. It did **not** cause the observed zero retention: its branch was never reached. The positive nonvacuity gate correctly rejected the attempt. F1 stays open; F2 stays unchanged/open. The independent 23-deletion conclusion is unaffected.

I missed this in the static review by checking scope placement and cache mechanics without tracing Product candidate construction and ABG admission. I equated two identically named string fields instead of proving their identity relation. I repeated that omission in the adapter review. The relevant sources were available; this was an incomplete causal trace in my assessment.

The lawful repair is bounded `realization_refactor` under unchanged Product/requirements/HOW: establish retention eligibility using the actual admitted identity while preserving existing scoped cleanup and all refusal boundaries. The proof must independently follow the existing Public-to-admitted-to-basis owner relation. No global/aliased cache, observer-created hold, new identity authority or weakened positive assertion is warranted. Root selects the implementation and proof scope.

[Exact addendum, triage and pins](./executed-counterexample-001.json). Severity S2 reflects material active-reuse/proportionality failure with correct cold fallback observed, not loss of the final semantic outcome. No repair or execution was performed by Reviewer. Returned to Root; stopped.
