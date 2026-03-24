# Validates: REQ-F-FRAG-001
# Validates: REQ-F-FRAG-002
# Validates: REQ-F-FRAG-003
# Validates: REQ-F-FRAG-004
"""Tests for Fragment, zoom, spawn, parent_converged (ADR-025)."""
import pytest
from pathlib import Path

from gtl.core import (
    Asset, Context, Edge, Evaluator, Fragment, Job, Operator, Package, Worker,
    F_D, F_H, F_P,
)
from genesis.core import EventStream, workspace_bootstrap
from genesis.schedule import WorkInstance, delta, spawn, zoom, zoom_event, parent_converged
from genesis.commands import active_work_keys


# ── Helpers ──────────────────────────────────────────────────────────────────

def _op():
    return Operator("agent", F_P, "agent://test")


def _fd_ev(name="check", cmd="true"):
    return Evaluator(name, F_D, f"deterministic: {name}", command=cmd)


def _fp_ev(name="quality"):
    return Evaluator(name, F_P, f"agent: {name}")


def _fh_ev(name="review"):
    return Evaluator(name, F_H, f"human: {name}")


# ── Fragment type (REQ-F-FRAG-001) ───────────────────────────────────────────

class TestFragmentType:
    def test_basic_fragment_creation(self):
        """Fragment with inputs, outputs, and internal structure."""
        a_in = Asset(name="design", id_format="d-{id}")
        a_out = Asset(name="code", id_format="c-{id}")
        a_mid = Asset(name="modules", id_format="m-{id}")
        op = _op()

        frag = Fragment(
            name="decomp",
            inputs=(a_in,),
            outputs=(a_out,),
            assets=(a_mid,),
            edges=(
                Edge(name="d→m", source=a_in, target=a_mid, using=[op]),
                Edge(name="m→c", source=a_mid, target=a_out, using=[op]),
            ),
        )

        assert frag.name == "decomp"
        assert len(frag.inputs) == 1
        assert len(frag.outputs) == 1
        assert len(frag.assets) == 1
        assert len(frag.edges) == 2

    def test_fragment_is_frozen(self):
        """Fragment is immutable."""
        frag = Fragment(
            name="f",
            outputs=(Asset(name="out", id_format="o-{id}"),),
        )
        with pytest.raises(AttributeError):
            frag.name = "changed"

    def test_fragment_all_assets(self):
        """all_assets returns inputs + outputs + internal."""
        a_in = Asset(name="in", id_format="i-{id}")
        a_out = Asset(name="out", id_format="o-{id}")
        a_int = Asset(name="internal", id_format="x-{id}")
        frag = Fragment(
            name="f",
            inputs=(a_in,),
            outputs=(a_out,),
            assets=(a_int,),
        )
        names = {a.name for a in frag.all_assets}
        assert names == {"in", "out", "internal"}

    def test_fragment_requires_output(self):
        """Fragment with no outputs is rejected."""
        with pytest.raises(ValueError, match="must have at least one output"):
            Fragment(name="bad", inputs=(), outputs=())

    def test_fragment_validates_edge_scope(self):
        """Fragment rejects edges referencing assets outside its scope."""
        a_in = Asset(name="in", id_format="i-{id}")
        a_out = Asset(name="out", id_format="o-{id}")
        a_external = Asset(name="external", id_format="e-{id}")
        op = _op()

        with pytest.raises(ValueError, match="not in fragment scope"):
            Fragment(
                name="bad",
                inputs=(a_in,),
                outputs=(a_out,),
                edges=(
                    Edge(name="bad_edge", source=a_external, target=a_out, using=[op]),
                ),
            )

    def test_fragment_with_contexts(self):
        """Fragment can carry context references."""
        a_out = Asset(name="out", id_format="o-{id}")
        ctx = Context(
            name="spec",
            locator="workspace://spec.md",
            digest="sha256:" + "0" * 64,
        )
        frag = Fragment(
            name="f",
            outputs=(a_out,),
            contexts=(ctx,),
        )
        assert len(frag.contexts) == 1
        assert frag.contexts[0].name == "spec"


# ── Fragment composition into Package (REQ-F-FRAG-002) ──────────────────────

