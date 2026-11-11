# Area findings: `abg-events` (event store, replay, Event Calculus, read side)

Commentary, not law. Reviewer: Claude Opus 5.5, read-only, 2026-11-12, at `main` `002035b8a`. No test, build or provider call was run. Nothing outside this file was changed.

Labels used below:

- **digested body**: the `body` object of `deriveReplayPrefixFacts` (`replay.ts:1411`) whose canonical bytes give `replayDigest`.
- **derived value**: a value computed from the Event Calculus fold or the liveness reader rather than read from an admitted event field.
- **cold decode**: `decodeRuntimeHistoryDescriptor` (`event_store.ts:3773`), the whole-log read on reopen, recovery or an unbound coordinate.
- **profile**: one exact root event-contract table selected by a row's `eventContractDigest` (`event_contract_profiles.ts:26`).

## Entries

### E1. Take derived liveness out of the replay digest, under a successor profile, and retire the reader-side frame filter
- Category: design and specification (with second owner)
- Evidence (read, `replay.ts` and its consumers):
  - The digested body (`replay.ts:1411-1470`) carries these derived values: `nativeLiveness` (`projectNativeLivenessRead`, `runtime_liveness.ts:293`, folded over the *unscoped* prefix); `activeFluents` (every held fluent of the Run fold, `replay.ts:1433`, including the `runtime_invocation_active` frame probes); `runtimeStatus` (from `holdsAt` of `run_terminal`, `operator_run_stopped`, `run_active` and the continuation statuses, `:1442-1469`); `currentWorksiteObservations` (filtered by `holdsAt worksite_observation_current`, `:1279-1291`); `continuations[].status` (`projectFhContinuations(prefix, eventCalculus, …)`, `:1294`); `actorProcesses[].terminationConfirmed` (a fluent, `:2492`). `digestReplayBody` (`:2339`) hashes all of them. The semantic view's `viewDigest` (`:2286-2314`) adds `holdsAt` and `nativeLiveness` again.
  - The body already contains `eventStoreDigest` (`:1413`), so every derived member is a function of a value the digest already pins, except the cross-Run worksite currentness (`:1001-1004`) and `nativeLiveness`, which read the authority prefix. Their only distinguishing effect on the digest is to make it depend on the axiom version.
  - Where the digest is persisted: `traversal_route_admitted.replayStateDigest` and `c_call_judged.replayStateDigest` (event contracts `event_store.ts:314`, `:780`); `invocation_admitted.payload.sourceResultBasis.sourceReplayDigest` (`invocation_admission.ts:591`).
  - Where it is re-derived from history and compared: `projectOwnerFacts` (`replay.ts:1972-2006`) recomputes each source-result basis at its historical predecessor cut (`deriveInvocationSourceResultBasisAtPrefix`, which calls `projectRuntimeReplayGuard`, `invocation_admission.ts:439`) and refuses on `!canonicalEquals(derived, asserted)`. This runs inside `projectRunSemanticReplay`, i.e. every Public `run_replay` of a Run started from a source result. Historical route reconstruction (`traversal_route.ts:643-700`) and retry progress (`retry_progress.ts:984`) read the recorded `replayStateDigest` and do not re-derive it (by reading; not an exhaustive census). The other comparisons (`traversal_route.ts:4441-4442`, `:5371`; `c_call.ts:7141-7142`; `c_call_outcome.ts:1548`; `fan_out.ts:218`; `invocation_admission.ts:1472-1487`) are prospective, at the current cut.
  - What it blocks: RC12 ruled (b) to leave the axioms alone and filter in readers (`rc12-executive-01/LEDGER.md` B2a; `B2A2_RETURN.md` T1 and decision 2: "reprice the axiom … later, which changes recorded digests"; plan post §15.8 item 6). The resulting second owner of "is this frame live": the axioms (`calculus/axioms.ts:233-238`, `:347`, `:368`, `:983-1000`) say the frame probe holds; `projectEndedChildFrames` (`replay.ts:350-374`) says it is historical, consumed by `projectRunQuiescence` (`:449`), `closure.ts:543`, and the Public reads `withoutEndedFrames`, `graphCallStatus` and `projectRunStatus` (`project_read_ports.ts:1061-1095`). The Public `run_replay` still carries the unfiltered `activeFluents`. `project_read_ports.ts:1054` `childFrameKey` repeats `replay.ts:342` `endedChildFrameKey` byte for byte.
  - A third statement of frame end: native liveness decides that a frame occurrence is done on `frame_closed`, `run_stopped`, `runtime_failure_observed` or `graph_call_closed` (`calculus/liveness.ts:640-645`, `:775-778`). By reading those lines only, it does not recognize the stopped foldback either. It therefore agrees with the axioms, not with the reader filter, and option (a) below must change it too (likely; the rest of `liveness.ts` was not read).
  - A related second owner in the same function: the three `RUN_QUIESCENCE_*` name sets (`replay.ts:281-335`) classify fluent names that only `calculus/axioms.ts` declares; a fluent added to the axioms and not to a set falls into `unknownFluents` and blocks closure silently (`:450-456`).
