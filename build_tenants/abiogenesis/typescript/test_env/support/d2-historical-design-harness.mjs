import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import {capturedEnvelope,packageRoot,load} from './d2-bounded-harness.mjs';

// Pure Product-derived values plus explicit native lookup assumptions. No
// RuntimeEvent, admitted prefix, store, filesystem observation or effect is
// constructed. The unchanged compiled mapping body runs in the VM; only its
// owner and exact CCall-result lookup imports are substituted.
export async function historicalDesignHarness() {
  const product={...await load('build/code/src/product/index.js'),...await load('build/code/src/product/worksite_effect.js')};
  const revision=await load('build/code/src/product/semantic_revision.js');
  const stageProduct=await load('build/code/src/product/semantic_stage.js');
  Object.assign(product,stageProduct);
  const {SEMANTIC_STAGE_IDS:D}=await load('build/code/src/gtl/semantic_stage_identity.js');
  const {SEMANTIC_REVISION_IDS:R}=await load('build/code/src/gtl/semantic_revision_identity.js');
  const stage=capturedEnvelope(),states=new Map(),lookups=[];
  const owner={prefix:{assumption:'exact native owner prefix'},events:[],lifecycle:stage.lifecycle,source:stage.sourceHandoff.declaration};
  const basis={publication:{},declarationGraphFunctions:[]};
  function state(name,value,{cCallRef=`c-call://historical-design-unit/${name}`,implementationRef=R.projectionImplementationRef}={}) {
    const coordinate={cCallRef,resultRef:`result://historical-design-unit/${name}`,resultDigest:product.sha256Canonical(value),
      resultAdmissionEventRef:`lookup-only-result:${name}`,judgmentEventRef:`lookup-only-judgment:${name}`};
    const row={cCall:{cCallRef,implementationRef},result:{resultRef:coordinate.resultRef,resultDigest:coordinate.resultDigest,
      admissionEventRef:coordinate.resultAdmissionEventRef,resultClass:'success',value},judgment:{admissionEventRef:coordinate.judgmentEventRef,judgment:'advance'}};
    states.set(cCallRef,row);return {coordinate,row};
  }
  const authorValue={...stage,assets:[...stage.assets.slice(0,-1),{...stage.assets.at(-1),assessment:null}]};
  assert.ok(product.isSemanticStageEnvelope(authorValue));
  const originalAuthor=state('original-design-author',authorValue,{cCallRef:stage.assets.at(-1).source.cCallRef,implementationRef:D.authorImplementationRef});
  const original=state('original-design-assessed',stage);
  const selectedIndexes=['implementation','verifier'].map(role=>stage.worksite.targets.findIndex(row=>row.role===role));
  assert.ok(selectedIndexes.every(index=>index>=0));
  function reobserve(worksite,epoch,{changedBytes=false}={}) {
    const inputs=worksite.targets.map((row,index)=>{
      const bytes=changedBytes&&selectedIndexes.includes(index)?Buffer.from(`mechanical changed bytes ${epoch}/${index}\n`):Buffer.from(row.base64,'base64');
      const observation=product.constructWorksiteObservation({subject:row.target.subject,state:'file',fileIdentity:`mechanical-device:${epoch}-${index}`,
        fileDigest:product.sha256Bytes(bytes),byteLength:bytes.length});
      assert.equal(observation.kind,'worksite_observation');
      return {subject:row.target.subject,territory:row.target.territory,predecessorObservation:observation,base64:bytes.toString('base64'),role:row.role};
    });
    const task=product.constructWorksiteConstructionTask({...worksite,targets:inputs.map(({base64,role,...input})=>input),prompt:'Pure target-identity fixture; never dispatched'});
    const next={...worksite,targets:task.targets.map(target=>{const row=inputs.find(row=>row.subject.subjectRef===target.subject.subjectRef);return {target,base64:row.base64,role:row.role};})};
    assert.ok(product.isSemanticWorksiteBasis(next));return next;
  }
  let ordinal=0;
  function project(parent,currentWorksite,{mode='construction_repair',selectedIndexes:indices=selectedIndexes}={}) {
    const name=`revision-${++ordinal}`,prior=parent.row.result.value.kind==='semantic_revision_envelope'?parent.row.result.value.current:parent.row.result.value;
    const cause=state(`${name}-cause`,{assumption:'linked failed result supplied by native lookup'}).coordinate;
    const selection={kind:'semantic_revision_selection',schemaVersion:'5.0.0',parent:parent.coordinate,causes:[cause],mode,
      selectedStageRef:mode==='stage_revision'?stage.assets.at(-1).stageRef:null,
      selectedObligationRefs:[stage.sourceHandoff.declaration.fulfillmentBindings[0].obligationRef],
      selectedTargetRefs:indices.map(index=>prior.worksite.targets[index].target.targetRef),reasonRef:`reason://historical-design-unit/${name}`};
    const decision=state(`${name}-selection`,selection);
    const request={kind:'semantic_revision_request',schemaVersion:'5.0.0',parent:parent.coordinate,causes:[cause],selection:decision.coordinate,currentWorksite};
    const value=revision.deriveSemanticRevision(parent.row.result.value,request,selection);
    assert.ok(value,'actual pure Product revision derivation');
    return {...state(name,value),value,request,selection};
  }
  function changedDesign(parent,currentWorksite,{excludeIndex=null}={}) {
    const cut=project(parent,currentWorksite,{mode:'stage_revision'}),oldAsset=stage.assets.at(-1),raw=structuredClone(oldAsset.candidate);
    const mapped=new Map(stage.worksite.targets.map(row=>[row.target.targetRef,currentWorksite.targets.find(t=>t.target.subject.subjectRef===row.target.subject.subjectRef).target.targetRef]));
    raw.worksiteDesign.targets=raw.worksiteDesign.targets.map(row=>({...row,targetRef:mapped.get(row.targetRef)}));
    raw.worksiteDesign.dependencyTargetRefs=raw.worksiteDesign.dependencyTargetRefs.map(ref=>mapped.get(ref));
    if(excludeIndex!==null){const ref=currentWorksite.targets[excludeIndex].target.targetRef;raw.worksiteDesign.targets=raw.worksiteDesign.targets.filter(row=>row.targetRef!==ref);raw.worksiteDesign.dependencyTargetRefs=raw.worksiteDesign.dependencyTargetRefs.filter(row=>row!==ref);}
    const source={cCallRef:`c-call://historical-design-unit/new-author-${ordinal}`,inputDigest:product.sha256Canonical(cut.value),actorInvocationRef:`actor://historical-design-unit/new-author-${ordinal}`,
      promptDigest:product.sha256Canonical('unit-prompt'),transportDigest:product.sha256Canonical('unit-transport')};
    const authored=revision.deriveRevisionAsset(cut.value,oldAsset.stageRef,raw,source);assert.ok(authored);
    const author=state(`new-author-${ordinal}`,authored,{cCallRef:source.cCallRef,implementationRef:R.authorImplementationRef});
    const assessed=revision.deriveRevisionAssessment(authored,oldAsset.stageRef,oldAsset.assessment.candidate,{...source,
      cCallRef:`c-call://historical-design-unit/new-assessor-${ordinal}`,actorInvocationRef:`actor://historical-design-unit/new-assessor-${ordinal}`,inputDigest:product.sha256Canonical(authored)});assert.ok(assessed);
    return {...state(`new-design-assessed-${ordinal}`,assessed),value:assessed,author};
  }
  const modulePath=resolve(packageRoot,'build/code/src/abg/semantic_revision.js');
  const module=new SourceTextModule(readFileSync(modulePath,'utf8'),{identifier:modulePath}),links=new Map();
  await module.link(async specifier=>{
    if(links.has(specifier))return links.get(specifier);
    const native=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(modulePath),specifier)).href);
    const overrides=specifier==='./semantic_stage.js'?{authenticateSemanticStageBasis:()=>owner,
      projectSemanticPredecessorAtPrefix:(_prefix,_events,_publication,ref)=>{lookups.push(ref);return states.get(ref)??null;}}:{};
    const values={...native,...overrides},linked=new SyntheticModule(Object.keys(values),function(){for(const [key,value]of Object.entries(values))this.setExport(key,value);});
    links.set(specifier,linked);return linked;
  });
  await module.evaluate();
  const coordinates=value=>module.namespace.projectRevisionDesignCoordinates(basis,value);
  function configuration(value,mapping=coordinates(value)) {
    return mapping===null?null:stageProduct.deriveSemanticWorksiteConstructionConfiguration(value.current,undefined,
      {historicalWorksite:mapping.historicalWorksite,selectedTargetRefs:mapping.selectedTargetRefs,retainedBindings:value.revisionBasis.retainedBindings,feedback:{assumption:'mechanical lookup only'}});
  }
  return {product,revision,stageProduct,stage,states,lookups,owner,basis,original,originalAuthor,selectedIndexes,state,reobserve,project,changedDesign,coordinates,configuration};
}
