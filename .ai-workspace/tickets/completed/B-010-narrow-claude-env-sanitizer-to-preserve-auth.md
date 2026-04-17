# B-010 Narrow Claude Env Sanitizer To Preserve Auth

- id: B-010
- title: Narrow Claude env sanitizer to preserve auth
- type: bug
- status: completed
- goal: runtime-supervision-and-recovery
- change_intent: Preserve auth-carrying Claude environment variables while still stripping the specific nesting/session signals that cause recursive CLI hangs.
- change_class: realization_refactor
- re_entry_point: build
- priority: medium
- intake_source: ABG live qualification gate investigation from `test_sandbox_usecases_live.py`
- affected_boundary: Claude subprocess transport contract and environment sanitization semantics
- triaged_at: 2026-04-17
- created_at: 2026-04-17
- updated_at: 2026-04-17
- completed_at: 2026-04-17

## Context

The Claude transport contract was stripping every `CLAUDE*` environment
variable.

That prevented any auth-carrying Claude env from reaching the subprocess in
headless or supervised runtime contexts, even though the real nesting-hang fix
only needs a small set of session/nesting signals removed.

This bug was discovered during live qualification probing while trying to
establish whether the ABG live-test skip was caused by transport sanitization or
missing auth in the parent shell.

## Root Defect

The default Claude transport contract used:

- `sanitize_env_prefixes=("CLAUDE",)`

That over-broad prefix conflated:

- nesting/session markers that should be stripped
- auth-carrying env that should be preserved

## Resolution

The Claude transport contract now strips only the known nesting/session
variables:

- `CLAUDECODE`
- `CLAUDE_CODE_SSE_`
- `CLAUDE_CODE_ENTRYPOINT`
- `CLAUDE_CODE_EXECPATH`

Auth-carrying env is preserved.

## Closure Note

This bug was real and is now fixed.

It was **not** the sole cause of the current live-test skip in the Codex shell:
an unsanitized direct `claude -p` probe from that same shell still reported
`Not logged in · Please run /login`.

So:

- the sanitizer bug is closed
- the current live qualification block remains an auth/session-context issue in
  the invoking shell

## Acceptance

- Claude subprocess transport no longer strips the entire `CLAUDE*` namespace.
- Known nesting/session signals are still removed.
- Auth-carrying Claude env can survive sanitization.
- Deterministic regression coverage proves the preserved-auth behavior.

## Links

- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/transport.py`
- test: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/test_env/tests/test_m04_app_bootstrap_integration.py`
