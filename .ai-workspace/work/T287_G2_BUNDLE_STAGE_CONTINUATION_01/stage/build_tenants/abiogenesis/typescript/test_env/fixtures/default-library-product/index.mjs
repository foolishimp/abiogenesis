import {ABI5_DEFAULT_LIBRARY_PRODUCT_SEMANTICS as library} from '@abiogenesis/typescript-tenant/product';
export const SEMANTICS={...library,bindingRef:'semantics://default-library-witness/consumer@5',packageName:'@abiogenesis-fixtures/registered-selection',packageVersion:'5.0.0',
  validateContractValue(kind,value){
    if(kind==='consumer_outcome_assessment')return value?.kind===kind&&['satisfied','unmet','indeterminate'].includes(value.disposition)&&typeof value.reason==='string'&&Array.isArray(value.unresolvedCriteria)&&value.unresolvedCriteria.every(v=>typeof v==='string')&&Object.keys(value).sort().join(',')==='disposition,kind,reason,unresolvedCriteria';
    return library.validateContractValue(kind,value);
  }};
