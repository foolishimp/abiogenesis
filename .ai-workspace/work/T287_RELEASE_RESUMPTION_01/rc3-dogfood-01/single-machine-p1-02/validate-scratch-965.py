#!/usr/bin/env python3
"""Root-selected exact partial-source scratch recipe; no Product mutation."""
from pathlib import Path,PurePosixPath
import hashlib,io,json,os,shutil,subprocess,tarfile,tempfile,time,datetime
HERE=Path(__file__).resolve().parent;PRIOR=HERE.parent/'single-machine-p1-01';WORK=Path('/Users/jim/src/apps/abiogenesis-single-machine-p1');TENANT='build_tenants/abiogenesis/typescript/'
COMMIT='97406077c9a91e18e9425c3df55c6cd80f4c2073';NODE=Path('/opt/homebrew/Cellar/node/24.7.0/bin/node');PYTHON=Path('/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12');CENSUS=HERE.parent/'increment-a-01/toolchain-census.py';INVENTORY=CENSUS.with_name('toolchain-census.json');DEPS=Path('/Users/jim/Library/Application Support/ABIogenesis/toolchains/rc2-dogfood-01/node_modules')
OUT=HERE/'scratch-recipe-check-001';assert not OUT.exists();OUT.mkdir(mode=0o700)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def pin(p):return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p)}
def save(p,x):
 with p.open('x')as f:json.dump(x,f,indent=2,sort_keys=True);f.write('\n')
def tree(root):
 rows=[]
 for folder,dirs,files in os.walk(root,followlinks=False):
  for n in sorted(dirs+files):
   p=Path(folder)/n;r=p.relative_to(root).as_posix()
   if p.is_symlink():assert p.resolve(strict=True).is_relative_to(root);rows.append({'path':r,'type':'symlink','target':os.readlink(p)})
   elif p.is_file():rows.append({'path':r,'type':'file','bytes':p.stat().st_size,'sha256':sha(p)})
   else:assert p.is_dir()
 rows.sort(key=lambda x:x['path']);return hashlib.sha256(json.dumps(rows,sort_keys=True,separators=(',',':')).encode()).hexdigest()
assert sha(NODE)=='fe1c0128a4c0163b034ec06b8b290494830ccb49922b5ce9ca4edf497a083e5f';assert sha(PYTHON)=='a7f5b535d61d1c7326824204ac80f045a97a652abb154421e2c74fcc365a3539';assert sha(CENSUS)=='ede46567623c3e8cf6adf9a1a4c359cff071afadfb234cfdb55b036251081024';assert sha(INVENTORY)=='08bd785ff5aa9795b4b042f477d24cf312e0a9f0525f8366bc6f26252bb80030'
custodyPath=PRIOR/'attempt-001/CONSTRUCTION_RETURN_CUSTODY.json';assert sha(custodyPath)=='0a0d123e579956ab2b71d3e52f62137ef9c4220161e7a6ba2eee7e1397723a95';custody=json.loads(custodyPath.read_text());archive=Path(custody['localSourceArchive']['path']);assert sha(archive)==custody['localSourceArchive']['sha256'];rows={r['path']:r for r in custody['rows']};assert len(rows)==21
canonicalBefore={r:pin(WORK/r)for r in json.loads((PRIOR/'NATIVE_GRANT_ADMITTED.json').read_text())['Construction']['writePaths']}
verified=subprocess.run([str(PYTHON),'-I','-B',str(CENSUS),'--verify'],capture_output=True,check=True);assert json.loads(verified.stdout)==json.loads(INVENTORY.read_text())
scratch=Path(tempfile.mkdtemp(prefix='abi5-p1-02-965-',dir=tempfile.gettempdir())).resolve(strict=True)
paths=[TENANT+'code/src',TENANT+'package.json',TENANT+'tsconfig.json',TENANT+'test_env/tests/t287-event-body-encoding.test.mjs',TENANT+'test_env/support/t287-generic-job-worksite.mjs']
baseline=subprocess.check_output(['/usr/bin/git','archive',COMMIT,'--',*paths],cwd=WORK)
def extract(data,expected=None):
 seen=set()
 with tarfile.open(fileobj=io.BytesIO(data),mode='r:')as t:
  for m in t:
   if m.isdir():continue
   q=PurePosixPath(m.name);assert m.isfile()and m.name.startswith(TENANT)and not q.is_absolute()and'..'not in q.parts and m.name not in seen;seen.add(m.name);content=t.extractfile(m).read()
   if expected is not None:
    r=expected[m.name];assert len(content)==r['bytes']and hashlib.sha256(content).hexdigest()==r['sha256']
   p=scratch/m.name[len(TENANT):];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(content)
 if expected is not None:assert seen==set(expected)
