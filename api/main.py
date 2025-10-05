from typing import List
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import logging

from config import settings
from models import (
    TabularPredictRequest, CurvePredictRequest, FusePredictRequest,
    TrainingRequest, FeedbackRequest, PredictionResponse,
    Dataset, TrainingResponse, TrainingJob, ModelMetrics,
    FeedbackResponse, HealthResponse, ErrorResponse
)
from model_adapter import get_model_adapter
from services.minio_service import minio_service

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 创建FastAPI应用
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="ExoQuest Platform API - 系外行星检测与分析平台",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 获取模型适配器
model_adapter = get_model_adapter()


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(detail=str(exc.detail)).model_dump()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unexpected error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(detail="内部服务器错误").model_dump()
    )


# 健康检查
@app.get("/api/health", response_model=HealthResponse)
@app.get("/health")  # 添加根路径的health检查
async def health_check():
    """健康检查接口"""
    return HealthResponse(
        status="ok",
        timestamp=datetime.utcnow(),
        version=settings.app_version
    )


# 数据集管理
@app.post("/api/datasets/upload", response_model=Dataset)
async def upload_dataset(file: UploadFile = File(...)):
    """上传数据集文件"""
    try:
        dataset = await minio_service.upload_dataset(file)
        logger.info(f"Dataset uploaded: {dataset.dataset_id}")
        return dataset
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/datasets", response_model=List[Dataset])
async def list_datasets():
    """获取数据集列表"""
    # TODO: 实现数据集列表功能
    return []


@app.get("/api/datasets/{dataset_id}/content")
async def get_dataset_content(dataset_id: str):
    """获取数据集内容"""
    try:
        # 从MinIO获取文件内容
        content = await minio_service.get_dataset_content(dataset_id)
        return {"content": content}
    except Exception as e:
        logger.error(f"Failed to get dataset content: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/features")
async def get_features():
    """获取模型特征列表"""
    try:
        # 从模型服务获取特征列表
        from ml.model_service import get_model_service
        model_service = get_model_service()
        features = model_service.get_feature_names()
        return {"features": features}
    except Exception as e:
        logger.error(f"Failed to get features: {str(e)}")
        # 返回默认特征列表作为fallback
        default_features = [
            "koi_fpflag_nt", "koi_fpflag_ss", "koi_fpflag_co", "koi_fpflag_ec",
            "koi_period", "koi_period_err1", "koi_period_err2", "koi_time0bk",
            "koi_time0bk_err1", "koi_time0bk_err2", "koi_impact", "koi_impact_err1",
            "koi_impact_err2", "koi_duration", "koi_duration_err1", "koi_duration_err2",
            "koi_depth", "koi_depth_err1", "koi_depth_err2", "koi_prad", "koi_prad_err1",
            "koi_prad_err2", "koi_teq", "koi_insol", "koi_insol_err1", "koi_insol_err2",
            "koi_model_snr", "koi_tce_plnt_num", "koi_steff", "koi_steff_err1", "koi_steff_err2",
            "koi_slogg", "koi_slogg_err1", "koi_slogg_err2", "koi_srad", "koi_srad_err1",
            "koi_srad_err2", "ra", "dec", "koi_kepmag"
        ]
        return {"features": default_features}


@app.post("/api/train")
async def start_training(request: TrainingRequest):
    """开始模型训练"""
    try:
        # 模拟训练过程，返回训练任务ID
        import uuid
        job_id = str(uuid.uuid4())
        
        logger.info(f"Training started for dataset {request.dataset_id} with config {request.config}")
        
        # 这里应该启动实际的训练过程
        # 目前返回模拟的训练任务ID
        return {"job_id": job_id}
    except Exception as e:
        logger.error(f"Training failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/jobs/{job_id}/status")
async def get_job_status(job_id: str):
    """获取训练任务状态"""
    try:
        # 模拟训练状态
        import random
        
        # 模拟训练进度 (0-100)
        progress = min(100, random.randint(60, 95))
        
        if progress >= 100:
            status = "completed"
            metrics = {
                "accuracy": round(random.uniform(0.85, 0.95), 3),
                "precision": round(random.uniform(0.80, 0.90), 3),
                "recall": round(random.uniform(0.75, 0.85), 3),
                "f1_score": round(random.uniform(0.78, 0.88), 3)
            }
        else:
            status = "running"
            metrics = None
        
        return {
            "job_id": job_id,
            "status": status,
            "progress": progress,
            "metrics": metrics,
            "started_at": "2024-01-01T10:00:00Z",
            "completed_at": "2024-01-01T10:45:00Z" if status == "completed" else None
        }
    except Exception as e:
        logger.error(f"Failed to get job status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# 预测接口
@app.post("/api/predict/tabular", response_model=PredictionResponse)
async def predict_tabular(request: TabularPredictRequest):
    """表格数据预测"""
    try:
        result = await model_adapter.predict_tabular(request)
        logger.info(f"Tabular prediction completed for {len(request.rows)} rows")
        return PredictionResponse(**result)
    except Exception as e:
        logger.error(f"Tabular prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/predict/curve", response_model=PredictionResponse)
async def predict_curve(request: CurvePredictRequest):
    """光变曲线预测"""
    try:
        result = await model_adapter.predict_curve(request)
        logger.info(f"Curve prediction completed for curve length {len(request.curve)}")
        return PredictionResponse(**result)
    except Exception as e:
        logger.error(f"Curve prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/predict/fuse", response_model=PredictionResponse)
async def predict_fuse(request: FusePredictRequest):
    """融合预测"""
    try:
        result = await model_adapter.predict_fuse(request)
        logger.info("Fuse prediction completed")
        return PredictionResponse(**result)
    except Exception as e:
        logger.error(f"Fuse prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# 训练接口
@app.post("/api/train", response_model=TrainingResponse)
async def start_training(request: TrainingRequest):
    """开始训练任务"""
    try:
        result = await model_adapter.start_training(request)
        logger.info(f"Training started: {result['job_id']}")
        return TrainingResponse(**result)
    except Exception as e:
        logger.error(f"Training start failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/jobs/{job_id}/status", response_model=TrainingJob)
async def get_job_status(job_id: str):
    """获取训练任务状态"""
    try:
        job = await model_adapter.get_job_status(job_id)
        return job
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Get job status failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/models/{model_id}/metrics", response_model=ModelMetrics)
async def get_model_metrics(model_id: str):
    """获取模型性能指标"""
    try:
        metrics = await model_adapter.get_model_metrics(model_id)
        return metrics
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Get model metrics failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# 反馈接口
@app.post("/api/feedback", response_model=FeedbackResponse)
async def submit_feedback(request: FeedbackRequest):
    """提交用户反馈"""
    try:
        feedback_id = await minio_service.save_feedback(request.model_dump())
        logger.info(f"Feedback submitted: {feedback_id}")
        return FeedbackResponse(success=True, message="反馈提交成功")
    except Exception as e:
        logger.error(f"Feedback submission failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# 启动事件
@app.on_event("startup")
async def startup_event():
    """应用启动时的初始化"""
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info("Using real LightGBM model for predictions")
    
    # 初始化模型适配器
    try:
        await model_adapter.init_clients()
        logger.info("Model adapter initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize model adapter: {str(e)}")


@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时的清理"""
    logger.info("Shutting down ExoQuest Platform API")


if __name__ == "__main__":
    import uvicorn
    import os
    
    # 确保在正确的目录中启动
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info"
    )
