# TD-79 Return: the CLI exits 70, not 2, for a failure after it submits the call

Writer: Claude Fable 5.2. Branch `claude/td79-cli-exit-after-owner` from local
`main` at `42eabe9e8`, worktree `/private/tmp/abg-td79` (sparse). Change class:
requirement_reprice of one clause of `REQ-P-POLICY-022`, then a source change
in `public/cli.ts` (register entry TD-79). No push, no tag.
T = `build_tenants/abiogenesis/typescript`. Scratch: `/private/tmp/abg-td79-work/`.
Line numbers are at `42eabe9e8` unless marked "now".

**Status: census only (this skeleton). The sections after the census are
filled when the work is done.**

"Owner entry" below means the call `selected.callable(call)` at
`public/installed_definition_call_transport.ts:489`: the transport invokes the
selected installed callable, and from that point the owning function runs.
"Submitted" means the CLI has passed the call to
`runInstalledDefinitionCallTransport` (`public/cli.ts:120`).

## 1. Census

### 1.1 Every path on which the CLI sets an exit status

`public/cli.ts` (143 lines) at `42eabe9e8`.

| # | Path | Lines | Line written | Status at base | Can an owning function have been entered before it? |
| --- | --- | --- | --- | ---: | --- |
| C1 | the arguments are not `--jsonl <file>` | `:82-87` | `invalid_arguments` | 2 | No. The CLI reads no file and calls no transport. |
| C2 | reading the request file throws (missing file, a directory, no permission) | `:90`, caught at `:135-140` | `transport_failure` | 2 | No. |
| C3 | the file does not hold exactly one non-blank line | `:93-98` | `invalid_transport_request` | 2 | No. |
| C4 | the line is not JSON | `:101-109` | `invalid_json` | 2 | No. |
| C5 | the value is not one exact CLI transport request (`parseTransportRequest`, `:36-65`); a throw from `validateEventStoreCloseHandoff` at `:62` is caught at `:135-140` | `:110-118` | `invalid_transport_request` (`transport_failure` for a throw) | 2 | No. |
| C6 | the transport returns its typed refusal | `:120-131` | the transport refusal | 2 | No. Every refusal arm reachable from the CLI precedes owner entry (table 1.2). |
| C7 | the transport returns its result | `:128-132` | the transport result | the receipt's `exitCode`: 0, 1, 3 or 70 | Yes. |
| C8 | the transport throws | `:120-125`, caught at `:135-140` | `transport_failure` | 2 | Not on any path found: the one throw found starts in the transport's call admission, before owner entry, and no throw after owner entry escapes the transport (table 1.2). Ruling 3 gives this path 70 wherever the throw starts. |
| C9 | the outcome is not one I-JSON value | `:126-127`, caught at `:135-140` | `transport_failure` | 2 | Yes. A transport refusal is built from fixed strings (`refusal`, transport `:193-204`; every message on the CLI path is a literal) and is always I-JSON, so an outcome that fails admission is a result, and a result follows owner entry (`:487-490`). |
| C10 | writing the line throws | `:128`, caught at `:135-140` | `transport_failure` | 2 | Yes when the line is a result. No synchronous throw was found: `canonicalJson` of an admitted value does not throw, and `process.stdout.write` reports a stream error as an event. |

C1 to C6 are the cases the requirement gives 2, and no owning function is
entered on any of them. C8 to C10 follow submission; C9 and C10 can follow
owner entry. At base all three exit 2.

### 1.2 Every point at which `runInstalledDefinitionCallTransport` refuses or throws

`public/installed_definition_call_transport.ts` (517 lines). The CLI path is
`runInstalledDefinitionCallTransport` (`:368-375`) →
`transportInstalledDefinitionCall` (`:377-422`) →
`invokeInstalledDefinitionCall` (`:481-517`) → `selectedCallable`
(`:240-300`). Owner entry is `:489`.

