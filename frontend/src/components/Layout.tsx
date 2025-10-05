import React from 'react';
import { Layout as AntLayout, Menu, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ExperimentOutlined, 
  SearchOutlined, 
  InfoCircleOutlined,
  RocketOutlined 
} from '@ant-design/icons';

const { Header, Content, Footer } = AntLayout;
const { Title } = Typography;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/explore',
      icon: <SearchOutlined />,
      label: 'Explore Mode',
    },
    {
      key: '/research',
      icon: <ExperimentOutlined />,
      label: 'Research Mode',
    },
    {
      key: '/about',
      icon: <InfoCircleOutlined />,
      label: 'About',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <AntLayout>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <RocketOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '12px' }} />
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            ExoQuest Platform
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ flex: 1, minWidth: 0, justifyContent: 'flex-end' }}
        />
      </Header>
      
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 134px)' }}>
        {children}
      </Content>
      
      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          NASA does not endorse any non-U.S. Government entity and is not responsible for information contained on non-U.S. Government websites.
        </Typography.Text>
      </Footer>
    </AntLayout>
  );
};

export default Layout;
