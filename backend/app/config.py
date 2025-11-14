import os

class Settings:
    APP_ENV = os.getenv("APP_ENV", "development")
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://mail_user:mail_pass@db:5432/maildb")
    ATTACHMENTS_DIR = os.getenv("ATTACHMENTS_DIR", "/data/attachments")
    MAILGUN_DOMAIN = os.getenv("MAILGUN_DOMAIN", "")
    MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY", "")
    MAILGUN_SIGNING_KEY = os.getenv("MAILGUN_SIGNING_KEY", "")
    PUBLIC_DOMAIN = os.getenv("PUBLIC_DOMAIN", "qjlearn.qzz.io")
    PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "http://localhost")
    CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()]

settings = Settings()
