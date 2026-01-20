/**
 * @swagger
 * components:
 *   schemas:
 *     Article:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         _id: 
 *           type: string
 *           description: 文章ID
 *         title: 
 *           type: string
 *           description: 文章标题
 *         content: 
 *           type: string
 *           description: 文章内容
 *         author: 
 *           type: string
 *           description: 文章作者
 *         authorId: 
 *           type: string
 *           description: 作者ID
 *         authorEmail: 
 *           type: string
 *           description: 作者邮箱
 *         category: 
 *           type: string
 *           description: 文章分类
 *         tags: 
 *           type: array
 *           items: 
 *             type: string
 *           description: 文章标签
 *         createdAt: 
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt: 
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *       example:
 *         title: "测试文章"
 *         content: "这是一篇测试文章"
 *         author: "测试作者"
 *         category: "技术"
 *         tags: ["前端", "Vue"]
 */

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { mongoose } = require('../config/db');

function getArticleColl() {
  const conn = mongoose.connection;
  if (!conn || !conn.db) throw new Error('数据库尚未连接');
  return conn.db.collection('articles');
}

// 文章API集

/**
 * @swagger
 * /articles: 
 *   get:
 *     summary: 获取文章列表
 *     tags: [Articles]
 *     responses:
 *       200: 
 *         description: 成功获取文章列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: 
 *                 $ref: '#/components/schemas/Article'
 *       500: 
 *         description: 服务器错误
 */
router.get('/articles', async (req, res) => {
  try {
    const coll = getArticleColl();
    const docs = await coll.find({}).sort({ createdAt: -1 }).toArray();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取文章列表失败' });
  }
});

/**
 * @swagger
 * /articles/{id}: 
 *   get:
 *     summary: 获取单个文章
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 文章ID
 *         schema:
 *           type: string
 *     responses:
 *       200: 
 *         description: 成功获取文章
 *         content:
 *           application/json:
 *             schema: 
 *               $ref: '#/components/schemas/Article'
 *       400: 
 *         description: 无效的文章ID格式
 *       404: 
 *         description: 文章不存在
 *       500: 
 *         description: 服务器错误
 */
router.get('/articles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: '无效的文章ID格式' });
    }
    const coll = getArticleColl();
    const doc = await coll.findOne({ _id: new ObjectId(id) });
    if (!doc) {
      return res.status(404).json({ error: '文章不存在' });
    }
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取文章失败' });
  }
});

/**
 * @swagger
 * /articles: 
 *   post:
 *     summary: 创建文章
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Article'
 *     responses:
 *       201: 
 *         description: 文章创建成功
 *       401: 
 *         description: 未认证或认证失败
 *       500: 
 *         description: 服务器错误
 */
router.post('/articles', async (req, res) => {
  try {
    const article = req.body || {};
    // 添加创建时间
    article.createdAt = new Date();
    article.updatedAt = new Date();
    const coll = getArticleColl();
    const result = await coll.insertOne(article);
    
    res.status(201).json({ text: '文章创建成功', articleId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '创建文章失败' });
  }
});

/**
 * @swagger
 * /articles/{id}: 
 *   put:
 *     summary: 更新文章
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 文章ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Article'
 *     responses:
 *       200: 
 *         description: 文章更新成功
 *       400: 
 *         description: 无效的文章ID格式
 *       401: 
 *         description: 未认证或认证失败
 *       403: 
 *         description: 没有权限更新此文章
 *       404: 
 *         description: 文章不存在
 *       500: 
 *         description: 服务器错误
 */
router.put('/articles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: '无效的文章ID格式' });
    }
    const updateData = req.body || {};
    // 更新时间
    updateData.updatedAt = new Date();
    const coll = getArticleColl();
    
    // 先检查文章是否存在
    const article = await coll.findOne({ _id: new ObjectId(id) });
    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }
    
    const result = await coll.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.json({ text: '文章更新成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '更新文章失败' });
  }
});

/**
 * @swagger
 * /articles/{id}: 
 *   delete:
 *     summary: 删除文章
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 文章ID
 *         schema:
 *           type: string
 *     responses:
 *       200: 
 *         description: 文章删除成功
 *       400: 
 *         description: 无效的文章ID格式
 *       401: 
 *         description: 未认证或认证失败
 *       403: 
 *         description: 没有权限删除此文章
 *       404: 
 *         description: 文章不存在
 *       500: 
 *         description: 服务器错误
 */
router.delete('/articles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: '无效的文章ID格式' });
    }
    const coll = getArticleColl();
    
    // 先检查文章是否存在
    const article = await coll.findOne({ _id: new ObjectId(id) });
    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }
    
    const result = await coll.deleteOne({ _id: new ObjectId(id) });
    res.json({ text: '文章删除成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '删除文章失败' });
  }
});

module.exports = router;