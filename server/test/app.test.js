const request = require('supertest');
const assert = require('node:assert');
const app = require('../index');
const { test, describe } = require('node:test');

describe('HN Clone API', () => {
  test('GET /api/stories should return a list of stories', async () => {
    const response = await request(app).get('/api/stories');
    assert.strictEqual(response.status, 200);
    assert.ok(Array.isArray(response.body));
    assert.ok(response.body.length > 0);
  });

  test('POST /api/stories should create a new story', async () => {
    const newStory = {
      title: 'Test Story',
      url: 'https://test.com'
    };

    const response = await request(app)
      .post('/api/stories')
      .send(newStory);

    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.body.title, newStory.title);
    assert.strictEqual(response.body.url, newStory.url);
    assert.ok(response.body.id);
  });

  test('POST /api/stories/:id/vote should increment score', async () => {
    // Get first story
    const storiesRes = await request(app).get('/api/stories');
    const story = storiesRes.body[0];
    const initialScore = story.score;

    const response = await request(app).post(`/api/stories/${story.id}/vote`);

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.score, initialScore + 1);
  });
});
