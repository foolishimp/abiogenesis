#!/usr/bin/env python3
"""Copy checked operator input bytes; no Product edits or native calls."""
from pathlib import Path
import hashlib, json, os, subprocess, tarfile

base = Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01')
folder = base/'increment-b-01'
work = Path('/Users/jim/src/apps/abiogenesis-rc3-dogfood')
dest = work/'rc3-operator-inputs/increment-b-01'
released = Path('/Users/jim/.local/share/a_c/development-supplements/gc03-adb3d8ee-1')
archive = released/'archive.tgz'
digest = lambda data: hashlib.sha256(data).hexdigest()
assert not dest.exists() and not (folder/'provider-custody.json').exists()
archive_bytes = archive.read_bytes()
assert digest(archive_bytes) == 'cf6b1fcdebda5c6c90a644f17f7d1d01b298f53e6e0b17051b38971b14703a35'
inventory_bytes = (released/'contents/INVENTORY.json').read_bytes()
assert digest(inventory_bytes) == 'fc6befa45d62acd902665d545fc20f65dc3d435fa242a72aaa4e8986c080c003'
inventory = json.loads(inventory_bytes)['files']
prefix = 'a_c/build_tenants/graphify/'
members = [prefix+'code/'+p for p in ['ac_context_presentation.py','ac_formal_gate.py','ac_graph.py','ac_support.py','ac_support_composition.py','ac_support_core.py','ac_support_effects.py']]
members += [prefix+'design/'+p for p in ['fd-support.md','fd-support-host-lookup.md','fd-support-stdo-3.0.2.md','fd-method-stdo-3.0.2.json','fd-composition.md']]
payload = {}
with tarfile.open(archive, 'r:gz') as tar:
    for name in members:
        entry = tar.getmember(name)
        assert entry.isfile() and not entry.issym() and not entry.islnk()
        data = tar.extractfile(entry).read()
        assert data == (released/'contents'/name).read_bytes()
        assert digest(data) == inventory[name]['sha256'] and len(data) == inventory[name]['bytes']
        payload['gc03/'+name] = data
payload['gc03/INVENTORY.json'] = inventory_bytes
payload['gc03/release-installation.json'] = (released/'release-installation.json').read_bytes()
for name in ['task.md','HOW.md','rubric.json','grant.json']:
    payload[name] = (folder/name).read_bytes()
python = Path('/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12')
assert digest(python.read_bytes()) == 'a7f5b535d61d1c7326824204ac80f045a97a652abb154421e2c74fcc365a3539'
version = subprocess.check_output([str(python),'--version'],text=True).strip()
assert version == 'Python 3.12.8'
receipt = {'kind':'rc3_b_verified_released_gc03_read_inputs','releaseIdentity':'urn:a-c:development-supplement:governed-context:gc03-adb3d8ee:1',
 'archiveSha256':digest(archive_bytes),'inventorySha256':digest(inventory_bytes),'installedRoot':str(released),
 'python':{'path':str(python),'version':version,'sha256':digest(python.read_bytes())},
 'files':{name:{'sha256':digest(data),'bytes':len(data)} for name,data in sorted(payload.items())},
 'boundary':'These are byte-verified declared read inputs, not runtime release selection or admission. Runtime must select and verify the installed release; no source-checkout fallback.',
 'archivePacketMetadata':'Archive draft status is historical; the separate local release-installation record is the later owner-selected status.'}
receipt_bytes = (json.dumps(receipt,indent=2,sort_keys=True)+'\n').encode()
payload['provider-custody.json'] = receipt_bytes
dest.mkdir(parents=True,exist_ok=False)
for name,data in payload.items():
    target=dest/name; target.parent.mkdir(parents=True,exist_ok=True)
    with target.open('xb') as output: output.write(data)
with (folder/'provider-custody.json').open('xb') as output: output.write(receipt_bytes)
print(json.dumps({'inputCount':len(payload),'bytes':sum(map(len,payload.values())),'providerCustodySha256':digest(receipt_bytes),'python':receipt['python']}))
