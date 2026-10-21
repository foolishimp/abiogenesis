import http from 'node:http';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
export function answer() { return 42; }
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const portFile = process.argv[2];
  const note = (phase) => console.log(JSON.stringify({ proof: 'c2-http-process', pid: process.pid, phase }));
  note('started');
  const server = http.createServer((_request, response) => {
    response.statusCode = 201;
    response.setHeader('Connection', 'close');
    response.once('finish', () => { note('response-finished'); server.close(() => note('server-closed')); });
    response.end('abi-ok');
  });
  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    if (address === null || typeof address === 'string') throw new Error('missing port');
    writeFileSync(portFile, `${address.port}\n`, { flag: 'wx' });
  });
}
