# Validates: REQ-P-QUAL-018A
# Validates: REQ-P-QUAL-018B
# Validates: REQ-P-QUAL-018C
# Validates: REQ-P-QUAL-018D
# Validates: REQ-P-QUAL-018E
# Validates: REQ-P-QUAL-018F
from __future__ import annotations

import json

from run_archive import create_run_archive


def test_run_archive_finalize_writes_postmortem_shape():
    archive = create_run_archive("archive_contract", "test_run_archive_finalize_writes_postmortem_shape")

    events_dir = archive.workspace / ".ai-workspace" / "events"
    events_dir.mkdir(parents=True, exist_ok=True)
    (events_dir / "events.jsonl").write_text(
        json.dumps({"event_type": "vector_started", "data": {"edge": "a→b"}}) + "\n",
        encoding="utf-8",
    )

    manifests_dir = archive.workspace / ".ai-workspace" / "fp_manifests"
    manifests_dir.mkdir(parents=True, exist_ok=True)
    (manifests_dir / "m.json").write_text(json.dumps({"manifest_id": "m"}), encoding="utf-8")

    results_dir = archive.workspace / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    (results_dir / "m.json").write_text(json.dumps({"edge": "a→b"}), encoding="utf-8")

    docs_dir = archive.workspace / "docs"
    docs_dir.mkdir(parents=True, exist_ok=True)
    (docs_dir / "artifact.md").write_text("# artifact\n", encoding="utf-8")

    archive.capture_text("raw_response.txt", "example raw response")
    archive.update_summary(converged=True, total_delta=0)
    archive.finalize(test_passed=True)

    assert (archive.run_dir / "run.json").is_file()
    assert (archive.run_dir / "summary.json").is_file()
    assert (archive.run_dir / "stdout.log").is_file()
    assert (archive.run_dir / "stderr.log").is_file()
    assert (archive.artifacts_dir / "events.jsonl").is_file()
    assert (archive.artifacts_dir / "manifest_m.json").is_file()
    assert (archive.artifacts_dir / "result_m.json").is_file()
    assert (archive.artifacts_dir / "raw_response.txt").is_file()
    assert (archive.workspace / "docs" / "artifact.md").is_file()
