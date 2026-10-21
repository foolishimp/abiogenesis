from pathlib import Path
import datetime
import hashlib
import json
import os
import subprocess
import sys
import time

root = Path(__file__).resolve().parent
tenant = root / "stage/build_tenants/abiogenesis/typescript"
node = "/opt/homebrew/Cellar/node/24.7.0/bin/node"
npm = "/opt/homebrew/bin/npm"
commands = {
    "dependencies": [npm, "ci", "--offline", "--ignore-scripts", "--no-audit", "--no-fund"],
    "tsc": [node, "node_modules/typescript/bin/tsc", "-p", "tsconfig.json"],
    "generate": [node, "scripts/generate-product-manifest.mjs"],
    "pack": [npm, "pack", "--ignore-scripts", "--json", "--pack-destination", str(root / "artifacts")],
}
label = sys.argv[1]
argv = commands[label]
environment = {
    "PATH": "/opt/homebrew/Cellar/node/24.7.0/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin",
    "HOME": "/Users/jim",
    "LANG": "en_AU.UTF-8",
    "npm_config_offline": "true",
    "npm_config_ignore_scripts": "true",
    "npm_config_audit": "false",
    "npm_config_fund": "false",
    "npm_config_update_notifier": "false",
    "npm_config_logs_dir": str(root / "npm-logs"),
}
pins = {
    Path(node): "fe1c0128a4c0163b034ec06b8b290494830ccb49922b5ce9ca4edf497a083e5f",
    Path(npm): "8e5f6f3429f8cdbe693cdc29904e9d5a7b127a494bd15c804bd54c7403bfcbe7",
    tenant / "package-lock.json": "df8d50ad51f46c58d9a38bcc3dd864de0e43337dc8990886b93ad46ab298ef12",
}
for path, expected in pins.items():
    assert hashlib.sha256(path.read_bytes()).hexdigest() == expected, path
prefix = root / "commands" / label
for suffix in [".request.json", ".result.json", ".stdout", ".stderr"]:
    assert not prefix.with_suffix(suffix).exists(), "no retry or overwrite"
request = {
    "label": label,
    "argv": argv,
    "cwd": str(tenant),
    "environment": environment,
    "startedUtc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "grant": "COMBINED-L3-01",
}
with prefix.with_suffix(".request.json").open("x") as f:
    json.dump(request, f, indent=2)
    f.write("\n")
started = time.monotonic()
with prefix.with_suffix(".stdout").open("xb") as stdout, prefix.with_suffix(".stderr").open("xb") as stderr:
    result = subprocess.run(argv, cwd=tenant, env=environment, stdout=stdout, stderr=stderr, check=False)
receipt = {
    "exitCode": result.returncode,
    "wallMs": (time.monotonic() - started) * 1000,
    "completedUtc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "stdoutSha256": hashlib.sha256(prefix.with_suffix(".stdout").read_bytes()).hexdigest(),
    "stderrSha256": hashlib.sha256(prefix.with_suffix(".stderr").read_bytes()).hexdigest(),
}
with prefix.with_suffix(".result.json").open("x") as f:
    json.dump(receipt, f, indent=2)
    f.write("\n")
print(json.dumps({"label": label, **receipt}), flush=True)
if result.returncode:
    print(prefix.with_suffix(".stdout").read_text(errors="replace")[-12000:], file=sys.stderr)
    print(prefix.with_suffix(".stderr").read_text(errors="replace")[-12000:], file=sys.stderr)
sys.exit(result.returncode)
