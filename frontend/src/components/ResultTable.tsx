import React, { useState } from 'react';
import { Table, Tag, Progress, Button, Space, Tooltip, Card } from 'antd';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ExoplanetPrediction } from '../types';

interface ResultRow extends ExoplanetPrediction {
  id: string;
  target_name?: string;
}

interface ResultTableProps {
  data: ResultRow[];
  loading?: boolean;
  onExport?: () => void;
  onViewDetails?: (row: ResultRow) => void;
  showExport?: boolean;
  title?: string;
}

const ResultTable: React.FC<ResultTableProps> = ({
  data,
  loading = false,
  onExport,
  onViewDetails,
  showExport = true,
  title = 'Prediction Results',
}) => {
  const [sortedInfo, setSortedInfo] = useState<any>({});

  const getClassificationTag = (probs: ExoplanetPrediction['probs']) => {
    let type: 'success' | 'warning' | 'error' = 'success';
    let label = '';
    
    // 处理二分类模型输出 (POSITIVE/NEGATIVE)
    if ('POSITIVE' in probs && 'NEGATIVE' in probs) {
      const positiveProb = probs.POSITIVE || 0;
      
      if (positiveProb > 0.5) {
        type = 'warning';
        label = 'Candidate Planet';  // Worth following up candidate
      } else {
        type = 'success';
        label = 'Confirmed Planet';  // High confidence confirmed planet
      }
    } else {
      // 处理三分类模型输出 (CONF/PC/FP)
      const maxProb = Math.max(probs.CONF || 0, probs.PC || 0, probs.FP || 0);
      
      if (maxProb === (probs.CONF || 0)) {
        type = 'success';
        label = 'Confirmed Planet';
      } else if (maxProb === (probs.PC || 0)) {
        type = 'warning';
        label = 'Candidate Planet';
      } else {
        type = 'error';
        label = 'Needs Verification';  // Changed to "Needs Verification" instead of "False Positive"
      }
    }
    
    return <Tag color={type}>{label}</Tag>;
  };

  const getUncertainty = (probs: ExoplanetPrediction['probs']) => {
    // 计算不确定性（熵）
    let values: number[];
    
    if ('POSITIVE' in probs && 'NEGATIVE' in probs) {
      // 二分类模型
      values = [probs.POSITIVE || 0, probs.NEGATIVE || 0];
    } else {
      // 三分类模型
      values = [probs.CONF || 0, probs.PC || 0, probs.FP || 0];
    }
    
    const entropy = -values.reduce((sum, p) => sum + (p > 0 ? p * Math.log2(p) : 0), 0);
    const maxEntropy = Math.log2(values.length); // 类别的最大熵
    return entropy / maxEntropy; // 归一化到 [0, 1]
  };

  const columns: ColumnsType<ResultRow> = [
    {
      title: 'Target',
      dataIndex: 'object_id',
      key: 'object_id',
      render: (objectId: string, record: ResultRow) => objectId || record.target_name || record.id,
      width: 120,
    },
    {
      title: 'Classification',
      key: 'classification',
      render: (_, record) => getClassificationTag(record.probs),
      width: 100,
    },
    {
      title: 'Candidate Planet',
      key: 'positive_prob',
      render: (_, record) => {
        const prob = 'POSITIVE' in record.probs ? (record.probs.POSITIVE || 0) : (record.probs.PC || 0);
        return (
          <div style={{ width: 80 }}>
            <Progress 
              percent={Math.round(prob * 100)} 
              size="small" 
              strokeColor="#faad14"
              showInfo={false}
            />
            <span style={{ fontSize: '12px' }}>{(prob * 100).toFixed(1)}%</span>
          </div>
        );
      },
      sorter: (a, b) => {
        const aProb = 'POSITIVE' in a.probs ? (a.probs.POSITIVE || 0) : (a.probs.PC || 0);
        const bProb = 'POSITIVE' in b.probs ? (b.probs.POSITIVE || 0) : (b.probs.PC || 0);
        return aProb - bProb;
      },
      sortOrder: sortedInfo.columnKey === 'positive_prob' ? sortedInfo.order : null,
      width: 120,
    },
    {
      title: 'Confirmed Planet',
      key: 'negative_prob',
      render: (_, record) => {
        const prob = 'NEGATIVE' in record.probs ? (record.probs.NEGATIVE || 0) : (record.probs.CONF || 0);
        return (
          <div style={{ width: 80 }}>
            <Progress 
              percent={Math.round(prob * 100)} 
              size="small" 
              strokeColor="#52c41a"
              showInfo={false}
            />
            <span style={{ fontSize: '12px' }}>{(prob * 100).toFixed(1)}%</span>
          </div>
        );
      },
      sorter: (a, b) => {
        const aProb = 'NEGATIVE' in a.probs ? (a.probs.NEGATIVE || 0) : (a.probs.CONF || 0);
        const bProb = 'NEGATIVE' in b.probs ? (b.probs.NEGATIVE || 0) : (b.probs.CONF || 0);
        return aProb - bProb;
      },
      sortOrder: sortedInfo.columnKey === 'negative_prob' ? sortedInfo.order : null,
      width: 120,
    },
    {
      title: 'Confidence',
      dataIndex: 'conf',
      key: 'confidence',
      render: (conf: number) => (
        <Tooltip title={`Confidence: ${(conf * 100).toFixed(2)}%`}>
          <Progress 
            percent={Math.round(conf * 100)} 
            size="small" 
            strokeColor="#1890ff"
          />
        </Tooltip>
      ),
      sorter: (a, b) => a.conf - b.conf,
      sortOrder: sortedInfo.columnKey === 'confidence' ? sortedInfo.order : null,
      width: 120,
    },
    {
      title: 'Uncertainty',
      key: 'uncertainty',
      render: (_, record) => {
        const uncertainty = getUncertainty(record.probs);
        return (
          <Tooltip title={`Uncertainty: ${(uncertainty * 100).toFixed(2)}%`}>
            <Progress 
              percent={Math.round(uncertainty * 100)} 
              size="small" 
              strokeColor="#722ed1"
            />
          </Tooltip>
        );
      },
      sorter: (a, b) => getUncertainty(a.probs) - getUncertainty(b.probs),
      sortOrder: sortedInfo.columnKey === 'uncertainty' ? sortedInfo.order : null,
      width: 120,
    },
    {
      title: 'Model Version',
      dataIndex: 'version',
      key: 'version',
      render: (version: string) => <Tag>{version}</Tag>,
      width: 100,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => onViewDetails?.(record)}
            size="small"
          >
            Details
          </Button>
        </Space>
      ),
      width: 80,
    },
  ];

  const handleTableChange = (_pagination: any, _filters: any, sorter: any) => {
    setSortedInfo(sorter);
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      // 默认导出为CSV - 支持二分类和三分类模型
      const isBinaryModel = data.length > 0 && ('POSITIVE' in data[0].probs && 'NEGATIVE' in data[0].probs);
      
      const headers = isBinaryModel 
        ? ['Target', 'Candidate Planet Probability', 'Confirmed Planet Probability', 'Confidence', 'Uncertainty', 'Model Version']
        : ['Target', 'Confirmed Planet Probability', 'Candidate Planet Probability', 'False Positive Probability', 'Confidence', 'Model Version'];
      
      const csvContent = [
        headers.join(','),
        ...data.map(row => {
          if (isBinaryModel) {
            return [
              row.target_name || row.id,
              row.probs.POSITIVE?.toFixed(4) || '0.0000',
              row.probs.NEGATIVE?.toFixed(4) || '0.0000',
              row.conf.toFixed(4),
              getUncertainty(row.probs).toFixed(4),
              row.version,
            ].join(',');
          } else {
            return [
              row.target_name || row.id,
              row.probs.CONF?.toFixed(4) || '0.0000',
              row.probs.PC?.toFixed(4) || '0.0000',
              row.probs.FP?.toFixed(4) || '0.0000',
              row.conf.toFixed(4),
              row.version,
            ].join(',');
          }
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'exoplanet_predictions.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  return (
    <Card 
      title={title}
      extra={
        showExport && (
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
            disabled={data.length === 0}
          >
            Export CSV
          </Button>
        )
      }
      className="result-table"
    >
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `Items ${range[0]}-${range[1]} of ${total} total records`,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1000 }}
        size="small"
      />
    </Card>
  );
};

export default ResultTable;
