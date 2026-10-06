import json,pathlib,hashlib,shutil,collections,datetime
R=pathlib.Path('/Users/jim/src/apps/abiogenesis');G=R/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE';E=G/'final-qualification-inputs-01';C=G/'final-candidate-construction-01';D=R/'.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/successor-06';T='build_tenants/abiogenesis/typescript/'
def read(p):return json.loads(p.read_text())
def write(n,d): (E/n).write_text(json.dumps(d,indent=2)+'\n')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def row(p):return {'path':str(p.relative_to(R)),'bytes':p.stat().st_size,'sha256':sha(p)}
def check(p,r):assert p.stat().st_size==r.get('bytes',r.get('byteCount')) and sha(p)==r.get('sha256',r.get('digest','').removeprefix('sha256:')),str(p)
write('activation.json',{'role':'Worker','worker':'T287_FINAL_QUALIFICATION_INPUTS_01','territory':str(E),'changeClass':'realization_refactor','basis':'STDO v2.5.1-rc.1','request':row(G/'final-qualification-input-controls-01/request.txt'),'effects':'external input construction and pure installed constructor/schema checks only; no command recipe/test/native/resource/package/Git execution','status':'activated'})
write('input-joins.json',[row(G/'final-qualification-input-controls-01/request.txt'),row(G/'final-qualification-input-controls-01/request-sections.json'),row(G/'final-candidate-coverage-selection-01.md'),row(C/'freeze.json'),row(C/'source-freeze-manifest.json'),row(D/'freeze.json')])
src=read(C/'source-members.json');gen=read(C/'generated-after.json');arc=read(C/'archive-members.json');joins=read(C/'authority-joins.json');deps=read(C/'dependency-archives.json')
assert len(src)==1103 and len(gen)==828 and len(joins)==95 and len(arc)==5256
rows=[]
for r in src:
 p=C/'source-freeze/repo'/r['path'];check(p,r);rows.append({**{k:r[k] for k in ['path','bytes','sha256']},'origin':str(p),'role':'selected_source','selectedUntracked':r.get('selectedUntracked',False)})
for r in gen:
 p=C/'staged-repo'/T/r['path'];check(p,r);rows.append({**r,'path':T+r['path'],'origin':str(p),'role':'generated_output'})
assert len({r['path'] for r in rows})==len(rows)
write('source-inventory.json',rows)
for j in joins:
 a=C/'source-freeze'/j['frozenOriginal'];b=C/'source-freeze/repo'/T/j['path'];check(a,j);check(b,j)
write('authority-correspondence.json',{'status':'95 frozen original/copy pairs equal','joins':joins,'canonicalLiveTicket':'excluded; frozen operational ticket is selected'})
# Complete finite selected tenant operational/proof population; design/original law remain inventory-only.
files=[]
for r in rows:
 if r['role']!='selected_source' or not r['path'].startswith(T):continue
 rel=r['path'][len(T):]
 if rel.startswith('design/') or rel=='.gitignore':continue
 files.append({**r,'path':rel,'target':'subject/'+rel,'memberRef':'repo://abiogenesis/'+r['path'],'classification':'selected_build_or_proof_source'})
for name in ['product-toolchain-manifest.schema.json','public-contract-catalog.schema.json']:
 rel='contracts/schemas/'+name;r=next(x for x in gen if x['path']==rel);p=C/'source-freeze/generated-preimages'/rel;check(p,r)
 files.append({**r,'origin':str(p),'target':'subject/'+rel,'memberRef':'repo://abiogenesis/'+T+rel,'classification':'declared_schema_seed'})
