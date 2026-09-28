# S6 live-02 launcher readiness — no dispatch

The accepted single-run launcher and cold-read helper are bound to the frozen successor installation, prepared request and closed handoff. No Run/provider, repack, install, source or case change occurred.

`launch.mjs` and `prepare-launch.mjs` are byte-identical to accepted live-01. The only readback source change is the evidence/request identity prefix `s6-live-01-` → `s6-live-02-`. The helper still uses the returned exact Run source and handoff, with a fresh installed CLI process and empty environment for each Public read. Provider and controls records are byte-identical; installed CLI/actor/transport/liveness owner hashes and shared helper hash are unchanged. Syntax checks for all three scripts passed.

This binds source freeze `f5644b465e62ecf98de2d9c8392de17495d658197dae05cbbfb51e0b14945d3f`, core `e49c4cc9d552ebca16c944d197cd9af4685ec8f6d0559c732cf35833f02a5d0d`, consumer `2161cfc9e67745bdec0363d4ca5cc724f473a5c7bb4f2bd498d34e32d04f5e60`, and fresh installation/worksite under `/private/var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abi5-root-env-O5UtQl/`. Exact changed coordinates are in `binding-delta.json`; unchanged input/schema/policy/case stay selected.

The executable remains `/Users/jim/.local/share/claude/versions/2.1.280`, SHA256 `387a5c5dcdbb815085edf0baf79591f9d8894efe922bceaf3d75b1b08055229d`, with explicit `--model claude-opus-5-5 --effort xhigh`. Inherited controls: startup/inactivity 60 s, hard cap 3,600 s, actor termination grace 1 s; fixed commands 20 s/grace 2 s; recursion twelve; context/prompt bounds 131,072 bytes. No timeout override, fallback or automatic paid retry.

Readiness SHA256 `886787da55482198ec8b4092102a436a7ab4d1d1beee889885e5cd26ce47ba9b`; eight-member launcher manifest `e194455fad533fcddce89788be7acd8c8a9543e3e0f9c3663ddc6fddd3e8627d`; binding delta `22ae49175c2e7bf8bd692cd07b5c48431bdfffbd1800ffed46b8bf647b8f13fb`. All old launcher-manifest and correction proof-manifest members verified unchanged.

After explicit Executive dispatch only: `node .ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s6-context-projection-01/live-02/launch.mjs --dispatch-once`. It retains raw evidence before assertions and invokes both cold reads. Readiness is closed; dispatch remains held.
