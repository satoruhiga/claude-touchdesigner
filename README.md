# TouchDesigner Plugin for Claude Code

A Claude Code plugin that enables AI-assisted TouchDesigner network creation and manipulation via MCP (Model Context Protocol).

## Features

- **Execute Python in TouchDesigner** - Run Python code directly in your TD project
- **Query Editor State** - Get current network path, selection, and operator info
- **Operator Management** - Create, connect, and layout operators with best practices
- **Skill-based Guidance** - Built-in patterns for rendering, GLSL, instancing, and more

## Installation

### 1. Install the Claude Code Plugin

```bash
# Add marketplace
/plugin marketplace add satoruhiga/claude-touchdesigner

# Install plugin
/plugin install touchdesigner@satoruhiga-claude-touchdesigner
```

### 2. Load the TOX in TouchDesigner

1. Open your TouchDesigner project
2. Drag and drop `toe/TouchDesignerAPI.tox` anywhere in your project
3. The MCP server will start automatically

### 3. Verify Connection

In Claude Code, run `/touchdesigner` to load the skill, then try:

```
Create a Grid SOP with noise
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `td_execute` | Run Python code in TouchDesigner |
| `td_pane` | Get current network editor state |
| `td_selection` | Get selected operators |
| `td_operators` | List operators at a path |

## Skills

The plugin includes a `td-guide` skill with reference documentation for:

- Operator families (SOP, POP, TOP, CHOP, DAT, COMP)
- Network layout patterns
- Geometry COMP and instancing
- Rendering setup (Camera, Light, Render TOP)
- GLSL shaders (TOP, MAT, POP)
- Feedback loops and simulations

## Configuration

### Port Settings

By default, the MCP server connects to TouchDesigner on port `44444`. You can change this using the `TDAPI_PORT` environment variable.

**macOS / Linux:**
```bash
TDAPI_PORT=12345 claude
```

**Windows (Command Prompt):**
```cmd
set TDAPI_PORT=12345
claude
```

**Windows (PowerShell):**
```powershell
$env:TDAPI_PORT="12345"
claude
```

To set the port permanently on Windows, add `TDAPI_PORT` to System Environment Variables:
1. Open **Settings** > **System** > **About** > **Advanced system settings**
2. Click **Environment Variables**
3. Under User or System variables, click **New**
4. Set Variable name: `TDAPI_PORT`, Variable value: your port number

The port must match the `Port` parameter in the `TouchDesignerAPI.tox` component inside TouchDesigner.

## Requirements

- TouchDesigner 2025 or later
- Claude Code CLI
- Node.js (for MCP server)

## License

MIT
