# TD-79 Return: the CLI exits 70, not 2, for a failure after it submits the call

Writer: Claude Opus 5.5 (the commit trailers carry the lines the brief
gave, which name Claude Fable 5.2). Branch `claude/td79-cli-exit-after-owner` from local
`main` at `42eabe9e8`, worktree `/private/tmp/abg-td79` (sparse). Change class:
requirement_reprice of one clause of `REQ-P-POLICY-022`, then a source change
in `public/cli.ts` (register entry TD-79). No push, no tag.
T = `build_tenants/abiogenesis/typescript`. Scratch: `/private/tmp/abg-td79-work/`.
Line numbers are at `42eabe9e8` unless marked "now".

**Status: Done, no stop, nothing open for a ruling. The CLI exits 2 only when
no owning function is entered: wrong arguments, a request it cannot read or
decode, and the transport's typed refusal. A throw out of the transport and an
outcome it cannot encode exit 70; the CLI catches them in a second `try` block
that begins once the call is submitted, and the transport is unchanged. Every
typed refusal arm reachable from the CLI precedes owner entry.
`REQ-P-POLICY-022`'s status clause is restated in its own commit. R1 is ruled
and applied (section 16): a request file the CLI cannot read or decode writes
`invalid_transport_request` with 2, and `transport_failure` is written only
with 70, after the call is submitted. The lane drives the built CLI as a
process and produces both 70 paths from outside the process with no Product
seam: 13/13 on the final build; 9/13 on the build before R1 (the two
read-failure rows, the code assertion and the parent test fail). No reader outside the lane
reads the CLI's `transport_failure`, and no reader relies on 2 for a moved
path.**

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
| C2 | reading the request file throws (missing file, a directory, no permission) | `:90`, caught at `:135-140` | `transport_failure` at base; `invalid_transport_request` after R1 | 2 | No. |
| C3 | the file does not hold exactly one non-blank line | `:93-98` | `invalid_transport_request` | 2 | No. |
| C4 | the line is not JSON | `:101-109` | `invalid_json` | 2 | No. |
| C5 | the value is not one exact CLI transport request (`parseTransportRequest`, `:36-65`); a throw from `validateEventStoreCloseHandoff` at `:62` is caught at `:135-140` | `:110-118` | `invalid_transport_request`; for a throw, `transport_failure` at base and `invalid_transport_request` after R1 | 2 | No. |
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
| `test_env/support/registered-graph-selection.mjs:415-455` `runInstalledCliRequest`, called by 16 test files (`t287-default-library`, `-default-library-reviews`, `-exact-construction-intent`, `-exact-prefix-projection-reuse`, `-readable-stops`, `-readable-stops-foldback`, `-recursive-failure-foldback`, `-recursive-registered-selection`, `-registered-graph-selection`, `-required-operation-bindings`, `-rp2-behavior-carriers`, `-rp2-correction-carriers`, `-rp2-fibre-substitution`, `-selected-action`, `-st1-installed-cross-owner-hello`, `t292-td26-ps-default-root-mode`) and through three support modules by 6 more (`amendment-witness-run.mjs`: `t287-amendment-witness`, `t287-default-library-recoverable-failure`; `installed-language-test.mjs`: `installed-language-smoke`, `m5-installed-graph-edge`, `t287-single-address-space-consolidation`; `t287-s03-automatic.mjs`: `t287-s03-automatic`). `t287-held-basis-lifetime`, `-held-operation-bodies`, `-held-owner-fold-reuse` and `-owned-call-reference` import the module but never call the CLI. | asserts the process status equals `expectedExitCode` (default 0) | owner calls; callers pass 0, 3 (`t287-required-operation-bindings:222-223`) or `null` | No |
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

## 2. Exit status before and after

"Now" lines are in `public/cli.ts` at `4acd827a4` (159 lines). The CLI has two
`try` blocks. The first (`:93-131`) reads and decodes the request file; no
owning function can be entered inside it. The second (`:136-158`) starts only
when the first produced a request; it submits the call, encodes the outcome
and writes it. "Line written" is the final code.

