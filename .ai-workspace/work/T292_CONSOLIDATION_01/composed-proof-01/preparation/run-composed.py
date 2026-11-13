#!/usr/bin/env python3
"""T292 only: serial existing tests or matched existing history probes.
Adapted from RC11 proof-01/proof.py and UAT commandRecorder supervision.
No builds, dependency installation, provider execution, or automatic retry.
"""
import argparse, datetime, hashlib, json, os, re, shutil, signal, subprocess, sys, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
TENANT = 'build_tenants/abiogenesis/typescript'
EVIDENCE = '/Users/jim/src/apps/abiogenesis/.ai-workspace'
CAMPAIGN_MS = 21_600_000
SAFE_ENV = {'ABI5_TD77_EXPECT_RECORDED_ONLY', 'ABI5_HS03_STREAM_METADATA',
            'ABI5_HC1_BASELINE_PACKAGE_PATH', 'ABI5_CONSOLIDATION_INPUTS',
            'ABI5_PUBLIC_GROUPS_PACKAGE_ROOT', 'ABI5_PUBLIC_GROUPS_BASELINE'}
CROSS = ['t292-td32-legacy-store-door', 't292-td32-current-profile-pin',
         't292-td77-recorded-product-truth', 'witness-run-stopped-definition-binding',
         'witness-reprice-definition-binding', 'r10-child-proof',
         't287-historical-source-resource', 't287-cross-cut-public-read']

def demand(value, message):
    if not value: raise RuntimeError(message)
def utc(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
def digest(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024*1024), b''): h.update(chunk)
    return h.hexdigest()
def pin(path):
    p = Path(path); before = p.stat(); value = digest(p); after = p.stat()
    demand((before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns,before.st_ctime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns,after.st_ctime_ns), 'file changed while hashing: '+str(p))
    return {'path': str(p), 'bytes': after.st_size, 'sha256': value}
def checked(row):
    p = Path(row['path']); demand(p.is_file(), 'missing pinned file: '+str(p))
    actual = pin(p)
    demand(actual['sha256'] == row['sha256'], 'digest mismatch: '+str(p))
    if 'bytes' in row: demand(actual['bytes'] == row['bytes'], 'size mismatch: '+str(p))
    return p
def save(path, value):
    with Path(path).open('x') as stream: json.dump(value, stream, indent=2); stream.write('\n')
def relative(value):
    p = Path(value); demand(not p.is_absolute() and '..' not in p.parts and '.' not in p.parts, 'unsafe relative path')
    return p
def finite(value, label):
    demand(isinstance(value, int) and not isinstance(value, bool) and value > 0, label+' must be a positive integer')
    return value
def host_boot_identity():
    demand(sys.platform == 'darwin', 'this campaign clock is bound to the selected Darwin host')
    boot = subprocess.check_output(['/usr/sbin/sysctl','-n','kern.bootsessionuuid'],
                                   env={'PATH':'/usr/bin:/bin:/usr/sbin'},timeout=5,text=True).strip().lower()
    demand(bool(re.fullmatch(r'[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}',boot)), 'boot-session identity unavailable')
    info = time.get_clock_info('monotonic')
    demand(info.monotonic and not info.adjustable, 'a non-adjustable monotonic clock is required')
    return {'hostname':os.uname().nodename,'bootSessionUuid':boot,'clockImplementation':info.implementation}

def create_campaign(args):
    demand(args.campaign_path and args.campaign_id and args.root_ruling, 'campaign path/id and exact Root ruling required')
    path = Path(args.campaign_path)
    demand(path.is_absolute() and path.parent.is_dir() and not path.exists(), 'campaign clock must be created once at a new absolute path')
    identity = host_boot_identity(); start = time.monotonic_ns()
    clock = {'kind':'t292.shared-monotonic-campaign','campaignId':args.campaign_id,'rootRuling':args.root_ruling,
             'overallMs':CAMPAIGN_MS,'hostBoot':identity,'startMonotonicNs':start,
             'deadlineMonotonicNs':start+CAMPAIGN_MS*1_000_000,'createdAtUtc':utc(),
             'standing':'One shared execution ceiling for broad, history and external physical reads; UTC is receipt time only. No extension or retry.'}
    save(path,clock)
    print(json.dumps({'campaign':pin(path),'campaignId':args.campaign_id,'clock':clock}),flush=True)
    return 0

