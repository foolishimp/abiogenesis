Product Frame: fixed fifteen-family ABIogenesis5.0, GOAL-035/T-287/REF-01, STDO3.0.4, empty composition. This review covers controlled handback test6 only.

S3: the fixture omits a required prepared archive. runProcess opens stdout r+ before spawning/installing lifetime guards. /controlled/no-output fails ENOENT; the fixture then emits EPIPE on its bare mock stream, throwing before it awaits the rejected promise. That explains both observed errors. No handback facts were produced, and the12-combination matrix remains unproved.

The intended private contract is unchanged: runProcess resolves the exact final facts plus any later finalizationError. The outer transport subsequently throws the first Error. Do not change this test to expect EPIPE rejection. Normal transport creates stdout/stderr exclusively before the call. The entire causal runProcess/preparation/refusal slices, shared lifetime and test are byte-identical to RC7; RC8 changes elsewhere do not establish a regression here.

Recommend one-case fixture setup maintenance: real temporary precreated empty stdout/stderr files, existing cleanup, controlled child/clock retained, all12 combinations and original identity/scope/observer assertions preserved. No runtime changes, fake finalization or ignored rejection. Reprove the whole named matrix without after-test asynchronous errors. It is the only direct private runProcess test caller found.

A6 F04's13 modes retain their separate Error/assessment proof and do not replace this matrix. File totals remain15passes/3fails; the two HTTP failures belong to their separate review. Root owns repair/disposition and whole-file conjunction. Exact source, comparison and receipt pins are in REVIEW.json. No tests, Product calls or process effects were performed.