- Retire: under a successor profile (the in-area precedent is the capability flag `lifecycleCopies`, consulted per row stamp at `c_call.ts:1983` and `worksite_construction_recovery.ts:260`), either (a) the narrow fix: the axiom ends a frame's probe at an admitted stopped foldback, so `projectEndedChildFrames`, `withoutEndedFrames`, `childFrameKey` and the quiescence exception apply only to rows under the W profile; or (b) the class fix: the digested body keeps the event-sourced members (refs, `cCalls`, `routes`, closures, `eventStoreDigest`) and the derived members leave it, becoming read-time projections beside the guard. (b) removes the reason any later axiom correction would need a reader filter. In both, the axiom owner (`calculus/axioms.ts`) also owns the quiescence classification of each fluent it declares, so the three sets in `replay.ts` retire.
- Size: L (contract decision, profile succession, axioms, replay, quiescence, three Public reads; about 120 lines retire, the profile flag is new).
- Risk: replay digests of recorded Runs. Under W every recorded `sourceReplayDigest` must still re-derive, so the old digest formula and the old axioms stay selectable for W cuts; an unversioned change makes `run_replay` refuse every recorded source-result Run, and moves the digest pins RC12 already had to move (`X_RETURN.md` R2 "executive digest and serialized digest").
- Change class: design_reframe (a requirement_reprice if the Public `run_replay` stops carrying `activeFluents`).
- Confidence: verified for the members, the persistence sites and the historical re-derivation (read); likely for "no other cold path re-derives `replayStateDigest`" (searched `BeforeEvent`/`ThroughEvent` cuts near replay guards, not exhaustive).

### E2. Profile registry: unpin nothing, but name the profiles truthfully, pin W at its successor, and move the HS03 lane off a home path
- Category: design and specification; test debt; dead code (one import)
- Evidence:
  - Four selectable profiles (`event_contract_profiles.ts:26`, `event_store.ts:1214-1219`): L (`fc3a…`), RC6 (`5b35…`), S2 (`3bcc…`), W (computed, current, `51299706…` per `contracts/schemas/native-runtime-observation.json:4`). L, RC6 and S2 are pinned and refuse at load if their table changes (`:53-59`); W is not pinned.
  - Recorded logs (first and last row read, nothing else): `release-qualification-rc6-01`, `rc5-performance-01` and `single-address-space-consolidation-01` logs are RC6-stamped (`5b35`; 2.9 GB, 0.59 GB, 0.90 GB); `rc8-reference-preservation-01` is W-stamped (`5129`); the three `rc4-native-recovery-01` logs (2.4 GB together) carry `6c8a9852…`, which no current profile selects: the current Product already refuses those recorded logs. No S2-stamped log was found under `T287_RELEASE_RESUMPTION_01`; the HS03 S2 case builds its rows with a test stand-in (`m5-event-store-reopen.test.mjs:2091-2094`). Logs outside that directory (installs under `~/Library`) were not checked.
  - L's table (`LEGACY_ROOT_EVENT_CONTRACTS`, 746 lines at `event_store.ts:329`) is the base of all three stamped tables, and S2's is the base of W (`:1195-1207`), so neither is deletable; "legacy" names the base of the current table. Only RC6's table is the base of nothing, and it is what the three recorded RC6 campaigns need. Retiring RC6 or S2 *selectability* is an owner decision on those recorded logs, not debt.
  - `ROOT_CURRENT_EVENT_PROFILE_REF` (`event_contract_profiles.ts:11`) names the p5 ref that RC6 and S2 use (`:62`) and the default of `constructRootCurrentEventContractDescriptor` (`:222`); the current ref is `ROOT_WINDOW_EVENT_PROFILE_REF`. Its import at `event_store.ts:42` is the only compiler-unused entry in the area (census `compiler-unused.json`).
  - Adding a profile edits a closed four-name union, the pin table and the capability formula in one file plus the table construction in `event_store.ts`; the `rc4` logs show what happens to W-stamped logs (RC7 to RC12) when W's table next changes without a pin.
  - `m5-event-store-reopen.test.mjs:2051` imports the installed RC6 owner from `/Users/jim/Library/Application Support/ABIogenesis/installs/5.0.0-rc.6/…` and skips when absent: the TD-04 class (machine-bound input).
  - Structure: `event_contract_profiles.ts` also owns the undispatched-owner observation contract and caught-cause retention (`:71-212`), unrelated to profiles.
