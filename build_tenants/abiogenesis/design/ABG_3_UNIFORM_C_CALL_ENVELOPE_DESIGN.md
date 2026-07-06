# ABG 3 Uniform C-Call Envelope — Design Module (T-200)

**Status**: Ratified (user, 2026-07-06)
**Authority**: realizes `REQ-R-ABG3-CCALL-001..-012`; design under T-200
§2 as amended §8; governed by DESIGN_MODULE_METHOD.
**Module**: the traversal monad's single compute envelope — spine
carriers, the one resolver, fibre enclosure, and the erase of the
per-arm effect zoo.

## 1. Structural carrier diagram (§5E)

```mermaid
flowchart TD
  subgraph SPINE["Spine (base category — locus only, engine-minted)"]
    O["c_call_opened\ncCallRef, basisId, graphFunctionId,\ngraphCallId, frameId, edge, vectorIndex,\nstageRole, taskOrdinal?, attempt, batchRef?"]
    O --> FS["c_call_fibre_selected\ncCallRef, regime, armId, compositionRef?\n(first interior row, admitted truth)"]
    FS --> EV["c_call_evidenced (0..n)\ncCallRef, evidenceClass, evidenceRefs[]"]
    EV --> RA["c_call_result_admitted\ncCallRef, outcomeStatus,\npayloadRef?, responseContractRef?"]
    RA --> J["c_call_judged\ncCallRef, judgment, reasonRef?"]
  end

  subgraph FP["F_P fibre interior (enclosed)"]
    D1[fp_dispatch_requested] --> D2[actor_invocation_started]
    D2 --> D3["payload_observed/validated,\nactor_result_artifact_observed"]
    D3 --> D4["instruction_response_contract_admitted,\nactor_invocation_closed"]
  end

  subgraph FD["F_D fibre interior (enclosed)"]
    X1["execution/command evidence rows\n(or evidenceClass: default)"]
  end

  subgraph FH["F_H fibre interior (enclosed)"]
    H1["fh_escalated / approval rows"]
  end

  EV -.->|"evidenceRefs (enclosure law -006)"| FP
  EV -.-> FD
  EV -.-> FH

  R["resolveCCall(stageRole, regime, input)\nONE entry; census (stageRole × fibre)\nasserted here (-003/-008-census)"]
  R ==>|mints| SPINE
  P["plugin seam / engine-internal F_D\nreturns CCallOutcome — NEVER mints spine"]
  R --> P

  J -->|"judgment vocabulary:\nadvance | retry | pending | blocked |\nescalated | no_declared_check"| NEXT["monad bind: next C call / retry law / terminal"]
```

Invariant visible by construction: no fibre name appears in any SPINE
box; `regime`/`armId` exist only in the fibre-selection interior row.
Edge traversal = three spine instances (transform, evaluate,
consequence); composed stage-tasks that can invoke work each get their
own spine with `batchRef` grouping (-005).

## 2. Seams and authority

| Surface | Authority | Consumers |
|---|---|---|
| Spine minting | engine (`resolveCCall` path) ONLY | replay, projections, gates, retry law |
| `c_call_fibre_selected` | engine, from census registry data | temporal gate joins (-010), audit (-012) |
| Fibre interiors | existing event families, unchanged kinds | enclosed via `c_call_evidenced` refs |
| Plugin seam | returns `CCallOutcome`; kind-restricted sink for transport envelope only (T-195 C4) | engine admission |
| Census | `(stageRole × fibre)` registry rows beside `ENGINE_FP_DISPATCH_ARM_IDS`' successor | resolveCCall assert |
| Admission | `event_admission` field rules for 5 spine kinds | emit choke point |
| Replay adapter (-011) | projection layer, read-time derivation | pre-envelope ledgers |

## 3. Evaluator table (§3B — how each decision is judged)

