"""
Synchronous Base for Alembic migrations
This avoids async engine issues during migrations
"""

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import MetaData

# Create a synchronous Base for migrations
SyncBase = declarative_base()

# This can be used in migration files to avoid async engine issues
