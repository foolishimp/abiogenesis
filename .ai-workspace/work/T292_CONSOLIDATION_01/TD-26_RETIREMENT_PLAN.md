# TD-26 retirement plan: the Executive is the standard system program

T-292, analyst report. Basis: `main` at `c1f655735` (2026-11-12). `T` is
`build_tenants/abiogenesis/typescript`, and paths without a prefix are under
`T/code/src`. Line numbers are at this commit. Read-only: no build, no test
run, nothing committed.

- The analysis began at `b13bdd5c2`. Three sets of commits landed since then.
  - TD-60B's test retirement (to `46397ec36`) changed nothing under
    `T/code`, `T/scripts`, `T/contracts`, `T/package.json`, `T/design` or
    `specification/`. Section 2.10 is rescanned at `46397ec36`.
  - TD-51a and TD-25M's Return (to `c1f655735`) changed four files under
    `T/code/src/abg`. Of the lines this plan cites, only
    `abg/runtime_history.ts` moved, and its citation is updated. TD-25M's
    Return (`.ai-workspace/work/T292_CONSOLIDATION_01/TD-25M_RETURN.md`)
    records the reader's identity check. §5.4 adopts it and adds the graph
    check, which TD-25M does not name.
  - `main` reached `4274cf66f` during the work. `bc6871482` and
    `4274cf66f` change only `.ai-workspace/TECHNICAL_DEBT_REGISTER.md`, the
    T-292 ticket and `TD-28_RETIREMENT_MAP.md`. No code, contract, test,
    design or specification line moved, so every citation holds. They record
    the ruling on the register's TD-77 entry, which §5.4 and open point 8
    use.
- `REQ-P-*` files are in `specification/requirements/product/`, `REQ-R-ABG3-*`
  files in `specification/requirements/abg/`, and design notes in `T/design/`.

How the claims were checked:

- **Read** means I read the lines.
- **Measured** means a TypeScript compiler-API reference graph computed it.
  - The graph has one node per top-level statement (292 files, 11,425 nodes,
    50,575 edges, shorthand properties included).
  - A declaration counts as removable when it is in the removal seed, or when
    every declaration that references it is removed and it is not a root.
  - Roots are:
    - the `*_DEFINITION_BINDINGS` tables;
    - the package export subpaths and the two bins;
    - non-declaration statements;
    - modules named by string locators. The only locators into the removed
      set are `gtl/consensus.ts:5218-5219` (`ABI5_SYSTEM_PRODUCT_SEMANTICS`)
      and the `implementation/consensus.js` descriptors, both inside
      `gtl/consensus.ts`.
  - Scratch is under `/private/tmp/abg-td26plan-work/` (`refgraph.cjs`,
    `cascade.py`, `history_scan.sh`).
- **Probed** means a script ran the tenant's built code on a scratch copy
  (§5.4, `/private/tmp/abg-td26plan-work/probe/`).
- **Likely** marks a claim inferred from term clusters or file names and not
  followed to a root.

## 0. Answer

**No as written.** The register says TD-26 (b) costs about 11,050 lines and
loses nothing. Neither holds as stated.

Up to six of TD-26's steps cannot be done without a loss until the
reader's lock check is reframed (six under open point 2 (a), three under
(b)). Each one changes the capability register:

- removing the Consensus capability (its register row, its mandatory id and
  its projected schema ids);
- withdrawing each of the five members `ticket_consensus`, `selected_action`
  and, under open point 2 (a), `run_gaps`, `workspace_gaps` and
  `run_lawful_actions`, because each one is a definition key in a register
  row.

Under the current reader any one of them makes every recorded store that
reads today unreadable through artifact truth, the live rc.12 Run and every
kept-feature log included. For the members this was probed on three locks.
It holds for every readable store because of how the check is built (point
5). The register's TD-77 entry already rules that reframe and gates TD-26 on
it. Until TD-77 lands, the plan retires the code and leaves these entries
declared.

What holds:

- TD-26 outcome (b) removes nothing the kept feature set runs. The
  Executive, registered selection, recursion, native work, C2 and
  pending-execution continuation use no One Surface or Consensus declaration
  (§3). What the kept feature set does lose is the readability of its
  recorded stores, at P7, unless the lock checks are reframed first (point
  5).

What the register misses, in five parts:

1. **Recorded history.** The claim that no Run ever admitted One Surface
   events is false for the workspace.
   - 263 uncompressed recorded files carry admitted `construction_*` events.
     223 of them come from Runs (likely), among them RC1 S03 executions and
     RC11 qualification evidence. Compressed data adds 12 gzip copies of one
     RC10 selected-action log, one of them a live test fixture, and one
     archive (§5).
   - These logs become unreadable on the 5.0 build by design (§5).
   - No log of the kept feature set is affected by the event-kind
     retirement.
2. **The gap family is also One Surface only.** `gap_stop` admission requires
   a construction composition (`abg/traversal_route.ts:1767-1789`). So after
   retirement these are dead for every kept Program:
   - the gap stop and the `gap_stopped` status;
   - gap re-entry (`InvocationReentryBasis`);
   - `public/gap_authority.ts`;
   - three `project.read` members: `run_gaps`, `workspace_gaps` and
     `run_lawful_actions`.

   The register does not count any of them.
3. **Digest-carried constants stay.** These fields sit inside digested bodies,
   so removing them moves digests:
   - the six One Surface fields of every execution basis;
   - `constructionIntentRef: null` in the F_H hold identity;
   - `constructionDeltas: []` in the replay body.

   They stay as constants until TD-66's successor profile. The three event
   kinds and their calculus rows stay declared, under the TD-25 precedent.
4. **The `supervised` default loses its last target.** After retirement no
   shipped Program can be started with the default root mode. What "standard
   system program" selects is an open point (§7).
5. **The Product install lock.**
   - Every recorded store carries an install lock. Each lock row holds the
     Product's contracts with their capability identities and the Product's
     capability-definition graph.
   - The reader applies two checks to each row, both against its current
     register:
     - it rebuilds the graph and requires the recorded graph to equal it
       (`product/environment.ts:608` →
       `shared/capability_contracts.ts:407-431`);
     - it requires each recorded contract's identities to match
       (`product/environment.ts:674-680`).
   - Removing one member key from register row `:87` or `:88` fails the graph
     check. Probed on the live rc.12 Run's lock and on both
     `t287-current-owner` fixtures (§5.4).
   - Removing the Consensus ids fails the identity check, and removing the
     Consensus row also fails the graph check. TD-25M Return §3 and §6
     measured the identity check.
   - The new Product must also have every register capability carried by a
     published contract (`product/verify_product.ts:2532-2546`). Only the 13
     Consensus schema contracts carry
     `abg.capability.graph-function.consensus@5`, so they stay published while
     that capability stays.
   - So P1 to P6 change no register row:
     - the five members stay declared and refuse `installed_binding_unavailable`,
       as TD-25's members do on `main`;
     - the 13 schema contracts stay published.
   - P7 withdraws the five members, the 13 schema contracts and the Consensus
     capability. It is gated on TD-77, the reframe the register already
     rules (§5.4, open point 8).

Sizes:

- **Public family:** 18 operations and 56 definitions today (47 callable, 9
  unavailable).
  - P1 to P6 keep every definition. `ticket_consensus` and `selected_action`
    become unavailable, giving 56 (45 callable, 11 unavailable). Under open
    point 2 (a), the three frontier reads become unavailable too, giving 56
    (42, 14).
  - P7 withdraws them, giving 18 and 54 (45, 9). With the frontier reads it
    gives 18 and 51 (42, 9).
  - TD-25's five members are separate and would give 17 and 46. Their
    package (TD-25M) stopped on the same lock check (point 5).
- **Source lines in `code/src`:** about 13,700. Of these:
  - 11,972 are whole declarations (measured);
  - about 360 are imports and blank lines of deleted files;
  - about 1,400 are arms inside kept functions (likely).
  - About 1,600 of the 13,700 wait for P7: the Consensus public schema
    constant, the five member definitions and the corpus ids.
- **Other surfaces:**
  - tests, support and fixtures: about 5,000 to 5,500 deleted (likely), plus
    edits in about 30 test, support and qualification files;
  - contracts: about 2,060 deleted (2,030 of them in P7), plus regenerated
    mirrors;
  - specification: about 600 lines change;
  - design: about 2,000 lines move to history (likely).
- **Packages:** nine.
  - P0 and P0b are spec and design.
  - P1 to P6 are code. They run serially because each one regenerates the
    product identity and manifest pins, and P1, P3 and P5 also move the
    Public family. None of them changes the capability register.
  - P7 makes the register changes after TD-77 lands: the five member
    withdrawals, the 13 schema contracts and the Consensus capability (§6).

## 1. What "the Executive is the standard system program" means

### 1.1 The specification today (read)

| Subject | Text at `main` |
|---|---|
| Standard system program | `PRODUCT.md:1066-1073`: "The standard system program composes exactly four semantic authorities: `synthesizeModel -> evalGap -> evaluateNext -> evaluateAction` … The public SDK and CLI start or continue the program; they do not implement its loop." |
| Supervised root mode | `REQ-P-POLICY.md:59-67` (POLICY-013): "`supervised` is the default. It selects the admitted system program and session policy that own convergence inside GTL/HoG/ABG". |
| One Surface as operator loop | POLICY-014 (`:69-76`): "The primary operator workflow shall be an interactive One Surface loop declared by an admitted GTL program". POLICY-023 (`:176-183`): "When `root_mode = supervised`, it selects the admitted standard system program and that program owns One Surface semantic ordering and action topology … ABG separately admits selected-action and construction-intent truth." |
| One Surface identities | Program `program://abg/system/consensus-one-surface@5` (`gtl/consensus.ts:79`, policy `"abg.root_mode": "supervised"` at `:4910`). Its four authorities are bound through `constructionComposition`. Its events are `construction_intent_selected`, `construction_delta_observed` and `construction_continuation_opened` (`abg/event_store.ts:99-100`, `:117`). |
| Continuation members | `PRODUCT.md:1289-1290`: "5.0 retains automatic current-intent continuation, newly selected action admission, local recursion, declared local correction and fresh replay." `REQ-P-PUBLIC-CONTRACTS.md:218`: `run.continue` is "automatic current-intent continuation or a newly admitted selected action". Requirements README `:96-97` says the same. |
| Consensus | `PRODUCT.md:1078-1089`: "Dedicated Consensus qualification is reserved for 5.1 … Consensus is a bounded standard-library GraphFunction expressed through ordinary GTL composition." `:1232`: "Existing Consensus code and exact evidence are preserved without a dedicated release-complete claim." `REQ-P-CONSENSUS.md` holds 274 lines (ids 001-019). |
| Executive allocation | `PRODUCT.md:1210-1211`: "The selected 5.0 Executive/default-library increment is ordinary framed GTL composition under F02/F03/F04/F07/F09/F10/F17, qualified through S02/S03/S06." |

### 1.2 What the Executive does today (read; O1 trace mapping, rechecked)

- **Where it is defined.** The default library is
  `gtl/default_library.ts:55-86`. Its Program declares
  `"abg.root_mode": "direct"` (`:318`).
- **What one Run is.** `executive` is an `evaluate-parent` F_D call
  (`abg/default_library.ts:524-571`) and a recurse over `executive-step`.
- **What one step does.**
  1. `prepare-selection` F_D (`prepareGovernanceSelection`,
     `implementation/default_library.ts:67-71`; its node is declared at
     `gtl/default_library.ts:17`, `:64`).
  2. `select` F_P (`selectGovernanceWork`,
     `implementation/default_library.ts:109`).
  3. `project-choice` F_D (`abg/default_library.ts:256-300`).
  4. A registered-selection application, admitted as
     `traversal_route_admitted` with `registeredSelectionApplicationRef`.
     Its realization is in `hog/route_proposal.ts:765-785` and
     `abg/registered_selection_provenance.ts:57-90`.
  5. Workflow calls to native work, assessment or C2
     (`gtl/default_library.ts:38-54`).
- **How evidence returns.** Evidence returns through `fold`
  (`abg/default_library.ts:465-523`).
- **How a gap appears.** When `select` finds no lawful work, `project-choice`
  returns a registered-graph choice with disposition `gap`
  (`abg/default_library.ts:283-285`). The Run stops with `run_stopped`
  disposition `blocked`, and the stop reading reports origin `gap` with the
  missing support references (`abg/project_read_ports.ts:1271-1272`). The
  lane `t287-readable-stops.test.mjs:216-222` reads this back cold. No
  `gap_stop` route is admitted.
- **What bounds recursion.** Bound exhaustion
  (`hog/recursion_lifecycle.ts:560-580`).
- **How the live Run started.** With `rootMode: direct` and target `next`
  (REFUTATION claim 14).

### 1.3 Sentences that change

Proposed text follows the installed writing guide: present tense, no
markers. This is the product_reprice of `A5-F07` and the
requirement_reprice it carries.

