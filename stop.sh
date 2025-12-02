#!/bin/bash

tmux kill-session -t backend 2>/dev/null
tmux kill-session -t frontend 2>/dev/null

echo "✅ 服务已停止！"
