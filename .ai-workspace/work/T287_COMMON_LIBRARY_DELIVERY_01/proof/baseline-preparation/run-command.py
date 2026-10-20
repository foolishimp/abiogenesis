from pathlib import Path
import datetime
import hashlib
import json
import os
import subprocess
import sys
import time

record_root = Path(__file__).resolve().parent
proof_root = record_root.parent
cwd = proof_root / "baseline-build/build_tenants/abiogenesis/typescript"
label = sys.argv[1]
assert label and all(c.isalnum() or c in "-_" for c in label)
argv = sys.argv[2:]
assert argv
prefix = record_root / "commands" / label
environment = dict(os.environ)
environment.update({
    "npm_config_offline": "true",
    "npm_config_audit": "false",
    "npm_config_fund": "false",
    "npm_config_update_notifier": "false",
    "npm_config_logs_dir": str(record_root / "npm-logs"),
})
request = {
    "argv": argv,
    "cwd": str(cwd),
    "started_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "environment_overrides": {
        key: value for key, value in environment.items()
        if key in (
            "npm_config_offline", "npm_config_audit", "npm_config_fund",
            "npm_config_update_notifier", "npm_config_logs_dir"
        )
    },
}
with prefix.with_suffix(".request.json").open("x") as target:
    json.dump(request, target, indent=2)
    target.write("\n")
started = time.monotonic()
with prefix.with_suffix(".stdout").open("xb") as stdout, prefix.with_suffix(".stderr").open("xb") as stderr:
    completed = subprocess.run(argv, cwd=cwd, env=environment, stdout=stdout, stderr=stderr, check=False)
result = {
    "exit_code": completed.returncode,
    "wall_ms": (time.monotonic() - started) * 1000,
    "completed_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "stdout_sha256": hashlib.sha256(prefix.with_suffix(".stdout").read_bytes()).hexdigest(),
    "stderr_sha256": hashlib.sha256(prefix.with_suffix(".stderr").read_bytes()).hexdigest(),
}
with prefix.with_suffix(".result.json").open("x") as target:
    json.dump(result, target, indent=2)
    target.write("\n")
print(json.dumps({"label": label, **result}), flush=True)
if completed.returncode:
    print(prefix.with_suffix(".stderr").read_text(errors="replace")[-12000:], file=sys.stderr, flush=True)
sys.exit(completed.returncode)
