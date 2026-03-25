# Validates: REQ-L-GTL2-JOB
# Validates: REQ-L-GTL2-ROLE
# Validates: REQ-R-ABG2-WORKER
# Validates: REQ-R-ABG2-BINDING
# Validates: REQ-R-ABG2-RUN
"""
ADR-030 QA proof obligations.

Tests the Job/Role/Worker/Run binding surface introduced by ADR-030.
Maps to the 14 proof obligations listed in the ADR.
"""
import dataclasses
import pytest

from gtl.graph import Graph, Node, GraphVector, Context
from gtl.function_model import GraphFunction
from gtl.operator_model import Evaluator, F_D, F_P, F_H
from gtl.module_model import Module
from gtl.work_model import Job, Role, ContractRef

from genesis.binding import ExecutableJob, Worker, WorkSurface
from genesis.events import EventStream
from genesis.run import RunState, run_state, find_pending_run, RUN_STATES
from genesis.services import module_to_executable_jobs, Scope, gen_iterate


# ── Fixtures ────────────────────────────────────────────────────────────────

def _make_role(name="constructor", tags=("f_p",)):
    return Role(name=name, tags=tags)


def _make_module_with_roles():
    """Module with explicit roles and jobs — the ADR-030 conformant shape."""
    src = Node(name="design")
    tgt = Node(name="code")
    ev = Evaluator("code_complete", F_P, "Agent constructs code")
    vec = GraphVector(
        name="design->code",
        source=src, target=tgt,
        evaluators=(ev,),
    )
    graph = Graph(
        name="sdlc", inputs=(src,), outputs=(tgt,),
        nodes=(src, tgt), vectors=(vec,),
    )
    role_constructor = Role(name="constructor", tags=("f_p",))
    job = Job(
        name="design->code",
        contracts=(ContractRef(kind="graph_vector", target_id=vec.id),),
        roles=(role_constructor,),
    )
    module = Module(
        name="test_module",
        graphs=(graph,),
        jobs=(job,),
        roles=(role_constructor,),
    )
    return module, role_constructor, job, vec


def _make_unconstrained_job_module():
    """Module with a role-unconstrained job (roles=())."""
    src = Node(name="intent")
    tgt = Node(name="requirements")
    ev = Evaluator("intent_approved", F_H, "Human confirms intent")
    vec = GraphVector(
        name="intent->requirements",
        source=src, target=tgt,
        evaluators=(ev,),
    )
    graph = Graph(
        name="sdlc", inputs=(src,), outputs=(tgt,),
        nodes=(src, tgt), vectors=(vec,),
    )
    job = Job(
        name="intent->requirements",
        contracts=(ContractRef(kind="graph_vector", target_id=vec.id),),
        roles=(),  # explicitly unconstrained
    )
    module = Module(
        name="test_unconstrained",
        graphs=(graph,),
        jobs=(job,),
    )
    return module, job, vec


def _open_stream(workspace):
    events_dir = workspace / ".ai-workspace" / "events"
    events_dir.mkdir(parents=True, exist_ok=True)
    return EventStream.open(workspace)


# ── §1: Job, Role, ContractRef are frozen, id-bearing GTL declarations ──────

@pytest.mark.integration
class TestADR030ContractTypes:
    """QA-1: Job, Role, and ContractRef are frozen, id-bearing GTL declarations."""

    def test_job_is_frozen(self):
        job = Job(name="test")
        with pytest.raises(dataclasses.FrozenInstanceError):
            job.name = "changed"

    def test_role_is_frozen(self):
        role = Role(name="test")
        with pytest.raises(dataclasses.FrozenInstanceError):
            role.name = "changed"

    def test_contract_ref_is_frozen(self):
        ref = ContractRef(kind="graph_vector", target_id="abc")
        with pytest.raises(dataclasses.FrozenInstanceError):
            ref.kind = "changed"

    def test_job_has_auto_minted_id(self):
        job = Job(name="test")
        assert job.id
        assert isinstance(job.id, str)

    def test_role_has_auto_minted_id(self):
        role = Role(name="test")
        assert role.id
        assert isinstance(role.id, str)

    def test_distinct_jobs_get_distinct_ids(self):
        j1 = Job(name="same")
        j2 = Job(name="same")
        assert j1.id != j2.id

    def test_distinct_roles_get_distinct_ids(self):
        r1 = Role(name="same")
        r2 = Role(name="same")
        assert r1.id != r2.id


