// Model-free stand-in for every native role of the amendment witness, run as
// the actor process. It reads only what its own task delivers:
// - selector: its selector view (observations, declared reviews with standing,
//   each offered target's declared prerequisites and missing reviews);
// - worker: its permitted write scope and the admitted observations;
// - assessor: the declared review line, the assessment basis and the worksite.
// The assessor never branches on a path: it applies the delivered rubric's
// criteria to the candidate and sources (assessUnderRubric).
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
  const view=JSON.parse(tasks[0]),rows=view.observations,orders=view.workOrders,reviews=view.reviews?.declared??[];
  const last=p=>rows.findLastIndex(r=>r.purpose===p),latest=p=>rows.findLast(r=>r.purpose===p);
  const ok=r=>r.standing.satisfied&&r.standing.current,early=process.env.ABI5_AMENDMENT_ACTOR_EARLY;
  const producer=r=>Object.keys(orders).find(p=>orders[p].writeRoots.includes(r.candidatePath))??'construction';
  const missing=p=>(view.prerequisites?.targets.find(t=>t.purpose===p)?.missingReviews??[]).map(m=>reviews.find(r=>r.reviewRef===m.reviewRef)).filter(Boolean);
  const review=r=>['review',r.reviewRef,latest(producer(r))?.resultRef??null];
  const adverse=reviews.find(r=>r.standing.resultRef!==null&&r.standing.current&&!r.standing.satisfied);
  let next=null,reviewRef=null,subject=null;
  if(last('induction')<0)next='induction';
  else if(last('design')<0)next='design';
  else if(early&&last(early)<0)next=early;
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
    gaps:next===null?[{supportRefs:support.slice(0,1),reason:'Scripted gap.',evidenceRefs:[]}]:[],nextGraphFunctionRef:target,nextReason:'Declared stage order and prerequisites.',nextEvidenceRefs:[],
    subjectEvidenceRef:subject,revisionReason:'Scripted.',revisionEvidenceRefs:[],...('reviewRef' in props?{reviewRef}:{})},{standing:reviews.map(r=>({reviewRef:r.reviewRef,...r.standing}))});
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
  for(const [path,source] of Object.entries(steps[step])){mkdirSync(dirname(join(root,path)),{recursive:true});writeFileSync(join(root,path),readFileSync(join(standIn,source)));}
  emit('native:'+step,{summary:`Scripted ${step}.`,gaps:[]},{actingOn:unresolved});
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
