import { Controller, Post, Body, Get, UseGuards, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {}

  private getCookieDomain(origin: string | undefined): string | undefined {
    if (!origin || process.env.NODE_ENV !== 'production') {
      return undefined;
    }
    try {
      // Extract domain from origin URL
      const url = new URL(origin);
      // Get the main domain without subdomain
      const parts = url.hostname.split('.');
      if (parts.length > 2) {
        return parts.slice(-2).join('.');
      }
      return url.hostname;
    } catch {
      return undefined;
    }
  }

  @Post('google')
  async googleLogin(
    @Body() googleAuthDto: GoogleAuthDto,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const result = await this.authService.googleLogin(googleAuthDto);
    
    // Get allowed domains for cookie settings
    const allowedOrigins = (this.configService.get<string>('FRONTEND_URLS') || '')
      .split(',')
      .map(origin => origin.trim())
      .filter(origin => origin); // Remove empty strings

    // Get origin from request headers
    const origin = request.headers.origin;
    
    // Verify if origin is allowed
    if (process.env.NODE_ENV === 'production' && origin && !allowedOrigins.includes(origin)) {
      throw new UnauthorizedException('Origin not allowed');
    }

    const token = result.access_token;
    // Set cookie with appropriate domain based on origin
    response.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,  // Required for HTTPS
      sameSite: 'none',  // Required for cross-origin
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return {
      user: result.user
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const origin = request.headers.origin;
    
    console.log('🔓 Clearing cookie for origin:', origin);
    console.log('🔑 Cookie domain:', this.getCookieDomain(origin));

    response.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      domain: this.getCookieDomain(origin)
    });
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return req.user;
  }
} 