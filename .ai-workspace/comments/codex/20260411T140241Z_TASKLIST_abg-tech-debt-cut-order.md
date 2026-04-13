# ABG Tech Debt Cut Order

Timestamp: `2026-04-11T14:02:41Z`
Owner: `abiogenesis`
Change class: `realization_refactor`
Entry: tech-debt review over live substrate and downstream evidence

## Purpose

Turn the current debt review into an ABG-owned execution list.

This list is intentionally substrate-scoped.
It excludes `odd_method`-owned domain fixes except where ABG must define or harden the dependency contract.

## Spec-Method Framing

This task list follows the change-management rule in
[`SPEC_METHOD.md`](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md#L237):

- every substantive change begins with intake triage
- the change must declare its lawful change class
- the change must declare its lawful re-entry point
- the affected downstream span must be identified before implementation

### Intake Triage

Intake class:
- `bug`
- `regression`
- `release blocker`
- `operator finding`

Affected product boundary:
- `abiogenesis` substrate runtime, provenance, and install contract

Declared change intent:
- remove live compatibility/degrade paths that let ABG silently fall back to pre-provenance or weakly bounded dependency behavior
- restore fail-closed substrate truth where the method already requires it
- keep interface cuts explicit and force downstream refactor rather than compatibility shims

Lawful change class:
- `realization_refactor`

Reason:
- the intended constitutional truth is already present in the methodology and runtime doctrine
- the defect is in substrate realization behavior and release discipline, not in the intended product direction

Lawful re-entry point:
- substrate runtime and installer realization surfaces in `abiogenesis`

Affected downstream span that must be re-proved:
- provenance and approval binding
- install/bootstrap contract
- downstream dependency boundary
- ABG RC release note discipline

Consistency gate:
- no ABG gate may close while the runtime still permits `"unknown"` provenance downgrade for governed workspaces
- no ABG RC may close while interface cuts are being silently repaired with compatibility shims

## Decisions Already Fixed

- No backwards-compatibility shim for removed substrate interfaces.
- Interface cuts in `abiogenesis` must force downstream refactor.
- `abiogenesis` and `odd_method` remain separate projects.
- Each project owns its own full installation product, including dependency installation.

## ABG-Owned Findings

### ABG-01 — `"unknown"` provenance mode is still a live downgrade path

Severity: `critical`

Live evidence:
- [`provenance.py`](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/provenance.py#L88) falls back to `req_hash(...)` when `workflow_version == "unknown"`
- [`provenance.py`](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/provenance.py#L93) returns `"unknown"` on any active-workflow read failure
- [`services.py`](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/services.py#L99) documents provenance bypass in that state
- [`binding.py`](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py#L937) accepts bare edge-name F_H approvals when workflow version is unknown
- [`test_provenance_integration.py`](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/test_env/tests/test_provenance_integration.py#L163) still enshrines this as backward-compatible behavior

Required cut:
- Remove `"unknown"` as a lawful steady-state runtime mode for governed workspaces.
- Treat missing or malformed `active-workflow.json` as a hard install/runtime defect.
- Remove `req_hash(...)` fallback from `spec_hash_for(...)` for governed runtime use.
- Require workflow-version-bearing approvals for `bind_fh(...)`.

Primary files:
- [`provenance.py`](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/provenance.py)
- [`services.py`](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/services.py)
- [`binding.py`](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py)

Proof gate:
- New tests prove missing/invalid workflow metadata fails closed.
- Old `TestBackwardCompat` provenance fallback tests are deleted or rewritten to expect failure.
- `spec_hash_for(...)` always uses structural job hash in installed/governed workspaces.

### ABG-02 — Installer/runtime bootstrap must guarantee provenance readiness

Severity: `high`

Problem:
- ABG cannot fail closed on provenance if install/bootstrap does not guarantee valid workflow metadata exists.

Required cut:
- Define the minimal provenance-ready install contract for `abiogenesis`.
- Installer must either:
  - write valid active-workflow metadata and any required runtime contract wiring, or
  - fail the install
- No silent runtime downgrade path after install.

Primary files to inspect and likely change:
- [`install.py`](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/install.py)
- [`__main__.py`](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/__main__.py)
- any install/bootstrap tests under [`build_tenants/abiogenesis/python/test_env/tests`](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/test_env/tests)

Proof gate:
- Fresh installed workspace contains valid workflow metadata by construction.
- Removing or corrupting that metadata causes runtime failure, not silent `"unknown"` fallback.

### ABG-03 — Downstream dependency interface must be explicit and testable

Severity: `high`

Problem:
- `odd_method` composes `abiogenesis` as a dependency, but ABG’s dependency interface is not yet sharply bounded enough to prevent drift.
- The fix is not to merge ownership. The fix is to harden the boundary.

ABG responsibility:
- Define what `abiogenesis` promises to downstream installers.
- Keep that contract narrow and test it.

The ABG-owned contract should cover:
- installed `.genesis` runtime files
- installer-written config/bootstrap artifacts
- required runtime metadata for provenance and policy resolution
- any public Python surfaces that downstream domains are expected to import directly

Non-goal:
- ABG does not own downstream overlays like domain runtime contracts, domain normalization, or domain bootloaders.

Proof gate:
- A substrate contract test can install ABG into a scratch workspace and assert the exact runtime boundary that downstreams may rely on.
- Downstream breakage must come from explicit interface change, not accidental omission.

### ABG-04 — Release discipline must reject compatibility restorations for interface cuts

Severity: `medium`

Problem:
- The recent policy-default executor hook issue showed how easy it is to slip into compatibility repair instead of forcing the downstream refactor.

Required cut:
- Treat substrate API removals as deliberate interface cuts.
- Record them in RC notes as refactor-required changes.
- Do not restore removed surfaces just to keep downstream tests green.

ABG-owned action:
- Add a release checklist item for interface removals and downstream refactor expectation.
- Update release notes when ABG intentionally removes or renames a public symbol or behavior.

Proof gate:
- RC notes explicitly call out interface cuts.
- No substrate compatibility shim is introduced for removed surfaces unless separately justified as a constitutional compatibility feature.

## Not ABG-Owned

These remain real debt, but they belong in `odd_method`, not this ABG list:

- normalized `PRODUCT.md` / `GOALS.md` authoring as live constitutional scaffolding
- adopted-topology hot-path support and `selected_output_tree` recovery
- `test_traceability_present` alias and planned/realized test-branch debt

## Execution Order

1. Cut `ABG-01` first.
   This is the highest-risk substrate escape hatch.

2. Cut `ABG-02` immediately after.
   Failing closed on provenance requires a provenance-ready installer/runtime contract.

3. Define and test `ABG-03`.
   The dependency boundary must be explicit before the next downstream install wave.

4. Bake `ABG-04` into the next RC process.
   This is release discipline, not runtime semantics, but it prevents backsliding.

## Minimum Test Plan

### Provenance hard-fail lane

- Missing `active-workflow.json` fails scope/runtime initialization.
- Malformed `active-workflow.json` fails scope/runtime initialization.
- Old `req_hash`-based acceptance no longer converges governed runtime.
- Bare edge-name F_H approval without workflow version no longer authorizes traversal.

### Install contract lane

- Fresh `abiogenesis` install emits provenance-ready metadata.
- Installed runtime starts in versioned mode, not `"unknown"`.
- Removing required metadata after install causes explicit runtime failure.

### Dependency-boundary lane

- Scratch install exposes exactly the ABG runtime/config/docs surface the downstream installer is allowed to depend on.
- Public import surface relied on by downstreams is either:
  - documented and tested, or
  - intentionally removed and called out in RC notes.

## Exit Criteria

This ABG debt wave is closed when:

- `"unknown"` provenance mode is gone from governed runtime behavior
- installer/bootstrap guarantees provenance readiness or fails closed
- the downstream dependency contract is explicit and tested
- the next ABG RC documents interface cuts without compatibility restoration
