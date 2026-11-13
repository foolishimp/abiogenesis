#!/usr/bin/env python3
"""Root-authorized model-free compiler check in a fresh host-only scratch copy."""
from pathlib import Path
import datetime,hashlib,json,os,shutil,subprocess,tempfile,time
HERE=Path(__file__).resolve().parent
WORK=Path('/Users/jim/src/apps/abiogenesis-single-machine-p1')
TENANT=WORK/'build_tenants/abiogenesis/typescript'
DEPS=Path('/Users/jim/Library/Application Support/ABIogenesis/toolchains/rc2-dogfood-01/node_modules')
NODE=Path('/opt/homebrew/Cellar/node/24.7.0/bin/node')
PYTHON=Path('/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12')
CENSUS=HERE.parent/'increment-a-01/toolchain-census.py'
INVENTORY=CENSUS.with_name('toolchain-census.json')
OUTPUT=HERE/'SCRATCH_TYPECHECK_BASELINE_01.json'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def pin(p):return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p)}
def tree(root):
 rows=[]
 for folder,dirs,files in os.walk(root,followlinks=False):
  for name in sorted(dirs+files):
   p=Path(folder)/name;rel=p.relative_to(root).as_posix()
   if p.is_symlink():
    assert p.resolve(strict=True).is_relative_to(root)
    rows.append({'path':rel,'type':'symlink','target':os.readlink(p)})
   elif p.is_file():rows.append({'path':rel,'type':'file','bytes':p.stat().st_size,'sha256':sha(p)})
   else:assert p.is_dir(),p
 rows.sort(key=lambda x:x['path']);return rows,hashlib.sha256(json.dumps(rows,sort_keys=True,separators=(',',':')).encode()).hexdigest()
assert not OUTPUT.exists(),'no overwrite of actual check'
assert sha(CENSUS)=='ede46567623c3e8cf6adf9a1a4c359cff071afadfb234cfdb55b036251081024'
assert sha(INVENTORY)=='08bd785ff5aa9795b4b042f477d24cf312e0a9f0525f8366bc6f26252bb80030'
assert sha(PYTHON)=='a7f5b535d61d1c7326824204ac80f045a97a652abb154421e2c74fcc365a3539'
assert sha(NODE)=='fe1c0128a4c0163b034ec06b8b290494830ccb49922b5ce9ca4edf497a083e5f'
head=subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],cwd=WORK,text=True).strip()
assert head=='97406077c9a91e18e9425c3df55c6cd80f4c2073'
assert subprocess.check_output(['/usr/bin/git','status','--porcelain=v1','--untracked-files=all','--','build_tenants/abiogenesis/typescript'],cwd=WORK,text=True)==''
verified=subprocess.run([str(PYTHON),'-I','-B',str(CENSUS),'--verify'],capture_output=True,check=True)
assert json.loads(verified.stdout)==json.loads(INVENTORY.read_text())
sourceRows,sourceDigest=tree(TENANT/'code/src');sourceConfigs=[pin(TENANT/n)for n in ['tsconfig.json','package.json']]
scratch=Path(tempfile.mkdtemp(prefix='abi5-p1-typecheck-',dir=tempfile.gettempdir())).resolve(strict=True)
(scratch/'code').mkdir();shutil.copytree(TENANT/'code/src',scratch/'code/src',symlinks=True)
for n in ['tsconfig.json','package.json']:shutil.copyfile(TENANT/n,scratch/n)
shutil.copytree(DEPS,scratch/'node_modules',symlinks=True)
assert tree(scratch/'code/src')[1]==sourceDigest
assert tree(scratch/'node_modules')[1]==json.loads(INVENTORY.read_text())['canonicalInventorySha256']
(scratch/'tmp').mkdir()
command=[str(NODE),str(scratch/'node_modules/typescript/bin/tsc'),'--noEmit','-p',str(scratch/'tsconfig.json')]
env={'HOME':'/Users/jim','PATH':'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin','LC_ALL':'C','TMPDIR':str(scratch/'tmp'),'NODE_OPTIONS':'--max-old-space-size=8192'}
started=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
result=subprocess.run(command,cwd=scratch,env=env,capture_output=True,timeout=180)
wall=time.monotonic()-t
assert tree(TENANT/'code/src')[1]==sourceDigest
for row in sourceConfigs:assert pin(Path(row['path']))==row
records=[]
for name,data in [('SCRATCH_TYPECHECK_BASELINE_01.stdout.txt',result.stdout),('SCRATCH_TYPECHECK_BASELINE_01.stderr.txt',result.stderr)]:
 p=HERE/name
 with p.open('xb')as f:f.write(data)
 records.append(pin(p))
record={'kind':'root_authorized_baseline_scratch_typecheck','sourceCommit':head,'worksiteRoot':str(WORK),'sourceTree':{'root':str(TENANT/'code/src'),'entries':len(sourceRows),'canonicalDigest':sourceDigest},'sourceConfigs':sourceConfigs,'scratchRoot':str(scratch),'script':pin(Path(__file__).resolve()),'pinnedNode':pin(NODE),'pinnedPython':pin(PYTHON),'offlineCensus':pin(CENSUS),'offlineInventory':pin(INVENTORY),'copiedDependencyInventoryMatched':True,'command':command,'cwd':str(scratch),'startedUtc':started,'wallSeconds':wall,'exitStatus':result.returncode,'outputs':records,'ProductSourceUnchanged':True,'claims':['Actual baseline compiler recipe only; no native C2 admission or semantic verdict','Only code/src, package.json, tsconfig.json and exact offline dependencies copied','No seeds needed by tsconfig include; no dependency installation/build/generated output/test campaign','Scratch retained for custody; no writes to Product source or dependencies','Worker must refresh source copies after its edits; this baseline is not its final check']}
with OUTPUT.open('x')as f:json.dump(record,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps({'record':pin(OUTPUT),'exitStatus':result.returncode,'wallSeconds':wall,'scratchRoot':str(scratch),'stdoutBytes':len(result.stdout),'stderrBytes':len(result.stderr)}))
if result.returncode:print(result.stdout.decode(errors='replace'));print(result.stderr.decode(errors='replace'))
