from pathlib import Path
import datetime, hashlib, json, os, resource, shutil, stat, time

started = time.monotonic()
w = Path(__file__).resolve().parent
e = Path(str(w).replace('/.ai-workspace/work/', '/.ai-workspace/evidence/'))
a = json.loads((w / 'execution-activation.json').read_text())
b = json.loads((w / 'binding.json').read_text())
subject = json.loads((w / 'controls/source-subject.json').read_text())
postimages = json.loads((e / 'source-postimages.json').read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def save(path, value):
    with path.open('x') as stream:
        json.dump(value, stream, indent=2)
        stream.write('\n')

def pin(path):
    p = Path(path)
    s = p.lstat()
    assert stat.S_ISREG(s.st_mode), str(p)
    return {'path': str(p), 'bytes': s.st_size, 'sha256': sha(p),
            'mode': stat.S_IMODE(s.st_mode), 'device': s.st_dev, 'inode': s.st_ino}

def verify(expected):
    actual = pin(expected['path'])
    assert actual['bytes'] == expected['bytes'] and actual['sha256'] == expected['sha256']
    return actual

assert a['operation'] == b['operation'] == subject['operation']
verify(a['grant'])
prior_freeze = verify(subject['priorFrozenSource'])
prior_authorship = verify(subject['priorActualPostimages'])
assert sha(Path(a['HOW'])) == a['HOWSHA256']
entries = {row['path']: row for row in subject['rows']}
assert len(entries) == len(postimages) == 17
conserved = []
for row in postimages:
    current = pin(row['path'])
    assert current['bytes'] == row['bytes'] and current['sha256'] == row['sha256'] and current['mode'] == row['mode']
    retained = pin(row['retainedPostimage'])
    assert (retained['bytes'], retained['sha256'], retained['mode']) == (row['bytes'], row['sha256'], row['mode'])
    entry = entries[row['path']]
    assert entry == row['entrySourceRecord']
    if not row['changed']:
        assert (current['bytes'], current['sha256'], current['mode']) == (entry['byteCount'], entry['sha256'], entry['mode'])
    else:
        assert entry['writableInAssemblyRepair'] and row['path'] in a['SourceTerritory']
    conserved.append({**row, 'finalActual': current})
assert sum(row['changed'] for row in conserved) == 2
assert sorted(row['path'] for row in conserved if row['changed']) == sorted(a['SourceTerritory'])

labels = ['preflight', 'compile', 'manifest', 'pack', 'extract', 'schema_preflight', 'focused']
receipts, groups = {}, []
for label in labels:
    record = json.loads((w / (label + '.json')).read_text())
    assert record['operation'] == a['operation'] and record['exitCode'] == 0
    assert record['wait4Reaped'] and record['groupAbsent'] and not record['timedOut']
    assert record['HOMEUnchanged'] and record['defaultHeap']
    try:
        os.killpg(record['pgid'], 0)
    except ProcessLookupError:
        absent = True
    else:
        absent = False
    assert absent
    groups.append({'label': label, 'pid': record['pid'], 'pgid': record['pgid'], 'wait4Reaped': True, 'absentAtClose': True})
    receipts[label] = record

events = [json.loads(line) for line in (w / 'focused.stdout').read_text().splitlines()]
passes = [event for event in events if event['type'] == 'test:pass']
failures = [event for event in events if event['type'] == 'test:fail']
summaries = [event for event in events if event['type'] == 'test:summary']
assert len(passes) == 12 and not failures
assert summaries[-1]['data']['success'] and summaries[-1]['data']['counts']['passed'] == 12
diagnostics = []
for event in events:
    if event['type'] == 'test:diagnostic':
        try:
            value = json.loads(event['data']['message'])
        except (ValueError, TypeError):
            continue
        diagnostics.append({'file': event['data'].get('file'), 'line': event['data'].get('line'), 'value': value})
assembly = next(row['value'] for row in diagnostics if 'assemblyNegatives' in row['value'])
assert [assembly[key] for key in ['assemblyPolicies', 'assemblyLifecycleFamilies', 'assemblyPositives', 'assemblyNegatives', 'assemblyRestorations']] == [2, 2, 4, 16, 16]
assert assembly['wholeProgramClaims'] == 0 and assembly['RuntimeCalls'] == 0
full_native = next(row['value'] for row in diagnostics if 'completeProducerPopulation' in row['value'])
assert full_native['completeProducerPopulation'] and full_native['ctsMtsDeclarations'] == 5
schema_preflight = json.loads((w / 'schema-preflight-result.json').read_text())
assert schema_preflight['kind'] == 'COMPLETE_PACKAGED_SCHEMA_PREFLIGHT_READY'
assert schema_preflight['strictAjv2020'] and schema_preflight['beforeIndividualFocusedCases']
assert len(schema_preflight['compiledDefinitions']) == 5 and len(schema_preflight['tupleRows']) == 23
for row in schema_preflight['tupleRows']:
    assert row['items'] is False

root = Path(b['consumerPackageRoot'])
manifest = json.loads((root / 'product-toolchain-manifest.json').read_text())
package = json.loads((root / 'package.json').read_text())
schema = json.loads((root / schema_preflight['schemaPath']).read_text())
extraction = json.loads((w / 'extract-result.json').read_text())
assert extraction['archiveExtractionBodyModeCorrespondence'] and extraction['noArchiveSymlinksOrSource']
assert extraction['packageRoot'] == str(root)
declarations = [row for row in extraction['rows'] if row['path'].endswith(('.d.ts', '.d.cts', '.d.mts'))]
assert sorted(row['path'] for row in declarations) == sorted(locator for locator in manifest['productRelativeLocators'] if locator.endswith(('.d.ts', '.d.cts', '.d.mts')))
assert len(declarations) == full_native['nativeDeclarationSources']
catalog = manifest['publicContractCatalog']
native_rows = [row for row in catalog['rows'] if row.get('nativeTypedLocator') is not None]
assert len(catalog['rows']) == full_native['catalogRows'] and len(package['exports']) == full_native['packageExports']
staged_semantic = pin(Path(b['newStage']) / 'code/src/gtl/semantic_stage.ts')
source_semantic = next(row for row in conserved if row['relativePath'] == 'code/src/gtl/semantic_stage.ts')
assert staged_semantic['sha256'] == source_semantic['sha256']

save(e / 'source-conservation.json', {'operation': a['operation'], 'rows': conserved,
    'changedSource': 2, 'unchangedSource': 15, 'originalAuthorshipProducer': subject['priorActualPostimages'],
    'priorAuthorshipUnchanged': prior_authorship, 'newImportedOwnerPriorAuthorshipUnclaimed': True,
    'priorFailedFreezeUnchanged': prior_freeze, 'acceptedHOWUnchanged': pin(a['HOW']),
    'sourceEffectScope': a['SourceTerritory'], 'outsideScopeSourceEffects': 0,
    'stagedSemanticOwner': staged_semantic,
    'sourceVersusEmission': 'The source corpus remains the exact entry Source; manifest generation derives the staged/package corpus schema digest. These are distinct source and emitted artifact populations.'})

proofs = e / 'proofs'
proofs.mkdir()
files = ['execution-activation.json', 'preflight-result.json', 'extract-result.json', 'schema-preflight-result.json',
    'binding.json', 'commands.json', 'acquisition.json', 'baseline.json', 'preflight.mjs', 'extract.py',
    'schema-preflight.mjs', 'supervise.py', 'test-reporter.mjs', 'finalize.py']
for label in labels:
    files += [label + suffix for suffix in ['.json', '.started.json', '.process-start.json', '.stdout', '.stderr']]
for name in dict.fromkeys(files):
    shutil.copy2(w / name, proofs / name)
save(e / 'focused-proof.json', {'operation': a['operation'], 'passed': len(passes), 'failed': len(failures),
    'passes': passes, 'summaries': summaries, 'diagnostics': diagnostics,
    'schemaPreflightBeforeFocusedInvocation': pin(w / 'schema-preflight-result.json'),
    'completeDeclaredTupleNodes': 23, 'suppliedLowerPremises': 'Exact fixed corpus and authored complete local declarations; direct structural owner constructors, native raw admission, original canonical serialization and published schema all exercised. Whole Program laws are exercised separately through the sole validator fixed Program/mutations.',
    'claimLimit': 'Author component/package proof; no independent acceptance, installed Public Runtime, provider, genuine F11 or complete qualification proof.'})

artifacts = e / 'artifacts'
artifacts.mkdir()
artifact_pins = []
vocabulary = next(row for row in catalog['rows'] if row['contractId'] == 'abg.vocabulary.gtl-program-diagnostic-id')['assetLocator']['path']
for relative in ['package.json', 'product-toolchain-manifest.json', schema_preflight['schemaPath'],
                 'contracts/conformance/gtl-language-conformance-corpus.json', vocabulary]:
    source = root / relative
    target = artifacts / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)
    artifact_pins.append({'relativePath': relative, 'actual': pin(source), 'retained': pin(target)})
