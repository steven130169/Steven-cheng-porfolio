import { users } from './schema';
import { getTableConfig } from 'drizzle-orm/pg-core';
import { describe, it, expect } from 'vitest';

describe('Database Schema', () => {
  it('should define users table', () => {
    const config = getTableConfig(users);
    expect(config.name).toBe('users');
  });
});
