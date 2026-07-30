import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtAuthGuardOptional } from './guards/jwt-auth-optional.guard';
import { CurrentUser, type JwtUserPayload } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login (demo: admin@localis.com.br / admin123 — seed executado)',
  })
  @ApiBody({ type: LoginDto })
  @ApiCreatedResponse({ description: 'Token e payload do usuário' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Usuário autenticado' })
  @ApiOperation({ summary: 'Dados do usuário autenticado' })
  me(@CurrentUser() user: JwtUserPayload) {
    return this.auth.me(user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuardOptional)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Perfil p/ Dashboard (autenticado ou fallback Admin)' })
  @ApiOperation({
    summary: 'Perfil público para o Dashboard (com JWT usa a sessão, senão usa Admin do seed)',
  })
  profile(@CurrentUser() user?: JwtUserPayload) {
    return this.auth.profile(user);
  }
}
