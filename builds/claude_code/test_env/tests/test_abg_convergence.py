# Validates: REQ-R-ABG2-CONVERGENCE
# Validates: REQ-R-ABG2-PROVENANCE-005
# Validates: REQ-R-ABG2-PROVENANCE-006
"""
Contract tests for ABG convergence — derived from GTL_2_INTERFACE_CONTRACTS.md.

Tests EvaluatorOutcome, ConvergenceResult, and delta().
"""
import pytest
from gtl.operator_model import Evaluator, Rule, F_D, F_P, F_H


# ── EvaluatorOutcome ─────────────────────────────────────────────────────────


@pytest.mark.integration
class TestEvaluatorOutcome:
    def test_import(self):
        from genesis.convergence import EvaluatorOutcome
        assert EvaluatorOutcome is not None

    def test_frozen(self):
        from genesis.convergence import EvaluatorOutcome
        eo = EvaluatorOutcome(
            contract_id="c1",
            evaluator_name="check",
            regime=F_D,
            status="pass",
            round_index=0,
        )
        with pytest.raises(AttributeError):
            eo.status = "fail"

    def test_fields(self):
        from genesis.convergence import EvaluatorOutcome
        eo = EvaluatorOutcome(
            contract_id="c1",
            evaluator_name="check",
            regime=F_D,
            status="pass",
            round_index=0,
            rationale="all clear",
            payload_ref="ref://result",
        )
        assert eo.contract_id == "c1"
        assert eo.evaluator_name == "check"
        assert eo.regime == F_D
        assert eo.status == "pass"
        assert eo.round_index == 0
        assert eo.rationale == "all clear"
        assert eo.payload_ref == "ref://result"

    def test_defaults(self):
        from genesis.convergence import EvaluatorOutcome
        eo = EvaluatorOutcome(
            contract_id="c1",
            evaluator_name="check",
            regime=F_D,
            status="pass",
            round_index=0,
        )
        assert eo.rationale == ""
        assert eo.payload_ref is None

    def test_valid_statuses(self):
        from genesis.convergence import EvaluatorOutcome
        for status in ("pass", "fail", "open", "error"):
            eo = EvaluatorOutcome(
                contract_id="c1",
                evaluator_name="check",
                regime=F_D,
                status=status,
                round_index=0,
            )
            assert eo.status == status


# ── ConvergenceResult ────────────────────────────────────────────────────────


@pytest.mark.integration
class TestConvergenceResult:
    def test_import(self):
        from genesis.convergence import ConvergenceResult
        assert ConvergenceResult is not None

    def test_frozen(self):
        from genesis.convergence import EvaluatorOutcome, ConvergenceResult
        eo = EvaluatorOutcome(
            contract_id="c1",
            evaluator_name="check",
            regime=F_D,
            status="pass",
            round_index=0,
        )
        cr = ConvergenceResult(
            contract_id="c1",
            outcomes=(eo,),
            aggregate_state="closed",
            next_action="continue",
            next_regime=None,
            round_index=0,
        )
        with pytest.raises(AttributeError):
            cr.aggregate_state = "open"

    def test_fields(self):
        from genesis.convergence import EvaluatorOutcome, ConvergenceResult
        eo = EvaluatorOutcome(
            contract_id="c1",
            evaluator_name="check",
            regime=F_D,
            status="pass",
            round_index=0,
        )
        cr = ConvergenceResult(
            contract_id="c1",
            outcomes=(eo,),
            aggregate_state="closed",
            next_action="continue",
            next_regime=None,
            round_index=0,
        )
        assert cr.contract_id == "c1"
        assert len(cr.outcomes) == 1
        assert cr.aggregate_state == "closed"
        assert cr.next_action == "continue"
        assert cr.next_regime is None
        assert cr.round_index == 0


# ── delta() ──────────────────────────────────────────────────────────────────


