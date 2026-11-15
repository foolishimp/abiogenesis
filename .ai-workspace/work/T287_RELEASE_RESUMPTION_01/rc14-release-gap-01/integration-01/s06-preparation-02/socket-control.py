"""Small sandbox permission discriminator; no JVM, Product or application."""
import errno,json,pathlib,socket,sys
state=pathlib.Path(sys.argv[1]);path=state/'ipc/.sbt/sbt-socket9223372036854775807/sbt-load.sock'
path.parent.mkdir(parents=True);assert len(str(path).encode())+1<104
def exchange(server,address):
    server.settimeout(2);server.bind(address);server.listen(1)
    with socket.socket(server.family,socket.SOCK_STREAM) as client:
        client.settimeout(2);client.connect(server.getsockname());connection,_=server.accept()
        with connection:client.sendall(b'one');assert connection.recv(3)==b'one'
with socket.socket(socket.AF_UNIX,socket.SOCK_STREAM) as server:exchange(server,str(path))
path.unlink()
with socket.socket(socket.AF_INET,socket.SOCK_STREAM) as server:exchange(server,('127.0.0.1',0))
with socket.socket(socket.AF_INET6,socket.SOCK_STREAM) as server:exchange(server,('::1',0))
denied=[]
for kind in ['remote','wildcard-bind']:
    with socket.socket(socket.AF_INET,socket.SOCK_STREAM) as sock:
        sock.settimeout(.2)
        try:
            if kind=='remote':sock.connect(('192.0.2.1',9))
            else:sock.bind(('0.0.0.0',0))
        except OSError as e:
            assert e.errno in [errno.EPERM,errno.EACCES],(kind,e.errno)
            denied.append(kind)
        else:raise AssertionError('Unselected network operation allowed: '+kind)
print(json.dumps({'ownedUnix':True,'ipv4TcpLoopback':True,'ipv6TcpLoopback':True,'denied':denied,'nativeSocketBytesIncludingNul':len(str(path).encode())+1,
 'javaOrSparkExecuted':False,'limit':'Permission syntax/loopback discriminator; actual Spark capacity and behavior unproved'}))
