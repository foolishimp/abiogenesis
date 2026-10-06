from pathlib import Path
import datetime, hashlib, json, os, resource, shutil, stat, time

start = time.monotonic()
work = Path(__file__).resolve().parent
evidence = Path(str(work).replace('/.ai-workspace/work/', '/.ai-workspace/evidence/'))
activation = json.loads((work / 'activation.json').read_text())
binding = json.loads((work / 'binding.json').read_text())
subject = json.loads((work / 'controls/source-subject.json').read_text())
assert activation['operation'] == subject['operation'] == binding['operation']
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def save(path, value):
    with path.open('x') as stream:
        json.dump(value, stream, indent=2)
        stream.write('\n')

def pin(path):
    p = Path(path)
    s = p.lstat()
    assert stat.S_ISREG(s.st_mode)
    return {'path': str(p), 'bytes': s.st_size, 'sha256': sha(p),
            'mode': stat.S_IMODE(s.st_mode), 'device': s.st_dev, 'inode': s.st_ino}

source_rows = []
for row in subject['rows']:
    actual = pin(row['path'])
    assert actual['bytes'] == row['byteCount'] and actual['sha256'] == row['sha256'] and actual['mode'] == row['mode']
    assert row['writableInContinuation'] is False
    source_rows.append({**row, 'finalActual': actual, 'SourceEffect': 0})
prior = subject['priorFrozenSource']
assert pin(prior['path'])['sha256'] == prior['sha256']
assert pin(prior['path'])['bytes'] == prior['bytes']
assert pin(activation['grant']['path'])['sha256'] == activation['grant']['sha256']

receipts = {}
closure = []
for label in ['preflight', 'manifest', 'pack', 'extract', 'focused']:
    receipt = json.loads((work / (label + '.json')).read_text())
    assert receipt['wait4Reaped'] and receipt['groupAbsent'] and not receipt['timedOut']
    try:
        os.killpg(receipt['pgid'], 0)
    except ProcessLookupError:
        absent = True
    else:
        absent = False
    assert absent
    receipts[label] = receipt
    closure.append({'label': label, 'pid': receipt['pid'], 'pgid': receipt['pgid'], 'reaped': True, 'absenceAtClose': True})
assert all(receipts[x]['exitCode'] == 0 for x in ['preflight', 'manifest', 'pack', 'extract'])
assert receipts['focused']['exitCode'] == 1

events = [json.loads(line) for line in (work / 'focused.stdout').read_text().splitlines()]
failures = [event for event in events if event['type'] == 'test:fail']
passes = [event for event in events if event['type'] == 'test:pass']
summaries = [event for event in events if event['type'] == 'test:summary']
assert len(passes) == 6 and len(failures) == 4
assert 'prefixItems' in failures[0]['data']['details']['error']['message']

consumer = Path(binding['consumerPackageRoot'])
manifest_path = consumer / 'product-toolchain-manifest.json'
manifest = json.loads(manifest_path.read_text())
package = json.loads((consumer / 'package.json').read_text())
schema_path = consumer / 'contracts/schemas/gtl-serialization.schema.json'
schema = json.loads(schema_path.read_text())
tuple_node = schema['$defs']['ModulePublication']['properties']['closureContracts']['items']['oneOf'][0]['properties']['eventKindRefs']
assert tuple_node['minItems'] == 4 and len(tuple_node['prefixItems']) == 4
assert 'items' not in tuple_node and 'maxItems' not in tuple_node
extraction = json.loads((work / 'extract-result.json').read_text())
declarations = [row for row in extraction['rows'] if row['path'].endswith('.d.ts')]
metadata = [row for row in extraction['rows'] if Path(row['path']).name == 'package.json']
decl_paths = {row['path'] for row in declarations}
export_paths = []
for address, export in package['exports'].items():
    target = export['types'].removeprefix('./')
    assert target in decl_paths
    export_paths.append({'packageExportPath': address, 'declarationPath': target, 'actual': pin(consumer / target)})