@pytest.mark.integration
class TestDeltaFunction:
    def test_import(self):
        from genesis.convergence import delta as delta_fn
        assert delta_fn is not None

    def test_all_pass_no_rule_returns_closed(self):
        from genesis.convergence import EvaluatorOutcome, delta as delta_fn
        outcomes = (
            EvaluatorOutcome(
                contract_id="c1",
                evaluator_name="check_a",
                regime=F_D,
                status="pass",
                round_index=0,
            ),
            EvaluatorOutcome(
                contract_id="c1",
                evaluator_name="check_b",
                regime=F_D,
                status="pass",
                round_index=0,
            ),
        )
        result = delta_fn("c1", outcomes)
        assert result.aggregate_state == "closed"
        assert result.next_action == "continue"

    def test_any_fail_no_rule_returns_open(self):
        from genesis.convergence import EvaluatorOutcome, delta as delta_fn
        outcomes = (
            EvaluatorOutcome(
                contract_id="c1",
                evaluator_name="check_a",
                regime=F_D,
                status="pass",
                round_index=0,
            ),
            EvaluatorOutcome(
                contract_id="c1",
                evaluator_name="check_b",
                regime=F_D,
                status="fail",
                round_index=0,
            ),
        )
        result = delta_fn("c1", outcomes)
        assert result.aggregate_state == "open"

    def test_error_propagates(self):
        from genesis.convergence import EvaluatorOutcome, delta as delta_fn
        outcomes = (
            EvaluatorOutcome(
                contract_id="c1",
                evaluator_name="check_a",
                regime=F_D,
                status="error",
                round_index=0,
            ),
        )
        result = delta_fn("c1", outcomes)
        assert result.aggregate_state == "error"
        assert result.next_action == "fail"

    def test_empty_outcomes_raises(self):
        from genesis.convergence import delta as delta_fn
        with pytest.raises(ValueError, match="empty"):
            delta_fn("c1", ())

    def test_mixed_contract_id_raises(self):
        from genesis.convergence import EvaluatorOutcome, delta as delta_fn
        outcomes = (
            EvaluatorOutcome(
                contract_id="c1",
                evaluator_name="a",
                regime=F_D,
                status="pass",
                round_index=0,
            ),
            EvaluatorOutcome(
                contract_id="c2",
                evaluator_name="b",
                regime=F_D,
                status="pass",
                round_index=0,
            ),
        )
        with pytest.raises(ValueError, match="contract_id"):
            delta_fn("c1", outcomes)

    def test_quorum_rule_majority_pass(self):
        """With quorum=2 of 3, two passes should close."""
        from genesis.convergence import EvaluatorOutcome, delta as delta_fn
        rule = Rule(
            name="majority",
            kind="consensus",
            config={"quorum": 2},
        )
        outcomes = (
            EvaluatorOutcome(
                contract_id="c1",
                evaluator_name="a",
                regime=F_P,
                status="pass",
                round_index=0,
            ),
            EvaluatorOutcome(
                contract_id="c1",
                evaluator_name="b",
                regime=F_P,
                status="pass",
                round_index=0,
            ),
            EvaluatorOutcome(
                contract_id="c1",
                evaluator_name="c",
                regime=F_P,
                status="fail",
                round_index=0,
            ),
        )
        result = delta_fn("c1", outcomes, rule=rule)
        assert result.aggregate_state == "closed"

    def test_quorum_rule_not_met(self):
        """With quorum=3 of 3, one fail should keep open."""
        from genesis.convergence import EvaluatorOutcome, delta as delta_fn
        rule = Rule(
            name="unanimous",
            kind="consensus",
            config={"quorum": 3},
        )
        outcomes = (
            EvaluatorOutcome(
                contract_id="c1",
                evaluator_name="a",
                regime=F_P,
                status="pass",
                round_index=0,
            ),
            EvaluatorOutcome(
                contract_id="c1",
                evaluator_name="b",
                regime=F_P,
                status="pass",
                round_index=0,
            ),
            EvaluatorOutcome(
                contract_id="c1",
                evaluator_name="c",
                regime=F_P,
                status="fail",
                round_index=0,
            ),
        )
        result = delta_fn("c1", outcomes, rule=rule)
        assert result.aggregate_state == "open"
        assert result.next_action == "repeat_round"

    def test_escalation_on_open_with_higher_regime(self):
        """When F_P is open, escalation goes to F_H (next regime above F_P)."""
        from genesis.convergence import EvaluatorOutcome, delta as delta_fn
        outcomes = (
            EvaluatorOutcome(
                contract_id="c1",
                evaluator_name="fd_check",
                regime=F_D,
                status="pass",
                round_index=0,
            ),
            EvaluatorOutcome(
                contract_id="c1",
                evaluator_name="fp_review",
                regime=F_P,
                status="open",
                round_index=0,
            ),
        )
        result = delta_fn("c1", outcomes)
        assert result.aggregate_state == "open"
        assert result.next_action == "escalate"
        assert result.next_regime == F_H

    def test_returns_convergence_result(self):
        from genesis.convergence import EvaluatorOutcome, ConvergenceResult, delta as delta_fn
        outcomes = (
            EvaluatorOutcome(
                contract_id="c1",
                evaluator_name="check",
                regime=F_D,
                status="pass",
                round_index=0,
            ),
        )
        result = delta_fn("c1", outcomes)
        assert isinstance(result, ConvergenceResult)

    def test_preserves_round_index(self):
        from genesis.convergence import EvaluatorOutcome, delta as delta_fn
        outcomes = (
            EvaluatorOutcome(
                contract_id="c1",
                evaluator_name="check",
                regime=F_D,
                status="pass",
                round_index=3,
            ),
        )
        result = delta_fn("c1", outcomes)
        assert result.round_index == 3