| Place | Now (quoted) | Change |
|---|---|---|
| `PRODUCT.md:1064-1076` | "### System And One Surface / The standard system program composes exactly four semantic authorities …" | Replace with "### Standard System Program". Proposed: "The standard system program is the default library's Executive. Each step prepares a selection basis, selects one registered graph through one `F_P` selection, applies it as a registered selection and folds the returned evidence before the next step. A step that finds no lawful selection stops as a typed block with a human-readable handoff. Invocation, selection admission, evidence admission and continuation are ABG boundaries. The public SDK and CLI start or continue the program; they do not implement its steps. In 5.0, a required human response yields a truthful blocked handoff; native response/resume is 5.1." |
| `PRODUCT.md:1052` | "- order One Surface; or" | "- order the Executive's steps; or" |
| `PRODUCT.md:1078-1089` | "Consensus is a bounded standard-library GraphFunction …"; "Consensus has no special runner …" | Proposed: "Consensus, a bounded GraphFunction over ordinary GTL composition, is the planned 5.1 outcome `A5-F08`. 5.0 ships no Consensus GraphFunction." Delete the capability list and the "no special runner" sentence. Both describe shipped code. |
| `PRODUCT.md:1232` (Consensus row) | "Existing Consensus code and exact evidence are preserved without a dedicated release-complete claim." | "5.0 ships no Consensus code; ordinary composition, recursion, attribution, admission and replay remain generic runtime obligations." This becomes false otherwise. |
| `PRODUCT.md:1289-1290` | "5.0 retains automatic current-intent continuation, newly selected action admission, …" | "5.0 retains same-Run continuation of a replay-derived pending execution, local recursion, declared local correction and fresh replay." |
| `PRODUCT.md:1424-1443` (S03) | "prove that the GTL program orders `synthesizeModel -> evalGap -> evaluateNext -> intent admission …`" | Restate against the Executive's step (1.2). "Inspect the replay-derived frontier" depends on open point 2. |
| `PRODUCT.md:1122` | "They are explicitly selected, replaceable compositions." | Depends on open point 1. |
| `PRODUCT.md:1632-1633` | "controller authority in an SDK, CLI, installer, fixture, worker, plugin, Consensus, or One Surface surface;" | Drop "Consensus, or One Surface surface". |
| `INTENT.md:313-314` | "Consensus surface, or One Surface projection;" | Drop both. Optionally re-apply `a61231c6a` at `:175`. |
| `REQ-P-POLICY.md:59-67` (013) | "`supervised` is the default. It selects the admitted system program …" | Depends on open point 1. |
| POLICY-014 `:69-76` | "an interactive One Surface loop declared by an admitted GTL program" | "an interactive loop over the standard system program". The rest stands. |
| POLICY-023 `:176-183` | the paragraph quoted in 1.1 | Delete the paragraph. Keep "When `root_mode = direct` …" without "One Surface, `evaluateNext`, or a `ConstructionIntent`". |
| POLICY-013/014/016/021/024/029/030/033/041/042/054 | Each clause that names One Surface, selected action or the system loop (lines in the register) | Restate or delete. "Supervised" in EVENTS-009, CONTINUATION-009, POLICY-006 and TRANSPORT means actor supervision and stays. |
| `REQ-P-PUBLIC-CONTRACTS.md:150-158`, `:164-165` | 9 Consensus schema ids and 2 vocabularies | Delete. Keep `abg.vocabulary.review-ruling-kind` only if open point 5 keeps Consensus text. The code follows in P2 (vocabularies) and P7 (schema ids). |
| `REQ-P-PUBLIC-CONTRACTS.md:301-303` | "`abg.capability.graph-function.consensus@5` retains its stable identity for an optional published Consensus claim and the dedicated 5.1 qualification. Its absence is not a 5.0 mandatory-capability gap." | Depends on open point 8. Under (a) or (b), delete; P7 removes the capability. Under (c), it stands, and the code keeps the capability mandatory against it (§2.8). |
| `REQ-P-PUBLIC-CONTRACTS.md:218` | "automatic current-intent continuation or a newly admitted selected action" | "same-Run continuation of a replay-derived pending execution". |
| `REQ-P-PUBLIC-CONTRACTS.md:229-232` | "automatic continuation and distinct new-action admission remain required." | "automatic pending-execution continuation remains required." |
| `REQ-P-PUBLIC-CONTRACTS.md:209`, `REQ-P-POLICY.md:605` | "gaps, and lawful actions" | Depends on open point 2. |
| `REQ-P-QUAL.md:286-298` (059) | "complete the primary public operator loop through one admitted GTL One Surface program …" | Restate against the Executive's step. Also `-061` `:314-317` and `:357`. `:19` ("Standalone Consensus … are 5.1 qualification claims") stays. |
| `REQ-P-SCENARIOS.md:121-145` (010) | the S03 text above, including the `gap_stop` re-entry sentence `:140-145` | Restate as for S03. The re-entry sentence goes under open point 2. |
| `requirements/README.md:93-97` | "automatic current-intent continuation and new-action admission remain 5.0 obligations." | As for `:229-232`. Also `:64-68` (the deferred `REQ-P-CONSENSUS` items and the mandatory Consensus capability) and `:86` ("One Surface"). |
| `REQ-P-CATALOG.md:95` (009A), `product/README.md:13`, `:29` | Consensus rows | Delete as in `f4aad7d5e`. |
| `REQ-P-CONSENSUS.md` | 274 lines | Move to history (open point 5). |
| ABG requirements | BINDING-004 `:25`; EVENTS-021 `:56`, -030 `:85` and census `:111`; CONTINUATION `:15`, `:25`, -011/-012/-013 `:53-57`; INTERPRET `:64`, -030 `:147`; FN-COMP-023/024/026/027 `:109-128`; PROJECTION-011 `:38`, -014 `:44`, `:62`, -022 `:66`, -024 `:70` | Restate or delete each clause. The whole `REQ-R-ABG3-FP-CONSCIOUSNESS.md` family (FPC-001 to -019, 101 lines) states One Surface and moves to history. |

### 1.4 `A5-F07` and `A5-F08`

| | Now (`PRODUCT.md`) | After |
|---|---|---|
| `A5-F07` (`:1370`) | "**Complete One Surface loop.** The standard system program orders the four distinct semantic authorities `synthesizeModel`, `evalGap`, `evaluateNext`, and `evaluateAction`; ABG separately owns intent admission, invocation, evidence admission, and continuation. Fresh evidence refreshes model, gap, next-action, and action-result truth before the next step." | "**Executive system program.** The standard system program is the default library's Executive. Each step selects one registered graph through one `F_P` selection over a prepared basis, applies it as a registered selection and folds the admitted evidence into the next step's basis. ABG separately owns invocation, selection admission, evidence admission and continuation. No lawful selection yields a typed block and human-readable handoff." |
| `A5-F08` (`:1380-1387`) | "`A5-F08`, standalone Consensus free-construction qualification, and `A5-F12` … retain their stable identities as planned ABIogenesis 5.1 outcomes. They are excluded from required 5.0 realization, qualification, and release …" | Unchanged. It already claims no 5.0 code. Its 5.1 realization starts from no shipped source. |

## 2. Inventory by layer

**Kinds and payload keys stay declared in all four profiles.** They are the
three kinds, the `public_operation_admitted` continuation variants, the
`continuation_superseded` construction variants, the `basis_admitted` keys
and `reentryBasis` (`abg/event_store.ts:99-100`, `:117`, `:276-278`,
`:929-955`, `:1105-1193`). The profile digests are keyed on them
(`:1194-1219`), so they leave only with TD-66's successor profile.

Everything below goes unless marked "edit" (an arm inside a kept function) or
"stays".

### 2.1 GTL

| File | Symbol / lines | Action | Evidence that nothing kept needs it |
|---|---|---|---|
| `gtl/consensus.ts` | whole, 5,267 lines | delete | Measured. After P1 and P2 its referrers are `gtl/index.ts:170-296` (re-exports) and the manifest generator only. |
| `gtl/consensus_schema.ts` | whole, 1,839 lines. `CONSENSUS_PUBLIC_SCHEMA` `:276-1766` and `CONSENSUS_SCHEMA_ASSET_BINDINGS` `:1780-1795` stay until P7 | delete in P2, except those two, which go in P7 | Measured. Referrers are `gtl/consensus.ts`, `gtl/index.ts` and `scripts/generate-product-manifest.mjs:53-58`. The generator writes the 13 schema contracts from those two constants (`:298-302`, `:524-542`), and they stay published until P7 (§5.4). |
| `gtl/index.ts` | `:170-296` (Consensus re-exports, 127 lines); `:123-165` (6 composition types) | delete; edit | Exports only. |
| `gtl/serialization_contracts.ts` | `ACTION_CATALOG_ROW_SCHEMA` `:172-176`, `ACTION_CATALOG_SCHEMA` `:177-179`, `CONSTRUCTION_AUTHORITY_BINDING_SCHEMA` `:180-184`, `CONSTRUCTION_POLICY_SCHEMA` `:185-187`, `CONSTRUCTION_COMPOSITION_SCHEMA` `:188-194`; `GTL_PROGRAM_SCHEMA` `:195-200` loses its two optional keys | delete; edit | Measured. Referrers are the validator law and `admitExecutionBasis`, both edited. |
| `gtl/contracts.ts` | `GtlActionCatalogRow` … `GtlConstructionComposition`, `:110-120` | delete | Measured. |
| `gtl/canonicalization.ts` | `canonicalizeActionCatalog` `:106-117`; `canonicalizeProgram` `:119-126` | delete; edit | Measured. |

`PROGRAM_PUBLIC_ASSET_TARGET_SCHEMA` (`:169-171`) stays. It carries the
`asset:` start law (`gtl/public_start.ts:128-129`), and its only shipped producer
is Consensus.

### 2.2 Implementation

| File | Lines | Action | Evidence |
|---|---|---|---|
| `implementation/consensus.ts` | whole, 819 | delete | Loaded only by its descriptors' module path inside `gtl/consensus.ts`. |
| `implementation/index.ts` | `:61-95` | delete | Re-exports only (measured). |

### 2.3 Product

| File | Symbol / lines | Action | Evidence |
|---|---|---|---|
| `product/builtin_semantics.ts` | `hasExactConsensusCatalogApplications` `:422-472`, `admitSystemInput` `:474-503`, `validateSystemContractValue` `:505-511`, `resolveSystemCatalogApplicationValue` `:513-575`, `validateSystemResultEvidenceLineage` `:577-621`, `ABI5_SYSTEM_PRODUCT_SEMANTICS` `:623-746`, plus their imports | delete | Measured. `ABI5_SYSTEM_PRODUCT_SEMANTICS` is named by string only at `gtl/consensus.ts:5218-5219`, and in source only by `ticket_consensus` (`project_read_definition_bindings.ts:934`). The register's reading that `run_result` is hard-wired through it is wrong: line 934 sits inside `ticket_consensus` (`:868-995`). |
| `product/project_read_definition_bindings.ts` | `ticket_consensus` `:868-995`; `admittedAuthorityBinding` `:223-276`; edits to `ProjectReadPacket` `:78-84` and to the table `:1019-1026` | delete; edit | Measured. `admittedAuthorityBinding` has no other referrer. |
| `product/project_read_operation_contracts.ts` | `ConsensusProjectionPort` `:314-316` (P1); the definition `ticketConsensusProjectionSchema` `:97-104`, `ticketConsensus` `:274-286` and its entries `:27`, `:294` (P7) | delete | Measured. The definition stays declared until P7 because row `:88` names its key (§5.4). |
| `product/project_read_ports.ts` | `:138-147`, `:296-301`, `projectConsensusTicket` `:806-873`, `:892-894`; edits `:48-54`, `:149-156`, `:896-903` | delete; edit | Measured. |
| `product/semantics.ts` | `actionCatalog` input field `:206`; the roster `publicResultProjectionKinds` `:152` with its check `:461-470`; `supportsInstalledPublicResultProjection` `:602-613`; `projectInstalledPublicResult` `:615-635` | edit; delete | Measured. The two helpers' only referrer is the `./product` barrel. The roster's only non-default entry is `"ticket.consensus"` inside `ABI5_SYSTEM_PRODUCT_SEMANTICS`. |
| `product/run_invocation_operation.ts` | `actionCatalog` pass-through `:719-721`; `RunOperationKey` `:379-381`; the `selected_action` arm of `runOperationAuthorityMatches` `:473`; the `gap_stop` outcome `:1131-1171` | edit | Read. |
| `product/run_operation_contracts.ts` | P3: the construction-intent alternative of the `current_intent` arm (`:194`, `:199-219`, the `currentIntent` object `:203-209`), its handling in `continueContract` `:248-318`, and the `RunContinuationPort.selected_action` member `:338`, with the binding. P5: non-terminal `gap_stop` `:72`, `:270`. P7: the `selected_action` arm `:220-237`, its type arm `:249` and `:321`, `:327` | edit; delete | Read and measured. The `selected_action` definition stays declared until P7 because row `:87` names its key (§5.4). |
| `product/public_contract_publication.ts` | in `MANDATORY_SCHEMA_VOCABULARY_CORPUS_IDS` `:59-104` (count check `:120`): the 2 Consensus vocabulary ids (P2) and the 9 Consensus schema ids `:87-95` (P7) | edit | Read. |
| `product/verify_product.ts` | the 18/56 family checks `:1550`, `:1573-1591` (the lines `fb86974e3` changed) | edit in P7 | Read. P1 to P6 keep 56 definitions. |

The **system catalog** is the Consensus module publication. It is one of the
shipped constructors, called at `scripts/generate-product-manifest.mjs:1093`.
The **default applications** are `consensusCatalogApplicationBindings`
(`gtl/consensus.ts:1752-1824`), and they go with the file. The **Consensus
ticket projection** is `ticket_consensus`.

