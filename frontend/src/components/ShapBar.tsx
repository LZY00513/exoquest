import React, { useEffect, useRef } from 'react';
import { Card, Tabs, Typography, Alert } from 'antd';
// @ts-ignore
import Plotly from 'plotly.js-dist-min';

const { Text } = Typography;

interface ShapData {
  feature_names: string[];
  values: number[];
  base_value?: number;
}

interface ShapBarProps {
  globalShap?: ShapData;
  localShap?: ShapData;
  title?: string;
  height?: number;
  // 新增：直接接受SHAP数据数组
  shapData?: Array<[string, number]>;
  // 新增：Top-K特征数量控制
  topK?: number;
}

const ShapBar: React.FC<ShapBarProps> = ({
  globalShap,
  localShap,
  title = 'Feature Importance Analysis',
  height = 400,
  shapData,
  topK = 8,
}) => {
  const globalPlotRef = useRef<HTMLDivElement>(null);
  const localPlotRef = useRef<HTMLDivElement>(null);

  // 将SHAP数据转换为ShapData格式
  const convertShapData = (shapArray: Array<[string, number]>): ShapData => {
    console.log('Converting SHAP data:', shapArray);
    const feature_names = shapArray.map(([name]) => name);
    const values = shapArray.map(([, value]) => value);
    const result = {
      feature_names,
      values,
      base_value: undefined,
    };
    console.log('Converted SHAP data:', result);
    return result;
  };

  // 生成示例SHAP数据
  const generateSampleShap = (isGlobal: boolean = true): ShapData => {
    console.log('Generating sample SHAP data (mock data)');
    const chineseNames = [
      'Transit Depth', 'SNR', 'Period', 'Duration',
      'Effective Temperature', 'Surface Gravity', 'Apparent Magnitude', 'Crowding'
    ];
    
    const values = isGlobal 
      ? [0.31, 0.22, 0.17, 0.12, 0.08, 0.06, 0.03, 0.01] // 全局重要性（正值）
      : [0.15, -0.08, 0.12, -0.05, 0.03, -0.02, 0.01, -0.01]; // 局部重要性（有正有负）
    
    return {
      feature_names: chineseNames,
      values: values,
      base_value: isGlobal ? undefined : 0.5,
    };
  };

  const createShapPlot = (
    container: HTMLDivElement,
    data: ShapData,
    plotTitle: string,
    isGlobal: boolean = true
  ) => {
    const sortedIndices = data.values
      .map((val, idx) => ({ val: Math.abs(val), idx }))
      .sort((a, b) => a.val - b.val)
      .map(item => item.idx);

    // 应用Top-K过滤
    const topKIndices = sortedIndices.slice(-topK); // 取绝对值最大的topK个
    const sortedFeatures = topKIndices.map(idx => data.feature_names[idx]);
    const sortedValues = topKIndices.map(idx => data.values[idx]);

    const colors = isGlobal 
      ? sortedValues.map(() => '#1890ff') // 全局使用单一颜色
      : sortedValues.map(val => val > 0 ? '#52c41a' : '#ff4d4f'); // 局部使用红绿色

    const trace = {
      x: sortedValues,
      y: sortedFeatures,
      type: 'bar',
      orientation: 'h',
      marker: {
        color: colors,
      },
      text: sortedValues.map(val => val.toFixed(3)),
      textposition: 'auto',
      name: isGlobal ? 'Global Importance' : 'SHAP Values',
    };

    const layout = {
      title: plotTitle,
      xaxis: { 
        title: isGlobal ? 'Mean Absolute SHAP Value' : 'SHAP Value',
        zeroline: !isGlobal,
      },
      yaxis: { 
        title: 'Features',
        automargin: true,
      },
      height: height,
      margin: { l: 100, r: 50, t: 50, b: 50 },
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
    };

    // 如果是局部SHAP，添加基准线
    if (!isGlobal && data.base_value !== undefined) {
      layout.xaxis.title += ` (Base Value: ${data.base_value.toFixed(3)})`;
    }

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
    };

    // @ts-ignore
    Plotly.newPlot(container, [trace], layout, config);
  };

  useEffect(() => {
    if (globalPlotRef.current) {
      console.log('ShapBar - shapData received:', shapData);
      console.log('ShapBar - globalShap received:', globalShap);
      
      let data;
      if (globalShap) {
        data = globalShap;
        console.log('Using globalShap data');
      } else if (shapData && shapData.length > 0) {
        data = convertShapData(shapData);
        console.log('Using converted shapData');
      } else {
        data = generateSampleShap(true);
        console.log('Using mock sample data');
      }
      
      console.log('ShapBar - final data:', data);
      const isRealData = globalShap || (shapData && shapData.length > 0);
      const title = `Global Feature Importance (Top-${topK}) ${isRealData ? '📊' : '🎭'}`;
      createShapPlot(globalPlotRef.current, data, title, true);
    }
  }, [globalShap, shapData, topK]);

  useEffect(() => {
    if (localPlotRef.current) {
      console.log('ShapBar - local shapData received:', shapData);
      
      let data;
      if (localShap) {
        data = localShap;
        console.log('Using localShap data');
      } else if (shapData && shapData.length > 0) {
        data = convertShapData(shapData);
        console.log('Using converted local shapData');
      } else {
        data = generateSampleShap(false);
        console.log('Using mock local sample data');
      }
      
      console.log('ShapBar - local final data:', data);
      const isRealData = localShap || (shapData && shapData.length > 0);
      const title = `Local Feature Explanation (Top-${topK}) ${isRealData ? '📊' : '🎭'}`;
      createShapPlot(localPlotRef.current, data, title, false);
    }
  }, [localShap, shapData, topK]);

  const tabItems = [
    {
      key: 'global',
      label: 'Global Importance',
      children: (
        <div>
          <div ref={globalPlotRef} className="plotly-container" />
          <Alert
            message="Global Feature Importance"
            description="Shows the average impact of each feature on the model's overall prediction. The larger the value, the more important the feature."
            type="info"
            showIcon
            style={{ marginTop: 8 }}
          />
        </div>
      ),
    },
    {
      key: 'local',
      label: 'Local Explanation',
      children: (
        <div>
          <div ref={localPlotRef} className="plotly-container" />
          <Alert
            message="Local Feature Explanation"
            description="Shows the specific contribution of each feature to the current sample's prediction. Positive values push towards the positive class, negative values push towards the negative class."
            type="success"
            showIcon
            style={{ marginTop: 8 }}
          />
          {localShap?.base_value !== undefined && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                <strong>Baseline Value:</strong> {localShap.base_value.toFixed(3)} 
                (The model's prediction value without feature information)
              </Text>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card title={title} className="shap-bar">
      <Tabs items={tabItems} />
    </Card>
  );
};

export default ShapBar;
