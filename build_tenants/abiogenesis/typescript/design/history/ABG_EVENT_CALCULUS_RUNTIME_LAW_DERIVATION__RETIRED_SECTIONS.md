Cut from `build_tenants/abiogenesis/typescript/design/ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION.md` at commit `39d6cb975`, lines 23-31, verbatim.


## First Slice

The first declared event set covers basis, graph call, frame, vector plan,
vector evaluation, vector closure, retry repair, continuation repair, reset,
and the temporal timer/scheduled-continuation extension needed by T-119.

The aggregate projection now checks vector closure through the declared EC
effect for `vector_closed` before applying its existing ordering law.
