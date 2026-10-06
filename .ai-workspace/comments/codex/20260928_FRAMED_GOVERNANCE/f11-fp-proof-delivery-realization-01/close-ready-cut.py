import pathlib, os, stat, hashlib, json, datetime, time

out = pathlib.Path(__file__).resolve().parent
repo = pathlib.Path('/Users/jim/src/apps/abiogenesis')
g = out.parent
c05 = g / 'final-candidate-construction-05'
stage = out / 'readiness-stage'
source = 'build_tenants/abiogenesis/typescript/code/src/implementation/leaf_invocation_port.ts'
test = 'build_tenants/abiogenesis/typescript/test_env/tests/t287-qualification-fp-proof-delivery.test.mjs'
emission = 'build_tenants/abiogenesis/typescript/build/code/src/implementation/leaf_invocation_port.js'
started = time.monotonic()

def pin(path):
    body = path.read_bytes()
    return {'path': str(path), 'bytes': len(body), 'sha256': hashlib.sha256(body).hexdigest(),
            'mode': stat.S_IMODE(path.stat().st_mode)}

def write(name, value):
    (out / name).write_text(json.dumps(value, indent=2) + '\n')

def population(root):
    rows, directories = [], []
    for directory, dirs, files in os.walk(root, followlinks=False):
        for name in sorted(dirs + files):
            path = pathlib.Path(directory) / name
            relative = str(path.relative_to(root))
            info = path.lstat()
            if path.is_symlink():
                rows.append({'path': relative, 'kind': 'symlink', 'target': os.readlink(path),
                             'mode': stat.S_IMODE(path.stat().st_mode)})
            elif path.is_dir():
                directories.append(relative)
            else:
                assert stat.S_ISREG(info.st_mode), (relative, info.st_mode)
                body = path.read_bytes()
                rows.append({'path': relative, 'kind': 'file', 'bytes': len(body),
                             'sha256': hashlib.sha256(body).hexdigest(), 'mode': stat.S_IMODE(info.st_mode)})
    return sorted(rows, key=lambda x: x['path']), sorted(directories)

modes = ['compile', 'regression', 'conservation-fp', 'conservation-diagnostic', 'conservation-assembly']
receipts = [json.loads((out / (mode + '-supervisor-close.json')).read_text()) for mode in modes]
assert all(x['exitCode'] == 0 and not x['timedOut'] and x['wait4ReapedMain'] and
           x['processGroupAfterWait'] == 'absent' for x in receipts)
for mode in modes[1:]:
    text = (out / (mode + '-supervised-stdout.log')).read_text()
    assert 'pass 1' in text and 'fail 0' in text and 'skipped 0' in text, (mode, text)
assert (repo / source).read_bytes() == (stage / source).read_bytes() == (out / 'postimages/leaf_invocation_port.ts').read_bytes()
assert (repo / test).read_bytes() == (stage / test).read_bytes() == (out / 'postimages/t287-qualification-fp-proof-delivery.test.mjs').read_bytes()

baseline = json.loads((c05 / 'final-stage-population.json').read_text())
expected = {x['path'].removeprefix('final-stage/'): {**x, 'path': x['path'].removeprefix('final-stage/')} for x in baseline}
rows, directories = population(stage)
actual = {x['path']: x for x in rows}
added, removed = sorted(actual.keys() - expected.keys()), sorted(expected.keys() - actual.keys())
changed = sorted(k for k in actual.keys() & expected.keys() if actual[k] != expected[k])
correspondence = {'baselinePopulation': pin(c05 / 'final-stage-population.json'), 'baselineRows': len(baseline),
    'copiedRows': len(rows), 'copiedDirectories': len(directories), 'added': added, 'removed': removed,
    'changed': [{'path': k, 'preimage': expected[k], 'postimage': actual[k]} for k in changed],
    'unmodifiedRows': len(actual.keys() & expected.keys()) - len(changed),
    'symlinkModeRelation': 'mode follows target, as in accepted C05 population; literal targets compare exactly and lstat modes are separately retained in freeze',
    'claim': 'complete physical copied C05 source/support/contracts/compiled/dependency population; only selected two source effects and one JS emission differ',
    'identityLimit': 'source-built readiness only; retained C05 product manifest is not regenerated and does not admit this new body as a Product/Install'}
