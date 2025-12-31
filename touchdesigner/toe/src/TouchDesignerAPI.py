"""TouchDesigner HTTP API Extension.

Provides a simple HTTP API for executing Python code and querying editor state.
"""

import json
import sys
from io import StringIO
from urllib.parse import unquote

import td_utils


class TouchDesignerAPI:
    """TouchDesigner HTTP API Extension."""

    def __init__(self, ownerComp):
        self.ownerComp = ownerComp

    def _debug_print(self, *args, **kwargs):
        if parent().par.Debug.eval():
            print("[TDAPI]", *args, **kwargs)

    def _send_response(self, response: dict) -> dict:
        """Log and return response."""
        self._debug_print(
            f"<<< {response.get('statusCode')} {response.get('data', '')[:200]}"
        )
        return response

    def OnHTTPRequest(self, dat, request: dict, response: dict) -> dict:
        """Handle incoming HTTP requests."""
        uri = request.get("uri", "")
        method = request.get("method", "")
        pars = request.get("pars", {})

        self._debug_print(f">>> {method} {uri}", pars if pars else "")

        response["Content-Type"] = "application/json"

        # POST /execute - Python code execution
        if uri.startswith("/execute") and method == "POST":
            return self._handle_execute(request, response)

        # GET /editor/pane - Current pane state
        if uri == "/editor/pane" and method == "GET":
            return self._handle_editor_pane(response)

        # GET /editor/selection - Selected operators
        if uri == "/editor/selection" and method == "GET":
            return self._handle_editor_selection(response)

        # GET /operators - Operators at specified path
        if uri.startswith("/operators") and method == "GET":
            path = unquote(pars.get("path", "/"))
            return self._handle_operators(path, response)

        # 404 for other endpoints
        response["statusCode"] = 404
        response["statusReason"] = "Not Found"
        response["data"] = json.dumps({"error": "Not Found"})
        return self._send_response(response)

    # -------------------------------------------------------------------------
    # POST /execute
    # -------------------------------------------------------------------------

    def _handle_execute(self, request: dict, response: dict) -> dict:
        """Handle POST /execute request."""
        pars = request.get("pars", {})
        from_op = unquote(pars.get("from_op", "/"))
        code = request.get("data", "")

        result = self._execute_python(code, from_op)

        response["statusCode"] = 200
        response["statusReason"] = "OK"
        response["data"] = json.dumps(result, ensure_ascii=False)
        return self._send_response(response)

    def _execute_python(self, code: str, from_op: str) -> dict:
        """Execute Python code and return result."""
        stdout_capture = StringIO()
        stderr_capture = StringIO()
        old_stdout, old_stderr = sys.stdout, sys.stderr

        # Resolve me
        try:
            me = op(from_op)  # type: ignore
            if me is None:
                return {
                    "success": False,
                    "stdout": "",
                    "stderr": "",
                    "from_op": from_op,
                    "error": {
                        "type": "OperatorNotFoundError",
                        "message": f"Operator not found: {from_op}",
                    },
                }
        except Exception as e:
            return {
                "success": False,
                "stdout": "",
                "stderr": "",
                "from_op": from_op,
                "error": {"type": type(e).__name__, "message": str(e)},
            }

        # Execute
        try:
            sys.stdout = stdout_capture
            sys.stderr = stderr_capture

            exec_globals = {"me": me}
            exec(code, exec_globals)

            return {
                "success": True,
                "stdout": stdout_capture.getvalue(),
                "stderr": stderr_capture.getvalue(),
                "from_op": me.path,
            }
        except Exception as e:
            return {
                "success": False,
                "stdout": stdout_capture.getvalue(),
                "stderr": stderr_capture.getvalue(),
                "from_op": from_op,
                "error": {"type": type(e).__name__, "message": str(e)},
            }
        finally:
            sys.stdout = old_stdout
            sys.stderr = old_stderr

    # -------------------------------------------------------------------------
    # GET /editor/pane
    # -------------------------------------------------------------------------

    def _handle_editor_pane(self, response: dict) -> dict:
        """Handle GET /editor/pane request."""
        try:
            pane = ui.panes.current  # type: ignore
            if (
                pane is None
                or pane.type != PaneType.NETWORKEDITOR  # type: ignore
                or pane.owner is None
            ):
                result = None
            else:
                result = {
                    "networkPath": pane.owner.path,
                    "x": pane.x,
                    "y": pane.y,
                    "zoom": pane.zoom,
                }
        except Exception as e:
            response["statusCode"] = 500
            response["statusReason"] = "Internal Server Error"
            response["data"] = json.dumps({"error": str(e)})
            return self._send_response(response)

        response["statusCode"] = 200
        response["statusReason"] = "OK"
        response["data"] = json.dumps(result)
        return self._send_response(response)

    # -------------------------------------------------------------------------
    # GET /editor/selection
    # -------------------------------------------------------------------------

    def _handle_editor_selection(self, response: dict) -> dict:
        """Handle GET /editor/selection request."""
        try:
            pane = ui.panes.current  # type: ignore
            if pane is None or pane.owner is None:
                operators = []
            else:
                operators = [
                    {
                        "path": o.path,
                        "name": o.name,
                        "type": o.type,
                        "opType": o.OPType,
                        "family": o.family,
                    }
                    for o in pane.owner.children
                    if o.selected or o.current
                ]
        except Exception as e:
            response["statusCode"] = 500
            response["statusReason"] = "Internal Server Error"
            response["data"] = json.dumps({"error": str(e)})
            return self._send_response(response)

        response["statusCode"] = 200
        response["statusReason"] = "OK"
        response["data"] = json.dumps({"operators": operators})
        return self._send_response(response)

    # -------------------------------------------------------------------------
    # GET /operators
    # -------------------------------------------------------------------------

    def _handle_operators(self, path: str, response: dict) -> dict:
        """Handle GET /operators request."""
        try:
            target = op(path)  # type: ignore
            if target is None:
                response["statusCode"] = 404
                response["statusReason"] = "Not Found"
                response["data"] = json.dumps({"error": f"Operator not found: {path}"})
                return self._send_response(response)

            operators = [
                {"name": child.name, "type": child.type, "opType": child.OPType}
                for child in target.children
            ]

            response["statusCode"] = 200
            response["statusReason"] = "OK"
            response["data"] = json.dumps({"path": path, "operators": operators})
        except Exception as e:
            response["statusCode"] = 500
            response["statusReason"] = "Internal Server Error"
            response["data"] = json.dumps({"error": str(e)})

        return self._send_response(response)

    # -------------------------------------------------------------------------
    # WebSocket callbacks (empty - required by TD)
    # -------------------------------------------------------------------------

    def OnWebSocketOpen(self, dat, client, uri):
        pass

    def OnWebSocketClose(self, dat, client):
        pass

    def OnWebSocketReceiveText(self, dat, client, data):
        pass

    def OnWebSocketReceiveBinary(self, dat, client, data):
        pass

    def OnServerStart(self, dat):
        print("Server started")

    def OnServerStop(self, dat):
        print("Server stopped")


# Bind utility methods from td_utils to TouchDesignerAPI class
for _name in td_utils.__all__:
    setattr(TouchDesignerAPI, _name, getattr(td_utils, _name))
