from pathlib import Path
import json,hashlib,subprocess,shutil,os,base64,datetime,stat
B=Path('/Users/jim/src/apps/abiogenesis');TR=Path('build_tenants/abiogenesis/typescript');T=B/TR;G=B/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE';D=G/'final-candidate-construction-01';F=D/'source-freeze';S=D/'staged-repo';env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(n,v):(D/n).write_text(json.dumps(v,indent=2)+'\n')
def copy(p,q):
 assert p.is_file() and not p.is_symlink(),str(p);q.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,q);assert sha(p)==sha(q)
def inv(root):
 rows=[]
 for p in sorted(root.rglob('*')):
  if p.is_symlink():rows.append({'path':str(p.relative_to(root)),'kind':'symlink','target':str(p.readlink())})
  elif p.is_file():rows.append({'path':str(p.relative_to(root)),'kind':'file','bytes':p.stat().st_size,'sha256':sha(p),'mode':stat.S_IMODE(p.stat().st_mode)})
 return rows
save('activation.json',{'worker':'T287_FINAL_CANDIDATE_CONSTRUCTION_01','role':'Worker','changeClass':'realization_refactor','territory':str(D),'requestSha256':'0bc97876f7e06e3655d92baa413924a46fb6ba17a28d6e4a4eeb4a4cd98f20ef','prospectiveVersion':'5.0.0-rc.1','nativeEffects':'not authorized','startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()})
for n in ['source-freeze','staged-repo','artifacts','install','npm-cache','tmp']: (D/n).mkdir()
request=G/'final-candidate-construction-controls-01/request.txt';assert request.stat().st_size==9866 and sha(request)=='0bc97876f7e06e3655d92baa413924a46fb6ba17a28d6e4a4eeb4a4cd98f20ef'
head=subprocess.check_output(['git','rev-parse','HEAD','HEAD^{tree}'],cwd=B,env=env).decode().splitlines();assert head==['55a8a452141caf180ea6cee6365d2a1bfb9da34e','4c62849aea7a973c28015ab4d503ccbec3fa728a']
trackedRaw=subprocess.check_output(['git','ls-files','-s','-z','--',str(TR)],cwd=B,env=env).decode();tracked={}
for entry in trackedRaw.split('\0'):
 if entry:
  meta,p=entry.split('\t');mode,oid,stage=meta.split();assert stage=='0';tracked[p]={'mode':mode,'blob':oid}
selected=set()
for p in (T/'code/src').rglob('*'):
 if p.is_file():selected.add(str(p.relative_to(B)))
selected.update(str(p.relative_to(B)) for p in (T/'scripts').glob('*.mjs'))
selected.update(str(TR/n) for n in ['package.json','package-lock.json','tsconfig.json','.gitignore'])
for p in tracked:
 rel=Path(p).relative_to(TR)
 if rel.parts[0] in ['design','test_env'] and not any(x in rel.parts for x in ['test_runs','evidence']):selected.add(p)
explicit=['test_env/fixtures/continuation-causation.json','test_env/fixtures/t287-s03-automatic-product/index.mjs','test_env/fixtures/t287-selected-action-product/index.mjs','test_env/support/t287-s03-automatic.mjs','test_env/support/t287-selected-action-host.mjs','test_env/tests/t287-continuation-causation.test.mjs','test_env/tests/t287-s03-automatic.test.mjs','test_env/tests/t287-selected-action-authority.test.mjs','test_env/tests/t287-selected-action.test.mjs']
selected.update(str(TR/p) for p in explicit)
a=json.loads((T/'contracts/qualification/authority-inputs.json').read_text());R=Path(json.loads((B/'.ai-workspace/comments/codex/20260921_STDO_251_RC1_ADOPTION/stdo-status.json').read_text())['path']);assert sha(R/'manifest.json')=='5d306da13994e69aa9f215d4c1cd2d0be96283c1e33a652b58e6e9262d036b64'
authorities=[]
for row in a['sources']:
 repo=row['ref'].startswith('repo://abiogenesis/');rel=row['ref'].removeprefix('repo://abiogenesis/') if repo else row['ref'].removeprefix(a['method']['releaseRef']);original=(B if repo else R)/rel;packaged=T/row['path']
 assert original.read_bytes()==packaged.read_bytes() and 'sha256:'+sha(original)==row['digest'] and original.stat().st_size==row['byteCount'],row['ref']
 selected.add(str(packaged.relative_to(B)))
 if repo:selected.add(rel)
 else:copy(original,F/'stdo'/rel)
 authorities.append({**row,'originalPath':str(original),'originalSha256':sha(original),'frozenOriginal':('repo/' if repo else 'stdo/')+rel})
assert len(authorities)==95
selected.add(str(TR/'contracts/qualification/authority-inputs.json'));selected.add(str(TR/'contracts/default-library/stdo/standards/STDO_REFERENCE_FRAME_BASELINE.md'))
selected.update(['README.md','AGENTS.md','CLAUDE.md','specification/GOALS.md','.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md'])
copy(R/'manifest.json',F/'stdo/manifest.json')
sourceRows=[];deletions=[]
for rel in sorted(selected):
 p=B/rel
 if not p.exists():deletions.append({'path':rel,'tracked':tracked.get(rel)});continue
 copy(p,F/'repo'/rel);copy(F/'repo'/rel,S/rel)
 row={'path':rel,'bytes':p.stat().st_size,'sha256':sha(p),'git':tracked.get(rel),'selectedUntracked':rel not in tracked and rel.startswith(str(TR))}
 if rel in tracked:
  raw=p.read_bytes();blob=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest();row['currentGitBlob']=blob;row['overlayChanged']=blob!=tracked[rel]['blob']
 sourceRows.append(row)
save('source-members.json',sourceRows);save('source-deletions.json',deletions);save('authority-joins.json',authorities)
repair=json.loads((G/'s03-public-handoff-repair-01/freeze.json').read_text())
for row in repair['sources']:assert sha(Path(row['path']))==row['sha256'];assert sha(F/'repo'/Path(row['path']).relative_to(B))==row['sha256']
# Preserve current generated bytes in a separate preimage tree; stage contract
# inputs/preimages, but never stage old build outputs as authored source.
generated=[]
for p in sorted([*list((T/'build').rglob('*')),*list((T/'contracts').rglob('*')),T/'product-toolchain-manifest.json']):
 if not p.is_file():continue
 rel=p.relative_to(T)
 if str(p.relative_to(B)) in selected:continue
 copy(p,F/'generated-preimages'/rel);generated.append({'path':str(rel),'bytes':p.stat().st_size,'sha256':sha(p)})
 if rel.parts[0]=='contracts':copy(F/'generated-preimages'/rel,S/TR/rel)
save('generated-before.json',generated)
claims=B/'.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/successor-06/release-claims.json';coverage=json.loads((T/'contracts/qualification/coverage.json').read_text());assert len(coverage['claims'])==16 and sum(len(x['behaviors']) for x in coverage['claims'])==66
assert 'sixteen source-linked declaration groups and sixty-six behaviors' in claims.read_text();copy(claims,F/'release-claims.json');save('claim-check.json',{'claimsSha256':sha(claims),'coverageSha256':sha(T/'contracts/qualification/coverage.json'),'declarationGroups':16,'behaviors':66,'selectedCapabilitiesUnchanged':True,'status':'prospective claims; native coverage not asserted'})
for rel in ['final-candidate-construction-controls-01/request.txt','final-candidate-construction-controls-01/request-sections.json','final-candidate-preparation-01.md','s03-public-handoff-repair-01/return.md','s03-public-handoff-repair-01/freeze.json','s03-public-handoff-repair-review-01.md']:copy(G/rel,F/'controls'/rel)
# Freeze and copy the exact Node/npm executable package; native dynamic
# dependencies remain observed host dependencies, explicitly inventoried.
node=Path(shutil.which('node')).resolve();npm=Path(shutil.which('npm')).resolve().parent.parent
copy(node,F/'toolchain/bin/node');shutil.copytree(npm,F/'toolchain/npm',symlinks=True)
(F/'toolchain/bin/npm').symlink_to('../npm/bin/npm-cli.js')
executables=[]
for name in ['node','npm','python3','tar','sh']:
 p=Path(shutil.which(name)).resolve();executables.append({'name':name,'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p)})
otool=subprocess.check_output(['otool','-L',str(node)]).decode();(D/'node-dynamic-libraries.txt').write_text(otool)
libs=[]
for line in otool.splitlines()[1:]:
 path=line.strip().split(' (',1)[0];p=Path(path)
 libs.append({'path':path,'realpath':str(p.resolve()),'sha256':sha(p) if p.is_file() else None,'systemSharedCache':not p.is_file()})
save('toolchain-host.json',{'executables':executables,'nodeDynamicLibraries':libs,'nodeVersion':subprocess.check_output([str(node),'--version']).decode().strip(),'npmVersion':json.loads((npm/'package.json').read_text())['version'],'platform':subprocess.check_output(['uname','-a']).decode().strip()})
lock=json.loads((F/'repo'/TR/'package-lock.json').read_text());archives=[]
for locator,item in lock['packages'].items():
 if not locator:continue
 algorithm,encoded=item['integrity'].split('-',1);hexDigest=base64.b64decode(encoded).hex();rel=Path('content-v2')/algorithm/hexDigest[:2]/hexDigest[2:4]/hexDigest[4:];original=Path('/Users/jim/.npm/_cacache')/rel
 raw=original.read_bytes();assert base64.b64encode(hashlib.new(algorithm,raw).digest()).decode()==encoded
 target=F/'dependency-archives'/(locator.removeprefix('node_modules/').replace('/','__')+'.tgz');copy(original,target);copy(target,D/'npm-cache/_cacache'/rel)
 archives.append({'locator':locator,'version':item['version'],'resolved':item['resolved'],'integrity':item['integrity'],'originalCachePath':str(original),'frozenPath':str(target.relative_to(F)),'bytes':len(raw),'sha256':sha(target)})
save('dependency-archives.json',archives)
# Seal by inventory. No source-freeze writes after this file is emitted.
freezeRows=inv(F);save('source-freeze-manifest.json',{'status':'FROZEN','head':head[0],'committedTree':head[1],'dirtyOverlayIsCommit':False,'authoredMemberCount':len(sourceRows),'generatedPreimageCount':len(generated),'authorityJoins':len(authorities),'dependencyArchives':len(archives),'deletions':deletions,'members':freezeRows})
save('source-overlay.json',{'head':head[0],'tree':head[1],'selectedModified':[x for x in sourceRows if x.get('overlayChanged')],'selectedUntracked':[x for x in sourceRows if x.get('selectedUntracked')],'deletions':deletions,'gitStatus':subprocess.check_output(['git','status','--porcelain=v1','--untracked-files=all','--',str(TR)],cwd=B,env=env).decode()})
print(json.dumps({'status':'frozen','authored':len(sourceRows),'generatedPreimages':len(generated),'authorityJoins':len(authorities),'dependencies':len(archives),'freezeMembers':len(freezeRows),'sourceFreezeSha256':sha(D/'source-freeze-manifest.json')}),flush=True)
