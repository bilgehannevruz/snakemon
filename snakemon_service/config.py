# Snakemon Service Configuration 
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./snakemon.db"

    model_config = SettingsConfigDict(env_file='.env')

settings = Settings() 