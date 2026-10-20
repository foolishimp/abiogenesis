#!/usr/bin/env python3
"""Validate, index and project authored programs; join caller-supplied text."""

from __future__ import annotations

import argparse
import copy
import errno
import hashlib
import json
import os
import re
import sys
import tempfile
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urldefrag, urlparse


TOP_KEYS = {
    "kind",
    "schema_version",
    "uri",
    "calculus_ref",
    "source_basis",
    "frame_refs",
    "vocabulary_refs",
    "symbols",
    "clauses",
    "residuals",
}
SYMBOL_KEYS = {"uri", "kind", "label", "source_refs"}
CLAUSE_KEYS = {
    "uri",
    "clause_type",
    "operator",
    "arguments",
    "statement",
    "source_refs",
}
ARGUMENT_KEYS = {"role", "ref", "literal"}
RESIDUAL_KEYS = {
    "uri",
    "kind",
    "subject_refs",
    "detail",
    "re_entry_refs",
    "source_refs",
}
RESIDUAL_KINDS = {"ambiguity", "conflict", "omission", "unresolved"}
FRAME_INDEX_KEYS = {
    "uri", "frame_ref", "scope", "clause_refs", "residual_refs", "source_refs"
}
PROJECTION_MODES = {"reference-only", "materialized"}
CLAUSE_TYPES = {"relation", "constraint"}
URI_RE = re.compile(r"^[A-Za-z][A-Za-z0-9+.-]*:[A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]+$")


class DuplicateKeyError(ValueError):
    pass


