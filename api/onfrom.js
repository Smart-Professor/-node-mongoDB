const express = require('express');
const router = express.Router()
const { ObjectId } = require('mongodb');
// 使用已存在的 mongoose 连接（由 config/db.js 在 server 启动时建立）
const { mongoose } = require('../config/db');
function getColl() {
  const conn = mongoose.connection;
  if (!conn || !conn.db) throw new Error('数据库尚未连接');
  return conn.db.collection('onfrom');
}

router.post('/db/onfrom', async (req, res) => {
  try {
    const data = req.body || {};
    const coll = getColl();
    const r = await coll.insertOne(data);
    res.status(201).json({text:'添加成功'});
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ text: '创建失败' });
  }
})

router.get('/db/onfrom', async (req, res) => {
  try{
    const coll = getColl();
    const docs = await coll.find({}).toArray();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ text: '获取列表失败' });
  }
})

module.exports = router;