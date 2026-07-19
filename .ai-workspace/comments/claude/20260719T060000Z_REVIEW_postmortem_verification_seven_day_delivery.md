# REVIEW: Source-Level Verification Of The Seven-Day Delivery Postmortem

**Type:** REVIEW (reviewer seat; independent source verification of
`abiogenesis-5-final-integration/.ai-workspace/comments/codex/20260719T040318Z_POSTMORTEM_abiogenesis_5_0_seven_day_delivery_failure.md`).
**Author:** claude · 2026-07-19
**Method:** every numeric/structural claim checked directly against git and
the tree; the five load-bearing §5 technical claims traced through source by
three parallel agents, each instructed to *refute* its claim (a self-critical
postmortem's bias runs toward overstatement, so the adversarial direction
flips). Review basis is the dirty worktree at `232f7b2d` + uncommitted wave —
deliberately not a clean checkout, because the dirty wave IS the subject.

## Verdict

**The postmortem is substantially verified. The release-blocking
classification is supported by source. No 5.0 RC should be cut from this
state.** Every measured figure checked is exact to the digit. All five §5
technical claims are confirmed in substance — two with nuance that narrows
but does not reverse them, and one finding is *worse* than the postmortem
states. The errors found run in both directions and are small; none changes
a conclusion.

## Numeric and structural claims — all exact

| Claim | Verified |
|---|---|
| Version `5.0.0-dev.0`; no 5.0 tag; rc.4/rc.5 exist | ✓ |
| `merge-base(v4.6.0-rc.5, HEAD) = f4f081f6` (rc.3); 10 rc5-only vs 288 branch-only | ✓ exact |
| 300 commits Jul 11–18; 209 body→HEAD; governor at 174/209 ≈ 83%; ~99h | ✓ (208/173 exclusive = their inclusive counts; 83.2%; 99.4h) |
| Dirty state: 257 tracked files, `+20,522/−9,137`; ~82 untracked | ✓ exact (84 untracked now — the postmortem itself landed) |
| Worktree vs RC5: 851 files, `+221,751/−11,192` | ✓ exact |
| RC5 transport has B-001 lane law; 5.0 branch lost it | ✓ **decisive** — rc.5 `agent_transport.ts` carries `TransportCapabilityLane` (`"closed_prompt_proof" \| "worker_executes"`), lane-owned `--safe-mode` law, 18 lane references; the 5.0 file has **zero**, with `--safe-mode`/`--tools ""` hardcoded (:123, :131) |

## The five §5 technical claims — traced through source

**§5.4 SDK became a second controller — CONFIRMED.** The `run.invoke` branch
(`app/m04/public_sdk/sdk.ts:1402–1784`) itself owns the stage-to-stage
control flow for all six alleged behaviors: it builds One Surface selection
(`deriveRunInvokeOneSurfaceSelection` :782–891), sequences ~9
compile/prepare steps (:1447–1523), calls direct execution supplying the F_D
implementation itself (:1556–1571), concatenates event streams between
stages (:1525–1544, :1572–1576, :1682–1685), decides when post-action
evaluation runs (:1632), and routes consequence dispositions (:1602–1631,
:1704–1783). The M03 executors it calls are invoked *only* from sdk.ts —
no M03 entry point owns the sequence — while the constitutional M03-owned
loop (`runEngineStart`/`runEngineIterate`, `engine_runner.ts:8005–8128`)
exists and is bypassed. **Additional finding the postmortem omits:** the SDK
*mints runtime identities* in ingress — `basis://`, `graph-call://`,
`frame://` IDs at sdk.ts:849–889 — which is ABG-owned territory and
independently sufficient to establish controller status.

**§5.4 nonterminal-throw — OVERSTATED, current state split.** The `held`
path now returns typed continuation truth (`run_invoke_nonterminal`/
`gap_stop`, sdk.ts:1758–1783 against the published contract union). But
`retry`/`reprice`/`yield` dispositions still `throw TypeError` (:1754–1756),
so the typed `held` disposition with `interactionRef` is never produced by
this path. "Initially thrown" is unverifiable — the whole branch is new in
the uncommitted wave.

