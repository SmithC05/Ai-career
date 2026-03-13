from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Career Navigator AI Service"
    app_version: str = "0.1.0"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model_advisor: str = "qwen2.5:0.5b"
    ollama_model_roadmap: str = "qwen2.5:0.5b"
    ollama_model_light: str = "qwen2.5:0.5b"
    ollama_timeout_seconds: int = 12
    ollama_request_deadline_seconds: int = 8
    ollama_num_ctx: int = 2048
    ollama_keep_alive: str = "30m"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )


settings = Settings()
