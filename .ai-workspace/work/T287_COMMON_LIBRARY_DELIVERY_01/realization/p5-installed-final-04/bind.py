from pathlib import Path
import json,hashlib,os,stat,tarfile,shutil,datetime
D=Path(__file__).resolve().parent; R=Path('/Users/jim/src/apps/abiogenesis'); W=R/'.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01'; P=W/'realization/p5-installed-preparation-01'; S=W/'realization/c0-potential-effect-successor-06'; T=S/'stage/build_tenants/abiogenesis/typescript'; OLD=W/'realization/lifetime-stream-repair-01/stage/build_tenants/abiogenesis/typescript'; Q=D/'proof/build_tenants/abiogenesis/typescript'; X=Path('/private/tmp/abg-stdo3-p5-04-7ca935e280b14df6')
pins=[]; checks=[]
def dump(name,x):
 with (D/name).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
def pin(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def check(p,row):
 if row.get('kind')=='symlink' or row.get('type')=='symlink' or 'link' in row:
  assert p.is_symlink(),str(p);assert os.readlink(p)==row.get('target',row.get('link')),str(p)
 else:
  assert not p.is_symlink(),str(p); q=pin(p); assert q['sha256']==row['sha256'] and q['bytes']==row['bytes'],str(p)
 if 'mode' in row:assert stat.S_IMODE(p.lstat().st_mode)==int(row['mode'],8),str(p)
def exact(p,digest):
 q=pin(p);assert q['sha256']==digest,str(p);pins.append(q);return json.loads(p.read_text())
try:
 assert not X.exists() and not X.is_symlink(),'physical root must be absent'
 assert str(X.parent.resolve())==str(X.parent)
 prep=exact(P/'freeze.json','b8859cda37f284ef928360059664b14b4304c131b23e21f453cdc4cf135e92b6')
 for r in prep['files']:check(P/r['path'],r)
 for r in prep['ownedOutputs']:check(P/'subject-final'/r['path'],r)
 checks.append({'subject':'P5 preparation','records':len(prep['files']),'ownedOutputs':len(prep['ownedOutputs']),'mismatches':0})
 final=exact(S/'proof-freeze.json','b60eca3e6fa641206eda37658b42285cf888a1a42b3cae259be5e2be75a5ce37')
 for r in final['records']:check(Path(r['path']),r)
 checks.append({'subject':'final06 frozen proof records','rows':len(final['records']),'mismatches':0})
 a=Path(final['archive']['path']);check(a,final['archive']);pins.append(pin(a))
 assert final['archive']['sha256']=='25e7f390a899f3bd9c49fa11a15feba1f59cb2a1d2ba4bad1f62c1abc4224079'
 for f in ['stage-post-generation-inventory.json','dependency-inputs.json','archive-members.json','offline-closure.json','mode-relation-pins.json']:
  pins.append(pin(S/f))
 inventory=json.loads((S/'stage-post-generation-inventory.json').read_text())
 for r in inventory['files']:check(S/'stage'/r['path'],r)
 checks.append({'subject':'final06 stage finite inventory','rows':len(inventory['files']),'mismatches':0})
 deps=json.loads((S/'dependency-inputs.json').read_text())
 for r in deps['files']:check(T/'node_modules'/r['path'],r)
 checks.append({'subject':'final06 dependencies','rows':len(deps['files']),'mismatches':0})
 mainroute=W/'realization/u1-c0-physical-currentness-01/main-generated-preimage.json'; main=json.loads(mainroute.read_text());pins.append(pin(mainroute))
 for r in main:check(R/r['path'],r)
 checks.append({'subject':'protected main generated','rows':len(main),'mismatches':0})
 mem=json.loads((S/'archive-members.json').read_text()); rows={r['path']:r for r in mem['files']}
 with tarfile.open(a) as tar:
  actual={}
  for m in tar.getmembers():
   if m.isdir():continue
   assert m.isfile() and m.name.startswith('package/'),m.name
   name=m.name[len('package/'):]; assert name not in actual,name
   b=tar.extractfile(m).read(); actual[name]={'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'mode':oct(m.mode)}
  assert set(actual)==set(rows)
  for name,r in rows.items():assert actual[name]=={k:r[k] for k in ['bytes','sha256','mode']},name
 checks.append({'subject':'actual final06 archive','members':len(rows),'bytesModesMembershipExact':True})
 manifest=T/'product-toolchain-manifest.json'; mp=pin(manifest);assert mp['sha256']=='a782e3bc49c703b3ea254e45edb54d3f7bf0402b42ff3bd34356dc0c13111ab4'; assert actual['product-toolchain-manifest.json']['sha256']==mp['sha256'];pins.append(mp)
 requirements=json.loads((P/'emitted-source-requirements.json').read_text());pins.append(pin(P/'emitted-source-requirements.json'))
 for r in requirements['requiredE03Correspondence']:
  for k in ['source','emitted']:check(T/r[k]['path'],r[k])
 span=requirements['productRenderer'];pb=(T/'build/code/src/product/worksite_command_execution.js').read_bytes();assert len(pb)==span['moduleBytes'];assert hashlib.sha256(pb).hexdigest()==span['moduleSha256'];assert hashlib.sha256(pb[span['startByte']:span['endByteExclusive']]).hexdigest()==span['spanSha256']
 checks.append({'subject':'E03 exact source/emitted owners','owners':6,'rendererSpanExact':True})
 support=json.loads((P/'source-support-dependencies.json').read_text());pins.append(pin(P/'source-support-dependencies.json'))
 copies=[]
 for r in support['files']:
  src=OLD/r['path'];check(src,r);copies.append((src,r['path']))
 for r in prep['ownedOutputs']:copies.append((P/'subject-final'/r['path'],str(Path(r['path']).relative_to('build_tenants/abiogenesis/typescript'))))
 lang='test_env/fixtures/language-smoke/program.mjs';lr=next(r for r in final['records'] if r['path']==str(T/lang));check(T/lang,lr);copies.append((T/lang,lang))
 copies.append((manifest,'product-toolchain-manifest.json'))
 tools=[Path('/opt/homebrew/Cellar/node/24.7.0/bin/node'),Path('/opt/homebrew/lib/node_modules/npm/bin/npm-cli.js'),Path('/opt/homebrew/lib/node_modules/npm/package.json')]
 for r in json.loads((S/'mode-relation-pins.json').read_text())['normalizationSources']:
  check(Path(r['path']),r);pins.append(pin(Path(r['path'])))
 for p in tools:pins.append(pin(p))
 assert pin(tools[0])['sha256']=='fe1c0128a4c0163b034ec06b8b290494830ccb49922b5ce9ca4edf497a083e5f'
 for source,relative in copies:
  dst=Q/relative;dst.parent.mkdir(parents=True,exist_ok=True);assert not dst.exists();shutil.copyfile(source,dst)
  assert pin(dst)['sha256']==pin(source)['sha256'];pins.append(pin(source))
 for name in ['build','node_modules']:
  target=T/name;assert not target.is_symlink() and str(target.resolve())==str(target);os.symlink(target,Q/name,target_is_directory=True)
 config=json.loads((P/'installed-configuration.NOT-GRANTED.json').read_text());config.update(effectGrant='P5_INSTALLED_EXECUTION_GRANTED_BY_EXECUTIVE',proofPackageRoot=str(Q),artifactPath=str(a),artifactSha256=final['archive']['sha256'],installHost=str(X/'host'),hostManifestSha256=mp['sha256'],scratchParent=str(X/'scratch'),evidenceRoot=str(X/'evidence'))
 dump('configuration.json',config)
 env={'PATH':'/opt/homebrew/Cellar/node/24.7.0/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin','HOME':'/Users/jim','LANG':'en_AU.UTF-8','TMPDIR':str(X/'scratch'),'NODE_OPTIONS':'','npm_config_offline':'true','npm_config_ignore_scripts':'true','npm_config_audit':'false','npm_config_fund':'false','npm_config_update_notifier':'false','npm_config_cache':str(X/'cache'),'npm_config_logs_dir':str(X/'npm-logs'),'npm_config_userconfig':'/dev/null','npm_config_globalconfig':'/dev/null','ABG_T287_C2_PROOF_CONFIG':str(D/'configuration.json')}
 dump('environment.json',env)
 launches={'install':{'executable':str(tools[0]),'args':[str(tools[1]),'install','--bin-links=false','--offline','--ignore-scripts','--no-audit','--no-fund','--package-lock=true',str(a)],'cwd':str(X/'host'),'timeoutMs':120000,'terminationGraceMs':1000,'lifetimeModule':str(T/'build/code/src/shared/owned_process_lifetime.js')},'test':{'executable':str(tools[0]),'args':['--test','--test-name-pattern','^T-287 C2 compact acknowledgment preserves installed large-log observation and replay$','test_env/tests/t287-worksite-command-execution.test.mjs'],'cwd':str(Q),'timeoutMs':630000,'terminationGraceMs':1000,'lifetimeModule':str(X/'host/node_modules/@abiogenesis/typescript-tenant/build/code/src/shared/owned_process_lifetime.js')}}
 dump('launches.json',launches)
 dump('proof-copy-inventory.json',{'files':[pin(Q/relative) for _,relative in copies],'symlinks':[{'path':str(Q/name),'target':str(T/name),'targetInventory':str(S/('stage-post-generation-inventory.json' if name=='build' else 'dependency-inputs.json'))} for name in ['build','node_modules']]})
 dump('binding-inputs.json',{'pins':list({r['path']:r for r in pins}.values()),'checks':checks,'runtimeConditionSource':str(D/'activation.json'),'initialPhysicalRoot':{'path':str(X),'absent':True},'proofPackageRoot':str(Q),'noRuntimeStarted':True})
 print(json.dumps({'status':'bindings exact','checks':checks,'proofPackageRoot':str(Q)}))
except BaseException as e:
 dump('binding-failure.json',{'error':repr(e),'checked':checks});raise
