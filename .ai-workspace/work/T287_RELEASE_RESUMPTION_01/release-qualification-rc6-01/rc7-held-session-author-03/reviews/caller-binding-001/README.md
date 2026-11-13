Product Frame: unchanged fixed fifteen-family ABIogenesis 5.0, GOAL035/T287, selected installed/read STDO3.0.4 with empty composition and the accepted ABI5 frame. Existing ABG authority and both Program-owner guards remain unchanged.

**Confirmed S1 caller defect: a workspace-binding coordinate is read as a full binding body.** This is a bounded realization correction in two existing files.

Exact source: H03 stage01 subject SHA256 `1c0531c2ce628677ccfb7ac4f78ce812ad031d91689f0c23b69fda67102e3447`, source digest `8028802d674377a559e29781712476a0be441b393da59793c7b274f08b02e97f`. Actual operator lane: 48.767 seconds, 6 passed/1 failed/0 skipped. Original TAP: 3854 bytes, SHA256 `02cc47b4fd8826e893368a5a3de7b150fa211c85cc1013c2e6382119f40ce94d`.

The output declaration at `product/environment_operation_contracts.ts:449–454` says `binding: refDigestSchema`. Its actual producer, `environment_definition_bindings.ts:169–172,779`, returns `{ref: binding.bindingId, digest: binding.bindingDigest}`. `public-setup.mjs:296` stores that coordinate in `state.binding`; existing `refresh():128–133` already derives the authenticated full body into `state.environment.workspaceBinding`. The new access at line333 therefore deterministically throws after successful conformance, before Testing/UAT invocation. Because it is unconditional, ordinary consumer-default setup is affected too.

The whole new misuse cone is:

- `public-setup.mjs:333`: `state.binding.roots.productRoot`.
- `t287-default-library.test.mjs:2537,2542–2543`: `W=caller.state.binding`, followed by `W.roots` reads.
- The test at line2552: `identity.workspaceBinding.roots`, although the identity record preserves the existing coordinate at `public-setup.mjs:336`.

Minimum correction: use the already projected environment binding body for root reads. Retain `state.binding`, bound slots and recorded `identity.workspaceBinding` as coordinates. Compare the recorded coordinate to the existing admitted coordinate; the body relation is its `bindingId`/`bindingDigest`. No extra refresh/reopen, duplicate serialized binding body, Product export/helper, authority change or guard relaxation is needed.

Existing finally cleanup retains completed owner effects and closes their held prefix, or abandons on close failure. The observed failure establishes no authority bypass. The actual maintained fixed-admission test must eventually pass setup and exercise its existing downstream assertions on corrected source; six controlled passes do not provide that proof. Root owns correction and proof selection.

My earlier clean bounded review missed the actual output-contract join and incorrectly treated the local binding value as the full body. The controlled caller test injects `programBinding` and bypasses `populateSandbox`, so it cannot reveal this crash. The original review remains unchanged; this counterexample narrows its conclusion.

No source repair, test, build, runtime or provider operation was performed during triage. This is not installed-route acceptance, formal F11 J qualification, release evidence or a performance claim.
