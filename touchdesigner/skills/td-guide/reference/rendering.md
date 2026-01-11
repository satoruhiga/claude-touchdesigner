# Rendering Reference

## Contents

1. [Required Components](#required-components)
2. [Camera](#camera)
3. [Light](#light)
4. [Material](#material)
5. [Render TOP](#render-top)

---

## Required Components

- Geometry COMP (contains SOP/POP)
- Camera COMP
- Light COMP (optional for some materials)
- Render TOP
- Material (optional, default assigned if none)

```python
# Minimal setup
cam = op.TDAPI.CreateOp(base, cameraCOMP, 'cam1', x=0, y=0)
light = op.TDAPI.CreateOp(base, lightCOMP, 'light1', x=200, y=0)
geo, in_sop, out_sop = op.TDAPI.CreateGeometryComp(base, 'geo1', x=400, y=0)
render = op.TDAPI.CreateOp(base, renderTOP, 'render1', x=600, y=0)

render.par.camera = 'cam1'
render.par.geometry = 'geo1'
render.par.lights = 'light1'
```

---

## Camera

### Create Camera

```python
cam = op.TDAPI.CreateOp(base, cameraCOMP, 'cam1', x=0, y=0)
```

### Key Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `tx/ty/tz` | 0, 0, 5 | Position |
| `rx/ry/rz` | 0, 0, 0 | Rotation |
| `projection` | `perspective` | `perspective` / `orthographic` |
| `fov` | 45.0 | Field of view (perspective) |
| `orthowidth` | 2.0 | Width (orthographic) |
| `near` | 0.1 | Near clipping plane |
| `far` | 1000.0 | Far clipping plane |

### Common Setups

```python
# Top-down view
cam.par.tx, cam.par.ty, cam.par.tz = 0, 10, 0
cam.par.rx = -90

# Front view (default)
cam.par.tz = 5

# Orthographic
cam.par.projection = 'orthographic'
cam.par.orthowidth = 4
```

---

## Light

### Light Types

| Type | Description |
|------|-------------|
| `point` | Omnidirectional (default) |
| `cone` | Spotlight with cone angle |
| `distant` | Parallel rays (like sun) |

### Create Light

```python
light = op.TDAPI.CreateOp(base, lightCOMP, 'light1', x=0, y=0)
light.par.tx, light.par.ty, light.par.tz = 5, 5, 5
```

### Key Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `lighttype` | `point` | `point` / `cone` / `distant` |
| `dimmer` | 1.0 | Brightness (0-1+) |
| `lightcolorr/g/b` | 1, 1, 1 | Light color |
| `coneangle` | 10.0 | Spotlight cone angle |
| `conedelta` | 3.0 | Soft edge width |
| `attenuated` | False | Distance falloff |
| `shadowtype` | `off` | `off` / `hard` / `soft` |

### Ambient Light

```python
ambient = op.TDAPI.CreateOp(base, ambientlightCOMP, 'ambient1', x=0, y=0)
ambient.par.dimmer = 0.2
```

---

## Material

### Material Types

| MAT | Use Case |
|-----|----------|
| `pbrMAT` | Physically-based rendering (recommended) |
| `phongMAT` | Classic lighting model |
| `constantMAT` | Flat color, no lighting |

### Assign to Geometry COMP

```python
# Method 1: Parameter
geo.par.material = 'pbr1'

# Method 2: Material SOP (inside Geometry COMP)
mat_sop = op.TDAPI.CreateOp(geo, materialSOP, 'material1', x=0, y=-100)
mat_sop.par.mat = '../pbr1'  # Relative path to parent
```

### PBR MAT

```python
pbr = op.TDAPI.CreateOp(base, pbrMAT, 'pbr1', x=0, y=0)
pbr.par.basecolorr = 0.8
pbr.par.basecolorg = 0.2
pbr.par.basecolorb = 0.2
pbr.par.metallic = 0.0      # 0=dielectric, 1=metal
pbr.par.roughness = 0.5     # 0=smooth, 1=rough
```

### Phong MAT

```python
phong = op.TDAPI.CreateOp(base, phongMAT, 'phong1', x=0, y=0)
phong.par.diffr, phong.par.diffg, phong.par.diffb = 0.7, 0.7, 0.7
phong.par.specr, phong.par.specg, phong.par.specb = 0.3, 0.3, 0.3
phong.par.shine = 24  # Shininess
```

### Constant MAT (No Lighting)

```python
const = op.TDAPI.CreateOp(base, constantMAT, 'const1', x=0, y=0)
const.par.colorr, const.par.colorg, const.par.colorb = 1, 0, 0
```

---

## Render TOP

### Key Parameters

| Parameter | Description |
|-----------|-------------|
| `camera` | Camera COMP path |
| `geometry` | Geometry COMP path(s) |
| `lights` | Light COMP path(s) |
| `resolutionw/h` | Output resolution |

### Multiple Geometry/Lights

Use pattern matching (wildcards) to select multiple objects:

```python
# Pattern matching (common)
render.par.geometry = 'geo*'           # All geo1, geo2, geo3...
render.par.lights = 'light*'           # All lights
render.par.geometry = 'env_* prop_*'   # Multiple patterns (space = OR)
render.par.geometry = '* ^debug_*'     # All except debug objects

# Individual names (for specific control)
render.par.geometry = 'hero_geo'
render.par.lights = 'key_light rim_light'
render.par.camera = 'cam_closeup'
```

See [Pattern Matching](basics.md#pattern-matching) for full syntax.
