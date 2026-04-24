# M05 Python Sandbox Proof Equivalence Audit

**Status**: Active
**Date**: 2026-04-24
**Purpose**: Audit the completed TypeScript installed-sandbox, live-lane, and
archive proof surfaces against the released Python sandbox reference tests at
equivalent feature coverage, and force any still-relevant misses into explicit
follow-up tickets.

## 1. Scope

This audit is bounded to the Python proof sources named by `T-029`:

- `build_tenants/abiogenesis/python/test_env/test_surface_map.md`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_usecases_live.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_run_archive.py`
- `build_tenants/abiogenesis/python/test_env/tests/sandbox_runtime.py`
- `build_tenants/abiogenesis/python/test_env/tests/run_archive.py`

It reconciles those sources against the completed TypeScript proof surfaces:

- `test_m05_sandbox_install_integration.test.mjs`
- `test_m05_sandbox_live_integration.test.mjs`
- `test_m05_run_archive_integration.test.mjs`
- `t022-m05-installed-sandbox-negative.test.mjs`
- completed upstream `M03` / `M04` module-owned proof lanes where the
  TypeScript line intentionally repriced Python monolithic install behavior
  into narrower module-owned proof

This audit does not widen the TypeScript product. It only classifies parity.

## 2. Classification Legend

- `covered`: current TypeScript proof already validates the Python-tested
  behavior at equivalent feature level
- `repriced`: the Python behavior is still validated, but the TypeScript line
  moved the proof to a different lawful module boundary or package-first
  delivery shape
- `missed_follow_up`: the Python behavior still matters and is not yet proved
  at equivalent feature level in the TypeScript line; it requires a follow-up
  ticket
- `redundant`: the Python source remains historical/reference evidence but is
  not required as active parity truth for the TypeScript line

## 3. Source Asset Checklist

| Python source asset | Status | Notes |
| --- | --- | --- |
| `python/test_env/test_surface_map.md` | `covered` | reconciled against current TypeScript `test_surface_map.md` and used as the Python proof index |
| `python/test_env/tests/test_sandbox_install.py` | `covered` | fully audited below at per-test behavior level |
| `python/test_env/tests/test_sandbox_usecases_live.py` | `covered` | fully audited below at per-scenario level |
| `python/test_env/tests/test_run_archive.py` | `covered` | reconciled against current TypeScript archive-proof lane |
| `python/test_env/tests/sandbox_runtime.py` | `covered` | used to classify installed-line harness mechanics versus package-first TypeScript delivery |
| `python/test_env/tests/run_archive.py` | `covered` | used to classify the real archive writer/finalizer gap |

## 4. Feature Matrix

### 4.1 Python `test_sandbox_install.py`

| Python-tested behavior | TypeScript proof source | Status | Notes |
| --- | --- | --- | --- |
| real install copies the complete engine runtime | `test_m04_install_bootstrap_integration.test.mjs` | `repriced` | TypeScript install is package-first. It proves a complete installed runtime root and package binding, not a file-for-file copy of the Python engine tree. |
| install creates the full AI workspace skeleton before runtime bootstrap | `test_m04_install_bootstrap_integration.test.mjs`, `test_m05_sandbox_install_integration.test.mjs` | `repriced` | TypeScript proves the installed root, runtime directory, workspace events, and importable bootstrap surface. It does not mirror Python’s exact `.ai-workspace` directory lattice one-for-one. |
| install vendors builder docs and standards tree | `test_m04_bootloader_integration.test.mjs`, `test_m05_sandbox_install_integration.test.mjs` | `repriced` | TypeScript proves bootloader document delivery, instruction injection, and installed importability. It does not treat Python’s vendored docs tree as the primary parity surface. |
| install seeds project-owned spec and tenant templates | no current TypeScript proof | `repriced` | The TypeScript install line was intentionally bounded to installed runtime delivery, not source-project scaffold generation. This is a package-first repricing, not a parity miss. |
| runtime source keeps `emit` as the only write boundary and removes drift names | `test_m03_engine_kernel_integration.test.mjs`, `test_m04_event_ingress_integration.test.mjs`, completed design-method reviews | `repriced` | TypeScript proves event ownership and effect-edge law at module boundaries rather than by installed source-tree grep. |
| installed runtime can execute `emit-event` from the workspace | `test_m04_event_ingress_integration.test.mjs`, `test_m05_sandbox_install_integration.test.mjs` | `repriced` | Command emission is proved at the `M04` event-ingress boundary and installed import surface, but not yet as a dedicated installed CLI parity lane. |
| `workspace_bootstrap()` creates runtime directories | `test_m04_install_bootstrap_integration.test.mjs`, `test_m05_sandbox_install_integration.test.mjs` | `repriced` | TypeScript has no Python-style `workspace_bootstrap()` function. The installed root and bootstrap entry are proved as delivery artifacts instead. |
| `workspace_bootstrap()` is idempotent | `test_m04_install_bootstrap_integration.test.mjs`, `test_m04_bootloader_integration.test.mjs` | `repriced` | Idempotence is proved on install/bootstrap and bootloader delivery rather than on a Python workspace-bootstrap helper. |
| `emit()` writes through the bound stream | `test_m04_event_ingress_integration.test.mjs` | `repriced` | The canonical write boundary is proved through admitted command ingress and emission, not through the Python event-stream helper. |
| installed CLI preserves router and selected execution identity | `test_m03_engine_kernel_integration.test.mjs`, `test_m03_transport_protocol_integration.test.mjs`, `test_m05_sandbox_live_integration.test.mjs` | `repriced` | TypeScript proves runtime identity and transport identity upstream, and proves one installed public scenario. It does not yet carry one explicit installed parity lane for this exact Python router test. |
| installed `start` graph-function target drives the selected manifest and event chain | `test_m04_app_bootstrap_integration.test.mjs`, `test_m05_sandbox_live_integration.test.mjs` | `repriced` | TypeScript proves public-start over graph-function handles and one installed scenario through the package surface, but not the exact Python CLI path and manifest assertions. |
| installed `start` asset target drives the selected manifest and event chain | `test_m04_public_asset_addressing_integration.test.mjs`, `test_m05_sandbox_live_integration.test.mjs` | `covered` | TypeScript proves asset-address resolution plus installed package-surface scenario execution over that resolved target. |
| installed `start --root-mode supervised` converges over the deterministic chain | `test_m04_control_loop_integration.test.mjs` | `repriced` | Root-mode supervision is proved in the completed `M04` control loop, not yet as installed-line qualification. |
| installed reset audit supersedes the active run postmortem | `test_m05_installed_reset_postmortem_integration.test.mjs`, `test_m05_installed_reset_postmortem_unit.test.mjs`, `t032-m05-reset-postmortem-negative.test.mjs` | `repriced` | `T-032` closes this parity family through one explicit installed reset-postmortem boundary over accepted reset ingress plus pre-reset live run truth, without widening `M03` into a new runtime event family. |
| installed reset audit abandons the open continuation postmortem | `test_m05_installed_reset_postmortem_integration.test.mjs`, `test_m05_installed_reset_postmortem_unit.test.mjs`, `t032-m05-reset-postmortem-negative.test.mjs` | `repriced` | `T-032` closes this parity family through one explicit installed reset-postmortem boundary over accepted reset ingress plus non-fulfilled assessment provenance, with deterministic continuation identity derived from manifest provenance. |

### 4.2 Python `test_sandbox_usecases_live.py`

| Python-tested behavior | TypeScript proof source | Status | Notes |
| --- | --- | --- | --- |
| `requirements_to_uat` installed live qualification | `test_m05_installed_live_portfolio_integration.test.mjs`, `test_m05_installed_live_portfolio_unit.test.mjs`, `t031-m05-live-portfolio-negative.test.mjs` | `covered` | `T-031` added the explicit installed portfolio lane and carries this family as the `asset_addressed` single-edge scenario. |
| `intent_to_requirements` installed live qualification | `test_m05_installed_live_portfolio_integration.test.mjs`, `test_m05_installed_live_portfolio_unit.test.mjs`, `t031-m05-live-portfolio-negative.test.mjs` | `covered` | `T-031` carries this family as the `graph_function` single-edge installed scenario. |
| `gsdlc_lite_requirements_design_code` installed live qualification | `test_m05_installed_live_portfolio_integration.test.mjs`, `test_m05_installed_live_portfolio_unit.test.mjs`, `t031-m05-live-portfolio-negative.test.mjs` | `covered` | `T-031` carries this family as the installed `staged_chain` scenario. |
| `gsdlc_lite_design_review` installed live qualification | `test_m05_installed_live_portfolio_integration.test.mjs`, `test_m05_installed_live_portfolio_unit.test.mjs`, `t031-m05-live-portfolio-negative.test.mjs` | `covered` | `T-031` carries this family as the installed `review_chain` scenario with explicit multi-assessment breadth. |
| `gsdlc_lite_zoom_design` installed live qualification | `test_m05_installed_live_portfolio_integration.test.mjs`, `test_m05_installed_live_portfolio_unit.test.mjs`, `t031-m05-live-portfolio-negative.test.mjs` | `covered` | `T-031` carries this family as the installed `zoom_chain` scenario with explicit fold-back breadth. |

### 4.3 Python `test_run_archive.py` and `tests/run_archive.py`

| Python-tested behavior | TypeScript proof source | Status | Notes |
| --- | --- | --- | --- |
| archive finalization writes canonical postmortem shape | `test_m05_run_archive_integration.test.mjs`, `test_m05_archive_finalization_unit.test.mjs`, `t030-m05-archive-finalization-negative.test.mjs` | `covered` | `T-030` realized one canonical archive writer/finalizer and moved archive qualification behind that real materialization step. |
| archive helper captures run metadata, summary, stdout/stderr, manifests, results, events, and workspace artifacts | `finalizeRunArchive(...)`, `buildRunArchiveQualificationRequest(...)`, `test_m05_run_archive_integration.test.mjs` | `covered` | TypeScript now materializes the canonical postmortem files plus source artifacts through the archive-finalization boundary rather than a shape-only synthetic fixture. |

### 4.4 Python `tests/sandbox_runtime.py`

| Python-tested behavior | TypeScript proof source | Status | Notes |
| --- | --- | --- | --- |
| installed sandbox install path is separate from source-tree execution | `test_m04_install_bootstrap_integration.test.mjs`, `test_m05_sandbox_install_integration.test.mjs` | `covered` | TypeScript proves an installed root plus package binding and installed bootstrap import. |
| installed environment is shaped hermetically for the installed runtime | `test_m05_sandbox_install_integration.test.mjs`, `test_m05_sandbox_live_integration.test.mjs` | `repriced` | TypeScript hermeticity is package binding plus installed import, not Python `PYTHONPATH` manipulation. |
| installed command execution routes through the installed entrypoint | `test_m05_sandbox_live_integration.test.mjs` | `covered` | The bounded live lane runs via the installed bootstrap entry under the installed root. |

## 5. Audit Outcome

The current TypeScript line is materially equivalent to the Python reference on
installed-root proof and one bounded installed live scenario, but it is not yet
equivalent to the full Python sandbox/live/archive proof breadth.

Current result:

- package-first installed runtime delivery: `repriced` and sufficiently proved
- installed public-start / asset-target scenario: `covered`
- Python monolithic install mechanics: intentionally `repriced`
- installed reset postmortem parity: `repriced` and sufficiently proved
- Python live scenario portfolio breadth: `covered`
- canonical archive writer/finalizer parity: `covered`

## 6. Follow-Up Result

The still-relevant parity follow-ups named by this audit are now completed:

- `T-030` installed run-archive writer/finalizer parity
- `T-031` installed live scenario portfolio parity
- `T-032` installed reset/postmortem parity

## 7. Baseline Consequence

Later parity claims should cite this audit instead of broad “Python-equivalent”
language.

The lawful current claim is:

- TypeScript `M05` proves one bounded installed runtime lane, one explicit
  installed live scenario portfolio, explicit installed reset/postmortem
  parity, plus canonical archive finalization and archive qualification,
- most Python sandbox-install behaviors are intentionally repriced into cleaner
  `M03` / `M04` / delivery proofs,
- the currently-audited still-relevant Python parity families are now closed.