files.sort(key=lambda r:r['path'])
depfiles=[{**{k:d[k] for k in ['bytes','sha256','locator','version','integrity']},'origin':str(C/'source-freeze'/d['frozenPath']),'target':f'dependency-inputs/{i:02}.tgz','classification':'locked_dependency_archive'} for i,d in enumerate(deps)]
for d in depfiles:check(pathlib.Path(d['origin']),d)
write('input-manifest.json',{'kind':'prospective_rc1_observed_source_input_selection','candidate':str(C),'sourceFreezeManifestSha256':sha(C/'source-freeze-manifest.json'),'tenantInventorySha256':sha(E/'source-inventory.json'),'sourceFiles':files,'sourceBytes':sum(f['bytes'] for f in files),'dependencies':depfiles,'dependencyBytes':sum(d['bytes'] for d in depfiles),'excluded':['design and original authorities are qualification inventory members, not copied into execution tree','generated outputs are comparison targets except two explicit schema seeds','unselected source and ambient node_modules/cache','test membership does not select execution; only five explicit component commands execute tests']})
expected=[{k:r[k] for k in ['path','bytes','sha256']} for r in rows if r['path'].startswith(T) and (r['path'][len(T):].startswith(('build/','contracts/')) or r['path'][len(T):]=='product-toolchain-manifest.json')]
for r in expected:r['path']=r['path'][len(T):]
expected.sort(key=lambda r:r['path']);assert len(expected)==925
write('expected-output-inventory.json',{'basisInventorySha256':sha(E/'source-inventory.json'),'paths':expected,'roles':{'generated':828,'preservedConstitutionalOrDefaultLibraryInputs':97}})
for n in ['recipe.mjs','compare-generated.mjs','test-selection.json']:
 shutil.copyfile(D/n,E/n)
stage=(D/'recipe-stage.mjs').read_text().replace("['reports', '.npm-cache', '.home', '.tmp']","['reports', '.npm-cache', '.npm-prefix', '.tmp']").replace("['.user.npmrc', '.global.npmrc']","['.user.npmrc', '.global.npmrc', '.global.gitconfig', '.system.gitconfig']")
(E/'recipe-stage.mjs').write_text(stage)
pre=(D/'test-environment.mjs').read_text().replace("['.home','.tmp','reports/f16']","['.tmp','.npm-cache','.npm-prefix','reports/f16']").replace("process.env.HOME=resolve('.home');\n",'')
pre+="process.env.npm_config_cache=resolve('.npm-cache');\nprocess.env.npm_config_prefix=resolve('.npm-prefix');\nprocess.env.npm_config_userconfig=resolve('.user.npmrc');\nprocess.env.npm_config_globalconfig=resolve('.global.npmrc');\nprocess.env.GIT_OPTIONAL_LOCKS='0';\n"
(E/'test-environment.mjs').write_text(pre)
config=read(D/'config.json')
for cmd in config['commands']:
 env=cmd['environment'];env.pop('HOME');prefix='verification/' if cmd['relativeCwd']=='.' else ''
 env.update({'npm_config_prefix':prefix+'.npm-prefix','GIT_CONFIG_GLOBAL':prefix+'.global.gitconfig','GIT_CONFIG_SYSTEM':prefix+'.system.gitconfig','GIT_CONFIG_NOSYSTEM':'1','GIT_OPTIONAL_LOCKS':'0'})
 # Explicit array is an existing owner input form and prevents ambient HOME capture.
 cmd['environment']=[{'name':k,'value':v} for k,v in sorted(env.items())]
total=sum(c['timeoutMs']+c['terminationGraceMs'] for c in config['commands']);assert total==958000
config['supervisionProposal']={'commandCapsAndGracesMs':total,'helperDispatchAndAckAllowanceMs':5000,'requiredHelperBudgetMs':total+5000,'ABG_TS_FP_TIMEOUT_MS':str(total+125000),'ABG_TS_FP_ABSOLUTE_TIMEOUT_MS':str(total+305000),'outerC2PublicBudgetMs':total+905000,'outerDriverBudgetMs':total+1805000,'status':'finite proposal for later Root grant; unexecuted','basis':'13 actual command bounds/graces; construction01 build20.641s, offline ci1.335s; native actor setup/ack and assessment separate. Idle timeout must cover longest silent helper run, not be mistaken for total episode elapsed. Absolute and outer budgets exceed complete helper aggregate.'}
write('config.json',config)
lint=[{'path':f['path'],'kind':f['path'].rsplit('.',1)[1]} for f in files if f['path'].endswith(('.json','.mjs'))];write('lint-population.json',{'lint':{'files':lint},'selection':'finite selected source MJS/JSON plus two explicit schema seeds; syntax/parse only, no extra test execution'})
shutil.copyfile(C/'source-freeze/release-claims.json',E/'release-claims.json')
# Actual immutable npm tree, supplier package membership and host dependencies stay integrity-bound references.
npmroot=C/'source-freeze/toolchain/npm';npmrows=[]
for p in sorted(npmroot.rglob('*')):
 if p.is_file() and not p.is_symlink():npmrows.append({'path':str(p.relative_to(npmroot)),'bytes':p.stat().st_size,'sha256':sha(p)})
