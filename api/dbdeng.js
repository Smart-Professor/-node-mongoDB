const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { mongoose } = require('../config/db');
const authenticateJWT = require('../middleware/authMiddleware');
const { ObjectId } = require('mongodb');

// JWT 密钥（生产环境必须用环境变量配置）
const JWT_SECRET = process.env.JWT_SECRET || 'rt8@4kLp$7xQ!2sW9dZ';

// 验证邮箱格式的正则
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 获取 users 集合
function getColl() {
  const conn = mongoose.connection;
  if (!conn || !conn.db) throw new Error('数据库尚未连接');
  return conn.db.collection('users');
}

// 密码哈希处理（生成盐和哈希值）
function hashPassword(password, salt) {
  if (typeof password !== 'string' || password.trim() === '') {
    throw new Error('密码必须为非空字符串');
  }
  if (!salt) {
    // 生成随机盐（16字节 -> 32位十六进制字符串）
    salt = crypto.randomBytes(16).toString('hex');
  }
  // 使用 scrypt 算法哈希密码（安全且高效）
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

/**
 * 注册接口（邮箱版）
 * POST /db/users/register
 * body: { email, password }
 */
router.post('/db/users/register', async (req, res) => {
  try {
    const { email, password,username } = req.body || {};

    // 1. 基础参数校验
    if (!email || !password) {
      return res.status(400).json({ error: 'email 和 password 必须提供' });
    }

    // 2. 邮箱格式校验
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: '请输入有效的邮箱地址' });
    }

    // 3. 密码复杂度校验（至少8位，包含大小写字母和数字）
    if (password.length < 8) {
      return res.status(400).json({ error: '密码长度至少8位' });
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: '密码需包含大写字母和数字' });
    }

    // 4. 检查邮箱是否已注册
    const coll = getColl();
    const existingUser = await coll.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: '该邮箱已被注册' });
    }

    // 5. 生成盐和密码哈希
    const { salt, hash } = hashPassword(password);

    // 6. 存入数据库
    const userData = {
      username,
      email, // 用邮箱作为唯一标识
      passwordHash: hash, // 存储哈希后的密码
      salt, // 存储盐（用于登录时验证）
      createdAt: new Date() // 注册时间
    };
    const result = await coll.insertOne(userData);

    // 7. 返回成功响应
    res.status(201).json({
      success: true,
      message: '注册成功',
      insertedId: result.insertedId,
      display: true,
    });

  } catch (err) {
    console.error('注册失败:', err);
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

/**
 * 登录接口（邮箱版）
 * POST /db/users/login
 * body: { email, password }
 */
router.post('/db/users/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // 1. 基础参数校验
    if (!email || !password) {
      return res.status(400).json({ error: 'email 和 password 必须提供' });
    }

    // 2. 邮箱格式校验
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: '请输入有效的邮箱地址' });
    }

    // 3. 查询用户是否存在
    const coll = getColl();
    const user = await coll.findOne({ email });
    if (!user) {
      // 不明确提示“邮箱不存在”，防止暴力破解
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 4. 验证密码（用注册时的盐重新哈希，比较哈希值）
    const { hash } = hashPassword(password, user.salt);
    const inputHashBuf = Buffer.from(hash, 'hex');
    const storedHashBuf = Buffer.from(user.passwordHash, 'hex');

    // 安全比较哈希值（防止时序攻击）
    if (inputHashBuf.length !== storedHashBuf.length || 
        !crypto.timingSafeEqual(inputHashBuf, storedHashBuf)) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 6. 返回令牌
    res.json({
      success: true,
      message: '登录成功',
      user:{
        username: user.username,
        email: user.email,
        userId: user._id.toString(),
      }
    });

  } catch (err) {
    console.error('登录失败:', err);
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});


//查看全部用户
router.get('/db/users/GETall', async (req, res) => {
    try{
            const coll = getColl();
            const users = await coll.find({}, { projection: { passwordHash: 0, salt: 0 } }).toArray();
            res.json({ users });
            
    } catch(err) {
        console.error('获取用户列表失败:', err);
        res.status(500).json({ error: '获取用户列表失败' });
    }
    
});


module.exports = router;