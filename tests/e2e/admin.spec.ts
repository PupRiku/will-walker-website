import { test, expect } from '@playwright/test';
import { getAuthHeader, ADMIN_USER, ADMIN_PASSWORD } from './helpers/auth';

test.describe('Admin API (read-only checks)', () => {
  test('GET /api/plays returns 200 and an array of 60 plays', async ({ request }) => {
    const response = await request.get('/api/plays');
    expect(response.status()).toBe(200);
    const plays = await response.json();
    expect(Array.isArray(plays)).toBe(true);
    expect(plays).toHaveLength(60);
  });

  test('GET /api/plays/hamlet-a-horatio-story returns 200 and correct title', async ({ request }) => {
    const response = await request.get('/api/plays/hamlet-a-horatio-story');
    expect(response.status()).toBe(200);
    const play = await response.json();
    expect(play.title).toBe('Hamlet: A Horatio Story');
  });

  test('GET /api/productions returns 200 and an array', async ({ request }) => {
    const response = await request.get('/api/productions');
    expect(response.status()).toBe(200);
    const productions = await response.json();
    expect(Array.isArray(productions)).toBe(true);
    expect(productions.length).toBeGreaterThan(0);
  });

  test('POST /api/plays without auth returns 401', async ({ request }) => {
    const response = await request.post('/api/plays', {
      data: { title: 'Test', slug: 'test' },
    });
    expect(response.status()).toBe(401);
  });

  test('POST /api/plays with wrong credentials returns 401', async ({ request }) => {
    const wrongHeader = 'Basic ' + Buffer.from('wrong:credentials').toString('base64');
    const response = await request.post('/api/plays', {
      headers: { Authorization: wrongHeader },
      data: { title: 'Test', slug: 'test' },
    });
    expect(response.status()).toBe(401);
  });

  test('GET /admin without credentials returns 401', async ({ request }) => {
    const response = await request.get('/admin', {
      headers: { Accept: 'text/html' },
    });
    expect(response.status()).toBe(401);
  });
});