### 2.4 ABG

Write side (P3, P4):

| File | Symbol / lines | Action | Evidence |
|---|---|---|---|
| `abg/traversal_route.ts` | functions `:1046-2925`: `hasAdmittedActionCandidates`, `selectedNextActionProjection`, `noActionNextActionProjection`, `nextActionBasis`, `edgeFulfillmentLedger`, `edgeClosureDecision`, `actionEvaluationProjection`, `actionEvaluationBasis`, `convergedNextActionProjection`, `constructionIntentForAdvance` (273), `noActionProjectionForStopRoute` (259), `rehydrateConstructionIntentForCursorAtDurablePrefix`/`AtPrefix`, `constructionIntentAppliesToBasis`, `deriveGraphFunctionActionEvaluationBasis` (134), `admittedConstructionComposition`, `constructionAuthority`, `constructionIntentFromEvent`, `constructionDeltaForAdvance` (378), `hasResolvedRunConstructionIntentLineage`, `hasGovernedConstructionClosure` (154); key lists `:938-963`, `:1132-1151`; helpers `nonEmptyStringArray`, `stringArray`, `hasExactTargetObligationBindings` `:1017-1044` | delete | Measured: 2,099 lines in the file with the P5 types. Every referrer outside the set is an edit point listed here. |
| `abg/traversal_route.ts` | `admitRoute` `:4141-4902` arms: the terminal closure check `:4314-4326`, the `gap_stop` arm `:4533-4579`, construction intent and delta `:4662-4700`, the two event writes `:4757-4830`, `:4866`, the returned intent fields `:4875-4879`, the no-action fields `:4886-4899` | edit | Read. `routeDigest` is `sha256Canonical(body)` at `:4702`. The intent fields are added after it and do not enter the digest. |
| `abg/construction_continuation.ts` | write side: `admitPendingConstructionIntentContinuation` `:138-153`, `prepareConstructionIntentContinuation` `:374-454`, `prepareConstructionContinuationOperation` `:524-552`, `admitConstructionContinuationReentry` `:564-616`, the selected-action use and admission `:716-855`, `preparedRelations`/`preparedOperations`/`selectedPreparations` | delete | Measured. |
| `abg/execution_basis.ts` | `hasExactInvocationObservationBasis` `:1009-1038`, `admittedConstructionComposition` `:1152-1166`, `selectAdmittedConstructionAuthority` `:1168-1180`, `isAdmittedConstructionInteractionLocus` `:1182-1191`, `admitConstructionContinuationExecutionBasis` `:2868-2904`; the intent read in `prepareWorkflowChildExecutionBasis` `:2336` | delete; edit | Measured. These four are `./abg` and `./abg/m03` exports. |
| `abg/c_call.ts` | `prepareWorkflowChildFoldback` `:4101-4134` (intent read); `workflowOutputContractCorresponds` `:5756-5782` after the first return | edit | Read (§3.2). |
| `abg/continuation.ts` | `admitFhInteractionOpen` `:104-312`: the construction-intent requirement `:120-184` and the cause and payload arms `:219-221`, `:279-285` | edit | Read. The identity key `constructionIntentRef: null` (`:205-206`) stays (§3.4). |
| `abg/traversal_cursor.ts` | `admitContinuedTraversalCursor` `:848-856`; `continuedCursorOrigin` `:428-450` | delete; edit | Measured (its only referrer is `hog/entry.ts:365`). |

Read side (P5):

| File | Symbol / lines | Action | Evidence |
|---|---|---|---|
| `abg/traversal_route.ts` | types `:222-421` (`SelectedNextActionProjection` … `ConvergedNextActionProjection`; `NextActionProjection`, `ConstructionIntent`, `ConstructionIntentAdmission` are exported); `gap_stop` in `TraversalRouteKind` `:137-145`, in `NoActionDisposition` `:274-289` and in `RouteCandidate`, `AdmittedRoute`, `HistoricalTraversalRouteProjection`; arms of `projectHistoricalTraversalRoute` `:600-711` and `projectAdmittedRoute` `:760-842` | delete; edit | Measured for the types. Replay is their last referrer. |
| `abg/construction_continuation.ts` | read side: `ConstructionIntentContinuation` `:20-48`, `deriveConstructionIntentContinuations` `:53-135`, `projectConstructionIntentContinuations` `:155-203`, `SelectedActionContinuation` `:621-644`, `projectSelectedActionContinuations` `:646-714`, `projectSelectedActionOperation` `:863-896`; `isConstructionContinuationKind` `:13-18` narrows to `pending_execution` | delete; edit | Measured. The file's total is 627 lines. |
| `abg/replay.ts` | `ReplayConstructionDeltaState` `:225-245`; the route-row intent and next-action fields `:212-222`; arms of `projectReplayRouteAtPrefix` `:639-820`, `deriveReplayPrefixFacts` `:991-1155` and `:1186-1491`, `continuedIntentReference` `:1827-1838`, `projectOwnerFacts` `:1921-2096`; reference rows `:1620-1623`; `gap_stopped` `:528`, `:1447` | delete; edit | Read, cluster lines (likely). `ReplayState.constructionDeltas` (`:509`) stays as `[]` (§3.4). |
| `abg/calculus/axioms.ts` | derivation arms in `eventCalculusEffectRefs` `:1240-1305`, `:1325-1345`, `:1472-1493`, `:1554` | edit | Read. The `ROOT_EVENT_CALCULUS` rows of the three kinds (`:305-312`) and the `construction_intent_available` fluent that the `continuation_superseded` row terminates (`:339`) stay, because the completeness check (`:1795-1811`) requires a row for every declared kind. |
| `abg/fh_continuation_projection.ts` | intent fields and arms `:49-50`, `:101-148`, `:200`, `:231-232`, `:297-298`; the construction-kind exclusions `:250`, `:338`, `:351` narrow | edit | Read. |
| `abg/effectful_invocation_truth.ts` | `constructionIntentFact` `:214-233`; the selected-action arm `:235-242` | edit | Read and measured. |
| `abg/project_read_ports.ts` | `gapCall` `:1608-1639`, `gapRows` `:1641-1737`, `projectWorkspaceGaps` `:1739-1754`, `projectRunGaps` `:1756-1765`, `projectRunLawfulActions` `:1767-1774`, `runLawfulActions` `:1776-1789` (open point 2); `canonicalRunContext` gap arms `:875-879`, `:911-917`; `gap_stopped` `:1386`, `:1407`; the stop reading's `nextActions` `:1358` | delete; edit | Measured: 177 lines. |
| `abg/project_read_operation_contracts.ts` | `gap_stopped` `:52` (P5); under open point 2 (a), `subjectGapProjectionSchema` `:125-135`, `admittedGapValueSchema` `:137-151`, `ABG_ADMITTED_GAP_SCHEMA` `:153-174`, `lawfulActionProjectionSchema` `:253-258`, the three member contracts `:492-518` and their entries `:537-547` (P7) | edit; delete | Measured: 64 lines. The three definitions stay declared until P7 because rows `:87` and `:88` name their keys (§5.4). Their ports and bindings go in P5. |
| `abg/invocation_admission.ts` | `InvocationReentryBasis` `:163-181` (exported); the re-entry block in `admitInvocationWithRequest` `:1363-1470`; fields `:135`, `:245`, `:1648`; `gap_stopped` `:552` | delete; edit | Read. Re-entry requires `sourceRoute.routeKind === "gap_stop"` (`:1441`). |
| `abg/c_call_outcome.ts`, `abg/traversal_transition.ts`, `abg/runtime_history.ts`, `abg/witness_admission_operation.ts`, `abg/event_store.ts` | `gap_stop` dispositions (`c_call_outcome.ts:655`, `:689`, `:1786-1788`, `:1853`); next-action body fields (`traversal_transition.ts:48-50`, `:135-137`, `:167-172`, `:197-200`); the construction-operation selector key (`runtime_history.ts:715-717`); `gap_stopped` (`witness_admission_operation.ts:986`); the accepted `gap_stop` values (`event_store.ts:3266`, `:3305`) | edit | Read. The value lists follow the TD-25S precedent: removing a value moved no profile digest. |
| `abg/index.ts` | exports `:103-148`, `:393-425`, `:512` | edit | Read. |

### 2.5 HoG

| File | Symbol / lines | Action | Evidence |
|---|---|---|---|
| `hog/route_proposal.ts` | `proposeGapStopRoute` `:523-606` (exported); the gap arms of `selectedCCallOutcomeRoute` `:718-742`, `deriveSelectedCCallOutcomeTarget` `:779` and `proposeCCallOutcomeTransition` `:888-893`; `GraphRouteExtras` `:94-104` | delete; edit | Measured and read. |
| `hog/entry.ts` | `prepareConstructionContinuationTraversal` `:365-435` and imports `:356-361` | delete | Measured. Its only referrer is `runCurrentIntentOwner`. |
| `hog/traversal_contract.ts` | `ResumeConstructionIntentInput` `:99-103`; `InteractionResumeTraversalEntryInput` `:75-97` (TD-25 residue, measured); `ExecuteGraphTraversalRequest` `:116-119` | delete; edit | Measured. |
| `hog/graph_execute.ts` | imports `:1-2`, `:80`; `preflightParentReturns` `:880-909`; `traversalProgram` `:1105`; the `admitPendingConstructionIntentContinuation` call in `executeOwnedGraphTraversalEffect` `:1129-1133` | edit | Read. For every kept Run the call returns at the composition check (`construction_continuation.ts:61-62`). |
| `hog/workflow_lifecycle.ts` | the import of `deriveGraphFunctionActionEvaluationBasis` `:52`; the selected-intent arms in `beginOwnedWorkflowLocus` `:409-422` and `completeOwnedWorkflowLocus` `:638-660` | edit | Read (§3.2). |
| `hog/ccall_lifecycle.ts`, `hog/traversal_completion.ts`, `hog/index.ts` | the `gap_stop` arm `:316-318`; `:59`; export `:25-39` | edit | Read. |

### 2.6 Owner bindings (`owner_bindings/run_invocation.ts`)

| Symbol / lines | Action | Evidence |
|---|---|---|
| `selectConstructionIntentAtPrefix` `:1406-1442`; `selectSelectedActionAtPrefix` `:1473-1501`; `runSelectedActionOwner` `:1579-1647`; `SelectedActionPacket` `:138`; the `selected_action` binding `:1902-1904` | delete | Measured. |
| `runCurrentIntentOwner` `:1503-1577` | edit to its pending dispatch (`:1505`) | Read. The construction-intent arm goes. The `pendingCursor` request still goes to `runPendingExecutionOwner` (`:1666-1741`). |
| `continuationOutcome` `:1649-1664` (the `gap_stop` disposition `:1658-1659`); `RunPacket` `:139`; `RunContinuationSelectionIntent` `:1743-1753`; refusal codes `:1755-1760`; `populateRunContinuationAtDurablePrefix` `:1774-1873` (the construction-intent branch `:1828-1838`, the selected-action branch `:1864-1870` and the selection kinds `:1798`, `:1805`); `RUN_DEFINITION_BINDINGS` `:1906-1909`; the observation guard in `runInvocationOwner` `:930` | edit | Read. |

### 2.7 Public

| File | Lines | Action | Evidence |
|---|---|---|---|
| `public/run_projection_authority.ts` | whole, 189 | delete | No source caller (measured). Only `m5-consensus-module.test.mjs:26-28` and its case at `:2004-2097` use it. |
| `public/gap_authority.ts` | whole, 144 | delete (open point 2) | No source caller (measured). Its `rootMode: "supervised"` literal and `nextActionProjection` fields tie it to gap stops. |
| `public/index.ts` | `:1-7` | edit | Type re-exports. |
| `public/installed_public_definition_call.ts` | `InstalledPendingCallSelection` `:411-424`; `constructInstalledPendingCall` `:591-654` (selected and `currentIntent` arms `:639-650`) | edit | Read. |
| `public/binding/owner_contract_source_set.ts`, `public/binding/public_function_family.ts` | counts and the key-set digest | edit | As in `fb86974e3` (6 and 2 lines). |

### 2.8 Validator, shared and scripts

- **Validator.** `validator/validation.ts` loses the composition law
  `:1574-1692` (119 lines) and the ActionCatalog law `:1693-1775` (83 lines)
  inside `validateProgramSubject`. Both were read. The non-callable
  contract-ref law `:671-673` and the node_type and overlay checks `:674-688`
  stay.
- **Shared.** `shared/capability_contracts.ts` changes only in P7, after
  TD-77 lands (§5.4):
  - `abg.capability.graph-function.consensus@5` leaves
    `MANDATORY_ABI5_CAPABILITY_IDS` (`:39`), which
    `REQ-P-PUBLIC-CONTRACTS.md:301-303` already calls optional, together
    with its register row `:91`;
  - the `abg.capability.catalog.invoke-graph-function@5` row `:82` loses its
    9 Consensus schema ids and its 3 Consensus vocabulary ids;
  - the `abg.capability.runtime.replay-continuation@5` row `:87` loses the
    keys `run.continue#selected_action`, `project.read#run_gaps` and
    `project.read#run_lawful_actions`;
  - the `abg.capability.operator.public-contract@5` row `:88` loses
    `project.read#ticket_consensus` and `project.read#workspace_gaps`.
  - `run.continue#current_intent` stays in row `:87`.
