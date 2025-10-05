import React, { useState, useCallback } from 'react';
import { Card, Upload, Button, message, Typography, Progress, Space } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd/es/upload/interface';
import { apiClient } from '../lib/api';
import type { Dataset } from '../types';

const { Dragger } = Upload;
const { Text, Title } = Typography;

interface UploadCardProps {
  onUploadSuccess?: (dataset: Dataset) => void;
  accept?: string;
  maxSize?: number; // MB
  title?: string;
  description?: string;
}

const UploadCard: React.FC<UploadCardProps> = ({
  onUploadSuccess,
  accept = '.csv,.json,.txt',
  maxSize = 100,
  title = 'Upload Dataset',
  description = 'Supports CSV, JSON format files, up to 100MB',
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDataset, setUploadedDataset] = useState<Dataset | null>(null);

  const handleUpload = useCallback(async (file: File) => {
    // 文件大小检查
    if (file.size > maxSize * 1024 * 1024) {
      message.error(`File size cannot exceed ${maxSize}MB`);
      return false;
    }

    // 文件类型检查
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      message.error(`Unsupported file type, please upload a file in ${accept} format`);
      return false;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const dataset = await apiClient.uploadDataset(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadedDataset(dataset);
      
      message.success('File uploaded successfully!');
      onUploadSuccess?.(dataset);
      
    } catch (error) {
      console.error('Upload failed:', error);
      message.error('File upload failed, please try again');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }

    return false; // 阻止默认上传行为
  }, [accept, maxSize, onUploadSuccess]);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept,
    beforeUpload: handleUpload,
    showUploadList: false,
    disabled: uploading,
  };

  if (uploadedDataset) {
    return (
      <Card title="Upload Successful" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Filename:</Text>
            <Text>{uploadedDataset.filename}</Text>
          </div>
          <div>
            <Text strong>Dataset ID:</Text>
            <Text code>{uploadedDataset.dataset_id}</Text>
          </div>
          <div>
            <Text strong>Object Key:</Text>
            <Text code>{uploadedDataset.object_key}</Text>
          </div>
          <div>
            <Text strong>File Size:</Text>
            <Text>{(uploadedDataset.size / 1024 / 1024).toFixed(2)} MB</Text>
          </div>
          <div>
            <Text strong>Upload Time:</Text>
            <Text>{new Date(uploadedDataset.uploaded_at).toLocaleString('zh-CN')}</Text>
          </div>
          <Button 
            type="link" 
            onClick={() => setUploadedDataset(null)}
            style={{ padding: 0 }}
          >
            Re-upload
          </Button>
        </Space>
      </Card>
    );
  }

  return (
    <Card title={title} style={{ marginBottom: 16 }}>
      {uploading && (
        <div style={{ marginBottom: 16 }}>
          <Progress percent={uploadProgress} status="active" />
          <Text type="secondary">Uploading file...</Text>
        </div>
      )}
      
      <Dragger {...uploadProps} className="upload-card">
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
        </p>
        <p className="ant-upload-text">
          Click or drag files to this area to upload
        </p>
        <p className="ant-upload-hint">
          {description}
        </p>
        <Button icon={<UploadOutlined />} disabled={uploading}>
          Select File
        </Button>
      </Dragger>
    </Card>
  );
};

export default UploadCard;