| # | Path | Lines now | Line written | Base | Final | Owner entered before it? |
| --- | --- | --- | --- | ---: | ---: | --- |
| C1 | the arguments are not `--jsonl <file>` | `:82-87` | `invalid_arguments` | 2 | 2 | No |
| C2 | reading the request file throws | `:94`, caught at `:123-131` | `invalid_transport_request`, the error text as message (R1) | 2 | 2 | No |
| C3 | the file does not hold exactly one non-blank line | `:97-102` | `invalid_transport_request` | 2 | 2 | No |
| C4 | the line is not JSON | `:104-113` | `invalid_json` | 2 | 2 | No |
| C5 | the value is not one exact CLI transport request; a throw from `parseTransportRequest` | `:114-121`, a throw caught at `:123-131` | `invalid_transport_request`; for a throw, with the error text as message (R1) | 2 | 2 | No |
| C6 | the transport returns its typed refusal | `:138-150` | the transport refusal | 2 | 2 | No (table 1.2) |
| C7 | the transport returns its result | `:138-150` | the transport result | receipt `exitCode` (0, 1, 3, 70) | the same | Yes |
| C8 | the transport throws | `:138`, caught at `:151-157` | `transport_failure` | 2 | **70** | Not on any path found; 70 wherever the throw starts (ruling 3) |
| C9 | the outcome is not one I-JSON value | `:144-145`, caught at `:151-157` | `transport_failure` | 2 | **70** | Yes |
| C10 | writing the line throws | `:146`, caught at `:151-157` | `transport_failure` | 2 | **70** | Yes when the line is a result; no synchronous throw found |

The split is by where the failure is caught (ruling 3). No message text is
matched, and the transport is unchanged: no field, error class or return arm.

## 3. The requirement clause

Commit `be6e38d87` changes only the status clause of `REQ-P-POLICY-022`
(`specification/requirements/product/REQ-P-POLICY.md:165-176` now).

Before:

> `2` when the CLI's arguments do not name one request file, the file does not
> hold one exact transport request, the transport refuses the call, or reading
> the file, carrying the call or encoding its outcome fails; `3` when the
> owning semantic function returns a non-terminal outcome, which only an
> operation that declares a non-terminal contract can return; and `70` when
> the operation's execution fails with a typed execution fault, including an
> owner output that its contract does not admit, or with a defect or
> interruption.

After:

> `2` when no owning semantic function is entered because the CLI's arguments
> do not name one request file, reading the file fails, the file does not hold
> one exact transport request, or the transport refuses the call; `3` when the
> owning semantic function returns a non-terminal outcome, which only an
> operation that declares a non-terminal contract can return; and `70` when
> the operation's execution fails with a typed execution fault, including an
> owner output that its contract does not admit, or with a defect or
> interruption, and when carrying a submitted call or encoding its outcome
> fails, whether or not an owning semantic function has been entered.

The `0`, `1` and `3` members and the rest of the requirement are unchanged.
The qualification mirror `contracts/qualification/sources/REQ-P-POLICY.md` is
not restaged here; the Executive restages it at merge.

## 4. The design sentence

Commit `62eddb9da` restates one sentence of
`T/design/M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md`
(`:2248-2256` now).

Before: "... exits with the host receipt's `exitCode` (`runExactDefinition` in
`shared/effect_definition.ts`), or `2` on a transport refusal, a request it
cannot read, decode or submit, or an outcome it cannot encode
(`public/cli.ts`)."

After: "... exits with the host receipt's `exitCode` (`runExactDefinition` in
`shared/effect_definition.ts`). It exits `2` for a request it cannot read or
decode and for a transport refusal, before any owning function is entered, and
`70` for a throw out of `runInstalledDefinitionCallTransport` or an outcome it
cannot encode, which `public/cli.ts` catches in a second `try` block that
begins once the call is submitted."

The other sentences of table 1.5 stay true and are not edited.

## 5. The code

Commit `0535c1628` (+36 −23) splits the block, and commit `4acd827a4` (+7 −3)
changes the first block's code (section 16); both touch `public/cli.ts` only.
The base had one `try` around reading, decoding, submitting, encoding and
writing, and its one `catch` set 2. The final source (lines at `4acd827a4`):

- declares `request` (`:92`) before the first `try`;
- the first `try` (`:93-122`) reads and decodes the file and sets `request`
  (`:114`); its `catch` (`:123-131`) writes `invalid_transport_request` with
  the error text as its message and sets 2;
- the second block (`:136-158`) runs only when `request` is not null. It calls
  `runInstalledDefinitionCallTransport` (`:138`), admits the outcome with
  `admitJson` (`:144`), writes it and sets 2 for the transport's typed refusal
  or the receipt's `exitCode` (`:147-150`). Its `catch` (`:151-157`) writes
  the `transport_failure` line and sets 70. No other path writes
  `transport_failure`.

