from pathlib import Path
import hashlib,json,os,stat,re,subprocess
R=Path('/Users/jim/src/apps/abiogenesis');W=Path(__file__).resolve().parent;S=W.parent/'c0-potential-effect-successor-06';P=Path('/private/tmp/abg-stdo3-finite-07-f2e530a8c69d417b')
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
configs=json.loads((W/'commands-config.json').read_text());results={p.name.removesuffix('.result.json'):json.loads(p.read_text()) for p in (W/'commands').glob('*.result.json')};selected={k:v for k,v in results.items() if k!='syntax'}
failed=[k for k,v in selected.items() if v['exitCode']!=0 or v.get('timeout')];assert (W/'STOP.json').exists() if failed else len(selected)==len(configs)
binding=json.loads((W/'overlay-binding.json').read_text())
for key in ['support','overlaySupport','test','overlayTest','reusedFocusedPreservation','stageInventory','sourceFreeze','oldHostCorrespondence','archive','adapter','node','template','reusedCompletePreservation','predecessorFreeze']:
 x=binding[key];assert sha(x['path'])==x['sha256'],key
for x in binding['focusedCurrentPins']:assert sha(x['path'])==x['sha256'],x['path']
for x in binding['unchangedLinks']:assert Path(x['path']).is_symlink() and os.readlink(x['path'])==x['target'] and str(Path(x['path']).resolve())==x['canonicalTarget']
wr('preservation-after.json',{'reusedCompletePreservation':binding['reusedCompletePreservation'],'reusedPredecessorFreeze':binding['predecessorFreeze'],'stageInventorySha256':binding['stageInventory']['sha256'],'archiveSha256':binding['archive']['sha256'],'focusedCurrentPinsExact':binding['focusedCurrentPins'],'mainTestSha256':binding['test']['sha256'],'mainSupportSha256':binding['support']['sha256'],'overlayExact':True,'fullScansRepeated':0,'productionBuildPackageChanges':False,'selectedSupportChanged':True,'scope':'Prior closed05 complete stage/main936/bootstrap preservation is reused as explicitly selected; current commands have no writable grant to those immutable subjects. Current focused bytes, archive and proof overlay verified.','sourceEffect':'Only main new-empty-append-sink.mjs hydrated Product-install owner-input causes cleared; current main test unchanged'})
summary=[]
for label,c in configs.items():
 result=selected.get(label);out=(W/'commands'/f'{label}.stdout').read_text() if result else '';counts={}
 for key in ['tests','pass','fail','cancelled','skipped','todo']:
  m=re.search(r'(?:ℹ|#) '+key+r'\s+(\d+)',out)
  if m:counts[key]=int(m.group(1))
 summary.append({'id':label,'status':'not_executed_after_failure' if result is None else 'passed' if result['exitCode']==0 else 'failed','counts':counts,'result':result,'noCredit':c['noCredit'],'argv':c['argv'],'cwd':c['cwd']})
wr('mapped-outcomes.json',{'commands':summary,'reusedFinite04':{'freezeSha256':'305ee8fa9a5bf84f5151a0699e0d51d9e534424304f5920bf1d3fdeca66536c5','U1':{'pass':12,'rerun':False},'C18':{'pass':18,'rerun':False}},'nativeProviderSemanticCalls':0,'independentAcceptance':False})
if failed:
 out=(W/'commands'/f'{failed[0]}.stdout').read_text();failureSection=out[out.find('✖ failing tests:'):] if '✖ failing tests:' in out else out
 wr('failure-summary.json',{'firstFailedCommand':failed[0],'actualReporterDiagnostics':failureSection,'laterCommands':'Not started; original Node aggregate may finish internal tests','stopSha256':sha(W/'STOP.json'),'repairOrRetry':False})
physical=inventory(P,True);wr('physical-inventory.json',{'root':str(P),'files':physical,'rows':len(physical),'logicalBytes':sum(x.get('bytes',0) for x in physical),'metadataClaim':'Original retained resource metadata; no reconstructed or removed ephemeral prefix claim. Existing fixture-owned cleanup only; no custom cleanup.'})
pids={v['pid'] for v in selected.values()};snapshot=subprocess.run(['/bin/ps','-axo','pid=,ppid=,pgid=,command='],check=True,capture_output=True,text=True);members=[]
for line in snapshot.stdout.splitlines():
 fields=line.strip().split(None,3)
 if len(fields)==4 and int(fields[2]) in pids:members.append({'pid':int(fields[0]),'ppid':int(fields[1]),'pgid':int(fields[2]),'command':fields[3]})
