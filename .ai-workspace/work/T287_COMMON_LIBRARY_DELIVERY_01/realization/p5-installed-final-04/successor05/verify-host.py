from pathlib import Path,PurePosixPath
import sys,json,hashlib,stat,tarfile,datetime,os
D=Path(__file__).resolve().parent;S=D.parent.parent/'c0-potential-effect-successor-06';c=json.loads((D/'configuration.json').read_text());root=Path(c['installHost'])/'node_modules/@abiogenesis/typescript-tenant';stage=sys.argv[1]
assert stage in ['before','after']
def write(name,x):
 with (D/name).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
try:
 a=Path(c['artifactPath']);assert hashlib.sha256(a.read_bytes()).hexdigest()==c['artifactSha256']
 m=json.loads((S/'archive-members.json').read_text());pins=json.loads((S/'mode-relation-pins.json').read_text());assert hashlib.sha256((S/'archive-members.json').read_bytes()).hexdigest()==pins['archiveMembersSha256']
 package=json.loads((root/'package.json').read_text());assert package['bin']==pins['packageBin'];bins={str(PurePosixPath(v)) for v in package['bin'].values()};assert bins=={'build/code/src/public/cli.js','build/code/src/public/codex_cli.js'}
 normalizations=[]
 for row in m['files']:
  p=root/row['path'];assert not p.is_symlink(),str(p);b=p.read_bytes();assert len(b)==row['bytes'] and hashlib.sha256(b).hexdigest()==row['sha256'],str(p)
  original=int(row['mode'],8);expected=original|0o111 if row['path'] in bins else original;actual=stat.S_IMODE(p.stat().st_mode);assert actual==expected,(str(p),original,expected,actual)
  if expected!=original:normalizations.append({'path':row['path'],'archiveMode':oct(original),'actualInstalledMode':oct(actual),'bytes':row['bytes'],'sha256':row['sha256']})
 actual={str(p.relative_to(root)) for p in root.rglob('*') if p.is_file() or p.is_symlink()};assert actual=={row['path'] for row in m['files']};assert len(normalizations)==2
 assert hashlib.sha256((root/'product-toolchain-manifest.json').read_bytes()).hexdigest()==c['hostManifestSha256']
 result={'phase':stage,'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'root':str(root),'archiveSha256':c['artifactSha256'],'archiveMembersSha256':pins['archiveMembersSha256'],'memberCount':len(m['files']),'allMemberBytesExact':True,'fullMembershipExact':True,'noSymlink':True,'nonBinModesExact':True,'normalizations':normalizations,'operatorChmod':False}
 write('installed-host-correspondence.json' if stage=='before' else 'installed-host-preservation.json',result)
 print(json.dumps({'status':'exact','phase':stage,'members':len(m['files']),'modeNormalizations':len(normalizations)}))
except BaseException as e:
 write('installed-host-'+stage+'-failure.json',{'error':repr(e)});raise
