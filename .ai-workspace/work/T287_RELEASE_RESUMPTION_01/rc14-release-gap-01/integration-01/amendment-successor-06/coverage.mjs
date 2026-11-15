// External read-only discriminator over actual admitted values. No admission,
// semantic verdict, graph selection or retry is authored here.
export function amendmentCoverage(events,input,oracle) {
  const results=events.filter(e=>e.kind==='c_call_result_admitted');
  const byRef=new Map(results.map(e=>[e.payload?.resultRef,e]));
  const ordinal=ref=>byRef.get(ref)?.admissionOrdinal??Infinity;
  const parents=results.filter(e=>e.graphFunctionRef==='graph-function://default-library-witness/executive@5'&&e.payload?.value?.kind==='governance_work_state')
    .map(e=>({ordinal:e.admissionOrdinal,resultRef:e.payload.resultRef,state:e.payload.value}));
  const choices=results.filter(e=>e.payload?.value?.kind==='registered_graph_choice').map(e=>({ordinal:e.admissionOrdinal,choice:e.payload.value}));
  const observations=[...new Map(parents.flatMap(p=>p.state.observations??[]).map(o=>[o.resultRef,o])).values()].sort((a,b)=>ordinal(a.resultRef)-ordinal(b.resultRef));
  const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const producer=o=>byRef.get(o?.synthesisResultRef)?.payload?.value?.judgment?.subjectEvidenceRef??null;
  const oracleCommand=input.original.testing.commands.find(c=>c.commandId==='command://amendment-witness/amendment-oracle@5');
  const testing=[];
  for(const observation of observations.filter(o=>o.purpose==='testing')) {
    const e=byRef.get(observation.resultRef),v=e?.payload?.value, commands=v?.commandResults;
    const errors=[];let report=null;
    if(!equal(commands?.map(c=>c.commandId),input.original.testing.commands.map(c=>c.commandId)))errors.push('command vector');
    if(!equal(v?.predicateObservations?.map(p=>p.predicateId),input.original.testing.outcomePredicates.map(p=>p.predicateId)))errors.push('predicate vector');
    const c=commands?.find(c=>c.commandId===oracleCommand?.commandId);
    try {
      if(!c||c.timedOut||!c.terminationConfirmed)throw Error('oracle command did not complete');
      const stdout=c.stdout.encoding==='utf8'?c.stdout.text:Buffer.from(c.stdout.payload,'base64').toString('utf8');
      report=JSON.parse(stdout);
      if(report.kind!=='amendment_application_observation'||report.phase!=='observe'||!equal(report.rows.map(r=>r.id),oracle.cases.map(r=>r.id)))throw Error('oracle report identity');
      const mismatches=[];
      for(let i=0;i<oracle.cases.length;i++) {
        const expected=oracle.cases[i],row=report.rows[i];
        if(!equal(row.expected,{total:expected.total,managerApproval:expected.managerApproval})||!row.observed||!Number.isFinite(row.observed.total)||typeof row.observed.managerApproval!=='boolean')throw Error('oracle case subject');
        const met=Math.abs(row.observed.total-expected.total)<0.005&&row.observed.managerApproval===expected.managerApproval;
        if(row.met!==met)throw Error('oracle case relation');if(!met)mismatches.push(row.id);
      }
      if(!equal(mismatches,report.mismatches)||c.exitStatus!==(mismatches.length?1:0))throw Error('oracle exit/report relation');
    } catch(error){errors.push(String(error));}
    testing.push({resultRef:observation.resultRef,ordinal:ordinal(observation.resultRef),producerResultRef:producer(observation),report,errors,
      allCommandsPassed:!!commands?.length&&commands.every(c=>c.exitStatus===0&&!c.timedOut&&c.terminationConfirmed),
      predicateObservations:v?.predicateObservations??null});
  }
  const construction=observations.filter(o=>o.purpose==='construction'&&o.value?.changedPaths?.length);
  const first=construction[0],firstOrdinal=ordinal(first?.resultRef);
  const initial=testing.filter(t=>!t.errors.length&&t.ordinal<firstOrdinal&&equal(t.report?.mismatches,oracle.initialMismatchIds)
    &&t.report.rows.every(r=>Math.abs(r.observed.total-r.expected.total)<0.005&&r.observed.managerApproval===true));
  const baselineRef='review://amendment-witness/baseline@5',impactRef='review://amendment-witness/impact@5';
  const impact=input.original.reviews.find(r=>r.reviewRef===impactRef);
  const impactDependencies=impact?[...new Set([...impact.order.readFirst,...impact.assessment.sources,impact.assessment.candidatePath,impact.assessment.rubricPath])].sort():[];
  const at=(parent,ref)=>parent.state.reviewStanding?.find(r=>r.reviewRef===ref);
  const observationFor=ref=>observations.find(o=>o.resultRef===ref);
  const overlaps=(a,b)=>a===b||a.startsWith(b+'/')||b.startsWith(a+'/');
  const refresh=[];
  for(let i=0;i<parents.length;i++) {
    const before=at(parents[i],baselineRef),preserved=at(parents[i],impactRef);
    if(!before?.current||!before.satisfied||!preserved?.current||!preserved.satisfied||parents[i].ordinal>=firstOrdinal)continue;
    const initialEvidence=initial.find(t=>t.resultRef===producer(observationFor(before.resultRef)));
    if(!initialEvidence)continue;
    const staleAt=parents.findIndex((p,j)=>j>i&&at(p,baselineRef)?.resultRef===before.resultRef&&!at(p,baselineRef)?.current);
    if(staleAt<0)continue;
    const currentAt=parents.findIndex((p,j)=>j>staleAt&&at(p,baselineRef)?.resultRef!==before.resultRef&&at(p,baselineRef)?.current&&at(p,baselineRef)?.satisfied);
    if(currentAt<0)continue;
    const after=at(parents[currentAt],baselineRef),newEvidence=testing.find(t=>t.resultRef===producer(observationFor(after.resultRef)));
    const changes=observations.filter(o=>ordinal(o.resultRef)>parents[i].ordinal&&ordinal(o.resultRef)<=parents[currentAt].ordinal&&o.value?.changedPaths?.length);
    const corrections=changes.filter(o=>o.purpose==='construction');
    if(!corrections.length||!newEvidence||newEvidence.errors.length||!newEvidence.allCommandsPassed||newEvidence.report?.mismatches.length||newEvidence.ordinal<=Math.max(...corrections.map(o=>ordinal(o.resultRef))))continue;
    if(!parents.slice(i,currentAt+1).every(p=>at(p,impactRef)?.resultRef===preserved.resultRef&&at(p,impactRef)?.current&&at(p,impactRef)?.satisfied))continue;
    if(changes.some(o=>o.value.changedPaths.some(path=>impactDependencies.some(d=>overlaps(path,d)))))continue;
    refresh.push({reviewRef:baselineRef,oldResultRef:before.resultRef,newResultRef:after.resultRef,initialTestingResultRef:initialEvidence.resultRef,
      freshTestingResultRef:newEvidence.resultRef,correctionResults:corrections.map(o=>o.resultRef),from:parents[i].ordinal,stale:parents[staleAt].ordinal,to:parents[currentAt].ordinal,
      preserved:{reviewRef:impactRef,resultRef:preserved.resultRef,dependencies:impactDependencies}});
  }
  const final=parents.at(-1)?.state,acceptance=observations.filter(o=>o.purpose==='uat').at(-1);
  const finalTesting=testing.find(t=>t.resultRef===producer(acceptance));
  const latestConstruction=construction.length?Math.max(...construction.map(o=>ordinal(o.resultRef))):Infinity;
  const analysis=observations.filter(o=>ordinal(o.resultRef)<firstOrdinal&&((o.purpose==='induction'&&o.value?.changedPaths?.includes('work/intake-triage.md'))||(o.purpose==='design'&&o.value?.changedPaths?.includes('design/impact-assessment.md'))));
  const gaps=[];
  if(!choices.length)gaps.push('No actual registered graph choices');
  if(!first)gaps.push('No actual construction change');
  if(!initial.length)gaps.push('Initial threshold5000 counterevidence is not admitted Testing before construction');
  if(!['induction','design'].every(p=>analysis.some(o=>o.purpose===p)))gaps.push('Applicable native intake and design outputs before construction not observed');
  if(!refresh.length)gaps.push('Baseline became stale and refreshed from Testing while impact review retained exact current identity: not observed');
  if(acceptance?.value?.disposition!=='satisfied'||!finalTesting||finalTesting.errors.length||!finalTesting.allCommandsPassed||finalTesting.report?.mismatches.length||finalTesting.ordinal<=latestConstruction)gaps.push('Native acceptance over fresh passed Testing after last construction not observed');
  if(!final?.terminal||final.unresolvedSupportRefs?.length||!final.reviewStanding?.every(r=>!r.required||r.satisfied&&r.current))gaps.push('Current satisfied terminal parent not observed');
  return {status:gaps.length?'unobserved':'observed',gaps,choices,initialCounterevidence:initial,analysisResults:analysis.map(o=>o.resultRef),refresh,testing,
    constructionResults:construction.map(o=>o.resultRef),acceptanceResultRef:acceptance?.resultRef??null,acceptanceProducerResultRef:producer(acceptance),
    authority:'Read-only conjunction of admitted owner outputs and exact protected domain cases; unobserved is not retried.',
    continuation:{heldCloseFreshRead:'separate host check',newRunReuse:false,sameRunPending:false},s06:'Separate keyed-accounting witness remains required; this is S03/currentness only.'};
}
