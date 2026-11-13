# Prepared control launcher. Root must admit this exact operation before execution.
from pathlib import Path
import hashlib, json, os, sys
here = Path(__file__).resolve().parent
raw = (here / "BINDING.json").read_bytes()
assert len(sys.argv) == 2 and hashlib.sha256(raw).hexdigest() == sys.argv[1]
binding = json.loads(raw)
for key in ["scopeGrant", "preparation", "task"]:
    pin = binding[key]
    data = Path(pin["path"]).read_bytes()
    assert len(data) == pin["bytes"] and hashlib.sha256(data).hexdigest() == pin["sha256"]
for pin in binding["controlFiles"]:
    data = Path(pin["path"]).read_bytes()
    assert len(data) == pin["bytes"] and hashlib.sha256(data).hexdigest() == pin["sha256"]
scratch = Path(binding["scratchRoot"])
assert not scratch.exists() and not Path(binding["runtimeRoot"]).exists()
scratch.mkdir(mode=0o700)
Path(binding["environment"]["TMPDIR"]).mkdir(mode=0o700)
Path(binding["environment"]["NPM_CONFIG_CACHE"]).mkdir(mode=0o700)
node = "/opt/homebrew/Cellar/node/24.7.0/bin/node"
os.execv(node, [node, str(here / "host.mjs"), sys.argv[1]])
