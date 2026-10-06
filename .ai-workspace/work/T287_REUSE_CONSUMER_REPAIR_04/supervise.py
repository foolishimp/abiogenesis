from pathlib import Path
import hashlib
p=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_REUSE_CONSUMER_REPAIR_03/supervise.py')
b=p.read_bytes()
assert hashlib.sha256(b).hexdigest()=='a5f74d8026e0f01bbf193586fed0889c9485e470aeb4321fb7815a3bb9e31c15'
s=b.decode()
assert s.count("T287_REUSE_CONSUMER_REPAIR_03")==1
s=s.replace("T287_REUSE_CONSUMER_REPAIR_03","T287_REUSE_CONSUMER_REPAIR_04")
exec(compile(s,str(p),'exec'),{'__file__':__file__,'__name__':'__main__'})
