import { Module, forwardRef } from '@nestjs/common';
import { VenuesService } from './venues.service';
import { VenuesController } from './venues.controller';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [VenuesController],
  providers: [VenuesService],
  exports: [VenuesService],
})
export class VenuesModule {}
