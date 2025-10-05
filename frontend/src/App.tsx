import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from './components/Layout';
import HomePageNoMotion from './pages/HomePageNoMotion';
import ExplorePage from './pages/ExplorePage';
import ResearchPage from './pages/ResearchPage';
import AboutPage from './pages/AboutPage';
import './App.css';

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <AntApp>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePageNoMotion />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/research" element={<ResearchPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </Layout>
        </Router>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;