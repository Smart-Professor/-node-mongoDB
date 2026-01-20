const swaggerJsdoc = require('swagger-jsdoc');

// Swagger配置选项
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '文章管理系统API',
      version: '1.0.0',
      description: '一个简单的文章管理系统API文档',
      contact: {
        name: '开发者',
        email: 'developer@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:4413/api',
        description: '开发服务器'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./api/*.js'] // 扫描包含Swagger注释的API文件
};

// 生成Swagger规范
const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;