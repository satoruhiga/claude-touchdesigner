# GLSL Reference

## Contents

1. [Usage](#usage) - Uniforms, Built-in Uniforms, Update Shader
2. [Built-in Utility Functions](#built-in-utility-functions) - Noise, Color, Matrix
3. [TOP](#top) - glslTOP, Pixel Shader, Compute Shader
4. [MAT](#mat) - glslMAT, Vertex Shader
5. [POP](#pop) - glslPOP, glsladvancedPOP, glslcopyPOP

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

## Built-in Utility Functions

TouchDesigner provides built-in GLSL utility functions. No includes needed.

### Noise

```glsl
float TDPerlinNoise(vec2 v);
float TDPerlinNoise(vec3 v);
float TDPerlinNoise(vec4 v);

float TDSimplexNoise(vec2 v);
float TDSimplexNoise(vec3 v);
float TDSimplexNoise(vec4 v);
```

### Color Conversion

```glsl
vec3 TDHSVToRGB(vec3 c);
vec3 TDRGBToHSV(vec3 c);
```

### Matrix Transforms

```glsl
// Translation
mat4 TDTranslate(float x, float y, float z);

// Rotation (radians)
mat3 TDRotateX(float radians);
mat3 TDRotateY(float radians);
mat3 TDRotateZ(float radians);

// Rotation around axis (axis must be normalized)
mat3 TDRotateOnAxis(float radians, vec3 axis);

// Scale
mat3 TDScale(float x, float y, float z);

// Rotate from +Z to forward direction (vectors don't need normalization)
mat3 TDRotateToVector(vec3 forward, vec3 up);

// Rotate from vector to vector (vectors must be normalized)
mat3 TDCreateRotMatrix(vec3 from, vec3 to);
```

### TDTexInfo (Resolution Access)

```glsl
struct TDTexInfo {
  vec4 res;   // (1/width, 1/height, width, height)
  vec4 depth; // (1/depth, depth, depthOffset, -)
};

// Usage
vec2 inputSize = uTD2DInfos[0].res.zw;    // Input texture size
vec2 outputSize = uTDOutputInfo.res.zw;   // Output size
```

### Compute Shader Output

```glsl
// Write to output (handles sRGB correctly)
void TDImageStoreOutput(uint index, uvec3 coord, vec4 color);

// Read from output (for read-write access)
vec4 TDImageLoadOutput(uint index, uvec3 coord);
```

### Instancing (MAT only)

```glsl
int TDInstanceID();  // Returns current instance ID (0-based)
```

**IMPORTANT:** Instancing in GLSL MAT is complex (instance transforms, colors, textures, custom attributes, skinning, etc.).

**You MUST read [Write a GLSL Material](https://docs.derivative.ca/Write_a_GLSL_Material) before implementing instancing.**

### Documentation

For complete list and details, see:
- [Write a GLSL TOP](https://docs.derivative.ca/Write_a_GLSL_TOP)
- [Write a GLSL Material](https://docs.derivative.ca/Write_a_GLSL_Material)

Or use Context7 to look up specific functions.

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