Three comments (`:89-91`, `:124-125`, `:132-135`) state the rule each block
keeps and what the first `catch` means.

## 6. What the kept line claims on the 70 path (ruling 4)

The Product's only execution-failure shape is the host receipt
(`definition_host_receipt`, built by `runExactDefinition`,
`shared/effect_definition.ts:113-162`). The CLI cannot build one honestly: a
receipt names the admitted `definitionKey` and `invocationRef` and carries an
`Exit` mapped to a fault, and the CLI has no admitted call and no `Exit` on
this path. Building one would make the CLI a second Exit-to-receipt mapping,
which the constitution gives to the one runner
(`ABI5_REALIZATION_CONSTITUTION.md:3000`). So the line is kept as it was.

On the 70 path the CLI writes, as before:

```json
{"code":"transport_failure","disposition":"refused","kind":"public_transport_refusal","message":"<String(error)>","schemaVersion":"5.0.0"}
```

What a caller reads from it:

- `kind` `public_transport_refusal`: a line the CLI wrote itself, not an
  outcome of the transport;
- `code` `transport_failure`: carrying a submitted call or encoding its
  outcome failed; after R1 no path before submission writes it;
- `message`: the thrown value as a string, here `RangeError: Maximum call
  stack size exceeded` or `TypeError: transport outcome is not one I-JSON
  value`;
- `disposition` `refused`: the CLI gives no outcome for the call.

It carries no receipt, no owner output, no fault and no `closeHandoff`. Its
code and its status say that the call was submitted; neither says whether an
owner ran. No requirement, design note
or contract defines `public_transport_refusal` or states that it means
nothing was submitted (searched `specification`, `T/design`, `T/code/src`,
`T/contracts`, `T/test_env/qualification`, `T/package.json`,
`T/release-claim.md` and the repository's `README.md`, `AGENTS.md` and
`CLAUDE.md`; the kind exists only in `cli.ts:69`). So ruling 4 does not stop.
Before R1 the CLI wrote the same line with status 2 for C2 and a throw in C5,
so the line alone did not tell the two apart. After R1 those paths write
`invalid_transport_request`. Every line the CLI writes itself with 2 now
carries a code that means the CLI did not submit the call; the transport's
typed refusal (C6), also 2, follows submission and precedes owner entry
(section 16).

## 7. Readers, text and qualification mirrors (ruling 7)

Readers (table 1.4): none relies on 2 for C8, C9 or C10, so none changes. One
more reader was checked: `test_env/uat/public-setup.mjs:167-171` reads the
receipt's `exitCode` from an in-process SDK call, not the CLI's status; it is
unaffected. `test_env/tests/d2-frame-installed.mjs` holds a `cliCall` (`:171`)
that ignores the status; no file imports it and its name is outside the test
glob.

Text (table 1.5): the requirement clause (section 3) and the S06 design
sentence (section 4) are restated. Every other sentence found stays true. The
R1 search for readers of the CLI's codes is in section 16.

Qualification mirrors that this change makes stale; none is edited here
(rule 8), and the Executive restages them at merge:

| Mirror | Member |
| --- | --- |
| `test_env/qualification/recipe/expected-output-inventory.json:510` | digest and byte count of `build/code/src/public/cli.js` |
| `test_env/qualification/recipe/verification-recipe.json:946-947` | `code/src/public/cli.ts` |
| `contracts/qualification/sources/REQ-P-POLICY.md` | the restated requirement |
| any recipe member naming the S06 design note or the new lane file | `design/M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md`, `test_env/tests/t292-td79-cli-exit-classification.test.mjs` |

## 8. The lane

`T/test_env/tests/t292-td79-cli-exit-classification.test.mjs` (new in commit
`f01990cc2`, 201 lines; 225 lines after commit `4acd827a4`). It drives `build/code/src/public/cli.js` as a child
process (`node cli.js --jsonl <file>`, empty environment, a scratch working
directory). It builds the calls with the Public SDK
(`constructInstalledPublicDefinitionCall`) from the coordinates in
`product-toolchain-manifest.json`. One store is created with
`createNewEmptyAppendSink` and closed with
`closeHeldEventStoreAtDurablePrefix`; every request that names a store names
this one. The store holds 0 events. Each row asserts the status, that stderr
is empty, that stdout is exactly one line and what it holds, and that the
store's bytes and event count are unchanged. Each row records the status and
code it observed before its own assertions, and a last subtest asserts over
those records (section 16).

