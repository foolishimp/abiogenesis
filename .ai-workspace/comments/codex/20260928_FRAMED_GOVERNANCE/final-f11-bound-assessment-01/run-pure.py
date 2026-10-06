from pathlib import Path
import os, subprocess, sys, time, json
D=Path(__file__).resolve().parent
name=sys.argv[1]
command=sys.argv[2:]
assert command and '/' not in name
env=dict(os.environ, PYTHONDONTWRITEBYTECODE='1', NODE_OPTIONS='')
start=time.monotonic()
p=subprocess.Popen(command, cwd=D, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
timed_out=False
try:
    out,err=p.communicate(timeout=120)
except subprocess.TimeoutExpired:
    timed_out=True
    p.terminate()
    try: out,err=p.communicate(timeout=1)
    except subprocess.TimeoutExpired:
        p.kill();out,err=p.communicate()
elapsed=(time.monotonic()-start)*1000
(D/(name+'.stdout')).write_bytes(out)
(D/(name+'.stderr')).write_bytes(err)
record={'name':name,'command':command,'pid':p.pid,'elapsedMs':elapsed,'exitCode':p.returncode,'timedOut':timed_out,
        'scope':'Pure external construction/validation/rendering; no native/provider dispatch'}
(D/(name+'.process.json')).write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps(record));print(out.decode(errors='replace')[-3000:]);print(err.decode(errors='replace')[-3000:])
sys.exit(1 if timed_out else p.returncode)
