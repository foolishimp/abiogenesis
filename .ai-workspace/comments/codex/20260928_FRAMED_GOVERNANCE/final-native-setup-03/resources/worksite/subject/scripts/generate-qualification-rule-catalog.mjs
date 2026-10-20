/** Finite source/definition projection. Generated rows have no semantic verdict.
 * --stage-authorities is an explicit source-build action; ordinary reproduction
 * reads only the already frozen inputs inside this tenant. No network or runtime. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as v from 'valibot';
import * as q from '../build/code/src/validator/qualification_contracts.js';
import { SELF_CONFORMANCE_INPUT_SCHEMA, SELF_CONFORMANCE_RESULT_SCHEMA } from '../build/code/src/validator/self_conformance_contracts.js';
import { projectStrictJsonSchema } from '../build/code/src/shared/public_function_contracts.js';
import { sha256Bytes } from '../build/code/src/shared/digests.js';
import { SELF_CONFORMANCE_IDS, QUALIFICATION_IDS } from '../build/code/src/gtl/self_conformance.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hash = q.qualificationHash;
const bytes = p => fs.readFileSync(p);
const write = (p, b) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, b); };
const json = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const inputPath = path.join(root, 'contracts/qualification/authority-inputs.json');
function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name)) : e.isFile() && e.name.endsWith('.md') ? [path.join(dir, e.name)] : []).sort(); }
export function stageQualificationAuthorities(repo, release) {
  const definitionBytes = bytes(path.join(repo, 'stdo_abiogenesis.json'));
  const definition = JSON.parse(definitionBytes), manifestBytes = bytes(path.join(release, 'manifest.json'));
  const selected = definition.constitution.stdo.basis, manifest = JSON.parse(manifestBytes);
  if (selected.uri !== 'stdo://releases/v2.5.1-rc.1/' || sha256Bytes(manifestBytes) !== 'sha256:' + selected.manifest_sha256 ||
      selected.manifest_sha256 !== '5d306da13994e69aa9f215d4c1cd2d0be96283c1e33a652b58e6e9262d036b64') throw Error('unselected method basis');
  const standardPaths = [...new Set([...definition.constitution.entrypoints.map(e => e.uri), 'standards/AXIOMATIC_CALCULUS.md'])].sort();
  const sourcePaths = ['stdo_abiogenesis.json', 'specification/INTENT.md', 'specification/PRODUCT.md',
    ...files(path.join(repo, 'specification/requirements')).map(p => path.relative(repo, p))];
  const sources = [...sourcePaths.map(p => ({ ref: 'repo://abiogenesis/' + p, originalPath: p, raw: bytes(path.join(repo, p)) })),
    ...standardPaths.map(p => {
      const raw = bytes(path.join(release, p)), rows = manifest.standards.members.filter(m => m.path === p.replace(/^standards\//, ''));
      if (rows.length !== 1 || sha256Bytes(raw) !== 'sha256:' + rows[0].sha256) throw Error('unjoined STDO member ' + p);
      return { ref: selected.uri + p, originalPath: p, raw };
    })];
  const names = sources.map(s => path.basename(s.originalPath));
  const rows = sources.map(s => {
    const name = path.basename(s.originalPath), p = 'contracts/qualification/sources/' +
      (names.filter(n => n === name).length === 1 ? name : s.originalPath.replaceAll('/', '__'));
    write(path.join(root, p), s.raw);
    return { ref: s.ref, path: p, digest: sha256Bytes(s.raw), byteCount: s.raw.length };
  });
  const input = { kind: 'qualification_authority_inputs', definitionDigest: sha256Bytes(definitionBytes),
    method: { releaseRef: selected.uri, methodVersion: '2.5.1-rc.1', installedManifestDigest: sha256Bytes(manifestBytes),
      memberSetDigest: 'sha256:' + manifest.standards.member_set_sha256 }, sources: rows };
  write(inputPath, json(input)); return input;
}
function sections(raw) {
  const text = raw.toString('utf8');
  const matches = [...text.matchAll(/^(?:\*\*(REQ-[A-Z0-9-]+)\*\*:?|#{1,6} ([^\n]+))/gm)];
  if (matches.length === 0) return [{ label: 'complete-source', start: 0, end: raw.length }];
  return matches.map((m, i) => ({ label: m[1] ?? m[2], start: Buffer.byteLength(text.slice(0, m.index)),
    end: i + 1 === matches.length ? raw.length : Buffer.byteLength(text.slice(0, matches[i + 1].index)) }));
}
export const TRAVERSAL_ROSTER = Object.freeze({
  compute: ['F_D', 'F_P', 'F_H', 'mixed'],
  structural: ['atomic call', 'flat composition', 'edge program', 'adaptive declared selection', 'batch', 'transparent child traversal', 'graph recursion', 'retry'],
  consequence: ['same_edge_retry', 'depth_traversal', 'graph_span_reentry', 'public_start_reentry', 'ticket_traversal', 'fh_input_required', 'escalation_or_reprice', 'gap_stop', 'non_admit'],
  disposition: ['advance_vector', 'close', 'retry_same_edge', 'repair', 're_enter', 'yield_continuation', 'inspect_runtime_archive', 'reprice', 'human_assurance_required', 'escalate', 'gap_stop', 'block', 'non_admit'],
  public: ['advancing the next lawful work', 'targeting a published GraphFunction', 'targeting a published asset', 'bounded traversal until', 'direct or lawfully proxied', 'direct or supervised root control'],
});
export function qualificationSchema() {
  return { $schema: 'https://json-schema.org/draft/2020-12/schema', $defs: Object.fromEntries([
    ['SelfConformanceInput', SELF_CONFORMANCE_INPUT_SCHEMA], ['SelfConformanceResult', SELF_CONFORMANCE_RESULT_SCHEMA],
    ['ExactCandidateQualification', q.EXACT_CANDIDATE_QUALIFICATION_SCHEMA], ['ExactCandidateQualificationBasis', q.EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA],
    ['ExactCandidateQualificationVerdict', q.EXACT_CANDIDATE_QUALIFICATION_VERDICT_SCHEMA],
    ['QualificationVerdictInput', q.QUALIFICATION_VERDICT_INPUT_SCHEMA],
    ['QualificationCoverageCatalog', q.QUALIFICATION_COVERAGE_CATALOG_SCHEMA],
    ['NativeRuntimeAssessmentInput', q.NATIVE_RUNTIME_ASSESSMENT_INPUT_SCHEMA], ['NativeRuntimeAssessment', q.NATIVE_RUNTIME_ASSESSMENT_SCHEMA],
    ['QualificationAssessmentTask', q.QUALIFICATION_ASSESSMENT_TASK_SCHEMA], ['QualificationAssessmentPlan', q.QUALIFICATION_ASSESSMENT_PLAN_SCHEMA],
    ['QualificationJudgment', q.QUALIFICATION_JUDGMENT_SCHEMA], ['QualificationOwnerRuling', q.QUALIFICATION_OWNER_RULING_SCHEMA],
    ['QualificationProofResource', q.QUALIFICATION_PROOF_RESOURCE_SCHEMA], ['QualificationConstructionProvenance', q.QUALIFICATION_CONSTRUCTION_PROVENANCE_SCHEMA],
    ['QualificationLawBasis', q.QUALIFICATION_LAW_BASIS_SCHEMA], ['TenantConformanceManifest', q.TENANT_CONFORMANCE_MANIFEST_SCHEMA],
    ['QualificationRuleCatalog', q.QUALIFICATION_RULE_CATALOG_SCHEMA],
    ['MalformedGtlAssessmentInput', q.MALFORMED_GTL_ASSESSMENT_INPUT_SCHEMA],
    ['MalformedGtlAssessment', q.MALFORMED_GTL_ASSESSMENT_SCHEMA],
  ].map(([name, schema]) => [name, projectStrictJsonSchema(schema)])) };
}
export function generateQualificationAssets() {
  const input = JSON.parse(bytes(inputPath));
  const material = input.sources.map(s => {
    if (!s.path.startsWith('contracts/qualification/sources/') || s.path.includes('..')) throw Error('invalid frozen source path');
    const raw = bytes(path.join(root, s.path));
    if (sha256Bytes(raw) !== s.digest || raw.length !== s.byteCount) throw Error('changed authority input ' + s.ref);
    return { ...s, raw };
  });
  const catalog = { kind: 'qualification_rule_catalog', schemaVersion: '5.0.0', catalogRef: 'catalog://abiogenesis/qualification/self-conformance@2',
    catalogVersion: '2', ownerRef: 'authority://abiogenesis/validator/conformance@5', method: input.method, sources: input.sources,
    rules: material.flatMap(s => sections(s.raw).map((section, i) => ({
      ruleRef: 'rule://abiogenesis/self-conformance/' + hash([s.ref, i, section.label]).slice(7) + '@2', version: '2',
      sourceRef: s.ref, sourceDigest: s.digest, startByte: section.start, endByte: section.end,
      spanDigest: sha256Bytes(s.raw.subarray(section.start, section.end)), governedClaim: section.label,
      applicability: 'requires_admitted_judgment', requiredEvidenceRoles: ['source_fidelity', 'applicability', 'evaluation_sufficiency'],
      computableRelation: 'source_span_integrity', diagnostic: 'semantic_assessment_required',
    }))), coverageClaim: 'finite_candidate_unassessed', requiredCatalogEvidenceRoles: ['catalog_fidelity', 'governing_source_coverage'] };
  v.parse(q.QUALIFICATION_RULE_CATALOG_SCHEMA, catalog);
  const catalogBytes = json(catalog);
  const law = q.constructQualificationIdentity({ kind: 'qualification_law_basis', ...input.method,
    catalog: { ref: catalog.catalogRef, digest: sha256Bytes(catalogBytes), ownerRef: catalog.ownerRef, version: catalog.catalogVersion,
      assetPath: 'contracts/qualification/rule-catalog.json' }, sources: input.sources }, 'lawBasisRef', 'lawBasisDigest', 'qualification-law://abiogenesis/');
  const product = material.find(s => s.ref === 'repo://abiogenesis/specification/PRODUCT.md').raw.toString('utf8');
  for (const values of Object.values(TRAVERSAL_ROSTER)) for (const value of values) if (!product.includes(value)) throw Error('unjoined traversal obligation ' + value);
  const qual = 'repo://abiogenesis/specification/requirements/product/REQ-P-QUAL.md#';
  const scenario = 'repo://abiogenesis/specification/requirements/product/REQ-P-SCENARIOS.md#';
  const productRef = 'repo://abiogenesis/specification/PRODUCT.md#';
  const releaseBoundary = productRef + '50-and-51-release-boundaries';
  const conservationProof = productRef + 'conservation-proof';
  const claims = [
    ['ABI5-ROOT-001', [qual + 'REQ-P-QUAL-058'], Array.from({length: 10}, (_, i) => 'ABG5-S01/R' + (i + 1))],
    ...Object.entries(TRAVERSAL_ROSTER).map(([axis, values]) => ['conservation/' + axis,
      [qual + 'REQ-P-QUAL-064', conservationProof, releaseBoundary], values.map(value => 'traversal/' + axis + '/' + value.replaceAll(' ', '_'))]),
    ['fibre-substitution', [qual + 'REQ-P-QUAL-064'], ['shape-preserving-fibre-substitution']],
    ['complete-C-algebra', [qual + 'REQ-P-QUAL-064'], ['of', 'identity', 'compose', 'edge', 'workflow', 'batch', 'retry'].map(n => 'C.' + n)],
    ['malformed-GTL', [qual + 'REQ-P-QUAL-064'], ['malformed-GTL']],
    ['malformed-FP', [qual + 'REQ-P-QUAL-064'], ['malformed-FP']],
    ['public-operator-loop', [qual + 'REQ-P-QUAL-059'], ['ABG5-S02/operator-loop']],
    ['self-conformance', [qual + 'REQ-P-QUAL-060'], ['whole-subject-self-conformance']],
    ['native-projection', [qual + 'REQ-P-QUAL-063'], ['native-public-projection']],
    ['selected-downstream-lifecycle', [qual + 'REQ-P-QUAL-062', scenario + 'REQ-P-SCENARIOS-013', releaseBoundary], ['ABG5-S06/complete-selected-contract']],
    ['ABG5-S02', [scenario + 'REQ-P-SCENARIOS-009'], ['ABG5-S02/failure-truth']],
    ['ABG5-S03', [scenario + 'REQ-P-SCENARIOS-010', releaseBoundary], ['ABG5-S03/retained-human-boundary']],
  ];
  const coverage = q.constructQualificationIdentity({ kind: 'qualification_coverage_catalog',
    lawBasis: { ref: law.lawBasisRef, digest: law.lawBasisDigest }, authoritySources: input.sources.filter(s =>
      ['PRODUCT.md', 'REQ-P-QUAL.md', 'REQ-P-SCENARIOS.md', 'REQ-P-SELF-CONFORMANCE.md'].includes(path.basename(s.path))),
    claims: claims.map(([name, requirementRefs, behaviors]) => ({ coverageRef: 'qualification-coverage-claim://abiogenesis/' + name + '@5',
      requirementRefs, behaviors, evidenceRoles: ['execution_evidence', 'behavioral_coverage', 'release_applicability'] })) },
    'catalogRef', 'catalogDigest', 'qualification-coverage://abiogenesis/');
  v.parse(q.QUALIFICATION_COVERAGE_CATALOG_SCHEMA, coverage);
  const outputs = { 'contracts/qualification/rule-catalog.json': catalogBytes,
    'contracts/qualification/law-basis.json': json(law), 'contracts/qualification/coverage.json': json(coverage),
    'contracts/schemas/self-conformance.schema.json': json(qualificationSchema()) };
  for (const [p, b] of Object.entries(outputs)) write(path.join(root, p), b);
  return { kind: 'qualification_asset_generation', claim: 'immutable definitions only; semantic fidelity, applicability and execution sufficiency remain unevaluated',
    sources: input.sources.length, rules: catalog.rules.length, coverageClaims: coverage.claims.length,
    behavioralCoverage: coverage.claims.flatMap(c => c.behaviors).length,
    absentProductMechanismsClaimed: 0,
    inputDigest: hash(input), outputs: Object.entries(outputs).map(([p, b]) => ({ path: p, sha256: sha256Bytes(b), bytes: b.length })) };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === '--stage-authorities') stageQualificationAuthorities(path.resolve(process.argv[3]), path.resolve(process.argv[4]));
  else if (process.argv.length > 2) throw Error('unknown generator argument');
  console.log(JSON.stringify(generateQualificationAssets(), null, 2));
}
