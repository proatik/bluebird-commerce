import { Module } from '@nestjs/common';

import { OrdersModule } from '@/modules/orders/orders.module';
import { ProductsModule } from '@/modules/products/products.module';
import { AssistantService } from '@/modules/assistant/assistant.service';
import { AssistantController } from '@/modules/assistant/assistant.controller';

@Module({
  imports: [ProductsModule, OrdersModule],
  controllers: [AssistantController],
  providers: [AssistantService]
})
export class AssistantModule {}
