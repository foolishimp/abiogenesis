> **Resolved**: MCP transport issues documented here were resolved by ADR-022 (subprocess + env sanitization, 2026-03-23). MCP is no longer used for F_P dispatch.

# REVIEW: v1.0.0 Release — Lessons Learned for GSDLC Refactor

**Author**: Claude
**Date**: 2026-03-23T00:00:00Z
**Addresses**: `gen-install.py`, `__main__.py`, `fp_dispatch.py`, `genesis_core.py`, ADR-020
**For**: all

## Summary

Abiogenesis v1.0.0 shipped after a session that uncovered and fixed multiple boundary violations, dependency gaps, and architectural leaks. Every fix below was discovered by either a failing test, a live qualification run, or a Codex review of the installed product.

This post is a checklist for the GSDLC refactor — every item here was a real problem in ABG that will recur if not checked.

---

## Checklist: Kernel / Domain Boundary

### 1. The kernel must not hardcode domain paths

**What happened:** `__main__.py` had a hardcoded `.gsdlc/release/genesis.yml` config discovery path. The kernel engine "knew" about one specific domain package's install location.

**Fix:** `runtime_contract` key in `.genesis/genesis.yml`. The kernel reads its own config; if it contains `runtime_contract: <path>`, it follows the pointer. No domain path ever appears in kernel code.

**GSDLC checklist:**
- [ ] Does the GSDLC installer set `runtime_contract` in `.genesis/genesis.yml`?
- [ ] Does the GSDLC domain config live at its own path (e.g. `.gsdlc/release/genesis.yml`)?
- [ ] Does the kernel engine load it via the indirection, not a hardcoded path?

### 2. The kernel must not ship domain packages

