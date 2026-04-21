# Implements: REQ-L-GTL3-SUBWORK
# Implements: REQ-R-ABG3-LEAFTASK
"""
subwork — Bounded sub-work realization.

LeafTask, validate_leaf_schema, dispatch_leaf.

Pure kernel module — dispatch_leaf() returns (output, failure_class).
Event emission delegated to genesis.events via genesis.interpret.
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from .binding import PromptAssembly, PromptAssemblyBudget
from .transport import dispatch_agent, classify_failure


@dataclass(frozen=True)
class LeafTask:
    """
    Bounded, schema-driven sub-work unit dispatched within traversal realization.

    Leaf tasks are subordinate to graph traversal.
    Schema-driven: input is validated before dispatch and output at the transport boundary.
    """
    name: str
    input_schema: dict
    output_schema: dict
    timeout_ms: int = 30_000
    tools_allowed: bool = False


_JSON_TYPE_MAP = {
    "string": str,
    "number": (int, float),
    "integer": int,
    "boolean": bool,
    "array": list,
    "object": dict,
    "null": type(None),
}


_LEAF_PROMPT_SECTION_CHAR_LIMIT = 2000


def validate_leaf_schema(data: dict, schema: dict) -> tuple[bool, str]:
    """
    Minimal JSON Schema validation — stdlib only, no jsonschema dependency.

    Checks: required fields present, top-level type matching.
    Returns (valid, error_message). error_message is "" on success.
    """
    if not isinstance(data, dict):
        return False, f"expected dict, got {type(data).__name__}"

    required = schema.get("required", [])
    for field_name in required:
        if field_name not in data:
            return False, f"missing required field: {field_name}"

    properties = schema.get("properties", {})
    for field_name, field_schema in properties.items():
        if field_name not in data:
            continue
        expected_type = field_schema.get("type")
        if expected_type and expected_type in _JSON_TYPE_MAP:
            py_type = _JSON_TYPE_MAP[expected_type]
            if not isinstance(data[field_name], py_type):
                return False, (
                    f"field {field_name!r}: expected {expected_type}, "
                    f"got {type(data[field_name]).__name__}"
                )

    return True, ""


def _assemble_leaf_prompt(
    task: LeafTask,
    input_data: dict,
    *,
    sub_run_id: str,
    result_path: str,
    prompt_manifest_ref: str,
) -> PromptAssembly:
    budget = PromptAssemblyBudget()
    tools_clause = "You MAY use tools." if task.tools_allowed else "Do NOT use any tools."
    input_text = json.dumps(input_data, indent=2, sort_keys=True)
    output_schema_text = json.dumps(task.output_schema, indent=2, sort_keys=True)
    compacted_input = budget.compact_text(
        input_text,
        max_chars=_LEAF_PROMPT_SECTION_CHAR_LIMIT,
        surface=f"leaf_task:{task.name}:input_data",
        reason="leaf_input_prompt_budget",
        inspection_ref=f"{prompt_manifest_ref}#input_data",
    )
    compacted_output_schema = budget.compact_text(
        output_schema_text,
        max_chars=_LEAF_PROMPT_SECTION_CHAR_LIMIT,
        surface=f"leaf_task:{task.name}:output_schema",
        reason="leaf_output_schema_prompt_budget",
        inspection_ref=f"{prompt_manifest_ref}#output_schema",
    )
    emitted_prompt = (
        f"LEAF TASK: {task.name}\n"
        f"Sub-run: {sub_run_id}\n\n"
        f"INPUT:\n{compacted_input}\n\n"
        f"OUTPUT SCHEMA:\n{compacted_output_schema}\n\n"
        f"RESULT FILE: {result_path}\n"
        f"PROMPT MANIFEST: {prompt_manifest_ref}\n"
        f"Write your output as a JSON object to the file above.\n\n"
        f"Instructions: {tools_clause}\n"
        f"The JSON must match the output schema exactly."
    )
    return budget.assembly(
        (
            budget.section("leaf_task", emitted_prompt, 0),
        )
    )


def dispatch_leaf(
    task: LeafTask,
    input_data: dict,
    parent_run_id: str,
    work_folder: str,
    *,
    agent: str = "claude",
) -> tuple[dict | None, str | None]:
    """Synchronous leaf task sub-dispatch within traversal realization.

    Bounded, schema-driven sub-work.
    Does NOT emit events — returns data for the caller to emit.

    Returns:
        (output_dict, None) on success.
        (None, failure_class) on failure.
    """
    sub_run_id = f"{parent_run_id}/leaf/{task.name}"

    valid, err = validate_leaf_schema(input_data, task.input_schema)
    if not valid:
        return None, "contract_failure"

    result_dir = Path(work_folder) / ".ai-workspace" / "leaf_results"
    result_dir.mkdir(parents=True, exist_ok=True)
    result_path = str(result_dir / f"{task.name}.json")
    prompt_manifest_path = result_dir / f"{task.name}.prompt_manifest.json"
    prompt_manifest_ref = (
        f"workspace://.ai-workspace/leaf_results/{task.name}.prompt_manifest.json"
    )

    prompt_assembly = _assemble_leaf_prompt(
        task,
        input_data,
        sub_run_id=sub_run_id,
        result_path=result_path,
        prompt_manifest_ref=prompt_manifest_ref,
    )
    prompt_manifest_path.write_text(
        json.dumps(
            {
                "task": task.name,
                "sub_run_id": sub_run_id,
                "input_data": input_data,
                "output_schema": task.output_schema,
                "result_path": result_path,
                "prompt_compactions": prompt_assembly.prompt_compactions(),
            },
            indent=2,
            sort_keys=True,
        ),
        encoding="utf-8",
    )

    timeout_s = max(1, task.timeout_ms // 1000)
    result = dispatch_agent(prompt_assembly.prompt, work_folder, agent=agent, timeout=timeout_s)

    failure = classify_failure(
        result,
        result_path=result_path,
        payload_validator=lambda payload: validate_leaf_schema(payload, task.output_schema)[0],
    )
    if failure is not None:
        return None, failure

    try:
        output = json.loads(Path(result_path).read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None, "contract_failure"

    valid, err = validate_leaf_schema(output, task.output_schema)
    if not valid:
        return None, "contract_failure"

    return output, None
