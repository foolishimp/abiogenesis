"""Pure finite input projection. Never imports or invokes a Product/helper owner."""
import copy
import hashlib
import json
import pathlib
import re
import stat

REPO = pathlib.Path('/Users/jim/src/apps/abiogenesis')
G = REPO / '.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'
Q = G / 'final-qualification-inputs-03'
OLD = G / 'final-qualification-inputs-02'
C = G / 'final-candidate-construction-03'
C2 = G / 'final-candidate-construction-02'
TR = 'build_tenants/abiogenesis/typescript/'
S = C / 'final-source'
T = C / 'final-stage' / TR
SELECT = 'selection://abiogenesis/rc1/final-qualification-inputs-03/source-and-material'
assert not (Q / 'freeze.json').exists(), 'CLOSED preparation is immutable'


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()


def digest(value):
    return 'sha256:' + sha(canonical(value))


def read(p):
    return json.loads(pathlib.Path(p).read_bytes())


def put(name, value):
    p = Q / name
    assert p.parent == Q and name not in ['request.txt', 'activation.json', 'freeze.json']
    p.write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')
    return record(p)


def record(p):
    p = pathlib.Path(p)
    raw = p.read_bytes()
    return {'path': str(p), 'bytes': len(raw), 'sha256': sha(raw)}


def file_row(origin, target, classification, member_ref=None, **extra):
    info = record(origin)
    info.pop('path')
    result = {**info, 'origin': str(origin), 'target': target,
              'classification': classification, 'mode': stat.S_IMODE(pathlib.Path(origin).stat().st_mode), **extra}
    if member_ref is not None:
        result['memberRef'] = member_ref
    return result


def role(p):
    if p.startswith('.ai-workspace/tickets/'): return ['qualification']
    if p in ['AGENTS.md', 'CLAUDE.md']: return ['execution_contract']
    if p.startswith('specification/') or p == 'stdo_abiogenesis.json': return ['constitutional']
    if p.startswith(TR + 'design/'): return ['design']
    if p.startswith(TR + 'test_env/'): return ['proof']
    if p.startswith(TR + 'scripts/'): return ['execution_contract']
    if p.startswith(TR + 'contracts/qualification/'): return ['qualification']
    if p.startswith(TR + 'contracts/'): return ['public_contract']
    if p.endswith('product-toolchain-manifest.json') or p.endswith('package.json') or p.endswith('package-lock.json'): return ['manifest']
    if p.startswith(TR + 'code/') or p.startswith(TR + 'build/'): return ['code']
    return ['constitutional']


def member(ref, p, raw, roles):
    return {'ref': ref, 'path': p, 'digest': 'sha256:' + sha(raw), 'byteCount': len(raw),
            'surfaceRoles': roles, 'classificationEvidenceRefs': [SELECT]}


for p, expected in [(C / 'final-freeze.json', 'a4095d2a472f234d32bf063c5433b59003c536d66455ebed011ef7f7472f8d8a'),
                    (OLD / 'freeze.json', 'a4c2b5afd94fd7402b6bbfc732e691eb345dbcf4334a0300de490f607b9aad79'),
                    (G / 'rc1-c03-acceptance-01/acceptance.json', 'bc9b3004543d2338487cb76f8ab98f44181d1b0a58421a53d2d734a4a0491e5f')]:
    assert sha(p.read_bytes()) == expected

source = read(C / 'final-source-members.json')
generated = read(C / 'final-generated-after.json')
src_map = {r['path']: r for r in source}
gen_map = {r['path']: r for r in generated}
old_inventory = {m['ref']: m for m in read(OLD / 'qualification-inventory.json')['members']}
effective, donor = [], []
for r in source:
    p = r['path']
    body = S / p
    raw = body.read_bytes()
    assert (len(raw), sha(raw)) == (r['bytes'], r['sha256'])
    staged = gen_map.get(p[len(TR):]) if p.startswith(TR) else None
    derived = staged is not None and staged['role'] == 'derived_authority_copy'
    if derived:
        actual = T / staged['path']
        actual_raw = actual.read_bytes()
        assert (len(actual_raw), sha(actual_raw)) == (staged['bytes'], staged['sha256'])
        donor.append({'path': p, 'origin': str(body), 'bytes': len(raw), 'sha256': sha(raw),
                      'memberRef': 'construction-input://abiogenesis/c03/' + p,
                      'derivedOrigin': str(actual), 'derivedBytes': len(actual_raw), 'derivedSHA256': sha(actual_raw),
                      'changed': raw != actual_raw, 'sourceAuthor': r['sourceAuthor'],
                      'copyBuildAuthor': r['copyBuildAuthor'], 'role': 'immutable_authority_input_preimage'})
        body, raw = actual, actual_raw
    effective.append({'path': p, 'bytes': len(raw), 'sha256': sha(raw), 'origin': str(body),
                      'role': 'current_derived_authority' if derived else 'selected_source',
                      'sourceAuthor': r['sourceAuthor'], 'copyBuildAuthor': r['copyBuildAuthor']})
