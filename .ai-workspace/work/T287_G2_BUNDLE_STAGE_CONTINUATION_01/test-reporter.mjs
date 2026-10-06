// Consume Node's actual structured event stream; no console-text oracle.
export default async function* reporter(source) {
  for await (const event of source) {
    yield JSON.stringify(event, (_key,value)=>value instanceof Error
      ? {name:value.name,message:value.message,stack:value.stack,cause:value.cause,
        code:value.code,failureType:value.failureType,actual:value.actual,expected:value.expected}
      : value)+'\n';
  }
}
