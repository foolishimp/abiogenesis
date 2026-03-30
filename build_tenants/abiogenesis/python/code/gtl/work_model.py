# Implements: REQ-L-GTL2-JOB
# Implements: REQ-L-GTL2-ROLE
# Implements: REQ-L-GTL2-IDENTITY
"""
gtl.work_model — Semantic work declarations.

Job is a durable semantic work contract. Role is a semantic capability class.
ContractRef is the indirection from a job to the GTL contract it binds.

These are GTL language types, not ABG runtime types.
No external dependencies. Dataclasses + stdlib only.
"""
from __future__ import annotations

from dataclasses import dataclass, field

from gtl.graph import Attrs, _mint_id


# ── ContractRef ──────────────────────────────────────────────────────────


@dataclass(frozen=True)
class ContractRef:
    """
    Indirection from a Job to the GTL contract it binds.

    kind: the contract type (current build supports "graph_vector" only).
    target_id: the .id of the referenced GTL declaration.
    """
    kind: str
    target_id: str


# ── Role ─────────────────────────────────────────────────────────────────


@dataclass(frozen=True)
class Role:
    """
    Semantic capability class required to perform, supervise, or approve work.

    Language-owned. Distinct from Worker (engine-owned concrete identity).
    """
    name: str
    tags: tuple[str, ...] = ()
    policy_hooks: Attrs = field(default_factory=Attrs)
    id: str = field(default_factory=_mint_id, compare=False)

    def __post_init__(self) -> None:
        object.__setattr__(self, "policy_hooks", Attrs.coerce(self.policy_hooks))


# ── Job ──────────────────────────────────────────────────────────────────


@dataclass(frozen=True)
class Job:
    """
    Durable semantic work contract — persists across runs.

    A job references one or more GTL contracts via ContractRef.
    Current build supports ContractRef(kind="graph_vector") only.
    """
    name: str
    contracts: tuple[ContractRef, ...] = ()
    roles: tuple[Role, ...] = ()
    tags: tuple[str, ...] = ()
    id: str = field(default_factory=_mint_id, compare=False)