| Point | Lines | Outcome | Before owner entry? |
| --- | --- | --- | --- |
| the acquisition or candidate cannot be detached (`structuredClone`, `detachDefinitionCall`) | `:382-398` | refusal `invalid_definition_call` | Yes |
| the detached acquisition is not eventless, new or reopen | `:403-408` | refusal `acquisition_mismatch` | Yes |
| the detached candidate is not a DefinitionCall | `:409-414` | refusal `invalid_definition_call` | Yes |
| the acquisition differs from the call's event resource | `:415-420` | refusal `acquisition_mismatch` | Yes |
| no exact owner contract source, or more than one | `:252-257` | refusal `unknown_definition` or `invalid_definition_call` | Yes |
| the call differs from its installed invocation contract | `:261-267` | refusal `invalid_definition_call` | Yes |
| the bound module, export, member or callable is unavailable | `:269-274`, `:278-283`, `:286-291`, `:296-299` | refusal `installed_binding_unavailable` | Yes |
| **owner entry** | `:489` | | |
| an acquired call whose receipt shows a call-admission fault | `:502-510` | refusal `invalid_definition_call` | No, it follows owner entry. It requires `acquisitionKind === "acquired"`. On the CLI path `acquisitionKind` is `detachedAcquisition.kind` (`:421`), which `isInstalledDefinitionCallAcquisition` (`:138-157`) limits to `eventless`, `new` and `reopen`. `"acquired"` is passed only by `runInstalledDefinitionCallWithResource` (`:460`, `:478`), which `cli.ts` does not import (`cli.ts:12-14`). The arm is unreachable from the CLI. |
| the receipt | `:511-516` | result | No, it follows owner entry |
| throw: the predicates over the detached plain data | `:403`, `:409`, `:415` | no throw found; `sameStructure` catches (`:208-218`) | — |
| throw: the call admission in `selectedCallable` | `:262` → `admitExactDefinitionCall` (`public/binding/definition_binding_mechanics.ts:433-535`) → `admitRuntimeContract` (`shared/public_function_contracts.ts:686-703`: `v.safeParse` with no `admitJson` gate and no catch) and `sha256Canonical` (`definition_binding_mechanics.ts:477-490`) | throws. A request whose JSON-valued member nests about 2,000 arrays overflows the stack in the request schema (`jsonValueSchema`, `public_function_contracts.ts:198-206`, recursive). Traced: the `RangeError` stack ends `admitRuntimeContract` ← `admitExactDefinitionCall` ← `selectedCallable` ← `invokeInstalledDefinitionCall` ← `transportInstalledDefinitionCall` ← `runInstalledDefinitionCallTransport`. | Yes |
| throw: the synchronous part of the selected callable | `:489` | none found. `bindStaticOwner`'s callable (`public/binding/static_definition_bindings.ts:113-175`) repeats `admitExactDefinitionCall` on the same call, admits resources with `admitContract` (which catches, `shared/admit/contract.ts:17-40`) and defers the owner with `Effect.suspend`; `withAdmissionAuthority` (`product/admission_authority.ts:518`) returns `Effect.suspend` at once. | after |
| throw: `runExactDefinition` | `shared/effect_definition.ts:110-162` | none found. `runPromiseExit` resolves an `Exit` for every typed failure, defect and interruption, and both arms build a receipt. | after |
| throw: reading the receipt | `:496-516` | none | after |

Every typed refusal arm reachable from the CLI precedes owner entry, so ruling
2 does not stop. The one arm after owner entry (`:502-510`) is not reachable
from the CLI.

### 1.3 Where a submitted call's outcome can fail I-JSON

The receipt carries the owner output, the resource receipt and, on failure,
the fault and `Cause.pretty`. The owner output is checked by Valibot alone
(`validatedOwnerOutput`, `definition_binding_mechanics.ts:91-120`, through
`admitRuntimeContract`), and `jsonValueSchema` admits values that `admitJson`
(`shared/admit/json.ts:332-334`) refuses: a lone surrogate, an unsafe integer,
and nesting past `admitJson`'s bound of 512. `bindStaticOwner` admits resources
and the resource receipt through `admitContract`, which applies `admitJson`
first. `withAdmissionAuthority` parses `resources.admissionAuthority` with
`v.parse` (`admission_authority.ts:525`); its catch (`:515-517`) makes the
fault message `String(cause)`, and Valibot's message quotes a received string
as it is. So a caller string with a lone surrogate in `admissionAuthority`
reaches the receipt after the owner is entered, and the CLI cannot encode the
outcome. The lane's encoding row uses this route.