def read_campaign(c):
    clock = json.loads(checked(c['campaign']).read_text())
    demand(clock['kind']=='t292.shared-monotonic-campaign' and clock['campaignId']==c['campaignId'], 'campaign identity differs')
    demand(clock['rootRuling'] and clock['overallMs']==c['limits']['overallMs']==CAMPAIGN_MS, 'campaign ceiling must be exactly 21600000ms')
    start = finite(clock['startMonotonicNs'],'campaign start'); deadline = finite(clock['deadlineMonotonicNs'],'campaign deadline')
    demand(deadline-start==CAMPAIGN_MS*1_000_000, 'campaign deadline/start interval differs')
    demand(clock['hostBoot']==host_boot_identity(), 'campaign clock belongs to another host/boot/clock')
    now = time.monotonic_ns()
    demand(start<=now<deadline, 'campaign clock is future-dated or expired')
    return clock

def git(root, *args):
    env = {'PATH': '/usr/bin:/bin', 'HOME': os.environ.get('HOME','/Users/jim'), 'GIT_OPTIONAL_LOCKS': '0'}
    return subprocess.check_output(['/usr/bin/git', '-C', str(root), *args], env=env, timeout=20, text=True).strip()
def source_check(c):
    root = Path(c['subject']['worktree']); s = c['subject']
    demand(git(root, 'rev-parse', 'HEAD') == s['commit'], 'final source commit changed')
    demand(git(root, 'rev-parse', 'HEAD^{tree}') == s['tree'], 'final source tree changed')
    demand(not git(root, 'status', '--porcelain=v1', '--untracked-files=no'), 'tracked final source is dirty')
    demand(git(root, 'rev-parse', '--abbrev-ref', 'HEAD') == 'HEAD', 'suite worktree must be detached')

def inventory_check(root, rows):
    root = Path(root); demand(root.is_dir() and not root.is_symlink(), 'inventory root must be a physical directory')
    wanted = set()
    for row in rows:
        p = root / relative(row['path']); wanted.add(row['path'])
        if row['kind'] == 'symlink':
            demand(p.is_symlink() and os.readlink(p) == row['target'], 'dependency link differs: '+str(p))
            demand(p.resolve().is_relative_to(root.resolve()), 'dependency link escapes physical root: '+str(p))
        else:
            demand(row['kind'] == 'file' and not p.is_symlink(), 'invalid inventory file: '+str(p))
            checked({**row, 'path': str(p)})
            if 'executable' in row: demand(bool(p.stat().st_mode & 0o111) == row['executable'], 'mode differs: '+str(p))
    actual = set()
    for parent, dirs, files in os.walk(root, followlinks=False):
        for name in dirs[:]:
            p = Path(parent)/name
            if p.is_symlink(): actual.add(p.relative_to(root).as_posix()); dirs.remove(name)
        actual.update((Path(parent)/name).relative_to(root).as_posix() for name in files)
    demand(actual == wanted, 'inventory membership changed')

def environment(c, tmp, file=None):
    # No arbitrary inherited environment and no provider opt-in passthrough.
    env = {k: os.environ[k] for k in ['HOME','USER','LOGNAME','SHELL','LANG','LC_ALL'] if k in os.environ}
    env.update(PATH=c['path'], TMPDIR=str(tmp), NODE_OPTIONS='', NODE_PATH='', FORCE_COLOR='0',
               ABI5_EVIDENCE_ROOT=EVIDENCE, ABI5_TESTING_MODE='mechanical',
               npm_config_offline='true', npm_config_audit='false', npm_config_fund='false',
               npm_config_update_notifier='false', npm_config_cache=str(tmp/'npm-cache'),
               npm_config_userconfig=str(tmp/'npm-user.npmrc'), npm_config_globalconfig=str(tmp/'npm-global.npmrc'))
    values = c.get('perFileEnvironment', {}).get(file, {})
    demand(set(values) <= SAFE_ENV and all(isinstance(v,str) for v in values.values()), 'unapproved file environment')
    env.update(values)
    return env

