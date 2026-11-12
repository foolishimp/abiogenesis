# TD-28E Return: the forward declaration key is refused

Writer: Claude Opus 5.5. Branch `claude/td28e-forward-key-refused` from local
`main` at `b3bcb1303`, worktree `/private/tmp/abg-td28e`. Follow-up to TD-28d
(ruling R2). Change class: realization_refactor (a retired shape refused, not
ignored; no specification or design text names it). No push, no tag.

**Status: in progress (census and recorded history committed).**

`T` = `build_tenants/abiogenesis/typescript`. Scratch, probes and TAP output:
`/private/tmp/abg-td28e-work/`.

## 1. Census

Line numbers are at `b3bcb1303`. Searches: `abg.worksite_command_forward`,
`worksite_command_forward`, `command-forward`, `REFUSED_PROGRAM_POLICIES`,
`namesRefusedPolicy`, `runEnvironmentForProgram`,
`selectorRoleFromBoundDeclarations`, `validRunEnvironmentProgram`,
`validRunEnvironmentPublication`, `abg.governed_context` over
`specification/`, `T/design` (not `history/`), `T/code/src`, `T/scripts`,
`T/test_env` (without `test_runs`, `downstream`, `evidence`) and
`T/package.json`.

### 1.1 The key

`abg.worksite_command_forward` is named nowhere in `T` or `specification/` at
base. The forward module (`gtl/worksite_command_forward.ts`, deleted by TD-28d)
set it on both of its GraphFunctions with the value
`dependency://abiogenesis/worksite/command-forward/historical-owners@5`
(`WORKSITE_COMMAND_FORWARD_IDS.historyDependencyRef`). Until TD-28d,
`product/declaration_closure.ts` (`5c9df5056`, `:606-615`) refused any
GraphFunction that declared it outside the exact forward Program (`wrong_owner`,
"forward C2 must retain its exact finite no-construction Program and
historical-proof marker"). That arm left with the module; no owner reads the
key at base.

### 1.2 Specification and design

- `specification/`: no file names the key, the forward module or the
  refused-key owner. No edit.
- Kept design notes (`T/design/*.md`): none names the key or the list of
  refused keys. `T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN.md`,
  `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:684`,
  `M03_INSTRUCTION_ASSEMBLY_DERIVATION.md:68` and
  `T287_DECLARED_TESTING_CAPABILITY_DESIGN.md:84` cite
  `gtl/stdo_run_environment.ts` for role and selector lookup, not for refused
  keys. No edit.
- `design/history/`: the moved forward note and its retired sections name the
  forward module (retired text; not edited).
- `ABI5_REALIZATION_CONSTITUTION.md`: no passage names the key.

### 1.3 Source (`T/code/src`)

The owner of refused keys, `gtl/stdo_run_environment.ts`:

| Lines | Symbol | Role |
| --- | --- | --- |
| 29 | `STDO_ENVIRONMENT_POLICY` | the TD-31 retired policy key, exported |
| 30-33 | `REFUSED_PROGRAM_POLICIES`, `namesRefusedPolicy(program)` | the three refused Program policy keys; reads `program.policies` only |
| 168-174 | `runEnvironmentForProgram(publication, program)` | `false` for a Program that names a refused key |
| 176-188 | `selectorRoleFromBoundDeclarations` (via `framedSynthesisNativeRole`, 210-218) | `false` for the same Program |
| 219-223 | `validRunEnvironmentPublication(publication)` | every Program of the publication through `runEnvironmentForProgram` |
| 224-234 | `validRunEnvironmentProgram(publication, program, graphFunctions)` | `runEnvironmentForProgram`, then role coverage over the Program's callable GraphFunctions (`:229`) |

Callers, and the door each serves:

| Caller | Door |
| --- | --- |
| `validator/validation.ts:178` (`validatePublishedDeclarations`, from `validatePublicationSubject:629`) | publication validation; `catalog.admit` (`product/catalog_operations.ts:291`, `constructReadyCatalog`) |
| `validator/validation.ts:747` (`validateProgram`) | conformance evaluation (`validator/conformance_operation.ts:302`); Product resolution (`product/execution_resolution.ts:773`); qualification (`validator/qualification.ts:308`) |
| `product/stdo_environment.ts:165,170` (`observeRunEnvironment`) | run-environment observation; the Run door's preparation (`product/run_invocation_operation.ts:807-815`) |
| `abg/stdo_environment.ts:162,171,207` (`runEnvironmentEvidenceMatchesInvocation`, `projectRunEnvironmentRoleEvidence`, `…AtPrefix`) | reads of recorded invocation evidence and role evidence |
| `hog/ccall_lifecycle.ts:481` | whether a C-call needs native instruction assembly |
| `abg/c_call_outcome.ts:1255`, `abg/instruction_assembly.ts:290,429,436` (`framedSynthesisNativeRole`) | framed-synthesis selector role at a locus |

The Run door: `prepareProductRunInvocation`
(`product/run_invocation_operation.ts:606`) calls
`ProductExecutionResolutionPort.resolve` (`:660`); a resolution refusal at
stage `declaration_closure` maps to `invalid_program` (`resolutionRefusalCode`,
`:283-291`); the observation's `unsupported_declaration` maps to
`invalid_program` (`:815`).

Module admission (`gtl/m02` `admitModule`, `validator/raw_admission.ts`) is
structural: GraphFunction `declarations` is a string record, and no key is read
by name there.

### 1.4 Scripts, package metadata, tests

- `T/scripts`, `T/package.json`: nothing names the key or the owner.
- Tests that name `REFUSED_PROGRAM_POLICIES`, `namesRefusedPolicy` or
  `runEnvironmentForProgram`: `t292-td28c-governed-context-policy`,
  `t292-td31-stdo-run-environment-shape`, `t287-c2-core-environment`.
- The refusal lane `t292-td28d-command-forward-refused` names the forward
  value kinds and coordinates, not the key.
- `T/test_env/proof`, `T/test_env/fixtures`: no file carries the key.
- Qualification mirrors (`test_env/qualification/inventory.json`,
  `recipe/verification-recipe.json`, `recipe/expected-output-inventory.json`):
  they name the forward files deleted by TD-28d, not the key. Not edited.

## 2. Recorded history

`rg -uu -l -g '*.json' -g '*.jsonl' -F 'abg.worksite_command_forward'` over the
evidence root `/Users/jim/src/apps/abiogenesis/.ai-workspace` (no size cap,
28.6 s): **1,496 files** (635 `*.jsonl`; list `hist-key-files.txt`).

- Every recorded value of the key is the forward module's own:
  13,424 occurrences of
  `"abg.worksite_command_forward":"dependency://abiogenesis/worksite/command-forward/historical-owners@5"`
  (escaped forms included), no other value (`hist-key-values.txt`).
- Owner: 6,338 of those occurrences have the owning GraphFunction's `name`
  within a bounded window on the same line; all are
  `graph-function://abiogenesis/worksite/command-forward@5` (3,169) or
  `…/command-forward/execute@5` (3,169) (`hist-key-owners.txt`). No recorded
  GraphFunction outside the forward module carries the key.
- The files are recorded forward module publications inside Catalogs,
  readiness bases, Public request packets and their results: by name, 93
  `lifecycle-start.request.jsonl`, 80 `after-run-resume.json`, 70
  `prepared-call.json`, 68 `execution.json`, 61 `call-N.jsonl`, 37
  `intake-start.jsonl`, 31 `publication-inputs.json`, 29
  `program-conformance.request.jsonl`, 28 `catalog-admit.request.jsonl`, 27
  `setup-catalog.jsonl`, 11 `runtime.events.jsonl`, and others.
- `T/test_env/proof` and `T/test_env/fixtures`: none.

Evidence-gated inputs (`test_env/support/evidence-gates.json`) that carry the
forward module (`command-forward@5` or `worksite_command_forward`), with the
lanes that read them; each runs on base and final (section 9):

| Evidence gate | Status | Lane |
| --- | --- | --- |
| `s7-pending-consumer-intent` | `runs_with_root` | `t287-continuation-causation` |
| `single-address-space-native-02` | `runs_with_root` | `t287-single-address-space-consolidation` |
| `owned-proof-declaration` | `runs_with_root` | `t287-native-runtime-gate` |
| `producer-acquisition-reuse` | `runs_with_root` | `t287-qualification-producer-acquisition-reuse` |
| `governance-covered-fixture`, `-completed-work` | `runs_with_root` | `t287-governance-covered-source-use` |
| `stdo-proof-entry-run-nine` | `runs_with_root` | `t287-stdo-proof-entry` |
| `owner-history-logical-digest` | `failing_with_input_present` | `t288-logical-prefix-digest` |

`steel03-retained-call` (`w2-steel-single-start-closure`, the TD-27 case) does
not carry the forward module: its readiness basis holds five publications from
September 11 (`order-summary.example/single-start`, C2, consensus,
construction, `conformance/hello-world`).
