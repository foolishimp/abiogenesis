from pathlib import Path
import json,hashlib,shutil,os,difflib
R=Path('/Users/jim/src/apps/abiogenesis');D=Path(__file__).resolve().parent.parent;N=Path(__file__).resolve().parent;P=D/'successor06';T=R/'build_tenants/abiogenesis/typescript/test_env/tests/t287-worksite-command-execution.test.mjs';X=Path('/private/tmp/abg-stdo3-p5-07-7ca935e280b14df6')
def pin(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def dump(name,x):
 with (N/name).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
assert not X.exists()
old=json.loads((P/'proof-copy-inventory.json').read_text());rows=[]
for row in old['files']:
 src=Path(row['destination']['path']);q=pin(src);assert q['sha256']==row['destination']['sha256'] and q['bytes']==row['destination']['bytes']
 dst=N/src.relative_to(P);dst.parent.mkdir(parents=True,exist_ok=True)
 if src.name==T.name:src=T
 shutil.copyfile(src,dst);rows.append({'source':pin(src),'destination':pin(dst)})
links=[]
for r in old['symlinks']:
 dst=N/Path(r['path']).relative_to(P);assert Path(r['target']).resolve()==Path(r['target']);os.symlink(r['target'],dst);links.append({'path':str(dst),'target':r['target'],'readOnlyByGrant':True})
dump('proof-copy-inventory.json',{'files':rows,'symlinks':links})
pre=pin(N/'preimages'/T.name);successor=pin(T);dump('owned-output.json',{'preimage':pre,'successor':successor,'mainWriteTerritory':[str(T)]})
(N/'test-successor.diff').write_text(''.join(difflib.unified_diff((N/'preimages'/T.name).read_text().splitlines(True),T.read_text().splitlines(True),fromfile='preimage',tofile='successor')))
for name in ['configuration.json','environment.json','launches.json']:
 text=(P/name).read_text().replace('successor06','successor07').replace('p5-06-7ca935e280b14df6','p5-07-7ca935e280b14df6')
 obj=json.loads(text)
 if name=='configuration.json':obj['testSha256']=successor['sha256']
 dump(name,obj)
for name in ['reused-bootstrap.json','run-host.mjs','verify-host.py']:shutil.copyfile(P/name,N/name)
text=(P/'capture-cut.py').read_text().replace('p5-06-7ca935e280b14df6','p5-07-7ca935e280b14df6');(N/'capture-cut.py').write_text(text)
for n in ['npm-user.rc','npm-global.rc']:(N/n).write_bytes(b'')
(N/'commands').mkdir()
config=json.loads((N/'configuration.json').read_text());assert Path(config['proofPackageRoot']).resolve()==Path(config['proofPackageRoot']);assert Path(config['installHost']).resolve()==Path(config['installHost'])
bootstrap=json.loads((N/'reused-bootstrap.json').read_text())
for r in bootstrap['sourcePins']:
 q=pin(Path(r['path']));assert q['sha256']==r['sha256'] and q['bytes']==r['bytes']
dump('binding-preflight.json',{'changedTest':successor,'priorFailure':pin(P/'failure-freeze.json'),'priorHostPreservation':pin(P/'installed-host-preservation.json'),'sourceSupportPinsReused':len(rows)-1,'copiedTest':rows[-1] if rows[-1]['destination']['path'].endswith(T.name) else next(r for r in rows if r['destination']['path'].endswith(T.name)),'readonlyLinks':links,'proofPackageRootCanonical':True,'physicalRootInitiallyAbsent':True,'sameArchiveSha256':config['artifactSha256'],'sameBootstrapReadOnly':True,'bootstrapSelectedPinsVerified':len(bootstrap['sourcePins']),'newBootstrapInstall':False,'wholeStageDependencyMainScanRepeated':False,'npmrcDistinctEmpty':True})
print(json.dumps({'test':successor,'proofFiles':len(rows),'sameSupport':len(rows)-1,'newRootAbsent':not X.exists()}))
