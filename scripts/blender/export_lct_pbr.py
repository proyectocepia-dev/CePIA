"""Exporta el LCT a GLB para web con texturas PBR horneadas (pintura gastada, suciedad, oclusión, rugosidad).

Uso:
  blender -b "LCT Modelo Completo.blend" --python scripts/blender/export_lct_pbr.py -- salida.glb [tam_elevacion]

No guarda el .blend. Pasos:
 1. Igual que export_lct.py: solo lo visible en render, sin pernos; soldar y reducir; tres nodos
    (LCT_Base fijo, LCT_Azimuth gira en Y, LCT_Elevation inclina en X).
 2. Despliega UV (Smart UV Project) en cada nodo.
 3. Materiales procedurales en Cycles: pintura grafito con suciedad en las cavidades (oclusión), desgaste en
    los cantos (pointiness) y variación de manchas (ruido); paneles del plato en aluminio cepillado.
 4. Hornea por nodo: color base y un ORM (R oclusión, G rugosidad, B metálico).
 5. Reemplaza los materiales por imagen + ORM (el exportador glTF los reconoce) y exporta.
"""
import sys
import bpy
import bmesh
import numpy as np
from mathutils import Matrix

args = sys.argv[sys.argv.index("--") + 1:]
OUT = args[0]
TAM = {"Base": 1024, "Azimuth": 1024, "Elevation": int(args[1]) if len(args) > 1 else 2048}
SKIP = {"Counterweight Bolts", "Plataform Bolts & Nuts", "Sidecab Bolts & Nuts"}
BASE_FACES, KEEP = 2500, 0.05
PANEL = "Material.002"  # paneles del plato en el .blend original

az = bpy.data.objects["Azimuth Axis"]
el = bpy.data.objects["Elevation axis"]


def visible(o):
    if o.hide_render or o.hide_get() or o.type not in {"MESH", "CURVE"}:
        return False
    return not any(c.name in SKIP or c.hide_render for c in o.users_collection)


def group_of(o):
    p = o.parent
    while p:
        if p == el:
            return "Elevation"
        if p == az:
            return "Azimuth"
        p = p.parent
    return "Base"


# ---------- 1. Geometría (como export_lct.py) ----------
for o in bpy.data.objects:
    if o.type == "MESH" and visible(o) and len(o.data.polygons) > BASE_FACES:
        o.modifiers.new("weld", "WELD").merge_threshold = 0.0005
        d = o.modifiers.new("dec", "DECIMATE")
        n = len(o.data.polygons)
        d.ratio = min(1.0, (BASE_FACES + KEEP * n) / n)
bpy.context.view_layer.update()
deps = bpy.context.evaluated_depsgraph_get()

piv = {"Base": Matrix.Identity(4), "Azimuth": az.matrix_world.copy(), "Elevation": el.matrix_world.copy()}
groups = {k: {"bm": bmesh.new()} for k in piv}
for o in list(bpy.data.objects):
    if not visible(o):
        continue
    gname = group_of(o)
    g = groups[gname]
    ev = o.evaluated_get(deps)
    tmp = ev.to_mesh()
    if tmp is None or len(tmp.polygons) == 0:
        ev.to_mesh_clear()
        continue
    me = tmp.copy()
    ev.to_mesh_clear()
    mat = piv[gname].inverted() @ o.matrix_world
    me.transform(mat)
    if mat.determinant() < 0:
        me.flip_normals()
    es_panel = [bool(s and s.name == PANEL) for s in (list(me.materials) or [None])]
    start = len(g["bm"].faces)
    g["bm"].from_mesh(me)
    g["bm"].faces.ensure_lookup_table()
    for f in g["bm"].faces[start:]:
        f.material_index = 1 if es_panel[min(f.material_index, len(es_panel) - 1)] else 0
    bpy.data.meshes.remove(me)

for o in list(bpy.data.objects):
    bpy.data.objects.remove(o)
col = bpy.context.scene.collection
objs = {}
for name, g in groups.items():
    me = bpy.data.meshes.new(f"LCT_{name}")
    bmesh.ops.remove_doubles(g["bm"], verts=g["bm"].verts, dist=0.0005)
    g["bm"].to_mesh(me)
    g["bm"].free()
    ob = bpy.data.objects.new(f"LCT_{name}", me)
    col.objects.link(ob)
    objs[name] = ob
    print(name, "faces", len(me.polygons))


# ---------- 2. UV ----------
def desplegar(ob):
    # En modo background el contexto no siempre trae objeto activo: se fija explícitamente con temp_override.
    vl = bpy.context.scene.view_layers[0]
    vl.objects.active = ob
    with bpy.context.temp_override(view_layer=vl, active_object=ob, object=ob, selected_objects=[ob], selected_editable_objects=[ob]):
        bpy.ops.object.mode_set(mode="EDIT")
        bpy.ops.mesh.select_all(action="SELECT")
        bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.003, area_weight=0.0, scale_to_bounds=True)
        bpy.ops.object.mode_set(mode="OBJECT")


for ob in objs.values():
    desplegar(ob)
    print("uv", ob.name)


