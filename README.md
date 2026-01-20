# API 接口文档

## 1. 项目概述

本项目是一个基于 Express.js 和 MongoDB 的后端服务，提供了用户认证、内容管理、文件上传、文章管理和评论系统等功能的 RESTful API。

### 技术栈
- 后端框架：Express.js
- 数据库：MongoDB
- 认证方式：密码哈希 + JWT（部分接口）
- 文件上传：Multer
- 文档生成：Swagger

### 基础 URL
```
http://localhost:4411/api
```

## 2. 图片相关接口

### 2.1 获取已上传图片列表

**接口地址**：`GET /images`

**功能描述**：获取所有已上传的图片文件列表

**请求参数**：无

**响应示例**：
```json
{
  "success": true,
  "data": [
    {
      "name": "file-1763365042935-123999791.png",
      "url": "/uploads/file-1763365042935-123999791.png",
      "size": 102400,
      "modified": "2026-01-20T10:00:00.000Z",
      "mimetype": "image/png"
    },
    {
      "name": "file-1763365042939-641656165.png",
      "url": "/uploads/file-1763365042939-641656165.png",
      "size": 204800,
      "modified": "2026-01-20T10:01:00.000Z",
      "mimetype": "image/png"
    }
  ]
}
```

## 3. 内容管理接口

### 3.1 获取项目列表

**接口地址**：`GET /db/items`

**功能描述**：获取数据库中所有项目数据

**请求参数**：无

**响应示例**：
```json
[
  {
    "_id": "60d5ec49f1e7a13b8c1f4d5e",
    "name": "项目1",
    "description": "这是第一个项目"
  },
  {
    "_id": "60d5ec49f1e7a13b8c1f4d5f",
    "name": "项目2",
    "description": "这是第二个项目"
  }
]
```

### 3.2 添加项目

**接口地址**：`POST /db/items`

**功能描述**：向数据库添加新项目

**请求参数**：
- 请求体（JSON）：项目的详细信息

**请求示例**：
```json
{
  "name": "新项目",
  "description": "这是一个新项目的描述",
  "status": "active"
}
```

**响应示例**：
```json
{
  "text": "添加成功"
}
```

### 3.3 删除项目

**接口地址**：`DELETE /db/items/:id`

**功能描述**：根据ID删除指定项目

**请求参数**：
- `id`：项目ID（路径参数）

**响应示例**：
```json
{
  "text": "删除成功"
}
```

### 3.4 修改项目

**接口地址**：`PUT /db/items/:id`

**功能描述**：根据ID修改指定项目

**请求参数**：
- `id`：项目ID（路径参数）
- 请求体（JSON）：需要更新的项目信息

**请求示例**：
```json
{
  "name": "更新后的项目名",
  "description": "更新后的项目描述"
}
```

**响应示例**：
```json
{
  "text": "修改成功"
}
```

## 4. 用户认证接口

### 4.1 用户注册

**接口地址**：`POST /db/users/register`

**功能描述**：用户注册新账号

**请求参数**：
- 请求体（JSON）：
  - `email`：邮箱地址（必须，唯一）
  - `password`：密码（必须，至少8位，包含大写字母和数字）
  - `username`：用户名（可选）

