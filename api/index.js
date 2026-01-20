// API路由主入口文件
const express = require('express');
const router = express.Router();

// 导入各个API路由模块
const imageRoutes = require('./images');
const dbcz = require('./dbcz_new');
const dbdl = require('./dbdeng');
const multer = require('./Multer_api');
const articleRoutes = require('./articles');
const commentRoutes = require('./comments');
const onfromRoutes = require('./onfrom');

// 注册API路由
router.use('/', imageRoutes);
router.use('/', dbcz);
router.use('/', dbdl);
router.use('/', multer);
router.use('/', articleRoutes);
router.use('/', commentRoutes);
router.use('/', onfromRoutes);


module.exports = router;