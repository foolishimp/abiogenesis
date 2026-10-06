from pathlib import Path
import datetime, hashlib, json, os, resource, shutil, stat, time

start = time.monotonic()
w = Path(__file__).resolve().parent
e = Path(str(w).replace('/.ai-workspace/work/', '/.ai-workspace/evidence/'))
a = json.loads((w / 'activation.json').read_text())
b = json.loads((w / 'binding.json').read_text())
subject = json.loads((w / 'controls/source-subject.json').read_text())
postimages = json.loads((w / 'source-postimages.json').read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def save(path, value):
    with path.open('x') as stream:
        json.dump(value, stream, indent=2)
        stream.write('\n')

def pin(path):
    p = Path(path)
    s = p.lstat()
    assert stat.S_ISREG(s.st_mode)
    return {'path': str(p), 'bytes': s.st_size, 'sha256': sha(p), 'mode': stat.S_IMODE(s.st_mode), 'device': s.st_dev, 'inode': s.st_ino}

assert a['operation'] == b['operation'] == subject['operation']
assert sha(Path(a['grant']['path'])) == a['grant']['sha256']
assert sha(Path(subject['priorFrozenSource']['path'])) == subject['priorFrozenSource']['sha256']
conserved = []
for row in postimages:
    current = pin(row['path'])
    assert current['bytes'] == row['bytes'] and current['sha256'] == row['sha256'] and current['mode'] == row['mode']
    assert pin(row['retainedPostimage'])['sha256'] == row['sha256']
    conserved.append({**row, 'finalActual': current})
assert len(conserved) == 16 and sum(row['changed'] for row in conserved) == 2

receipts = {}
groups = []
for label in ['preflight', 'compile', 'manifest', 'pack', 'extract', 'focused']:
    record = json.loads((w / (label + '.json')).read_text())
    assert record['wait4Reaped'] and record['groupAbsent'] and not record['timedOut']
    try:
        os.killpg(record['pgid'], 0)
    except ProcessLookupError:
        absent = True
    else:
        absent = False
    assert absent
    groups.append({'label': label, 'pid': record['pid'], 'pgid': record['pgid'], 'wait4Reaped': True, 'absentAtClose': True})
    receipts[label] = record
assert all(receipts[label]['exitCode'] == 0 for label in receipts if label != 'focused')
assert receipts['focused']['exitCode'] == 1
events = [json.loads(line) for line in (w / 'focused.stdout').read_text().splitlines()]
passes = [event for event in events if event['type'] == 'test:pass']
failures = [event for event in events if event['type'] == 'test:fail']
assert len(passes) == 6 and len(failures) == 5
assert all('8-tuple' in event['data']['details']['error']['message'] for event in failures)

root = Path(b['consumerPackageRoot'])
manifest = json.loads((root / 'product-toolchain-manifest.json').read_text())
package = json.loads((root / 'package.json').read_text())
schema = json.loads((root / 'contracts/schemas/gtl-serialization.schema.json').read_text())
module = schema['$defs']['ModulePublication']['properties']
section_order = module['semanticJobLifecycle']['properties']['stages']['items']['properties']['assembly']['oneOf'][0]['properties']['sectionOrder']
closed_tuple_nodes = [variant['properties']['eventKindRefs'] for variant in module['closureContracts']['items']['oneOf']]
closed_tuple_nodes.append(module['programs']['items']['properties']['constructionComposition']['properties']['authorities'])
assert [node['minItems'] for node in closed_tuple_nodes] == [4, 3, 4]
assert all(node['items'] is False for node in closed_tuple_nodes)
assert section_order['minItems'] == 8 and 'items' not in section_order and 'maxItems' not in section_order
semantic_owner = Path(subject['rows'][6]['path']).parent / 'semantic_stage.ts'
staged_owner = Path(b['newStage']) / 'code/src/gtl/semantic_stage.ts'
assert sha(semantic_owner) == sha(staged_owner)
extraction = json.loads((w / 'extract-result.json').read_text())
declarations = [row for row in extraction['rows'] if row['path'].endswith(('.d.ts', '.d.cts', '.d.mts'))]
metadata = [row for row in extraction['rows'] if Path(row['path']).name == 'package.json']
assert sorted(row['path'] for row in declarations) == sorted(locator for locator in manifest['productRelativeLocators'] if locator.endswith(('.d.ts', '.d.cts', '.d.mts')))
native_rows = [row for row in manifest['publicContractCatalog']['rows'] if row.get('nativeTypedLocator') is not None]
failure = {'operation': a['operation'], 'status': 'STOPPED_NO_RETRY', 'firstActualFailure': failures[0],
    'owner': {'canonicalSource': pin(semantic_owner), 'stagedSource': pin(staged_owner), 'nativeTupleTypeLine': 51, 'schemaDefinitionLine': 95},
    'publishedPath': '#/$defs/ModulePublication/properties/semanticJobLifecycle/properties/stages/items/properties/assembly/oneOf/0/properties/sectionOrder',
    'actualPublishedNode': section_order, 'actualClosedRepairedNodes': closed_tuple_nodes,
    'caller': {'path': str(w / 'consumer/t287-gtl-serialization-publication.test.mjs'), 'firstSchemaGetterLine': 46,
               'nativeTupleCasesUnexecuted': True, 'strictAjvProfileUnchanged': True},
    'originatingRelation': 'the reused semantic stage sectionOrder projects an open eight-item prefix, rejected by the unchanged strict tuple consumer',
    'causeScopeLimit': 'The reused semantic_stage owner is outside this two-file grant. Exact native guard/law denotation and smallest correction require Root conjoin; no owner imports/replay/patch here.',
    'priorThreeTupleProjection': 'now emitted with items:false; complete Module/schema execution still blocked',
    'nativeClosureProgress': {'consumerLines': [200, 202, 204, 206, 207, 212, 223],
        'completeDeclarationFamily': declarations, 'exactMetadataFamily': metadata,
        'extendedDeclarationCount': sum(row['path'].endswith(('.d.cts', '.d.mts')) for row in declarations),
        'nonnullClosureAndAllNativeInventoryAssertionsReached': True, 'nativeCatalogRowsCheckedBeforeFailure': len(native_rows),
        'basis': 'the ordered actual callback source reaches later schemaCheck at line223; earlier complete-population/non-null/all-inventory assertions did not fail',
        'fullAggregateAndSchemaProof': 'NOT_ESTABLISHED'},
    'allActualFailures': failures, 'passes': passes, 'summaries': [event for event in events if event['type'] == 'test:summary'],
    'limits': 'One focused invocation completed before observation of its exit; no subsequent payload, test, import, retry or Source patch.'}
save(e / 'failure-boundary.json', failure)
save(e / 'source-conservation.json', {'operation': a['operation'], 'rows': conserved, 'changedSource': 2, 'unchangedSource': 14,
    'originalAuthorshipChainsRetained': True, 'priorFailedFreeze': subject['priorFrozenSource'], 'priorFreezeUnchanged': True,
    'sourceEffectScope': a['SourceTerritory'], 'outsideScopeSourceEffects': 0})
proofs = e / 'proofs'
proofs.mkdir()
files = ['preflight-result.json', 'extract-result.json', 'binding.json', 'commands.json', 'acquisition.json', 'baseline.json', 'preflight.mjs', 'extract.py', 'supervise.py', 'test-reporter.mjs']
for label in receipts:
    files += [label + suffix for suffix in ['.json', '.started.json', '.process-start.json', '.stdout', '.stderr']]
for name in dict.fromkeys(files):
    shutil.copy2(w / name, proofs / name)
artifacts = e / 'artifacts'
artifacts.mkdir()
artifact_pins = []
catalog = manifest['publicContractCatalog']
vocabulary = next(row for row in catalog['rows'] if row['contractId'] == 'abg.vocabulary.gtl-program-diagnostic-id')['assetLocator']['path']
for relative in ['package.json', 'product-toolchain-manifest.json', 'contracts/schemas/gtl-serialization.schema.json',
                 'contracts/conformance/gtl-language-conformance-corpus.json', vocabulary]:
    source = root / relative
    target = artifacts / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)
    artifact_pins.append({'relativePath': relative, 'actual': pin(source), 'retained': pin(target)})
