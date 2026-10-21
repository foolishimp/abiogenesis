from pathlib import Path
import hashlib,json,os,stat,re,subprocess
R=Path('/Users/jim/src/apps/abiogenesis');W=Path(__file__).resolve().parent;S=W.parent/'c0-potential-effect-successor-06';P=Path('/private/tmp/abg-stdo3-finite-08-9d3470afc2b618e5')
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def wr(n,x):
 with (W/n).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
def row(p,root,physical=False):
 st=p.lstat();v={'path':str(p.relative_to(root)),'kind':'symlink' if p.is_symlink() else 'file','mode':oct(stat.S_IMODE(st.st_mode))}
 if p.is_symlink():v['target']=os.readlink(p)
 else:v.update(bytes=st.st_size,sha256=sha(p))
 if physical:v.update(dev=st.st_dev,inode=st.st_ino,nlink=st.st_nlink,mtime_ns=st.st_mtime_ns)
 return v
def inventory(root,physical=False):
 rows=[]
 for parent,dirs,files in os.walk(root,followlinks=False):
  for name in dirs+files:
   p=Path(parent)/name
   if p.is_symlink() or p.is_file():rows.append(row(p,root,physical))
 return sorted(rows,key=lambda x:x['path'])
def verify(p,x):
 if x.get('kind')=='symlink':assert p.is_symlink() and os.readlink(p)==x['target'],str(p)
 else:assert p.is_file() and sha(p)==x['sha256'] and p.stat().st_size==x['bytes'],str(p)
 if 'mode' in x:assert oct(stat.S_IMODE(p.lstat().st_mode))==x['mode'],str(p)
assert not (W/'freeze.json').exists()
configs=json.loads((W/'commands-config.json').read_text());results={p.name.removesuffix('.result.json'):json.loads(p.read_text()) for p in (W/'commands').glob('*.result.json')};failed=[k for k,v in results.items() if v['exitCode']!=0 or v.get('timeout')]
assert (W/'STOP.json').exists() if failed else len(results)==len(configs)
binding=json.loads((W/'input-binding.json').read_text())
for key in ['support','test','archive','adapter','node','template','sourceFreeze','stageInventory','oldHostCorrespondence','predecessorFreeze','previousOverlayBinding','reusedPreservation']:
 x=binding[key];assert sha(x['path'])==x['sha256'],key
for x in binding['selectedTests']:assert sha(x['path'])==x['sha256'],x['path']
wr('preservation-after.json',{'reusedPreservation':binding['reusedPreservation'],'predecessorFreeze':binding['predecessorFreeze'],'stageInventory':binding['stageInventory'],'sourceFreeze':binding['sourceFreeze'],'archive':binding['archive'],'currentSelectedTestPins':binding['selectedTests'],'currentMainSupport':binding['support'],'currentMainTest':binding['test'],'fullScansRepeated':0,'sourceBuildPackageEffects':False,'scope':'Reuse closed07/06/05 complete preservation chain; verify selected current inputs and immutable archive/tool/adapter. No new full-stage/main936/bootstrap scan or mutation.'})
summary=[]
for label,c in configs.items():
 result=results.get(label);out=(W/'commands'/f'{label}.stdout').read_text() if result else '';counts={}
 for key in ['tests','pass','fail','cancelled','skipped','todo']:
  m=re.search(r'(?:ℹ|#) '+key+r'\s+(\d+)',out)
  if m:counts[key]=int(m.group(1))
 summary.append({'id':label,'status':'not_executed_after_failure' if result is None else 'passed' if result['exitCode']==0 else 'failed','counts':counts,'result':result,'noCredit':c['noCredit'],'argv':c['argv'],'cwd':c['cwd']})
wr('mapped-outcomes.json',{'commands':summary,'reused':{'finite07':{'freezeSha256':'04c6e9dbdf22eb68ec3024240c7e7e64b951b9fa85f2aa849080e2f0fc09bd89','reopen18':18,'codec14':14,'rerun':False},'finite04':{'freezeSha256':'305ee8fa9a5bf84f5151a0699e0d51d9e534424304f5920bf1d3fdeca66536c5','U1':12,'C18':18,'rerun':False}},'nativeProviderSemanticCalls':0,'independentAcceptance':False})
if failed:
 out=(W/'commands'/f'{failed[0]}.stdout').read_text();failureSection=out[out.find('✖ failing tests:'):] if '✖ failing tests:' in out else out
 wr('failure-summary.json',{'firstFailedCommand':failed[0],'actualReporterDiagnostics':failureSection,'laterCommands':'Not started; original Node aggregate may finish its internal cases','stopSha256':sha(W/'STOP.json'),'repairOrRetry':False})