extract(baseline);extract(archive.read_bytes(),rows)
shutil.copytree(DEPS,scratch/'node_modules',symlinks=True);assert tree(scratch/'node_modules')==json.loads(INVENTORY.read_text())['canonicalInventorySha256']
sourceDigest=tree(scratch/'code/src');(scratch/'tmp').mkdir();env={'HOME':'/Users/jim','PATH':'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin','LC_ALL':'C','TMPDIR':str(scratch/'tmp'),'NODE_OPTIONS':'--max-old-space-size=8192'}
commands=[]
def run(label,command,timeout):
 start=time.monotonic();r=subprocess.run(command,cwd=scratch,env=env,capture_output=True,timeout=timeout)
 outputs=[]
 for name,data in [(label+'.stdout.txt',r.stdout),(label+'.stderr.txt',r.stderr)]:
  p=OUT/name;p.write_bytes(data);outputs.append(pin(p))
 row={'label':label,'command':command,'cwd':str(scratch),'wallSeconds':time.monotonic()-start,'exitStatus':r.returncode,'outputs':outputs};commands.append(row);save(OUT/(label+'.json'),row)
 print(json.dumps({'label':label,'exitStatus':r.returncode,'wallSeconds':row['wallSeconds'],'stdoutBytes':len(r.stdout),'stderrBytes':len(r.stderr)}),flush=True)
 if r.returncode:print(r.stdout.decode(errors='replace'));print(r.stderr.decode(errors='replace'))
 return r.returncode
compiled=run('compile-emit',[str(NODE),str(scratch/'node_modules/typescript/bin/tsc'),'-p',str(scratch/'tsconfig.json')],180)
selected=None
if compiled==0:selected=run('only-965',[str(NODE),'--test','--test-concurrency=1','--test-name-pattern=965-member native context carriage','test_env/tests/t287-event-body-encoding.test.mjs'],180)
for name,before in canonicalBefore.items():assert pin(WORK/name)==before,name
assert tree(scratch/'code/src')==sourceDigest
record={'kind':'p1_02_actual_scratch_recipe_discriminator','startedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceCommit':COMMIT,'partialSourceCustody':pin(custodyPath),'partialArchive':pin(archive),'sourceAssembly':'immutable97406077requiredinputs+exact21frozenpartialoverlay; no moving canonical source copied','scratchRoot':str(scratch),'script':pin(Path(__file__).resolve()),'baselineInputs':paths,'pinnedNode':pin(NODE),'offlineInventory':pin(INVENTORY),'copiedDependencyTreeMatched':True,'sourceCodeTreeDigest':sourceDigest,'commands':commands,'compileExit':compiled,'selected965Exit':selected,'canonical46SourcesUnchanged':True,'scratchSourceUnchanged':True,'claims':['Only compiler emit and selected965case executed','This is nextauthorhostmechanics/partialsource counterexample, not firstRunC2 or candidate qualification','No Product edits/provider/Public/newruntimeadmission beyond existing selected test fixture owners','Scratch retained; no repeat or broader suite selected']};save(OUT/'RESULT.json',record)
print(json.dumps({'record':pin(OUT/'RESULT.json'),'scratchRoot':str(scratch)}),flush=True)
