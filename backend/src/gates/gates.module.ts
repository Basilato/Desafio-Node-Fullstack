import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { GatesService } from './gates.service';
import { GatesController } from './gates.controller';

@Module({
  imports: [PrismaModule],
  providers: [GatesService],
  controllers: [GatesController],
  exports: [GatesService],
})
export class GatesModule {}