def unique_pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise DuplicateKeyError(key)
        result[key] = value
    return result


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=unique_pairs)


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(
        value,
        ensure_ascii=False,
        allow_nan=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")


def sha256(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def is_uri(value: Any) -> bool:
    if not isinstance(value, str) or not URI_RE.fullmatch(value):
        return False
    if re.search(r"%(?![0-9A-Fa-f]{2})", value):
        return False
    parsed = urlparse(value)
    if not parsed.scheme:
        return False
    remainder = value[len(parsed.scheme) + 1 :]
    return not remainder.startswith("//") or bool(parsed.netloc)


def diagnostic(
    issues: list[dict[str, str]],
    code: str,
    record: str,
    field: str,
    ref: str | None = None,
) -> None:
    row = {"code": code, "record": record, "field": field}
    if ref is not None:
        row["ref"] = ref
    issues.append(row)


def heading_slugs(text: str) -> set[str]:
    slugs: set[str] = set()
    occurrences: dict[str, int] = {}
    for line in text.splitlines():
        match = re.match(r"^#{1,6}\s+(.+?)\s*#*\s*$", line)
        if not match:
            continue
        base = match.group(1).strip().lower()
        base = re.sub(r"[^\w\- ]", "", base, flags=re.UNICODE)
        base = re.sub(r"[\s\-]+", "-", base).strip("-")
        count = occurrences.get(base, 0)
        occurrences[base] = count + 1
        slugs.add(base if count == 0 else f"{base}-{count}")
    return slugs


class Resolver:
    def __init__(self, binding_path: Path, value: Any):
        if not isinstance(value, dict) or set(value) != {
            "kind",
            "schema_version",
            "bindings",
        }:
            raise ValueError("invalid_binding_set_shape")
        if value["kind"] != "axiom-indexer.binding-set" or value["schema_version"] != 1:
            raise ValueError("unsupported_binding_set")
        rows = value["bindings"]
        if not isinstance(rows, list) or not rows:
            raise ValueError("empty_binding_set")
        seen: set[str] = set()
        self.bindings: list[tuple[str, Path]] = []
        self.protected_paths: set[Path] = set()
        self.protection_complete = True
        for row in rows:
            if not isinstance(row, dict) or set(row) != {"uri_prefix", "path"}:
                raise ValueError("invalid_binding_shape")
            prefix = row["uri_prefix"]
            physical = row["path"]
            if not is_uri(prefix) or not isinstance(physical, str) or not physical:
                raise ValueError("invalid_binding_coordinate")
            if prefix in seen:
                raise ValueError("duplicate_binding_prefix")
            seen.add(prefix)
            root = Path(physical)
            if not root.is_absolute():
                root = binding_path.parent / root
            self.bindings.append((prefix, root.resolve()))
        self.bindings.sort(key=lambda pair: len(pair[0]), reverse=True)

    def resolve(self, uri: str) -> tuple[Path, str | None]:
        base_uri, fragment = urldefrag(uri)
        matches = [
            (prefix, root)
            for prefix, root in self.bindings
            if base_uri.startswith(prefix)
        ]
        if not matches:
            raise ValueError("unresolved_uri")
        longest = len(matches[0][0])
        matches = [row for row in matches if len(row[0]) == longest]
        if len(matches) != 1:
            raise ValueError("ambiguous_uri")
        prefix, root = matches[0]
        relative = unquote(base_uri[len(prefix) :]).lstrip("/")
        try:
            target = (root / relative).resolve()
            # Non-strict resolve no longer raises for symlink loops on Python
            # 3.13. Keep an unresolved target from permitting output cleanup.
            try:
                target.stat()
            except OSError as exc:
                if exc.errno == errno.ELOOP:
                    raise
        except (OSError, ValueError, RuntimeError):
            self.protection_complete = False
            raise
        # Protect a known attempted source even when its binding must refuse.
        # This records identity only; it does not admit or read escaped bytes.
        self.protected_paths.add(target)
        try:
            target.relative_to(root)
        except ValueError as exc:
            raise ValueError("binding_escape") from exc
        if not target.exists():
            raise ValueError("missing_resource")
        if fragment:
            if not target.is_file() or target.suffix.lower() not in {
                ".md",
                ".markdown",
            }:
                raise ValueError("unsupported_fragment")
            if fragment not in heading_slugs(target.read_text(encoding="utf-8")):
                raise ValueError("unresolved_fragment")
        return target, fragment or None

    def resolve_file(self, uri: str) -> tuple[Path, str | None]:
        target, fragment = self.resolve(uri)
        if not target.is_file():
            raise ValueError("resource_not_file")
        return target, fragment


def exact_keys(
    value: Any,
    expected: set[str],
    issues: list[dict[str, str]],
    record: str,
    field: str,
) -> bool:
    if not isinstance(value, dict):
        diagnostic(issues, "wrong_shape", record, field)
        return False
    missing = sorted(expected - set(value))
    extra = sorted(set(value) - expected)
    for key in missing:
        diagnostic(issues, "missing_field", record, f"{field}.{key}")
    for key in extra:
        diagnostic(issues, "unknown_field", record, f"{field}.{key}")
    return not missing and not extra


def uri_list(
    value: Any,
    issues: list[dict[str, str]],
    record: str,
    field: str,
    *,
    nonempty: bool = False,
) -> list[str]:
    if not isinstance(value, list):
        diagnostic(issues, "wrong_shape", record, field)
        return []
    if nonempty and not value:
        diagnostic(issues, "empty_set", record, field)
    valid: list[str] = []
    for ref in value:
        if not is_uri(ref):
            diagnostic(issues, "invalid_uri", record, field, str(ref))
        else:
            valid.append(ref)
    if len(valid) != len(set(valid)):
        diagnostic(issues, "duplicate_ref", record, field)
    if valid != sorted(valid):
        diagnostic(issues, "noncanonical_order", record, field)
    return valid


def validate_program(program: Any, resolver: Resolver) -> dict[str, Any]:
    issues: list[dict[str, str]] = []
    root = (
        program.get("uri", "urn:axiom-indexer:diagnostic:program")
        if isinstance(program, dict)
        else "urn:axiom-indexer:diagnostic:program"
    )
    indexed = isinstance(program, dict) and "frame_indexes" in program
    keys = TOP_KEYS | {"frame_indexes"} if indexed else TOP_KEYS
    if not exact_keys(program, keys, issues, root, "$program"):
        return report(program, issues, {})
    if program["kind"] != "axiom-indexer.axiomatic-program":
        diagnostic(issues, "wrong_kind", root, "kind")
    if program["schema_version"] != 1:
        diagnostic(issues, "wrong_schema_version", root, "schema_version")
    if not is_uri(program["uri"]):
        diagnostic(issues, "invalid_uri", root, "uri", str(program["uri"]))
    resolved_sources: dict[str, str] = {}
    if not is_uri(program["calculus_ref"]):
        diagnostic(
            issues,
            "invalid_uri",
            root,
            "calculus_ref",
            str(program["calculus_ref"]),
        )
    else:
        try:
            path, _ = resolver.resolve_file(program["calculus_ref"])
            resolved_sources[program["calculus_ref"]] = sha256(path.read_bytes())
        except ValueError as exc:
            diagnostic(issues, str(exc), root, "calculus_ref", program["calculus_ref"])
    if not is_uri(program["source_basis"]):
        diagnostic(
            issues, "invalid_uri", root, "source_basis", str(program["source_basis"])
        )
    else:
        try:
            resolver.resolve(program["source_basis"])
        except ValueError as exc:
            diagnostic(issues, str(exc), root, "source_basis", program["source_basis"])

    frames = uri_list(program["frame_refs"], issues, root, "frame_refs")
    vocabulary = uri_list(program["vocabulary_refs"], issues, root, "vocabulary_refs")
    for frame in frames:
        try:
            path, _ = resolver.resolve_file(frame)
            resolved_sources[frame] = sha256(path.read_bytes())
        except ValueError as exc:
            diagnostic(issues, str(exc), root, "frame_refs", frame)

    item_lists = {
        "symbols": program["symbols"],
        "clauses": program["clauses"],
        "residuals": program["residuals"],
    }
    items: dict[str, dict[str, Any]] = {}
    for field, rows in item_lists.items():
        if not isinstance(rows, list):
            diagnostic(issues, "wrong_shape", root, field)
            item_lists[field] = []
            continue
        uris = [
            row.get("uri")
            for row in rows
            if isinstance(row, dict) and is_uri(row.get("uri"))
        ]
        if uris != sorted(uris):
            diagnostic(issues, "noncanonical_order", root, field)
        for row in rows:
            if not isinstance(row, dict) or not is_uri(row.get("uri")):
                diagnostic(issues, "invalid_item_uri", root, field)
                continue
            uri = row["uri"]
            if uri in items:
                diagnostic(issues, "duplicate_identity", uri, "uri", uri)
            else:
                items[uri] = row

    def source_refs(row: dict[str, Any], record: str) -> None:
        refs = uri_list(
            row.get("source_refs"), issues, record, "source_refs", nonempty=True
        )
        for ref in refs:
            if is_uri(program["source_basis"]) and not ref.startswith(
                program["source_basis"]
            ):
                diagnostic(issues, "source_outside_basis", record, "source_refs", ref)
                continue
            try:
                path, _ = resolver.resolve_file(ref)
                resolved_sources[ref] = sha256(path.read_bytes())
            except ValueError as exc:
                diagnostic(issues, str(exc), record, "source_refs", ref)

    for row in item_lists["symbols"]:
        if not isinstance(row, dict):
            continue
        record = row.get("uri", root)
        if not exact_keys(row, SYMBOL_KEYS, issues, record, "symbol"):
            continue
        if not is_uri(row["uri"]):
            diagnostic(issues, "invalid_uri", record, "uri", str(row["uri"]))
        if row["kind"] not in vocabulary:
            diagnostic(
                issues, "undeclared_vocabulary", record, "kind", str(row["kind"])
            )
        if not isinstance(row["label"], str) or not row["label"].strip():
            diagnostic(issues, "empty_label", record, "label")
        source_refs(row, record)

    local_ids = set(items)
    external_ids = set(frames) | set(vocabulary)
    for row in item_lists["clauses"]:
        if not isinstance(row, dict):
            continue
        record = row.get("uri", root)
        if not exact_keys(row, CLAUSE_KEYS, issues, record, "clause"):
            continue
        if row["clause_type"] not in CLAUSE_TYPES:
            diagnostic(issues, "invalid_clause_type", record, "clause_type")
        if row["operator"] not in vocabulary:
            diagnostic(
                issues,
                "undeclared_vocabulary",
                record,
                "operator",
                str(row["operator"]),
            )
        if not isinstance(row["statement"], str) or not row["statement"].strip():
            diagnostic(issues, "empty_statement", record, "statement")
        arguments = row["arguments"]
        if not isinstance(arguments, list) or not arguments:
            diagnostic(issues, "empty_arguments", record, "arguments")
        else:
            for argument in arguments:
                if not isinstance(argument, dict):
                    diagnostic(issues, "wrong_shape", record, "arguments")
                    continue
                for key in sorted(set(argument) - ARGUMENT_KEYS):
                    diagnostic(issues, "unknown_field", record, f"arguments.{key}")
                if "role" not in argument:
                    diagnostic(issues, "missing_field", record, "arguments.role")
                    continue
                role = argument.get("role")
                if role not in vocabulary:
                    diagnostic(
                        issues,
                        "undeclared_vocabulary",
                        record,
                        "arguments.role",
                        str(role),
                    )
                has_ref = "ref" in argument
                has_literal = "literal" in argument
                if has_ref == has_literal:
                    diagnostic(issues, "invalid_argument_value", record, "arguments")
                elif has_ref:
                    ref = argument["ref"]
                    if not is_uri(ref):
                        diagnostic(
                            issues, "invalid_uri", record, "arguments.ref", str(ref)
                        )
                    elif ref not in local_ids and ref not in external_ids:
                        diagnostic(issues, "dangling_ref", record, "arguments.ref", ref)
                elif (
                    not isinstance(argument["literal"], (str, int, float, bool))
                    and argument["literal"] is not None
                ):
                    diagnostic(
                        issues, "invalid_argument_value", record, "arguments.literal"
                    )
        source_refs(row, record)

    for row in item_lists["residuals"]:
        if not isinstance(row, dict):
            continue
        record = row.get("uri", root)
        if not exact_keys(row, RESIDUAL_KEYS, issues, record, "residual"):
            continue
        if row["kind"] not in RESIDUAL_KINDS:
            diagnostic(issues, "invalid_residual_kind", record, "kind")
        if not isinstance(row["detail"], str) or not row["detail"].strip():
            diagnostic(issues, "empty_detail", record, "detail")
        for ref in uri_list(row["subject_refs"], issues, record, "subject_refs"):
            if ref not in local_ids:
                diagnostic(issues, "dangling_ref", record, "subject_refs", ref)
        for ref in uri_list(
            row["re_entry_refs"], issues, record, "re_entry_refs", nonempty=True
        ):
            if ref in frames:
                continue
            try:
                path, _ = resolver.resolve_file(ref)
                if indexed:
                    resolved_sources[ref] = sha256(path.read_bytes())
            except ValueError as exc:
                diagnostic(issues, str(exc), record, "re_entry_refs", ref)
        source_refs(row, record)

    if indexed:
        rows = program["frame_indexes"]
        if not isinstance(rows, list):
            diagnostic(issues, "wrong_shape", root, "frame_indexes")
            rows = []
        index_ids = [
            row["uri"] for row in rows
            if isinstance(row, dict) and is_uri(row.get("uri"))
        ]
        if index_ids != sorted(index_ids):
            diagnostic(issues, "noncanonical_order", root, "frame_indexes")
        claimed = local_ids | external_ids
        if is_uri(program["uri"]):
            claimed.add(program["uri"])
        family_ids = {
            family: {
                row["uri"] for row in item_lists[family]
                if isinstance(row, dict) and is_uri(row.get("uri"))
            }
            for family in ("clauses", "residuals")
        }
        for row in rows:
            record = row["uri"] if isinstance(row, dict) and is_uri(row.get("uri")) else root
            if not exact_keys(row, FRAME_INDEX_KEYS, issues, record, "frame_index"):
                continue
            if not is_uri(row["uri"]):
                diagnostic(issues, "invalid_uri", root, "frame_indexes.uri", str(row["uri"]))
            elif row["uri"] in claimed:
                diagnostic(issues, "duplicate_identity", record, "uri", row["uri"])
            else:
                claimed.add(row["uri"])
            if row["frame_ref"] not in frames:
                diagnostic(issues, "undeclared_frame", record, "frame_ref", str(row["frame_ref"]))
            if not isinstance(row["scope"], str) or not row["scope"].strip():
                diagnostic(issues, "empty_scope", record, "scope")
            roots: list[str] = []
            for field, family in (("clause_refs", "clauses"), ("residual_refs", "residuals")):
                refs = uri_list(row[field], issues, record, field)
                roots.extend(refs)
                for ref in refs:
                    if ref not in family_ids[family]:
                        code = "wrong_ref_kind" if ref in claimed else "dangling_ref"
                        diagnostic(issues, code, record, field, ref)
            if not roots:
                diagnostic(issues, "empty_selection", record, "frame_index")
            source_refs(row, record)

    return report(program, issues, resolved_sources)


def report(
    program: Any, issues: list[dict[str, str]], resolved_sources: dict[str, str]
) -> dict[str, Any]:
    issues.sort(
        key=lambda row: tuple(
            row.get(key, "") for key in ("record", "field", "code", "ref")
        )
    )
    safe_program = program if isinstance(program, dict) else {}
    try:
        digest = sha256(canonical_bytes(program))
    except (TypeError, ValueError, UnicodeEncodeError):
        digest = "unavailable"
        diagnostic(
            issues,
            "noncanonical_value",
            safe_program.get("uri", "urn:axiom-indexer:diagnostic:program"),
            "$program",
        )
        issues.sort(
            key=lambda row: tuple(
                row.get(key, "") for key in ("record", "field", "code", "ref")
            )
        )
    return {
        "kind": "axiom-indexer.validation-report",
        "schema_version": 1,
        "status": "valid" if not issues else "invalid",
        "program_uri": safe_program.get("uri"),
        "program_sha256": digest,
        "resolved_sources": [
            {"uri": uri, "sha256": resolved_sources[uri]}
            for uri in sorted(resolved_sources)
        ],
        "derived_counts": {
            key: len(safe_program.get(key, []))
            if isinstance(safe_program.get(key), list)
            else 0
            for key in ("symbols", "clauses", "residuals")
        },
        "diagnostics": issues,
    }


def instantiate(program: dict[str, Any], validation: dict[str, Any]) -> dict[str, Any]:
    outgoing: dict[str, list[str]] = {
        row["uri"]: []
        for family in ("symbols", "clauses", "residuals")
        for row in program[family]
    }
    for clause in program["clauses"]:
        for argument in clause["arguments"]:
            ref = argument.get("ref")
            if ref in outgoing:
                outgoing[ref].append(clause["uri"])
    for refs in outgoing.values():
        refs.sort()
    result = {
        "kind": "axiom-indexer.logical-constraint-map",
        "schema_version": 1,
        "program_uri": program["uri"],
        "program_sha256": validation["program_sha256"],
        "calculus_ref": program["calculus_ref"],
        "source_basis": program["source_basis"],
        "frame_refs": program["frame_refs"],
        "vocabulary_refs": program["vocabulary_refs"],
        "resolved_sources": validation["resolved_sources"],
        "symbols": {
            row["uri"]: {"kind": row["kind"], "label": row["label"]}
            for row in program["symbols"]
        },
        "clauses": program["clauses"],
        "constraints": [
            row["uri"]
            for row in program["clauses"]
            if row["clause_type"] == "constraint"
        ],
        "outgoing_clause_refs": outgoing,
        "residuals": program["residuals"],
        "source_routes": {
            row["uri"]: row["source_refs"]
            for family in ("symbols", "clauses", "residuals")
            for row in program[family]
        },
    }
    if "frame_indexes" in program:
        result["frame_indexes"] = {
            row["uri"]: row for row in program["frame_indexes"]
        }
    result["map_sha256"] = sha256(canonical_bytes(result))
    return result


def reference_closure(program: dict[str, Any], indexes: list[dict[str, Any]]) -> dict[str, list[str]]:
    """Close explicit local references and affected residuals, without interpreting roles."""
    families = {
        row["uri"]: family
        for family in ("symbols", "clauses", "residuals")
        for row in program[family]
    }
    items = {
        row["uri"]: row
        for family in ("symbols", "clauses", "residuals")
        for row in program[family]
    }
    affected: dict[str, list[str]] = {}
    for residual in program["residuals"]:
        for subject in residual["subject_refs"]:
            affected.setdefault(subject, []).append(residual["uri"])
    pending = [ref for row in indexes for field in ("clause_refs", "residual_refs") for ref in row[field]]
    included: set[str] = set()
    while pending:
        uri = pending.pop()
        if uri in included:
            continue
        included.add(uri)
        item = items[uri]
        if families[uri] == "clauses":
            pending.extend(arg["ref"] for arg in item["arguments"] if arg.get("ref") in items)
        elif families[uri] == "residuals":
            pending.extend(item["subject_refs"])
        pending.extend(affected.get(uri, []))
    return {
        family: sorted(uri for uri in included if families[uri] == family)
        for family in ("symbols", "clauses", "residuals")
    }


def projection_report(program: Any, logical_map: Any, indexes: list[str], issues: list[dict[str, str]]) -> dict[str, Any]:
    issues.sort(key=lambda row: tuple(row.get(key, "") for key in ("record", "field", "code", "ref")))
    return {
        "kind": "axiom-indexer.projection-report",
        "schema_version": 1,
        "status": "invalid" if issues else "valid",
        "program_uri": program.get("uri") if isinstance(program, dict) else None,
        "map_sha256": logical_map.get("map_sha256") if isinstance(logical_map, dict) else None,
        "frame_index_refs": sorted(set(indexes)),
        "diagnostics": issues,
    }


def project_program(
    program: Any,
    logical_map: Any,
    resolver: Resolver,
    index_refs: Any,
    mode: Any,
) -> tuple[dict[str, Any], dict[str, Any] | None]:
    validation = validate_program(program, resolver)
    issues = list(validation["diagnostics"])
    root = validation["program_uri"] or "urn:axiom-indexer:diagnostic:program"
    selected: list[str] = []
    if not isinstance(mode, str) or mode not in PROJECTION_MODES:
        diagnostic(issues, "invalid_projection_mode", root, "mode", str(mode))
    if not isinstance(index_refs, list) or not index_refs:
        diagnostic(issues, "empty_selection", root, "frame_index_refs")
    else:
        for ref in index_refs:
            if not is_uri(ref):
                diagnostic(issues, "invalid_uri", root, "frame_index_refs", str(ref))
            elif ref in selected:
                diagnostic(issues, "duplicate_selection", root, "frame_index_refs", ref)
            else:
                selected.append(ref)
    if validation["status"] != "valid":
        return projection_report(program, logical_map, selected, issues), None
    indexes = {row["uri"]: row for row in program.get("frame_indexes", [])}
    other_ids = {row["uri"] for family in ("symbols", "clauses", "residuals") for row in program[family]}
    other_ids.update(program["frame_refs"])
    other_ids.update(program["vocabulary_refs"])
    other_ids.add(program["uri"])
    for ref in selected:
        if ref not in indexes:
            code = "wrong_selection_kind" if ref in other_ids else "unknown_frame_index"
            diagnostic(issues, code, root, "frame_index_refs", ref)
    expected = instantiate(program, validation)
    try:
        same_map = canonical_bytes(logical_map) == canonical_bytes(expected)
    except (ValueError, TypeError, UnicodeEncodeError):
        same_map = False
    if not same_map:
        diagnostic(issues, "map_mismatch", root, "map")
        if isinstance(logical_map, dict) and logical_map.get("resolved_sources") != validation["resolved_sources"]:
            diagnostic(issues, "source_observation_mismatch", root, "map.resolved_sources")
    if issues:
        return projection_report(program, logical_map, selected, issues), None

    chosen = [indexes[uri] for uri in sorted(selected)]
    closure = reference_closure(program, chosen)
    rows = {
        family: [row for row in program[family] if row["uri"] in closure[family]]
        for family in closure
    }
    frames = {row["frame_ref"] for row in chosen}
    vocabulary = {row["kind"] for row in rows["symbols"]}
    sources = {program["calculus_ref"]}
    for row in chosen:
        sources.update(row["source_refs"])
    for family_rows in rows.values():
        for row in family_rows:
            sources.update(row["source_refs"])
    for row in rows["clauses"]:
        vocabulary.add(row["operator"])
        for arg in row["arguments"]:
            vocabulary.add(arg["role"])
            if arg.get("ref") in program["vocabulary_refs"]:
                vocabulary.add(arg["ref"])
            if arg.get("ref") in program["frame_refs"]:
                frames.add(arg["ref"])
    for row in rows["residuals"]:
        sources.update(row["re_entry_refs"])
        frames.update(ref for ref in row["re_entry_refs"] if ref in program["frame_refs"])
    sources.update(frames)
    result = {
        "kind": "axiom-indexer.frame-projection",
        "schema_version": 1,
        "mode": mode,
        "program_uri": program["uri"],
        "program_sha256": validation["program_sha256"],
        "map_sha256": expected["map_sha256"],
        "calculus_ref": program["calculus_ref"],
        "source_basis": program["source_basis"],
        "frame_indexes": chosen,
        "frame_refs": sorted(frames),
        "vocabulary_refs": sorted(vocabulary),
        "closure": closure,
        "clause_relations": [
            {key: row[key] for key in ("uri", "clause_type", "operator", "arguments")}
            for row in rows["clauses"]
        ],
        "residual_routes": [
            {key: row[key] for key in ("uri", "kind", "subject_refs", "re_entry_refs")}
            for row in rows["residuals"]
        ],
        "source_routes": {
            row["uri"]: row["source_refs"]
            for row in chosen + [row for family_rows in rows.values() for row in family_rows]
        },
        "resolved_sources": [row for row in validation["resolved_sources"] if row["uri"] in sources],
    }
    if mode == "materialized":
        result.update(rows)
    result["projection_sha256"] = sha256(canonical_bytes(result))
    return projection_report(program, logical_map, selected, []), copy.deepcopy(result)


def join_sections(sections: Any) -> str:
    if not isinstance(sections, list):
        raise ValueError("invalid_sections")
    parts: list[str] = []
    for section in sections:
        if not isinstance(section, dict) or set(section) != {"label", "text"}:
            raise ValueError("invalid_section")
        label = section["label"]
        text = section["text"]
        if not isinstance(label, str) or not isinstance(text, str):
            raise ValueError("invalid_section")
        parts.append(label + "\n" + text)
    result = "\n\n".join(parts)
    try:
        result.encode("utf-8")
    except UnicodeEncodeError as exc:
        raise ValueError("invalid_section_encoding") from exc
    return result


def write_json(path: Path | None, value: Any) -> None:
    data = canonical_bytes(value) + b"\n"
    if path is None:
        sys.stdout.buffer.write(data)
    else:
        path.write_bytes(data)


def write_text(path: Path | None, value: str) -> None:
    data = value.encode("utf-8")
    if path is None:
        sys.stdout.buffer.write(data)
    else:
        path.write_bytes(data)


def input_failure(ref: str) -> dict[str, Any]:
    return {
        "kind": "axiom-indexer.validation-report",
        "schema_version": 1,
        "status": "invalid",
        "program_uri": None,
        "program_sha256": "unavailable",
        "resolved_sources": [],
        "derived_counts": {"symbols": 0, "clauses": 0, "residuals": 0},
        "diagnostics": [
            {
                "code": "input_error",
                "record": "urn:axiom-indexer:diagnostic:input",
                "field": "input",
                "ref": ref,
            }
        ],
    }


def clear_stale_map(path: Path | None) -> None:
    if path is not None and (path.is_file() or path.is_symlink()):
        path.unlink()


def path_alias(left: Path, right: Path) -> bool:
    if left.resolve() == right.resolve():
        return True
    try:
        return left.exists() and right.exists() and left.samefile(right)
    except OSError:
        return False


def protect_program_sources(program: Any, resolver: Resolver) -> None:
    """Overapproximate URI targets before any output effect, including invalid input."""
    pending = [program]
    refs: set[str] = set()
    while pending:
        value = pending.pop()
        if isinstance(value, dict):
            pending.extend(value.values())
        elif isinstance(value, list):
            pending.extend(value)
        elif is_uri(value):
            refs.add(value)
    for ref in sorted(refs):
        try:
            resolver.resolve(ref)
        except (OSError, UnicodeError, ValueError, RuntimeError):
            # Known targets are protected before confinement/fragment refusal.
            # A failed physical resolution leaves protection incomplete.
            pass


def write_projection(path: Path, value: dict[str, Any]) -> None:
    temporary: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(dir=path.parent, prefix=".axiom-projection-", delete=False) as handle:
            temporary = Path(handle.name)
            handle.write(canonical_bytes(value) + b"\n")
        os.replace(temporary, path)
        temporary = None
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def project_cli(args: argparse.Namespace) -> int:
    inputs = [args.program, args.map, args.bindings]
    program: Any = None
    logical_map: Any = None
    resolver: Resolver | None = None
    source_safety = False
    selected = args.frame_index or []
    issues: list[dict[str, str]] = []
    root = "urn:axiom-indexer:diagnostic:projection"
    exit_code = 1
    result: dict[str, Any] | None = None
    try:
        program = load_json(args.program)
        resolver = Resolver(args.bindings, load_json(args.bindings))
        protect_program_sources(program, resolver)
        source_safety = resolver.protection_complete
        logical_map = load_json(args.map)
        evaluation, result = project_program(program, logical_map, resolver, selected, args.mode)
        issues.extend(evaluation["diagnostics"])
    except (OSError, UnicodeError, json.JSONDecodeError, DuplicateKeyError, ValueError, TypeError, RuntimeError) as exc:
        diagnostic(issues, "input_error", root, "input", str(exc))
        exit_code = 2

    source_safety = source_safety and resolver is not None and resolver.protection_complete
    safe_output = source_safety
    if args.output is not None:
        protected = inputs + list(resolver.protected_paths if resolver is not None else [])
        try:
            if any(path_alias(args.output, source) for source in protected):
                diagnostic(issues, "input_output_path_alias", root, "output", str(args.output))
                safe_output = False
                exit_code = 2
            elif not source_safety:
                diagnostic(issues, "output_safety_unresolved", root, "output", str(args.output))
                exit_code = 2
        except (OSError, ValueError, RuntimeError) as exc:
            diagnostic(issues, "output_safety_unresolved", root, "output", str(exc))
            safe_output = False
            exit_code = 2

    if not issues and result is not None:
        try:
            if args.output is None:
                write_json(None, result)
            else:
                write_projection(args.output, result)
                write_json(None, projection_report(program, logical_map, selected, []))
            return 0
        except (OSError, ValueError, UnicodeError) as exc:
            diagnostic(issues, "output_error", root, "output", str(exc))
            exit_code = 2
    if args.output is not None and safe_output:
        try:
            clear_stale_map(args.output)
        except OSError as exc:
            diagnostic(issues, "stale_output_removal_failed", root, "output", str(exc))
            exit_code = 2
    write_json(None, projection_report(program, logical_map, selected, issues))
    return exit_code


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    validate_parser = subparsers.add_parser("validate")
    validate_parser.add_argument("--program", type=Path, required=True)
    validate_parser.add_argument("--bindings", type=Path, required=True)
    validate_parser.add_argument("--output", type=Path)
    validate_parser.add_argument("--emit-map", type=Path)
    join_parser = subparsers.add_parser("join")
    join_parser.add_argument("--input", type=Path, required=True)
    join_parser.add_argument("--output", type=Path)
    project_parser = subparsers.add_parser("project")
    project_parser.add_argument("--program", type=Path, required=True)
    project_parser.add_argument("--map", type=Path, required=True)
    project_parser.add_argument("--bindings", type=Path, required=True)
    project_parser.add_argument("--frame-index", action="append")
    project_parser.add_argument("--mode")
    project_parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    if args.command == "project":
        return project_cli(args)

    if args.command == "join":
        if args.output is not None and path_alias(args.input, args.output):
            print("join_error:input_output_path_alias", file=sys.stderr)
            return 2
        try:
            sections = load_json(args.input)
            joined = join_sections(sections)
        except (
            OSError,
            UnicodeDecodeError,
            json.JSONDecodeError,
            DuplicateKeyError,
            ValueError,
        ) as exc:
            print(f"join_error:{exc}", file=sys.stderr)
            return 2
        write_text(args.output, joined)
        return 0

    inputs = [args.program, args.bindings]
    outputs = [path for path in (args.output, args.emit_map) if path]
    input_alias = any(
        path_alias(output, source) for output in outputs for source in inputs
    )
    output_alias = len(outputs) == 2 and path_alias(outputs[0], outputs[1])
    if input_alias or output_alias:
        if args.emit_map is not None and not any(
            path_alias(args.emit_map, source) for source in inputs
        ):
            clear_stale_map(args.emit_map)
        write_json(None, input_failure("input_output_path_alias"))
        return 2
    try:
        program = load_json(args.program)
        binding_value = load_json(args.bindings)
        resolver = Resolver(args.bindings, binding_value)
        validation = validate_program(program, resolver)
    except (OSError, json.JSONDecodeError, DuplicateKeyError, ValueError) as exc:
        failure = input_failure(str(exc))
        write_json(args.output, failure)
        clear_stale_map(args.emit_map)
        return 2
    write_json(args.output, validation)
    if validation["status"] == "valid" and args.emit_map is not None:
        write_json(args.emit_map, instantiate(program, validation))
    elif validation["status"] == "invalid":
        clear_stale_map(args.emit_map)
    return 0 if validation["status"] == "valid" else 1


if __name__ == "__main__":
    raise SystemExit(main())
