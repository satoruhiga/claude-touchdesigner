/**
 * TouchDesigner HTTP API Client
 */
// -----------------------------------------------------------------------------
// TDClient
// -----------------------------------------------------------------------------
export class TDClient {
    baseUrl;
    constructor(options = {}) {
        const host = options.host ?? "localhost";
        const port = options.port ?? 9980;
        this.baseUrl = `http://${host}:${port}`;
    }
    /** Execute Python code in TouchDesigner */
    async execute(code, fromOp = "/") {
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
    async getPaneState() {
        const response = await fetch(`${this.baseUrl}/editor/pane`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }
    /** Get currently selected operators */
    async getSelection() {
        const response = await fetch(`${this.baseUrl}/editor/selection`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }
    /** Get operators at specified path */
    async getOperators(path = "/") {
        const url = `${this.baseUrl}/operators?path=${encodeURIComponent(path)}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }
}
