from pathlib import Path
import json,hashlib,subprocess,shutil,os,base64,stat,time
D=Path(__file__).resolve().parent;G=D.parent;C=G/'final-candidate-construction-01';R=G/'default-library-publication-repair-01';B=G.parents[3];TR=Path('build_tenants/abiogenesis/typescript');F=D/'source-freeze';S=D/'staged-repo';start=time.monotonic()
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(n,v):
 with (D/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
def copy(p,q):
 assert p.is_file() and not p.is_symlink(),str(p);q.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,q);assert sha(p)==sha(q)
def inv(root):
 rows=[]
 for p in sorted(root.rglob('*')):
  if p.is_symlink():rows.append({'path':str(p.relative_to(root)),'kind':'symlink','target':str(p.readlink())})
  elif p.is_file():rows.append({'path':str(p.relative_to(root)),'kind':'file','bytes':p.stat().st_size,'sha256':sha(p),'mode':stat.S_IMODE(p.stat().st_mode)})
 return rows
assert sha(C/'freeze.json')=='f6199e3f9ce72f99ecd16307eabc9ca92cc2ecdbc320c70bdd075962eb09650f'
assert sha(C/'source-freeze-manifest.json')=='3bbc0f064e8f00c2860081d1fa475abbe3604a25b627178d6792875ef5f23a1e'
assert sha(R/'freeze.json')=='19f97fe0758b204829d4f4695c83f49cc641d1c4affdd7defd46022c36eaa01d'
assert sha(R/'source.patch')=='ebf54688aaebfb86d5bbbd0d38f9334d05a24248772d7f09799776a9a7c70708'
review=G/'default-library-publication-review-01';assert sha(review/'return.md')=='33decf307f10b2c7501f5628faa1923cb47cd4afe9222225009fc07f3d0e93c5';assert sha(review/'freeze.json')=='a1670b454cb139baa508fdb97ad09553b65c9ebd40efba1d1d8ce196eeeac250'
base=json.loads((C/'source-members.json').read_text());assert len(base)==1103;delta=json.loads((R/'source-attribution.json').read_text())['sources'];assert len(delta)==3;by={r['logicalPath']:r for r in delta}
# Verify accepted patch against exact original logical paths; this is evidence only.
for r in delta:copy(C/'source-freeze/repo'/r['logicalPath'],D/'patch-reconstruction'/r['logicalPath']);assert sha(B/r['logicalPath'])==r['postimage']['sha256'];assert sha(R/r['postimage']['path'])==r['postimage']['sha256']
p=subprocess.run(['patch','-p1','--batch','-i',str(R/'source.patch')],cwd=D/'patch-reconstruction',capture_output=True,text=True);assert p.returncode==0,p.stderr
for r in delta:assert sha(D/'patch-reconstruction'/r['logicalPath'])==r['postimage']['sha256']
save('patch-reconstruction.json',{'patchSHA256':sha(R/'source.patch'),'exitCode':p.returncode,'stdout':p.stdout,'allThreePostimagesEqual':True})
rows=[]
for row in base:
 rel=row['path'];original=C/'source-freeze/repo'/rel;assert original.stat().st_size==row['bytes'] and sha(original)==row['sha256']
 selected=R/by[rel]['postimage']['path'] if rel in by else original;copy(selected,F/'repo'/rel);copy(selected,S/rel)
 updated={**row,'bytes':selected.stat().st_size,'sha256':sha(selected)}
 if rel in by:
  body=selected.read_bytes();updated['currentGitBlob']=hashlib.sha1(b'blob '+str(len(body)).encode()+b'\0'+body).hexdigest();updated['overlayChanged']=True
 rows.append(updated)
assert set(r['path'] for r in rows)==set(r['path'] for r in base)
ticket='.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md';assert sha(F/'repo'/ticket)=='de8b1cca640cbe220c5d53108cc21602f8579ca0361eb3cb39df8876bbea1b5f'
save('source-members.json',rows);save('source-deletions.json',json.loads((C/'source-deletions.json').read_text()));save('source-delta.json',[{'logicalPath':r['logicalPath'],'preimageSHA256':r['preimage']['sha256'],'postimageSHA256':r['postimage']['sha256'],'sourceAuthor':r['actualAuthor'],'copyBuildAuthor':'/root/s03_phase_b; copy/build does not replace actual source authorship'} for r in delta])
shutil.copytree(C/'source-freeze/stdo',F/'stdo');authorities=[]
for row in json.loads((C/'authority-joins.json').read_text()):
 original=F/row['frozenOriginal'];packaged=F/'repo'/TR/row['path'];assert original.read_bytes()==packaged.read_bytes();assert 'sha256:'+sha(original)==row['digest'] and original.stat().st_size==row['byteCount'];assert sha(Path(row['originalPath']))==row['originalSha256']
 authorities.append({**row,'currentOriginalVerified':True,'selectedOriginal':'source-freeze/'+row['frozenOriginal']})
