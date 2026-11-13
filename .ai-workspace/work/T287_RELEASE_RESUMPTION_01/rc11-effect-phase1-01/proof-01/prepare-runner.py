from pathlib import Path
import hashlib,difflib,json
P=Path(__file__).parent
OLD=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/proof-01/proof.py')
s=OLD.read_text();original=s
assert hashlib.sha256(OLD.read_bytes()).hexdigest()=='078bbdfb90ee2cf803b998438d50606e505205e7abb20e39e32be95408758b0f'
def replace(a,b):
 global s
 assert s.count(a)==1,a[:100]
 s=s.replace(a,b)
start=s.index('def tap(');end=s.index('\nbinding_path,',start)
s=s[:start]+'''def untap(text):
 decoded=re.sub(r'\\\\([\\\\#])',r'\\1',text)
 assert decoded.replace('\\\\','\\\\\\\\').replace('#','\\\\#')==text,'TAP escaping roundtrip'
 return decoded

def tap(text,command):
 counts={k:int(v) for k,v in re.findall(r'^# (tests|pass|fail|cancelled|skipped|todo) (\\d+)\\s*$',text,re.M)}
 assert 'TAP version 13' in text and re.search(r'^1\\.\\.\\d+\\s*$',text,re.M),'incomplete TAP framing'
 assert all(k in counts for k in ['tests','pass','fail','cancelled','skipped','todo']),'incomplete TAP counts'
 assert counts['tests']==command['expectedTests'] and counts['pass']==command['expectedTests']-command['expectedSkipped'] and counts['skipped']==command['expectedSkipped'],'selected case population differs'
 assert counts['fail']==counts['cancelled']==counts['todo']==0,'test failure/cancellation/todo'
 names=[untap(v) for v in re.findall(r'^# Subtest: (.*)$',text,re.M)]
 assert sorted(names)==sorted(command['expectedNames']),'literal named population differs'
 skips=[l for l in text.splitlines() if re.search(r'#\\s*SKIP\\b',l,re.I)]
 diagnostics=[]
 for line in text.splitlines():
  m=re.match(r'^\\s*#\\s*((?:evidence )?\\{.*\\})\\s*$',line)
  if m:
   raw=m.group(1);decoded=untap(raw);value=json.loads(decoded.removeprefix('evidence '))
   diagnostics.append({'rawLine':line,'decoded':value})
 result={'counts':counts,'names':names,'skips':skips,'diagnostics':diagnostics,'complete':True}
 if command['id']=='owned-lifetime':
  values=[r['decoded'] for r in diagnostics]
  http=[r for r in values if r.get('owner')=='http' and 'mode' in r and 'evidence' not in r]
  capture=[r for r in values if 'capturedBytes' in r and r.get('owner') in ['worker','command','http']]
  assert len(http)==5 and len({r['mode'] for r in http})==5,'missing five HTTP diagnostics'
  assert len(capture)==3 and {r['owner'] for r in capture}=={'worker','command','http'},'missing three capture diagnostics'
  assert base['handback']['name'] in names,'controlled handback incomplete'
  result['controlledPopulation']={**base['handback'],'standing':'Unchanged loop source plus actual whole-case pass, no periteration instrumentation claim.'}
 return result

def compiled_rows(tenant):
 result=[]
 for scope in ['build','contracts','product-toolchain-manifest.json']:
  root=tenant/scope
  for p in ([root] if root.is_file() else sorted(root.rglob('*'))):
   assert not p.is_symlink(),str(p)
   if p.is_file():
    q=pin(p);result.append({'path':p.relative_to(tenant).as_posix(),'bytes':q['bytes'],'sha256':q['sha256']})
 return sorted(result,key=lambda r:r['path'])

def dependency_metadata(root):
 result=[]
 for d,dirs,files in os.walk(root,followlinks=False):
  p=Path(d);st=p.stat();result.append({'path':p.relative_to(root).as_posix(),'mtimeNs':st.st_mtime_ns,'mode':st.st_mode & 0o7777})
  dirs[:]=[name for name in dirs if not (p/name).is_symlink()]
 p=root/'.package-lock.json'
 if p.exists():
  st=p.stat();result.append({'path':'.package-lock.json','mtimeNs':st.st_mtime_ns,'mode':st.st_mode & 0o7777})
 return sorted(result,key=lambda r:r['path'])
''' +s[end:]
replace("'ROOT_ADMITTED_RC11_PROOF'","'ROOT_ADMITTED_PHASE1_PROOF'")
replace("'FROZEN_C11_PROOF_SUBJECT'","'FROZEN_PHASE1_PROOF_SUBJECT'")
replace("for v in [dep,seed,npm]:verify_tree(v)","dep={**dep,'root':c['dependencyRoot']}\nfor v in [dep,seed,npm]:verify_tree(v)\nfor p in b['preservationPins']:checked(p)\nassert shutil.disk_usage(source).free>c['reserveBytes']")
replace("shutil.copytree(dep['root'],tenant/'node_modules',symlinks=True);verify_tree({**dep,'root':str(tenant/'node_modules')})", "metadata=dependency_metadata(Path(dep['root']))\n shutil.copytree(dep['root'],tenant/'node_modules',symlinks=True);verify_tree({**dep,'root':str(tenant/'node_modules')})\n copied=dependency_metadata(tenant/'node_modules');save(proof/'DEPENDENCY_METADATA.json',{'donorRoot':dep['root'],'copyRoot':str(tenant/'node_modules'),'before':metadata,'after':copied,'equal':metadata==copied,'method':'Python copytree/copy2 preserves directory and hidden-lock mtime/mode; no timestamp fabrication.'});assert metadata==copied,'dependency metadata changed'")
replace("assert rows_at(work,rows)==rows,'seed overwrote original source'", "assert applied==b['expectedAbsentSeeds'],'undeclared absent seed population'\n assert rows_at(work,rows)==rows,'seed overwrote original source'")
replace("results=[]\n for command", "results=[];retainedDelta=None;compiled=None\n for command")
replace("out=proof/command['id'];out.mkdir();pre=same_source(source,rows);same_source(stage,rows)","assert time.monotonic()-began<c['campaignMaximumSeconds'],'campaign bound'\n  assert shutil.disk_usage(proof).free>c['reserveBytes'],'disk reserve'\n  out=proof/command['id'];out.mkdir();evidence=out/'evidence';evidence.mkdir();pre=same_source(source,rows);same_source(stage,rows)\n  if compiled is not None:assert compiled_rows(tenant)==compiled,'retained tested build changed'\n  for p in b['preservationPins']:checked(p)")
replace("child=subprocess.Popen(argv,cwd=tenant,env=env,stdin=subprocess.DEVNULL", "commandEnv={**env,'ABI5_TEST_EVIDENCE_DIR':str(evidence)}\n   child=subprocess.Popen(argv,cwd=tenant,env=commandEnv,stdin=subprocess.DEVNULL")
replace("'sourcePreDigest':pre})", "'sourcePreDigest':pre,'evidenceDirectory':str(evidence),'environmentDelta':{'ABI5_TEST_EVIDENCE_DIR':str(evidence)}})")
needle="assert all(any(d['before']['path'].startswith(p) for p in allowed) for d in delta),'work code/test/source changed outside build-derived contracts'"
replace(needle,needle+"\n   if command['id']=='build':\n    retainedDelta=delta;compiled=compiled_rows(tenant);save(proof/'COMPILED_BUILD_INVENTORY.json',{'root':str(tenant),'sourceDigest':b['sourceDigest'],'scopes':['build','contracts','product-toolchain-manifest.json'],'rows':compiled,'inventoryDigest':sha(json.dumps(compiled,separators=(',',':')).encode()),'actualBuild':str(out/'RETURN.json')})\n   elif compiled is None:assert delta==[],'prebuild source changed'\n   else:assert delta==retainedDelta and compiled_rows(tenant)==compiled,'retained build/contract/manifest delta changed'\n   report['retainedEvidence']=[pin(p) for p in sorted(evidence.iterdir()) if p.is_file()]\n   for p in evidence.iterdir():assert p.is_file() and p.suffix=='.json';json.loads(p.read_text())\n   for p in b['preservationPins']:checked(p)")
replace("verify_tree(dep);verify_tree(npm);same_source(source,rows);same_source(stage,rows)","verify_tree(dep);verify_tree(npm);verify_tree({**dep,'root':str(tenant/'node_modules')});same_source(source,rows);same_source(stage,rows)\n assert compiled_rows(tenant)==compiled,'final tested build changed'\n for p in b['preservationPins']:checked(p)")
replace("'originalFrozenSourceConserved':True,'dependencyAndNpmAuthorityConserved':True", "'originalFrozenSourceConserved':True,'dependencyAndNpmAuthorityConserved':True,'compiledInventory':pin(proof/'COMPILED_BUILD_INVENTORY.json'),'retainedWorkDelta':retainedDelta")
compile(s,str(P/'proof.py'),'exec')
for name,body in [('proof.py',s),('RUNNER_DELTA.diff',''.join(difflib.unified_diff(original.splitlines(keepends=True),s.splitlines(keepends=True),fromfile=str(OLD),tofile=str(P/'proof.py'))))]:
 with (P/name).open('x') as f:f.write(body)
print(json.dumps({name:{'bytes':(P/name).stat().st_size,'sha256':hashlib.sha256((P/name).read_bytes()).hexdigest()} for name in ['proof.py','RUNNER_DELTA.diff']}))
