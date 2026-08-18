"""应用异常与统一错误码。"""


class AppError(Exception):
    code = "INTERNAL_ERROR"
    status = 500

    def __init__(self, message: str = ""):
        self.message = message or self.code
        super().__init__(self.message)


class InvalidURLError(AppError):
    code = "INVALID_URL"
    status = 400


class UnreachableError(AppError):
    code = "UNREACHABLE"
    status = 502


class AnalysisTimeoutError(AppError):
    code = "ANALYSIS_TIMEOUT"
    status = 504
