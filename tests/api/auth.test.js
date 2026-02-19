import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { createApp } = require('../helpers/create-app');
const db = require('../../server/db');

const app = createApp();

// Strong password that passes validation (8+ chars, 1 uppercase, 1 number, 1 symbol)
const VALID_PASSWORD = 'StrongP@ss1';
const ANOTHER_VALID_PASSWORD = 'NewStr0ng!Pass';

/** Helper: register a user and return the response body */
async function registerUser(overrides = {}) {
  const defaults = {
    email: 'test@example.com',
    password: VALID_PASSWORD,
    name: 'Test User',
  };
  const payload = { ...defaults, ...overrides };
  const res = await request(app).post('/api/auth/register').send(payload);
  return res;
}

/** Helper: register the first (admin) user and return the token */
async function registerAdmin() {
  const res = await registerUser({
    email: 'admin@example.com',
    name: 'Admin User',
  });
  return res.body;
}

beforeEach(() => {
  db.exec('DELETE FROM projects');
  db.exec('DELETE FROM users');
});

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
describe('POST /api/auth/register', () => {
  it('registers the first user as admin with isApproved=true', async () => {
    const res = await registerUser({ email: 'first@example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({
      email: 'first@example.com',
      name: 'Test User',
      role: 'admin',
      isApproved: true,
    });
    expect(res.body.pendingApproval).toBe(false);
  });

  it('registers the second user as user with pendingApproval=true', async () => {
    // First user (admin)
    await registerUser({ email: 'admin@example.com' });

    // Second user
    const res = await registerUser({ email: 'second@example.com', name: 'Second User' });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      email: 'second@example.com',
      name: 'Second User',
      role: 'user',
      isApproved: false,
    });
    expect(res.body.pendingApproval).toBe(true);
  });

  it('returns 400 when required fields are missing', async () => {
    // Missing email
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ password: VALID_PASSWORD, name: 'No Email' });
    expect(res1.status).toBe(400);
    expect(res1.body).toHaveProperty('error');

    // Missing password
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({ email: 'x@y.com', name: 'No Pass' });
    expect(res2.status).toBe(400);
    expect(res2.body).toHaveProperty('error');

    // Missing name
    const res3 = await request(app)
      .post('/api/auth/register')
      .send({ email: 'x@y.com', password: VALID_PASSWORD });
    expect(res3.status).toBe(400);
    expect(res3.body).toHaveProperty('error');

    // Empty body
    const res4 = await request(app).post('/api/auth/register').send({});
    expect(res4.status).toBe(400);
    expect(res4.body).toHaveProperty('error');
  });

  it('returns 400 for a weak password (too short)', async () => {
    const res = await registerUser({ password: 'Ab1!' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/8/); // mentions 8 chars
  });

  it('returns 400 for a password without uppercase letter', async () => {
    const res = await registerUser({ password: 'lowercase1!' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for a password without a number', async () => {
    const res = await registerUser({ password: 'NoNumber!!' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for a password without a symbol', async () => {
    const res = await registerUser({ password: 'NoSymbol1A' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for an invalid email format', async () => {
    const res = await registerUser({ email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 409 when registering a duplicate email', async () => {
    await registerUser({ email: 'dup@example.com' });

    const res = await registerUser({ email: 'dup@example.com', name: 'Another' });
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  it('normalizes email to lowercase and trims whitespace', async () => {
    const res = await registerUser({ email: '  Admin@Example.COM  ' });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('admin@example.com');
  });

  it('trims whitespace from name', async () => {
    const res = await registerUser({ email: 'trimname@example.com', name: '  Spacy Name  ' });
    expect(res.status).toBe(201);
    expect(res.body.user.name).toBe('Spacy Name');
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
describe('POST /api/auth/login', () => {
  it('logs in with valid credentials and returns token + user', async () => {
    await registerUser({ email: 'login@example.com' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: VALID_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({
      email: 'login@example.com',
      role: 'admin',
      isApproved: true,
    });
  });

  it('returns 401 for incorrect password', async () => {
    await registerUser({ email: 'wrongpw@example.com' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrongpw@example.com', password: 'WrongP@ss1' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@example.com', password: VALID_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when email or password is missing', async () => {
    const res1 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'x@y.com' });
    expect(res1.status).toBe(400);

    const res2 = await request(app)
      .post('/api/auth/login')
      .send({ password: VALID_PASSWORD });
    expect(res2.status).toBe(400);
  });

  it('returns 403 for an unapproved user', async () => {
    // First user = admin (auto-approved)
    await registerUser({ email: 'admin@example.com' });

    // Second user = not approved
    await registerUser({ email: 'pending@example.com', name: 'Pending' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'pending@example.com', password: VALID_PASSWORD });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('login is case-insensitive for email', async () => {
    await registerUser({ email: 'case@example.com' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'CASE@EXAMPLE.COM', password: VALID_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------
describe('GET /api/auth/me', () => {
  it('returns the current user when a valid token is provided', async () => {
    const { token, user } = (await registerUser({ email: 'me@example.com' })).body;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      id: user.id,
      email: 'me@example.com',
      name: 'Test User',
      role: 'admin',
      isApproved: true,
    });
    expect(res.body.user).toHaveProperty('createdAt');
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 403 when an invalid token is provided', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });
});

// ---------------------------------------------------------------------------
// PUT /api/auth/theme
// ---------------------------------------------------------------------------
describe('PUT /api/auth/theme', () => {
  it('updates the theme with a valid value', async () => {
    const { token } = (await registerUser({ email: 'theme@example.com' })).body;

    const res = await request(app)
      .put('/api/auth/theme')
      .set('Authorization', `Bearer ${token}`)
      .send({ theme: 'ocean' });

    expect(res.status).toBe(200);
    expect(res.body.theme).toBe('ocean');

    // Verify via /me
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(meRes.body.user.theme).toBe('ocean');
  });

  it('returns 400 for an invalid theme', async () => {
    const { token } = (await registerUser({ email: 'theme2@example.com' })).body;

    const res = await request(app)
      .put('/api/auth/theme')
      .set('Authorization', `Bearer ${token}`)
      .send({ theme: 'nonexistent-theme' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when no theme is sent', async () => {
    const { token } = (await registerUser({ email: 'theme3@example.com' })).body;

    const res = await request(app)
      .put('/api/auth/theme')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app)
      .put('/api/auth/theme')
      .send({ theme: 'default' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

// ---------------------------------------------------------------------------
// PUT /api/auth/password
// ---------------------------------------------------------------------------
describe('PUT /api/auth/password', () => {
  it('changes the password when the correct old password is provided', async () => {
    const { token } = (await registerUser({ email: 'pw@example.com' })).body;

    const res = await request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ oldPassword: VALID_PASSWORD, newPassword: ANOTHER_VALID_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');

    // Verify login with the new password works
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'pw@example.com', password: ANOTHER_VALID_PASSWORD });
    expect(loginRes.status).toBe(200);

    // Old password should no longer work
    const oldLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'pw@example.com', password: VALID_PASSWORD });
    expect(oldLoginRes.status).toBe(401);
  });

  it('returns 401 when the old password is wrong', async () => {
    const { token } = (await registerUser({ email: 'pw2@example.com' })).body;

    const res = await request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ oldPassword: 'WrongOld@1', newPassword: ANOTHER_VALID_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when the new password is too weak', async () => {
    const { token } = (await registerUser({ email: 'pw3@example.com' })).body;

    const res = await request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ oldPassword: VALID_PASSWORD, newPassword: 'weak' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when oldPassword is missing (and password_change_required is false)', async () => {
    const { token } = (await registerUser({ email: 'pw4@example.com' })).body;

    const res = await request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ newPassword: ANOTHER_VALID_PASSWORD });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app)
      .put('/api/auth/password')
      .send({ oldPassword: VALID_PASSWORD, newPassword: ANOTHER_VALID_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('allows password change without oldPassword when password_change_required is set', async () => {
    const { token, user } = (await registerUser({ email: 'forced@example.com' })).body;

    // Manually set password_change_required flag in the database
    db.prepare('UPDATE users SET password_change_required = 1 WHERE id = ?').run(user.id);

    const res = await request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ newPassword: ANOTHER_VALID_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');

    // Verify the flag was cleared
    const row = db.prepare('SELECT password_change_required FROM users WHERE id = ?').get(user.id);
    expect(row.password_change_required).toBe(0);
  });
});
