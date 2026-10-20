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
          const vectors = new Set();
          for (const cut of this.cuts.values()) {
            vectors.add(cut.events);
            const key = Reflect.ownKeys(cut).find(key => typeof key === 'symbol' && key.description === 'validated_runtime_profile_source');
            if (key === undefined) throw Error('missing actual prefix profile source');
            vectors.add(cut[key]);
          }
          return { cutCount: this.cuts.size, ordinals: [...this.cuts.keys()],
            vectorCount: vectors.size, summedVectorLength: [...vectors].reduce((sum, rows) => sum + rows.length, 0) };
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
