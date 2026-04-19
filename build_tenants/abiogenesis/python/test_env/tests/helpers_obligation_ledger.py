# Validates: REQ-P-SCENARIOS
from __future__ import annotations

from collections.abc import Iterable
from typing import Any

from gtl.graph import Attrs, Context, GraphVector, Node
from gtl.obligation_ledger import (
    declared_fulfillment_obligation,
    obligation_ledger_declarations,
)
from gtl.operator_model import F_P


def declared_test_graph_vector(
    name: str,
    source: Node | tuple[Node, ...],
    target: Node,
    *,
    operators: tuple = (),
    evaluators: tuple = (),
    contexts: tuple[Context, ...] = (),
    rule: Any = None,
    allows_subwork: bool = False,
    declarations: Attrs | dict[str, Any] | None = None,
    tags: tuple[str, ...] = (),
) -> GraphVector:
    fp_evaluators = tuple(evaluator for evaluator in evaluators if evaluator.regime is F_P)
    merged_declarations = declarations
    if fp_evaluators:
        merged_declarations = obligation_ledger_declarations(
            declarations=declarations,
            obligation_source_kind="test_declared_fp_obligations",
            obligation_source_ref=f"test://obligation_ledger#{name}",
            obligation_kind="fp_evaluator_obligation",
            carry_rule="declared_fulfillment_obligation_set_totality",
            fulfillment_rule="per_obligation_fp_assessment",
            evidence_policy="agent_supplied_evidence_refs",
            obligations=[
                declared_fulfillment_obligation(
                    evaluator.name,
                    evaluator=evaluator.name,
                    statement=evaluator.description,
                    source_kind="test_declared_fp_obligations",
                    source_refs=(f"test://obligation_ledger#{name}/obligation/{index}",),
                )
                for index, evaluator in enumerate(fp_evaluators)
            ],
        )
    return GraphVector(
        name=name,
        source=source,
        target=target,
        operators=operators,
        evaluators=evaluators,
        contexts=contexts,
        rule=rule,
        allows_subwork=allows_subwork,
        declarations=merged_declarations,
        tags=tags,
    )
