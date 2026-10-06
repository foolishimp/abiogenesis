// REQ-P-QUAL-064A; ratified T287 carrier HOW 5.1. These are real compiler
// checks of the actual source/destination and hook contracts, not Runtime proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import ts from 'typescript';

test('shared result-lineage contract requires the actual probabilistic metadata', () => {
  const tenant = path.resolve(import.meta.dirname, '../..');
  const output = process.env.ABG_RESULT_LINEAGE_TYPE_PROOF_DIR ??
    fs.mkdtempSync(path.join(os.tmpdir(), 'abg-result-lineage-types-'));
  fs.mkdirSync(output, {recursive: true});
  const modulePath = suffix => JSON.stringify(path.join(tenant, 'code/src', suffix));
  const header = `import type { ResultEvidenceLineage } from ${modulePath('abg/result_evidence_lineage_contracts.js')};
import type { AdmittedCCallEvidence } from ${modulePath('abg/c_call.js')};
import type { LeafInvocationPort } from ${modulePath('implementation/contracts.js')};
import type { ProductSemanticsProvider, InstalledLeafSemanticsProjection } from ${modulePath('product/semantics.js')};
type Probabilistic = Extract<ResultEvidenceLineage, {evidenceClass: 'probabilistic_transport'}>;
type AdmittedProbabilistic = Extract<AdmittedCCallEvidence, {evidenceClass: 'probabilistic_transport'}>;
const valid: Probabilistic = {
  cCallRef: 'c-call://component/probabilistic', cCallAttempt: 0,
  evidenceRef: 'evidence://component/probabilistic', evidenceDigest: 'sha256:evidence',
  evidenceClass: 'probabilistic_transport', inputDigest: 'sha256:input',
  outputDigest: 'sha256:output', transportDigest: 'sha256:transport',
  actorInvocationRef: 'actor-invocation://component', actorRef: 'actor://component',
  workerBindingRef: 'worker://component', transportBindingRef: 'transport://component',
  transportBindingDigest: 'sha256:binding', requestDigest: 'sha256:request',
  promptDigest: 'sha256:prompt', transportDisposition: 'success', transportFailureClass: null,
};
const admitted: AdmittedProbabilistic = {...valid, transportDigest: 'sha256:transport',
  kind: 'admitted_c_call_evidence', schemaVersion: '5.0.0', disposition: 'admitted',
  contractRef: 'contract://component', implementationRef: 'implementation://component',
  admissionEventRef: 'event://component'};
type LeafRows = Parameters<LeafInvocationPort['validateResultEvidenceLineage']>[2];
type ProductRows = Parameters<NonNullable<ProductSemanticsProvider['validateResultEvidenceLineage']>>[0]['admittedEvidence'];
type InstalledRows = Parameters<InstalledLeafSemanticsProjection['validateResultEvidenceLineage']>[0]['admittedEvidence'];
`;
  const cases = [];
  const add = (name, body, expectedErrors) => {
    const filename = path.join(output, `${name}.mts`);
    fs.writeFileSync(filename, header + body + '\n', {flag: 'wx'});
    cases.push({name, filename, expectedErrors});
  };
  add('valid-probabilistic-and-nonprobabilistic', `
const shared: ResultEvidenceLineage = valid;
const source: AdmittedCCallEvidence = admitted;
const leaf: LeafRows = [valid];
const product: ProductRows = [valid];
const installed: InstalledRows = [valid];
const nonprobabilistic: ResultEvidenceLineage = {
  cCallRef: 'c-call://component/ordinary', cCallAttempt: 0,
  evidenceRef: 'evidence://component/ordinary', evidenceDigest: 'sha256:ordinary',
  evidenceClass: 'deterministic', inputDigest: 'sha256:input',
  outputDigest: 'sha256:output', transportDigest: null,
};
const failed: ResultEvidenceLineage = {...valid,
  transportDisposition: 'failure', transportFailureClass: 'component_failure'};
const {transportDigest: omittedTransportDigest, ...ordinary} = nonprobabilistic;
const ordinarySource: AdmittedCCallEvidence = {...ordinary,
  kind: 'admitted_c_call_evidence', schemaVersion: '5.0.0', disposition: 'admitted',
  contractRef: 'contract://component', implementationRef: null, admissionEventRef: 'event://component'};
`, 0);
  const required = ['cCallRef', 'cCallAttempt', 'evidenceRef', 'evidenceDigest',
    'evidenceClass', 'inputDigest', 'outputDigest', 'transportDigest',
    'actorInvocationRef', 'actorRef', 'workerBindingRef', 'transportBindingRef',
    'transportBindingDigest', 'requestDigest', 'promptDigest',
    'transportDisposition', 'transportFailureClass'];
  for (const field of required) {
    add(`destination-omits-${field}`, `declare const omitted: Omit<Probabilistic, '${field}'>;
const rejected: ResultEvidenceLineage = omitted;`, 1);
  }
  for (const field of ['inputDigest', ...required.slice(8)]) {
    add(`admitted-source-omits-${field}`, `declare const omitted: Omit<AdmittedProbabilistic, '${field}'>;
const rejected: AdmittedCCallEvidence = omitted;`, 1);
  }
  add('source-invalid-class', `const rejected: AdmittedCCallEvidence = {...admitted,
  evidenceClass: 'unadmitted_class'};`, 1);
  for (const hook of ['LeafRows', 'ProductRows', 'InstalledRows']) {
    add(`hook-${hook}-requires-inputDigest`, `declare const omitted: Omit<Probabilistic, 'inputDigest'>;
const rejected: ${hook} = [omitted];`, 1);
  }
  const configPath = path.join(tenant, 'tsconfig.json');
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  assert.equal(config.error, undefined);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, tenant);
  assert.equal(parsed.errors.length, 0);
  const options = {...parsed.options, noEmit: true, typeRoots: [path.join(tenant, 'node_modules/@types')]};
  delete options.rootDir;
  const program = ts.createProgram(cases.map(c => c.filename), options);
  const diagnostics = ts.getPreEmitDiagnostics(program).filter(d => d.category === ts.DiagnosticCategory.Error);
  const paths = new Set(cases.map(c => c.filename));
  const unrelated = diagnostics.filter(d => !d.file || !paths.has(path.resolve(d.file.fileName)));
  const format = d => ({code: d.code, message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
    file: d.file?.fileName, start: d.start});
  const outcomes = cases.map(c => ({name: c.name, expectedErrors: c.expectedErrors,
    diagnostics: diagnostics.filter(d => d.file && path.resolve(d.file.fileName) === c.filename).map(format)}));
  fs.writeFileSync(path.join(output, 'compiler-receipt.json'), JSON.stringify({
    compilerVersion: ts.version, sourceRoot: tenant, requiredDestinationFields: required,
    cases: outcomes, unrelatedDiagnostics: unrelated.map(format),
    scope: 'TypeScript presence/shape only; no Runtime, ownership or semantic qualification',
  }, null, 2) + '\n', {flag: 'wx'});
  assert.deepEqual(unrelated.map(format), []);
  for (const outcome of outcomes) {
    assert.equal(outcome.diagnostics.length, outcome.expectedErrors, outcome.name);
    for (const d of outcome.diagnostics) assert.ok([2322, 2741, 2739].includes(d.code), `${outcome.name}: ${d.code}`);
  }
});