# ── §2: Module owns jobs and roles ──────────────────────────────────────────

@pytest.mark.integration
class TestADR030ModuleOwnership:
    """QA-2: Module owns jobs and roles; import surfaces preserve them."""

    def test_module_carries_jobs(self):
        module, _, job, _ = _make_module_with_roles()
        assert job in module.jobs

    def test_module_carries_roles(self):
        module, role, _, _ = _make_module_with_roles()
        assert role in module.roles

    def test_module_jobs_default_empty(self):
        m = Module(name="empty")
        assert m.jobs == ()

    def test_module_roles_default_empty(self):
        m = Module(name="empty")
        assert m.roles == ()


# ── §3: Explicit GTL jobs resolve to ExecutableJobs ─────────────────────────

@pytest.mark.integration
class TestADR030Resolution:
    """QA-3/4: GTL jobs resolve to ExecutableJobs; bad refs fail closed."""

    def test_explicit_jobs_resolve(self):
        module, _, _, vec = _make_module_with_roles()
        exe_jobs = module_to_executable_jobs(module)
        assert len(exe_jobs) == 1
        assert exe_jobs[0].vector.id == vec.id

    def test_no_jobs_fails_closed(self):
        """Module without explicit jobs raises ValueError."""
        src = Node(name="a")
        tgt = Node(name="b")
        ev = Evaluator("test", F_D, "test", binding="exec://true")
        vec = GraphVector(name="a->b", source=src, target=tgt, evaluators=(ev,))
        graph = Graph(name="g", inputs=(src,), outputs=(tgt,), nodes=(src, tgt), vectors=(vec,))
        module = Module(name="empty_jobs", graphs=(graph,))
        with pytest.raises(ValueError, match="no explicit jobs"):
            module_to_executable_jobs(module)

    def test_unsupported_contract_kind_fails_closed(self):
        """Unsupported contract kind raises ValueError."""
        src = Node(name="a")
        tgt = Node(name="b")
        ev = Evaluator("test", F_D, "test", binding="exec://true")
        vec = GraphVector(name="a->b", source=src, target=tgt, evaluators=(ev,))
        graph = Graph(name="g", inputs=(src,), outputs=(tgt,), nodes=(src, tgt), vectors=(vec,))
        bad_job = Job(name="bad", contracts=(ContractRef(kind="graph", target_id=vec.id),))
        module = Module(name="bad_kind", graphs=(graph,), jobs=(bad_job,))
        with pytest.raises(ValueError, match="graph_vector"):
            module_to_executable_jobs(module)

    def test_unknown_target_id_fails_closed(self):
        """Unknown target_id raises ValueError."""
        src = Node(name="a")
        tgt = Node(name="b")
        ev = Evaluator("test", F_D, "test", binding="exec://true")
        vec = GraphVector(name="a->b", source=src, target=tgt, evaluators=(ev,))
        graph = Graph(name="g", inputs=(src,), outputs=(tgt,), nodes=(src, tgt), vectors=(vec,))
        bad_job = Job(name="bad", contracts=(ContractRef(kind="graph_vector", target_id="nonexistent"),))
        module = Module(name="bad_id", graphs=(graph,), jobs=(bad_job,))
        with pytest.raises(ValueError, match="does not resolve"):
            module_to_executable_jobs(module)


# ── §5: Worker eligibility — conjunctive ────────────────────────────────────

