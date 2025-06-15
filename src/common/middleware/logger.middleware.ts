import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body, query, params } = req;

    const logLines = [
      `📥 ${method} ${originalUrl}`,
      Object.keys(params).length ? `🔧 Params: ${JSON.stringify(params)}` : '',
      Object.keys(query).length ? `🔍 Query: ${JSON.stringify(query)}` : '',
      body && Object.keys(body).length ? `📝 Body: ${JSON.stringify(body)}` : ''
    ].filter(Boolean).join('\n');

    this.logger.log(`\n${logLines}\n`);
    next();
  }
}
