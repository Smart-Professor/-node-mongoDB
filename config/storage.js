// 存储配置文件
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const config = require('./index');

// 配置multer文件存储选项
const storage = multer.diskStorage({
    // 设置文件存储路径
    destination: function (req, file, cb) {
        // 确保上传目录存在，不存在则创建
        if (!fs.existsSync(config.uploadDir)) {
            fs.mkdirSync(config.uploadDir);
        }
        cb(null, config.uploadDir); // 上传文件存储在uploads目录
    },
    // 设置文件名
    filename: function (req, file, cb) {
        cb(null, file.originalname); // 使用原始文件名
    }
});

// 创建multer实例，使用上述存储配置
const upload = multer({
    storage: storage,
    // 允许任何文件类型的过滤器
    fileFilter: function (req, file, cb) {
        // 接受所有文件，不做类型检查
        cb(null, true);
    }
});

module.exports = {
    upload,
    storage
};