class TestFragmentComposition:
    def test_package_with_fragment(self):
        """Package accepts fragments and validates composition."""
        design = Asset(name="design", id_format="d-{id}")
        code = Asset(name="code", id_format="c-{id}")
        modules = Asset(name="modules", id_format="m-{id}")
        op = _op()

        frag = Fragment(
            name="decomp",
            inputs=(design,),
            outputs=(code,),
            assets=(modules,),
            edges=(
                Edge(name="d→m", source=design, target=modules, using=[op]),
                Edge(name="m→c", source=modules, target=code, using=[op]),
            ),
        )

        pkg = Package(
            name="test",
            assets=[design, code],
            edges=[],
            operators=[op],
            fragments=[frag],
        )
        assert len(pkg.fragments) == 1

    def test_package_v1_no_fragments(self):
        """V1 package with empty fragments works unchanged."""
        src = Asset(name="src", id_format="s-{id}")
        tgt = Asset(name="tgt", id_format="t-{id}")
        op = _op()
        ev = _fd_ev()

        pkg = Package(
            name="v1",
            assets=[src, tgt],
            edges=[Edge(name="s→t", source=src, target=tgt, using=[op])],
            operators=[op],
        )
        assert pkg.fragments == []

    def test_composition_rejects_unsatisfied_inputs(self):
        """Fragment with input not in package assets is rejected."""
        missing = Asset(name="missing", id_format="m-{id}")
        out = Asset(name="out", id_format="o-{id}")

        frag = Fragment(
            name="bad",
            inputs=(missing,),
            outputs=(out,),
        )

        with pytest.raises(ValueError, match="Fragment 'bad'.*input 'missing'"):
            Package(
                name="test",
                assets=[out],
                edges=[],
                operators=[],
                fragments=[frag],
            )

    def test_composition_sequential_fragments(self):
        """Two fragments compose sequentially: first's outputs feed second's inputs."""
        a = Asset(name="a", id_format="a-{id}")
        b = Asset(name="b", id_format="b-{id}")
        c = Asset(name="c", id_format="c-{id}")
        op = _op()

        frag1 = Fragment(
            name="f1",
            inputs=(a,),
            outputs=(b,),
            edges=(Edge(name="a→b", source=a, target=b, using=[op]),),
        )
        frag2 = Fragment(
            name="f2",
            inputs=(b,),
            outputs=(c,),
            edges=(Edge(name="b→c", source=b, target=c, using=[op]),),
        )

        pkg = Package(
            name="seq",
            assets=[a, b, c],
            edges=[],
            operators=[op],
            fragments=[frag1, frag2],
        )
        assert len(pkg.fragments) == 2

    def test_composition_rejects_cycles(self):
        """Fragment composition that creates cycles is rejected."""
        a = Asset(name="a", id_format="a-{id}")
        b = Asset(name="b", id_format="b-{id}")
        op = _op()

        # Package has a→b edge, fragment adds b→a edge → cycle
        frag = Fragment(
            name="cyclic",
            inputs=(b,),
            outputs=(a,),
            edges=(Edge(name="b→a", source=b, target=a, using=[op]),),
        )

        with pytest.raises(ValueError, match="cycle"):
            Package(
                name="test",
                assets=[a, b],
                edges=[Edge(name="a→b", source=a, target=b, using=[op])],
                operators=[op],
                fragments=[frag],
            )


# ── Zoom (REQ-F-FRAG-003) ───────────────────────────────────────────────────

