import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const root='/Users/jim/Library/Application Support/ABIogenesis/installs/5.0.0-rc.3/node_modules/@abiogenesis/typescript-tenant';
const owner=await import(pathToFileURL(root+'/build/code/src/product/worksite_command_execution.js'));
const testing=JSON.parse(await readFile(new URL('./testing.DRAFT.json',import.meta.url),'utf8'));
const budget=owner.projectWorksiteCommandExecutionBudget(testing),limits={inactivityTimeoutMs:4500000,absoluteTimeoutMs:5400000};
assert(owner.worksiteCommandExecutionBudgetFits(budget.requiredExecutionBudgetMs,limits));
console.log(JSON.stringify({kind:'pure_existing_owner_c2_budget_readiness',budget,limits,fits:true,commands:testing.commands.length,scope:'Pure existing budget owner only; actual whole configuration requires genuine runtime003 authority/ambient; no Runtime/provider/store/build/test effects.'},null,2));