for r in generated:
    if r['role'] != 'generated_output': continue
    p = TR + r['path']; raw = (T / r['path']).read_bytes()
    assert p not in src_map and (len(raw), sha(raw)) == (r['bytes'], r['sha256'])
    effective.append({'path': p, 'bytes': len(raw), 'sha256': sha(raw), 'origin': str(T / r['path']),
                      'role': 'generated_output', 'sourceAuthor': 'derived; no source authorship assigned',
                      'copyBuildAuthor': '/root/rc1_successor_builder'})
effective.sort(key=lambda r: r['path'])
assert len(effective) == 1936 and len({r['path'] for r in effective}) == 1936
assert len(donor) == 96 and sum(r['changed'] for r in donor) == 12
put('source-inventory.json', effective)
put('donor-authority-preimages.json', donor)

expected = []
for base in ['build', 'contracts', 'product-toolchain-manifest.json']:
    root = T / base
    for p in ([root] if root.is_file() else sorted(root.rglob('*'))):
        if not p.is_file(): continue
        assert not p.is_symlink()
        raw = p.read_bytes()
        expected.append({'path': str(p.relative_to(T)), 'bytes': len(raw), 'sha256': sha(raw)})
expected.sort(key=lambda r: r['path'])
assert len(expected) == 927
expected_record = put('expected-output-inventory.json', {
    'basisInventorySha256': sha((Q / 'source-inventory.json').read_bytes()), 'paths': expected,
    'roles': {'emittedOrGenerated': 830, 'derivedAuthorityCopies': 96, 'unchangedRC1DefaultLibraryStandard': 1},
    'basis': 'actual accepted C03 stage; source preimages are a distinct conserved input population'})

source_files = []
for r in source:
    p = r['path']
    if not p.startswith(TR) or p.startswith(TR + 'design/') or p == TR + '.gitignore': continue
    ref = ('construction-input://abiogenesis/c03/' if p[len(TR):] in gen_map and gen_map[p[len(TR):]]['role'] == 'derived_authority_copy' else 'repo://abiogenesis/') + p
    source_files.append(file_row(S / p, 'subject/' + p[len(TR):], 'selected_build_or_proof_source', ref,
                                 path=p[len(TR):], role='selected_source', sourceAuthor=r['sourceAuthor'], copyBuildAuthor=r['copyBuildAuthor']))
for r in read(C / 'final-schema-seeds.json'):
    p = str(pathlib.Path(r['path']).relative_to(pathlib.Path('final-stage') / TR))
    source_files.append(file_row(pathlib.Path(r['origin']), 'subject/' + p, 'declared_schema_seed', 'repo://abiogenesis/' + TR + p,
                                 path=p, role='schema_seed', sourceAuthor='existing frozen generator seed', copyBuildAuthor='/root/rc1_successor_builder'))
source_files.sort(key=lambda r: r['path'])
assert len(source_files) == 693

authority = []
for r in read(C / 'final-authority-joins.json'):
    if not r['ref'].startswith('repo://abiogenesis/'): continue
    p = r['ref'][len('repo://abiogenesis/'):]
    authority.append(file_row(S / p, 'authority-source/' + p, 'current_authority_source', r['ref'], path=p,
                              stageDestination=r['path'], sourceAuthor=src_map[p]['sourceAuthor'], copyBuildAuthor=src_map[p]['copyBuildAuthor']))
