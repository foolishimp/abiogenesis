from pathlib import Path
import hashlib
p=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_REUSE_CONSUMER_REPAIR_02/supervise.py')
b=p.read_bytes()
assert hashlib.sha256(b).hexdigest()=='bba814f591afc47151ba79bee938e30834b2c1f45162597519f67e7d425f4253'
s=b.decode()
assert s.count("T287_REUSE_CONSUMER_REPAIR_02")==1
s=s.replace("T287_REUSE_CONSUMER_REPAIR_02","T287_REUSE_CONSUMER_REPAIR_03")
exec(compile(s,str(p),'exec'),{'__file__':__file__,'__name__':'__main__'})
