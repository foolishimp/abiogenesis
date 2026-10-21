// Finite pure observer construction checks. No test runner or Product owner is loaded.
import assert from 'node:assert/strict';
import {createProbes} from './diagnostic-probes.mjs';
import {traceSummary} from './diagnostic-analyse.mjs';
import {registerHooks,syncBuiltinESMExports} from 'node:module';
import crypto from 'node:crypto';
import cp from 'node:child_process';
assert.equal(typeof registerHooks,'function');assert.equal(typeof syncBuiltinESMExports,'function');
assert.equal(Object.getOwnPropertyDescriptor(crypto.Hash.prototype,'update').writable,true);
assert.equal(Object.getOwnPropertyDescriptor(cp.ChildProcess.prototype,'spawn').writable,true);
const errors=[],p=createProbes({observeError:e=>errors.push(e)}),receiver={},returned={},thrown=new Error('original');
let calls=0;const fn=function(a){assert.equal(this,receiver);assert.equal(a,returned);calls++;return returned;};
const wrapped=p.delegate(fn,()=>{});assert.equal(wrapped.call(receiver,returned),returned);assert.equal(calls,1);
assert.throws(()=>p.delegate(()=>{throw thrown;},()=>{throw new Error('must not observe success');})(),e=>e===thrown);
assert.equal(p.delegate(fn,()=>{throw new Error('diagnostic callback');}).call(receiver,returned),returned);assert.equal(errors.length,1);
const hashObject={};assert.equal(p.hashUpdate(function(){return this;}).call(hashObject,'é'),hashObject);
assert.equal(p.counts['hash.update.inputBytes'].total,2);
const nativeStringify=JSON.stringify,encoded=p.jsonStringify(nativeStringify)({a:'é'});
assert.equal(encoded,nativeStringify({a:'é'}));assert.equal(p.counts['JSON.stringify.outputUtf8Bytes'].total,Buffer.byteLength(encoded));
let parts=[];const canonical=p.canonical((value,sink)=>{sink('[');sink(value);sink(']');return returned;});
assert.equal(canonical('é',x=>parts.push(x)),returned);assert.deepEqual(parts,['[','é',']']);assert.equal(p.counts['writeCanonicalJson.deliveredUtf8Bytes'].total,4);
class MockSelection{constructor(history){this.history=history;this.length=1;}rowById(){this.history.work.membershipComparisons++;return returned;}}
for(const name of ['select','selectorExtent','selectScopeCold','materialize'])MockSelection.prototype[name]=function(){return returned;};
class MockHistory{constructor(){this.work={bodyRows:0,scopeRows:0,membershipComparisons:0,selectorRows:0};}select(){return new MockSelection(this);}event(){this.work.bodyRows++;return returned;}scope(){this.work.scopeRows+=2;return this.select();}indices(){return [0];}}
for(const name of ['appendValidated','commitLocation','truncate','eventById','scopedCanonicalDigest','scopedSelectorExtent','selectorExtent'])MockHistory.prototype[name]=function(){return returned;};
p.instrumentHistory(MockHistory,MockSelection,'mock:only');const h=new MockHistory();assert.equal(h.event(),returned);const selection=h.select();assert.equal(selection.rowById(),returned);h.scope(2,{});
assert.deepEqual(p.owners[0].work,{bodyRows:1,scopeRows:2,membershipComparisons:1,selectorRows:0});
class MockIndex{constructor(){this.count=0;this.ordinalCount=0;this.causalCount=0;this.profileCount=0;}advance(){this.count+=3;return returned;}structure(){this.ordinalCount+=2;}validateCauses(){this.causalCount+=1;}profile(){this.profileCount+=4;}}
p.instrumentIndex(MockIndex,'mock:index');assert.equal(new MockIndex().advance(),returned);assert.equal(p.counts['RuntimeEventIndex.count.advancedRows'].total,3);
const trace=traceSummary([{cat:'node,node.fs,node.fs.async',name:'read',ph:'e',args:{result:7}},
  {cat:'node.fs.sync',name:'fs.sync.write',ph:'E',args:{bytesWritten:5}},
  {cat:'node.fs.sync',name:'fs.sync.read',ph:'E',args:{}},
  {cat:'node.fs.async',name:'write',ph:'e',args:{result:-5}},
  {cat:'node.fs.async',name:'read',ph:'b',args:{}}]);
assert.equal(trace.channels.asyncRead.bytes,7);assert.equal(trace.channels.syncWrite.bytes,5);assert.equal(trace.channels.syncRead.unsized,1);assert.equal(trace.channels.asyncWrite.errors,1);
process.stdout.write(JSON.stringify({status:'pure_construction_checks_passed',scope:'delegation identity, throw identity, observer failure isolation, exact output byte lengths, synthetic existing-counter samples, trace missing/error channels',productOwnersLoaded:0,fixtures:0,workloads:0,nativeCalls:0})+'\n');