archive = Path(extraction['archive']['path'])
assert pin(archive)['sha256'] == extraction['archive']['sha256']
shutil.copy2(archive, artifacts / archive.name)
artifact_pins.append({'archive': pin(archive), 'retained': pin(artifacts / archive.name)})
declaration_exports = [{'packageExportPath': address, 'path': value['types'], 'actual': pin(root / value['types'].removeprefix('./'))}
                       for address, value in package['exports'].items()]
identities = {'operation': a['operation'], 'package': {'name': package['name'], 'version': package['version']},
    'productContentDigest': manifest['productContentDigest'], 'contributionManifestDigest': manifest['contributionManifestDigest'],
    'catalogDigest': catalog['catalogDigest'], 'catalogRows': len(catalog['rows']), 'nativeCatalogRows': len(native_rows),
    'packageExports': len(package['exports']), 'declarationExports': declaration_exports,
    'completeDeclarationFamily': declarations, 'schemaDefinitions': list(schema['$defs']),
    'schemaDigest': schema_preflight['schemaDigest'], 'artifacts': artifact_pins,
    'readiness': 'AUTHOR_SOURCE_PACKAGED_COMPONENT_READY_PENDING_INDEPENDENT_ASSURANCE'}
save(e / 'artifact-identities.json', identities)
save(e / 'process-closure.json', {'operation': a['operation'], 'groups': groups,
    'allKnownGroupsReapedAndAbsent': True, 'extractShimDiagnosticRetained': str(proofs / 'extract.stderr'),
    'defaultHeap': True, 'HOMEUnchanged': True})
