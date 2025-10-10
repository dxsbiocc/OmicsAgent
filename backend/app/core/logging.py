import logging
import logging.config
import sys
from pathlib import Path
from typing import Dict, Any
from datetime import datetime
import json
import traceback
from app.core.config import settings


class ColoredFormatter(logging.Formatter):
    """彩色日志格式化器"""

    # ANSI颜色代码
    COLORS = {
        "DEBUG": "\033[36m",  # 青色
        "INFO": "\033[32m",  # 绿色
        "WARNING": "\033[33m",  # 黄色
        "ERROR": "\033[31m",  # 红色
        "CRITICAL": "\033[35m",  # 紫色
        "RESET": "\033[0m",  # 重置
    }

    def format(self, record):
        # 添加颜色
        if record.levelname in self.COLORS:
            record.levelname = f"{self.COLORS[record.levelname]}{record.levelname}{self.COLORS['RESET']}"

        return super().format(record)


class JSONFormatter(logging.Formatter):
    """JSON格式化器，用于结构化日志"""

    def format(self, record):
        log_entry = {
            "timestamp": datetime.fromtimestamp(record.created).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # 添加异常信息
        if record.exc_info:
            log_entry["exception"] = {
                "type": record.exc_info[0].__name__,
                "message": str(record.exc_info[1]),
                "traceback": traceback.format_exception(*record.exc_info),
            }

        # 添加额外字段
        if hasattr(record, "user_id"):
            log_entry["user_id"] = record.user_id
        if hasattr(record, "request_id"):
            log_entry["request_id"] = record.request_id
        if hasattr(record, "duration"):
            log_entry["duration"] = record.duration

        return json.dumps(
            log_entry, ensure_ascii=False, indent=2 if settings.debug else None
        )


class OmicsAgentLogger:
    """OmicsAgent个性化日志管理器"""

    def __init__(self):
        self.log_dir = Path("logs")
        self.log_dir.mkdir(exist_ok=True)
        self._setup_logging()

    def _setup_logging(self):
        """设置日志配置"""

        # 控制台格式
        console_format = "%(asctime)s | %(levelname)-8s | %(name)-20s | %(funcName)-15s:%(lineno)-4d | %(message)s"

        # 文件格式
        file_format = "%(asctime)s | %(levelname)-8s | %(name)-20s | %(funcName)-15s:%(lineno)-4d | %(message)s"

        # 详细格式（用于调试）
        detailed_format = (
            "%(asctime)s | %(levelname)-8s | %(name)-20s | %(funcName)-15s:%(lineno)-4d | "
            "%(process)d:%(thread)d | %(message)s"
        )

        logging_config = {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "console": {
                    "()": ColoredFormatter,
                    "format": console_format,
                    "datefmt": "%Y-%m-%d %H:%M:%S",
                },
                "file": {"format": file_format, "datefmt": "%Y-%m-%d %H:%M:%S"},
                "detailed": {"format": detailed_format, "datefmt": "%Y-%m-%d %H:%M:%S"},
                "json": {
                    "()": JSONFormatter,
                },
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "level": "INFO",
                    "formatter": "console",
                    "stream": sys.stdout,
                },
                "file_info": {
                    "class": "logging.handlers.RotatingFileHandler",
                    "level": "INFO",
                    "formatter": "file",
                    "filename": str(self.log_dir / "app.log"),
                    "maxBytes": 10485760,  # 10MB
                    "backupCount": 5,
                    "encoding": "utf-8",
                },
                "file_error": {
                    "class": "logging.handlers.RotatingFileHandler",
                    "level": "ERROR",
                    "formatter": "detailed",
                    "filename": str(self.log_dir / "error.log"),
                    "maxBytes": 10485760,  # 10MB
                    "backupCount": 5,
                    "encoding": "utf-8",
                },
                "file_debug": {
                    "class": "logging.handlers.RotatingFileHandler",
                    "level": "DEBUG",
                    "formatter": "detailed",
                    "filename": str(self.log_dir / "debug.log"),
                    "maxBytes": 10485760,  # 10MB
                    "backupCount": 3,
                    "encoding": "utf-8",
                },
                "json_file": {
                    "class": "logging.handlers.RotatingFileHandler",
                    "level": "INFO",
                    "formatter": "json",
                    "filename": str(self.log_dir / "structured.log"),
                    "maxBytes": 10485760,  # 10MB
                    "backupCount": 5,
                    "encoding": "utf-8",
                },
            },
            "loggers": {
                "app": {
                    "level": "DEBUG" if settings.debug else "INFO",
                    "handlers": ["console", "file_info", "file_debug", "json_file"],
                    "propagate": False,
                },
                "app.api": {
                    "level": "INFO",
                    "handlers": ["console", "file_info", "json_file"],
                    "propagate": False,
                },
                "app.models": {
                    "level": "DEBUG" if settings.debug else "INFO",
                    "handlers": ["file_debug", "json_file"],
                    "propagate": False,
                },
                "app.services": {
                    "level": "INFO",
                    "handlers": ["console", "file_info", "json_file"],
                    "propagate": False,
                },
                "uvicorn": {
                    "level": "INFO",
                    "handlers": ["console", "file_info"],
                    "propagate": False,
                },
                "uvicorn.access": {
                    "level": "INFO",
                    "handlers": ["file_info"],
                    "propagate": False,
                },
                "sqlalchemy": {
                    "level": "WARNING",
                    "handlers": ["file_debug"],
                    "propagate": False,
                },
                "sqlalchemy.engine": {
                    "level": "WARNING",
                    "handlers": ["file_debug"],
                    "propagate": False,
                },
            },
            "root": {"level": "WARNING", "handlers": ["console", "file_error"]},
        }

        # 应用配置
        logging.config.dictConfig(logging_config)

    def get_logger(self, name: str) -> logging.Logger:
        """获取指定名称的日志器"""
        return logging.getLogger(f"app.{name}")

    def get_api_logger(self) -> logging.Logger:
        """获取API日志器"""
        return logging.getLogger("app.api")

    def get_model_logger(self) -> logging.Logger:
        """获取模型日志器"""
        return logging.getLogger("app.models")

    def get_service_logger(self) -> logging.Logger:
        """获取服务日志器"""
        return logging.getLogger("app.services")


