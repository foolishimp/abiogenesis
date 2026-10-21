from pathlib import Path
import json,hashlib,stat,os,time
from common import ROOT,WORK,TENANT,digest,inventory,row,verify,write
P=Path('/private/tmp/abg-c0-potential-25ac62e990e141ce/successor-03')
assert (WORK/'STOP.json').exists() and not (WORK/'freeze.json').exists()
stop=json.loads((WORK/'STOP.json').read_text());assert stop['command']=='sunny-host-check'
assert not (WORK/'commands/sunny-owner.request.json').exists()
# Closure readback: preserve the stopped subject, never rerun its failed verifier.
source=json.loads((WORK/'source-inputs.json').read_text())['files']
for x in source:verify(WORK/'source'/x['path'],x)
stage=inventory(WORK/'stage');assert stage==json.loads((WORK/'stage-post-generation-inventory.json').read_text())['files']
write('stage-stopped-inventory.json',{'root':str(WORK/'stage'),'files':stage,'unchangedFromSuccessfulGenerationAndPack':True})
main=[];selected=json.loads((WORK/'activation.json').read_text())['source_paths'];by={x['path']:x for x in source}
for p in selected:
 x=row(ROOT/p,p);assert x==by[p],p;main.append(x)
write('main-selected-source-preservation.json',{'files':main,'allUnchanged':True,'sourceEffectsInThisActivation':[]})
baseline=WORK.parent/'u1-c0-physical-currentness-01/main-generated-preimage.json';generated=json.loads(baseline.read_text());after=[]
for x in generated:
 p=ROOT/x['path'];assert digest(p)==x['sha256'] and p.stat().st_size==x['bytes'],str(p);after.append(x)
assert len(after)==936
write('main-generated-preservation.json',{'preimageRoute':str(baseline.relative_to(ROOT)),'preimageSha256':digest(baseline),'files':after,'all936Unchanged':True})
old=WORK.parent/'c0-potential-effect-successor-02';oldf=json.loads((old/'freeze.json').read_text());assert digest(old/'freeze.json')=='7579fe86579c0c90e64cc02c497ae8d3e9c4af2aa90ee360bb3de55fe2c671bd'
for x in oldf['files']:verify(old/x['path'],x)
base=WORK.parent/'combined-final-02';assert digest(base/'freeze.json')=='245a11505b2c3f372da001fa0f3202d4554fea30d9d593e2fe3b5ede61906fe2'
write('predecessor-preservation.json',{'successor02FreezeSha256':digest(old/'freeze.json'),'successor02RecordsVerified':len(oldf['files']),'combinedFinal02FreezeSha256':digest(base/'freeze.json'),'scope':'Exact stopped successor02 full file/link inventory plus combined donor freeze and directory/file identities verified during preparation; no old cut written.'})
physical=[];directories=[]
for p in [P]+sorted(P.rglob('*')):
 st=p.lstat();meta={'path':str(p),'dev':st.st_dev,'inode':st.st_ino,'mode':oct(stat.S_IMODE(st.st_mode)),'mtime_ns':st.st_mtime_ns}
 if p.is_dir() and not p.is_symlink():directories.append(meta)
 else:
  x=row(p,str(p));x.update(dev=st.st_dev,inode=st.st_ino,mtime_ns=st.st_mtime_ns);physical.append(x)
write('physical-stopped-inventory.json',{'root':str(P),'files':physical,'directories':directories,'logicalFileBytes':sum(x.get('bytes',0) for x in physical),'identityScope':'Original retained physical paths/dev/inodes at closed cut, no copy/reopen authority invented','activeAppendOwnersOpened':0,'C0Attempts':0,'freshReadonlyChildren':0})
archive=json.loads((WORK/'archive-members.json').read_text());host=P/'sunny/host/node_modules/@abiogenesis/typescript-tenant';hostrows=inventory(host);hostby={x['path']:x for x in hostrows};expected={x['path']:x for x in archive['files']};deltas=[]
for name in sorted(set(hostby)|set(expected)):
 a=expected.get(name);b=hostby.get(name)
 if a is None or b is None:deltas.append({'path':name,'archive':a,'host':b});continue
 changes={k:{'archive':a[k],'host':b.get(k)} for k in ['bytes','sha256','mode'] if a[k]!=b.get(k)}
 if changes:deltas.append({'path':name,'changes':changes})
write('host-first-cause-observation.json',{'failedVerifierSha256':digest(WORK/'verify-installed-host.py'),'failedStatement':'line 11: archive/stage mode equals installed host mode','originalFailureRetained':True,'classification':'Observed downstream host material difference for Executive triage; failed selected check is not retried, waived or retroactively passed','archiveSha256':archive['archive']['sha256'],'hostRoot':str(host),'observedArchiveMembers':len(expected),'observedHostFiles':len(hostrows),'allObservedDeltas':deltas,'packageBin':json.loads((host/'package.json').read_text()).get('bin'),'claim':'Actual offline host installation occurred. Product fixture setup, owner C0 execution/admission and fresh reopen proof did not occur.'})
commands=[]
for p in sorted((WORK/'commands').glob('*.result.json')):
 commands.append({'path':str(p.relative_to(WORK)),**json.loads(p.read_text())})
