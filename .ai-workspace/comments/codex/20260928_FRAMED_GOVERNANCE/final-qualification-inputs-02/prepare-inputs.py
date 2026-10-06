"""Construct successor external inputs only; Q01 is the corrected donor."""
import pathlib,json,hashlib,collections,shutil,difflib
E=pathlib.Path(__file__).resolve().parent;G=E.parent;R=G.parents[3];Q=G/'final-qualification-inputs-01';C=G/'final-candidate-construction-02';T='build_tenants/abiogenesis/typescript/'
sha=lambda b:hashlib.sha256(b).hexdigest();read=lambda p:json.loads(p.read_text());used={}
def body(p):
 b=p.read_bytes();used[str(p)]={'path':str(p),'bytes':len(b),'sha256':sha(b)};return b
def record(p):
 b=body(p);return {'path':str(p.relative_to(R)),'bytes':len(b),'sha256':sha(b)}
def check(p,row):
 b=body(p);assert len(b)==row.get('bytes',row.get('byteCount')) and sha(b)==row.get('sha256',row.get('digest','').removeprefix('sha256:')),str(p)
def write(n,v):
 with (E/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
def text(n,v):
 with (E/n).open('x') as f:f.write(v)
for p,h in [(Q/'freeze.json','0a386fd10e1067abb3f09ba4d7f115b56593045ca0d0d1aa272fb7fcc0a46bbe'),(C/'freeze.json','7256ca2e716e73912f4937fdddc6d8a980a217ecf965cac1512ba5162dac4469'),(G/'final-candidate-review-02/freeze.json','27143ee34bfab83267ad804ae5eaae76fa3e0f89981a796215c6ae6ea4893328'),(G/'final-candidate-review-02/return.md','ca8088c55e696391f16d109aa5c8b9bf918d6f2154363432f783b3441e877b57'),(G/'final-qualification-input-review-01.md','613c0dacf611a31a5253716a60b2801d2fb1ba949d554cfadc54e9263a37a3d6')]:assert sha(body(p))==h,str(p)
for row in read(Q/'freeze.json')['records']:check(Q/row['path'],row)
for row in read(C/'freeze.json')['records']:
 p=C/row['path']
 if row['kind']=='symlink':assert p.is_symlink() and str(p.readlink())==row['target']
 else:check(p,row)
src=read(C/'source-members.json');gen=read(C/'generated-after.json');arc=read(C/'archive-members.json');joins=read(C/'authority-joins.json');deps=read(C/'dependency-archives.json');assert [len(x) for x in [src,gen,arc,joins,deps]]==[1103,828,5256,95,16]
rows=[]
for row in src:
 p=C/'source-freeze/repo'/row['path'];check(p,row);rows.append({**{k:row[k] for k in ['path','bytes','sha256']},'origin':str(p),'role':'selected_source','selectedUntracked':row.get('selectedUntracked',False)})
for row in gen:
 p=C/'staged-repo'/T/row['path'];check(p,row);rows.append({**row,'path':T+row['path'],'origin':str(p),'role':'generated_output'})
assert len({r['path'] for r in rows})==1931;write('source-inventory.json',rows)
for j in joins:check(C/'source-freeze'/j['frozenOriginal'],j);check(C/'source-freeze/repo'/T/j['path'],j)
write('authority-correspondence.json',{'status':'95 frozen original/copy pairs equal','joins':joins,'canonicalLiveTicket':'excluded; frozen operational ticket is selected'})
files=[]
for row in rows:
 if row['role']!='selected_source' or not row['path'].startswith(T):continue
 rel=row['path'][len(T):]
 if rel.startswith('design/') or rel=='.gitignore':continue
 files.append({**row,'path':rel,'target':'subject/'+rel,'memberRef':'repo://abiogenesis/'+row['path'],'classification':'selected_build_or_proof_source'})
for n in ['product-toolchain-manifest.schema.json','public-contract-catalog.schema.json']:
 rel='contracts/schemas/'+n;row=next(r for r in gen if r['path']==rel);p=C/'source-freeze/generated-preimages'/rel;check(p,row)
 files.append({**row,'origin':str(p),'target':'subject/'+rel,'memberRef':'repo://abiogenesis/'+T+rel,'classification':'declared_schema_seed'})
files.sort(key=lambda r:r['path']);assert len(files)==691
depfiles=[{**{k:d[k] for k in ['bytes','sha256','locator','version','integrity']},'origin':str(C/'source-freeze'/d['frozenPath']),'target':f'dependency-inputs/{i:02}.tgz','classification':'locked_dependency_archive'} for i,d in enumerate(deps)]
for d in depfiles:check(pathlib.Path(d['origin']),d)
old_input=read(Q/'input-manifest.json');assert [(r['path'],r['target'],r['memberRef'],r['classification']) for r in files]==[(r['path'],r['target'],r['memberRef'],r['classification']) for r in old_input['sourceFiles']]
write('input-manifest.json',{**old_input,'candidate':str(C),'sourceFreezeManifestSha256':sha(body(C/'source-freeze-manifest.json')),'tenantInventorySha256':sha(body(E/'source-inventory.json')),'sourceFiles':files,'sourceBytes':sum(f['bytes'] for f in files),'dependencies':depfiles,'dependencyBytes':sum(d['bytes'] for d in depfiles)})
expected=[{k:r[k] for k in ['path','bytes','sha256']} for r in rows if r['path'].startswith(T) and (r['path'][len(T):].startswith(('build/','contracts/')) or r['path'][len(T):]=='product-toolchain-manifest.json')]
for r in expected:r['path']=r['path'][len(T):]
expected.sort(key=lambda r:r['path']);assert len(expected)==925;assert [r['path'] for r in expected]==[r['path'] for r in read(Q/'expected-output-inventory.json')['paths']]
write('expected-output-inventory.json',{**read(Q/'expected-output-inventory.json'),'basisInventorySha256':sha(body(E/'source-inventory.json')),'paths':expected})
copied=[]
for n in ['recipe.mjs','recipe-stage.mjs','compare-generated.mjs','test-environment.mjs','test-selection.json','config.json','release-claims.json','budgets.json']:
 b=body(Q/n);(E/n).write_bytes(b);copied.append(n)
assert body(E/'release-claims.json')==body(C/'source-freeze/release-claims.json')
config=read(E/'config.json');assert len(config['commands'])==13 and len(config['outcomePredicates'])==14
assert sum(c['timeoutMs']+c['terminationGraceMs'] for c in config['commands'])==958000
assert all(isinstance(c['environment'],list) and not any(v['name'] in ['HOME','home','CODEX_HOME'] for v in c['environment']) for c in config['commands'])
lint=[{'path':f['path'],'kind':f['path'].rsplit('.',1)[1]} for f in files if f['path'].endswith(('.json','.mjs'))];assert len(lint)==331
write('lint-population.json',{**read(Q/'lint-population.json'),'lint':{'files':lint}})
npmroot=C/'source-freeze/toolchain/npm';npmrows=[]
for p in sorted(npmroot.rglob('*')):
 if p.is_file() and not p.is_symlink():b=body(p);npmrows.append({'path':str(p.relative_to(npmroot)),'bytes':len(b),'sha256':sha(b)})
assert len(npmrows)==2312 and npmrows==read(Q/'npm-toolchain-inventory.json')['files']
write('npm-toolchain-inventory.json',{**read(Q/'npm-toolchain-inventory.json'),'root':str(npmroot),'files':npmrows})
tool=read(Q/'toolchain.json');tool['npm']['inventorySha256']=sha(body(E/'npm-toolchain-inventory.json'));tool['npm']['frozenRoot']=str(npmroot);tool['node']['frozenPath']=str(C/'source-freeze/toolchain/bin/node');tool['hostLibraryBasis']=record(C/'toolchain-host.json');tool['dependencies']=record(C/'dependency-archives.json')
for name in ['node','npm']:check(pathlib.Path(tool[name]['invokedPath']),tool[name])
for row in read(C/'toolchain-host.json')['nodeDynamicLibraries']:
 if not row['systemSharedCache']:assert sha(body(pathlib.Path(row['realpath'])))==row['sha256']
assert sha(body(pathlib.Path(tool['git']['resolvedDeveloperTool'])))==tool['git']['sha256'];write('toolchain.json',tool)
core=read(C/'selected-core.json');basis=core['basis'];write('package-readiness.json',{'installRoot':core['packageRoot'],'archive':core['artifactPath'],'archiveSha256':basis['artifactDigest'][7:],'productId':basis['productId'],'packageVersion':basis['packageVersion'],'productContentDigest':basis['productContentDigest'],'productManifestDigest':basis['manifestDigest'],'role':'accepted physical readiness, not admitted ProductInstall'})
pop=read(Q/'population-binding.json')
for k,n in [('archiveInventory','archive-members.json'),('generatedInventory','generated-after.json'),('preimageInventory','generated-before.json'),('realizedBuildDependencies','realized-dependencies-before-build.json'),('sourceOverlay','source-overlay.json')]:pop[k]=record(C/n)
write('population-binding.json',pop)
write('environment-delta.json',{'donor':record(Q/'environment-delta.json'),'config':record(Q/'config.json'),'preloader':record(Q/'test-environment.mjs'),'currentChange':'none; accepted corrected environment and staging/preloader bytes preserved exactly','HOME_home_CODEX_HOME':'not assigned','execution':'none'})
write('input-joins.json',[record(p) for p in [G/'final-qualification-input-controls-02/request.txt',G/'final-qualification-input-controls-02/request-sections.json',G/'final-candidate-coverage-selection-01.md',C/'freeze.json',C/'source-freeze-manifest.json',Q/'freeze.json',G/'final-candidate-review-02/freeze.json',G/'final-qualification-input-review-01.md']])
# Rebind the accepted corrected configuration constructor, not historical HOME code.
builder=body(Q/'prepare-subject-binding.mjs').decode();builder=builder.replace("'final-candidate-construction-01'","'final-candidate-construction-02'").replace('final-qualification-inputs-01/source-and-material','final-qualification-inputs-02/source-and-material')
builder=builder.replace("join(R,'.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/successor-06/verification-recipe.json')","join(G,'final-qualification-inputs-01/verification-recipe.json')").replace("join(R,'.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/successor-06/config.json')","join(G,'final-qualification-inputs-01/config.json')")
assert builder.count('toolchain:{ref:tool.ref,digest:tool.digest}')==1
builder=builder.replace('toolchain:{ref:tool.ref,digest:tool.digest}',"toolchain:{ref:'repo://abiogenesis/'+T+'product-toolchain-manifest.json',digest:ready.productManifestDigest}")
builder=builder.replace("write('basis-template.json',{status:'unbound_preparation_only',body:template,", "write('basis-template.json',{status:'unbound_preparation_only',body:template,auxiliaryBuildConfiguration:{ref:tool.ref,digest:tool.digest,meaning:'Node/npm build configuration evidence; not the native Product toolchain manifest'},")
text('prepare-subject-binding.mjs',builder)
validation=body(Q/'validate-inputs.mjs').decode().replace("'../final-candidate-construction-01'","'../final-candidate-construction-02'")
validation=validation.replace("const constructors=['constructHelloWorldModulePublication'","const constructors=['constructDefaultGovernanceLibraryModulePublication','constructHelloWorldModulePublication'")
validation=validation.replace("const pub=publications[3],program=", "assert.deepEqual(publications,read(join(C,'publication-bindings.json')).modulePublications);const pub=publications.find(p=>p.moduleRef==='module://abiogenesis/worksite/command-execution@5'),program=")
needle="const constructors=['constructDefaultGovernanceLibraryModulePublication'"
guard="""assert.equal(template.body.toolchain.digest,core.basis.manifestDigest);assert.deepEqual(template.body.toolchain,template.body.productManifest);
const buildConfig=inventory.members.find(m=>m.path===relative(R,join(E,'toolchain.json')));assert.deepEqual(template.auxiliaryBuildConfiguration.ref,buildConfig.ref);assert.equal(template.auxiliaryBuildConfiguration.digest,buildConfig.digest);assert.notEqual(buildConfig.digest,template.body.toolchain.digest);
const guardPath=join(C,'source-freeze/repo',T,'code/src/validator/self_conformance.ts'),guardSource=fs.readFileSync(guardPath,'utf8');assert.ok(guardSource.includes('basis.toolchain.digest !== owner.manifestDigest'));
write('toolchain-preview-binding.json',{status:'exact_immutable_Product_manifest_preview',nativeGuard:{path:relative(R,guardPath),digest:digest(Buffer.from(guardSource)),relation:'basis.productContentDigest == owner.productContentDigest; basis.productManifest.digest == owner.manifestDigest; basis.toolchain.digest == owner.manifestDigest'},ProductManifest:template.body.productManifest,toolchain:template.body.toolchain,manifestFileByteDigest:digest(fs.readFileSync(join(I,'product-toolchain-manifest.json'))),manifestCanonicalDigest:p.sha256Canonical(pm),auxiliaryBuildConfiguration:template.auxiliaryBuildConfiguration,limit:'Only the immutable preview relation is corrected; actual native owner/install/W/tenant inputs and qualification remain absent.'});
"""
assert needle in validation;validation=validation.replace(needle,guard+needle)
text('validate-inputs.mjs',validation)
donors=[];patches=[]
for n in copied+['prepare-subject-binding.mjs','validate-inputs.mjs']:
 before=body(Q/n);after=body(E/n);donors.append({'path':n,'original':record(Q/n),'successor':record(E/n),'bytesUnchanged':before==after,'authorScope':'copy or external input rebind only; inherited semantic authorship not reassigned'})
 if before!=after:patches.extend(difflib.unified_diff(before.decode().splitlines(keepends=True),after.decode().splitlines(keepends=True),fromfile=str(Q/n),tofile=str(E/n)))
text('donor-control-delta.patch',''.join(patches));write('donor-controls.json',{'rows':donors,'constructionDonors':[record(Q/n) for n in ['prepare-inputs.py','complete-inputs.py','bind-far-side.py']],'grant':record(G/'final-qualification-input-controls-02/request.txt'),'newActor':'/root/s03_independent_review','operation':'successor external inputs only'})
write('consumed-inputs.json',list(used.values()));print(json.dumps({'status':'constructed_inputs','source':1103,'generated':828,'protectedSource':691,'dependencies':16,'recipeFiles':9,'syntax':331,'expectedCompare':925,'npmFiles':2312,'copiedUnchanged':copied}))
