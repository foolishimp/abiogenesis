from pathlib import Path
import hashlib,json,os,stat,subprocess,difflib,time
R=Path('/Users/jim/src/apps/abiogenesis');W=Path(__file__).resolve().parent;O=W.parent/'c0-potential-effect-successor-06';H=W.parent/'c2-source-prefix-repair-01';T=Path('build_tenants/abiogenesis/typescript')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def wr(n,x):
 with (W/n).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
def pin(p):return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
def row(p,root):
 st=p.lstat();x={'path':str(p.relative_to(root)),'kind':'symlink' if p.is_symlink() else 'file','mode':oct(stat.S_IMODE(st.st_mode))}
 if p.is_symlink():x['target']=os.readlink(p)
 else:x.update(bytes=st.st_size,sha256=sha(p))
 return x
def inventory(root):
 rows=[]
 for parent,dirs,files in os.walk(root,followlinks=False):
  for name in dirs+files:
   p=Path(parent)/name
   if p.is_symlink() or p.is_file():rows.append(row(p,root))
 return sorted(rows,key=lambda x:x['path'])
def verify(p,x):
 if x.get('kind',x.get('type'))=='symlink':assert p.is_symlink() and os.readlink(p)==x['target'],str(p)
 else:assert p.is_file() and sha(p)==x['sha256'] and p.stat().st_size==x['bytes'],str(p)
 if 'mode' in x:assert oct(stat.S_IMODE(p.lstat().st_mode))==x['mode'],str(p)
assert not (W/'freeze.json').exists()
configs=json.loads((W/'commands-config.json').read_text());results={p.name.removesuffix('.result.json'):json.loads(p.read_text()) for p in (W/'commands').glob('*.result.json') if p.name.removesuffix('.result.json') in configs};failed=[k for k,v in results.items() if v['exitCode']!=0 or v.get('timeout')]
assert (W/'STOP.json').exists() or (W/'first-cause.json').exists() if failed else len(results)==len(configs)
stage=W/'stage';source=json.loads((W/'source-inputs.json').read_text());grant=json.loads((W/'build-activation.json').read_text())
assert sha(H/'freeze.json')==grant['sourceWriterFreeze']['sha256']
for x in grant['sourceOutputs']:assert sha(Path(x['path']))==x['sha256'] and sha(stage/Path(x['path']).relative_to(R))==x['sha256']
old=json.loads((O/'stage-post-generation-inventory.json').read_text())['files']
for x in old:verify(O/'stage'/x['path'],x)
mainManifest=O.parent/'u1-c0-physical-currentness-01/main-generated-preimage.json';main=json.loads(mainManifest.read_text())
for x in main:verify(R/x['path'],x)
deps=json.loads((W/'dependency-inputs.json').read_text())['files']
for x in deps:verify(stage/T/'node_modules'/x['path'],x)
depmeta=json.loads((W/'dependency-directory-metadata.json').read_text())
for x in depmeta['copiedRows']:
 st=(stage/T/'node_modules'/x['path']).stat();assert oct(stat.S_IMODE(st.st_mode))==x['mode'] and st.st_mtime_ns==x['mtime_ns'],x['path']
for x in depmeta['sourceRows']:
 st=(O/'stage'/T/'node_modules'/x['path']).stat();assert oct(stat.S_IMODE(st.st_mode))==x['mode'] and st.st_mtime_ns==x['mtime_ns'],x['path']
assert (stage/T/'node_modules/.package-lock.json').stat().st_mtime_ns==depmeta['hiddenLock']['mtime_ns']
current=inventory(stage);before={x['path']:x for x in old};after={x['path']:x for x in current};assert set(before)==set(after)
delta=[{'before':before[p],'after':after[p]} for p in sorted(before) if before[p]!=after[p]]
for x in current:
 a=(stage/x['path']).lstat();b=(O/'stage'/x['path']).lstat();assert (a.st_dev,a.st_ino)!=(b.st_dev,b.st_ino),x['path']
 if x['kind']=='file':assert a.st_nlink==1
 if x['kind']=='symlink':assert (stage/x['path']).resolve().is_relative_to(stage)
