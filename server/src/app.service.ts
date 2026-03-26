import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { status: string; timestamp: string } {
    return { status: 'running', timestamp: new Date().toISOString() };
  }
}
