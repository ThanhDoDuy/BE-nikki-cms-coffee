import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('🍪 Cookies:', req.cookies);
    console.log('🔑 Auth Cookie:', req.cookies?.auth_token);
    console.log('📍 Request Path:', req.path);
    next();
  }
}
