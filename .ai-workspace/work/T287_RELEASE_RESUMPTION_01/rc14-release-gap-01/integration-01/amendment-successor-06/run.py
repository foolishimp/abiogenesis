#!/usr/bin/env python3
"""External one-shot Operator. No Product import; all children use the retained owner."""
import datetime as dt, hashlib, importlib.util, json, os, pathlib, re, sys, tarfile

CONTROL=pathlib.Path(__file__).resolve().parent
sys.dont_write_bytecode=True
def sha(path):
    h=hashlib.sha256()
    with pathlib.Path(path).open('rb') as stream:
        for chunk in iter(lambda:stream.read(1048576),b''): h.update(chunk)
    return h.hexdigest()
def need(ok,message):
    if not ok: raise RuntimeError(message)
def save(path,value):
    with pathlib.Path(path).open('x') as stream: json.dump(value,stream,indent=2); stream.write('\n')
def positive(x): return isinstance(x,int) and not isinstance(x,bool) and x>0
def canonical(value):
    p=pathlib.Path(value); need(p.is_absolute() and p.resolve()==p,'Noncanonical path: '+str(p)); return p
def owner(retained):
    spec=importlib.util.spec_from_file_location('accepted_bounded',retained/'bounded.py')
    module=importlib.util.module_from_spec(spec); spec.loader.exec_module(module); return module
def owned(module,folder,args,cwd,env,deadline,cap_ms,max_bytes):
    save(folder.parent/(folder.name+'.intent.json'),{'argv':args,'cwd':str(cwd),'environmentKeys':sorted(env),'deadlineUtc':deadline.isoformat()})
    failure=None
    try: module.run(folder,args,cwd,env,deadline,cap_ms,max_bytes)
    except Exception as error: failure=str(error)
    finally:
        files=[folder/'stdout.raw',folder/'stderr.raw']; size=sum(p.stat().st_size for p in files if p.exists())
        save(folder.parent/(folder.name+'.final-capture.json'),{'bytes':size,'limit':max_bytes,'withinLimit':size<=max_bytes,'ownerFailure':failure,
          'ownershipRecord':str(folder/'pid.json'),'ownerResult':str(folder/'result.json'),
          'scope':'Owned command group only; separately grouped descendants require their owner receipts.'})
    need(failure is None and size<=max_bytes,failure or 'Final output limit exceeded: '+str(folder))
    return (folder/'stdout.raw').read_text()
