#!/usr/bin/env python3
"""One owned local Unix exchange and denied out-of-scope/IP controls; no app runtime."""
import errno,json,socket,sys
from pathlib import Path
work=Path(sys.argv[1]);path=work/'ipc'/'.sbt'/'control.sock';outside=work/'tmp'/'refused.sock'
rows=[];server=client=accepted=None
try:
 server=socket.socket(socket.AF_UNIX,socket.SOCK_STREAM);server.settimeout(2);server.bind(str(path));server.listen(1)
 client=socket.socket(socket.AF_UNIX,socket.SOCK_STREAM);client.settimeout(2);client.connect(str(path));accepted,_=server.accept();accepted.settimeout(2)
 client.sendall(b'owned-local-probe');message=accepted.recv(64);assert message==b'owned-local-probe';accepted.sendall(message);assert client.recv(64)==message
 rows.append({'case':'owned_unix_bind_connect_exchange','outcome':'pass','path':str(path),'pathBytesIncludingNul':len(str(path).encode())+1})
 for name,family,address,method in [('outside_owned_ipc',socket.AF_UNIX,str(outside),'bind'),('ipv4_network',socket.AF_INET,('127.0.0.1',9),'connect'),('ipv6_network',socket.AF_INET6,('::1',9),'connect')]:
  sock=socket.socket(family,socket.SOCK_STREAM);sock.settimeout(2)
  try:
   getattr(sock,method)(address)
  except OSError as error:
   rows.append({'case':name,'outcome':'denied' if error.errno in [errno.EPERM,errno.EACCES] else 'unexpected_error','errno':error.errno,'message':str(error)})
   assert error.errno in [errno.EPERM,errno.EACCES],name
  else:rows.append({'case':name,'outcome':'unexpected_allowed'});raise AssertionError(name+' unexpectedly allowed')
  finally:sock.close()
except BaseException as error:
 print(json.dumps({'checks':rows,'failure':{'name':type(error).__name__,'message':str(error)}}),flush=True);raise
finally:
 for sock in [accepted,client,server]:
  if sock is not None:sock.close()
 for p in [path,outside]:
  if p.exists():p.unlink()
print(json.dumps({'checks':rows,'failure':None,'applicationExecution':False,'dnsRequested':False}),flush=True)
