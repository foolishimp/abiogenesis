#!/usr/bin/env python3
"""One prospective bounded S06 Operator; requires a separate Root execution binding."""
import datetime as dt,hashlib,json,os,pathlib,re,sys,tarfile
sys.dont_write_bytecode=True
from bounded import run,save
C=pathlib.Path(__file__).resolve().parent
def sha(p):
 h=hashlib.sha256()
 with pathlib.Path(p).open('rb') as s:
  for x in iter(lambda:s.read(1048576),b''):h.update(x)
 return h.hexdigest()
def need(v,m):
 if not v:raise RuntimeError(m)
def main():
 need(len(sys.argv)==2,'Supply a separately accepted exact binding')
 bp=pathlib.Path(sys.argv[1]).resolve();b=json.loads(bp.read_text());need(b.get('executionAuthorized') is True and b.get('executionGrant'),'Execution is not authorized')
 need(pathlib.Path(sys.executable).resolve()==pathlib.Path(b['pythonPath']),'Actual Python differs');
 m=json.loads((C/'CONTROL_MANIFEST.json').read_text());need(sha(C/'CONTROL_MANIFEST.json')==b['controlManifestSha256'],'Manifest changed')
 deadline=dt.datetime.fromisoformat(b['deadlineUtc'].replace('Z','+00:00'));until=deadline-dt.timedelta(milliseconds=b['exitAuditReserveMs'])
 need((until-dt.datetime.now(dt.timezone.utc)).total_seconds()>60,'Insufficient original budget')
 root=pathlib.Path(b['rawRoot']);work=pathlib.Path(b['worksiteRoot']);source=pathlib.Path(b['controlSourceRoot']);candidate=b['candidate'];cfg=b['configuration']
 need(not root.exists() and not work.exists(),'Fresh roots required; no retry')
 need(root.is_absolute() and root.resolve()==root and work.is_absolute() and work.resolve()==work,'Canonical exact roots required')
 need(all(candidate.get(k) for k in ['archivePath','archiveSha256','bootstrapPackageRoot','sourceCommit','packageVersion','manifestSha256']),'Root candidate unresolved')
 need(b['controlSourceCommit'] and b['topologyAcceptance']['path'] and b['topologyAcceptance']['sha256'],'Root source/topology binding unresolved')
 env=dict(b['setupEnvironment']);keys=cfg['provider']['inheritEnvironment'];secrets={k:os.environ[k] for k in keys}
 need(not set(keys)&set(env),'Credentials in setup environment')
 for key,value in secrets.items():need(value and value not in bp.read_text(),'Missing or retained credential: '+key)
 for kind in ['USERCONFIG','GLOBALCONFIG']:
  p=pathlib.Path(env['NPM_CONFIG_'+kind]);need(p==C/('npm-'+('user' if kind=='USERCONFIG' else 'global')+'.npmrc') and p.is_file() and not p.is_symlink() and p.stat().st_size==0,'Immutable distinct npm configuration required')
 root.mkdir(parents=True);save(root/'BINDING.json',b);save(root/'CONTROL_START.json',{'at':dt.datetime.now(dt.timezone.utc).isoformat(),'deadlineUtc':deadline.isoformat(),'executionDeadlineUtc':until.isoformat(),'newClock':False,'source':'Separately Root-selected prospective grant'})
 pathlib.Path(env['TMPDIR']).mkdir(parents=True,exist_ok=True)
 count=0
 def command(label,argv,cap=60000,environment=None,limit=until):
  nonlocal count;count+=1;folder=root/(str(count).zfill(3)+'-'+label);error=None
  try:run(folder,argv,str(source),env if environment is None else environment,limit,cap,b['maxCaptureBytes'])
  except Exception as e:error=str(e)
  finally:
   size=sum(p.stat().st_size for p in [folder/'stdout.raw',folder/'stderr.raw'] if p.exists());save(root/(folder.name+'.capture.json'),{'bytes':size,'limit':b['maxCaptureBytes'],'withinLimit':size<=b['maxCaptureBytes'],'error':error})
  need(error is None and size<=b['maxCaptureBytes'],error or 'Capture limit');return (folder/'stdout.raw').read_text()
 inputs=json.loads((C/'INPUTS.json').read_text());external=[inputs[k] for k in ['witness','sourceBasis','oracle','retainedOutcome','scalaRuntime']]+inputs['sources']+inputs['application']+inputs['declarations']
 def inventory():
  rows={};errors=[]
  for name,path in [('control:'+r['path'],C/r['path']) for r in m['controls']]+[('source:'+r['path'],source/r['path']) for r in m['inputs']]+[('external:'+r['path'],pathlib.Path(r['path'])) for r in external]+[('controlManifest',C/'CONTROL_MANIFEST.json'),('binding',bp),('archive',pathlib.Path(candidate['archivePath'])),('topologyAcceptance',pathlib.Path(b['topologyAcceptance']['path']))]+[('tool:'+k,pathlib.Path(v['path'])) for k,v in b['tools'].items()]:
   try:
    need(dt.datetime.now(dt.timezone.utc)<deadline,'Original audit deadline exhausted');need(path.is_file() and path.resolve()==path,'Input is absent/alias: '+str(path));rows[name]=sha(path)
   except Exception as e:errors.append({'input':name,'error':str(e)})
  package=pathlib.Path(candidate['bootstrapPackageRoot']);payload={}
  try:
   for parent,dirs,files in os.walk(package,followlinks=False):
    for name in dirs+files:need(not (pathlib.Path(parent)/name).is_symlink(),'Bootstrap symlink')
    for name in files:
     p=pathlib.Path(parent)/name;payload[p.relative_to(package).as_posix()]=sha(p)
   need(payload,'Empty candidate');rows['bootstrap']=payload
  except Exception as e:errors.append({'input':'bootstrap','error':str(e)})
  return {'rows':rows,'errors':errors}
 initial=None;failure=None
 try:
  initial=inventory();save(root/'INPUTS_ENTRY.json',initial);need(not initial['errors'],'Entry input acquisition failed')
  rows=initial['rows'];need(rows['archive']==candidate['archiveSha256'].removeprefix('sha256:'),'Archive differs');need(rows['topologyAcceptance']==b['topologyAcceptance']['sha256'],'Topology acceptance differs')
  for r in m['controls']:need(rows['control:'+r['path']]==r['sha256'],'Control changed: '+r['path'])
  for r in m['inputs']:need(rows['source:'+r['path']]==r['sha256'],'Maintained helper changed: '+r['path'])
  for r in external:need(rows['external:'+r['path']]==r['sha256'],'Imported input changed: '+r['path'])
  for k,v in b['tools'].items():need(rows['tool:'+k]==v['sha256'],'Tool changed: '+k)
  need(command('source-head',['git','-C',str(source),'rev-parse','HEAD']).strip()==b['controlSourceCommit'],'Source HEAD changed')
  expected={}
  with tarfile.open(candidate['archivePath'],'r:gz') as tar:
   for member in tar:
    if member.isdir():continue
    p=pathlib.PurePosixPath(member.name);need(member.isfile() and p.parts[0]=='package' and '..' not in p.parts,'Unsafe archive member');name='/'.join(p.parts[1:]);need(name not in expected,'Duplicate archive member');expected[name]=hashlib.sha256(tar.extractfile(member).read()).hexdigest()
  need(expected==rows['bootstrap'],'Archive/bootstrap exact set and byte mismatch');need(rows['bootstrap']['product-toolchain-manifest.json']==candidate['manifestSha256'],'Manifest mismatch')
  need(json.loads((pathlib.Path(candidate['bootstrapPackageRoot'])/'package.json').read_text())['version']==candidate['packageVersion'],'Candidate version mismatch')
  layout={'worksite':str(work),'writePaths':[str(work/p) for p in ['application','semantic-assets','evidence']],'protectedRoots':sorted(set([str(source),str(C),str(root),candidate['archivePath'],candidate['bootstrapPackageRoot'],str(root/'witness/sandbox/installed/abg'),str(root/'witness/sandbox/installed/test-consumer'),*b['protectedRoots']])),'archiveRoot':str(root)}
  save(root/'PLANNED_LAYOUT.json',layout);observation=json.loads(command('planned-topology',[b['pythonPath'],str(C/'physical-topology.py'),str(root/'PLANNED_LAYOUT.json')]))
  need(observation.get('ok') is True and observation.get('disposition')=='separated','Prospective topology failed')
  command('witness',[cfg['nodePath'],str(C/'HOST.mjs'),str(root/'BINDING.json')],int((until-dt.datetime.now(dt.timezone.utc)).total_seconds()*1000),{**env,**secrets})
 except Exception as e:failure=str(e);save(root/'FIRST_FAILURE.json',{'reason':failure,'retry':False,'qualified':False})
 finally:
  final=inventory();save(root/'INPUTS_EXIT.json',final);mismatch=[] if initial is None else [k for k in set(initial['rows'])|set(final['rows']) if initial['rows'].get(k)!=final['rows'].get(k)]
  save(root/'RETURN.json',{'status':'observed' if failure is None and initial and not final['errors'] and not mismatch else 'failed','failure':failure,'inputMismatches':mismatch,'inputErrors':final['errors'],'qualified':False,'scope':'Selected fresh S06 witness; independent semantic/evidence conjunction remains separate'})
  if failure or final['errors'] or mismatch:sys.exit(1)
if __name__=='__main__':main()
