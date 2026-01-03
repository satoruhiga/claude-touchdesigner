---
name: touchdesigner
description: Provides patterns and best practices for TouchDesigner via MCP API - operator creation, network layout, rendering, GLSL shaders, data conversion (CHOP/SOP/POP/TOP/DAT). Use when working with TouchDesigner networks.
version: 0.1.0
---

# TouchDesigner Guide

@reference/basics.md

Use this skill when creating, modifying, or debugging TouchDesigner networks via the MCP API.

---

## MANDATORY: Read Reference Files Before Implementation

**You MUST read the corresponding reference file(s) before working on any topic.**

This is NOT optional. Skipping this step will result in incorrect patterns and wasted effort.

| When working on... | You MUST read... |
|-------------------|------------------|
| Choosing operators, understanding families, data conversion | `reference/operator-families.md` |
| Creating/connecting operators, network layout, positioning | `reference/basics.md` |
| Geometry COMP setup, In/Out patterns, Instancing | `reference/geometry-comp.md` |
| Rendering, Camera, Light | `reference/rendering.md` |
| GLSL TOP/MAT, shaders, uniforms | `reference/glsl.md` |
| Feedback loops, simulations, trails | `reference/operator-tips.md` |

**Multiple topics?** Read all relevant files.

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
