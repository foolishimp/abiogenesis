const ts=require('/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/node_modules/typescript'),fs=require('node:fs'),path=require('node:path');
const tenant='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript';
for(const name of process.argv.slice(2)){
 const file=path.join(tenant,'code/src/abg',name+'.ts');let source=fs.readFileSync(file,'utf8'),sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true),edits=[];
 function selector(body,param){
  if(ts.isParenthesizedExpression(body))return selector(body.expression,param);
  if(ts.isBlock(body))return null; // A callback-local coordinate cannot be moved outside its scope.
  if(!ts.isBinaryExpression(body))return null;
  if(body.operatorToken.kind===ts.SyntaxKind.AmpersandAmpersandToken){const a=selector(body.left,param),b=selector(body.right,param);return a&&b?(a.priority>=b.priority?a:b):a||b;}
  if(body.operatorToken.kind!==ts.SyntaxKind.EqualsEqualsEqualsToken)return null;
  let lhs=body.left,rhs=body.right;if(!ts.isPropertyAccessExpression(lhs)){lhs=body.right;rhs=body.left;}if(!ts.isPropertyAccessExpression(lhs))return null;
  if(ts.isIdentifier(lhs.expression)&&lhs.expression.text===param){
   const key={eventId:['id:',10],aggregateId:['related:',9],basisId:['basis:',8],graphCallId:['graph-call:',7],runId:['run:',3],kind:['kind:',5],aggregateType:['type:',1]}[lhs.name.text];
   if(key)return {text:JSON.stringify(key[0])+' + '+rhs.getText(sf),priority:key[1]};
  }
  if(ts.isPropertyAccessExpression(lhs.expression)&&lhs.expression.name.text==='payload'&&ts.isIdentifier(lhs.expression.expression)&&lhs.expression.expression.text===param&&['resultRef','parentCCallRef','cursorRef','routeRef','invocationAdmissionRef','progressRef','implementationSetRef','interactionSetRef','basisRef'].includes(lhs.name.text))return{text:JSON.stringify('payload:'+lhs.name.text+':')+' + '+rhs.getText(sf),priority:9};
  return null;
 }
 function prefixOf(node,bindings){
  if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&['runtimeEventsFromValidatedPrefix','runtimeEventBodiesAtPrefix'].includes(node.expression.text))return node.arguments[0].getText(sf);
  if(ts.isIdentifier(node))return bindings.get(node.text);
  return null;
 }
 function walk(node,bindings){
  if(ts.isFunctionLike(node)||ts.isSourceFile(node)){
   const inner=new Map(bindings);function gather(n){if(n!==node&&ts.isFunctionLike(n))return;if(ts.isVariableDeclaration(n)&&ts.isIdentifier(n.name)&&n.initializer){const p=prefixOf(n.initializer,inner);if(p)inner.set(n.name.text,p);}ts.forEachChild(n,gather);}gather(node);bindings=inner;
  }
  if(ts.isCallExpression(node)){
   let collection,callback;if(ts.isPropertyAccessExpression(node.expression)&&['find','filter','some'].includes(node.expression.name.text)){collection=node.expression.expression;callback=node.arguments[0];}
   else if(ts.isIdentifier(node.expression)&&node.expression.text==='one'){collection=node.arguments[0];callback=node.arguments[1];}
   if(collection&&callback&&(ts.isArrowFunction(callback)||ts.isFunctionExpression(callback))&&callback.parameters[0]&&ts.isIdentifier(callback.parameters[0].name)){
    const prefix=prefixOf(collection,bindings),key=selector(callback.body,callback.parameters[0].name.text);if(prefix&&key)edits.push({start:collection.getStart(sf),end:collection.end,value:'indexedRuntimeEvents('+prefix+', '+key.text+')'});
   }
  }
  if(ts.isElementAccessExpression(node)&&ts.isIdentifier(node.expression)&&bindings.has(node.expression.text)&&node.argumentExpression){edits.push({start:node.getStart(sf),end:node.end,value:node.expression.text+'.at('+node.argumentExpression.getText(sf)+')'});}
  ts.forEachChild(node,n=>walk(n,bindings));
 }walk(sf,new Map());
 const selected=[];for(const e of edits.sort((a,b)=>a.start-b.start)){if(!selected.some(p=>p.end>e.start))selected.push(e);}
 for(const e of selected.sort((a,b)=>b.start-a.start))source=source.slice(0,e.start)+e.value+source.slice(e.end);
 if(selected.length){if(!source.includes('import { indexedRuntimeEvents }')&&!/\bindexedRuntimeEvents\b[\s\S]{0,700}from ['"]\.\/event_prefix\.js/.test(source))source='import { indexedRuntimeEvents } from "./event_prefix.js";\n'+source;fs.writeFileSync(file,source);}
 console.log(JSON.stringify({name,queries:selected.length}));
}