write('npm-toolchain-inventory.json',{'root':str(npmroot),'files':npmrows,'role':'host_build_toolchain_not_authored_Product_source'})
host=read(C/'toolchain-host.json');tool=read(D/'toolchain.json');tool.pop('reverifiedAt',None);tool['npm']['inventorySha256']=sha(E/'npm-toolchain-inventory.json');tool['npm']['frozenRoot']=str(npmroot);tool['node']['frozenPath']=str(C/'source-freeze/toolchain/bin/node');tool['hostLibraryBasis']=row(C/'toolchain-host.json');tool['dependencies']=row(C/'dependency-archives.json');tool['cache']='Only 16 frozen dependency archives; future protected recipe seeds its own cache and installs offline.'
for n in ['node','npm']:check(pathlib.Path(tool[n]['invokedPath']),tool[n])
for r in npmrows:check(pathlib.Path('/opt/homebrew/lib/node_modules/npm')/r['path'],r)
for r in host['nodeDynamicLibraries']:
 if not r['systemSharedCache']:assert sha(pathlib.Path(r['realpath']))==r['sha256']
check(pathlib.Path(tool['git']['resolvedDeveloperTool']),{'bytes':pathlib.Path(tool['git']['resolvedDeveloperTool']).stat().st_size,'sha256':tool['git']['sha256']})
write('toolchain.json',tool)
core=read(C/'selected-core.json');basis=core['basis'];write('package-readiness.json',{'installRoot':core['packageRoot'],'archive':core['artifactPath'],'archiveSha256':basis['artifactDigest'][7:],'productId':basis['productId'],'packageVersion':basis['packageVersion'],'productContentDigest':basis['productContentDigest'],'productManifestDigest':basis['manifestDigest'],'role':'physical readiness, not admitted ProductInstall'})
write('population-binding.json',{'sourceSelected':len(src),'generatedOutputs':len(gen),'qualificationSourceMembers':len(rows),'protectedSourceInputs':len(files),'lintFiles':len(lint),'authorityJoins':len(joins),'dependencies':len(deps),'npmFiles':len(npmrows),'archiveFiles':len(arc),'expectedCompareMembers':len(expected),'archiveInventory':row(C/'archive-members.json'),'generatedInventory':row(C/'generated-after.json'),'preimageInventory':row(C/'generated-before.json') if (C/'generated-before.json').exists() else row(C/'source-freeze-manifest.json'),'realizedBuildDependencies':row(C/'realized-dependencies-before-build.json'),'sourceOverlay':row(C/'source-overlay.json'),'reason':'All 1103 selected members and 828 generated output members are qualification source inventory. Bundled supplier payload membership remains complete in archive inventory, not falsely attributed as new local authorship. Protected build/lint selects all 689 operational and proof source members plus two schema seeds. Design/original law remain qualification inputs. Five test selections unchanged.'})
write('environment-delta.json',{'donor':row(D/'config.json'),'preloaderDonor':row(D/'test-environment.mjs'),'removed':['all 13 HOME assignments','preloader HOME assignment','unused .home creation'],'added':['explicit environment array selects no ambient HOME; inherited HOME is not rewritten','task-owned npm prefix, Git global/system config and GIT_OPTIONAL_LOCKS=0','preloader absolute npm cache/prefix/config paths'],'preserved':['13 commands and 14 predicate meanings','five test argument selections and time bounds','verification subtree only writes','TMPDIR, npm offline/cache/config, LANG/LC_ALL, F16 report territory'],'execution':'none'})
print(json.dumps(read(E/'population-binding.json'),indent=2))