@pytest.mark.integration
class TestADR030Eligibility:
    """QA-5/12: Worker eligibility is conjunctive; fails closed on role mismatch."""

    def test_eligible_worker_with_matching_role(self):
        module, role, _, _ = _make_module_with_roles()
        exe_jobs = module_to_executable_jobs(module)
        worker = Worker(id="w1", can_execute=exe_jobs, role_ids=(role.id,))
        assert worker.is_eligible(exe_jobs[0])

    def test_ineligible_worker_missing_role(self):
        """QA-12: worker with can_execute match but missing role fails closed."""
        module, _, _, _ = _make_module_with_roles()
        exe_jobs = module_to_executable_jobs(module)
        worker = Worker(id="w1", can_execute=exe_jobs, role_ids=())  # no roles
        assert not worker.is_eligible(exe_jobs[0])

    def test_ineligible_worker_wrong_role(self):
        module, _, _, _ = _make_module_with_roles()
        exe_jobs = module_to_executable_jobs(module)
        other_role = Role(name="reviewer")
        worker = Worker(id="w1", can_execute=exe_jobs, role_ids=(other_role.id,))
        assert not worker.is_eligible(exe_jobs[0])

    def test_eligible_worker_unconstrained_job(self):
        """Role-unconstrained jobs (roles=()) are eligible for any worker."""
        module, job, vec = _make_unconstrained_job_module()
        exe_jobs = module_to_executable_jobs(module)
        worker = Worker(id="w1", can_execute=exe_jobs, role_ids=())
        assert worker.is_eligible(exe_jobs[0])

    def test_ineligible_worker_not_in_can_execute(self):
        """Job not in can_execute is ineligible regardless of roles."""
        module, role, _, _ = _make_module_with_roles()
        exe_jobs = module_to_executable_jobs(module)
        # Make a different module/job set for the worker
        module2, _, _, _ = _make_module_with_roles()
        exe_jobs2 = module_to_executable_jobs(module2)
        worker = Worker(id="w1", can_execute=exe_jobs2, role_ids=(role.id,))
        assert not worker.is_eligible(exe_jobs[0])


# ── §6: run_bound event and binding identity ────────────────────────────────

@pytest.mark.integration
class TestADR030RunBound:
    """QA-6/13: run_bound preserves binding identity and precedes run_started."""

    def test_run_bound_carries_binding_identity(self):
        """QA-6: run_bound preserves job_id, run_id, worker_id, role_id."""
        events = [
            {"event_type": "run_bound", "data": {
                "run_id": "r1", "edge": "a->b",
                "job_id": "j1", "worker_id": "w1",
                "role_id": "role1", "authority_ref": "auth1",
            }},
            {"event_type": "run_started", "data": {
                "run_id": "r1", "edge": "a->b",
                "job_id": "j1", "worker_id": "w1",
            }},
        ]
        rs = run_state(events, "r1")
        assert rs is not None
        assert rs.job_id == "j1"
        assert rs.worker_id == "w1"
        assert rs.role_id == "role1"
        assert rs.authority_ref == "auth1"

    def test_run_bound_precedes_run_started(self):
        """QA-13: run_bound precedes run_started — binding identity available before lifecycle."""
        events = [
            {"event_type": "run_bound", "data": {
                "run_id": "r1", "edge": "a->b",
                "job_id": "j1", "worker_id": "w1",
                "role_id": "role1",
            }},
            {"event_type": "run_started", "data": {
                "run_id": "r1", "edge": "a->b",
                "job_id": "j1", "worker_id": "w1",
            }},
        ]
        # run_bound does not set state — state comes from run_started
        rs = run_state(events, "r1")
        assert rs.state == "started"
        assert rs.role_id == "role1"

    def test_run_bound_does_not_set_lifecycle_state(self):
        """run_bound alone (without run_started) still produces a RunState
        with binding identity but no lifecycle state from run_bound itself."""
        events = [
            {"event_type": "run_bound", "data": {
                "run_id": "r1", "edge": "a->b",
                "job_id": "j1", "worker_id": "w1",
            }},
        ]
        # run_bound doesn't set state — returns None since no lifecycle event
        rs = run_state(events, "r1")
        assert rs is None

    def test_gen_iterate_emits_run_bound_before_run_started(self, tmp_path):
        """QA-13: live iterate path emits binding before lifecycle start."""
        module, role, _, _ = _make_module_with_roles()
        exe_jobs = module_to_executable_jobs(module)
        worker = Worker(id="w1", can_execute=exe_jobs, role_ids=(role.id,))
        scope = Scope(module=module, workspace_root=tmp_path, worker=worker)
        stream = _open_stream(tmp_path)

        result = gen_iterate(scope, stream)
        assert result["status"] == "iterated"

        event_types = [e["event_type"] for e in stream.all_events()]
        assert "run_bound" in event_types
        assert "run_started" in event_types
        assert event_types.index("run_bound") < event_types.index("run_started")