# Ownership is observed by PID + start-time and ancestry; no system-wide kill.
def processes():
    out = subprocess.check_output(['/bin/ps','-axo','pid=,ppid=,pgid=,stat=,lstart=,comm='], timeout=5, text=True)
    rows = {}
    for line in out.splitlines():
        parts = line.split(None,9)
        if len(parts) != 10: continue
        pid,ppid,pgid = map(int,parts[:3]); rows[pid] = {'pid':pid,'ppid':ppid,'pgid':pgid,'state':parts[3],
                'started':' '.join(parts[4:9]),'command':parts[9]}
    return rows

def observe(child, owned, log):
    rows = processes(); added = []
    for _ in range(64):
        changed = False
        for pid,row in rows.items():
            parent = rows.get(row['ppid']); parent_owned = parent and (parent['pid'],parent['started']) in owned
            root_starts = {start for known_pid,start in owned if known_pid == child.pid}
            reused_root = pid == child.pid and root_starts and row['started'] not in root_starts
            if not reused_root and (pid == child.pid or row['pgid'] == child.pid or parent_owned):
                key = (pid,row['started'])
                if key not in owned:
                    owned[key] = row; added.append(row); changed = True
        if not changed: break
    alive = [row for row in rows.values() if (row['pid'],row['started']) in owned]
    with log.open('a') as stream: stream.write(json.dumps({'at':utc(),'added':added,'alive':alive})+'\n')
    return alive

def cleanup(child, owned, log, limits):
    sent = []; errors = []
    for sig,grace in [(signal.SIGTERM,limits['termGraceMs']), (signal.SIGKILL,limits['killGraceMs'])]:
        alive = observe(child,owned,log)
        if not alive: break
        # Children before the direct parent; do not signal an unobserved PID.
        for row in sorted(alive,key=lambda r:r['pid'] == child.pid):
            fresh = processes().get(row['pid'])
            if not fresh or fresh['started'] != row['started']: continue
            try: os.kill(row['pid'],sig); sent.append({'at':utc(),'pid':row['pid'],'started':row['started'],'signal':sig.name})
            except ProcessLookupError: pass
            except OSError as exc: errors.append(str(exc))
        until = time.monotonic()+grace/1000
        while time.monotonic()<until:
            child.poll()
            if not observe(child,owned,log): break
            time.sleep(min(.2,max(0,until-time.monotonic())))
    child.poll(); return {'signals':sent,'errors':errors,'remainingObserved':observe(child,owned,log)}

