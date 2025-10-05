.PHONY: dev up down clean seed test dev-frontend dev-api

# 开发模式 - 本地运行前端和API
dev: dev-api dev-frontend

# Docker Compose 启动所有服务
up:
	cd infra && docker-compose up --build -d
	@echo "服务已启动:"
	@echo "  前端: http://localhost:5173"
	@echo "  API文档: http://localhost:8000/docs"
	@echo "  MinIO控制台: http://localhost:9001"

# 停止所有服务
down:
	cd infra && docker-compose down

# 本地开发 - 启动前端
dev-frontend:
	cd frontend && npm run dev

# 本地开发 - 启动API
dev-api:
	cd api && uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 初始化示例数据
seed:
	cd api && python scripts/seed_data.py

# 运行测试
test:
	cd frontend && npm run test
	cd api && python -m pytest

# 清理临时文件
clean:
	cd frontend && rm -rf node_modules dist
	cd api && rm -rf __pycache__ .pytest_cache
	docker system prune -f

# 安装依赖
install:
	cd frontend && npm install
	cd api && pip install -r requirements.txt

# 格式化代码
format:
	cd frontend && npm run format
	cd api && black . && isort .

# 代码检查
lint:
	cd frontend && npm run lint
	cd api && flake8 . && mypy .
