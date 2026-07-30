import { Injectable, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Permite acesso SEM token, mas se o token for enviado e for válido,
 * popula o request.user (para auditoria / ownership).
 * Usado inicialmente enquanto não temos tela de login no FE.
 */
@Injectable()
export class JwtAuthGuardOptional extends JwtAuthGuard {
  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser | undefined,
    _info: unknown,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser | undefined {
    if (err || !user) return undefined;
    return user;
  }
}
