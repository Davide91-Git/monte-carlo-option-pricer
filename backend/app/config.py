"""
config.py
---------
Centralised application settings read from environment variables.

Author: Davide91-Git
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    DEBUG: bool = False

    class Config:
        env_file = ".env"


settings = Settings()