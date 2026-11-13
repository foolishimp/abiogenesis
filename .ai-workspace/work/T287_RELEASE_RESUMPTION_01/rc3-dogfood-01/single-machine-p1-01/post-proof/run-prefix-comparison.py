#!/usr/bin/env python3
"""One Root-selected pair of read-only installed-owner prefix measurements."""
from pathlib import Path
import hashlib,json,os,stat,subprocess,sys
HERE=Path(__file__).resolve().parent
NODE=Path('/opt/homebrew/Cellar/node/24.7.0/bin/node')
def sha(p):
 h=hashlib.sha256()
 with p.open('rb')as f:
  for block in iter(lambda:f.read(1048576),b''):h.update(block)
 return h.hexdigest()
def check(row):
 p=Path(row['path']);s=p.lstat();assert stat.S_ISREG(s.st_mode)and not p.is_symlink()and p.resolve(strict=True)==p
 assert s.st_size==row['bytes']and sha(p)==row['sha256'],p
 return p
assert len(sys.argv)==3,'usage: python run-prefix-comparison.py FINAL_SELECTION.json BARE_SHA256'
selectionPath=Path(sys.argv[1]).resolve(strict=True);assert sha(selectionPath)==sys.argv[2]
s=json.loads(selectionPath.read_text());assert s['status']=='ROOT_SELECTED_MATCHED_PREFIX_COMPARISON'
assert s['fixture']['memberCount']==965 and len(s['fixture']['sha256'])==64
assert s['fixture']['claim']=='same logical fixture and declared owner workload; not historical B11 log equality'
check(s['fixture']['definition']);assert check(s['reader'])==HERE/'measure-prefix.mjs';assert check(s['runner'])==Path(__file__).resolve();assert check(s['node'])==NODE
assert s['old']['artifact']['sha256']=='0f77694c1930b069477afd39f0f33bcd53d1e60522b45c32da75b93b1628ac2c'
from urllib.parse import urlparse,unquote
physical=[]
for side in ['old','new']:
 r=s[side];check(r['artifact']);root=Path(r['installedRoot']);assert root.resolve(strict=True)==root
 assert isinstance(r['installedFilePins'],list)and len(r['installedFilePins'])>100
 for pin in r['installedFilePins']:
  p=check(pin);assert p.is_relative_to(root)
 actual=set()
 for p in root.rglob('*'):
  assert not p.is_symlink(),p
  if p.is_file():actual.add(str(p))
 assert actual=={p['path']for p in r['installedFilePins']},'incomplete installed payload pin closure'
 for pin in r.get('additionalDependencyPins',[]):check(pin)
 check(r['eventStoreModule']);assert Path(r['eventStoreModule']['path'])==root/'build/code/src/abg/event_store.js'
 prefix=json.loads(check(r['prefix']).read_text());ep=Path(unquote(urlparse(prefix['eventLogRef']).path));st=ep.stat()
 assert ep==check(r['eventFile'])and st.st_size==prefix['prefixLength']and 'sha256:'+r['eventFile']['sha256']==prefix['prefixDigest']
 case=json.loads(check(r['caseReport']).read_text())
 assert case['fixtureSha256']==s['fixture']['sha256']and case['memberCount']==965 and case['logicalOracleSha256']==s['fixture']['logicalOracleSha256']
 # The case report is routing custody, not an independently minted admission.
 assert case['actualPrefixCoordinateDigest']==prefix['coordinateDigest']
 physical.append((ep,st.st_dev,st.st_ino,st.st_size,r['eventFile']['sha256']))
assert s['old']['artifact']['sha256']!=s['new']['artifact']['sha256']
out=Path(s['outputRoot']);assert out.is_absolute()and not out.exists(),'no overwrite/retry';out.mkdir(mode=0o700)
(out/'STARTED.json').write_text(json.dumps({'selectionSha256':sys.argv[2],'purpose':'Root-selected read-only matched owner measurements; no provider/Public calls'})+'\n')
env={'HOME':'/Users/jim','PATH':'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin','NODE_OPTIONS':'--max-old-space-size=8192','LC_ALL':'C'}
for side in ['old','new']:
 command=[str(NODE),str(check(s['reader'])),str(selectionPath),side]
 r=subprocess.run(command,env=env,capture_output=True,timeout=180)
 for suffix,data in [('stdout.json',r.stdout),('stderr.txt',r.stderr)]:
  with(out/(side+'-'+suffix)).open('xb')as f:f.write(data)
 with(out/(side+'-execution.json')).open('x')as f:json.dump({'command':command,'exitStatus':r.returncode,'stdoutSha256':hashlib.sha256(r.stdout).hexdigest(),'stderrSha256':hashlib.sha256(r.stderr).hexdigest()},f,indent=2)
 if r.returncode:raise SystemExit('preserve failure; no automatic retry: '+side)
for p,dev,ino,size,digest in physical:
 st=p.stat();assert(st.st_dev,st.st_ino,st.st_size)==(dev,ino,size)and sha(p)==digest
(out/'READ_ONLY_CONFIRMED.json').write_text(json.dumps({'eventFilesUnchanged':True,'qualification':False,'limits':'Pair measures these selected owner reads; no end-to-end speedup or old-history-equivalence claim'})+'\n')
print(json.dumps({'outputRoot':str(out),'status':'measurements_retained','providerCalls':0,'PublicCalls':0}))
