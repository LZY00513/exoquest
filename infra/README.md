# ExoQuest Platform 基础设施说明

## 服务架构

ExoQuest Platform 采用微服务架构，包含以下核心服务：

### 1. 前端服务 (frontend)
- **技术栈**: React + TypeScript + Vite + Ant Design
- **端口**: 5173
- **功能**: 用户界面，支持探索模式和研究模式

### 2. 后端API服务 (api)
- **技术栈**: FastAPI + Python
- **端口**: 8000
- **功能**: 业务逻辑处理、模型代理、数据管理

### 3. Redis服务 (redis)
- **版本**: Redis 7 Alpine
- **端口**: 6379
- **功能**: 任务队列、缓存、实时通信

### 4. MinIO服务 (minio)
- **版本**: Latest
- **端口**: 9000 (API), 9001 (Web控制台)
- **功能**: 对象存储，用于数据集、报告、反馈数据

## 快速启动

### 1. 环境准备
```bash
# 克隆项目
git clone <repository-url>
cd exoquest

# 复制环境配置
cp infra/.env.example infra/.env
```

### 2. 使用Docker Compose启动
```bash
# 启动所有服务
cd infra
docker-compose up --build -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 3. 初始化数据
```bash
# 等待服务完全启动后
sleep 30

# 初始化示例数据
docker-compose exec api python scripts/seed_data.py
```

## 服务访问

| 服务 | URL | 说明 |
|------|-----|------|
| 前端应用 | http://localhost:5173 | 主要用户界面 |
| API文档 | http://localhost:8000/docs | Swagger API文档 |
| MinIO控制台 | http://localhost:9001 | 对象存储管理界面 |
| Redis | localhost:6379 | Redis数据库 |

## 默认账号

### MinIO控制台
- 用户名: `minioadmin`
- 密码: `minioadmin`

## 环境变量配置

### 前端环境变量
```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

### 后端环境变量
```bash
# 模型服务配置
MODEL_BASE_URL=http://localhost:9002
USE_MODEL_MOCK=true

# MinIO配置
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# Redis配置
REDIS_URL=redis://redis:6379

# 安全配置
JWT_SECRET=exoquest-jwt-secret-key
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 开发模式

### 本地开发（不使用Docker）

1. **启动基础服务**
```bash
cd infra
docker-compose up redis minio -d
```

2. **启动后端API**
```bash
cd api
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

3. **启动前端**
```bash
cd frontend
npm install
npm run dev
```

## 数据存储

### MinIO存储桶
- `datasets`: 用户上传的数据集
- `reports`: 生成的报告和图表
- `feedback`: 用户反馈数据

### Redis数据结构
- `training_job:{job_id}`: 训练任务状态
- `model_metrics:{model_id}`: 模型性能指标

## 监控和日志

### 查看服务日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f api
docker-compose logs -f frontend
```

### 健康检查
- API健康检查: http://localhost:8000/api/health
- Redis健康检查: `docker-compose exec redis redis-cli ping`
- MinIO健康检查: http://localhost:9000/minio/health/live

## 故障排除

### 常见问题

1. **端口冲突**
   - 确保端口5173、8000、6379、9000、9001未被占用
   - 可在docker-compose.yml中修改端口映射

2. **MinIO连接失败**
   - 检查MinIO服务是否正常启动
   - 验证访问密钥配置是否正确

3. **前端无法连接API**
   - 检查CORS配置
   - 验证API服务是否正常运行

4. **内存不足**
   - 确保Docker有足够的内存分配（推荐4GB以上）

### 重置环境
```bash
# 停止所有服务
docker-compose down

# 清理数据卷
docker-compose down -v

# 重新构建并启动
docker-compose up --build -d
```

## 生产部署

### 环境变量调整
```bash
# 生产环境配置
USE_MODEL_MOCK=false
MODEL_BASE_URL=https://your-model-service.com
JWT_SECRET=your-secure-secret-key
DEBUG=false
```

### 安全建议
1. 更改默认密码和密钥
2. 使用HTTPS
3. 配置防火墙规则
4. 定期备份数据
5. 监控服务状态

### 扩展性考虑
- 使用负载均衡器分发请求
- 配置Redis集群
- 使用外部对象存储服务
- 实施日志聚合和监控

## API集成

### 切换到真实模型服务

1. **部署模型服务**
   - 确保模型服务实现了规定的API接口
   - 服务应监听指定端口（默认9002）

2. **更新配置**
```bash
# 修改.env文件
USE_MODEL_MOCK=false
MODEL_BASE_URL=http://your-model-service:9002
```

3. **重启API服务**
```bash
docker-compose restart api
```

### 模型服务API规范

模型服务应实现以下接口：
- `POST /predict/tabular`
- `POST /predict/curve`
- `POST /predict/fuse`
- `POST /train`
- `GET /jobs/{job_id}/status`
- `GET /models/{model_id}/metrics`

详细的API规范请参考API文档: http://localhost:8000/docs
