const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
// 使用已存在的 mongoose 连接（由 config/db.js 在 server 启动时建立）
const { mongoose } = require('../config/db');

function getColl() {
  const conn = mongoose.connection;
  if (!conn || !conn.db) throw new Error('数据库尚未连接');
  return conn.db.collection('items');
}

//内容型api集

// 查找
router.get('/db/items', async (req, res) => {
  try{

    const coll = getColl();
    const docs = await coll.find({}).toArray();

    res.json(docs);


  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取列表失败' });
  }
});


// 添加
router.post('/db/items', async (req, res) => {
  try {
    const data = req.body || {};
    const coll = getColl();
    const r = await coll.insertOne(data);

    res.status(201).json({text:'添加成功'});

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '创建失败' });
  }
});

//删除
router.delete('/db/items/:id', async (req, res) => {
  try {
    // 获取 URL 中的 id 参数
    const id = req.params.id;

     // 验证 ID 是否为有效的 ObjectId 格式
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: '无效的 ID 格式' });
    }
    
    // 获取集合
    const coll = getColl();
    
    // 执行删除操作（注意将字符串 id 转为 ObjectId 类型）
    const result = await coll.deleteOne({ _id: new ObjectId(id) });

    // 判断是否删除成功（deletedCount 为 1 表示删除了一条文档）
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: '未找到该文档' });
    }

    // 删除成功的响应（与添加接口保持一致的成功提示格式）
    res.json({ text: '删除成功' });

  } catch (err) {
    console.error(err);
    // 数据库连接失败或其他异常的响应
    res.status(500).json({ error: '删除失败！' });
  }
});

//修改
router.put('/db/items/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body || {};
    const coll = getColl();
    const r = await coll.updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );
    res.json({ text: '修改成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '修改失败' });
  }

});
module.exports = router;
