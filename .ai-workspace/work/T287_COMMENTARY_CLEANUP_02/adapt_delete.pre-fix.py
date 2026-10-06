from pathlib import Path
import ast,difflib,hashlib,json
W=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_COMMENTARY_CLEANUP_02')
s=(W/'donor.delete_exact_plan.py').read_text();original=s

def change(a,b):
 global s
 assert s.count(a)==1,(a[:100],s.count(a))
 s=s.replace(a,b)

def block(a,b,rep):
 global s
 start=s.index(a);end=s.index(b,start);s=s[:start]+rep+s[end:]

change('import time','import time\nimport sys')
change("G = R / '.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'","G = R / '.ai-workspace/comments'\nEXCLUDED_GOVERNANCE = 'codex/20260928_FRAMED_GOVERNANCE'")
change("W = R / '.ai-workspace/work/T287_COMMENTARY_CLEANUP_01'","W = R / '.ai-workspace/work/T287_COMMENTARY_CLEANUP_02'")
change("E = R / '.ai-workspace/evidence/T287_COMMENTARY_CLEANUP_01'","P = R / '.ai-workspace/evidence/T287_COMMENTARY_CLEANUP_02'\nFINAL = P / 'final'\nE = P / 'execution'\nPREPARE_OPERATION = 'T287_COMMENTARY_CLEANUP_DELETE_02_PREPARE'\nEXECUTE_OPERATION = 'T287_COMMENTARY_CLEANUP_DELETE_02'\nEXECUTE = sys.argv[1:] == ['--execute']\nassert sys.argv[1:] in ([], ['--prepare'], ['--execute'])")
change("EXPECTED_FREEZE = '117cbe4f69d194434292ad95e1ac962cdf6adac9f61741a909f1fc354792d9f3'","EXPECTED_FREEZE = 'd79d700c49185400dce7a31d84fd6d766a017d04445a3bb88846ff080f4aee51'")
change("EXPECTED_CANDIDATES = '0df7d51303e2c63434fa78489642fbc8571969fe895d9ddd54df92f41a409242'","EXPECTED_CANDIDATES = 'b7c9107ec840a3c2b3675cb846d758c55f772383e53da3e200bf923aa0b9cf33'")
block('FORBIDDEN_ROOTS =', 'TEXT_VISUAL =', "FORBIDDEN_ROOTS = {EXCLUDED_GOVERNANCE}\n")
block('def membership(destination=None):', 'def counts(rows):', '''def membership(destination=None):
    """Only named roots plus their parent anchors; never walk all comments."""
    rows = {}
    sink = gzip.open(destination, 'xt', encoding='utf-8') if destination else None
    def add(p):
        rel = str(p.relative_to(G))
        s = p.lstat()
        kind = 'file' if stat.S_ISREG(s.st_mode) else ('directory' if stat.S_ISDIR(s.st_mode)
                else ('symlink' if stat.S_ISLNK(s.st_mode) else 'nonregular'))
        row = {'path':rel,'kind':kind,'mode':stat.S_IMODE(s.st_mode),'device':s.st_dev,'inode':s.st_ino}
        if kind != 'directory':
            row.update(bytes=s.st_size,mtimeNs=s.st_mtime_ns,ctimeNs=s.st_ctime_ns,allocatedBytes=s.st_blocks*512)
        if kind == 'symlink': row['target'] = os.readlink(p)
        if rel in rows:
            assert rows[rel] == row, 'anchor changed: ' + rel
            return
        rows[rel] = row
        if sink: sink.write(json.dumps(row,sort_keys=True,separators=(',',':')) + '\\n')
    try:
        for root in plan['roots']:
            p = guard(G / validate_relative(root['path']), G)
            for anchor in (p,*p.parents):
                if anchor == G: break
                assert anchor.is_dir() and not anchor.is_symlink()
                add(anchor)
            for base, dirs, files in os.walk(p, topdown=True, followlinks=False):
                dirs.sort(); files.sort()
                for name in list(dirs):
                    q = Path(base)/name
                    add(q)
                    if q.is_symlink(): dirs.remove(name)
                    else: assert stat.S_ISDIR(q.lstat().st_mode), str(q)
                for name in files: add(Path(base)/name)
        return rows
    finally:
        if sink: sink.close()


def record_bytes(row):
    p = Path(row['path'])
    if not p.is_absolute(): p = R / validate_relative(row['path'])
    guard(p, R)
    b = p.read_bytes()
    assert (len(b),hashlib.sha256(b).hexdigest(),stat.S_IMODE(p.lstat().st_mode)) == (row['bytes'],row['sha256'],row['mode']),str(p)
    return b


def verify_plan_records():
    for row in known_plan['records'] + known_plan['witnessPopulations']:
        record_bytes(row)
    prior = known_plan['priorProposalFreeze']
    p = Path(prior['path']); b = p.read_bytes()
    assert (len(b),hashlib.sha256(b).hexdigest()) == (prior['bytes'],prior['sha256'])
    old = json.loads(b)
    for row in old['records']: record_bytes(row)


def nonregular_snapshot():
    current=[]
    for old in nonregulars:
        p=G/validate_relative(old['path']); guard(p.parent,G); st=p.lstat()
        assert not stat.S_ISREG(st.st_mode) and not stat.S_ISDIR(st.st_mode),str(p)
        assert (st.st_dev,st.st_ino)==(old['device'],old['inode']),str(p)
        row={'path':old['path'],'mode':stat.S_IMODE(st.st_mode),'device':st.st_dev,'inode':st.st_ino,
             'bytes':st.st_size,'mtimeNs':st.st_mtime_ns,'ctimeNs':st.st_ctime_ns}
        if stat.S_ISLNK(st.st_mode):
            row['target']=os.readlink(p)
            if 'target' in old: assert row['target']==old['target'],str(p)
        current.append(row)
    return current


def require_root_release():
    p=W/'deletion-activation.json'
    assert p.is_file() and not p.is_symlink(),'Root execution grant not yet recorded'
    activation=json.loads(p.read_bytes())
    assert activation['operation']==EXECUTE_OPERATION and activation['deletionAuthorized'] is True
    assert activation['approvedFiles']==22054 and activation['approvedLogicalBytes']==2340366209
    assert activation['planFreezeSHA256']==EXPECTED_FREEZE and activation['candidateManifestSHA256']==EXPECTED_CANDIDATES
    assert activation['RootIndependentGOAccepted'] is True
    for key in ('RootAcceptancePin','IndependentGOPin','ExactExecutionGrantPin','PreparationFreezePin'):
        pin=activation[key]; q=guard(Path(pin['path']));b=q.read_bytes()
        assert (len(b),hashlib.sha256(b).hexdigest())==(pin['bytes'],pin['sha256']),key
    return activation


''')
block('    activation = json.loads(', '    named = []', '''    prep = json.loads((W/'deletion-preparation-activation.json').read_bytes())
    assert prep['operation'] == PREPARE_OPERATION and prep['deletionAuthorized'] is False
    if EXECUTE:
        activation = require_root_release()
    fzb = (FINAL/'freeze.json').read_bytes()
    assert len(fzb)==4379 and hashlib.sha256(fzb).hexdigest()==EXPECTED_FREEZE
    known_plan=json.loads(fzb)
    assert known_plan['status']=='CLOSED_FINAL_PLANNING_ONLY_NO_DELETION'
    verify_plan_records()
    cb=(FINAL/'candidate-files.json').read_bytes()
    assert len(cb)==7622147 and hashlib.sha256(cb).hexdigest()==EXPECTED_CANDIDATES
    candidates=json.loads(cb)
    protections=json.loads((FINAL/'protected-files.json').read_bytes())
    originals=json.loads((P/'copied-original-witnesses.json').read_bytes())
    contexts=json.loads((P/'context-pins.json').read_bytes())
    nonregulars=json.loads((P/'nonregulars.json').read_bytes())
    exclusions=json.loads((FINAL/'excluded-candidate-files.json').read_bytes())
    plan=json.loads((FINAL/'named-root-plan.json').read_bytes())
    joins=json.loads((FINAL/'plan-joins.json').read_bytes())
    assert (len(candidates),sum(x['bytes'] for x in candidates))==(22054,2340366209)
    assert (len(protections),len(originals),len(contexts),len(plan['roots']))==(38212,10752,172,81)
    assert joins['status']=='PASS_ROOT_SELECTED_SUBTRACTION_ONLY'
    assert all(set(x)==EXPECTED_FIELDS|{'root','kind'} for x in candidates)
    candidate_paths={x['path'] for x in candidates};assert len(candidate_paths)==22054
    assert candidate_paths.isdisjoint(x['path'] for x in protections)
    assert candidate_paths.isdisjoint(x['path'] for x in exclusions)
    assert candidate_paths.isdisjoint(x['path'] for x in nonregulars)
''')
change("assert rel.parts[0] not in FORBIDDEN_ROOTS and 'node_modules' not in rel.parts", "assert not (str(rel)==EXCLUDED_GOVERNANCE or str(rel).startswith(EXCLUDED_GOVERNANCE+'/')) and 'node_modules' not in rel.parts")
# Same guard occurs again for candidate rows: use the exact changed expression globally.
s=s.replace("assert rel.parts[0] not in FORBIDDEN_ROOTS and 'node_modules' not in rel.parts", "assert not (str(rel)==EXCLUDED_GOVERNANCE or str(rel).startswith(EXCLUDED_GOVERNANCE+'/')) and 'node_modules' not in rel.parts")
change("0 <= row['root'] < 59", "0 <= row['root'] < len(named)")
change("assert row['path'].startswith(root + '/') and root != 'final-candidate-construction-03/npm-cache'", "assert row['path'].startswith(root + '/')")
change("    phase = 'complete_preflight_hashes'", '''    if not EXECUTE:
        output('preparation-contract-joins.json',{'operation':PREPARE_OPERATION,'status':'PREPARED_NO_UNLINK_AUTHORITY',
               'candidateFiles':22054,'candidateBytes':2340366209,'protections':38212,'originals':10752,
               'contexts':172,'namedRoots':81,'planAndRecordWitnessesUnchanged':True,
               'candidateProtectionExcludedNonregularDisjoint':True,'RootExecutionGateRequired':True,
               'futureBeforeAndAfterScope':'all named root subtrees, ancestors, protected/original/context/nonregular and plan witnesses',
               'fullCommentsCensus':False,'commentsWrites':0,'unlinks':0})
        emit('PREPARED_NO_UNLINK_AUTHORITY',candidateFiles=22054,namedRoots=81)
        raise SystemExit(0)
    phase = 'complete_preflight_hashes' ''')
