# Rendering Reference

## Contents

1. [Required Components](#required-components)
2. [Camera](#camera)
3. [Light](#light)
4. [Material](#material)
5. [Render TOP](#render-top)
6. [Save Image](#save-image)

---

## Required Components

- Geometry COMP (contains SOP/POP)
- Camera COMP
- Light COMP (optional for some materials)
- Render TOP
- Material (optional, default assigned if none)

```python
# Minimal setup
cam = base.create(cameraCOMP, 'cam1')
light = base.create(lightCOMP, 'light1')
geo = base.create(geometryCOMP, 'geo1')
render = base.create(renderTOP, 'render1')

render.par.camera = 'cam1'
render.par.geometry = 'geo1'
render.par.lights = 'light1'
```

---

## Camera

### Create Camera

```python
cam = base.create(cameraCOMP, 'cam1')
cam.viewer = True
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
light = base.create(lightCOMP, 'light1')
light.viewer = True

# Position
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
ambient = base.create(ambientlightCOMP, 'ambient1')
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
mat_sop = geo.create(materialSOP, 'material1')
mat_sop.par.mat = '../pbr1'  # Relative path to parent
```

### PBR MAT

```python
pbr = base.create(pbrMAT, 'pbr1')

# Key parameters
pbr.par.basecolorr = 0.8
pbr.par.basecolorg = 0.2
pbr.par.basecolorb = 0.2
pbr.par.metallic = 0.0      # 0=dielectric, 1=metal
pbr.par.roughness = 0.5     # 0=smooth, 1=rough
```

### Phong MAT

```python
phong = base.create(phongMAT, 'phong1')

# Key parameters
phong.par.diffr, phong.par.diffg, phong.par.diffb = 0.7, 0.7, 0.7
phong.par.specr, phong.par.specg, phong.par.specb = 0.3, 0.3, 0.3
phong.par.shine = 24  # Shininess
```

### Constant MAT (No Lighting)

```python
const = base.create(constantMAT, 'const1')
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

---

## Save Image

```python
import tempfile, os

# Reuse same filename to avoid disk bloat
PREVIEW_PATH = os.path.join(tempfile.gettempdir(), 'td_preview.jpg')
op('/project1/render1').save(PREVIEW_PATH)

# Clean up after
os.remove(PREVIEW_PATH)
```
