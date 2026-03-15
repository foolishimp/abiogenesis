# builds/claude_code — Design

Claude Code build of Genesis V1.0.

**Status**: Phase 0 — scaffold complete, design not started.

## ADRs to write (Phase 1 → 2)

| ADR | Topic | Covers |
|-----|-------|--------|
| ADR-001 | GTL as spec | Why genesis_core.py IS the requirements |
| ADR-002 | bind_fd/fp split | F_D pre-computation before F_P invocation |
| ADR-003 | PrecomputedManifest | Structure, attention minimisation, context filtering |
| ADR-004 | Scope type | Explicit Scope object — no ambient workspace inference |
| ADR-005 | Event stream | Shared stream + build field, project() filter |
| ADR-006 | Bootstrap sequence | Phase 0-5 build order and self-hosting gate |

## Design references (from ai_sdlc_method)

The following posts in `ai_sdlc_method/.ai-workspace/comments/claude/` are the
primary design inputs. Re-derive from these — do not copy code from ai_sdlc_method.

- `20260315T000000_STRATEGY_typed-job-worker-model-gtl.md`
- `20260315T010000_STRATEGY_gtl-functional-completeness-three-scenarios.md`
- `20260315T020000_STRATEGY_gtl-v03-draft-spec-language.md`
- `20260315T040000_STRATEGY_gtl-genesis-engine-closure.md`
- `20260315T050000_STRATEGY_fd-precomputation-attention-minimisation.md`
- `20260315T070000_STRATEGY_abiogenesis-approved-execution-plan.md`
- `20260315T080000_STRATEGY_abiogenesis-structure-resolutions.md`
