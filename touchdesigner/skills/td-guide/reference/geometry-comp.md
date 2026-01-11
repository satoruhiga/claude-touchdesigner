# Geometry COMP Reference

## Contents

1. [Geometry COMP Pattern](#geometry-comp-pattern-sop-and-pop)
2. [Setup Pattern](#setup-pattern-full-example)
3. [DO NOT: Common Mistakes](#do-not-common-mistakes-to-avoid)
4. [Correct Pattern](#correct-pattern)
5. [Instancing](#instancing)

---

## Geometry COMP Pattern (SOP and POP)

Use `CreateGeometryComp` - it handles default torus removal and In/Out setup automatically:

```python
# SOP version - auto-detects family from input_op
geo, in_sop, out_sop = op.TDAPI.CreateGeometryComp(base, 'geo1', input_op=external_sop, x=0, y=0)

# POP version - same API, auto-detects POP family
geo, in_pop, out_pop = op.TDAPI.CreateGeometryComp(base, 'geo1', input_op=external_pop, x=0, y=0)

# Without input connection
geo, in_op, out_op = op.TDAPI.CreateGeometryComp(base, 'geo1', x=0, y=0)
```

---

## Setup Pattern (Full Example)

```python
# CreateGeometryComp handles everything:
# - Creates Geometry COMP
# - Removes default torus
# - Creates In/Out (SOP or POP based on input_op family)
# - Sets viewer=True, display=True, render=True on out_op
# - Connects input_op if provided
geo, in_sop, out_sop = op.TDAPI.CreateGeometryComp(base, 'geo1', input_op=some_sop, x=0, y=0)
```

---

## DO NOT: Common Mistakes to Avoid

**These patterns cause debugging nightmares. NEVER do these.**

### DO NOT: Use RAW API for Geometry COMP

```python
# BAD - Don't do this!
geo = base.create(geometryCOMP, 'geo1')
geo.viewer = True
for child in geo.children:
    child.destroy()
in_sop = geo.create(inSOP, 'in1')
out_sop = geo.create(outSOP, 'out1')
# ... tedious manual setup
```

**Why it's bad**: Error-prone, verbose, easy to forget steps (viewer, display, render flags). Use `CreateGeometryComp` instead.

### DO NOT: Create geometry inside Geometry COMP

```python
# BAD - Don't do this!
geo, in_pop, out_pop = op.TDAPI.CreateGeometryComp(base, 'geo1', x=0, y=0)
box = op.TDAPI.CreateOp(geo, boxPOP, 'box1', x=0, y=0)  # WRONG!
```

**Why it's bad**: Can't see what's happening without entering COMP. Network structure becomes unclear from parent level.

### DO NOT: Reference parent operators from inside Geometry COMP

```python
# BAD - Don't do this!
# Inside geo1:
choptopop1.par.chop = '../null1'  # WRONG!
```

**Why it's bad**: Creates hidden dependencies. Harder to trace data flow.

---

## Correct Pattern

**Solution**: Prepare shapes at parent level, pass via In/Out, use relative paths.

```python
# GOOD: shape at parent level
box = op.TDAPI.CreateOp(base, boxPOP, 'box1', x=0, y=0)
null_box = op.TDAPI.CreateOp(base, nullPOP, 'null_box', x=200, y=0)
null_box.inputConnectors[0].connect(box)

# CreateGeometryComp auto-detects POP family from null_box
geo, in_pop, out_pop = op.TDAPI.CreateGeometryComp(base, 'geo1', input_op=null_box, x=400, y=0)
geo.par.instanceop = 'null_chop'  # Relative path
```

---

## Instancing

Geometry COMP supports instancing to render multiple copies efficiently. The `instanceop` parameter accepts various OP types: **CHOP, SOP, POP, TOP, DAT**.

### Basic Example (CHOP)

```python
# 1. Create points (e.g., Grid SOP, Sphere SOP, etc.)
# 2. Null SOP
# 3. SOP to CHOP
sop2chop.par.sop = 'null1'

# 4. Enable instancing on Geometry COMP
geo.par.instancing = True  # Don't forget!
geo.par.instanceop = 'sopto1'
geo.par.instancetx = 'tx'
geo.par.instancety = 'ty'
geo.par.instancetz = 'tz'
```

### Instance Attribute Names by OP Type

| OP Type | Attribute Names | Notes |
|---------|-----------------|-------|
| **CHOP** | Channel names: `tx`, `ty`, `tz`, etc. | Most common pattern |
| **SOP** | `P(0)`, `P(1)`, `P(2)` for position, or custom attributes | Point attributes |
| **POP** | `P(0)`, `P(1)`, `P(2)` for position, or custom attributes | Same as SOP |
| **DAT** | First row values (column headers) | e.g., `tx`, `ty`, `tz` in first row |
| **TOP** | `r`, `g`, `b`, `a` for RGBA channels | Each pixel = one instance |

### Examples by OP Type

```python
# CHOP: use channel names
geo.par.instanceop = 'noise_chop'
geo.par.instancetx = 'tx'

# SOP/POP: use P(n) for position
geo.par.instanceop = 'grid_sop'
geo.par.instancetx = 'P(0)'  # X position
geo.par.instancety = 'P(1)'  # Y position
geo.par.instancetz = 'P(2)'  # Z position

# DAT: use column header names from first row
geo.par.instanceop = 'table_dat'
geo.par.instancetx = 'tx'  # column named 'tx'

# TOP: use r/g/b/a for color channels
geo.par.instanceop = 'noise_top'
geo.par.instancetx = 'r'
geo.par.instancety = 'g'
geo.par.instancetz = 'b'
```

### Mixed Data Sources

You can use different OPs for different attributes:

```python
geo.par.instanceop = 'pos_chop'      # Position from CHOP
geo.par.instancetx = 'tx'
geo.par.instancecolorop = 'color_top' # Color from TOP
geo.par.instancecolorr = 'r'
```

**Common mistake**: Forgetting to set `geo.par.instancing = True`
