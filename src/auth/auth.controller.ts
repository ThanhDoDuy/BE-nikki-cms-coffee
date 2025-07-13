import { Controller, Post, Body, Get, UseGuards, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('google')
  async googleLogin(
    @Body() googleAuthDto: GoogleAuthDto,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const result = await this.authService.googleLogin(googleAuthDto);
    
    // Get allowed origins from environment variable
    const allowedOrigins = (this.configService.get<string>('FRONTEND_URLS') || '')
      .split(',')
      .map(origin => origin.trim())
      .filter(origin => origin);

    // Get origin from request headers
    const origin = request.headers.origin;
    
    console.log('🌐 Request origin:', origin);
    console.log('🌐 Allowed origins:', allowedOrigins);
    
    // Verify if origin is allowed
    if (process.env.NODE_ENV === 'production' && origin && !allowedOrigins.includes(origin)) {
      console.log('❌ Origin not allowed:', origin);
      throw new UnauthorizedException('Origin not allowed');
    }

    const token = result.access_token;
    
    // Set cookie with debug logging
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    };

    console.log('🍪 Setting cookie with options:', cookieOptions);
    
    response.cookie('auth_token', token, cookieOptions);
    console.log('✅ Cookie set for token:', token.substring(0, 20) + '...');

    return {
      user: result.user,
      message: 'Login successful'
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    console.log('🔓 Logout request from origin:', request.headers.origin);

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    };

    console.log('🍪 Clearing cookie with options:', cookieOptions);
    
    response.clearCookie('auth_token', cookieOptions);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return req.user;
  }
} 