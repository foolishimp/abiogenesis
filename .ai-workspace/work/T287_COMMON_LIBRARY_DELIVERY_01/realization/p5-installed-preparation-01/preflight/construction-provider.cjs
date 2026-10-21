#!/usr/bin/env node
require('node:fs').writeFileSync("/prospective-evidence/construction-process.json", JSON.stringify({pid:process.pid,provider:'controlled-construction'}), {flag:'wx'});
let prompt = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { prompt += chunk; });
process.stdin.on('end', () => {
  if (prompt.length === 0) throw new Error('missing construction prompt');
  const schemaIndex = process.argv.indexOf('--json-schema');
  const schema = JSON.parse(process.argv[schemaIndex + 1]);
  const targetSchema = schema.properties.files.items.properties.targetRef;
  const targetRefs = targetSchema.enum ?? [targetSchema.const];
  const replacementBase64 = "aW1wb3J0IGh0dHAgZnJvbSAnbm9kZTpodHRwJzsKaW1wb3J0IHsgd3JpdGVGaWxlU3luYyB9IGZyb20gJ25vZGU6ZnMnOwppbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnOwpleHBvcnQgZnVuY3Rpb24gYW5zd2VyKCkgeyByZXR1cm4gNDI7IH0KaWYgKHByb2Nlc3MuYXJndlsxXSA9PT0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpKSB7CiAgY29uc3QgcG9ydEZpbGUgPSBwcm9jZXNzLmFyZ3ZbMl07CiAgY29uc3Qgbm90ZSA9IChwaGFzZSkgPT4gY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoeyBwcm9vZjogJ2MyLWh0dHAtcHJvY2VzcycsIHBpZDogcHJvY2Vzcy5waWQsIHBoYXNlIH0pKTsKICBub3RlKCdzdGFydGVkJyk7CiAgY29uc3Qgc2VydmVyID0gaHR0cC5jcmVhdGVTZXJ2ZXIoKF9yZXF1ZXN0LCByZXNwb25zZSkgPT4gewogICAgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9IDIwMTsKICAgIHJlc3BvbnNlLnNldEhlYWRlcignQ29ubmVjdGlvbicsICdjbG9zZScpOwogICAgcmVzcG9uc2Uub25jZSgnZmluaXNoJywgKCkgPT4geyBub3RlKCdyZXNwb25zZS1maW5pc2hlZCcpOyBzZXJ2ZXIuY2xvc2UoKCkgPT4gbm90ZSgnc2VydmVyLWNsb3NlZCcpKTsgfSk7CiAgICByZXNwb25zZS5lbmQoJ2FiaS1vaycpOwogIH0pOwogIHNlcnZlci5saXN0ZW4oMCwgJzEyNy4wLjAuMScsICgpID0+IHsKICAgIGNvbnN0IGFkZHJlc3MgPSBzZXJ2ZXIuYWRkcmVzcygpOwogICAgaWYgKGFkZHJlc3MgPT09IG51bGwgfHwgdHlwZW9mIGFkZHJlc3MgPT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoJ21pc3NpbmcgcG9ydCcpOwogICAgd3JpdGVGaWxlU3luYyhwb3J0RmlsZSwgYCR7YWRkcmVzcy5wb3J0fVxuYCwgeyBmbGFnOiAnd3gnIH0pOwogIH0pOwp9Cg==";
  const result = {
    kind: 'worksite_construction_worker_result',
    schemaVersion: '5.0.0',
    files: targetRefs.map((targetRef) => ({
      kind: 'worksite_candidate_file', schemaVersion: '5.0.0',
      targetRef, replacementBase64,
    })),
  };
  process.stdout.write(`${JSON.stringify({ type: 'system', subtype: 'init', model: 'c2-c1-proof' })}\n`);
  process.stdout.write(`${JSON.stringify({ type: 'result', subtype: 'success', result: JSON.stringify(result) })}\n`);
});
