import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Typography, 
  Space
} from 'antd';
import { 
  SearchOutlined, 
  ExperimentOutlined, 
  InfoCircleOutlined,
  RocketOutlined,
  GithubOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  CloudOutlined,
  BulbOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import './HomePage.css';

const { Title, Paragraph, Text } = Typography;

const HomePageNoMotion: React.FC = () => {
  const navigate = useNavigate();

  // --- START: Custom Cursor Logic ---
  const cursorRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Skip update if position hasn't changed significantly (performance optimization)
      const deltaX = Math.abs(e.clientX - lastMousePosition.current.x);
      const deltaY = Math.abs(e.clientY - lastMousePosition.current.y);
      
      if (deltaX < 1 && deltaY < 1) {
        return;
      }
      
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
      
      // Cancel previous animation frame to prevent accumulation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Use requestAnimationFrame for smoother performance
      animationFrameRef.current = requestAnimationFrame(() => {
        if (cursorRef.current) {
          // Direct DOM manipulation for better performance
          cursorRef.current.style.left = `${e.clientX}px`;
          cursorRef.current.style.top = `${e.clientY}px`;
        }
      });
    };

    const handleMouseEnter = (e: MouseEvent) => {
      if (cursorRef.current && e.target instanceof HTMLElement) {
        // Check if hovering over interactive elements
        const isInteractive = e.target.closest('button, a, .feature-card, .highlight-item, .cta-button');
        if (isInteractive) {
          cursorRef.current.classList.add('hover-active');
        } else {
          cursorRef.current.classList.remove('hover-active');
        }
      }
    };

    const handleMouseLeave = () => {
      if (cursorRef.current) {
        cursorRef.current.classList.remove('hover-active');
      }
    };

    // Use passive event listeners for better performance
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true, capture: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter, { capture: true });
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  // --- END: Custom Cursor Logic ---

  const featureCards = [
    {
      title: "Explore Mode",
      description: "Interactive Detection Workflow",
      icon: <SearchOutlined style={{ fontSize: '2rem', color: '#1890ff' }} />,
      path: "/explore",
      color: "#1890ff"
    },
    {
      title: "Research Mode", 
      description: "Model Training and Performance Analysis",
      icon: <ExperimentOutlined style={{ fontSize: '2rem', color: '#52c41a' }} />,
      path: "/research",
      color: "#52c41a"
    },
    {
      title: "About",
      description: "Platform Introduction and Team Info",
      icon: <InfoCircleOutlined style={{ fontSize: '2rem', color: '#722ed1' }} />,
      path: "/about",
      color: "#722ed1"
    }
  ];

  const highlights = [
    {
      icon: <BulbOutlined style={{ fontSize: '1.5rem', color: '#faad14' }} />,
      title: "AI-based Exoplanet Detection",
      description: "Advanced machine learning algorithms for accurate exoplanet identification"
    },
    {
      icon: <DatabaseOutlined style={{ fontSize: '1.5rem', color: '#13c2c2' }} />,
      title: "Multi-mission Dataset Support",
      description: "Kepler, K2, TESS mission data integration and analysis"
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: '1.5rem', color: '#eb2f96' }} />,
      title: "Real-time SHAP Feature Explanation",
      description: "Interpretable AI with live feature importance visualization"
    },
    {
      icon: <CloudOutlined style={{ fontSize: '1.5rem', color: '#2f54eb' }} />,
      title: "Cloud-native Deployment",
      description: "FastAPI + React + Docker containerized architecture"
    }
  ];

  return (
    <div className="homepage">
      {/* --------------------------------- */}
      {/* 1. RENDER THE CUSTOM CURSOR HERE */}
      {/* --------------------------------- */}
      <div 
        ref={cursorRef}
        className="custom-cursor"
      />
      
      {/* Navigation Bar */}
      <div className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <RocketOutlined className="brand-icon" />
            <Title level={3} className="brand-title">
              ExoQuest Platform
            </Title>
          </div>
          <Space size="large">
            <Button 
              type="text" 
              className="nav-link"
              onClick={() => navigate('/explore')}
            >
              Explore Mode
            </Button>
            <Button 
              type="text" 
              className="nav-link"
              onClick={() => navigate('/research')}
            >
              Research Mode
            </Button>
            <Button 
              type="text" 
              className="nav-link"
              onClick={() => navigate('/about')}
            >
              About
            </Button>
            <Button 
              type="text" 
              className="nav-link"
              icon={<GithubOutlined />}
              href="https://github.com"
              target="_blank"
            >
              GitHub
            </Button>
          </Space>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="main-content">
        {/* Left Panel - Hero Section */}
        <div className="left-panel">
          <div className="hero-content">
            <div>
              <Title level={1} className="hero-title">
                Explore the Universe with AI
              </Title>
            </div>
            <div>
              <Paragraph className="hero-subtitle">
                AI-powered Exoplanet Detection and Research Platform
              </Paragraph>
            </div>
            <div className="hero-buttons">
              <Space size="large" direction="vertical">
                <Button 
                  type="primary" 
                  size="large"
                  icon={<RocketOutlined />}
                  className="cta-button explore-button"
                  onClick={() => navigate('/explore')}
                >
                   Start Exploration
                </Button>
                <Button 
                  size="large"
                  icon={<ExperimentOutlined />}
                  className="cta-button research-button"
                  onClick={() => navigate('/research')}
                >
                   Advanced Research
                </Button>
              </Space>
            </div>
          </div>
          <div className="hero-background">
            <div className="stars"></div>
            <div className="nebula"></div>
          </div>
        </div>

        {/* Right Panel - Features and Highlights */}
        <div className="right-panel">
          {/* Features Section */}
          <div className="features-section">
            <div>
              <Title level={2} className="section-title">
                Platform Features
              </Title>
              <Paragraph className="section-subtitle">
                Three powerful modes to explore and analyze exoplanetary data
              </Paragraph>
            </div>
            
            <div className="feature-cards-horizontal">
              {featureCards.map((feature) => (
                <div
                  key={feature.title}
                  className="feature-card-horizontal"
                  onClick={() => navigate(feature.path)}
                >
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                  <Title level={4} className="feature-title">
                    {feature.title}
                  </Title>
                  <Paragraph className="feature-description">
                    {feature.description}
                  </Paragraph>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights Section */}
          <div className="highlights-section">
            <div>
              <Title level={2} className="section-title">
                Core Highlights
              </Title>
              <Paragraph className="section-subtitle">
                Cutting-edge technology for exoplanet research
              </Paragraph>
            </div>
            
            <div className="highlights-list">
              {highlights.map((highlight) => (
                <div key={highlight.title} className="highlight-item">
                  <div className="highlight-icon">
                    {highlight.icon}
                  </div>
                  <div className="highlight-content">
                    <Title level={5} className="highlight-title">
                      {highlight.title}
                    </Title>
                    <Paragraph className="highlight-description">
                      {highlight.description}
                    </Paragraph>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Badge */}
      <div className="challenge-badge">
        <Text className="badge-text">NASA Space Apps Challenge 2025</Text>
      </div>

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <GlobalOutlined className="footer-icon" />
            <Text className="footer-title">ExoQuest Platform</Text>
          </div>
          <div className="footer-info">
            <Text className="footer-text">
              Developed for NASA Space Apps Challenge 2025 — Exoplanetary Intelligence Team
            </Text>
            <Space>
              <Text className="footer-copyright">
                © 2025 ExoQuest Platform. All rights reserved.
              </Text>
              <Button 
                type="link" 
                size="small"
                icon={<GithubOutlined />}
                className="footer-link"
                href="https://github.com"
                target="_blank"
              >
                GitHub
              </Button>
            </Space>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePageNoMotion;
