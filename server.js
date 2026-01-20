// 服务器启动入口
const app = require('./app');
const config = require('./config');
const db = require('./config/db');

// 获取端口配置
const PORT = config.port || 4411;

// 连接数据库并启动服务器
db.connect().then(() => {
    console.log('MongoDB 已连接');
    
    // 启动服务器
    const server = app.listen(PORT, () => {
        console.log(`服务器运行在 http://localhost:${PORT}`);
    });
    
    // 添加错误监听器，处理服务器启动错误
    server.on('error', function(err) {
        console.log('服务器启动错误:');
        if (err.code === 'EADDRINUSE') {
            console.log(' - 错误代码: EADDRINUSE');
            console.log(` - 错误描述: 端口${PORT}已被占用`);
            console.log(' - 解决方法: 请关闭占用该端口的应用或修改服务器端口');
        } else {
            console.log(' - 错误代码:', err.code);
            console.log(' - 错误信息:', err.message);
        }
        process.exit(1);
    });
}).catch(err => {
    console.error('无法连接到 MongoDB:', err);
    process.exit(1);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
    process.exit(1);
});

// 处理Promise rejection
process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise rejection:', reason);
});

module.exports = null; // server 在成功连接后才会创建并监听