block('    # Bind current mutable native logs', "    phase = 'complete_G_membership_preflight'", "    before_nonregulars = nonregular_snapshot()\n    output('deletion-nonregular-preflight.json',before_nonregulars)\n")
change("    for rel in joins['trackedNonregularPathsUntouched']:\n        assert rel in before and before[rel]['kind'] == 'symlink'", "    assert all(x['kind'] != 'file' for p,x in before.items() if p in {r['path'] for r in nonregulars})")
s=s.replace("'T287_COMMENTARY_CLEANUP_DELETE_01'",'EXECUTE_OPERATION')
s=s.replace('34045','22054').replace('4535028820','2340366209').replace('38331','38212').replace('17900','10752')
s=s.replace("'contextPins': 75, 'currentNativePins': 6", "'contextPins': 172, 'preservedNonregulars': len(nonregulars)")
s=s.replace("'namedRootDirectoriesPreserved': 59", "'namedRootDirectoriesPreserved': 81")
s=s.replace("'contextPinsVerifiedUnchanged': 75", "'contextPinsVerifiedUnchanged': 172")
s=s.replace("'currentNativePinsVerifiedUnchanged': 6, 'trackedSymlinksVerifiedUnchanged': 7", "'preservedNonregularsVerifiedUnchanged': len(nonregulars)")
s=s.replace("'originalPlanRecordsVerifiedUnchanged': 17", "'originalPlanRecordsVerifiedUnchanged': True")
block("    verify_rows(native, G, 'post_current_native_pins')", '    ledger_count = 0', "    assert nonregular_snapshot() == before_nonregulars,'protected nonregular changed'\n    verify_plan_records()\n")
change("except BaseException as error:\n    failure", "except BaseException as error:\n    if isinstance(error,SystemExit) and error.code==0:\n        raise\n    failure")
change("'status': 'STOPPED', 'phase': phase,", "'status': 'STOPPED', 'phase': phase, 'preparationOnly': not EXECUTE,")
assert 'trackedNonregularPathsUntouched' not in s and 'f11-carrier-installed-setup' not in s
ast.parse(s)
p=W/'delete_exact_plan.py';assert not p.exists();p.write_text(s)
(W/'deletion-helper-adaptation.diff').write_text(''.join(difflib.unified_diff(original.splitlines(True),s.splitlines(True),fromfile='readonly-batch01-donor',tofile='exact-list-batch02')))
print(json.dumps({'helperBytes':len(s.encode()),'helperSHA256':hashlib.sha256(s.encode()).hexdigest(),'syntax':'AST_PARSE_PASS','defaultMode':'PREPARATION_ONLY_NO_UNLINKS'}))
