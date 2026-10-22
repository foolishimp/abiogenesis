// T-287 post-close repair A: the reference arrays of gtl/consensus.ts are
// checked against the contract's shape (each member a reference) and compared
// member by member, without a recursive walk. The baseline (97b1200bc)
// answered false for a self-referencing array; admission before comparison
// turned it into a RangeError.
import assert from 'node:assert/strict';
import test from 'node:test';
import * as gtl from '../../build/code/src/gtl/index.js';

const DIGEST = `sha256:${'1'.repeat(64)}`, ACTOR = 'actor://t287/consensus-ref-shape';

// A complete Consensus invocation, after m5-consensus-module's invocationFor.
function invocation() {
  const subjectMaterialization = gtl.constructConsensusSubjectMaterialization({ subjectContractRef: 'contract://stdo/ticket@2',
    subjectRef: 'ticket://abiogenesis/T-287', content: '# T-287\n\nConsensus reference-shape subject.\n' });
  const instructions = ['author', 'independent'].map(name => gtl.constructConsensusReviewerInstruction({
    instructionContractRef: `contract://t287/consensus/reviewer-instruction/${name}@1`, roleContractRef: `contract://t287/reviewer-role/${name}@1`,
    instructionText: `Review the exact materialized ticket as the ${name} profile.`, responseSchema: gtl.CONSENSUS_REVIEWER_RESPONSE_SCHEMA }));
  const profiles = instructions.map((instruction, index) => {
    const name = ['author', 'independent'][index];
    return gtl.constructConsensusReviewerProfile({ profileRef: `reviewer-profile://t287/${name}`, roleContractRef: instruction.roleContractRef,
      instructionContractRef: instruction.instructionContractRef, instructionDigest: instruction.instructionDigest,
      resultContractRef: gtl.CONSENSUS_IDS.findingsContractRef, capabilityRefs: [`capability://t287/reviewer/${name}`],
      actorRef: `actor://t287/reviewer/${name}`, workerBindingRef: `worker-binding://t287/reviewer/${name}` });
  });
  const panel = gtl.constructConsensusPanel('panel://t287/consensus-ref-shape', profiles);
  const submitterInstruction = gtl.constructConsensusSubmitterInstruction({ instructionContractRef: 'contract://t287/consensus/submitter-instruction@1',
    roleContractRef: 'contract://t287/submitter-role@1', instructionText: 'Respond to every exact admitted reviewer finding for this round.',
    responseSchema: gtl.CONSENSUS_SUBMITTER_RESPONSE_SCHEMA });
  const submitterProfile = gtl.constructConsensusSubmitterProfile({ profileRef: 'submitter-profile://t287/author',
    roleContractRef: submitterInstruction.roleContractRef, instructionContractRef: submitterInstruction.instructionContractRef,
    instructionDigest: submitterInstruction.instructionDigest, resultContractRef: gtl.CONSENSUS_IDS.submitterResponseContractRef,
    capabilityRefs: ['capability://t287/submitter/respond'], actorRef: ACTOR, workerBindingRef: 'worker-binding://t287/submitter/author' });
  const policy = gtl.constructConsensusRoundPolicy({ policyRef: 'policy://t287/consensus-ref-shape@1', roundBudget: 2,
    convergenceRuleRef: gtl.CONSENSUS_IDS.convergenceRuleRef, disagreementRuleRef: gtl.CONSENSUS_IDS.disagreementRuleRef, rulingOverlay: null,
    escalationRuleRef: gtl.CONSENSUS_IDS.escalationRuleRef, foldbackContractRef: gtl.CONSENSUS_IDS.foldbackContractRef });
  const subject = gtl.constructConsensusSubject({ subjectContractRef: 'contract://stdo/ticket@2', subjectRef: 'ticket://abiogenesis/T-287',
    subjectDigest: subjectMaterialization.contentDigest, submittingActorRef: ACTOR, panelRef: panel.panelRef, roundPolicyRef: policy.policyRef,
    workspaceRef: 'workspace://t287/consensus-ref-shape', ticketRef: 'ticket://abiogenesis/T-287', ticketDigest: subjectMaterialization.contentDigest });
  return gtl.constructConsensusInvocation({ invocationRef: 'consensus-invocation://t287/consensus-ref-shape', subject,
    subjectMaterialization, panel, instructions, submitterProfile, submitterInstruction, policy, transportLane: 'closed_prompt_proof' });
}

test('consensus reference arrays: shape-checked and compared without recursion; a cycle or NaN member is unequal', () => {
  const publication = gtl.constructConsensusModulePublication({ productId: 'product://abiogenesis/typescript-tenant@5.0.0-dev.287',
    artifactDigest: DIGEST, productContentDigest: `sha256:${'2'.repeat(64)}`, productManifestDigest: `sha256:${'3'.repeat(64)}`,
    packageName: '@abiogenesis/typescript-tenant', packageVersion: '5.0.0-dev.287' });
  const actionCatalog = publication.programs.find(program => program.programRef === gtl.CONSENSUS_IDS.oneSurfaceProgramRef).actionCatalog;
  const snapshot = gtl.constructConsensusObservationSnapshot({ workspaceBindingId: 'workspace-binding://t287/consensus-ref-shape',
    workspaceBindingDigest: DIGEST, actionCatalog, consensusInvocation: invocation() });
  const basis = gtl.evaluateConsensusGap(gtl.synthesizeConsensusModel(snapshot));
  assert.equal(gtl.isConsensusObservationSnapshot(snapshot), true, 'positive control: the constructed snapshot');
  assert.equal(gtl.isConsensusNextActionBasis(basis), true, 'positive control: the constructed next-action basis');
  const cycle = []; cycle.push(cycle);
  const hole = []; hole.length = 1;
  const variants = [['a self-referencing array', cycle], ['a NaN member', [NaN]], ['a hole', hole],
    ['a nested array', [[gtl.CONSENSUS_IDS.consensusObligationRef]]], ['an extra member', null]];
  const row = actionCatalog.rows[0];
  // Sites: the catalog row (targetObligationRefs, inputAssetRefs, outputAssetRefs), the snapshot
  // (targetObligationRefs, availableActionRefs) and the next-action basis (targetObligationRefs).
  const sites = [
    ...['targetObligationRefs', 'inputAssetRefs', 'outputAssetRefs'].map(field => [`catalog row ${field}`, row[field],
      value => gtl.isConsensusObservationSnapshot({ ...snapshot, actionCatalog: { ...actionCatalog, rows: [{ ...row, [field]: value }] } })]),
    ...['targetObligationRefs', 'availableActionRefs'].map(field => [`snapshot ${field}`, snapshot[field],
      value => gtl.isConsensusObservationSnapshot({ ...snapshot, [field]: value })]),
    ['next-action basis targetObligationRefs', basis.targetObligationRefs,
      value => gtl.isConsensusNextActionBasis({ ...basis, targetObligationRefs: value })],
  ];
  for (const [site, original, check] of sites) {
    assert.equal(check([...original]), true, `${site}: an equal fresh array keeps the answer`);
    for (const [label, value] of variants) {
      const candidate = value ?? [...original, original[0]];
      assert.doesNotThrow(() => check(candidate), `${site}: ${label} does not throw`);
      assert.equal(check(candidate), false, `${site}: ${label} is unequal`);
    }
  }
});
