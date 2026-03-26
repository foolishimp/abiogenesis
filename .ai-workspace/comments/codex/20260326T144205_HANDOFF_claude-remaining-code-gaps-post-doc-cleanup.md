# HANDOFF: Claude Remaining Code Gaps Post Doc Cleanup

**Author**: codex
**Date**: 2026-03-26T14:42:05+11:00
**Addresses**: shipping `claude_code` code-surface re-audit after doc cleanup and `gtl.core` removal
**For**: claude

## Summary

The shipping design docs have been rewritten into present-tense current-surface assertions. `gtl.core` is already gone from the shipping code tree. The remaining debt is now concentrated in the shipping code surface itself: the old `REQ-F-*` namespace is still dominant in code tags and domain-package metadata, one domain package still asserts the obsolete seven-module engine shape, and a small number of code comments/docstrings still narrate migration history instead of describing the present surface.

This post is the remaining code-focused handoff only. It excludes docs, `codex`, and downstream `gsdlc`.

## Shipping Scope

In scope:

- `builds/claude_code/code/`
- `builds/claude_code/tests/` only where test changes are required by code cleanup

Out of scope:

- `builds/codex/`
- `gsdlc`
- docs-layer wording work already completed in `builds/claude_code/design/`

## Current Good State

- `builds/claude_code/code/gtl/core.py` is deleted.
- Shipping imports of `gtl.core` are no longer present in `builds/claude_code/code` or the main shipping tests.
- Shipping design docs now describe the current surface rather than migration history.

## Remaining Code Gaps

### 1. Requirement namespace debt remains the main code inconsistency

This is the highest-priority remaining code problem.

#### Domain package metadata is still entirely old-namespace

Current shipping package surfaces still publish only `REQ-F-*` keys:

- `builds/claude_code/code/gtl_spec/packages/abiogenesis.py` — 45 old keys, 0 new 2.x keys
- `builds/claude_code/code/gtl_spec/packages/project_package.py` — 17 old keys, 0 new 2.x keys
- `builds/claude_code/code/gtl_spec/packages/genesis_core.py` — 11 old keys, 0 new 2.x keys

This means the authored module metadata still points at the deprecated requirement namespace even though the active requirement surface is now `REQ-L-*`, `REQ-R-*`, `REQ-M-*`, and `REQ-P-*`.

#### Shipping code tags are still dominated by `REQ-F-*`

There are 18 shipping code files with old `# Implements: REQ-F-*` tags:

- `builds/claude_code/code/gen-install.py`
- `builds/claude_code/code/genesis/__init__.py`
- `builds/claude_code/code/genesis/__main__.py`
- `builds/claude_code/code/genesis/binding.py`
- `builds/claude_code/code/genesis/cli_adapter.py`
- `builds/claude_code/code/genesis/convergence.py`
- `builds/claude_code/code/genesis/correction.py`
- `builds/claude_code/code/genesis/events.py`
- `builds/claude_code/code/genesis/install.py`
- `builds/claude_code/code/genesis/interpret.py`
- `builds/claude_code/code/genesis/lineage.py`
- `builds/claude_code/code/genesis/projection.py`
- `builds/claude_code/code/genesis/provenance.py`
- `builds/claude_code/code/genesis/run.py`
- `builds/claude_code/code/genesis/selfhosting.py`
- `builds/claude_code/code/genesis/services.py`
- `builds/claude_code/code/genesis/subwork.py`
- `builds/claude_code/code/genesis/transport.py`

Some files are now mixed old/new namespace rather than cleanly migrated:

- `genesis/interpret.py`
- `genesis/transport.py`
- `genesis/services.py`
- `genesis/selfhosting.py`

That mixed state is harder to reason about than either old-only or new-only. It should be normalized to the live 2.x requirement surface.

### 2. `genesis_core.py` still encodes the obsolete engine ontology

`builds/claude_code/code/gtl_spec/packages/genesis_core.py` still carries:

- `engine_modules` evaluator text: `exactly 7 modules: core, bind, schedule, manifest, commands, fp_dispatch, __main__`
- a corresponding check that enforces that obsolete file set

This is no longer a stale comment. It is executable doctrine inside a shipping domain package. It should be rewritten against the current shipping engine surface or removed if that package is not part of the release claim.

### 3. Installer still asserts an obsolete module inventory

`builds/claude_code/code/gen-install.py` still says:

- `.genesis/genesis/ ← the engine modules (8 files including fp_dispatch)`

The actual `ENGINE_MODULES` list below it is current, so the prose is now out of sync with the installer behavior.

`gen-install.py` also still carries only old `REQ-F-*` tags at the top.

### 4. Entry-point shims still carry old requirement tags

Two small but visible shipping entry points are still old-namespace:

- `builds/claude_code/code/genesis/__main__.py`
- `builds/claude_code/code/genesis/__init__.py`

This matters because they are user-facing import/entry surfaces and still help define what the product appears to be.

### 5. Code comments and docstrings still narrate decomposition history

The design docs are now present-tense current assertions. Several code files still read like migration notes rather than current-surface declarations:

- `builds/claude_code/code/genesis/subwork.py`
- `builds/claude_code/code/genesis/transport.py`
- `builds/claude_code/code/genesis/correction.py`
- `builds/claude_code/code/genesis/lineage.py`
- `builds/claude_code/code/genesis/convergence.py`
- `builds/claude_code/code/genesis/provenance.py`
- `builds/claude_code/code/genesis/run.py`

Typical pattern:

- `Extracted from genesis.schedule ...`
- `Extracted from genesis.bind ...`
- `Extracted from genesis.fp_dispatch ...`

These should be rewritten as present-tense statements of current ownership, or removed if they add no value.

### 6. Mapping layer is still undecided at code level

Static state remains:

- shipping design still declares `mapping.capability`, `mapping.adapter`, `mapping.provenance`
- there is still no shipping `mapping/` implementation under `builds/claude_code/code/`

This is not a doc-only issue. It remains a code/design inconsistency until you either:

- implement the mapping layer, or
- remove/demote it from the shipping surface

## Suggested Execution Order

1. Finish requirement-namespace migration in code.
   - Start with the three domain packages under `gtl_spec/packages/`.
   - Then normalize `# Implements:` tags across the shipping engine modules.

2. Fix the obsolete engine doctrine in `gtl_spec/packages/genesis_core.py`.
   - Remove the `core/bind/schedule/manifest/commands/fp_dispatch` worldview.
   - Align any inventory check to the current module surface, or delete it if it no longer serves the product.

3. Clean the installer and entry shims.
   - `gen-install.py`
   - `genesis/__init__.py`
   - `genesis/__main__.py`

4. Rewrite present-tense code docstrings/comments.
   - Remove “extracted from …” and similar decomposition-history narration from shipping code.

5. Decide mapping-layer disposition explicitly.
   - Keep and implement, or cut from the shipping claim.

## Acceptance Criteria

- shipping domain package metadata does not rely on `REQ-F-*`
- shipping `# Implements:` tags are normalized to the live 2.x requirement surface
- no shipping code asserts the obsolete seven-module engine shape
- installer and entry-point surfaces describe the current module inventory only
- code docstrings/comments are present-tense current-surface assertions, not migration notes
- mapping layer is either implemented or removed from the shipping claim

## Recommended Action

Treat requirement-namespace cleanup in code as the primary remaining consistency task. The `gtl.core` cut removed the old import facade, but the product still speaks the old requirement ontology in too many places. Clean that first, then remove the last obsolete engine-inventory and decomposition-history assertions.

## Addendum: Trace Closure and Live Surface Immutability

`SPEC_METHOD.md` has now been tightened explicitly on two points that affect how this cleanup must be executed.

First: the project now states constitutional trace closure directly.

- No live requirement may remain without downstream realization or an explicit deferment surface.
- No shipping code or tests may exist without upstream trace back to live requirement and design authority.
- Deferment is valid only when it is explicit and honest. Silent mismatch is not deferment.

Second: live constitutional surfaces are immutable in place.

- Mutable surfaces may still be refactored aggressively:
  - engine/runtime code
  - tests
  - installer/tooling
  - mutable design documents
- Live domain artifacts may not be silently rewritten in place once they are part of the live constitutional surface.
  - If a live domain package is wrong, supersede it with a new version, or withdraw/delete it.
  - Do not "clean up" a live domain artifact as if it were ordinary mutable engine code.

This changes the execution rule for `gtl_spec/packages/*`:

- If a package there is not yet a live constitutional artifact, mutate it as needed.
- If a package there is already live, do not rewrite it in place. Use supersession, deletion, or explicit deferment instead.

So the remaining cleanup should be applied with a split policy:

- `builds/claude_code/code/genesis/*`, installer surfaces, entry shims, and tests:
  - mutate freely to restore trace closure and current-surface consistency
- `builds/claude_code/code/gtl_spec/packages/*`:
  - treat as versioned domain surfaces
  - normalize only if they are not yet live
  - otherwise supersede/withdraw rather than silently rewrite

This is not a soft preference. It is now explicit project method.

## Addendum: `genesis_core` Should Be Withdrawn, Not Repaired

Further audit changed the disposition of `builds/claude_code/code/gtl_spec/packages/genesis_core.py`.

This package is no longer just "stale." It is an orphaned domain artifact:

- it has no shipping design claim in `specification/` or `builds/claude_code/design/`
- it still publishes obsolete `REQ-F-*` metadata
- it contains executable doctrine enforcing the dead `core/bind/schedule/manifest/commands/fp_dispatch/__main__` engine shape
- the only remaining shipping references are tests and one installer comment

So the correct action is not to modernize it in place.

If `genesis_core` is considered live, withdraw/delete it from the live surface.
If it is not considered live, delete it outright.

Do not spend effort repairing the package to the current engine ontology unless there is a real 1.0 constitutional claim for it.

Cleanup implied by this decision:

- delete or withdraw `builds/claude_code/code/gtl_spec/packages/genesis_core.py`
- remove the `TestGenesisCoreModule` expectations from `builds/claude_code/tests/test_v2_domain_scenarios.py`
- remove the `genesis_core` role assertion from `builds/claude_code/tests/test_adr030_proof.py`
- scrub the stale `genesis_core binding` installer comment in `builds/claude_code/code/gen-install.py`

This is a trace-closure correction. A domain package with no shipping design authority should not survive as a first-class surface.
