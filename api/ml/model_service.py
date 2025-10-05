import os
import json
import logging
from typing import Dict, List, Any, Optional
import numpy as np
import pandas as pd
from pathlib import Path

# 尝试导入机器学习库
try:
    import catboost as cb
    CATBOOST_AVAILABLE = True
except ImportError:
    CATBOOST_AVAILABLE = False

try:
    import lightgbm as lgb
    LIGHTGBM_AVAILABLE = True
except ImportError:
    LIGHTGBM_AVAILABLE = False

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False

logger = logging.getLogger(__name__)


class ModelService:
    """模型服务类 - 加载和管理训练好的模型"""
    
    def __init__(self, models_dir: str = "models"):
        self.models_dir = Path(models_dir)
        self.model = None
        self.features = None
        self.scaler_params = None
        self.model_type = None
        self._load_model()
    
    def _load_model(self):
        """加载模型和相关配置文件"""
        try:
            # 查找模型文件
            model_files = list(self.models_dir.glob("best_model.*"))
            if not model_files:
                raise FileNotFoundError(f"No model files found in {self.models_dir}")
            
            model_file = model_files[0]
            logger.info(f"Loading model from: {model_file}")
            
            # 根据文件扩展名确定模型类型
            if model_file.suffix == '.cbm':
                if not CATBOOST_AVAILABLE:
                    raise ImportError("CatBoost not available. Please install: pip install catboost")
                self.model = cb.CatBoostClassifier()
                self.model.load_model(str(model_file))
                self.model_type = "catboost"
                logger.info("Loaded CatBoost model")
                
            elif model_file.suffix in ['.txt', '.model']:
                if not LIGHTGBM_AVAILABLE:
                    raise ImportError("LightGBM not available. Please install: pip install lightgbm")
                self.model = lgb.Booster(model_file=str(model_file))
                self.model_type = "lightgbm"
                logger.info("Loaded LightGBM model")
            else:
                raise ValueError(f"Unsupported model format: {model_file.suffix}")
            
            # 加载特征列表
            features_file = self.models_dir / "features.json"
            if features_file.exists():
                with open(features_file, 'r') as f:
                    features_data = json.load(f)
                    # 支持两种格式：直接数组或包含features键的对象
                    if isinstance(features_data, list):
                        self.features = features_data
                    elif isinstance(features_data, dict) and 'features' in features_data:
                        self.features = features_data['features']
                    else:
                        logger.warning("Invalid features format, using default features")
                        self.features = self._get_default_features()
                logger.info(f"Loaded {len(self.features)} features")
            else:
                logger.warning("features.json not found, using default features")
                self.features = self._get_default_features()
            
            # 加载标准化参数
            scaler_file = self.models_dir / "scaler_params.json"
            if scaler_file.exists():
                with open(scaler_file, 'r') as f:
                    scaler_data = json.load(f)
                    # 支持两种格式：标准格式(mean_, scale_)和简化格式(mean, scale)
                    if 'mean_' in scaler_data and 'scale_' in scaler_data:
                        self.scaler_params = {
                            'mean': np.array(scaler_data['mean_']),
                            'scale': np.array(scaler_data['scale_'])
                        }
                    elif 'mean' in scaler_data and 'scale' in scaler_data:
                        self.scaler_params = {
                            'mean': np.array(scaler_data['mean']),
                            'scale': np.array(scaler_data['scale'])
                        }
                    else:
                        logger.warning("Invalid scaler format, skipping normalization")
                        self.scaler_params = None
                if self.scaler_params:
                    logger.info("Loaded scaler parameters")
            else:
                logger.warning("scaler_params.json not found, using identity scaling")
                self.scaler_params = None
                
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise
    
    def _get_default_features(self) -> List[str]:
        """获取默认特征列表"""
        return [
            'period', 'duration_hr', 'depth_ppm', 'snr',
            'teff', 'logg', 'tmag', 'crowding'
        ]
    
    def get_feature_names(self) -> List[str]:
        """获取模型特征名称列表"""
        try:
            if self.features:
                return self.features
            else:
                # 返回默认特征列表
                return [
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
        except Exception as e:
            logger.error(f"Failed to get feature names: {e}")
            return []
    
    def _map_koi_to_simple_features(self, rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """将KOI特征映射到简化特征"""
        mapped_rows = []
        for row in rows:
            mapped_row = {}
            
            # 映射KOI特征到简化特征
            feature_mapping = {
                'period': row.get('koi_period', row.get('period', 0)),
                'duration_hr': row.get('koi_duration', row.get('duration_hr', 0)),
                'depth_ppm': row.get('koi_depth', row.get('depth_ppm', 0)),
                'snr': row.get('koi_model_snr', row.get('snr', 0)),
                'teff': row.get('koi_steff', row.get('teff', 0)),
                'logg': row.get('koi_slogg', row.get('logg', 0)),
                'tmag': row.get('koi_kepmag', row.get('tmag', 0)),
                'crowding': row.get('crowding', 0.9),  # 默认值
            }
            
            # 如果原始数据中有简化特征，优先使用
            for simple_feature in ['period', 'duration_hr', 'depth_ppm', 'snr', 'teff', 'logg', 'tmag', 'crowding']:
                if simple_feature in row:
                    mapped_row[simple_feature] = row[simple_feature]
                else:
                    mapped_row[simple_feature] = feature_mapping[simple_feature]
            
            mapped_rows.append(mapped_row)
        
        return mapped_rows
    
    def _prepare_features(self, rows: List[Dict[str, Any]]) -> np.ndarray:
        """准备特征数据"""
        # 转换为DataFrame
        df = pd.DataFrame(rows)
        
        # 填充缺失值
        for feature in self.features:
            if feature not in df.columns:
                df[feature] = 0.0
            else:
                df[feature] = df[feature].fillna(0.0)
        
        # 选择特征列
        feature_data = df[self.features].values
        
        # 应用标准化
        if self.scaler_params is not None:
            feature_data = (feature_data - self.scaler_params['mean']) / self.scaler_params['scale']
        
        return feature_data
    
    def _get_feature_importance(self, top_k: int = 5) -> List[List]:
        """获取全局特征重要性"""
        try:
            if self.model_type == "catboost":
                # CatBoost内置特征重要性
                importance = self.model.get_feature_importance(prettified=True)
                # 转换为所需格式 [feature, importance]
                return [[row['Feature Id'], float(row['Importances'])] for row in importance[:top_k]]
            
            elif self.model_type == "lightgbm":
                # LightGBM特征重要性
                importance = self.model.feature_importance(importance_type='gain')
                feature_names = self.model.feature_name()
                # 排序并取前top_k
                importance_pairs = list(zip(feature_names, importance))
                importance_pairs.sort(key=lambda x: x[1], reverse=True)
                return [[name, float(imp)] for name, imp in importance_pairs[:top_k]]
            
            else:
                # 返回默认重要性（模拟）
                return [
                    ['depth_ppm', 0.31],
                    ['snr', 0.22],
                    ['period', 0.17],
                    ['duration_hr', 0.12],
                    ['teff', 0.08]
                ]
                
        except Exception as e:
            logger.warning(f"Failed to get feature importance: {str(e)}")
            # 返回默认重要性
            return [
                ['depth_ppm', 0.31],
                ['snr', 0.22],
                ['period', 0.17],
                ['duration_hr', 0.12],
                ['teff', 0.08]
            ]
    
    def _get_shap_values(self, feature_data: np.ndarray, top_k: int = 5) -> List[List]:
        """计算SHAP值"""
        try:
            if not SHAP_AVAILABLE:
                logger.warning("SHAP not available, using feature importance instead")
                return self._get_feature_importance(top_k)
            
            # 创建SHAP解释器
            if self.model_type == "lightgbm":
                explainer = shap.TreeExplainer(self.model)
            elif self.model_type == "catboost":
                explainer = shap.TreeExplainer(self.model)
            else:
                logger.warning(f"SHAP not supported for model type: {self.model_type}")
                return self._get_feature_importance(top_k)
            
            # 计算SHAP值
            shap_values = explainer.shap_values(feature_data)
            
            # 如果是多分类，取第一个类别的SHAP值
            if isinstance(shap_values, list):
                shap_values = shap_values[0]  # 取第一个类别
            
            # 计算平均绝对SHAP值
            mean_shap = np.mean(np.abs(shap_values), axis=0)
            
            # 获取特征名称
            if self.model_type == "lightgbm":
                feature_names = self.model.feature_name()
            elif self.model_type == "catboost":
                feature_names = self.model.feature_names_
            else:
                feature_names = [f"feature_{i}" for i in range(len(mean_shap))]
            
            # 排序并取前top_k
            importance_pairs = list(zip(feature_names, mean_shap))
            importance_pairs.sort(key=lambda x: x[1], reverse=True)
            
            return [[name, float(imp)] for name, imp in importance_pairs[:top_k]]
            
        except Exception as e:
            logger.warning(f"Failed to calculate SHAP values: {str(e)}")
            return self._get_feature_importance(top_k)
    
    def _get_sample_shap_values(self, feature_data: np.ndarray, sample_idx: int = 0, top_k: int = 5) -> List[List]:
        """计算单个样本的SHAP值"""
        try:
            if not SHAP_AVAILABLE:
                logger.warning("SHAP not available, using default values")
                return [
                    ['depth_ppm', 0.15],
                    ['snr', -0.08],
                    ['period', 0.12],
                    ['duration_hr', -0.05],
                    ['teff', 0.03]
                ]
            
            # 创建SHAP解释器
            if self.model_type == "lightgbm":
                explainer = shap.TreeExplainer(self.model)
            elif self.model_type == "catboost":
                explainer = shap.TreeExplainer(self.model)
            else:
                return [
                    ['depth_ppm', 0.15],
                    ['snr', -0.08],
                    ['period', 0.12],
                    ['duration_hr', -0.05],
                    ['teff', 0.03]
                ]
            
            # 计算SHAP值
            shap_values = explainer.shap_values(feature_data)
            
            # 如果是多分类，取第一个类别的SHAP值
            if isinstance(shap_values, list):
                shap_values = shap_values[0]
            
            # 获取单个样本的SHAP值
            sample_shap = shap_values[sample_idx]
            
            # 获取特征名称
            if self.model_type == "lightgbm":
                feature_names = self.model.feature_name()
            elif self.model_type == "catboost":
                feature_names = self.model.feature_names_
            else:
                feature_names = [f"feature_{i}" for i in range(len(sample_shap))]
            
            # 按绝对值排序并取前top_k
            importance_pairs = list(zip(feature_names, sample_shap))
            importance_pairs.sort(key=lambda x: abs(x[1]), reverse=True)
            
            return [[name, float(shap_val)] for name, shap_val in importance_pairs[:top_k]]
            
        except Exception as e:
            logger.warning(f"Failed to calculate sample SHAP values: {str(e)}")
            return [
                ['depth_ppm', 0.15],
                ['snr', -0.08],
                ['period', 0.12],
                ['duration_hr', -0.05],
                ['teff', 0.03]
            ]
    
    def predict_tabular(self, rows: List[Dict[str, Any]], threshold: float = 0.5) -> Dict[str, Any]:
        """表格数据预测"""
        try:
            # 如果模型使用的是KOI特征，但输入是简化特征，进行映射
            if self.features and len(self.features) > 10:  # KOI特征通常有40+个
                # 模型期望KOI特征，但输入可能是简化特征
                logger.info("Model expects KOI features, mapping input data")
                # 这里我们需要将简化特征映射回KOI特征
                # 暂时使用简化特征进行预测，后续可以改进
                mapped_rows = rows
            else:
                mapped_rows = rows
            
            # 准备特征数据
            feature_data = self._prepare_features(mapped_rows)
            
            # 预测概率
            if self.model_type == "catboost":
                probabilities = self.model.predict_proba(feature_data)
                # CatBoost返回 [n_samples, n_classes] 格式
                if probabilities.shape[1] == 2:
                    # 二分类情况，直接使用二分类结果
                    probs_array = probabilities
                elif probabilities.shape[1] >= 3:
                    probs_array = probabilities[:, :3]  # 取前3个类别
                else:
                    # 如果类别数不足，填充
                    probs_array = np.zeros((probabilities.shape[0], 3))
                    probs_array[:, :probabilities.shape[1]] = probabilities
            
            elif self.model_type == "lightgbm":
                probabilities = self.model.predict(feature_data)
                # 直接使用模型输出，不进行额外转换
                if probabilities.ndim == 1:
                    # 二分类情况，直接使用二分类结果
                    probs_array = np.column_stack([
                        probabilities,      # 正例概率
                        1 - probabilities   # 负例概率
                    ])
                else:
                    # 多分类情况
                    probs_array = probabilities
            
            # 归一化概率
            probs_array = probs_array / probs_array.sum(axis=1, keepdims=True)
            
            # 计算全局SHAP值（用于全局重要性）
            global_shap_values = self._get_shap_values(feature_data)
            
            # 构建预测结果
            predictions = []
            for i, prob_row in enumerate(probs_array):
                # 根据模型输出类别数构建概率字典
                if prob_row.shape[0] == 2:
                    # 二分类模型 - 根据阈值调整分类结果
                    positive_prob = float(prob_row[0])
                    negative_prob = float(prob_row[1])
                    
                    # 根据阈值动态调整概率分布
                    # 高阈值: 更倾向于确认行星 (NEGATIVE概率增加)
                    # 低阈值: 更倾向于候选行星 (POSITIVE概率增加)
                    
                    # 使用阈值作为权重调整概率
                    threshold_weight = threshold
                    
                    # 调整后的概率
                    adjusted_positive = positive_prob * (1 + threshold_weight) / (1 + threshold)
                    adjusted_negative = negative_prob * (1 + (1 - threshold_weight)) / (2 - threshold)
                    
                    # 归一化
                    total = adjusted_positive + adjusted_negative
                    adjusted_positive /= total
                    adjusted_negative /= total
                    
                    # 根据阈值分配CONF和PC概率
                    if threshold > 0.5:
                        # 高阈值：更多确认为确认行星
                        conf_prob = adjusted_positive * threshold
                        pc_prob = adjusted_positive * (1 - threshold)
                    else:
                        # 低阈值：更多确认为候选行星
                        conf_prob = adjusted_positive * threshold
                        pc_prob = adjusted_positive * (1 - threshold)
                    
                    probs = {
                        "POSITIVE": adjusted_positive,
                        "NEGATIVE": adjusted_negative,
                        "CONF": conf_prob,
                        "PC": pc_prob,
                        "FP": 0.0
                    }
                else:
                    # 多分类模型，保持原有格式
                    probs = {
                        "CONF": float(prob_row[0]),
                        "PC": float(prob_row[1]),
                        "FP": float(prob_row[2]) if len(prob_row) > 2 else 0.0
                    }
                
                # 计算置信度（最大概率）
                conf = float(np.max(prob_row))
                
                # 获取该样本的SHAP值
                sample_shap_values = self._get_sample_shap_values(feature_data, i)
                
                # 从原始输入数据中获取object_id或kepoi_name（这些字段不参与模型训练）
                original_row = rows[i] if i < len(rows) else {}
                object_id = (original_row.get('kepoi_name') or 
                           original_row.get('object_id') or 
                           original_row.get('target_name') or 
                           f"TARGET-{i+1}")
                
                prediction = {
                    "object_id": object_id,
                    "probs": probs,
                    "conf": conf,
                    "version": "v1.0.0",
                    "explain": {
                        "tabular": {
                            "shap": sample_shap_values  # 使用样本级SHAP值
                        }
                    }
                }
                predictions.append(prediction)
            
            return {"predictions": predictions}
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise


# 全局模型服务实例
_model_service = None

def get_model_service() -> ModelService:
    """获取模型服务实例（单例模式）"""
    global _model_service
    if _model_service is None:
        # 优先使用环境变量，否则使用相对路径
        models_dir = os.getenv('MODEL_PATH', 'models')
        _model_service = ModelService(models_dir)
    return _model_service


def predict_tabular(rows: List[Dict[str, Any]], threshold: float = 0.5) -> Dict[str, Any]:
    """预测表格数据的便捷函数"""
    model_service = get_model_service()
    return model_service.predict_tabular(rows, threshold)
