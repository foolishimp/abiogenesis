# ADR-001: GTL as the Specification Language

**Status**: accepted
**Date**: 2026-03-15
**Derives from**: 20260315T020000_STRATEGY_gtl-v03-draft-spec-language.md

## Decision

`spec/packages/genesis_core.py` is the specification. No prose requirements pyramid.
The GTL Package declares assets, edges, evaluators, operators, and contexts.
REQ keys emerge from the Package — they are not authored separately.
The type system is the law.

## Rationale

- A Python file is executable, versionable, importable, and auditable
- `python spec/packages/genesis_core.py` is the health check — it either loads or fails
- Every downstream artifact traces to GTL constructs (assets, edges, evaluators)
- The markov conditions on each Asset ARE the acceptance criteria — no duplication

## Consequences

- Design ADRs answer HOW (tech-bound). The spec answers WHAT (tech-agnostic).
- All code files must carry `# Implements: REQ-*` tags matching feature vector keys
- All test files must carry `# Validates: REQ-*` tags
- Context digests in the spec bind to exact file content — pending digests (`sha256:0*64`)
  are updated when files stabilise
- GTL version is pinned via `genesis-gtl @ file://…`; published to PyPI when stable
