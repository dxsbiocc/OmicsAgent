import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.session import init_db, DatabaseManager
from app.core.logging import get_logger
from app.middleware.logging_middleware import LoggingMiddleware
from app.services.admin import AdminService
from app.api.v1.auth import router as auth_router
from app.api.v1.admin import router as admin_router
from app.api.v1.users import router as users_router
from app.api.v1.interactions import router as interactions_router
from app.api.v1.statistics import router as statistics_router
from app.api.v1.blog import router as blog_router
from app.api.v1.follow import router as follow_router
from app.api.v1.tags import router as tags_router
from app.api.v1.categories import router as categories_router
from app.api.v1.comments import router as comments_router
from app.api.v1.image import router as image_router
from app.api.v1.visual import router as visual_router
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger = get_logger("main")

    # Startup
    logger.info("🚀 Starting OmicsAgent Backend...")
    logger.info(f"Environment: {'Development' if settings.debug else 'Production'}")
    logger.info(
        f"Database URL: {settings.database_url.split('@')[-1] if '@' in settings.database_url else 'Local'}"
    )

    # Check database connection
    if await DatabaseManager.check_connection():
        logger.info("✅ Database connection successful")
        await init_db()
        logger.info("✅ Database initialization completed")

        # Create admin user if not exists
        logger.info("🔧 Checking admin user...")
        admin_created = await AdminService.create_admin_if_not_exists()
        if admin_created:
            admin_info = await AdminService.get_admin_info()
            if admin_info:
                logger.info(
                    f"👑 Admin user ready: {admin_info['username']} ({admin_info['email']})"
                )
            else:
                logger.warning("⚠️  Admin user check completed but no admin found")
        else:
            logger.error("❌ Failed to create admin user")
    else:
        logger.error("❌ Database connection failed")
        logger.warning(
            "⚠️  Application will continue but database features may not work"
        )

    yield

    # Shutdown
    logger.info("🛑 Shutting down OmicsAgent Backend...")


# Create FastAPI application
app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# Add logging middleware
app.add_middleware(LoggingMiddleware)

# Include routers
prefix = "/api/v1"
app.include_router(auth_router, prefix=prefix)
app.include_router(admin_router, prefix=prefix)
app.include_router(users_router, prefix=prefix)
app.include_router(interactions_router, prefix=prefix)
app.include_router(statistics_router, prefix=prefix)
app.include_router(blog_router, prefix=prefix)
app.include_router(follow_router, prefix=prefix)
app.include_router(comments_router, prefix=prefix)
app.include_router(tags_router, prefix=prefix)
app.include_router(categories_router, prefix=prefix)
app.include_router(image_router, prefix=prefix)
app.include_router(visual_router, prefix=prefix)


# Add exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """Handle validation errors with detailed logging"""
    logger = get_logger("main")
    logger.error(f"Validation error on {request.url}: {exc}")

    # Get request body for debugging
    body = await request.body()
    logger.error(f"Request body: {body}")

    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error",
            "errors": exc.errors(),
            "body": body.decode() if body else None,
        },
    )


# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def root():
    """Root endpoint"""
    logger = get_logger("main")
    logger.info("📡 Root endpoint accessed")
    return {
        "message": "Welcome to OmicsAgent Backend",
        "version": "0.1.0",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    logger = get_logger("main")
    logger.debug("🔍 Health check requested")

    db_status = await DatabaseManager.check_connection()
    health_status = "healthy" if db_status else "unhealthy"

    logger.info(f"🏥 Health check result: {health_status}")

    return {
        "status": health_status,
        "database": "connected" if db_status else "disconnected",
    }


def main():
    """Main function for running the application"""
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.debug)


if __name__ == "__main__":
    main()
