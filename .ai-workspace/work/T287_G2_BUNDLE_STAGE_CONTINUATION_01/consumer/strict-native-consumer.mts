import {C,cCarrier,admitGraphFunction,serializeGraphFunction,admitCProgramSyntax,serializeCProgramCanonical,type CProgramNode,type CProgramTerm,type GraphFunction} from '@abiogenesis/typescript-tenant/gtl/m01';
import {admitModule,serializeModule,type ModulePublication} from '@abiogenesis/typescript-tenant/gtl/m02';
import {admitGtlProgramConformanceInput,typecheckGtlProgram,type GtlProgramConformanceInput,type GtlProgramDiagnosticId} from '@abiogenesis/typescript-tenant/abg/m03';
declare const graph:GraphFunction, publication:ModulePublication, input:GtlProgramConformanceInput;
const graphText:string=serializeGraphFunction(graph),moduleText:string=serializeModule(publication);
const g=admitGraphFunction(JSON.parse(graphText));if(g.kind==='raw_admitted_value'){const n:CProgramNode=g.value.template.nodes[0]!.term;serializeCProgramCanonical(n);}
const m=admitModule(JSON.parse(moduleText));if(m.kind==='raw_admitted_value'){const p:ModulePublication=m.value;serializeModule(p);}
const p=admitGtlProgramConformanceInput(input);if(p.kind==='raw_admitted_value')typecheckGtlProgram(p);
const native=C.id(cCarrier<{readonly value:string}>('carrier://strict'));const witnessed:CProgramTerm<{readonly value:string},{readonly value:string},never,'zero'>=native;
const syntax=admitCProgramSyntax(JSON.parse(serializeCProgramCanonical(native)));if(syntax.kind==='raw_admitted_value'){
// @ts-expect-error erased syntax does not manufacture a native witness
const falseWitness:CProgramTerm<string,string>=syntax.value;
}
// @ts-expect-error original C syntax has a closed discriminant
const bad:CProgramNode={kind:'new_constructor',inputCarrierRef:'a',outputCarrierRef:'b'};
// @ts-expect-error supported diagnostic identities are closed
const diagnostic:GtlProgramDiagnosticId='unknown';
// @ts-expect-error native input/output witnesses cannot cross carrier types
const crossed:CProgramTerm<number,number>=native;