# ── §7: Duplicate labels with distinct ids ──────────────────────────────────

@pytest.mark.integration
class TestADR030IdentityNonAliasing:
    """QA-7: duplicate labels with distinct ids do not alias."""

    def test_same_name_jobs_have_distinct_ids(self):
        j1 = Job(name="design->code")
        j2 = Job(name="design->code")
        assert j1.id != j2.id

    def test_same_name_roles_have_distinct_ids(self):
        r1 = Role(name="constructor")
        r2 = Role(name="constructor")
        assert r1.id != r2.id


# ── §8: Regression — conflict scheduling semantics survive role introduction ─

@pytest.mark.integration
class TestADR030SchedulingRegression:
    """QA-8: role introduction does not change write-territory conflict semantics."""

    def test_disjoint_write_territories_do_not_conflict(self):
        a = Node(name="a")
        b = Node(name="b")
        c = Node(name="c")
        d = Node(name="d")
        ev = Evaluator("ok", F_D, "ok", binding="exec://true")
        j1 = ExecutableJob(
            job=Job(name="j1"),
            vector=GraphVector(name="a->b", source=a, target=b, evaluators=(ev,)),
        )
        j2 = ExecutableJob(
            job=Job(name="j2"),
            vector=GraphVector(name="c->d", source=c, target=d, evaluators=(ev,)),
        )
        r = Role(name="constructor")
        w1 = Worker(id="w1", can_execute=[j1], role_ids=(r.id,))
        w2 = Worker(id="w2", can_execute=[j2], role_ids=())
        assert not w1.conflicts_with(w2)

    def test_overlapping_write_territories_still_conflict(self):
        a = Node(name="a")
        b = Node(name="b")
        c = Node(name="c")
        ev = Evaluator("ok", F_D, "ok", binding="exec://true")
        j1 = ExecutableJob(
            job=Job(name="j1"),
            vector=GraphVector(name="a->b", source=a, target=b, evaluators=(ev,)),
        )
        j2 = ExecutableJob(
            job=Job(name="j2"),
            vector=GraphVector(name="c->b", source=c, target=b, evaluators=(ev,)),
        )
        r = Role(name="constructor")
        w1 = Worker(id="w1", can_execute=[j1], role_ids=(r.id,))
        w2 = Worker(id="w2", can_execute=[j2], role_ids=())
        assert w1.conflicts_with(w2)


# ── §9: WorkSurface immutability ────────────────────────────────────────────

@pytest.mark.integration
class TestADR030WorkSurface:
    """QA-9: immutable WorkSurface carries events, artifacts, context."""

    def test_worksurface_is_frozen(self):
        ws = WorkSurface(events=(), artifacts=(), context_consumed=())
        with pytest.raises(dataclasses.FrozenInstanceError):
            ws.events = ()

    def test_worksurface_fields_are_tuples(self):
        ws = WorkSurface(
            events=({"event_type": "test", "data": {}},),
            artifacts=("artifact.json",),
            context_consumed=(),
        )
        assert isinstance(ws.events, tuple)
        assert isinstance(ws.artifacts, tuple)
        assert isinstance(ws.context_consumed, tuple)


