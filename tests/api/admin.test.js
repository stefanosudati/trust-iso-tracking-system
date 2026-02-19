import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { createApp } = require('../helpers/create-app');
const db = require('../../server/db');

const app = createApp();

const VALID_PASSWORD = 'StrongP@ss1';
const ANOTHER_VALID_PASSWORD = 'NewStr0ng!Pass';

/** Helper: register the first user (admin, auto-approved) and return { token, user } */
async function registerAdmin() {
  const res = await request(app).post('/api/auth/register').send({
    email: 'admin@example.com',
    password: VALID_PASSWORD,
    name: 'Admin User',
  });
  return res.body;
}

/** Helper: register a second user (non-admin) and return { token, user } */
async function registerRegularUser() {
  const res = await request(app).post('/api/auth/register').send({
    email: 'regular@example.com',
    password: VALID_PASSWORD,
    name: 'Regular User',
  });
  return res.body;
}

beforeEach(() => {
  db.exec('DELETE FROM changelog');
  db.exec('DELETE FROM projects');
  db.exec('DELETE FROM users');
});

// ---------------------------------------------------------------------------
// POST /api/admin/users — Admin creates a new user
// ---------------------------------------------------------------------------
describe('POST /api/admin/users', () => {
  it('admin creates a user — returns 201 with user and generatedPassword', async () => {
    const { token } = await registerAdmin();

    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Mario Rossi', email: 'mario@example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('generatedPassword');
    expect(res.body.user).toMatchObject({
      email: 'mario@example.com',
      name: 'Mario Rossi',
      role: 'user',
      isApproved: true,
    });
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).toHaveProperty('createdAt');
  });

  it('generated password meets validation rules (8+ chars, uppercase, number, symbol)', async () => {
    const { token } = await registerAdmin();

    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Pw', email: 'testpw@example.com' });

    expect(res.status).toBe(201);
    const pw = res.body.generatedPassword;
    expect(pw.length).toBeGreaterThanOrEqual(8);
    expect(/[A-Z]/.test(pw)).toBe(true);
    expect(/[0-9]/.test(pw)).toBe(true);
    expect(/[^A-Za-z0-9]/.test(pw)).toBe(true);
  });

  it('created user can login with generated password and has passwordChangeRequired=true', async () => {
    const { token } = await registerAdmin();

    const createRes = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Login Test', email: 'logintest@example.com' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'logintest@example.com', password: createRes.body.generatedPassword });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.user.passwordChangeRequired).toBe(true);
  });

  it('created user can change password without providing old password', async () => {
    const { token: adminToken } = await registerAdmin();

    const createRes = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Change Pw', email: 'changepw@example.com' });

    // Login as the new user
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'changepw@example.com', password: createRes.body.generatedPassword });

    const userToken = loginRes.body.token;

    // Change password without oldPassword (allowed because password_change_required=1)
    const pwRes = await request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ newPassword: ANOTHER_VALID_PASSWORD });

    expect(pwRes.status).toBe(200);

    // Verify password_change_required flag was cleared
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);
    expect(meRes.body.user.passwordChangeRequired).toBe(false);

    // Verify login with new password works
    const newLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'changepw@example.com', password: ANOTHER_VALID_PASSWORD });
    expect(newLoginRes.status).toBe(200);
  });

  it('returns 409 for duplicate email', async () => {
    const { token } = await registerAdmin();

    await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'First', email: 'dup@example.com' });

    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Second', email: 'dup@example.com' });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when name is missing', async () => {
    const { token } = await registerAdmin();

    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'noname@example.com' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for invalid email', async () => {
    const { token } = await registerAdmin();

    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bad Email', email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 403 for non-admin user', async () => {
    // Create admin first, then a regular user
    await registerAdmin();
    const { token: regularToken } = await registerRegularUser();

    // Approve the regular user so they can login
    db.prepare('UPDATE users SET is_approved = 1 WHERE email = ?').run('regular@example.com');

    // Login again to get a fresh token (approval was done after registration)
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'regular@example.com', password: VALID_PASSWORD });

    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${loginRes.body.token}`)
      .send({ name: 'Should Fail', email: 'fail@example.com' });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .send({ name: 'No Auth', email: 'noauth@example.com' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
