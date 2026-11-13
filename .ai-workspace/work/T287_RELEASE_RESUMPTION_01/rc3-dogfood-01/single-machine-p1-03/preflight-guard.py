#!/usr/bin/env python3
"""Root-only frozen input verification then actual installed-renderer preflight; no provider/Public call."""
import hashlib,json,os,subprocess,sys
from pathlib import Path
P=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-03')
def sha(b):return hashlib.sha256(b).hexdigest()
def main():
 if len(sys.argv)!=2:raise ValueError('usage: preflight-guard.py SHA256_HEX')
 raw=(P/'PREFLIGHT_BINDING.json').read_bytes()
 if sha(raw)!=sys.argv[1]:raise ValueError('binding changed')
 d=json.loads(raw)
 if d['kind']!='single_machine_p1_preflight_binding' or d['status']!='ROOT_SELECTED_MODEL_FREE_PREFLIGHT' or d['providerDispatch'] is not False:raise ValueError('wrong preparation binding')
 for r in d['files']:
  path=Path(r['path']);v=path.read_bytes()
  if len(v)!=r['bytes'] or sha(v)!=r['sha256']:raise ValueError('changed input '+str(path))
 inherited=json.loads(Path(d['inheritedInstalledCustody']['path']).read_text())
 ir=d['inheritedInstalledCustody'];ib=Path(ir['path']).read_bytes()
 if len(ib)!=ir['bytes'] or sha(ib)!=ir['sha256']:raise ValueError('inherited installed custody changed')
 count=0
 for r in inherited['files']:
  if r['path'].startswith(d['inheritedRuntimeRoot']+'/sandbox/installed/'):
   v=Path(r['path']).read_bytes();count+=1
   if len(v)!=r['bytes'] or sha(v)!=r['sha256']:raise ValueError('installed payload changed '+r['path'])
 if count!=d['inheritedInstalledFileCount']:raise ValueError('installed file count changed')
 for r in d['executables']:
  if os.path.realpath(r['configuredPath'])!=r['realPath']:raise ValueError('executable path changed')
  v=Path(r['realPath']).read_bytes()
  if len(v)!=r['bytes'] or sha(v)!=r['sha256']:raise ValueError('executable bytes changed')
 ep=Path(d['eventPrefix']['path']);st=ep.stat();v=ep.read_bytes()
 if st.st_size!=d['eventPrefix']['bytes'] or sha(v)!=d['eventPrefix']['sha256'] or st.st_dev!=d['eventPrefix']['device'] or st.st_ino!=d['eventPrefix']['inode']:raise ValueError('fresh event prefix changed')
 if (P/'model-free-preflight.json').exists():raise ValueError('preflight receipt already exists; no automatic retry')
 py=d['offlineDependency']['python'];script=d['offlineDependency']['script'];inventory=d['offlineDependency']['inventory']
 completed=subprocess.run([py,'-I','-B',script,'--verify'],capture_output=True,text=True,timeout=120,check=True)
 if json.loads(completed.stdout)!=json.loads(Path(inventory).read_text()):raise ValueError('offline dependency result changed')
 env=os.environ.copy();env['NODE_OPTIONS']='--max-old-space-size=8192'
 os.execve(d['nodePath'],[d['nodePath'],'--experimental-vm-modules',str(P/'preflight.mjs')],env)
if __name__=='__main__':
 try:main()
 except (ValueError,KeyError,OSError,TypeError,subprocess.SubprocessError) as e:print(json.dumps({'status':'refused','reason':str(e)}),file=sys.stderr);sys.exit(2)