def main():
    need(len(sys.argv)==2,'Usage: run.py ROOT_ACCEPTED_BINDING.json')
    binding_path=canonical(sys.argv[1]); binding_bytes=binding_path.read_bytes(); b=json.loads(binding_bytes)
    need(b.get('executionAuthorized') is True and b.get('executionGrant'),'Execution not separately authorized')
    m=json.loads((CONTROL/'CONTROL_MANIFEST.json').read_text())
    need(sha(CONTROL/'CONTROL_MANIFEST.json')==b['controlManifestSha256'],'Control manifest changed')
    for row in m['controls']: need(sha(CONTROL/row['path'])==row['sha256'],'Control changed: '+row['path'])
    retained=canonical(b['retainedControlRoot'])
    need(b['controlSourceCommit']==m['retainedControlCommit'],'Retained control commit differs')
    need(retained==canonical(b['controlSourceRoot'])/m['retainedControlRelativePath'],'Retained helper root differs')
    need(sha(retained/'CONTROL_MANIFEST.json')==m['retainedControlManifestSha256'],'Retained control manifest changed')
    old=json.loads((retained/'CONTROL_MANIFEST.json').read_text())
    for row in old['controls']: need(sha(retained/row['path'])==row['sha256'],'Retained control changed: '+row['path'])
    smoke_spec=importlib.util.spec_from_file_location('installed_smoke_custody',CONTROL/'smoke-custody.py')
    smoke_custody=importlib.util.module_from_spec(smoke_spec); smoke_spec.loader.exec_module(smoke_custody)
    smoke_input_path=canonical(b['smokeInputsPath'])
    need(sha(smoke_input_path)==b['smokeInputsSha256'],'Smoke input binding changed')
    smoke_inputs=json.loads(smoke_input_path.read_text())
    need(smoke_inputs['executionBindingComplete'] is True,'Final cut smoke inputs unresolved')
    smoke=canonical(b['smokeSourceRoot'])/smoke_inputs['tenantRelativePath']
    need(str(smoke.parent.parent.parent)==smoke_inputs['subjectRoot'],'Smoke subject root differs')
    need(b['candidate']['sourceCommit']==smoke_inputs['sourceCommit'] and b['candidate']['sourceTree']==smoke_inputs['sourceTree'],'Smoke/candidate C0 binding differs')
    protected_inputs=[str(smoke_input_path),*[row['path'] for row in smoke_inputs['receipts'].values()],smoke_inputs['dependencyReader']['path'],smoke_inputs['npmTree']['path']]
    need(set(protected_inputs)<=set(b['protectedRoots']),'Complete cut smoke inputs must be protected in both physical roles')
    keys=b['configuration']['provider']['inheritEnvironment']; need(isinstance(keys,list) and len(set(keys))==len(keys),'Explicit unique credential key selection required')
    secrets={}
    for key in keys:
        need(isinstance(key,str) and re.fullmatch(r'[A-Za-z_][A-Za-z0-9_]*',key),'Invalid credential key')
        need(os.environ.get(key),'Missing selected credential key: '+key); secrets[key]=os.environ[key]
        need(key not in b['setupEnvironment'],'Credential key in retained setup environment: '+key)
        need(secrets[key] not in binding_bytes.decode(),'Credential value present in retained binding: '+key)
    need(isinstance(b['setupEnvironment'],dict) and all(isinstance(k,str) and isinstance(v,str) for k,v in b['setupEnvironment'].items()),'Explicit nonsecret setup environment required')
    deadline=dt.datetime.fromisoformat(b['deadlineUtc'].replace('Z','+00:00')); need(deadline.tzinfo is not None,'UTC deadline required')
    for key in ['exitAuditReserveMs','smokeTimeoutMs','maxCaptureBytes']: need(positive(b[key]),'Finite '+key+' required')
    execution_deadline=deadline-dt.timedelta(milliseconds=b['exitAuditReserveMs'])
    need((execution_deadline-dt.datetime.now(dt.timezone.utc)).total_seconds()>15,'Insufficient original time for execution and owner cleanup')
    source=canonical(b['controlSourceRoot']); root=canonical(b['rawRoot']); worksite=canonical(b['worksiteRoot']); c=b['candidate']; cfg=b['configuration']
    need(not root.exists() and not worksite.exists(),'Fresh raw root and worksite required; no retry')
    need(isinstance(b['protectedRoots'],list) and b['protectedRoots'],'Explicit additional protected roots required')
    for key in ['recursionBound','processTimeoutMs','maxProcessOutputBytes']: need(positive(cfg[key]),'Finite '+key+' required')
    p=cfg['provider']; need(p['enabled'] is True and p['agent']=='claude' and p['model'],'Explicit provider identity required')
    for key in ['inactivityTimeoutMs','absoluteTimeoutMs','maxTurns']: need(positive(p[key]),'Finite provider '+key+' required')
    node=str(canonical(cfg['nodePath'])); python=str(canonical(b['pythonPath'])); archive=canonical(c['archivePath']); package=canonical(c['bootstrapPackageRoot'])
    need(str(canonical(sys.executable))==python,'Actual Python interpreter differs')
    need(c['sourceCommit'] and c['packageVersion'],'Final candidate unresolved')
    root.mkdir(parents=True); save(root/'ENTRY.json',{'pid':os.getpid(),'deadlineUtc':deadline.isoformat(),'executionDeadlineUtc':execution_deadline.isoformat(),'cleanupReserveSeconds':15,'exitAuditReserveMs':b['exitAuditReserveMs']})
    (root/'BINDING.json').write_bytes(binding_bytes)
    env=dict(b['setupEnvironment']); need(not set(keys)&set(env),'Credentials cannot reach smoke')
    env['TMPDIR']=str(root/'tmp'); pathlib.Path(env['TMPDIR']).mkdir()
    module=owner(retained); counter=0
    def command(label,args,cap,environment=None,until=execution_deadline):
        nonlocal counter; counter+=1
        return owned(module,root/(str(counter).zfill(3)+'-'+label),args,str(source),env if environment is None else environment,until,cap,b['maxCaptureBytes'])
    def capture(label,until):
        rows={}; errors=[]
        def measure(key,fn):
            try:
                need(dt.datetime.now(dt.timezone.utc)<until,'Original input-audit deadline exhausted')
                rows[key]=fn()
                need(dt.datetime.now(dt.timezone.utc)<until,'Input acquisition completed after original deadline')
            except Exception as error: errors.append({'input':key,'reason':str(error)})
        for row in m['controls']: measure('control:'+row['path'],lambda row=row:sha(CONTROL/row['path']))
        measure('control:CONTROL_MANIFEST.json',lambda:sha(CONTROL/'CONTROL_MANIFEST.json'))
        for row in old['controls']: measure('retainedControl:'+row['path'],lambda row=row:sha(retained/row['path']))
        measure('retainedControl:CONTROL_MANIFEST.json',lambda:sha(retained/'CONTROL_MANIFEST.json'))
        for row in old['inputs']: measure('source:'+row['path'],lambda row=row:sha(source/row['path']))
        measure('binding',lambda:sha(binding_path));measure('retainedBinding',lambda:sha(root/'BINDING.json'))
        measure('archive',lambda:sha(archive));measure('provider',lambda:sha(canonical(p['command'])))
        measure('node',lambda:sha(node));measure('python',lambda:sha(python))
        measure('topologyAcceptance',lambda:sha(canonical(b['topologyAcceptance']['path'])))
        measure('smokeInputs',lambda:sha(smoke_input_path))
        def bootstrap():
            inventory={}
            for parent,dirs,files in os.walk(package,followlinks=False):
                for name in dirs+files: need(not (pathlib.Path(parent)/name).is_symlink(),'Bootstrap symlink refused')
                for name in files:
                    path=pathlib.Path(parent)/name; inventory[path.relative_to(package).as_posix()]=sha(path)
            return inventory
        measure('bootstrap',bootstrap)
        measure('candidateSmokeInputs',lambda:smoke_custody.inspect(smoke_inputs,b,rows['bootstrap']))
        measure('sourceHead',lambda:command(label+'-source-head',['git','-C',str(source),'rev-parse','HEAD'],cfg['processTimeoutMs'],until=until).strip())
        measure('tenantDiff',lambda:command(label+'-tenant-check',['git','-C',str(source),'diff','--quiet',old['preparationSource'],'--','build_tenants/abiogenesis/typescript'],cfg['processTimeoutMs'],until=until))
        save(root/('INPUTS_'+label+'.json'),{'rows':rows,'errors':errors,'completedUtc':dt.datetime.now(dt.timezone.utc).isoformat()}); return rows,errors
    baseline=None; failure=None
    try:
        baseline,errors=capture('ENTRY',execution_deadline);need(not errors,'Entry input acquisition failed')
        for row in m['controls']:need(baseline['control:'+row['path']]==row['sha256'],'Control mismatch')
        for row in old['controls']:need(baseline['retainedControl:'+row['path']]==row['sha256'],'Retained control mismatch')
        for row in old['inputs']:need(baseline['source:'+row['path']]==row['sha256'],'Maintained source mismatch')
        need(baseline['sourceHead']==b['controlSourceCommit'],'Control source HEAD differs')
        need(baseline['smokeInputs']==b['smokeInputsSha256'],'Smoke input packet changed before entry')
        need('sha256:'+baseline['archive']==c['archiveSha256'],'Candidate archive differs')
        need(baseline['provider']==p['executableSha256'],'Provider differs')
        need(baseline['topologyAcceptance']==b['topologyAcceptance']['sha256'],'Topology acceptance differs')
        need(baseline['bootstrap'].get('product-toolchain-manifest.json')==c['manifestSha256'],'Bootstrap manifest differs')
        need(json.loads((package/'package.json').read_text())['version']==c['packageVersion'],'Bootstrap version differs')
        expected={}
        with tarfile.open(archive,'r:gz') as tar:
            for member in tar.getmembers():
                if member.isdir():continue
                name=member.name.removeprefix('package/')
                need(member.name.startswith('package/') and member.isfile() and name not in expected and '..' not in pathlib.PurePosixPath(name).parts,'Unsupported archive member')
                expected[name]=hashlib.sha256(tar.extractfile(member).read()).hexdigest()
        need(expected==baseline['bootstrap'],'Archive/bootstrap member sets or bytes differ')
        oracle=json.loads((CONTROL/'ORACLE.json').read_text()); process=json.loads((CONTROL/'PROCESS.json').read_text())
        writes=sorted({str(worksite/path) for path in oracle['writePaths']}|{str(worksite/row['relativePath']) for row in process['testPlan']['writeTerritories']})
        layout={'worksite':str(worksite),'writePaths':writes,'protectedRoots':sorted(set([str(source),str(CONTROL),b['smokeSourceRoot'],str(package),str(archive),str(root),*b['protectedRoots']])),'archiveRoot':str(root)}
        save(root/'PLANNED_LAYOUT.json',layout)
        observed=command('planned-topology',[python,str(retained/'physical-topology.py'),str(root/'PLANNED_LAYOUT.json')],60000)
        value=json.loads(observed);need(value.get('ok') is True and value.get('disposition')=='separated','Prospective topology not established')
        smoke_env={**env,'ABI5_WAVE1_FROZEN_ARTIFACT_PATH':str(archive),'ABI5_WAVE1_FROZEN_ARTIFACT_SHA256':c['archiveSha256'],'ABI5_WAVE1_FROZEN_INSTALL_HOST':baseline['candidateSmokeInputs']['installed']['installHost'],'ABI5_CANDIDATE_BASIS_SOURCE':'packed_artifact'}
        tap=command('installed-language',[node,'--test','--test-reporter=tap','--test-concurrency=1',str(smoke/'test_env/tests/installed-language-smoke.test.mjs')],b['smokeTimeoutMs'],smoke_env)
        for key,want in [('tests',1),('pass',1),('fail',0),('cancelled',0),('skipped',0),('todo',0)]:need(re.search(r'^# '+key+' '+str(want)+r'$',tap,re.M),'Wrong smoke population: '+key)
        need('Hello World is an external minimal GTL program through installed Public execution and fresh reads' in tap,'Wrong smoke case')
        command('amendment',[node,str(CONTROL/'amendment.mjs'),str(root/'BINDING.json')],max(1,int((execution_deadline-dt.datetime.now(dt.timezone.utc)).total_seconds()*1000)),{**env,**secrets})
    except Exception as error:
        failure=str(error); save(root/'FIRST_FAILURE.json',{'reason':failure,'retry':False,'qualified':False})
    finally:
        final,errors=capture('EXIT',deadline)
        mismatches=[] if baseline is None else [key for key in set(baseline)|set(final) if baseline.get(key)!=final.get(key)]
        audit={'complete':baseline is not None and not errors,'mismatches':mismatches,'errors':errors,'conserved':baseline is not None and not errors and not mismatches}
        save(root/'INPUT_CONSERVATION.json',audit)
        status='passed' if failure is None and audit['conserved'] else 'failed'
        save(root/'RETURN.json',{'status':status,'qualified':False,'firstFailure':failure,'inputConservation':audit,'deadlineUtc':b['deadlineUtc']})
        need(status=='passed','Execution or exit custody failed; retained evidence requires Root triage')
if __name__=='__main__':main()
