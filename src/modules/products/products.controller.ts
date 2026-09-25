import {
  Get,
  Body,
  Post,
  Patch,
  Query,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Controller
} from '@nestjs/common';

import { ProductsService } from '@/modules/products/products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  SearchProductsDto
} from '@/validation';

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Post()
  create(@Body() body: CreateProductDto) {
    return this.products.create(body);
  }

  @Get()
  findAll(@Query() query: SearchProductsDto) {
    const hasFilters = query.q || query.category || query.maxPrice;

    return hasFilters ? this.products.search(query) : this.products.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.products.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.products.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.products.remove(id);

    return { message: 'Product deleted.' };
  }
}
