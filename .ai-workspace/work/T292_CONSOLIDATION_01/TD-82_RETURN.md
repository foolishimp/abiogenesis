# TD-82 Return

Status: preservation checkpoint; unfinished, unaccepted inherited draft.

| Binding | Value |
|---|---|
| Activation | Codex Worker `/root/td82_resume`, bounded Writer; receives through installed `stdo-work` Receive; consumer `/root` |
| Authority | T-292 amendment 2026-11-13; T-293 B-04; user-approved takeover and continuation, projected by Root in the TD-82 packet |
| Basis | `urn:stdo:product-definition:abiogenesis`; `stdo://releases/v3.0.4/`; manifest `102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b`; `stdo status --verify` valid, installed, no failures |
| Subject | `/private/tmp/abg-td82`, `claude/td82-lock-namespace`, predecessor `891a39c44877fc1edfdc4b9159336992d37dd4c0`; main at receipt `dd0d071f360ec78365ccca228f3fda6bd539e3d7` |
| Preservation | All 14 initial dirty/untracked files copied to `/private/tmp/abg-td82-work/codex-resume/preserved/`; initial manifest `initial-state.json` SHA-256 `f5a25134396c2fd36ba536d5a278986b8dc322589d2eff660874047ec007a0e4`; tracked patch `initial.diff` |
| Provenance | Inherited unfinished Claude branch work, preserved before Codex completion; no other Writer owns this tree under the Root grant. Authored source/design/test bytes are checkpointed exactly; the two generated files remain uncommitted |
| Host | Packet-only task plus host instructions; shared unrestricted filesystem/tools; no cleanroom or independent-review claim |
| Effect reconciliation | No pre-existing TD-82 build/test/repro process observed in `ps -Ao pid,ppid,etime,command` before continuation; no main merge, publication, install, pin change or worktree removal |

The final Return will bind the finished candidate, exact commands/evidence, lifecycle and migration limits, and remaining qualification. This checkpoint claims preservation only.
