import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}
  async create(email: string, passwordHash: string, displayName?: string): Promise<User> {
    const normalized = email.trim().toLowerCase();
    const existing = await this.repo.findOne({ select: { id: true }, where: { email: normalized } });
    if (existing) throw new ConflictException('EMAIL_ALREADY_REGISTERED');
    try { return await this.repo.save(this.repo.create({ email: normalized, passwordHash, displayName: displayName?.trim() || null })); }
    catch (e: any) { if (e?.code === '23505') throw new ConflictException('EMAIL_ALREADY_REGISTERED'); throw e; }
  }
  findByEmailWithPassword(email: string) { return this.repo.createQueryBuilder('u').addSelect('u.passwordHash').where('lower(u.email) = lower(:email)', { email: email.trim() }).getOne(); }
  findActiveById(id: string) { return this.repo.findOne({ where: { id, status: 'active' } }); }
}
