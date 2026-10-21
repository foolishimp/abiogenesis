import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {packageRoot} from '../support/d2-bounded-harness.mjs';
import {historicalDesignHarness} from '../support/d2-historical-design-harness.mjs';

test('same-byte/new-inode targets recover original Design coordinates on repeated repair (native lookup assumptions)',async()=>{
  const h=await historicalDesignHarness(),one=h.reobserve(h.stage.worksite,1),two=h.reobserve(one,2);
  for(let i=0;i<one.targets.length;i++){
    assert.equal(one.targets[i].target.predecessorObservation.fileDigest,two.targets[i].target.predecessorObservation.fileDigest);
    assert.notEqual(one.targets[i].target.predecessorObservation.observationRef,two.targets[i].target.predecessorObservation.observationRef);
    assert.notEqual(one.targets[i].target.targetRef,two.targets[i].target.targetRef);
  }
  const first=h.project(h.original,one),second=h.project(first,two),mapping=h.coordinates(second.value);
  const oldInventory=new Set(h.stage.assets.at(-1).candidate.worksiteDesign.targets.map(row=>row.targetRef));
  assert.equal(first.value.current.worksite.targets.filter(row=>oldInventory.has(row.target.targetRef)).length,0,'exact predecessor immediate-parent inventory join cannot find retained Design refs');
  assert.ok(mapping);assert.deepEqual(mapping.historicalWorksite,h.stage.worksite);
  assert.equal(mapping.snapshotTargetRefs.length,22);assert.equal(mapping.selectedTargetRefs.length,2);
  assert.equal(mapping.snapshotTargetRefs.filter(ref=>!mapping.selectedTargetRefs.includes(ref)).length,20);
  const config=h.configuration(second.value,mapping);assert.ok(config);assert.equal(config.constructionTask.targets.length,2);
  assert.deepEqual(config.constructionTask.targets.map(row=>row.targetRef),two.targets.filter((_,index)=>h.selectedIndexes.includes(index)).map(row=>row.target.targetRef));
  assert.deepEqual(second.value.current.assets,h.stage.assets,'Design and other accepted assets unchanged');
  assert.ok(h.lookups.includes(h.stage.assets.at(-1).source.cCallRef),'exact author ownership, not a global event scan');
});

test('first repair and byte-changing successor preserve exactly selected current targets',async()=>{
  const h=await historicalDesignHarness(),current=h.reobserve(h.stage.worksite,1,{changedBytes:true}),first=h.project(h.original,current);
  const mapping=h.coordinates(first.value);assert.ok(mapping);
  assert.deepEqual(mapping.selectedTargetRefs,h.stage.worksite.targets.filter((_,index)=>h.selectedIndexes.includes(index)).map(row=>row.target.targetRef));
  const config=h.configuration(first.value);assert.ok(config);assert.equal(config.constructionTask.targets.length,2);
  assert.deepEqual(config.constructionTask.targets.map(row=>row.predecessorObservation),current.targets.filter((_,index)=>h.selectedIndexes.includes(index)).map(row=>row.target.predecessorObservation));
});

test('newly assessed and subsequently retained revised Design use their own author basis, not the original root',async()=>{
  const h=await historicalDesignHarness(),one=h.reobserve(h.stage.worksite,1),revised=h.changedDesign(h.original,one);
  assert.ok(h.coordinates(revised.value),'same stage-revision bridge maps parent selection to new Design basis');
  const two=h.reobserve(one,2),repair=h.project(revised,two),three=h.reobserve(two,3),again=h.project(repair,three);
  const mapping=h.coordinates(again.value);assert.ok(mapping);assert.deepEqual(mapping.historicalWorksite,one);
  assert.notDeepEqual(mapping.historicalWorksite,h.stage.worksite);
  assert.deepEqual(mapping.snapshotTargetRefs,one.targets.map(row=>row.target.targetRef));
  assert.equal(h.configuration(again.value).constructionTask.targets.length,2);
  assert.deepEqual(again.value.current.assets,revised.value.current.assets);
});