# ── §10: queued/pending derivation ──────────────────────────────────────────

@pytest.mark.integration
class TestADR030QueuedPending:
    """QA-10: reducer derives queued and pending when those states are truth."""

    def test_queued_state(self):
        events = [
            {"event_type": "run_queued", "data": {
                "run_id": "r1", "edge": "a->b",
            }},
        ]
        rs = run_state(events, "r1")
        assert rs is not None
        assert rs.state == "queued"

    def test_pending_state(self):
        events = [
            {"event_type": "run_queued", "data": {
                "run_id": "r1", "edge": "a->b",
            }},
            {"event_type": "run_pending", "data": {
                "run_id": "r1", "edge": "a->b",
            }},
        ]
        rs = run_state(events, "r1")
        assert rs is not None
        assert rs.state == "pending"

    def test_queued_to_started_transition(self):
        events = [
            {"event_type": "run_queued", "data": {"run_id": "r1", "edge": "a->b"}},
            {"event_type": "run_pending", "data": {"run_id": "r1", "edge": "a->b"}},
            {"event_type": "run_started", "data": {"run_id": "r1", "edge": "a->b"}},
        ]
        rs = run_state(events, "r1")
        assert rs.state == "started"

    def test_find_pending_run_finds_queued(self):
        events = [
            {"event_type": "run_queued", "data": {
                "run_id": "r1", "edge": "a->b",
            }},
        ]
        rs = find_pending_run(events, "a->b")
        assert rs is not None
        assert rs.state == "queued"

    def test_queued_and_pending_are_valid_run_states(self):
        assert "queued" in RUN_STATES
        assert "pending" in RUN_STATES


# ── §11: Domain-package role authorship ─────────────────────────────────────

@pytest.mark.integration
class TestADR030DomainPackageConformance:
    """QA-11: shipped modules declare explicit roles and jobs bind them."""

    def test_abiogenesis_module_has_roles(self):
        from gtl_spec.packages.abiogenesis import module
        assert module.roles, "abiogenesis module must declare roles"

    def test_abiogenesis_jobs_have_explicit_role_binding(self):
        """Every job either has roles or explicitly declares roles=()."""
        from gtl_spec.packages.abiogenesis import module
        for job in module.jobs:
            # roles is always a tuple — () is explicit unconstrained
            assert isinstance(job.roles, tuple), f"Job {job.name} roles must be a tuple"

    def test_project_package_module_has_roles(self):
        from gtl_spec.packages.project_package import module
        assert module.roles, "project_package module must declare roles"

    def test_genesis_core_module_has_roles(self):
        from gtl_spec.packages.genesis_core import module
        assert module.roles, "genesis_core module must declare roles"

    def test_abiogenesis_fp_jobs_require_constructor(self):
        """Jobs with F_P evaluators require the constructor role."""
        from gtl_spec.packages.abiogenesis import module
        exe_jobs = module_to_executable_jobs(module)
        for ej in exe_jobs:
            has_fp = any(ev.regime is F_P for ev in ej.evaluators)
            if has_fp:
                assert ej.job.roles, (
                    f"Job {ej.job.name} has F_P evaluators but no required roles"
                )


# ── §14: Provenance hash stability ─────────────────────────────────────────

