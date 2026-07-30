import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import type { JwtUserPayload } from './decorators/current-user.decorator';

export type { JwtUserPayload };

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login({ email, password }: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload: JwtUserPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN', '12h');
    const token = this.jwt.sign(payload, { expiresIn });

    this.logger.log(`Login bem-sucedido: ${user.email} (${user.role})`);
    return {
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  /** Retorna o usuário atual pelo payload (rota /me) */
  async me(payload: JwtUserPayload) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }

  /**
   * Perfil usado pelo Dashboard.
   * Se houver JWT válido retorna o usuário autenticado;
   * senão retorna o primeiro usuário ADMIN cadastrado (fallback p/ demo enquanto
   * não temos tela de login pronta no front).
   */
  async profile(payload?: JwtUserPayload) {
    if (payload?.sub) {
      const authenticated = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
        },
      });
      if (authenticated) return authenticated;
    }
    const fallback = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    if (!fallback) {
      throw new UnauthorizedException('Nenhum usuário encontrado. Rode o seed.');
    }
    return fallback;
  }
}
