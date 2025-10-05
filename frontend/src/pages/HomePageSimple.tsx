import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography } from 'antd';
import { RocketOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const HomePageSimple: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0b0c2a 0%, #1a1a40 50%, #2d1b69 100%)',
      color: 'white',
      padding: '24px',
      textAlign: 'center'
    }}>
      <div style={{ paddingTop: '100px' }}>
        <RocketOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '24px' }} />
        <Title level={1} style={{ color: 'white', marginBottom: '16px' }}>
          ExoQuest Platform
        </Title>
        <Paragraph style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '48px' }}>
          AI-powered Exoplanet Detection and Research Platform
        </Paragraph>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            type="primary" 
            size="large"
            icon={<RocketOutlined />}
            onClick={() => navigate('/explore')}
            style={{ minWidth: '200px' }}
          >
            🚀 Start Exploration
          </Button>
          <Button 
            size="large"
            onClick={() => navigate('/research')}
            style={{ minWidth: '200px' }}
          >
            🔬 Advanced Research
          </Button>
          <Button 
            size="large"
            onClick={() => navigate('/about')}
            style={{ minWidth: '200px' }}
          >
            ℹ️ About
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePageSimple;
