import { Module } from '@nestjs/common';

import { ProductsService } from '@/modules/products/products.service';
import { ProductsController } from '@/modules/products/products.controller';
import { ProductsImportService } from '@/modules/products/products-import.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductsImportService],
  exports: [ProductsService]
})
export class ProductsModule {}