failure_report = {
    'operation': activation['operation'], 'status': 'STOPPED_AT_FIRST_OBSERVED_FOCUSED_FAILURE',
    'firstBoundary': {'event': failures[0], 'owner': 'packaged Ajv2020 strict tuple profile',
        'caller': str(work / 'consumer/t287-gtl-serialization-publication.test.mjs'), 'testLine': 74,
        'schemaConsumerLines': [27, 29, 102, 105], 'schemaPath': str(schema_path),
        'definitionPath': '#/$defs/ModulePublication/properties/closureContracts/items/oneOf/0/properties/eventKindRefs',
        'actualSchemaNode': tuple_node, 'originatingSource': subject['rows'][6]['path'], 'originatingSourceLines': [165, 167],
        'relation': 'actual emitted fixed-prefix array has minItems/prefixItems but no upper or tail bound accepted by the selected strict Ajv tuple profile',
        'causeLimit': 'No correction or requirement denotation selected here; Root must conjoin exact projector/native tuple law.'},
    'distinctClosureBoundary': {'event': failures[1],
        'owner': 'resolveNativeDeclarationClosures at code/src/product/declaration_exports.ts:1376',
        'installedOwner': str(consumer / 'build/code/src/product/declaration_exports.js'),
        'callerLines': [150, 151, 152],
        'actualArguments': {'packageName': package['name'], 'packageType': 'module', 'packageExports': package['exports'],
            'sourceProductContentDigest': manifest['productContentDigest'],
            'declarationSources': declarations, 'packageMetadataSources': metadata,
            'bytesBodiesLocatedUnder': str(consumer), 'selectionPredicate': "relative.endsWith('.d.ts') or entry.name === 'package.json'"},
        'actualExportedDeclarationPaths': export_paths,
        'observedResult': None, 'cause': 'UNKNOWN; no owner replay, guard weakening or inferred missing declaration defect'},
    'remainingObservedFailures': failures[2:], 'passes': passes, 'summaries': summaries,
    'executionLimit': 'These events arose inside the one completed Node test invocation before its receipt was observed. No subsequent payload, import, repair or retry.',
    'fullOptionalRelationalProof': 'NOT_ESTABLISHED', 'fullNativeCatalogClosureProof': 'NOT_ESTABLISHED',
    'SourceWrites': 0, 'RuntimeEffects': 0}
save(evidence / 'failure-boundaries.json', failure_report)

proofs = evidence / 'proofs'
proofs.mkdir()
names = ['preflight-result.json', 'extract-result.json', 'focused.stdout', 'focused.stderr', 'acquisition.json', 'binding.json', 'commands.json', 'baseline.json', 'test-reporter.mjs', 'preflight.mjs', 'extract.py', 'supervise.py']
for label in receipts:
    names += [label + suffix for suffix in ['.json', '.started.json', '.process-start.json', '.stdout', '.stderr']]
for name in dict.fromkeys(names):
    source = work / name
    assert source.is_file()
    shutil.copy2(source, proofs / name)
assets = evidence / 'artifacts'
assets.mkdir()
artifact_names = ['package.json', 'product-toolchain-manifest.json', 'contracts/schemas/gtl-serialization.schema.json',
                  'contracts/conformance/gtl-language-conformance-corpus.json', 'contracts/vocabularies/gtl-program-diagnostic-id.json']
artifact_pins = []
for name in artifact_names:
    source = consumer / name
    if not source.is_file():
        # Vocabulary route is consumed from its actual emitted catalog row.
        assert name == 'contracts/vocabularies/gtl-program-diagnostic-id.json'
        vocabulary_row = next(row for row in manifest['publicContractCatalog']['rows'] if row['contractId'] == 'abg.vocabulary.gtl-program-diagnostic-id')
        name = vocabulary_row['assetLocator']['path']
        source = consumer / name
    target = assets / name
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)
    artifact_pins.append({'relativePath': name, 'actual': pin(source), 'retained': pin(target)})
archive = Path(extraction['archive']['path'])
shutil.copy2(archive, assets / archive.name)
artifact_pins.append({'archive': pin(archive), 'retained': pin(assets / archive.name)})
save(evidence / 'source-conservation.json', {'operation': activation['operation'], 'SourceWrites': 0, 'rows': source_rows,
    'priorFreeze': prior, 'priorFreezeUnchanged': True, 'allSixteenSourcesUnchanged': True,
    'originalAuthorsPreserved': True, 'compiledOutputReuse': str(evidence / 'acquisition-correspondence.json')})
save(evidence / 'artifact-identities.json', {'operation': activation['operation'], 'productContentDigest': manifest['productContentDigest'],
    'productId': manifest['productId'], 'packageName': manifest['packageName'], 'packageVersion': manifest['packageVersion'],
    'contributionManifestDigest': manifest['contributionManifestDigest'], 'catalogDigest': manifest['publicContractCatalog']['catalogDigest'],
    'catalogRowCount': len(manifest['publicContractCatalog']['rows']), 'packageExportCount': len(package['exports']),
    'schemaDefinitions': list(schema['$defs']), 'artifacts': artifact_pins, 'packageProof': 'FAILED_NOT_ACCEPTED'})

tools = []
tool_node = Path(json.loads((work / 'commands.json').read_text())['node'])
npm_root = tool_node.parent.parent / 'npm'
for p in [tool_node, npm_root / 'bin/npm-cli.js', npm_root / 'package.json', Path(binding['newStage']) / 'node_modules/typescript/package.json',
          Path(binding['newStage']) / 'node_modules/valibot/package.json']:
    tools.append(pin(p))
