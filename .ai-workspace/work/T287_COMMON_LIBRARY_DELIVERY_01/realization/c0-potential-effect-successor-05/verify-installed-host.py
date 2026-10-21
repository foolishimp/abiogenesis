from pathlib import Path,PurePosixPath
import sys,json,hashlib,stat,tarfile
W=Path(__file__).resolve().parent;O=W.parent/'c0-potential-effect-successor-03'
case=sys.argv[1];cfg=json.loads((W/'proof-resources.json').read_text());r=next(x for x in cfg['cases'] if x['id']==case)
assert not (W/'STOP.json').exists()
root=Path(r['host'])/'node_modules/@abiogenesis/typescript-tenant'
a=Path(cfg['archive']['path']);assert hashlib.sha256(a.read_bytes()).hexdigest()==cfg['archive']['sha256']
m=json.loads((O/'archive-members.json').read_text());pins=json.loads((W/'mode-relation-pins.json').read_text())
assert hashlib.sha256((O/'archive-members.json').read_bytes()).hexdigest()==pins['archiveMembersSha256']
with tarfile.open(a,'r:gz') as tar:package=json.load(tar.extractfile('package/package.json'))
assert package['bin']==pins['packageBin']
bins={str(PurePosixPath(v)) for v in package['bin'].values()}
assert bins=={'build/code/src/public/cli.js','build/code/src/public/codex_cli.js'}
normalizations=[]
for x in m['files']:
 p=root/x['path'];assert not p.is_symlink(),str(p)
 b=p.read_bytes();assert len(b)==x['bytes'] and hashlib.sha256(b).hexdigest()==x['sha256'],str(p)
 original=int(x['mode'],8);expected=original|0o111 if x['path'] in bins else original
 actual=stat.S_IMODE(p.stat().st_mode);assert actual==expected,(str(p),oct(original),oct(expected),oct(actual))
 if expected!=original:normalizations.append({'path':x['path'],'archiveMode':oct(original),'expectedInstalledMode':oct(expected),'actualInstalledMode':oct(actual),'bytes':x['bytes'],'sha256':x['sha256']})
actual={str(p.relative_to(root)) for p in root.rglob('*') if p.is_file() or p.is_symlink()}
assert actual=={x['path'] for x in m['files']}
assert len(normalizations)==2
result={'case':case,'root':str(root),'archiveSha256':cfg['archive']['sha256'],'archiveMembersSha256':pins['archiveMembersSha256'],'memberCount':len(m['files']),'allMemberBytesExact':True,'fullMembershipExact':True,'noSymlink':True,'nonBinModesExact':True,'normalizations':normalizations,'hostReusedReadOnly':r['hostReusedReadOnly'],'scope':'Corrected declared-bin preservation relation selected by Root; original failed verifier remains failed'}
with (W/f'{case}-host-correspondence.json').open('x') as f:json.dump(result,f,indent=2);f.write('\n')
print(json.dumps(result))