- **Scripts.** `scripts/generate-product-manifest.mjs`:
  - imports `:53-60`;
  - paths `:160-179`;
  - writes `:191`, `:299-333`;
  - digests `:440-451`;
  - rows `:524-561`, `:634-635`;
  - the publication `:1093`.

  P2 removes the vocabulary and publication parts. The Consensus schema
  asset's path `:160`, write `:298-302`, digest `:440`, rows `:524-542` and
  their spread `:634` stay until P7. Also `scripts/clean.mjs:10` (P7).
  `scripts/generate-qualification-rule-catalog.mjs` names no retired term (it
  maps S03 to `REQ-P-SCENARIOS-010` at `:130`), so the rule catalog changes
  only through its regenerated sources. `package.json` drops
  `test:m5:consensus-unit` and `m5-consensus-module` from `test:m5`
  (`:122`, `:126`).

### 2.9 Contracts and qualification mirrors

- **Deleted:**
  - `contracts/schemas/consensus.schema.json` (2,030 lines, tracked), in P7;
  - `contracts/vocabularies/review-ruling-kind.json`,
    `consensus-round-outcome.json` and `consensus-fh-decision.json`, in P2;
  - the mirror `contracts/qualification/sources/REQ-P-CONSENSUS.md`, with
    P0.
- **Regenerated:**
  - `adapter-projection.json`;
  - the `run/continue` and `project/read` operation contracts and their
    request, result, refusal and non-terminal schemas;
  - `public-operation.schema.json` and `gtl-serialization.schema.json`;
  - `capability-definition-graph.json`;
  - every `operation-contract.json` (family digest);
  - `rule-catalog.json`, `law-basis.json`, `coverage.json` (S03 rows
    `:306-318`), `authority-inputs.json` and the `sources/*.md` mirrors;
  - under `T/test_env/qualification`: `tenant-manifest.json`,
    `recipe/verification-recipe.json`, `expected-output-inventory.json`,
    `declared-commands.json` and `inventory.json`.
- **Unchanged:** `contracts/schemas/native-runtime-observation.json`. The
  kinds stay declared.

### 2.10 Tests, support and fixtures (rescanned at `46397ec36`; classify by reading at each package)

Counts in parentheses are file lines, then matching lines from one `rg -c`
over `T/test_env` for the One Surface, Consensus and gap-family terms
(`test_runs/` and `downstream/` excluded).

- **Deleted whole:**
  - `m5-consensus-module.test.mjs` (2,149; 309). First move its law case
    "S05 every non-callable catalog row references one published contract"
    (`:634-671`, testing `validator/validation.ts:671-673`) to a kept
    validator test. Its run-projection case (`:26-28` and `:2004-2097`) goes
    with `public/run_projection_authority.ts`.
  - `t287-consensus-ref-shape` (114; 51), `t287-exact-construction-intent`
    (213; 15), `t287-selected-action` (250; 17),
    `t287-selected-action-authority` (72; 10) and
    `t287-rp2-correction-carriers` (51; 2).
  - Support: `t287-selected-action-host.mjs` (109; 12) and the gated
    `t287-s03-automatic.mjs` (183; 27), with its only test
    `tests/t287-s03-automatic.test.mjs` (16 lines).
  - Fixtures: `t287-selected-action-product` (71; 13), `exact-intent-product`
    (59; 10), `t287-s03-automatic-product` (101; 14),
    `qualification/fixtures/rp2-correction-product.mjs` (42; 3), and the
    recorded fixture `fixtures/t287-current-owner/selected-action/`. That
    fixture is an RC10 One Surface log of 216 rows, read only by
    `t287-selected-action-authority`. The directory README loses its rows.
  - The One Surface program of `fixtures/developer-mini-product/src/index.ts`
    (206 matching lines): the ids `:126-158` and the observation,
    next-action and evaluation helpers, roughly `:594-1722` (about 1,500 to
    2,000 of 5,109).
- **Read before deciding:** `t287-continuation-causation` (114; 19) tests
  the shared operation candidate and may stay, re-pointed.
  `t287-multi-candidate-admission` (184; 10) and
  `support/multi-candidate-admission-owner.mjs` (385; 28) need the same
  reading.
- **Kept lanes that name retired items:**
  - `t287-recursive-registered-selection.test.mjs:26-41` asserts the
    `currentIntent` alternative and the `selected_action` contract (edit in
    P3). `:466-468` asserts `projectSelectedActionOperation` refusals (edit
    in P5).
  - `t287-installed-product-coordinate.test.mjs:79` loops over
    `selected_action` (P3), and `:101` over `run_gaps` (P5, open point 2).
  - `t287-readable-stops.test.mjs:127` and `:161` read `run_gaps` and assert
    it empty. `:157` asserts `stop.nextActions` is `[]` (P5, open point 2).
  - `retained-route-cursor-transition.test.mjs:102` stubs
    `admittedConstructionComposition` and
    `selectAdmittedConstructionAuthority` (P4).
  - `support/single-address-space-consolidation.mjs:35` names
    `admitPendingConstructionIntentContinuation` (P3). Its
    `constructionIntentRef: null` at `:291` stays (open point 3).
  - `t287-gtl-serialization-publication.test.mjs:94-114` tests the
    composition schema arm (P6).
  - No edit: `t287-registered-graph-selection.test.mjs:35`, `:93`,
    `t287-default-library.test.mjs:143` and
    `t287-native-registered-selection.test.mjs:40` assert that the
    composition and `construction_intent_selected` are absent, which stays
    true. `reentryBasis: null` in `t287-observed-worksite-command:226`,
    `t287-native-workspace-work:114`, `t287-governance-covered-source-use:279`,
    `support/t287-native-work-currentness-consumers.mjs:180` and
    `support/single-address-space-consolidation.mjs:207` stays, because the
    field stays as a constant (open point 3).
- **Other edits:**
  - the tests `fb86974e3` edited that still exist: `a5-f02-canonical-gtl-identity`
    (21), `r4-catalog-admission` (18), `t287-st2a-g-capability-definition-graph`
    (12), `t287-pfc-f08a-product-verification-boundary` (7),
    `steel-basic-cli-public` (5), `t287-wave2-owner-contract-source-set` (3),
    `t287-w2-05-install-catalog-owner-chain` (35; its Consensus refusal path
    is `:1144-1215`), `t287-w2-05-generator-package-reproducibility`
    (count pins), `r10-projection-contracts` (count pins),
    `t287-framework-handoff-types` (count pins),
    `t287-result-evidence-lineage-projection`, `t287-c2-child-program`,
    `steel-consumer-declaration`, `w2-steel-single-start-installed` and
    `w2-steel-serial-branch-installed` (1 each);
    `t287-stdo-run-environment-installed.mjs` names no retired term at
    HEAD (read it before editing);
  - support `d2-frame-fixture`, `declared-testing-capability` and
    `installed-qualification-conservation`;
    `types/framework-handoff.compile.ts` (22); `uat/public-setup.mjs` (1);
  - beyond `fb86974e3`: `m5-event-calculus-runtime` (14),
    `t287-route-reconstruction` (2), `t287-rp2-behavior-carriers:30`,
    `t287-single-address-space-consolidation` (18),
    `t287-st1-installed-cross-owner-hello` (15) and
    `t292-td34a-run-invocation-schema-owner` (14);
  - qualification inputs: `tenant-manifest.json` (22),
    `recipe/verification-recipe.json` (24),
    `recipe/expected-output-inventory.json` (11),
    `recipe/declared-commands.json` (1) and `inventory.json` (1).
- **Already gone:** TD-60B deleted `t287-d1-requirement-handoff`, which
  `fb86974e3` edits.
- **Evidence-gate catalogue.**
  - `support/evidence-gates.json` names gated case files.
    `t292-td60b-evidence-gate-catalogue.test.mjs:29-32` requires every named
    file to exist.
  - These rows name files this plan deletes:
    - `selected-action-evidence-root` (`t287-selected-action.test.mjs`);
    - `selected-action-owner-subject`
      (`t287-selected-action-authority.test.mjs`);
    - `s03-phase-b-release` and `s03-evidence-directory`
      (`t287-s03-automatic.test.mjs`);
    - `s7-pending-consumer-intent` (`t287-continuation-causation.test.mjs`),
      if that test goes.
  - The package that deletes a file removes its row.
- **Recorded data under `T/test_env`:**
  - `uat/runs/basic-cli/2026-10-06T00-44-53-198Z-…/abg-acquisition.json`
    (909 matching lines) holds catalog and contract copies and no admitted
    One Surface kind.
  - The kept fixture `fixtures/t287-current-owner/native-assessment/events.jsonl.gz`
    (79 rows, read by `t287-native-assessment-evidence`) names
    `selected_action` and `current_intent` only in row 1, a
    `public_operation_artifact_admitted` (§5).
- **Generated outputs, not inputs:** `T/test_env/test_runs` is ignored
  (`.gitignore:38`).

### 2.11 Line totals

| Layer | Lines | Basis |
|---|---|---|
| GTL | about 7,290 (whole files 7,106, index 140, language 41) | measured |
| Implementation | 854 | measured |
| Product | about 700 | measured 615, arms likely |
| ABG | about 3,950 (measured 3,100, arms about 850) | mixed |
| HoG | about 250 (measured 183) | mixed |
| Owner bindings | about 230 (measured 139) | mixed |
| Public | about 365 (whole files 333) | measured |
| Validator | 202 | read |
| `code/src` total | about 13,700, of which about 1,600 go in P7 | 11,972 measured |
| Tests, support, fixtures | about 5,000 to 5,500 deleted, about 30 files edited | likely |
| Contracts | about 2,060 deleted, plus regeneration | measured files |
| Specification | about 600 changed (CONSENSUS 274, FPC 101, sentences) | read |
| Design | `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md` (810) whole to history; One Surface sections of about 20 notes, about 1,200 lines (likely) | counted |

Design-note mention counts (live notes):
M05_DIRECT_GTL_TRAVERSAL_EXPANSION 280/3459, M05_S05 104/810,
T287_PENDING_CONSUMER_CONTINUATION 29/1042 (its pending-execution part
stays), M05_S06_PUBLIC_FUNCTION… 22, ABI5_REALIZATION_CONSTITUTION 19,
T287_REGISTERED_GRAPH_SELECTION 9, ABI5_STDO3 5,
ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION 5, M05_S06_AXIOMATIC 4,
M03_DIRECT 4, T287_D2 4, M03_TYPED_RECURSE 4, R10 3, the common library 2,
C2_FORWARD_REENTRY 2, REGISTERED_GRAPH_SELECTION_NATIVE 2, README 2, and one
each in DEFAULT_GOVERNANCE_LIBRARY, D1, F11 ×2, D6, PUBLIC_DEFINITION_CALL
and M03_SYSTEM_PROBE.

`design/history/` already holds five of the six notes `f4aad7d5e` deleted,
and `M03_M04_ONE_SURFACE_AUTHORITY`.

## 3. What must stay, and why

### 3.1 The default library uses nothing that goes (measured, read)

- **Its own files.** These files hold no One Surface or Consensus term:
  - `abg/default_library.ts`, `gtl/default_library.ts`,
    `implementation/default_library.ts`;
  - `product/default_library*.ts` (three files);
  - `gtl/registered_selection.ts`, `abg/registered_selection_provenance.ts`,
    `product/registered_selection_native.ts`;
  - `hog/recursion_lifecycle.ts`.
- **What they reference.** No removed declaration. They reference only kept
  shared declarations whose One Surface arms are edits: `ExecutionBasis`,
  `AdmittedRoute`, `RouteCandidate`, `ReplayState`, `CCallCompletionPayload`,
  `admitOwnedCCallCompletion`, `projectOwnedCCallCompletion`,
  `proposeCCallOutcomeTransition`, `RouteProposalRefusal`,
  `ExecutableTraversalCompletion` and `GTL_PROGRAM_SCHEMA`.
- **The live rc.12 Run** carries no construction kind, no `gap_stop` and no
  Consensus start (§5).

### 3.2 Shared code the Executive runs through: the guard that makes the One Surface branch false (read)

| Site | Guard for a kept Run |
|---|---|
| `abg/c_call.ts:5767-5770` `workflowOutputContractCorresponds` | `admittedConstructionComposition` is null. It returns `closure.resultContractRef === term.outputCarrierRef`, and the rest is One Surface. |
| `abg/c_call.ts:4107-4110` `prepareWorkflowChildFoldback` and `hog/workflow_lifecycle.ts:409-422`, `:638-641` | `rehydrateConstructionIntentForCursorAtPrefix` returns null because no `construction_intent_selected` exists. `intent?.actionKind === "invoke_graph_function"` is false. |
| `abg/execution_basis.ts:2336` | Same null intent. |
| `owner_bindings/run_invocation.ts:930` → `execution_basis.ts:1015` | It returns true unless the input kind is `observation_snapshot`. That kind also needs `program.actionCatalog`, which no kept Program has, so it refuses today and the input contract refuses it afterwards (likely). |
| `hog/graph_execute.ts:1131` → `construction_continuation.ts:61-62` | It returns the predecessor prefix when the root basis has no composition. |
| `abg/continuation.ts:122-125` | `isAdmittedConstructionInteractionLocus` is false without a composition. |
| `abg/traversal_route.ts:4315` `hasGovernedConstructionClosure` | This is a terminal check. Kept Runs close today. Confirm that the no-composition path returns true when cutting the arm (likely). |

