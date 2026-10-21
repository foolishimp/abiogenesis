from pathlib import Path
import sys,json,hashlib,os,stat
W=Path(__file__).resolve().parent
case=sys.argv[1];cfg=json.loads((W/'proof-resources.json').read_text());r=next(x for x in cfg['cases'] if x['id']==case)
assert not (W/'STOP.json').exists()
root=Path(r['host'])/'node_modules/@abiogenesis/typescript-tenant'
m=json.loads((W/'archive-members.json').read_text());rows=[]
for x in m['files']:
 p=root/x['path'];assert not p.is_symlink(),str(p)
 b=p.read_bytes();assert len(b)==x['bytes'] and hashlib.sha256(b).hexdigest()==x['sha256'],str(p)
 assert oct(stat.S_IMODE(p.stat().st_mode))==x['mode'],str(p)
 rows.append({'path':x['path'],'bytes':len(b),'sha256':x['sha256'],'mode':x['mode']})
actual={str(p.relative_to(root)) for p in root.rglob('*') if p.is_file() or p.is_symlink()}
assert actual=={x['path'] for x in rows},{'extra':sorted(actual-{x['path'] for x in rows}),'missing':sorted({x['path'] for x in rows}-actual)}
a=Path(cfg['archive']['path']);assert hashlib.sha256(a.read_bytes()).hexdigest()==cfg['archive']['sha256']
with (W/f'{case}-host-inventory.json').open('x') as f:json.dump({'root':str(root),'files':rows,'archiveSha256':cfg['archive']['sha256'],'exactMemberBytesModesAndPopulation':True},f,indent=2);f.write('\n')
print(json.dumps({'case':case,'memberCount':len(rows),'exact':True}))
