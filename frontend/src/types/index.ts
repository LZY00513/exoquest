// 数据类型定义
export interface ExoplanetPrediction {
  object_id?: string; // 添加目标ID字段，用于存储kepoi_name等
  probs: {
    // 支持二分类和多分类
    POSITIVE?: number;  // 二分类正例概率
    NEGATIVE?: number;  // 二分类负例概率
    CONF?: number;      // 多分类确认行星概率
    PC?: number;        // 多分类候选行星概率
    FP?: number;        // 多分类假阳性概率
  };
  conf: number;
  version: string;
  explain?: {
    tabular?: {
      shap: Array<[string, number]>;
    };
  };
  importance?: number[];
}

export interface TabularPredictRequest {
  rows: Array<{
    period: number;
    duration_hr: number;
    depth_ppm: number;
    snr: number;
    teff: number;
    logg: number;
    tmag: number;
    crowding: number;
  }>;
  threshold: number;
}

export interface CurvePredictRequest {
  curve: number[];
  time?: number[];
  threshold: number;
}

export interface FusePredictRequest {
  tabular_data: TabularPredictRequest['rows'][0];
  curve_data: number[];
  alpha?: number;
  threshold: number;
}

export interface TrainingJob {
  job_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  message?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  metrics?: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1_score?: number;
  };
}

export interface ModelMetrics {
  pr_auc: number;
  mcc: number;
  ece: number;
  confusion: {
    tp: number;
    fp: number;
    tn: number;
    fn: number;
  };
  plots: {
    pr_png: string;
    calib_png: string;
  };
}

export interface Dataset {
  dataset_id: string;
  object_key: string;
  size: number;
  filename: string;
  uploaded_at: string;
}

export interface FeedbackData {
  target_id: string;
  user_label: 'CONF' | 'PC' | 'FP';
  confidence: number;
  notes?: string;
}
