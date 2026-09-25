import { Module } from '@nestjs/common';

import { ProductsModule } from '@/modules/products/products.module';
import { AssistantService } from '@/modules/assistant/assistant.service';
import { AssistantController } from '@/modules/assistant/assistant.controller';

@Module({
  imports: [ProductsModule],
  controllers: [AssistantController],
  providers: [AssistantService]
})
export class AssistantModule {}