@pytest.mark.integration
class TestADR030ProvenanceStability:
    """QA-14: same authored module yields same provenance hash."""

    def test_hash_stable_across_rematerialization(self):
        """Same module declaration produces the same hash even with new ids."""
        from genesis.provenance import executable_job_hash

        # Build the module twice — each gets fresh UUIDs
        def make():
            src = Node(name="design")
            tgt = Node(name="code")
            ev = Evaluator("code_complete", F_P, "Agent constructs code")
            vec = GraphVector(name="design->code", source=src, target=tgt, evaluators=(ev,))
            graph = Graph(name="sdlc", inputs=(src,), outputs=(tgt,), nodes=(src, tgt), vectors=(vec,))
            role = Role(name="constructor", tags=("f_p",))
            job = Job(
                name="design->code",
                contracts=(ContractRef(kind="graph_vector", target_id=vec.id),),
                roles=(role,),
            )
            module = Module(name="test", graphs=(graph,), jobs=(job,), roles=(role,))
            return module_to_executable_jobs(module)[0]

        ej1 = make()
        ej2 = make()

        # ids differ
        assert ej1.job.id != ej2.job.id

        # but hashes are stable (use names, not ids)
        h1 = executable_job_hash(ej1)
        h2 = executable_job_hash(ej2)
        assert h1 == h2


# ── Live semantic gaps — encoded as proof obligations ────────────────────────

@pytest.mark.integration
class TestADR030LiveDispatchEligibility:
    """Dispatch path must enforce worker eligibility before binding."""

    def test_gen_iterate_fails_closed_when_worker_lacks_required_role(self, tmp_path):
        module, _, _, _ = _make_module_with_roles()
        exe_jobs = module_to_executable_jobs(module)
        worker = Worker(id="w1", can_execute=exe_jobs, role_ids=())
        scope = Scope(module=module, workspace_root=tmp_path, worker=worker)
        stream = _open_stream(tmp_path)

        result = gen_iterate(scope, stream)
        assert result["status"] == "converged"
        event_types = [e["event_type"] for e in stream.all_events()]
        assert "run_bound" not in event_types
        assert "run_started" not in event_types


@pytest.mark.integration
class TestADR030SelectionRolePreservation:
    """Refinement that synthesizes jobs preserves role-conformant authorship."""

    def test_refinement_preserves_roles_for_synthesized_fp_jobs(self, tmp_path):
        design = Node(name="design")
        plan = Node(name="plan")
        code = Node(name="code")

        outer_eval = Evaluator("coarse_gap", F_P, "Agent refines coarse design")
        outer_vec = GraphVector(
            name="design->code",
            source=design,
            target=code,
            evaluators=(outer_eval,),
        )
        outer_graph = Graph(
            name="outer",
            inputs=(design,),
            outputs=(code,),
            nodes=(design, code),
            vectors=(outer_vec,),
        )

        role = Role(name="constructor", tags=("f_p",))
        outer_job = Job(
            name="design->code",
            contracts=(ContractRef(kind="graph_vector", target_id=outer_vec.id),),
            roles=(role,),
        )

        inner_eval_1 = Evaluator("plan_gap", F_P, "Agent produces plan")
        inner_eval_2 = Evaluator("code_gap", F_P, "Agent produces code")

        def make_inner():
            v1 = GraphVector(
                name="design->plan",
                source=design,
                target=plan,
                evaluators=(inner_eval_1,),
            )
            v2 = GraphVector(
                name="plan->code",
                source=plan,
                target=code,
                evaluators=(inner_eval_2,),
            )
            return Graph(
                name="inner",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, plan, code),
                vectors=(v1, v2),
            )

        refiner = GraphFunction(
            name="refine_design_code",
            inputs=(design,),
            outputs=(code,),
            template=make_inner,
        )

        module = Module(
            name="refinement_test",
            graphs=(outer_graph,),
            graph_functions=(refiner,),
            jobs=(outer_job,),
            roles=(role,),
        )
        scope = Scope(module=module, workspace_root=tmp_path)
        stream = _open_stream(tmp_path)

        result = gen_iterate(scope, stream)
        assert result["status"] == "selected"

        exe_jobs = module_to_executable_jobs(scope.module)
        for ej in exe_jobs:
            has_fp = any(ev.regime is F_P for ev in ej.evaluators)
            if has_fp:
                assert ej.job.roles, (
                    f"Synthesized F_P job {ej.job.name!r} must preserve explicit role authorship"
                )
