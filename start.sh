#!/bin/bash

# 关闭旧会话（如果存在）
tmux kill-session -t backend 2>/dev/null
tmux kill-session -t frontend 2>/dev/null

# 启动后端
tmux new-session -d -s backend -c /home/admin/GoodWord/backend
tmux send-keys -t backend 'npm run dev' C-m

# 等待后端启动
sleep 2

# 启动前端
tmux new-session -d -s frontend -c /home/admin/GoodWord/frontend
tmux send-keys -t frontend 'npm run dev' C-m

echo "✅ 服务已启动！"
echo ""
echo "📝 查看会话: tmux ls"
echo "🔗 连接后端: tmux attach -t backend"
echo "🔗 连接前端: tmux attach -t frontend"
echo ""
echo "🌐 访问地址: http://你的公网IP:5173"
