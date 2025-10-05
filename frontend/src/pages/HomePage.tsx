import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Typography, 
  Row, 
  Col, 
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
import { motion } from 'framer-motion';
import FeatureCard from '../components/FeatureCard';
import HighlightItem from '../components/HighlightItem';
import './HomePage.css';

const { Title, Paragraph, Text } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // --- START: Custom Cursor Logic ---
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Use requestAnimationFrame for smoother performance
      requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  // --- END: Custom Cursor Logic ---

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

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
        style={{ 
          // Apply real-time position updates
          left: mousePosition.x,
          top: mousePosition.y,
        }}
      />
      
      {/* Navigation Bar */}
      <motion.div 
        className="navbar"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
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
      </motion.div>

      {/* Hero Section */}
      <motion.section 
        className="hero-section"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="hero-content">
          <motion.div variants={itemVariants}>
            <Title level={1} className="hero-title">
              Explore the Universe with AI
            </Title>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Paragraph className="hero-subtitle">
              AI-powered Exoplanet Detection and Research Platform
            </Paragraph>
          </motion.div>
          <motion.div 
            variants={itemVariants}
            className="hero-buttons"
          >
            <Space size="large">
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
          </motion.div>
        </div>
        <div className="hero-background">
          <div className="stars"></div>
          <div className="nebula"></div>
        </div>
        <motion.div 
          className="challenge-badge"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
        >
          <Text className="badge-text">NASA Space Apps Challenge 2025</Text>
        </motion.div>
      </motion.section>

      {/* Feature Overview Section */}
      <motion.section 
        className="features-section"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="section-container">
          <motion.div variants={itemVariants}>
            <Title level={2} className="section-title">
              Platform Features
            </Title>
            <Paragraph className="section-subtitle">
              Three powerful modes to explore and analyze exoplanetary data
            </Paragraph>
          </motion.div>
          
          <Row gutter={[24, 24]} className="feature-cards">
            {featureCards.map((feature) => (
              <Col xs={24} md={8} key={feature.title}>
                <FeatureCard
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  path={feature.path}
                  color={feature.color}
                  variants={itemVariants}
                />
              </Col>
            ))}
          </Row>
        </div>
      </motion.section>

      {/* Core Highlights Section */}
      <motion.section 
        className="highlights-section"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="section-container">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <motion.div 
                className="highlights-visual"
                variants={itemVariants}
              >
                <div className="visual-container">
                  <div className="planet-orbit">
                    <div className="planet"></div>
                    <div className="orbit-path"></div>
                  </div>
                  <div className="light-curve">
                    <div className="curve-point"></div>
                    <div className="curve-point"></div>
                    <div className="curve-point"></div>
                    <div className="curve-point"></div>
                  </div>
                </div>
              </motion.div>
            </Col>
            <Col xs={24} lg={12}>
              <motion.div variants={itemVariants}>
                <Title level={2} className="section-title">
                  Core Highlights
                </Title>
                <Paragraph className="section-subtitle">
                  Cutting-edge technology for exoplanet research
                </Paragraph>
              </motion.div>
              
              <div className="highlights-list">
                {highlights.map((highlight) => (
                  <HighlightItem
                    key={highlight.title}
                    icon={highlight.icon}
                    title={highlight.title}
                    description={highlight.description}
                    variants={itemVariants}
                  />
                ))}
              </div>
            </Col>
          </Row>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="homepage-footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
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
      </motion.footer>
    </div>
  );
};

export default HomePage;
