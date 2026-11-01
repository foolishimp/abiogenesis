"""Short-lived pinned bridge from the ABG native owner to released GC03.

The native owner starts this adapter once per governed lookup request with an
exact Python executable (``-I -S -B``). It verifies the installed released GC03
supplement by inventory digest and member digests, imports only from that
installed root, and calls ``ac_support_core.HostLookupBinding.read`` with live
owner callbacks carried over stdio. For every resolution it runs the released
``context.assemble`` over the owner-derived request, keeps the complete returned
Context payload, mechanically derives the complete Recheck from the actual
packet, grant, policy and executor dependencies, verifies coverage and
currentness, and binds them as the released HostLookupResolution. Nothing is
persisted; no preflight is created. It mints no grant, keeps no state, reads no
source checkout and falls back to nothing.

Protocol, one JSON object per line:
  owner -> adapter  {"op":"read", ...pinned identities, derivation, key, offset, maxBytes}
  adapter -> owner  {"callback":"reacquire"|"resolve_artifact"|"query_artifacts","args":[...]}
  owner -> adapter  {"reply": <json or null>}
  adapter -> owner  {"result": <HostLookupBinding.read value>, "selection", "context", "recheck"}
                    | {"refusal":{"code","reason"}}

``derivation`` is {"request", "binding"}: the full released ``context.assemble``
request and the owner selection members other than context, subject, basis and
recheck_sha256, which only the released computation supplies. The
``reacquire`` callback returns the current owner derivation or null.
"""
from __future__ import annotations

import base64
import copy
import hashlib
import json
import os
import sys

GC03_MEMBERS = ("ac_support_core", "ac_support_composition", "ac_graph", "ac_formal_gate",
                "ac_support_effects", "ac_support", "ac_context_presentation")
CODE_PREFIX = "a_c/build_tenants/graphify/code/"


class Refusal(Exception):
    def __init__(self, code: str, reason: str) -> None:
        super().__init__(reason)
        self.code = code
        self.reason = reason


