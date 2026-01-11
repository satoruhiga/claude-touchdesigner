# Basics Reference

## Contents

1. [Coordinate System](#coordinate-system)
2. [Basic Operations](#basic-operations)
3. [op.TDAPI Reference](#optdapi-reference)
4. [Pattern Matching](#pattern-matching)
5. [Network Design Patterns](#network-design-patterns)
6. [Debugging](#debugging)
7. [Saving Data](#saving-data)

---

## Coordinate System

OpenGL (right-handed): Y-up, Z toward camera, SRT order default.

---

## Basic Operations

### Create Operator

**Always use `op.TDAPI.CreateOp()` instead of raw API.**

```python
new_op = op.TDAPI.CreateOp(base, glslTOP, 'glsl1', x=0, y=0)
```

**Why CreateOp:**
- **Auto `viewer = True`** - Matches UI-created operator behavior
- **Docked operator handling** - GLSL TOP/MAT create associated DATs (_pixel, _vertex, etc.). CreateOp uses MoveOp internally, which moves docked operators together. Raw `nodeX`/`nodeY` assignment leaves docked operators behind.

**Name auto-increment:** If an operator with the same name exists, TD automatically increments the number (e.g., `null1` → `null2`). Always check the returned operator's `.name` if you need the actual name.

### Connect

```python
# Single connection
op('noise1').inputConnectors[0].connect(op('sphere1'))

# Chain multiple operators (same family only, auto-layout 200px spacing)
chain = op.TDAPI.ChainOperators([grid, noise, null])
```

### Parameters

```python
op('mysphere').par.frequency = 10

# Expression mode
op('mysphere').par.tx.mode = ParMode.EXPRESSION
op('mysphere').par.tx.expr = 'absTime.seconds'
```

### Display/Render Flags (SOP)

```python
op('out1').display = True
op('out1').render = True
```

### Position

```python
op('sphere1').nodeX = 0
op('sphere1').nodeY = 0
```

### Data Access

```python
# CHOP
chop = op('sopto1')
chop.numSamples
chop.chan('tx')[0]      # Single value
chop.chan('tx').vals    # All values

# DAT
dat = op('text1')
dat.text                # Full text
dat.text = 'new'        # Set text
dat[0, 0].val           # Cell value
```

### Find Parameters

**Always verify parameter names before setting them.** TD parameter names are often unpredictable (e.g., `radius` vs `radx/rady/radz`).

```python
# Check parameters before setting
sphere = op('/project1/base1/sphere1')
print([p.name for p in sphere.pars() if 'rad' in p.name.lower()])
# Output: ['radx', 'rady', 'radz']

# Or use TDAPI helper
params = op.TDAPI.GetParameterList('sphereSOP')
```

```python
# Search for specific parameter patterns
for p in op('glsl1').pars():
    if 'vec' in p.name.lower():
        print(f"{p.name}: {p.val}")
```

---

## op.TDAPI Reference

Utility functions accessible via `op.TDAPI.MethodName()`.

### AABB Class

Bounding box type (NamedTuple):

```python
class AABB(NamedTuple):
    min_x: int
    min_y: int
    max_x: int
    max_y: int

    @property
    def width(self) -> int: ...
    @property
    def height(self) -> int: ...
    @property
    def x(self) -> int: ...  # = min_x
    @property
    def y(self) -> int: ...  # = min_y
```

### Method Signatures

```python
# Operator Creation & Movement
def CreateOp(base: OP|str, op_type: type, name: str, x: int|None = None, y: int|None = None) -> OP
def MoveOp(target: OP|str, x: int, y: int) -> OP
def CreateGeometryComp(base: OP|str, name: str, input_op: OP|None = None, x: int|None = None, y: int|None = None) -> tuple[OP, OP, OP]

# Chaining (same family only, 200px spacing)
def ChainOperators(operators: list[OP]) -> list[OP]

# Bounds & Layout
def GetBounds(target: OP|str|list[OP|str]) -> AABB
def GetAllBounds(base: OP|str) -> list[AABB]
def CheckOverlap(bounds1: AABB|list[AABB], bounds2: AABB|list[AABB]) -> bool
def FindEmptyArea(base: OP|str, width: int, height: int, start_x: int = 0, start_y: int = 0, margin: int = 50) -> tuple[int, int]
def FindTypeConversionPosition(source_op: OP|str, target_width: int, target_height: int, direction: str = 'auto', margin: int = 40) -> tuple[int, int]

# Debugging
def PrintLayout(base: OP|None = None) -> None
def CheckErrors(target: OP|str|None = None, recurse: bool = True) -> str

# Help (uses TD's built-in help data)
def GetOperatorInfo(op_type: str) -> dict|None
def GetParameterList(op_type: str) -> list[str]
def GetParameterHelp(op_type: str, param_name: str) -> dict|None
```

### Usage Examples

```python
# Create and chain operators
grid = op.TDAPI.CreateOp(base, gridSOP, 'grid1')
noise = op.TDAPI.CreateOp(base, noiseSOP, 'noise1')
null = op.TDAPI.CreateOp(base, nullSOP, 'null1')
chain = op.TDAPI.ChainOperators([grid, noise, null])

# Find empty area and move chain there
bounds = op.TDAPI.GetBounds(chain)
x, y = op.TDAPI.FindEmptyArea(base, bounds.width, bounds.height)
op.TDAPI.MoveOp(chain[0], x, y)

# Check for overlaps
all_bounds = op.TDAPI.GetAllBounds(base)
if op.TDAPI.CheckOverlap(bounds, all_bounds):
    print("Overlap detected!")

# Type conversion positioning
x, y = op.TDAPI.FindTypeConversionPosition(null, 130, 90, direction='auto')
sopto = op.TDAPI.CreateOp(base, soptoCHOP, 'sopto1', x, y)

# Debugging
op.TDAPI.PrintLayout(base)
op.TDAPI.CheckErrors(base, recurse=True)

# Get operator help
info = op.TDAPI.GetOperatorInfo('noiseSOP')
params = op.TDAPI.GetParameterList('noiseSOP')
```

---

## Pattern Matching

Many parameters accept wildcards to specify multiple operators, channels, etc.

### Wildcards

| Pattern | Matches |
|---------|---------|
| `*` | Any string (including empty) |
| `?` | Any single character |
| `[xyz]` | Any character in brackets |
| `^name` | Exclude (after other patterns) |

### Examples

```python
# Render TOP - geometry/lights parameters
render.par.geometry = 'geo*'           # All geo1, geo2, geo3...
render.par.lights = 'light*'           # All lights
render.par.geometry = 'geo* ^geo7'     # All geo* except geo7

# Find operators
ops('null*')                           # All nulls
ops('*chop*')                          # Anything with 'chop' in name

# Find parameters
op('geo1').pars('t?')                  # tx, ty, tz
op('geo1').pars('t?', 'r?', 's?')      # translate/rotate/scale
```

### Common Use Cases

```python
# Render all geometry with prefix
render.par.geometry = 'env_*'          # Environment objects
render.par.lights = 'key_* fill_*'     # Key and fill lights

# Exclude specific items
render.par.geometry = '* ^debug_*'     # All except debug objects
```

---

## Network Design Patterns

### Always Use Null as Intermediary

Before any reference, insert a Null:

```
grid1 → null1 → sopto1
render1 → null_out
```

### Use Relative Paths for References

**DO NOT use absolute paths for nearby operators.**

```python
# BAD - Breaks when moving/copying network
geo.par.instanceop = '/project1/base1/null_chop'  # WRONG!
sop2chop.par.sop = '/project1/base1/grid1'        # WRONG!

# GOOD - Use relative paths
geo.par.instanceop = 'null_chop'   # Same level
sop2chop.par.sop = 'null1'         # Same level
render.par.camera = '../cam1'      # Parent level
```

**When to use relative vs absolute:**
- Same level or nearby hierarchy → **Relative** (e.g., `null1`, `../cam1`)
- Global/shared resources → **Absolute** (e.g., `/project1/shared/texture1`)

### Layout Rules

- Data flows **left to right** (increasing X)
- COMP hierarchy flows **top to bottom**
- **Check layout before creating** to avoid overlap

### Spacing

| Direction | Spacing | Notes |
|-----------|---------|-------|
| X | 200+ | Horizontal chain |
| Y | 130+ | SOP/TOP/CHOP/DAT |
| Y | 160+ | COMP (larger) |

Use `op.TDAPI` utilities for layout management. See [op.TDAPI Reference](#optdapi-reference).

### Type Conversion: Stack Vertically

When operator type changes (SOP→CHOP), keep same X, stack Y:

```
null1 (X=200, Y=-270) [SOP]
    ↓
sopto1 (X=200, Y=-145) [CHOP] → null2 (X=400)
```

Use `FindTypeConversionPosition(source_op, width, height, direction='auto')` for automatic placement.

### Docked Operators

GLSL TOP/MAT, Script SOP create associated DATs.

- Use `MoveOp()` to move them together (handles docked automatically)
- Use `CreateOp()` with position to place correctly on creation
- `GetBounds()` includes docked operators in calculation

**Note:** Setting `nodeX`/`nodeY` directly does NOT move docked operators. Always use `MoveOp`.

---

## Debugging

### Check Errors

```python
# Using utility - pass op() object, NOT string path
op.TDAPI.CheckErrors(op('/project1/base1'), recurse=True)

# Raw TD API
err = op('/project1/base1').errors(recurse=True)
```

**IMPORTANT: Error Cache Timing**

TD updates error state on frame boundaries. When fixing errors via MCP:

1. Fix in one `td_execute` call
2. Check errors in a **separate** `td_execute` call

```python
# td_execute 1: Fix the error
const.par.value.expr = 'math.sin(absTime.seconds)'

# td_execute 2: Verify (must be separate call)
op('/project1/base1').cook(force=True)
result = op.TDAPI.CheckErrors(op('/project1/base1'), recurse=True)
```

If you check errors in the same `td_execute` as the fix, you'll see stale cached errors.

### Print Layout

```python
# Using utility (sorted by position)
op.TDAPI.PrintLayout(base)

# Raw TD API
for child in base.children:
    print(f"{child.name}: ({child.nodeX}, {child.nodeY})")
```

### List Docked Operators

```python
for d in op('glslmat1').docked:
    print(f"{d.name}: {d.opType}")
```

---

## Saving Data

Use `.save()` method to export operator data to files.

### TOP → Image

```python
import tempfile, os

# Save to temp file (reuse same filename to avoid disk bloat)
PREVIEW_PATH = os.path.join(tempfile.gettempdir(), 'td_preview.jpg')
op('/project1/render1').save(PREVIEW_PATH)

# Supported formats: .jpg, .png, .tiff, .exr, etc.
# Clean up after use
os.remove(PREVIEW_PATH)
```

### CHOP → .clip

```python
# Save channel data as .clip (text-based format)
chop = op('/project1/noise1')
chop.save(project.folder + '/noise1.clip')
```

`.clip` format stores:
- `rate` - Frame rate
- `tracklength` - Number of samples
- `tracks` - Channel count
- Per-track: `name` and `data_rle` (sample values)

### DAT → .csv / .tsv

```python
# Save table data as CSV
dat = op('/project1/table1')
dat.save(project.folder + '/table1.csv')

# Or TSV (tab-separated)
dat.save(project.folder + '/table1.tsv')
```

Output includes header row from first row of DAT.

### SOP → .obj

```python
# Save geometry as OBJ
sop = op('/project1/sphere1')
sop.save(project.folder + '/sphere1.obj')
```
