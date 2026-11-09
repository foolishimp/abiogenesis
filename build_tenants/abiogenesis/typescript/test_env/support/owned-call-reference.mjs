import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

// §10.11 observation-only probes over one installed root: the named work
// counters and the weak identity probe of the last run preparation. They read
// the owners' own snapshots; they select, cache and change nothing.
export async function loadOwnedCallReferenceProbes(installedRoot) {
  const load = name => import(pathToFileURL(join(installedRoot, 'build/code/src', name + '.js')).href);
  const [mechanics, transport, catalog, resolution, semantics, run, worker] = await Promise.all([
    'public/binding/definition_binding_mechanics', 'public/installed_definition_call_transport', 'product/catalog',
    'product/execution_resolution', 'product/semantics', 'product/run_invocation_operation', 'abg/worker_transport',
  ].map(load));
  const snapshot = () => Object.freeze({
    call: mechanics.observeDefinitionCallWork(),
    transport: transport.observeDefinitionTransportWork(),
    catalog: catalog.observeCatalogWork(),
    resolution: resolution.observeExecutionResolutionWork(),
    input: semantics.observeProductInputWork(),
    worker: worker.observeWorkerTransportCopyWork(),
  });
  // A per-key binder gate count (`gated.<key>`) appears once its site first
  // fires; before that its count is zero.
  const delta = (from, to) => Object.fromEntries(Object.keys(to).map(owner => [owner,
    Object.fromEntries([...new Set([...Object.keys(from[owner]), ...Object.keys(to[owner])])]
      .map(key => [key, (to[owner][key] ?? 0) - (from[owner][key] ?? 0)]))]));
  return Object.freeze({snapshot, delta, mechanics, catalog, subjects: () => run.observeRunPreparationSubjects()});
}
