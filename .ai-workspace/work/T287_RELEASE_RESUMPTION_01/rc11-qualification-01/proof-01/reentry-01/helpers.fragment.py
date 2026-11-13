from pathlib import Path
import os,sys,json,hashlib,shutil,subprocess,time,signal,re
O=Path(__file__).resolve().parent

def sha(b): return hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':sha(b)}
def checked(r):
 assert pin(r['path'])=={k:r[k] for k in ['path','bytes','sha256']},r['path'];return Path(r['path']).read_bytes()
def save(p,x):
 with Path(p).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
def safe(p):
 assert p and not Path(p).is_absolute() and '..' not in Path(p).parts and '\0' not in p;return p
def rows_at(root,rows):
 got=[]
 for row in rows:
  p=root/safe(row['path']);assert p.is_file() and not p.is_symlink(),str(p);b=p.read_bytes();got.append({'path':row['path'],'bytes':len(b),'sha256':sha(b)})
 return got
def same_source(root,rows):
 got=rows_at(root,rows);assert got==rows,'frozen source changed '+str(root);return sha(json.dumps(got,separators=(',',':'),ensure_ascii=False).encode())
def verify_tree(inv):
 root=Path(inv['root']);seen=[]
 for d,dirs,files in os.walk(root,followlinks=False):
  for name in list(dirs):
   p=Path(d)/name
   if p.is_symlink():seen.append(p.relative_to(root).as_posix());dirs.remove(name)
  seen.extend((Path(d)/n).relative_to(root).as_posix() for n in files)
 assert sorted(seen)==sorted(r['path'] for r in inv['rows']),'tree paths differ '+str(root)
 for r in inv['rows']:
  p=root/safe(r['path'])
  if r['kind']=='symlink':
   assert p.is_symlink() and os.readlink(p)==r['target'];assert p.resolve().is_relative_to(root.resolve()),str(p)
  else:assert not p.is_symlink() and pin(p)['bytes']==r['bytes'] and pin(p)['sha256']==r['sha256'],str(p)
def group_absent(pid):
 try:os.killpg(pid,0);return False
 except ProcessLookupError:return True

def controlled(text):
 return [{'name':re.match(r"test\(['\"]([^'\"]+)",s).group(1),'bytes':len(s.encode()),'sha256':sha(s.encode())} for s in re.findall(r"(?ms)^test\(['\"]controlled[^\n]*.*?^\}\);",text)]

def tap(text,command):
 counts={k:int(v) for k,v in re.findall(r'^# (tests|pass|fail|cancelled|skipped|todo) (\d+)\s*$',text,re.M)}
 assert 'TAP version 13' in text and re.search(r'^1\.\.\d+\s*$',text,re.M),'incomplete TAP framing'
 assert all(k in counts for k in ['tests','pass','fail','cancelled','skipped','todo']),'incomplete TAP counts'
 assert counts['tests']>0 and counts['fail']==counts['cancelled']==counts['todo']==0,'test failure/cancellation/todo'
 if 'expectedTests' in command:assert counts['tests']==command['expectedTests'] and counts['skipped']==command['expectedSkipped'] and counts['pass']==command['expectedTests']-command['expectedSkipped'],'selected case population differs'
 skips=[l for l in text.splitlines() if re.search(r'#\s*(SKIP|TODO)\b',l,re.I)]
 diagnostics=[]
 for line in text.splitlines():
  m=re.match(r'^\s*#\s*(\{.*\})\s*$',line)
  if m:
   try:diagnostics.append(json.loads(m.group(1)))
   except ValueError:pass
 result={'counts':counts,'skips':skips,'diagnostics':diagnostics,'complete':True}
 if command['id']=='owned-lifetime':
  http=[r for r in diagnostics if r.get('owner')=='http' and 'mode' in r];capture=[r for r in diagnostics if 'capturedBytes' in r and r.get('owner') in ['worker','command','http']]
  assert len(http)==5 and len({r['mode'] for r in http})==5,'missing five HTTP diagnostics'
  assert len(capture)==3 and {r['owner'] for r in capture}=={'worker','command','http'},'missing three capture diagnostics'
  assert re.search(r'^ok \d+ - '+re.escape(base['handback']['name'])+r'\s*$',text,re.M),'controlled handback case incomplete'
  result['controlledPopulation']={**base['handback'],'standing':'Exact unchanged loop source and wholecase pass; no periteration instrumentation claim.'}
 return result

