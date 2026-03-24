# Implements: REQ-L-GTL2-OPERATOR
# Implements: REQ-L-GTL2-EVALUATOR
# Implements: REQ-L-GTL2-RULE
"""
gtl.operator_model — Effect and convergence declarations.

Operator, Evaluator, Rule, Consensus, and the F_D/F_P/F_H regime markers.

No external dependencies. Dataclasses + stdlib only.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


# ── Functor categories (regime markers) ───────────────────────────────────

class F_D:
    """Deterministic — zero ambiguity, pass/fail."""

class F_P:
    """Probabilistic — agent/LLM, bounded ambiguity."""

class F_H:
    """Human — persistent ambiguity, judgment required."""


# ── Consensus ─────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class Consensus:
    n: int
    m: int

    def __post_init__(self):
        if self.n < 1 or self.m < 1 or self.n > self.m:
            raise ValueError(f"consensus({self.n}/{self.m}): n must be 1..m")

    def __repr__(self):
        return f"consensus({self.n}/{self.m})"


def consensus(n: int, m: int) -> Consensus:
    return Consensus(n, m)


# ── Rule ──────────────────────────────────────────────────────────────────

@dataclass
class Rule:
    name: str
    approve: Consensus
    dissent: str = "none"
    provisional: bool = False

    def __post_init__(self):
        if self.dissent not in ("required", "recorded", "none"):
            raise ValueError(f"Rule.dissent must be required|recorded|none, got {self.dissent!r}")


# ── Operator ──────────────────────────────────────────────────────────────

_OPERATOR_SCHEMES = ("agent://", "exec://", "check://", "metric://", "fh://")


@dataclass
class Operator:
    name: str
    category: type   # F_D | F_P | F_H
    uri: str

    def __post_init__(self):
        if self.category not in (F_D, F_P, F_H):
            raise TypeError(f"Operator.category must be F_D, F_P, or F_H")
        if not any(self.uri.startswith(s) for s in _OPERATOR_SCHEMES):
            raise ValueError(
                f"Operator URI must use a known scheme {_OPERATOR_SCHEMES}: {self.uri!r}"
            )


# ── Evaluator ─────────────────────────────────────────────────────────────

@dataclass
class Evaluator:
    """
    Typed convergence predicate — the stopping condition for iterate().

    category determines the evaluation regime: F_D, F_P, F_H.
    """
    name: str
    category: type   # F_D | F_P | F_H
    description: str
    command: str = ""

    def __post_init__(self):
        if self.category not in (F_D, F_P, F_H):
            raise TypeError(
                f"Evaluator.category must be F_D, F_P, or F_H, got {self.category!r}"
            )
