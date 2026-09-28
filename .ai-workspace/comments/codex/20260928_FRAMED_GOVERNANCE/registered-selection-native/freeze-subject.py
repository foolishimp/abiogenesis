from pathlib import Path
import json,hashlib,tarfile,difflib,subprocess
repo=Path('/Users/jim/src/apps/abiogenesis');tenant=repo/'build_tenants/abiogenesis/typescript';e=repo/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/registered-selection-native'
def digest(p): return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def hashbytes(b): return 'sha256:'+hashlib.sha256(b).hexdigest()
core=['gtl/stdo_run_environment','gtl/registered_selection','product/registered_selection_native','product/index','abg/instruction_assembly','abg/actor_process','hog/ccall_lifecycle','abg/c_call_outcome']
source=['code/src/'+x+'.ts' for x in core]+['test_env/support/registered-graph-selection.mjs','test_env/fixtures/registered-selection-product/native.mjs','test_env/support/native-registered-selection.mjs','test_env/tests/t287-native-registered-selection.test.mjs','design/T287_REGISTERED_GRAPH_SELECTION_NATIVE_DESIGN.md']
generated=['build/code/src/'+x+ext for x in core for ext in ['.js','.d.ts']]+['product-toolchain-manifest.json','contracts/capabilities/capability-definition-graph.json']
setup=json.loads((e/'attempt-04/setup.json').read_text());archive=Path(setup['artifactPaths'][0]);installed=Path(setup['installedRoots'][0]);checks={}
with tarfile.open(archive) as tar:
 for f in generated:
  local=(tenant/f).read_bytes();packed=tar.extractfile('package/'+f).read();installed_bytes=(installed/f).read_bytes()
  assert local==packed==installed_bytes,f
  checks[f]=hashbytes(local)
# Preserve tracked emitted preimages from the exact accepted checkpoint.
for f in generated:
 p=e/'preimages'/f
 if not p.exists():
  r=subprocess.run(['git','show','1535e001:build_tenants/abiogenesis/typescript/'+f],cwd=repo,capture_output=True)
  if r.returncode==0:p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(r.stdout)
delta={}
for f in source:
 old=(e/'preimages'/f)
 if f.startswith('design/'):old=e/'native-how-before-provider-object.md'
 before=old.read_text().splitlines() if old.exists() else []
 after=(tenant/f).read_text().splitlines();add=delete=0
 for tag,i,j,k,l in difflib.SequenceMatcher(a=before,b=after,autojunk=False).get_opcodes():
  if tag in ['replace','delete']:delete+=j-i
  if tag in ['replace','insert']:add+=l-k
 delta[f]={'additions':add,'deletions':delete,'net':add-delete}
previous=json.loads((e/'first-attempt-evidence-manifest.json').read_text());assert all(digest(repo/r['path'])=='sha256:'+r['sha256'] for r in previous)
artifacts={}
for attempt in ['current','attempt-02','attempt-03','attempt-04']:
 s=json.loads((e/attempt/'setup.json').read_text());artifacts[attempt]=[{'path':p,'sha256':digest(Path(p)),'bytes':Path(p).stat().st_size} for p in s['artifactPaths']]
subject={'baseline':'1535e001','productBase':'e27f72bc2037130d3261694da40af0148269f142','sourceFiles':{f:digest(tenant/f) for f in source},'generatedLocalArchiveInstalledEqual':checks,'artifacts':artifacts,'installedRoots':setup['installedRoots'],'productContentDigest':json.loads((installed/'product-toolchain-manifest.json').read_text()).get('productContentDigest'),'delta':delta,'netSourceDelta':sum(x['net'] for x in delta.values()),'sourceAdditions':sum(x['additions'] for x in delta.values()),'sourceDeletions':sum(x['deletions'] for x in delta.values()),'preservedFirstAttemptFiles':len(previous),'proofCases':'attempt-04/outcomes.json','wholeTestStatus':'attempt-04 failed only on incorrect gap run_result exit expectation; three native cases passed; readback-only completion in finish-gap-readback.mjs passed; no whole-test or provider rerun after final test-only correction'}
(e/'subject.json').write_text(json.dumps(subject,indent=2)+'\n')
parts=[]
for f in source:
 p=e/'preimages'/f
 if f.startswith('design/'):p=e/'native-how-before-provider-object.md'
 old=p.read_text().splitlines(keepends=True) if p.exists() else []
 parts.extend(difflib.unified_diff(old,(tenant/f).read_text().splitlines(keepends=True),fromfile='a/'+f if p.exists() else '/dev/null',tofile='b/'+f))
(e/'source.diff').write_text(''.join(parts))
print(json.dumps({'subjectSha256':digest(e/'subject.json'),'artifactSha256':digest(archive),'sourceAdditions':subject['sourceAdditions'],'sourceDeletions':subject['sourceDeletions'],'netSourceDelta':subject['netSourceDelta'],'generatedCorrespondenceCount':len(checks)},indent=2))