assert len(authority) == 87
law = []
for r in read(C / 'final-law-verification.json')['members']:
    p = str(pathlib.Path(r['path']).relative_to('final-law'))
    law.append(file_row(C / r['path'], 'law-source/currentRC2/' + p, 'immutable_current_RC2_law',
                         'stdo://releases/v2.5.1-rc.2/' + p, path=p))
assert len(law) == 53

tools, links = [], []
for r in read(C / 'toolchain-pins.json')['records']:
    relative = str(pathlib.Path(r['path']).relative_to('source-freeze/toolchain'))
    if r['kind'] == 'symlink':
        assert (C / r['path']).is_symlink() and (C / r['path']).readlink().as_posix() == r['target']
        links.append({'path': relative, 'target': r['target'], 'origin': str(C / r['path']), 'role': 'recorded_tool_link_not_an_observed_file'})
    else:
        row = file_row(C / r['path'], 'toolchain/' + relative, 'frozen_execution_tool', 'toolchain-input://abiogenesis/c03/' + relative, path=relative)
        assert (row['bytes'], row['sha256']) == (r['bytes'], r['sha256'])
        tools.append(row)
assert len(tools) == 2313 and len(links) == 15
put('toolchain-links.json', links)
put('npm-toolchain-inventory.json', {'files': tools, 'links': links, 'origin': 'C03 frozen tools reused, no new resolution'})

dependencies = []
for i, r in enumerate(read(C / 'dependency-pins.json')['members']):
    dependencies.append(file_row(C / r['preparedArchive']['path'], f'dependency-inputs/{i:02d}.tgz', 'locked_dependency_archive',
                                  'dependency-input://abiogenesis/c03/' + r['locator'], locator=r['locator'], version=r['version'], integrity=r['integrity']))
assert len(dependencies) == 16

fixtures = []
retained_root = G / 'f11-law-stage-repair-01/source-fixtures/retainedRC1'
for p in sorted(retained_root.rglob('*')):
    if p.is_file():
        rel = str(p.relative_to(retained_root))
        fixtures.append(file_row(p, 'fixture-inputs/retainedRC1/source/' + rel, 'retained_RC1_component_source',
                                  'fixture-input://abiogenesis/q03/retainedRC1/source/' + rel, path=rel, fixtureClass='historical_component_only'))
retained_law = C2 / 'source-freeze/stdo'
for p in sorted(retained_law.rglob('*')):
    if p.is_file():
        rel = str(p.relative_to(retained_law))
        fixtures.append(file_row(p, 'fixture-inputs/retainedRC1/law/' + rel, 'retained_RC1_component_law',
                                  'fixture-input://abiogenesis/q03/retainedRC1/law/' + rel, path=rel, fixtureClass='historical_component_only'))
for rel in ['contracts/qualification/authority-inputs.json', 'contracts/qualification/rule-catalog.json',
            'contracts/qualification/law-basis.json', 'contracts/qualification/coverage.json',
            'contracts/schemas/self-conformance.schema.json']:
    fixtures.append(file_row(G / 'f11-carrier-realization-01/copied-tenant' / rel,
                              'fixture-inputs/retainedRC1/reproduction/' + rel, 'retained_RC1_component_reproduction',
                              'fixture-input://abiogenesis/q03/retainedRC1/reproduction/' + rel, path=rel, fixtureClass='historical_component_only'))
carrier = G / 'final-f11-bound-assessment-01/assessment-input.json'
assert sha(carrier.read_bytes()) == '10ebbf15a389ca5d15c7d84ed4feb1cafe63dc2b5be1c3f717229c65c5a29901'
fixtures.append(file_row(carrier, 'fixture-inputs/carrier/assessment-input.json', 'retained_1950_member_carrier_component_fixture',
                          'fixture-input://abiogenesis/q03/carrier/assessment-input.json', path='assessment-input.json', fixtureClass='historical_component_only'))
assert len(fixtures) == 102
put('fixture-inventory.json', {'members': fixtures, 'meaning': 'explicit unchanged component subjects; never current C03 qualification material'})

