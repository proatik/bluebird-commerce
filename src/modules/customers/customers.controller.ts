import { Get, Body, Post, Param, Controller } from '@nestjs/common';

import { CreateCustomerDto } from '@/validation';
import { CustomersService } from '@/modules/customers/customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Post()
  create(@Body() body: CreateCustomerDto) {
    return this.customers.create(body);
  }

  @Get()
  findAll() {
    return this.customers.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customers.findById(id);
  }
}
