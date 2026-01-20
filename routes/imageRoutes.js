// 图片相关路由模块
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const config = require('../config');

// 获取已上传图片列表的API
router.get('/api/images', function(req, res) {
    try {
        const uploadsDir = config.uploadDir;
        
        // 读取uploads目录中的所有文件
        fs.readdir(uploadsDir, (err, files) => {
            if (err) {
                console.error('读取上传目录错误:', err);
                return res.status(500).json({ error: '获取图片列表失败' });
            }
            
            // 过滤常见的图片格式文件
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
            const imageFiles = files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return imageExtensions.includes(ext);
            });
            
            // 构建图片信息列表
            const images = imageFiles.map(file => ({
                name: file,
                url: `/uploads/${encodeURIComponent(file)}`,
                size: fs.statSync(path.join(uploadsDir, file)).size,
                modified: fs.statSync(path.join(uploadsDir, file)).mtime
            }));
            
            res.json(images);
        });
    } catch (error) {
        console.error('获取图片列表时出错:', error);
        res.status(500).json({ error: '获取图片列表失败' });
    }
});

module.exports = router;