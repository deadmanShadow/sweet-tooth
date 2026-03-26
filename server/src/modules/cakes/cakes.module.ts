import { Module } from '@nestjs/common';
import { CakesController } from './cakes.controller';
import { CakesService } from './cakes.service';

@Module({
  controllers: [CakesController],
  providers: [CakesService],
})
export class CakesModule {}

