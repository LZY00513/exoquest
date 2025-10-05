import React from 'react';
import { Typography } from 'antd';
import { motion } from 'framer-motion';
import './HighlightItem.css';

const { Title, Paragraph } = Typography;

interface HighlightItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  variants?: any;
}

const HighlightItem: React.FC<HighlightItemProps> = ({
  icon,
  title,
  description,
  variants
}) => {
  return (
    <motion.div 
      className="highlight-item"
      variants={variants}
      whileHover={{ scale: 1.02, x: 10 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="highlight-icon">
        {icon}
      </div>
      <div className="highlight-content">
        <Title level={5} className="highlight-title">
          {title}
        </Title>
        <Paragraph className="highlight-description">
          {description}
        </Paragraph>
      </div>
    </motion.div>
  );
};

export default HighlightItem;