archive = Path(extraction['archive']['path'])
shutil.copy2(archive, artifacts / archive.name)
artifact_pins.append({'archive': pin(archive), 'retained': pin(artifacts / archive.name)})
declaration_exports = [{'packageExportPath': address, 'path': value['types'], 'actual': pin(root / value['types'].removeprefix('./'))}
                       for address, value in package['exports'].items()]
identities = {'operation': a['operation'], 'package': {'name': package['name'], 'version': package['version']},
    'productContentDigest': manifest['productContentDigest'], 'contributionManifestDigest': manifest['contributionManifestDigest'],
    'catalogDigest': catalog['catalogDigest'], 'catalogRows': len(catalog['rows']), 'nativeCatalogRows': len(native_rows),
    'packageExports': len(package['exports']), 'declarationExports': declaration_exports,
    'schemaDefinitions': list(schema['$defs']), 'artifacts': artifact_pins, 'readiness': 'FAILED_PACKAGED_PROOF_NOT_ACCEPTED'}
save(e / 'artifact-identities.json', identities)
save(e / 'process-closure.json', {'operation': a['operation'], 'groups': groups, 'allKnownGroupsReapedAndAbsent': True,
    'extractShimDiagnostic': str(proofs / 'extract.stderr'), 'defaultHeap': True, 'HOMEUnchanged': True})