# ---------- 3. Materiales procedurales ----------
def nodo(nt, tipo, **props):
    n = nt.nodes.new(tipo)
    for k, v in props.items():
        setattr(n, k, v)
    return n


def material_procedural(nombre, panel):
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nodo(nt, "ShaderNodeOutputMaterial")
    bsdf = nodo(nt, "ShaderNodeBsdfPrincipled")
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    tc = nodo(nt, "ShaderNodeTexCoord")
    ao = nodo(nt, "ShaderNodeAmbientOcclusion")
    ao.inputs["Distance"].default_value = 0.35
    geo = nodo(nt, "ShaderNodeNewGeometry")
    ruido = nodo(nt, "ShaderNodeTexNoise")
    ruido.inputs["Scale"].default_value = 1.6
    ruido.inputs["Detail"].default_value = 8.0
    nt.links.new(tc.outputs["Object"], ruido.inputs["Vector"])
    fino = nodo(nt, "ShaderNodeTexNoise")
    fino.inputs["Scale"].default_value = 38.0
    fino.inputs["Detail"].default_value = 4.0
    nt.links.new(tc.outputs["Object"], fino.inputs["Vector"])

    # Suciedad: cavidades (1 - AO) moduladas por manchas grandes.
    inv = nodo(nt, "ShaderNodeMath", operation="SUBTRACT")
    inv.inputs[0].default_value = 1.0
    nt.links.new(ao.outputs["AO"], inv.inputs[1])
    suc = nodo(nt, "ShaderNodeMath", operation="MULTIPLY", use_clamp=True)
    nt.links.new(inv.outputs[0], suc.inputs[0])
    rampa_r = nodo(nt, "ShaderNodeMapRange")
    rampa_r.inputs["From Min"].default_value = 0.35
    rampa_r.inputs["From Max"].default_value = 0.7
    rampa_r.inputs["To Min"].default_value = 0.6
    rampa_r.inputs["To Max"].default_value = 1.6
    nt.links.new(ruido.outputs["Fac"], rampa_r.inputs["Value"])
    nt.links.new(rampa_r.outputs["Result"], suc.inputs[1])

    # Desgaste: cantos convexos (pointiness alto) cortados por ruido fino.
    canto = nodo(nt, "ShaderNodeMapRange")
    canto.inputs["From Min"].default_value = 0.52
    canto.inputs["From Max"].default_value = 0.62
    nt.links.new(geo.outputs["Pointiness"], canto.inputs["Value"])
    corte = nodo(nt, "ShaderNodeMath", operation="MULTIPLY", use_clamp=True)
    nt.links.new(canto.outputs["Result"], corte.inputs[0])
    corte_r = nodo(nt, "ShaderNodeMapRange")
    corte_r.inputs["From Min"].default_value = 0.42
    corte_r.inputs["From Max"].default_value = 0.6
    nt.links.new(fino.outputs["Fac"], corte_r.inputs["Value"])
    nt.links.new(corte_r.outputs["Result"], corte.inputs[1])

    if panel:
        base, sucio, gastado = (0.42, 0.44, 0.46, 1), (0.16, 0.15, 0.14, 1), (0.62, 0.63, 0.64, 1)
        rug_base, rug_sucio, metal = 0.3, 0.75, 0.85
    else:
        base, sucio, gastado = (0.055, 0.062, 0.07, 1), (0.02, 0.018, 0.016, 1), (0.36, 0.35, 0.33, 1)
        rug_base, rug_sucio, metal = 0.48, 0.85, 0.55

    mix1 = nodo(nt, "ShaderNodeMix", data_type="RGBA", blend_type="MIX")
    mix1.inputs["A"].default_value = base
    mix1.inputs["B"].default_value = sucio
    nt.links.new(suc.outputs[0], mix1.inputs["Factor"])
    mix2 = nodo(nt, "ShaderNodeMix", data_type="RGBA", blend_type="MIX")
    nt.links.new(mix1.outputs["Result"], mix2.inputs["A"])
    mix2.inputs["B"].default_value = gastado
    nt.links.new(corte.outputs[0], mix2.inputs["Factor"])
    nt.links.new(mix2.outputs["Result"], bsdf.inputs["Base Color"])

    rug = nodo(nt, "ShaderNodeMapRange")
    rug.inputs["To Min"].default_value = rug_base
    rug.inputs["To Max"].default_value = rug_sucio
    nt.links.new(suc.outputs[0], rug.inputs["Value"])
    rug2 = nodo(nt, "ShaderNodeMath", operation="SUBTRACT", use_clamp=True)
    nt.links.new(rug.outputs["Result"], rug2.inputs[0])
    rug2b = nodo(nt, "ShaderNodeMath", operation="MULTIPLY")
    rug2b.inputs[1].default_value = 0.25
    nt.links.new(corte.outputs[0], rug2b.inputs[0])
    nt.links.new(rug2b.outputs[0], rug2.inputs[1])
    nt.links.new(rug2.outputs[0], bsdf.inputs["Roughness"])
    bsdf.inputs["Metallic"].default_value = metal
    m["metal"] = metal
    return m


