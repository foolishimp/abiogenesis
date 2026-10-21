from pathlib import Path
import hashlib,json,os,stat,re,subprocess
R=Path('/Users/jim/src/apps/abiogenesis');W=Path(__file__).resolve().parent;S=W.parent/'c0-potential-effect-successor-06';P=Path('/private/tmp/abg-stdo3-finite-05-81459ad62ef037bc')
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
expected=json.loads((S/'stage-post-generation-inventory.json').read_text())['files']
for x in expected:verify(S/'stage'/x['path'],x)
assert inventory(S/'stage')==sorted(expected,key=lambda x:x['path'])
binding=json.loads((W/'overlay-binding.json').read_text())
for key in ['test','overlayTest','stageInventory','sourceFreeze','oldHostInventory','oldHostCorrespondence','archive','adapter','node','template']:
 x=binding[key];assert sha(x['path'])==x['sha256'],key
for x in binding['unchangedLinks']:assert Path(x['path']).is_symlink() and os.readlink(x['path'])==x['target'] and str(Path(x['path']).resolve())==x['canonicalTarget']
main=json.loads((W.parent/'u1-c0-physical-currentness-01/main-generated-preimage.json').read_text());main=main if isinstance(main,list) else main['files']
for x in main:verify(R/x['path'],x)
old=json.loads((S/'physical-inventory.json').read_text());hostPrefix='unavailable/host/node_modules/@abiogenesis/typescript-tenant/';hostRows=[x for x in old['files'] if x['path'].startswith(hostPrefix)]
for x in hostRows:verify(Path(old['root'])/x['path'],x)
wr('preservation-after.json',{'allStageRowsExact':len(expected),'stageInventorySha256':sha(S/'stage-post-generation-inventory.json'),'archiveSha256':binding['archive']['sha256'],'mainGeneratedExact':len(main),'bootstrapHostPackageRowsExact':len(hostRows),'mainTestSha256':binding['test']['sha256'],'overlayExact':True,'productionSupportBuildPackageChanges':False,'sourceEffect':'Only main m5-event-store-reopen.test.mjs'})
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
(W/'REPORT.md').write_text(f'''# Reopen18 successor05 {state}\n\nRoot-selected test-only successor on immutable final06 archive `{binding['archive']['sha256']}`. Main test afterimage `{binding['test']['sha256']}`; [preimage and finite delta](test.diff), [owning HOW](HOW-binding.md), [prospective overlay and input binding](overlay-binding.json), [preflight freeze](preflight-freeze.json). No production/support/build/archive change.\n\n[Measured commands](mapped-outcomes.json) and raw commands/stdout/stderr/status/PIDs preserve actual results. First failed command: {failed[0] if failed else 'none'}. No repair or retry; commands after any failure remain unexecuted. U1 12/12 and C18 18/18 are reused from finite04, not repeated. Runtime archive was selected through existing frozen-archive setup; no ABI pack/rebuild occurred.\n\nThe earlier main-generated inventory reader KeyError is retained in [original discovery error](preflight-reader-discovery.json) and [reader correspondence](reader-correspondence.json); it was an optional metadata-field assumption before any workload, not an integrity mismatch or retroactive pass. Completed successor preflight retained every declared hash/bytes/mode check.\n\n[Preservation](preservation-after.json) checks the6642 frozen stage rows, main936 generated files, selected archive and5271 read-only bootstrap package rows. [Actual remaining physical bytes](physical-inventory.json) and [process observation](process-observation.json) state their limits. Existing newly-created fixture cleanup may remove ephemeral logs; no retained-prefix claim is made for them. No custom cleanup or old append-owner reopening occurred. Retained bytes are below3GiB.\n\nThe test repair preserves named causal work/linear growth, exact warm/cold event and byte equality, contract-valid malformed semantic carriers, complete causal prefixes and separate owned-operation/output/cold-read measurements. Any failed or unreached assertion remains unproved. No final independent acceptance or release claim follows. Return this exact cut to Root.\n''')
files=inventory(W);freeze={'kind':'closed_stopped_writer_subject' if failed else 'closed_writer_subject','activation':'REOPEN18-TEST-SUCCESSOR-05','status':'incomplete' if failed else 'candidate_ready','sourceFreezeSha256':binding['sourceFreeze']['sha256'],'archiveSha256':binding['archive']['sha256'],'testSha256':binding['test']['sha256'],'preflightFreezeSha256':sha(W/'preflight-freeze.json'),'stopSha256':sha(W/'STOP.json') if failed else None,'reportSha256':sha(W/'REPORT.md'),'files':files,'recordCount':len(files),'logicalBytes':sum(x.get('bytes',0) for x in files),'physicalInventorySha256':sha(W/'physical-inventory.json'),'physicalRows':len(physical),'physicalLogicalBytes':sum(x.get('bytes',0) for x in physical),'completedCommands':len(selected),'failedCommands':failed,'unexecutedCommands':[k for k in configs if k not in selected]};wr('freeze.json',freeze)
for x in files:verify(W/x['path'],x)
print(json.dumps({'freezeSha256':sha(W/'freeze.json'),'records':len(files),'failed':failed,'retainedLogicalBytes':bytesRetained,'processGroupMembers':members}))
