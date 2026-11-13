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

## Local repair after C2 result 518454d7 (commentary, not acceptance)
Selected contribution: result eda5156e (`local_repair`). The C2 type-proof lane failed only in
case 6: the test read `ABG_HC1_BASELINE_ARCHIVE`, but the fixed C2 plan supplies
`ABI5_HC1_BASELINE_PACKAGE_PATH`. The C2 plan is unchanged.

Changed path (1): test_env/tests/t287-framework-handoff-types.test.mjs
(sha256 2cdec19a…53caa3 / 18621 B -> af2d2df1abbe12335c8541454b14772cfaa3358a9ddb991f6accdf76bee37c1e / 21109 B).
- Added `baselineArchiveBytes()`. It reads only `ABI5_HC1_BASELINE_PACKAGE_PATH` and fails the
  case when that variable is absent or empty, when lstat or read fails (the error code is
  reported), when the path is not a regular file (a symlink is refused) or when the SHA-256
  is not b775014c…1af1db. Each failure message ends "schema identity is not assumed".
- Added `extractBytes()`. It pipes the hashed bytes to `tar -xzf -`, so the path is never
  read a second time.
- Case 6 compares the 56x4 slot rows. A row is the strict JSON projection of the owner slot
  schema (`operationSchemaAssets[op,slot].$defs[member]`) plus every field of the owner
  contract identity except the runtime `schema` object: definitionKey, slot, contractId,
  contractVersion, source{sourceModuleDigest, memberDigest}, ownerAuthorityRef/Digest and
  nativeSchemaIdentity.
- Fail-closed checks on the comparison: a non-null contract with no projected schema fails;
  so does an added or removed slot or contract.
- Drift is reported as {operationId, memberKey, slot, change, fields[]}.
- Cases 1–5 are byte-unchanged and in the same order. No other path changed.
- Unchanged C2-measured digests re-checked: native-workspace-work 1f6b17f9,
  framework-handoff.compile.ts dbe62f2a, tsconfig.framework-handoff.json 208a0f14,
  owner_contract_source_set.ts 843730b7, shared/effect_definition.ts 0b5f4106.

Author self-checks. TMPDIR was this scratch tmp throughout. The node commands below are
`node --test --test-name-pattern=exact014`; this is author feedback, not C2.
- Variable absent, variable empty, only the old `ABG_HC1_BASELINE_ARCHIVE` set, a
  directory, a missing path (ENOENT), a chmod-000 file (EACCES), a symlink to the real
  archive, and package.json (hash mismatch): each fails the case with its message, exit 1.
- Declared archive as baseline and also as candidate (`ABG_FRAMEWORK_HANDOFF_PACKAGE_ARCHIVE`):
  pass, slots 224, contracts 178, familyDigestEqual true. This shows the comparison runs on
  the actual exact014 archive structure. It is not the HC1-candidate comparison, which
  needs C2's build/pack.
- Drift probe: a scratch extract of the baseline with one workspace picklist literal added,
  used as candidate (PACKAGE_ROOT). The case fails, and the report names
  workspace.create clean/imported result `projectedSchema` and the same-module siblings'
  `source`/`nativeSchemaIdentity` digests. The probe was deleted afterwards.
- Case 1 (static scan): pass. Cases 2–5 need a canonical build and were not rerun.

Compiler evidence after the repair:
- `/opt/homebrew/bin/node node_modules/typescript/bin/tsc --noEmit --incremental false -p tsconfig.json`
  (TypeScript 5.9.2): exit 0, no diagnostics. No build/ directory was created.
- `node scripts/check-import-direction.mjs`: exit 0. 28 shared modules import only
  shared/packages, and the 3 forbidden owner pairs hold.

Residual correction: shared/effect_definition.ts IS a granted conditional path ("Owner-independent
generic extraction only if necessary"). The earlier "out of grant" statement was wrong.
It is unchanged, and changing it is not demonstrably necessary for H1/H2:
- The HC1 HOW places the variant-distributed slot coupling at the Public constructor and transport.
- C2 measured that path green: canonical compile, all 17 negatives with their declared
  reasons, the strict packed consumer, and the 56/47/9 runtime inventory.
- DefinitionCall<P,Res> -> AdmittedPublicInvocation<K, OwnerRequestOf<P>> still computes
  InvocationAuthorityOf over the undistributed request. Direct owner-callable arguments
  are therefore not variant-exact. Whether H1/H2 require that remains open for UAT.

Environment-gated skip in t287-native-workspace-work (identified, not changed):
- Test: 'admitted pure consumer evaluates a native task as data without physical
  authority' (L649–788).
- Gate: `skip: !process.env.ABI5_NATIVE_WORK_RETAINED_ROOT`. The skip reason is
  "requires the retained installed consumer first-leaf failure". Inside the test,
  ABI5_NATIVE_WORK_CHECK_CHILD and ABI5_NATIVE_WORK_OWNER_PROOF_PATH are optional sub-gates.
- The gate is pre-existing at HEAD 5331 (L606–608) and was introduced in ad2a39f40/a0829a298.
- It replays a retained installed run, imports build/ and checks the pure F_D consumer
  receipt, the child selection and successor report ownership.
- It calls neither fixture() nor prepare(), protected-root checks, the instruction
  assembly producer nor any 014 control. The protected-root case (L346) and every
  prepare()-based 014 control are ungated.

Readiness after the repair: readiness.py (r1 inputs) FILE_ONLY_READY, 12/12 source hashes
matched, 0 issues, 1260 entries (bytes vary with these scratch notes). The earlier run counted 1291 entries because
the earlier probe files were then still in tmp. Disposable tmp/node-compile-cache was
cleared and tmp is empty.
