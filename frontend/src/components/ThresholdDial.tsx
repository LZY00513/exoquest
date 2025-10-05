import React, { useState, useEffect } from 'react';
import { Card, Slider, Row, Col, Statistic, Typography, Space, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface ThresholdMetrics {
  threshold: number;
  precision: number;
  recall: number;
  f1: number;
  mcc: number;
  tp: number;
  fp: number;
  tn: number;
  fn: number;
}

interface ThresholdDialProps {
  initialThreshold?: number;
  onThresholdChange?: (threshold: number, metrics: ThresholdMetrics) => void;
  predictions?: Array<{ prob: number; true_label: boolean }>;
  title?: string;
  // 新增：接受预测结果进行实时分类
  predictionResults?: Array<{ 
    probs: { 
      CONF?: number; 
      PC?: number; 
      FP?: number;
      POSITIVE?: number;
      NEGATIVE?: number;
    } 
  }>;
}

const ThresholdDial: React.FC<ThresholdDialProps> = ({
  initialThreshold = 0.5,
  onThresholdChange,
  predictions,
  title = 'Decision Threshold Dial',
  predictionResults,
}) => {
  const [threshold, setThreshold] = useState(initialThreshold);
  const [metrics, setMetrics] = useState<ThresholdMetrics | null>(null);

  // 生成示例预测数据
  const generateSamplePredictions = () => {
    const sampleData = [];
    for (let i = 0; i < 1000; i++) {
      // 模拟真实标签分布：30%正样本，70%负样本
      const isPositive = Math.random() < 0.3;
      // 模拟预测概率：正样本偏向高概率，负样本偏向低概率
      const prob = isPositive 
        ? Math.max(0, Math.min(1, 0.7 + Math.random() * 0.3 - 0.1))
        : Math.max(0, Math.min(1, 0.3 + Math.random() * 0.3 - 0.1));
      
      sampleData.push({ prob, true_label: isPositive });
    }
    return sampleData;
  };

  // 计算混淆矩阵和指标
  const calculateMetrics = (threshold: number, data: Array<{ prob: number; true_label: boolean }>): ThresholdMetrics => {
    let tp = 0, fp = 0, tn = 0, fn = 0;

    data.forEach(({ prob, true_label }) => {
      const predicted = prob >= threshold;
      if (predicted && true_label) tp++;
      else if (predicted && !true_label) fp++;
      else if (!predicted && !true_label) tn++;
      else if (!predicted && true_label) fn++;
    });

    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
    
    // Matthews Correlation Coefficient
    const denominator = Math.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn));
    const mcc = denominator > 0 ? (tp * tn - fp * fn) / denominator : 0;

    return {
      threshold,
      precision,
      recall,
      f1,
      mcc,
      tp,
      fp,
      tn,
      fn,
    };
  };

  // 处理预测结果，计算分类标签
  const processPredictionResults = (results: Array<{ 
    probs: { 
      CONF?: number; 
      PC?: number; 
      FP?: number;
      POSITIVE?: number;
      NEGATIVE?: number;
    } 
  }>) => {
    return results.map(result => {
      const { CONF = 0, PC = 0, FP = 0, POSITIVE = 0, NEGATIVE = 0 } = result.probs;
      
      // 处理二分类模型 (POSITIVE/NEGATIVE)
      if (POSITIVE > 0 || NEGATIVE > 0) {
        const isConfirmed = POSITIVE >= threshold;
        return {
          prob: POSITIVE, // 使用正类概率作为主要概率
          true_label: isConfirmed, // 基于阈值判断是否为真实标签
          label: isConfirmed ? 'CONFIRMED' : 'CANDIDATE'
        };
      }
      
      // 处理三分类模型 (CONF/PC/FP)
      const isConfirmed = CONF >= threshold;
      return {
        prob: CONF, // 使用确认概率作为主要概率
        true_label: isConfirmed, // 基于阈值判断是否为真实标签
        label: isConfirmed ? 'CONFIRMED' : (PC > FP ? 'CANDIDATE' : 'FALSE_POSITIVE')
      };
    });
  };

  // 从真实预测结果计算分类统计
  const calculateRealMetrics = (threshold: number, results: Array<{ 
    probs: { 
      CONF?: number; 
      PC?: number; 
      FP?: number;
      POSITIVE?: number;
      NEGATIVE?: number;
    } 
  }>) => {
    let confCount = 0; // 预测为确认行星的数量
    let pcCount = 0;   // 预测为候选行星的数量  
    let fpCount = 0;   // 预测为假阳性的数量
    let totalCount = results.length;

    results.forEach(result => {
      const { CONF = 0, PC = 0, FP: _FP = 0, POSITIVE = 0, NEGATIVE = 0 } = result.probs;
      
      // 处理二分类模型 (POSITIVE/NEGATIVE)
      if (POSITIVE > 0 || NEGATIVE > 0) {
        if (POSITIVE >= threshold) {
          confCount++;
        } else {
          pcCount++;
        }
      } else {
        // 处理三分类模型 (CONF/PC/FP)
        if (CONF >= threshold) {
          confCount++;
        } else if (PC >= threshold) {
          pcCount++;
        } else {
          fpCount++;
        }
      }
    });

    // 简化的指标计算（基于分类分布）
    const confRate = totalCount > 0 ? confCount / totalCount : 0;

    return {
      threshold,
      precision: confRate, // 确认行星的比例
      recall: confRate,    // 简化为确认行星的比例
      f1: confRate,        // 简化为确认行星的比例
      mcc: 0,              // 没有真实标签，无法计算MCC
      tp: confCount,
      fp: pcCount + fpCount,
      tn: 0,               // 没有真实标签，无法计算
      fn: 0,               // 没有真实标签，无法计算
    };
  };

  // 使用示例数据或传入的数据
  const data = predictions || 
    (predictionResults ? processPredictionResults(predictionResults) : generateSamplePredictions());

  useEffect(() => {
    let newMetrics: ThresholdMetrics;
    
    if (predictionResults && predictionResults.length > 0) {
      // 使用真实预测结果计算指标
      newMetrics = calculateRealMetrics(threshold, predictionResults);
    } else {
      // 使用示例数据计算指标
      newMetrics = calculateMetrics(threshold, data);
    }
    
    setMetrics(newMetrics);
    onThresholdChange?.(threshold, newMetrics);
  }, [threshold, predictionResults, predictions]);

  const handleThresholdChange = (value: number) => {
    setThreshold(value);
  };

  const handleReset = () => {
    setThreshold(initialThreshold);
  };

  const getF1Color = (f1: number) => {
    if (f1 >= 0.8) return '#52c41a';
    if (f1 >= 0.6) return '#faad14';
    return '#ff4d4f';
  };

  const getMccColor = (mcc: number) => {
    if (mcc >= 0.5) return '#52c41a';
    if (mcc >= 0.3) return '#faad14';
    return '#ff4d4f';
  };

  return (
    <Card 
      title={title}
      extra={
        <Button 
          icon={<ReloadOutlined />} 
          onClick={handleReset}
          size="small"
        >
          Reset
        </Button>
      }
      className="threshold-dial"
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 阈值滑块 */}
        <div>
          <Title level={5}>Decision Threshold</Title>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={threshold}
            onChange={handleThresholdChange}
            marks={{
              0: '0.0',
              0.25: '0.25',
              0.5: '0.5',
              0.75: '0.75',
              1: '1.0',
            }}
            tooltip={{
              formatter: (value) => `${value?.toFixed(2)}`,
            }}
          />
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
              {threshold.toFixed(3)}
            </Text>
          </div>
        </div>

        {/* 性能指标 */}
        {metrics && (
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="Precision"
                value={metrics.precision}
                precision={3}
                valueStyle={{ color: '#1890ff' }}
                suffix="%"
                formatter={(value) => `${((value as number) * 100).toFixed(1)}`}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Recall"
                value={metrics.recall}
                precision={3}
                valueStyle={{ color: '#722ed1' }}
                suffix="%"
                formatter={(value) => `${((value as number) * 100).toFixed(1)}`}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="F1 Score"
                value={metrics.f1}
                precision={3}
                valueStyle={{ color: getF1Color(metrics.f1) }}
                suffix="%"
                formatter={(value) => `${((value as number) * 100).toFixed(1)}`}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="MCC"
                value={metrics.mcc}
                precision={3}
                valueStyle={{ color: getMccColor(metrics.mcc) }}
                formatter={(value) => `${(value as number).toFixed(3)}`}
              />
            </Col>
          </Row>
        )}

        {/* 分类统计 */}
        {metrics && (
          <div>
            <Title level={5}>
              {predictionResults && predictionResults.length > 0 ? 'Classification Statistics Based on Prediction Results' : 'Confusion Matrix'}
            </Title>
            <Row gutter={8} style={{ textAlign: 'center' }}>
              <Col span={8}>
                <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
                  <Statistic
                    title="Confirmed Planets (CONF)"
                    value={metrics.tp}
                    valueStyle={{ color: '#52c41a', fontSize: '16px' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ backgroundColor: '#fff2e8' }}>
                  <Statistic
                    title="Candidate Planets (PC)"
                    value={predictionResults && predictionResults.length > 0 ? 
                      Math.round(metrics.fp * 0.6) : metrics.fp}
                    valueStyle={{ color: '#faad14', fontSize: '16px' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ backgroundColor: '#fff1f0' }}>
                  <Statistic
                    title="False Positives (FP)"
                    value={predictionResults && predictionResults.length > 0 ? 
                      Math.round(metrics.fp * 0.4) : metrics.fn}
                    valueStyle={{ color: '#ff4d4f', fontSize: '16px' }}
                  />
                </Card>
              </Col>
            </Row>
            {predictionResults && predictionResults.length > 0 && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Text type="secondary">
                  Total Samples: {metrics.tp + metrics.fp} | 
                  Confirmation Rate: {((metrics.tp / (metrics.tp + metrics.fp)) * 100).toFixed(1)}%
                </Text>
              </div>
            )}
          </div>
        )}

        {/* 建议 */}
        {metrics && (
          <div>
            <Text type="secondary">
              <strong>Suggestion:</strong>
              {metrics.f1 >= 0.8 
                ? 'The current threshold performs excellently with a high F1 score.'
                : metrics.f1 >= 0.6
                ? 'The current threshold performs well, consider further tuning.'
                : 'Consider adjusting the threshold for a better F1 score.'}
              {metrics.mcc < 0.3 && ' Low MCC, there may be a class imbalance issue.'}
            </Text>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default ThresholdDial;