wr('stage-final-inventory.json',{'files':current,'rows':len(current)})
wr('complete-delta.json',{'donor':pin(O/'stage-post-generation-inventory.json'),'sourceWriterFreeze':pin(H/'freeze.json'),'changes':delta,'noAddedOrRemovedMembers':True,'selectedSourcePaths':[str(Path(x['path']).relative_to(R)) for x in grant['sourceOutputs']],'codeExpectation':'execution_basis emitted JS only; all declarations, exports and other executable files exact'})
js=T/'build/code/src/abg/execution_basis.js';(W/'execution_basis.js.diff').write_text(''.join(difflib.unified_diff((O/'stage'/js).read_text().splitlines(True),(stage/js).read_text().splitlines(True),fromfile='closed06/'+str(js),tofile='C2-candidate/'+str(js),n=3)))
wr('preservation-after.json',{'donorFreeze':pin(O/'freeze.json'),'donorStageRowsVerified':len(old),'donorDependencyDirectoryRowsVerified':len(depmeta['sourceRows']),'mainGeneratedManifest':pin(mainManifest),'mainGeneratedRowsVerified':len(main),'allExact':True,'sourceWriterOutputsExact':True,'dependencyBytesModesLinksAndDirectoryMetadataExact':True,'sharedWritableInodes':0,'noMainOrOldStageMutation':True})
package=json.loads((W/'package-source-correspondence.json').read_text()) if (W/'package-source-correspondence.json').exists() else None
payload=json.loads((W/'archive-payload-owner-result.json').read_text()) if (W/'archive-payload-owner-result.json').exists() else None
if not failed:
 assert package['all_archive_member_bytes_match_stage'] and package['stage_unchanged_by_pack'] and package['proof_support_excluded_from_payload']
 assert payload['status']=='satisfied'
 assert len(json.loads((W/'metadata-correspondence.json').read_text())['catalogRows'])==75
 assert all(x['unchangedExactly'] for x in json.loads((W/'metadata-correspondence.json').read_text())['catalogRows'])
if package is not None:
 oldFreeze=json.loads((O/'freeze.json').read_text());oldFrozenRows={x['path']:x for x in oldFreeze['files']}
 assert sha(O/'archive-members.json')==oldFrozenRows['archive-members.json']['sha256']
 assert sha(R/oldFreeze['archive']['path'])==oldFreeze['archive']['sha256']=='25e7f390a899f3bd9c49fa11a15feba1f59cb2a1d2ba4bad1f62c1abc4224079'
 oldMembers={x['path']:x for x in json.loads((O/'archive-members.json').read_text())['files']};newMembers={x['path']:x for x in json.loads((W/'archive-members.json').read_text())['files']}
 assert set(oldMembers)==set(newMembers)
 memberDelta=[{'before':oldMembers[p],'after':newMembers[p]} for p in sorted(oldMembers) if oldMembers[p]!=newMembers[p]]
 assert {x['after']['path'] for x in memberDelta}=={'build/code/src/abg/execution_basis.js','product-toolchain-manifest.json','contracts/capabilities/capability-definition-graph.json'}
 wr('archive-member-delta.json',{'donorArchiveSha256':oldFreeze['archive']['sha256'],'candidateArchive':package['archive'],'donorMemberInventory':pin(O/'archive-members.json'),'candidateMemberInventory':pin(W/'archive-members.json'),'members':len(newMembers),'added':[],'removed':[],'changes':memberDelta,'relation':'Only emitted execution_basis JavaScript and the existing owner-derived manifest/capability graph identities changed; every other member byte/mode remains exact.'})
wr('command-summary.json',{'commands':[{'id':k,'status':'not_executed_after_failure' if k not in results else 'passed' if results[k]['exitCode']==0 else 'failed','result':results.get(k),'argv':v['argv']} for k,v in configs.items()],'tscCount':int('tsc' in results),'generatorCount':int('generate' in results),'packCount':int('pack' in results),'installedOrRuntimeWorkloads':0,'nativeProviderCalls':0})
pids={v['pid'] for v in results.values()};snapshot=subprocess.run(['/bin/ps','-axo','pid=,ppid=,pgid=,command='],check=True,capture_output=True,text=True);members=[]
for line in snapshot.stdout.splitlines():
 fields=line.strip().split(None,3)
 if len(fields)==4 and int(fields[2]) in pids:members.append({'pid':int(fields[0]),'ppid':int(fields[1]),'pgid':int(fields[2]),'command':fields[3]})
