import {readFile} from 'node:fs/promises';
export async function load(url,context,nextLoad){
 const match=url.match(/\/build\/code\/src\/abg\/(event_calculus|runtime_liveness)\.js(?:[?].*)?$/);
 if(match){const source=await readFile(new URL('./preimage/build/code/src/abg/'+match[1]+'.js',import.meta.url),'utf8');return {format:'module',source,shortCircuit:true};}
 return nextLoad(url,context);
}
