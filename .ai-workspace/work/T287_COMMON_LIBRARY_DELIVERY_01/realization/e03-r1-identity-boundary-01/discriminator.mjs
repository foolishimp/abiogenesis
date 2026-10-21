import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const output = import.meta.dirname;
const started = new Date().toISOString();
const byteHash = value => createHash('sha256').update(value).digest('hex');
const readJson = async name => JSON.parse(await readFile(join(output, name), 'utf8'));
const save = async (name, value) => writeFile(join(output, name), JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
let frontier = { phase: 'preflight' };
const completed = [];
try {
  const preflight = await readJson('preflight.json');
  assert.equal(preflight.status, 'ready_for_pure_discriminator');
  for (const row of preflight.preExecutionInputs) {
    const path = join('/Users/jim/src/apps/abiogenesis', row.path);
    const bytes = await readFile(path);
    assert.equal(bytes.length, row.bytes, path);
    assert.equal(byteHash(bytes), row.sha256, path);
  }
  assert.equal(process.execPath, '/opt/homebrew/Cellar/node/24.7.0/bin/node');
  assert.equal(process.version, 'v24.7.0');
  const expected = await readJson('expected.json');
  const fixtureText = await readFile(join(output, 'native-fixture-functions.js.txt'), 'utf8');
  const fixturePin = preflight.sourceCorrespondence.find(row => row.extracted).extracted;
  assert.equal(byteHash(fixtureText), fixturePin.sha256);
  const cuts = {};
  for (const [name, root] of [['baseline', preflight.baselineTenant], ['successor', preflight.successorTenant]]) {
    frontier = { phase: 'definition_loading', cut: name };
    const load = path => import(pathToFileURL(join(root, path)).href);
    const [p, g, m, budgetOwner, intake, lifecycle] = await Promise.all([
      'build/code/src/product/index.js', 'build/code/src/gtl/index.js',
      'build/code/src/product/semantic_job.js', 'build/code/src/product/worksite_command_execution.js',
      'test_env/support/t287-generic-job-intake.mjs', 'test_env/support/t287-generic-job-lifecycle.mjs'
    ].map(load));
    for (const key of ['constructSemanticJobInput', 'constructSemanticJobEnvelope', 'canonicalJson', 'sha256Canonical']) assert.equal(typeof p[key], 'function', name + ':' + key);
    for (const key of ['deriveSemanticJobAsset', 'deriveSemanticJobAssessment', 'projectSemanticJobActorContract', 'nativeSemanticCommandExecutionLimits', 'isSemanticJobEnvelope']) assert.equal(typeof m[key], 'function', name + ':' + key);
    assert.equal(typeof budgetOwner.projectWorksiteCommandExecutionBudget, 'function');
    assert.equal(typeof intake.ordinaryJob, 'function');
    assert.equal(typeof lifecycle.genericLifecyclePublicationData, 'function');
    const zero = 'sha256:' + '0'.repeat(64);
    const publicationInput = { productId: p.ABI5_PRODUCT_ID, packageName: p.ABI5_PACKAGE_NAME,
      packageVersion: p.ABI5_PACKAGE_VERSION, artifactDigest: zero, productContentDigest: zero, productManifestDigest: zero };
    const publication = g.constructSemanticStageModulePublication(publicationInput);
    const prior = lifecycle.genericLifecyclePublicationData({ product: p, gtl: g, abiPublication: publication }).semanticJobLifecycle;
    const declaration = g.constructSemanticJobLifecycleDeclaration({ ...prior, proofTemplates: prior.proofTemplates.map(t => ({ ...t, realizationContractRef: g.NATIVE_WORKSPACE_WORK_IDS.observationContractRef })) });
    const fixture = new Function('p', 'declaration', 'process', 'Buffer', fixtureText + '\nreturn { candidate, verdict };')(p, declaration, process, Buffer);
    cuts[name] = { p, g, m, budgetOwner, intake, declaration, fixture, fixtures: {} };
    await save(name + '-definition.json', { root, publicationInput, declaration,
      declarationDigest: p.sha256Canonical(declaration), claim: 'Component definition inputs only; zero publication coordinates are not an installed identity.' });
  }
  const canonical = cuts.baseline.p.canonicalJson;
  const equal = (left, right, message) => assert.equal(canonical(left), canonical(right), message);
  equal(cuts.baseline.declaration, cuts.successor.declaration, 'same canonical lifecycle declaration across cuts');
  await mkdir(join(output, 'fixtures'));
  await mkdir(join(output, 'contracts'));
  for (const mode of expected.modes) {
    for (const name of ['baseline', 'successor']) {
      frontier = { phase: 'canonical_fixture_construction', cut: name, mode };
      const { p, g, m, intake, declaration, fixture } = cuts[name];
      const explicitLimits = mode === 'explicit' ? expected.limits : undefined;
      const retained = mode === 'retained';
      const selectedDeclaration = mode === 'null' ? declaration : g.constructSemanticJobLifecycleDeclaration({ ...declaration, bounds: { ...declaration.bounds, maxCommands: 32 } });
      const initial = intake.ordinaryJob(p, g, 'Build an application and an independent verifier. Preserve complete source and all unresolved obligations.');
      const job = p.constructSemanticJobInput({ ...initial, evaluationData: { independentSentinel: 'evaluator-only-9bff' },
        taskData: { ...initial.taskData, nativeLifecycle: { assets: declaration.stages.map((s, i) => ({ stageRef: s.declarationRef, path: `assets/${i}.json` })),
          rubricPath: 'assets/rubric.json', ...(retained ? { commandExecutionLimits: expected.limits } : {}) } },
        worksiteScope: { ...initial.worksiteScope, readRoots: ['.'], writeRoots: ['.'], parentWriteRoots: ['.'], evidenceWriteRoots: ['evidence'],
          ...(mode === 'null' ? {} : { executableCapabilities: initial.worksiteScope.executableCapabilities.map(c => ({ ...c, maxTimeoutMs: 120000, maxTerminationGraceMs: 1000 })) }) } });
      const coordinate = { invocationAdmissionRef: 'component:invocation', rootExecutionBasisRef: 'component:root', rootInputRef: 'component:input',
        rootInputDigest: p.sha256Canonical(job), intakeCCallRef: 'component:intake', intakeCCallDigest: p.sha256Canonical('intake'), intakeExecutionBasisRef: 'component:intake-basis' };
      let envelope = p.constructSemanticJobEnvelope(job, selectedDeclaration, coordinate);
      const states = { 'intent-author': envelope };
      const source = (label, input) => ({ cCallRef: 'component-only:' + label, inputDigest: p.sha256Canonical(input), actorInvocationRef: 'component-only:' + label,
        promptDigest: p.sha256Canonical('prompt:' + label), transportDigest: p.sha256Canonical('transport:' + label) });
      const steps = [{ operation: 'constructSemanticJobEnvelope', job, declaration: selectedDeclaration, coordinate, output: envelope }];
      await save(`fixtures/${name}-${mode}-intake.json`, steps[0]);
      assert.ok(m.isSemanticJobEnvelope(envelope));
      for (let i = 0; i < 4; i++) {
        const stageRef = declaration.stages[i].declarationRef;
        if (i === 3) states['design-author'] = envelope;
        const raw = fixture.candidate(envelope, i), origin = source('author' + i, envelope);
        let issues = null;
        const authored = m.deriveSemanticJobAsset(envelope, stageRef, raw, origin, [], value => { issues = value; }, explicitLimits);
        const authorStep = { operation: 'deriveSemanticJobAsset', stageRef, input: envelope, candidate: raw, source: origin, retainedTerms: [],
          explicitLimits: explicitLimits ?? null, output: authored, issues };
        await save(`fixtures/${name}-${mode}-${i}-author.json`, authorStep);
        assert.ok(authored, `${name}/${mode}/${i}: canonical author derivation`);
        assert.ok(m.isSemanticJobEnvelope(authored));
        steps.push(authorStep);
        if (i === 0) states['intent-assessor'] = authored;
        if (i === 3) { states['design-assessor'] = authored; break; }
        const verdict = fixture.verdict(authored, i), assessmentSource = source('assessor' + i, authored);
        const assessed = m.deriveSemanticJobAssessment(authored, stageRef, verdict, assessmentSource, [], explicitLimits);
        const assessorStep = { operation: 'deriveSemanticJobAssessment', stageRef, input: authored, candidate: verdict, source: assessmentSource,
          retainedTerms: [], explicitLimits: explicitLimits ?? null, output: assessed };
        await save(`fixtures/${name}-${mode}-${i}-assessor.json`, assessorStep);
        assert.ok(assessed, `${name}/${mode}/${i}: canonical assessor derivation`);
        assert.ok(m.isSemanticJobEnvelope(assessed));
        steps.push(assessorStep);
        envelope = assessed;
      }
      cuts[name].fixtures[mode] = { states, steps };
    }
    equal(cuts.baseline.fixtures[mode].steps, cuts.successor.fixtures[mode].steps, mode + ': identical canonical input and derived fixture steps');
  }
  function differences(a, b, path = '$') {
    if (canonical(a) === canonical(b)) return [];
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return [{ path, baseline: a, successor: b }];
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
    return keys.flatMap(key => !(key in a) ? [{ path: `${path}.${key}`, baselineAbsent: true, successor: b[key] }]
      : !(key in b) ? [{ path: `${path}.${key}`, baseline: a[key], successorAbsent: true }]
      : differences(a[key], b[key], `${path}.${key}`));
  }
  for (const mode of expected.modes) {
    for (const cut of expected.cuts) {
      frontier = { phase: 'actor_contract_projection', mode, cut };
      const role = cut.endsWith('-author') ? 'author' : 'assessor';
      const stageIndex = cut.startsWith('intent-') ? 0 : 3;
      const envelope = cuts.baseline.fixtures[mode].states[cut];
      equal(envelope, cuts.successor.fixtures[mode].states[cut], 'identical envelope supplied to both owners');
      const stageRef = envelope.declaration.stages[stageIndex].declarationRef;
      const explicitLimits = mode === 'explicit' ? expected.limits : undefined;
      const operand = { envelope, stageRef, role, retainedTerms: [], explicitLimits: explicitLimits ?? null, route: mode };
      await save(`contracts/${mode}-${cut}-input.json`, operand);
      const records = {};
      for (const name of ['baseline', 'successor']) {
        const { p, m, budgetOwner } = cuts[name];
        const contract = m.projectSemanticJobActorContract(envelope, stageRef, role, [], explicitLimits);
        const repeat = m.projectSemanticJobActorContract(envelope, stageRef, role, [], explicitLimits);
        const retainedExplicit = mode === 'retained' ? m.projectSemanticJobActorContract(envelope, stageRef, role, [], expected.limits) : null;
        const selectedDesign = role === 'assessor' ? envelope.assets.find(a => a.stageRef === stageRef)?.candidate.design : null;
        const actualBudget = mode === 'null' ? null : budgetOwner.projectWorksiteCommandExecutionBudget(selectedDesign ?? { commands: [], outcomePredicates: [] });
        records[name] = { contract, canonicalContract: p.canonicalJson(contract), canonicalContractSha256: p.sha256Canonical(contract),
          repeat, repeatCanonicalContract: p.canonicalJson(repeat), retainedExplicit,
          retainedLimitLookup: m.nativeSemanticCommandExecutionLimits(envelope), selectedDesign: selectedDesign ?? null, actualBudget };
      }
      const actual = { inputCanonicalDigest: cuts.baseline.p.sha256Canonical(operand), records,
        differences: differences(records.baseline.contract, records.successor.contract) };
      await save(`contracts/${mode}-${cut}-actual.json`, actual);
      for (const name of ['baseline', 'successor']) {
        const { contract, repeat, retainedExplicit, retainedLimitLookup, actualBudget } = records[name];
        equal(contract, repeat, `${name}/${mode}/${cut}: deterministic same-cut rederivation`);
        const { contractDigest, ...body } = contract;
        assert.equal(contractDigest, cuts[name].p.sha256Canonical(body), 'canonical complete-body identity');
        equal(retainedLimitLookup, mode === 'retained' ? expected.limits : null, 'owner-selected retained-limit route');
        if (mode === 'retained') equal(contract, retainedExplicit, 'same retained and explicit selected limits');
        if (mode === 'null') assert.equal(Object.hasOwn(contract.design, 'executionCapacity'), false);
        else {
          equal(contract.design.executionCapacity.selectedLimits, expected.limits, 'exact limit carrier conserved');
          equal(contract.design.executionCapacity.budgetRule, expected[name + 'Rule'], 'literal owner rule');
          const designCase = cut === 'design-assessor';
          equal(contract.design.executionCapacity.currentCandidate, designCase ? expected.designBudget[name] : null, 'literal capacity projection');
          const { rule, ...numeric } = actualBudget;
          const { compatible, ...designNumbers } = expected.designBudget[name];
          equal(rule, expected[name + 'Rule'], 'canonical budget owner rule');
          equal(numeric, designCase ? designNumbers : expected.emptyBudget, 'independent literal budget numbers');
        }
      }
      if (mode === 'null') equal(records.baseline.contract, records.successor.contract, 'whole null-limit contract exact equality');
      else {
        const wanted = structuredClone(records.baseline.contract);
        wanted.design.executionCapacity.budgetRule = structuredClone(expected.successorRule);
        if (cut === 'design-assessor') wanted.design.executionCapacity.currentCandidate = structuredClone(expected.designBudget.successor);
        const { contractDigest: ignoredOldBodyDigest, ...expectedBody } = wanted;
        wanted.contractDigest = cuts.baseline.p.sha256Canonical(expectedBody);
        equal(records.successor.contract, wanted, 'complete successor equals exact named-field transformation');
        assert.notEqual(records.baseline.contract.contractDigest, records.successor.contract.contractDigest, 'nonnull rule changes complete body identity');
      }
      const row = { mode, cut, stageRef, role, inputCanonicalDigest: actual.inputCanonicalDigest,
        baselineContractDigest: records.baseline.contract.contractDigest, successorContractDigest: records.successor.contract.contractDigest,
        exactAcrossCuts: canonical(records.baseline.contract) === canonical(records.successor.contract), differences: actual.differences,
        deterministicWithinEachCut: true, status: 'passed' };
      completed.push(row);
      await save(`contracts/${mode}-${cut}-comparison.json`, row);
    }
  }
  assert.equal(completed.length, expected.pairCount);
  const result = { activation: 'E03-R1-IDENTITY-BOUNDARY-01', status: 'bounded_pure_identity_discriminator_passed', started, finished: new Date().toISOString(),
    node: { executable: process.execPath, version: process.version }, preflightSha256: byteHash(await readFile(join(output, 'preflight.json'))),
    expectedSha256: byteHash(await readFile(join(output, 'expected.json'))), comparisons: completed,
    counts: { pairs: completed.length, nonnullIdentityDeltas: completed.filter(r => !r.exactAcrossCuts).length,
      nullLimitExactEqualities: completed.filter(r => r.exactAcrossCuts).length },
    exclusions: ['authenticated runtime assembly', 'historical continuation or refusal execution', 'original-package selection',
      'EventStore or replay', 'child/native/command/HTTP/Public/installed workloads', 'combined candidate identity', 'independent acceptance'],
    physicalFixture: 'none constructed; all worksite and actor coordinates are component data only' };
  await save('result.json', result);
  console.log(JSON.stringify({ status: result.status, counts: result.counts }));
} catch (error) {
  await save('first-failure.json', { activation: 'E03-R1-IDENTITY-BOUNDARY-01', started, failed: new Date().toISOString(), frontier, completed,
    error: { name: error?.name, message: error?.message, code: error?.code, stack: error?.stack, actual: error?.actual, expected: error?.expected } });
  console.error(error);
  process.exitCode = 1;
}
