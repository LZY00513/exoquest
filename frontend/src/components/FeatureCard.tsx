import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography } from 'antd';
import { motion } from 'framer-motion';
import './FeatureCard.css';

const { Title, Paragraph } = Typography;

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color?: string;
  variants?: any;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  path,
  color = '#1890ff',
  variants
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path);
  };

  return (
    <motion.div variants={variants}>
      <Card
        className="feature-card"
        hoverable
        onClick={handleClick}
        style={{
          '--feature-color': color
        } as React.CSSProperties}
      >
        <div className="feature-icon">
          {icon}
        </div>
        <Title level={4} className="feature-title">
          {title}
        </Title>
        <Paragraph className="feature-description">
          {description}
        </Paragraph>
      </Card>
    </motion.div>
  );
};

export default FeatureCard;
