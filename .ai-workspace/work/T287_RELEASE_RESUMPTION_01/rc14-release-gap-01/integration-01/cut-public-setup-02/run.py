#!/usr/bin/env python3
"""One disabled-until-bound setup invocation, using the accepted finite owner."""
import datetime as dt,hashlib,importlib.util,json,os,pathlib,sys,tarfile,time
sys.dont_write_bytecode=True
HERE=pathlib.Path(__file__).resolve().parent
MAX_BYTES=16777216
def need(ok,message):
    if not ok:raise RuntimeError(message)
def sha(p):
    h=hashlib.sha256()
    with pathlib.Path(p).open('rb') as f:
        for block in iter(lambda:f.read(1048576),b''):h.update(block)
    return h.hexdigest()
def read(p):return json.loads(pathlib.Path(p).read_text())
def save(p,value):
    with pathlib.Path(p).open('x') as f:json.dump(value,f,indent=2);f.write('\n')
def canonical(value):
    p=pathlib.Path(value);need(p.is_absolute() and str(p)==value and p.resolve()==p,'Canonical absolute path required');return p
def main():
    need(len(sys.argv)==2,'Usage: run.py ROOT_BOUND_BINDING.json')
    binding=canonical(sys.argv[1]);b=read(binding)
    need(b.get('executionAuthorized') is True and b.get('executionGrant'),'Execution is disabled pending Root binding')
    need(isinstance(b.get('runId'),str) and b['runId'],'Fresh run identity required')
    start=time.monotonic();now=dt.datetime.now(dt.timezone.utc)
    deadline=dt.datetime.fromisoformat(b['deadlineUtc'].replace('Z','+00:00'))
    need(deadline.tzinfo is not None and 30<(deadline-now).total_seconds()<=900,'Fresh enclosing grant must be <=15min including30s exit reserve')
    end=start+(deadline-now).total_seconds();execution_deadline=deadline-dt.timedelta(seconds=30)
    def current(final=False):
        reserve=0 if final else 30
        need(time.monotonic()<end-reserve and dt.datetime.now(dt.timezone.utc)<deadline-dt.timedelta(seconds=reserve),'Original wall/monotonic deadline exhausted')
    need(sha(HERE/'CONTROL_MANIFEST.json')==b['controlManifestSha256'],'Control manifest mismatch')
    manifest=read(HERE/'CONTROL_MANIFEST.json')
    for row in manifest['controls']:need(sha(HERE/row['path'])==row['sha256'],'Control changed: '+row['path'])
    source=canonical(b['controlSourceRoot']);retained=canonical(b['retainedControlRoot'])
    for row in read(HERE/'INPUTS.json')['files']:
        root={'controlSourceRoot':source,'retainedControlRoot':retained}[row['root']]
        p=root/row['path'];need(p.is_file() and not p.is_symlink() and sha(p)==row['sha256'],'Reused input changed: '+str(p))
    spec=importlib.util.spec_from_file_location('accepted_setup_process_owner',retained/'run.py')
    base=importlib.util.module_from_spec(spec);spec.loader.exec_module(base);owner=base.owner()
    raw=canonical(b['rawRoot']);worksite=canonical(b['worksiteRoot']);c=b['candidate']
    archive=canonical(c['archivePath']);bootstrap=canonical(c['bootstrapPackageRoot']);cut=canonical(c['cutRecordPath'])
    need(not raw.exists() and not worksite.exists(),'Fresh raw and worksite roots required; no retry')
    need(b['controlSourceCommit']=='c1683d3cdb299c33b0d20bd04b7c1d40d6a05862','Wrong maintained control source')
    need(c['packageVersion']=='5.0.0-rc.14' and c['sourceCommit'],'Final RC14 candidate/source required')
    tools=b['toolchains'];tool_pins=read(HERE/'TOOL_PINS.json')
    need(tools==tool_pins['executables'],'Toolchain differs from prepared pins')
    for row in tools.values():need(sha(canonical(row['path']))==row['sha256'],'Pinned executable differs')
    env=b['setupEnvironment'];keys={'HOME','PATH','LANG','LC_ALL','TMPDIR','NPM_CONFIG_CACHE','NPM_CONFIG_USERCONFIG','NPM_CONFIG_GLOBALCONFIG','NPM_CONFIG_OFFLINE','NPM_CONFIG_UPDATE_NOTIFIER'}
    need(isinstance(env,dict) and set(env)==keys and all(isinstance(v,str) for v in env.values()),'Exact credential-free environment required')
    need(env['HOME']==str(raw/'home') and env['TMPDIR']==str(raw/'tmp') and env['NPM_CONFIG_CACHE']==str(raw/'npm-cache'),'Isolated writable environment required')
    need(env['NPM_CONFIG_USERCONFIG']==str(HERE/'npm-user.npmrc') and env['NPM_CONFIG_GLOBALCONFIG']==str(HERE/'npm-global.npmrc'),'Distinct controlled npm configurations required')
    need(env['NPM_CONFIG_OFFLINE']=='true' and env['NPM_CONFIG_UPDATE_NOTIFIER']=='false','Offline setup required')
    need(env['PATH']=='/opt/homebrew/Cellar/node/24.7.0/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin' and env['LANG']=='en_US.UTF-8' and env['LC_ALL']=='C','Pinned setup search path/locale required')
    need(pathlib.Path('/opt/homebrew/bin/npm').resolve()==pathlib.Path(tools['npm']['path']),'Ambient npm does not select pinned executable')
    need(isinstance(b['protectedRoots'],list) and b['protectedRoots'],'Explicit protected inputs required')
    for p in b['protectedRoots']:canonical(p)
    raw.mkdir();[p.mkdir() for p in [raw/'home',raw/'tmp',raw/'npm-cache']]
    (raw/'BINDING.json').write_bytes(binding.read_bytes())
    save(raw/'ENTRY.json',{'pid':os.getpid(),'startedUtc':now.isoformat(),'deadlineUtc':deadline.isoformat(),'executionDeadlineUtc':execution_deadline.isoformat(),'maxCommandMs':300000,'captureBytes':MAX_BYTES,'exitReserveSeconds':30})
    def command(label,args,cap=300000,until=execution_deadline):
        current();return base.owned(owner,raw/label,args,str(source),env,until,min(cap,300000),MAX_BYTES)
    def files(root):
        values={}
        for parent,dirs,names in os.walk(root,followlinks=False):
            for name in dirs+names:need(not (pathlib.Path(parent)/name).is_symlink(),'Package symlink refused')
            for name in names:
                current(final=True);p=pathlib.Path(parent)/name;need(p.is_file(),'Regular package file required');values[p.relative_to(root).as_posix()]=sha(p)
        return values
    def capture(label):
        values={'manifest':sha(HERE/'CONTROL_MANIFEST.json'),'binding':sha(binding),'retainedBinding':sha(raw/'BINDING.json'),
          'archive':sha(archive),'cutRecord':sha(cut),'bootstrap':files(bootstrap)}
        for row in manifest['controls']:values['control:'+row['path']]=sha(HERE/row['path'])
        for row in read(HERE/'INPUTS.json')['files']:
            current(final=True);p={'controlSourceRoot':source,'retainedControlRoot':retained}[row['root']]/row['path'];values['input:'+str(p)]=sha(p)
        for key,row in tools.items():values['tool:'+key]=sha(row['path'])
        values['npmTree']=owner.inventory(pathlib.Path(tools['npm']['path']).parent.parent)
        current(final=True)
        values['sourceHead']=base.owned(owner,raw/(label+'-source-head'),['git','-C',str(source),'rev-parse','HEAD'],str(source),env,deadline,10000,MAX_BYTES).strip()
        values['sourceDiff']=base.owned(owner,raw/(label+'-source-clean'),['git','-C',str(source),'diff','--quiet',b['controlSourceCommit'],'--','build_tenants/abiogenesis/typescript'],str(source),env,deadline,10000,MAX_BYTES)
        current(final=True);save(raw/('INPUTS_'+label+'.json'),values);return values
    baseline=None;failure=None;cleanup=[];handoff=None
    try:
        baseline=capture('ENTRY');current()
        need('sha256:'+baseline['archive']==c['archiveSha256'],'Archive identity differs')
        need(baseline['cutRecord']==c['cutRecordSha256'],'Cut record differs')
        need(hashlib.sha256(json.dumps(baseline['npmTree'],sort_keys=True,separators=(',',':')).encode()).hexdigest()==tool_pins['npmTree']['sha256'],'Pinned npm module tree differs')
        cut_value=read(cut);need(cut_value['stage']=='prospective_candidate_preparation' and cut_value['version']==c['packageVersion'],'Wrong cut stage/version')
        need(cut_value['source']['commit']==c['sourceCommit'] and cut_value['source']['tree']==c['compileInputTree'] and cut_value['archive']['sha256']==baseline['archive'],'Cut source/tree/archive join differs')
        need(baseline['bootstrap']['product-toolchain-manifest.json']==c['manifestSha256'],'Bootstrap manifest differs')
        expected={}
        with tarfile.open(archive,'r:gz') as tar:
            for member in tar.getmembers():
                if member.isdir():continue
                current();name=member.name.removeprefix('package/')
                need(member.name.startswith('package/') and member.isfile() and name not in expected and '..' not in pathlib.PurePosixPath(name).parts,'Unsupported archive member')
                expected[name]=hashlib.sha256(tar.extractfile(member).read()).hexdigest()
        need(expected==baseline['bootstrap'],'Exact archive/bootstrap correspondence required before Product imports')
        save(raw/'ARCHIVE_MEMBERS.json',{'archiveSha256':baseline['archive'],'files':expected})
        need(baseline['sourceHead']==b['controlSourceCommit'],'Maintained source HEAD differs')
        external=sorted(set([str(source),str(HERE),str(retained),str(bootstrap),str(archive),str(raw),*b['protectedRoots']]))
        planned={'worksite':str(worksite),'writePaths':[str(worksite/'.abiogenesis/workspace-manifest.json')],'protectedRoots':external,'archiveRoot':str(raw)}
        save(raw/'PLANNED_LAYOUT.json',planned)
        observed=json.loads(command('planned-topology',[tools['python']['path'],str(retained/'physical-topology.py'),str(raw/'PLANNED_LAYOUT.json')],30000))
        need(observed.get('ok') is True and observed.get('disposition')=='separated','Planned physical topology refused')
        # Inner groups must reach their deadline before the enclosing 300s host can time out.
        runtime_binding={**b,'hostDeadlineUtc':min(execution_deadline,dt.datetime.now(dt.timezone.utc)+dt.timedelta(seconds=285)).isoformat()}
        save(raw/'HOST_BINDING.json',runtime_binding)
        command('public-setup-host',[tools['node']['path'],str(HERE/'setup-only.mjs'),str(raw/'HOST_BINDING.json')])
        handoff=read(raw/'public-setup/HANDOFF.json');identity=read(raw/'public-setup/installed/0/identity.json')['install']
        installed=canonical(identity['installedRoot'])
        need(installed==raw/'public-setup/sandbox/installed/abg/node_modules/@abiogenesis/typescript-tenant','Actual installed package root differs')
        need(identity['artifactDigest']==c['archiveSha256'] and identity['packageVersion']==c['packageVersion'],'Admitted install subject differs')
        installed_files=files(installed);need(installed_files==expected,'Public installed package differs from candidate archive')
        save(raw/'ARCHIVE_INSTALL_CORRESPONDENCE.json',{'archiveSha256':baseline['archive'],'installedRoot':str(installed),'files':len(expected),'exactMemberSetAndBytes':True,'identityRecord':str(raw/'public-setup/installed/0/identity.json')})
        worksite_rows=owner.inventory(worksite);need([r['path'] for r in worksite_rows]==['.abiogenesis/workspace-manifest.json'],'Setup wrote an undeclared worksite file')
        save(raw/'WORKSITE_OUTPUT.json',{'rows':worksite_rows,'scope':'File bytes/link entries only; no directory metadata claim'})
        need(read(raw/'public-setup/setup-identity.json')['closeHandoff'] is not None,'Setup close handoff absent')
        need((raw/'public-setup/setup-close.json').is_file(),'Actual setup close absent')
    except Exception as error:
        failure=str(error);save(raw/'FIRST_FAILURE.json',{'reason':failure,'retry':False,'qualified':False})
    finally:
        # Reuse the same finite cleanup owner for any recorded inner group left by host interruption.
        for p in sorted((raw/'public-setup/commands').glob('*/pid.json')):
            pid=read(p)['pid'];closed=owner.cleanup(pid) if owner.group_exists(pid) else {'signals':[],'ownedProcessGroupAbsent':True}
            cleanup.append({'record':str(p),**closed})
        save(raw/'INNER_GROUP_CLEANUP.json',cleanup)
        final=None;audit_error=None
        try:final=capture('EXIT');current(final=True)
        except Exception as error:audit_error=str(error)
        mismatches=[] if baseline is None or final is None else [key for key in set(baseline)|set(final) if baseline.get(key)!=final.get(key)]
        conserved=baseline is not None and final is not None and audit_error is None and not mismatches
        passed=failure is None and conserved and all(r['ownedProcessGroupAbsent'] for r in cleanup) and time.monotonic()<end and dt.datetime.now(dt.timezone.utc)<deadline
        save(raw/'RETURN.json',{'status':'passed' if passed else 'failed','firstFailure':failure,'inputConserved':conserved,
          'mismatches':mismatches,'exitAuditError':audit_error,'innerCleanup':cleanup,'handoff':handoff if passed else None,
          'deadlineUtc':b['deadlineUtc'],'qualified':False,'providerCalls':0,'lifecycleCalls':0,'retry':False,
          'scope':'One actual Public setup and closed event resource; exact declared inputs conserved. No qualification/publication/Run result.'})
        need(passed,'Setup or final custody failed; preserve evidence and return to Root')
if __name__=='__main__':main()