manifest = {'kind': 'finite_observed_qualification_input_manifest',
            'candidate': {'freeze': record(C / 'final-freeze.json'), 'sourceFreeze': read(C / 'final-freeze.json')['sourceFreeze'],
                          'contentDigest': 'sha256:216194ac4393489ddb7553caccd243a24a5d75399cb9400e9e01faeb2321e379',
                          'productManifestDigest': 'sha256:cb7b8045e769fa6c019e599e5aef932827d915ce9de11a91cfcb5946a9eb153d'},
            'sourceFiles': source_files, 'sourceBytes': sum(r['bytes'] for r in source_files),
            'authoritySources': authority, 'lawMembers': law, 'toolFiles': tools, 'fixtureFiles': fixtures,
            'dependencies': dependencies, 'dependencyBytes': sum(r['bytes'] for r in dependencies),
            'excluded': ['all runtime/native/assessment/admission/provider bindings and results', 'mutable method source', 'other installations', 'old qualification results as current results'],
            'inputOutputSeparation': {'donorAuthorityInputs': 'donor-authority-preimages.json', 'donorCount': 96,
                                      'changedDerivedCount': 12, 'currentDerivedLaw': str(T / 'contracts/qualification/law-basis.json')}}
put('input-manifest.json', manifest)

selected = copy.deepcopy(read(OLD / 'test-selection.json'))
tests = selected['tests']
for t in tests:
    t['originalQ02Selection'] = record(OLD / 'test-selection.json')
    t['sourceOracle'] = record(S / TR / t['files'][0])
    t['meaning'] = 'Q02 exact title/oracle meaning retained; code body is accepted C03 selected source'
carrier_titles = re.findall(r"test\('([^']+)'", (S / TR / 'test_env/tests/t287-qualification-carrier-resource.test.mjs').read_text())
context_titles = re.findall(r"test\('([^']+)'", (S / TR / 'test_env/tests/t287-qualification-producer-context.test.mjs').read_text())
law_titles = ["qualification law and every rule span bind the selected frozen source bytes",
              "coverage declarations preserve retained behavior without execution slots or fabricated results",
              "authority staging and ordinary reproduction bind retainedRC1's exact Definition-selected release",
              "authority staging and ordinary reproduction bind selectedRC2's exact Definition-selected release",
              "authority staging refuses wrong manifest and altered selected member before writing",
              "authority staging refuses a crossed release identity or member-set even with a matching manifest byte digest"]
assert len(carrier_titles) == 7 and len(context_titles) == 4
for name, titles, selection_kind, meaning in [
    ('t287-qualification-carrier-resource', carrier_titles[:6], 'exact_names', 'exact old 1950-member RC1 carrier fixture; current code resource conservation, acquisition and fresh consumer refusal only'),
    ('t287-qualification-law', law_titles, 'whole_file', 'actual current RC2 law/spans plus separately frozen retained RC1 staging reproduction and current RC2 negatives'),
    ('t287-qualification-producer-context', context_titles, 'whole_file', 'actual current source code context/currentness and foreign/duplicate owner negatives; component proof only')]:
    p = 'test_env/tests/' + name + '.test.mjs'
    tests.append({'commandId': 'command://abiogenesis/rc1-qual056/' + name, 'files': [p], 'selectedTitles': titles,
                  'expectedTestCount': len(titles), 'selectionKind': selection_kind, 'premises': 'component lower-native/source fixtures; no native Run, provider, actual current qualification or human acceptance',
                  'meaning': meaning, 'sourceOracle': record(S / TR / p),
                  'supportPaths': ['test_env/support/t287-generic-job-worksite.mjs', 'test_env/support/isolated-compiled-copy.mjs']})
selected['totalSelectedTitles'] = sum(t['expectedTestCount'] for t in tests)
selected['groups'] = len(tests)
selected['explicitlyUnselected'] = [{'file': 'test_env/tests/t287-qualification-carrier-resource.test.mjs', 'title': carrier_titles[6],
    'reason': 'Pins old RC1 whole-F11 basis but imports actual current RC2 tenant law. No source mutation, crossed-law fixture or skipped-test green; whole current C03 installed F11 is a separate pending discriminator.'},
    {'file': 'test_env/tests/t287-qualification-producer-acquisition-reuse.test.mjs',
     'reason': 'Three historical real-history owner compositions already separately accepted at original exact fixture. This preparation selects current context checks and carrier cold consumer cases, not another old installation-dependent campaign.'}]
assert selected['totalSelectedTitles'] == 46 and len(tests) == 8
put('test-selection.json', selected)

