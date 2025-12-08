// server.js

const net = require('net');
const express = require('express');
const app = express();

// --- 配置常量 ---
const WEB_SERVER_PORT = 3000; // Node.js Web 服务器运行的端口
const C_CORE_PORT = 8080;   // C Core Server 监听的端口 (必须与 C 代码中PORT宏一致)
const C_CORE_HOST = '127.0.0.1'; // C Core Server 的 IP 地址 (本机)

// --- 辅助函数：与 C Core Server 通信 ---
/**
 * 封装 Socket 通信逻辑。
 * @param {string} command 要发送给 C Core 的纯文本指令，例如 'SEARCH query'
 * @returns {Promise<object>} 返回 C Core 解析后的 JSON 对象
 */
function sendCommandToCCore(command) {
    return new Promise((resolve, reject) => {
        
        // 1. 创建 Socket Client 并连接 C Core
        const client = net.createConnection({ 
            port: C_CORE_PORT, 
            host: C_CORE_HOST 
        }, () => {
            console.log(`[Node.js] 🔌 已连接到 C Core (${C_CORE_HOST}:${C_CORE_PORT})`);
            
            // 2. 发送指令。注意：必须以换行符 '\n' 结束，方便 C 端解析
            client.write(`${command}\n`); 
        });

        let cResponse = '';

        // 3. 接收 C Core 的响应数据
        client.on('data', (data) => {
            cResponse += data.toString();
        });

        // 4. 当 C Core 关闭连接或发送完数据时触发 'end' 事件
        client.on('end', () => {
            console.log('[Node.js] 🛑 C Core 连接关闭，开始解析数据。');
            try {
                // 解析 C Core 返回的 JSON 字符串
                const result = JSON.parse(cResponse);
                resolve(result);
            } catch (e) {
                console.error('[Node.js] ❌ JSON 解析失败:', cResponse);
                reject(new Error('Invalid JSON response from C Core.'));
            }
        });

        // 5. 错误处理
        client.on('error', (err) => {
            console.error(`[Node.js] 🚨 C Core 连接错误: ${err.message}`);
            reject(new Error(`C Core is unavailable or error: ${err.message}`));
        });
        
        // 增加超时处理，避免长时间等待
        client.setTimeout(2000); // 2秒超时
        client.on('timeout', () => {
            client.destroy();
            reject(new Error('C Core response timed out.'));
        });
    });
}

// =======================================================
//                       HTTP 路由设置
// =======================================================

// 启用 Express JSON 解析中间件
app.use(express.json());

// 路由 1: 搜索歌曲 (调用 C Core 的 Trie 树查找逻辑)
app.get('/api/search', async (req, res) => {
    const query = req.query.q || ''; // 获取查询参数 q
    
    if (!query) {
        return res.status(400).json({ status: 'error', message: 'Query parameter "q" is required.' });
    }

    // 构造 C Core 命令
    const command = `SEARCH ${query}`; 
    console.log(`[Node.js] 🔍 收到搜索请求，发送命令: ${command}`);

    try {
        const cCoreResult = await sendCommandToCCore(command);
        // 将 C Core 的结果直接转发给前端
        res.json(cCoreResult); 
    } catch (error) {
        console.error('[Node.js] ⚠️ 搜索失败:', error.message);
        res.status(503).json({ 
            status: 'error', 
            message: `Service Error: ${error.message}` 
        });
    }
});

// 路由 2: 播放下一曲 (调用 C Core 的循环链表逻辑)
app.post('/api/play/next', async (req, res) => {
    const command = 'PLAY NEXT'; // 构造播放指令
    console.log(`[Node.js] ▶️ 收到下一曲请求，发送命令: ${command}`);
    
    try {
        const cCoreResult = await sendCommandToCCore(command);
        // 将 C Core 的播放状态转发给前端
        res.json(cCoreResult);
    } catch (error) {
        console.error('[Node.js] ⚠️ 播放失败:', error.message);
        res.status(503).json({ 
            status: 'error', 
            message: `Service Error: ${error.message}` 
        });
    }
});

// 路由 3: PING 测试 (测试 C Core 是否在线)
app.get('/api/ping', async (req, res) => {
    try {
        const cCoreResult = await sendCommandToCCore('PING');
        res.json(cCoreResult);
    } catch (error) {
        res.status(503).json({ status: 'error', message: `C Core Offline: ${error.message}` });
    }
});


// 启动 Web 服务器
app.listen(WEB_SERVER_PORT, () => {
    console.log(`[Node.js] ✨ Web Server 运行中, 端口: ${WEB_SERVER_PORT}`);
    console.log(`[Node.js] 🔗 测试连接: http://localhost:${WEB_SERVER_PORT}/api/ping`);
});