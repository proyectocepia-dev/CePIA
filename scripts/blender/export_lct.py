"""Exporta el LCT a GLB para web: 3 nodos (base fija, azimut, elevacion), mallas unidas por grupo.
Uso: blender -b "LCT Modelo Completo.blend" --python export_lct.py -- salida.glb  (no guarda el .blend)"""
import sys
import bpy
import bmesh
from mathutils import Matrix

OUT = sys.argv[sys.argv.index("--") + 1]
SKIP = {"Counterweight Bolts", "Plataform Bolts & Nuts", "Sidecab Bolts & Nuts"}
az = bpy.data.objects["Azimuth Axis"]
el = bpy.data.objects["Elevation axis"]

def visible(o):
    if o.hide_render or o.hide_get() or o.type not in {"MESH", "CURVE"}:
        return False
    return not any(c.name in SKIP or c.hide_render for c in o.users_collection)

def group_of(o):
    p = o.parent
    while p:
        if p == el: return "Elevation"
        if p == az: return "Azimuth"
        p = p.parent
    return "Base"

BASE_FACES, KEEP = 2500, 0.05
for o in bpy.data.objects:
    if o.type == "MESH" and visible(o) and len(o.data.polygons) > BASE_FACES:
        o.modifiers.new("weld", "WELD").merge_threshold = 0.0005
        d = o.modifiers.new("dec", "DECIMATE")
        n = len(o.data.polygons)
        d.ratio = min(1.0, (BASE_FACES + KEEP * n) / n)
bpy.context.view_layer.update()
deps = bpy.context.evaluated_depsgraph_get()
piv = {"Base": Matrix.Identity(4), "Azimuth": az.matrix_world.copy(), "Elevation": el.matrix_world.copy()}
groups = {k: {"bm": bmesh.new(), "mats": []} for k in piv}
for o in list(bpy.data.objects):
    if not visible(o):
        continue
    gname = group_of(o); g = groups[gname]
    ev = o.evaluated_get(deps)
    tmp = ev.to_mesh()
    if tmp is None or len(tmp.polygons) == 0:
        ev.to_mesh_clear(); continue
    me = tmp.copy(); ev.to_mesh_clear()
    mat = piv[gname].inverted() @ o.matrix_world
    me.transform(mat)
    if mat.determinant() < 0: me.flip_normals()
    remap = []
    for slot in (list(me.materials) or [None]):
        if slot not in g["mats"]: g["mats"].append(slot)
        remap.append(g["mats"].index(slot))
    start = len(g["bm"].faces)
    g["bm"].from_mesh(me)
    g["bm"].faces.ensure_lookup_table()
    for f in g["bm"].faces[start:]:
        f.material_index = remap[min(f.material_index, len(remap) - 1)]
    bpy.data.meshes.remove(me)

for o in list(bpy.data.objects):
    bpy.data.objects.remove(o)
col = bpy.context.scene.collection
objs = {}
for name, g in groups.items():
    me = bpy.data.meshes.new(f"LCT_{name}")
    bmesh.ops.remove_doubles(g["bm"], verts=g["bm"].verts, dist=0.0005)
    g["bm"].to_mesh(me); g["bm"].free()
    for m in g["mats"]: me.materials.append(m)
    ob = bpy.data.objects.new(f"LCT_{name}", me)
    col.objects.link(ob); objs[name] = ob
    print(name, "faces", len(me.polygons), "mats", [m.name if m else None for m in g["mats"]])
objs["Azimuth"].matrix_world = piv["Azimuth"]
objs["Elevation"].parent = objs["Azimuth"]
objs["Elevation"].matrix_basis = piv["Azimuth"].inverted() @ piv["Elevation"]
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_yup=True, export_normals=True,
    export_cameras=False, export_lights=False, export_animations=False)
print("OK", OUT)