- Retire: the unused import; rename `ROOT_CURRENT_EVENT_PROFILE_REF` to name the p5 profile and make the descriptor default explicit; when W's table next changes, pin W's digest as a retained profile first (the rule the rc4 logs lacked); read the RC6 owner through the evidence root (`ABI5_EVIDENCE_ROOT`) instead of a home path; move the undispatched and caught-cause contracts to their owner (`runtime_failure.ts` already supplies their diagnostic ref). Ask the owner whether the rc4 logs' loss of readability was intended.
- Size: S (import, rename, test input: about 10 lines); M if the profile registry is made data-driven (about 100 lines across `event_contract_profiles.ts` and `event_store.ts:1195-1219`).
- Risk: manifest or digest pins (the descriptor's `profileRef` member is inside every RC6 and S2 digest, so the rename must not change the string); none for the import.
- Change class: realization_refactor.
- Confidence: verified (read and first-row reads); the rc4 refusal is inferred from the selector (`entries.get(digest) ?? null`), not run.

### E3. Cold decode: one prefix hash stream, prove each row once, keep one row decoder
- Category: performance; second owner
- Evidence (read, `event_store.ts`):
  - `decodeRuntimeHistoryDescriptor` (`:3773-3833`) runs `foldRuntimeHistoryDescriptor` (`:3747-3771`), which hashes the log in 64 KiB chunks for the whole-prefix check, with a per-row callback. For each row the callback parses the line, re-serializes it with `canonicalJson` and compares the bytes, decodes the body (`decodeEventBody`), re-projects the row at its contract (`projectRuntimeEventAtContract`, `:2484-2556`, which recomputes `sha256Canonical(payload)` and then the event id as `sha256Canonical` over the candidate, a second full serialization of the payload), hashes the row (`sha256Bytes`, the row's `physicalDigest`), and updates a second running hash, `physicalHash` (`:3816-3818`), whose state it copies to read the row's prefix digest. The chunk hash and `physicalHash` digest the same contiguous bytes from offset 0 (rows include their newline, `:3786`), so they compute one value twice. Each byte is therefore hashed three times, of which two are the same digest, and each payload is serialized canonically about three times per cold decode.
  - The body reader built in `constructRuntimeHistory` (`:3698-3741`) re-reads a body by its location. On every read it parses the body, re-serializes and compares it, hashes it, compares the envelope with `canonicalEquals` and recomputes `sha256Canonical(payload)`. The byte hash against the row's recorded `physicalDigest` already proves the bytes are the ones decoded; the other steps re-prove what that equality implies.
  - `decodeHistoricalEvents` (`:3465-3574`), used by `validateHistoricalEvents` and so by `persistEventLog` (E7), repeats the per-row decode. TD-23 consolidated only the line framing of the two readers.
  - What scales it: log bytes, times every cold decode: each reopen, each recovery, each read at an unbound or copied coordinate, and two per call of each of the twelve reads in E4.
  - Measured: the 2026-11-06 operational review of RC6 and RC7 (F2) measured canonical JSON plus sha256 at 52-55 % of cold-read CPU. The RC7 build-cycle diagnosis measured cold launch rising from 120 s to 487 s on a 2 GB log. By reading, the passes are unchanged at `002035b8a`. The share at head was not re-measured.
- Retire: one row decoder, the row step of `decodeRuntimeHistoryDescriptor`, which `validateHistoricalEvents` also uses. One running prefix hash per decode: `physicalHash` alone gives each row's prefix digest and, at the end, the whole-prefix check, so the chunk hash in `foldRuntimeHistoryDescriptor` retires (its only caller is this decode, `:3784`). The per-row `physicalDigest` stays; it is a different value. Three byte hashes become two. `projectRuntimeEventAtContract` serializes the payload once and uses those bytes for both digests. The body reader keeps the byte hash against `physicalDigest` and drops the parse, the re-serialization, the envelope compare and the payload re-hash. The canonical-bytes check stays: once per row, at decode.
- Size: M (one owner and its two readers; about 110 lines retire with `decodeHistoricalEvents`, about 20 change in the decode and body reader).
- Risk: none for bytes. No digest formula or stored byte changes, and no check is weakened, because equal bytes imply an equal parse. Proof: the decode refusal lanes (`m5-event-store-reopen`, `t287-event-body-encoding`) must still refuse each mutated row they inject.
- Change class: realization_refactor.
- Confidence: verified for the passes (read). The gain is inferred from the RC6 measurement; one cold-decode profile at head would settle it.

### E4. The twelve reads outside the run-read owner: route them through the held owner, then decide the members no constructor builds
- Category: performance; failed or superseded feature; design and specification
- Evidence (read):
  - `project_read_definition_bindings.ts:992-1001` names these bindings `legacyBindings`. They are every member outside the six `RUN_READ_MEMBER_KEYS`: `graph_call_status`, `run_evidence`, `graph_call_evidence`, `result_evidence`, `assessment_evidence`, `witness_evidence`, `workspace_replay`, `interaction_replay`, `continuation_replay`, `c_call_replay`, `workspace_gaps`, `run_lawful_actions`.
  - `binding()` (`:894-990`) accepts only a `reopen_abg_event_resource` assertion (`:904`). The six run reads, by contrast, go through `bindExactPrefixRead` and also accept the held selection `acquired_abg_event_resource_selection`. Each of the twelve reads therefore:
    1. reopens the store. `acquireAbgEventResource` (`definition_event_resource.ts:331`) calls `reopenEventStore`, which runs `decodeRuntimeHistoryDescriptor` over the whole log (`event_store.ts:4254`). This is decode 1.
    2. calls the port, which runs `project()` (`project_read_ports.ts:1837`), `prepareRead` (`:686`) and `admitReadPacket` (`:640`). `admitJson` returns a detached copy of the packet, `prefix` included (`shared/admit/json.ts:312-333`; `admitRecord` builds a new object). `readOwnedRuntimeEventPrefixAtDurablePrefix(copy)` then asks `DurableHistoryDerivation.activeSelection` (`event_store.ts:1808`), which is keyed by object identity. The lookup misses, so `coldHistoryReads++` and a second whole-log `decodeRuntimeHistoryDescriptor` follow (`:3637-3661`). This is decode 2.
    3. closes the store.
  - The six run reads avoid both decodes. `prepareRunReadAtDurablePrefix` passes the captured coordinate, and `prepareRead` substitutes it back after admission (`:698-701`). `t287-exact-prefix-projection-reuse.test.mjs:164` asserts zero decodes, reopens and cold reads for them. No test bounds the twelve. The RC7 review (F3) recorded them as reopen-only with one whole-log decode per call. By reading, each call now makes two.
  - No product constructor builds the twelve. `constructInstalledRunReadCall` (`public/installed_public_definition_call.ts:662`) builds only the six `AbgRunReadMemberKey` members. All eighteen are reachable by a hand-written invocation through the generic CLI transport (`public/cli.ts`, which forwards any Public invocation with a `reopen` acquisition), and the published operation contract gives each a `cliCoordinate` `project read <member>` (`contracts/public-operations/project/read/operation-contract.json`). Test use (whole-word grep):
    - seven members appear only in the capability-inventory test `t287-st2a-g-capability-definition-graph` and in `shared/capability_contracts.ts`: `graph_call_status`, `graph_call_evidence`, `result_evidence`, `interaction_replay`, `continuation_replay`, `c_call_replay`, `run_lawful_actions`;
    - `assessment_evidence`, `witness_evidence` and `workspace_gaps` add one wave-2 owner-contract test;
    - `workspace_replay` appears in four tests;
    - `run_evidence` is also used by `runtime_failure.ts` and two diagnostic tests.
  - `assessment_evidence` and `witness_evidence` always return `target_absent` (`project_read_ports.ts:1812-1815`: "D11/D12 have no admitted owner event in the frozen Wave 2 basis"). The realization constitution records both as "Missing projection: currently returns `target_absent` unconditionally although assessment admission exists" (`design/ABI5_REALIZATION_CONSTITUTION.md:3102-3103`). They are unfinished Public members.
  - The detaching path is `project()` itself, so it is not limited to the twelve bindings. `GraphCallProjectionPort.graph_call_result` and `graph_call_replay` are called through it by `abg/qualification_proof.ts:453` and `:1118` (cached per terminal after the first call) and by `product/project_read_definition_bindings.ts:897` and `:904`. By the same mechanism, each such call is a cold decode even when its prefix is held (inferred; those callers were not traced further).
  - `ticket_consensus` lives in `product/project_read_ports.ts` (`:54`, `:139`, `:298`, `:810-844`), outside this area. It depends on the in-flight RC13 re-homing of Consensus and is not judged here.
- Retire:
  1. One read owner for all eighteen members. `project()` retains the captured coordinate as `prepareRunRead` does, which also fixes the four graph-call callers above, and `binding()` accepts the held selection. The twelve then read the held history by reference. That step is a realization_refactor.
  2. Then two owner decisions. For `assessment_evidence` and `witness_evidence`: implement the two projections or remove the members. For the seven reached only by the inventory test: add Public constructors or retire the members.
- Size: M for the routing (two functions, about 30 lines changed); L for the member decisions (generated schemas under `contracts/schemas/operations/project/read/`, `contracts/capabilities/capability-definition-graph.json`, the constitution tables).
- Risk:
  - Routing: none. `projectionDigest` binds `prefix.coordinateDigest`, not object identity, so projection bytes do not change.
  - Removing any member changes the Public contract.
- Change class: realization_refactor for the routing; requirement_reprice for the two unfinished members; product_reprice for retiring members.
- Confidence: verified by reading for the two decodes (not run; the counters were not observed). Running the reuse lane's counter assertion over one of the twelve would settle it. The usage census is grep-based.

### E5. Artifact truth: write the per-cut digest from retained row bytes
- Category: performance
- Evidence (read, `artifact_truth.ts`):
  - `RuntimeArtifactFacts.advance` (`:308`, 306 lines) extends its rows incrementally. Its `exactProjections` cache is keyed by the cut's `coordinateDigest` (`:301-380`), so each new cut runs `projectValidatedPrefixArtifactTruth` again. That function copies and sorts every artifact row and computes `sha256Canonical` over a body that holds every row, artifact bodies included (`:600-700`).
  - What scales it: total artifact bytes, times the number of distinct cuts read. Every admitted transaction makes a new cut.
  - Measured: the RC9 review (2026-11-09, F3) measured 123 ms per call on this path.
  - `projectionDigest` is consumed outside the area (`install_definition_bindings.ts:374`, `environment_definition_bindings.ts:785`, `product/declaration_application.ts:247`), so the formula stays.
- Retire: keep each artifact row's canonical bytes from its first projection, since rows are immutable admitted history. Stream those bytes into the digest in the same order, as `writeReplayBody` already does for replay rows.
- Size: S to M (one owner, about 40 lines changed).
- Risk: manifest or digest pins only if the streamed bytes differ. The change is byte-identical by construction. To prove it, compare old and new `projectionDigest` over the recorded campaign logs.
- Change class: realization_refactor.
- Confidence: verified for the path (read). Likely that the measured cost still holds at head (not re-measured).

### E6. Owner-admitted values compared by full serialization where they are often the same object
- Category: performance
- Evidence (read):
  - `canonicalEquals` (`shared/value/equality.ts:16`) writes both sides in full. It states that there is no identity shortcut, deliberately, so that an encoding failure on either side propagates. No owner ruling on an identity shortcut was found in the register or `design/` (grep). The comments tree was not searched; it is too large to grep inside the time limit.
  - In this area it is called where both sides are already owner-admitted:
    - The liveness probe ingress checks that the producer event is the indexed one: `indexedRuntimeEvents(prefix, "id:"+id).some(e => canonicalEquals(e, underlying))` (`runtime_liveness.ts:91`, `:146`). This runs once or twice per producer event, and a producer can carry a large result value.
    - `replay.ts:154`.
    - The body reader's envelope compare (E3).
    - `persistEventLog`'s compare of the whole log (E7).
    - `definition_event_resource.ts:336`: the reopened prefix against the handoff prefix.
  - Inferred, not traced: the two sides at the probe site are often one object, because the index and the producer both come from the owner's held rows.
- Retire: add an owner function beside `canonicalEquals` for values both sides of which are already admitted. It returns true on reference identity and otherwise compares canonically. Call it only at such sites. `canonicalEquals` keeps its contract. The design rule is the 2026-11-07 ruling that owner-established values pass by reference.
- Size: S (one helper of about 10 lines and six call sites in this area; other areas likely have more).
- Risk: none. Identical admitted values are canonically equal, and both sides were proven encodable at admission.
- Change class: realization_refactor.
- Confidence: verified for the sites and the contract (read). The cost is structural, not measured.

### E7. `persistEventLog` persists nothing: retire it, or rename it as a verification read that returns a reference
- Category: dead code; performance
- Evidence (read, `event_log.ts`, 57 lines):
  - It reads the whole log file and decodes it with `validateHistoricalEvents`, the second row decoder in E3. It compares the result with `store.readAll()` by `canonicalEquals` over the whole log and returns every event by value. It writes nothing.
  - Census: package tier, exported from the `./abg` barrel (`index.ts:394-397`). It is used by one test (`t287-event-body-encoding.test.mjs`) and mentioned in two design notes (`M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md`, `T289_IMMUTABLE_INSTALL_EVENT_BODIES_DESIGN.md`). Nothing under `contracts/` names it.
- Retire: delete it and its barrel export, and move the test's assertion onto the decoder it exercises. If the owner wants a verification read, name it for what it does and return a reference to the decoded history, not a copy.
- Size: S (about 45 lines).
- Risk: Public contract, because it is a named export of the `./abg` subpath and an installed consumer could import it. None was found.
- Change class: realization_refactor if the two design notes are only history; a design-note correction otherwise.
- Confidence: verified (read; grep of `contracts/`, `design/` and `scripts/`).

### E8. Milestone-named export subpaths and a ticket-named key
- Category: failed or superseded feature (residue is a name); structure
- Evidence (read):
  - `m03.ts` (6 lines) re-exports the whole `./abg` barrel plus the GTL conformance and diagnostic names from `validator/`. `m03/transport.ts` (3 lines) re-exports the worker transport contracts. `requirements.ts` (2 lines) re-exports `requirement_handoff.ts`.
  - All three are `package.json` export subpaths: `./abg/m03`, `./abg/m03/transport` and `./abg/requirements`.
  - `./abg/m03` is the published locator of the contract `abg.schema.gtl-program-conformance-input` (`scripts/generate-product-manifest.mjs:696`, `:711`) and of the contract group `abg.contract.abg.m03` (`t287-public-groups.test.mjs:17-19`). Two tests import it: `t287-gtl-language-corpus` and `t287-gtl-serialization-publication`.
  - What remains of the M03 milestone is the name (inferred: current work is RC12 and RC13), plus a mixed responsibility: an ABG subpath that publishes `validator/` names.
  - `project_read_ports.ts:555` keys a prefix computation with `Symbol("r10_historical_graph_call_sources")`, a ticket name. It is a symbol description only, and nothing reads it as a string.
  - Inside the product, `hog/*`, `validator`, `public` and `product` import the 590-line barrel (`import * as Abg from "../abg/index.js"`). A module that needs one ABG owner therefore depends on all of them.
- Retire:
  - Give the conformance input a subpath of its owner, since the names belong to `validator/`. Keep `./abg/m03` as a published alias until the owner reprices it.
  - Rename the symbol description.
  - Internal imports of the barrel: investigate. The census cannot see which barrel names each importer uses.
- Size: S for the symbol (one line); M for the subpaths (about 10 source lines, plus the generated manifest and contract-group pins).
- Risk: Public contract and manifest or digest pins, because the subpath is a published locator in the generated product manifest.
- Change class: product_reprice for the subpaths; realization_refactor for the symbol and the internal imports.
- Confidence: investigate. Whether any installed consumer resolves `./abg/m03` would settle it; the owner's published-surface list answers that.

### E9. Event Calculus: one export list, one statement of the axioms, no unused declaration field
- Category: second owner; dead code; structure
- Evidence (read):
  - Two lists of one export set. `event_calculus.ts:48-77` re-exports by name the same 27 calculus names that `calculus/index.ts` lists (census clone pair). `calculus/index.ts` is imported only by `event_calculus.ts`, and it also exports `foldStep`, `effectOf`, `emptyFoldState` and `ROOT_DERIVED_RULES`.
  - The axioms are stated twice in `calculus/axioms.ts`:
    - the table `ROOT_EVENT_CALCULUS` (`:132`, 247 lines) gives fluent names per event kind;
    - the switch `eventCalculusEffectRefs` (`:797`, 843 lines) gives fluent references with identities per kind, and falls back to the table for unlisted kinds (`:1493`).
    - Only a test checks that the switch's names agree with the table (`m5-event-calculus-runtime.test.mjs:987`, `:1003`, through `declaredRuntimeEventCalculusTerminationNames`).
  - An unused declaration form. The table's type declares `conditionalTerminates` (`:37-41`), and `declaredRuntimeEventCalculusTerminationNames` (`:1641`, 23 lines, none tier, one test) interprets it. No axiom row populates it: a grep of `abg/` finds only the type and that reader.
  - The quiescence class of each fluent lives in `replay.ts`, not here (E1).
- Retire:
  - Delete one of the two lists: `event_calculus.ts` re-exports `calculus/index.ts`, or the reverse.
  - Delete `conditionalTerminates` and its reader. The test compares the switch with `ROOT_EVENT_CALCULUS[kind].terminates` directly.
  - Investigate making the table the single statement (fluent name, identity payload key and quiescence class per fluent), from which the switch's simple cases and E1's three sets are derived.
- Size: S for the list and the field (about 60 lines retire); L for the single statement (the 843-line switch and the 247-line table).
- Risk: none for the first two, since exported content is unchanged. For the single statement: replay digests of recorded Runs if any effect changes, so it must be proven effect-identical over the recorded logs.
- Change class: realization_refactor; design_reframe for the single statement.
- Confidence: verified for the list and the field. Likely that only a test checks table and switch agreement: the 843-line switch was outlined, not read in full.

### E10. Declarations reachable only from tests, by feature
- Category: dead code; test debt
- Evidence (census tiers, then one read or grep each):
  - **Event Calculus module-test seams.** `forkRuntimeEventCalculusAtForModuleTest` and `runtimeEventCalculusStateForModuleTest` (`event_calculus.ts:303`, `:311`), and `validateRuntimeEventCalculusEffectForModuleTest` with its axiom-kinds sibling (`calculus/axioms.ts:1812`). All are none tier with one or two tests, and their names say what they are. Confirmed test-only. They are the calculus lane's seam into the production module, so retire them only together with a decision on how that lane reaches the kernel.
  - **The pure single-step fold.** `foldStep` (`calculus/fold.ts:275`, none tier, one test: `t287-calculus-fold`) and `frozenFoldState` (`:174`, used only by `foldStep`). The product folds through `RuntimeEventCalculusDerivation` (`event_calculus.ts`). Confirmed test-only. It is the pure kernel's one-step statement, which the calculus test proves against the derivation. Keep it if the owner counts it as the kernel's specification; otherwise retire it with that test.
  - **The event-store test entries.**
    - `admitRuntimeEventTransaction` (`event_store.ts:4517`, none tier, 4 tests) is a test-only transaction entry beside the production transaction path.
    - `durableRuntimeEventPrefixDigest` (`:2292`, none tier, 1 test).
    - `replay(store, scope)` (`replay.ts:578`, package tier, 108 test files) is the tests' replay entry. It reads the whole log through `store.readAll()`, which no product path does. It is not dead, but most replay lanes exercise a path the product does not take.
    - Retire: `durableRuntimeEventPrefixDigest`. Move the transaction tests onto the production transaction entry.
  - **Artifact truth.** `validateArtifactTruthCandidate` (`artifact_truth.ts:699`, none tier, 1 test). Confirmed test-only.
  - **The `conditionalTerminates` reader.** See E9.
- Refuted, with the use that refutes them:
  - The interrupted event-resource recovery set (`definition_event_resource.ts:381-483`, package tier) and its store step `recoverInterruptedEventStore` (`event_store.ts:4084`, 114 lines, 4 tests) are the published native maintenance definition `native-maintenance://abiogenesis/event-resource/recover@5`. The definition names its own package export (`:408-411`), and `T287_INTERRUPTED_EVENT_RESOURCE_RECOVERY_DESIGN.md` designs it. It has no CLI route. That is a question for the owner, not debt.
  - `ROOT_EVENT_CONTRACT_DESCRIPTOR` (`event_store.ts:1212`) is read by a script.
  - `populateRunReadAtDurablePrefix`, `ABG_RUN_READ_MEMBER_KEYS` and `AbgRunReadMemberKey` serve the operator and about ten tests, and type the Public constructor.
  - `assertAcquiredAbgEventResourceSelectionCurrent` is used by one other file.
  - `observeRuntimeHistoryWork`, `observeRuntimeHistoryBasisRetention`, `observeExecutionBasisRowWork` and `worksiteContextBodyAcquisitionsAtPrefix` are the work counters that the reuse lanes assert.
  - `runtimeFluentMatchesPattern` (`calculus/axioms.ts:1752`, package tier, 1 test) is the validating package wrapper of the owned matcher. Keep it if it is a documented package API, which was not checked.
  - `readHeldRuntimeEventsAtDurablePrefix` (`event_store.ts:2328`, package tier) is used by `continuation.ts:1580`. That consumer, `commitFhInteractionResponseAtExpectedPrefix`, is package tier with zero tests and materializes the whole held history per call. It is outside this area, so this is a pointer for the continuation reviewer.
- Retire: as stated per group.
- Size: S (about 60 lines across the confirmed groups, the seams excluded).
- Risk: none for the none-tier names. Public contract for the package-tier names.
- Change class: realization_refactor.
- Confidence: verified for tiers and test counts (census) and for each refutation (read or grep). The census cannot see a computed-key use.

### E11. Read-port layering: one member list, one port map
- Category: second owner; dead code
- Evidence (census, then read):
  - The eighteen member keys are written out as `ABG_PROJECT_READ_CASES` (`project_read_operation_contracts.ts:22`) and again as `ABG_PROJECT_READ_MEMBER_KEYS` (`project_read_ports.ts:59`, census clone pair). They are written out again implicitly by the dispatch switch `projectValue` (`:1792-1835`), the nine port constants (`:1906-1969`), `ABG_PROJECT_READ_OWNER_PORTS` (`:1971-2010`) and a second `ABG_PROJECT_READ_CONTRACTS` (`:2012-2031`).
  - That second `ABG_PROJECT_READ_CONTRACTS` is dead. No other file uses it and its own file does not either. The contract locator `exportName: "ABG_PROJECT_READ_CONTRACTS"` (`project_read_operation_contracts.ts:342`) resolves through `public/binding/owner_contract_source_set.ts:146-150`, whose `sourceModulePath` is `abg/project_read_operation_contracts.ts` and whose `contractRoot` is imported from that module. No file under `code/src`, `code/scripts`, `scripts`, `contracts` or `package.json` names `project_read_ports` as an export source. Tests import the contract table from `project_read_operation_contracts.js` (`:520`), and the barrel exports that one (`index.ts:537`). Two exports with one name and different values.
  - The nine `*ProjectionPort` interfaces in `project_read_operation_contracts.ts:541-574` are none tier. They type the nine port constants. Eight of those are used only to build `ABG_PROJECT_READ_OWNER_PORTS` and by tests (`RunProjectionPort` in 3 test files, `WorkspaceProjectionPort` in 2). `GraphCallProjectionPort` also has two production users, `abg/qualification_proof.ts:22` and `product/project_read_definition_bindings.ts:14`, and 6 test files. Each layer maps one key to the same `project(key, packet)`.
  - The constitution's export-locator table (`ABI5_REALIZATION_CONSTITUTION.md:3060-3071`) names `RunProjectionPort[memberKey]` and the other port constants as the `./abg` exports. The barrel does not export them; the published locator is `ABG_PROJECT_READ_CONTRACTS[memberKey]` (`project_read_operation_contracts.ts:342-343`). The design table is stale.
  - The read-contract builder is written twice: in `abg/project_read_operation_contracts.ts:305-345` and in `product/project_read_operation_contracts.ts:130-175`. Both have the same `operationId`, the same authority-reference formula and the same request and result schemas. They differ in the refusal set and the export name (census clone pair, 28 lines).
- Retire:
  - `ABG_PROJECT_READ_CASES` becomes the one member list, and `project_read_ports.ts` imports it.
  - `ABG_PROJECT_READ_OWNER_PORTS` is built from that list by one map.
  - The dead `ABG_PROJECT_READ_CONTRACTS` in the ports file, eight of the constants and the nine interfaces retire. `GraphCallProjectionPort`'s two production users and the tests move to `ABG_PROJECT_READ_OWNER_PORTS[key].project`.
  - One shared read-contract builder, parameterized by refusal set and export name, serves both ABG and product.
  - Correct the constitution's locator table.
- Size: M (about 120 lines; up to eleven test files move their imports).
- Risk: none for the dead export and the interfaces. For the builder: manifest or digest pins, so it must reproduce the generated contract schemas byte for byte.
- Change class: realization_refactor; the table correction is a design-note correction.
- Confidence: verified (census; imports and loader grepped; read).

### E12. Vocabularies and record shapes stated twice
- Category: second owner
- Evidence (read):
  - **Change classes.** The six values appear inline in `event_store.ts:3144` (`declaration_reprice_admitted`) and `:3181` (`defect_intake_admitted`), and again as a list in `witness_admission_operation.ts:173`. The re-entry surface and campaign values have the same split: `event_store.ts:3188-3195` and `:3307-3338` against `witness_admission_operation.ts:186-202` (census `kinds-never-read.json`). The event contract and the witness owner can drift apart.
  - **Route record.** `ReplayRouteState` (`replay.ts:195`) restates the field list of `AdmittedRoute` (`traversal_route.ts:178`) with different nullability (census clone pair, 40 normalized lines; the 11-line core was located by reading).
- Retire:
  - One exported vocabulary for change classes, re-entry surfaces and campaign decisions, owned by the witness admission owner. The event store's checks import it.
  - `ReplayRouteState` becomes a mapped type over `AdmittedRoute`, or is declared by the route owner.
- Size: S (about 40 lines).
- Risk: none (types and validation lists only; no bytes).
- Change class: realization_refactor.
- Confidence: verified for the vocabularies; likely for the route record (the 40-line census figure was not located in full).

### E13. Read-side folds repeated within one read
- Category: performance
- Evidence (read):
  - `projectRunStatus` computes `projectEndedChildFrames` twice per call: once directly and once inside `projectRunQuiescence` (`project_read_ports.ts:1061-1095`, `replay.ts:449`).
  - Whenever any frame has ended, `projectEndedChildFrames` (`replay.ts:350-374`) reads the body of every `runtime_activity_probe_observed` event of the Run.
  - Probes are emitted up to twice per producer event (`runtime_liveness.ts:84-298`).
  - `projectRunQuiescence` filters the full held projection once per fluent class (`replay.ts:281-335`, `:449-456`).
  - What scales it: producer events in the Run, times status, replay and closure reads.
  - Structural, not measured.
- Retire: E1 option (a) or (b) removes the filter altogether. Short of that, compute the ended-frame set once per prefix through `runtimePrefixComputation`, as `HISTORICAL_GRAPH_CALL_SOURCES` already does, and classify the held fluents in one pass.
- Size: S (about 20 lines).
- Risk: none (reads only; the digested body is unchanged).
- Change class: realization_refactor.
- Confidence: verified for the double call and the probe scan (read); the cost is structural.

## Named checks

1. **Dead declarations.** Confirmed, grouped by feature: E10 (calculus test seams, the single-step fold, event-store test entries, the artifact-truth validator), E7 (`persistEventLog`), E9 (`conditionalTerminates` and its reader), E11 (the second `ABG_PROJECT_READ_CONTRACTS` and the nine port interfaces). Refuted: the recovery definition, `ROOT_EVENT_CONTRACT_DESCRIPTOR`, the run-read population names, the work counters and `readHeldRuntimeEventsAtDurablePrefix`, each with its use in E10.
2. **Compiler-unused.** One entry in the area: the import of `ROOT_CURRENT_EVENT_PROFILE_REF` at `event_store.ts:42` (E2).
3. **Kinds.**
   - Handled but never produced in the area:
     - `new_abg_event_resource` and `reopen_abg_event_resource` are external input, produced by `public/installed_definition_call_transport.ts` and `product/admission_authority.ts`.
     - `no_action` (`project_read_ports.ts:1663`) is external input: a next-action disposition admitted from a C-call result and validated at `traversal_route.ts:1175`. This is likely; the producer was not traced.
   - The brief's example `c_call_open` is at `runtime_failure.ts:61`, outside this area.
   - Produced but never read (census `kinds-never-read.json`):
     - Most rows in the area are output vocabulary: projection kinds, refusal and diagnostic kinds, and liveness reason codes (`calculus/liveness.ts:793-801`). Public consumers read these; this code does not.
     - Fluent names that no reader queries by name, for example `c_call_fibre_admitted`, `c_call_result_available` and `actor_stderr_available`, are not dead: they sit inside the digested `activeFluents` (E1), and their retirement belongs to E1 option (b).
     - The change-class, re-entry and campaign values are E12.
4. **Second owners.** E1 (frame liveness: axioms against the reader filter; `childFrameKey` against `endedChildFrameKey`; quiescence sets against axioms), E3 (two row decoders), E9 (two calculus export lists; axiom table against switch), E11 (member list; read-contract builder in ABG and product), E12 (change-class vocabulary; route record).
5. **Failed, unfinished or superseded features.** E4 (`assessment_evidence` and `witness_evidence` can only refuse; seven reads have no constructor; the code itself calls the twelve `legacyBindings`), E2 (the rc4 logs' profile no longer selectable), E8 (`m03` subpaths, the `r10` key), E9 (`conditionalTerminates`), E7 (`persistEventLog`).
6. **Structure (only where it blocks consolidation).**
   - `deriveReplayPrefixFacts` (`replay.ts:939`, 574 lines) mixes event-sourced members and derived members in one body. This blocks E1 option (b).
   - `eventCalculusEffectRefs` (843 lines) blocks E9's single statement.
   - `event_contract_profiles.ts` hosts the undispatched-owner contracts (E2).
   - `LEGACY_ROOT_EVENT_CONTRACTS` (746 lines) names the base of the current table "legacy" (E2).
   - `assertRuntimeEventContract` (`event_store.ts:2795`, 549 lines) is a per-kind validator. It does not block a consolidation found here, so there is no entry.
   - `event_prefix.ts:947-1060` hosts worksite context-body acquisition inside the prefix module. It is noted, but it does not block one.
7. **Performance.**
   - Entries: E3 (measured, RC6 F2), E4 (structural, by reading), E5 (measured, RC9 F3), E6 (structural), E7 (structural), E13 (structural).
   - Considered and not entered:
     - `replayCCallRow` streams each C-call result value into the guard witness. Complete recorded witnesses are retained by the register's closures section.
     - `RuntimeEventCalculusDerivation.held()` copies and sorts the held set per call. TD-07 routed the point queries; the remaining callers need the whole set.
     - The RC8 and RC9 per-call re-fold of basis, environment and install content lies outside this area.
8. **Coverage.** See the table below. Not checked: installs under `~/Library` for further recorded logs; the bodies of `replay.ts:1514-1905` (semantic atoms, typed reference paths); the full switch in `calculus/axioms.ts`; `calculus/liveness.ts` beyond its outline and the frame-end lines; the bodies of `runtime_history.ts`, `runtime_liveness_contracts.ts`, `calculus/rules.ts`, `event_body_encoding.ts` and `exact_prefix_bindings.ts`.

## Coverage

All paths are under `code/src/abg/`. "Full" means read end to end. "Parts" means the named ranges were read and the rest outlined. "Outline" means the top-level declarations were listed with their sizes and tiers. "Census" means only the census rows were read.

| File | Lines | Read | Findings |
|---|---|---|---|
| `event_store.ts` | 4658 | parts (decode, append, reopen, read acquisition, profiles, test entries) | E2, E3, E4, E6, E10, E12 |
| `event_prefix.ts` | 1060 | parts (`:60-139`, `:1050-1060`) and outline | E4 (owned-prefix borrow); structure note |
| `event_log.ts` | 57 | full | E7 |
| `event_body_encoding.ts` | 255 | outline | none |
| `event_contract_profiles.ts` | 230 | full | E2 |
| `exact_prefix_bindings.ts` | 213 | outline | none (the six run reads' binder, E4) |
| `definition_event_resource.ts` | 483 | parts (`:268-483`) and outline | E4, E6, E10 (refuted recovery) |
| `replay.ts` | 2503 | full except `:1514-1905` | E1, E6, E10, E12, E13 |
| `runtime_history.ts` | 791 | outline (exports listed) | none |
| `event_calculus.ts` | 362 | full | E9, E10 |
| `calculus/axioms.ts` | 1893 | parts (`:30-45`, `:128-150`, `:233-238`, `:795-830`, `:983-1000`, `:1486-1500`, `:1636-1841`) and outline | E1, E9, E10 |
| `calculus/liveness.ts` | 958 | outline and a grep of frame-end rules (`:632-645`, `:775-778` read) | E1 (third frame-end statement) |
| `calculus/fold.ts` | 308 | parts (`:170-182`, `:270-282`) and outline | E10 |
| `calculus/rules.ts` | 226 | outline (two exports) | none |
| `calculus/execution_basis_record.ts` | 162 | census only | none (work counter, refuted) |
| `calculus/index.ts` | 42 | full | E9 |
| `runtime_liveness.ts` | 485 | parts (`:84-298`) | E6, E13 |
| `runtime_liveness_contracts.ts` | 328 | outline (exports listed) | none |
| `project_read_ports.ts` | 2031 | parts (`:55-214`, `:555-735`, `:960-1159`, `:1700-2031`) | E1, E4, E8, E11, E13 |
| `project_read_definition_bindings.ts` | 1044 | parts (`:870-1044`) and census | E4, E10 |
| `project_read_operation_contracts.ts` | 576 | parts (`:22-44`, `:305-345`, `:520-576`) | E11 |
| `artifact_truth.ts` | 921 | parts (`:301-380`, `:600-921`) | E5, E10 |
| `result_evidence_lineage_contracts.ts` | 51 | outline | none |
| `native_event_time.ts` | 12 | outline (one function) | none |
| `index.ts` | 590 | parts (`:380-410` and the read-port exports) and census | E7, E8 |
| `m03.ts` | 6 | full | E8 |
| `m03/transport.ts` | 3 | full | E8 |
| `requirements.ts` | 2 | full | E8 |
