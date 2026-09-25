import { Get, Body, Post, Query, Param, Controller } from '@nestjs/common';

import { CreateOrderDto } from '@/validation';
import { OrdersService } from '@/modules/orders/orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@Body() body: CreateOrderDto) {
    return this.orders.create(body);
  }

  @Get()
  findAll(@Query('customerId') customerId?: string) {
    return customerId
      ? this.orders.findByCustomerId(customerId)
      : this.orders.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orders.findById(id);
  }
}
