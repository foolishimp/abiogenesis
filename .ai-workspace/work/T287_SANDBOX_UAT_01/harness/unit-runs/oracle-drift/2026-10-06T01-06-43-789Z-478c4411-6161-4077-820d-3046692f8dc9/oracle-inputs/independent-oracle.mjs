import { readFile, readdir, lstat, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const fixtureRoot = dirname(fileURLToPath(import.meta.url));
const sha = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const unique = values => [...new Set(values)];
const equalSet = (left, right) => JSON.stringify(unique(left).sort()) === JSON.stringify(unique(right).sort());
const decodeStream = stream => stream?.encoding === 'base64' && typeof stream.payload === 'string'
  ? Buffer.from(stream.payload, 'base64').toString('utf8') : '';
const child = (root, path) => {
  if (typeof path !== 'string' || path.length === 0 || isAbsolute(path) || path.split(/[\\/]/u).includes('..')) {
    throw new TypeError('Oracle path must be relative and confined: ' + path);
  }
  const absolute = resolve(root, path), r = relative(root, absolute);
  if (r === '..' || r.startsWith('../') || isAbsolute(r)) throw new TypeError('Oracle path escapes its root');
  return absolute;
};
async function bytesAt(root, path) {
  const absolute = child(root, path);
  try {
    const real = await realpath(absolute), r = relative(root, real);
    if (r === '..' || r.startsWith('../') || isAbsolute(r)) throw new TypeError('Oracle file escapes through a symlink');
    return await readFile(real);
  } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
async function jsonAt(root, path) {
  const bytes = await bytesAt(root, path);
  return bytes === null ? null : JSON.parse(bytes.toString('utf8'));
}
async function xmlFiles(root, prefix = '') {
  const result = [];
  for (const entry of await readdir(child(root, prefix || '.')) ) {
    const path = prefix ? prefix + '/' + entry : entry;
    const metadata = await lstat(child(root, path));
    if (metadata.isDirectory()) result.push(...await xmlFiles(root, path));
    else if (metadata.isFile() && path.endsWith('.xml')) result.push(path);
  }
  return result;
}
function xmlText(value) {
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/giu, (match, entity) => {
    if (entity.startsWith('#x')) return String.fromCodePoint(parseInt(entity.slice(2), 16));
    if (entity.startsWith('#')) return String.fromCodePoint(Number(entity.slice(1)));
    return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[entity];
  });
}
function attributes(source) {
  return Object.fromEntries([...source.matchAll(/([\w:.-]+)\s*=\s*(["'])(.*?)\2/gsu)]
    .map(match => [match[1], xmlText(match[3])]));
}
/** Closed ScalaTest/JUnit XML profile, not an XML runtime or arbitrary parser.
 * Unknown or inconsistent report shapes remain non-green. */
export function parseScalaTestReport(bytes) {
  const source = bytes.toString('utf8'), roots = [...source.matchAll(/<testsuite\b([^>]*)>/gu)];
  if (roots.length !== 1 || !source.includes('</testsuite>') || /<!DOCTYPE|<!ENTITY/u.test(source)) {
    throw new TypeError('Expected one ordinary ScalaTest testsuite report');
  }
  const root = attributes(roots[0][1]);
  const integer = key => {
    const value = root[key] ?? (key === 'skipped' ? '0' : undefined);
    if (typeof value !== 'string' || !/^\d+$/u.test(value)) throw new TypeError('Missing integer XML count: ' + key);
    return Number(value);
  };
  const tests = integer('tests'), failures = integer('failures'), errors = integer('errors'), skipped = integer('skipped');
  const cases = [...source.matchAll(/<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/gu)].map(match => {
    const attr = attributes(match[1]);
    if (typeof attr.name !== 'string' || attr.name.length === 0) throw new TypeError('Missing executed test identity');
    return { name: attr.name, failure: /<failure\b/u.test(match[2] ?? ''), error: /<error\b/u.test(match[2] ?? ''), skipped: /<skipped\b/u.test(match[2] ?? '') };
  });
  if (cases.length !== tests || cases.filter(x => x.failure).length !== failures || cases.filter(x => x.error).length !== errors ||
    cases.filter(x => x.skipped).length !== skipped || failures + errors + skipped > tests) {
    throw new TypeError('Executed XML test identities and aggregate counters disagree');
  }
  return { tests, failures, errors, skipped, passes: tests - failures - errors - skipped,
    names: cases.map(x => x.name), failedNames: cases.filter(x => x.failure || x.error).map(x => x.name) };
}
function admittedCommandObservations(events, owner, validateObservation) {
  const observations = new Map();
  if (typeof owner?.graphFunctionRef !== 'string' || typeof owner.outputContractRef !== 'string' ||
    typeof owner.runId !== 'string' || owner.resultClass !== 'success' || typeof validateObservation !== 'function') return [];
  for (const event of Array.isArray(events) ? events : []) {
    const payload = event?.payload, value = payload?.value;
    if (event?.kind !== 'c_call_result_admitted' || event.graphFunctionRef !== owner.graphFunctionRef || event.runId !== owner.runId ||
      payload?.contractRef !== owner.outputContractRef || payload.resultClass !== owner.resultClass ||
      payload.valueKind !== 'worksite_command_execution_observation' || payload.cCallRef !== event.aggregateId ||
      value?.kind !== 'worksite_command_execution_observation' || typeof value.observationRef !== 'string' ||
      !Array.isArray(value.commandResults) || !Array.isArray(value.task?.commands)) continue;
    // The harness supplies the published installed C2 judgment relation. It
    // owns canonical row, environment, limit, report and task/result equality.
    // Embedded metadata under another producer or contract is never searched.
    try { if (validateObservation(value) === true) observations.set(value.observationRef, value); }
    catch { /* Missing or invalid owner support cannot earn oracle credit. */ }
  }
  return [...observations.values()];
}
function originalCommandMatches(declared, expected) {
  if (!declared || declared.commandId !== expected.commandId || declared.executable !== expected.executable ||
    !isDeepStrictEqual(declared.args, expected.args) || declared.relativeCwd !== expected.relativeCwd ||
    declared.timeoutMs !== expected.timeoutMs || declared.terminationGraceMs !== expected.terminationGraceMs ||
    !isDeepStrictEqual(declared.expectedReports?.map(({ reportIdentity, relativePath }) => ({ reportIdentity, relativePath })),
      expected.expectedReports?.map(({ reportIdentity, relativePath }) => ({ reportIdentity, relativePath })))) return false;
  if (Array.isArray(expected.environment)) return isDeepStrictEqual(declared.environment, expected.environment);
  if (!Array.isArray(declared.environment)) return false;
  // Exact explicitly named values are conservative checks. PATH_PREFIX and
  // its expansion belong to the original->task native preparation owner;
  // the public C2 relation checks the complete captured resulting environment.
  const values = new Map(declared.environment.map(row => [row.name, row.value]));
  return Object.entries(expected.environment ?? {}).every(([name, value]) =>
    name === 'PATH_PREFIX' || name === 'PATH' && Object.hasOwn(expected.environment ?? {}, 'PATH_PREFIX') || values.get(name) === value);
}
function commandMatches(actual, expected, declared) {
  if (!originalCommandMatches(declared, expected)) return false;
  return actual?.kind === 'worksite_command_result' && actual.commandId === expected.commandId &&
    actual.executable === declared.executable && isDeepStrictEqual(actual.args, declared.args) && actual.relativeCwd === declared.relativeCwd &&
    isDeepStrictEqual(actual.environment, declared.environment) && actual.timeoutMs === declared.timeoutMs &&
    actual.terminationGraceMs === declared.terminationGraceMs && Array.isArray(actual.reports) &&
    actual.reports.length === declared.expectedReports.length && actual.reports.every((report, index) =>
      report.expectedReportIdentity === declared.expectedReports[index].reportIdentity && report.relativePath === declared.expectedReports[index].relativePath) &&
    typeof actual.observationRef === 'string' && /^sha256:[a-f0-9]{64}$/u.test(actual.observationDigest ?? '') &&
    actual.timedOut === false && actual.terminationConfirmed === true;
}
function countNodePasses(command) {
  const stdout = decodeStream(command.stdout), stderr = decodeStream(command.stderr);
  const matches = [...(stdout + '\n' + stderr).matchAll(/(?:^|\r?\n)(?:#|ℹ) pass (0|[1-9]\d*)(?=\r?\n|$)/gu)];
  return matches.length !== 1 ? null : Number(matches[0][1]);
}

/** Independent test-owned mechanical oracle. The caller separately conjoins
 * native semantic assessment, canonical installed admission and fresh closure.
 * No donor source, resolver, runtime, output solution or executable is used. */
export async function evaluate({ worksiteRoot, runArchive, commands = [], events = [], source, request, observationOwner, validateObservation }) {
  const manifest = JSON.parse(await readFile(resolve(fixtureRoot, 'scenarios.json'), 'utf8'));
  const record = manifest.scenarios.find(row => row.key === source?.key || row.scenarioId === request?.scenarioId);
  if (!record) throw new TypeError('Unknown locally acquired UAT scenario');
  const oracle = await jsonAt(fixtureRoot, record.oracleFile);
  request ??= await jsonAt(fixtureRoot, record.requestFile);
  const root = await realpath(worksiteRoot), criteria = [];
  const add = (id, disposition, reason, evidenceRefs = []) => criteria.push({ id, disposition, evidenceRefs, reason });
  const observations = admittedCommandObservations(events, observationOwner, validateObservation);
  // Supplied command packets may help the caller locate artifacts; they do not
  // manufacture admission and cannot turn a worker report into execution truth.
  void commands;
  for (const member of request.sourceMembers) {
    const bytes = await bytesAt(root, member.path);
    add('original-source:' + member.path, bytes !== null && sha(bytes) === member.digest ? 'satisfied' : 'unmet',
      'The immutable acquired source/oracle must retain its exact bytes.', [member.path, member.digest]);
  }
  const matched = request.testing.commands.map(expected => observations.flatMap(observation => observation.commandResults
    .filter(actual => commandMatches(actual, expected, observation.task.commands.find(row => row.commandId === expected.commandId)))).at(-1));
  for (let index = 0; index < matched.length; index++) {
    const command = matched[index], expected = request.testing.commands[index];
    add('execution:' + expected.commandId, command === undefined ? 'indeterminate' : command.exitStatus === 0 ? 'satisfied' : 'unmet',
      command === undefined ? 'No exact selected C2 producer/contract/Run observation, publicly owner-validated against its task and the resolved original command, was supplied.' :
        'Actual exact original executable/argv/cwd/limits/reports and full owner-bound environment must terminate and exit zero.',
      command === undefined ? [] : [command.observationRef, command.observationDigest]);
  }
  for (const path of oracle.requiredArtifacts) {
    const bytes = await bytesAt(root, path);
    const projectedExecution = path === 'test-execution-result.json' && matched.some(command => command !== undefined);
    add('artifact:' + path, bytes !== null && bytes.length > 0 || projectedExecution ? 'satisfied' : 'unmet',
      projectedExecution && bytes === null ? 'Original execution-report meaning is represented by admitted native observations; no success file is prewritten.' :
        'Original required application/lifecycle artifact must exist; content adequacy is assessed independently by native UAT.', [path]);
  }
  if (record.key !== 'data-mapper-full') {
    const test = matched.at(-1), passes = test === undefined ? null : countNodePasses(test);
    add('original-test-floor', passes === null ? 'indeterminate' : passes >= oracle.minimumTestPasses ? 'satisfied' : 'unmet',
      'The real admitted original node:test plan must meet its unchanged pass floor.', test ? [test.observationRef] : []);
    if (record.key === 'basic-cli' || record.key === 'rust-cli') {
      const actual = matched[0];
      add('original-stdout', actual === undefined ? 'indeterminate' : decodeStream(actual.stdout) === 'Hello, world!\n' ? 'satisfied' : 'unmet',
        'Actual original CLI stdout must be exact.', actual ? [actual.observationRef] : []);
    }
    for (const declaration of request.testing.outcomePredicates.filter(row => row.predicateKind === 'module_export_return_exact')) {
      const actual = observations.flatMap(row => row.predicateObservations ?? []).filter(row => row.predicateId === declaration.predicateId).at(-1);
      add(declaration.predicateId, actual === undefined ? 'indeterminate' :
        JSON.stringify(actual.observedValue) === JSON.stringify(declaration.declaration.equals) ? 'satisfied' : 'unmet',
        'Exact exported behavior must be an actual admitted observation.', actual?.evidenceRefs ?? []);
    }
    if (record.key === 'rust-service') {
      // Tests in the exact source compile src/service.rs with rustc and make
      // real loopback HTTP requests. A TAP count alone cannot establish that.
      const expectedRoles = [
        ['compile', /\brustc\b/u], ['original source', /src\/service\.rs/u],
        ['loopback HTTP', /127\.0\.0\.1/u], ['actual request', /\b(?:fetch|request|get)\s*\(/u],
        ['HTTP status', /\b(?:status|statusCode)\b/u], ['exact body', /Hello, world!/u],
      ];
      for (const path of oracle.requiredTestFiles) {
        const bytes = await bytesAt(root, path), text = bytes?.toString('utf8') ?? '';
        add('service-test-contract:' + path, expectedRoles.every(([, pattern]) => pattern.test(text)) ? 'satisfied' : 'unmet',
          'Both independently assessed tests must compile the original rustc service and exercise real HTTP status/body. Static checks supply only a necessary condition.', [path]);
      }
    }
  } else {
    const reports = [];
    for (const path of oracle.requiredTestReportPaths) {
      const bytes = await bytesAt(root, path);
      if (bytes === null) { add('xml:' + path, 'unmet', 'Original named executed ScalaTest report is absent.', [path]); continue; }
      try { reports.push({ path, bytes, digest: sha(bytes), parsed: parseScalaTestReport(bytes) }); }
      catch (error) { add('xml:' + path, 'unmet', error.message, [path]); }
    }
    const base = 'build_tenants/scala_spark';
    let reportPaths = [];
    try { reportPaths = (await xmlFiles(root, base)).filter(path => /\/target\/test-reports\/TEST-[^/]+\.xml$/u.test(path)); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    add('original-eight-xml-reports', equalSet(reportPaths, oracle.requiredTestReportPaths) ? 'satisfied' : 'unmet',
      'Exactly the original eight module XML reports are required.', reportPaths);
    const totals = reports.reduce((sum, row) => ({ passes: sum.passes + row.parsed.passes,
      failures: sum.failures + row.parsed.failures, errors: sum.errors + row.parsed.errors }), { passes: 0, failures: 0, errors: 0 });
    add('original-scala-test-floor', reports.length === 8 && totals.passes >= 20 && totals.failures === 0 && totals.errors === 0 ? 'satisfied' : 'unmet',
      'Original ScalaTest floor is >=20 actual passes and zero XML failures/errors.', reports.map(row => row.path));
    for (const path of oracle.forbiddenOutputPaths) add('no-substitute:' + path, await bytesAt(root, path) === null ? 'satisfied' : 'unmet',
      'The original Scala/SBT Spark subject forbids a JavaScript/Node replacement.', [path]);
    const build = (await bytesAt(root, base + '/build.sbt'))?.toString('utf8') ?? '';
    const properties = (await bytesAt(root, base + '/project/build.properties'))?.toString('utf8') ?? '';
    add('original-toolchain', /scalaVersion\s*:?=\s*"2\.13\./u.test(build) && /spark-sql/u.test(build) && /^\s*sbt\.version\s*=\s*1\.11\.7\s*$/mu.test(properties) ? 'satisfied' : 'unmet',
      'Original Scala2.13, actual Spark SQL and offline-provisioned SBT1.11.7 binding remain required.', [base + '/build.sbt', base + '/project/build.properties']);
    const names = new Set(reports.flatMap(row => row.parsed.names));
    let depthMap = null, mutations = null;
    try { depthMap = await jsonAt(root, oracle.depthProof.file); mutations = await jsonAt(root, oracle.mutationProof.file); }
    catch (error) { add('earned-depth-format', 'unmet', error.message, [oracle.depthProof.file, oracle.mutationProof.file]); }
    const depthRows = depthMap?.rows, mutantRows = mutations?.rows;
    const requiredIds = oracle.requirements.map(row => row.requirementId), classes = oracle.requiredDepthClassRefs;
    const validDepth = Array.isArray(depthRows) && depthRows.length > 0 && depthRows.every(row => requiredIds.includes(row.requirementId) &&
      classes.includes(row.depthClassRef) && Array.isArray(row.testIdentityRefs) && row.testIdentityRefs.length > 0 && row.testIdentityRefs.every(name => names.has(name)));
    const completeDepth = validDepth && requiredIds.every(id => classes.every(cls => depthRows.some(row => row.requirementId === id && row.depthClassRef === cls)));
    add('all-eight-concerns-five-earned-depth-classes', completeDepth ? 'satisfied' : 'unmet',
      'Every original requirement needs all five depth classes bound to exact actually executed XML test names. Class semantic adequacy remains native UAT work.', [oracle.depthProof.file, ...reports.map(row => row.path)]);
    const requiredMutations = validDepth ? depthRows.filter(row => oracle.mutationProof.requiredDepthClasses.includes(row.depthClassRef)) : [];
    const validMutation = Array.isArray(mutantRows) && mutantRows.length >= requiredMutations.length && mutantRows.length > 0 &&
      new Set(mutantRows.map(row => row.mutantIdentity)).size === mutantRows.length && mutantRows.every(row => requiredIds.includes(row.requirementId) &&
        typeof row.mutantIdentity === 'string' && row.mutantCompiled === true && Number.isSafeInteger(row.suiteExit) && row.suiteExit !== 0 &&
        Array.isArray(row.failedTestIdentityRefs) && row.failedTestIdentityRefs.length > 0 && row.failedTestIdentityRefs.every(name => names.has(name)) &&
        /^sha256:[a-f0-9]{64}$/u.test(row.baselineDigest ?? '') && row.restoreDigest === row.baselineDigest);
    add('compiled-kills-and-declared-restoration', validMutation ? 'satisfied' : 'unmet',
      'Every negative/invariant row requires a distinct compiled semantic production mutant with observed nonzero full-suite failures and equal baseline/restore hashes. Declaration alone earns no kill.', [oracle.mutationProof.file]);
    if (validMutation && completeDepth) {
      const archiveRoot = typeof runArchive === 'string' ? runArchive : runArchive?.root;
      const retained = [...reports];
      if (archiveRoot) {
        const archive = await realpath(archiveRoot);
        for (const path of await xmlFiles(archive)) {
          const bytes = await bytesAt(archive, path);
          if (bytes !== null) retained.push({ path, bytes, digest: sha(bytes) });
        }
      }
      const reportEvidence = command => {
        if (!Array.isArray(command.reports) || command.reports.length !== 8 || !equalSet(command.reports.map(row => row.relativePath), oracle.requiredTestReportPaths)) return null;
        const parsed = [];
        for (const report of command.reports) {
          const file = retained.find(file => file.digest === report.digest && (file.path === report.relativePath || file.path.endsWith('/' + report.relativePath)));
          if (report.state !== 'file' || !file || file.bytes.length !== report.byteLength) return null;
          try { parsed.push(parseScalaTestReport(file.bytes)); } catch { return null; }
        }
        return { passes: parsed.reduce((n, report) => n + report.passes, 0), failures: parsed.reduce((n, report) => n + report.failures + report.errors, 0),
          failedNames: parsed.flatMap(report => report.failedNames) };
      };
      const suiteEpisodes = observations.flatMap((observation, index) => observation.commandResults
        .filter(command => commandMatches(command, request.testing.commands[0], observation.task.commands.find(row => row.commandId === request.testing.commands[0].commandId)))
        .map(command => ({ index, observation, command, reports: reportEvidence(command) })));
      const proven = [];
      for (const row of mutantRows) {
        const production = oracle.requiredArtifacts.filter(path => path.includes('/src/main/scala/') && row.mutantIdentity.includes(path));
        if (production.length !== 1) { add('mutation:' + row.mutantIdentity, 'unmet', 'Mutant must identify one original production Scala file, never test/comment-only changes.'); continue; }
        const file = production[0], restored = await bytesAt(root, file);
        if (restored === null || sha(restored) !== row.restoreDigest) { add('mutation:' + row.mutantIdentity, 'unmet', 'Actual final production bytes are not exactly restored.', [file]); continue; }
        const snapshot = episode => episode.observation.snapshotMembers?.find(member => member.relativePath === file)?.digest;
        const kill = suiteEpisodes.find(episode => episode.command.exitStatus === row.suiteExit && episode.reports &&
          equalSet(episode.reports.failedNames, row.failedTestIdentityRefs) && snapshot(episode) && snapshot(episode) !== row.baselineDigest &&
          !/Compilation failed|compilation failed|\[error\].*src\/main\/scala/u.test(decodeStream(episode.command.stdout) + decodeStream(episode.command.stderr)) &&
          suiteEpisodes.some(before => before.index < episode.index && before.command.exitStatus === 0 && before.reports?.passes >= 20 &&
            before.reports.failures === 0 && snapshot(before) === row.baselineDigest) &&
          suiteEpisodes.some(after => after.index > episode.index && after.command.exitStatus === 0 && after.reports?.passes >= 20 &&
            after.reports.failures === 0 && snapshot(after) === row.restoreDigest));
        if (!kill) { add('mutation:' + row.mutantIdentity, 'indeterminate', 'No admitted green-baseline → compiled red mutant → restored green full-suite episode with authenticated retained XML corroborates this claim.', [file, oracle.mutationProof.file]); continue; }
        proven.push({ row, killRef: kill.command.observationRef });
        add('mutation:' + row.mutantIdentity, 'satisfied', 'Actual admitted baseline, killed-mutant and restored-suite observations corroborate the declared outcome.', [kill.command.observationRef, file]);
      }
      const assigned = new Map();
      const match = (depthIndex, seen) => {
        const requirement = requiredMutations[depthIndex];
        for (let index = 0; index < proven.length; index++) {
          if (seen.has(index)) continue;
          const mutant = proven[index];
          if (mutant.row.requirementId !== requirement.requirementId || !mutant.row.failedTestIdentityRefs.some(name => requirement.testIdentityRefs.includes(name))) continue;
          seen.add(index);
          if (!assigned.has(index) || match(assigned.get(index), seen)) { assigned.set(index, depthIndex); return true; }
        }
        return false;
      };
      const allMatched = requiredMutations.every((row, index) => match(index, new Set()));
      const uniqueExperiments = new Set(proven.map(row => row.killRef)).size === proven.length;
      add('every-negative-invariant-row-has-own-observed-kill', allMatched && uniqueExperiments ? 'satisfied' : 'indeterminate',
        'A distinct authenticated mutant experiment must cover every negative/invariant depth row; claims cannot reuse one kill as several experiments.', proven.map(row => row.killRef));
    }
  }
  const unresolvedCriteria = criteria.filter(row => row.disposition !== 'satisfied').map(row => row.id);
  const disposition = criteria.some(row => row.disposition === 'unmet') ? 'unmet' : unresolvedCriteria.length > 0 ? 'indeterminate' : 'satisfied';
  return { disposition, criteria, unresolvedCriteria, reason: `${record.key}: independent mechanical original-contract checks ${disposition}. Native independent semantic UAT, exact installed runtime admission and fresh result/replay closure remain separate necessary evidence.` };
}
