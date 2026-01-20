// 页面路由模块
const express = require('express');
const router = express.Router();

// 主页路由
router.get('/', function (req, res) {
    res.sendFile(__dirname + "/../index.html");
});

// index.html页面路由
router.get('/index.html', function (req, res) {
    res.sendFile(__dirname + "/../index.html");
});

// gallery.html页面路由
router.get('/gallery.html', function (req, res) {
    res.sendFile(__dirname + "/../gallery.html");
});

// 图片库路径重定向
router.get('/gallery', function (req, res) {
    res.redirect('/gallery.html');
});

// 表单处理路由
router.get('/process_get', function (req, res) {
    // 输出 JSON 格式
    var response = {
        "first_name": req.query.first_name,
        "last_name": req.query.last_name
    };
    console.log(response);
    res.end(JSON.stringify(response));
});

module.exports = router;