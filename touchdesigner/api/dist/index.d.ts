/**
 * TouchDesigner HTTP API Client
 */
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
export declare class TDClient {
    private baseUrl;
    constructor(options?: TDClientOptions);
    /** Execute Python code in TouchDesigner */
    execute(code: string, fromOp?: string): Promise<ExecuteResult>;
    /** Get current pane state (network path, position, zoom) */
    getPaneState(): Promise<PaneState | null>;
    /** Get currently selected operators */
    getSelection(): Promise<SelectionResult>;
    /** Get operators at specified path */
    getOperators(path?: string): Promise<OperatorsResult>;
}