physical=inventory(P,True);wr('physical-inventory.json',{'root':str(P),'files':physical,'rows':len(physical),'logicalBytes':sum(x.get('bytes',0) for x in physical),'metadataClaim':'Original retained resources only. Existing selected test-owned cleanup may remove ephemeral logs; no fabricated retention or recovered physical authority.'})
pids={v['pid'] for v in results.values()};snapshot=subprocess.run(['/bin/ps','-axo','pid=,ppid=,pgid=,command='],check=True,capture_output=True,text=True);members=[]
for line in snapshot.stdout.splitlines():
 fields=line.strip().split(None,3)
 if len(fields)==4 and int(fields[2]) in pids:members.append({'pid':int(fields[0]),'ppid':int(fields[1]),'pgid':int(fields[2]),'command':fields[3]})
wr('process-observation.json',{'supervisedRootProcessGroups':sorted(pids),'observedMembers':members,'limit':'One read-only snapshot of exact supervised groups, not proof of absence of escaped descendants. Existing child ownership/disposal unchanged; no new signal or cleanup.'})
retained=sum(x.get('bytes',0) for x in physical)+sum(x.get('bytes',0) for x in inventory(W));assert retained<3*1024**3
wr('resource-cost.json',{'retainedLogicalBytesBeforeClosure':retained,'limit':3*1024**3,'physicalRows':len(physical),'physicalLogicalBytes':sum(x.get('bytes',0) for x in physical),'newArchiveStageOrOverlayCopies':False,'wallMsByCommand':{k:v['wallMs'] for k,v in results.items()}})
state='stopped' if failed else 'completed'
(W/'REPORT.md').write_text(f"""# Finite remaining proof08 {state}

Root selected resource-only correction from closed07: create and check the explicitly configured scratch parent before unchanged commands5–8. [Prospective binding](input-binding.json), [preflight](preflight-freeze.json), [actual initial directory identities](resources.json), [owning HOW](HOW-binding.md). No source/test/support/build/archive change. Runtime archive remains `{binding['archive']['sha256']}`.

[Measured outcomes](mapped-outcomes.json) retain exact argv, filters, stdout/stderr/status/PID and attribution. First failed command: {failed[0] if failed else 'none'}. No repair or retry. Reuse07 reopen18 18/18 and codec14 14/14, and finite04 U1 12/12 plus C18 18/18 without reruns. Route's two retained-native cases remain excluded. D02 retains the actual final04 owner adapter; its fixture wrapper remains controlled lower admission, not new installed acceptance.

[Preservation](preservation-after.json) reuses the closed complete stage/main936/bootstrap chain and checks selected current identities. No whole candidate rescan, repack, rebuild, old log reopening or cleanup. [Surviving physical evidence](physical-inventory.json) includes only bytes still present after original fixture disposal; removed ephemeral logs are not claimed retained. [Process observation](process-observation.json) is limited to the exact supervised groups. New retained bytes remain below3GiB. Return this frozen cut to Root; no independent or release acceptance.
""")
files=inventory(W);freeze={'kind':'closed_stopped_writer_subject' if failed else 'closed_writer_subject','activation':'FINITE-REST-08','status':'incomplete' if failed else 'candidate_ready','archiveSha256':binding['archive']['sha256'],'sourceFreezeSha256':binding['sourceFreeze']['sha256'],'preflightFreezeSha256':sha(W/'preflight-freeze.json'),'stopSha256':sha(W/'STOP.json') if failed else None,'reportSha256':sha(W/'REPORT.md'),'files':files,'recordCount':len(files),'logicalBytes':sum(x.get('bytes',0) for x in files),'physicalInventorySha256':sha(W/'physical-inventory.json'),'physicalRows':len(physical),'physicalLogicalBytes':sum(x.get('bytes',0) for x in physical),'executedCommands':len(results),'failedCommands':failed,'unexecutedCommands':[k for k in configs if k not in results]};wr('freeze.json',freeze)
for x in files:verify(W/x['path'],x)
print(json.dumps({'freezeSha256':sha(W/'freeze.json'),'records':len(files),'failed':failed,'retainedLogicalBytes':retained,'processGroupMembers':members,'outcomes':[{k:x[k] for k in ['id','status','counts']} for x in summary]}))
