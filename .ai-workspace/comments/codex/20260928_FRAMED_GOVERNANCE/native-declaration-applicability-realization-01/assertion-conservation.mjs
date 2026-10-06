import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const report=dirname(fileURLToPath(import.meta.url));
const ts=createRequire(import.meta.url)(join(report,'copied-tenant/build/toolchain/typescript.cjs'));
const beforePath=join(report,'preimages/build_tenants/abiogenesis/typescript/test_env/tests/m5-s06-prime.test.mjs');
const afterPath=join(report,'copied-tenant/test_env/tests/m5-s06-prime.test.mjs');
function assertions(source) {
  const unit=ts.createSourceFile('test.mjs',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),calls=[];
  function visit(node) {
    if(ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression)&&node.expression.expression.getText(unit)==='assert')calls.push({text:node.getText(unit),callee:node.expression.getText(unit),expected:node.arguments.slice(1).map(arg=>arg.getText(unit))});
    ts.forEachChild(node,visit);
  }
  visit(unit);return calls;
}
const before=assertions(await readFile(beforePath,'utf8')),after=assertions(await readFile(afterPath,'utf8'));
let index=0;const inputPropagation=[];
for(const call of before) {
  while(index<after.length&&after[index].text!==call.text&&!(call.expected.includes('\"two contracts cannot own the same crossing symbol\"')&&after[index].callee===call.callee&&JSON.stringify(after[index].expected)===JSON.stringify(call.expected)))index++;
  assert.ok(index<after.length,'every original assertion and exact oracle survives in order: '+call.text);
  if(after[index].text!==call.text)inputPropagation.push({before:call.text,after:after[index].text,authority:'Root-authorized duplicateAlpha exact evidence setup is nested inside first actual-expression argument; expected code and explanatory oracle remain exact'});
  index++;
}
assert.equal(inputPropagation.length,1,'only the explicitly authorized duplicateAlpha input propagation changes an original actual-expression byte sequence');
const result={kind:'original_assertions_preserved',passed:true,beforePath,afterPath,originalAssertions:before.length,finalAssertions:after.length,unchangedOriginalExactCallBytes:before.length-inputPropagation.length,originalExpectedAndDescriptionBytesPreservedInOrder:true,inputPropagation,originalAssertionsSha256:createHash('sha256').update(JSON.stringify(before)).digest('hex'),limit:'mechanical assertion conservation; semantic fixture propagation is separately recorded in first-source-readiness-failure and test-arrangement authority'};
await writeFile(join(report,'proof/assertion-conservation.json'),JSON.stringify(result,null,2)+'\n');
process.stdout.write(JSON.stringify({passed:true,originalAssertions:before.length,finalAssertions:after.length})+'\n');
