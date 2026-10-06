import assert from 'node:assert/strict';

/** Component preparation consumes current declarations through their canonical
 * resource owner. Historical qualification subject/material are not relabeled. */
export function prepareRetainedSetupBinding({runtime, owners, live, setup, currentCatalog, currentView,
  originalInput, originalManifest, originalDeclarationProofs, originalPins}) {
  const {product, validator} = runtime, hash = product.sha256Canonical, identity = validator.constructQualificationIdentity;
  assert.strictEqual(product.selectOwnedProductVerification(live.ownerRequest, live.verified), live.verified,
    'preparation requires the current native verifier');
  assert.equal(currentCatalog.workspaceBindingDigest, setup.workspaceBinding.digest);
  assert.equal(currentView.catalogBasisDigest, currentCatalog.basisDigest);
  assert.equal(setup.workspaceBindingCandidate.authorizedActorRef, setup.currentActor);
  assert.equal(validator.isQualificationAssessmentInput(originalInput), true);
  assert.equal(originalInput.task.representation, 'resource_refs_v1');
  assert.equal(originalInput.task.resource.ref, originalManifest.resourceRef);
  assert.equal(originalInput.task.resource.digest, originalManifest.resourceDigest);
  const currentProof = {kind: 'abg_historical_declaration_proof', schemaVersion: '5.0.0',
    catalog: currentCatalog, catalogView: currentView};
  const currentSelection = {catalogBasisDigest: currentCatalog.basisDigest,
    readinessBasisDigest: currentCatalog.readinessBasisDigest, viewDigest: currentView.viewDigest, proofDigest: hash(currentProof)};
  const {resourceRef: _ref, resourceDigest: _digest, ...manifestBody} = originalManifest;
  const manifest = identity({...manifestBody,
    declarationSelections: [...originalManifest.declarationSelections, currentSelection]},
    'resourceRef', 'resourceDigest', 'qualification-resource://abiogenesis/');
  const resource = {ref: manifest.resourceRef, digest: manifest.resourceDigest};
  const select = previous => ({...previous, resource});
  const {taskRef: _taskRef, taskDigest: _taskDigest, ...originalTask} = originalInput.task;
  const task = identity({...originalTask, resource, material: originalTask.material.map(select),
    provenance: select(originalTask.provenance), ...(originalTask.scope === undefined ? {} : {scope: select(originalTask.scope)}),
    declarations: [...originalTask.declarations, currentSelection]}, 'taskRef', 'taskDigest', 'qualification-task://abiogenesis/');
  const {planRef: _planRef, planDigest: _planDigest, ...originalPlan} = originalInput.plan;
  const plan = identity({...originalPlan, slots: originalPlan.slots.map(slot => slot.slotRef === task.slotRef
    ? {...slot, task: {ref: task.taskRef, digest: task.taskDigest}} : slot)}, 'planRef', 'planDigest', 'qualification-plan://abiogenesis/');
  const input = {...originalInput, task, plan};
  assert.equal(validator.isQualificationAssessmentInput(input), true, 'successor Task must pass the published owner guard');
  const resources = owners.resources.acquireQualificationResources({kind: 'qualification_resource_assertion', schemaVersion: '1',
    manifests: [manifest], declarationProofs: [...originalDeclarationProofs, currentProof]});
  const prepared = owners.qualification.prepareQualificationAssessment(input, resources);
  assert.strictEqual(prepared.input, input);
  assert.equal(prepared.view.task.declarations.some(p => hash(p) === currentSelection.proofDigest), true,
    'current C10 declaration preimage must reach actual Task establishment');
  assert.deepEqual(prepared.view.task.subjectBasis, originalTask.subjectBasis);
  assert.deepEqual(prepared.view.task.lawBasis, originalTask.lawBasis);
  assert.deepEqual(prepared.view.task.coverage, originalTask.coverage);
  const report = {standing: 'component_preparation_only', visibility: owners.visibility, originalPins,
    currentSetup: {actorRef: setup.currentActor, workspaceBinding: setup.workspaceBinding,
      productContentDigest: live.verified.productContentDigest, manifestDigest: live.verified.manifestDigest,
      prefix: live.selection.prefix, declarationSelection: currentSelection},
    originalTask: {ref: originalInput.task.taskRef, digest: originalInput.task.taskDigest},
    successorTask: {ref: task.taskRef, digest: task.taskDigest}, resource,
    historicalSubject: task.subjectBasis, lawBasis: task.lawBasis, inventory: task.inventory,
    scope: task.scope?.entry ?? null, requestDigest: hash(prepared.request), promptDigest: hash(prepared.request.prompt),
    material: prepared.view.task.material.map(({contentBase64: _body, ...m}) => m),
    provenanceDigest: hash(prepared.view.task.provenance), residuals: [...task.residuals],
    currentCandidateSemanticQualification: 'unknown; historical subject is preserved',
    noTaskRunWorkerDispatch: true};
  return Object.freeze({input, resources, prepared, report,
    prepareAgain: () => owners.qualification.prepareQualificationAssessment(input, resources)});
}
