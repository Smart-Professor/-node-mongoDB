// 图片相关API路由
const express = require('express');
const router = express.Router();
const config = require('../config/index');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');


// 获取已上传图片列表的API
router.get('/images', function(req, res) {
    try {
        const uploadsDir = config.uploadDir;
        
        // Check if directory exists
        if (!fs.existsSync(uploadsDir)) {
            return res.status(500).json({ 
                success: false, 
                data: null, 
                error: '获取图片列表失败' 
            });
        }
        
        fs.readdir(uploadsDir, (err, files) => {
            if (err) {
                console.error('fs.readdir error:', err);
                return res.status(500).json({ 
                    success: false, 
                    data: null, 
                    error: '获取图片列表失败' 
                });
            }
            
            // 构建文件信息列表（包括所有文件类型）
            const images = files.map(file => {
                const filePath = path.join(uploadsDir, file);
                const stats = fs.statSync(filePath);
                const ext = path.extname(file).toLowerCase();
                return {
                    name: file,
                    url: `/uploads/${file}`,
                    size: stats.size,
                    modified: stats.mtime,
                    mimetype: mime.lookup(file) || 'application/octet-stream'
                };
            });
            
            return res.status(200).json({ 
                success: true, 
                data: images 
            });
        });
    } catch (error) {
        console.error('获取图片列表时出错:', error);
        return res.status(500).json({ 
            success: false, 
            data: null, 
            error: '获取图片列表失败' 
        });
    }
});

module.exports = router;