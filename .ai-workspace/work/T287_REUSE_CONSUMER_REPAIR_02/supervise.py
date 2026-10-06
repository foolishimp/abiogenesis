from pathlib import Path
import hashlib
p=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_REUSE_CONSUMER_REPAIR_01/supervise.py')
b=p.read_bytes()
assert hashlib.sha256(b).hexdigest()=='74b5740a04e80adf6a5cacc131f4f50c4899a02c8eb896727c0772fa54ae0fe5'
s=b.decode()
old="assert cfg['operation']==activation['operation']=='T287_REUSE_CONSUMER_REPAIR_01'"
assert s.count(old)==1
s=s.replace(old,"assert cfg['operation']==activation['operation']=='T287_REUSE_CONSUMER_REPAIR_02'")
exec(compile(s,str(p),'exec'),{'__file__':__file__,'__name__':'__main__'})
