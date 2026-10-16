"""Usage: blender --background --python scripts/blender-import-bike.py -- input.glb output.blend
Imports our original GLB without flattening named component boundaries. No external services.
"""
import sys
from pathlib import Path
import bpy

args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
if len(args)!=2:
    raise SystemExit('Expected input.glb output.blend after --')
source,destination=map(lambda s:Path(s).resolve(),args)
if not source.is_file() or source.suffix.lower()!='.glb':
    raise SystemExit('Input must be an existing .glb file')
if destination.exists():
    raise SystemExit('Refusing to overwrite an existing Blender project')
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(source))
bpy.context.scene.unit_settings.system='METRIC'
bpy.context.scene['BAK_accuracy']='BLOCKOUT_NOT_OEM_VERIFIED'
destination.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(destination))
