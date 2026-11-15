"""<=60s bounded Node-only discriminator for the external subscriber."""
import hashlib,json,os,subprocess,time
from pathlib import Path
HERE=Path(__file__).resolve().parent
ACT=json.loads((HERE/'ACTIVATION.json').read_text())
OUT=Path(ACT['rawRoot'])/'synthetic-probe-01'
NODE='/opt/homebrew/bin/node'
def pin(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def main():
 OUT.mkdir();begin=time.monotonic();rows=[]
 try:
  results={}
  for name,instrumented,unhandled in [('baseline',False,False),('observed',True,False),('unhandled-baseline',False,True),('unhandled-observed',True,True)]:
   directory=OUT/name;directory.mkdir();trace=directory/'children';trace.mkdir()
   argv=[NODE]+(['--import',(HERE/'child-observer.mjs').as_uri()] if instrumented else [])+[str(HERE/'synthetic-node-probe.mjs')]+(['--unhandled'] if unhandled else [])
   env={'HOME':'/Users/jim','PATH':'/opt/homebrew/bin:/usr/bin:/bin','LANG':'C','LC_ALL':'C','ABG_PEER_DIAGNOSTIC_ROOT':str(trace)}
   r=subprocess.run(argv,env=env,capture_output=True,timeout=min(12,60-(time.monotonic()-begin)))
   (directory/'stdout.raw').write_bytes(r.stdout);(directory/'stderr.raw').write_bytes(r.stderr)
   rows.append({'name':name,'argv':argv,'exitCode':r.returncode,'stdout':pin(directory/'stdout.raw'),'stderr':pin(directory/'stderr.raw')})
   results[name]=r
  assert results['baseline'].returncode==results['observed'].returncode==0
  assert results['baseline'].stdout==results['observed'].stdout
  assert results['baseline'].stderr==results['observed'].stderr==b''
  assert results['unhandled-baseline'].returncode==results['unhandled-observed'].returncode==1
  assert results['unhandled-baseline'].stdout==results['unhandled-observed'].stdout==b''
  assert b'ENOENT' in results['unhandled-baseline'].stderr and b'ENOENT' in results['unhandled-observed'].stderr
  closed=[json.loads(p.read_text()) for p in (OUT/'observed'/'children').glob('process-*/*-close.json')]
  assert any(r['close']['code']==7 for r in closed)
  assert any(r['close']['signal']=='SIGTERM' and r['close']['killed'] for r in closed)
  assert any(any(e['code']=='ENOENT' for e in r['errors']) for r in closed)
  assert any(any(s['status']=='unobserved_not_already_flowing' for s in r['streams']) for r in closed)
  original=(OUT/'observed'/'children');assert any(p.read_bytes()==b'original-error\n' for p in original.glob('process-*/*-stderr.raw'))
  for p in (OUT/'observed'/'children').glob('process-*/PROCESS_END.json'):assert json.loads(p.read_text())['observerFailures']==[]
  result={'disposition':'passed','elapsedMs':round((time.monotonic()-begin)*1000),'commands':rows,
   'relations':['original stdout/stderr, success/error fields and callback count equal','unhandled spawn error remains exit1','exit7, timeout killed/SIGTERM and ENOENT preserved before caller','already-unconsumed stream remains unobserved by subscriber'],
   'scope':'Synthetic Node controls only; not ABI proof, measured Product overhead, SDK phase attribution or qualification.'}
 except BaseException as e:
  result={'disposition':'failed','elapsedMs':round((time.monotonic()-begin)*1000),'commands':rows,'error':{'name':type(e).__name__,'message':str(e)}}
 finally:
  (OUT/'RETURN.json').write_text(json.dumps(result,indent=2)+'\n')
 print(json.dumps(result));return 0 if result['disposition']=='passed' else 1
if __name__=='__main__':raise SystemExit(main())
