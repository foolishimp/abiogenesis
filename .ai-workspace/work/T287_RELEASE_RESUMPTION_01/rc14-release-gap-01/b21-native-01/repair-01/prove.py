#!/usr/bin/env python3
"""One finite external proof campaign after the one successful native return.
No source repair, provider call, automatic retry or source-tree build.
"""
import datetime
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tarfile
import time

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ACT = json.loads((HERE/'ACTIVATION.json').read_text())
SOURCE = Path(ACT['sourceWorktree'])
RAW = Path(ACT['rawRoot'])
REL = Path('build_tenants/abiogenesis/typescript')
NODE = '/opt/homebrew/bin/node'


def module(name, filename):
    spec = importlib.util.spec_from_file_location(name, HERE/filename)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


owner = module('proof_process_owner', 'process-owner.py')
deps = module('proof_dependencies', 'dependency-inputs.py')
custody = module('proof_setup_custody', 'setup-custody.py')
write = owner.write
sha = lambda data: hashlib.sha256(data).hexdigest()


def source_inventory(head):
    git = lambda *args: subprocess.check_output(['/usr/bin/git','-C',str(SOURCE),*args])
    assert git('rev-parse','HEAD').decode().strip() == head
    tracked = [p.decode() for p in git('ls-files','-z').split(b'\0') if p]
    untracked = [p.decode() for p in git('ls-files','--others','--exclude-standard','-z').split(b'\0') if p]
    changed = [p.decode() for p in git('diff','--name-only','HEAD','-z').split(b'\0') if p] + untracked
    setup_owned = custody.verify(SOURCE, RAW, head)
    assert setup_owned['path'] in changed, 'exact setup-owned addition must remain visible'
    native_changed = [path for path in changed if path != setup_owned['path']]
    allowed = ACT['nativeWriteScope']
    assert all(any(path == root or path.startswith(root+'/') for root in allowed) for path in native_changed), native_changed
    assert git('diff','--name-only','--cached','-z') == b'', 'native Writer must not stage changes'
    rows = []
    for path in sorted(set(tracked+untracked)):
        file = SOURCE/path
        if not file.exists():
            continue
        assert file.is_file() and not file.is_symlink(), path
        data = file.read_bytes()
        rows.append({'path':path,'bytes':len(data),'sha256':sha(data)})
    current = {r['path']:r for r in rows}
    preimage = json.loads((RAW/'SOURCE_PREIMAGE.json').read_text())
    assert preimage['head'] == head
    for row in preimage['rows']:
        if row['path'] not in changed:
            assert current.get(row['path'],{}).get('sha256') == row['sha256'], row['path']
    assert any(path.endswith('t293-b21-owner-boundaries.test.mjs') for path in changed), 'new actual-owner discriminator required'
    return {'head':head,'changedPaths':sorted(set(changed)),'nativeChangedPaths':sorted(set(native_changed)),
            'setupOwnedChanges':[setup_owned],'rows':rows}


def native_inventory(root):
    root = Path(root)/'build/native'
    assert root.is_dir()
    rows = []
    for file in sorted(root.rglob('*')):
        assert not file.is_symlink()
        if file.is_file():
            data=file.read_bytes()
            rows.append({'path':str(file.relative_to(root)),'bytes':len(data),'sha256':sha(data)})
    assert any(r['path'].endswith('.node') for r in rows), 'native binary required'
    return rows