# ---------- 4. Horneado ----------
scene = bpy.context.scene
scene.render.engine = "CYCLES"
# CPU a propósito: en este equipo la compilación de kernels GPU de Cycles se queda sin memoria.
scene.cycles.device = "CPU"
scene.cycles.samples = 24
scene.render.bake.margin = 6


def imagen(nombre, tam, color=True):
    im = bpy.data.images.new(nombre, tam, tam, alpha=False, float_buffer=False)
    im.colorspace_settings.name = "sRGB" if color else "Non-Color"
    return im


def hornear(ob, tipo, im, filtro=None):
    for m in ob.data.materials:
        nt = m.node_tree
        n = nt.nodes.get("__bake") or nt.nodes.new("ShaderNodeTexImage")
        n.name = "__bake"
        n.image = im
        nt.nodes.active = n
    vl = bpy.context.scene.view_layers[0]
    for o in vl.objects:
        o.select_set(o == ob, view_layer=vl)
    vl.objects.active = ob
    kw = {"type": tipo}
    if filtro is not None:
        kw["pass_filter"] = filtro
    with bpy.context.temp_override(view_layer=vl, active_object=ob, object=ob, selected_objects=[ob], selected_editable_objects=[ob]):
        bpy.ops.object.bake(**kw)


def pix(im):
    a = np.empty(len(im.pixels), dtype=np.float32)
    im.pixels.foreach_get(a)
    return a.reshape(-1, 4)


def material_final(nombre, color, orm):
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nodo(nt, "ShaderNodeOutputMaterial")
    bsdf = nodo(nt, "ShaderNodeBsdfPrincipled")
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    tc = nodo(nt, "ShaderNodeTexImage")
    tc.image = color
    nt.links.new(tc.outputs["Color"], bsdf.inputs["Base Color"])
    to = nodo(nt, "ShaderNodeTexImage")
    to.image = orm
    sep = nodo(nt, "ShaderNodeSeparateColor")
    nt.links.new(to.outputs["Color"], sep.inputs["Color"])
    nt.links.new(sep.outputs["Green"], bsdf.inputs["Roughness"])
    nt.links.new(sep.outputs["Blue"], bsdf.inputs["Metallic"])
    # Oclusión: el exportador glTF la lee desde un grupo "glTF Material Output" con entrada Occlusion.
    grupo = bpy.data.node_groups.get("glTF Material Output")
    if grupo is None:
        grupo = bpy.data.node_groups.new("glTF Material Output", "ShaderNodeTree")
        grupo.interface.new_socket("Occlusion", in_out="INPUT", socket_type="NodeSocketFloat")
    gn = nt.nodes.new("ShaderNodeGroup")
    gn.node_tree = grupo
    nt.links.new(sep.outputs["Red"], gn.inputs["Occlusion"])
    return m


for name, ob in objs.items():
    tam = TAM[name]
    ob.data.materials.clear()
    ob.data.materials.append(material_procedural(f"{name}_pintura", panel=False))
    ob.data.materials.append(material_procedural(f"{name}_panel", panel=True))
    metales = [m["metal"] for m in ob.data.materials]

    im_color = imagen(f"lct_{name.lower()}_color", tam)
    hornear(ob, "DIFFUSE", im_color, {"COLOR"})
    im_rug = imagen(f"tmp_rug_{name}", tam, color=False)
    hornear(ob, "ROUGHNESS", im_rug)
    im_ao = imagen(f"tmp_ao_{name}", tam, color=False)
    hornear(ob, "AO", im_ao)

    # Metálico por material: se hornea una emisión con el valor del material en cada cara.
    for m, v in zip(ob.data.materials, metales):
        bs = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
        bs.inputs["Emission Color"].default_value = (v, v, v, 1)
        bs.inputs["Emission Strength"].default_value = 1.0
    im_met = imagen(f"tmp_met_{name}", tam, color=False)
    hornear(ob, "EMIT", im_met)

    orm = imagen(f"lct_{name.lower()}_orm", tam, color=False)
    a_ao, a_rug, a_met = pix(im_ao), pix(im_rug), pix(im_met)
    o = np.ones_like(a_ao)
    o[:, 0] = 0.35 + 0.65 * a_ao[:, 0]  # oclusión suavizada: la web ya tiene luz ambiente baja
    o[:, 1] = a_rug[:, 0]
    o[:, 2] = a_met[:, 0]
    orm.pixels.foreach_set(o.ravel())
    print("bake", name, tam)

    final = material_final(f"LCT_{name}", im_color, orm)
    ob.data.materials.clear()
    ob.data.materials.append(final)
    for p in ob.data.polygons:
        p.material_index = 0

objs["Azimuth"].matrix_world = piv["Azimuth"]
objs["Elevation"].parent = objs["Azimuth"]
objs["Elevation"].matrix_basis = piv["Azimuth"].inverted() @ piv["Elevation"]
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_yup=True, export_normals=True,
                          export_cameras=False, export_lights=False, export_animations=False)
print("OK", OUT)
