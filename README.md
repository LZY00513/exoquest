# 🌌 ExoQuest Platform

<div align="center">

[![NASA Space Apps Challenge 2025](https://img.shields.io/badge/NASA-Space%20Apps%20Challenge%202025-blue?style=for-the-badge&logo=nasa)](https://www.spaceappschallenge.org/)
[![License](https://img.shields.io/badge/license-Apache%202.0-green?style=for-the-badge)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-blue?style=for-the-badge&logo=python)](https://python.org)
[![React](https://img.shields.io/badge/React-19+-blue?style=for-the-badge&logo=react)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)

**一个AI驱动的系外行星检测与研究平台，集成机器学习模型和交互式可视化分析**

[🚀 快速开始](#-快速开始) • [📖 文档](#-文档) • [🔧 开发](#-开发) • [🤝 贡献](#-贡献)

</div>

## 📋 目录

- [项目简介](#-项目简介)
- [核心特性](#-核心特性)
- [技术架构](#-技术架构)
- [快速开始](#-快速开始)
- [使用指南](#-使用指南)
- [API文档](#-api文档)
- [开发指南](#-开发指南)
- [部署说明](#-部署说明)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

## 🎯 项目简介

ExoQuest Platform 是为NASA Space Apps Challenge 2025开发的系外行星检测与分析平台。该平台结合了先进的机器学习算法、直观的用户界面和强大的数据可视化能力，为天文学家、研究人员和教育工作者提供从数据上传到结果分析的完整解决方案。

### 🌟 主要特色

- **🔍 智能检测**: 基于CatBoost/LightGBM的机器学习模型，支持表格数据和光变曲线分析
- **📊 交互可视化**: 内置光变曲线查看器、SHAP特征重要性分析和性能指标可视化
- **🎯 双模式设计**: 探索模式（初学者友好）和研究模式（专业分析）
- **⚡ 实时分析**: 支持批量处理和实时阈值调优
- **🔧 易于部署**: 一键启动脚本，Docker容器化部署

## ✨ 核心特性

### 🔬 探索模式（初学者友好）
- **5步引导流程**: 数据上传 → 可视化 → 检测 → 解释 → 反馈
- **示例数据**: 内置开普勒-452b等真实系外行星数据
- **交互式教程**: 工具提示和说明引导新用户
- **结果分享**: 生成只读链接分享发现成果

### 🔬 研究模式（专业分析）
- **批量处理**: 支持大规模数据集并行分析
- **阈值调优**: 实时调整决策阈值，优化性能指标
- **模型训练**: 使用自定义数据训练专属模型
- **性能评估**: 完整的模型指标和可视化分析
- **数据导出**: CSV和PDF格式的结果报告

### 📈 数据可视化
- **光变曲线查看器**: 原始、去趋势、相位折叠三种视图
- **特征重要性**: SHAP全局和局部解释
- **性能曲线**: PR曲线和校准曲线
- **交互式图表**: 支持缩放、刷选、下载

## 🏗️ 技术架构

### 前端技术栈
- **框架**: React 19 + TypeScript + Vite
- **UI库**: Ant Design 5.x
- **图表**: Plotly.js
- **动画**: Framer Motion
- **路由**: React Router
- **HTTP客户端**: Axios

### 后端技术栈
- **框架**: FastAPI
- **数据验证**: Pydantic
- **异步处理**: asyncio
- **机器学习**: CatBoost, LightGBM, Scikit-learn
- **科学计算**: NumPy, Pandas
- **可视化**: Matplotlib, Seaborn
- **解释性**: SHAP

### 基础设施
- **对象存储**: MinIO (S3兼容)
- **缓存/队列**: Redis
- **容器化**: Docker + Docker Compose
- **反向代理**: 支持Nginx (可选)

## 🚀 快速开始

### 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ RAM
- 2GB+ 可用磁盘空间

### 一键启动（推荐）

```bash
# 克隆项目
git clone https://github.com/your-username/exoquest.git
cd exoquest

# 运行启动脚本
chmod +x start.sh
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
# 安装依赖
make install

# 启动基础服务
make dev-infra

# 启动前端（新终端）
make dev-frontend

# 启动后端（新终端）
make dev-api
```

## 🌐 服务访问

| 服务 | 地址 | 说明 |
|------|------|------|
| 🎨 前端应用 | http://localhost:5173 | 主要用户界面 |
| 📚 API文档 | http://localhost:8000/docs | Swagger文档 |
| 🗄️ MinIO控制台 | http://localhost:9001 | 对象存储管理 |

**MinIO控制台登录信息:**
- 用户名: `minioadmin`
- 密码: `minioadmin`

## 📖 使用指南

### 探索模式使用流程

1. **上传数据**: 选择CSV文件或使用示例数据
2. **查看可视化**: 浏览光变曲线和特征分布
3. **运行检测**: 使用AI模型进行系外行星检测
4. **理解结果**: 查看SHAP解释和置信度分析
5. **分享发现**: 生成分享链接或导出报告

### 研究模式功能

- **批量分析**: 上传多个数据集进行并行处理
- **阈值优化**: 实时调整检测阈值，查看性能变化
- **模型训练**: 使用自定义数据训练个性化模型
- **性能评估**: 查看ROC曲线、混淆矩阵等指标

### 支持的数据格式

**表格数据 (CSV)**:
```csv
target_name,period,duration_hr,depth_ppm,snr,teff,logg,tmag,crowding
Kepler-452b,384.843,10.1,515.0,12.3,5757,4.32,13.426,0.98
```

**光变曲线 (JSON)**:
```json
{
  "time": [0.0, 0.02, 0.04, ...],
  "flux": [1.0, 0.999, 1.001, ...],
  "flux_err": [0.001, 0.001, 0.001, ...]
}
```

## 📚 API文档

### 核心接口

- `POST /api/predict/tabular` - 表格数据预测
- `POST /api/predict/curve` - 光变曲线预测
- `POST /api/predict/fuse` - 融合预测
- `POST /api/train` - 开始训练
- `GET /api/jobs/{job_id}/status` - 任务状态
- `GET /api/models/{model_id}/metrics` - 模型指标

详细的API文档请访问: http://localhost:8000/docs

## 🔧 开发指南

### 项目结构

```
exoquest/
├── frontend/                 # React前端应用
│   ├── src/
│   │   ├── components/      # 可复用组件
│   │   ├── pages/          # 页面组件
│   │   ├── lib/            # 工具库
│   │   └── types/          # TypeScript类型
│   └── Dockerfile
├── api/                     # FastAPI后端
│   ├── models.py           # 数据模型
│   ├── main.py             # 主应用
│   ├── model_adapter.py    # 模型适配器
│   └── services/           # 业务服务
├── infra/                   # 基础设施配置
│   └── docker-compose.yml
└── start.sh                # 启动脚本
```

### 开发命令

```bash
# 代码格式化
make format

# 代码检查
make lint

# 运行测试
make test

# 清理临时文件
make clean
```

### 添加新功能

1. **新组件**: 在 `frontend/src/components/` 创建
2. **新页面**: 在 `frontend/src/pages/` 创建
3. **新API**: 在 `api/` 目录添加路由
4. **新服务**: 在 `api/services/` 添加业务逻辑

## 🚀 部署说明

### 生产环境部署

```bash
# 1. 配置生产环境变量
cp infra/.env.example infra/.env
# 编辑 .env 文件，设置生产配置

# 2. 启动生产服务
cd infra
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 3. 配置反向代理 (可选)
# 使用 Nginx 进行负载均衡和SSL终止
```

### 环境变量配置

```bash
# 模型服务配置
USE_MODEL_MOCK=false
MODEL_BASE_URL=http://your-model-service:9002

# 数据库配置
REDIS_URL=redis://your-redis:6379

# 对象存储配置
MINIO_ENDPOINT=your-minio:9000
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key

# 安全配置
JWT_SECRET=your-jwt-secret
CORS_ORIGINS=https://your-domain.com
```

## 🧪 测试

### 运行测试

```bash
# 前端测试
cd frontend
npm run test

# 后端测试
cd api
python -m pytest

# 端到端测试
cd frontend
npm run test:e2e
```

### 测试覆盖率

```bash
# 前端覆盖率
cd frontend
npm run test:coverage

# 后端覆盖率
cd api
pytest --cov=. --cov-report=html
```

## 📊 性能优化

### 前端优化
- ✅ 组件懒加载
- ✅ 图表虚拟化
- ✅ 请求缓存
- ✅ 代码分割

### 后端优化
- ✅ 异步处理
- ✅ 连接池
- ✅ 缓存策略
- ✅ 批量操作

## 🔒 安全考虑

- **认证授权**: JWT令牌认证，角色权限控制
- **数据验证**: 文件类型验证，大小限制
- **网络安全**: CORS配置，API限流
- **数据安全**: 数据加密传输，恶意代码检测

## 🤝 贡献指南

### 贡献流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范

- **前端**: ESLint + Prettier + TypeScript
- **后端**: Black + isort + flake8 + mypy
- **提交**: Conventional Commits

### 问题报告

请使用 [GitHub Issues](https://github.com/your-username/exoquest/issues) 报告问题，并包含：

- 问题描述
- 复现步骤
- 预期行为
- 实际行为
- 环境信息

## 📄 许可证

本项目基于 [Apache 2.0 许可证](LICENSE) 开源发布。

## 🙏 致谢

- **NASA Space Apps Challenge** 提供灵感和平台
- **开源社区** 提供的优秀工具和库
- **项目贡献者** 的努力和奉献

## 📞 联系我们

- 📧 邮件: support@exoquest.platform
- 📖 文档: https://docs.exoquest.platform
- 🐛 问题: [GitHub Issues](https://github.com/your-username/exoquest/issues)
- 💬 讨论: [GitHub Discussions](https://github.com/your-username/exoquest/discussions)

---

<div align="center">

**免责声明**: NASA does not endorse any non-U.S. Government entity and is not responsible for information contained on non-U.S. Government websites. This platform is an independent research tool.

Made with ❤️ for NASA Space Apps Challenge 2025

</div>
