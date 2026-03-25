"""ABG runtime work model for the codex build."""

from __future__ import annotations

from dataclasses import dataclass, field, replace

from gtl.core import Context, Edge, Evaluator
from gtl.work_model import Job as SemanticJob


@dataclass(slots=True)
class ExecutableJob:
    """Executable realization of one semantic job against one edge."""

    job: SemanticJob
    edge: Edge
    evaluators: list[Evaluator] = field(default_factory=list)

    def __post_init__(self) -> None:
        if not self.evaluators:
            raise ValueError(
                f"ExecutableJob '{self.edge.name}': evaluators must not be empty"
            )

    @property
    def source_type(self):
        return self.edge.source

    @property
    def target_type(self):
        return self.edge.target

    @property
    def required_role_ids(self) -> tuple[str, ...]:
        return tuple(role.id for role in self.job.roles)


@dataclass(slots=True)
class Worker:
    """Concrete actor identity with executable capability and role hooks."""

    id: str
    can_execute: list[ExecutableJob] = field(default_factory=list)
    role_ids: tuple[str, ...] = ()
    authority_ref: str | None = None

    def __post_init__(self) -> None:
        if not self.can_execute:
            raise ValueError(f"Worker '{self.id}': can_execute must not be empty")

    @property
    def writable_types(self) -> set[str]:
        return {job.target_type.name for job in self.can_execute}

    @property
    def readable_types(self) -> set[str]:
        result: set[str] = set()
        for job in self.can_execute:
            src = job.source_type
            if isinstance(src, list):
                result.update(asset.name for asset in src)
            else:
                result.add(src.name)
        return result

    def conflicts_with(self, other: "Worker") -> bool:
        return bool(self.writable_types & other.writable_types)

    def can_bind(self, executable_job: ExecutableJob) -> bool:
        required = set(executable_job.required_role_ids)
        return not required or required.issubset(set(self.role_ids))


@dataclass(frozen=True, slots=True)
class WorkSurface:
    """Immutable execution dossier and elastic context carrier."""

    stage: str
    job_id: str | None = None
    worker_id: str | None = None
    role_id: str | None = None
    authority_ref: str | None = None
    events: tuple[dict, ...] = ()
    artifacts: tuple[str, ...] = ()
    context_consumed: tuple[Context, ...] = ()
    context_emitted: tuple[Context, ...] = ()
    findings: tuple[dict, ...] = ()
    attestations: tuple[dict, ...] = ()

    def is_auditable(self) -> bool:
        return bool(self.artifacts or self.events)

    def at_stage(self, stage: str) -> "WorkSurface":
        return replace(self, stage=stage)

    def with_event(self, event: dict) -> "WorkSurface":
        return replace(self, events=self.events + (event,))

    def with_artifact(self, artifact: str) -> "WorkSurface":
        return replace(self, artifacts=self.artifacts + (artifact,))

    def with_emitted_context(self, context: Context) -> "WorkSurface":
        return replace(self, context_emitted=self.context_emitted + (context,))

    def with_finding(self, finding: dict) -> "WorkSurface":
        return replace(self, findings=self.findings + (finding,))

    def with_attestation(self, attestation: dict) -> "WorkSurface":
        return replace(self, attestations=self.attestations + (attestation,))
