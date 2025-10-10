import time
import uuid
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.logging import get_api_logger, log_api_request


class LoggingMiddleware(BaseHTTPMiddleware):
    """API请求日志中间件"""

    def __init__(self, app):
        super().__init__(app)
        self.logger = get_api_logger()

    async def dispatch(self, request: Request, call_next):
        # 生成请求ID
        request_id = str(uuid.uuid4())[:8]

        # 记录请求开始
        start_time = time.time()

        # 添加请求ID到请求状态
        request.state.request_id = request_id

        # 获取用户信息（如果已认证）
        user_id = None
        if hasattr(request.state, "user") and request.state.user:
            user_id = request.state.user.id

        # 记录请求信息
        self.logger.info(
            f"📥 请求开始: {request.method} {request.url.path}",
            extra={
                "request_id": request_id,
                "user_id": user_id,
                "method": request.method,
                "path": request.url.path,
                "query_params": str(request.query_params),
                "client_ip": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent", ""),
            },
        )

        try:
            # 处理请求
            response = await call_next(request)

            # 计算处理时间
            duration = time.time() - start_time

            # 记录响应信息
            self.logger.info(
                f"📤 请求完成: {request.method} {request.url.path} - {response.status_code}",
                extra={
                    "request_id": request_id,
                    "user_id": user_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "duration": duration,
                },
            )

            # 添加请求ID到响应头
            response.headers["X-Request-ID"] = request_id

            return response

        except Exception as e:
            # 计算处理时间
            duration = time.time() - start_time

            # 记录错误信息
            self.logger.error(
                f"❌ 请求失败: {request.method} {request.url.path} - {str(e)}",
                extra={
                    "request_id": request_id,
                    "user_id": user_id,
                    "method": request.method,
                    "path": request.url.path,
                    "duration": duration,
                    "error": str(e),
                },
                exc_info=True,
            )

            raise