class TestZoom:
    def _make_simple_package(self):
        design = Asset(name="design", id_format="d-{id}")
        code = Asset(name="code", id_format="c-{id}")
        op = _op()
        ev = _fd_ev()
        edge = Edge(name="design→code", source=design, target=code, using=[op])
        pkg = Package(
            name="test",
            assets=[design, code],
            edges=[edge],
            operators=[op],
        )
        return pkg, design, code, op, edge

    def test_zoom_replaces_edge_with_fragment(self):
        """zoom() replaces a coarse edge with fragment internals."""
        pkg, design, code, op, edge = self._make_simple_package()

        modules = Asset(name="modules", id_format="m-{id}")
        frag = Fragment(
            name="decomp",
            inputs=(design,),
            outputs=(code,),
            assets=(modules,),
            edges=(
                Edge(name="d→m", source=design, target=modules, using=[op]),
                Edge(name="m→c", source=modules, target=code, using=[op]),
            ),
        )

        zoomed = zoom(pkg, edge, frag)

        edge_names = {e.name for e in zoomed.edges}
        assert "design→code" not in edge_names  # original removed
        assert "d→m" in edge_names  # fragment internals added
        assert "m→c" in edge_names

    def test_zoom_adds_internal_assets(self):
        """zoom() adds fragment internal assets to the package."""
        pkg, design, code, op, edge = self._make_simple_package()

        modules = Asset(name="modules", id_format="m-{id}")
        frag = Fragment(
            name="decomp",
            inputs=(design,),
            outputs=(code,),
            assets=(modules,),
            edges=(
                Edge(name="d→m", source=design, target=modules, using=[op]),
                Edge(name="m→c", source=modules, target=code, using=[op]),
            ),
        )

        zoomed = zoom(pkg, edge, frag)
        asset_names = {a.name for a in zoomed.assets}
        assert "modules" in asset_names

    def test_zoom_rejects_incompatible_inputs(self):
        """zoom() rejects fragment whose inputs don't match edge sources."""
        pkg, design, code, op, edge = self._make_simple_package()

        wrong_input = Asset(name="requirements", id_format="r-{id}")
        frag = Fragment(
            name="bad",
            inputs=(wrong_input,),
            outputs=(code,),
        )

        with pytest.raises(ValueError, match="not provided by edge"):
            zoom(pkg, edge, frag)

    def test_zoom_rejects_incompatible_outputs(self):
        """zoom() rejects fragment whose outputs don't match edge target."""
        pkg, design, code, op, edge = self._make_simple_package()

        wrong_output = Asset(name="tests", id_format="t-{id}")
        frag = Fragment(
            name="bad",
            inputs=(design,),
            outputs=(wrong_output,),
        )

        with pytest.raises(ValueError, match="not in fragment"):
            zoom(pkg, edge, frag)

    def test_zoom_event_provenance(self):
        """zoom_event() constructs the provenance event for the caller to emit."""
        pkg, design, code, op, edge = self._make_simple_package()
        modules = Asset(name="modules", id_format="m-{id}")
        frag = Fragment(
            name="decomp",
            inputs=(design,),
            outputs=(code,),
            assets=(modules,),
            edges=(
                Edge(name="d→m", source=design, target=modules, using=[op]),
                Edge(name="m→c", source=modules, target=code, using=[op]),
            ),
        )

        event = zoom_event(edge, frag)
        assert event["event_type"] == "zoomed"
        assert event["data"]["edge"] == "design→code"
        assert event["data"]["fragment"] == "decomp"
        assert set(event["data"]["internal_edges"]) == {"d→m", "m→c"}

    def test_zoom_preserves_other_edges(self):
        """zoom() only removes the target edge, preserving others."""
        design = Asset(name="design", id_format="d-{id}")
        code = Asset(name="code", id_format="c-{id}")
        tests = Asset(name="tests", id_format="t-{id}")
        op = _op()

        e1 = Edge(name="design→code", source=design, target=code, using=[op])
        e2 = Edge(name="code→tests", source=code, target=tests, using=[op])

        pkg = Package(
            name="test",
            assets=[design, code, tests],
            edges=[e1, e2],
            operators=[op],
        )

        modules = Asset(name="modules", id_format="m-{id}")
        frag = Fragment(
            name="decomp",
            inputs=(design,),
            outputs=(code,),
            assets=(modules,),
            edges=(
                Edge(name="d→m", source=design, target=modules, using=[op]),
                Edge(name="m→c", source=modules, target=code, using=[op]),
            ),
        )

        zoomed = zoom(pkg, e1, frag)
        edge_names = {e.name for e in zoomed.edges}
        assert "code→tests" in edge_names  # preserved
        assert "design→code" not in edge_names  # replaced


# ── Spawn and fold-back (REQ-F-FRAG-004) ─────────────────────────────────────

class TestSpawn:
    def test_spawn_creates_child_key(self):
        """spawn() appends segment to parent key."""
        child = spawn("INT-001/REQ-042", "module.auth")
        assert child == "INT-001/REQ-042/module.auth"

    def test_spawn_single_level(self):
        """spawn() works with top-level parent."""
        child = spawn("REQ-F-AUTH", "login")
        assert child == "REQ-F-AUTH/login"

    def test_spawn_multi_level(self):
        """spawn() supports deep nesting."""
        l1 = spawn("root", "a")
        l2 = spawn(l1, "b")
        l3 = spawn(l2, "c")
        assert l3 == "root/a/b/c"


