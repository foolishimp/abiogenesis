import assert from 'node:assert/strict';

/** Borrow an operation view from the current nominal owner selection. The
 * enclosing acquisition remains the caller's sole normal-close owner. */
export function borrowCurrentOperationResource(abg,enclosingResource,selection) {
 const acquired=abg.acquireAbgEventResource(selection);
 assert.equal(acquired.kind,'acquired_abg_event_resource',JSON.stringify(acquired));
 assert.strictEqual(acquired.resource.store,enclosingResource.store,'Foreign operation resource cannot borrow this enclosing owner');
 assert.deepEqual(acquired.resource.entryPrefix,selection.prefix,'Operation entry must be the selected current cut');
 return acquired.resource;
}