acquisition = json.loads((w / 'acquisition.json').read_text())
save(e / 'cost.json', {'operation': a['operation'], 'acquisition': acquisition, 'phases': receipts,
    'payloadElapsedMs': sum(row['elapsedMs'] for row in receipts.values()),
    'userCPUSeconds': sum(row['userCPUSeconds'] for row in receipts.values()) + acquisition['userCPUSeconds'],
    'systemCPUSeconds': sum(row['systemCPUSeconds'] for row in receipts.values()) + acquisition['systemCPUSeconds'],
    'maxRSSPlatformBytes': max(row['maxRSSPlatformBytes'] for row in receipts.values()),
    'compileCount': 1, 'manifestCount': 1, 'offlinePackCount': 1, 'schemaPreflightCount': 1,
    'focusedInvocationCount': 1, 'retries': 0})
closed = {'operation': a['operation'], 'actor': a['actor'], 'role': 'Worker', 'status': 'CLOSED',
    'disposition': 'SOURCE_PACKAGED_COMPONENT_READY_PENDING_INDEPENDENT_ASSURANCE',
    'closedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'SourceChanges': 2,
    'unchangedSourcePins': 15, 'outsideSourceScopeEffects': 0, 'RuntimeEffects': 0, 'payloadRetries': 0,
    'passedPhases': labels, 'focused': {'passed': 12, 'failed': 0}, 'closedComposedTuples': 23,
    'assembly': assembly, 'nativePublication': full_native, 'nativeCatalogRows': len(native_rows),
    'archive': extraction['archive'], 'productContentDigest': manifest['productContentDigest'],
    'catalogDigest': catalog['catalogDigest'], 'allKnownGroupsReapedAndAbsent': True,
    'qualificationLimit': 'Author Source/package component readiness only. No independent acceptance, installed Public execution or semantic qualification follows.',
    'residuals': ['four drift maps', 'adjunct/remaining mandatory Public content',
        'installed G1/G3 F11-AF22-cold chain', 'genuine complete F11/seven defects', 'exact qualification and RC1'],
    'nextAuthority': 'Root conjoins independent frozen-cut assurance; Worker does not activate another actor.',
    'stopWritesAfterFreeze': True}
