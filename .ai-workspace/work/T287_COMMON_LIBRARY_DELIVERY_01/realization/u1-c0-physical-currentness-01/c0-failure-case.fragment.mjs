  const failC0AfterPublication = async () => {
    const label = 'actual C0 post-publication unavailable', f = await make([]), b2 = await addTargets(f, ['target.txt']);
    const request = b2.targets[0].request, env = b2.env;
    // Supplied lower binding/lock/install premises, not a performed Public bind.
    // The existing Product carrier predicate and checked ABG ingress stay real.
    const { kind: bindingKind, admissionEventRef, ...bindingBody } = env.workspaceBinding;
    const bindingCarrier = { kind: 'workspace_binding_candidate', ...bindingBody };
    const establishedLockPremise = { lockId: bindingCarrier.lockId, lockDigest: bindingCarrier.lockDigest };
    assert.equal(product.isWorkspaceBindingCandidateInResolvedLock(bindingCarrier, establishedLockPremise,
      undefined, env.workspaceAuthorityBasis), true);
    const artifactCandidate = { ...f.common, kind: 'public_operation_artifact_admitted', scopeClass: 'workspace',
      aggregateType: 'workspace', aggregateId: bindingCarrier.bindingId, basisId: env.workspaceAuthorityBasis.authorityBasisId,
      payload: { operationId: 'abg.operation.workspace.bind', artifactRef: bindingCarrier.bindingId,
        artifactDigest: bindingCarrier.bindingDigest, artifact: bindingCarrier, workspaceAuthorityBasis: env.workspaceAuthorityBasis } };
    for (const key of ['runId', 'graphCallId', 'frameId']) delete artifactCandidate[key];
    const bindingAppend = appendCheckedArtifactEvent(f.store, selectHeldEventStoreDurablePrefix(f.store), deepFreeze(artifactCandidate));
    assert.ok(bindingAppend.event, JSON.stringify(bindingAppend));
    assert.equal(bindingAppend.event.payloadDigest, hash(artifactCandidate.payload));
    const parts = g.constructWorksiteC0PublicationParts({ productId: 'product://u1/controlled-c0',
      artifactDigest: hash('controlled-c0-artifact'), productContentDigest: hash('controlled-c0-content'),
      productManifestDigest: hash('controlled-c0-manifest'), packageName: '@abiogenesis/typescript-tenant',
      packageVersion: '5.0.0-dev.286' }, g.WORKSITE_C0_IDS.moduleRef);
    const graph = parts.graphFunctions[0], declaredBinding = parts.implementationBindings[0];
    const { kind, schemaVersion, disposition, leafResolutionCandidateRef, leafResolutionCandidateDigest, ...priorRow } = f.implementationSet.rows[0];
    const { kind: declaredKind, bindingRef, ...bindingFields } = declaredBinding;
    const rowBody = { ...priorRow, ...bindingFields, graphFunctionRef: graph.name, graphFunctionDigest: hash(graph),
      nodeRef: graph.template.startNodeRef, programLocusRef: graph.template.startNodeRef, implementationBindingRef: bindingRef };
    const rowDigest = hash(rowBody), row = { kind, schemaVersion, disposition,
      leafResolutionCandidateRef: identity('leaf-resolution-candidate', rowDigest), leafResolutionCandidateDigest: rowDigest, ...rowBody };
    const setDigest = hash({ rows: [row] }), set = { implementationSetRef: identity('implementation-set', setDigest),
      implementationSetDigest: setDigest, rows: [row] };
    const implementationEvent = f.atCut(() => f.append('implementation_admitted', 'workspace', bindingCarrier.bindingId,
      { ...set, implementationSet: set, interactionSetRef: 'interaction-set://u1/c0', interactionSetDigest: hash('c0-interactions') },
      { scopeClass: 'workspace' }));
    const implementationSet = { kind: 'admitted_implementation_set', schemaVersion: '5.0.0', disposition: 'admitted',
      ...set, admissionEventRef: implementationEvent.eventId };
    const execution = f.atCut(() => f.basisFor(env, b2.invocation, request, { graphFunctionRef: graph.name,
      graphFunctionDigest: hash(graph), implementationSetRef: set.implementationSetRef, implementationSetDigest: setDigest }));
    const executionBasis = { kind: 'execution_basis', schemaVersion: '5.0.0', disposition: 'admitted', ...execution };
    const callBody = { basisId: execution.basisRef, graphCallId: 'graph-call://u1/c0-failure', frameId: 'frame://u1/c0-failure',
      vectorIndex: 0, stageRole: 'file-replace', taskOrdinal: null, attempt: 1, programLocusRef: row.programLocusRef, retryPath: [] };
    const cCallDigest = hash(callBody), callRef = `c-call:${cCallDigest}`;
    const scope = { basisId: execution.basisRef, graphFunctionRef: graph.name, graphCallId: callBody.graphCallId, frameId: callBody.frameId };
    const occurrence = f.atCut(() => {
      const opened = f.append('c_call_opened', 'c_call', callRef, { ...callBody, cCallRef: callRef, cCallDigest, callClass: 'leaf' }, scope);
      const fibre = f.append('c_call_fibre_selected', 'c_call', callRef, { cCallRef: callRef, callClass: 'leaf', armId: g.WORKSITE_C0_IDS.armId,
        regime: 'F_D', implementationRef: row.implementationRef, implementationBindingRef: row.implementationBindingRef,
        implementationRequirementKey: row.requirementKey, implementationSetRef: set.implementationSetRef },
        { ...scope, causationEventRefs: [opened.eventId] });
      return { opened, fibre };
    });
    const cCall = { ...f.cCall, ...callBody, cCallRef: callRef, cCallDigest, graphFunctionRef: graph.name,
      implementationSetRef: set.implementationSetRef, implementationRequirementKey: row.requirementKey,
      implementationRef: row.implementationRef, implementationBindingRef: row.implementationBindingRef,
      inputContractRef: row.inputContractRef, outputContractRef: row.outputContractRef,
      failureContractRef: row.failureContractRef, refusalContractRef: row.refusalContractRef,
      openedEventRef: occurrence.opened.eventId, fibreSelectedEventRef: occurrence.fibre.eventId, runId: f.common.runId };
    const authorization = product.constructWorksiteEffectAuthorization({ ...env, request, executionBasis, cCall, implementationSet });
    const input = { ...env, request, executionBasis, cCall, implementationSet, authorization };
    assert.equal(product.isWorksiteFileReplaceInput(input), true, JSON.stringify(authorization));
    const selected = [observation('b2 failed C0 predecessor', request), ...controls(f)];
    const before = await views(f, label + ' before physical effect', selected);
    assert.ok(before.facts.every(row => row.indexed));
    const target = join(f.canonicalRoot, 'target.txt'), original = { rename: fs.rename, open: fs.open };
    const fault = { published: false, injected: 0, kind: 'controlled EIO on target open after actual rename' };
    fs.rename = async (source, destination) => { const result = await original.rename(source, destination);
      if (destination === target) fault.published = true; return result; };
    fs.open = async (path, ...args) => {
      if (fault.published && path === target) { fault.injected += 1; throw Object.assign(new Error('U1 selected post-publication EIO'), { code: 'EIO' }); }
      return original.open(path, ...args);
    };
    syncBuiltinESMExports();
    let physical;
    try { physical = await product.replaceWorksiteFile(input); }
    finally { Object.assign(fs, original); syncBuiltinESMExports(); }
    physicalEffects.push({ label, owner: 'replaceWorksiteFile', input, physical, fault });
    await capture(label + ' actual owner failure', { bindingCarrier, establishedLockPremise, bindingEvent: bindingAppend.event,
      implementationEvent, occurrence, input, physical, fault,
      lowerPremises: 'Supplied Public binding/install/implementation selection and graph occurrence; actual Product carriers, physical rename, injected substrate EIO, checked ABG append. No performed Public binding or installed workflow.' });
    assert.equal(fault.published, true); assert.equal(fault.injected, 1);
    assert.equal(product.isWorksitePostPublicationFailure(physical), true, JSON.stringify(physical));
    assert.equal(physical.code, 'filesystem_refused'); assert.equal(physical.substrateCode, 'EIO');
    assert.equal(physical.physicalOutcome.postPublicationObservation, null);
    assert.equal(physical.physicalOutcome.publication.committed, true);
    assert.equal(await fs.readFile(target, 'utf8'), 'candidate\n');
    assert.deepEqual(selectHeldEventStoreDurablePrefix(f.store), before.coordinate);
    assert.deepEqual(calculus.deriveRuntimeEventCalculusProjection(f.prefix()), before.projection);
    const authenticated = projectWorksiteFailureBasis(f.rows(), callRef, physical);
    assert.ok(authenticated, 'unchanged failure owner authenticates supplied lower premises and actual failure');
    assert.deepEqual(authenticated.authorization, authorization);
    const evidence = f.atCut(() => {
      const body = { cCallRef: callRef, contractRef: g.WORKSITE_C0_IDS.failureContractRef, evidenceClass: 'deterministic',
        implementationRef: row.implementationRef, inputDigest: hash(request), outputDigest: hash(physical) };
      const digest = hash(body);
      return f.append('c_call_evidenced', 'c_call', callRef, { ...body, evidenceRef: identity('evidence', digest), evidenceDigest: digest },
        { ...scope, causationEventRefs: [occurrence.fibre.eventId] });
    });
    const evidenced = await views(f, label + ' evidence only', selected);
    assert.ok(evidenced.facts.every(row => row.indexed));
    const event = f.atCut(() => {
      const body = { cCallRef: callRef, resultClass: 'failure', contractRef: g.WORKSITE_C0_IDS.failureContractRef,
        valueKind: 'worksite_effect_refusal', value: physical, valueDigest: hash(physical), evidenceRefs: [evidence.payload.evidenceRef] };
      const digest = hash(body);
      return f.append('c_call_result_admitted', 'c_call', callRef, { ...body, resultRef: identity('result', digest), resultDigest: digest },
        { ...scope, causationEventRefs: [evidence.eventId] });
    });
    const prior = f.rows().filter(row => row.admissionOrdinal < event.admissionOrdinal);
    assert.deepEqual(calculus.projectWorksiteTransitionForResult(event, prior), {
      before: request.predecessorObservation.observationRef, after: null, successorObservation: null });
    assert.equal(calculus.projectWorksiteTransitionForResult({ ...event, payload: { ...event.payload, valueDigest: hash('wrong') } }, prior), null);
    assert.equal(calculus.projectWorksiteTransitionForResult(event, prior.filter(row => row.eventId !== evidence.eventId)), null);
    const after = await views(f, label + ' Result admitted', selected);
    assert.deepEqual(after.facts.map(row => row.indexed), [false, false, true, true]);
    assert.deepEqual(event.payload.value, physical);
    assert.deepEqual(calculus.deriveRuntimeEventCalculusProjection(before.prefix), before.projection);
    assert.deepEqual(calculus.deriveRuntimeEventCalculusProjection(evidenced.prefix), evidenced.projection);
    const dependencies = calculus.eventCalculusDependencies(f.prefix(), event, []);
    assert.ok(dependencies.every(row => row.admissionOrdinal < event.admissionOrdinal));
    for (const required of [bindingAppend.event, implementationEvent, evidence]) assert.ok(dependencies.some(row => row.eventId === required.eventId));
    assert.ok(dependencies.some(row => row.kind === 'basis_admitted' && row.payload.rawInputValue?.predecessorObservation?.observationRef === controls(f)[0].value.observationRef));
    await capture(label + ' authenticated transition and dependency closure', { event, evidence, authenticated,
      dependencies: dependencies.map(row => row.eventId), currentness: after.facts,
      nativeGate: nativeOwner.worksiteCommandSourcesInvalidatedAfter(f.prefix(), before.rows.at(-1).admissionOrdinal, f.canonicalRoot, ['target.txt']),
      nativeGateScope: 'unchanged native invalidator has no C0 deterministic-failure branch; separate source-derived residual' });
  };
