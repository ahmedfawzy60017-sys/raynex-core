import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from './users.service';

const BCRYPT_COST = 12;
// Pre-computed hash compared when the account does not exist, so response time does not reveal which emails are registered.
const DUMMY_HASH = bcrypt.hashSync('raynex-timing-equalizer', BCRYPT_COST);

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersService, private readonly jwt: JwtService) {}
  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST);
    const user = await this.users.create(dto.email, passwordHash, dto.displayName);
    return this.issue(user.id, user.email);
  }
  async login(dto: LoginDto) {
    const user = await this.users.findByEmailWithPassword(dto.email);
    const valid = await bcrypt.compare(dto.password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid || user.status !== 'active') throw new UnauthorizedException('INVALID_CREDENTIALS');
    return this.issue(user.id, user.email);
  }
  private async issue(id: string, email: string) {
    const accessToken = await this.jwt.signAsync({ sub: id, email });
    return { accessToken, tokenType: 'Bearer', expiresIn: '15m', user: { id, email } };
  }
}
