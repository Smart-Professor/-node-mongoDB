/**
 * 简化的认证中间件 - 不再需要JWT验证
 * 直接通过所有请求
 */
const authenticateJWT = (req, res, next) => {
  // 直接通过所有请求，不再进行JWT验证
  next();
};

module.exports = authenticateJWT;