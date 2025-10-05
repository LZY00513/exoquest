import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置设置"""
    
    # API 基础配置
    app_name: str = "ExoQuest Platform API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # 服务器配置
    host: str = "0.0.0.0"
    port: int = 8000
    
    # 模型服务配置
    model_base_url: str = "http://localhost:8000"
    model_path: str = "models"  # 模型文件路径
    
    # MinIO 配置
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket_datasets: str = "datasets"
    minio_bucket_reports: str = "reports"
    minio_bucket_feedback: str = "feedback"
    minio_secure: bool = False
    
    # Redis 配置
    redis_url: str = "redis://localhost:6379"
    redis_db: int = 0
    
    # JWT 配置
    jwt_secret: str = "your-secret-key-here"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24小时
    
    # CORS 配置
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    
    # 文件上传配置
    max_file_size: int = 100 * 1024 * 1024  # 100MB
    allowed_file_types: List[str] = [".csv", ".json", ".txt"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        protected_namespaces = ('settings_',)


# 全局设置实例
settings = Settings()
