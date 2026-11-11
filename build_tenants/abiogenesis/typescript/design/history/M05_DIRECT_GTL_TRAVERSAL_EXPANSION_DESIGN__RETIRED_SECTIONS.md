Cut from `build_tenants/abiogenesis/typescript/design/M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` at commit `e1516b5f1`, lines 3487-3658, verbatim.

### 14.3 Observer and tuner Product domain

ABIogenesis publishes one executive Module containing:

- `gtl://abg/observer/default`;
- `gtl://abg/tuner/default`;
- one observer GraphFunction;
- one tuner GraphFunction;
- exact replay-snapshot, observer-report, tuning-signal, declaration-draft,
  transition, and refusal contracts; and
- declared implementations behind those GraphFunctions.

The observer input is an ABG-derived replay snapshot, not a caller-authored
summary. It binds the exact workspace, invocation or qualification subject,
event-store digest, ordered event refs, terminal or halt state, evidence refs,
result refs, route refs, continuation refs, and applicable policy refs. The
observer emits attributed findings and a truthful halt classification. It may
not carry a write, event-emission, traversal, continuation, or closure field.

The tuner input binds the admitted observer report plus replay-derived signal
rows. The tuner emits one declaration-draft candidate preserving:

- draft and proposer identity;
- affected declaration refs;
- replay, observation, and signal bases;
- proposal kind;
- before and proposed-after digests;
- an equivalence-contract ref when the proposal anneals an `F_P` interior to
  an `F_D` interior; and
- a summary that is evidence, not authority.

The deterministic default fixture may emit a bounded draft from a declared
signal. Open semantic interpretation remains `F_P`. Neither form mutates live
declarations, specification, configuration, tickets, workspace assets, or
runtime state.

### 14.4 Public reads and tuning transition

`project.read(observer_report)` and `project.read(tuning_report)` are
side-effect-free replay projections. They reopen the exact durable event log,
derive their output from admitted events and Product results, and append
nothing.

`tuning.transition` owns exactly three variants:

- `propose` admits one authentic tuner output as
  `tuner_draft_admitted`;
- `ratify` admits `tuner_draft_ratified` under an exact actor or visible policy
  authority; and
- `reject` admits `tuner_draft_rejected` under the same authority class.

The events are workspace-scoped ABG truth and preserve draft ref and digest,
workspace binding, proposal kind, proposer, replay and signal bases, affected
declarations, before/after digests, decision actor or policy, and causation.
Ratify and reject require the exact open admitted draft and are mutually
exclusive. Repeated, cross-workspace, substituted, unattributed, or
non-tuner-authored transitions refuse.

Event Calculus initiates `tuner_draft_open(draftRef)` on admission and
terminates it on ratification or rejection. Replay projects the exact draft
state and decision event. Ratification records authority only; applying the
draft requires later ordinary intake, change classification, and work under
the affected Product owner.

### 14.5 Qualification readiness

M5 does not issue the S04 qualification verdict. It makes S04 runnable by
proving the installed behavior over a bounded candidate-like replay fixture:

1. a truthful halted replay produces an attributed observer report;
2. an injected contradictory replay produces the expected non-green finding;
3. the tuner emits a grounded declaration draft from admitted signal truth;
4. proposal, ratification, and rejection are replay-visible;
5. a draft lacking signal or replay basis refuses;
6. neither observer nor tuner mutates live authority or source; and
7. all reads are side-effect free.

M6 repeats this behavior over the exact frozen `pre_rc_candidate`, selected
STDO basis, complete inventory, and qualification subject.

### 14.6 Semantic views and authority

**Domain view**

```text
FlavoredCatalogProduct
  -> node_type + overlay + GraphFunction

ExecutiveDomain
  -> ReplaySnapshot
  -> ObserverReport
  -> TuningSignal
  -> DeclarationDraft
  -> DraftDisposition
```

**Interaction view**

