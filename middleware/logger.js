// 日志中间件
const fs = require('fs');
const path = require('path');

// 确保日志目录存在
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// 日志级别
const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

// 当前日志级别（可以从配置文件或环境变量读取）
const CURRENT_LOG_LEVEL = LOG_LEVELS.DEBUG;

/**
 * 写入日志到文件
 * @param {string} level - 日志级别
 * @param {string} message - 日志消息
 */
function writeLogToFile(level, message) {
    const logFileName = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
    const logEntry = `[${new Date().toISOString()}] [${level}] ${message}\n`;
    
    fs.appendFile(logFileName, logEntry, (err) => {
        if (err) {
            console.error('写入日志文件失败:', err);
        }
    });
}

/**
 * 日志记录函数
 * @param {string} level - 日志级别
 * @param {string} message - 日志消息
 * @param {object} metadata - 附加元数据
 */
function log(level, message, metadata = {}) {
    const levelNumber = LOG_LEVELS[level];
    if (levelNumber < CURRENT_LOG_LEVEL) {
        return; // 跳过低于当前日志级别的日志
    }
    
    // 构建完整日志消息
    let fullMessage = message;
    if (Object.keys(metadata).length > 0) {
        fullMessage += ` - ${JSON.stringify(metadata)}`;
    }
    
    // 控制台输出
    switch (level) {
        case 'ERROR':
            console.error(fullMessage);
            break;
        case 'WARN':
            console.warn(fullMessage);
            break;
        case 'INFO':
            console.log(fullMessage);
            break;
        case 'DEBUG':
            console.debug(fullMessage);
            break;
    }
    
    // 文件输出
    writeLogToFile(level, fullMessage);
}

/**
 * HTTP请求日志中间件
 */
function loggerMiddleware(req, res, next) {
    const startTime = Date.now();
    const originalSend = res.send;
    
    // 记录请求信息
    const method = req.method;
    const url = req.url;
    const ip = req.ip;
    const headers = req.headers;
    
    // 对于POST、PUT、PATCH请求，记录请求体
    let requestBody = '';
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
        // 保存原始的req.on('data')和req.on('end')事件处理
        const originalDataHandler = req._events.data;
        const originalEndHandler = req._events.end;
        
        // 收集请求体数据
        req.on('data', (chunk) => {
            requestBody += chunk.toString();
            if (originalDataHandler) {
                originalDataHandler(chunk);
            }
        });
        
        req.on('end', () => {
            // 记录请求体（限制大小，避免日志过大）
            if (requestBody.length > 1024) {
                requestBody = requestBody.substring(0, 1024) + '... [TRUNCATED]';
            }
            
            if (originalEndHandler) {
                originalEndHandler();
            }
        });
    }
    
    // 拦截res.send方法以获取响应内容
    res.send = function(body) {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode;
        
        // 构建基本日志消息
        const baseMessage = `${method} ${url} ${statusCode} ${responseTime}ms - ${ip}`;
        
        // 准备元数据
        const metadata = {
            headers: headers,
            responseTime: responseTime,
            ip: ip
        };
        
        // 添加请求体到元数据
        if (requestBody) {
            metadata.requestBody = requestBody;
        }
        
        // 添加响应体到元数据（限制大小）
        let responseBody = body;
        if (typeof responseBody === 'object') {
            responseBody = JSON.stringify(responseBody);
        }
        if (responseBody.length > 1024) {
            responseBody = responseBody.substring(0, 1024) + '... [TRUNCATED]';
        }
        metadata.responseBody = responseBody;
        
        // 根据状态码使用不同的日志级别
        if (statusCode >= 500) {
            log('ERROR', baseMessage, metadata);
        } else if (statusCode >= 400) {
            log('WARN', baseMessage, metadata);
        } else if (statusCode >= 300) {
            log('INFO', baseMessage, metadata);
        } else {
            log('DEBUG', baseMessage, metadata);
        }
        
        // 调用原始的send方法
        return originalSend.call(this, body);
    };
    
    next();
}

module.exports = loggerMiddleware;