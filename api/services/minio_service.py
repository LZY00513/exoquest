import uuid
import aiofiles
import logging
from datetime import datetime, timedelta
from typing import Optional
from minio import Minio
from minio.error import S3Error
from fastapi import UploadFile, HTTPException

from config import settings
from models import Dataset

logger = logging.getLogger(__name__)


class MinIOService:
    """MinIO对象存储服务"""
    
    def __init__(self):
        try:
            self.client = Minio(
                settings.minio_endpoint,
                access_key=settings.minio_access_key,
                secret_key=settings.minio_secret_key,
                secure=settings.minio_secure
            )
            self._ensure_buckets()
            self.available = True
        except Exception as e:
            print(f"MinIO service unavailable, running in mock mode: {e}")
            self.client = None
            self.available = False
    
    def _ensure_buckets(self):
        """确保必要的存储桶存在"""
        if not self.client:
            return
            
        buckets = [
            settings.minio_bucket_datasets,
            settings.minio_bucket_reports,
            settings.minio_bucket_feedback
        ]
        
        for bucket in buckets:
            try:
                if not self.client.bucket_exists(bucket):
                    self.client.make_bucket(bucket)
                    print(f"Created bucket: {bucket}")
            except S3Error as e:
                print(f"Error creating bucket {bucket}: {e}")
            except Exception as e:
                print(f"MinIO unavailable, skipping bucket creation: {e}")
                break
    
    async def upload_dataset(self, file: UploadFile) -> Dataset:
        """上传数据集文件"""
        # 如果MinIO不可用，返回模拟数据
        if not self.available:
            return Dataset(
                dataset_id=f"mock-{uuid.uuid4()}",
                object_key=f"mock/{file.filename}",
                size=file.size or 0,
                filename=file.filename or "unknown",
                uploaded_at=datetime.utcnow().isoformat()
            )
        
        # 验证文件类型
        if not any(file.filename.lower().endswith(ext) for ext in settings.allowed_file_types):
            raise HTTPException(
                status_code=400,
                detail=f"不支持的文件类型。允许的类型: {', '.join(settings.allowed_file_types)}"
            )
        
        # 读取文件内容
        content = await file.read()
        file_size = len(content)
        
        # 检查文件大小
        if file_size > settings.max_file_size:
            raise HTTPException(
                status_code=400,
                detail=f"文件大小超过限制 ({settings.max_file_size / 1024 / 1024:.1f}MB)"
            )
        
        # 生成唯一的数据集ID和对象键
        dataset_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'txt'
        object_key = f"datasets/{timestamp}_{dataset_id}.{file_extension}"
        
        try:
            # 上传文件到MinIO
            from io import BytesIO
            self.client.put_object(
                settings.minio_bucket_datasets,
                object_key,
                BytesIO(content),
                length=file_size,
                content_type=file.content_type or 'application/octet-stream'
            )
            
            return Dataset(
                dataset_id=dataset_id,
                object_key=object_key,
                size=file_size,
                filename=file.filename,
                uploaded_at=datetime.utcnow()
            )
            
        except S3Error as e:
            raise HTTPException(status_code=500, detail=f"文件上传失败: {str(e)}")
    
    async def get_dataset_content(self, dataset_id: str) -> str:
        """获取数据集内容"""
        # 如果MinIO不可用，返回模拟数据
        if not self.available:
            # 返回模拟的CSV数据
            mock_csv = """target_name,koi_period,koi_duration,koi_depth,koi_model_snr,koi_steff,koi_slogg,koi_kepmag,koi_impact,koi_prad,koi_teq,koi_insol,koi_tce_plnt_num,koi_srad,ra,dec,crowding
KIC-10000001,10.0,0.5,1000,15.0,5778,4.44,12.0,0.01,1.0,300.0,1000.0,1,1.0,180.0,0.0,0.9
KIC-10000002,15.2,0.8,850,12.5,5500,4.2,14.1,0.015,0.8,280.0,750.0,1,0.9,185.0,5.0,0.85
KIC-10000003,8.5,0.3,1200,18.2,6000,4.5,11.8,0.008,1.2,320.0,1200.0,1,1.1,175.0,-2.0,0.92"""
            return mock_csv
        
        # 尝试通过dataset_id查找文件
        # 由于没有数据库，我们需要搜索所有文件来找到匹配的
        try:
            # 列出所有对象
            objects = self.client.list_objects(settings.minio_bucket_datasets, recursive=True)
            for obj in objects:
                # 如果object key包含dataset_id，就使用这个文件
                if dataset_id in obj.object_name:
                    response = self.client.get_object(settings.minio_bucket_datasets, obj.object_name)
                    content = response.read().decode('utf-8')
                    response.close()
                    response.release_conn()
                    return content
            
            # 如果没找到，抛出异常
            raise HTTPException(
                status_code=404,
                detail=f"Dataset not found: {dataset_id}"
            )
        except Exception as e:
            logger.error(f"Failed to get dataset content from MinIO: {e}")
            raise HTTPException(
                status_code=404,
                detail=f"Dataset not found: {dataset_id}"
            )
    
    def get_presigned_url(self, bucket: str, object_key: str, expires: timedelta = timedelta(hours=1)) -> str:
        """生成预签名URL"""
        try:
            return self.client.presigned_get_object(bucket, object_key, expires=expires)
        except S3Error as e:
            raise HTTPException(status_code=500, detail=f"生成预签名URL失败: {str(e)}")
    
    async def save_feedback(self, feedback_data: dict) -> str:
        """保存用户反馈数据"""
        feedback_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        object_key = f"feedback/{timestamp}_{feedback_id}.json"
        
        try:
            import json
            from io import BytesIO
            
            # 添加时间戳
            feedback_data['created_at'] = datetime.utcnow().isoformat()
            feedback_data['feedback_id'] = feedback_id
            
            content = json.dumps(feedback_data, indent=2).encode('utf-8')
            
            self.client.put_object(
                settings.minio_bucket_feedback,
                object_key,
                BytesIO(content),
                length=len(content),
                content_type='application/json'
            )
            
            return feedback_id
            
        except S3Error as e:
            raise HTTPException(status_code=500, detail=f"保存反馈失败: {str(e)}")
    
    def download_object(self, bucket: str, object_key: str) -> bytes:
        """下载对象内容"""
        try:
            response = self.client.get_object(bucket, object_key)
            return response.read()
        except S3Error as e:
            raise HTTPException(status_code=404, detail=f"对象不存在: {str(e)}")
    
    def list_objects(self, bucket: str, prefix: str = "") -> list:
        """列出对象"""
        try:
            objects = self.client.list_objects(bucket, prefix=prefix)
            return [obj.object_name for obj in objects]
        except S3Error as e:
            raise HTTPException(status_code=500, detail=f"列出对象失败: {str(e)}")
    
    def delete_object(self, bucket: str, object_key: str):
        """删除对象"""
        try:
            self.client.remove_object(bucket, object_key)
        except S3Error as e:
            raise HTTPException(status_code=500, detail=f"删除对象失败: {str(e)}")


# 全局MinIO服务实例
minio_service = MinIOService()
