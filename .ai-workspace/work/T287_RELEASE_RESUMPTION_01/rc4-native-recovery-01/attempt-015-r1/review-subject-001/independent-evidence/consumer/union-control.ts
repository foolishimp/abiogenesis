import {
  constructInstalledPublicDefinitionCall,
  runInstalledDefinitionCallTransport,
  type InstalledPublicDefinitionCallSelection,
  type InstalledPublicDefinitionCallEnvironment,
  type InstalledDefinitionCallAcquisition,
} from "@abiogenesis/typescript-tenant/public";

declare const environment: InstalledPublicDefinitionCallEnvironment;
declare const acquisition: InstalledDefinitionCallAcquisition;
type Selection = InstalledPublicDefinitionCallSelection;
declare const start: Extract<Selection, { operationId: "abg.operation.run.invoke"; memberKey: "start"; request: { target: { kind: "graph_function" } } }>;
declare const read: Extract<Selection, { operationId: "abg.operation.project.read"; memberKey: "run_status" }>;
declare const verify: Extract<Selection, { operationId: "abg.operation.product.verify"; memberKey: "verify"; request: { targetKind: "installed_artifact" } }>;
const startCall = constructInstalledPublicDefinitionCall({...environment, ...start});
const readCall = constructInstalledPublicDefinitionCall({...environment, ...read});
const verifyCall = constructInstalledPublicDefinitionCall({...environment, ...verify});
const forgedStart = {...startCall, resources: readCall.resources};
declare const validUnion: typeof startCall | typeof verifyCall;
declare const mixedUnion: typeof startCall | typeof forgedStart;

// Positive: both alternatives are valid canonical calls.
void runInstalledDefinitionCallTransport(acquisition, validUnion);
// Negative control: the forged alternative alone must fail.
void runInstalledDefinitionCallTransport(acquisition, forgedStart);
// Counterexample: the same forged alternative must not hide in a typed union.
void runInstalledDefinitionCallTransport(acquisition, mixedUnion);