save(w / 'closure.json', closed)
save(e / 'return.json', closed)

def census(root):
    rows = []
    def visit(path):
        s = path.lstat()
        row = {'path': str(path), 'relativePath': path.relative_to(root).as_posix(),
               'mode': stat.S_IMODE(s.st_mode), 'device': s.st_dev, 'inode': s.st_ino}
        if stat.S_ISDIR(s.st_mode):
            row['type'] = 'directory'
            rows.append(row)
            for child in sorted(path.iterdir(), key=lambda p: p.name):
                visit(child)
        elif stat.S_ISREG(s.st_mode):
            row.update(type='file', bytes=s.st_size, sha256=sha(path))
            rows.append(row)
        elif stat.S_ISLNK(s.st_mode):
            row.update(type='symlink', target=os.readlink(path))
            rows.append(row)
        else:
            raise AssertionError('unexpected effect population: '+str(path))
    visit(root)
    return rows

population = census(w) + census(e)
usage = resource.getrusage(resource.RUSAGE_SELF)
freeze = {'operation': a['operation'], 'actor': a['actor'], 'status': 'CLOSED',
    'disposition': closed['disposition'], 'grant': a['grant'],
    'sourceSubject': pin(w / 'controls/source-subject.json'), 'sourcePostimages': pin(e / 'source-postimages.json'),
    'SourceChanges': 2, 'unchangedSource': 15, 'roots': [str(w), str(e)], 'completePhysicalPopulation': population,
    'counts': {'files': sum(row['type'] == 'file' for row in population),
        'directories': sum(row['type'] == 'directory' for row in population),
        'symlinks': sum(row['type'] == 'symlink' for row in population),
        'logicalBytes': sum(row.get('bytes', 0) for row in population)},
    'immutableRootControlsIncludedReadonly': True,
    'selfExclusion': 'This final freeze alone is written after census; its byte/hash pin is returned to Root.',
    'freezeCost': {'elapsedMs': (time.monotonic()-started)*1000, 'userCPUSeconds': usage.ru_utime,
        'systemCPUSeconds': usage.ru_stime, 'maxRSSPlatformBytes': usage.ru_maxrss,
        'HOME': os.environ['HOME'], 'defaultHeap': True},
    'outcome': str(e / 'return.json'), 'independentAcceptance': False}
save(e / 'freeze.json', freeze)
print(json.dumps({'status': 'CLOSED', 'disposition': closed['disposition'], 'freeze': pin(e / 'freeze.json'),
    'counts': freeze['counts'], 'focused': closed['focused'], 'SourceChanges': 2, 'unchangedSource': 15,
    'archive': extraction['archive'], 'productContentDigest': manifest['productContentDigest'],
    'catalogDigest': catalog['catalogDigest'], 'retries': 0}))
