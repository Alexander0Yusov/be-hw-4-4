import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserInputDto } from '../dto/user/user-input.dto';
import { UsersService } from '../application/users.service';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { Nullable, UserContextDto } from '../guards/dto/user-context.dto';
import { AuthService } from '../application/auth.service';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { MeViewDto } from '../dto/user/user-view.dto';
import { AuthQueryRepository } from '../infrastructure/query/auth-query.repository';
import { JwtOptionalAuthGuard } from '../guards/bearer/jwt-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from '../guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { UpdateUserDto } from '../dto/user/create-user-domain.dto';
import { PasswordRecoveryDto } from '../dto/user/password-recovery.dto';
import { ConfirmationCodeDto } from '../dto/user/confirmation-code.dto';
import { RateLimitGuard } from '../guards/limit/rate-limit.guard';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private authQueryRepository: AuthQueryRepository,
  ) {}

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: UserInputDto): Promise<void> {
    return await this.usersService.registerUser(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @ExtractUserFromRequest() user: UserContextDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this.authService.login(user.id);

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // true в проде, false в dev при http (+/-)
    });

    return { accessToken };
  }

  @ApiBearerAuth()
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return await this.authQueryRepository.me(user.id);
  }

  @ApiBearerAuth()
  @Get('me-or-default')
  @UseGuards(JwtOptionalAuthGuard)
  async meOrDefault(
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<Nullable<MeViewDto>> {
    if (user) {
      return await this.authQueryRepository.me(user.id!);
    } else {
      return {
        login: 'anonymous',
        userId: null,
        email: null,
      };
    }
  }

  @UseGuards(RateLimitGuard)
  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() body: UpdateUserDto) {
    return await this.authService.sendRecoveryPasswordCode(body.email);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: PasswordRecoveryDto) {
    return await this.authService.newPasswordApplying(
      body.newPassword,
      body.recoveryCode,
    );
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() body: ConfirmationCodeDto) {
    return await this.authService.confirmEmail(body.code);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() body: UpdateUserDto) {
    return await this.authService.resendEmailConfirmationCode(body.email);
  }
}