```text
native SDK | native CLI | Codex delegate
  -> one Public contract
  -> catalog/apply/invoke
  -> HoG
  -> ABG
  -> replay projection

project.read(replay)
  -> observer GTL
  -> tuner GTL
  -> tuning.transition
  -> ABG replay
```

**Lifecycle view**

```text
declaration: admitted -> applied
draft: candidate -> admitted -> ratified | rejected
```

These states project existing Product and ABG truth. They do not create a
controller or independent workflow.

IACS remains singular:

| Authority | Owns | Does not own |
|---|---|---|
| flavored Product | declarations, contracts, Program, GraphFunction, judgment, implementation | ABIogenesis runtime or public semantics |
| Codex delegate | process transport to installed CLI | Product, traversal, event, continuation, closure |
| observer Product content | attributed diagnostics over replay | mutation or runtime truth |
| tuner Product content | signals and declaration-draft candidates | ratification or live mutation |
| human or declared policy | ratify or reject decision | retroactive draft authorship |
| GTL publication | observer/tuner topology and contracts | runtime admission |
| validator | static program and contract law | lowering or execution |
| HoG | direct traversal | Product semantics |
| ABG | declaration application, draft transition, events, replay | diagnosis or proposal meaning |
| Public | typed invocation and projection | fixture, observer, or tuner orchestration |

Prime contraction is:

```text
one public invocation family
  + one direct traversal runtime
  + Product-owned semantics
  + ABG-owned admitted truth
```

The old Codex runtime, observer runner, tuner state store, manifest-only
capability roster, host-owned Product switch, and source-tree fixture import
are prohibited rival authorities.

### 14.7 Promotion boundary

Promotion requires:

- native SDK, CLI, and bounded Codex projection agreement;
- one source-independent flavored Product applying node-type and overlay rows
  and invoking its GraphFunction through installed public contracts;
- observer and tuner execution as ordinary admitted GTL;
- side-effect-free observer and tuning reads;
- authentic proposal plus mutually exclusive ratification and rejection;
- injected-negative, cross-basis, duplicate-transition, and direct-mutation
  refusals;
- deletion of the alternate Python Codex runtime;
- no fixture-specific core branch, compiler, lowering carrier, controller,
  second runtime, or second truth store;
- `test:m4`, complete prior `test:m5`, and deterministic package reproduction
  remaining green.

Micro implementation details may co-evolve inside these fixed identities.
Changing Product meaning, public operation identity, event ownership, or the
GTL/HoG/ABG authority split requires renewed design review.

---

Cut from `build_tenants/abiogenesis/typescript/design/M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` at commit `d5c1be89a`, lines 135-135, 212-212, 224-224, 234-234, 238-238, 239-239, 253-253, 258-258, 282-282, 340-340, 364-369, 558-560, 565-568, 870-886, 997-997, 999-999, 1011-1012, 1017-1017, 1019-1019, 1046-1046, 1048-1048, 1059-1060, 1153-1155, 1227-1227, 1231-1231, 1249-1250, 1252-1253, 1279-1279, 1280-1280, 1281-1282, 1300-1300, 1301-1301, 1305-1305, 1307-1307, 1309-1309, 1336-1337, 1405-1409, 1470-1470, 1488-1488, 1514-1514, 1524-1524, 1598-1613, 1638-1640, 1675-1675, 1729-1729, 1797-1805, 1827-1828, 1830-1831, 1864-1864, 1930-1931, 2041-2047, verbatim.

| `Continuation` | `TraversalAggregateFamily` | ABG | Authoritative run-local open obligation. The complete target algebra names open, resolved, superseded, and abandoned; the selected S03 realization proves only open, responded, and resolved, with superseded and abandoned deferred. |

| continuation | opened from admitted hold | open, responded, resume admitted | resolved in the selected S03 realization; superseded and abandoned remain explicit target-only gaps |

| `InteractionLeafRequirement` | GTL declaration and validation | ABG admits exact non-executable contract row | F_H request and response admission only | continuation terminal or declaration supersession |

