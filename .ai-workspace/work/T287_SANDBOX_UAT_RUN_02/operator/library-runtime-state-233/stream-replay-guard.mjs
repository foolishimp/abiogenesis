import fs from 'node:fs';import ts from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/node_modules/typescript/lib/typescript.js';
const path='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/abg/replay.ts';let s=fs.readFileSync(path,'utf8');
s='import { createHash } from "node:crypto";\nimport { writeCanonicalJson, compareUnicodeCodeUnits } from "../shared/canonical_json.js";\n'+s;
const start=s.indexOf('export function projectRuntimeReplayGuard('),end=s.indexOf('/** @internal Explicit complete-output',start);
s=s.slice(0,start)+`export function projectRuntimeReplayGuard(prefix: RuntimeEventPrefix, authority: RuntimeEventPrefix = prefix): RuntimeReplayGuard {
  const value = deriveReplayPrefixFacts(prefix, authority, undefined, undefined, true) as RuntimeReplayGuard;
  REPLAY_GUARD_PREFIXES.set(value, { prefix, authority }); return value;
}
`+s.slice(end);
s=s.replace('  routeOnly?: string,\n): ReplayState | ReplayRouteState | undefined {','  routeOnly?: string,\n  guardOnly = false,\n): ReplayState | ReplayRouteState | RuntimeReplayGuard | undefined {');
s=s.replace('if (priorDerivation !== undefined && ReplayDerivation.matches(priorDerivation, prefix, authorityPrefix)) return priorDerivation;','if (!guardOnly && priorDerivation !== undefined && ReplayDerivation.matches(priorDerivation, prefix, authorityPrefix)) return priorDerivation;');
const memo='if (!owned && facts.last !== undefined && facts.last.runtimeEnd === runtimeEventPrefixLastEnvelope(prefix) && facts.last.authority === authority && facts.last.authorityEnd === authorityEnd && facts.last.profileEnd === profileEnd)';s=s.replace(memo,memo.replace('!owned','!guardOnly && !owned'));
// Factor the already-canonical row constructors once. The guard serializes each
// result/route/vector element and releases it before acquiring the next body.
let sf=ts.createSourceFile(path,s,ts.ScriptTarget.Latest,true),edits=[];
const defs=[];
function visit(node){
 if(ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression)){
  const meth=node.expression.name.text,first=node.arguments[0]?.getText(sf)??'';
  let name,ret,param,prep='';
  if(meth==='scalarFact'&&first==='"c_call:" + cCallRef'){name='projectReplayCCallFields';param='cCallRef: string';prep='const key = "aggregate:c_call:" + cCallRef;\n';}
  if(meth==='fact'&&first==='"fan-out:" + envelope.eventId'){name='projectReplayFanOut';ret='FanOutCompletionAdmission';param='envelope: Omit<RuntimeEvent, "payload">';}
  if(meth==='fact'&&first==='"delta:" + envelope.eventId'){name='projectReplayDelta';ret='ReplayConstructionDeltaState';param='envelope: Omit<RuntimeEvent, "payload">';}
  if(name){const fn=node.arguments[2];if(!ts.isArrowFunction(fn)||!ts.isBlock(fn.body))throw Error('canonical projector shape drift');
   defs.push(`  function ${name}(${param})${ret?': '+ret:''} {\n    ${prep}${fn.body.getText(sf).slice(1,-1)}\n  }\n`);
   edits.push({start:fn.getStart(sf),end:fn.getEnd(),text:'() => '+name+'('+ (name==='projectReplayCCallFields'?'cCallRef':'envelope') +')'});
  }
 }
 ts.forEachChild(node,visit);
}visit(sf);
if(defs.length!==3)throw Error('expected exact three replay row projectors, found '+defs.length);
for(const e of edits.sort((a,b)=>b.start-a.start))s=s.slice(0,e.start)+e.text+s.slice(e.end);
s=s.replace('  const cCallIds = new Set<string>();',defs.join('\n')+'\n  const cCallIds = new Set<string>();');
s=s.replace('if (routeOnly === undefined) {\n      const { resultEventRef, ...fields } = projected;', 'if (!guardOnly && routeOnly === undefined) {\n      const { resultEventRef, ...fields } = projected;');
s=s.replace('const needValue = routeOnly === undefined || envelope.eventId === routeOnly || stoppedRouteEvents.has(envelope.eventId);','const needValue = (!guardOnly && routeOnly === undefined) || envelope.eventId === routeOnly || stoppedRouteEvents.has(envelope.eventId);');
s=s.replace('if (routeOnly === undefined || runStoppedRouteRefs.has(projected.routeRef)) routes.push(projected);','if ((!guardOnly && routeOnly === undefined) || runStoppedRouteRefs.has(projected.routeRef)) routes.push(projected);');
s=s.replaceAll('}, undefined, routeOnly === undefined);','}, undefined, !guardOnly && routeOnly === undefined);').replaceAll('() => projectReplayFanOut(envelope), undefined, routeOnly === undefined);','() => projectReplayFanOut(envelope), undefined, !guardOnly && routeOnly === undefined);').replaceAll('() => projectReplayDelta(envelope), undefined, routeOnly === undefined);','() => projectReplayDelta(envelope), undefined, !guardOnly && routeOnly === undefined);');
s=s.replace('if (routeOnly === undefined && projected !== undefined) fanOutCompletions.push(projected);','if (!guardOnly && routeOnly === undefined && projected !== undefined) fanOutCompletions.push(projected);').replace('if (routeOnly === undefined && projected !== undefined) constructionDeltas.push(projected);','if (!guardOnly && routeOnly === undefined && projected !== undefined) constructionDeltas.push(projected);');
const hash='  const replayDigest = sha256Canonical(body as unknown as JsonValue);';
s=s.replace(hash,`  const replayDigest = digestReplayBody(body as unknown as Readonly<Record<string, JsonValue>>, !guardOnly ? undefined : {
    cCalls: function* () {
      for (const cCallRef of cCallIds) {
        const key = "aggregate:c_call:" + cCallRef;
        const projected = facts.scalarFact("c_call:" + cCallRef, replayDependencyVersion(prefix, [key]), () => projectReplayCCallFields(cCallRef));
        const { resultEventRef, ...fields } = projected;
        const result = resultEventRef === null ? undefined : runtimeEventAtPrefix(prefix, resultEventRef);
        yield { ...fields, resultValue: result !== undefined && isRecord(result.payload) ? result.payload.value ?? null : null } as unknown as JsonValue;
      }
    },
    routes: function* () {
      for (const envelope of indexedRuntimeEventEnvelopes(prefix, "kind:traversal_route_admitted"))
        yield projectReplayRouteAtPrefix(prefix, runtimeEventAtPrefix(prefix, envelope.eventId)!, authorityPrefix) as unknown as JsonValue;
    },
    fanOutCompletions: function* () {
      for (const envelope of indexedRuntimeEventEnvelopes(prefix, "kind:fan_out_completion_admitted")) yield projectReplayFanOut(envelope) as unknown as JsonValue;
    },
    constructionDeltas: function* () {
      for (const envelope of indexedRuntimeEventEnvelopes(prefix, "kind:construction_delta_observed")) yield projectReplayDelta(envelope) as unknown as JsonValue;
    },
  });
  if (guardOnly) {
    const { cCalls: _calls, routes: _routes, constructionDeltas: _deltas, fanOutCompletions: _fanout,
      continuations: _continuations, actorProcesses: _actors, currentWorksiteObservations: _worksite, nativeLiveness: _liveness, ...current } = body;
    return deepFreeze({ replayRef: \`replay://abiogenesis/\${replayDigest.slice("sha256:".length)}\`, replayDigest, ...current });
  }`);
// Full and guard output use the same canonical byte writer and field order.
s+=`\nfunction digestReplayBody(body: Readonly<Record<string, JsonValue>>,
  selected?: Readonly<Record<string, () => Iterable<JsonValue>>>): Sha256Digest {
  const hash = createHash("sha256"); const write = (part: string) => { hash.update(part); };
  write("{"); let comma = false;
  for (const key of Object.keys(body).sort(compareUnicodeCodeUnits)) {
    if (comma) write(","); comma = true; writeCanonicalJson(key, write); write(":");
    const rows = selected?.[key];
    if (rows === undefined) writeCanonicalJson(body[key]!, write);
    else { write("["); let rowComma = false; for (const row of rows()) {
      if (rowComma) write(","); rowComma = true; writeCanonicalJson(row, write);
    } write("]"); }
  }
  write("}"); return \`sha256:\${hash.digest("hex")}\`;
}\n`;
fs.writeFileSync(path,s);