class TestParentConverged:
    def _make_fh_job(self):
        src = Asset(name="src", id_format="s-{id}")
        tgt = Asset(name="tgt", id_format="t-{id}")
        op = Operator("agent", F_H, "fh://review")
        ev = _fh_ev()
        edge = Edge(name="src→tgt", source=src, target=tgt, using=[op])
        return Job(edge=edge, evaluators=[ev])

    def test_parent_converged_no_children(self, tmp_path):
        """Parent with no children checks directly."""
        stream = workspace_bootstrap(tmp_path)
        job = self._make_fh_job()

        # Not converged — F_H evaluator not approved
        assert parent_converged("REQ-F-AUTH", stream, [job], tmp_path) is False

        # Approve
        stream.append("approved", {
            "kind": "fh_review", "edge": "src→tgt", "actor": "human",
        })
        assert parent_converged("REQ-F-AUTH", stream, [job], tmp_path) is True

    def test_parent_converged_with_children(self, tmp_path):
        """Parent is converged only when all children are converged."""
        stream = workspace_bootstrap(tmp_path)
        job = self._make_fh_job()

        # Spawn two children
        stream.append("work_spawned", {
            "parent_key": "REQ-F-AUTH",
            "child_key": "REQ-F-AUTH/login",
            "fragment": "auth_decomp",
        })
        stream.append("work_spawned", {
            "parent_key": "REQ-F-AUTH",
            "child_key": "REQ-F-AUTH/signup",
            "fragment": "auth_decomp",
        })

        # Neither child approved — parent not converged
        assert parent_converged("REQ-F-AUTH", stream, [job], tmp_path) is False

        # Approve one child — still not converged
        stream.append("approved", {
            "kind": "fh_review", "edge": "src→tgt", "actor": "human",
            "work_key": "REQ-F-AUTH/login",
        })
        assert parent_converged("REQ-F-AUTH", stream, [job], tmp_path) is False

        # Approve second child — now converged
        stream.append("approved", {
            "kind": "fh_review", "edge": "src→tgt", "actor": "human",
            "work_key": "REQ-F-AUTH/signup",
        })
        assert parent_converged("REQ-F-AUTH", stream, [job], tmp_path) is True


# ── active_work_keys with spawned children (ADR-025 + ADR-024) ──────────────

class TestActiveWorkKeysSpawn:
    def test_discovers_spawned_children(self, tmp_path):
        """active_work_keys discovers child work_keys from work_spawned events."""
        stream = workspace_bootstrap(tmp_path)

        # Write a feature vector
        active = tmp_path / ".ai-workspace" / "features" / "active"
        active.mkdir(parents=True, exist_ok=True)
        (active / "REQ-F-AUTH.yml").write_text(
            "id: REQ-F-AUTH\ntitle: test\nstatus: active\nsatisfies: []\n"
        )

        # No spawn yet — only feature
        keys = active_work_keys(tmp_path, stream)
        assert keys == ["REQ-F-AUTH"]

        # Spawn a child
        stream.append("work_spawned", {
            "parent_key": "REQ-F-AUTH",
            "child_key": "REQ-F-AUTH/login",
            "fragment": "auth_decomp",
        })

        keys = active_work_keys(tmp_path, stream)
        assert "REQ-F-AUTH" in keys
        assert "REQ-F-AUTH/login" in keys

    def test_no_stream_v1_behavior(self, tmp_path):
        """Without stream, active_work_keys returns only feature vectors."""
        workspace_bootstrap(tmp_path)
        active = tmp_path / ".ai-workspace" / "features" / "active"
        active.mkdir(parents=True, exist_ok=True)
        (active / "FEAT-001.yml").write_text(
            "id: FEAT-001\ntitle: test\nstatus: active\nsatisfies: []\n"
        )

        keys = active_work_keys(tmp_path)
        assert keys == ["FEAT-001"]

    def test_empty_workspace(self, tmp_path):
        """Empty workspace returns empty list."""
        workspace_bootstrap(tmp_path)
        keys = active_work_keys(tmp_path)
        assert keys == []


# ── WorkInstance with work_key (ADR-024 integration) ─────────────────────────