### 3.3 `run.continue` (read)

- **`current_intent` stays.** Its `pending_execution` alternative continues
  Executive and recursion Runs: "Replay-derived pending execution of a Run
  without construction composition (registered selection/recursion)"
  (`construction_continuation.ts:205-237`). The owner is
  `runPendingExecutionOwner` (`run_invocation.ts:1666-1741`). Only the
  `currentIntent` (construction-intent) alternative goes.
- **`selected_action` serves only the loop.**
  `projectSelectedActionContinuations` returns `[]` without
  `construction_intent_selected` events (`:653-655`). It also requires
  `basis.constructionComposition !== null` (`:676`). Nothing kept is lost.
- **Refusal codes.** `stale_action`, `action_mismatch`, `reprice_mismatch`
  and `intent_mismatch` (`run_invocation.ts:1757-1758`) are One Surface only
  (likely). `missing_continuation`, `resolved_continuation`,
  `response_mismatch`, `basis_mismatch` and `replay_mismatch` stay for
  pending execution (`construction_continuation.ts:903-904`).

### 3.4 Shared helpers and constants that stay

- **`abg/construction_continuation.ts` keeps:**
  - the pending-execution part `:205-337` and `:898-1094`;
  - `rematerializeAdmittedBasisGraph` `:344-357` and
    `projectPendingCursorInputAtPrefix` `:359-371` (the first used by
    `hog/graph_execute.ts:999`);
  - `constructionContinuationOperationCandidate` `:475-502` and
    `continuationOperationWorkspaceCorresponds` `:504-515`;
  - `ContinuationOperationPriorAdmission` `:857-861`;
  - `SelectedCoordinate` `:716`.

  These are all used by pending execution (measured). The names stay. A
  rename is not part of the retirement.
- **`abg/traversal_route.ts` keeps** `GraphSpanReentryProjection` `:207-220`,
  `GRAPH_SPAN_REENTRY_PROJECTION_KEYS` and `graphSpanReentryProjection`
  `:965-1015` and the structural, retry,
  fan-out and recursion evidence. These lie inside the register's TD-26
  range (TD-46).
- **Digest-carried constants:**
  - `ExecutionBasis` keeps `actionCatalogRef`, `actionCatalogDigest`,
    `actionCatalogRows`, `constructionCompositionRef`,
    `constructionCompositionDigest` and `constructionComposition` (`:402-409`)
    as constant `null`/`[]`. They are written at `:2202-2209`, digested at
    `:2251` and copied to children at `:2741-2746`. The generic reader
    recomputes the digest from the recorded payload
    (`abg/calculus/execution_basis_record.ts`).
  - The F_H hold identity keeps `constructionIntentRef: null`
    (`continuation.ts:205-206`, digested at `:208`).
  - The replay body keeps `constructionDeltas: []` (`replay.ts:509`, streamed
    at `:1481-1483`, digested by `digestReplayBody` `:2299`).
  - Replay digests persist in `replayStateDigest` and `sourceReplayDigest`
    (TD-66).
  - Removing any of these moves every new or re-derived digest. They join
    TD-66's batch.
- **Calculus rows.** The three kinds stay declared with their payload
  variants, so their `ROOT_EVENT_CALCULUS` rows stay (`axioms.ts:1795-1811`).
- **The capability register, until TD-77 lands (§5.4).** P1 to P6 leave
  `shared/capability_contracts.ts` unchanged:
  - `MANDATORY_ABI5_CAPABILITY_IDS` keeps
    `abg.capability.graph-function.consensus@5` (`:39`), and its register
    row `:91` stays. The roster check `:97-105` requires the mandatory list
    and the register rows to match exactly.
  - Row `:82` keeps its 9 Consensus schema ids and 3 Consensus vocabulary
    ids.
  - Rows `:87` and `:88` keep the five member keys.
- **What the register holds in place, until P7:**
  - The five member definitions stay declared and unavailable: their
    contracts stay and their bindings go. A definition key with no published
    definition makes the graph construction throw "missing graph owner
    definition" (`shared/capability_contracts.ts:354-360`), so the
    definitions cannot go while the keys stay.
  - The 13 Consensus schema contracts stay published, with
    `CONSENSUS_PUBLIC_SCHEMA` and `CONSENSUS_SCHEMA_ASSET_BINDINGS`. They are
    the only contracts that carry `abg.capability.graph-function.consensus@5`,
    and Product verification requires every graph capability to be carried
    by a published contract (`product/verify_product.ts:2160-2193`,
    `:2532-2546`). `t287-pfc-f08a-product-verification-boundary.test.mjs:285-288`
    states the same coupling.
- **`PROGRAM_PUBLIC_ASSET_TARGET_SCHEMA`** and the `asset:` start law stay.
  So do the non-callable contract-ref law and the generic node_type and
  overlay checks.

## 4. Public contract changes

| | Before | After P6 (no register change) | After P6, frontier reads unavailable (open point 2 (a)) | After P7 | After P7, frontier reads withdrawn | Plus TD-25's members (separate; TD-25M is stopped, §5.4) |
|---|---|---|---|---|---|---|
| Operations | 18 | 18 | 18 | 18 | 18 | 17 |
| Definitions | 56 (47 callable, 9 unavailable) | 56 (45, 11) | 56 (42, 14) | 54 (45, 9) | 51 (42, 9) | 46 (42, 4) |

The count is read from `contracts/public-functions/adapter-projection.json`:
56 `cliGrammar` rows. In `t287-framework-handoff-types.test.mjs`, `:145-146`
assert 56 declared and 9 unavailable, `:215` asserts 47 callable, `:230-241`
hold one request per unavailable member and `:275` counts 9 refused calls.

**Definition keys that leave, in P7:**

- `abg.operation.project.read#ticket_consensus`;
- `abg.operation.run.continue#selected_action`;
- under open point 2, `project.read#run_gaps`, `#workspace_gaps` and
  `#run_lawful_actions`.

From P1, P3 and P5 until P7, each of them stays declared and unavailable:
its binding goes and its definition stays (§5.4).

**Contracts that change but stay:**

- `run.continue#current_intent` loses the `currentIntent` request
  alternative. Its definition digest moves.
- The `run.invoke` and `run.continue` non-terminal outcome loses disposition
  `gap_stop` (`product/run_operation_contracts.ts:72`, `:270`).
- `project.read` loses runtime status `gap_stopped`
  (`abg/project_read_operation_contracts.ts:52`).
- Under open point 2, the stop reading drops `nextActions`.
- `run.invoke` no longer accepts a re-entry basis.

**Event kinds.** None leaves the declared set. The fold refuses logs that
carry them (§6, P5).

**Schemas, vocabularies and capabilities:**

- the three Consensus vocabularies, in P2;
- the composition and ActionCatalog arms of `gtl-serialization.schema.json`,
  in P6;
- in P7, after TD-77 lands (§5.4): the 13 Consensus schema
  rows (`CONSENSUS_SCHEMA_ASSET_BINDINGS`) with `consensus.schema.json`, and
  `abg.capability.graph-function.consensus@5` from the mandatory list and
  the capability graph.

**Refusal codes that leave:**

- `stale_action`, `action_mismatch`, `reprice_mismatch` and `intent_mismatch`;
- `gap_stop_not_declared` (`hog/route_proposal.ts:574`, `:585`) and
  `gap_projection_mismatch` (`abg/traversal_route.ts:1789`);
- the One Surface `judgment_mismatch` texts of `admitRoute`. The code stays
  in use.

**Exports (measured):** 146 distinct exported names leave. By subpath:

| Subpath | Names |
|---|---|
| `.` | 146 |
| `./gtl` | 131 |
| `./abg` | 11 |
| `./abg/m03` | 11 |
| `./gtl/m01` | 6 |
| `./gtl/m02` | 6 |
| `./app/m04` | 3 |
| `./public` | 3 |
| `./hog` | 1 |

No export subpath leaves (`package.json` names none specific to Consensus).
`./product` also loses two names under P1.

**What a caller gets afterwards:**

| Caller presents | Result |
|---|---|
| A call to `ticket_consensus` or `selected_action` (or a frontier read under point 2), from P1, P3 or P5 until P7 | The installed transport refuses `installed_binding_unavailable`, "manifest-bound installed definition … is unavailable" (`public/installed_definition_call_transport.ts:268-298`, read), as for TD-25's members on `main`. The lane is `t287-framework-handoff-types.test.mjs:230-275`. |
| The same call after P7 | The installed transport refuses `unknown_definition`, "DefinitionCall must select one exact installed owner contract source" (`:251-256`, read). The CLI grammar has no row, so the adapter reports an invalid invocation, exit 2 (likely; pin it with a lane). |
| `run.continue#current_intent` with a `currentIntent` body | The member's request admission refuses the unknown alternative. Pin the code with a lane. |
| A publication whose Program carries `actionCatalog` or `constructionComposition` | Refused. `GTL_PROGRAM_SCHEMA` is a `v.strictObject` (`gtl/serialization_contracts.ts:195-200`, read), so unknown keys refuse after P6. Between P4 and P6, execution-basis admission refuses such a Program (§6, P4). |
| A start, call or apply naming `program://abg/system/consensus-one-surface@5`, a `graph-function://abg/consensus/…` or the Consensus overlay | No shipped module declares it. The catalog's existing refusal for an unpublished Program or GraphFunction applies (pin the code). Installs built before P2 keep their own Consensus; they are immutable. |
| A log carrying a retired kind, a construction continuation or a `gap_stop` route | Refused by the fold (P5) or at decode (the `gap_stop` value lists), with the owner's existing message. A kept-feature log reads identically (§5). |

## 5. Recorded history: the fact that could stop it

### 5.1 Search and coverage

- **Tool.** `rg` with `-uu`.
- **Scope.** `/Users/jim/src/apps/abiogenesis/.ai-workspace` (`comments` 52 GB
  and `work` 102 GB on disk) and `T/test_env`.
- **Files scanned:** `*.json`, `*.jsonl`, `*.ndjson`, `*.txt`, `*.log`.
- **Excluded:** `node_modules`, `.git`, code (`*.ts`, `*.js`, `*.mjs`) and
  commentary (`*.md`).
- **Compressed data (second pass).** `rg -z` searched the 203 gzip JSON and
  JSONL files, and `rg -z -a` the 1,445 gzip, tgz, tar, zst and xz archives
  (5.0 GB), for the admitted-kind pattern. The 1,057 zip files (under
  0.1 GB) are not covered.
- **Escaped (nested) JSON.** It is matched only by unquoted values (all refs
  such as `abg/consensus/…` and `consensus-one-surface`) and by the escaped
  variant of the kind pattern. `"routeKind"`, `"continuationKind"` and the
  composition-object patterns do not match escaped JSON.
- **Result files:** `/private/tmp/abg-td26plan-work/history/raw.tsv`,
  `events.tsv`, `ev_kind_files.txt`, `gz_hits.txt` and `archive_hits.txt`.

### 5.2 Findings

1. **Admitted One Surface events exist in 263 files.** The pattern was
   `"kind":"construction_intent_selected|construction_delta_observed|construction_continuation_opened"`.
   - Hand-built negative logs: 40, under `wrong-*`, `unknown-*`, `consumed-*`
     and `unexpected-*` names (24 in `comments/codex/20260928_FRAMED_GOVERNANCE`
     and 16 in `rc4-native-recovery-01`).
   - From Runs or evidence bundles: 223 (by file name, likely):

     | Folder | Files |
     |---|---|
     | FRAMED_GOVERNANCE | 125 |
     | `rc4-native-recovery-01` | 36 |
     | `T287_COMMON_LIBRARY_DELIVERY_01` | 29 |
     | `T/test_env/test_runs/rp2` (ignored test outputs) | 12 |
     | `T287_SANDBOX_UAT_RUN_02/operator` | 5 |
     | `rc11-qualification-01` (`evidence-generation-02`, selected action) | 3 |
     | `rc3-dogfood-01` | 2 |
     | `rc8-reference-preservation-01` (`rp2-correction-whole-001`) | 2 |
     | `release-qualification-rc6-01` | 1 |
     | `20261029T130722Z_RP2_QUALIFICATION_READINESS` | 1 |
     | G2 stage copies (one each) | 7 |

     The FRAMED_GOVERNANCE files include `s7-pending-consumer-01` (81),
     `s03-installed-handoff-01`, `rc1-s03-installed-execution-04` and `-05`,
     `s03-automatic-01` and `-02`, and `final-candidate-construction-01` to
     `-10`.
   - 20 files hold a `gap_stop` route.

   **The register's claim is false for the workspace.** TD-26 refutation
   claim 15 says no Run ever admitted One Surface events. It holds only for
   the four stores it scanned: `test_env/proof`, `evidence`, `uat/runs` and
   the live Run.

   Compressed data adds one more log and one archive.
   - 12 gzip files hold admitted One Surface kinds, 2
     `construction_intent_selected` and 1 `construction_delta_observed` each.
     All are copies of one RC10 selected-action log of 216 rows:
     - the live test fixture
       `T/test_env/fixtures/t287-current-owner/selected-action/events.jsonl.gz`;
     - ten frozen-source copies under `rc11-effect-phase1-01`,
       `rc11-effect-phase2-01` and `rc11-qualification-01/native-02`;
     - `rc11-qualification-01/evidence-generation-02/generated/selected-action/events.jsonl.gz`.
   - One archive holds admitted kinds:
     `.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s7-pending-consumer-01/exact-intent-checkpoint-01/frozen-evidence.tar.zst`
     (105 matching lines).
