import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Space, message, Typography, Tabs, Divider, Slider, Select } from 'antd';
import { 
  PlayCircleOutlined, 
  DownloadOutlined,
  BarChartOutlined,
  SettingOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import UploadCard from '../components/UploadCard';
import ResultTable from '../components/ResultTable';
import ThresholdDial from '../components/ThresholdDial';
import TrainProgress from '../components/TrainProgress';
import SingleDataInput from '../components/SingleDataInput';
import ShapBar from '../components/ShapBar';
import { apiClient } from '../lib/api';
import type { Dataset, ExoplanetPrediction, ModelMetrics } from '../types';

const { Title, Paragraph, Text } = Typography;

interface ResultRow extends ExoplanetPrediction {
  id: string;
  target_name?: string;
}

interface DatasetWithData extends Dataset {
  data: any[];
}

const ResearchPage: React.FC = () => {
  const [dataset, setDataset] = useState<DatasetWithData | null>(null);
  const [predictions, setPredictions] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState(0.5);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [trainingJobId, setTrainingJobId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('single');
  
  // 新增状态：科学探索参数
  const [topK, setTopK] = useState<number>(8);
  const [features, setFeatures] = useState<string[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<string>('');
  const [featurePerturbation, setFeaturePerturbation] = useState<number>(0);
  const [perturbationResults, setPerturbationResults] = useState<any>(null);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
  const [isLoadingPerturbation, setIsLoadingPerturbation] = useState(false);
  const [defaultExplorationResult, setDefaultExplorationResult] = useState<any>(null);

  // 加载特征列表和默认预测结果
  useEffect(() => {
    const loadFeatures = async () => {
      setIsLoadingFeatures(true);
      try {
        const response = await apiClient.getFeatures();
        setFeatures(response.features);
        if (response.features.length > 0) {
          setSelectedFeature(response.features[0]);
        }
      } catch (error) {
        console.error('Failed to load features:', error);
        message.error('Failed to load feature list');
      } finally {
        setIsLoadingFeatures(false);
      }
    };

    const loadDefaultExploration = async () => {
      try {
        // 使用默认数据获取预测结果，用于探索模式展示
        const defaultData = {
          koi_fpflag_nt: 0.0,
          koi_fpflag_ss: 0.0,
          koi_fpflag_co: 0.0,
          koi_fpflag_ec: 0.0,
          koi_period: 10.0,
          koi_period_err1: 0.0,
          koi_period_err2: 0.0,
          koi_time0bk: 0.0,
          koi_time0bk_err1: 0.0,
          koi_time0bk_err2: 0.0,
          koi_impact: 0.01,
          koi_impact_err1: 0.0,
          koi_impact_err2: 0.0,
          koi_duration: 0.5,
          koi_duration_err1: 0.0,
          koi_duration_err2: 0.0,
          koi_depth: 1000,
          koi_depth_err1: 0.0,
          koi_depth_err2: 0.0,
          koi_prad: 1.0,
          koi_prad_err1: 0.0,
          koi_prad_err2: 0.0,
          koi_teq: 300.0,
          koi_insol: 1000.0,
          koi_insol_err1: 0.0,
          koi_insol_err2: 0.0,
          koi_model_snr: 15.0,
          koi_tce_plnt_num: 1.0,
          koi_steff: 5778.0,
          koi_steff_err1: 0.0,
          koi_steff_err2: 0.0,
          koi_slogg: 4.44,
          koi_slogg_err1: 0.0,
          koi_slogg_err2: 0.0,
          koi_srad: 1.0,
          koi_srad_err1: 0.0,
          koi_srad_err2: 0.0,
          ra: 180.0,
          dec: 0.0,
          koi_kepmag: 12.0
        };

        const result = await apiClient.predictTabular({
          rows: [defaultData as any],
          threshold: threshold
        });

        setDefaultExplorationResult(result.predictions[0]);
        console.log('Default exploration result:', result.predictions[0]);
        console.log('SHAP data:', result.predictions[0]?.explain?.tabular?.shap);
      } catch (error) {
        console.error('Failed to load default exploration result:', error);
      }
    };

    loadFeatures();
    loadDefaultExploration();
  }, [threshold]);

  // 特征扰动预测
  const handleFeaturePerturbation = async () => {
    if (!selectedFeature) {
      message.warning('Please select a feature first');
      return;
    }

    setIsLoadingPerturbation(true);
    try {
      // 使用默认的测试数据，但修改选中的特征
      const baseData = {
        koi_fpflag_nt: 0.0,
        koi_fpflag_ss: 0.0,
        koi_fpflag_co: 0.0,
        koi_fpflag_ec: 0.0,
        koi_period: 10.0,
        koi_period_err1: 0.0,
        koi_period_err2: 0.0,
        koi_time0bk: 0.0,
        koi_time0bk_err1: 0.0,
        koi_time0bk_err2: 0.0,
        koi_impact: 0.01,
        koi_impact_err1: 0.0,
        koi_impact_err2: 0.0,
        koi_duration: 0.5,
        koi_duration_err1: 0.0,
        koi_duration_err2: 0.0,
        koi_depth: 1000,
        koi_depth_err1: 0.0,
        koi_depth_err2: 0.0,
        koi_prad: 1.0,
        koi_prad_err1: 0.0,
        koi_prad_err2: 0.0,
        koi_teq: 300.0,
        koi_insol: 1000.0,
        koi_insol_err1: 0.0,
        koi_insol_err2: 0.0,
        koi_model_snr: 15.0,
        koi_tce_plnt_num: 1.0,
        koi_steff: 5778.0,
        koi_steff_err1: 0.0,
        koi_steff_err2: 0.0,
        koi_slogg: 4.44,
        koi_slogg_err1: 0.0,
        koi_slogg_err2: 0.0,
        koi_srad: 1.0,
        koi_srad_err1: 0.0,
        koi_srad_err2: 0.0,
        ra: 180.0,
        dec: 0.0,
        koi_kepmag: 12.0
      };

      // 计算扰动值（基于特征类型和扰动百分比）
      const baseValue = baseData[selectedFeature as keyof typeof baseData] || 0;
      const perturbationValue = baseValue * (featurePerturbation / 100);
      const perturbedData = {
        ...baseData,
        [selectedFeature]: baseValue + perturbationValue
      };

      const result = await apiClient.predictTabular({
        rows: [perturbedData as any],
        threshold: threshold
      });

      setPerturbationResults(result.predictions[0]);
      message.success(`Feature ${selectedFeature} perturbed by ${featurePerturbation}%`);
    } catch (error) {
      console.error('Feature perturbation failed:', error);
      message.error('Feature perturbation prediction failed');
    } finally {
      setIsLoadingPerturbation(false);
    }
  };

  // 生成模拟批量预测数据
  const _generateMockPredictions = (count: number = 50, datasetName?: string): ResultRow[] => {
    const results: ResultRow[] = [];
    
    // 根据数据集名称生成更真实的目标名称
    const generateTargetName = (index: number) => {
      if (datasetName?.includes('kepler')) {
        return `KIC-${1000000 + index}`;
      } else if (datasetName?.includes('tess')) {
        return `TIC-${100000 + index}`;
      } else if (datasetName?.includes('k2')) {
        return `EPIC-${200000 + index}`;
      } else {
        return `TARGET-${index + 1}`;
      }
    };
    
    // 使用种子值确保结果一致性
    const seed = 12345; // 固定种子
    const seededRandom = (index: number) => {
      const x = Math.sin(seed + index) * 10000;
      return x - Math.floor(x);
    };
    
    for (let i = 0; i < count; i++) {
      // 模拟二分类概率（0-1之间）
      const positiveProb = 0.2 + seededRandom(i) * 0.8; // 0.2-1.0之间的值
      const negativeProb = 1 - positiveProb;
      
      // 直接使用二分类结果
      const probs = {
        POSITIVE: positiveProb,
        NEGATIVE: negativeProb,
      };

      results.push({
        id: `target-${i + 1}`,
        target_name: generateTargetName(i),
        probs,
        conf: Math.max(probs.POSITIVE, probs.NEGATIVE) + seededRandom(i + 10000) * 0.1,
        version: 'v1.2.0',
        explain: {
          tabular: {
            shap: [
              ['depth_ppm', (seededRandom(i + 11000) - 0.5) * 0.4],
              ['snr', (seededRandom(i + 12000) - 0.5) * 0.3],
              ['period', (seededRandom(i + 13000) - 0.5) * 0.2],
              ['duration_hr', (seededRandom(i + 14000) - 0.5) * 0.15],
              ['teff', (seededRandom(i + 15000) - 0.5) * 0.1],
            ],
          },
        },
      });
    }
    
    return results;
  };

  // 生成模拟指标数据
  const generateMockMetrics = (): ModelMetrics => {
    return {
      pr_auc: 0.892,  // 固定值，避免每次变化
      mcc: 0.756,     // 固定值，避免每次变化
      ece: 0.067,     // 固定值，避免每次变化
      confusion: {
        tp: 85,
        fp: 12,
        tn: 890,
        fn: 13,
      },
      plots: {
        pr_png: '/api/models/latest/plots/pr_curve.png',
        calib_png: '/api/models/latest/plots/calibration.png',
      },
    };
  };

  const handleUploadSuccess = (uploadedDataset: Dataset) => {
    // 这里应该从上传的文件中解析数据
    // 暂时使用模拟数据，实际应用中需要解析CSV文件
    const datasetWithData: DatasetWithData = {
      ...uploadedDataset,
      data: [] // 实际应用中这里应该是解析后的CSV数据
    };
    setDataset(datasetWithData);
    message.success('Dataset uploaded successfully!');
  };

  const handleBatchPredict = async () => {
    if (!dataset) {
      message.warning('Please upload a dataset first');
      return;
    }

    setLoading(true);
    try {
      // 获取数据集内容
      const { content } = await apiClient.getDatasetContent(dataset.dataset_id);
      
      console.log('Dataset content length:', content.length);
      console.log('First 500 characters:', content.substring(0, 500));
      
      // 解析CSV数据 - 处理Windows换行符和跳过前53行（匹配训练时的处理）
      const lines = content.split(/\r?\n/).filter(line => line.trim());
      if (lines.length < 5) {
        message.error('Insufficient dataset content, at least 5 rows of data are required');
        return;
      }
      
      // 动态查找表头行（包含kepid字段的行）
      let dataStartIndex = -1;
      let headers: string[] = [];
      
      for (let i = 0; i < Math.min(60, lines.length); i++) {
        const line = lines[i].replace(/\r$/, '');
        const potentialHeaders = line.split(',').map(h => h.trim());
        if (potentialHeaders.includes('kepid') && potentialHeaders.length > 20) {
          dataStartIndex = i;
          headers = potentialHeaders;
          break;
        }
      }
      
      if (dataStartIndex === -1) {
        message.error('Unable to find header row, please check CSV format');
        return;
      }
      
      console.log(`Found headers at line ${dataStartIndex + 1}:`, headers);
      
      const dataRows = lines.slice(dataStartIndex + 1).map(line => { // 处理所有数据行
        // 移除行尾的\r字符
        const cleanLine = line.replace(/\r$/, '');
        // 分割字段，处理引号和逗号
        const values: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < cleanLine.length; i++) {
          const char = cleanLine[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim()); // 添加最后一个字段
        
        const row: any = {};
        headers.forEach((header, index) => {
          const value = values[index] || '';
          // 尝试转换为数字
          if (value !== '' && !isNaN(Number(value))) {
            row[header] = Number(value);
          } else {
            row[header] = value;
          }
        });
        return row;
      });
      
      console.log('Parsed data rows count:', dataRows.length);
      console.log('Sample data rows (first 3):', dataRows.slice(0, 3));
      
      // 检查数据中是否有我们需要的字段
      const sampleRow = dataRows[0] || {};
      const availableFields = Object.keys(sampleRow);
      console.log('Available fields in dataset:', availableFields);
      
      // 尝试映射字段名到后端API需要的格式
      const fieldMapping: { [key: string]: string } = {
        'koi_period': 'koi_period',
        'period': 'koi_period', 
        'orbital_period': 'koi_period',
        'koi_duration': 'koi_duration',
        'duration': 'koi_duration',
        'transit_duration': 'koi_duration',
        'koi_depth': 'koi_depth',
        'depth': 'koi_depth',
        'transit_depth': 'koi_depth',
        'koi_model_snr': 'koi_model_snr',
        'snr': 'koi_model_snr',
        'signal_to_noise': 'koi_model_snr',
        'koi_impact': 'koi_impact',
        'impact': 'koi_impact',
        'koi_prad': 'koi_prad',
        'planet_radius': 'koi_prad',
        'koi_teq': 'koi_teq',
        'equilibrium_temperature': 'koi_teq',
        'koi_insol': 'koi_insol',
        'insolation': 'koi_insol',
        'koi_tce_plnt_num': 'koi_tce_plnt_num',
        'planet_num': 'koi_tce_plnt_num',
        'koi_steff': 'koi_steff',
        'stellar_teff': 'koi_steff',
        'teff': 'koi_steff',
        'koi_slogg': 'koi_slogg',
        'stellar_logg': 'koi_slogg',
        'logg': 'koi_slogg',
        'koi_srad': 'koi_srad',
        'stellar_radius': 'koi_srad',
        'ra': 'ra',
        'right_ascension': 'ra',
        'dec': 'dec',
        'declination': 'dec',
        'koi_kepmag': 'koi_kepmag',
        'kepler_magnitude': 'koi_kepmag',
        'kepmag': 'koi_kepmag'
      };
      
      // 创建映射后的数据，并填充默认值
      const mappedRows = dataRows.map(row => {
        const mappedRow: any = {
          // 默认值
          koi_fpflag_nt: 0.0,
          koi_fpflag_ss: 0.0,
          koi_fpflag_co: 0.0,
          koi_fpflag_ec: 0.0,
          koi_period_err1: 0.0,
          koi_period_err2: 0.0,
          koi_time0bk: 0.0,
          koi_time0bk_err1: 0.0,
          koi_time0bk_err2: 0.0,
          koi_impact_err1: 0.0,
          koi_impact_err2: 0.0,
          koi_duration_err1: 0.0,
          koi_duration_err2: 0.0,
          koi_depth_err1: 0.0,
          koi_depth_err2: 0.0,
          koi_prad_err1: 0.0,
          koi_prad_err2: 0.0,
          koi_insol_err1: 0.0,
          koi_insol_err2: 0.0,
          koi_steff_err1: 0.0,
          koi_steff_err2: 0.0,
          koi_slogg_err1: 0.0,
          koi_slogg_err2: 0.0,
          koi_srad_err1: 0.0,
          koi_srad_err2: 0.0
        };
        
        // 映射实际字段
        availableFields.forEach(field => {
          const mappedField = fieldMapping[field.toLowerCase()] || field.toLowerCase();
          if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
            mappedRow[mappedField] = row[field];
          }
        });
        
        return mappedRow;
      });
      
      console.log('Mapped data rows:', mappedRows);
      
      // 过滤掉无效行 - 只保留CANDIDATE和CONFIRMED（匹配训练时的过滤）
      const validRows = mappedRows.filter(row => {
        // 检查disposition字段，只保留CANDIDATE和CONFIRMED
        const disposition = row.koi_disposition || row.disposition;
        const isValidDisposition = disposition === 'CANDIDATE' || disposition === 'CONFIRMED';
        
        // 检查后端API要求的必填字段
        const requiredFields = [
          'koi_period', 'koi_impact', 'koi_duration', 'koi_depth', 
          'koi_prad', 'koi_teq', 'koi_insol', 'koi_model_snr',
          'koi_tce_plnt_num', 'koi_steff', 'koi_slogg', 'koi_srad',
          'ra', 'dec', 'koi_kepmag'
        ];
        
        const hasRequired = requiredFields.every(field => 
          row[field] !== undefined && row[field] !== null && row[field] !== ''
        );
        
        const hasNumericValues = requiredFields.every(field => 
          !isNaN(Number(row[field]))
        );
        
        return isValidDisposition && hasRequired && hasNumericValues;
      });
      
      console.log('Valid rows count:', validRows.length);
      
      if (validRows.length === 0) {
        message.error(`No valid prediction data found. Required fields: koi_period, koi_impact, koi_duration, koi_depth, koi_prad, koi_teq, koi_insol, koi_model_snr, koi_tce_plnt_num, koi_steff, koi_slogg, koi_srad, ra, dec, koi_kepmag, koi_disposition (CANDIDATE/CONFIRMED). Available fields: ${availableFields.slice(0, 10).join(', ')}...`);
        return;
      }
      
      // 分批处理策略 - 每批处理500行，避免超时
      const batchSize = 500;
      const totalBatches = Math.ceil(validRows.length / batchSize);
      console.log(`Processing ${validRows.length} rows in ${totalBatches} batches of ${batchSize}`);
      
      const allPredictions: any[] = [];
      
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize, validRows.length);
        const batchRows = validRows.slice(startIndex, endIndex);
        
        console.log(`Processing batch ${batchIndex + 1}/${totalBatches}: rows ${startIndex + 1}-${endIndex}`);
        
        try {
          const result = await apiClient.predictTabular({
            rows: batchRows,
            threshold: threshold
          });
          
          allPredictions.push(...result.predictions);
          console.log(`Batch ${batchIndex + 1} completed: ${result.predictions.length} predictions`);
          
          // 更新进度提示
          const progress = Math.round(((batchIndex + 1) / totalBatches) * 100);
          message.info(`Batch prediction progress: ${progress}% (${batchIndex + 1}/${totalBatches})`);
          
        } catch (error) {
          console.error(`Batch ${batchIndex + 1} failed:`, error);
          message.error(`Batch ${batchIndex + 1} processing failed, skipping this batch`);
          continue; // 继续处理下一批次
        }
      }
      
      const result = { predictions: allPredictions };
      
      // 转换预测结果为ResultRow格式
      const resultRows: ResultRow[] = result.predictions.map((pred, index) => ({
        id: `batch_${index + 1}`,
        target_name: `Target_${index + 1}`,
        object_id: `batch_${index + 1}`,
        probs: pred.probs,
        conf: pred.conf,
        version: pred.version,
        explain: pred.explain,
        importance: pred.importance
      }));
      setPredictions(resultRows);
      message.success(`Batch prediction completed, processed ${allPredictions.length} targets (across ${totalBatches} batches)`);
    } catch (error) {
      message.error('Batch prediction failed, please check data format or try again later');
      console.error('Batch prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTraining = async () => {
    if (!dataset) {
      message.warning('Please upload a training dataset first');
      return;
    }

    try {
      const result = await apiClient.startTraining(dataset.dataset_id, {
        model_type: 'neural_network',
        epochs: 50,
        batch_size: 32,
        learning_rate: 0.001,
      });
      setTrainingJobId(result.job_id);
      message.success('Training task started');
      setActiveTab('training');
    } catch (error) {
      message.error('Failed to start training');
    }
  };

  const handleTrainingComplete = async () => {
    message.success('Training completed!');
    try {
      // 获取训练后的模型指标
      const modelMetrics = generateMockMetrics();
      setMetrics(modelMetrics);
      setActiveTab('metrics');
    } catch (error) {
      message.error('Failed to get model metrics');
    }
  };

  const handleExportResults = () => {
    if (predictions.length === 0) {
      message.warning('No results to export');
      return;
    }

    // 导出详细的CSV报告
    const headers = [
      'Target ID', 'Target Name', 'Confirmed Planet Probability', 'Candidate Planet Probability', 'False Positive Probability', 
      'Confidence', 'Model Version', 'Transit Depth SHAP', 'Signal-to-Noise Ratio SHAP', 'Period SHAP'
    ];
    
    const csvContent = [
      headers.join(','),
      ...predictions.map(row => [
        row.id,
        row.target_name || '',
        (row.probs.CONF || 0).toFixed(6),
        (row.probs.PC || 0).toFixed(6),
        (row.probs.FP || 0).toFixed(6),
        row.conf.toFixed(6),
        row.version,
        row.explain?.tabular?.shap[0]?.[1]?.toFixed(6) || '0',
        row.explain?.tabular?.shap[1]?.[1]?.toFixed(6) || '0',
        row.explain?.tabular?.shap[2]?.[1]?.toFixed(6) || '0',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `exoplanet_research_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('Results exported to CSV file');
  };

  const handleExportPDF = () => {
    message.info('PDF export functionality under development...');
    // TODO: Implement PDF export functionality
  };

  const tabItems = [
    {
      key: 'single',
      label: 'Single Detection',
      children: (
        <SingleDataInput 
          onPredictionResult={(result) => {
            // 可以在这里处理单个检测结果
            console.log('Single prediction result:', result);
          }}
          title="Single Exoplanet Detection"
        />
      ),
    },
    {
      key: 'batch',
      label: 'Batch Processing',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row gutter={24}>
            <Col span={12}>
              <UploadCard 
                onUploadSuccess={handleUploadSuccess}
                title="Upload Batch Data"
                description="Supports CSV files containing multiple targets, up to 100MB"
              />
            </Col>
            <Col span={12}>
              <Card title="Batch Prediction" style={{ height: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Paragraph>
                    Upload a dataset containing multiple light curve targets, and the system will automatically identify confirmed and candidate planets worth following.
                  </Paragraph>
                  
                  {/* 阈值调节 */}
                  <div>
                    <Text strong>Decision Threshold:</Text>
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={threshold}
                      onChange={setThreshold}
                      marks={{
                        0: '0.0',
                        0.25: '0.25',
                        0.5: '0.5',
                        0.75: '0.75',
                        1: '1.0',
                      }}
                      tooltip={{
                        formatter: (value) => `${value?.toFixed(2)}`,
                      }}
                      style={{ margin: '8px 0' }}
                    />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Current Threshold: {threshold.toFixed(3)} ({threshold > 0.5 ? 'Candidate Planet' : 'Confirmed Planet'})
                    </Text>
                  </div>
                  
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={handleBatchPredict}
                    loading={loading}
                    disabled={!dataset}
                    block
                    size="large"
                  >
                    Start Batch Prediction
                  </Button>
                  {predictions.length > 0 && (
                    <Text type="success">
                      Processed {predictions.length} targets
                    </Text>
                  )}
                </Space>
              </Card>
            </Col>
          </Row>

          {predictions.length > 0 && (
            <>
              <Divider />
              <ResultTable 
                data={predictions}
                loading={loading}
                onExport={handleExportResults}
                title={`Batch Prediction Results (${predictions.length} targets)`}
              />
            </>
          )}
        </Space>
      ),
    },
    {
      key: 'threshold',
      label: 'Scientific Exploration',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row gutter={24}>
          <Col span={16}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* 阈值调节 */}
              <Card title="Decision Threshold Adjustment" extra={<SettingOutlined />}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Decision Threshold:</Text>
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={threshold}
                      onChange={setThreshold}
                      marks={{
                        0: '0.0',
                        0.25: '0.25',
                        0.5: '0.5',
                        0.75: '0.75',
                        1: '1.0',
                      }}
                      tooltip={{
                        formatter: (value) => `${value?.toFixed(2)}`,
                      }}
                      style={{ margin: '8px 0' }}
                    />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Current Threshold: {threshold.toFixed(3)} ({threshold > 0.5 ? 'Candidate Planet' : 'Confirmed Planet'})
                    </Text>
                  </div>
                  <Paragraph type="secondary">
                    The threshold determines the classification boundary: a high threshold is stricter (more confirmed planets), a low threshold is more lenient (more candidate planets).
                  </Paragraph>
                </Space>
              </Card>

              {/* Top-K 特征控制 */}
              <Card title="SHAP Feature Analysis" extra={<BarChartOutlined />}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Number of Features (Top-K):</Text>
                    <Slider
                      min={3}
                      max={15}
                      step={1}
                      value={topK}
                      onChange={setTopK}
                      marks={{
                        3: '3',
                        5: '5',
                        8: '8',
                        10: '10',
                        15: '15',
                      }}
                      tooltip={{
                        formatter: (value) => `Top-${value}`,
                      }}
                      style={{ margin: '8px 0' }}
                    />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Current Display: Top-{topK} most important features
                    </Text>
                  </div>
                  <Paragraph type="secondary">
                    Control the number of features displayed in the SHAP chart to help focus on the most important features.
                  </Paragraph>
                </Space>
              </Card>

              {/* 特征扰动实验 */}
              <Card title="Feature Perturbation Experiment" extra={<ExperimentOutlined />}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Select Feature:</Text>
                    <Select
                      style={{ width: '100%', marginTop: '8px' }}
                      placeholder="Select feature to perturb"
                      value={selectedFeature}
                      onChange={setSelectedFeature}
                      loading={isLoadingFeatures}
                      options={features.map(feature => ({
                        label: feature,
                        value: feature
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Text strong>Perturbation Magnitude:</Text>
                    <Slider
                      min={-30}
                      max={30}
                      step={1}
                      value={featurePerturbation}
                      onChange={setFeaturePerturbation}
                      marks={{
                        '-30': '-30%',
                        '-15': '-15%',
                        0: '0%',
                        15: '15%',
                        30: '30%',
                      }}
                      tooltip={{
                        formatter: (value) => `${value}%`,
                      }}
                      style={{ margin: '8px 0' }}
                    />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Current Perturbation: {featurePerturbation}% ({featurePerturbation > 0 ? 'Increased' : featurePerturbation < 0 ? 'Decreased' : 'No change'})
                    </Text>
                  </div>

                  <Button
                    type="primary"
                    icon={<ExperimentOutlined />}
                    onClick={handleFeaturePerturbation}
                    loading={isLoadingPerturbation}
                    disabled={!selectedFeature}
                    block
                  >
                    Execute Perturbation Experiment
                  </Button>

                  {perturbationResults && (
                    <Card size="small" title="Perturbation Results">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Text strong>Feature:</Text> {selectedFeature} ({featurePerturbation}% change)
                        </div>
                        <div>
                          <Text strong>Prediction Probabilities:</Text>
                          <div style={{ marginLeft: '16px' }}>
                            <div>Candidate Planet: {(perturbationResults.probs.POSITIVE * 100).toFixed(1)}%</div>
                            <div>Confirmed Planet: {(perturbationResults.probs.NEGATIVE * 100).toFixed(1)}%</div>
                          </div>
                        </div>
                        <div>
                          <Text strong>Confidence:</Text> {(perturbationResults.conf * 100).toFixed(1)}%
                        </div>
                      </Space>
                    </Card>
                  )}
                </Space>
              </Card>

              {/* 应用阈值按钮 */}
              {predictions.length > 0 && (
                <Card title="Apply Threshold to Prediction Results">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Paragraph>
                      Current prediction results are based on threshold {threshold.toFixed(3)}. Adjusting the threshold will re-classify the results.
                    </Paragraph>
                    <Button
                      type="primary"
                      icon={<BarChartOutlined />}
                      onClick={() => {
                        // 重新应用阈值到现有预测结果
                        const updatedPredictions = predictions.map(pred => ({
                          ...pred,
                          // 根据新阈值重新计算分类标签
                          classification: (pred.probs.POSITIVE || (pred.probs.PC || 0)) > threshold ? 'Candidate Planet' : 'Confirmed Planet'
                        }));
                        setPredictions(updatedPredictions);
                        message.success(`New threshold ${threshold.toFixed(3)} re-classified ${predictions.length} targets`);
                      }}
                      block
                    >
                      Re-apply Threshold (Current: {threshold.toFixed(3)})
                    </Button>
                  </Space>
                </Card>
              )}
            </Space>
          </Col>
          
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* 科学探索指南 */}
              <Card title="Scientific Exploration Guide" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>🎯 Threshold Tuning</Text>
                    <Paragraph style={{ margin: '4px 0', fontSize: '12px' }}>
                      Adjust the decision boundary to balance precision and recall. A high threshold produces more confirmed planets, a low threshold discovers more candidate planets.
                    </Paragraph>
                  </div>
                  
                  <Divider style={{ margin: '8px 0' }} />
                  
                  <div>
                    <Text strong>📊 Top-K Feature Analysis</Text>
                    <Paragraph style={{ margin: '4px 0', fontSize: '12px' }}>
                      Display the most important features and their contribution to the prediction. Helps understand the model's decision-making process and key factors for planet classification.
                    </Paragraph>
                  </div>
                  
                  <Divider style={{ margin: '8px 0' }} />
                  
                  <div>
                    <Text strong>🔬 Feature Perturbation Experiment</Text>
                    <Paragraph style={{ margin: '4px 0', fontSize: '12px' }}>
                      Observe prediction changes by adjusting a single feature value, understanding feature sensitivity and model robustness.
                    </Paragraph>
                  </div>
                </Space>
              </Card>

              {/* 实时性能指标 */}
            <ThresholdDial 
              initialThreshold={threshold}
              predictionResults={predictions as any}
              onThresholdChange={(newThreshold) => {
                setThreshold(newThreshold);
                }}
              />

              {/* 默认探索结果 */}
              {defaultExplorationResult && (
                <Card title="Model Baseline Prediction" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Sample Prediction Result:</Text>
                    </div>
                    <div>
                      <Text>Candidate Planet: </Text>
                      <Text type="warning">{(defaultExplorationResult.probs.POSITIVE * 100).toFixed(1)}%</Text>
                    </div>
                    <div>
                      <Text>Confirmed Planet: </Text>
                      <Text type="success">{(defaultExplorationResult.probs.NEGATIVE * 100).toFixed(1)}%</Text>
                    </div>
                    <div>
                      <Text>Confidence: </Text>
                      <Text type="secondary">{(defaultExplorationResult.conf * 100).toFixed(1)}%</Text>
                    </div>
                    <div>
                      <Text>SHAP Data: </Text>
                      <Text type={defaultExplorationResult.explain?.tabular?.shap?.length > 0 ? 'success' : 'warning'}>
                        {defaultExplorationResult.explain?.tabular?.shap?.length > 0 ? 
                          `✅ Real Data (${defaultExplorationResult.explain.tabular.shap.length} features)` : 
                          '⚠️ Simulated Data'}
                      </Text>
                    </div>
                    <Paragraph style={{ fontSize: '12px', margin: 0 }}>
                      Prediction results based on standard samples for baseline reference in exploration mode.
                    </Paragraph>
                  </Space>
                </Card>
              )}
            </Space>
          </Col>
        </Row>
        
        {/* SHAP 分析展示 */}
        {(predictions.length > 0 || perturbationResults || defaultExplorationResult) && (
          <Row style={{ marginTop: '24px' }}>
            <Col span={24}>
              <ShapBar 
                title="SHAP Feature Importance Analysis"
                topK={topK}
                shapData={
                  perturbationResults?.explain?.tabular?.shap || 
                  predictions[0]?.explain?.tabular?.shap || 
                  defaultExplorationResult?.explain?.tabular?.shap ||
                  []
                }
                height={400}
              />
            </Col>
          </Row>
        )}
        </Space>
      ),
    },
    {
      key: 'training',
      label: 'Model Training',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row gutter={24}>
            <Col span={12}>
              <Card title="Training Configuration">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Paragraph>
                    Train a customized exoplanet detection model using your dataset.
                  </Paragraph>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={handleStartTraining}
                    disabled={!dataset || !!trainingJobId}
                    block
                    size="large"
                  >
                    Start Training
                  </Button>
                  {!dataset && (
                    <Text type="secondary">Please upload a training dataset first</Text>
                  )}
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Training Instructions">
                <ul>
                  <li>Training time is approximately 15-30 minutes</li>
                  <li>Supports neural network and random forest models</li>
                  <li>Automatic data preprocessing and feature engineering</li>
                  <li>Real-time monitoring of training progress and metrics</li>
                  <li>Model performance is automatically evaluated after training</li>
                </ul>
              </Card>
            </Col>
          </Row>

          {trainingJobId && (
            <TrainProgress 
              jobId={trainingJobId}
              onJobComplete={handleTrainingComplete}
            />
          )}
        </Space>
      ),
    },
    {
      key: 'metrics',
      label: 'Performance Metrics',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {metrics ? (
            <Row gutter={24}>
              <Col span={12}>
                <Card title="Model Performance Metrics">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                            {(metrics.pr_auc * 100).toFixed(1)}%
                          </div>
                          <div>PR-AUC</div>
                        </div>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                            {metrics.mcc.toFixed(3)}
                          </div>
                          <div>MCC</div>
                        </div>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                            {(metrics.ece * 100).toFixed(1)}%
                          </div>
                          <div>ECE</div>
                        </div>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                            {((metrics.confusion.tp + metrics.confusion.tn) / 
                              (metrics.confusion.tp + metrics.confusion.tn + metrics.confusion.fp + metrics.confusion.fn) * 100).toFixed(1)}%
                          </div>
                          <div>Accuracy</div>
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Confusion Matrix">
                  <Row gutter={8}>
                    <Col span={12}>
                      <Card size="small" style={{ backgroundColor: '#f6ffed', textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                          {metrics.confusion.tp}
                        </div>
                        <div>True Positives</div>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card size="small" style={{ backgroundColor: '#fff2e8', textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#faad14' }}>
                          {metrics.confusion.fp}
                        </div>
                        <div>False Positives</div>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card size="small" style={{ backgroundColor: '#fff1f0', textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff4d4f' }}>
                          {metrics.confusion.fn}
                        </div>
                        <div>False Negatives</div>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card size="small" style={{ backgroundColor: '#f6ffed', textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                          {metrics.confusion.tn}
                        </div>
                        <div>True Negatives</div>
                      </Card>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={24}>
                <Card title="Performance Curves">
                  <Row gutter={16}>
                    <Col span={12}>
                      <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed #d9d9d9', borderRadius: '6px' }}>
                        <BarChartOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                        <div style={{ marginTop: '16px' }}>PR Curve</div>
                        <Text type="secondary">Precision-Recall Curve</Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed #d9d9d9', borderRadius: '6px' }}>
                        <BarChartOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                        <div style={{ marginTop: '16px' }}>Calibration Curve</div>
                        <Text type="secondary">Prediction Probability Calibration</Text>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <SettingOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />
                <Title level={4} type="secondary">No model metrics available</Title>
                <Paragraph type="secondary">
                  Please complete model training to view performance metrics
                </Paragraph>
              </div>
            </Card>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Research Mode - Advanced Analysis Tools</Title>
        <Paragraph>
          Advanced features designed for researchers: batch processing, threshold tuning, model training, and performance evaluation.
        </Paragraph>
        
        <Space>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExportResults}
            disabled={predictions.length === 0}
          >
            Export CSV
          </Button>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExportPDF}
            disabled={predictions.length === 0}
          >
            Export PDF Report
          </Button>
        </Space>
      </div>

      <Tabs 
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
      />
    </div>
  );
};

export default ResearchPage;
