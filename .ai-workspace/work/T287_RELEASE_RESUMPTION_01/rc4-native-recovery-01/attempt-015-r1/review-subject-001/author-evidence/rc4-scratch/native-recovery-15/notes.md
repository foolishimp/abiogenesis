# native-recovery-15 HC1 Writer notes (commentary, not acceptance)

Basis: STDO 3.0.2 (`stdo://releases/v3.0.2/`, manifest f7f3f824…4477) as bound by the
grant; frame ABI5_PROJECT_REFERENCE_FRAME_BASIS. Writer activation, change class
`realization_refactor`, source 5331e3ae7 (inherits 6027/native014). No Skill tool was
invoked in the continued segment; authority surfaces were read directly.

## Changed scope (13 grant paths)
- public/binding/owner_contract_source_set.ts: type-only family derived from
  OWNER_CONTRACT_MODULE_SOURCES rows -> contract-root leaves -> package-export binding
  leaf. Exports OwnerDefinitionMember (56), OwnerCallableDefinitionMember (47),
  OwnerUnavailableDefinitionMember (9, `installed_binding_unavailable`),
  OwnerDefinitionMemberOf, OwnerDefinitionCompositeKey, OwnerDefinitionRequestOf
  (sibling-variant keys `?: never`). A present leaf that is not an exact callable for
  its own key becomes `never` (no reclassification).
- public/installed_public_definition_call.ts: Selection = callable member x
  slot-relevant request variant (split only where a variant changes the required slot
  set: start target, verify targetKind, continue current/pending) with
  `InvocationAuthoritySlotsOf<K,R>` and the member's callable resources (52 rows).
  Generic constructor `<S extends Selection>(Environment & S): InstalledPublicDefinitionCall<S>`;
  runtime body unchanged except the typed return.
- public/installed_definition_call_transport.ts: generic Result/Outcome (defaults =
  raw); OutcomeOf<C> (callable -> exact DefinitionHostReceipt<packet, receipt>;
  unavailable -> refusal only; raw -> raw); CandidateCheck<C>. Exported functions are
  thin typed wrappers returning the unchanged async bodies' promise.
- public/index.ts: exports of the above.
- product/invocation.ts: ExactStart/DirectRunInvocationRequest derived from
  RUN_OPERATION_CONTRACTS (names kept).
- product/run_operation_contracts.ts: continueContract keeps `<const TMember>`; per-member
  variant factories + indexed annotations (exact request/result/nonterminal per member).
- abg/project_read_definition_bindings.ts: generic per-packet read callables; exact
  non-Partial legacy binding record (ABG reads 18 now exact callable members).
- abg/witness_operation_contracts.ts: per-act subjectKind/context domain record.
- abg/project_read_operation_contracts.ts: literal kind / own additional fields /
  terminal-vs-replay refusal codes preserved per member.
- test_env/tests/t287-native-workspace-work.test.mjs: prepare() links the actual
  abg/instruction_assembly producer (controlled owned-basis premise keyed by exact basis
  object; role premise: assessor role, no constructor role); p.request = assembly.request
  (11 fields + presentation for assessment); callbacks return the actual assembly;
  malformed-presentation controls mutate the complete actual request in the actual assembly.
- new: test_env/types/framework-handoff.compile.ts, test_env/tsconfig.framework-handoff.json,
  test_env/tests/t287-framework-handoff-types.test.mjs (6 cases).

## Compiler evidence
- Official `/opt/homebrew/bin/node node_modules/typescript/bin/tsc --noEmit --incremental false -p tsconfig.json`: exit 0, no diagnostics (final source).
- scripts/check-import-direction.mjs: pass.
- Author feedback only (in-memory, no emit to disk): declaration emit of the tenant with
  stripInternal 290 .d.ts / 0 diagnostics; proof compiled against that virtual package
  layout with the proof tsconfig: 0 diagnostics, 214 package declarations, 0 tenant
  sources; markers stripped: 17/17 negatives fail on their own line with declared codes
  (2322/2345/2367), 0 stray diagnostics.

## Runtime identity (author feedback, in-memory transpile, HEAD vs working tree)
509 digest lines identical: 56 x {request,result,refusal,nonTerminal projected schema,
contracts, metadata, memberDigest, owner+contractIds, sourceModuleDigest};
family sha256:ef6171b873561b47a87ede12c392c704531804817e2d37705e3f7f4000313132
operationProjections sha256:077a916aef187bde64936fc6756456dca3bee0d02bfb498898c10727ae807673
payloads sha256:c90311e824dfb24695d8f4a6fd23494cec51ade68702d07f71c2000fa23a606f
operationSchemas sha256:48054b0521101fb750443503ce66256cbfea2bdfd585e3010934b63057116949
(`cmp` of the two 509-line dumps: identical.)

## Runtime runs against in-memory source (author feedback; TMPDIR in scratch)
- t287-native-workspace-work: 42 pass, 0 fail, 1 pre-existing env skip
  (ABI5_NATIVE_WORK_RETAINED_ROOT); 014 protected-roots case passes incl. via-port positives.
- t287-framework-handoff-types: static-scan case pass; runtime inventory case pass with
  ABG_FRAMEWORK_HANDOFF_PACKAGE_ROOT=tenant (56/47/9; attest -> installed_binding_unavailable;
  unknown_definition; invalid_definition_call; acquisition_mismatch).
- t287-w2-05-static-binding-algebra: 3 pass, 2 env skips.
- witness-reprice-definition-binding: 13 pass, 2 fail only where a fresh subprocess cannot
  see in-memory source (ERR_MODULE_NOT_FOUND build/...). selected-action,
  required-operation-bindings, cross-cut-public-read need a real build.
- Not run: canonical/packed compile, negative-reason, packed runtime and exact014 baseline
  cases (need C2 build/pack; baseline archive not loaded by the Writer).

## Readiness
readiness.py (r1 inputs): FILE_ONLY_READY, 12/12 source hashes matched, 0 issues.
