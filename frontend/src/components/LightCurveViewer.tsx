import React, { useEffect, useRef, useState } from 'react';
import { Card, Tabs, Button, Space, Typography, Alert } from 'antd';
import { FullscreenOutlined, DownloadOutlined } from '@ant-design/icons';
// @ts-ignore
import Plotly from 'plotly.js-dist-min';

const { Text } = Typography;

interface LightCurveData {
  time: number[];
  flux: number[];
  flux_err?: number[];
}

interface LightCurveViewerProps {
  rawData?: LightCurveData;
  detrendedData?: LightCurveData;
  phaseFoldedData?: LightCurveData;
  importance?: number[];
  period?: number;
  epoch?: number;
  title?: string;
  height?: number;
}

const LightCurveViewer: React.FC<LightCurveViewerProps> = ({
  rawData,
  detrendedData,
  phaseFoldedData,
  importance,
  period,
  epoch,
  title = 'Light Curve Viewer',
  height = 400,
}) => {
  const rawPlotRef = useRef<HTMLDivElement>(null);
  const detrendedPlotRef = useRef<HTMLDivElement>(null);
  const phasePlotRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('raw');

  // 生成示例数据（如果没有提供数据）
  const generateSampleData = (): LightCurveData => {
    const time = Array.from({ length: 1000 }, (_, i) => i * 0.02);
    const flux = time.map((t) => {
      // 模拟光变曲线：基础噪声 + 周期性变化 + 凌星信号
      const noise = (Math.random() - 0.5) * 0.001;
      const periodic = 0.0005 * Math.sin(2 * Math.PI * t / 2.5);
      const transit = t > 10 && t < 12 ? -0.01 * Math.exp(-Math.pow((t - 11) / 0.5, 2)) : 0;
      return 1.0 + noise + periodic + transit;
    });
    const flux_err = flux.map(() => 0.001 + Math.random() * 0.0005);
    return { time, flux, flux_err };
  };

  const sampleData = generateSampleData();

  const createPlot = (
    container: HTMLDivElement,
    data: LightCurveData,
    plotTitle: string,
    xLabel: string = 'Time (Days)',
    showImportance: boolean = false
  ) => {
    const traces: any[] = [];

    // 主数据点
    traces.push({
      x: data.time,
      y: data.flux,
      mode: 'markers',
      type: 'scatter',
      name: 'Observation Data',
      marker: {
        size: 3,
        color: showImportance && importance ? importance : '#1890ff',
        colorscale: showImportance ? 'Viridis' : undefined,
        showscale: showImportance,
        colorbar: showImportance ? { title: 'Importance' } : undefined,
      },
      error_y: data.flux_err ? {
        type: 'data',
        array: data.flux_err,
        visible: true,
        color: 'rgba(24, 144, 255, 0.3)',
      } : undefined,
    });

    // 如果有重要性数据，添加热力图覆盖
    if (showImportance && importance && importance.length === data.time.length) {
      const maxImportance = Math.max(...importance);
      const normalizedImportance = importance.map(val => val / maxImportance);
      
      traces.push({
        x: data.time,
        y: data.flux,
        mode: 'markers',
        type: 'scatter',
        name: 'Importance Heatmap',
        marker: {
          size: normalizedImportance.map(val => 5 + val * 10),
          color: importance,
          colorscale: 'Reds',
          opacity: 0.6,
          showscale: true,
          colorbar: { title: 'Feature Importance', x: 1.1 },
        },
      });
    }

    const layout = {
      title: plotTitle,
      xaxis: { title: xLabel },
      yaxis: { title: 'Relative Flux' },
      hovermode: 'closest',
      showlegend: true,
      height: height,
      margin: { l: 50, r: 50, t: 50, b: 50 },
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
      displaylogo: false,
    };

    // @ts-ignore
    Plotly.newPlot(container, traces, layout, config);
  };

  useEffect(() => {
    if (activeTab === 'raw' && rawPlotRef.current) {
      const data = rawData || sampleData;
      createPlot(rawPlotRef.current, data, 'Raw Light Curve', 'Time (Days)', false);
    }
  }, [activeTab, rawData]);

  useEffect(() => {
    if (activeTab === 'detrended' && detrendedPlotRef.current) {
      const data = detrendedData || sampleData;
      createPlot(detrendedPlotRef.current, data, 'Detrended Light Curve', 'Time (Days)', true);
    }
  }, [activeTab, detrendedData, importance]);

  useEffect(() => {
    if (activeTab === 'phase' && phasePlotRef.current) {
      let data = phaseFoldedData;
      
      // 如果没有相位折叠数据，从原始数据生成
      if (!data && (rawData || sampleData)) {
        const sourceData = rawData || sampleData;
        const usedPeriod = period || 2.5;
        const usedEpoch = epoch || 11.0;
        
        const phase = sourceData.time.map(t => ((t - usedEpoch) / usedPeriod) % 1);
        data = {
          time: phase.map(p => p < 0 ? p + 1 : p), // 确保相位在 [0, 1] 范围内
          flux: sourceData.flux,
          flux_err: sourceData.flux_err,
        };
      }
      
      if (data) {
        createPlot(phasePlotRef.current, data, 'Phase Folded Light Curve', 'Phase', false);
      }
    }
  }, [activeTab, phaseFoldedData, period, epoch, rawData]);

  const handleDownload = () => {
    const activeContainer = 
      activeTab === 'raw' ? rawPlotRef.current :
      activeTab === 'detrended' ? detrendedPlotRef.current :
      phasePlotRef.current;
    
    if (activeContainer) {
      // @ts-ignore
      Plotly.downloadImage(activeContainer, {
        format: 'png',
        width: 800,
        height: 600,
        filename: `lightcurve_${activeTab}`,
      });
    }
  };

  const handleFullscreen = () => {
    const activeContainer = 
      activeTab === 'raw' ? rawPlotRef.current :
      activeTab === 'detrended' ? detrendedPlotRef.current :
      phasePlotRef.current;
    
    if (activeContainer) {
      // 触发全屏模式
      if (activeContainer.requestFullscreen) {
        activeContainer.requestFullscreen();
      }
    }
  };

  const tabItems = [
    {
      key: 'raw',
      label: 'Raw Data',
      children: (
        <div>
          <div ref={rawPlotRef} className="plotly-container" />
          {!rawData && (
            <Alert
              message="Using sample data"
              description="The light curve data displayed is simulated for demonstration purposes."
              type="info"
              showIcon
              style={{ marginTop: 8 }}
            />
          )}
        </div>
      ),
    },
    {
      key: 'detrended',
      label: 'Detrended Data',
      children: (
        <div>
          <div ref={detrendedPlotRef} className="plotly-container" />
          {importance && (
            <Alert
              message="Feature Importance Overlay"
              description="图中的颜色和大小表示每个数据点的特征重要性。"
              type="success"
              showIcon
              style={{ marginTop: 8 }}
            />
          )}
        </div>
      ),
    },
    {
      key: 'phase',
      label: 'Phase Folded Data',
      children: (
        <div>
          <div ref={phasePlotRef} className="plotly-container" />
          {period && (
            <Space direction="vertical" style={{ marginTop: 8 }}>
              <Text><strong>Period：</strong> {period.toFixed(4)} 天</Text>
              {epoch && <Text><strong>Epoch：</strong> {epoch.toFixed(4)} 天</Text>}
            </Space>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card 
      title={title}
      extra={
        <Space>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleDownload}
            size="small"
          >
            Download
          </Button>
          <Button 
            icon={<FullscreenOutlined />} 
            onClick={handleFullscreen}
            size="small"
          >
            Fullscreen
          </Button>
        </Space>
      }
      className="light-curve-viewer"
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={tabItems}
      />
    </Card>
  );
};

export default LightCurveViewer;