2. **Two of TD-25's 23 replay subjects are One Surface logs.** They are
   `rc11-qualification-01/evidence-generation-02/raw/selected-action/…/events.jsonl`
   (216 rows, held, two continuations) and
   `rc4-native-recovery-01/…/hc2-current-intent/continue-events.jsonl`
   (166 rows). From P5 on, their expected replay result is "refused" instead
   of "identical".
3. **Kept-feature logs carry no retired kind, route or start.**
   - **Live rc.12 Run, raw log**
     `/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl`:
     1,695 rows of 29 kinds, including 44 body-reference records and 3
     `public_operation_artifact_admitted`. Retired values appear only:
     - inside those 3 artifact events: 242 matches, which is the recorded
       install's Public contract naming the Consensus program, schema and
       vocabularies, `ticket_consensus` and `selected_action`;
     - as `null`/`[]` values of the six basis fields in its 8 inline
       `basis_admitted` rows. `constructionContinuationUse` is absent.
   - **Live rc.12 Run, evidence copy**
     `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc12-executive-01-evidence/live-01/events.json`:
     1,692 materialized events, 22 `basis_admitted` with the same six
     `null`/`[]` fields, and no artifact events. Nothing else matches.
   - **Default-library log**
     `release-qualification-rc6-01/rc7-held-session-author-02/blocked-testing-diagnostic-001/runtime.events.jsonl`
     (44 rows): retired values only in row 0, a
     `public_operation_artifact_admitted` (222 matches).
   - The registered-selection whole log (`rc8-reference-preservation-01`) and
     the native-work log (`rc11-qualification-01/native-02`) follow the same
     pattern.
   - **Kept lane fixture**
     `T/test_env/fixtures/t287-current-owner/native-assessment/events.jsonl.gz`
     (79 rows, read by `t287-native-assessment-evidence`): `selected_action`
     and `current_intent` appear only in row 1, a
     `public_operation_artifact_admitted`. The lane asserts on actor
     artifacts, not on the recorded Public family.
4. **The recorded Public artifact reads as recorded. The install lock does
   not.**
   - Decode checks top-level payload keys (`abg/event_store.ts:329-336`).
   - The install-artifact fold checks the candidate against its own resolved
     lock, scope and `sha256Canonical(candidate)`
     (`abg/artifact_truth.ts:460-490`).
   - Neither compares recorded definitions or contract digests with the
     current build, nor loads a `modulePath` or `namedSymbol` (read for these
     two owners). TD-25 replayed 23 logs identically after its manifest
     moved.
   - The exceptions are the two lock checks in §5.4. They compare each
     recorded lock row's capability graph and contract identities with the
     reader's current register.
   - Like TD-25's members, these members stay declared until P7, and only
     their bindings go in P1, P3 and P5. Each of those packages proves that
     the kept-feature logs replay identically and that artifact truth still
     reads them.

### 5.3 The three cases

- **An old install reading its own logs:** unaffected. Installs are
  immutable.
- **The new build reading old logs:**
  - kept-feature logs read identically, proven per package, as long as the
    capability register does not change (§5.4);
  - One Surface logs and the 20 gap-stop logs are refused from P5 on;
  - TD-25's precedent applies: refused, not ignored, with the owner's
    existing message.
- **New installs:** carry no Consensus Program or function, no One Surface
  and no gap family. Until P7 they still publish the 13 Consensus schema
  contracts and declare the five members unavailable.

For P1 to P6, nothing in the kept feature set stops the retirement, because
none of them changes the capability register (§5.4). What it costs is that
about 223 recorded Run files, the copies of the RC10 selected-action log and
one archive are no longer readable by the 5.0 build (open point 4). P7 is
different (§5.4).

### 5.4 The Product install lock: the fact that stops the register steps

- **The checks (read).**
  - Every recorded store's first Public artifact admission carries the
    resolved Product install lock (`payload.resolvedLock.rows`). Each lock
    row holds the Product's contracts with their `capabilityIdentities`, and
    the Product's capability-definition graph.
  - `isResolvedProductLock` (`product/environment.ts:544-760`) applies two
    checks to each row, both against the reader's current register:
    - **The graph check** (`:608`). `isCapabilityDefinitionGraph`
      (`shared/capability_contracts.ts:407-431`) rebuilds the graph from the
      row's recorded owner coordinates with
      `constructCapabilityDefinitionGraph` (`:210`). The rebuild takes the
      row set, each row's owners, definition keys, dependencies and effects
      from the current register (`:311`, `:340-360`). The recorded graph
      must equal the rebuild.
    - **The identity check** (`:674-680`). Each recorded contract's
      identities must equal `capabilityRefsForContract(contractId)`
      (`shared/capability_contracts.ts:107-114`): the capabilities whose row
      lists the contract in `projectedPublicContractIds`.
  - `lockRowGraphMatchesCatalog` (`:764-789`) compares the recorded graph
    with the recorded contracts. It reads the register only for an empty
    graph (`:767`).
  - On failure artifact truth throws: inline-lock and candidate-and-lock
    messages at `abg/artifact_truth.ts:423` and `:466`. TD-25M Return §3.1
    lists the Public bindings that consult artifact truth when they reopen a
    store.
- **What TD-26 touches: the five members (read, then probed).**
  - Five retired members are definition keys of register rows. Row `:87`
    (`abg.capability.runtime.replay-continuation@5`) names
    `run.continue#selected_action`, `project.read#run_gaps` and
    `project.read#run_lawful_actions`. Row `:88`
    (`abg.capability.operator.public-contract@5`) names
    `project.read#ticket_consensus` and `project.read#workspace_gaps`.
    `run.continue#current_intent` is also in row `:87`. It stays.
  - A key cannot stay once its definition goes: the graph construction
    throws "missing graph owner definition" (`:354-360`). So withdrawing a
    member is a register change.
  - **Probe.** It ran on a copy of the tenant's built tree (`build/`, built
    at 12:12 on 2026-11-12), with the rebuild's register view patched to
    drop keys. Script: `/private/tmp/abg-td26plan-work/probe/probe.mjs`.
    - On base, `isResolvedProductLock` is `true`.
    - With any one of four drops (`ticket_consensus`; `selected_action`;
      `run_gaps` with `run_lawful_actions`; `workspace_gaps`) it is `false`.
      The tenant row's graph check fails. The lock's other row, a consumer
      Product with an empty graph, passes.
    - It ran on three locks: the live rc.12 Run (event 0 of
      `/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl`)
      and both `t287-current-owner` fixtures (`native-assessment`, a kept
      feature, and `selected-action`).
  - The probe covered three locks. The result holds for every store that
    reads today because of how the check is built. A lock that passes on
    base holds a definition slot for every register key, or the base rebuild
    throws "missing graph owner definition". Its recorded graph equals the
    base rebuild, so it carries these keys, and a rebuild without them
    differs. So each member withdrawal makes every such store unreadable
    through artifact truth. TD-25M measured 118 logs for its own register
    change.
- **What TD-26 touches: the Consensus capability (read).**
  - The tenant row of the live rc.12 Run's lock lists 75 contracts (the
    lock's other row lists 1). Thirteen carry
    `abg.capability.graph-function.consensus@5`: the 13
    `abg.schema.consensus-*`, `review-*` and `ticket-consensus-projection`
    schema contracts of row `:91`. Nine of those also carry
    `abg.capability.catalog.invoke-graph-function@5`. Row `:82` projects
    them and the three Consensus vocabularies.
  - Row `:91` and the mandatory id `:39` go together, because the roster
    check (`:97-105`) requires the two lists to match. Removing them fails
    both checks. Removing the 9 schema ids from row `:82` fails the identity
    check.
  - No One Surface contract or gap contract is a register contract id.
- **What the new Product needs (read).**
  - Product verification collects every published contract's identities
    (`product/verify_product.ts:2160-2193`). It requires the graph's
    capability ids to equal that set: "capability graph, manifest, and
    catalog capability rosters differ" (`:2532-2546`; also `:889-896`).
  - Only the 13 Consensus schema contracts carry
    `abg.capability.graph-function.consensus@5`. While row `:91` stays, they
    stay published, or the new Product fails its own verification.
    `t287-pfc-f08a-product-verification-boundary.test.mjs:285-288` states
    the same coupling.
  - The three vocabularies carry only
    `abg.capability.catalog.invoke-graph-function@5`, which `run.invoke` also
    carries. They can go before TD-77 (likely; P2's Product verification
    confirms).
- **What TD-25M measured for the same check (its Return §3).**
  - Simulating one register change made artifact truth refuse every probed
    log that decodes on base: 118 logs, the live rc.12 default-library Run,
    seven decodable replay subjects and both `t287-current-owner` fixtures.
  - Replay itself was unaffected.
  - Three kept lanes lost cases: `r10-child-proof`,
    `t287-historical-source-resource` and `t287-cross-cut-public-read`.
  - Its §6 names TD-26: removing the Consensus register row or its 13
    schema contracts refuses "every rc.12-era store".
  - Its simulation patched only `capabilityRefsForContract`, so it measured
    the identity check alone. Its option (b) reframes that check
    (`environment.ts:674-679`, `:764-767`) and does not name the graph
    check (`:608`). TD-25M's own withdrawal of `interaction.respond` changes
    the owners of rows `:87` and `:88`, so it fails the graph check too (by
    reading).
- **What the register records since (TD-77).**
  - The register's TD-77 entry ("A reader judges a recorded Product lock by
    its own current capability register", added at `c1f655735`, rulings
    recorded at `bc6871482`) names both checks. It rules the reader's
    re-derivation of a recorded Product's capability graph and contract
    identities retired, and it gates TD-25's members, TD-26 and every later
    register change.
  - Its graph-check bullet is marked "Inferred from the graph guard and not
    run: a changed register row refuses a recorded graph even when no
    contract is removed." The probe above runs that case for key removals
    and confirms it.
  - Its closure is what P7 needs: "every recorded store that reads today
    still reads and gives the same artifact-truth digest". Status at
    `4274cf66f`: Open. Its first Writer stopped at the trace, and the
    register records the ruling after it.
- **Consequence for this plan.**
  - P1 to P6 change no register row (§3.4). The five members become
    unavailable and the 13 schema contracts stay published.
  - P1, P3 and P5 prove with the artifact-truth probe that every store that
    read before still reads.
  - P7 withdraws the five members, the 13 schema contracts and the Consensus
    capability after TD-77 closes (open point 8).

## 6. Packages

Common to every package:

- branch from `main`;
- regenerate the product identity in a separate commit, as TD-25 and TD-37
  did;
- update the count pins: `t287-framework-handoff-types.test.mjs:145-146`,
  `:197`, `:215-216`, the unavailable request table `:230-241` and `:275`;
  the oracle that test reads, `test_env/types/framework-handoff.compile.ts`
  (`DECLARED` from `:45`, `UNAVAILABLE` `:103-113`);
  `r10-projection-contracts.test.mjs:50-52`;
  `t287-w2-05-generator-package-reproducibility.test.mjs:136-137`; the wave2
  source set, `pfc-f08a`, `st2a-g` and `EXACT_OWNER_CONTRACT_KEY_SET_DIGEST`;
- in P1 to P6, leave `shared/capability_contracts.ts` unchanged (§5.4).
  Regenerate `contracts/capabilities/capability-definition-graph.json` with
  the generator, never by hand. Its owner coordinates carry each contract's
  `contractDigest` and the catalog's `productContentDigest` (read in the
  tracked file), so they move whenever a contract or the product content
  moves. Its capability rows, owner contract ids and definition-key lists
  stay the same. Recorded stores are not affected, because the reader
  rebuilds from the recorded coordinates and the register's lists;
- run `npm run build`, the package's named lanes, the default-library lane
  (`t287-default-library`) and the registered-selection lanes
  (`t287-registered-graph-selection`, `-recursive-`, `-native-`);
- run the steel lanes (`steel-basic-cli-public`, `w2-steel-*`);
- run `t287-native-assessment-evidence`, which decodes a recorded artifact
  that names withdrawn members, and `t292-td60b-evidence-gate-catalogue`;
- in P1, P3 and P5, probe artifact truth over the live rc.12 Run, the
  decodable replay subjects and both `t287-current-owner` fixtures,
  identical on base and final (§5.4);
- run the replay census: the TD-25R `replay-log.mjs` method over the 23
  logs, identical on base and final, except where P5 changes the expectation.

The wave cuts once at the end.

### P0: product_reprice (specification)

- **Change class:** product_reprice of `A5-F07`, with the requirement text it
  carries.