lint = [{'path': r['path'], 'kind': pathlib.Path(r['path']).suffix[1:]} for r in source_files if pathlib.Path(r['path']).suffix in ['.mjs', '.json']]
assert len(lint) == 332 and len({r['path'] for r in lint}) == 332
put('lint-population.json', lint)
claims = copy.deepcopy(read(OLD / 'release-claims.json'))
claims['scope'] = claims['scope'].replace('STDO v2.5.1-rc.1', 'STDO v2.5.1-rc.2')
put('release-claims.json', claims)
current_method = read(T / 'contracts/qualification/authority-inputs.json')['method']
retained_method = read(G / 'f11-carrier-realization-01/copied-tenant/contracts/qualification/authority-inputs.json')['method']
put('staging-fixtures.json', {
    'retainedRC1': {'sourceRoot': '.fixtures/retainedRC1/source', 'releaseRoot': '.fixtures/retainedRC1/law',
                    'expectedMethod': retained_method, 'reproductionRoot': '.fixtures/retainedRC1/reproduction'},
    'selectedRC2': {'sourceRoot': '.authority-source', 'releaseRoot': '.law-source/currentRC2', 'expectedMethod': current_method}})

config = copy.deepcopy(read(OLD / 'config.json'))
commands = config['commands']
for command in commands:
    root_command = command['relativeCwd'] == '.'
    command['executable'] = './toolchain/bin/node' if root_command else './.toolchain/bin/node'
    command['args'] = [a.replace('/opt/homebrew/lib/node_modules/npm/bin/npm-cli.js',
                                 'toolchain/npm/bin/npm-cli.js' if root_command else '.toolchain/npm/bin/npm-cli.js') for a in command['args']]
    for entry in command['environment']:
        if entry['name'] == 'PATH': entry['value'] = ('toolchain/bin' if root_command else '.toolchain/bin') + ':/usr/bin:/bin:/usr/sbin:/sbin'
stage_law = copy.deepcopy(next(c for c in commands if c['commandId'].endswith('/generate')))
stage_law.update(commandId='command://abiogenesis/rc1-qual056/stage-current-authorities',
                 args=['scripts/generate-qualification-rule-catalog.mjs', '--stage-authorities', '.authority-source', '.law-source/currentRC2'], timeoutMs=60000)
commands.insert(next(i for i, c in enumerate(commands) if c['commandId'].endswith('/generate')), stage_law)
test_template = copy.deepcopy(next(c for c in commands if c['commandId'].endswith('/t287-qualification-contraction')))
for t in tests[5:]:
    command = copy.deepcopy(test_template)
    command['commandId'] = t['commandId']
    command['args'] = test_template['args'][:-1]
    if t['selectionKind'] == 'exact_names':
        command['args'].append('--test-name-pattern=^(?:' + '|'.join(re.escape(title) for title in t['selectedTitles']) + ')$')
    command['args'].extend(t['files'])
    command['timeoutMs'] = 120000 if t['commandId'].endswith('/t287-qualification-law') else 60000
    if t['commandId'].endswith('/t287-qualification-carrier-resource'):
        command['environment'].extend([{'name': 'ABI5_F11_CARRIER_FULL_FIXTURE', 'value': '.fixtures/carrier/assessment-input.json'},
                                       {'name': 'ABI5_F11_CARRIER_REPORT', 'value': 'reports/carrier-component'}])
    if t['commandId'].endswith('/t287-qualification-law'):
        command['environment'].extend([{'name': 'ABG_QUALIFICATION_STAGE_FIXTURES', 'value': '.recipe/staging-fixtures.json'},
                                       {'name': 'ABG_QUALIFICATION_SOURCE_ROOT', 'value': '.authority-source'},
                                       {'name': 'ABG_QUALIFICATION_RELEASE_ROOT', 'value': '.law-source/currentRC2'}])
    commands.insert(len(commands) - 1, command)
config['outcomePredicates'] = [{'predicateId': c['commandId'] + '/exit', 'predicateKind': 'process_exit',
                               'declaration': {'validationCommandId': c['commandId'], 'equals': 0}} for c in commands] + [copy.deepcopy(read(OLD / 'config.json')['outcomePredicates'][-1])]
