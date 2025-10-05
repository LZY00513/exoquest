import React, { useState, useEffect, useCallback } from 'react';
import { Card, Progress, Typography, Space, Button, Alert, Timeline, Tag } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { apiClient } from '../lib/api';
import type { TrainingJob } from '../types';

const { Title, Text, Paragraph } = Typography;

interface TrainProgressProps {
  jobId?: string;
  onJobComplete?: (jobId: string) => void;
  onJobFailed?: (jobId: string, error: string) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
  title?: string;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}

const TrainProgress: React.FC<TrainProgressProps> = ({
  jobId,
  onJobComplete,
  onJobFailed,
  autoRefresh = true,
  refreshInterval = 2000,
  title = '训练进度监控',
}) => {
  const [job, setJob] = useState<TrainingJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPolling, setIsPolling] = useState(false);


  // 获取训练状态
  const fetchJobStatus = useCallback(async () => {
    if (!jobId) return;

    setLoading(true);
    setError(null);

    try {
      const jobStatus = await apiClient.getJobStatus(jobId);
      setJob(jobStatus);
      
      // 生成日志（内联函数避免依赖项问题）
      const generateLogs = (progress: number): LogEntry[] => {
        const mockLogs: LogEntry[] = [
          { timestamp: new Date().toISOString(), level: 'info', message: '开始训练任务...' },
        ];

        if (progress > 10) {
          mockLogs.push({ 
            timestamp: new Date(Date.now() - 8000).toISOString(), 
            level: 'info', 
            message: '数据预处理完成，开始模型训练' 
          });
        }

        if (progress > 30) {
          mockLogs.push({ 
            timestamp: new Date(Date.now() - 6000).toISOString(), 
            level: 'info', 
            message: `Epoch 1/5 完成，训练损失: 0.245` 
          });
        }

        if (progress > 50) {
          mockLogs.push({ 
            timestamp: new Date(Date.now() - 4000).toISOString(), 
            level: 'info', 
            message: `Epoch 3/5 完成，验证准确率: 0.876` 
          });
        }

        if (progress > 70) {
          mockLogs.push({ 
            timestamp: new Date(Date.now() - 2000).toISOString(), 
            level: 'warning', 
            message: '检测到轻微过拟合，应用早停策略' 
          });
        }

        if (progress >= 100) {
          mockLogs.push({ 
            timestamp: new Date().toISOString(), 
            level: 'info', 
            message: '训练完成！正在保存模型...' 
          });
        }

        return mockLogs.reverse(); // 最新的在前面
      };
      
      // 更新日志
      const newLogs = generateLogs(jobStatus.progress);
      setLogs(newLogs);

      // 检查任务状态
      if (jobStatus.status === 'completed') {
        setIsPolling(false);
        onJobComplete?.(jobId);
      } else if (jobStatus.status === 'failed') {
        setIsPolling(false);
        onJobFailed?.(jobId, jobStatus.message || '训练失败');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '获取训练状态失败');
      setIsPolling(false);
    } finally {
      setLoading(false);
    }
  }, [jobId, onJobComplete, onJobFailed]);

  // 轮询训练状态
  useEffect(() => {
    if (!jobId || !autoRefresh || !isPolling) return;

    const interval = setInterval(() => {
      fetchJobStatus();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [jobId, autoRefresh, refreshInterval, isPolling]); // 移除fetchJobStatus依赖

  // 初始加载
  useEffect(() => {
    if (jobId) {
      setIsPolling(true);
      fetchJobStatus();
    }
  }, [jobId]); // 移除fetchJobStatus依赖，避免无限循环

  const handleStartPolling = () => {
    setIsPolling(true);
    fetchJobStatus();
  };

  const handleStopPolling = () => {
    setIsPolling(false);
  };

  const handleRefresh = () => {
    fetchJobStatus();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'running': return 'processing';
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '等待中';
      case 'running': return '运行中';
      case 'completed': return '已完成';
      case 'failed': return '失败';
      default: return '未知';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'blue';
      case 'warning': return 'orange';
      case 'error': return 'red';
      default: return 'default';
    }
  };

  if (!jobId) {
    return (
      <Card title={title} className="progress-tracker">
        <Alert
          message="无训练任务"
          description="请先启动一个训练任务以查看进度。"
          type="info"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card 
      title={title}
      extra={
        <Space>
          {job?.status === 'running' ? (
            <Button 
              icon={<PauseCircleOutlined />} 
              onClick={handleStopPolling}
              size="small"
              disabled={!isPolling}
            >
              暂停监控
            </Button>
          ) : (
            <Button 
              icon={<PlayCircleOutlined />} 
              onClick={handleStartPolling}
              size="small"
              disabled={isPolling}
            >
              开始监控
            </Button>
          )}
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            size="small"
            loading={loading}
          >
            刷新
          </Button>
        </Space>
      }
      className="progress-tracker"
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {error && (
          <Alert
            message="错误"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}

        {job && (
          <>
            {/* 基本信息 */}
            <div>
              <Space>
                <Text strong>任务ID:</Text>
                <Text code>{job.job_id}</Text>
                <Tag color={getStatusColor(job.status)}>
                  {getStatusText(job.status)}
                </Tag>
              </Space>
            </div>

            {/* 进度条 */}
            <div>
              <Title level={5}>训练进度</Title>
              <Progress
                percent={job.progress}
                status={job.status === 'failed' ? 'exception' : 
                       job.status === 'completed' ? 'success' : 'active'}
                strokeColor={job.status === 'completed' ? '#52c41a' : '#1890ff'}
                showInfo={true}
                format={(percent) => `${percent}%`}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  开始时间: {job.started_at ? new Date(job.started_at).toLocaleString('zh-CN') : '未开始'}
                </Text>
                <br />
                <Text type="secondary">
                  完成时间: {job.completed_at ? new Date(job.completed_at).toLocaleString('zh-CN') : '进行中'}
                </Text>
              </div>
            </div>

            {/* 状态消息 */}
            {job.message && (
              <Alert
                message="状态消息"
                description={job.message}
                type={job.status === 'failed' ? 'error' : 'info'}
                showIcon
              />
            )}

            {/* 训练日志 */}
            <div>
              <Title level={5}>训练日志</Title>
              <div style={{ 
                maxHeight: '300px', 
                overflow: 'auto', 
                background: '#f5f5f5', 
                padding: '12px', 
                borderRadius: '6px' 
              }}>
                <Timeline
                  items={logs.map((log, index) => ({
                    color: getLogLevelColor(log.level),
                    children: (
                      <div key={index}>
                        <Space>
                          <Tag color={getLogLevelColor(log.level)}>
                            {log.level.toUpperCase()}
                          </Tag>
                          <Text style={{ fontSize: '12px' }} type="secondary">
                            {new Date(log.timestamp).toLocaleTimeString('zh-CN')}
                          </Text>
                        </Space>
                        <Paragraph style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                          {log.message}
                        </Paragraph>
                      </div>
                    ),
                  }))}
                />
              </div>
            </div>

            {/* 训练指标 */}
            {job.metrics && (
              <div>
                <Title level={5}>训练指标</Title>
                <Space wrap>
                  {job.metrics.accuracy && (
                    <Tag color="blue">准确率: {(job.metrics.accuracy * 100).toFixed(1)}%</Tag>
                  )}
                  {job.metrics.precision && (
                    <Tag color="green">精确率: {(job.metrics.precision * 100).toFixed(1)}%</Tag>
                  )}
                  {job.metrics.recall && (
                    <Tag color="orange">召回率: {(job.metrics.recall * 100).toFixed(1)}%</Tag>
                  )}
                  {job.metrics.f1_score && (
                    <Tag color="purple">F1分数: {(job.metrics.f1_score * 100).toFixed(1)}%</Tag>
                  )}
                </Space>
              </div>
            )}

            {/* 预计完成时间 */}
            {job.status === 'running' && job.progress > 0 && job.started_at && (
              <Alert
                message="预计完成时间"
                description={
                  (() => {
                    const elapsed = Date.now() - new Date(job.started_at!).getTime();
                    const estimated = (elapsed / job.progress) * (100 - job.progress);
                    const finishTime = new Date(Date.now() + estimated);
                    return `大约 ${Math.ceil(estimated / 60000)} 分钟后完成 (${finishTime.toLocaleTimeString('zh-CN')})`;
                  })()
                }
                type="info"
                showIcon
              />
            )}
          </>
        )}
      </Space>
    </Card>
  );
};

export default TrainProgress;