wr('process-observation.json',{'supervisedRootProcessGroups':sorted(pids),'observedMembers':members,'limit':'One read-only snapshot of the exact supervision groups, not proof of absence of escaped descendants. Setup/fresh-reopen children keep existing test ownership; no new signal/cleanup.'})
bytesRetained=sum(x.get('bytes',0) for x in physical)+sum(x.get('bytes',0) for x in inventory(W));assert bytesRetained<3*1024**3
wr('resource-cost.json',{'retainedLogicalBytesBeforeClosure':bytesRetained,'limit':3*1024**3,'physicalRows':len(physical),'physicalLogicalBytes':sum(x.get('bytes',0) for x in physical),'archiveOrStageCopy':False})
state='stopped' if failed else 'completed'
(W/'REPORT.md').write_text(f"""# Reopen18 owner-clone successor07 {state}

Root-selected support-only correction on immutable final06 archive `{binding['archive']['sha256']}`. Main support afterimage `{binding['support']['sha256']}`; unchanged test `{binding['test']['sha256']}`. [Finite support delta](support.diff), [owning HOW and typed handoff](HOW-binding.md), [prospective overlay binding](overlay-binding.json), [preflight freeze](preflight-freeze.json). No runtime, test, build or archive change.

The hydrated install passes empty original owner-input causes; the existing owner recreates embedded/reference body support from its exact acquired predecessor. Exact source owner lookup, complete candidate/lock and original event-ID equality remain. The unhydrated fallback and all non-install causes remain unchanged. This is a test-support reconstruction correction, not a Product or runtime fix.

[Measured commands](mapped-outcomes.json) and raw request/stdout/stderr/status/PID records preserve every actual result. First failed command: {failed[0] if failed else 'none'}. No repair or retry. U1 12/12 and C18 18/18 are reused from finite04 without rerun. Commands4–8 execute only after reopen18 and each preceding command passes. Original filters/exclusions and actual final04 D02 owner adapter remain exact. No independent acceptance or release claim follows.

[Preservation](preservation-after.json) reuses closed05 full stage/main936/bootstrap correspondence and closed06 focused preservation. Current selected support/test, immutable archive, focused runtime/support inputs, adapter and overlay links verified. No whole candidate scan, new ABI package, compile or bootstrap install. Runtime archive remains the final06 subject; test_env is a separately bound proof overlay.

[Actual remaining physical bytes](physical-inventory.json) and [process observation](process-observation.json) state their limits. Existing fixture cleanup may remove its disposable resources; no retained-prefix claim is made for removed logs. In predecessor06 the helper removed its failed two-install clone on refusal; its original coordinate remains in that immutable stdout only. Disposal code remains unchanged. No custom cleanup or prior append-owner reopening occurred. New retained bytes remain below3GiB. Return this exact cut to Root.
""")

files=inventory(W);freeze={'kind':'closed_stopped_writer_subject' if failed else 'closed_writer_subject','activation':'REOPEN18-OWNER-CLONE-SUCCESSOR-07','status':'incomplete' if failed else 'candidate_ready','sourceFreezeSha256':binding['sourceFreeze']['sha256'],'archiveSha256':binding['archive']['sha256'],'supportSha256':binding['support']['sha256'],'testSha256':binding['test']['sha256'],'preflightFreezeSha256':sha(W/'preflight-freeze.json'),'stopSha256':sha(W/'STOP.json') if failed else None,'reportSha256':sha(W/'REPORT.md'),'files':files,'recordCount':len(files),'logicalBytes':sum(x.get('bytes',0) for x in files),'physicalInventorySha256':sha(W/'physical-inventory.json'),'physicalRows':len(physical),'physicalLogicalBytes':sum(x.get('bytes',0) for x in physical),'completedCommands':len(selected),'failedCommands':failed,'unexecutedCommands':[k for k in configs if k not in selected]};wr('freeze.json',freeze)
for x in files:verify(W/x['path'],x)
print(json.dumps({'freezeSha256':sha(W/'freeze.json'),'records':len(files),'failed':failed,'retainedLogicalBytes':bytesRetained,'processGroupMembers':members}))