| Decision | Evaluator | Verdict criterion |
|---|---|---|
| Locus-only spine (-002) | admission differential + this diagram | spine event carrying `regime` REJECTED at admission; diagram shows no fibre in spine |
| Fibre selection as truth (-003) | admission axes | missing/duplicate selection row per cCallRef fails closed |
| Full-identity ref (-004) | collision differential | recursive-frame + repeated-graph-call fixture yields distinct cCallRefs; collision constructs rejected |
| Spine-per-task (-005) | audit equality on composed lane | N worker sessions in a batch ⇒ N spines; archives≡replay holds on t145/t146 lanes |
| Enclosure (-006) | NEGATIVE control | a free-floating `fp_dispatch_requested` (no open spine) yields a typed drift diagnostic on real replay |
| Shape preservation (-007) | substitution differential | same scenario, evaluate.C flipped F_P→F_D fixture: identical spine kind sequence; diff limited to selection row + evidence class |
| Judgment vocabulary (-008) | NEGATIVE control | `no_declared_check` on an edge with declared checks does NOT advance; never satisfies any temporal gate |
| One retry law (-009) | allowlist differential | evaluator-arm transport failure retries exactly as transform-arm; non-allowlisted class blocks on both |
| Antecedent = selection row (-010) | gate re-proof, single-event guards | five standing gates non-vacuous on evaluate + composed arms in the p4 lane; no join machinery added |
| Replay compat (-011) | old-ledger differential | rc.10-era events.jsonl projects a derived spine; zero synthetic events written |
| Audit equality (-012) | standing gate measurement | sessions-in-archives == spine invocations, per arm, per fibre, in t194 + data-mapper lanes |

## 4. Module lifecycle confirmation (§6C — answer / N-A / named gap)

- **Creation**: P1 carriers/factories/admission; spine kinds enter the
  event vocabulary with field rules. ANSWERED.
- **Operation**: P2 strangler — old resolvers delegate through
  `resolveCCall`; spine emitted around existing interiors; parity
  differentials green before any behavior change. ANSWERED.
- **Migration**: pre-envelope ledgers remain readable FOREVER via the
  -011 read-time adapter; no ledger rewrite, no synthetic truth.
  In-flight mixed ledgers (old prefix + new suffix) project uniformly.
  ANSWERED.
- **Decommission**: P5 erase — per-arm effect resolvers, C3 vacuity
  markers, transform-arm `dispatch_required` specialness removed only
  after P2–P4 differentials hold; enclosure drift witness stands
  against regression. ANSWERED.
- **Failure modes**: spine outcomes carry the one retry law; binding
  defects surface as `runtime_failure_observed` (T-195 C4); worker
  refusals/corruption remain typed blocked truth (campaign #3b/#5).
  ANSWERED.
- **Observability**: -012 audit equality automated into the standing
  gate; cost per fibre readable from replay alone. ANSWERED.
- **NAMED GAP (resolved in-plan)**: m04 public-outcome mapping for
  `pending` on non-transform arms — public `dispatch_required`
  projection generalizes; specified at P3, proven in the m04 lanes at
  P4. Named here per the sufficiency rule, not deferred silently.

## 5. Differential proof plan (positive AND negative controls)

`test:t200` lane, grown per phase:

- P1: admission axes for all 5 kinds; cCallRef collision rejection;
  selection-row uniqueness; **negative**: spine-with-regime rejected.
- P2: parity — t072/t145/t146/t183 event streams gain spine without
  interior change; archives≡replay on the engine p4 lane; **negative**:
  free-floating fibre event → drift diagnostic.
- P3: five standing gates re-proven via join antecedents; **negative**:
  `no_declared_check` never satisfies; vacuous ≠ satisfied preserved.
- P4: retry-law parity across arms; **negative**: non-allowlisted spine
  failure blocks identically on transform and evaluate arms.
- P5: erase pass with enclosure witness on REAL replay from the t194
  sandbox run.
- P6: substitution differential (F_P→F_D evaluate fixture) + audit
  equality in `test:t194:sandbox-live` + odd_glc data-mapper live lane.

## 6. Erase register (P5 exit criteria)

1. fd_evaluate/fp_evaluate/fp_dispatch/consequence_project/composed_*
   per-arm resolvers → delegated, then removed.
2. C3 default-marker refs → degenerate-fibre envelopes.
3. Transform-arm `dispatch_required` special case → pending projection.
4. Per-arm retry detours (#5b class) → spine retry law.
5. Evaluator-invisible sessions (finding #11) → impossible.
6. Vacuous off-transform gates → non-vacuous by -010.
7. Binding-level dispatchGuard/evaluatorGuard (odd_glc) → retired
   downstream once `runtime_failure_observed` + spine cover the class.

## 7. Ratification

Ratified by the user 2026-07-06. P1 executes under this design
authority; findings anchor to §-clauses of this document and the CCALL
requirement family.
