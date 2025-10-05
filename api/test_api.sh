#!/bin/bash

# ExoQuest Platform API 测试脚本
# 用于验证API端点的功能

BASE_URL="http://localhost:8000"
API_BASE_URL="${BASE_URL}/api"

echo "🚀 开始测试 ExoQuest Platform API"
echo "=================================="

# 1. 健康检查
echo "1. 测试健康检查端点..."
curl -s -X GET "${BASE_URL}/health" | jq '.' || echo "健康检查失败"
echo ""

# 2. API健康检查
echo "2. 测试API健康检查端点..."
curl -s -X GET "${API_BASE_URL}/health" | jq '.' || echo "API健康检查失败"
echo ""

# 3. 表格数据预测测试
echo "3. 测试表格数据预测..."
curl -s -X POST "${API_BASE_URL}/predict/tabular" \
  -H "Content-Type: application/json" \
  -d '{
    "rows": [
      {
        "period": 2.5,
        "duration_hr": 3.2,
        "depth_ppm": 850,
        "snr": 15.8,
        "teff": 5800,
        "logg": 4.4,
        "tmag": 10.5,
        "crowding": 0.95
      },
      {
        "period": 1.8,
        "duration_hr": 2.1,
        "depth_ppm": 450,
        "snr": 8.2,
        "teff": 5200,
        "logg": 4.2,
        "tmag": 12.3,
        "crowding": 0.88
      }
    ],
    "threshold": 0.5
  }' | jq '.' || echo "表格预测失败"
echo ""

# 4. 光变曲线预测测试
echo "4. 测试光变曲线预测..."
curl -s -X POST "${API_BASE_URL}/predict/curve" \
  -H "Content-Type: application/json" \
  -d '{
    "curve": [1.0, 0.98, 0.96, 0.94, 0.92, 0.90, 0.88, 0.86, 0.84, 0.82, 0.80, 0.82, 0.84, 0.86, 0.88, 0.90, 0.92, 0.94, 0.96, 0.98, 1.0],
    "threshold": 0.5
  }' | jq '.' || echo "曲线预测失败"
echo ""

# 5. 融合预测测试
echo "5. 测试融合预测..."
curl -s -X POST "${API_BASE_URL}/predict/fuse" \
  -H "Content-Type: application/json" \
  -d '{
    "tabular_data": {
      "period": 3.1,
      "duration_hr": 2.8,
      "depth_ppm": 720,
      "snr": 12.5,
      "teff": 5600,
      "logg": 4.3,
      "tmag": 11.2,
      "crowding": 0.92
    },
    "curve_data": [1.0, 0.99, 0.97, 0.95, 0.93, 0.91, 0.89, 0.87, 0.85, 0.83, 0.81, 0.83, 0.85, 0.87, 0.89, 0.91, 0.93, 0.95, 0.97, 0.99, 1.0],
    "alpha": 0.7,
    "threshold": 0.6
  }' | jq '.' || echo "融合预测失败"
echo ""

# 6. 开始训练测试
echo "6. 测试开始训练..."
TRAINING_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/train" \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_id": "test_dataset",
    "config": {
      "model_type": "catboost",
      "max_depth": 6,
      "learning_rate": 0.1,
      "iterations": 1000
    }
  }')

echo "$TRAINING_RESPONSE" | jq '.' || echo "训练启动失败"
echo ""

# 提取job_id用于后续测试
JOB_ID=$(echo "$TRAINING_RESPONSE" | jq -r '.job_id // empty')

if [ -n "$JOB_ID" ] && [ "$JOB_ID" != "null" ]; then
    echo "7. 测试获取训练状态 (Job ID: $JOB_ID)..."
    curl -s -X GET "${API_BASE_URL}/jobs/${JOB_ID}/status" | jq '.' || echo "获取训练状态失败"
    echo ""
    
    echo "8. 测试获取模型指标..."
    curl -s -X GET "${API_BASE_URL}/models/${JOB_ID}/metrics" | jq '.' || echo "获取模型指标失败"
    echo ""
else
    echo "7. 跳过训练状态测试（未获取到有效的Job ID）"
    echo "8. 跳过模型指标测试（未获取到有效的Job ID）"
fi

# 9. 反馈提交测试
echo "9. 测试反馈提交..."
curl -s -X POST "${API_BASE_URL}/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "target_id": "test_target_001",
    "user_label": "CONF",
    "confidence": 0.85,
    "notes": "这是一个测试反馈，通过API测试脚本提交"
  }' | jq '.' || echo "反馈提交失败"
echo ""

echo "✅ API测试完成！"
echo "=================================="
echo ""
echo "💡 提示："
echo "- 如果某些测试失败，请检查服务器是否正在运行"
echo "- 确保所有依赖服务（Redis、MinIO）都已启动"
echo "- 检查模型文件是否存在于 /models/ 目录中"
echo ""
echo "🔧 环境变量示例："
# 使用真实模型进行测试
echo "export MODEL_BASE_URL=http://localhost:8000"
echo "export VITE_API_BASE_URL=http://localhost:8000/api"
echo "export MINIO_ENDPOINT=http://localhost:9000"
echo "export MINIO_ACCESS_KEY=minioadmin"
echo "export MINIO_SECRET_KEY=minioadmin"
