Cut from `build_tenants/abiogenesis/typescript/design/ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION.md` at commit `39d6cb975`, lines 23-31, verbatim.


## First Slice

The first declared event set covers basis, graph call, frame, vector plan,
vector evaluation, vector closure, retry repair, continuation repair, reset,
and the temporal timer/scheduled-continuation extension needed by T-119.

The aggregate projection now checks vector closure through the declared EC
effect for `vector_closed` before applying its existing ordering law.

---

Cut from `build_tenants/abiogenesis/typescript/design/ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION.md` at commit `8477fbc47`, lines 199-211, verbatim.


The bounded exact-intent realization is selected in
[T287_PENDING_CONSUMER_CONTINUATION_DESIGN.md](T287_PENDING_CONSUMER_CONTINUATION_DESIGN.md#exact-constructionintent-continuation-selected-bounded-realization).
Its pending truth derives from the original selected ConstructionIntent and
an actual admitted undispatched F_P preparation failure. It does not generalize
F_D failure into permission. Continuation reentry consumes the old frontier and
binds new Run-local cursor/parent identities to the original work authority and
progressed input under a separately admitted continue operation. Normal child
fold and parent predicates still own completion. A replacement continuation is
new Run-local obligation truth; the historical failure and Result identities
remain unchanged. Unsupported phases/effects/support remain explicit refusals.
This owner relation does not change fresh retained-work semantics or existing
F_H response meaning, and supplies no qualification by declaration alone.
