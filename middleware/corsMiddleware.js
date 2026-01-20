// CORS中间件

/**
 * 跨域请求处理中间件
 */
function corsMiddleware(req, res, next) {
    // 设置允许的源
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // 设置允许的HTTP方法
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    // 设置允许的请求头
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    // 设置预检请求的缓存时间
    res.setHeader('Access-Control-Max-Age', '86400');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
}

module.exports = corsMiddleware;