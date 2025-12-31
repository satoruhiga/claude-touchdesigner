# GLSL Reference

## Contents

1. [Usage](#usage) - Uniforms, Built-in Uniforms, Update Shader
2. [TOP](#top) - glslTOP, Pixel Shader, Compute Shader
3. [MAT](#mat) - glslMAT, Vertex Shader
4. [POP](#pop) - glslPOP, glsladvancedPOP, glslcopyPOP

---

## Usage

### Uniforms

```
TouchDesigner          GLSL
─────────────────────────────
vec0name = 'uTime'  →  uniform float uTime;
vec0valuex = 1.0    →  uTime value
```

### Pass Time

```python
glsl_op = op('/project1/glsl1')
glsl_op.par.vec0name = 'uTime'
glsl_op.par.vec0valuex.mode = ParMode.EXPRESSION
glsl_op.par.vec0valuex.expr = 'absTime.seconds'
```

```glsl
uniform float uTime;
void main() {
    float t = uTime * 0.5;
}
```

### Built-in Uniforms (TOP)

**Output Info (always available):**

```glsl
// Output resolution
vec2 res = uTDOutputInfo.res.zw;  // width, height
float aspect = res.x / res.y;
```

**Input Info (only when inputs connected):**

```glsl
// Input texture resolution (requires input)
vec2 inputRes = uTD2DInfos[0].res.zw;

// Input sampler
vec4 color = texture(sTD2DInputs[0], vUV.st);
```

**Common Varyings:**

| Varying | Description |
|---------|-------------|
| `vUV.st` | Texture coordinates (0-1) |
| `vUV.zw` | Additional UV data |

**IMPORTANT:** `uTD2DInfos` requires input textures. For standalone shaders (e.g., raymarching), use `uTDOutputInfo` instead.

### Update Shader

```python
op('/project1/glsl1_pixel').text = shader_code
op('/project1/glsl1').cook(force=True)
```

### Check Errors

```python
print(op('/project1/glsl1_info').text)
```

---

## TOP

### glslTOP

Created automatically:
- `glsl1` - Main operator
- `glsl1_pixel` - Pixel shader (textDAT)
- `glsl1_compute` - Compute shader (textDAT)
- `glsl1_info` - Compile info

| Parameter | Label | DAT |
|-----------|-------|-----|
| `predat` | Preprocess Directives | (optional) |
| `vertexdat` | Vertex Shader | (optional) |
| `pixeldat` | Pixel Shader | `glsl1_pixel` |
| `computedat` | Compute Shader | `glsl1_compute` |

### Pixel Shader

```glsl
out vec4 fragColor;
void main()
{
    vec4 color = texture(sTD2DInputs[0], vUV.st);
    fragColor = TDOutputSwizzle(color);
}
```

### Compute Shader

```glsl
layout (local_size_x = 8, local_size_y = 8) in;

void main()
{
    vec4 color = texelFetch(sTD2DInputs[0], ivec2(gl_GlobalInvocationID.xy), 0);
    TDImageStoreOutput(0, gl_GlobalInvocationID, color);
}
```

**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `outputaccess` | `writeonly` / `readonly` / `readwrite` |
| `dispatchsizex/y/z` | Dispatch size (work groups) |

**Built-in Variables:**

| Variable | Description |
|----------|-------------|
| `gl_GlobalInvocationID` | Global thread ID (uvec3) |
| `gl_LocalInvocationID` | Local thread ID within work group |
| `gl_WorkGroupID` | Work group ID |

**Input/Output:**

```glsl
// Read from input
vec4 color = texelFetch(sTD2DInputs[0], ivec2(gl_GlobalInvocationID.xy), 0);

// Write (handles sRGB correctly)
TDImageStoreOutput(0, gl_GlobalInvocationID, color);

// Direct imageStore (no sRGB conversion)
imageStore(mTDComputeOutputs[0], ivec2(gl_GlobalInvocationID.xy), color);
```

---

## MAT

### glslMAT

Created automatically:
- `glslmat1` - Main
- `glslmat1_vertex` - Vertex shader (textDAT)
- `glslmat1_pixel` - Pixel shader (textDAT)
- `glslmat1_info` - Compile info

| Parameter | Label | DAT |
|-----------|-------|-----|
| `predat` | Preprocess Directives | (optional) |
| `vdat` | Vertex Shader | `glslmat1_vertex` |
| `pdat` | Pixel Shader | `glslmat1_pixel` |
| `gdat` | Geometry Shader | (optional) |

**Note:** GLSL MAT uses `vdat`/`pdat`, while GLSL TOP uses `vertexdat`/`pixeldat`.

### Vertex Shader

```glsl
uniform float uTime;
void main() {
    vec3 pos = TDPos();
    pos.z += sin(pos.x * 3.0 + uTime) * 0.2;
    vec4 worldSpacePos = TDDeform(pos);
    gl_Position = TDWorldToProj(worldSpacePos);
}
```

**TD Functions:**

| Function | Description |
|----------|-------------|
| `TDPos()` | Get vertex position |
| `TDDeform(pos)` | Apply deformation (instance-aware) |
| `TDWorldToProj(worldPos)` | World to projection space |

---

## POP

### glslPOP

- `glsl1` - Main
- `glsl1_compute` - Compute shader (textDAT)
- `glsl1_info` - Compile info

| Parameter | Label | DAT |
|-----------|-------|-----|
| `computedat` | Compute Shader | `glsl1_compute` |

### glsladvancedPOP

- `glsladv1` - Main
- `glsladv1_compute` - Compute shader (textDAT)
- `glsladv1_info` - Compile info

| Parameter | Label | DAT |
|-----------|-------|-----|
| `computedat` | Compute Shader | `glsladv1_compute` |

### glslcopyPOP

- `glslcopy1` - Main
- `glslcopy1_ptCompute` - Points compute (textDAT)
- `glslcopy1_vertCompute` - Verts compute (textDAT)
- `glslcopy1_primCompute` - Prim compute (textDAT)
- `glslcopy1_info` - Compile info

| Parameter | Label | DAT |
|-----------|-------|-----|
| `ptcomputedat` | Points Compute Shader | `glslcopy1_ptCompute` |
| `vertcomputedat` | Verts Compute Shader | `glslcopy1_vertCompute` |
| `primcomputedat` | Prim Compute Shader | `glslcopy1_primCompute` |