write('closed-execution-state.json',{'activation':'C0-STAGE-METADATA-03','commands':commands,'newCompileCount':0,'reusedCompileReceipt':str(old/'commands/tsc.result.json'),'generatorCount':1,'packCount':1,'offlineHostInstalls':1,'ProductFixtureInstalls':0,'principalC0Attempts':0,'freshReadonlyChildren':0,'nativeOrProviderActors':0,'physicalTargetCreated':False,'noFurtherCaseLaunched':True,'status':'stopped at first host preservation mode assertion'})
physical_bytes=sum(x.get('bytes',0) for x in physical);own_bytes=sum(x.get('bytes',0) for x in inventory(WORK));prior=410372372
assert prior+physical_bytes+own_bytes<10737418240
write('logical-resource-cost.json',{'priorTwoStoppedCutsLogicalBytes':prior,'newWorkRootBytesBeforeFinalClosureRecords':own_bytes,'newPhysicalBytes':physical_bytes,'sumBeforeFinalClosureRecords':prior+physical_bytes+own_bytes,'maximumBytes':10737418240,'retainedRoots':[str(WORK),str(P)],'noCleanup':True})
report=f'''# Closed metadata successor — stopped before first owner

C0-STAGE-METADATA-03 repaired the selected staging metadata relation in a new independent stage. It reused the exact successful successor02 source/support/JavaScript/declarations and ran no compile. All 499 dependency directory modes/mtimes were preserved from the combined-final-02 donor. The existing generator and material assertions passed with zero locator additions/removals; both previously removed CHANGELOG locators returned naturally. The old report's incorrect additions wording remains preserved and is explicitly corrected in HOW-binding.md.

One ignore-scripts package was produced. Archive SHA-256 `{archive['archive']['sha256']}`; 5,271 members, 5,269 Product payload rows. Every archive byte/mode matched stage and npm's member projection; existing Product payload and capability/material checks passed. The complete stage, source, dependency, generated, support and archive/member inventories remain available for Root's possible exact candidate adoption. That is not final acceptance.

The first offline sunny host installation succeeded. Its new preservation verifier then failed at line 11 because `build/code/src/public/cli.js` had archive/stage mode 0644 and installed mode 0755. The 3,463 bytes and SHA-256 `94d13d72e79246f35c12062cc75549da7225639edcc976aca5fa3b16313f4f25` were identical. package.json declares this path as `abg.cli`; the separately recorded stopped inventory shows every actual member delta. The unconditional mode-equality assumption originated in the new host verifier. Root owns its triage; no mode normalization exception or repair is selected by this report.

The exact failed request, complete bounded effective environment, PID, exit, stdout/stderr and original STOP remain in commands/ and STOP.json. No chmod, source/test/support change, retry, subsequent case or fixture cleanup occurred. There is no owning append log to close: Product setup and HoG/leaf/C0 owner never started. Zero principal C0 attempts, fresh reopen children and native/provider actors. Therefore no sunny-day, genuine post-publication failure, unadmitted-effect, refusal, F5, anti-revival, deep-negative or shared native regression result is claimed here. Cold/hot dependency work remains unmeasured.

All 12 selected source/test/support files, the 936 main generated files, the 8,581 predecessor records and the exact newly packaged stage remain preserved. Physical original host/cache/logs and unused case directories are retained under `{P}`. Copy/archive identities are not runtime eventLogRef or original inode authority. Two exploratory read-routing/cwd mistakes were preserved separately without proof credit; they did not change source or satisfy a selected assertion.

The smallest next boundary requires Executive disposition of the installed executable-mode relation before any revised preservation check or sunny owner test. No rebuild, package replacement, test retry, full final campaign, independent L5 or release acceptance is claimed. FINAL P1/P2/P3/P5/U1/P4, HoG/E04, passive diagnostics, independent review and Executive acceptance remain separately selected work.
'''
(WORK/'REPORT.md').write_text(report)
files=inventory(WORK);assert all(x['path']!='freeze.json' for x in files)
freeze={'kind':'closed_stopped_writer_successor','activation':'C0-STAGE-METADATA-03','status':'stopped_first_host_preservation_mode_assertion','predecessorFreezeSha256':digest(old/'freeze.json'),'preparationFreezeSha256':digest(WORK/'prebuild-freeze.json'),'proofFreezeSha256':digest(WORK/'proof-freeze.json'),'stopSha256':digest(WORK/'STOP.json'),'reportSha256':digest(WORK/'REPORT.md'),'files':files,'logicalBytes':sum(x.get('bytes',0) for x in files),'recordCount':len(files),'physicalInventorySha256':digest(WORK/'physical-stopped-inventory.json'),'physicalLogicalBytes':physical_bytes,'archive':archive['archive'],'sourceMutationCount':0,'newCompileCount':0,'principalC0Attempts':0}
write('freeze.json',freeze)
for x in files:verify(WORK/x['path'],x)
print(json.dumps({'freezeSha256':digest(WORK/'freeze.json'),'records':len(files),'logicalBytes':freeze['logicalBytes'],'physicalFiles':len(physical),'physicalLogicalBytes':physical_bytes,'stopSha256':freeze['stopSha256'],'reportSha256':freeze['reportSha256'],'observedHostDeltas':deltas,'noC0Attempts':True}))