def command(c, root, label, argv, timeout_ms, env, deadline, cwd):
    demand(time.monotonic() < deadline, 'whole-pass deadline reached before '+label)
    out = root/label; out.mkdir(); began = time.monotonic(); started = utc()
    remaining = int((deadline-began)*1000)
    demand(remaining >= timeout_ms, 'remaining whole-pass budget is below the selected file allowance: '+label)
    effective = timeout_ms
    request = {'argv':argv,'cwd':str(cwd),'started':started,'selectedTimeoutMs':timeout_ms,
               'effectiveTimeoutMs':effective,'wholeDeadlineLimitsCommand':effective<timeout_ms,'environment':env,
               'subject':c['subject'],'campaign':c['campaign'],'campaignId':c['campaignId']}
    save(out/'request.json',request)
    owned = {}; reason = None; observation_error = None; child = None
    ancestry = out/'ancestry.jsonl'; stdout = out/'stdout.raw'; stderr = out/'stderr.raw'
    next_report = began
    with stdout.open('xb') as output, stderr.open('xb') as error:
        child = subprocess.Popen(argv,cwd=cwd,env=env,stdin=subprocess.DEVNULL,stdout=output,stderr=error,start_new_session=True)
        save(out/'launch.json',{'at':utc(),'pid':child.pid,'pgid':child.pid})
        try:
            while True:
                observe(child,owned,ancestry)
                rc = child.poll(); now = time.monotonic()
                if rc is not None: break
                if now >= deadline: reason = 'shared_campaign_deadline'; break
                if now-began >= effective/1000: reason = 'timeout'; break
                if stdout.stat().st_size+stderr.stat().st_size>c['limits']['maxOutputBytes']: reason = 'output_limit'; break
                if now >= next_report:
                    print(json.dumps({'at':utc(),'running':label,'pid':child.pid,'elapsedSeconds':round(now-began,1)}),flush=True)
                    next_report = now+30
                time.sleep(c['limits']['pollMs']/1000)
        except BaseException as exc:
            reason = 'interrupted_or_observation_failed'; observation_error = repr(exc)
        try:
            alive = observe(child,owned,ancestry); cleanup_needed = bool(alive)
            clean = cleanup(child,owned,ancestry,c['limits']) if cleanup_needed else {'signals':[],'errors':[],'remainingObserved':[]}
        except BaseException as exc:
            cleanup_needed = True; clean = {'signals':[],'errors':[repr(exc)],'remainingObserved':'unknown'}
            # Popen still owns its direct child even if ps observation failed.
            for sig,grace in [(signal.SIGTERM,c['limits']['termGraceMs']), (signal.SIGKILL,c['limits']['killGraceMs'])]:
                if child.poll() is not None: break
                try:
                    child.send_signal(sig); clean['signals'].append({'at':utc(),'pid':child.pid,'signal':sig.name,'ownership':'direct Popen child; descendant state unknown'})
                    child.wait(timeout=grace/1000)
                except subprocess.TimeoutExpired: pass
                except OSError as direct_error: clean['errors'].append(repr(direct_error))
        try: rc = child.wait(timeout=1)
        except subprocess.TimeoutExpired: rc = None
    ended = utc(); raw = {'stdout':pin(stdout),'stderr':pin(stderr)}
    exceeded = raw['stdout']['bytes']+raw['stderr']['bytes']>c['limits']['maxOutputBytes']
    passed = rc==0 and reason is None and not exceeded and not cleanup_needed and not clean['errors']
    result = {'label':label,'started':started,'ended':ended,'wallMs':round((time.monotonic()-began)*1000),
              'exitCode':rc,'signal':-rc if rc is not None and rc<0 else None,'stopReason':reason,
              'outputLimitExceeded':exceeded,'rawStreams':raw,'cleanupNeeded':cleanup_needed,'cleanup':clean,
              'observationError':observation_error,'observedOwnershipCount':len(owned),
              'ownershipLimit':'Polling records observed ancestry only; an unobserved detached/reparented escape is not excluded.',
              'processStatus':'completed' if passed else 'failed_or_incomplete'}
    save(out/'process.json',result)
    demand(passed, 'command failed/incomplete: '+label)
    return out,result

def tap_result(path):
    text = Path(path).read_text(errors='replace')
    counts = {k:int(v) for k,v in re.findall(r'^# (tests|pass|fail|cancelled|skipped|todo) (\d+)\s*$',text,re.M)}
    complete = 'TAP version 13' in text and bool(re.search(r'^1\.\.\d+\s*$',text,re.M)) and set(counts)=={'tests','pass','fail','cancelled','skipped','todo'}
    passed = complete and counts['tests']>0 and counts['fail']==counts['cancelled']==counts['todo']==0
    return {'complete':complete,'counts':counts,'status':'completed' if passed else 'failed_or_incomplete',
            'skipLines':[x for x in text.splitlines() if re.search(r'#\s*(SKIP|TODO)\b',x,re.I)]}

def base_errors(value):
    out = []
    if isinstance(value,dict):
        for k,v in value.items():
            if k in ['error','decodeError','prefixError','threw'] and isinstance(v,str): out.append(v)
            else: out.extend(base_errors(v))
    elif isinstance(value,list):
        for v in value: out.extend(base_errors(v))
    return out

