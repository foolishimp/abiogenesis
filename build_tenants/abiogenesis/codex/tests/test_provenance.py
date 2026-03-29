# Validates: REQ-F-PROV-002
# Validates: REQ-F-PROV-004
# Validates: REQ-F-EVAL-004
from __future__ import annotations

import json
from argparse import Namespace

from genesis.__main__ import _emit_event_cmd, _validate_emit_payload
from genesis.commands import _read_carry_forward


def test_emit_event_annotates_known_workflow_version(tmp_path):
    (tmp_path / ".genesis").mkdir()
    (tmp_path / ".genesis" / "active-workflow.json").write_text(
        json.dumps({"workflow": "demo.standard", "version": "1.2.3"}),
        encoding="utf-8",
    )
    rc = _emit_event_cmd(
        Namespace(
            workspace=str(tmp_path),
            type="approved",
            data=json.dumps({"kind": "fh_review", "edge": "design→code", "actor": "human"}),
        )
    )
    assert rc == 0
    event = json.loads((tmp_path / ".ai-workspace" / "events" / "events.jsonl").read_text(encoding="utf-8").strip())
    assert event["data"]["workflow_version"] == "demo.standard@1.2.3"


def test_emit_event_omits_unknown_workflow_version(tmp_path):
    rc = _emit_event_cmd(
        Namespace(
            workspace=str(tmp_path),
            type="approved",
            data=json.dumps({"kind": "fh_review", "edge": "design→code", "actor": "human"}),
        )
    )
    assert rc == 0
    event = json.loads((tmp_path / ".ai-workspace" / "events" / "events.jsonl").read_text(encoding="utf-8").strip())
    assert "workflow_version" not in event["data"]


def test_read_carry_forward_from_manifest(tmp_path):
    manifest = (
        tmp_path
        / ".genesis"
        / "workflows"
        / "demo"
        / "standard"
        / "v1_2_3"
        / "manifest.json"
    )
    manifest.parent.mkdir(parents=True)
    manifest.write_text(
        json.dumps(
            {
                "approved_carry_forward": [
                    {"edge": "requirements→feature_decomp", "from_version": "demo.standard@1.2.2"}
                ]
            }
        ),
        encoding="utf-8",
    )
    carry_forward = _read_carry_forward(tmp_path, "demo.standard@1.2.3")
    assert carry_forward == {
        "requirements→feature_decomp": {"from_version": "demo.standard@1.2.2"}
    }


def test_human_proxy_requires_proxy_log():
    errors = _validate_emit_payload(
        "approved",
        {"kind": "fh_review", "edge": "design→code", "actor": "human-proxy"},
    )
    assert errors
