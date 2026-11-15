#!/usr/bin/env python3
"""One 60s static/input/socket control check; never launches the actual Tool."""
import ast,datetime,hashlib,importlib.util,json,os,pathlib,shutil,sys,time
sys.dont_write_bytecode=True
from bounded import run,save
C=pathlib.Path(__file__).resolve().parent
RAW=pathlib.Path('/Users/jim/Library/Application Support/ABIogenesis/development-runs/rc14-s06-control-join-20261115-02')
SHORT=pathlib.Path('/private/tmp/as6p2')
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def main():
 assert not RAW.exists() and not SHORT.exists(),'One fresh control check; no retry'
 RAW.mkdir();SHORT.mkdir();started=datetime.datetime.now(datetime.timezone.utc);mono=time.monotonic();deadline=started+datetime.timedelta(seconds=60)
 save(RAW/'CONTROL_START.json',{'startedUtc':started.isoformat(),'deadlineUtc':deadline.isoformat(),'monotonicStart':mono,'maxSeconds':60,'cleanupReserveSeconds':15,'actualToolLaunched':False})
 b=json.loads((C/'BINDING.template.json').read_text());t=json.loads((C/'TOOLCHAIN.json').read_text())
 env={'HOME':str(SHORT),'TMPDIR':str(SHORT),'PATH':'/usr/bin:/bin','LANG':'en_US.UTF-8','LC_ALL':'C','PYTHONDONTWRITEBYTECODE':'1'}
 checks=[];failure=None
 try:
  manifest=json.loads((C/'CONTROL_MANIFEST.json').read_text())
  for row in manifest['controls']:assert sha(C/row['path'])==row['sha256'],row['path']
  for p in C.glob('*.py'):ast.parse(p.read_text(),filename=str(p))
  for p in C.glob('*.json'):json.loads(p.read_text())
  checks.append({'check':'Python AST, JSON and exact control hashes','passed':True})
  def command(label,argv):
   result=run(RAW/label,argv,str(C),env,deadline,45000,8388608);checks.append({'check':label,'result':result})
  for i,p in enumerate(sorted(C.glob('*.mjs'))):command('syntax-'+str(i),[b['configuration']['nodePath'],'--check',str(p)])
  command('canonical-types',[b['configuration']['nodePath'],'/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/node_modules/typescript/bin/tsc','--project',str(C/'tsconfig.noemit.json')])
  command('canonical-inputs',[b['configuration']['nodePath'],str(C/'static-input-join.mjs'),str(RAW/'prospective-shape')])
  spec=importlib.util.spec_from_file_location('s06_static_tool',C/'tool-launcher.py');tool=importlib.util.module_from_spec(spec);spec.loader.exec_module(tool)
  facts=tool.verify_inputs();save(RAW/'FROZEN_INPUTS.json',facts);checks.append({'check':'Complete frozen Tool inventories','passed':True})
  state=SHORT/'d1-a0b1c2d3';state.mkdir()
  for name in ['home','boot','global','ivy','coursier','tmp','ipc']:(state/name).mkdir()
  profile=RAW/'tool.sb';profile.write_text(tool.profile(t,state,SHORT,'d1',False))
  command('socket-controls',['/usr/bin/sandbox-exec','-f',str(profile),b['pythonPath'],str(C/'socket-control.py'),str(state)])
  checks.append({'check':'Actual generated native socket bound','bytes':len(str(state/'ipc').encode())+t['maxSocketSuffixBytesIncludingNul'],'limitExclusive':104})
 except BaseException as e:
  failure={'type':type(e).__name__,'message':str(e)};save(RAW/'FIRST_FAILURE.json',failure)
 finally:
  # Only this small synthetic control state; no live witness/Tool root exists.
  if SHORT.exists():shutil.rmtree(SHORT)
  within=time.monotonic()-mono<60 and datetime.datetime.now(datetime.timezone.utc)<deadline
  if not within:failure=failure or {'type':'DeadlineExceeded','message':'Original60s control grant expired'}
  result={'disposition':'preparation_checks_passed' if failure is None else 'stopped_unresolved','failure':failure,'checks':checks,'withinDeadline':within,
   'elapsedMs':round((time.monotonic()-mono)*1000),'shortControlRootAbsent':not SHORT.exists(),'candidateBound':False,'applicationOrProviderOrRuntimeAdmission':False,
   'limits':['Pure constructor shapes carry no D1 producer/lifecycle or runtime credit','No Java/SBT/Scala/Spark execution','Permission control is not application capacity proof']}
  save(RAW/'RETURN.json',result);print(json.dumps({k:v for k,v in result.items() if k!='checks'}))
 return 0 if failure is None else 1
if __name__=='__main__':raise SystemExit(main())
