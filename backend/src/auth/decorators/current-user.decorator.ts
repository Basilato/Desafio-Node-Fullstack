import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtUserPayload {
  sub: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'ATTENDANT';
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtUserPayload | undefined => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as JwtUserPayload | undefined;
  },
);