write('readiness-stage-population.json', rows)
write('readiness-stage-correspondence.json', correspondence)
assert added == [test] and removed == [] and changed == sorted([source, emission]), correspondence

old_pins = json.loads((out / 'source-preimage-pins.json').read_text())
protected = []
for old in old_pins:
    path = pathlib.Path(old['path'])
    if path == repo / source:
        continue
    now = pin(path)
    assert now['bytes'] == old['bytes'] and now['sha256'] == old['sha256'], (old, now)
    protected.append({'preimage': old, 'postimage': now, 'equal': True})

# The executed resource is joined to the exact Q06 freeze, not a moving recipe.
q06 = json.loads((g / 'final-qualification-inputs-06/freeze.json').read_text())
q06_rows = next(v for v in q06.values() if isinstance(v, list) and any(isinstance(x, dict) and
    x.get('path', '').endswith('f11-bound-resource-manifest.json') for x in v))
donors = json.loads((out / 'readiness-donor-pins.json').read_text())
input_joins = []
for name in ['f11-bound-packet.json', 'f11-bound-resource-manifest.json']:
    donor = next(x for x in donors if x['path'].endswith('/' + name))
    frozen = next(x for x in q06_rows if x.get('path', '').endswith(name))
    assert donor['bytes'] == frozen['bytes'] and donor['sha256'] == frozen['sha256'], (donor, frozen)
    input_joins.append({'actualSelectedPin': donor, 'acceptedQ06Record': frozen})
write('conservation.json', {'protectedExactPins': protected, 'Q06ResourceJoins': input_joins,
    'canonicalMutablePostimages': [pin(repo / source), pin(repo / test)],
    'C05OriginalSourcePreimage': pin(out / 'preimages/leaf_invocation_port.ts'),
    'readinessStageCorrespondence': 'readiness-stage-correspondence.json',
    'allOriginalSourceAuthorship': 'source-authorship.json retains the complete nested original C05 record; other source records remain the accepted C05 donor population',
    'effects': 'only exact canonical source/test and new report territory; no Runtime/store/install/catalog/worksite/Git/network effects',
    'assuranceReuse': 'closed C05/source/Q06 and independent dispatcher correspondence reused; no broad test/population/native/qualification campaign'})

outcome = json.loads((out / 'dispatcher-regression-outcome.json').read_text())
accounting = {'receipts': receipts, 'preparation': json.loads((out / 'preparation.json').read_text()),
    'supervisedCommands': len(receipts), 'compileCommands': 1, 'newRegressionTests': 1, 'selectedExistingOwnerTests': 3,
    'commandElapsedMs': sum(x['elapsedMs'] for x in receipts), 'maximumObservedWait4RSSBytes': max(x['rssBytes'] for x in receipts),
    'userSeconds': sum(x['userSeconds'] for x in receipts), 'systemSeconds': sum(x['systemSeconds'] for x in receipts),
    'defaultHeapHOME': 'unchanged', 'processObservation': 'pre-import owned groups, wait4 native receipts, every known main group absent; no PID enumeration',
    'helperActorProviderRuntimeCalls': 0, 'compileEmissionChangedBodies': 1,
    'effectiveSourceChanges': 2, 'exactPreparedRequest': outcome,
    'unknowns': ['unobserved internal body transformation counts and arbitrary child PID population',
        'actual successor Product/Install/Q input correspondence', 'whole installed wrapper child/J/foldback/parent/RunClosed/cold/F11/AF22 proof',
        'semantic qualification and release acceptance'], 'noOOMCauseInferred': True}
