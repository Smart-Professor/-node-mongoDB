// 错误处理中间件

/**
 * 全局错误处理中间件
 */



function errorHandlerMiddleware(err, req, res, next) {
    // 默认错误信息
    const statusCode = err.statusCode || 500;
    const message = err.message || '服务器内部错误';
    
    // 记录错误日志
    console.error(`[错误] ${new Date().toISOString()} - ${err.stack || err}`);
    
    // 返回错误响应
    res.status(statusCode).json({
        success: false,
        error: message,
        // 在开发环境下可以返回更详细的错误信息
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
}

module.exports = errorHandlerMiddleware;