def compare_history(before,after,subject,lane):
    a={k:v for k,v in before.items() if k!='log'}; b={k:v for k,v in after.items() if k!='log'}
    prior = base_errors(a); current = base_errors(b)
    if a==b:
        return {'status':'equal_prior_refusal' if prior else 'equal_owner_result','baselineErrors':prior,'finalErrors':current}
    hits=subject['actualRetiredEventRealizations']; patterns=[]
    for kind in ['construction_intent_selected','construction_delta_observed','construction_continuation_opened']:
        if kind in hits: patterns.append(r'Unknown Event Calculus event kind '+re.escape(kind))
    if any(':continuationKind=' in k for k in hits): patterns.append(r'continuation .* has an invalid event lifecycle')
    if any(':routeKind=gap_stop' in k for k in hits): patterns.append(r'traversal route event carries unknown route kind gap_stop')
    if any(':disposition=' in k for k in hits): patterns.append(r'run stop event carries an unknown disposition')
    matched = [e for e in current if any(re.search(p,e) for p in patterns)]
    unexpected = [e for e in current if e not in matched and e not in prior]
    primary = b.get('decodeError') or b.get('prefixError') or b.get('whole' if lane=='replay' else 'truth',{}).get('error')
    accepted = bool(hits and matched and primary in matched and not unexpected)
    return {'status':'realized_retirement_refusal' if accepted else 'unexpected_owner_difference',
            'baselineErrors':prior,'finalErrors':current,'matchedRetirementErrors':matched,'unexpectedErrors':unexpected,
            'standing':'actual owner results; preliminary static classification alone supplies no pass'}

def load_config(args):
    demand(digest(args.config)==args.config_sha256, 'configuration digest mismatch')
    c=json.loads(Path(args.config).read_text())
    demand(c['status']=='ROOT_ACTIVATED_T292_COMPOSED_PROOF' and c['activationRef'], 'Root execution activation required')
    demand(c['runnerSha256']==digest(__file__), 'runner bytes differ from activation')
    demand(c['phase']==args.phase and args.phase in ['broad','history'], 'phase binding differs')
    demand(c['selectedBasis']=={'definitionSha256':'b5720642ff00ebcb47f77ae68df3a960ab70f82cd1227c0712edda9d40745f44',
        'basis':'stdo://releases/v3.0.4/','manifestSha256':'102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b'}, 'basis differs')
    demand(c['limitsRuling'] and c['subject']['commit'] and c['subject']['tree'], 'final subject/limits ruling missing')
    for key in ['overallMs','maxOutputBytes','pollMs','termGraceMs','killGraceMs','minFreeBytes','boundaryMs','historyProbeMs','nodeHeapMiB']:
        finite(c['limits'][key],key)
    campaign=read_campaign(c)
    baseline=json.loads(checked(c['history']['baseline']).read_text())
    for row in baseline['pins']: checked(row)
    demand(c['limits']['pollMs']<=1000 and c['limits']['termGraceMs']<=60000 and c['limits']['killGraceMs']<=60000,'supervision bounds too long')
    demand(isinstance(c['path'],str) and c['path'],'explicit tool PATH required')
    checked(c['node']); checked(c['subject']['artifact']); source_check(c)
    tenant=Path(c['subject']['worktree'])/TENANT
    for row in c['subject']['buildPins']:
        demand(Path(row['path']).resolve().is_relative_to(tenant.resolve()), 'build pin is outside final tenant')
        checked(row)
    demand(str(tenant/'product-toolchain-manifest.json') in {row['path'] for row in c['subject']['buildPins']}, 'final manifest pin required')
    checked(c['subject']['artifactSourceReceipt'])
    definition=tenant.parents[2]/'stdo_abiogenesis.json'
    demand(digest(definition)==c['selectedBasis']['definitionSha256'],'final Definition differs')
    inv=json.loads(checked(c['dependencyInventory']).read_text()); inventory_check(tenant/'node_modules',inv['rows'])
    population=json.loads(checked(c['population']).read_text()); files=population['files']
    demand(population['sourceCommit']==c['subject']['commit'] and population['sourceTree']==c['subject']['tree'], 'population source binding differs')
    expected=sorted('test_env/tests/'+p.name for p in (tenant/'test_env/tests').glob('*.test.mjs'))+['test_env/uat/harness.test.mjs']
    demand([r['path'] for r in files]==expected,'final population differs; refresh Root selection, do not silently add/drop')
    for r in files: checked({**r,'path':str(tenant/relative(r['path']))})
    demand(all('test_env/tests/'+name+'.test.mjs' in expected for name in CROSS),'required cross-consumer missing')
    demand(c['timeoutPopulationSha256']==c['population']['sha256'],'timeout map belongs to another population')
    audit=json.loads(checked(c['timeoutAudit']).read_text())
    demand([(r['path'],r['sha256']) for r in audit['rows']]==[(r['path'],r['sha256']) for r in files], 'timeout audit source/population changed')
    demand(set(c['fileTimeoutMs'])==set(expected),'finite timeout needed for every final file')
    prior=json.loads(checked(c['preservedTimeoutMap']).read_text())['historicalOverrides']
    for f in expected:
        finite(c['fileTimeoutMs'][f],'timeout '+f)
        demand(c['fileTimeoutMs'][f]>=prior.get(f,0),'historical per-file override dropped: '+f)
    for f,values in c.get('perFileEnvironment',{}).items():
        demand(f in expected and set(values)<=SAFE_ENV,'unexpected per-file environment')
    out=Path(c['outputRoot']); tmp=Path(c['tmpRoot'])
    demand(out.is_absolute() and tmp.is_absolute() and not out.exists() and not tmp.exists(),'output and TMPDIR must be new absolute paths')
    demand(not out.is_relative_to(Path(c['subject']['worktree'])) and not tmp.is_relative_to(Path(c['subject']['worktree'])),'evidence/TMPDIR must be outside source')
    demand(not out.is_relative_to(tmp) and not tmp.is_relative_to(out),'output and TMPDIR must be separate')
    return c,tenant,files,out,tmp,campaign