for(const mutation of ['missing-author','foreign-author-asset','crossed-parent-result','non-author-owner','non-advancing-author']){
  test(`historical Design refuses ${mutation} (native lookup assumptions)`,async()=>{
    const h=await historicalDesignHarness(),first=h.project(h.original,h.reobserve(h.stage.worksite,1));
    if(mutation==='missing-author')h.states.delete(h.stage.assets.at(-1).source.cCallRef);
    if(mutation==='foreign-author-asset')h.originalAuthor.row.result.value={...h.originalAuthor.row.result.value,assets:h.stage.assets.slice(0,-1)};
    if(mutation==='crossed-parent-result')h.original.row.result.resultDigest=h.product.sha256Canonical('crossed-parent');
    if(mutation==='non-author-owner')h.originalAuthor.row.cCall.implementationRef='implementation://unit/not-an-author';
    if(mutation==='non-advancing-author')h.originalAuthor.row.judgment.judgment='blocked';
    assert.equal(h.coordinates(first.value),null);
  });
}

for(const mutation of ['missing-current-subject','foreign-current-subject','changed-current-role','ambiguous-current-membership']){
  test(`historical inventory refuses ${mutation} with Product-derived coordinates`,async()=>{
    const h=await historicalDesignHarness(),worksite=structuredClone(h.reobserve(h.stage.worksite,1));
    if(mutation==='missing-current-subject')worksite.targets.pop();
    if(mutation==='changed-current-role')worksite.targets[0].role=worksite.targets[0].role==='configuration'?'implementation':'configuration';
    if(mutation==='foreign-current-subject'){
      const old=worksite.targets[0],relativePath=old.target.subject.relativePath+'.foreign',subject=h.product.constructWorksiteSubject({...worksite,relativePath,subjectUri:old.target.subject.subjectUri+'.foreign'});
      assert.equal(subject.kind,'worksite_subject');
      const bytes=Buffer.from(old.base64,'base64'),predecessorObservation=h.product.constructWorksiteObservation({subject,state:'file',fileIdentity:'mechanical-foreign:1',fileDigest:h.product.sha256Bytes(bytes),byteLength:bytes.length});
      const task=h.product.constructWorksiteConstructionTask({...worksite,targets:[{subject,territory:old.target.territory,predecessorObservation}],prompt:'Pure foreign target coordinate'});
      worksite.targets[0]={...old,target:task.targets[0]};
    }
    if(mutation==='ambiguous-current-membership'){
      worksite.targets.push(worksite.targets[0]);
      assert.equal(h.product.isSemanticWorksiteBasis(worksite),false,'existing Product uniqueness guard refuses ambiguity');
      const first=h.project(h.original,h.reobserve(h.stage.worksite,1));
      const invalid=structuredClone(first.value);invalid.current.worksite=worksite;
      assert.equal(h.coordinates(invalid),null);return;
    }
    assert.ok(h.product.isSemanticWorksiteBasis(worksite));
    const first=h.project(h.original,worksite);assert.equal(h.coordinates(first.value),null);
  });
}

test('selection outside the applicable revised Design never broadens writes',async()=>{
  const h=await historicalDesignHarness(),one=h.reobserve(h.stage.worksite,1),excluded=h.stage.worksite.targets.findIndex(row=>row.role==='configuration');
  assert.ok(excluded>=0);const revised=h.changedDesign(h.original,one,{excludeIndex:excluded});
  const attempted=h.project(revised,h.reobserve(one,2),{selectedIndexes:[excluded]});
  assert.equal(h.coordinates(attempted.value),null);
});

test('the correction stays on the shared preparation path and preserves prior mechanisms byte-exact',async()=>{
  const {restorePre08RevisionCollector}=await import('../support/d2-evidence-owner-conservation.mjs');
  const path='code/src/abg/semantic_revision.ts',before=readFileSync(resolve(packageRoot,'../preimages/source',path),'utf8'),after=restorePre08RevisionCollector(readFileSync(resolve(packageRoot,path),'utf8'));
  assert.equal(after.slice(0,after.indexOf('/** The retained Design')),before.slice(0,before.indexOf('function revisionPreparationAtBasis')));
  assert.equal(after.slice(after.indexOf('export function projectRevisionWorksitePreparation')),before.slice(before.indexOf('export function projectRevisionWorksitePreparation')));
  assert.match(after,/const coordinates = projectRevisionDesignCoordinates\(basis, input\);/);
  assert.match(after,/revisionPreparationAtBasis\(basis, original, false,/,'evidence admission/replay reuses the same preparation derivation');
});
