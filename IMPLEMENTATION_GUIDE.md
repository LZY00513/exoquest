# ExoQuest Platform 实现指南

## 🎯 项目概述

本实现完成了ExoQuest平台的端到端集成，将训练好的机器学习模型（CatBoost/LightGBM）与React前端界面连接起来。

## 📁 新增文件

### 后端文件
- `/api/ml/model_service.py` - 模型服务模块，加载和运行训练好的模型
- `/api/test_api.sh` - API测试脚本
- `/api/env.example` - 环境变量配置示例

### 前端文件
- `/frontend/env.example` - 前端环境变量配置示例

## 🔧 修改的文件

### 后端修改
1. **`/api/model_adapter.py`**
   - 添加了真实模型适配器类 `RealModelAdapter`
   - 集成了本地模型服务
   - 支持Mock和真实模型切换

2. **`/api/config.py`**
   - 添加了 `model_path` 配置项
   - 更新了默认配置

3. **`/api/main.py`**
   - 添加了根路径的 `/health` 端点

### 前端修改
1. **`/src/lib/api.ts`**
   - 添加了 `predictTabularWithThreshold` 函数

2. **`/src/components/ShapBar.tsx`**
   - 支持直接传入SHAP数据数组
   - 改进了数据处理逻辑

3. **`/src/components/ThresholdDial.tsx`**
   - 支持实时处理预测结果
   - 添加了分类标签计算

4. **`/src/pages/ExplorePage.tsx`**
   - 集成了所有组件
   - 实现了完整的预测流程

## 🚀 使用方法

### 1. 环境配置

#### 后端配置
```bash
# 复制环境变量示例文件
cp /api/env.example /api/.env

# 编辑配置文件
USE_MODEL_MOCK=false  # 使用真实模型
MODEL_PATH=/models    # 模型文件路径
```

#### 前端配置
```bash
# 复制环境变量示例文件
cp /frontend/env.example /frontend/.env.local

# 编辑配置文件
VITE_API_BASE_URL=http://localhost:8000/api
```

### 2. 模型文件准备

将训练好的模型文件放置在 `/models/` 目录下：

```
/models/
├── best_model.cbm          # CatBoost模型文件
├── features.json           # 特征列表
└── scaler_params.json      # 标准化参数
```

#### features.json 示例：
```json
[
  "period", "duration_hr", "depth_ppm", "snr",
  "teff", "logg", "tmag", "crowding"
]
```

#### scaler_params.json 示例：
```json
{
  "mean_": [2.5, 3.0, 800.0, 12.0, 5500.0, 4.3, 11.0, 0.9],
  "scale_": [1.0, 1.0, 200.0, 5.0, 500.0, 0.2, 2.0, 0.1]
}
```

### 3. 安装依赖

#### 后端依赖
```bash
cd /api
pip install catboost lightgbm shap pandas numpy
```

#### 前端依赖
```bash
cd /frontend
npm install
```

### 4. 启动服务

#### 启动后端
```bash
cd /api
python main.py
```

#### 启动前端
```bash
cd /frontend
npm run dev
```

### 5. 测试API

运行测试脚本：
```bash
cd /api
./test_api.sh
```

## 📊 API响应格式

### 表格预测响应
```json
{
  "predictions": [
    {
      "probs": {
        "CONF": 0.73,
        "PC": 0.18,
        "FP": 0.09
      },
      "conf": 0.73,
      "version": "v1.0.0",
      "explain": {
        "tabular": {
          "shap": [
            ["depth_ppm", 0.31],
            ["snr", 0.22],
            ["period", 0.17]
          ]
        }
      }
    }
  ]
}
```

## 🎨 前端功能

### 1. ShapBar组件
- 显示特征重要性条形图
- 支持全局和局部SHAP值
- 自动处理传入的SHAP数据

### 2. ThresholdDial组件
- 实时调整决策阈值
- 显示性能指标（精确率、召回率、F1分数、MCC）
- 混淆矩阵可视化
- 支持预测结果实时分类

### 3. ExplorePage页面
- 完整的预测流程
- 集成所有组件
- 支持真实数据和示例数据

## 🔄 Mock vs 真实模型切换

### 使用Mock模式（开发/演示）
```bash
export USE_MODEL_MOCK=true
```

### 使用真实模型（生产）
```bash
export USE_MODEL_MOCK=false
```

## 🧪 测试命令示例

### 健康检查
```bash
curl http://localhost:8000/health
```

### 表格预测
```bash
curl -X POST http://localhost:8000/api/predict/tabular \
  -H "Content-Type: application/json" \
  -d '{
    "rows": [{
      "period": 2.5,
      "duration_hr": 3.2,
      "depth_ppm": 850,
      "snr": 15.8,
      "teff": 5800,
      "logg": 4.4,
      "tmag": 10.5,
      "crowding": 0.95
    }],
    "threshold": 0.5
  }'
```

## 🐛 故障排除

### 常见问题

1. **模型加载失败**
   - 检查模型文件路径
   - 确认模型文件格式正确
   - 检查依赖库是否安装

2. **API连接失败**
   - 检查后端服务是否启动
   - 确认端口配置正确
   - 检查CORS设置

3. **前端显示异常**
   - 检查环境变量配置
   - 确认API基础URL正确
   - 检查浏览器控制台错误

### 日志查看
```bash
# 后端日志
tail -f /api/logs/app.log

# 前端开发日志
npm run dev -- --verbose
```

## 📈 性能优化

1. **模型加载优化**
   - 使用单例模式避免重复加载
   - 预加载模型到内存

2. **API响应优化**
   - 添加缓存机制
   - 异步处理大数据集

3. **前端渲染优化**
   - 使用React.memo优化组件
   - 实现虚拟滚动处理大量数据

## 🔐 安全考虑

1. **API安全**
   - 添加请求限流
   - 实现API密钥认证
   - 输入数据验证

2. **数据安全**
   - 敏感数据加密
   - 安全的文件上传
   - 访问日志记录

## 📝 后续开发建议

1. **功能扩展**
   - 添加更多模型类型支持
   - 实现批量预测
   - 添加模型版本管理

2. **用户体验**
   - 添加进度指示器
   - 实现结果导出功能
   - 添加历史记录查看

3. **监控和运维**
   - 添加性能监控
   - 实现健康检查
   - 添加错误报告机制

---

## 🎉 总结

本实现完成了ExoQuest平台的完整集成，包括：

✅ 模型服务模块 - 加载和运行训练好的模型  
✅ 模型适配器 - Mock和真实模型切换  
✅ API端点 - 完整的预测接口  
✅ 前端组件 - ShapBar和ThresholdDial  
✅ 页面集成 - 完整的用户体验  
✅ 测试脚本 - API功能验证  
✅ 配置示例 - 环境变量模板  

现在您可以：
1. 将训练好的模型文件放入 `/models/` 目录
2. 配置环境变量
3. 启动服务
4. 在浏览器中体验完整的系外行星检测流程