| `HumanInteractionBoundary` | GTL declares callout and ABG admits hold | public projection renders pending interaction | attributed external actor returns candidate | response admitted or rejected in this cut; abandonment and supersession remain target-only gaps |

| `Continuation` | ABG admits an opening lifecycle event | replay projects exactly one run-local member | only separate response and continuation operations may advance it | resolved in this cut; superseded and abandoned are deferred with T-270 re-entry |

| `ContinuationBasis` | replay derives open obligation | public read and `run.continue` consume exact basis | never invokes HoG itself | resolved or run terminal in this cut; superseded and abandoned are deferred |

| request or answer human work | HoG proposes declared hold; attributed human answers | declared interaction and response contracts | F_H authority and replay basis | external human only | continuation and public interaction views | ABG | resolved or rejected in this cut; abandonment and supersession remain deferred |

| respond to hold | attributed F_H actor | declared response and capability contracts | ABG verifies open continuation and replay basis | `interaction.respond` only admits response truth | responded interaction view | ABG | response consumed, rejected, or continuation terminal |

| `admitInteractionResponse` | public `interaction.respond` candidate plus open continuation -> actor-attributed response truth or refusal; never invokes HoG | ABG |

| `ContinuationBasis` | `ReplayProjectionFamily` | `<<downstream>>` | `src/abg` | Events-only hold and resume projection. |

truth opens the authoritative `Continuation` aggregate. A later
`interaction.respond` operation admits an attributed response against that
exact continuation and response contract but does not invoke HoG. A separate
`run.continue` operation rehydrates the durable scope, admits resume truth, and
then explicitly re-enters HoG. It does not append a second result or judgment
to the completed request C call. T-270 owns the current domain interaction

6. appends `fh_interaction_resume_admitted` for F_H or
   `continuation_resume_admitted` for another declared continuation kind before
   `run.continue` explicitly re-enters HoG.

refuses before HoG and appends no resume event. The `interaction.respond`
operation may obtain its own reopened append context, but its semantic admission
only appends actor-attributed response truth; it cannot reconstruct execution
carriers or perform continuation steps 1-6.

          Human->>Public: later interaction.respond with attributed response candidate
          Public->>ABG: reopen existing durable sink without restamping
          ABG-->>Public: ReopenedEventStoreContext or typed refusal
          Public->>ABG: admit interaction.respond ingress with actor and capability
          ABG-->>Public: public-operation admission event
          Public->>ABG: admit response against exact open Continuation
          ABG-->>Public: actor-attributed response truth only
          Public-->>Human: typed response-admitted outcome
          Caller->>Public: later run.continue naming run, Continuation, actor, capability, and input
          Public->>ABG: reopen existing durable sink and preserve exact historical prefix
          ABG-->>Public: ReopenedEventStoreContext or typed refusal
          Public->>ABG: admit run.continue ingress with actor, capability, and input
          ABG-->>Public: public-operation admission event
          Public->>ABG: rehydrate replay and exact immutable authority basis in reopened context
          ABG->>ABG: reconstruct owner-issued basis, scope, cursor, and input and admit resume
          ABG-->>Public: RehydratedContinuationScope or typed basis-fork refusal
          Public->>HoG: explicitly re-enter exact cursor with admitted continued input

  Held --> ResponseAdmitted: separate interaction.respond admits attributed F_H response

  ResponseAdmitted --> ReplayRehydrated: later run.continue rehydrates exact durable scope

The lifecycle view above projects the complete target continuation algebra.
Edges marked `deferred` are not part of the selected S03 realization or proof:

  Open --> Responded: fh_interaction_responded

  Responded --> Resolved: fh_interaction_resume_admitted

| F_H is not an implementation or ABG callback | disjoint key sets and authority matrices | human, separate public operations, and ABG | interaction requirement plus Continuation | invoke stops, interaction.respond admits only response, run.continue rehydrates and re-enters HoG | Held through Responded, ReplayRehydrated, and ResumeAdmitted | no F_H implementation port and no ABG-to-HoG call | attributed response and resume admissions | pass | retained T-272 evidence under T-270 |

