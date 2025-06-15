import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { CreateStaffDto, UpdateStaffDto } from './dto/create-staff.dto';
import { StaffService } from './staff.service';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  create(@Body() dto: CreateStaffDto) {
    console.log(dto);
    return this.staffService.create(dto);
  }

  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '10', @Query('search') search = '') {
    return this.staffService.findAll(+page, +limit, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStaffDto) {
    return this.staffService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}