**§5.5 semantic authority not admitted — CONFIRMED.** The binding gate
(`one_surface_program_runtime.ts:249–270`) checks only functionKind, stage
authority ref, and uniqueness *within the caller-passed array*, then invokes
the supplied function; its output becomes admitted evidence
(`authority_snapshot_admitted`/`payload_validated`, :538–569). No registry
exists — every `implementation://` ref in src appears exactly once, at its
inline minting site; `pluginContractRefs: []`
(`abg_system_one_surface_program.ts:862`) and the only consumers of plugin
refs validate membership, never select implementations. Two fair nuances:
the external SDK ingress type carries no callback fields (the "caller" is
M04's own code, not an end user), and the post-action decision *content*
derives from the ABG assurance projection — the semantics are ABG-derived
even though the binding channel is unadmitted. Core claim stands.

**§5.6 event causality — mechanism CONFIRMED, T-276 undersold.** The M03
lifecycle event factories (`event_factories.ts` — graph_call_opened :108,
frame_opened :125, vector_* :138–209, basis_admitted :247, terminal_reached
:1514) accept **no causal-parent parameter of any spelling**; correlation
ids only; where `causationEventRefs` exists it is optional-with-`[]`, and
two factories hardcode frozen `[]`. The "prelude" is the product's own
variable name: `lifecyclePrelude` (`one_surface_execution.ts:1204–1218`)
batch-emits basis/graph-call/frame/vector-planned events *before*
`interpretCompleteCProgram` runs (:1274) — narration around the interpreter,
not events emitted by traversal advancement. Under this repo's own
replay-only truth law, the log alone cannot derive the causal chain. **But
the postmortem undersells T-276:** it pinned one genuine causal edge
(`construction_episode_started.causationEventRefs` must include the public
admission's eventId — threaded through product code at sdk.ts:881), confined
the whole chain to one public call's byte-prefix-verified append delta, and
made closure emission outcome-contingent. The accurate statement: T-276
proved process-level causation plus one in-log causal edge; in-log causal
parentage across the lifecycle segment is structurally impossible with the
current factories. Notably, adjacent event families
(`public_operation_artifact_admitted`, construction events) already enforce
required causal refs — the repair pattern exists in-tree and simply was not
applied to the lifecycle family.

**§3.1/§5 handler connection — CONFIRMED in substance; count is 11/8
strictly, 10/9 by the postmortem's own classification.** All 19 identities
enumerated with evidence: 8 (workspace.open, run.continue,
interaction.respond, witness.admit, tuning.transition, conformance.evaluate,
product.materialize, release.snapshot) terminate at the literal
`"public SDK owner is not connected"` throw (sdk.ts:1786–1788; CLI mirror
command.ts:800). `workspace.open`'s handler exists but has zero callers.
`project.read` is connected except `ticket_consensus`, an explicit
`handler_semantic_not_realized` gap. `run.invoke` counts as connected only
if the Sunny hardwiring is accepted: the SDK branch itself binds
`bindSunnyNativeDefinition` (:1550) and injects
`buildAbgSystemSunnyFdImplementation()` (:1566–1568) — an identity-function
F_D arm — so "Sunny-specific presented as generic" is corroborated **at the
product layer**, not just the probe. Discounting it gives exactly the
postmortem's 10/9.

**§5.7 hard break — CONFIRMED, and WORSE than stated.** Dual public truth is
live at the package root: `m04/index.ts:19` exports
`DS1_PUBLIC_OPERATION_IDS` by name; `:18` wholesale-exports the legacy SDK
surface including **13 executable legacy handlers** in
`runtime_operations.ts` (catalog.admit/list/describe/allow/invoke, five fh.*
ops, run.resume, read.result/replay); re-exports at :21–23 add the remaining
six (install/resolve/verify/bind/workspace.create/open) — all 19 legacy
handlers executable from the package root alongside the replacement family.
**Aggravations the postmortem does not name:** (a) three ids —
workspace.create, workspace.open, catalog.admit — exist in *both* families
with *different contracts*: the exact same-name/different-shape authority
violation the pending STDO-UP-004 negative fixture targets; (b) package.json
:9–10 still publishes the pre-5.0 bins (`abiogenesis-ts`, `genesis-ts`)
routing legacy steel-thread commands. One weak spot in the claim: the DS1
CLI-coordinate resolver is exported but bound to no bin.

## Corrections to the postmortem (all minor, none reversing)

1. Handler count: 11/8 strict; 10/9 only under the (defensible,
   corroborated) run.invoke discount. State the classification.
2. Nonterminal handling: the `held` path is now typed — credit it; the
   remaining defect is retry/reprice/yield throwing.
3. T-276: one genuine causal edge exists; the correlation-only
   characterization is too flat, and the repair is smaller than implied —
   extend the in-tree causal-ref pattern (already enforced for construction
   and artifact-admission events) to the lifecycle family, and emit from
   traversal advancement instead of the prelude.
4. Add to §5.7: the three dual-contract same-name operations and the legacy
   published bins.
5. Add to §5.4: SDK-side runtime-identity minting (basis/graph-call/frame
   ids at sdk.ts:849–889) — independently decisive for controller status.

## Judgment calls assessed

- **Release-blocking classification: supported.** Second controller +
  unadmitted semantic authority + dual public truth + no in-log causal chain
  + 8–9 unconnected operations + a lost released capability (B-001 lane law)
  — any one of the first three blocks alone.
- **"Valid evolution, failed integration" frame: consistent with my prior
  audits.** The substrate the postmortem retains (§10.1) is largely the set
  my DS-1..DS-3 audits verified clean (T-253/254/259/260/261; T-262 after
  repair); the rework list (§10.2) matches what the agents just confirmed
  broken. The salvage classification is credible.
- **Restart conditions (§12): sound.** One addition: the amended T-276
  governor should also assert restoration of the RC5 lane law (a
  `worker_executes` invocation reproducing the B-001 proof), since that is
  the one *regression against a released product* in the list — conservation
  of released behavior deserves an explicit gate, not just reconciliation
  classification.
- **Accountability (§8):** the record matches what I observed and, where it
  names reviewer misses, matches what I documented about my own in-session
  (the 07-10 fixed-point endorsement, the first T-256 pass). Fair as
  written.

## Boundary

Reviewer output; no files changed in the reviewed worktree. The postmortem's
acceptance, the restart conditions, and the RC5 reconciliation ruling are
F_H's. Agent evidence retained in session transcripts; all decisive
citations reproduced above.
