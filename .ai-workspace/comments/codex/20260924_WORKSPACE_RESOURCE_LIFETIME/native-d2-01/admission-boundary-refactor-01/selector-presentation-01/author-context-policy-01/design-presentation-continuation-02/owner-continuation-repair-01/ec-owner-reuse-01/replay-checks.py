from pathlib import Path
import json,os,subprocess
packet=Path(__file__).resolve().parent
repo=next(p for p in packet.parents if (p/'stdo_abiogenesis.json').is_file())
package=repo/'build_tenants/abiogenesis/typescript'
fixture=json.loads((packet/'closed-fixture.json').read_text())
env={k:v for k,v in os.environ.items() if not k.startswith(('ABI5_','ABG_OWNER_','P0_'))}
env.update(ABI5_EC_OWNER_EVIDENCE=str(packet),ABI5_EC_OWNER_CLOSED_HISTORY=str(packet/'closed-opus04-prefix.jsonl'),ABI5_EC_OWNER_CLOSED_SHA256=fixture['fixtureSha256'])
raise SystemExit(subprocess.run(['node','--experimental-vm-modules','--test','test_env/tests/t287-event-calculus-owner-continuation.test.mjs'],cwd=package,env=env).returncode)
