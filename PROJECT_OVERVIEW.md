# ExoQuest Platform - 项目概览

## 🎯 项目简介

ExoQuest Platform 是一个完整的系外行星检测与分析平台，提供了从数据上传到结果分析的端到端解决方案。该平台结合了先进的机器学习算法和直观的用户界面，适用于科研机构、教育机构和天文爱好者。

## 🏗️ 技术架构

### 前端 (React + TypeScript)
- **框架**: React 19 + TypeScript + Vite
- **UI库**: Ant Design 5.x
- **图表**: Plotly.js
- **路由**: React Router
- **状态管理**: React Hooks
- **HTTP客户端**: Axios

### 后端 (FastAPI + Python)
- **框架**: FastAPI
- **数据验证**: Pydantic
- **异步处理**: asyncio
- **HTTP客户端**: httpx
- **科学计算**: NumPy, Pandas, Scikit-learn
- **可视化**: Matplotlib, Seaborn

### 基础设施
- **对象存储**: MinIO (S3兼容)
- **缓存/队列**: Redis
- **容器化**: Docker + Docker Compose
- **反向代理**: 支持Nginx (可选)

## 📁 项目结构

```
exoquest/
├── frontend/                 # React前端应用
│   ├── src/
│   │   ├── components/      # 可复用组件
│   │   ├── pages/          # 页面组件
│   │   ├── lib/            # 工具库
│   │   ├── types/          # TypeScript类型定义
│   │   └── hooks/          # 自定义Hooks
│   ├── public/             # 静态资源
│   └── Dockerfile          # 前端容器配置
├── api/                     # FastAPI后端
│   ├── models.py           # 数据模型
│   ├── main.py             # 主应用
│   ├── config.py           # 配置管理
│   ├── model_adapter.py    # 模型适配器
│   ├── services/           # 业务服务
│   ├── scripts/            # 辅助脚本
│   └── Dockerfile          # 后端容器配置
├── infra/                   # 基础设施配置
│   ├── docker-compose.yml  # 服务编排
│   ├── .env.example        # 环境变量模板
│   └── README.md           # 部署说明
├── start.sh                # 快速启动脚本
├── Makefile                # 开发脚本
└── README.md               # 项目说明
```

## 🚀 核心功能

### 1. 探索模式 (初学者友好)
- **5步引导流程**: 数据上传 → 可视化 → 检测 → 解释 → 反馈
- **示例数据**: 内置开普勒-452b等真实数据
- **交互式教程**: 工具提示和说明引导
- **结果分享**: 生成只读链接分享发现

### 2. 研究模式 (专业分析)
- **批量处理**: 支持大规模数据集并行分析
- **阈值调优**: 实时调整决策阈值，优化性能指标
- **模型训练**: 使用自定义数据训练专属模型
- **性能评估**: 完整的模型指标和可视化分析
- **数据导出**: CSV和PDF格式的结果报告

### 3. 数据可视化
- **光变曲线查看器**: 原始、去趋势、相位折叠三种视图
- **特征重要性**: SHAP全局和局部解释
- **性能曲线**: PR曲线和校准曲线
- **交互式图表**: 支持缩放、刷选、下载

### 4. 模型服务集成
- **Mock模式**: 内置模拟器，无需外部依赖
- **真实模式**: 一键切换到生产模型服务
- **标准API**: RESTful接口，易于集成
- **实时监控**: 训练进度和任务状态追踪

## 🔧 快速开始

### 一键启动 (推荐)
```bash
# 克隆项目
git clone <repository-url>
cd exoquest

# 运行启动脚本
./start.sh
```

### 手动启动
```bash
# 1. 配置环境
cp infra/.env.example infra/.env

# 2. 启动服务
cd infra
docker-compose up --build -d

# 3. 初始化数据
docker-compose exec api python scripts/seed_data.py
```

### 本地开发
```bash
# 启动基础服务
make dev-infra

# 启动前端
make dev-frontend

# 启动后端
make dev-api
```

