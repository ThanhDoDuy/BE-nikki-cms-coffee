import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('📍 Request:', {
      path: req.path,
      method: req.method,
      origin: req.headers.origin,
      host: req.headers.host,
    });
    console.log('🔑 Headers:', {
      authorization: req.headers.authorization,
      cookie: req.headers.cookie,
    });
    console.log('🍪 Parsed Cookies:', req.cookies);
    next();
  }
}