**请求示例**：
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "username": "用户名"
}
```

**响应示例**：
```json
{
  "success": true,
  "message": "注册成功",
  "insertedId": "60d5ec49f1e7a13b8c1f4d60",
  "display": true
}
```

### 4.2 用户登录

**接口地址**：`POST /db/users/login`

**功能描述**：用户登录获取认证信息

**请求参数**：
- 请求体（JSON）：
  - `email`：邮箱地址
  - `password`：密码

**请求示例**：
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**响应示例**：
```json
{
  "success": true,
  "message": "登录成功",
  "user": {
    "username": "用户名",
    "email": "user@example.com",
    "userId": "60d5ec49f1e7a13b8c1f4d60"
  }
}
```

### 4.3 获取所有用户列表

**接口地址**：`GET /db/users/GETall`

**功能描述**：获取所有用户信息（不包含密码相关字段）

**请求参数**：无

**响应示例**：
```json
{
  "users": [
    {
      "_id": "60d5ec49f1e7a13b8c1f4d60",
      "username": "用户名",
      "email": "user@example.com",
      "createdAt": "2026-01-20T10:00:00.000Z"
    }
  ]
}
```

## 5. 文件上传接口

### 5.1 单文件上传

**接口地址**：`POST /upload/single`

**功能描述**：上传单个文件

**请求参数**：
- `file`：文件（FormData 字段名，必须与接口一致）

**响应示例**：
```json
{
  "success": true,
  "message": "文件上传成功",
  "fileInfo": {
    "filename": "file-1763365042935-123999791.png",
    "originalname": "example.png",
    "mimetype": "image/png",
    "size": 102400,
    "path": "uploads/file-1763365042935-123999791.png",
    "url": "/uploads/file-1763365042935-123999791.png"
  }
}
```

### 5.2 多文件上传

**接口地址**：`POST /upload/multiple`

**功能描述**：上传多个文件（最多5个）

**请求参数**：
- `files`：文件数组（FormData 字段名，必须与接口一致）

**响应示例**：
```json
{
  "success": true,
  "message": "成功上传 2 个文件",
  "fileList": [
    {
      "filename": "files-1763365042935-123999791.png",
      "originalname": "example1.png",
      "mimetype": "image/png",
      "size": 102400,
      "url": "/uploads/files-1763365042935-123999791.png"
    },
    {
      "filename": "files-1763365042939-641656165.png",
      "originalname": "example2.png",
      "mimetype": "image/png",
      "size": 204800,
      "url": "/uploads/files-1763365042939-641656165.png"
    }
  ]
}
```

### 5.3 删除文件

**接口地址**：`DELETE /upload/delete/:filename`

**功能描述**：根据文件名删除指定文件

**请求参数**：
- `filename`：文件名（路径参数）

**响应示例**：
```json
{
  "success": true,
  "message": "文件删除成功"
}
```

## 6. 文章相关接口

### 6.1 获取文章列表

**接口地址**：`GET /articles`

**功能描述**：获取所有文章列表，按创建时间倒序排列

**请求参数**：无

**响应示例**：
```json
[
  {
    "_id": "60d5ec49f1e7a13b8c1f4d61",
    "title": "测试文章",
    "content": "这是一篇测试文章的内容",
    "author": "测试作者",
    "category": "技术",
    "tags": ["前端", "Vue"],
    "createdAt": "2026-01-20T10:30:00.000Z",
    "updatedAt": "2026-01-20T10:30:00.000Z"
  }
]
```

### 6.2 获取单个文章

**接口地址**：`GET /articles/:id`

**功能描述**：根据ID获取单个文章详情

**请求参数**：
- `id`：文章ID（路径参数）

**响应示例**：
```json
{
  "_id": "60d5ec49f1e7a13b8c1f4d61",
  "title": "测试文章",
  "content": "这是一篇测试文章的内容",
  "author": "测试作者",
  "category": "技术",
  "tags": ["前端", "Vue"],
  "createdAt": "2026-01-20T10:30:00.000Z",
  "updatedAt": "2026-01-20T10:30:00.000Z"
}
```

### 6.3 创建文章

**接口地址**：`POST /articles`

**功能描述**：创建新文章

**请求参数**：
- 请求体（JSON）：文章信息

**请求示例**：
```json
{
  "title": "新文章标题",
  "content": "这是新文章的内容",
  "author": "作者名",
  "category": "技术",
  "tags": ["前端", "JavaScript"],
  "authorId": "60d5ec49f1e7a13b8c1f4d60",
  "authorEmail": "author@example.com"
}
```

**响应示例**：
```json
{
  "text": "文章创建成功",
  "articleId": "60d5ec49f1e7a13b8c1f4d62"
}
```

### 6.4 更新文章

**接口地址**：`PUT /articles/:id`

**功能描述**：根据ID更新指定文章

**请求参数**：
- `id`：文章ID（路径参数）
- 请求体（JSON）：需要更新的文章信息

**请求示例**：
```json
{
  "title": "更新后的文章标题",
  "content": "更新后的文章内容",
  "tags": ["前端", "Vue", "更新"]
}
```

**响应示例**：
```json
{
  "text": "文章更新成功"
}
```

### 6.5 删除文章

**接口地址**：`DELETE /articles/:id`

**功能描述**：根据ID删除指定文章

**请求参数**：
- `id`：文章ID（路径参数）

**响应示例**：
```json
{
  "text": "文章删除成功"
}
```

## 7. 评论相关接口

### 7.1 获取评论列表

**接口地址**：`GET /comments`

**功能描述**：获取评论列表，支持按文章ID过滤

**请求参数**：
- `articleId`：文章ID（查询参数，可选）

**响应示例**：
```json
[
  {
    "_id": "60d5ec49f1e7a13b8c1f4d63",
    "content": "这是一条测试评论",
    "articleId": "60d5ec49f1e7a13b8c1f4d61",
    "authorId": "60d5ec49f1e7a13b8c1f4d60",
    "authorName": "测试用户",
    "authorEmail": "user@example.com",
    "createdAt": "2026-01-20T10:45:00.000Z",
    "updatedAt": "2026-01-20T10:45:00.000Z"
  }
]
```

### 7.2 获取单个评论

**接口地址**：`GET /comments/:id`

**功能描述**：根据ID获取单个评论

**请求参数**：
- `id`：评论ID（路径参数）

**响应示例**：
```json
{
  "_id": "60d5ec49f1e7a13b8c1f4d63",
  "content": "这是一条测试评论",
  "articleId": "60d5ec49f1e7a13b8c1f4d61",
  "authorId": "60d5ec49f1e7a13b8c1f4d60",
  "authorName": "测试用户",
  "authorEmail": "user@example.com",
  "createdAt": "2026-01-20T10:45:00.000Z",
  "updatedAt": "2026-01-20T10:45:00.000Z"
}
```

### 7.3 创建评论

**接口地址**：`POST /comments`

**功能描述**：创建新评论

**请求参数**：
- 请求体（JSON）：评论信息

**请求示例**：
```json
{
  "content": "这是一条新评论",
  "articleId": "60d5ec49f1e7a13b8c1f4d61",
  "authorId": "60d5ec49f1e7a13b8c1f4d60",
  "authorName": "测试用户",
  "authorEmail": "user@example.com"
}
```

**响应示例**：
```json
{
  "text": "评论创建成功",
  "commentId": "60d5ec49f1e7a13b8c1f4d64"
}
```

### 7.4 更新评论

**接口地址**：`PUT /comments/:id`

**功能描述**：根据ID更新指定评论

**请求参数**：
- `id`：评论ID（路径参数）
- 请求体（JSON）：需要更新的评论信息

**请求示例**：
```json
{
  "content": "更新后的评论内容"
}
```

**响应示例**：
```json
{
  "text": "评论更新成功"
}
```

### 7.5 删除评论

**接口地址**：`DELETE /comments/:id`

**功能描述**：根据ID删除指定评论

**请求参数**：
- `id`：评论ID（路径参数）

**响应示例**：
```json
{
  "text": "评论删除成功"
}
```

## 8. 表单数据接口

### 8.1 提交表单数据

**接口地址**：`POST /db/onfrom`

**功能描述**：提交表单数据到数据库

**请求参数**：
- 请求体（JSON）：表单数据

**请求示例**：
```json
{
  "name": "测试用户",
  "email": "test@example.com",
  "message": "这是一条测试消息"
}
```

**响应示例**：
```json
{
  "text": "添加成功"
}
```

### 8.2 获取所有表单数据

**接口地址**：`GET /db/onfrom`

**功能描述**：获取所有提交的表单数据

**请求参数**：无

**响应示例**：
```json
[
  {
    "_id": "60d5ec49f1e7a13b8c1f4d65",
    "name": "测试用户",
    "email": "test@example.com",
    "message": "这是一条测试消息",
    "_id": {
      "$oid": "60d5ec49f1e7a13b8c1f4d65"
    }
  }
]
```

## 9. 错误处理

### 常见错误码
- `400`：请求参数错误
- `401`：未认证或认证失败
- `403`：权限不足
- `404`：资源不存在
- `409`：资源冲突（如邮箱已注册）
- `500`：服务器内部错误

### 错误响应格式
```json
{
  "error": "错误描述信息"
}
```

## 10. Swagger 文档

项目已集成 Swagger UI，可通过以下地址访问交互式 API 文档：

```
http://localhost:4411/api-docs
```

## 11. 注意事项

1. 所有请求和响应的 Content-Type 为 `application/json`（文件上传除外）
2. 用户认证使用密码哈希存储，确保安全性
3. 文件上传接口支持的最大文件大小为 1GB
4. 多文件上传最多支持 5 个文件
5. 部分接口需要认证，请在请求头中携带认证信息
