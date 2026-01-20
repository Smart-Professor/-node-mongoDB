// Express应用主文件 - app.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const app = express();



// 引入配置
const config = require('./config/index');

// 引入中间件
const loggerMiddleware = require('./middleware/logger');
const errorHandlerMiddleware = require('./middleware/errorHandler');
const corsMiddleware = require('./middleware/corsMiddleware');

// 使用中间件
app.use(loggerMiddleware);
app.use(corsMiddleware);

// 配置中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置静态文件服务

app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(config.staticDirs.public, express.static(path.join(__dirname, 'public')));


// 确保uploads目录存在
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}


// 引入并注册API路由
const apiRoutes = require('./api');
app.use('/api', apiRoutes);

// 配置Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 移除文件上传路由
// const uploadRoutes = require('./api/uploads');
// app.use('/', uploadRoutes);

// gallery.html页面路由
app.get('/gallery.html', function (req, res) {
    res.sendFile(path.join(__dirname, 'gallery.html'));
});
// 图片库路径重定向
app.get('/gallery', function (req, res) {
    res.redirect('/gallery.html');
});


// 404错误处理
app.use(function(req, res, next) {
    res.status(404).send('页面不存在');
});

// 全局错误处理中间件（放在最后）
app.use(errorHandlerMiddleware);

module.exports = app;