PC05-03 caller triage — closed, read-only

Cause is stale `invocationAuthority.slots.transport_steering`, not a missing capability grant or invalid installed Product. The caller changes `resources.eventResource` to the genuine current close but passes every old slot unchanged into `definitionCall`, then incorrectly asserts that the entire Public authority remains equal.

Retained receipt: `pc05-03/execution/graphExecution.json`, SHA-256 `9b342f483522ea9eb046883ec5567a4828c9b64f4acffc11b7d7d650440c5a3a`. It retains `invalid_capability`, `/invocationAuthority`, null invocation admission and null Run at unchanged cut1,077,614,490. Caller `resume.mjs` SHA-256 `8313d83154b89cd70c4e8f99a0923dbe5d4e8c88593f0796767a3e508b84cbd9`; launch digest from its activation `sha256:760079ecc8ed9f60ef783563fbcfecfeacdc79223c2b4fa0d6aa4285184f7d83`. No actor/Run or new history read is inferred or performed here.

Existing owner relation: `owner_bindings/run_invocation.ts:1309` passes the exact asserted `call.resources.eventResource` to Product preparation. `product/run_invocation_operation.ts:332,390–392` requires its canonical digest and corresponding steering URI; failure reaches `:571–572`. Installed core47 JS has the same check at `product/run_invocation_operation.js:165,217–219`. Canonical owner source SHA-256 `b1ab9412f844e294e82b7d3e0e683ad36611b23abe2dd5b0293d061519792c8f`.

The retained data proves this failed conjunct:

- Old close: 1,048,944,741; old resource digest and currently asserted steering digest: `sha256:1a774996e144d95af4cfc74fecd08ef0b1b1e9ee5f9c7975d902292bcd7606e1`.
- Current close: 1,077,614,490; actual current resource digest: `sha256:9f95e381a4ccdf827b77e31a7124980653dc418b117dfd128f496e1850c389cf`.
- Required current steering ref: `transport-steering://abiogenesis/9f95e381a4ccdf827b77e31a7124980653dc418b117dfd128f496e1850c389cf`.

Smallest successor construction, using the existing caller/owner hashing relation:

```js
const eventResource = {
  kind: 'reopen_abg_event_resource', schemaVersion: '5.0.0',
  closeHandoff, handoffDigest: product.sha256Canonical(closeHandoff),
};
const digest = product.sha256Canonical(eventResource);
const slots = { ...oldCall.invocation.invocationAuthority.slots,
  transport_steering: {
    ref: 'transport-steering://abiogenesis/' + digest.slice(7), digest,
  },
};
const resources = { ...oldCall.resources, eventResource };
// Existing definitionCall constructs the Public authority/invocation digests
// using these slots, unchanged request and the selected fresh ordinal.
```

Hash the complete event-resource assertion, not just the close handoff or host configuration. Keep the outer CLI `acquisition.closeHandoff` equal to `eventResource.closeHandoff`. Remove the whole-authority equality assertion: the Public authority body's steering slot changes, so its digest and the enclosing invocation identity must change. Do not hand-edit those digest fields after `definitionCall`.

Smallest pure local discriminator before dispatch: compare the constructed call's steering digest/ref to `sha256Canonical(call.resources.eventResource)` and its derived URI; require handoffDigest and outer acquisition equality; recompute the Public authority digest from its body with authorityDigest omitted; require every non-steering slot and the semantic request to equal the prior values. The retained stale caller fails the steering comparison; the constructor using the new resource gives the required digest above. This is the exact failed local admission relation, not a claim of full runtime admission. No test or Run is needed to distinguish it.

Adjacent relations checked: all twelve non-steering slots and the request are exactly equal across PC05-02/03. Among resources, only eventResource changed. The new handoffDigest already matches its close and outer acquisition already matches the resource close. Product policy/grant/authority derives from workspace binding, Program, regimes, catalog/application and installed capability basis (`product/invocation.ts:541,848,1051`), with no current close input. That Product authority is distinct from the enclosing Public invocationAuthority; the former remains the same and supplies the unchanged run-environment permission (`product/stdo_environment.ts:235–236`). Thus existing Products, lock, catalog/view, Program, input, historical proofs, capability coordinates and run-environment resources remain reusable on their conserved bases. No reinstall/catalog campaign or semantic change is called for. Normal owners still validate current admission at execution.

Read-only source and retained-caller comparison took approximately0.4 s for the two launch parses/joins. No tests, agents, journal acquisition, native provider, Run, package, install or worksite mutation occurred. Only this return was written. Root owns the minimal caller correction and next installed discriminator.