save(evidence / 'process-closure.json', {'operation': activation['operation'], 'groups': closure,
    'allKnownGroupsReapedAndAbsent': True, 'extractDiagnosticObservedChildPID': 35045,
    'childProof': 'extract parent/group reaped and absent; shim child diagnostic retained; no separate invocation',
    'HOMEUnchanged': True, 'defaultHeap': True, 'borrowedTools': tools})
acquisition = json.loads((work / 'acquisition.json').read_text())
save(evidence / 'cost.json', {'operation': activation['operation'], 'acquisition': acquisition, 'phases': receipts,
    'supervisedUserCPUSeconds': sum(row['userCPUSeconds'] for row in receipts.values()),
    'supervisedSystemCPUSeconds': sum(row['systemCPUSeconds'] for row in receipts.values()),
    'maxSupervisedRSSPlatformBytes': max(row['maxRSSPlatformBytes'] for row in receipts.values()),
    'newCompile': False, 'offlinePacks': 1, 'focusedInvocations': 1})
residuals = ['strict published tuple profile', 'native catalog/declaration closure correspondence', 'complete optional declaration/negative/restoration proof',
    'four drift maps', 'version adjunct and other mandatory content', 'current installed G1/G3 chain', 'genuine complete F11/seven defects', 'exact qualification and RC1']
closed = {'operation': activation['operation'], 'actor': activation['actor'], 'role': 'Worker', 'status': 'CLOSED',
    'disposition': 'STOPPED_FAILED_PACKAGED_PROOF', 'closedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'SourceWrites': 0, 'PayloadRetries': 0, 'RuntimeEffects': 0, 'processGroupsAbsent': True,
    'compileReuse': 'PROVEN; no new compile', 'passedPhases': ['physical acquisition', 'NodeNext/13-runtime-package preflight', 'complete manifest', 'offline pack', 'exact source-blind extraction'],
    'focused': {'passed': 6, 'failed': 4, 'receipt': str(evidence / 'proofs/focused.json')},
    'failureReport': str(evidence / 'failure-boundaries.json'), 'archive': extraction['archive'],
    'acceptanceLimit': 'Archive produced; full core packaged readiness not established. Author constructability evidence, not independent acceptance.',
    'smallestReentry': 'Root multi-frame conjoin exact tuple projection/profile and independent native closure owner/caller localization before any further effect',
    'residuals': residuals, 'stopWritesAfterFreeze': True}
save(work / 'closure.json', closed)
save(evidence / 'return.json', closed)

def census(root):
    rows = []
    def visit(path):
        s = path.lstat()
        row = {'path': str(path), 'relativePath': path.relative_to(root).as_posix(), 'mode': stat.S_IMODE(s.st_mode),
               'device': s.st_dev, 'inode': s.st_ino}
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
            raise AssertionError('unexpected effect population member '+str(path))
    visit(root)
    return rows

population = census(work) + census(evidence)
usage = resource.getrusage(resource.RUSAGE_SELF)
freeze = {'operation': activation['operation'], 'actor': activation['actor'], 'status': 'CLOSED', 'disposition': closed['disposition'],
    'grant': activation['grant'], 'sourceSubject': pin(work / 'controls/source-subject.json'), 'SourceWrites': 0,
    'roots': [str(work), str(evidence)], 'completePhysicalPopulation': population,
    'counts': {'files': sum(row['type'] == 'file' for row in population), 'directories': sum(row['type'] == 'directory' for row in population),
               'symlinks': sum(row['type'] == 'symlink' for row in population), 'logicalBytes': sum(row.get('bytes', 0) for row in population)},
    'immutableControlsIncludedReadonly': True, 'selfExclusion': 'This final freeze is the only post-census file; its exact pin is returned to Root.',
    'freezeCost': {'elapsedMs': (time.monotonic()-start)*1000, 'userCPUSeconds': usage.ru_utime,
                   'systemCPUSeconds': usage.ru_stime, 'maxRSSPlatformBytes': usage.ru_maxrss, 'defaultHeap': True, 'HOME': os.environ['HOME']},
    'processClosure': str(evidence / 'process-closure.json'), 'outcome': str(evidence / 'return.json'), 'independentAcceptance': False}
save(evidence / 'freeze.json', freeze)
print(json.dumps({'status': 'CLOSED', 'disposition': closed['disposition'], 'freeze': pin(evidence / 'freeze.json'),
                  'counts': freeze['counts'], 'focused': closed['focused'], 'SourceWrites': 0, 'retries': 0}))