| Row | Request | Status | Line |
| --- | --- | ---: | --- |
| wrong arguments: none | no arguments | 2 | `invalid_arguments` |
| wrong arguments: one more | `--jsonl <file> --extra` | 2 | `invalid_arguments` |
| a missing request file | `--jsonl <absent path>` | 2 | `invalid_transport_request`, `Error: ENOENT: ...` |
| an unreadable request file: a directory | `--jsonl <scratch directory>` | 2 | `invalid_transport_request`, `Error: EISDIR: ...` |
| a file with no line | `" \n\n"` | 2 | `invalid_transport_request` |
| a file with two lines | two transport lines | 2 | `invalid_transport_request` |
| a line that is not JSON | `{"kind":` | 2 | `invalid_json` |
| a line that is not a transport request | a reopen acquisition and no invocation | 2 | `invalid_transport_request` |
| a transport refusal | a `workspace.create#clean` call whose top-level acquisition (reopen) differs from its event resource | 2 | the transport refusal `acquisition_mismatch` |
| a throw out of the transport | a `product.materialize#configuration` call whose JSON-valued member `inputs` nests 2,800 arrays | 70 | `transport_failure`, `RangeError: Maximum call stack size exceeded` |
| an outcome that cannot be encoded | an eventless `workspace.create#clean` call whose `admissionAuthority` is the string `"\ud800"` | 70 | `transport_failure`, `TypeError: transport outcome is not one I-JSON value` |

How the two 70 rows arise from outside the process, with no Product seam:

- **The throw.** The transport detaches the call with `structuredClone`, which
  survives about 3,600 nested arrays at the top of a process. Its call
  admission (`admitRuntimeContract` through `jsonValueSchema`) then overflows
  the stack at about 1,900 levels and throws, before owner entry (table 1.2).
  2,800 lies between the two. The call is built with a placeholder string and
  the nesting is put into the JSON text afterwards, so its digests name the
  placeholder.
- **The encoding failure.** The owner is entered. `withAdmissionAuthority`
  refuses the authority string and its fault message quotes it, so the
  receipt carries a lone surrogate (section 1.3). Before the row the lane
  checks this in process: the transport returns a result whose receipt has
  `exitCode` 70, `typed_execution_fault`, stage `resource_admission`, code
  `resource_relation_mismatch`, and a message containing `\ud800`. This row's
  acquisition is eventless, so no store is touched; the lane also checks that
  no workspace was written.

The last subtest, "no line written with 2 carries transport_failure, and every
line written with 70 does", asserts that 11 rows ran, 9 with status 2 and 2
with status 70, that no row with 2 observed `transport_failure`, and that no
row with 70 observed another code.

The lane as first committed (`f01990cc2`, 10 rows) gave 11 tests, 8 pass,
3 fail at base: the two 70 rows exit 2 with the same `transport_failure`
messages, and the parent test fails with them; it gave 11/11 on the build
before R1. The lane after `4acd827a4` gives 13 tests: 9 pass and 4 fail on the
build before R1 (`3dd7dcef3`: the missing-file and directory rows read
`transport_failure`, the last subtest names both, and the parent fails with
them), and 13 pass on the final build.

## 9. Lanes before and after

Each file ran alone with the brief's command, on the base build (`42eabe9e8`)
and on the build before R1 (`f01990cc2`, "Final" in this section). Section
16.4 gives the reruns on the final build after R1. Tests / pass / fail / skip:

| File | Base | Final |
| --- | --- | --- |
| `t292-td79-cli-exit-classification` (new) | 11 / 8 / 3 / 0 | 11 / 11 / 0 / 0 |
| `steel-basic-cli-public` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `steel-basic-cli-c2` | 6 / 0 / 0 / 6 | 6 / 0 / 0 / 6 |
| `w2-steel-single-start` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `w2-steel-single-start-closure` | 2 / 1 / 0 / 1 | 2 / 1 / 0 / 1 |
| `w2-steel-single-start-installed` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `w2-steel-serial-branch-installed` | 2 / 0 / 0 / 2 | 2 / 0 / 0 / 2 |
| `t287-st1-installed-cross-owner-hello` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `t287-required-operation-bindings` | 11 / 11 / 0 / 0 | 11 / 11 / 0 / 0 |
| `t287-default-library` | 35 / 34 / 0 / 1 | 35 / 34 / 0 / 1 |
| `test_env/uat/harness` | 33 / 33 / 0 / 0 | 33 / 33 / 0 / 0 |
| `t287-selected-action` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-generic-job-lifecycle` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-generic-job-revision` | 2 / 1 / 0 / 1 | 2 / 1 / 0 / 1 |
| `r1-packed-artifact` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `r2-clean-install` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-w2-05-generator-package-reproducibility` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t292-td60b-evidence-gate-catalogue` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |

