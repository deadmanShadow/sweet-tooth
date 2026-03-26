import { Body, Controller, Post } from '@nestjs/common';
import { CreateEchoDto } from './dto/create-echo.dto';

@Controller('echo')
export class EchoController {
  @Post()
  echo(@Body() body: CreateEchoDto) {
    return {
      message: body.message,
      receivedAt: new Date().toISOString(),
    };
  }
}

