from pathlib import Path
import os,sys,json,hashlib,subprocess,time,signal,shutil
O=Path(__file__).resolve().parent

def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def checked(p):assert pin(p['path'])==p,p['path']
def save(p,x):
 with p.open('x') as f:json.dump(x,f,indent=2);f.write('\n')
b=json.loads((O/'BINDING.final.json').read_bytes());a=json.loads((O/'ROOT_EXECUTION_ADMISSION.json').read_bytes());assert a['binding']==pin(O/'BINDING.final.json')
for p in a['files']:checked(p)
def guard():
 for p in b['protectionPins']+[b['script'],b['extraction'],b['node'],b['compiledInventory'],b['sourceInventory']]:checked(p)
 for inv in [json.loads(Path(b['compiledInventory']['path']).read_bytes()),json.loads(Path(b['sourceInventory']['path']).read_bytes())]:
  root=Path(inv.get('root',inv.get('frozenRoot')))
  for row in inv['rows']:
   p=pin(root/row['path']);assert p['bytes']==row['bytes'] and p['sha256']==row['sha256']
guard();D=Path(b['outputRoot']);assert not (D/'RESULT.json').exists();assert shutil.disk_usage(D).free>=4294967296
start=time.monotonic();signals=[];timed=False;tooLarge=False
with (D/'stdout.log').open('xb') as out,(D/'stderr.log').open('xb') as err:
 child=subprocess.Popen(b['argv'],cwd=b['cwd'],env=b['environment'],stdin=subprocess.DEVNULL,stdout=out,stderr=err,start_new_session=True)
 save(D/'LAUNCH.json',{'argv':b['argv'],'pid':child.pid,'pgid':child.pid,'capSeconds':30,'admission':pin(O/'ROOT_EXECUTION_ADMISSION.json')})
 def absent():
  try:os.killpg(child.pid,0);return False
  except ProcessLookupError:return True
 while child.poll() is None:
  timed=time.monotonic()-start>=30;tooLarge=(D/'stdout.log').stat().st_size+(D/'stderr.log').stat().st_size>b['maxOutputBytes']
  if timed or tooLarge:break
  time.sleep(.05)
 cleanup=not absent()
 if cleanup:
  for sig,grace in [(signal.SIGTERM,5),(signal.SIGKILL,1)]:
   if absent():break
   try:os.killpg(child.pid,sig);signals.append(sig.name)
   except ProcessLookupError:break
   end=time.monotonic()+grace
   while time.monotonic()<end and not absent():child.poll();time.sleep(.05)
 try:code=child.wait(timeout=1)
 except subprocess.TimeoutExpired:code=None
report={'status':'FAILED_OR_INCOMPLETE','exitCode':code,'wallSeconds':time.monotonic()-start,'timedOut':timed,'outputExceeded':tooLarge,'signals':signals,'groupAbsent':absent(),'cleanupNeeded':cleanup,'stdout':pin(D/'stdout.log'),'stderr':pin(D/'stderr.log')}
try:
 guard();assert code==0 and not timed and not tooLarge and absent() and not cleanup
 result=json.loads((D/'RESULT.json').read_bytes());assert result['status']=='SOURCE_EXTRACTED_COUNTEREXAMPLES_OBSERVED';report['result']=pin(D/'RESULT.json');report['status']='FINITE_COUNTEREXAMPLES_RETAINED';report['protectionPins']=b['protectionPins']
except Exception as e:report['error']=str(e)
save(D/'RETURN.json',report);print(json.dumps({'status':report['status'],'receipt':pin(D/'RETURN.json')}));sys.exit(0 if report['status']=='FINITE_COUNTEREXAMPLES_RETAINED' else 1)
