from pathlib import Path
r=Path('/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src')
f=r/'abg/c_call.ts';s=f.read_text()
s='import { createHash } from "node:crypto";\n'+s
s=s.replace('import { canonicalJson, type JsonValue }','import { canonicalJson, writeCanonicalJson, compareUnicodeCodeUnits, type JsonValue }')
s=s.replace('  type RuntimeReplayGuard, projectRuntimeReplayGuard, projectReplayCCallGuardAtPrefix,','  type RuntimeReplayGuard, projectRuntimeReplayGuard, projectReplayCCallGuardAtPrefix, materializeRuntimeReplayGuard, writeRuntimeReplayGuardValue,')
s=s.replace('import { runtimeEventPrefixDigest,','import { runtimeEventPrefixDigest, extendRuntimeEventPlanPrefixForValidation, writeRuntimeEventPrefixValue,')
# Both planners retain only their finite candidate suffix. Legacy full outputs remain explicit.
s=s.replace('  const projectedHistory = [...events];','  let planPrefix = prefix;')
s=s.replace('''  const projectedHistory = [
    ...runtimeEventBodiesAtPrefix(owner.authorityPrefix),
  ];''','  let planPrefix = owner.authorityPrefix;')
s=s.replace('''      projectedHistory,
      candidate,''','''      runtimeEventBodiesAtPrefix(planPrefix),
      candidate,''')
s=s.replace('    projectedHistory.push(event);','    planPrefix = extendRuntimeEventPlanPrefixForValidation(planPrefix,event);')
s=s.replace('''  const projectedPrefix = selectValidatedRuntimeEventPrefix(
    Object.freeze([...projectedHistory]),
  );''','  const projectedPrefix = planPrefix;')
s=s.replace('''  const runPrefix = selectValidatedRuntimeEventPrefix(
    Object.freeze([...projectedHistory]),
    { runId: cCall.runId },
  );
  const replayState = replayValidatedRuntimeEventPrefix(
    runPrefix,
    selectValidatedRuntimeEventPrefix(Object.freeze([...projectedHistory])),
  );''','''  const runPrefix = selectRuntimeEventPrefixFromAuthority(planPrefix,{runId:cCall.runId});
  const replayState = projectRuntimeReplayGuard(runPrefix,planPrefix);''')
s=s.replace('''  const resultAuthorityPrefix = selectValidatedRuntimeEventPrefix(
    Object.freeze([...projectedHistory]),
  );
  const resultRunPrefix = selectValidatedRuntimeEventPrefix(
    Object.freeze([...projectedHistory]),
    { runId: cCall.runId },
  );
  const resultReplayState = replayValidatedRuntimeEventPrefix(
    resultRunPrefix,
    resultAuthorityPrefix,
  );''','''  const resultAuthorityPrefix = planPrefix;
  const resultRunPrefix = selectRuntimeEventPrefixFromAuthority(planPrefix,{runId:cCall.runId});
  const resultReplayState = projectRuntimeReplayGuard(resultRunPrefix,resultAuthorityPrefix);''')
s=s.replace('''  const projectedRunPrefix = selectValidatedRuntimeEventPrefix(
    Object.freeze([...projectedHistory]),
    { runId: cCall.runId },
  );
  const replayState = replayValidatedRuntimeEventPrefix(
    projectedRunPrefix,
    projectedPrefix,
  );''','''  const projectedRunPrefix = selectRuntimeEventPrefixFromAuthority(projectedPrefix,{runId:cCall.runId});
  const replayState = projectRuntimeReplayGuard(projectedRunPrefix,projectedPrefix);''')