**What happened:** `gen-install.py` shipped `genesis_core.py` (ABG's own self-hosting spec) as a "default package" into `.genesis/gtl_spec/packages/`. A vanilla install was bound to a package with hardcoded ABG repo paths (`builds/claude_code/...`), broken context locators, and ABG-specific evaluator commands.

**Fix:** Removed `gtl_spec/` from the install entirely. The kernel ships engine + GTL type system only. `genesis.yml` has no default binding — all package/worker lines are commented out. Domain installers supply their own package.

**GSDLC checklist:**
- [ ] GSDLC installer creates its own spec package directory
- [ ] GSDLC installer writes `package:` and `worker:` into `.genesis/genesis.yml` (or sets `runtime_contract`)
- [ ] No ABG-specific evaluator commands, context locators, or markov conditions in the domain package
- [ ] All `workspace://` locators point to files that actually exist after the domain installer runs

### 3. Help text and docstrings must not leak domain knowledge

**What happened:** `--package` help text said `e.g. gtl_spec.packages.genesis_core:genesis_v1`. A docstring used `genesis_sdlc.standard@0.2.0` as a workflow version example. Both teach the wrong model.

**Fix:** Replaced with generic examples (`my_domain.spec:my_package`, `my_domain.standard@0.2.0`).

**GSDLC checklist:**
- [ ] Grep the installed engine for your domain name — it should return zero hits

### 4. The bootloader must be domain-agnostic

**What happened:** The GTL bootloader (injected into CLAUDE.md) referenced `.gsdlc/release/` as a specific territory and used `GSDLC` in the cascade chain description.

**Fix:** Changed to `<domain>/release/` and `domain package` — generic, not specific.

**GSDLC checklist:**
- [ ] GSDLC appends its own domain bootloader section to CLAUDE.md (separate markers from the GTL bootloader)
- [ ] The GTL bootloader section is never edited by the domain installer — only appended to

---

## Checklist: MCP Transport (ADR-020)

### 5. MCP is a core dependency, not a test dependency

**What happened:** MCP transport was initially categorised as test-only. The user corrected this: "the tests are exactly the point of the integration." If tests use one code path and production uses another, the tests prove nothing.

**Fix:** `mcp>=1.17.0` is a core dependency in `pyproject.toml`. Single implementation in `genesis/fp_dispatch.py` — both engine and test harness import the same module.

**GSDLC checklist:**
- [ ] `fp_dispatch.py` is installed as part of the engine (in ENGINE_MODULES list)
- [ ] `.mcp.json` is created in the target project by the installer
- [ ] `mcp` Python SDK is listed as a dependency
- [ ] Tests import `from genesis.fp_dispatch import ...` — never a local copy

### 6. `claude -p` is not used for F_P. Ever.

**What happened:** `claude -p` subprocess hangs when nested inside an active Claude Code session due to nesting guard env vars. This was rediscovered after being lost twice (context compaction Feb 27, project extraction Mar 22).

**Fix:** ADR-020 documents the decision. `_call_claude_code_mcp()` via Python `mcp` SDK → `@steipete/claude-code-mcp` is the only F_P transport.

**GSDLC checklist:**
- [ ] No `claude -p` calls for F_P dispatch anywhere in the codebase
- [ ] ADR-020 is referenced in any new code that touches F_P transport

### 7. ADR decisions that require infrastructure must be written immediately

**What happened:** The MCP transport decision was lost twice because it lived only in commit messages and conversation context. Both were destroyed by context compaction and project extraction.

**Prevention rule:** Any architectural decision that requires infrastructure (MCP server, environment variable, installed package) must have an ADR written the day it is validated.

**GSDLC checklist:**
- [ ] Does GSDLC have its own ADR directory?
- [ ] Is every infrastructure dependency documented in an ADR?

---

## Checklist: Installer Discipline

### 8. The installer must be idempotent

**What happened:** Multiple installs produced correct results — engine files replaced, config preserved, events appended. This was validated by running 3 consecutive installs and checking output stability.

**GSDLC checklist:**
- [ ] Reinstall does not overwrite `genesis.yml` domain config
- [ ] Reinstall does not duplicate MCP server entries in `.mcp.json`
- [ ] Reinstall appends a new `genesis_installed` event (not overwrites)
- [ ] CLAUDE.md bootloader block is updated in place (not duplicated)

### 9. The installer must check prerequisites and report clearly

**What happened:** `gen-install.py` now checks npx, `@steipete/claude-code-mcp`, and `mcp` Python SDK. Reports `ready: true/false` with actionable warning messages.

**GSDLC checklist:**
- [ ] Does the GSDLC installer check that ABG kernel is already installed?
- [ ] Does it report missing prerequisites with install commands?

### 10. The installed product must be verifiable

**What happened:** `gen-install.py --verify` checks all installed files and MCP prerequisites without modifying anything.

**GSDLC checklist:**
- [ ] GSDLC installer has a `--verify` mode
- [ ] Verify checks domain-specific files (spec package, workflow manifests, etc.)

---

## Checklist: Spec and Evaluator Accuracy

### 11. Module counts and evaluator commands must match reality

**What happened:** The spec declared `six_modules_only` as a markov condition and had an evaluator checking for exactly 6 modules. After adding `fp_dispatch.py`, there were 7. The evaluator command would have failed against the actual codebase.

**Fix:** Renamed to `engine_modules_complete`, updated the evaluator command to check for 7 modules.

**GSDLC checklist:**
- [ ] Every F_D evaluator command is runnable against the current codebase
- [ ] Markov conditions reflect actual acceptance criteria, not stale snapshots
- [ ] After any structural change (new module, renamed file), grep for the old name in the spec

### 12. Tests must exercise the same code path as production

**What happened:** The test harness had its own `_call_claude_code_mcp()` copy. Production used a completely different dispatch mechanism (skill markdown → Claude Code). The user said: "the tests are not running the same code i 100% dont trust testing then."

**Fix:** Single implementation in `fp_dispatch.py`. Tests import from it. Production imports from it.

**GSDLC checklist:**
- [ ] No duplicated business logic between test helpers and production code
- [ ] If a test helper does something the engine also does, extract to a shared module

---

## Checklist: Artifact Reading

### 13. MCP actors write artifacts directly — don't overwrite them

**What happened:** The MCP actor used tool access to write SQL/UAT files directly to the workspace. The test harness then overwrote the file with the MCP response summary text ("Done. Produced: ..."). Result: 0/10 qualification — "no CREATE TABLE statements found."

**Fix:** Check if the actor already wrote the artifact (file exists and size > placeholder). Read what the actor produced instead of overwriting.

**GSDLC checklist:**
- [ ] After F_P dispatch, check if the actor wrote the expected file before assuming the response text is the artifact
- [ ] Never overwrite a file the actor produced with the MCP response summary

---

## Release Evidence

- **Commit:** `7adb30d` — `release: abiogenesis v1.0.0`
- **Tag:** `v1.0.0`
- **Tests:** 457 passed, 1 skipped
- **Live F_P:** 20/20 (schema 10/10, UAT 10/10)
- **Clean install:** 14 files, zero domain leaks