wr('process-observation.json',{'supervisedRootProcessGroups':sorted(pids),'observedMembers':members,'limit':'One read-only group snapshot; not proof of absence of escaped descendants. No custom cleanup or signals.'})
retained=sum(x.get('bytes',0) for x in inventory(W));assert retained<2*1024**3
wr('resource-cost.json',{'retainedLogicalBytesBeforeClosure':retained,'limit':2*1024**3,'stageLogicalBytes':sum(x.get('bytes',0) for x in current),'stageRows':len(current),'sourceRows':len(source['files']),'dependencyRows':len(deps),'dependencyDirectories':len(depmeta['copiedRows']),'compileGeneratorPackCounts':[int(k in results) for k in ['tsc','generate','pack']],'wallMsByCommand':{k:v['wallMs'] for k,v in results.items()},'noCleanup':True})
state='stopped' if failed else 'candidate_ready'
(W/'REPORT.md').write_text(f"""# C2 exact-source candidate {state}

This isolated successor derives from closed06 freeze80c749e3ad666b8d6ae08e9b4c4f8e56a274072926f1005e6d8049b40b5671cd and archive25e7f390a899f3bd9c49fa11a15feba1f59cb2a1d2ba4bad1f62c1abc4224079. [Preparation](preparation-freeze.json), [exact build activation](build-activation.json), [source/HOW handoff](../c2-source-prefix-repair-01/freeze.json), [prebuild freeze](prebuild-freeze.json) bind the only two selected inputs. execution_basis.ts materializes the selected source body view before existing canonical equality; the owning C2 HOW names that transient complete-prefix work. No Product, authority, event/schema, dependency, export or new runtime was introduced.

[Command evidence](command-summary.json) records one isolated compile, unchanged generator and ignore-scripts pack, with material/archive/payload checks. First failed command: {failed[0] if failed else 'none'}. [Complete stage delta](complete-delta.json) and [emitted JS delta](execution_basis.js.diff) account for every changed byte route against06. The material check reconstructs derived manifest/graph/publication identities through their existing owners and requires all75 catalog rows and exact locator membership unchanged. [Package correspondence](package-source-correspondence.json), [exact archive-member delta](archive-member-delta.json) and [payload owner result](archive-payload-owner-result.json) bind actual tar bytes; proof support remains excluded.

[Preservation](preservation-after.json) verifies old06, main936, dependencies and consumed directory metadata. Independent copied inodes avoid writes through to donor/main. [Resource cost](resource-cost.json) remains below2GiB. No cleanup, installed P1/P5, C0 rerun, native/provider call or runtime workload was executed. [Process observation](process-observation.json) states its finite limit. This is one mechanically verified candidate, not final independent acceptance or release. Installed C2/P5 and any candidate-wide proof reuse remain Executive selections.
""")
files=inventory(W);freeze={'kind':'closed_stopped_writer_subject' if failed else 'closed_writer_subject','activation':'C2-CANDIDATE-BUILD-01','status':state,'donorFreezeSha256':sha(O/'freeze.json'),'donorArchiveSha256':'25e7f390a899f3bd9c49fa11a15feba1f59cb2a1d2ba4bad1f62c1abc4224079','sourceWriterFreezeSha256':sha(H/'freeze.json'),'prebuildFreezeSha256':sha(W/'prebuild-freeze.json'),'files':files,'recordCount':len(files),'logicalBytes':sum(x.get('bytes',0) for x in files),'archive':package['archive'] if package else None,'manifest':package['manifest'] if package else None,'completeDeltaSha256':sha(W/'complete-delta.json'),'stageRows':len(current),'sourceRows':len(source['files']),'dependencyRows':len(deps),'newCompileGeneratorPack':[int(k in results) for k in ['tsc','generate','pack']],'failedCommands':failed,'unexecutedCommands':[k for k in configs if k not in results],'installedOrRuntimeWorkloads':0,'independentAcceptance':False};wr('freeze.json',freeze)
for x in files:verify(W/x['path'],x)
print(json.dumps({'freezeSha256':sha(W/'freeze.json'),'records':len(files),'status':state,'archive':freeze['archive'],'manifest':freeze['manifest'],'retainedLogicalBytes':freeze['logicalBytes'],'changedStagePaths':[x['after']['path'] for x in delta],'processGroupMembers':members}))
