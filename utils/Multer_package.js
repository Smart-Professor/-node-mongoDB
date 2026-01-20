const express = require('express');
const router = express.Router();
const multer = require('multer');
const mime = require('mime-types');
const path = require('path');
const fs = require('fs');
// --------------------------
// 配置存储路径和文件名
// --------------------------
const uploadDir = path.join(__dirname, '../uploads'); // 上传文件保存的目录（需手动创建或自动生成）

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
  // 允许的文件类型（图片、文档等，可根据需求修改）
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', // 图片
    'application/pdf', 'application/msword', // 文档
    'video/mp4' // 视频（可选）
  ];

// 验证 MIME 类型
  const mimeType = mime.lookup(file.originalname) || file.mimetype;
  if (allowedMimeTypes.includes(mimeType)) {
    cb(null, true); // 允许上传
  } else {
    cb(new Error('不支持的文件类型！允许的类型：jpg、png、gif、pdf、doc、mp4'), false); // 拒绝上传
  }
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





module.exports = router;