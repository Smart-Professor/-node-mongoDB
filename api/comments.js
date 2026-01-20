/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - content
 *         - articleId
 *         - authorId
 *       properties:
 *         _id: 
 *           type: string
 *           description: 评论ID
 *         content: 
 *           type: string
 *           description: 评论内容
 *         articleId: 
 *           type: string
 *           description: 文章ID
 *         authorId: 
 *           type: string
 *           description: 作者ID
 *         authorEmail: 
 *           type: string
 *           description: 作者邮箱
 *         authorName: 
 *           type: string
 *           description: 作者名称
 *         createdAt: 
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt: 
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *       example:
 *         content: "这是一条测试评论"
 *         articleId: "60d5ec49f1e7a13b8c1f4d5e"
 *         authorName: "测试用户"
 */

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { mongoose } = require('../config/db');

// 获取 comments 集合
function getCommentColl() {
  const conn = mongoose.connection;
  if (!conn || !conn.db) throw new Error('数据库尚未连接');
  return conn.db.collection('comments');
}

// 获取 articles 集合（用于验证文章是否存在）
function getArticleColl() {
  const conn = mongoose.connection;
  if (!conn || !conn.db) throw new Error('数据库尚未连接');
  return conn.db.collection('articles');
}

/**
 * @swagger
 * /comments: 
 *   get:
 *     summary: 获取评论列表
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: articleId
 *         required: false
 *         description: 文章ID，用于过滤特定文章的评论
 *         schema:
 *           type: string
 *     responses:
 *       200: 
 *         description: 成功获取评论列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: 
 *                 $ref: '#/components/schemas/Comment'
 *       500: 
 *         description: 服务器错误
 */
router.get('/comments', async (req, res) => {
  try {
    const coll = getCommentColl();
    const query = {};
    
    // 如果提供了articleId，则过滤特定文章的评论
    if (req.query.articleId) {
      if (!ObjectId.isValid(req.query.articleId)) {
        return res.status(400).json({ error: '无效的文章ID格式' });
      }
      query.articleId = req.query.articleId;
    }
    
    const docs = await coll.find(query).sort({ createdAt: -1 }).toArray();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取评论列表失败' });
  }
});

/**
 * @swagger
 * /comments/{id}: 
 *   get:
 *     summary: 获取单个评论
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 评论ID
 *         schema:
 *           type: string
 *     responses:
 *       200: 
 *         description: 成功获取评论
 *         content:
 *           application/json:
 *             schema: 
 *               $ref: '#/components/schemas/Comment'
 *       400: 
 *         description: 无效的评论ID格式
 *       404: 
 *         description: 评论不存在
 *       500: 
 *         description: 服务器错误
 */
router.get('/comments/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: '无效的评论ID格式' });
    }
    const coll = getCommentColl();
    const doc = await coll.findOne({ _id: new ObjectId(id) });
    if (!doc) {
      return res.status(404).json({ error: '评论不存在' });
    }
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取评论失败' });
  }
});

/**
 * @swagger
 * /comments: 
 *   post:
 *     summary: 创建评论
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       201: 
 *         description: 评论创建成功
 *       400: 
 *         description: 无效的文章ID格式或文章不存在
 *       401: 
 *         description: 未认证或认证失败
 *       500: 
 *         description: 服务器错误
 */
router.post('/comments', async (req, res) => {
  try {
    const comment = req.body || {};
    
    // 验证文章ID是否有效
    if (!comment.articleId || !ObjectId.isValid(comment.articleId)) {
      return res.status(400).json({ error: '无效的文章ID格式' });
    }
    
    // 验证文章是否存在
    const articleColl = getArticleColl();
    const article = await articleColl.findOne({ _id: new ObjectId(comment.articleId) });
    if (!article) {
      return res.status(400).json({ error: '文章不存在' });
    }
    
    // 添加创建时间
    comment.createdAt = new Date();
    comment.updatedAt = new Date();
    
    const coll = getCommentColl();
    const result = await coll.insertOne(comment);
    res.status(201).json({ text: '评论创建成功', commentId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '创建评论失败' });
  }
});

/**
 * @swagger
 * /comments/{id}: 
 *   put:
 *     summary: 更新评论
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 评论ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       200: 
 *         description: 评论更新成功
 *       400: 
 *         description: 无效的评论ID格式
 *       401: 
 *         description: 未认证或认证失败
 *       403: 
 *         description: 没有权限更新此评论
 *       404: 
 *         description: 评论不存在
 *       500: 
 *         description: 服务器错误
 */
router.put('/comments/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: '无效的评论ID格式' });
    }
    const updateData = req.body || {};
    // 更新时间
    updateData.updatedAt = new Date();
    const coll = getCommentColl();
    
    // 先检查评论是否存在
    const comment = await coll.findOne({ _id: new ObjectId(id) });
    if (!comment) {
      return res.status(404).json({ error: '评论不存在' });
    }
    
    const result = await coll.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.json({ text: '评论更新成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '更新评论失败' });
  }
});

/**
 * @swagger
 * /comments/{id}: 
 *   delete:
 *     summary: 删除评论
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 评论ID
 *         schema:
 *           type: string
 *     responses:
 *       200: 
 *         description: 评论删除成功
 *       400: 
 *         description: 无效的评论ID格式
 *       401: 
 *         description: 未认证或认证失败
 *       403: 
 *         description: 没有权限删除此评论
 *       404: 
 *         description: 评论不存在
 *       500: 
 *         description: 服务器错误
 */
router.delete('/comments/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: '无效的评论ID格式' });
    }
    const coll = getCommentColl();
    
    // 先检查评论是否存在
    const comment = await coll.findOne({ _id: new ObjectId(id) });
    if (!comment) {
      return res.status(404).json({ error: '评论不存在' });
    }
    
    const result = await coll.deleteOne({ _id: new ObjectId(id) });
    res.json({ text: '评论删除成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '删除评论失败' });
  }
});

module.exports = router;