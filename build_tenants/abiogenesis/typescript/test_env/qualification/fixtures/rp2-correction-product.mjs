// Packed beside the unchanged selected-action base as base.js. This fixture
// proposes owner-shaped semantic results from actual child/evaluation inputs;
// it has no event writer or fabricated runtime occurrence.
export * from './base.js';
import * as base from './base.js';
const {hash,ref,version}=base;
const identify=(kind,scheme,r,d,fields)=>{const body={kind,schemaVersion:version,...fields},digest=hash(body);return {...body,[r]:scheme+'://product/'+digest.slice(7),[d]:digest};};
const body=(value,r,d)=>{const {[r]:_r,[d]:_d,...rest}=value;return rest;};
const realize=(name,input,resultCandidate)=>({kind:'leaf_realization_candidate',schemaVersion:version,disposition:'success',resultCandidate,
  evidenceCandidates:[{kind:'deterministic_evidence_candidate',schemaVersion:version,implementationRef:ref('implementation',name),inputDigest:hash(input),outputDigest:hash(resultCandidate)}]});
export const producer=input=>realize('producer',input,{kind:'fixture_produced',schemaVersion:version,payload:input.payload,correctionDisposition:input.correctionDisposition});
export const consumer=input=>realize('consumer',input,{kind:'fixture_consumed',schemaVersion:version,payload:input.payload,correctionDisposition:input.correctionDisposition});
export function evaluate(input){
  const prior=base.evaluate(input).resultCandidate,correction=input.admittedEvidence[0].responseValue.correctionDisposition;
  if(!['inspect_runtime_archive','escalate'].includes(correction))throw new TypeError('declared correction required');
  const decision=identify('edge_closure_decision','edge-closure-decision','decisionRef','decisionDigest',{
    constructionIntentRef:prior.constructionIntentRef,targetOutcomeRef:prior.targetOutcomeRef,ledgerRef:prior.edgeFulfillmentLedger.ledgerRef,
    disposition:'continue_candidate',correctionDisposition:correction});
  const inspection=identify('runtime_archive_inspection','runtime-archive-inspection','inspectionRef','inspectionDigest',{
    constructionIntentRef:prior.constructionIntentRef,disposition:'inspected',runtimeEvidenceEventRefs:input.runtimeEvidenceEventRefs});
  const fields=body(prior,'actionEvaluationRef','actionEvaluationDigest');
  return realize('evaluate',input,identify('action_evaluation_projection','action-evaluation','actionEvaluationRef','actionEvaluationDigest',{
    ...fields,edgeClosureDecision:decision,runtimeArchiveInspection:inspection}));
}
export function refreshModel(input){
  const observationSnapshot={...input.observationSnapshot,constructionState:{correctionDisposition:input.edgeClosureDecision.correctionDisposition,edgeClosureDecisionRef:input.edgeClosureDecision.decisionRef}};
  return realize('refreshModel',input,{kind:'graph_span_selection',schemaVersion:version,disposition:'continue',state:{kind:'fixture_refreshed_model',schemaVersion:version,observationSnapshot,evaluation:input}});
}
export function refreshGap(input){
  const prior=base.refreshGap(input).resultCandidate,fields=body(prior,'basisRef','basisDigest');
  return realize('refreshGap',input,identify('next_action_basis','next-action-basis','basisRef','basisDigest',{
    ...fields,gapProjection:{...prior.gapProjection,pressure:'governed_correction',correctionDisposition:input.state.evaluation.edgeClosureDecision.correctionDisposition}}));
}
export function finish(input){
  const correction=input.gapProjection.correctionDisposition;
  return realize('finish',input,identify('next_action_projection','next-action-projection','projectionRef','projectionDigest',{
    disposition:'no_action',noActionDisposition:correction,targetOutcomeRef:input.gapProjection.targetOutcomeRef,programRef:ref('program','root'),
    gapRef:input.gapProjection.gapRef,targetObligationRefs:input.targetObligationRefs,
    targetObligationBindings:input.targetObligationRefs.map(obligationRef=>({kind:'target_obligation_binding',disposition:'fulfilled',obligationRef,eligibleActionRefs:[]})),
    priorityProjection:{kind:'deterministic_priority_projection',schemeRef:input.priorityScheme.schemeRef,orderedActionRefs:[]},missingAssetRefs:[],
    reasonRef:ref('reason',correction),lawfulBasisRefs:[input.basisRef,input.gapProjection.gapRef,ref('program','root')],rejectedActionRefs:[],nextActionBasisRef:input.basisRef,nextActionBasisDigest:input.basisDigest}));
}