### 1.4 Readers of the CLI's exit status (ruling 7)

Searched: `T/test_env/tests`, `T/test_env/support`, `T/test_env/uat`,
`T/test_env/falsifiers`, `T/scripts`, `T/code/src` and `T/design/*.md`, for the
CLI's path (`public/cli.js`, `abg.cli`, `cliPath`) and for the CLI's codes
(`public_transport_refusal`, `invalid_arguments`, `invalid_transport_request`,
`invalid_json`); `transport_failure` elsewhere is the worker transport's
failure class and is unrelated. `code/src` and `scripts` spawn no CLI.

| Reader | What it reads | Path it drives | Relies on 2 for a path that moves? |
| --- | --- | --- | --- |
| `test_env/support/registered-graph-selection.mjs:415-455` `runInstalledCliRequest` (16 test files import it) | asserts the process status equals `expectedExitCode` (default 0) | owner calls; callers pass 0, 3 (`t287-required-operation-bindings:222-223`) or `null` | No |
| `test_env/tests/t287-st1-installed-cross-owner-hello.test.mjs:62-97` (own copy) and `:1794` | asserts the process status; `:1794` expects 2 | a crossed top-level handoff: transport refusal `acquisition_mismatch` (C6) | No: C6 stays 2 |
| `test_env/support/t287-generic-job-readback.mjs:40` | `execFile` rejects on a nonzero status | reads that must exit 0 | No |
| `test_env/tests/t287-default-library.test.mjs:1997-1998` | imports `cli.js` in process and saves `process.exitCode` as `unexpected-completion.json` | a Run that the hook kills before completion; the file exists only if the CLI returns | No |
| `test_env/support/t287-selected-action-host.mjs:107-108` | the same, `unexpected-public-completion.json` | the same | No |
| `test_env/uat/runner.mjs:253-261` | records `execution.exitCode` in the call record; requires a transport result | owner calls | No |
| `cliCall` in `test_env/tests/steel-basic-cli-public.test.mjs:209`, `steel-consumer-declaration.test.mjs:171`, `w2-steel-single-start-installed.test.mjs:171`, `w2-steel-serial-branch-installed.test.mjs:171`, `d2-frame-installed.mjs:171` | ignore the status, or record `error.code` as a diagnostic file | owner calls and transport refusals | No |
| `test_env/uat/continuation.mjs:402`, `test_env/uat/harness.test.mjs:593`, `:789`, `:1011` | the launch arguments only | — | No |
| `test_env/tests/m5-installed-portability.test.mjs:427-433` | the `bin` entry only | — | No |

No reader relies on 2 for C8, C9 or C10, so no reader changes.

### 1.5 Text that states the meaning of exit 2

| Text | Says | Change |
| --- | --- | --- |
| `specification/requirements/product/REQ-P-POLICY.md:165-172` (`REQ-P-POLICY-022`) | `2` when "reading the file, carrying the call or encoding its outcome fails" | restated (section 3) |
| `T/design/M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md:2248-2253` | the CLI exits "`2` on a transport refusal, a request it cannot read, decode or submit, or an outcome it cannot encode" | restated (section 4) |
| `T/design/M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md:2149-2152` | transport refusals exit 2 | none: still true |
| `T/design/M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:2145-2148` | transport refusals exit 2 | none: still true |
| `T/design/ABI5_REALIZATION_CONSTITUTION.md:1629-1630` | "an unexpected transport or adapter failure belongs to adapter exit `70`" | not edited; the change brings the CLI in line with it |
| `T/design/ABI5_REALIZATION_CONSTITUTION.md:2494`, `:2827-2828`, `:3000` | the one runner maps an execution fault or `Cause` to exit 70 | not edited; the CLI's own 70 maps no `Exit` or `Cause` and builds no receipt |

### 1.6 Qualification mirrors

`T/test_env/qualification/recipe/expected-output-inventory.json:510` pins the
digest and byte count of `build/code/src/public/cli.js`, and
`T/test_env/qualification/recipe/verification-recipe.json:946-947` names
`code/src/public/cli.ts`. Not edited (rule 8); listed in section 7.