The skips are environment gates of the lanes themselves (for example
`steel-basic-cli-c2`: "C2 qualification requires explicit
ABI5_C2_CARRIER_FIXTURE_PATH"; the `w2-steel-*-installed` files need a frozen
artifact and evidence paths) and are the same at base and final.

The ruling-7 search names 20 more test files that drive the CLI (table 1.4).
They ran on the final build only, one at a time; none fails:

| File | Final |
| --- | --- |
| `t287-default-library-reviews` | 10 / 10 / 0 / 0 |
| `t287-exact-construction-intent` | 1 / 1 / 0 / 0 |
| `t287-exact-prefix-projection-reuse` | 2 / 2 / 0 / 0 |
| `t287-readable-stops` | 5 / 5 / 0 / 0 |
| `t287-readable-stops-foldback` | 5 / 5 / 0 / 0 |
| `t287-recursive-failure-foldback` | 8 / 8 / 0 / 0 |
| `t287-recursive-registered-selection` | 7 / 7 / 0 / 0 |
| `t287-registered-graph-selection` | 1 / 1 / 0 / 0 |
| `t287-rp2-behavior-carriers` | 1 / 1 / 0 / 0 |
| `t287-rp2-correction-carriers` | 1 / 1 / 0 / 0 |
| `t287-rp2-fibre-substitution` | 1 / 1 / 0 / 0 |
| `t292-td26-ps-default-root-mode` | 4 / 4 / 0 / 0 |
| `t287-amendment-witness` | 13 / 12 / 0 / 1 |
| `t287-default-library-recoverable-failure` | 5 / 5 / 0 / 0 |
| `t287-s03-automatic` | 2 / 0 / 0 / 2 |
| `installed-language-smoke` | 1 / 1 / 0 / 0 |
| `m5-installed-graph-edge` | 2 / 2 / 0 / 0 |
| `t287-single-address-space-consolidation` | 17 / 17 / 0 / 0 |
| `steel-consumer-declaration` | 1 / 0 / 0 / 1 |
| `m5-installed-portability` | 9 / 9 / 0 / 0 |

`t287-amendment-witness` spawns the model-free stand-in actor
(`test_env/support/amendment-witness-actor.mjs`); its one skip is the live
case, gated by `ABI5_AMENDMENT_WITNESS_LIVE`. The other skips in both tables
are the files' own evidence or live gates (`ABI5_S03_EVIDENCE_ROOT`,
`ABI5_STEEL02_EVIDENCE_PATH`, `ABI5_DEFAULT_LIBRARY_LIVE`,
`ABI5_SELECTED_ACTION_EVIDENCE_ROOT`, `ABI5_GENERIC_JOB_FULL_NATIVE`,
`ABI5_GENERIC_JOB_CORRECTION_NATIVE`). No lane needing a live provider ran.

TAP files: `/private/tmp/abg-td79-work/lanes-base/` and
`/private/tmp/abg-td79-work/lanes-final/`.

## 10. Identity digests and the capability graph

The final build is `npm run build` on `4acd827a4`; it passes. The build
before R1 was `npm run build` on `0535c1628` plus the lane file. No generated
file is committed; after each build the tracked generated files were saved
(`/private/tmp/abg-td79-work/final-generated/` before R1,
`/private/tmp/abg-td79-work/r1-final-generated/` after) and restored with
`git checkout -- contracts product-toolchain-manifest.json
test_env/fixtures/abi5-root-candidate-basis.json` before each commit.

| Identity | Base (`42eabe9e8`) | Before R1 (`f01990cc2`) | Final (`4acd827a4`) |
| --- | --- | --- | --- |
| `productContentDigest` | `sha256:80bb4526ac254ac1fed7e6e6ecfa8c1721b150dd972a1824665756b5a0edda05` | `sha256:655368898d8bc9d11b984dde44ac55bd2403f6145f9773dfae23f37390b9a7a1` | `sha256:3f90cbde4d87c15c75b0575240f90888228cf3fc7e3bb7b4d9feb7c8b70fa3cd` |
| `contributionManifestDigest` | `sha256:56f814122447e1897599e92666a38c7730676aa74efd681a0081d922484fb666` | `sha256:820e1f865dc2169ae35fd6fc512ca264d8569f7c4e0f44fe7d82836dfce31cd7` | `sha256:09d37a1f2426e1df9dc2507d7a106f7934abebd469e0d01632b911a6cf8fa500` |
| public contract `catalogDigest` | `sha256:f478d2a141b186475288c313e862ddfd924bb9b83158bf6b7e0d0db8bb0a5ae2` | unchanged | unchanged |
| capability graph `graphDigest` | `sha256:7202df5a3c7bb6ab640b792a286c3f4eba2e0c5a5aa5487af84ad05b32e14dc3` | `sha256:3849c10a5fce8ea64e1e7464d718a5be373105b3c48d37b3efcb8bd50f786b7b` | `sha256:16d75d8b04978b885ab69a9bb07936184dffa80841de77a16de62469be6a6623` |
| capability graph asset `contentDigest` | `sha256:6548389a0bc84e41a69fd3d16d26769c7d2a0721bb38eb68d8b4f8c0cbd04f06` | `sha256:5c941b8cc34d9a1359be6fdc006fddfa8958fedbe1fcaa5c9c4bffdc452cc7ed` | `sha256:48b06c77f639d68f9077a0480eea4af1fdd5de7a19a94510e54c2ce62edf45dd` |

The capability graph's rows are unchanged on both builds: the 16 rows have the same
capability ids in the same order and the same 241 owning contract entries
(contract id and nested selector). The rows carry no projected-contract field.
With the product content digest and the capability definition digests and
refs removed, the base and final rows are byte-identical. Those fields change
because the product content digest changes (the source of `cli.ts`, the
requirement and the design note are product content), and each row's owning
contract entry names that digest.
Every other file under `contracts/` is byte-identical to base, and every
changed manifest field is a digest or a ref derived from the product content
digest.

Lints on the final source, each exit 0:

- `lint:imports`: 30 shared modules import only shared modules and packages;
  the 3 forbidden owner pairs hold.
- `lint:lifecycle`: 284 modules, 7 allow-listed sites, no offender.
- `lint:calculus`: 6 modules, no offender.

The base gives the same three results.

## 11. Lines changed

`git diff --numstat 42eabe9e8` over `code/src`, `test_env`, `specification`
and `design`:

| File | Added | Removed |
| --- | ---: | ---: |
| `specification/requirements/product/REQ-P-POLICY.md` | 8 | 6 |
| `T/design/M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md` | 5 | 3 |
| `T/code/src/public/cli.ts` | 41 | 24 |
| `T/test_env/tests/t292-td79-cli-exit-classification.test.mjs` (new) | 225 | 0 |

Source: 41 added, 24 removed. Test: 225 added. Of these, R1 (`4acd827a4`)
adds 7 and removes 3 in `cli.ts`, and adds 26 and removes 2 in the lane.

## 12. Commits

On `claude/td79-cli-exit-after-owner`, from `42eabe9e8`:

1. `9a9b9f3ac` Record the TD-79 census: every CLI exit path and every
   transport refusal and throw.
2. `be6e38d87` State in REQ-P-POLICY-022 that exit 2 means no owner was
   entered and a carry or encoding failure exits 70.
3. `62eddb9da` Restate the CLI exit sentence of the S06 public-function
   design: 2 before an owner, 70 after submission.
4. `0535c1628` Exit 70 when the transport throws or the outcome cannot be
   encoded after the CLI submits the call.
5. `f01990cc2` Add the TD-79 lane: drive the built CLI as a process over
   every exit-2 row and both exit-70 rows.
6. `3dd7dcef3` Complete the TD-79 Return: exit table, restated clause, lane,
   readers, lanes before and after.
7. `4acd827a4` Write invalid_transport_request for an unreadable request
   file, so transport_failure always means the call was submitted.
8. The commit after it holds this Return as updated for R1.

None is pushed or tagged.

## 13. Deviations

