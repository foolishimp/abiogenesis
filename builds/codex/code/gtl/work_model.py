"""Semantic work declarations for the codex build."""

from __future__ import annotations

from dataclasses import dataclass, field
from uuid import uuid4


def _mint_id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex[:12]}"


@dataclass(frozen=True, slots=True)
class ContractRef:
    """Semantic reference to a GTL work contract."""

    kind: str
    target_id: str

    def __post_init__(self) -> None:
        if not self.kind.strip():
            raise ValueError("ContractRef.kind must not be empty")
        if not self.target_id.strip():
            raise ValueError("ContractRef.target_id must not be empty")


@dataclass(frozen=True, slots=True)
class Role:
    """Semantic capability class required to realize work."""

    name: str
    tags: tuple[str, ...] = ()
    policy_hooks: dict = field(default_factory=dict)
    id: str = field(default_factory=lambda: _mint_id("role"), compare=False)

    def __post_init__(self) -> None:
        if not self.name.strip():
            raise ValueError("Role.name must not be empty")


@dataclass(frozen=True, slots=True)
class Job:
    """Durable semantic work contract."""

    name: str
    contracts: tuple[ContractRef, ...]
    roles: tuple[Role, ...] = ()
    tags: tuple[str, ...] = ()
    id: str = field(default_factory=lambda: _mint_id("job"), compare=False)

    def __post_init__(self) -> None:
        if not self.name.strip():
            raise ValueError("Job.name must not be empty")
        if not self.contracts:
            raise ValueError("Job.contracts must not be empty")
