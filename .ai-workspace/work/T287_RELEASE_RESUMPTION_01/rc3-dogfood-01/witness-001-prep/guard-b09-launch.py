#!/usr/bin/env python3
"""Verify Root-selected frozen invocation, then exec the existing launcher once."""
from pathlib import Path
import hashlib,json,os,stat,sys
HERE=Path(__file__).resolve().parent
MANIFEST=HERE/'B09_LAUNCH_MANIFEST.json'
def sha(p):
 h=hashlib.sha256()
 with p.open('rb')as f:
  for block in iter(lambda:f.read(1048576),b''):h.update(block)
 return h.hexdigest()
def require(ok,message):
 if not ok:raise ValueError(message)
try:
 require(len(sys.argv)==2,'usage: pinned-python -I -B guard-b09-launch.py MANIFEST_BARE_SHA256')
 require(sha(MANIFEST)==sys.argv[1],'launch manifest pin mismatch')
 m=json.loads(MANIFEST.read_text());require(m['kind']=='b09_exact_prepared_witness_launch','wrong manifest kind')
 for row in m['files']:
  p=Path(row['path']);s=p.lstat();require(str(p.resolve(strict=True))==str(p) and stat.S_ISREG(s.st_mode),'noncanonical or nonregular frozen file: '+str(p))
  require(s.st_size==row['bytes'] and sha(p)==row['sha256'],'frozen file changed: '+str(p))
 for row in m['executableAliases']:require(str(Path(row['configuredPath']).resolve(strict=True))==row['realPath'],'executable alias changed')
 e=m['eventResource'];p=Path(e['path']);s=p.stat();require(s.st_dev==e['device'] and s.st_ino==e['inode'] and s.st_size==e['bytes'] and sha(p)==e['sha256'],'actual physical event prefix changed')
 require(not Path(m['startMarker']).exists(),'native launch already started; no retry')
 require(str(Path(sys.executable).resolve(strict=True))==m['python'],'guard interpreter differs')
 require(os.environ.get('CLAUDE_CODE_OAUTH_TOKEN'),'existing named credential binding unavailable')
 # Existing run-b07.mjs owns its exclusive launch marker and normal lifecycle call.
 # This guard supplies no authority/Result, mutates no prepared bytes, and retries nothing.
 os.execv(m['node'],[m['node'],m['launcher'],m['profile'],'sha256:'+m['profileSha256']])
except (ValueError,KeyError,OSError,TypeError,json.JSONDecodeError)as e:
 print(json.dumps({'kind':'b09_frozen_launch_refused','reason':str(e)}),file=sys.stderr);sys.exit(2)