def main():
    assert len(sys.argv)==2, 'explicit Root launch packet path required'
    launch=json.loads(Path(sys.argv[1]).read_text())
    assert launch['activationId']==ACT['id'] and launch['dispatchAuthorized'] is True
    head=launch['sourceHead']
    host=json.loads((RAW/'HOST_RETURN.json').read_text())
    final=json.loads((RAW/'runtime/FINAL.json').read_text())
    native=json.loads((RAW/'runtime/NATIVE_RETURN.json').read_text())
    assert host['exitCode']==0 and host['stopReason'] is None and host['cleanup']['hostProcessGroupAbsent']
    assert final['launched'] and final['actualResourceClose'] and final['failure'] is None and final['readbackFailure'] is None
    assert native['ownerOutput']['outcomeKind']=='result' and (RAW/'runtime/FRESH_READBACKS.json').is_file()
    proof=RAW/'proof-01'
    proof.mkdir()
    started=time.monotonic()
    started_utc=datetime.datetime.now(datetime.timezone.utc)
    control_start=json.loads((RAW/'CONTROL_START.json').read_text())
    assert control_start['sourceHead']==head
    original_host_deadline=datetime.datetime.fromisoformat(control_start['deadlineUtc'])
    assert original_host_deadline.tzinfo is not None
    requested_deadline=started_utc+datetime.timedelta(milliseconds=ACT['limits']['proofCampaignMs'])
    effective_deadline=min(original_host_deadline,requested_deadline)
    # The command owner has at most 5s TERM + 5s KILL + 5s final wait.
    # Keep that finite cleanup inside both the original host and proof bounds.
    cleanup_reserve_seconds=15
    execution_stop=effective_deadline-datetime.timedelta(seconds=cleanup_reserve_seconds)
    deadline=started+(execution_stop-started_utc).total_seconds()
    clock={'startedUtc':started_utc.isoformat(),'originalHostDeadlineUtc':original_host_deadline.isoformat(),
           'requestedProofDeadlineUtc':requested_deadline.isoformat(),'deadlineUtc':effective_deadline.isoformat(),
           'executionStopDeadlineUtc':execution_stop.isoformat(),'cleanupReserveMs':cleanup_reserve_seconds*1000}
    commands=[]
    postimage=None
    try:
        write(proof/'START.json',{'sourceHead':head,**clock,
              'campaignMs':ACT['limits']['proofCampaignMs'],'retry':False,'qualified':False})
        assert time.monotonic()<deadline,'insufficient original host/proof deadline for execution and finite cleanup'
        postimage=source_inventory(head)
        write(proof/'SETUP_CUSTODY_VERIFICATION.json',{'verified':True,'setupOwnedChanges':postimage['setupOwnedChanges']})
        write(proof/'SOURCE_POSTIMAGE.json',postimage)
        write(proof/'SOURCE_BINDING.json',{'sourceHead':head,'sourcePostimageSha256':sha((proof/'SOURCE_POSTIMAGE.json').read_bytes())})
        dependency=json.loads((HERE/'DEPENDENCY_INPUTS.json').read_text())
        assert deps.inventory(dependency['path'])['sha256']==dependency['inventorySha256']
        assert sha((SOURCE/REL/'package-lock.json').read_bytes())==dependency['lockSha256']
        subject=proof/'subject'
        subject.mkdir()
        for name in ['AGENTS.md','CLAUDE.md','stdo_abiogenesis.json']:
            if (SOURCE/name).is_file(): shutil.copy2(SOURCE/name,subject/name)
        shutil.copytree(SOURCE/'specification',subject/'specification')
        tenant=subject/REL
        tenant.parent.mkdir(parents=True)
        shutil.copytree(SOURCE/REL,tenant,ignore=shutil.ignore_patterns('node_modules','build','artifacts','qualification-scratch'))
        shutil.copytree(dependency['path'],tenant/'node_modules',symlinks=True)
        assert deps.inventory(tenant/'node_modules')['sha256']==dependency['inventorySha256']
        fixture=json.loads((HERE/'PROOF_FIXTURE_INPUTS.json').read_text())
        for row in fixture['files']:
            original=SOURCE/row['path']; destination=subject/row['path']
            assert original.is_file() and not original.is_symlink() and sha(original.read_bytes())==row['sha256']
            destination.parent.mkdir(parents=True,exist_ok=True)
            shutil.copy2(original,destination)
            assert sha(destination.read_bytes())==row['sha256']
        write(proof/'FIXTURE_INPUTS_VERIFIED.json',{'recordSha256':sha((HERE/'PROOF_FIXTURE_INPUTS.json').read_bytes()),'files':len(fixture['files']),'bytes':fixture['bytes']})
        native_reuse=json.loads((HERE/'NATIVE_REUSE_INPUTS.json').read_text())
        prior=native_reuse['priorReproduction']
        assert sha(Path(prior['path']).read_bytes())==prior['sha256']
        prior_reproduction=json.loads(Path(prior['path']).read_text())
        assert prior_reproduction['byteEqual'] and prior_reproduction['first']==prior_reproduction['second']==native_reuse['payload']
        for row in native_reuse['sourceInputs']:
            assert sha((SOURCE/row['path']).read_bytes())==row['sha256'],row['path']
        scratch=proof/'scratch'
        for name in ['tmp','npm-cache']: (scratch/name).mkdir(parents=True)
        (scratch/'user.npmrc').write_text('')
        (scratch/'global.npmrc').write_text('')
        environment={'HOME':'/Users/jim','PATH':'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin','LANG':'en_US.UTF-8','LC_ALL':'en_US.UTF-8',
                     'TMPDIR':str(scratch/'tmp'),'NODE_OPTIONS':'','GIT_OPTIONAL_LOCKS':'0','STDO_STORE':'/Users/jim/Library/Application Support/STDO',
                     'NPM_CONFIG_OFFLINE':'true','NPM_CONFIG_UPDATE_NOTIFIER':'false','NPM_CONFIG_USERCONFIG':str(scratch/'user.npmrc'),
                     'NPM_CONFIG_GLOBALCONFIG':str(scratch/'global.npmrc'),'NPM_CONFIG_CACHE':str(scratch/'npm-cache')}
        def run(name,argv,cwd=tenant,limit=None):
            assert shutil.disk_usage(RAW).free>ACT['limits']['reserveBytes'],'free-space reserve'
            result=owner.run(proof/name,argv,cwd,environment,(limit or ACT['limits']['perBuildMs'])/1000,
                             ACT['limits']['outputBytesPerCommand'],deadline)
            commands.append({'name':name,'exitCode':result['exitCode'],'elapsedMs':result['elapsedMs']})
            print(json.dumps({'phase':'proof-command-return','name':name,'exitCode':result['exitCode'],'elapsedMs':result['elapsedMs']}),flush=True)
            return result
        inputs=json.loads((tenant/'scripts/native-build-inputs.json').read_text())
        assert isinstance(inputs.get('inputFiles'),list) and inputs['inputFiles'],'explicit actual native closure required'
        for row in inputs['inputFiles']:
            assert os.path.isabs(row['path']) and sha(Path(row['path']).read_bytes())==row['sha256'],row
        write(proof/'NATIVE_INPUT_IDENTITY.json',{'recordSha256':sha((tenant/'scripts/native-build-inputs.json').read_bytes()),'inputFiles':inputs['inputFiles']})
        host_libraries=json.loads((HERE/'NATIVE_HOST_OBSERVATIONS.json').read_text())
        def verify_host_libraries(label):
            rows=[]
            for row in host_libraries['rows']:
                path=Path(row['path']);data=path.read_bytes()
                assert str(path.resolve())==row['resolvedPath'] and len(data)==row['bytes'] and sha(data)==row['sha256'],row['path']
                rows.append(row)
            result={'observation':label,'observedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    'recordSha256':sha((HERE/'NATIVE_HOST_OBSERVATIONS.json').read_bytes()),'rows':rows,
                    'scope':'extra3 actual host libraries; separate from193 declared rows; not complete native closure'}
            write(proof/('NATIVE_HOST_LIBRARIES_'+label+'.json'),result)
        run('001-native-input-verification',[NODE,'scripts/build-native.mjs','--verify-inputs'])
        verify_host_libraries('BEFORE_BUILD')
        run('002-candidate-build',['/opt/homebrew/bin/npm','run','build'])
        verify_host_libraries('AFTER_BUILD')
        def test(name,filename):
            run(name,[NODE,'--experimental-vm-modules','--test','--test-concurrency=1','--test-timeout=590000',
                      '--test-reporter=./scripts/node-test-evidence-reporter.mjs','test_env/tests/'+filename],limit=ACT['limits']['perTestFileMs'])
            rows=[json.loads(line) for line in (proof/name/'stdout.raw').read_text().splitlines() if line]
            summaries=[r for r in rows if r.get('type')=='summary' and r.get('file') is None]
            assert len(summaries)==1 and summaries[0]['success'] is True, summaries
            cases=[r for r in rows if r.get('type')=='case' and not r.get('suite')]
            assert cases and all(r['passed'] or r.get('skip') or r.get('todo') for r in cases)
            # Reporter may omit false gate fields. Use actual truthy gate values;
            # never demand a literal skip:false or count skipped rows as proof.
            counts=summaries[0]['counts']
            write(proof/name/'COUNTS.json',{'file':filename,'summary':summaries[0],'cases':cases})
            if filename=='t293-b21-owner-boundaries.test.mjs':
                assert counts['skipped']==0 and counts['todo']==0,'required new actual-owner discriminator did not execute wholly'
        # Earliest whole-file bug discriminator; no regex filtering/repetition.
        test('003-first-owner-boundaries','t293-b21-owner-boundaries.test.mjs')
        current_native=native_inventory(tenant)
        assert current_native==native_reuse['payload'],'native payload changed from preserved byte-equal pair; return for new selection'
        write(proof/'NATIVE_REUSE_VERIFIED.json',{'recordSha256':sha((HERE/'NATIVE_REUSE_INPUTS.json').read_bytes()),'sourceInputsConserved':True,'priorReproductionSha256':prior['sha256'],'current':current_native,'byteEqualToPriorPair':True,'scope':'native component identity only; no new reproduction/closure qualification'})
        archives=proof/'archives';archives.mkdir()
        run('005-pack',[NODE,'scripts/product-payload.mjs','pack',str(archives)])
        archive_files=list(archives.glob('*.tgz'));assert len(archive_files)==1
        archive=archive_files[0]
        install=proof/'installed';install.mkdir()
        (install/'package.json').write_text('{"private":true}\n')
        run('006-offline-install',['/opt/homebrew/bin/npm','install','--offline','--ignore-scripts','--omit=dev','--no-package-lock','--no-audit','--no-fund',str(archive)],cwd=install)
        installed=install/'node_modules/@abiogenesis/typescript-tenant'
        expected=[]
        with tarfile.open(archive,'r:gz') as tar:
            for member in tar.getmembers():
                if member.isdir(): continue
                assert member.isfile() and member.name.startswith('package/'),member.name
                relative=member.name[len('package/'):]
                assert '..' not in Path(relative).parts and not relative.startswith('/')
                data=tar.extractfile(member).read()
                assert (installed/relative).read_bytes()==data,relative
                expected.append(relative)
        actual=[str(p.relative_to(installed)) for p in installed.rglob('*') if p.is_file()]
        assert sorted(expected)==sorted(actual),'installed/archive file inventory differs'
        write(proof/'CANDIDATE.json',{'archive':str(archive),'archiveSha256':sha(archive.read_bytes()),'archiveBytes':archive.stat().st_size,
              'installed':str(installed),'files':len(expected),'byteEqual':True,'manifestSha256':sha((installed/'product-toolchain-manifest.json').read_bytes()),'native':native_inventory(installed),'qualified':False})
        run('007-installed-physical-owner',[NODE,str(HERE/'check-installed.mjs'),str(tenant),str(installed)])
        files=['t293-b21-physical-confinement.test.mjs', 't292-td85n-absent-protected-root.test.mjs', 't292-td85a-stored-spelling.test.mjs', 't287-c0-post-publication-failure.test.mjs', 't287-c0-post-publication-failure-owner-admission-close.test.mjs', 't287-worksite-command-execution.test.mjs', 't287-default-library.test.mjs', 't287-native-semantic-job.test.mjs']
        for ordinal,filename in enumerate(files,8):
            test(f'{ordinal:03d}-'+filename.removesuffix('.test.mjs'),filename)
        for row in inputs['inputFiles']:
            assert sha(Path(row['path']).read_bytes())==row['sha256'],row
        assert deps.inventory(dependency['path'])['sha256']==dependency['inventorySha256']
        for row in native_reuse['sourceInputs']:
            assert sha((SOURCE/row['path']).read_bytes())==row['sha256'],row['path']
        verify_host_libraries('AT_RETURN')
        assert source_inventory(head)==postimage,'source changed during proof'
        assert time.monotonic()<=deadline+cleanup_reserve_seconds,'original host/proof deadline elapsed before return'
        write(proof/'RETURN.json',{'ok':True,'commands':commands,'elapsedMs':round((time.monotonic()-started)*1000),
              'retries':0,'sourceHead':head,'sourceUnchanged':True,'qualified':False,**clock,
              'limits':['Explicit live-provider/fixture gates remain skips, not closed proof; actual gate fields are recorded.','Native binary/proof platform is Darwin arm64 on Node24.7.0; no Node20 execution claim.','Generated qualification inventories remain for composed-source refresh.','B32 native closure remains separate:193 declared rows and3 extra observed host libraries are distinct claims.']})
    except Exception as error:
        write(proof/'FIRST_FAILURE.json',{'errorType':type(error).__name__,'message':str(error),'commandsCompleted':commands,
              'elapsedMs':round((time.monotonic()-started)*1000),'retry':False,'qualified':False,**clock})
        print(json.dumps({'phase':'proof-first-failure','message':str(error)}),flush=True)
        raise


if __name__ == '__main__':
    main()
