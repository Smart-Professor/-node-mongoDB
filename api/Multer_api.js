const express = require('express');
const router = express.Router();
const multer = require('multer');
const mime = require('mime-types');
const path = require('path');
const fs = require('fs');
const config = require('../config/index');

// --------------------------
// 配置存储路径和文件名
// --------------------------
const uploadDir = config.uploadDir || path.join(__dirname, '../uploads'); // 上传文件保存的目录（需手动创建或自动生成）

// 确保上传目录存在，不存在则创建
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // recursive: true 支持创建多级目录
}

// 配置 multer 存储引擎
const storage = multer.diskStorage({
  // 存储路径
  destination: (req, file, cb) => {
    cb(null, uploadDir); // 保存到 uploads 目录
  },
  // 文件名（避免重复，使用时间戳+原文件名）
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // 获取文件扩展名（如 .png）
    cb(null, file.fieldname + '-' + uniqueSuffix + ext); // 最终文件名：fieldname-时间戳-随机数.扩展名
  }
});

// --------------------------
// 文件过滤（验证类型和大小）
// --------------------------
const fileFilter = (req, file, cb) => {
  // 允许上传所有文件类型
  cb(null, true);
};

// --------------------------
// 配置上传限制
// --------------------------
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 单个文件最大 1GB（1024*1024*1024 字节）
  },
  fileFilter: fileFilter
});

// --------------------------
// 上传接口
// --------------------------

/**
 * 单文件上传
 * POST /api/upload/single
 * FormData 字段名：file（需与 upload.single('file') 中的名称一致）
 */
router.post('/upload/single', upload.single('file'), (req, res) => {
  try {
    // 上传成功后，文件信息在 req.file 中
    if (!req.file) {
      return res.status(400).json({ error: '未选择文件' });
    }

    // 返回文件信息（可根据需求调整返回字段）
    res.json({
      success: true,
      message: '文件上传成功',
      fileInfo: {
        filename: req.file.filename, // 保存的文件名
        originalname: req.file.originalname, // 原始文件名
        mimetype: req.file.mimetype, // 文件类型
        size: req.file.size, // 文件大小（字节）
        path: req.file.path, // 文件保存路径（相对服务器）
        url: `/uploads/${req.file.filename}` // 前端访问 URL（需配合静态文件托管）
      }
    });
  } catch (err) {
    console.error('单文件上传失败:', err);
    res.status(500).json({ error: err.message || '文件上传失败' });
  }
});

/**
 * 多文件上传（限制数量）
 * POST /api/upload/multiple
 * FormData 字段名：files（需与 upload.array('files', 5) 中的名称一致，最多传5个）
 */
router.post('/upload/multiple', upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '未选择文件' });
    }

    // 处理多个文件信息
    const fileList = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`
    }));

    res.json({
      success: true,
      message: `成功上传 ${req.files.length} 个文件`,
      fileList: fileList
    });
  } catch (err) {
    console.error('多文件上传失败:', err);
    res.status(500).json({ error: err.message || '文件上传失败' });
  }
});

// --------------------------
// 静态文件托管（让前端能访问上传的文件）
// --------------------------
// 在主应用中添加（如 app.js）：
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * 删除文件接口
 * DELETE /api/upload/delete/:filename
 */
router.delete('/upload/delete/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文件不存在' });
    }

    // 删除文件
    fs.unlinkSync(filePath);

    res.json({ success: true, message: '文件删除成功' });
  } catch (err) {
    console.error('文件删除失败:', err);
    res.status(500).json({ error: err.message || '文件删除失败' });
  }
});

module.exports = router;