| continuation is authoritative and replay-constructible | Continuation aggregate, reopened store, and basis relation | ABG | open obligation plus downstream basis and exact historical prefix | reopen without restamp, verify public ingress, reconstruct, then separate resume and HoG re-entry | open/responded/resolved proven; superseded/abandoned target-only | preserved ordinals and owner constructors renewed only after equality | existing sink, max-plus-one append, immutable authority basis, and basis-fork refusal | pass for selected S03 path; two target transitions deferred | T-270 re-entry if Product selects supersede or abandon |

claim current `RUNTIME_EVENT_KIND_VALUES` membership. The realized rows add no
second envelope or event family. Every realized row carries

10. expose separate response, operation-scoped durable reopen, and continuation
    ports as retained T-272 evidence for T-270's accepted S03 reconciliation,
    without moving One Surface authority into traversal infrastructure.

| Continuation and continuation-operation family | One run-local continuation plus unique public-operation invocation identities | ABG event truth | Atomic hold opens continuation; ABG admits each respond/continue operation before Product or traversal effects | Replay and explicit public carrier | This cut realizes open -> responded -> resolved and replacement authority after post-resume failure | Resolved exhausts append authority; `superseded` and `abandoned` are named deferred gaps owned by T-270 if a Product path selects them |

| F_H response candidate | One attributed candidate for one open interaction and construction intent | F_H proposes; Product evaluates; ABG admits | Public transports candidate after operation admission | Product response evaluation and ABG continuation admission | Admitted response advances continuation once | Refusal creates no response truth; admitted value remains history |

4. ABG admits a continuation public operation before Product response
   evaluation or resumed traversal. Refused authority therefore executes no

5. F_H response and Product contract semantics are not leaf realization.
   Their installed provider is loaded and invoked through `src/product`.

| Open F_H hold and continuation | HoG hold proposal | Declared route/interaction law | ABG cursor and intent checks | ABG atomic hold batch | not_applicable: hold is admitted state | Public continuation carrier | Resolution or named deferred transition |

| Admit respond/continue operation | Developer request | Product invocation policy | ABG exact grant and durable duplicate checks | ABG before Product or HoG effect | not_applicable: admission is event truth | Replay over the admitted log | Invocation terminal |

| Evaluate F_H response | Attributed F_H candidate | Installed Product semantic function | Product request/response contract and pending basis | ABG response admission after Product validity | Product semantic provider | Replay/public interaction | Continuation resolution |
| Resume held traversal | Developer request carrying admitted response | Declared continuation law | ABG verifies operation and derives successor input; HoG derives the successor cursor | ABG admits resume over that exact cursor | HoG resumes traversal | Replay over the admitted log | Run terminal |

| Admit a public continuation operation once | `ContinuationPublicOperationAdmission` | `resolveContinuationPublicOperationGrant` then `admitContinuationPublicOperation` | durable idempotency fold | pure authority resolution then event admission | one admitted actor-operation capability grant, exact lifecycle state, and no prior event with the same invocation identity | derived; retain in `src/abg` |

| Project pending Product meaning | `FhInteractionSemanticBasis` | `projectFhInteractionSemanticBasis` | replay projection | downstream | open continuation and admitted construction lineage | derived; retain in `src/abg` |

| Evaluate an F_H response | `InteractionResponseCandidate` | `evaluateInstalledInteractionResponse` | installed Product semantic application | Product effect edge, no runtime truth | prior admitted public operation plus exact pending basis and Product contract | derived; retain in `src/product` |

| Derive resume input | `FhResumeSuccessorInput` | `deriveFhResumeSuccessorInput` | continuation transition | pure | responded continuation and admitted response | derived; retain in `src/abg` |

