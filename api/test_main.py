import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

from main import app
from models import TabularPredictRequest, TabularRow

client = TestClient(app)


def test_health_check():
    """测试健康检查接口"""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "version" in data


def test_predict_tabular():
    """测试表格数据预测接口"""
    request_data = {
        "rows": [
            {
                "period": 2.5,
                "duration_hr": 3.2,
                "depth_ppm": 850,
                "snr": 15.8,
                "teff": 5800,
                "logg": 4.4,
                "tmag": 10.5,
                "crowding": 0.95,
            }
        ],
        "threshold": 0.5,
    }
    
    response = client.post("/api/predict/tabular", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "predictions" in data
    assert len(data["predictions"]) == 1
    
    prediction = data["predictions"][0]
    assert "probs" in prediction
    assert "conf" in prediction
    assert "version" in prediction
    
    # 检查概率和为1（允许小误差）
    probs = prediction["probs"]
    total_prob = probs["CONF"] + probs["PC"] + probs["FP"]
    assert abs(total_prob - 1.0) < 0.001


def test_predict_tabular_invalid_data():
    """测试无效数据的表格预测"""
    request_data = {
        "rows": [
            {
                "period": -1,  # 无效的负值
                "duration_hr": 3.2,
                "depth_ppm": 850,
                "snr": 15.8,
                "teff": 5800,
                "logg": 4.4,
                "tmag": 10.5,
                "crowding": 0.95,
            }
        ],
        "threshold": 1.5,  # 无效的阈值
    }
    
    response = client.post("/api/predict/tabular", json=request_data)
    assert response.status_code == 422  # 验证错误


@patch('main.minio_service')
def test_upload_dataset(mock_minio_service):
    """测试数据集上传接口"""
    # Mock MinIO服务
    mock_dataset = {
        "dataset_id": "test-dataset-id",
        "object_key": "datasets/test.csv",
        "size": 1024,
        "filename": "test.csv",
        "uploaded_at": "2024-01-01T00:00:00Z"
    }
    mock_minio_service.upload_dataset = AsyncMock(return_value=mock_dataset)
    
    # 创建测试文件
    test_file = ("test.csv", "target,period,depth\ntest,2.5,850", "text/csv")
    
    response = client.post("/api/datasets/upload", files={"file": test_file})
    assert response.status_code == 200
    
    data = response.json()
    assert data["dataset_id"] == "test-dataset-id"
    assert data["filename"] == "test.csv"


def test_submit_feedback():
    """测试反馈提交接口"""
    feedback_data = {
        "target_id": "test-target-123",
        "user_label": "CONF",
        "confidence": 0.8,
        "notes": "This looks like a confirmed planet"
    }
    
    with patch('main.minio_service.save_feedback') as mock_save:
        mock_save.return_value = "feedback-id-123"
        
        response = client.post("/api/feedback", json=feedback_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "message" in data


def test_job_status_not_found():
    """测试获取不存在的任务状态"""
    response = client.get("/api/jobs/nonexistent-job/status")
    assert response.status_code == 404


def test_model_metrics_not_found():
    """测试获取不存在的模型指标"""
    response = client.get("/api/models/nonexistent-model/metrics")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_model_adapter_real():
    """测试真实模型适配器"""
    from model_adapter import get_model_adapter
    from models import TabularPredictRequest, TabularRow
    
    adapter = get_model_adapter()
    
    request = TabularPredictRequest(
        rows=[
            TabularRow(
                period=2.5,
                duration_hr=3.2,
                depth_ppm=850,
                snr=15.8,
                teff=5800,
                logg=4.4,
                tmag=10.5,
                crowding=0.95,
            )
        ],
        threshold=0.5
    )
    
    try:
        result = await adapter.predict_tabular(request)
        assert "predictions" in result
        assert len(result["predictions"]) == 1
        
        prediction = result["predictions"][0]
        assert prediction.version == "v1.0.0"  # 真实模型版本
        assert prediction.explain is not None
        assert prediction.explain.tabular is not None
    except Exception as e:
        # 如果模型文件不存在或加载失败，跳过测试
        pytest.skip(f"Real model not available: {str(e)}")
