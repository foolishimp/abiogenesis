# Product Frame

Unchanged ABIogenesis 5.0 fifteen families, GOAL-035/T-287, STDO 3.0.4. This supplement decides three bounded reuse/routing relations through the existing SDK, library and ABG owners. The closed READINESS files remain unchanged. Exact pins and selected metadata are retained in SAME_PROCESS_REUSE.json.

## 1. Reuse the already acquired environment through the existing API

The successful P3 preflight took **135,557.707 ms** host wall; `environment_refresh` took **61,812.121 ms** and `lifecycle_call_construction` **69,925.124 ms**. Timing SHA: `c3820ff41f50b4fb8db15e312ac9cbdc626b8dae5c63206ea8a147e1a460ac61`.

`prepare-r1.mjs:46` sets `retained.state.environment` to null. Lines 83–87 create `dry`, refresh it, and obtain the actual owner environment. Lines 134–135 create a second caller from the still-null retained state. `constructLifecycleCall` immediately calls `caller.refresh()` (`public-setup.mjs:305`), losing the acquisition already available in the same process.

**Minimal relation:** after assigning the second caller's state, call its existing `caller.refresh(env.prefix)` with the exact object returned by the dry acquisition. `refresh(readSource)` already compares that coordinate with the current prefix, validates currentness, and projects the environment (`public-setup.mjs:126–133`). Lifecycle construction's subsequent refresh then consumes `state.environment.prefix`. No new API, cache, trusted flag or controller is needed; do not clone or serialize the owner value.

Keep worksite observation, installed-content checks, physical prefix checks and runtime admission/effect boundaries. Prefix mismatch falls back to the current source; currentness remains checked. The 69.925-second phase includes other work, so it is not measured removable time. A future same-prefix/input comparison must show equivalent constructed-call coordinates/refusals, no prefix writes and fewer cold acquisitions. No patch or test ran here.

## 2. The fixed proof does not acquire a universal selector obligation

The actual initial selector ran **334,345 ms**, from process event 170539 at 02:33:52.774Z to exit 173286 at 02:39:27.119Z. The Testing task Result at 173333 and command actor at 173358 establish the actual Testing consequence. No private selector content was read.

Product's default-library contract (`PRODUCT.md:1093–1111`) makes the recursive Executive an explicitly selected, replaceable composition with no unconditional role hierarchy. Accepted HOW says callable coverage is not mandatory calls (`T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:122–125`) and calls the recursive Executive optional (`:145–151`). These clauses do **not** require another open-choice F_P decision merely because an already fixed proof is being executed.

However, the current selected route cannot simply skip it:

- `consumerDeclaration:35–41` declares the consumer's start at Executive, and `constructLifecycleCall:311–315` selects that Program's next start. The current PROOF_ONLY_GRANT explicitly selects Testing/UAT selectors and forbids injected observations/synthesis.
- The SDK supports direct GraphFunction invocation and Testing is callable, but the wrapper is `prepare → C2 child → fold` (`gtl/default_library.ts:37–51`). Preparation accepts observed files without author evidence (`abg/default_library.ts:287–305`); **fold rejects `synthesis:null`** and demands the admitted selection name the wrapper (`:317–320`). A direct invocation therefore does not establish supported wrapper completion.
- UAT preparation requires a genuinely admitted selected Result and its observation/basis/provenance join (`abg/default_library.ts:178–196,228–245`). The fresh input deliberately contains neither observations nor synthesis. Published lower C2/assessment capabilities do not by themselves establish a complete selector-free Testing→UAT composition.

**Decision:** no universal Product selector mandate was found, but no complete existing direct route was established for this selected fresh input. The concrete gap is direct-invocation provenance/fold plus UAT producer ingress without pretending an F_P synthesis occurred. If Root selects this future change, it belongs to bounded default-library HOW/realization re-entry through the existing owners. This supplement supplies no alternate graph/controller and changes no active proof route.

## 3. Separate operational reuse from cold proof

Product's SDK/CLI contract (`:994–1033`) makes CLI a thin shell over the same installed owners. Live-state reuse (`:811–849`, PROJECTION-002/-025) forbids reauthentication solely at internal handoffs while preserving genuine acquisition, invalidation and cold reconstruction. **A fresh CLI process at every operational step is not universal Product law.**

`publicCaller.invoke:150–172` already calls the installed in-process transports, using `runInstalledDefinitionCallWithResource` for an actual held selection. `invokeColdInstalledEntry:239–258` is the harness's expressly selected cold entry. Preserve installed/release cold discriminators at their selected proof boundaries; do not copy them into every ordinary operation by assumption.

Two implementation limits prevent claiming a blind substitution: the current exact-prefix read binder accepts only a reopen assertion (`exact_prefix_bindings.ts:117–126`), so acquired setup support does not prove borrowed read support; in-process reopen still performs the owner's cold acquisition. Also the cold helper explicitly carries the returned close handoff, whereas `publicCaller.invoke` advances its borrowed selection. Operational integration must preserve that receipt propagation.

The earlier READINESS instruction to keep both fresh reads applies to the selected installed proof, not to every operational task. No current proof, source, control or runtime was changed; no measured speedup or broader acceptance is claimed.