| Admit resume truth | `FhInteractionResumeAdmission` | `admitFhInteractionResume` | continuation transition | event admission | admitted `run.continue` operation and responded continuation | derived; retain in `src/abg` |

  ; evaluate(Product response)
  ; admit(response)

`src/product/semantics.ts` owns loading and invoking the exact installed Product
contract and F_H response provider; ABIogenesis's own provider resides in
`src/product/builtin_semantics.ts`. The fixed Public composition may invoke its F_H response
function only after ABG admits the corresponding actor-operation grant. HoG
does not export or evaluate F_H Product semantics.

    -evaluateInteractionResponse()

    -admitResponse()

    -admitResponse()

    -evaluateInteractionResponse()

  AbgAdmissionFunctions-->>PublicAdapter: held plus explicit continuation authority
  Developer->>PublicAdapter: interaction.respond(authority, candidate)
  PublicAdapter->>AbgAdmissionFunctions: reopen, admit public operation, project pending basis
  AbgAdmissionFunctions-->>PublicAdapter: admitted grant plus exact interaction basis
  PublicAdapter->>ProductSemanticBoundary: evaluateInteractionResponse(admitted operation, basis, candidate)
  ProductSemanticBoundary-->>PublicAdapter: canonical response or refusal
  PublicAdapter->>AbgAdmissionFunctions: admit attributed response
  AbgAdmissionFunctions-->>PublicAdapter: responded authority
  Developer->>PublicAdapter: run.continue(responded authority)
  PublicAdapter->>AbgAdmissionFunctions: reopen, admit continue operation, derive successor input
  AbgAdmissionFunctions-->>PublicAdapter: admitted operation plus successor input
  PublicAdapter->>HoGTraversalFunctions: derive successor cursor(held cursor, successor input)
  HoGTraversalFunctions-->>PublicAdapter: exact successor cursor
  PublicAdapter->>AbgAdmissionFunctions: admit resume(exact successor cursor)
  AbgAdmissionFunctions-->>PublicAdapter: admitted resume
  PublicAdapter->>HoGTraversalFunctions: resume(admitted resume, cursor, installed port)

  Held --> Held: refuse Product-invalid response / Product plus ABG
  Held --> Responded: admitContinuationPublicOperation plus admitFhInteractionResponse / ABG
  Responded --> Active: admitContinuationPublicOperation plus admitFhInteractionResume / ABG

| post-resume failure is total and publicly reopenable | failure transition plus refreshed carrier | ABG admits failure; Public projects authority | failure remains runtime truth, carrier remains downstream | every post-append catch replays and returns next authority | Responded reaches Active, Failed, then Readable | public refusal outcome carries event and continuation metadata | runtime failure event and exact-prefix refresh | pass, focused installed-byte mutation green | none |

  -> F_H hold -> project.read -> interaction.respond -> run.continue

Before runtime admission, ABG projects the exact pending request,
`NextActionBasis`, and `ConstructionIntent` from that lineage. After ABG admits
the exact actor-operation grant, the Product-owned installed semantics provider
evaluates the response candidate against that basis and returns either one
canonical Product-valid response or refusal. Public invokes the Product module
adapter but does not import or invoke an implementation module. HoG does not
participate in F_H response evaluation. A response naming another intent or a
choice outside the Product-owned pending choice therefore refuses before
`fh_interaction_responded`.

Ordinary F_H continuations without a construction intent continue to receive
their declared Product response value.

`fh_interaction_resume_admitted` consumes the prior continuation and
reactivates the held frame. Every later refusal or failure is therefore

This selected S03 path realizes `open -> responded -> resolved`.

admission, and that an otherwise Product-valid response naming another intent
refuses before response admission. Installed mutation negatives additionally

The accepted F_H continuation authority remains a durable read basis after its
continuation resolves. `run.continue` returns the same self-digested authority
updated to the exact appended event-log prefix. It does not create a second
run identity, projection store, or mutable current-run pointer.

From a fresh public context, `project.read` may consume that exact authority to
render:
