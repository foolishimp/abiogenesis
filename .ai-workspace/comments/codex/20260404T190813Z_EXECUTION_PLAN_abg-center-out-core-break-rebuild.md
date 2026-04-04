# Execution Plan — ABG Center-Out Core Break/Rebuild

**Status**: Posted execution plan
**Date**: 2026-04-04
**Scope**: live specification + canonical Python tenant
**Mode**: delete drift surfaces first, then break the core and rebuild outward

## Intent

This plan is not "reduce tech debt."

It is a destructive semantic cleanup of the live authority surfaces followed by a
center-out rebuild of the runtime around one algebraic core.

This plan explicitly allows temporary breakage between steps.

## Hard Rules

1. Do not preserve compatibility aliases for old semantics.
2. Do not keep two live taxonomies in parallel.
3. Do not leave direct event writes in place while claiming `emit()` is lawful.
4. Do not let CLI booleans summarize run truth after typed run projection exists.
5. Archived comment posts under `.ai-workspace/comments/codex/` are historical evidence, not live authority. Do not rewrite them for cleanup. Remove drift from live spec, code, and tests only.

## Canonical Target

Core failure algebra:

- `transport_failure`
- `no_output`
- `contract_failure`
- `certification_failure`

Core run-state algebra:

- `queued`
- `started`
- `dispatched`
- `pending`
- `assessed_pass`
- `failed`
- `timed_out`
- `superseded`

Projection rule:

- `assessed{kind: fp, result: pass}` projects to `assessed_pass`
- `assessed{kind: fp, result: fail}` projects to `failed` with `failure_class=certification_failure`

## Step 0 — Strip Live Drift References Before Rebuild

This step is a delete/replace sweep over live surfaces only.

Edit these live authority surfaces first:

- [INTENT.md](/Users/jim/src/apps/abiogenesis/specification/INTENT.md):291-321
- [REQ-R-ABG2-RUN.md](/Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG2-RUN.md):18-24
- [REQ-P-QUAL.md](/Users/jim/src/apps/abiogenesis/specification/requirements/product/REQ-P-QUAL.md):32-46
- [run.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/run.py):12-21
- [transport.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/transport.py):7-13 and :180-211
- [subwork.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/subwork.py):96-130
- [cli_adapter.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/cli_adapter.py):785-792

Delete or replace these legacy drift tokens from live surfaces:

- `bad_output`
- terminal run state `assessed` as an undifferentiated run outcome
- `auto_fp_dispatch_handled`
- direct `EventStream.append(` use outside the event substrate

Explicit non-goal:

- do not rewrite historical strategy/handoff posts under `.ai-workspace/comments/codex/`

Acceptable broken state after Step 0:

- tests fail because the live spec and code no longer match old names
- imports fail where old names are still referenced

## Step 1 — Reprice the Constitutional Truth First

Do not start the runtime rebuild while the live requirements still encode the old
semantics.

### 1A. Reprice intent

Edit [INTENT.md](/Users/jim/src/apps/abiogenesis/specification/INTENT.md):291-321

Replace:

- `dispatched and assessed`
- `bad output`
- `queued → started → dispatched → pending → assessed | failed | timed_out | superseded`
- `transport_failure, no_output, bad_output, certification_failure`

With:

- explicit algebraic run lifecycle
- explicit `contract_failure`
- explicit successful terminal projection `assessed_pass`

### 1B. Reprice run requirement

Edit [REQ-R-ABG2-RUN.md](/Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG2-RUN.md):18-24

Replace:

- terminal state `assessed`

With:

- terminal state `assessed_pass`
- failed state carrying a failure-class projection

### 1C. Reprice transport and qualification language

Edit:

- [REQ-R-ABG2-TRANSPORT.md](/Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG2-TRANSPORT.md)
- [REQ-P-QUAL.md](/Users/jim/src/apps/abiogenesis/specification/requirements/product/REQ-P-QUAL.md):32-46

Replace:

- `bad_output`

With:

- `contract_failure`

Also make explicit:

- nonzero exit and timeout remain transport failure even if an artifact exists

Required result of Step 1:

- one live taxonomy in spec
- zero live references to `bad_output` in spec

Acceptable broken state after Step 1:

- runtime still compiles against old names
- spec and runtime intentionally disagree for a short window

## Step 2 — Break the Core First in `run.py`

This is the intentional center cut. After this step, old callers are expected to
break.

### 2A. Replace the algebra constants

Edit [run.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/run.py):12-21

Delete:

- `RUN_STATES` containing `assessed`
- `FAILURE_CLASSES` containing `bad_output`

Replace with:

- `RUN_STATES` containing `assessed_pass`
- `FAILURE_CLASSES` containing `contract_failure`

### 2B. Rebuild run projection

Edit [run.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/run.py):50-178

Delete the current direct mapping:

- `assessed -> state = "assessed"` at :141-149

Replace with explicit projection rules:

- `assessed{result:pass}` => `state="assessed_pass"`
- `assessed{result:fail}` => `state="failed"` and `failure_class="certification_failure"`
- `run_failed` stays terminal substrate failure truth
- `run_timed_out` stays terminal timeout truth

### 2C. Add one central projection/transition surface

Add in [run.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/run.py) after the core type definitions:

- one canonical run projection helper
- one canonical lifecycle-event constructor/helper set
- one typed dispatch/control outcome type for non-run command results

Do not leave lifecycle interpretation duplicated in `cli_adapter.py` or `interpret.py`.

Acceptable broken state after Step 2:

- anything still checking for `state == "assessed"` is broken
- anything still returning `bad_output` is broken
- CLI and traversal code may not compile until rewired

## Step 3 — Make `events.py` the Only Lawful Write Surface

### 3A. Stop exposing `append()` as a semantic API

Edit [events.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/events.py):32-97 and :173-235

Required change:

- keep `EventStream` as storage substrate
- make `emit()` the only semantic write API for the rest of the system
- if needed, rename `append()` to a private/internal helper or clearly fence it so callers outside `events.py` stop using it as a public contract

### 3B. Expand event helpers now, not later

In [events.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/events.py):173-235, add helpers that runtime code can call instead of hand-building event payloads:

- run lifecycle emit helpers
- frame-state emit helpers
- generic batch append through lawful validation

Acceptable broken state after Step 3:

- every old `stream.append(...)` call site outside `events.py` is now wrong
- traversal code is expected to fail until rewired

## Step 4 — Purge Direct Event Writes from `interpret.py`

This is a hard rewrite, not a gradual soft migration.

### 4A. Delete the generic passthrough append helpers

Edit [interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py):963-982

Rewrite:

- `_append_events(...)`
- `_append_recursive_state(...)`

So they call canonical `emit()`-level helpers rather than `stream.append(...)`.

### 4B. Rewrite traversal lifecycle emission

Edit [interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py):1252-1534

Replace ad hoc direct writes at:

- :1331 `run_bound`
- :1351 `run_started`
- :1389 `edge_started`
- :1392-1424 frame events

With:

- central run/event helper calls

### 4C. Rewrite recursive machine writes

Edit [interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py):1646-1832

Replace all direct writes for:

- `edge_converged`
- `frame_step_completed`
- `frame_resumed`
- `frame_foldback`
- `frame_rebound`
- `frame_closed`

With:

- lawful event helper calls

### 4D. Rebuild `_realize_iteration()` around central run truth

Edit [interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py):1915-2050

Keep:

- evaluator fact production

But stop letting `_realize_iteration()` imply lifecycle truth by itself.

Its job becomes:

- produce evaluator and leaf-task facts
- call central lifecycle transitions for F_P dispatch and downstream states

Acceptable broken state after Step 4:

- recursive runtime may be red
- event ordering bugs may appear transiently
- no direct `stream.append(...)` may remain outside `events.py`

## Step 5 — Make Transport Classification Total

### 5A. Rewrite `classify_failure()`

Edit [transport.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/transport.py):180-211

Replace current logic with strict classification:

- timeout => `transport_failure`
- nonzero exit => `transport_failure`
- missing file => `no_output`
- empty file => `no_output`
- malformed JSON => `contract_failure`
- schema-invalid artifact => `contract_failure`

Artifact presence must never erase nonzero exit.

### 5B. Rewrite leaf-task returns

Edit [subwork.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/subwork.py):96-130

Replace:

- `bad_output`

With:

- `contract_failure`

For:

- invalid input schema
- malformed result JSON
- invalid output schema

Acceptable broken state after Step 5:

- tests and callers still expecting `bad_output` fail immediately

## Step 6 — Rebuild CLI as Pure Projection

### 6A. Rewrite `assess-result`

Edit [cli_adapter.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/cli_adapter.py):303-477

Keep:

- result-file parsing
- manifest provenance extraction

Change:

- emitting raw `assessed` facts must route through the central run transition/projection surface so failed certification produces correct run truth

### 6B. Rewrite event command validation

Edit [cli_adapter.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/cli_adapter.py):480-581

Keep:

- payload validation

But align schemas and messages to the new algebra so CLI help and errors do not
teach the old model.

### 6C. Delete boolean control-plane truth

Edit [cli_adapter.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/cli_adapter.py):765-824

Delete:

- `handled = bool(auto_fp_dispatch(...))`
- `auto_fp_dispatch_handled`

Replace with:

- typed projection from central run/dispatch outcome
- CLI stop reasons derived from canonical outcome tags

Acceptable broken state after Step 6:

- CLI output schema can change
- auto-loop tests can fail until rewritten

## Step 7 — Repair Read Models That Still Encode Old Truth

### 7A. Certification read model

Edit [binding.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py):440-500

Review `bind_fp_certified(...)` so certification read logic continues to work
with the new run algebra while still consuming `assessed{kind: fp, result: pass}`
as evaluator fact.

### 7B. Any remaining `assessed`-as-run-state checks

Repo sweep in live code:

- `rg -n '\bassessed\b|\bbad_output\b|auto_fp_dispatch_handled|EventStream\.append\(' specification build_tenants/abiogenesis/python/code build_tenants/abiogenesis/python/test_env/tests`

Required result of Step 7:

- no live code uses `assessed` as the terminal run-state name
- no live code uses `bad_output`

## Step 8 — Rewrite Tests After the Core Is Stable

Primary test surface:

- [build_tenants/abiogenesis/python/test_env/tests](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/test_env/tests)

Start with:

- [test_cli_adapter_auto.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/test_env/tests/test_cli_adapter_auto.py)
- run-governance and transport qualification tests
- scenario tests that inspect failure-class names or terminal state names

Required changes:

- replace `bad_output` assertions with `contract_failure`
- replace `assessed` terminal-state assertions with `assessed_pass`
- add regression test that nonzero exit plus artifact still yields `transport_failure`
- add regression test that failed certification yields `failed(certification_failure)`
- add guard test that live code outside `events.py` does not call `EventStream.append(`

Acceptable broken state after Step 8:

- none for the touched surfaces; this is the stabilization pass

## Step 9 — Final Sweep and Hard Gate

Before claiming complete, these repo sweeps must return zero hits across live
surfaces:

- `rg -n '\bbad_output\b' specification build_tenants/abiogenesis/python/code build_tenants/abiogenesis/python/test_env/tests`
- `rg -n 'auto_fp_dispatch_handled' specification build_tenants/abiogenesis/python/code build_tenants/abiogenesis/python/test_env/tests`
- `rg -n 'EventStream\\.append\\(' build_tenants/abiogenesis/python/code | rg -v 'events.py'`

And this sweep must only show evaluator-fact uses of `assessed`, not terminal
run-state uses:

- `rg -n '\bassessed\b' specification build_tenants/abiogenesis/python/code build_tenants/abiogenesis/python/test_env/tests`

## Allowed Broken States During Execution

Allowed while migrating:

- import/type failures immediately after the `run.py` algebra cut
- red tests after taxonomy and state renames
- temporary CLI output churn
- temporary recursive-runtime breakage while direct append calls are being purged

Not allowed:

- adding compatibility aliases such as keeping `bad_output` and mapping it later
- preserving `auto_fp_dispatch_handled` as a parallel truth field
- leaving any live direct `EventStream.append(` call outside `events.py`
- claiming the plan is complete while spec and runtime still encode different algebras

## Parallel Codex Note

A second Codex pass was requested with a stricter constraint state: delete drift
surfaces first, accept temporary breakage, and do not preserve compatibility.

Its result agrees with this execution shape:

- break `run.py` first
- remove direct append paths
- harden transport truth before rebuilding outer projection
- rewrite CLI only after the core transition surface exists

This posted note is the integrated execution plan.
