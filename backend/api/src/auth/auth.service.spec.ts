import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

describe('AuthService.login', () => {
  const jwt = { signAsync: jest.fn().mockResolvedValue('token') } as any;
  it('runs a password comparison even for unknown accounts and returns the same error', async () => {
    const spy = jest.spyOn(bcrypt, 'compare');
    const users = { findByEmailWithPassword: jest.fn().mockResolvedValue(null) } as any;
    await expect(new AuthService(users, jwt).login({ email: 'nobody@example.com', password: 'whatever-password' })).rejects.toBeInstanceOf(UnauthorizedException);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
  it('rejects suspended accounts even with the right password', async () => {
    const passwordHash = bcrypt.hashSync('correct-horse-battery', 4);
    const users = { findByEmailWithPassword: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.co', passwordHash, status: 'suspended' }) } as any;
    await expect(new AuthService(users, jwt).login({ email: 'a@b.co', password: 'correct-horse-battery' })).rejects.toThrow('INVALID_CREDENTIALS');
  });
  it('issues a token for an active account', async () => {
    const passwordHash = bcrypt.hashSync('correct-horse-battery', 4);
    const users = { findByEmailWithPassword: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.co', passwordHash, status: 'active' }) } as any;
    const out = await new AuthService(users, jwt).login({ email: 'a@b.co', password: 'correct-horse-battery' });
    expect(out).toMatchObject({ accessToken: 'token', tokenType: 'Bearer', user: { id: 'u1' } });
  });
});
