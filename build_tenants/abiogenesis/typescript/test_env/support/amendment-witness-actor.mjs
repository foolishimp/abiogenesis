// Model-free stand-in for every native role of the amendment witness, run as
// the actor process. It reads only what its own task delivers:
// - selector: its selector view (observations, declared reviews with standing,
//   each offered target's declared prerequisites and missing reviews);
// - worker: its permitted write scope and the admitted observations;
// - assessor: the declared review line, the assessment basis and the worksite.
// The assessor never branches on a path: it applies the delivered rubric's
// criteria to the candidate and sources (assessUnderRubric).
// ABI5_AMENDMENT_ACTOR_FAIL scripts failures: comma-separated
// `<role>:<mode>[:<times>]`, role `select` or a worker step, mode `exit`
// (a worker first writes part of its step), `silent`, `scope` (a write
// outside the grant, then exit) or `scope-success`; times defaults to 1.
// Each scripted failure is logged as `fail:<role>`.
import {readFileSync,writeFileSync,existsSync,appendFileSync,mkdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {assessUnderRubric} from './amendment-witness.mjs';

const MODEL='scripted-stand-in';
const args=process.argv.slice(2),at=args.indexOf('--json-schema'),prompt=readFileSync(0,'utf8'),log=process.env.ABI5_AMENDMENT_ACTOR_LOG;
const standIn=process.env.ABI5_AMENDMENT_STAND_IN;
const record=row=>{if(log)appendFileSync(log,JSON.stringify(row)+'\n');};
// A crash is recorded in the actor log with the prompt that caused it.
for(const event of ['uncaughtException','unhandledRejection'])process.on(event,e=>{record({role:'crash',error:String(e?.stack??e),prompt});process.stderr.write(String(e?.stack??e)+'\n');process.exit(1);});
const out=row=>process.stdout.write(JSON.stringify(row)+'\n');
const emit=(role,output,extra={})=>{record({role,...extra});out({type:'system',subtype:'init',model:MODEL});
  out({type:'result',subtype:'success',is_error:false,result:JSON.stringify(output),structured_output:output,modelUsage:{[MODEL]:{inputTokens:0,outputTokens:0}}});process.exit(0);};
const lineAfter=label=>{const l=prompt.split('\n').find(x=>x.startsWith(label));return l===undefined?undefined:l.slice(label.length);};
const prior=log&&existsSync(log)?readFileSync(log,'utf8').trim().split('\n').filter(Boolean).map(l=>JSON.parse(l)):[];
const scripted=(process.env.ABI5_AMENDMENT_ACTOR_FAIL??'').split(',').filter(Boolean).map(x=>{const [role,mode,times='1']=x.split(':');return {role,mode,times:Number(times)};});
const failing=role=>scripted.find(f=>f.role===role&&prior.filter(r=>r.role==='fail:'+role).length<f.times);
const hang=()=>{out({type:'system',subtype:'init',model:MODEL});setInterval(()=>{},1e9);};

// Testing (C2): run the runtime's own command helper, as the template actor does.
const tasks=prompt.split('\n\n').filter(x=>x.startsWith('## task\n')).map(x=>x.slice('## task\n'.length));let c2=null;
if(tasks.length===1)try{const owner=JSON.parse(tasks[0]).ownerPrompt,input=JSON.parse(owner.split('\n\n')[1]);if(Object.keys(input).length===1&&typeof input.command==='string')c2=input;}catch{}
if(c2){out({type:'system',subtype:'init',model:MODEL});out({type:'assistant',message:{model:MODEL,content:[{type:'tool_use',id:'toolu_amendment_c2',name:'Bash',input:c2}]}});
  const helper=spawnSync('/bin/sh',['-c',c2.command],{encoding:'utf8',maxBuffer:64*1024*1024});if(helper.status!==0){process.stderr.write(String(helper.stderr));process.exit(1);}
  record({role:'c2'});out({type:'result',subtype:'success',is_error:false,structured_output:JSON.parse(helper.stdout),modelUsage:{[MODEL]:{inputTokens:0,outputTokens:0}}});process.exit(0);}

const schema=at<0?{}:JSON.parse(args[at+1]),props=schema.properties??{};
if('interpretation' in props){
  // Selector. Order: intake triage, impact assessment, then each review
  // construction is missing, construction, testing over the latest construction,
  // each review UAT is missing and any other required review, UAT over the
  // latest testing. An adverse current review sends work back to the stage that
  // writes its candidate. Missing reviews are read from the offered targets'
  // declared prerequisites. ABI5_AMENDMENT_ACTOR_EARLY names a stage proposed
  // as soon as design is done, prerequisites or not.
  // Failed steps of this Run (failedAttempts): a failed stage is retried until a
  // prior judgment answers its failure Result in revisionEvidenceRefs; a refused
  // choice is not proposed again. ABI5_AMENDMENT_ACTOR_REDESIGN reruns design
  // once after the impact review holds, then proposes construction once.
  const view=JSON.parse(tasks[0]),rows=view.observations,orders=view.workOrders,reviews=view.reviews?.declared??[];
  const failed=view.failedAttempts?.attempts??[],answered=new Set(view.priorJudgment?.judgment.revisionEvidenceRefs??[]);
  const purposeOf=g=>typeof g==='string'?g.replace(/^.*\/([^/@]+)@[^/]*$/,'$1'):null;
  const open=failed.filter(a=>a.refusal===undefined&&!answered.has(a.resultRef)).at(-1);
  const refused=p=>failed.some(a=>a.refusal?.relation==='target_not_permitted'&&purposeOf(a.graphFunctionRef)===p);
  if(failing('select')){record({role:'fail:select',failed});const f=failing('select');if(f.mode==='silent')hang();else{out({type:'system',subtype:'init',model:MODEL});process.stderr.write('scripted selector failure\n');process.exit(3);}}
  else{
  const last=p=>rows.findLastIndex(r=>r.purpose===p),latest=p=>rows.findLast(r=>r.purpose===p),count=p=>rows.filter(r=>r.purpose===p).length;
  const ok=r=>r.standing.satisfied&&r.standing.current,early=process.env.ABI5_AMENDMENT_ACTOR_EARLY,redesign=process.env.ABI5_AMENDMENT_ACTOR_REDESIGN==='1';
  const producer=r=>Object.keys(orders).find(p=>orders[p].writeRoots.includes(r.candidatePath))??'construction';
  const missing=p=>(view.prerequisites?.targets.find(t=>t.purpose===p)?.missingReviews??[]).map(m=>reviews.find(r=>r.reviewRef===m.reviewRef)).filter(Boolean);
  const review=r=>['review',r.reviewRef,latest(producer(r))?.resultRef??null];
  const adverse=reviews.find(r=>r.standing.resultRef!==null&&r.standing.current&&!r.standing.satisfied);
  const impact=reviews.find(r=>/\/impact@/.test(r.reviewRef));
  let next=null,reviewRef=null,subject=null;
  if(open!==undefined){const p=purposeOf(open.graphFunctionRef);
    if(p==='review')[next,reviewRef,subject]=review(reviews.find(r=>r.reviewRef===open.reviewRef));
    else if(p==='testing')[next,subject]=['testing',latest('construction').resultRef];
    else if(p==='uat')[next,subject]=['uat',latest('testing').resultRef];
    else next=p;}
  else if(last('induction')<0)next='induction';
  else if(last('design')<0)next='design';
  else if(redesign&&count('design')===1&&impact&&ok(impact)&&last('construction')<0)next='design';
  else if(redesign&&count('design')===2&&!refused('construction')&&last('construction')<0)next='construction';
  else if(early&&last(early)<0&&!refused(early))next=early;
  else if(adverse)next=producer(adverse);
  else if(last('construction')<0){const pending=missing('construction')[0];if(pending)[next,reviewRef,subject]=review(pending);else next='construction';}
  else if(last('testing')<last('construction'))[next,subject]=['testing',latest('construction').resultRef];
  else{const pending=[...missing('uat'),...reviews.filter(r=>r.required&&!ok(r))][0];
    if(pending)[next,reviewRef,subject]=review(pending);
    else if(last('uat')<last('testing'))[next,subject]=['uat',latest('testing').resultRef];}
  // Every offered target is a contribution; only a permitted one is in the next domain.
  const graph=p=>(props.contributions.items.properties.graphFunctionRef.enum??[]).find(g=>typeof g==='string'&&g.includes('/'+p+'@'));
  const items=props.contributions.items.properties.supportRefs.items,support=items&&Array.isArray(items.enum)?[...items.enum]:[],target=next===null?null:graph(next);
  emit('select:'+(next??'gap')+(reviewRef?':'+reviewRef:''),{interpretation:'Scripted amendment selector.',
    contributions:[{graphFunctionRef:target??graph('construction'),contribution:'Scripted '+(next??'gap')+' contribution.',reason:'Declared stage order and prerequisites.',supportRefs:support,evidenceRefs:[],dependsOn:[]}],
    gaps:next===null?[{supportRefs:support.slice(0,1),reason:'Scripted gap.',evidenceRefs:[]}]:[],nextGraphFunctionRef:target,nextReason:'Declared stage order and prerequisites.',
    nextEvidenceRefs:open===undefined?[]:[open.resultRef],subjectEvidenceRef:subject,revisionReason:'Scripted.',revisionEvidenceRefs:failed.map(a=>a.resultRef),...('reviewRef' in props?{reviewRef}:{})},
    {standing:reviews.map(r=>({reviewRef:r.reviewRef,...r.standing})),failed});
  }
}else if('summary' in props&&'gaps' in props){
  // Worker: the step whose files all lie in the permitted write scope; the
  // correction when an admitted review is adverse with unresolved criteria.
  const root=lineAfter('Worksite root: '),scope=JSON.parse(lineAfter('Permitted write scope: ')??'[]');
  const observed=JSON.parse(lineAfter('Actual admitted observations: ')??'[]');
  const latestReview=new Map();for(const o of observed)if(o.purpose==='review')latestReview.set(o.reviewRef,o);
  const unresolved=[...latestReview.values()].flatMap(o=>o.observed?.disposition==='satisfied'?[]:(o.observed?.unresolvedCriteria??[]));
  const steps=JSON.parse(readFileSync(join(standIn,'outputs.json'),'utf8')).steps;
  const fitting=Object.keys(steps).filter(s=>Object.keys(steps[s]).every(p=>scope.includes(p)));
  const step=fitting.length===1?fitting[0]:unresolved.length?'correction':'construction';
  if(!root||!fitting.includes(step)){process.stderr.write('stand-in worker has no step for '+JSON.stringify(scope)+'\n');process.exit(1);}
  const write=(path,bytes)=>{mkdirSync(dirname(join(root,path)),{recursive:true});writeFileSync(join(root,path),bytes);};
  const f=failing(step);
  if(f){record({role:'fail:'+step,mode:f.mode});
    // Part of the step: its second file (its only file when it has one), then the scripted end.
    if(f.mode==='exit'){const entries=Object.entries(steps[step]),[path,source]=entries[1]??entries[0];write(path,readFileSync(join(standIn,source)));out({type:'system',subtype:'init',model:MODEL});process.stderr.write('scripted worker failure\n');process.exit(3);}
    if(f.mode==='silent')hang();
    else{write('design/impact-assessment.md','Written outside the permitted write scope.\n');
      if(f.mode==='scope'){out({type:'system',subtype:'init',model:MODEL});process.stderr.write('scripted worker failure after an out-of-scope write\n');process.exit(3);}
      emit('native:'+step,{summary:`Scripted ${step} with an out-of-scope write.`,gaps:[]},{actingOn:unresolved});}
  }else{
  // A design restated after an admitted design writes different bytes.
  const restated=step==='impact-assessment'&&observed.some(o=>o.purpose==='design');
  for(const [path,source] of Object.entries(steps[step]))write(path,Buffer.concat([readFileSync(join(standIn,source)),Buffer.from(restated?'\nRestated after the impact review.\n':'')]));
  emit('native:'+step+(restated?':restated':''),{summary:`Scripted ${step}.`,gaps:[]},{actingOn:unresolved});
  }
}else{
  // Assessor: the delivered frame and rubric decide the verdict.
  const declared=lineAfter('Declared review: '),review=declared===undefined?null:JSON.parse(declared);
  const basis=JSON.parse(lineAfter('Exact assessment basis: ')),root=lineAfter('Worksite root: ');
  // The producer is the admitted observation the basis names.
  const producerRow=JSON.parse(lineAfter('Actual admitted observations: ')??'[]').find(o=>o.resultRef===basis.producer?.resultRef);
  const producer=producerRow===undefined?null:{resultRef:producerRow.resultRef,purpose:producerRow.purpose,...producerRow.observed};
  const kind=props.kind?.const??'consumer_outcome_assessment';
  const reviewName=review===null?'acceptance':review.reviewRef.replace(/^.*\/([^/@]+)@[^/]*$/,'$1');
  const rubricBytes=readFileSync(join(root,basis.rubric.path)),digest=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
  const verdict=await assessUnderRubric({reviewName,rubricText:rubricBytes.toString('utf8'),root,candidatePath:basis.candidate.path,sources:basis.sources,producer});
  emit('assess:'+(review?.reviewRef??'uat'),{kind,disposition:verdict.disposition,reason:verdict.reason,unresolvedCriteria:verdict.unresolvedCriteria},
    {frame:review?.frame??null,rubric:{path:basis.rubric.path,digest:digest(rubricBytes),declaredDigest:basis.rubric.digest},
      candidate:{path:basis.candidate.path,digest:digest(readFileSync(join(root,basis.candidate.path)))},criteria:verdict.criteria,disposition:verdict.disposition,producerSeen:producer!==null});
}