1. **Background lanes.** The brief asks for test files in the foreground. The
   tool's foreground limit is 10 minutes, so the long files ran as background
   commands, one file at a time, each waited on before the next began. No two
   lanes overlapped. In the R1 round the tool moved `steel-basic-cli-public`
   (5 minutes) to the background after 3 minutes; it was waited on before the
   next file began.
2. **Twenty reader files ran on the final build only.** The brief asks for
   every file the ruling-7 search names on base and final. The files the
   brief lists and seven reader files (`t287-st1-installed-cross-owner-hello`,
   `t287-required-operation-bindings`, `t287-default-library`,
   `test_env/uat/harness`, `t287-selected-action`,
   `t287-generic-job-lifecycle`, `t287-generic-job-revision`) ran on both.
   The other 20 ran on the final build only, because none fails there, and a
   file with no failure on the final build cannot have gone from pass to
   fail. A base run would have been made, by rebuilding the base, for any
   file that failed on the final build.
3. **No replay or artifact-truth comparison.** These are verification steps
   of the retirement rules; this brief gives its own verification list and
   names neither. They were not run. The public contract catalog digest and
   the capability graph rows are unchanged (section 10).

## 14. Residuals

These were found and are not fixed here. Items 1 to 3 are transport or owner
changes outside this brief; item 4 is the line's shape, which ruling 4 and R1
keep.

1. **Request admission is not total.** `admitRuntimeContract`
   (`shared/public_function_contracts.ts:686-703`) runs Valibot with no
   `admitJson` gate, and `jsonValueSchema` (`:198-206`) recurses without a
   depth bound. A request whose JSON-valued member nests about 1,900 levels
   throws a `RangeError` out of the transport instead of returning the typed
   refusal `invalid_definition_call`. Before this change the CLI exited 2 for
   it; now 70, as ruling 3 says. The lane's throw row depends on this; if the
   admission is made total, that row needs another route.
2. **A receipt can fail I-JSON.** `withAdmissionAuthority`
   (`product/admission_authority.ts:515-517`) puts `String(cause)` in the
   fault message, and Valibot's message quotes the caller's string as it is.
   `validatedOwnerOutput` (`definition_binding_mechanics.ts:91-120`) also
   checks owner output with Valibot alone. So the SDK can return an outcome
   that is not I-JSON. The lane's encoding row depends on this.
3. **No post-append encoding failure was produced.** The encoding row's call
   is eventless, and the store in the lane holds no event, so the lane shows
   the store unchanged but not a store that an owner appended to before a 70.
4. **The 70 line keeps its refusal kind.** On the exit-70 path the line's
   kind and disposition still read `public_transport_refusal` and `refused`;
   the status and the code carry the classification.

## 15. For a ruling

Nothing is open. R1 was raised here and is ruled; section 16 gives the ruling
and its realization.

- **R1 (ruled). The `transport_failure` line had two statuses.** Before R1 it
  was written with 2 when reading the request failed (C2, a throw in C5) and
  with 70 after the call was submitted (C8 to C10), so a caller that read only
  the line could not tell whether the call was submitted.

## 16. R1 as ruled and how it is realized

### 16.1 The ruling

The line's code tells the two kinds of path apart, with codes the CLI already
has and no new code or kind. A failure before submission that the first `try`
catches (reading the file throws; decoding or parsing the request throws)
writes `invalid_transport_request` with the error text as its message and
exits 2: it is a request the CLI could not obtain from the file. Only the
second `try`'s catch, after submission, writes `transport_failure`, with
exit 70. So `transport_failure` always means the call was submitted. Every
line the CLI writes itself with 2 carries a code that means the CLI did not
submit the call; the transport's typed refusal (C6), also written with 2,
follows submission and precedes owner entry, and its code means no owner was
entered.

### 16.2 The code

Commit `4acd827a4`, `public/cli.ts` (+7 −3): the first `catch` (`:123-131`)
writes `invalid_transport_request` with `String(error)` in place of
`transport_failure`; its status stays 2. The second `catch` (`:151-157`) is
unchanged. The comment before the first block (`:89-91`) says its line
carries a code that says the call was not submitted; a comment in the first
`catch` (`:124-125`) says what it catches; the comment before the second block
(`:132-135`) says it writes `transport_failure` and no other path does. With
2 the CLI now writes its own lines with `invalid_arguments`,
`invalid_transport_request` or `invalid_json`, or the transport's typed
refusal. With 70 it writes its own line only with `transport_failure`, or the
transport result whose receipt carries `exitCode` 70 (C7).

