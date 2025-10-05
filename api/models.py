from typing import Dict, List, Optional, Union, Any
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running" 
    COMPLETED = "completed"
    FAILED = "failed"


class PredictionType(str, Enum):
    TABULAR = "tabular"
    CURVE = "curve"
    FUSE = "fuse"


# 请求模型
class TabularRow(BaseModel):
    koi_fpflag_nt: float = Field(0.0, description="KOI假阳性标志-邻近目标")
    koi_fpflag_ss: float = Field(0.0, description="KOI假阳性标志-恒星斑点")
    koi_fpflag_co: float = Field(0.0, description="KOI假阳性标志-中心偏移")
    koi_fpflag_ec: float = Field(0.0, description="KOI假阳性标志-日食")
    koi_period: float = Field(..., description="KOI轨道周期（天）")
    koi_period_err1: float = Field(0.0, description="KOI轨道周期误差上界")
    koi_period_err2: float = Field(0.0, description="KOI轨道周期误差下界")
    koi_time0bk: float = Field(0.0, description="KOI凌星时间")
    koi_time0bk_err1: float = Field(0.0, description="KOI凌星时间误差上界")
    koi_time0bk_err2: float = Field(0.0, description="KOI凌星时间误差下界")
    koi_impact: float = Field(..., description="KOI影响参数")
    koi_impact_err1: float = Field(0.0, description="KOI影响参数误差上界")
    koi_impact_err2: float = Field(0.0, description="KOI影响参数误差下界")
    koi_duration: float = Field(..., description="KOI凌星持续时间（小时）")
    koi_duration_err1: float = Field(0.0, description="KOI凌星持续时间误差上界")
    koi_duration_err2: float = Field(0.0, description="KOI凌星持续时间误差下界")
    koi_depth: float = Field(..., description="KOI凌星深度（ppm）")
    koi_depth_err1: float = Field(0.0, description="KOI凌星深度误差上界")
    koi_depth_err2: float = Field(0.0, description="KOI凌星深度误差下界")
    koi_prad: float = Field(..., description="KOI行星半径（地球半径）")
    koi_prad_err1: float = Field(0.0, description="KOI行星半径误差上界")
    koi_prad_err2: float = Field(0.0, description="KOI行星半径误差下界")
    koi_teq: float = Field(..., description="KOI平衡温度（K）")
    koi_insol: float = Field(..., description="KOI辐照度")
    koi_insol_err1: float = Field(0.0, description="KOI辐照度误差上界")
    koi_insol_err2: float = Field(0.0, description="KOI辐照度误差下界")
    koi_model_snr: float = Field(..., description="KOI模型信噪比")
    koi_tce_plnt_num: float = Field(..., description="KOI行星编号")
    koi_steff: float = Field(..., description="KOI恒星有效温度（K）")
    koi_steff_err1: float = Field(0.0, description="KOI恒星有效温度误差上界")
    koi_steff_err2: float = Field(0.0, description="KOI恒星有效温度误差下界")
    koi_slogg: float = Field(..., description="KOI恒星表面重力加速度")
    koi_slogg_err1: float = Field(0.0, description="KOI恒星表面重力加速度误差上界")
    koi_slogg_err2: float = Field(0.0, description="KOI恒星表面重力加速度误差下界")
    koi_srad: float = Field(..., description="KOI恒星半径（太阳半径）")
    koi_srad_err1: float = Field(0.0, description="KOI恒星半径误差上界")
    koi_srad_err2: float = Field(0.0, description="KOI恒星半径误差下界")
    ra: float = Field(..., description="赤经")
    dec: float = Field(..., description="赤纬")
    koi_kepmag: float = Field(..., description="KOI开普勒星等")


class TabularPredictRequest(BaseModel):
    rows: List[TabularRow]
    threshold: float = Field(0.5, ge=0.0, le=1.0, description="决策阈值")


class CurvePredictRequest(BaseModel):
    curve: List[float] = Field(..., description="光变曲线数据")
    time: Optional[List[float]] = Field(None, description="时间序列（可选）")
    threshold: float = Field(0.5, ge=0.0, le=1.0, description="决策阈值")


class FusePredictRequest(BaseModel):
    tabular_data: TabularRow
    curve_data: List[float]
    alpha: float = Field(0.7, ge=0.0, le=1.0, description="融合权重")
    threshold: float = Field(0.5, ge=0.0, le=1.0, description="决策阈值")


class TrainingRequest(BaseModel):
    dataset_id: str
    config: Dict[str, Any] = Field(default_factory=dict, description="训练配置")


class FeedbackRequest(BaseModel):
    target_id: str
    user_label: str = Field(..., pattern="^(CONF|PC|FP)$", description="用户标注")
    confidence: float = Field(..., ge=0.0, le=1.0, description="标注置信度")
    notes: Optional[str] = Field(None, description="备注信息")


# 响应模型
class Probabilities(BaseModel):
    # 支持二分类和多分类
    POSITIVE: Optional[float] = Field(None, description="二分类正例概率")
    NEGATIVE: Optional[float] = Field(None, description="二分类负例概率")
    CONF: Optional[float] = Field(None, description="多分类确认行星概率")
    PC: Optional[float] = Field(None, description="多分类候选行星概率") 
    FP: Optional[float] = Field(None, description="多分类假阳性概率")
    
    def __init__(self, **data):
        super().__init__(**data)
        # 验证至少有一种分类方式有值
        has_binary = self.POSITIVE is not None or self.NEGATIVE is not None
        has_multi = self.CONF is not None or self.PC is not None or self.FP is not None
        if not (has_binary or has_multi):
            raise ValueError("至少需要提供二分类或多分类概率")


class ShapExplanation(BaseModel):
    shap: List[List[Union[str, float]]] = Field(..., description="SHAP特征重要性")


class TabularExplanation(BaseModel):
    tabular: Optional[ShapExplanation] = None


class ExoplanetPrediction(BaseModel):
    probs: Probabilities
    conf: float = Field(..., description="预测置信度")
    version: str = Field(..., description="模型版本")
    explain: Optional[TabularExplanation] = None
    importance: Optional[List[float]] = Field(None, description="时间序列重要性")


class PredictionResponse(BaseModel):
    predictions: List[ExoplanetPrediction]


class Dataset(BaseModel):
    dataset_id: str
    object_key: str
    size: int
    filename: str
    uploaded_at: datetime


class TrainingJob(BaseModel):
    job_id: str
    status: JobStatus
    progress: int = Field(..., ge=0, le=100, description="进度百分比")
    message: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class TrainingResponse(BaseModel):
    job_id: str


class ConfusionMatrix(BaseModel):
    tp: int
    fp: int
    tn: int
    fn: int


class ModelMetrics(BaseModel):
    pr_auc: float = Field(..., description="PR-AUC")
    mcc: float = Field(..., description="Matthews相关系数")
    ece: float = Field(..., description="期望校准误差")
    confusion: ConfusionMatrix
    plots: Dict[str, str] = Field(..., description="图表URL")


class FeedbackResponse(BaseModel):
    success: bool
    message: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str


class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
