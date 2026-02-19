// Common test setup
// Sets JWT_SECRET for tests if not already set
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-vitest';
process.env.DB_PATH = ':memory:';