# 全局日志管理器实例
logger_manager = OmicsAgentLogger()


# 便捷函数
def get_logger(name: str) -> logging.Logger:
    """获取日志器的便捷函数"""
    return logger_manager.get_logger(name)


def get_api_logger() -> logging.Logger:
    """获取API日志器的便捷函数"""
    return logger_manager.get_api_logger()


def get_model_logger() -> logging.Logger:
    """获取模型日志器的便捷函数"""
    return logger_manager.get_model_logger()


def get_service_logger() -> logging.Logger:
    """获取服务日志器的便捷函数"""
    return logger_manager.get_service_logger()


# 日志装饰器
def log_function_call(logger: logging.Logger = None):
    """函数调用日志装饰器"""

    def decorator(func):
        def wrapper(*args, **kwargs):
            if logger is None:
                log = get_logger(func.__module__)
            else:
                log = logger

            log.debug(f"调用函数: {func.__name__} with args={args}, kwargs={kwargs}")
            try:
                result = func(*args, **kwargs)
                log.debug(f"函数 {func.__name__} 执行成功")
                return result
            except Exception as e:
                log.error(f"函数 {func.__name__} 执行失败: {str(e)}", exc_info=True)
                raise

        return wrapper

    return decorator


def log_performance(logger: logging.Logger = None):
    """性能日志装饰器"""

    def decorator(func):
        def wrapper(*args, **kwargs):
            if logger is None:
                log = get_logger(func.__module__)
            else:
                log = logger

            import time

            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                log.info(f"函数 {func.__name__} 执行耗时: {duration:.4f}秒")
                return result
            except Exception as e:
                duration = time.time() - start_time
                log.error(
                    f"函数 {func.__name__} 执行失败，耗时: {duration:.4f}秒, 错误: {str(e)}"
                )
                raise

        return wrapper

    return decorator


# 结构化日志辅助函数
def log_user_action(logger: logging.Logger, action: str, user_id: int = None, **kwargs):
    """记录用户操作日志"""
    extra = {"user_id": user_id, "action": action, **kwargs}
    logger.info(f"用户操作: {action}", extra=extra)


def log_api_request(
    logger: logging.Logger,
    method: str,
    path: str,
    user_id: int = None,
    duration: float = None,
    status_code: int = None,
    **kwargs,
):
    """记录API请求日志"""
    extra = {
        "user_id": user_id,
        "method": method,
        "path": path,
        "duration": duration,
        "status_code": status_code,
        **kwargs,
    }
    logger.info(f"API请求: {method} {path}", extra=extra)


def log_database_operation(
    logger: logging.Logger,
    operation: str,
    table: str,
    record_id: int = None,
    user_id: int = None,
    **kwargs,
):
    """记录数据库操作日志"""
    extra = {
        "operation": operation,
        "table": table,
        "record_id": record_id,
        "user_id": user_id,
        **kwargs,
    }
    logger.info(f"数据库操作: {operation} {table}", extra=extra)
