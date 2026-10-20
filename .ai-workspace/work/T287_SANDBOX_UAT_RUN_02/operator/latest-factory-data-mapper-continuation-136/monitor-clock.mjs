import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {readOperatorControl,qualityClock} from './operator-control.mjs';
const root=fileURLToPath(new URL('.',import.meta.url));
const control=await readOperatorControl();
const request=JSON.parse(await readFile(root+'commands/lifecycle-continuation.request.json','utf8'));
console.log(JSON.stringify({operatorControl:control.pin,...qualityClock(control.value,request)}));
