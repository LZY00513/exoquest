#!/bin/bash

# ExoQuest Platform 快速启动脚本

set -e  # 遇到错误立即退出

echo "🚀 ExoQuest Platform 快速启动脚本"
echo "=================================="

# 检查Docker和Docker Compose是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 进入项目目录
cd "$(dirname "$0")"

echo "📁 当前目录: $(pwd)"

# 检查.env文件
if [ ! -f "infra/.env" ]; then
    echo "📝 创建环境配置文件..."
    cp infra/.env.example infra/.env
    echo "✅ 已创建 infra/.env 文件"
else
    echo "✅ 环境配置文件已存在"
fi

# 停止可能正在运行的服务
echo "🛑 停止现有服务..."
cd infra
docker-compose down > /dev/null 2>&1 || true

# 构建并启动服务
echo "🔨 构建并启动服务..."
docker-compose up --build -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

# 初始化示例数据
echo "📊 初始化示例数据..."
docker-compose exec -T api python scripts/seed_data.py || echo "⚠️  示例数据初始化失败，但服务可以正常使用"

echo ""
echo "🎉 ExoQuest Platform 启动完成！"
echo ""
echo "📱 访问地址:"
echo "   前端应用:     http://localhost:5173"
echo "   API文档:      http://localhost:8000/docs"
echo "   MinIO控制台:  http://localhost:9001"
echo ""
echo "🔐 MinIO控制台登录:"
echo "   用户名: minioadmin"
echo "   密码:   minioadmin"
echo ""
echo "📝 使用说明:"
echo "   1. 打开浏览器访问 http://localhost:5173"
echo "   2. 选择 '探索模式' 体验系外行星检测流程"
echo "   3. 选择 '研究模式' 进行高级分析"
echo ""
echo "🛠️  管理命令:"
echo "   查看日志:     docker-compose logs -f"
echo "   停止服务:     docker-compose down"
echo "   重启服务:     docker-compose restart"
echo "   清理数据:     docker-compose down -v"
echo ""
echo "❓ 如遇问题，请查看 infra/README.md 获取详细说明"
