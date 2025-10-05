import React from 'react';
import { Card, Row, Col, Typography, Space, Divider, Tag, Button } from 'antd';
import { 
  GithubOutlined, 
  BookOutlined, 
  TeamOutlined, 
  RocketOutlined,
  ExperimentOutlined,
  BulbOutlined 
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const AboutPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <RocketOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '16px' }} />
        <Title level={1}>ExoQuest Platform</Title>
        <Paragraph style={{ fontSize: '18px', color: '#666' }}>
          A machine learning-based platform for exoplanet detection and analysis
        </Paragraph>
      </div>

      <Row gutter={24}>
        <Col span={24}>
          <Card>
            <Title level={3}>Project Overview</Title>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
              ExoQuest Platform is a comprehensive platform dedicated to exoplanet detection and analysis.
              Combining advanced machine learning algorithms with an intuitive user interface, it provides
              powerful tools for astronomers, researchers, and educators to analyze light curve data and
              identify potential exoplanet transit signals.
            </Paragraph>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
              Our goal is to make exoplanet detection more accessible, whether you are an experienced researcher
              or a beginner student, you can quickly get started and gain valuable scientific insights through our platform.
            </Paragraph>
          </Card>
        </Col>
      </Row>

      <Row gutter={24} style={{ marginTop: '24px' }}>
        <Col span={12}>
          <Card>
            <Title level={4}>
              <ExperimentOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              Core Features
            </Title>
            <ul style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <li><Text strong>Intelligent Detection:</Text> Exoplanet signal recognition based on deep learning</li>
              <li><Text strong>Data Visualization:</Text> Multi-dimensional light curve display and analysis</li>
              <li><Text strong>Batch Processing:</Text> Supports parallel analysis of large datasets</li>
              <li><Text strong>Model Interpretation:</Text> SHAP feature importance analysis</li>
              <li><Text strong>Threshold Tuning:</Text> Real-time performance metric adjustment</li>
              <li><Text strong>Custom Training:</Text> Train your own model with your data</li>
            </ul>
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Title level={4}>
              <BulbOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
              Technical Features
            </Title>
            <ul style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <li><Text strong>Advanced Algorithms:</Text> Integrates multiple machine learning models</li>
              <li><Text strong>Real-time Analysis:</Text> Fast response and result display</li>
              <li><Text strong>Explainable AI:</Text> Provides detailed explanations of prediction results</li>
              <li><Text strong>Cloud Deployment:</Text> Supports Docker containerized deployment</li>
              <li><Text strong>API Integration:</Text> RESTful API support for third-party integration</li>
              <li><Text strong>Data Security:</Text> Comprehensive data encryption and privacy protection</li>
            </ul>
          </Card>
        </Col>
      </Row>

      <Row gutter={24} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card>
            <Title level={4}>
              <TeamOutlined style={{ marginRight: '8px', color: '#722ed1' }} />
              Use Cases
            </Title>
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center', height: '200px' }}>
                  <ExperimentOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '12px' }} />
                  <Title level={5}>Research Institutions</Title>
                  <Text type="secondary">
                    Process large-scale astronomical observation data to discover new exoplanet candidates
                  </Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center', height: '200px' }}>
                  <BookOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '12px' }} />
                  <Title level={5}>Educational Institutions</Title>
                  <Text type="secondary">
                    Astronomy teaching and student practice, intuitively demonstrating the principles of exoplanet detection
                  </Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center', height: '200px' }}>
                  <BulbOutlined style={{ fontSize: '32px', color: '#faad14', marginBottom: '12px' }} />
                  <Title level={5}>Amateur Enthusiasts</Title>
                  <Text type="secondary">
                    Personal astronomical observation data analysis, participate in citizen science projects
                  </Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={24} style={{ marginTop: '24px' }}>
        <Col span={12}>
          <Card>
            <Title level={4}>Technical Architecture</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Tag color="blue">Frontend</Tag>
                <Text>React + TypeScript + Ant Design</Text>
              </div>
              <div>
                <Tag color="green">Backend</Tag>
                <Text>FastAPI + Python</Text>
              </div>
              <div>
                <Tag color="orange">Machine Learning</Tag>
                <Text>PyTorch + Scikit-learn</Text>
              </div>
              <div>
                <Tag color="purple">Data Storage</Tag>
                <Text>MinIO + Redis</Text>
              </div>
              <div>
                <Tag color="red">Deployment</Tag>
                <Text>Docker + Docker Compose</Text>
              </div>
            </Space>
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Title level={4}>Data Sources</Title>
            <ul style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <li>Kepler Space Telescope</li>
              <li>Transiting Exoplanet Survey Satellite (TESS)</li>
              <li>Ground-based Observation Network Data</li>
              <li>User-defined Datasets</li>
            </ul>
            <Divider />
            <Title level={5}>Supported Data Formats</Title>
            <Space>
              <Tag>.csv</Tag>
              <Tag>.json</Tag>
              <Tag>.fits</Tag>
              <Tag>.txt</Tag>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={24} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card>
            <Title level={4}>Open Source Information</Title>
            <Paragraph>
              ExoQuest Platform is an open-source project, and we welcome community contributions and feedback.
              You can find the complete source code, documentation, and issue tracking on GitHub.
            </Paragraph>
            <Space>
              <Button type="primary" icon={<GithubOutlined />} href="https://github.com/exoquest/platform" target="_blank">
                GitHub Repository
              </Button>
              <Button icon={<BookOutlined />} href="/docs" target="_blank">
                API Documentation
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={24} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card>
            <Title level={4}>Disclaimer</Title>
            <Paragraph type="secondary" style={{ fontSize: '14px' }}>
              NASA does not endorse any non-U.S. Government entity and is not responsible for 
              information contained on non-U.S. Government websites. This platform is an 
              independent research tool and is not affiliated with NASA or any other space agency.
            </Paragraph>
            <Paragraph type="secondary" style={{ fontSize: '14px' }}>
              The detection results provided by this platform are for research reference only and do not constitute an official astronomical discovery statement.
              Any scientific publication based on the results of this platform should undergo peer review and independent verification.
            </Paragraph>
          </Card>
        </Col>
      </Row>

      <div style={{ textAlign: 'center', marginTop: '48px', marginBottom: '24px' }}>
        <Text type="secondary">
          © 2024 ExoQuest Platform. Released under the Apache 2.0 License.
        </Text>
      </div>
    </div>
  );
};

export default AboutPage;
