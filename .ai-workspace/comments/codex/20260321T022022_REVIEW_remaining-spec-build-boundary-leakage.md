# REVIEW: Remaining Spec-Build Boundary Leakage

**Author**: Codex
**Date**: 2026-03-21T02:20:22+11:00
**Addresses**: abiogenesis `specification/` cleanup after tenant/worker boundary clarification
**For**: all

## Summary
This post documents the remaining places where abiogenesis `specification/` still leaks concrete build decisions after the `Scope.build` / `Worker` boundary issue. The main pattern is consistent: the constitutional surface still names the Claude build, the current Python CLI/runtime layout, and the legacy event substrate in places that should now be tech-neutral.

Some of these are clear misses and should be moved out of spec. One of them, `.genesis/`, is still a real boundary decision and should be treated as such rather than silently normalized.

## Findings

### 1. The constitutional source is still inverted toward `builds/claude_code`

The spec documents still describe the Claude build package file as the requirement registry and effective constitutional source:
- `specification/INTENT.md:28`
- `specification/requirements.md:3`
- `specification/feature_decomposition.md:5`
- `specification/feature_decomposition.md:95`

That is the wrong direction if `specification/` is now meant to be authoritative and tech-neutral. At minimum, the spec should not describe `builds/claude_code/code/gtl_spec/packages/abiogenesis.py` as the normative anchor. That is a concrete build artifact.

### 2. `feature_decomposition.md` is still largely a Claude build inventory

`specification/feature_decomposition.md` still hardcodes:
- the six-module Python layout
- `core.py`, `bind.py`, `schedule.py`, `commands.py`, `manifest.py`, `__main__.py`
- `gen-install.py`
- the path `builds/claude_code/code/genesis/`

See:
- `specification/feature_decomposition.md:71-87`

This is not merely explanatory detail. It turns one concrete implementation decomposition into the constitutional feature model.

It also still defers items that are now better understood as constitutional, not incidental:
- `multi-tenant scheduling (multiple workers with conflict detection)`
- named alternate builds

See:
- `specification/feature_decomposition.md:60-68`

Given your clarified direction, multi-`F_P` orchestration is part of the engine's design, not a V2 build quirk. That means this file is still carrying old build-specific assumptions.

### 3. CLI and Python harness details are still being stated as constitutional requirements

Several requirements are expressed in terms of the current Python CLI rather than abstract engine behavior:
- `gen check-impl-coverage` / `gen check-validates-coverage` in `specification/requirements.md:210-212`
- `emit-event` CLI behavior in `specification/requirements.md:214-223`
- test strategy language tied to command-level integration, `tmp_path`, unit tests, and property tests in `specification/requirements.md:340-357`

The core requirements should be:
- coverage and traceability must be checkable deterministically
- prime operator payloads must be validated before append
- replay/projection invariants must be testable

The exact command names, CLI surface, and Python test harness are build territory.

### 4. The event/provenance model is still overconcretized to the legacy local runtime

Even after deciding OL is the forward substrate, the current spec still hardcodes the old event shape and local provenance files:
- legacy event envelope in `specification/domain_model.md:253-289`
- `Scope` reading `.genesis/active-workflow.json` in `specification/domain_model.md:182` and `specification/domain_model.md:243-245`
- workflow version resolution in `specification/convergence_model.md:396-417`
- CLI governance wording in `specification/convergence_model.md:493-500`

This is not only old implementation detail. It is now directly at odds with the forward OpenLineage direction.

The spec needs a fresh event/projection layer written from the constitutional target, not from the current Python emitter.

### 5. `.genesis/` is still unresolved as a spec-vs-build boundary

The spec currently treats `.genesis/` as part of the constitutional contract:
- install target in `specification/domain_model.md:298`
- bootstrap requirements in `specification/requirements.md:14-38`
- provenance file locations in `specification/requirements.md:363-400`

This may be correct, but it has not yet been cleanly separated from build-specific layout assumptions.

So this item is different from the others:
- if `.genesis/` is a stable engine contract across tenants, keeping it in spec is reasonable
- if it is only the current build's installation layout, it is another missed build leak

This should be treated as an explicit architectural decision, not quietly inherited from the current Python build.

## Interpretation
What was missed is not just one default string or one fallback function. The spec cleanup stopped halfway.

The current `specification/` layer still contains three kinds of leakage:
- tenant identity leakage
- concrete implementation decomposition leakage
- concrete runtime/CLI/testing/layout leakage

The first category is partly addressed by the recent worker/scope clarification. The second and third categories are still visibly present.

## Recommended Action
1. Re-anchor `INTENT.md`, `requirements.md`, and `feature_decomposition.md` so `specification/` is the constitutional source and `builds/*` are derived realizations.
2. Rewrite `feature_decomposition.md` around abstract engine capabilities and constitutional features, not the current Python module tree.
3. Sweep `requirements.md` for CLI/test-harness phrasing and replace it with behavior-level requirements, leaving concrete command names to `builds/*`.
4. Supersede the legacy event/provenance sections with an OL-native event/projection contract before further detailed spec work accumulates on the old model.
5. Make an explicit call on whether `.genesis/` is a constitutional install surface or merely the current build layout.

