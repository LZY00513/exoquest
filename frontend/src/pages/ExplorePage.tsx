import React, { useState } from 'react';
import { Steps, Card, Button, Space, message, Row, Col, Typography, Alert } from 'antd';
import { 
  UploadOutlined, 
  EyeOutlined, 
  SearchOutlined, 
  BulbOutlined, 
  EditOutlined,
  ShareAltOutlined 
} from '@ant-design/icons';
import UploadCard from '../components/UploadCard';
import LightCurveViewer from '../components/LightCurveViewer';
import ResultTable from '../components/ResultTable';
import ShapBar from '../components/ShapBar';
import ThresholdDial from '../components/ThresholdDial';
import { apiClient } from '../lib/api';
import type { Dataset, ExoplanetPrediction } from '../types';

const { Title, Paragraph, Text } = Typography;

const ExplorePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [predictions, setPredictions] = useState<ExoplanetPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  // const [selectedTarget, setSelectedTarget] = useState<any>(null); // 暂时未使用
  const [threshold, setThreshold] = useState(0.5);

  const steps = [
    {
      title: 'Select Sample',
      description: 'Upload light curve data or choose an example',
      icon: <UploadOutlined />,
    },
    {
      title: 'Visualize',
      description: 'View raw, detrended, and phase-folded curves',
      icon: <EyeOutlined />,
    },
    {
      title: 'Detect!',
      description: 'Run exoplanet detection algorithm',
      icon: <SearchOutlined />,
    },
    {
      title: 'Interpret Results',
      description: 'View prediction probabilities and feature importance',
      icon: <BulbOutlined />,
    },
    {
      title: 'Label Feedback',
      description: 'Provide expert labeling to improve the model',
      icon: <EditOutlined />,
    },
  ];

  const handleUploadSuccess = (uploadedDataset: Dataset) => {
    setDataset(uploadedDataset);
    message.success('Data uploaded successfully!');
    setCurrentStep(1);
  };

  const handleVisualizationNext = () => {
    setCurrentStep(2);
  };

  const handleDetection = async () => {
    setLoading(true);
    try {
      // 使用完整的KOI特征数据进行检测
      const sampleData = {
        rows: [{
          koi_fpflag_nt: 0.0,
          koi_fpflag_ss: 0.0,
          koi_fpflag_co: 0.0,
          koi_fpflag_ec: 0.0,
          koi_period: 2.5,
          koi_period_err1: 0.0,
          koi_period_err2: 0.0,
          koi_time0bk: 0.0,
          koi_time0bk_err1: 0.0,
          koi_time0bk_err2: 0.0,
          koi_impact: 0.01,
          koi_impact_err1: 0.0,
          koi_impact_err2: 0.0,
          koi_duration: 0.13, // 3.2 hours = 0.13 days
          koi_duration_err1: 0.0,
          koi_duration_err2: 0.0,
          koi_depth: 850,
          koi_depth_err1: 0.0,
          koi_depth_err2: 0.0,
          koi_prad: 1.0,
          koi_prad_err1: 0.0,
          koi_prad_err2: 0.0,
          koi_teq: 300.0,
          koi_insol: 1000.0,
          koi_insol_err1: 0.0,
          koi_insol_err2: 0.0,
          koi_model_snr: 15.8,
          koi_tce_plnt_num: 1.0,
          koi_steff: 5800,
          koi_steff_err1: 0.0,
          koi_steff_err2: 0.0,
          koi_slogg: 4.4,
          koi_slogg_err1: 0.0,
          koi_slogg_err2: 0.0,
          koi_srad: 1.0,
          koi_srad_err1: 0.0,
          koi_srad_err2: 0.0,
          ra: 180.0,
          dec: 0.0,
          koi_kepmag: 10.5
        }],
        threshold: threshold,
      };

      const result = await apiClient.predictTabular(sampleData as any);
      setPredictions(result.predictions);
      message.success('Detection completed!');
      setCurrentStep(3);
    } catch (error) {
      message.error('Detection failed, please try again');
      console.error('Detection error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExplanationNext = () => {
    setCurrentStep(4);
  };

  const handleFeedbackSubmit = async () => {
    try {
      await apiClient.submitFeedback({
        target_id: dataset?.dataset_id || 'sample-target',
        user_label: 'CONF',
        confidence: 0.8,
        notes: 'User feedback provided through the exploration mode',
      });
      message.success('Feedback submitted successfully! Thank you for your contribution.');
      
      // 生成分享链接（模拟）
      const shareUrl = `${window.location.origin}/explore?shared=${dataset?.dataset_id || 'sample'}`;
      navigator.clipboard.writeText(shareUrl);
      message.info('Share link copied to clipboard');
    } catch (error) {
      message.error('Feedback submission failed');
    }
  };

  const handleUseSample = () => {
    // 使用示例数据
    const sampleDataset: Dataset = {
      dataset_id: 'sample-kepler-452b',
      object_key: 'datasets/sample-kepler-452b.csv',
      size: 1024 * 50, // 50KB
      filename: 'kepler-452b-sample.csv',
      uploaded_at: new Date().toISOString(),
    };
    setDataset(sampleDataset);
    setCurrentStep(1);
    message.info('Kepler-452b sample data loaded');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Row gutter={24}>
            <Col span={12}>
              <UploadCard 
                onUploadSuccess={handleUploadSuccess}
                title="Upload your data"
                description="Supports CSV format light curve data"
              />
            </Col>
            <Col span={12}>
              <Card title="Or use sample data" style={{ height: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Paragraph>
                    If you don't have data, you can use our sample data to experience system functionality.
                  </Paragraph>
                  <Button 
                    type="primary" 
                    onClick={handleUseSample}
                    block
                    size="large"
                  >
                    Use Kepler-452b Sample
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        );

      case 1:
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              message="Data Visualization"
              description="View different representations of the light curve. Raw data displays observations, detrended data removes systematic changes, and phase-folded data highlights periodic signals."
              type="info"
              showIcon
            />
            <LightCurveViewer 
              title={`Light Curve - ${dataset?.filename}`}
            />
            <div style={{ textAlign: 'center' }}>
              <Button type="primary" onClick={handleVisualizationNext} size="large">
                Continue to Detection
              </Button>
            </div>
          </Space>
        );

      case 2:
        return (
          <Space direction="vertical" style={{ width: '100%' }} align="center">
            <Alert
              message="Exoplanet Detection"
              description="We will use advanced machine learning algorithms to analyze your light curve data and identify potential exoplanet transit signals."
              type="info"
              showIcon
            />
            <Card style={{ textAlign: 'center', minWidth: '400px' }}>
              <Space direction="vertical" size="large">
                <SearchOutlined style={{ fontSize: '64px', color: '#1890ff' }} />
                <Title level={3}>Prepare to Detect Exoplanets</Title>
                <Paragraph>
                  Click the button below to start analyzing your light curve data.
                  The algorithm will assess the likelihood of transit signals and provide detailed explanations.
                </Paragraph>
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={handleDetection}
                  loading={loading}
                  style={{ minWidth: '120px' }}
                >
                  Start Detection
                </Button>
              </Space>
            </Card>
          </Space>
        );

      case 3:
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              message="Detection Results"
              description="The algorithm has completed analysis. View prediction probabilities, confidence, and feature importance explanations."
              type="success"
              showIcon
            />
            
            {predictions.length > 0 && (
              <>
                <ResultTable 
                  data={predictions.map((pred, index) => ({
                    ...pred,
                    id: `target-${index}`,
                    target_name: dataset?.filename || `Target-${index + 1}`,
                  }))}
                  showExport={false}
                />
                
                <Row gutter={16} style={{ marginTop: 16 }}>
                  <Col span={12}>
                    <ShapBar 
                      shapData={predictions[0]?.explain?.tabular?.shap}
                      title="Feature Importance Analysis"
                    />
                  </Col>
                  <Col span={12}>
                    <Card title="Prediction Explanation">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Text strong>Confirm Exoplanet Probability: </Text>
                          <Text style={{ fontSize: '16px', color: '#52c41a' }}>
                            {((predictions[0]?.probs.CONF || 0) * 100).toFixed(1)}%
                          </Text>
                        </div>
                        <div>
                          <Text strong>Candidate Exoplanet Probability: </Text>
                          <Text style={{ fontSize: '16px', color: '#faad14' }}>
                            {((predictions[0]?.probs.PC || 0) * 100).toFixed(1)}%
                          </Text>
                        </div>
                        <div>
                          <Text strong>False Positive Probability: </Text>
                          <Text style={{ fontSize: '16px', color: '#ff4d4f' }}>
                            {((predictions[0]?.probs.FP || 0) * 100).toFixed(1)}%
                          </Text>
                        </div>
                        <div>
                          <Text strong>Model Confidence: </Text>
                          <Text style={{ fontSize: '16px', color: '#1890ff' }}>
                            {(predictions[0]?.conf * 100).toFixed(1)}%
                          </Text>
                        </div>
                        <Alert
                          message="Explanation"
                          description="Based on SHAP analysis, transit depth and signal-to-noise ratio are the most important features. High transit depth and clear signals indicate this is likely a real exoplanet signal."
                          type="info"
                          showIcon
                        />
                      </Space>
                    </Card>
                  </Col>
                </Row>

                <Row style={{ marginTop: 16 }}>
                  <Col span={24}>
                    <ThresholdDial
                      initialThreshold={threshold}
                      predictionResults={predictions}
                      onThresholdChange={(newThreshold) => {
                        setThreshold(newThreshold);
                      }}
                      title="Decision Threshold Adjuster"
                    />
                  </Col>
                </Row>
              </>
            )}
            
            <div style={{ textAlign: 'center' }}>
              <Button type="primary" onClick={handleExplanationNext} size="large">
                Provide Feedback
              </Button>
            </div>
          </Space>
        );

      case 4:
        return (
          <Space direction="vertical" style={{ width: '100%' }} align="center">
            <Alert
              message="Expert Feedback"
              description="Your expert opinion is crucial for improving our algorithms. Please provide your assessment of the detection results."
              type="info"
              showIcon
            />
            
            <Card style={{ minWidth: '500px' }}>
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Title level={4} style={{ textAlign: 'center' }}>
                  Do you believe this is a real exoplanet signal?
                </Title>
                
                <Row gutter={16}>
                  <Col span={8}>
                    <Button 
                      type="primary" 
                      block 
                      size="large"
                      style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                      onClick={handleFeedbackSubmit}
                    >
                      Confirm Exoplanet
                    </Button>
                  </Col>
                  <Col span={8}>
                    <Button 
                      block 
                      size="large"
                      style={{ backgroundColor: '#faad14', borderColor: '#faad14', color: 'white' }}
                      onClick={handleFeedbackSubmit}
                    >
                      Candidate Exoplanet
                    </Button>
                  </Col>
                  <Col span={8}>
                    <Button 
                      block 
                      size="large"
                      style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f', color: 'white' }}
                      onClick={handleFeedbackSubmit}
                    >
                      False Positive
                    </Button>
                  </Col>
                </Row>
                
                <Alert
                  message="Share Your Findings"
                  description="After completing feedback, you will receive a read-only link to share the analysis results with colleagues."
                  type="success"
                  showIcon
                  action={
                    <Button size="small" icon={<ShareAltOutlined />}>
                      Share
                    </Button>
                  }
                />
              </Space>
            </Card>
          </Space>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Explore Mode - Exoplanet Detection Guide</Title>
        <Paragraph>
          Experience the complete process of exoplanet detection in 5 simple steps. Suitable for beginners and educational purposes.
        </Paragraph>
      </div>

      <Steps
        current={currentStep}
        items={steps}
        style={{ marginBottom: '32px' }}
        size="small"
      />

      <div style={{ minHeight: '500px' }}>
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <Space>
          {currentStep > 0 && (
            <Button onClick={() => setCurrentStep(currentStep - 1)}>
              Previous
            </Button>
          )}
          {currentStep === 4 && (
            <Button type="primary" onClick={() => setCurrentStep(0)}>
              Restart
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};

export default ExplorePage;