def emit(value: object) -> None:
    sys.stdout.write(json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n")
    sys.stdout.flush()


def callback(name: str, *args: object) -> object:
    emit({"callback": name, "args": list(args)})
    line = sys.stdin.readline()
    if not line:
        raise Refusal("observation_unavailable", "Native owner endpoint closed during lookup")
    reply = json.loads(line)
    if not isinstance(reply, dict) or set(reply) != {"reply"}:
        raise Refusal("contract_violation", "Native owner callback reply is malformed")
    return reply["reply"]


def sha256_file(path: str) -> str:
    with open(path, "rb") as handle:
        return hashlib.sha256(handle.read()).hexdigest()


def verify_release(request: dict) -> str:
    """Return the verified installed code directory or refuse; never a checkout."""
    root = request.get("installedRoot")
    if not isinstance(root, str) or not os.path.isabs(root) or os.path.realpath(root) != root:
        raise Refusal("authority_missing", "Installed GC03 root must be an exact canonical absolute path")
    installation = os.path.join(root, "release-installation.json")
    inventory = os.path.join(root, "contents", "INVENTORY.json")
    if not os.path.isfile(installation) or not os.path.isfile(inventory):
        raise Refusal("authority_missing", "Installed released GC03 is unavailable; no source-checkout fallback")
    with open(installation, "rb") as handle:
        record = json.loads(handle.read())
    if record.get("identity") != request.get("identity") or record.get("status") != "RELEASED" or \
            record.get("inventorySha256") != request.get("inventorySha256"):
        raise Refusal("basis_stale", "Installed GC03 release identity differs from the selected release")
    if sha256_file(inventory) != request.get("inventorySha256"):
        raise Refusal("basis_stale", "Installed GC03 inventory digest differs from the selected release")
    with open(inventory, "rb") as handle:
        files = json.loads(handle.read()).get("files", {})
    code = os.path.join(root, "contents", *CODE_PREFIX.rstrip("/").split("/"))
    for member in GC03_MEMBERS:
        entry = files.get(CODE_PREFIX + member + ".py")
        path = os.path.join(code, member + ".py")
        if not isinstance(entry, dict) or not os.path.isfile(path) or sha256_file(path) != entry.get("sha256"):
            raise Refusal("basis_stale", "Installed GC03 member differs from its released inventory: " + member)
    return code


def load_core(code: str):
    if any(name in sys.modules for name in GC03_MEMBERS):
        raise Refusal("authority_missing", "A GC03 module was preloaded outside the pinned release")
    sys.path[:] = [code] + [p for p in sys.path if p and os.path.realpath(p) != os.path.realpath(code)]
    import ac_support_core  # noqa: E402  (imported only from the verified installed root)
    for name in GC03_MEMBERS:
        module = sys.modules.get(name)
        if module is not None and os.path.dirname(os.path.realpath(module.__file__ or "")) != os.path.realpath(code):
            raise Refusal("authority_missing", "GC03 resolved outside the pinned installed release")
    return ac_support_core


BINDING_KEYS = {"owner", "admission", "owner_coordinates", "epoch", "principal_id", "actor_id", "grant_id",
                "executor_id", "operation", "policy_sha256", "context_id"}


def derive(core, runtime, derivation: object):
    """Released assembly and mechanical Recheck over one owner derivation."""
    if not isinstance(derivation, dict) or set(derivation) != {"request", "binding"} or \
            not isinstance(derivation["binding"], dict) or set(derivation["binding"]) != BINDING_KEYS:
        raise core.SupportError("contract_violation", "Native owner derivation is malformed")
    request = core.validate_request(copy.deepcopy(derivation["request"]))
    binding = copy.deepcopy(derivation["binding"])
    if request["operation"] != "context.assemble":
        raise core.SupportError("unsupported_contract", "Owner derivation must name the released context.assemble")
    out = core.execute_read(runtime, request)
    if out["refusal"] is not None:
        refusal = out["refusal"]
        raise core.SupportError(str(refusal.get("code", "contract_violation")), str(refusal.get("reason", "context.assemble refused")))
    contexts = [item["payload"] for item in out["artifacts"] if item["kind"] == "context"]
    if len(contexts) != 1:
        raise core.SupportError("contract_violation", "Released assembly returned no unique Context")
    context = contexts[0]
    grant_id = binding["grant_id"]; executor_id = binding["executor_id"]
    grant = core._grant(runtime, grant_id, "context.read")
    executors = runtime.policy["executors"]
    if executor_id not in executors:
        raise core.SupportError("authority_missing", "Owner executor is not a policy executor")
    packet = context["packet"]; admission = grant["admission"]
    sources = list(core._all_source_refs(packet)) + core._context_material_sources(context) + list(grant["authority_sources"])
    sources += [grant["outcome"]["source"], admission["mechanism_source"], admission["authority_source"],
                runtime.policy["product"]["authority_binding"]["owner_record"]]
    observations = list(packet["subject_basis"]["observations"])
    for item in grant["preconditions"]:
        (observations if set(item) == {"id", "sha256"} else sources).append(item)
    recheck = core._recheck(runtime, sources, observations, executors[executor_id]["dependencies"])
    core._host_recheck_coverage(runtime, context, grant_id, executor_id, recheck)
    fresh = core.check_preconditions(runtime, recheck)
    if fresh["changes"] or fresh["gaps"]:
        raise core.SupportError("basis_stale", "Currentness Recheck reports changes or gaps")
    basis = packet["subject_basis"]
    selection = {key: value for key, value in binding.items() if key != "context_id"}
    selection.update({"context": {"id": binding["context_id"], "sha256": core.digest(context)}, "subject": basis["subject"],
                      "basis": basis["method_profile"], "recheck_sha256": core.digest(recheck)})
    return core.HostLookupResolution(selection, context, recheck)


def main() -> int:
    line = sys.stdin.readline()
    try:
        request = json.loads(line) if line else None
        if not isinstance(request, dict) or request.get("op") != "read":
            raise Refusal("contract_violation", "Adapter accepts one owner read request")
        if sys.version_info.major != 3 or "%d.%d.%d" % sys.version_info[:3] != request.get("pythonVersion"):
            raise Refusal("basis_stale", "Python executable differs from the pinned version")
        core = load_core(verify_release(request))
    except Refusal as refusal:
        emit({"refusal": {"code": refusal.code, "reason": refusal.reason}})
        return 0
    try:
        def resolve_artifact(ref: dict) -> bytes:
            value = callback("resolve_artifact", ref)
            if not isinstance(value, str):
                raise core.SupportError("authority_missing", "Native owner resolves no such retained artifact")
            return base64.b64decode(value, validate=True)

        def query_artifacts(kind: str, query: dict) -> dict:
            value = callback("query_artifacts", kind, query)
            if not isinstance(value, dict):
                raise core.SupportError("authority_missing", "Native owner history is unavailable")
            return value

        runtime = core.Runtime.from_policy(request["policyPath"], request["policySha256"], request["principalId"],
                                           resolve_artifact=resolve_artifact, query_artifacts=query_artifacts)

        def reacquire():
            value = callback("reacquire")
            return None if value is None else derive(core, runtime, value)

        selected = derive(core, runtime, request["derivation"])
        binding = core.HostLookupBinding(runtime, selected.selection, reacquire)
        value = binding.read(request["key"], request["offset"], request["maxBytes"])
        emit({"result": value, "selection": selected.selection, "context": selected.context, "recheck": selected.recheck})
    except Refusal as refusal:
        emit({"refusal": {"code": refusal.code, "reason": refusal.reason}})
    except core.SupportError as error:
        emit({"refusal": {"code": error.code, "reason": error.reason}})
    except Exception as error:  # Fail closed with a class, never a partial value.
        emit({"refusal": {"code": "observation_unavailable", "reason": type(error).__name__}})
    return 0


if __name__ == "__main__":
    sys.exit(main())