budget = sum(c['timeoutMs'] + c['terminationGraceMs'] for c in commands)
config['supervisionProposal'] = {'commandCapsAndGracesMs': budget, 'helperDispatchAndAckAllowanceMs': 5000,
    'requiredHelperBudgetMs': budget + 5000, 'ABG_TS_FP_TIMEOUT_MS': str(budget + 125000),
    'ABG_TS_FP_ABSOLUTE_TIMEOUT_MS': str(budget + 305000), 'outerC2PublicBudgetMs': budget + 905000,
    'outerDriverBudgetMs': budget + 1805000, 'status': 'finite proposal; actual runtime selection remains pending',
    'basis': 'sum of all exact declared command bounds and graces; new authority stage, six carrier/cold cases, six law cases and four current context cases; no command executed'}
config['claim'] = 'Prospective current C03 observed producer only. No current native execution, semantic adequacy, AF22 or release claim.'
assert len(commands) == 17 and len(config['outcomePredicates']) == 18
put('config.json', config)

normalized_commands = []
for i, c in enumerate(commands):
    n = {'kind': 'worksite_declared_command', 'schemaVersion': '5.0.0', 'ordinal': i, **copy.deepcopy(c)}
    n['environment'] = [{'kind': 'worksite_command_environment_entry', 'schemaVersion': '5.0.0', **e}
                        for e in sorted(c['environment'], key=lambda e: e['name'].lower())]
    n['expectedReports'] = [{'kind': 'worksite_expected_report', 'schemaVersion': '5.0.0', 'ordinal': j, **r}
                            for j, r in enumerate(c['expectedReports'])]
    normalized_commands.append(n)
normalized_predicates = [{'kind': 'worksite_outcome_predicate', 'schemaVersion': '5.0.0', 'ordinal': i, **p}
                         for i, p in enumerate(config['outcomePredicates'])]
territories = copy.deepcopy(read(OLD / 'configuration-binding.json')['allowedWriteTerritories'])
body = {k: territories[0][k] for k in ['ordinal', 'pathKind', 'relativePath', 'purpose']}
assert digest(body) == territories[0]['territoryDigest']
put('configuration-binding.json', {'commands': normalized_commands, 'predicates': normalized_predicates,
    'allowedWriteTerritories': territories, 'claim': 'Source-derived proposed serialization only; no installed constructor called, no A/W or task invented. Future actual owner normalization must match or stop before binding.'})
put('toolchain.json', {'node': tools[0] if tools[0]['path'] == 'bin/node' else next(t for t in tools if t['path'] == 'bin/node'),
    'nodeVersion': '24.7.0', 'npmVersion': '11.5.1', 'regularFiles': len(tools), 'recordedLinks': len(links),
    'executables': 'snapshot original toolchain/bin/node then verification/.toolchain/bin/node; mode preserved',
    'npm': 'same protected frozen npm bodies; future isolated offline cache and ci use existing sixteen exact archives',
    'PATH': 'finite relative frozen tool bin followed by /usr/bin:/bin:/usr/sbin:/sbin',
    'hostLibraryBasis': record(C2 / 'toolchain-host.json'), 'hostLibrariesReacquired': False,
    'dependencyCampaign': False, 'newNodeModulesOrToolEffects': False, 'originalRecords': record(C / 'toolchain-pins.json')})

# Recipe self is protected once but is not its own digest-bound auxiliary input.
recipe_names = ['input-manifest.json', 'expected-output-inventory.json', 'recipe-stage.mjs', 'compare-generated.mjs',
                'config.json', 'toolchain.json', 'npm-toolchain-inventory.json', 'toolchain-links.json',
                'test-environment.mjs', 'staging-fixtures.json', 'verification-recipe.json']
assert all((Q / name).is_file() for name in recipe_names if name != 'verification-recipe.json')
recipe_rows = [file_row(Q / name, 'recipe/' + name, 'declared_recipe', 'recipe-input://abiogenesis/q03/' + name)
               for name in recipe_names if name != 'verification-recipe.json']
source_inputs = source_files + authority
auxiliary = law + tools + fixtures + dependencies + recipe_rows
roles = []
for c in commands:
    tail = c['commandId'].split('/')[-1]
    command_role = 'test' if any(t['commandId'] == c['commandId'] for t in tests) else (
        'lint' if tail == 'lint' else 'compare' if tail == 'compare' else 'build' if tail in ['clean', 'compile', 'stage-current-authorities', 'generate'] else 'setup')
    roles.append({'commandId': c['commandId'], 'role': command_role})
