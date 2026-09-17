from functools import lru_cache
from typing import List, Literal

from pydantic import Field, PostgresDsn, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings following Twelve-Factor App principles.
    Values are loaded from environment variables or a .env file.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        env_prefix="APP_",
        extra="ignore",
    )

    # Core settings
    SECRET_KEY: SecretStr = Field(
        description="Used for session signing and other crypto ops",
        default=SecretStr("secret_key"),
    )
    DEBUG: bool = Field(default=False)

    # Database (asyncpg driver)
    DATABASE_URL: PostgresDsn = Field(
        description="PostgreSQL connection string, e.g. postgresql+asyncpg://user:pass@localhost:5432/db",
        default=PostgresDsn("postgresql+asyncpg://user:pass@localhost:5432/db"),
    )

    # Database (psycopg3 driver)
    DATABASE_URL_MIGRATION: PostgresDsn = Field(
        description="PostgreSQL connection string, e.g. postgresql://user:pass@localhost:5432/db",
        default=PostgresDsn("postgresql://user:pass@localhost:5432/db"),
    )

    # App-specific
    ENVIRONMENT: Literal["development", "production"] = Field(
        description="The environment the app is running in", default="development"
    )
    APP_SESSION_LIFETIME: int = Field(
        description="The lifetime of a session", default=7
    )
    API_V1_STR: str = "api/v1"
    ALLOWED_ORIGINS: List[str] = Field(
        description="Allowed origins for CORS",
        default=[
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
        ],
    )

    # Third party integrations
    CLOUDINARY_NAME: str = Field(
        description="Cloudinary cloud name",
        default="N/A",
    )
    CLOUDINARY_API_KEY: str = Field(
        description="Cloudinary API key",
        default="N/A",
    )
    CLOUDINARY_API_SECRET: str = Field(
        description="Cloudinary API secret",
        default="N/A",
    )

    # Email delivery (Resend)
    RESEND_API_KEY: str = Field(
        description="Resend API key for transactional email",
        default="N/A",
    )
    RESEND_FROM: str = Field(
        description="Verified 'From' address used by Resend",
        default="Oja <onboarding@resend.dev>",
    )

    # Payments (Paystack)
    PAYSTACK_SECRET_KEY: str = Field(
        description="Paystack secret key",
        default="N/A",
    )
    PAYSTACK_PUBLIC_KEY: str = Field(
        description="Paystack public key (used client-side)",
        default="N/A",
    )
    PAYSTACK_API_URL: str = Field(
        description="Paystack API base URL",
        default="https://api.paystack.co",
    )

    # Frontend URLs (used for email links / payment callbacks)
    FRONTEND_APP_URL: str = Field(
        description="Dashboard app base URL",
        default="http://localhost:5173",
    )
    FRONTEND_STOREFRONT_URL: str = Field(
        description="Storefront base URL",
        default="http://localhost:5174",
    )

    @property
    def is_production(self):
        return self.ENVIRONMENT == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings: Settings = get_settings()
