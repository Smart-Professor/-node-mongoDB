const request = require('supertest');
const app = require('../app');

// 测试文章API
describe('Articles API', () => {
  let token = '';
  let testArticleId = '';
  
  // 在所有测试前获取token
  beforeAll(async () => {
    // 首先注册一个测试用户
    await request(app)
      .post('/api/db/users/register')
      .send({
        email: 'test@example.com',
        password: 'Test1234',
        username: 'testuser'
      });
    
    // 然后登录获取token
    const loginResponse = await request(app)
      .post('/api/db/users/login')
      .send({
        email: 'test@example.com',
        password: 'Test1234'
      });
    
    token = loginResponse.body.token;
  });
  
  // 测试获取文章列表
  test('GET /api/articles should return all articles', async () => {
    const response = await request(app)
      .get('/api/articles');
    
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
  
  // 测试创建文章
  test('POST /api/articles should create a new article', async () => {
    const response = await request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Article',
        content: 'This is a test article',
        author: 'testuser',
        category: 'test',
        tags: ['test', 'api']
      });
    
    expect(response.statusCode).toBe(201);
    expect(response.body.text).toBe('文章创建成功');
    expect(response.body.articleId).toBeDefined();
    
    testArticleId = response.body.articleId;
  });
  
  // 测试获取单个文章
  test('GET /api/articles/:id should return a single article', async () => {
    const response = await request(app)
      .get(`/api/articles/${testArticleId}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(testArticleId);
    expect(response.body.title).toBe('Test Article');
  });
  
  // 测试更新文章
  test('PUT /api/articles/:id should update an article', async () => {
    const response = await request(app)
      .put(`/api/articles/${testArticleId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Test Article',
        content: 'This is an updated test article'
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body.text).toBe('文章更新成功');
    
    // 验证更新是否成功
    const updatedArticle = await request(app)
      .get(`/api/articles/${testArticleId}`);
    
    expect(updatedArticle.body.title).toBe('Updated Test Article');
    expect(updatedArticle.body.content).toBe('This is an updated test article');
  });
  
  // 测试删除文章
  test('DELETE /api/articles/:id should delete an article', async () => {
    const response = await request(app)
      .delete(`/api/articles/${testArticleId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.text).toBe('文章删除成功');
    
    // 验证删除是否成功
    const deletedArticle = await request(app)
      .get(`/api/articles/${testArticleId}`);
    
    expect(deletedArticle.statusCode).toBe(404);
  });
});