assert 'projectedHistory' not in s
marker='export interface RehydratedPendingInteraction {'
s=s.replace(marker,'''/** @internal Ordinary pending construction retains the finite suffix and
 * genuine owner coordinates. Complete historical outputs stay Public-only. */
export type OwnedPendingInteractionAdmissionPlan = Omit<PendingInteractionAdmissionPlan,"projectedPrefix"|"replayState"> & {
  readonly projectedPrefix: RuntimeEventPrefix; readonly replayState: RuntimeReplayGuard;
};

'''+marker)
s=s.replace('  plan: PendingInteractionAdmissionPlan,\n): Readonly<Record<string, JsonValue>> {','  plan: PendingInteractionAdmissionPlan | OwnedPendingInteractionAdmissionPlan,\n): Readonly<Record<string, JsonValue>> {')
start=s.index('export function planPendingInteractionAdmission(')
s=s[:start]+s[start:].replace('export function planPendingInteractionAdmission(', '/** @internal Same pure planner and digest law, with selected operational fields. */\nexport function planOwnedPendingInteractionAdmission(',1)
start=s.index('export function planOwnedPendingInteractionAdmission(');end=s.index('\nexport function admitPlannedPendingInteraction',start)
section=s[start:end].replace('): PendingInteractionAdmissionPlan {','): OwnedPendingInteractionAdmissionPlan {').replace('  const planDigest = sha256Canonical(body as unknown as JsonValue);','  const planDigest = pendingInteractionBodyDigest(body);')
s=s[:start]+section+s[end:]
start=s.index('export function admitPlannedPendingInteraction(');end=s.index('\n/** Exact native selected F_P',start)
section=s[start:end].replace('export function admitPlannedPendingInteraction(', '/** @internal Revalidates the complete canonical plan at the same actual owner. */\nexport function admitOwnedPlannedPendingInteraction(',1).replace('  plan: PendingInteractionAdmissionPlan,','  plan: PendingInteractionAdmissionPlan | OwnedPendingInteractionAdmissionPlan,').replace('sha256Canonical(\n      pendingInteractionPlanBody(plan) as unknown as JsonValue,\n    )','pendingInteractionBodyDigest(plan)').replace('const rederived = planPendingInteractionAdmission(','const rederived = planOwnedPendingInteractionAdmission(').replace('''    sha256Canonical(rederived as unknown as JsonValue) !==
      sha256Canonical(plan as unknown as JsonValue)''','''    rederived.planDigest !== plan.planDigest || pendingInteractionBodyDigest(rederived) !== pendingInteractionBodyDigest(plan)''')
s=s[:start]+section+s[end:]
# Stream the exact public body fields, including the complete original replay meaning.
s+='''
function pendingInteractionBodyDigest(plan: Pick<OwnedPendingInteractionAdmissionPlan,"projectedPrefix"|"replayState"> & object): Sha256Digest {
  const body = "planRef" in plan ? pendingInteractionPlanBody(plan as OwnedPendingInteractionAdmissionPlan) : plan as unknown as Readonly<Record<string,JsonValue>>;
  const hash=createHash("sha256");const write=(part:string)=>{hash.update(part);};write("{");let comma=false;
  for(const key of Object.keys(body).sort(compareUnicodeCodeUnits)) {
    if(comma)write(",");comma=true;writeCanonicalJson(key,write);write(":");
    if(key==="projectedPrefix")writeRuntimeEventPrefixValue(plan.projectedPrefix,write);
    else if(key==="replayState")writeRuntimeReplayGuardValue(plan.replayState,write);
    else writeCanonicalJson(body[key]!,write);
  }
  write("}");return `sha256:${hash.digest("hex")}`;
}
export function planPendingInteractionAdmission(...args: Parameters<typeof planOwnedPendingInteractionAdmission>): PendingInteractionAdmissionPlan {
  const plan=planOwnedPendingInteractionAdmission(...args);
  return deepFreeze({...plan,projectedPrefix:selectValidatedRuntimeEventPrefix(Object.freeze([...runtimeEventBodiesAtPrefix(plan.projectedPrefix)])),
    replayState:materializeRuntimeReplayGuard(plan.replayState)});
}
export function admitPlannedPendingInteraction(store: AbgEventStore, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>,
  cursor: TraversalCursorCandidate, cCall: CCall, request: Readonly<Record<string,JsonValue>>, expectedInputDigest: Sha256Digest,
  plan: PendingInteractionAdmissionPlan, basis: RuntimeAdmissionBasis): PendingInteractionAdmission {
  return admitOwnedPlannedPendingInteraction(store,graph,graphFunction,cursor,cCall,request,expectedInputDigest,plan,basis);
}
'''
# Don't let the Public wrapper signature depend on an internal function after stripInternal.
s=s.replace('export function planPendingInteractionAdmission(...args: Parameters<typeof planOwnedPendingInteractionAdmission>): PendingInteractionAdmissionPlan {\n  const plan=planOwnedPendingInteractionAdmission(...args);','''export function planPendingInteractionAdmission(store: AbgEventStore, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>,
  cursor: TraversalCursorCandidate, cCall: CCall, request: Readonly<Record<string,JsonValue>>, expectedInputDigest: Sha256Digest,
  basis: RuntimeAdmissionBasis): PendingInteractionAdmissionPlan {
  const plan=planOwnedPendingInteractionAdmission(store,graph,graphFunction,cursor,cCall,request,expectedInputDigest,basis);''')
f.write_text(s)