def main(args):
    def interrupted(signum, _frame): raise InterruptedError('driver received '+signal.Signals(signum).name)
    signal.signal(signal.SIGTERM,interrupted); signal.signal(signal.SIGINT,interrupted)
    c,tenant,files,out,tmp,campaign=load_config(args)
    out.mkdir(parents=True); tmp.mkdir(parents=True)
    for name in ['npm-user.npmrc','npm-global.npmrc']: (tmp/name).write_text('')
    save(out/'binding.json',{'config':pin(args.config),'runner':pin(__file__),'configuration':c,'started':utc(),'sharedCampaign':campaign,
         'standing':'bounded mechanical proof operation; no provider/live-UAT/qualification claim; shared host'})
    deadline=campaign['deadlineMonotonicNs']/1_000_000_000; summaries=[]
    def run(label,argv,timeout,file=None):
        checked(c['campaign'])
        demand(time.monotonic_ns()<campaign['deadlineMonotonicNs'], 'shared campaign expired before next command')
        demand(shutil.disk_usage(out).free>=c['limits']['minFreeBytes'],'free-space reserve')
        source_check(c)
        result=command(c,out,label,argv,timeout,environment(c,tmp,file),deadline,tenant)
        source_check(c); return result
    try:
        if args.phase=='broad':
            for key in ['imports','lifecycle','calculus']:
                scripts={'imports':'check-import-direction.mjs','lifecycle':'check-lifecycle-boundary.mjs','calculus':'check-calculus-boundary.mjs'}
                p,r=run('lint-'+key,[c['node']['path'],'--max-old-space-size='+str(c['limits']['nodeHeapMiB']),'scripts/'+scripts[key]],c['limits']['boundaryMs'])
                summaries.append({'lane':key,'status':'completed','receipt':pin(p/'process.json')})
            for i,row in enumerate(files):
                f=row['path']; argv=[c['node']['path'],'--max-old-space-size='+str(c['limits']['nodeHeapMiB']),'--experimental-vm-modules','--test','--test-concurrency=1','--test-reporter=tap',f]
                p,r=run(f'{i+1:03d}-'+Path(f).stem,argv,c['fileTimeoutMs'][f],f)
                outcome=tap_result(p/'stdout.raw'); save(p/'tap.json',outcome)
                summaries.append({'file':f,**outcome,'receipt':pin(p/'process.json')})
                save(out/f'progress-{i+1:03d}.json',summaries[-1]); print(json.dumps(summaries[-1]),flush=True)
                demand(outcome['status']=='completed','TAP failure/incomplete; stop before next file')
        else:
            h=c['history']; manifest=json.loads(checked(h['population']).read_text())
            baseline=json.loads(checked(h['baseline']).read_text())
            for row in baseline['pins']: checked(row)
            base=baseline['baseTenant']; probes={k:str(checked(v)) for k,v in h['probes'].items()}
            subjects=manifest['subjects']; by_hash={}
            for row in subjects:
                checked(row); by_hash.setdefault(row['sha256'],row)
            inputs=out/'inputs'; inputs.mkdir(); save(out/'all-path-memberships.json',manifest)
            for lane,selections in [('replay',{'retirement_replay23'}),('truth',{'retirement_truth25','td77_truth121'})]:
                selected={r['sha256'] for r in subjects if any(m['selection'] in selections for m in r['memberships'])}
                for i,sha in enumerate(sorted(selected)):
                    row=by_hash[sha]; data=inputs/(sha+'.jsonl')
                    if not data.exists():
                        shutil.copyfile(checked(row),data); demand(digest(data)==sha,'history changed during copy')
                    pair={}; receipts={}
                    for name,build in [('base',base),('final',str(tenant))]:
                        demand(digest(data)==sha,'immutable history copy changed')
                        label=f'{lane}-{i+1:03d}-{name}'
                        checked(h['probes'][lane])
                        p,_=run(label,[c['node']['path'],'--max-old-space-size='+str(c['limits']['nodeHeapMiB']),probes[lane],build,str(data)],c['limits']['historyProbeMs'])
                        raw=(p/'stdout.raw').read_text(); records=[json.loads(x) for x in raw.splitlines() if x.strip()]
                        demand(len(records)==1 and records[0].get('log')==str(data),'history output is not one bound owner row')
                        pair[name]=records[0]; receipts[name]=pin(p/'process.json')
                    compared=compare_history(pair['base'],pair['final'],row,lane)
                    outcome={'lane':lane,'byteSubject':sha,'representativeOriginalPath':row['path'],'baseline':pair['base'],'final':pair['final'],**compared,'receipts':receipts}
                    save(out/f'{lane}-{i+1:03d}-comparison.json',outcome); summaries.append(outcome)
                    print(json.dumps({'lane':lane,'subject':sha,'status':compared['status']}),flush=True)
                    demand(compared['status']!='unexpected_owner_difference','unexpected history owner difference; stop before next subject')
            for row in baseline['pins']: checked(row)
        for row in c['subject']['buildPins']: checked(row)
        inventory_check(tenant/'node_modules',json.loads(checked(c['dependencyInventory']).read_text())['rows'])
        source_check(c)
        checked(c['node']); checked(c['subject']['artifact']); checked(c['campaign'])
        demand(time.monotonic_ns()<campaign['deadlineMonotonicNs'], 'shared campaign expired before completion')
        demand(digest(__file__)==c['runnerSha256'] and digest(args.config)==args.config_sha256, 'runner/config changed during proof')
        save(out/'FINAL.json',{'status':'MECHANICAL_POPULATION_COMPLETED','ended':utc(),'phase':args.phase,'results':summaries,'sharedCampaign':c['campaign'],
             'externalOutstanding':['Four physical kept-read witnesses, separately supervised under this same campaign deadline; not covered by byte-only history.'],
             'standing':'selected commands/owner outcomes only; skipped/prior-refused/retired-refused distinguished; no live UAT or qualification'})
        return 0
    except BaseException as exc:
        save(out/'HALT.json',{'at':utc(),'status':'FAILED_OR_INCOMPLETE','error':repr(exc),'completedResults':summaries,
             'remainingPopulation':'not executed after first failure','standing':'no retry, repair, wider cleanup or green aggregation'})
        print(json.dumps({'halt':str(out/'HALT.json'),'error':repr(exc)}),flush=True); return 1

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('phase',choices=['campaign-start','broad','history']); parser.add_argument('--config')
    parser.add_argument('--config-sha256')
    parser.add_argument('--campaign-path'); parser.add_argument('--campaign-id'); parser.add_argument('--root-ruling')
    args=parser.parse_args()
    try:
        if args.phase=='campaign-start': result = create_campaign(args)
        else:
            demand(args.config and args.config_sha256, 'phase configuration path and digest required')
            result = main(args)
    except BaseException as exc:
        print(json.dumps({'status':'PRELAUNCH_REFUSAL','error':repr(exc)}),file=sys.stderr); result = 2
    sys.exit(result)