assert len(authorities)==95;save('authority-joins.json',authorities)
generated=json.loads((C/'generated-after.json').read_text());assert len(generated)==828
for row in generated:
 rel=Path(row['path']);original=C/'staged-repo'/TR/rel;assert sha(original)==row['sha256'];copy(original,F/'generated-preimages'/rel)
 if rel.parts[0]=='contracts':copy(original,S/TR/rel)
save('generated-before.json',generated)
copy(C/'source-freeze/release-claims.json',F/'release-claims.json');claims=json.loads((C/'claim-check.json').read_text());assert sha(F/'release-claims.json')==claims['claimsSha256'];coverage=json.loads((S/TR/'contracts/qualification/coverage.json').read_text());assert len(coverage['claims'])==16 and sum(len(x['behaviors']) for x in coverage['claims'])==66;assert sha(S/TR/'contracts/qualification/coverage.json')==claims['coverageSha256'];save('claim-check.json',claims)
for root,names in [(G/'final-candidate-construction-controls-02',['request.txt','request-sections.json']),(C,['freeze.json','source-freeze-manifest.json','source-overlay.json']),(R,['return.md','freeze.json','source-attribution.json','source.patch']),(review,['return.md','freeze.json'])]:
 for name in names:copy(root/name,F/'controls'/root.name/name)
for row in delta:copy(R/row['preimage']['path'],F/'source-preimages'/row['logicalPath'])
shutil.copytree(C/'source-freeze/toolchain',F/'toolchain',symlinks=True)
for row in json.loads((C/'source-freeze-manifest.json').read_text())['members']:
 if row['path'].startswith('toolchain/'):
  p=F/row['path'];assert (p.is_symlink() and str(p.readlink())==row['target']) if row['kind']=='symlink' else sha(p)==row['sha256']
host=json.loads((C/'toolchain-host.json').read_text())
for r in host['executables']:assert sha(Path(r['path']))==r['sha256']
for r in host['nodeDynamicLibraries']:
 if r['sha256'] is not None:assert sha(Path(r['path']))==r['sha256']
assert subprocess.check_output([str(F/'toolchain/bin/node'),'--version']).decode().strip()=='v24.7.0';assert json.loads((F/'toolchain/npm/package.json').read_text())['version']=='11.5.1';save('toolchain-host.json',{**host,'copiedFrozenNodeAndNpm':True,'hostLibrariesReverified':True,'systemSharedCacheLimit':'Unfiled platform libraries remain host dependency observations; no portability claim'})
copy(C/'node-dynamic-libraries.txt',D/'node-dynamic-libraries.txt')
archives=[];locked=json.loads((F/'repo'/TR/'package-lock.json').read_text())['packages']
for row in json.loads((C/'dependency-archives.json').read_text()):
 original=C/'source-freeze'/row['frozenPath'];raw=original.read_bytes();assert sha(original)==row['sha256'];item=locked[row['locator']];assert item['integrity']==row['integrity'];algorithm,encoded=item['integrity'].split('-',1);assert base64.b64encode(hashlib.new(algorithm,raw).digest()).decode()==encoded;hexDigest=base64.b64decode(encoded).hex();rel=Path('content-v2')/algorithm/hexDigest[:2]/hexDigest[2:4]/hexDigest[4:];copy(original,F/row['frozenPath']);copy(original,D/'npm-cache/_cacache'/rel);archives.append(row)
assert len(archives)==16;assert next(r for r in archives if r['locator']=='node_modules/typescript')['version']=='5.9.2';save('dependency-archives.json',archives)
baseFreeze=json.loads((C/'source-freeze-manifest.json').read_text());save('source-overlay.json',{'head':baseFreeze['head'],'committedTree':baseFreeze['committedTree'],'dirtyOverlayIsCommit':False,'baseOverlay':'source-freeze/controls/final-candidate-construction-01/source-overlay.json','successorSourceDelta':'source-delta.json','movingTreeResnapshot':False,'frozenTicketSHA256':sha(F/'repo'/ticket)})
freeze=inv(F);save('source-freeze-manifest.json',{'status':'FROZEN','head':baseFreeze['head'],'committedTree':baseFreeze['committedTree'],'dirtyOverlayIsCommit':False,'authoredMemberCount':len(rows),'generatedPreimageCount':len(generated),'authorityJoins':95,'dependencyArchives':16,'sourceDeltaCount':3,'members':freeze})
elapsed=(time.monotonic()-start)*1000;assert elapsed<120000;save('preparation-result.json',{'status':'passed','elapsedMs':elapsed,'budgetMs':120000,'sourceFreezeSHA256':sha(D/'source-freeze-manifest.json')});print(json.dumps({'status':'frozen','authored':len(rows),'delta':3,'authorityJoins':95,'generatedBaseline':len(generated),'freezeMembers':len(freeze),'elapsedMs':elapsed,'sourceFreezeSHA256':sha(D/'source-freeze-manifest.json')}),flush=True)