recipe = {'kind': 'qualification_verification_recipe', 'schemaVersion': '1',
    'sourceInputs': [{'memberRef': r['memberRef'], 'relativePath': r['target']} for r in source_inputs],
    'auxiliaryInputs': [{'relativePath': r['target'], 'digest': 'sha256:' + r['sha256'], 'byteCount': r['bytes']} for r in auxiliary],
    'commandConfigurationDigest': digest(normalized_commands), 'predicateConfigurationDigest': digest(normalized_predicates),
    'writeTerritoriesDigest': digest(territories), 'commands': roles,
    'lint': {'commandId': 'command://abiogenesis/rc1-qual056/lint', 'files': lint},
    'tests': [{'commandId': t['commandId'], 'files': t['files']} for t in tests],
    'skipPolicy': 'incomplete', 'reportFormat': 'node-test-events-jsonl@1'}
put('verification-recipe.json', recipe)
recipe_rows.append(file_row(Q / 'verification-recipe.json', 'recipe/verification-recipe.json', 'declared_recipe',
                            'recipe-input://abiogenesis/q03/verification-recipe.json'))
protected = source_inputs + law + tools + fixtures + dependencies + recipe_rows
assert len({r['target'] for r in protected}) == len(protected)
put('protected-inputs.json', {'kind': 'complete_prospective_protected_input_population', 'members': protected,
    'counts': {'sourceAndSchemaSeeds': len(source_files), 'currentAuthoritySources': len(authority), 'currentRC2LawMembers': len(law),
               'toolRegularFiles': len(tools), 'componentFixtureFiles': len(fixtures), 'dependencyArchives': len(dependencies),
               'recipeFilesIncludingSelf': len(recipe_rows), 'total': len(protected)},
    'bytes': sum(r['bytes'] for r in protected), 'status': 'prepared_unobserved; no admitted O/input/task'})

members, origins = [], []
for r in effective:
    ref = 'repo://abiogenesis/' + r['path']
    roles_for_member = old_inventory.get(ref, {}).get('surfaceRoles', role(r['path']))
    members.append(member(ref, r['path'], pathlib.Path(r['origin']).read_bytes(), roles_for_member))
    origins.append({'ref': ref, **r})
for r in donor:
    members.append(member(r['memberRef'], '.qualification-material/construction-preimages/' + r['path'], pathlib.Path(r['origin']).read_bytes(), ['qualification']))
    origins.append({**r, 'ref': r['memberRef'], 'path': '.qualification-material/construction-preimages/' + r['path'], 'logicalInputPath': r['path']})
seen = {m['ref'] for m in members}
for r in protected:
    if r['memberRef'] in seen: continue
    target_path = '.qualification-material/' + r['target']
    roles_for_member = ['constitutional'] if r['classification'] == 'immutable_current_RC2_law' else ['proof'] if 'component' in r['classification'] or r['classification'].startswith('retained_') else ['execution_contract'] if r['classification'] in ['frozen_execution_tool', 'declared_recipe'] else ['manifest']
    members.append(member(r['memberRef'], target_path, pathlib.Path(r['origin']).read_bytes(), roles_for_member))
    origins.append({**r, 'ref': r['memberRef'], 'path': target_path, 'logicalInputPath': r.get('path')})
    seen.add(r['memberRef'])
# Ordinary caller source and explicit test/claim controls are applicable execution surfaces.
for name in ['recipe.mjs', 'output-checks.mjs', 'test-selection.json', 'lint-population.json', 'release-claims.json']:
    p = Q / name
    ref = 'recipe-input://abiogenesis/q03/' + name
    members.append(member(ref, '.qualification-material/recipe/' + name, p.read_bytes(), ['release_claim'] if name == 'release-claims.json' else ['proof'] if name.endswith('selection.json') or name == 'output-checks.mjs' else ['execution_contract']))
    origins.append({**record(p), 'ref': ref, 'path': '.qualification-material/recipe/' + name, 'origin': str(p), 'role': 'ordinary_caller_or_selection_control'})
controls = [(Q / 'activation.json', ['execution_contract']), (Q / 'request.txt', ['execution_contract']),
            (G / 'rc1-c03-acceptance-01/acceptance.json', ['qualification']),
            (G / 'final-c2-output-consumer-repair-01/freeze.json', ['proof']),
            (G / 'final-c2-output-consumer-review-01/freeze.json', ['proof'])]
