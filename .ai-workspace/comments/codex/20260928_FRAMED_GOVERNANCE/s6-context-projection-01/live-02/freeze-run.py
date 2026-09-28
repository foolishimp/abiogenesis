from pathlib import Path
import json,hashlib
out=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s6-context-projection-01/live-02');base=out.parent;old=base.parent/'s6-fulfillment-implementation'
def ident(p):
 b=p.read_bytes();return {'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def save(n,v):
 with (out/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
preserved=[]
for folder,name in [(out,'launcher-manifest.json'),(base,'proof-manifest.json'),(old,'proof-manifest.json'),(old/'live-01','run-proof-manifest.json')]:
 rows=json.loads((folder/name).read_text())
 for path,v in rows.items():assert ident(folder/path)==v,(str(folder),path)
 preserved.append({'manifest':str(folder/name),**ident(folder/name),'members':len(rows)})
assert ident(out/'return.md')['sha256']=='7b4cbeca1ba907602b86484ca9dcdf19f0292b20c0fe800c0c00bae046ae19c5'
assert ident(base/'return.md')['sha256']=='4e238f9b07de82f077649c8b784d3299bb494009072405cbdb4ce73b5a028fb1'
assert ident(old/'live-01/run-return.md')['sha256']=='293d2bc5b1ac47efa3ef711bdd0420446b02734a0ba57ba785c18c8871b7aa15'
correspondence=json.loads((base/'archive-installed-correspondence.json').read_text());installed=[]
for name,record in correspondence.items():
 assert ident(base/(name+'.tgz'))==record['archive']
 for member in record['members']:assert ident(Path(record['installedRoot'])/member['path'])=={k:member[k] for k in ['sha256','bytes']},member['path']
 installed.append({'name':name,'archive':record['archive'],'installedRoot':record['installedRoot'],'members':len(record['members']),'unchanged':True})
save('preservation.json',{'oldManifests':preserved,'installed':installed,'launcherReturn':ident(out/'return.md'),'correctionReturn':ident(base/'return.md'),'priorRunReturn':ident(old/'live-01/run-return.md')})
inventory={str(p.relative_to(out)):ident(p) for p in sorted(out.rglob('*')) if p.is_file() and p.name not in ['run-proof-manifest.json','run-freeze.json','run-return.md']}
save('run-proof-manifest.json',inventory)
failure=json.loads((out/'first-failure.json').read_text());outcome=json.loads((out/'outcome-evidence.json').read_text())
save('run-freeze.json',{'sourceFreeze':ident(base/'freeze.json'),'core':ident(base/'core.tgz'),'consumer':ident(base/'consumer.tgz'),'input':ident(base/'input.json'),'launcherReadiness':ident(out/'return.md'),'proofManifest':ident(out/'run-proof-manifest.json'),'proofMembers':len(inventory),'events':ident(out/'events.jsonl'),'execution':ident(out/'execution.json'),'firstFailure':ident(out/'first-failure.json'),'attribution':ident(out/'prompt-attribution.json'),'chain':ident(out/'admitted-chain.json'),'reads':{k:ident(out/('read-'+k+'.json')) for k in ['run_result','run_replay']},'outcome':'runtime_failed','firstCause':failure['cause']['cause'],'firstCauseOrdinal':failure['firstRejectedEvent']['ordinal'],'providerCalls':10,'runClosed':False,'assessmentCompleted':False,'sourceAndOldProofPreserved':True,'nativeSettingsUnchanged':True})
print(json.dumps({'freeze':ident(out/'run-freeze.json'),'proof':ident(out/'run-proof-manifest.json'),'members':len(inventory),'evidence':json.loads((out/'run-freeze.json').read_text())},indent=2))
