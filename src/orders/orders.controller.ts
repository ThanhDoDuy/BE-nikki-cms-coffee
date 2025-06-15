import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
    @Query('status') status: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('staffId') staffId: string,
  ) {
    return this.ordersService.findAll(+page, +limit, search, status, startDate, endDate, staffId);
  }

  @Get('stats')
  getStats(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.ordersService.getStats(startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateOrderDto) {
    return this.ordersService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: CreateOrderDto) {
    return this.ordersService.update(id, body);
  }
}