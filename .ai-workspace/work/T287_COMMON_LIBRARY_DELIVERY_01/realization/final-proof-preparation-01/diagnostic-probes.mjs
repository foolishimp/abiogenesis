// Synchronous observers only. No owners, I/O, processes, promises or timers are created here.
export function createProbes({byteLength=Buffer.byteLength,observeError=()=>{}}={}){
  const counts={},owners=[],modules=[],identity=new WeakMap(),selectionOwners=new WeakMap();
  let suspended=0;
  const observe=fn=>{if(suspended)return;try{fn();}catch(e){observeError(e);}};
  const count=(name,n=1)=>{const c=counts[name]??={calls:0,total:0};c.calls++;c.total+=n;};
  const scope=fn=>{suspended++;try{return fn();}finally{suspended--;}};
  const bytes=(value,encoding)=>typeof value==='string'?byteLength(value,encoding):ArrayBuffer.isView(value)?value.byteLength:null;
  function delegate(original,after){return function(...args){const result=Reflect.apply(original,this,args);observe(()=>after.call(this,args,result));return result;};}
  function hashUpdate(original){return delegate(original,args=>{const n=bytes(args[0],args[1]);if(n===null)count('hash.update.unsized');else count('hash.update.inputBytes',n);});}
  function jsonStringify(original){return delegate(original,(_args,result)=>{if(typeof result==='string')count('JSON.stringify.outputUtf8Bytes',byteLength(result));else count('JSON.stringify.nonString');});}
  function canonical(original){let depth=0;return function(value,sink){
    if(depth!==0||suspended)return Reflect.apply(original,this,[value,sink]);
    const tapped=function(...parts){const result=Reflect.apply(sink,this,parts);observe(()=>count('writeCanonicalJson.deliveredUtf8Bytes',byteLength(parts[0])));return result;};
    depth++;try{return Reflect.apply(original,this,[value,tapped]);}finally{depth--;}
  };}
  function bind(owner,moduleUrl){let row=identity.get(owner);if(!row){row={id:owners.length+1,moduleUrl,work:{},methodCalls:{},observedSelectionExtents:{calls:0,rows:0},scopeWork:{calls:0,newScopeRows:0,returnedRows:0}};identity.set(owner,row);owners.push(row);}return row;}
  function sample(owner,moduleUrl,method){const row=bind(owner,moduleUrl);row.methodCalls[method]=(row.methodCalls[method]??0)+1;
    for(const key of ['bodyRows','scopeRows','membershipComparisons','selectorRows']){const n=owner.work[key];if(!Number.isSafeInteger(n)||n<0)throw new Error('unexpected actual RuntimeHistory.work counter');row.work[key]=n;}
    return row;
  }
  function instrumentHistory(History,Selection,moduleUrl){
    modules.push({moduleUrl,kind:'RuntimeHistory',counterSemantics:'Actual owner cumulative work; bodyRows counts requests, scopeRows newly traversed causal scope rows, membershipComparisons and selectorRows use owner increments. No unique-body or global suffix estimate.'});
    for(const name of ['appendValidated','commitLocation','truncate','event','eventById','select','scope','scopedCanonicalDigest','scopedSelectorExtent','indices','selectorExtent']){
      const original=History.prototype[name];if(typeof original!=='function')throw new Error('missing RuntimeHistory method '+name);
      History.prototype[name]=function(...args){
        let before=null;observe(()=>{if(name==='scope')before=this.work.scopeRows;});
        try{const result=Reflect.apply(original,this,args);observe(()=>{const row=sample(this,moduleUrl,name);
          if(name==='select') {selectionOwners.set(result,this);row.observedSelectionExtents.calls++;row.observedSelectionExtents.rows+=result.length;}
          if(name==='scope') {row.scopeWork.calls++;row.scopeWork.newScopeRows+=this.work.scopeRows-before;row.scopeWork.returnedRows+=result.length;row.scopeWork.lastThrough=args[0];}
          if(name==='indices')count('RuntimeHistory.indices.returnedRows',result.length);
        });return result;}catch(error){observe(()=>sample(this,moduleUrl,name+':throw'));throw error;}
      };
    }
    for(const name of ['rowById','select','selectorExtent','selectScopeCold','materialize']){
      const original=Selection.prototype[name];if(typeof original!=='function')throw new Error('missing RuntimeHistorySelection method '+name);
      Selection.prototype[name]=function(...args){try{const result=Reflect.apply(original,this,args);observe(()=>{const owner=selectionOwners.get(this);if(owner)sample(owner,moduleUrl,'selection.'+name);else count('RuntimeHistorySelection.ownerUnobserved');});return result;}catch(error){observe(()=>{const owner=selectionOwners.get(this);if(owner)sample(owner,moduleUrl,'selection.'+name+':throw');});throw error;}};
    }
  }
  function instrumentIndex(Index,moduleUrl){
    modules.push({moduleUrl,kind:'RuntimeEventIndex',counterSemantics:'Actual pre/post existing index fields; advanced rows, validated ordinal rows and causally validated rows are distinct, overlapping channels.'});
    for(const [name,field] of [['advance','count'],['structure','ordinalCount'],['validateCauses','causalCount'],['profile','profileCount']]){
      const original=Index.prototype[name];if(typeof original!=='function')throw new Error('missing RuntimeEventIndex method '+name);
      Index.prototype[name]=function(...args){let before;observe(()=>{before=this[field];});
        try{const result=Reflect.apply(original,this,args);observe(()=>count('RuntimeEventIndex.'+field+'.advancedRows',this[field]-before));return result;}
        catch(error){observe(()=>count('RuntimeEventIndex.'+field+'.advancedBeforeThrow',this[field]-before));throw error;}
      };
    }
  }
  return {counts,owners,modules,scope,delegate,hashUpdate,jsonStringify,canonical,instrumentHistory,instrumentIndex,
    record:(name,n)=>observe(()=>count(name,n)),
    limits:['Counters are separate overlapping channels; never sum hash, JSON, canonical and filesystem bytes.','No decoded bodies or selections retained by observers; owner IDs use WeakMap and numeric snapshots.','scopeWork reports actual owner new-scope rows, including discovered older causes; not elapsed ordinal suffix length.','Cold selectScopeCold has no owner scopeRows increments; its internal causal iterations are unobserved.','Probe callback failures are recorded separately and do not replace original output/error.']};
}
