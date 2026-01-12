/**
 * TouchDesigner HTTP API Client
 */

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface ExecuteResult {
  success: boolean;
  stdout: string;
  stderr: string;
  from_op: string;
  error?: {
    type: string;
    message: string;
  };
}

export interface PaneState {
  networkPath: string;
  x: number;
  y: number;
  zoom: number;
}

export interface OperatorInfo {
  path?: string;
  name: string;
  type: string;
  opType: string;
  family?: string;
}

export interface SelectionResult {
  operators: OperatorInfo[];
}

export interface OperatorsResult {
  path: string;
  operators: OperatorInfo[];
}

export interface TDClientOptions {
  host?: string;
  port?: number;
}

// -----------------------------------------------------------------------------
// TDClient
// -----------------------------------------------------------------------------

export class TDClient {
  private baseUrl: string;

  constructor(options: TDClientOptions = {}) {
    const host = options.host ?? "localhost";
    const port =
      options.port ?? parseInt(process.env.TDAPI_PORT ?? "55555", 10);
    this.baseUrl = `http://${host}:${port}`;
  }

  /** Execute Python code in TouchDesigner */
  async execute(code: string, fromOp: string = "/"): Promise<ExecuteResult> {
    let url = `${this.baseUrl}/execute`;
    if (fromOp !== "/") {
      url += `?from_op=${encodeURIComponent(fromOp)}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: code,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /** Get current pane state (network path, position, zoom) */
  async getPaneState(): Promise<PaneState | null> {
    const response = await fetch(`${this.baseUrl}/editor/pane`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /** Get currently selected operators */
  async getSelection(): Promise<SelectionResult> {
    const response = await fetch(`${this.baseUrl}/editor/selection`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /** Get operators at specified path */
  async getOperators(path: string = "/"): Promise<OperatorsResult> {
    const url = `${this.baseUrl}/operators?path=${encodeURIComponent(path)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
}