suppliers = ['final-freeze.json', 'final-source-freeze-manifest.json', 'final-source-members.json',
             'final-archive-members.json', 'final-install-population.json', 'final-publication-bindings.json',
             'final-reader-binding.json', 'final-attribution.json', 'final-law-verification.json',
             'toolchain-pins.json', 'dependency-pins.json', 'final-schema-seeds.json']
controls.extend((C / name, ['qualification', 'manifest']) for name in suppliers)
controls.append((C2 / 'toolchain-host.json', ['manifest']))
for p, roles_for_member in controls:
    relative = str(p.relative_to(REPO))
    ref = 'repo://abiogenesis/' + relative
    members.append(member(ref, relative, p.read_bytes(), roles_for_member))
    origins.append({**record(p), 'ref': ref, 'path': relative, 'origin': str(p), 'role': 'immutable_control_or_supplier_manifest'})
members.sort(key=lambda m: m['ref'])
assert len({m['ref'] for m in members}) == len(members) and len({m['path'] for m in members}) == len(members)
roots = sorted(set(['repo://abiogenesis/' + root for root in ['build_tenants/abiogenesis/typescript/', 'specification/', 'stdo_abiogenesis.json', '.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md', 'AGENTS.md', 'CLAUDE.md', 'README.md']] +
                   ['construction-input://abiogenesis/c03/', 'toolchain-input://abiogenesis/c03/', 'dependency-input://abiogenesis/c03/',
                    'fixture-input://abiogenesis/q03/', 'recipe-input://abiogenesis/q03/', 'stdo://releases/v2.5.1-rc.2/'] +
                   ['repo://abiogenesis/' + str(p.relative_to(REPO)) for p, _ in controls]))
inventory_body = {'kind': 'qualification_subject_inventory', 'selectedRoots': roots, 'coverage': 'complete_claim', 'members': members}
inventory_digest = digest(inventory_body)
inventory = {**inventory_body, 'inventoryRef': 'qualification-inventory://abiogenesis/' + inventory_digest[7:], 'inventoryDigest': inventory_digest}
put('qualification-inventory.json', inventory)
put('inventory-origin-correspondence.json', origins)
put('recipe-member-names.json', recipe_names)

put('population-binding.json', {'status': 'prepared_unexecuted',
    'effectiveSourceAndGenerated': len(effective), 'selectedSourcePreimages': len(source), 'emittedGenerated': 830,
    'derivedAuthorityCopies': len(donor), 'changedDerivedAuthorityBodies': sum(r['changed'] for r in donor),
    'allQualificationMembers': len(members), 'inventory': {'ref': inventory['inventoryRef'], 'digest': inventory_digest},
    'protectedInputs': len(protected), 'sourceInputBindings': len(source_inputs), 'auxiliaryInputBindings': len(auxiliary),
    'commands': len(commands), 'predicates': len(config['outcomePredicates']), 'testGroups': len(tests), 'selectedTitles': selected['totalSelectedTitles'],
    'lintFiles': len(lint), 'expectedOutputs': len(expected), 'singleRecipeSelfInput': True,
    'q02': {'commands': 13, 'predicates': 14, 'groups': 5, 'titles': 30, 'protectedInputs': 716, 'outputs': 925,
            'meaning': 'prior original RC1 selection/oracles; never a C03 observed result'},
    'pending': ['actual A/W and grant', 'observed protected inputs and source set', 'Task/attempt/helper artifact and snapshot root',
                'actual C2 command/predicate/test/lint/compare reports and fresh Result/replay', 'actual material/selection admission',
                'whole current F11 independent assessment/J', 'AF22 installed_rc verdict and all missing scenario joins', 'AF25 publication/human original owner ruling/tapped-release']})
print(json.dumps({'qualificationInventory': {'ref': inventory['inventoryRef'], 'digest': inventory_digest, 'members': len(members)},
                  'protectedInputs': len(protected), 'protectedBytes': sum(r['bytes'] for r in protected),
                  'commands': len(commands), 'predicates': len(config['outcomePredicates']), 'titles': selected['totalSelectedTitles'],
                  'expectedOutputs': len(expected), 'commandCapsAndGracesMs': budget}))
