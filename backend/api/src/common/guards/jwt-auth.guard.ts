import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../auth/users.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly config: ConfigService, private readonly users: UsersService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const header = String(req.headers.authorization ?? '');
    const match = /^Bearer\s+([^\s]+)$/i.exec(header);
    if (!match) throw new UnauthorizedException('AUTH_REQUIRED');

    let payload: { sub?: string; email?: string };
    try {
      payload = await this.jwt.verifyAsync<{ sub?: string; email?: string }>(match[1], {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        algorithms: ['HS256'], // pin the algorithm; never accept "none" or key-confusion variants
      });
    } catch {
      throw new UnauthorizedException('INVALID_OR_EXPIRED_TOKEN');
    }
    if (!payload?.sub || typeof payload.sub !== 'string') throw new UnauthorizedException('INVALID_OR_EXPIRED_TOKEN');

    // Database errors here must surface as 5xx (outage), not be disguised as an auth failure.
    const user = await this.users.findActiveById(payload.sub);
    if (!user) throw new UnauthorizedException('INVALID_OR_EXPIRED_TOKEN');
    req.user = { id: user.id, email: user.email };
    return true;
  }
}
