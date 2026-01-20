// MongoDB 连接模块
const mongoose = require('mongoose');
const config = require('./index');

async function connect() {
  const uri = process.env.MONGO_URI || config.mongoUri;
  if (!uri) {
    throw new Error('MongoDB URI 未配置，请在 config/index.js 中设置 mongoUri 或通过环境变量 MONGO_URI 传入。');
  }

  try {
    // mongoose 7+ 已不再需要 useNewUrlParser/useUnifiedTopology，但保留也不会报错
    await mongoose.connect(uri, {
      // 这些选项在新版本中默认启用，但显式声明以兼容老环境
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB 已连接');
  } catch (err) {
    console.error('无法连接到 MongoDB:', err);
    throw err;
  }
}

module.exports = {
  connect,
  mongoose
};
