import fs from 'node:fs';
const path='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/abg/project_read_ports.ts';
let s=fs.readFileSync(path,'utf8');
s=s.replace('import { projectOwnedRuntimeEventPrefixAtDurablePrefix, runtimeEventPrefixExtent }','import { indexedRuntimeEvents, indexedRuntimeEventEnvelopes, runtimeEventAtPrefix, runtimeEventPrefixLastEnvelope, validatedRuntimeEventPrefixBeforeEvent, selectRuntimeEventPrefixFromAuthority, projectOwnedRuntimeEventPrefixAtDurablePrefix, runtimeEventPrefixExtent }');
s=s.replace('  projectOwnedRunReplayContext,','  projectOwnedRunReplayContext,\n  projectReplayCCallGuardAtPrefix, projectValidatedReplayRouteAtPrefix,');
// Shared ancestry uses selected original populations on both representations.
s=s.replace('const graph = one(events.filter((event) => event.kind === "graph_call_opened" &&','const graph = one(indexedRuntimeEvents(prefix,"kind:graph_call_opened").filter((event) =>');
s=s.replace('const frame = one(events.filter((event) => event.kind === "frame_opened" &&','const frame = one(indexedRuntimeEvents(prefix,"kind:frame_opened").filter((event) =>');
s=s.replace('const run = one(events.filter((event) => event.kind === "run_segment_opened" &&','const run = one(indexedRuntimeEvents(prefix,"kind:run_segment_opened").filter((event) =>');
s=s.replace('one(events.filter((event) => event.eventId === root.admissionEventRef), "child basis admission")','one(indexedRuntimeEvents(prefix,"id:"+root.admissionEventRef), "child basis admission")');
s=s.replace('    const previous = events.find((event) => event.admissionOrdinal === admission.admissionOrdinal - 1);','    const historical = validatedRuntimeEventPrefixBeforeEvent(prefix, admission.eventId);\n    const previous = runtimeEventPrefixLastEnvelope(historical);');
s=s.replace('    const historical = validatedRuntimeEventPrefixThroughEvent(prefix, previous.eventId);\n','');
s=s.replace('one(events.filter((event) => event.eventId === invocation.admissionEventRef), "invocation event")','one(indexedRuntimeEvents(prefix,"id:"+invocation.admissionEventRef), "invocation event")');
s=s.replace('events.filter((event) => event.eventId === ref && event.admissionOrdinal < invocationEvent.admissionOrdinal)','indexedRuntimeEvents(prefix,"id:"+ref).filter((event) => event.admissionOrdinal < invocationEvent.admissionOrdinal)');
const signature='function terminalOutcome(\n  prepared: PreparedRead<AbgProjectReadMemberKey>, context: RunReadContext,\n  graphCallId: string, requireRunClosed: boolean, sourceInput?: AbgHistoricalGraphCallSourceResource["input"],\n): Readonly<{ terminalResult: AbgTypedTerminalResult; source?: Omit<AbgHistoricalGraphCallSource, "terminalResult"> }> | null {';
if(!s.includes(signature))throw new Error('exact terminal owner signature missing');
const ret='Readonly<{ terminalResult: AbgTypedTerminalResult; source?: Omit<AbgHistoricalGraphCallSource, "terminalResult"> }> | null';
s=s.replace(signature,signature+'\n  const rows=graphCallRows(context,graphCallId);\n  return terminalOutcomeFromSelectedFacts(prepared,{prefix:context.prefix,runId:context.replay.runId,runClosed:context.replay.runtimeStatus === "closed"},graphCallId,requireRunClosed,terminalResult(rows.routes,rows.cCalls),sourceInput);\n}\n\nfunction terminalOutcomeFromSelectedFacts(\n  prepared: PreparedRead<AbgProjectReadMemberKey>,\n  context: Readonly<{ prefix: RuntimeEventPrefix; runId: string | null; runClosed: boolean }>,\n  graphCallId: string, requireRunClosed: boolean, terminal: Readonly<{ route: ReplayRouteState }> | null,\n  sourceInput?: AbgHistoricalGraphCallSourceResource["input"],\n): '+ret+' {');
const a=s.indexOf('function terminalOutcomeFromSelectedFacts('),b=s.indexOf('function typedTerminalResult(',a);
let core=s.slice(a,b);
core=core.replace('context.replay.runtimeStatus !== "closed"','!context.runClosed').replaceAll('context.replay.runId','context.runId');
core=core.replace('  const rows = graphCallRows(context, graphCallId);\n  const terminal = terminalResult(rows.routes, rows.cCalls);\n','');
core=core.replace('events.filter((event) => event.kind === "graph_call_closed" &&','indexedRuntimeEvents(context.prefix,"kind:graph_call_closed").filter((event) =>');
for(const kind of ['c_call_opened','c_call_fibre_selected','c_call_result_admitted','c_call_judged','terminal_reached','frame_closed'])
 core=core.replace('events.filter((event) => event.kind === "'+kind+'" &&','indexedRuntimeEvents(context.prefix,"kind:'+kind+'").filter((event) =>');
core=core.replace('events.filter((event) => event.eventId === route.admissionEventRef)','indexedRuntimeEvents(context.prefix,"id:"+route.admissionEventRef)');
core=core.replace('events.filter((event) => event.kind === "run_closed")','indexedRuntimeEvents(context.prefix,"kind:run_closed")');
s=s.slice(0,a)+core+s.slice(b);
const old='    const context = runId === null ? null : runContext(prepared, runId);\n    const result = context === null ? null : terminalOutcome(prepared, context, packet.targetRef, false, resource.input);';
const replacement='    const runPrefix = runId === null ? null : selectRuntimeEventPrefixFromAuthority(fullPrefix,{runId});\n    const terminalRoutes = runPrefix === null ? [] : indexedRuntimeEventEnvelopes(runPrefix,"kind:traversal_route_admitted")\n      .filter(row => row.graphCallId === packet.targetRef)\n      .map(row => projectValidatedReplayRouteAtPrefix(runPrefix,row.eventId,fullPrefix))\n      .filter((row): row is ReplayRouteState => row?.routeKind === "terminal");\n    const terminal = terminalRoutes.length !== 1 || terminalRoutes[0]!.cCallRef === null || runPrefix === null ? null\n      : {route:terminalRoutes[0]!,result:projectReplayCCallGuardAtPrefix(runPrefix,terminalRoutes[0]!.cCallRef)};\n    const exactTerminal = terminal?.result.resultRef !== null && terminal?.result.resultDigest !== null ? terminal : null;\n    const result = runPrefix === null || runId === null ? null : terminalOutcomeFromSelectedFacts(prepared,\n      {prefix:runPrefix,runId,runClosed:indexedRuntimeEventEnvelopes(runPrefix,"kind:run_closed").length === 1},\n      packet.targetRef,false,exactTerminal,resource.input);';
if(!s.includes(old))throw new Error('exact historical source context missing');s=s.replace(old,replacement);
// GraphCall->Run identification is envelope-only, preserving the complete match set.
s=s.replace('    runtimeEventBodiesAtPrefix(prepared.fullPrefix).flatMap((event) =>\n      event.graphCallId === graphCallId && event.runId !== undefined','    indexedRuntimeEventEnvelopes(prepared.fullPrefix,"graph-call:"+graphCallId).flatMap((event) =>\n      event.graphCallId === graphCallId && event.runId !== undefined');
fs.writeFileSync(path,s);
