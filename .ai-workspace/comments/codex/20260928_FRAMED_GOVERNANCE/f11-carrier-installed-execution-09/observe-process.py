import os,sys,json,time,signal,subprocess,resource
from pathlib import Path
receipt=Path(sys.argv[1]);command=sys.argv[2:];started=time.monotonic()
child=subprocess.Popen(command)
signal.signal(signal.SIGTERM,lambda *_:None)
pid,status,usage=os.wait4(child.pid,0)
code=os.waitstatus_to_exitcode(status)
value={"pid":pid,"command":command,"elapsedMs":round((time.monotonic()-started)*1000,3),"exitCode":code if code>=0 else None,"signal":signal.Signals(-code).name if code<0 else None,"peakRSSBytes":usage.ru_maxrss,"userSeconds":usage.ru_utime,"systemSeconds":usage.ru_stime,"observation":"wait4 actual native CLI; macOS ru_maxrss bytes"}
receipt.write_text(json.dumps(value,indent=2)+"\n")
sys.exit(code if code>=0 else 128-code)
