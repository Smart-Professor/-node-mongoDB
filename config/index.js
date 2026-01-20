// 服务器配置文件
const path = require('path');
module.exports = {
    // 服务器端口号
    port: 4413,
    // 主机地址
    host: 'localhost',
    // 静态文件目录配置
    staticDirs: {
        public: '/public',
        uploads: '/uploads'
    },
    // 上传目录路径
    uploadDir: path.join(__dirname, '../uploads')
    ,
    // MongoDB 连接字符串（使用远程MongoDB）
    mongoUri: 'mongodb://linercs:yl157515@121.41.7.240:27017/linercs'
};