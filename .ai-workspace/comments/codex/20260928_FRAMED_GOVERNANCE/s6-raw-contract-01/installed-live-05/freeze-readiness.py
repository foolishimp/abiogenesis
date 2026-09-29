from pathlib import Path
import json,hashlib,subprocess
out=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s6-raw-contract-01/installed-live-05');old=out.parent.parent/'s6-producer-dependencies-01/installed-live-04'
def ident(p):
 b=p.read_bytes();return {'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def read(p):return json.loads(p.read_text())
def save(n,v):
 with (out/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
syntax=[]
for n in ['prepare.mjs','launch.mjs','readback.mjs','prepare-launch.mjs']:
 cmd=['node','--check',str(out/n)];r=subprocess.run(cmd,capture_output=True,text=True);assert r.returncode==0,r.stderr;syntax.append({'command':cmd,'exitCode':r.returncode,'stdout':r.stdout,'stderr':r.stderr})
for n in ['launch.mjs','prepare-launch.mjs','provider.json','controls.json']:assert ident(old/n)==ident(out/n),n
assert (out/'readback.mjs').read_text()==(old/'readback.mjs').read_text().replace('s6-live-04-','s6-live-05-')
a=read(old/'launch-readiness.json');b=read(out/'launch-readiness.json');assert a['installedFiles']==b['installedFiles'];assert a['helper']==b['helper']
rows=read(old/'proof-manifest.json')
for p,v in rows.items():assert ident(old/p)==v
save('checks.json',{'syntax':syntax,'logicDelta':'Launcher and readiness logic byte-identical; read request identity s6-live-04 -> s6-live-05 only. Preparation regenerates the generic schema and verifies the exact single input-field delta.','providerControlsByteIdentical':True,'installedReadOwnersAndSharedHelperUnchanged':True,'priorReadinessProof':{'manifest':ident(old/'proof-manifest.json'),'members':len(rows),'allMatch':True},'priorReadinessReturn':ident(old/'return.md'),'priorReadinessFreeze':ident(old/'readiness-freeze.json'),'freshQualificationInstance':True,'oldRunResumed':False,'importedRuntimeResults':False,'runStarted':False,'providerCalls':0})
save('binding-delta.json',{'oldReadiness':ident(old/'launch-readiness.json'),'newReadiness':ident(out/'launch-readiness.json'),'oldInstalledFreeze':a['sourceFreeze'],'newInstalledFreeze':b['sourceFreeze'],'sources':{k:{'before':a['sources'][k],'after':b['sources'][k]} for k in a['sources'] if a['sources'][k]!=b['sources'][k]},'coordinates':{k:{'before':a[k],'after':b[k]} for k in ['installedRoot','scratch','worksite','commands']},'schemaInputDelta':ident(out/'schema-input-delta.json'),'semantics':'Same original six-file/four-absent-asset/seven-obligation case; changed generic schema bytes/required identities only. New qualification instance, no imported runtime Results or recovery credit.','openRecoveryLimit':'FRAMED-RECOVERY-01','bootstrap':'Derived exact extraction of pinned core. No irreplaceable proof in bootstrap bodies; retained archive/correspondence/scripts reproduce them.','dispatchAuthorized':False})
launchFiles=['launch.mjs','readback.mjs','prepare-launch.mjs','provider.json','controls.json','launch-readiness.json','checks.json','binding-delta.json'];save('launcher-manifest.json',{p:ident(out/p) for p in launchFiles})
proof={p.name:ident(p) for p in sorted(out.iterdir()) if p.is_file() and p.suffix!='.tgz' and p.name not in ['proof-manifest.json','readiness-freeze.json','return.md']};save('proof-manifest.json',proof)
save('readiness-freeze.json',{'installedFreeze':ident(out/'freeze.json'),'launcherManifest':ident(out/'launcher-manifest.json'),'proofManifest':ident(out/'proof-manifest.json'),'proofMembers':len(proof),'launcherReadiness':ident(out/'launch-readiness.json'),'core':ident(out/'core.tgz'),'consumer':ident(out/'consumer.tgz'),'schemaInputDelta':ident(out/'schema-input-delta.json'),'providerCalls':0,'runStarted':False,'dispatchAuthorized':False})
print(json.dumps({'readinessFreeze':ident(out/'readiness-freeze.json'),'record':read(out/'readiness-freeze.json'),'delta':read(out/'schema-input-delta.json')},indent=2))