- **Order:** first, serial.
- **Scope:** §1.3 and §1.4.
  - Re-apply the specification half of `f4aad7d5e`: PRODUCT, CATALOG 009A,
    PUBLIC-CONTRACTS, QUAL, SCENARIOS, both READMEs, `scenarios/README` and
    GOALS. `REQ-P-CONSENSUS.md` moves to history.
  - Re-apply `a61231c6a` if wanted.
  - Write the One Surface text, which `f4aad7d5e` does not cover: A5-F07,
    POLICY-013/014/023, QUAL-059, SCENARIOS-010, PRODUCT `:1052`,
    `:1064-1076`, `:1289-1290`, `:1424-1443`, `:1632-1633`, INTENT
    `:313-314`, and the ABG clauses (the FPC family to history).
  - Regenerate the qualification mirrors in their own commit.
  - The text states the five members and the Consensus schema contracts
    withdrawn, which TD-77's ruling allows. The code reaches that state in
    P7.
    - Between P0 and P7 the 13 schema contracts cite `REQ-P-CONSENSUS-004`
      (`scripts/generate-product-manifest.mjs:531-533`), which P0 moves to
      history.
    - Product verification checks only that the list is non-empty and
      unique (`product/verify_product.ts:1293-1294`), and no script or lane
      resolves it (grep; likely).
    - If TD-77 does not land, the text keeps `REQ-P-CONSENSUS-004` and states
      the members unavailable (open point 8).
- **Size:** about 600 lines.
- **Depends on:** the owner's rulings on open points 1, 2 and 5.
- **Unblocks:** everything.
- **Risks:** qualification mirrors and the rule catalog.

### P0b: design notes to history

- **Order:** after P0. It can run side by side with P1 and P2.
- **Scope:**
  - move `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md` whole to
    `design/history/`. `f4aad7d5e` deletes it; E1 rules a move;
  - cut the One Surface sections of the notes in §2.11 to history, in the
    TD-25S manner (ranges moved verbatim, sections restated where they state
    current law);
  - restate the default-library note and `T287_PENDING_CONSUMER_CONTINUATION`
    only where they describe construction intent or selected action as
    current;
  - take RV4 F3 and F4 (T-287 `:4040`, `:4079`, `:4080`) with it.
- **Size:** about 2,000 lines moved (likely).
- **Risks:** none in code.

### P1: Consensus doors (Public)

- **Change class:** realization_refactor. The member's withdrawal is P7's.
- **Order:** after P0.
- **Scope:**
  - make `project.read#ticket_consensus` unavailable. Delete its binding and
    table entry, `admittedAuthorityBinding`, `ConsensusProjectionPort` and
    the `product/project_read_ports.ts` items (§2.3). Its definition stays
    until P7, because register row `:88` names its key (§5.4);
  - delete `public/run_projection_authority.ts`;
  - delete the `./product` roster helpers and the roster
    (`semantics.ts:152`, `:461-470`, `:602-635`);
  - leave `shared/capability_contracts.ts`, the corpus ids and the Consensus
    schema contracts unchanged (§3.4);
  - `ABI5_SYSTEM_PRODUCT_SEMANTICS` stays until P2, because the shipped
    Consensus publication names it by string.
  - Tests:
    - add `ticket_consensus` to the unavailable request table
      (`t287-framework-handoff-types.test.mjs:230-241`) and move the counts
      to 46 callable and 10 unavailable;
    - edit the W2-05 install chain (the refusal path `:1144-1215`),
      `steel-basic-cli-public` and `r10-projection-contracts`.
- **Size:** about 580 deleted.
- **Door:** the member refuses `installed_binding_unavailable` until P7.
- **Risks:** Public contract and manifest pins. The register and the
  capability graph do not change, and the artifact-truth probe proves that
  the stores still read.

### P2: the Consensus and One Surface module

- **Change class:** realization_refactor.
- **Order:** after P1.
- **Scope:**
  - delete `gtl/consensus.ts` and `implementation/consensus.ts`, with their
    re-exports;
  - delete `gtl/consensus_schema.ts` except `CONSENSUS_PUBLIC_SCHEMA`
    (`:276-1766`) and `CONSENSUS_SCHEMA_ASSET_BINDINGS` (`:1780-1795`). These
    two keep the 13 schema contracts published until P7, because Product
    verification needs a published carrier for the Consensus capability
    (§5.4);
  - delete the system semantics (`builtin_semantics.ts:422-746`);
  - delete the three Consensus vocabularies: their files, their generator
    rows and value imports, and the 2 vocabulary corpus ids, which moves the
    corpus count check (`product/public_contract_publication.ts:120`) from
    44 to 42. The generator keeps importing `CONSENSUS_PUBLIC_SCHEMA` and
    `CONSENSUS_SCHEMA_ASSET_BINDINGS` from `gtl/consensus_schema.js`
    (`scripts/generate-product-manifest.mjs:52-58`). Row `:82` keeps the
    vocabulary ids until P7. Nothing reads a projected id that has no published contract:
    `projectedPublicContractIds` is read only by `capabilityRefsForContract`
    (`shared/capability_contracts.ts:107-114`), for published or recorded
    contracts;
  - edit the manifest generator (the publication `:1093`, the vocabularies,
    the imports) and the `package.json` scripts;
  - tests: delete `m5-consensus-module` (move the law case first) and
    `t287-consensus-ref-shape`, and edit the remaining Consensus tests in
    `fb86974e3`'s list.
- **Size:** about 7,000 deleted. Of these, 6,086 are in two whole files,
  about 330 are in `gtl/consensus_schema.ts` and about 600 are elsewhere.
  This exceeds the 2,500-line aim. `gtl/consensus.ts` has no kept referrer
  after P1, so splitting it adds review steps without adding safety.
- **Door:** a publication or start naming the Program or a Consensus
  function finds no module and is refused (§4).
- **Risks:**
  - manifest pins: one of the shipped constructors leaves;
  - qualification mirrors;
  - replay of logs whose admitted Run selected the Consensus implementation.
    These are exactly the One Surface logs, which P5 refuses. Before P5 they
    still decode, because decoding loads no module (likely).
- **Lanes:**
  - the named Consensus-adjacent tests and the generator reproducibility
    test;
  - `t287-pfc-f08a-product-verification-boundary` and
    `t287-st2a-g-capability-definition-graph`. Both read the Consensus
    capability and its schema rows and pass unchanged until P7.

### P3: the continuation operations, write side

- **Change class:** realization_refactor. The member's withdrawal is P7's.
- **Order:** after P2.
- **Scope:**
  - make `run.continue#selected_action` unavailable: its binding goes
    (§2.6), and its definition stays until P7, because register row `:87`
    names its key (§5.4). Add it to the unavailable request table and move
    the counts to 45 callable and 11 unavailable;
  - remove the `currentIntent` alternative of `current_intent`;
  - remove the write side of `construction_continuation.ts` (§2.4):
    `hog/entry.ts` `:356-435`, `hog/traversal_contract.ts`,
    `hog/graph_execute.ts` and `admitConstructionContinuationExecutionBasis`;
  - remove `admitContinuedTraversalCursor`;
  - remove the owner-binding items (§2.6) and the Public pending-call arms;
  - tests: delete `t287-selected-action`, `-selected-action-authority`, their
    host and product fixture, the recorded fixture
    `fixtures/t287-current-owner/selected-action/` with its README rows, and
    the evidence-gate rows `selected-action-evidence-root` and
    `selected-action-owner-subject`;
    review `t287-continuation-causation` and `t287-multi-candidate-admission`;
    edit `t287-recursive-registered-selection.test.mjs:26-41`,
    `t287-installed-product-coordinate.test.mjs:79` and
    `support/single-address-space-consolidation.mjs:35`.
- **Lanes:** `t287-recursive-registered-selection` (pending-execution
  continuation through `current_intent`) and `t287-native-assessment-evidence`.
- **What does not change:** the read-side projections stay until P5, so
  recorded continuation operations still fold, and this package does not
  change what recorded history reads.
- **Size:** about 890 deleted.
- **Doors:**
  - `selected_action` refuses `installed_binding_unavailable` until P7;
  - a `currentIntent` body is refused by request admission;
  - a held One Surface Run can no longer be continued.
- **Risks:** Public contract (definition digest of `current_intent`) and
  manifest pins. The register keeps `current_intent` and `selected_action`.
  A changed definition digest does not reach the lock checks, which compare
  recorded graphs and contracts with each other and with the register's key
  lists (§5.4).

### P4: the route owner and HoG, write side

- **Change class:** realization_refactor.
- **Order:** after P3.
- **Scope:**
  - the write-side functions of `traversal_route.ts` (§2.4) and the
    `admitRoute` arms;
  - `proposeGapStopRoute` and the HoG gap arms;
  - the F_H hold arm, the shared call-path arms (§3.2) and the
    `execution_basis.ts` helpers.
  - **Door:** `admitExecutionBasis` refuses a Program that carries
    `actionCatalog` or `constructionComposition`, using its existing basis
    refusal. Without this door a fixture One Surface Program would run
    silently through ordinary routes until P6.
  - Tests: delete `t287-exact-construction-intent` and its fixture, and
    `t287-rp2-correction-carriers` with `rp2-correction-product`. Edit
    `t287-rp2-behavior-carriers:30` and
    `retained-route-cursor-transition.test.mjs:102`.
- **Size:** about 2,250 deleted.
- **What does not change:** recorded history reads the same, because the
  readers stay.
- **Risks:**
  - replay digests: no new event of a kept Run changes, proven by the census
    and by byte-equal route and hold events for a default-library Run;
  - manifest pins for `./abg`, `./abg/m03` and `./hog` exports.

### P5: readers, refusal doors and the gap family

- **Change class:** realization_refactor. The frontier reads' withdrawal
  under open point 2 is P7's.
- **Order:** after P4.
- **Scope:**
  - §2.4 read side: replay, calculus derivation arms, continuation and route
    projections, `fh_continuation_projection`, `effectful_invocation_truth`,
    `runtime_history`;
  - the gap family: re-entry, `public/gap_authority.ts`, `gap_stop` outcomes,
    the store value lists, and the frontier reads' ports and bindings. Under
    open point 2 (a) the three reads become unavailable. Their definitions
    and `ABG_ADMITTED_GAP_SCHEMA` stay until P7, because rows `:87` and `:88`
    name their keys (§5.4). The counts move to 42 callable and 14
    unavailable;
  - the remaining exported types.
- **Doors:**
  - A log carrying `construction_intent_selected`,
    `construction_delta_observed` or `construction_continuation_opened`, a
    `continuation_superseded` or `public_operation_admitted` of kind
    `construction_intent` or `selected_action`, a `gap_stop` route or a
    no-action `run_stopped` is refused.
  - The refusal comes from the owning reader's existing message. The
    `gap_stop` values are refused at decode, by the TD-25S precedent.
  - Hand-built logs show each refusal, red on the old build.
  - Under open point 2 (a), the three reads refuse
    `installed_binding_unavailable` until P7.
- **Size:** about 1,650 deleted.
- **Test edits:** `t287-recursive-registered-selection.test.mjs:466-468`;
  under open point 2 (a), `t287-readable-stops.test.mjs:127`, `:157`,
  `:161` and `t287-installed-product-coordinate.test.mjs:101`.
- **Lanes:**
  - the replay census, with the two One Surface subjects expected
    "refused";
  - the four hand-built refusal logs;
  - `m5-event-calculus-runtime` edits;
  - `t287-route-reconstruction` edits;
  - `t287-readable-stops`, because the stop reading keeps working, including
    the Executive's gap origin (`:216-222`).
- **Risks:** replay digests. `constructionDeltas: []` stays, and
  `ReplayRouteState` keeps its optional keys absent. Also Public contract
  and manifest pins.

### P6: the language

- **Change class:** realization_refactor.
- **Order:** last.
- **Scope:**
  - the schema arms, contract types, canonicalization and `gtl/index.ts`
    types;
  - the validator law `:1574-1775`;
  - `ExecutionBasis` field types become constant `null`/`[]` types, with the
    writer writing constants;
  - the `actionCatalog` input of `ProductSemanticsProvider`;
  - fixtures: the developer-mini One Surface program, the S03 fixture,
    support and test (`tests/t287-s03-automatic.test.mjs`) with the
    evidence-gate rows `s03-phase-b-release` and `s03-evidence-directory`,
    and the qualification recipe rows;
  - test edit: `t287-gtl-serialization-publication.test.mjs:94-114`.
- **Door:** `GTL_PROGRAM_SCHEMA` refuses the two keys (strict object). The
  P4 basis guard becomes redundant and goes.
- **Size:** about 350 source, plus about 1,800 to 2,300 fixture lines.
- **Risks:** manifest pins (`./gtl`, `./gtl/m01`, `./gtl/m02` types) and
  qualification mirrors.

### P7: the register changes (gated)

- **Gate:** TD-77 closes (§5.4, open point 8). TD-77 is the register's
  design_reframe package. It sits outside the nine, covers both lock checks
  and gates TD-25M as well as TD-26. If TD-77 does not land, P7 does not run,
  and the five members, the 13 schema contracts and the Consensus capability
  stay as declared residue.
- **Change class:** realization_refactor. Its requirement text lands in
  P0.
