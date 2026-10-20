from pathlib import Path
import json,shutil,hashlib
phase=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/library-runtime-state-233')
tenant=Path('/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript')
for old in (phase/'preimages/code/src').rglob('*.ts'):
 rel=old.relative_to(phase/'preimages/code/src');src=(phase.parent/'library-native-material-235/native-source-postimages-02/code/src/abg/native_worksite_execution.ts') if str(rel)=='abg/native_worksite_execution.ts' else tenant/'code/src'/rel;dst=phase/'source/code/src'/rel;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes(src.read_bytes())
(phase/'source/code/src/abg/runtime_history.ts').write_bytes((tenant/'code/src/abg/runtime_history.ts').read_bytes())
# Frozen consumer inputs, never a moving Worker235 overlay.
owned235=phase.parent/'library-native-material-235/postimages-03/code/src'
for name in ['abg/default_library.ts','abg/instruction_assembly.ts','abg/actor_process.ts','abg/stdo_environment.ts','implementation/worksite_command_execution.ts']:
 src=owned235/name;dst=phase/'source/code/src'/name;dst.write_bytes(src.read_bytes())
(phase/'source/code/src/abg/instruction_assembly.ts').write_bytes((phase.parent/'library-native-material-235/instruction-postimage-06.ts').read_bytes())
(phase/'source/code/src/abg/event_body_encoding.ts').write_bytes((phase.parent/'library-native-material-235/codec-postimage-05.ts').read_bytes())