## 🌐 服务访问

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端应用 | http://localhost:5173 | 主要用户界面 |
| API文档 | http://localhost:8000/docs | Swagger文档 |
| MinIO控制台 | http://localhost:9001 | 对象存储管理 |

## 🔄 模型服务集成

### Mock模式 (默认)
```bash
USE_MODEL_MOCK=true
```
- 内置模拟算法
- 无需外部依赖
- 适合开发和演示

### 生产模式
```bash
USE_MODEL_MOCK=false
MODEL_BASE_URL=http://your-model-service:9002
```
- 连接真实模型服务
- 支持自定义算法
- 生产环境推荐

### 模型服务API规范
模型服务需要实现以下接口：
- `POST /predict/tabular` - 表格数据预测
- `POST /predict/curve` - 光变曲线预测  
- `POST /predict/fuse` - 融合预测
- `POST /train` - 开始训练
- `GET /jobs/{job_id}/status` - 任务状态
- `GET /models/{model_id}/metrics` - 模型指标

## 📊 数据格式

### 表格数据 (CSV)
```csv
target_name,period,duration_hr,depth_ppm,snr,teff,logg,tmag,crowding
Kepler-452b,384.843,10.1,515.0,12.3,5757,4.32,13.426,0.98
```

### 光变曲线 (JSON)
```json
{
  "time": [0.0, 0.02, 0.04, ...],
  "flux": [1.0, 0.999, 1.001, ...],
  "flux_err": [0.001, 0.001, 0.001, ...]
}
```

## 🧪 测试

### 前端测试
```bash
cd frontend
npm run test
```

### 后端测试
```bash
cd api
python -m pytest
```

### 端到端测试
```bash
cd frontend
npm run test:e2e
```

## 📈 性能优化

### 前端优化
- 组件懒加载
- 图表虚拟化
- 请求缓存
- 代码分割

### 后端优化
- 异步处理
- 连接池
- 缓存策略
- 批量操作

### 基础设施优化
- Redis集群
- MinIO分布式存储
- 负载均衡
- CDN加速

## 🔒 安全考虑

### 认证授权
- JWT令牌认证
- 角色权限控制
- API限流
- CORS配置

### 数据安全
- 文件类型验证
- 大小限制
- 恶意代码检测
- 数据加密传输

## 📚 扩展开发

### 添加新的预测模型
1. 在`model_adapter.py`中添加新方法
2. 更新API路由
3. 添加前端界面
4. 编写测试用例

### 自定义UI组件
1. 在`components/`目录创建组件
2. 遵循Ant Design设计规范
3. 添加TypeScript类型
4. 编写单元测试

### 集成新的数据源
1. 扩展数据模型
2. 添加解析器
3. 更新上传组件
4. 测试兼容性

## 🐛 故障排除

### 常见问题
1. **端口冲突**: 修改docker-compose.yml中的端口映射
2. **内存不足**: 增加Docker内存分配
3. **网络问题**: 检查防火墙和代理设置
4. **权限错误**: 确保Docker有足够权限

### 调试工具
- 浏览器开发者工具
- Docker日志: `docker-compose logs -f`
- API调试: http://localhost:8000/docs
- Redis监控: `redis-cli monitor`

## 🤝 贡献指南

### 开发流程
1. Fork项目
2. 创建功能分支
3. 编写代码和测试
4. 提交Pull Request

### 代码规范
- 前端: ESLint + Prettier
- 后端: Black + isort + flake8
- 提交: Conventional Commits

## 📄 许可证

本项目基于Apache 2.0许可证开源发布。

## 🙋‍♂️ 支持

- 📧 邮件: support@exoquest.platform
- 📖 文档: https://docs.exoquest.platform
- 🐛 问题: GitHub Issues
- 💬 讨论: GitHub Discussions

---

**免责声明**: NASA does not endorse any non-U.S. Government entity and is not responsible for information contained on non-U.S. Government websites. This platform is an independent research tool.