- **Scope:**
  - withdraw the five member definitions:
    - `ticket_consensus` (`product/project_read_operation_contracts.ts:27`,
      `:97-104`, `:274-286`, `:294`);
    - `selected_action` (`product/run_operation_contracts.ts:220-237`,
      `:249`, `:321`, `:327`);
    - under open point 2 (a), the three frontier reads
      (`abg/project_read_operation_contracts.ts:125-174`, `:253-258`,
      `:492-518`, `:537-547`);
  - remove their keys from register rows `:87` and `:88`
    (`shared/capability_contracts.ts`);
  - remove `abg.capability.graph-function.consensus@5` from
    `MANDATORY_ABI5_CAPABILITY_IDS` (`:39`) and its register row (`:91`);
  - remove the 9 Consensus schema ids and the 3 Consensus vocabulary ids from
    the `abg.capability.catalog.invoke-graph-function@5` row (`:82`);
  - unpublish the 13 schema contracts:
    - `CONSENSUS_PUBLIC_SCHEMA` and `CONSENSUS_SCHEMA_ASSET_BINDINGS` (with
      the rest of `gtl/consensus_schema.ts`) and their `gtl/index.ts`
      re-exports;
    - the generator's schema path, write, digest, rows and spread
      (`scripts/generate-product-manifest.mjs:160`, `:298-302`, `:440`,
      `:524-542`, `:634`);
    - `scripts/clean.mjs:10`;
    - the 9 schema corpus ids (`product/public_contract_publication.ts:87-95`)
      and the count check `:120`;
    - `contracts/schemas/consensus.schema.json`;
  - the family checks in `product/verify_product.ts:1550`, `:1573-1591`;
  - tests:
    - remove the members from the unavailable request table and move the
      counts back to 9 unavailable
      (`t287-framework-handoff-types.test.mjs:145-146`, `:197`, `:215`,
      `:230-241`, `:275`);
    - edit `t287-st2a-g-capability-definition-graph.test.mjs:347-360` and
      `t287-pfc-f08a-product-verification-boundary.test.mjs:285-296`, which
      name the Consensus capability;
  - regenerate `contracts/capabilities/capability-definition-graph.json`, the
    operation contracts, the product identity and the pins.
- **Size:** about 1,600 source lines and 2,030 contract lines deleted, plus
  regenerated contracts.
- **Door:** a call to a withdrawn member refuses `unknown_definition` (§4).
- **Risks:**
  - After TD-77, stores stay readable, which is TD-77's closure condition.
  - Run before TD-77, P7 makes artifact truth refuse every store that reads
    today, with its existing inline-lock or candidate-and-lock message, and
    the three retained-input lanes lose cases.
- **Lanes:**
  - an artifact-truth probe over the live rc.12 Run, the decodable replay
    subjects and both `t287-current-owner` fixtures, identical on base and
    final;
  - `r10-child-proof`, `t287-historical-source-resource` and
    `t287-cross-cut-public-read`, with `ABI5_EVIDENCE_ROOT` set;
  - `t287-framework-handoff-types`, `t287-pfc-f08a-product-verification-boundary`
    and `t287-st2a-g-capability-definition-graph`.

### Parallel and serial

- **Serial:** every code package moves manifest pins. P1, P3 and P5 also
  move the Public family. So P1 → P2 → P3 → P4 → P5 → P6 run serially.
- **TD-77** fits anywhere in the serial line before P7. It is a code
  package that regenerates the product identity, so it does not run in
  parallel with P1 to P6. Its files (`product/environment.ts`,
  `abg/artifact_truth.ts`, the guard in `shared/capability_contracts.ts`
  and the verified-artifact guard) are ones P1 to P6 do not edit (likely).
- **P7** runs last, after TD-77 closes.
- **TD-25's members package (TD-25M)** stopped on the same lock check and
  waits for TD-77 too. It edits the same register rows (`:87`, `:88`) and
  regenerates the same capability graph. So it runs serially with P7,
  before or after it, and never in parallel with it.
- **TD-28's packages** (in flight since `4274cf66f`) share files with P2 to
  P6: `product/builtin_semantics.ts`, `abg/execution_basis.ts`,
  `abg/c_call_outcome.ts`, `hog/ccall_lifecycle.ts`,
  `validator/validation.ts`, replay, the event store, the axioms and the
  generator. The TD-28 map runs none of its chain packages beside a TD-26
  package (`TD-28_RETIREMENT_MAP.md:1525-1532`). So they interleave with P1
  to P6 in the same serial line, and each package rechecks its line numbers
  on `main`.
- **Side by side:** P0b with P1 and P2. Test-only reclassification (§2.10)
  can be prepared in parallel and merged into the owning package.
- **Upstream of all:** P0.
- **TD-38 and TD-48 follow P6.** The register orders them after TD-26.

### Re-applying `fb86974e3` and `f4aad7d5e`

**`fb86974e3`** (81 files, −15,349):

- **Reference, not cherry-pick.** It is the reference diff for P1 and P2.
  O1 recorded that it conflicts.
- **Changed since:**
  - TD-25 removed the response chain;
  - TD-34A made run invocation import the GTL schema family;
  - `construction_continuation` gained named types;
  - the identity has been regenerated several times;
  - `t292-td34a-run-invocation-schema-owner.test.mjs` (14 hits) is new;
  - TD-60B deleted `t287-d1-requirement-handoff`, one of the tests it edits.
- **What it leaves:**
  - `run_projection_authority` and the `product/semantics.ts` roster
    (RV4 F7);
  - every One Surface item outside `gtl/` (the contract type, the schema
    arm, the validator law, the ABG and HoG carriers, the owner bindings);
  - the gap family.
- **What it does wrong:**
  - it deletes the law case in `m5-consensus-module` instead of moving it
    (RV4 F2);
  - it changes the register (`shared/capability_contracts.ts`, 6 lines):
    the Consensus mandatory id, row `:91`, the Consensus ids of row `:82` and
    the `ticket_consensus` key of row `:88`. §5.4 shows that each of these
    makes every store that reads today unreadable, so those hunks belong
    to P7 after TD-77. Its `verify_product.ts` count change (56 to 55)
    belongs to P7 for the same reason.

**`f4aad7d5e`** (62 files, −5,489):

- **Reference for P0 (Consensus half) and P0b.**
- **Changed since:** five of its six note deletions are now moves already
  made. The sixth (M05_S05) must be a move.
- **What it leaves:** the One Surface specification (§1.3), RV4 F2-F12, the
  POLICY clauses and the ABG requirement families.

**Others.** `a61231c6a` re-applies. `da1d589a9` ("A system program") is the
rejected route and does not.

## 7. Open points

1. **What the default root mode starts.**
   - **Facts:**
     - `rootMode` defaults to `supervised`
       (`product/run_operation_contracts.ts:163`).
     - A supervised start needs `until: converged`, a caller-selected
       `startRef` equal to the target, and a Program whose policy is
       `supervised`. It resolves one declared start
       (`gtl/public_start.ts:85-106`). A direct start needs a Program whose
       policy is `direct` and no caller-selected start (`:56-65`). Any other
       supervised request is refused `unsupported_control` (`:107-110`).
     - The Executive's Program declares policy `direct` and a default start
       through `abg.default_start_ref` (`gtl/default_library.ts:318`).
     - The only other supervised Program, `revision-command-execution@5`,
       declares `starts: []` (`gtl/worksite_command_execution.ts:250-258`).
     - After P2, a start with the default root mode starts nothing shipped.
       The live Run used `direct` with target `next`.
   - **Options:**
     - (a) The Executive's Program policy becomes `supervised`. Callers then
       name its declared start, and target `next` (the direct law) no longer
       starts it. The Executive lanes that start it directly change
       (`t287-default-library.test.mjs:436`, `:458`, `:1436`, `:2606`;
       `support/registered-graph-selection.mjs:236`, `:263`; the O1 Q5
       cascade), and `PRODUCT.md:1122` is restated.
     - (b) The default becomes `direct`, and POLICY-013 is restated.
       `supervised` then serves only Programs that declare it, and none
       ships a start.
   - **Where they point:** the decision names the Executive "the standard
     system program", and POLICY-013 defines `supervised` as selecting "the
     admitted system program", so both point to (a). `PRODUCT.md:1122`
     ("explicitly selected, replaceable compositions") and the library
     design (`T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:645-651`) point to
     (b).
2. **The frontier reads and gap re-entry.**
   - **Facts:** after P4 these are empty or dead for every kept Run:
     `run_gaps`, `workspace_gaps`, `run_lawful_actions`, the stop reading's
     `nextActions`, `InvocationReentryBasis` and `PublicGapAuthority`.
     The Executive's gap is a `blocked` stop with origin `gap`, which the
     stop reading already reports. `t287-readable-stops.test.mjs:157` and
     `:161` assert today that `nextActions`, `gaps` and `frontiers` are all
     empty on an Executive stop.
     The three reads' definition keys are in register rows `:87` and `:88`,
     so withdrawing them is a register change (§5.4).
   - **Options:**
     - (a) Withdraw them. P5 makes them unavailable, and P7 withdraws them
       after TD-77, giving 51 definitions. This is a requirement_reprice of
       `PUBLIC-CONTRACTS:209`, `POLICY:605`, `QUAL-059` and `SCENARIOS-010`
       (`:140-145`). If TD-77 does not land, they end as unavailable
       members.
     - (b) Keep them as reads that always return empty. No register change.
     - (c) Repoint them to the stop reading's gap origin. This is new work.
   - **Where they point:** owner rule 2 and "always remove tech debt" point
     to (a).
3. **Digest-carried constants.**
   - **Facts:** these stay as constants because removing them moves digests:
     the six basis fields, the hold identity's `constructionIntentRef`,
     `constructionDeltas: []`, the three declared kinds with their payload
     variants and calculus rows, and `reentryBasis`.
   - **Options:** list them in TD-66's batch; or move every new digest now.
   - **Where they point:** TD-66 (open) recommends one batch, so they belong
     in its list.
4. **Recorded One Surface Runs become unreadable on 5.0.**
   - **Facts:** about 223 Run files, including the RC1 S03 executions and
     the RC11 selected-action evidence, plus 12 compressed copies of the
     RC10 selected-action log and one archive (§5.2). The installs that
     wrote them still read them.
   - **Options:** accept, as TD-25 did; or keep a historical decoder for the
     retired kinds, which is new work and keeps the debt.
   - **Where they point:** "the event log is the recovery source" with
     immutable installs points to accept. S03's new evidence comes from the
     Executive (point 6).
5. **The Consensus text.**
   - **Facts:** `REQ-P-CONSENSUS.md` contradicts the 5.0 response reservation
     (register TD-26 addendum).
   - **Options:** move it and the Product Consensus section to history while
     `A5-F08` keeps its identity, as `f4aad7d5e` did; or keep it as 5.1
     planning text.
   - **Where they point:** the decision ("One Surface retires together with
     standalone Consensus") points to history.
   - **Interaction with point 8:** the 13 schema contracts cite
     `REQ-P-CONSENSUS-004` and stay published until P7. If TD-77 does not
     land, they stay for good, and `REQ-P-CONSENSUS-004` stays live with
     them.
6. **S03 and QUAL-059.**
   - **Facts:** S03 is a pre-RC gate. Its gated fixture and support author
     One Surface.
   - **What is needed:** the repriced S03 needs new evidence through the
     Executive. That is qualification work for the wave, not retirement work.
     TD-26 deletes the One Surface S03 fixture and restates the scenario.
     The S03 lane stays unrunnable until that evidence exists.
7. **The name `current_intent`.**
   - **Facts:** it now continues only pending executions. Recorded
     pending-execution operations carry `memberKey: "current_intent"`.
   - **Options:** keep the name in 5.0 and state what it continues; or
     rename it, which moves the Public contract and needs the old name to
     stay readable.
   - **Where they point:** keep. A rename belongs with TD-66's batch if
     anywhere. A rename also changes the key in register row `:87`, so it
     meets the same lock checks (§5.4).
8. **The register changes wait for TD-77 (gates P7).**
   - **Facts:**
     - TD-26's register changes (§5.4):
       - the five member keys in rows `:87` and `:88`;
       - the Consensus row `:91` with its mandatory id `:39`;
       - the Consensus ids in row `:82`.
     - TD-25M's change is the `interaction.respond` operation and its five
       members, in the same two rows.
     - The reader applies two register checks to every recorded lock row:
       - the graph check (`product/environment.ts:608` →
         `shared/capability_contracts.ts:407-431`);
       - the identity check (`product/environment.ts:674-680`).
     - A member-key removal fails the graph check (probed on three locks).
       TD-25M measured the identity check.
     - TD-25M Return §6 offers (a) accept, (b) reframe first, (c) keep, and
       its (b) names only the identity check.
     - The register's TD-77 entry is that reframe with both checks. It rules
       the reader's re-derivation of a recorded Product's graph and
       identities retired. It gates TD-25's members, TD-26 and every later
       register change. Status at `4274cf66f`: Open, with its first Writer
       stopped at the trace.
     - TD-77 also carries an owner decision, `REQ-M-GTL3-CAPABILITY-014`,
       recommended "Restate", and names the verified-artifact guard
       (`product/verify_product.ts:727`, `:900`, `:2522`) as part of its
       split.
   - **Options:**
     - (a) Accept the loss and run P7 without TD-77. Every store that reads
       today becomes unreadable through artifact truth, and three kept lanes
       lose retained inputs.
     - (b) Run P7 after TD-77 closes.
     - (c) Keep the register entries, and P7 does not run. TD-26 then ends
       with:
       - 56 definitions (42 callable and 14 unavailable under open point 2
         (a));
       - the 13 Consensus schema contracts published with no function that
         uses them;
       - the Consensus capability mandatory with no implementation.
   - **Where they point:** the register already chose (b) through TD-77.
     "The event log is the recovery source" rules out (a), and "always remove
     tech debt" rules out (c). What remains open is TD-77's own package and
     its owner decision, not a ruling for TD-26.