### 16.3 Readers and text

Searched `T/code/src`, `T/scripts`, `T/test_env/tests`, `T/test_env/support`,
`T/test_env/uat`, `T/test_env/falsifiers`, `T/test_env/fixtures`,
`T/test_env/proof`, `T/test_env/types`, `T/test_env/qualification`,
`T/contracts`, live `T/design/*.md`, `T/README.md`, `T/test_env/README.md`,
`T/package.json`, `T/release-claim.md` and `specification/`, for `transport_failure`, `public_transport_refusal`,
`invalid_transport_request` and for text that states what the CLI writes when
it cannot read its request file.

- The CLI's `transport_failure` is read only by the TD-79 lane. That lane is
  the one reader updated (section 16.4).
- Every other `transport_failure` hit is the worker transport's failure
  class and does not read the CLI's line: `abg/transport_contracts.ts:94`,
  `:130`; `implementation/consensus.ts:614-619`,
  `implementation/worksite_construction.ts:233-236`,
  `implementation/native_workspace_work.ts:73`,
  `implementation/semantic_stage.ts:77`; the diagnostic ref in
  `product/default_library.ts:30` and
  `design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:21`; the M03 retry table
  (`design/M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md:33-35`);
  `REQ-P-QUAL-004` and `REQ-R-ABG3-RETRY-008` (the INT-005 failure taxonomy)
  in `specification/requirements/` and their mirrors in
  `contracts/qualification/sources/`; the fixture
  `test_env/fixtures/language-structural/leaf.mjs:21`; and the tests that
  assert that class (`t287-management-supervision`, `m5-worker-transport`,
  `t287-default-library-recoverable-failure`, `t287-amendment-witness`,
  `m5-consensus-module`, `t287-readable-stops`,
  `t287-f04a-probabilistic-result-candidate`,
  `t287-native-assessment-evidence`, `t287-liveness-heartbeat`,
  `m5-retry-lifecycle-authority`, `t287-lifecycle-failure-carrier`).
- `public_transport_refusal` appears only in `cli.ts:69` and the lane.
- The readers of table 1.4 submit well-formed request files and read the
  status or a transport outcome; none reads the code of a read failure.
- No kept caller outside the tenant's own tests depends on
  `transport_failure` for an unreadable request file, so the brief's stop
  does not apply.
- Text: the `REQ-P-POLICY-022` status clause (section 3) and the S06 design
  sentence (section 4,
  `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md:2248-2256`)
  give the status for a request the CLI cannot read and name no code. No
  sentence in live design or the specification names the code for a read
  failure. Neither is edited.

The search names no reader file to rerun beyond the brief's list.

### 16.4 The lane and the reruns

Commit `4acd827a4` changes the lane (+26 −2):

- the missing-file row expects `invalid_transport_request` with 2 and an
  `Error: ENOENT` message;
- one row is added for an unreadable request file: the CLI is given the
  scratch directory, and the row expects `invalid_transport_request` with 2
  and an `Error: EISDIR` message (census C2 names a directory);
- the two 70 rows still expect `transport_failure`;
- each row records the status and code it observed before its own
  assertions, and a last subtest asserts over those records: 11 rows ran, 9
  with 2 and 2 with 70, no row with 2 observed `transport_failure`, and no row
  with 70 observed another code. The counts guard against a row that failed
  before it recorded.

Each file ran alone with the brief's command. Tests / pass / fail / skip:

| File | Before R1 (`3dd7dcef3` build, updated lane) | Final (`4acd827a4`) |
| --- | --- | --- |
| `t292-td79-cli-exit-classification` | 13 / 9 / 4 / 0 | 13 / 13 / 0 / 0 |
| `steel-basic-cli-public` | not rerun | 1 / 1 / 0 / 0 |
| `test_env/uat/harness` | not rerun | 33 / 33 / 0 / 0 |

On the build before R1 the four failures are the missing-file row and the
directory row (each reads `transport_failure`), the last subtest (it names
both rows) and the parent test. `npm run build` and the three lints pass on
`4acd827a4` with the results of section 10. The other files of section 9 were
not rerun after R1: R1 changes only the code written on C2 and on a throw in
C5, and none of them drives either path. TAP files:
`/private/tmp/abg-td79-work/lanes-r1-pre/` and
`/private/tmp/abg-td79-work/lanes-r1-final/`.