write('accounting.json', accounting)
closure = {'status': 'CLOSED', 'role': 'Worker', 'operation': 'T287_F11_FP_PROOF_DELIVERY_REALIZATION_01',
    'actor': '/root/native_applicability_design', 'closedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'workResult': 'GO_BOUNDED_SOURCE_READINESS_ONLY', 'canonicalPostimages': [pin(repo / source), pin(repo / test)],
    'sourceEffect': 'one existing F_P argument5; arguments3/4, exact input/occurrence, all owner checks and failure totalization retained',
    'readiness': 'one compile, actual F_P dispatcher/qualification realization regression plus three selected existing owner checks pass',
    'compiledEmission': actual[emission], 'originalAuthorship': 'source-authorship.json',
    'independentAssurance': 'not performed or activated by this Worker; returns Root Executive',
    'allWritesAfterFreeze': 'STOPPED', 'semanticQualification': 'unknown; no credit',
    'returnRole': 'Executive; no mutation authority', 'remaining': accounting['unknowns'][1:]}
write('closure.json', closure)
(out / 'return.md').write_text('''CLOSED — bounded F_P proof-delivery source readiness passed.

The existing F_P dispatcher now supplies nativeLeafProofOperations as argument5. Assembly argument3 and the command/revision exact-occurrence verifier argument4 remain unchanged. qualification.ts, production signatures, WHAT/HOW and owner/resource/failure checks are unchanged. Exact preimage, delta and original C05 source author chain are retained.

One isolated C05 TypeScript compile passed. The first meaningful test executes actual invokeLeafOwnerBoundary plus actual realizeQualificationAssessment over the frozen Q06 reference-form input/resources. It reproduces C05 preparation implementation_exception, then the repaired path returns the identical prepared owner request without actor/helper dispatch. Borrowed input/occurrence copies, missing owner/preparation/resources and crossed resource refuse. Actual command/revision verifier checks exact occurrence/native coordinates under an explicit lower lookup premise. Three selected existing structural-F_P, cold-diagnostic and native-assembly conservation tests pass. No direct-helper-only substitute or broad suite was used.

Complete copied C05 population differs only in the canonical source postimage, the new named test and one compiled JS body. All declaration emissions and other copied bodies/dependency links remain exact. This is source-built readiness: the retained C05 manifest was not regenerated and supplies no new Product/Install admission. Protected C05/Q06/Runtime06 metadata and governing pins remain unchanged.

All five commands are pre-import group supervised with finite budgets, default heap/HOME and native wait4 closure; costs and RSS are in accounting.json. No Runtime, actor/helper/provider, setup, pack/install, source expansion, Git/network or old-store effects occurred. The pre-effect literal reconstruction's extra-newline refusal had zero effects and is retained separately.

Worker stops writes after freeze.json and returns to Root Executive. Independent source review, successor construction/installation/Q input binding and whole installed carrier/J/Run closure/fresh reads/F11/sole non-green AF22 remain separate. No semantic qualification or release credit is claimed.
''')
rows, directories = population(out)
assert not (out / 'freeze.json').exists()
freeze = {'kind': 'closed_source_readiness_freeze', 'operation': closure['operation'], 'status': 'CLOSED',
    'workResult': closure['workResult'], 'root': str(out), 'excludes': ['freeze.json'],
    'records': rows, 'directories': directories, 'recordCount': len(rows),
    'regularBytes': sum(x.get('bytes', 0) for x in rows), 'symlinks': [x for x in rows if x['kind'] == 'symlink'],
    'physicalLinkModes': [{'path': x['path'], 'lstatMode': stat.S_IMODE((out / x['path']).lstat().st_mode)} for x in rows if x['kind'] == 'symlink'],
    'externalCanonicalPostimages': closure['canonicalPostimages'], 'donorPinReferences': donors,
    'sourceAuthorship': pin(out / 'source-authorship.json'), 'closure': pin(out / 'closure.json'),
    'finalClosureMeasurementMs': (time.monotonic() - started) * 1000,
    'allWritesAfterThisFile': 'STOPPED; Worker CLOSED and returned to Root'}
write('freeze.json', freeze)
print(json.dumps({'status': 'CLOSED', 'freeze': pin(out / 'freeze.json'),
    'recordCount': freeze['recordCount'], 'regularBytes': freeze['regularBytes'], 'symlinks': len(freeze['symlinks']),
    'changedEmission': actual[emission], 'commandElapsedMs': accounting['commandElapsedMs']}))