save(e / 'cost.json', {'operation': a['operation'], 'acquisition': json.loads((w / 'acquisition.json').read_text()), 'phases': receipts,
    'userCPUSeconds': sum(row['userCPUSeconds'] for row in receipts.values()),
    'systemCPUSeconds': sum(row['systemCPUSeconds'] for row in receipts.values()),
    'maxRSSPlatformBytes': max(row['maxRSSPlatformBytes'] for row in receipts.values()), 'compileCount': 1, 'offlinePackCount': 1, 'focusedInvocationCount': 1})
closed = {'operation': a['operation'], 'actor': a['actor'], 'role': 'Worker', 'status': 'CLOSED',
    'disposition': 'STOPPED_AT_REUSED_SECTION_ORDER_TUPLE_PROFILE', 'closedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'SourceChanges': 2, 'unchangedSourcePins': 14, 'outsideSourceScopeEffects': 0, 'RuntimeEffects': 0, 'payloadRetries': 0,
    'passedPhases': ['physical acquisition/preflight', 'strict compile', 'full manifest', 'offline pack', 'exact regular-member Source-blind extraction'],
    'focused': {'passed': 6, 'failed': 5}, 'nativeClosurePopulationAndInventoryProgress': 'proved preceding assertions from actual later-failure control path; full test failed',
    'newTupleNegatives': 'NOT_REACHED because Module schema getter refuses before cases', 'allKnownGroupsReapedAndAbsent': True,
    'failure': str(e / 'failure-boundary.json'), 'archive': extraction['archive'],
    'qualificationLimit': 'Author Source/component readiness only, presently failed. No independent acceptance, installed or semantic qualification.',
    'residuals': ['reused semantic assembly closed-tuple/profile relation', 'full tuple negatives/optional/schema/aggregate/roundtrip proof',
                  'four drift maps', 'adjunct/remaining mandatory Public content', 'installed G1/G3 F11-AF22-cold chain', 'genuine complete F11/seven defects', 'exact qualification and RC1'],
    'smallestReentry': 'Root conjoins exact reused sectionOrder owner/law/native/serialized denotation before assigning a bounded Source continuation',
    'stopWritesAfterFreeze': True}
save(w / 'closure.json', closed)
save(e / 'return.json', closed)

def census(root):
    rows = []
    def visit(path):
        s = path.lstat()
        row = {'path': str(path), 'relativePath': path.relative_to(root).as_posix(), 'mode': stat.S_IMODE(s.st_mode), 'device': s.st_dev, 'inode': s.st_ino}
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
u = resource.getrusage(resource.RUSAGE_SELF)
freeze = {'operation': a['operation'], 'actor': a['actor'], 'status': 'CLOSED', 'disposition': closed['disposition'],
    'grant': a['grant'], 'sourceSubject': pin(w / 'controls/source-subject.json'), 'sourcePostimages': pin(e / 'source-postimages.json'),
    'SourceChanges': 2, 'unchangedSource': 14, 'roots': [str(w), str(e)], 'completePhysicalPopulation': population,
    'counts': {'files': sum(row['type'] == 'file' for row in population), 'directories': sum(row['type'] == 'directory' for row in population),
               'symlinks': sum(row['type'] == 'symlink' for row in population), 'logicalBytes': sum(row.get('bytes', 0) for row in population)},
    'immutableRootControlsIncludedReadonly': True, 'selfExclusion': 'This final freeze alone is written after census; its byte/hash pin is returned to Root.',
    'freezeCost': {'elapsedMs': (time.monotonic()-start)*1000, 'userCPUSeconds': u.ru_utime, 'systemCPUSeconds': u.ru_stime,
                   'maxRSSPlatformBytes': u.ru_maxrss, 'HOME': os.environ['HOME'], 'defaultHeap': True},
    'outcome': str(e / 'return.json'), 'independentAcceptance': False}
save(e / 'freeze.json', freeze)
print(json.dumps({'status': 'CLOSED', 'disposition': closed['disposition'], 'freeze': pin(e / 'freeze.json'), 'counts': freeze['counts'],
                  'focused': closed['focused'], 'SourceChanges': 2, 'unchangedSource': 14, 'retries': 0}))
