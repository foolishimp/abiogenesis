import {
  constructInstalledPublicDefinitionCall,
  constructInstalledStartCall,
  constructInstalledPendingCall,
  constructInstalledRunReadCall,
  runInstalledDefinitionCallTransport,
  type InstalledDefinitionCallAcquisition,
  type InstalledPublicDefinitionCallEnvironment,
  type InstalledPublicDefinitionCallSelection,
  type OwnerCallableDefinitionMember,
} from "@abiogenesis/typescript-tenant/public";

type Member<K> = Extract<OwnerCallableDefinitionMember, { readonly key: K }>;
type Start = Member<"abg.operation.run.invoke#start">;
type Pending = Member<"abg.operation.run.continue#current_intent">;
type Read = Member<"abg.operation.project.read#run_status">;
declare const acquisition: InstalledDefinitionCallAcquisition;
declare const environment: InstalledPublicDefinitionCallEnvironment;
declare const startSelection: Extract<InstalledPublicDefinitionCallSelection, {
  readonly operationId: "abg.operation.run.invoke"; readonly memberKey: "start"
}>;
declare const startInput: Omit<Parameters<typeof constructInstalledStartCall>[0], "selection">;
declare const pendingInput: Omit<Parameters<typeof constructInstalledPendingCall>[0], "selection">;
declare const readInput: Omit<Parameters<typeof constructInstalledRunReadCall>[0], "memberKey">;
declare const continuation: { readonly ref: string; readonly digest: string };

export async function originalTypedConstructorControl(): Promise<void> {
  const call = constructInstalledPublicDefinitionCall({ ...environment, ...startSelection });
  const outcome = await runInstalledDefinitionCallTransport(acquisition, call);
  const member: "start" = call.invocation.definitionKey.memberKey;
  const resources: Start["binding"]["resources"] = call.resources;
  if (outcome.kind === "installed_definition_call_transport_result") {
    const receipt: Start["binding"]["resourceReceipt"] | null = outcome.receipt.resources;
    void receipt;
  }
  void member; void resources;
}

export async function startFactoryChain(): Promise<void> {
  const built = await constructInstalledStartCall({ ...startInput,
    selection: { memberKey: "start", target: { kind: "next" }, rootMode: "direct", fhMode: "direct" } });
  if (built.kind !== "installed_start_call") return;
  const member: "start" = built.call.invocation.definitionKey.memberKey;
  const resources: Start["binding"]["resources"] = built.call.resources;
  const outcome = await runInstalledDefinitionCallTransport(acquisition, built.call);
  if (outcome.kind === "installed_definition_call_transport_result") {
    const receipt: Start["binding"]["resourceReceipt"] | null = outcome.receipt.resources;
    void receipt;
  }
  void member; void resources;
}

export async function pendingFactoryChain(): Promise<void> {
  const built = await constructInstalledPendingCall({ ...pendingInput,
    selection: { kind: "pending_execution", runRef: "run:review", continuation } });
  if (built.kind !== "installed_pending_call") return;
  const member: "current_intent" = built.call.invocation.definitionKey.memberKey;
  const resources: Pending["binding"]["resources"] = built.call.resources;
  const outcome = await runInstalledDefinitionCallTransport(acquisition, built.call);
  if (outcome.kind === "installed_definition_call_transport_result") {
    const receipt: Pending["binding"]["resourceReceipt"] | null = outcome.receipt.resources;
    void receipt;
  }
  void member; void resources;
}

export async function readFactoryChain(): Promise<void> {
  const built = constructInstalledRunReadCall({ ...readInput, memberKey: "run_status" });
  if (built.kind !== "installed_run_read_call") return;
  const member: "run_status" = built.call.invocation.definitionKey.memberKey;
  const resources: Read["binding"]["resources"] = built.call.resources;
  const outcome = await runInstalledDefinitionCallTransport(acquisition, built.call);
  if (outcome.kind === "installed_definition_call_transport_result") {
    const receipt: Read["binding"]["resourceReceipt"] | null = outcome.receipt.resources;
    void receipt;
  }
  void member; void resources;
}
