# Building the real cabinet in Blender

The site currently drives all drawer/folder motion in code (hover-peek, full open,
camera dolly). Model the cabinet **closed, with no animation** — that keeps the
interaction fully controllable from the web side. Just match this structure so the
code can find and move the right parts.

## Object hierarchy & naming

Export one `.glb` containing:

- `Cabinet_Body` — the static shell (no motion)
- `Drawer_Portfolio` — top drawer, its own mesh/object
- `Drawer_About` — middle drawer
- `Drawer_Archive` — bottom drawer
- (optional) folders as children of each drawer: `Folder_01`, `Folder_02`, ...
  named in the order they should fan out when the drawer opens

Each drawer must be a **separate object** from the body (not merged), so the site
can grab it by name and translate it independently.

## Scale & orientation

- Model at real-world scale, in **meters**. A believable 3-drawer lateral cabinet:
  ~0.9m wide, ~1.3m tall, ~0.6m deep.
- Before exporting: select all, `Ctrl+A → All Transforms`, so every object has
  scale `1,1,1` and rotation `0,0,0` baked in. Untransformed objects import predictably.
- Local +Y should be "up" on each drawer, +Z the direction it slides out toward the
  viewer when opened (Blender's glTF exporter converts its own Z-up to glTF's Y-up
  automatically — you don't need to do this by hand, just don't fight it with extra
  rotations).

## Materials

Use **Principled BSDF** only. Base color, metallic, and roughness map directly to
glTF PBR; other node setups (e.g. custom shader graphs) won't export correctly.

## Export settings

`File → Export → glTF 2.0 (.glb/.gltf)`:
- Format: **glTF Binary (.glb)**
- Include: Selected Objects (if you don't want other scene junk)
- Transform: **+Y Up** (default, leave it on)
- Geometry: Apply Modifiers on

## Handoff

Send me the `.glb` (or drop it in a `public/models/` folder I'll create) and tell me
its actual width/height/depth in meters. I'll swap the current placeholder boxes in
[Cabinet.tsx](src/scene/Cabinet.tsx) and [Drawer.tsx](src/scene/Drawer.tsx) for
`useGLTF` calls that load your model, matching each named object to its existing
hover/open/camera behavior — the interaction code doesn't change, only what's
rendered.