class TestWorkInstanceIntegration:
    def test_work_instance_creation(self):
        """WorkInstance pairs job with work_key and generates run_id."""
        src = Asset(name="src", id_format="s-{id}")
        tgt = Asset(name="tgt", id_format="t-{id}")
        op = _op()
        ev = _fd_ev()
        edge = Edge(name="s→t", source=src, target=tgt, using=[op])
        job = Job(edge=edge, evaluators=[ev])

        wi = WorkInstance(job=job, work_key="REQ-F-AUTH")
        assert wi.job is job
        assert wi.work_key == "REQ-F-AUTH"
        assert wi.run_id  # auto-generated

    def test_work_instance_v1_degenerate(self):
        """WorkInstance with None work_key is V1 degenerate case."""
        src = Asset(name="src", id_format="s-{id}")
        tgt = Asset(name="tgt", id_format="t-{id}")
        op = _op()
        ev = _fd_ev()
        edge = Edge(name="s→t", source=src, target=tgt, using=[op])
        job = Job(edge=edge, evaluators=[ev])

        wi = WorkInstance(job=job)
        assert wi.work_key is None
        assert wi.run_id  # still has run_id

    def test_work_instance_unique_run_ids(self):
        """Each WorkInstance gets a unique run_id."""
        src = Asset(name="src", id_format="s-{id}")
        tgt = Asset(name="tgt", id_format="t-{id}")
        op = _op()
        ev = _fd_ev()
        edge = Edge(name="s→t", source=src, target=tgt, using=[op])
        job = Job(edge=edge, evaluators=[ev])

        wi1 = WorkInstance(job=job, work_key="k")
        wi2 = WorkInstance(job=job, work_key="k")
        assert wi1.run_id != wi2.run_id


# ── delta fold-back integration (Finding 2 fix) ─────────────────────────────

class TestDeltaFoldBack:
    """delta() transparently delegates to children when work_key has spawned descendants."""

    def _make_fh_job(self):
        src = Asset(name="src", id_format="s-{id}")
        tgt = Asset(name="tgt", id_format="t-{id}")
        op = Operator("agent", F_H, "fh://review")
        ev = _fh_ev()
        edge = Edge(name="src→tgt", source=src, target=tgt, using=[op])
        return Job(edge=edge, evaluators=[ev])

    def test_delta_no_children_normal(self, tmp_path):
        """delta() with work_key but no children behaves normally."""
        stream = workspace_bootstrap(tmp_path)
        job = self._make_fh_job()

        # No children, no approval — delta > 0
        d = delta(job, stream, tmp_path, work_key="REQ-F-AUTH")
        assert d > 0

    def test_delta_folds_back_to_children(self, tmp_path):
        """delta() delegates to children when work_key has spawned descendants."""
        stream = workspace_bootstrap(tmp_path)
        job = self._make_fh_job()

        # Spawn two children
        stream.append("work_spawned", {
            "parent_key": "REQ-F-AUTH",
            "child_key": "REQ-F-AUTH/login",
            "fragment": "auth_decomp",
        })
        stream.append("work_spawned", {
            "parent_key": "REQ-F-AUTH",
            "child_key": "REQ-F-AUTH/signup",
            "fragment": "auth_decomp",
        })

        # Neither child approved — parent delta > 0
        d = delta(job, stream, tmp_path, work_key="REQ-F-AUTH")
        assert d == 1.0

        # Approve one child — parent still > 0
        stream.append("approved", {
            "kind": "fh_review", "edge": "src→tgt", "actor": "human",
            "work_key": "REQ-F-AUTH/login",
        })
        d = delta(job, stream, tmp_path, work_key="REQ-F-AUTH")
        assert d == 1.0

        # Approve both children — parent converges
        stream.append("approved", {
            "kind": "fh_review", "edge": "src→tgt", "actor": "human",
            "work_key": "REQ-F-AUTH/signup",
        })
        d = delta(job, stream, tmp_path, work_key="REQ-F-AUTH")
        assert d == 0.0

    def test_delta_v1_no_foldback(self, tmp_path):
        """delta() with work_key=None never triggers fold-back."""
        stream = workspace_bootstrap(tmp_path)
        job = self._make_fh_job()

        # Spawn events exist but delta called with work_key=None — normal path
        stream.append("work_spawned", {
            "parent_key": "REQ-F-AUTH",
            "child_key": "REQ-F-AUTH/login",
            "fragment": "auth_decomp",
        })

        d = delta(job, stream, tmp_path, work_key=None)
        assert d > 0  # normal F_H check, not fold-back
