---
name: touchdesigner
description: Provides patterns and best practices for TouchDesigner via MCP API - operator creation, network layout, rendering, GLSL shaders, data conversion (CHOP/SOP/POP/TOP/DAT). Use when working with TouchDesigner networks.
version: 0.1.0
---

# TouchDesigner Guide

Use this skill when creating, modifying, or debugging TouchDesigner networks via the MCP API.

---

## CRITICAL: Your Prior Knowledge is Unreliable

TouchDesigner is a visual programming environment. **Your pre-trained knowledge about TD is very likely incorrect.**

**Assume your memory is completely unreliable.** Always gather accurate information first:
- This document and reference files
- Context7 for official TD API documentation
- `op.TDAPI.GetParameterList()` for parameter names

### Before Starting ANY Task

**Output "Gathering information first" and collect reliable information before implementation.**

1. Read all `.md` files in `reference/` (REQUIRED for all tasks)
2. Verify parameter names using `op.TDAPI.GetParameterList()`
3. Ask yourself: "Do I have sufficient reliable information to proceed?"
4. Only if yes, start implementation

---

## REQUIRED: Read All Reference Files First

**You MUST read all `.md` files in `reference/` before any implementation.**

These files contain essential patterns for operator creation, layout, error handling, and best practices that differ from standard TD API.

---

## op.TDAPI - ALWAYS USE THESE

**You MUST use `op.TDAPI` utilities instead of raw TD API.**

### Create Operators

```python
# ALWAYS use CreateOp (auto sets viewer=True, handles docked operators)
new_op = op.TDAPI.CreateOp(base, gridSOP, 'grid1', x=0, y=0)

# DON'T use raw API directly
# new_op = base.create(gridSOP, 'grid1')  # WRONG - misses viewer, docked handling
```

### Chain Operators

```python
# Auto-connects and layouts with 200px spacing
chain = op.TDAPI.ChainOperators([grid, noise, null])
```

### Check Errors

```python
# Pass op() object, NOT string path
op.TDAPI.CheckErrors(op('/project1/base1'), recurse=True)

# IMPORTANT: Error cache updates on frame boundaries
# After fixing, check in SEPARATE td_execute call:
#   td_execute 1: Fix the error
#   td_execute 2: cook + CheckErrors
```

### Verify Parameters Before Setting

```python
# TD parameter names are unpredictable (e.g., radius vs radx/rady/radz)
# ALWAYS check first using GetParameterList:
params = op.TDAPI.GetParameterList('sphereSOP')
print(params)  # ['radx', 'rady', 'radz', ...]
```

---

## Reference Files

| When working on... | Read... |
|-------------------|------------------|
| **ALL tasks** | **`reference/basics.md`** (REQUIRED) |
| Operator families, data conversion | `reference/operator-families.md` |
| Geometry COMP, Instancing | `reference/geometry-comp.md` |
| Rendering, Camera, Light | `reference/rendering.md` |
| GLSL TOP/MAT, shaders | `reference/glsl.md` |
| Feedback loops, simulations | `reference/operator-tips.md` |

---

## External Resources

**Use Context7** to look up official TouchDesigner API documentation when you need:
- Operator types and their parameters
- Python API details (td module, Op class, etc.)
- Built-in functions and classes

This skill provides TD-specific patterns and best practices. Context7 provides official API reference.

## Before Implementation

**Consider multiple approaches before coding.**

1. List 2-3 different ways to achieve the goal
2. Evaluate each approach's pros and cons:
   - Simplicity (fewer conversions, family unity)
   - Performance (GPU vs CPU, data flow efficiency)
   - Extensibility (easy to modify later)
   - Readability (network clarity)
3. Choose the most effective approach based on the evaluation

Example: "Create instanced particles in a sphere shape"

| Approach | Pros | Cons |
|----------|------|------|
| A: Sphere SOP → soptoCHOP → Geo + POP | Familiar pattern | Mixed families, extra conversion |
| B: Sphere POP → Null → Geo(In/Out POP) | POP unified, direct data flow | Less familiar |
| C: Sphere POP → poptoCHOP → instancing | Flexible positioning | Extra conversion step |

→ Choose B: unified family, efficient data flow, clean network structure

## Required Rules

1. **Always set `viewer = True`** after creating operators (matches UI default)
2. **Always check errors** after complex operations: `op('/path').errors(recurse=True)`
3. **Use Null as intermediary** before any reference connection
4. **Verify layout before creating** to avoid overlapping operators
5. **Use relative paths** for references to nearby operators (same level or close hierarchy)
6. **Geometry COMP: create shapes at parent level** - Don't create geometry inside COMP; prepare at parent and pass via In/Out

## MCP Tools Available

- `td_execute`: Run Python code in TD
- `td_pane`: Get current network editor state
- `td_selection`: Get selected operators
- `td_operators`: List operators at path

## Plugin Assets

- TOX: `${SKILL_BASE}/../../toe/TouchDesignerAPI.tox`

---

## Operator Families (Quick Reference)

| Family | Purpose | Data Type |
|--------|---------|-----------|
| **SOP** | Surface/Geometry | 3D geometry (CPU) |
| **POP** | Point/Particle | 3D points (GPU) |
| **TOP** | Texture | 2D images |
| **CHOP** | Channel | Time-based data |
| **DAT** | Data | Tables, text |
| **COMP** | Component | Containers, scenes |

For detailed family info, operator lists, and cross-family patterns, see `reference/operator-families.md`.

---

## Skill Maintenance

When the user provides feedback about this skill (corrections, improvements, missing patterns, etc.):

1. Propose updates to the relevant `.md` files in this skill
2. Show the user the proposed changes before applying
3. Update `SKILL.md` or `reference/*.md` as appropriate

This ensures the skill stays accurate and improves over time based on real usage.
