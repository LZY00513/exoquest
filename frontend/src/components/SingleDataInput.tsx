import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Button, Space, Typography, message, Row, Col, Divider } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { apiClient } from '../lib/api';
import type { ExoplanetPrediction } from '../types';

const { Title, Text } = Typography;

interface SingleDataInputProps {
  onPredictionResult?: (result: ExoplanetPrediction) => void;
  title?: string;
}

const SingleDataInput: React.FC<SingleDataInputProps> = ({
  onPredictionResult,
  title = 'Single Exoplanet Detection'
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<ExoplanetPrediction | null>(null);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // 分离标识字段和数值特征
      const { kepoi_name, ...numericalFeatures } = values;
      
      const requestData = {
        rows: [numericalFeatures], // 只发送数值特征给模型
        threshold: 0.5
      };

      const result = await apiClient.predictTabular(requestData);
      
      if (result.predictions && result.predictions.length > 0) {
        const predResult = result.predictions[0];
        // 将标识字段添加回预测结果中
        predResult.object_id = kepoi_name;
        setPrediction(predResult);
        onPredictionResult?.(predResult);
        message.success('检测完成！');
      } else {
        message.error('检测失败，请重试');
      }
    } catch (error) {
      message.error('检测失败，请检查输入数据');
      console.error('Prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setPrediction(null);
  };

  const getClassificationResult = (probs: ExoplanetPrediction['probs']) => {
    // 检查是否为二分类结果
    if (probs.POSITIVE !== undefined && probs.NEGATIVE !== undefined) {
      if (probs.POSITIVE > probs.NEGATIVE) {
        return { label: 'Exoplanet', color: '#52c41a', type: 'success' };
      } else {
        return { label: 'Non-Exoplanet', color: '#ff4d4f', type: 'error' };
      }
    }
    
    // 多分类结果
    const maxProb = Math.max(probs.CONF || 0, probs.PC || 0, probs.FP || 0);
    if (maxProb === probs.CONF) {
      return { label: 'Confirmed Planet', color: '#52c41a', type: 'success' };
    } else if (maxProb === probs.PC) {
      return { label: 'Candidate Planet', color: '#faad14', type: 'warning' };
    } else {
      return { label: 'False Positive', color: '#ff4d4f', type: 'error' };
    }
  };

  return (
    <Card title={title} className="single-data-input">
      <Row gutter={24}>
        <Col span={12}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              kepoi_name: 'KIC-123456789',
              koi_period: 2.5,
              koi_period_err1: 0.0,
              koi_period_err2: 0.0,
              koi_time0bk: 0.0,
              koi_time0bk_err1: 0.0,
              koi_time0bk_err2: 0.0,
              koi_impact: 0.5,
              koi_impact_err1: 0.0,
              koi_impact_err2: 0.0,
              koi_duration: 3.2,
              koi_duration_err1: 0.0,
              koi_duration_err2: 0.0,
              koi_depth: 850,
              koi_depth_err1: 0.0,
              koi_depth_err2: 0.0,
              koi_prad: 1.0,
              koi_prad_err1: 0.0,
              koi_prad_err2: 0.0,
              koi_teq: 300,
              koi_insol: 1.0,
              koi_insol_err1: 0.0,
              koi_insol_err2: 0.0,
              koi_model_snr: 15.8,
              koi_tce_plnt_num: 1,
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
              koi_kepmag: 10.5,
              koi_fpflag_nt: 0,
              koi_fpflag_ss: 0,
              koi_fpflag_co: 0,
              koi_fpflag_ec: 0
            }}
          >
            <Form.Item
              label="Target (kepoi_name)"
              name="kepoi_name"
              rules={[{ required: true, message: '请输入目标名称' }]}
            >
              <Input placeholder="例如: KIC-123456789" />
            </Form.Item>
            <Form.Item
              label="koi_period"
              name="koi_period"
              rules={[{ required: true, message: '请输入koi_period' }]}
            >
              <InputNumber
                min={0.1}
                max={1000}
                step={0.1}
                style={{ width: '100%' }}
                placeholder="例如: 2.5"
              />
            </Form.Item>

            <Form.Item
              label="koi_duration"
              name="koi_duration"
              rules={[{ required: true, message: '请输入koi_duration' }]}
            >
              <InputNumber
                min={0.1}
                max={100}
                step={0.1}
                style={{ width: '100%' }}
                placeholder="例如: 3.2"
              />
            </Form.Item>

            <Form.Item
              label="koi_depth"
              name="koi_depth"
              rules={[{ required: true, message: '请输入koi_depth' }]}
            >
              <InputNumber
                min={1}
                max={10000}
                step={1}
                style={{ width: '100%' }}
                placeholder="例如: 850"
              />
            </Form.Item>

            <Form.Item
              label="koi_model_snr"
              name="koi_model_snr"
              rules={[{ required: true, message: '请输入koi_model_snr' }]}
            >
              <InputNumber
                min={0.1}
                max={100}
                step={0.1}
                style={{ width: '100%' }}
                placeholder="例如: 15.8"
              />
            </Form.Item>

            <Form.Item
              label="koi_steff"
              name="koi_steff"
              rules={[{ required: true, message: '请输入koi_steff' }]}
            >
              <InputNumber
                min={2000}
                max={8000}
                step={50}
                style={{ width: '100%' }}
                placeholder="例如: 5800"
              />
            </Form.Item>

            <Form.Item
              label="koi_slogg"
              name="koi_slogg"
              rules={[{ required: true, message: '请输入koi_slogg' }]}
            >
              <InputNumber
                min={2.0}
                max={6.0}
                step={0.1}
                style={{ width: '100%' }}
                placeholder="例如: 4.4"
              />
            </Form.Item>

            <Form.Item
              label="koi_kepmag"
              name="koi_kepmag"
              rules={[{ required: true, message: '请输入koi_kepmag' }]}
            >
              <InputNumber
                min={5}
                max={20}
                step={0.1}
                style={{ width: '100%' }}
                placeholder="例如: 10.5"
              />
            </Form.Item>

            <Form.Item
              label="koi_impact"
              name="koi_impact"
              rules={[{ required: true, message: '请输入koi_impact' }]}
            >
              <InputNumber
                min={0.0}
                max={1.0}
                step={0.01}
                style={{ width: '100%' }}
                placeholder="例如: 0.5"
              />
            </Form.Item>

            <Form.Item
              label="koi_insol"
              name="koi_insol"
              rules={[{ required: true, message: '请输入koi_insol' }]}
            >
              <InputNumber
                min={0.0}
                max={10.0}
                step={0.1}
                style={{ width: '100%' }}
                placeholder="例如: 1.0"
              />
            </Form.Item>

            <Form.Item
              label="koi_teq"
              name="koi_teq"
              rules={[{ required: true, message: '请输入koi_teq' }]}
            >
              <InputNumber
                min={100}
                max={1000}
                step={10}
                style={{ width: '100%' }}
                placeholder="例如: 300"
              />
            </Form.Item>

            <Form.Item
              label="koi_prad"
              name="koi_prad"
              rules={[{ required: true, message: '请输入koi_prad' }]}
            >
              <InputNumber
                min={0.1}
                max={20.0}
                step={0.1}
                style={{ width: '100%' }}
                placeholder="例如: 1.0"
              />
            </Form.Item>

            <Form.Item
              label="koi_srad"
              name="koi_srad"
              rules={[{ required: true, message: '请输入koi_srad' }]}
            >
              <InputNumber
                min={0.1}
                max={5.0}
                step={0.1}
                style={{ width: '100%' }}
                placeholder="例如: 1.0"
              />
            </Form.Item>

            <Form.Item
              label="ra"
              name="ra"
              rules={[{ required: true, message: '请输入ra' }]}
            >
              <InputNumber
                min={0}
                max={360}
                step={0.1}
                style={{ width: '100%' }}
                placeholder="例如: 180.0"
              />
            </Form.Item>

            <Form.Item
              label="dec"
              name="dec"
              rules={[{ required: true, message: '请输入dec' }]}
            >
              <InputNumber
                min={-90}
                max={90}
                step={0.1}
                style={{ width: '100%' }}
                placeholder="例如: 0.0"
              />
            </Form.Item>

            <Form.Item
              label="koi_fpflag_nt"
              name="koi_fpflag_nt"
              rules={[{ required: true, message: '请输入koi_fpflag_nt' }]}
            >
              <InputNumber
                min={0}
                max={1}
                step={1}
                style={{ width: '100%' }}
                placeholder="例如: 0"
              />
            </Form.Item>

            <Form.Item
              label="koi_fpflag_ss"
              name="koi_fpflag_ss"
              rules={[{ required: true, message: '请输入koi_fpflag_ss' }]}
            >
              <InputNumber
                min={0}
                max={1}
                step={1}
                style={{ width: '100%' }}
                placeholder="例如: 0"
              />
            </Form.Item>

            <Form.Item
              label="koi_fpflag_co"
              name="koi_fpflag_co"
              rules={[{ required: true, message: '请输入koi_fpflag_co' }]}
            >
              <InputNumber
                min={0}
                max={1}
                step={1}
                style={{ width: '100%' }}
                placeholder="例如: 0"
              />
            </Form.Item>

            <Form.Item
              label="koi_fpflag_ec"
              name="koi_fpflag_ec"
              rules={[{ required: true, message: '请输入koi_fpflag_ec' }]}
            >
              <InputNumber
                min={0}
                max={1}
                step={1}
                style={{ width: '100%' }}
                placeholder="例如: 0"
              />
            </Form.Item>

            <Form.Item
              label="koi_tce_plnt_num"
              name="koi_tce_plnt_num"
              rules={[{ required: true, message: '请输入koi_tce_plnt_num' }]}
            >
              <InputNumber
                min={1}
                max={10}
                step={1}
                style={{ width: '100%' }}
                placeholder="例如: 1"
              />
            </Form.Item>

            {/* 隐藏字段 - 误差项和标志位，使用默认值 */}
            <div style={{ display: 'none' }}>
              <Form.Item name="koi_period_err1"><InputNumber /></Form.Item>
              <Form.Item name="koi_period_err2"><InputNumber /></Form.Item>
              <Form.Item name="koi_time0bk"><InputNumber /></Form.Item>
              <Form.Item name="koi_time0bk_err1"><InputNumber /></Form.Item>
              <Form.Item name="koi_time0bk_err2"><InputNumber /></Form.Item>
              <Form.Item name="koi_impact_err1"><InputNumber /></Form.Item>
              <Form.Item name="koi_impact_err2"><InputNumber /></Form.Item>
              <Form.Item name="koi_duration_err1"><InputNumber /></Form.Item>
              <Form.Item name="koi_duration_err2"><InputNumber /></Form.Item>
              <Form.Item name="koi_depth_err1"><InputNumber /></Form.Item>
              <Form.Item name="koi_depth_err2"><InputNumber /></Form.Item>
              <Form.Item name="koi_prad_err1"><InputNumber /></Form.Item>
              <Form.Item name="koi_prad_err2"><InputNumber /></Form.Item>
              <Form.Item name="koi_insol_err1"><InputNumber /></Form.Item>
              <Form.Item name="koi_insol_err2"><InputNumber /></Form.Item>
              <Form.Item name="koi_steff_err1"><InputNumber /></Form.Item>
              <Form.Item name="koi_steff_err2"><InputNumber /></Form.Item>
              <Form.Item name="koi_slogg_err1"><InputNumber /></Form.Item>
              <Form.Item name="koi_slogg_err2"><InputNumber /></Form.Item>
              <Form.Item name="koi_srad_err1"><InputNumber /></Form.Item>
              <Form.Item name="koi_srad_err2"><InputNumber /></Form.Item>
            </div>

            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SearchOutlined />}
                size="large"
              >
                Start Detection
              </Button>
              <Button
                onClick={handleReset}
                icon={<ReloadOutlined />}
                size="large"
              >
                Reset
              </Button>
            </Space>
          </Form>
        </Col>

        <Col span={12}>
          {prediction ? (
            <Card title="Detection Results" className="prediction-result">
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                  <Title level={4}>
                    {getClassificationResult(prediction.probs).label}
                  </Title>
                  <Text type="secondary">
                    Confidence: {(prediction.conf * 100).toFixed(1)}%
                  </Text>
                </div>

                <Divider />

                <div>
                  <Text strong>Probability Distribution:</Text>
                  <div style={{ marginTop: 8 }}>
                    {prediction.probs.POSITIVE !== undefined ? (
                      // Binary classification display
                      <Row gutter={16}>
                        <Col span={12}>
                          <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f6ffed', borderRadius: '4px' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                              {(prediction.probs.POSITIVE * 100).toFixed(1)}%
                            </div>
                            <div style={{ fontSize: '12px' }}>Exoplanet</div>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fff2f0', borderRadius: '4px' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff4d4f' }}>
                              {((prediction.probs.NEGATIVE || 0) * 100).toFixed(1)}%
                            </div>
                            <div style={{ fontSize: '12px' }}>Non-Exoplanet</div>
                          </div>
                        </Col>
                      </Row>
                    ) : (
                      // Multi-class classification display
                      <Row gutter={16}>
                        <Col span={8}>
                          <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f6ffed', borderRadius: '4px' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                              {((prediction.probs.CONF || 0) * 100).toFixed(1)}%
                            </div>
                            <div style={{ fontSize: '12px' }}>Confirmed Planet</div>
                          </div>
                        </Col>
                        <Col span={8}>
                          <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fff7e6', borderRadius: '4px' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#faad14' }}>
                              {((prediction.probs.PC || 0) * 100).toFixed(1)}%
                            </div>
                            <div style={{ fontSize: '12px' }}>Candidate Planet</div>
                          </div>
                        </Col>
                        <Col span={8}>
                          <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fff2f0', borderRadius: '4px' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff4d4f' }}>
                              {((prediction.probs.FP || 0) * 100).toFixed(1)}%
                            </div>
                            <div style={{ fontSize: '12px' }}>False Positive</div>
                          </div>
                        </Col>
                      </Row>
                    )}
                  </div>
                </div>

                {prediction.explain?.tabular?.shap && (
                  <>
                    <Divider />
                    <div>
                      <Text strong>Feature Importance Analysis:</Text>
                      <div style={{ marginTop: 8 }}>
                        {prediction.explain.tabular.shap.map(([feature, value], index) => (
                          <div key={index} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '4px 0',
                            borderBottom: '1px solid #f0f0f0'
                          }}>
                            <Text>{feature}</Text>
                            <Text style={{ 
                              color: (value as number) > 0 ? '#52c41a' : '#ff4d4f',
                              fontWeight: 'bold'
                            }}>
                              {(value as number) > 0 ? '+' : ''}{(value as number).toFixed(3)}
                            </Text>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div style={{ marginTop: 16 }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Model Version: {prediction.version}
                  </Text>
                </div>
              </Space>
            </Card>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <SearchOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <Title level={4} type="secondary">Awaiting Detection</Title>
                <Text type="secondary">
                  Please enter observation data and click the "Start Detection" button to perform exoplanet detection
                </Text>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </Card>
  );
};

export default SingleDataInput;
