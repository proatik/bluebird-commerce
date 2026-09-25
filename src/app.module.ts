import { Module } from '@nestjs/common';

import { HealthModule } from '@/health/health.module';
import { OrdersModule } from '@/modules/orders/orders.module';
import { AppConfigModule } from '@/modules/config/config.module';
import { DatabaseModule } from '@/modules/database/database.module';
import { ProductsModule } from '@/modules/products/products.module';
import { CustomersModule } from '@/modules/customers/customers.module';

@Module({
  imports: [
    OrdersModule,
    HealthModule,
    DatabaseModule,
    ProductsModule,
    AppConfigModule,
    CustomersModule
  ]
})
export class AppModule {}
