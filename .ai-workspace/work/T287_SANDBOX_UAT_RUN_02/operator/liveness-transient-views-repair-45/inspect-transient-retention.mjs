import assert from 'node:assert/strict';
export async function inspectLivenessCutRetention(source) {
  const { Session } = await import('node:inspector');
  const session = new Session(); session.connect();
  const group = 'liveness-cut-retention';
  const post = (method, params) => new Promise((resolve, reject) =>
    session.post(method, params, (error, value) => error ? reject(error) : resolve(value)));
  globalThis.__livenessCutDiagnosticSource = source;
  const get = id => post('Runtime.getProperties', { objectId: id, ownProperties: true });
  const values = async id => {
    const array = await post('Runtime.callFunctionOn', { objectId: id,
      functionDeclaration: 'function() { return Array.from(this.values()); }', objectGroup: group });
    assert.equal(array.exceptionDetails, undefined);
    return (await get(array.result.objectId)).result
      .filter(row => /^\d+$/.test(row.name)).map(row => row.value.objectId);
  };
  try {
    const root = await post('Runtime.evaluate', { expression: 'globalThis.__livenessCutDiagnosticSource', objectGroup: group });
    const scopes = (await get(root.result.objectId)).privateProperties.find(row => row.name === '#scopes');
    assert.ok(scopes?.value.objectId, 'actual owner source private scope map');
    const facts = [];
    for (const scopeId of await values(scopes.value.objectId)) {
      const owners = (await get(scopeId)).privateProperties.find(row => row.name === '#owners');
      assert.ok(owners?.value.objectId);
      const owned = await post('Runtime.callFunctionOn', { objectId: owners.value.objectId,
        functionDeclaration: "function() { return this.get([...this.keys()].find(key => key.description === 'ordered_runtime_liveness_derivation')); }",
        objectGroup: group });
      assert.equal(owned.exceptionDetails, undefined);
      if (owned.result.objectId === undefined) continue;
      const result = await post('Runtime.callFunctionOn', { objectId: owned.result.objectId, returnByValue: true,
        functionDeclaration: `function() {
          const current = new Set(), historical = new Set(), structural = new Set(), paths = [];
          const eventRows = rows => Array.isArray(rows) && rows.length > 0 &&
            rows.every(row => row && typeof row.eventId === 'string' && Number.isSafeInteger(row.admissionOrdinal));
          for (const key of ['events', 'structural', 'declarations']) current.add(this[key]);
          for (const key of ['byKind', 'declarationsByIdentity', 'observations'])
            for (const rows of this[key].values()) current.add(rows);
          const profileKey = value => Reflect.ownKeys(value).find(key =>
            typeof key === 'symbol' && key.description === 'validated_runtime_profile_source');
          const currentProfile = profileKey(this.prefix);
          if (currentProfile === undefined) throw Error('missing current owned profile vector');
          current.add(this.prefix.events); current.add(this.prefix[currentProfile]);
          const visited = new Set(); let historicalCutCount = 0;
          const inspect = (value, path) => {
            if (!value || typeof value !== 'object' || visited.has(value)) return;
            visited.add(value);
            if (value === this.prefix || current.has(value)) return;
            if (typeof value.eventId === 'string' && Number.isSafeInteger(value.admissionOrdinal)) return;
            const profile = profileKey(value);
            if (profile !== undefined && Array.isArray(value.events)) {
              historicalCutCount++;
              for (const [label, rows] of [['events', value.events], ['profile', value[profile]]]) {
                if (!Array.isArray(rows)) throw Error('wrong owned historical vector');
                if (!current.has(rows)) { historical.add(rows); paths.push({path:path+'/'+label,length:rows.length}); }
              }
              return;
            }
            if (Array.isArray(value)) {
              if (eventRows(value)) { structural.add(value); paths.push({path,length:value.length}); return; }
              if (value.length && typeof value[0] !== 'object') return;
              for (let i=0;i<value.length;i++) inspect(value[i],path+'/'+i);
              return;
            }
            if (value instanceof Map) {
              let i=0; for (const entry of value.values()) inspect(entry,path+'/value'+i++);
              return;
            }
            for (const key of Reflect.ownKeys(value)) {
              const descriptor = Object.getOwnPropertyDescriptor(value,key);
              if (descriptor && 'value' in descriptor) inspect(descriptor.value,path+'/'+String(key));
            }
          };
          // Walk actual retained owner roots, without traversing event bodies,
          // source backreferences or substituting a cache-name assertion.
          for (const key of Reflect.ownKeys(this)) {
            const descriptor=Object.getOwnPropertyDescriptor(this,key);
            if (descriptor && 'value' in descriptor) inspect(descriptor.value,String(key));
          }
          const total = rows => [...rows].reduce((sum,vector)=>sum+vector.length,0);
          return {historicalCutCount, historicalVectorCount:historical.size,
            historicalVectorSlots:total(historical), structuralIntermediateVectorCount:structural.size,
            structuralIntermediateVectorSlots:total(structural), retainedIntermediatePaths:paths,
            currentVectorCount:current.size,currentVectorSlots:total(current),
            completedFactCounts:{contexts:this.contexts.size,budgets:this.budgets.size,
              folds:this.folds.size,historicalFolds:this.historicalFolds.size}};
        }`, objectGroup: group });
      assert.equal(result.exceptionDetails, undefined);
      facts.push(result.result.value);
    }
    return facts;
  } finally {
    delete globalThis.__livenessCutDiagnosticSource;
    await post('Runtime.releaseObjectGroup', { objectGroup: group });
    session.disconnect();
  }
}

